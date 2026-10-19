// Simulator: builds the timeline of shots and damage instances in a damage phase (ADR 0001).
//
// Timing model (matches Time to Empty in Quantum Damage-ics, see docs/data-sources.md):
// - The damage phase starts at 0 ms with the first charge; the first shot follows after the charge time.
// - Shots within a magazine are one shot interval (60000 / fireRateRpm) apart.
// - After the last shot of a magazine, the reload time adds to the shot interval.
// - The weapon fires at most totalShots shots.
// - A shot or damage instance counts if it happens at or before the end of the damage phase.
//
// Effects (ADR 0006, stage B): each selected effect is active in its window (start and duration,
// see effectWindows.ts); the parts are evaluated at the time of each shot, reload and damage instance.
// Timing parts change the shot plan, e.g. noReload skips the reloads that start inside the window.
// Per bucket the stacking rule combines the multipliers; buckets multiply with each other.
//
// Intrinsic parts of the weapon add stacks to counters after each shot (e.g. scorch). At a threshold
// a damage instance follows (e.g. ignition), the counter resets, and a cooldown blocks new stacks.
// Damage over time parts release sources after each shot (e.g. Taken Seekers with the catalyst):
// one impact, then ticks; a target holds only a limited number of active sources.
//
// Abilities (ADR 0009): each cast creates the damage instances of every ability component at the
// cast time plus its delay and ticks. They carry the ability's kind as damage source, so only
// multiplier parts for that source apply.

import type {
  Ability,
  Bucket,
  CounterId,
  DamageOverTimePart,
  DamageSource,
  Effect,
  Element,
  Weapon,
} from "../data/schema";
import {
  activeParts,
  appliesToWeaponType,
  combinedMultiplier,
  type ActiveParts,
} from "./effectParts";
import { resolveWindows, type EffectWindowOptions } from "./effectWindows";
import { requireValue } from "./requireValue";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
// Guards rounding up against floating point noise, e.g. 10 x 1.5 = 15.000000000000002.
const ROUNDING_TOLERANCE = 1e-9;

export type Shot = {
  timeMs: number;
};

export type TimedDamageInstance = {
  id: string; // DamageInstance id from the weapon, or "<ability id>.<component id>"
  timeMs: number;
  damage: number;
  damageSource: DamageSource;
  element: Element;
  abilityId?: string; // set for damage instances of an ability
};

/** An ability of the build and the times of its casts in the damage phase. */
export type AbilityCast = {
  ability: Ability;
  castsMs: number[];
};

export type SimulationOptions = EffectWindowOptions & {
  catalyst?: boolean; // default: without catalyst
  abilities?: AbilityCast[]; // default: no abilities
};

export type SimulationResult = {
  shots: Shot[];
  damageInstances: TimedDamageInstance[];
  totalDamage: number;
  dps: number; // total damage per second of the damage phase; 0 for an empty damage phase
};

