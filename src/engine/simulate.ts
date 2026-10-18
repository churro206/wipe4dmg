// Simulator: builds the timeline of shots and damage instances in a damage phase (ADR 0001).
//
// Timing model (matches Time to Empty in Quantum Damage-ics, see docs/data-sources.md):
// - The damage phase starts at 0 ms with the first charge; the first shot follows after the charge time.
// - Shots within a magazine are one shot interval (60000 / fireRateRpm) apart.
// - After the last shot of a magazine, the reload time adds to the shot interval.
// - The weapon fires at most totalShots shots.
// - A shot or damage instance counts if it happens at or before the end of the damage phase.
//
// Effects (ADR 0006, v0.5): every selected effect is active for the whole damage phase.
// Timing parts change the shot plan, e.g. noReload removes all reloads.
// Per bucket the stacking rule combines the multipliers; buckets multiply with each other.
//
// Intrinsic parts of the weapon add stacks to counters after each shot (e.g. scorch). At a threshold
// a damage instance follows (e.g. ignition), the counter resets, and a cooldown blocks new stacks.

import type {
  Bucket,
  CounterId,
  CounterModifierPart,
  DamageSource,
  Effect,
  Element,
  Weapon,
} from "../data/schema";
import {
  activeParts,
  appliesToWeaponType,
  combinedMultiplier,
} from "./effectParts";
import { requireValue } from "./requireValue";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
// Guards rounding up against floating point noise, e.g. 10 x 1.5 = 15.000000000000002.
const ROUNDING_TOLERANCE = 1e-9;

export type Shot = {
  timeMs: number;
};

export type TimedDamageInstance = {
  id: string; // DamageInstance id from the weapon
  timeMs: number;
  damage: number;
  damageSource: DamageSource;
  element: Element;
};

export type SimulationResult = {
  shots: Shot[];
  damageInstances: TimedDamageInstance[];
  totalDamage: number;
};

export function simulate(
  weapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[] = [],
  buckets: Bucket[] = [],
): SimulationResult {
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

  const { multiplierParts, timingParts, counterModifierParts } = activeParts(
    effects,
    buckets,
  );
  const noReload = timingParts.some(
    (part) =>
      part.change === "noReload" &&
      appliesToWeaponType(part.weaponTypes, weapon.weaponType),
  );
  const shotIntervalMs = MS_PER_MINUTE / fireRateRpm;
  const damagePhaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const isInPhase = (timeMs: number) => timeMs <= damagePhaseMs;

  const shots: Shot[] = [];
  for (let i = 0; i < totalShots; i++) {
    const reloads = noReload ? 0 : Math.floor(i / magazine);
    const timeMs = chargeTimeMs + i * shotIntervalMs + reloads * reloadTimeMs;
    if (!isInPhase(timeMs)) break;
    shots.push({ timeMs });
  }

  // Catalyst is not selectable yet, so catalyst-only damage instances never happen.
  const instances = weapon.damageInstances
    .filter((instance) => !instance.requiresCatalyst)
    .map((instance) => ({
      id: instance.id,
      delayMs: requireValue(instance.delayMs, "delayMs"),
      damage: requireValue(instance.damagePerTick, "damagePerTick"),
      ticks: requireValue(instance.ticks, "ticks"),
      tickIntervalMs: requireValue(instance.tickIntervalMs, "tickIntervalMs"),
    }));

  const damageSource: DamageSource = "weapon";
  const multiplierFor = (element: Element) =>
    combinedMultiplier(multiplierParts, buckets, {
      damageSource,
      element,
      weaponType: weapon.weaponType,
    });
  const multiplier = multiplierFor(weapon.element);

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
            damage: instance.damage * multiplier,
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
      counterModifierParts,
      isInPhase,
      multiplierFor,
    ),
  );
  damageInstances.sort((a, b) => a.timeMs - b.timeMs);

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  return { shots, damageInstances, totalDamage };
}

/**
 * Applies the counter parts of the weapon after each shot in time order and creates a damage
 * instance whenever a counter reaches its threshold. Counter modifiers scale the stacks of each
 * application, rounded up. Not modeled yet: decay of stacks over time
 * (docs/mechanics/scorch-and-ignition.md).
 */
function thresholdDamageInstances(
  weapon: Weapon,
  shots: Shot[],
  modifiers: CounterModifierPart[],
  isInPhase: (timeMs: number) => boolean,
  multiplierFor: (element: Element) => number,
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
    const factor = modifiers
      .filter((modifier) => modifier.counterId === part.counterId)
      .reduce(
        (product, modifier) =>
          product * requireValue(modifier.factor, "factor"),
        1,
      );
    const scaledStacks = Math.ceil(stacks * factor - ROUNDING_TOLERANCE);
    for (const shot of shots) {
      for (let i = 0; i < count; i++) {
        applications.push({
          timeMs: shot.timeMs + firstDelayMs + i * intervalMs,
          counterId: part.counterId,
          stacks: scaledStacks,
        });
      }
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
        damage: reached.damage * multiplierFor(reached.part.element),
        damageSource: "weapon",
        element: reached.part.element,
      });
      counter.stacks = 0;
      counter.blockedUntilMs = application.timeMs + reached.cooldownMs;
    }
  }
  return result;
}