export function simulate(
  weapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[] = [],
  buckets: Bucket[] = [],
  options: SimulationOptions = {},
): SimulationResult {
  const catalyst = options.catalyst ?? false;
  const chargeTimeMs = requireValue(weapon.chargeTimeMs, "chargeTimeMs");
  const fireRateRpm = requireValue(weapon.fireRateRpm, "fireRateRpm");
  const magazine = requireValue(weapon.magazine, "magazine");
  const totalShots = requireValue(weapon.totalShots, "totalShots");
  const reloadTimeMs = requireValue(weapon.reloadTimeMs, "reloadTimeMs");

  if (fireRateRpm <= 0) {
    throw new Error(`fireRateRpm must be positive, got ${fireRateRpm}`);
  }
  if (!Number.isInteger(magazine) || magazine < 1) {
    throw new Error(`magazine must be a positive integer, got ${magazine}`);
  }
  if (!Number.isInteger(totalShots) || totalShots < 0) {
    throw new Error(
      `totalShots must be a non-negative integer, got ${totalShots}`,
    );
  }

  // Validates the buckets of all parts once, even of effects outside their window.
  activeParts(effects, buckets);
  const windows = resolveWindows(effects, options);
  const partsCache = new Map<string, ActiveParts>();
  const partsAt = (timeMs: number): ActiveParts => {
    const active = effects.filter((effect) => {
      const window = windows.get(effect.id)!;
      return window.startMs <= timeMs && timeMs < window.endMs;
    });
    const key = active.map((effect) => effect.id).join("|");
    let parts = partsCache.get(key);
    if (!parts) {
      parts = activeParts(active, buckets);
      partsCache.set(key, parts);
    }
    return parts;
  };
  const noReloadAt = (timeMs: number) =>
    partsAt(timeMs).timingParts.some(
      (part) =>
        part.change === "noReload" &&
        appliesToWeaponType(part.weaponTypes, weapon.weaponType),
    );
  const shotIntervalMs = MS_PER_MINUTE / fireRateRpm;
  const damagePhaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const isInPhase = (timeMs: number) => timeMs <= damagePhaseMs;

  // A reload starts with the last shot of a magazine; a noReload part active then skips it.
  const shots: Shot[] = [];
  let shotMs = chargeTimeMs;
  for (let i = 0; i < totalShots; i++) {
    if (i > 0) {
      const previousMs = shotMs;
      shotMs += shotIntervalMs;
      if (i % magazine === 0 && !noReloadAt(previousMs)) shotMs += reloadTimeMs;
    }
    if (!isInPhase(shotMs)) break;
    shots.push({ timeMs: shotMs });
  }

  const instances = weapon.damageInstances
    .filter((instance) => catalyst || !instance.requiresCatalyst)
    .map((instance) => ({
      id: instance.id,
      delayMs: requireValue(instance.delayMs, "delayMs"),
      damage: requireValue(instance.damagePerTick, "damagePerTick"),
      ticks: requireValue(instance.ticks, "ticks"),
      tickIntervalMs: requireValue(instance.tickIntervalMs, "tickIntervalMs"),
    }));

  const damageSource: DamageSource = "weapon";
  const multiplierAt = (timeMs: number, element: Element) =>
    combinedMultiplier(partsAt(timeMs).multiplierParts, buckets, {
      damageSource,
      element,
      weaponType: weapon.weaponType,
    });
  const counterFactorAt = (counterId: CounterId, timeMs: number) =>
    partsAt(timeMs)
      .counterModifierParts.filter((part) => part.counterId === counterId)
      .reduce(
        (product, part) => product * requireValue(part.factor, "factor"),
        1,
      );

  const damageInstances: TimedDamageInstance[] = [];
  for (const shot of shots) {
    for (const instance of instances) {
      for (let tick = 0; tick < instance.ticks; tick++) {
        const timeMs =
          shot.timeMs + instance.delayMs + tick * instance.tickIntervalMs;
        if (isInPhase(timeMs)) {
          damageInstances.push({
            id: instance.id,
            timeMs,
            damage: instance.damage * multiplierAt(timeMs, weapon.element),
            damageSource,
            element: weapon.element,
          });
        }
      }
    }
  }
  damageInstances.push(
    ...thresholdDamageInstances(
      weapon,
      shots,
      counterFactorAt,
      isInPhase,
      multiplierAt,
    ),
  );
  for (const part of weapon.intrinsicParts) {
    if (part.type !== "damageOverTime") continue;
    if (part.requiresCatalyst && !catalyst) continue;
    damageInstances.push(
      ...damageOverTimeInstances(part, shots, isInPhase, multiplierAt, weapon),
    );
  }
  for (const cast of options.abilities ?? []) {
    damageInstances.push(
      ...abilityDamageInstances(cast, isInPhase, (timeMs) =>
        combinedMultiplier(partsAt(timeMs).multiplierParts, buckets, {
          damageSource: cast.ability.kind,
          element: cast.ability.element,
        }),
      ),
    );
  }
  damageInstances.sort((a, b) => a.timeMs - b.timeMs);

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  const dps = damagePhaseSeconds > 0 ? totalDamage / damagePhaseSeconds : 0;
  return { shots, damageInstances, totalDamage, dps };
}

/** Damage instances of all components of an ability after each cast: delay, then ticks. */
function abilityDamageInstances(
  { ability, castsMs }: AbilityCast,
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number) => number,
): TimedDamageInstance[] {
  const components = ability.components.map((component) => ({
    id: `${ability.id}.${component.id}`,
    delayMs: requireValue(component.delayMs, "delayMs"),
    damage: requireValue(component.damagePerTick, "damagePerTick"),
    ticks: requireValue(component.ticks, "ticks"),
    tickIntervalMs: requireValue(component.tickIntervalMs, "tickIntervalMs"),
  }));
  const result: TimedDamageInstance[] = [];
  for (const castMs of castsMs) {
    for (const component of components) {
      for (let tick = 0; tick < component.ticks; tick++) {
        const timeMs =
          castMs + component.delayMs + tick * component.tickIntervalMs;
        if (!isInPhase(timeMs)) continue;
        result.push({
          id: component.id,
          timeMs,
          damage: component.damage * multiplierAt(timeMs),
          damageSource: ability.kind,
          element: ability.element,
          abilityId: ability.id,
        });
      }
    }
  }
  return result;
}

/** Times of the applications or releases after each shot: first delay, then a fixed interval. */
function triggerTimes(
  shots: Shot[],
  count: number,
  firstDelayMs: number,
  intervalMs: number,
): number[] {
  return shots.flatMap((shot) =>
    Array.from(
      { length: count },
      (_, i) => shot.timeMs + firstDelayMs + i * intervalMs,
    ),
  );
}

/**
 * Releases a damage over time source at each trigger time: an impact, then ticks. While the
 * target already holds the maximum number of active sources, a release is lost.
 */
function damageOverTimeInstances(
  part: DamageOverTimePart,
  shots: Shot[],
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number, element: Element) => number,
  weapon: Weapon,
): TimedDamageInstance[] {
  const count = requireValue(
    part.applicationsPerTrigger,
    "applicationsPerTrigger",
  );
  const firstDelayMs = requireValue(part.firstDelayMs, "firstDelayMs");
  const intervalMs = requireValue(part.intervalMs, "intervalMs");
  const impactDamage = requireValue(part.impactDamage, "impactDamage");
  const tickDamage = requireValue(part.tickDamage, "tickDamage");
  const ticks = requireValue(part.ticks, "ticks");
  const tickIntervalMs = requireValue(part.tickIntervalMs, "tickIntervalMs");
  const firstTickDelayMs = requireValue(
    part.firstTickDelayMs,
    "firstTickDelayMs",
  );
  const maxActive = requireValue(part.maxActivePerTarget, "maxActivePerTarget");

  const releases = triggerTimes(shots, count, firstDelayMs, intervalMs).sort(
    (a, b) => a - b,
  );
  let activeUntilMs: number[] = [];
  const result: TimedDamageInstance[] = [];
  const push = (timeMs: number, damage: number) => {
    if (!isInPhase(timeMs)) return;
    result.push({
      id: part.id,
      timeMs,
      damage: damage * multiplierAt(timeMs, weapon.element),
      damageSource: "weapon",
      element: weapon.element,
    });
  };

  for (const releaseMs of releases) {
    if (!isInPhase(releaseMs)) break;
    activeUntilMs = activeUntilMs.filter((untilMs) => untilMs >= releaseMs);
    if (activeUntilMs.length >= maxActive) continue;

    const lastTickMs =
      releaseMs + firstTickDelayMs + (ticks - 1) * tickIntervalMs;
    activeUntilMs.push(lastTickMs);
    push(releaseMs, impactDamage);
    for (let tick = 0; tick < ticks; tick++) {
      push(releaseMs + firstTickDelayMs + tick * tickIntervalMs, tickDamage);
    }
  }
  return result;
}

/**
 * Applies the counter parts of the weapon after each shot in time order and creates a damage
 * instance whenever a counter reaches its threshold. Counter modifiers active at the time of an
 * application scale its stacks, rounded up. Not modeled yet: decay of stacks over time
 * (docs/mechanics/scorch-and-ignition.md).
 */
function thresholdDamageInstances(
  weapon: Weapon,
  shots: Shot[],
  counterFactorAt: (counterId: CounterId, timeMs: number) => number,
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number, element: Element) => number,
): TimedDamageInstance[] {
  const thresholds = weapon.intrinsicParts.flatMap((part) =>
    part.type === "threshold"
      ? [
          {
            part,
            threshold: requireValue(part.threshold, "threshold"),
            cooldownMs: requireValue(part.cooldownMs, "cooldownMs"),
            damage: requireValue(part.damage, "damage"),
          },
        ]
      : [],
  );

  const applications: {
    timeMs: number;
    counterId: CounterId;
    stacks: number;
  }[] = [];
  for (const part of weapon.intrinsicParts) {
    if (part.type !== "counter") continue;
    const stacks = requireValue(part.stacks, "stacks");
    const count = requireValue(
      part.applicationsPerTrigger,
      "applicationsPerTrigger",
    );
    const firstDelayMs = requireValue(part.firstDelayMs, "firstDelayMs");
    const intervalMs = requireValue(part.intervalMs, "intervalMs");
    for (const timeMs of triggerTimes(shots, count, firstDelayMs, intervalMs)) {
      const factor = counterFactorAt(part.counterId, timeMs);
      applications.push({
        timeMs,
        counterId: part.counterId,
        stacks: Math.ceil(stacks * factor - ROUNDING_TOLERANCE),
      });
    }
  }
  applications.sort((a, b) => a.timeMs - b.timeMs);

  const state = new Map<
    CounterId,
    { stacks: number; blockedUntilMs: number }
  >();
  const result: TimedDamageInstance[] = [];
  for (const application of applications) {
    if (!isInPhase(application.timeMs)) break;
    const counter = state.get(application.counterId) ?? {
      stacks: 0,
      blockedUntilMs: -Infinity,
    };
    state.set(application.counterId, counter);
    if (application.timeMs < counter.blockedUntilMs) continue;

    counter.stacks += application.stacks;
    const reached = thresholds.find(
      (t) =>
        t.part.counterId === application.counterId &&
        counter.stacks >= t.threshold,
    );
    if (reached) {
      result.push({
        id: reached.part.damageInstanceId,
        timeMs: application.timeMs,
        damage:
          reached.damage *
          multiplierAt(application.timeMs, reached.part.element),
        damageSource: "weapon",
        element: reached.part.element,
      });
      counter.stacks = 0;
      counter.blockedUntilMs = application.timeMs + reached.cooldownMs;
    }
  }
  return result;
}
