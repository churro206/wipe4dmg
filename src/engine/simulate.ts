// Simulator: builds the timeline of shots and damage instances in a damage phase (ADR 0001).
//
// Timing model (matches Time to Empty in Quantum Damage-ics, see docs/data-sources.md):
// - The damage phase starts at 0 ms with the first charge; the first shot follows after the charge time.
// - Shots within a magazine are one shot interval (60000 / fireRateRpm) apart.
// - After the last shot of a magazine, the reload time adds to the shot interval. A cast that
//   refills the magazine (U7, e.g. Marksman's Dodge) ends a reload at once or fills up the magazine.
// - The weapon fires at most totalShots shots; primary ammo is unlimited.
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
// multiplier parts for that source apply. The stat of the ability's kind adds a multiplier in its
// own bucket to the components that scale with it.
// A super with usage data keeps the player busy for its super window (superWindow.ts): the weapon
// neither charges nor fires inside it, so a shot whose charge would overlap moves behind it.
//
// All hits, counter applications and releases are events of one event run (eventRun.ts, ADR 0015):
// they pass one target state in time order.

import type {
  Ability,
  AppliesKeywordPart,
  AbilityComponent,
  Bucket,
  CounterId,
  DamageOverTimePart,
  Delivery,
  DamageSource,
  Effect,
  Element,
  Keyword,
  KeywordId,
  MultiplierPart,
  PeriodicDamagePart,
  Weapon,
  WeaponType,
} from "../data/schema";
import { abilityStatParts, type AbilityStatValue } from "./abilityStats";
import { weaponStatPart, type WeaponStatValue } from "./weaponStats";
import {
  activeParts,
  appliesToWeaponType,
  bucketFactors,
  productOf,
  type ActiveParts,
  type Factors,
} from "./effectParts";
import { resolveWindows, type EffectWindowOptions } from "./effectWindows";
import { runEvents, type RunEvent } from "./eventRun";
import { keywordOnHit } from "./keywordRun";
import { superWindowMs } from "./superWindow";
import { requireValue } from "./requireValue";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
// Guards rounding up against floating point noise, e.g. 10 x 1.5 = 15.000000000000002.
const ROUNDING_TOLERANCE = 1e-9;
const ABILITY_DAMAGE_SOURCES: DamageSource[] = ["grenade", "melee", "super"];
// Order of events at equal times in the event run (eventRun.ts).
const EVENT_GROUP = {
  weaponHit: 0,
  threshold: 1,
  damageOverTime: 2,
  abilityHit: 3,
  periodic: 4,
} as const;

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
  weaponType?: WeaponType; // set for damage instances of the weapon
  keywordId?: KeywordId; // set for keyword damage, e.g. ignition (ADR 0015, point 5)
  delivery?: Delivery; // impact, splash or dot, where the data names it
  // What scaled the damage: factor per bucket id, plus holdDraw and keywordBonus outside buckets
  factors: Factors;
};

/** An ability of the build and the times of its casts in the damage phase. */
export type AbilityCast = {
  ability: Ability;
  castsMs: number[];
};

export type { AbilityStatValue };

export type SimulationOptions = EffectWindowOptions & {
  catalyst?: boolean; // default: without catalyst
  abilities?: AbilityCast[]; // default: no abilities
  abilityStats?: AbilityStatValue[]; // default: no stat bonus
  weaponStat?: WeaponStatValue; // Weapons stat; default: no stat bonus
  keywords?: Keyword[]; // keywords.json; needed once a part applies a keyword
};

/** Time in which a super keeps the player busy; exact is false if a value of the super is missing. */
export type SuperWindow = {
  abilityId: string;
  startMs: number;
  endMs: number;
  exact: boolean;
};

export type SimulationResult = {
  shots: Shot[];
  reloadsMs: number[]; // start of each full reload, i.e. the last shot of its magazine
  damageInstances: TimedDamageInstance[];
  superWindows: SuperWindow[];
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
  // A catalyst that changes magazine, ammo or reload replaces the timing while it is on.
  const timing = (catalyst && weapon.catalyst?.timing) || weapon;
  const chargeTimeMs = requireValue(weapon.chargeTimeMs, "chargeTimeMs");
  const fireRateRpm = requireValue(timing.fireRateRpm, "fireRateRpm");
  const magazine = requireValue(timing.magazine, "magazine");
  // Primary ammo is unlimited (Quantum: reserves "inf"); the damage phase ends the shots.
  const totalShots =
    weapon.ammo === "primary"
      ? Number.POSITIVE_INFINITY
      : requireValue(timing.totalShots, "totalShots");
  const reloadTimeMs = requireValue(timing.reloadTimeMs, "reloadTimeMs");

  if (fireRateRpm <= 0) {
    throw new Error(`fireRateRpm must be positive, got ${fireRateRpm}`);
  }
  if (!Number.isInteger(magazine) || magazine < 1) {
    throw new Error(`magazine must be a positive integer, got ${magazine}`);
  }
  if (
    totalShots !== Number.POSITIVE_INFINITY &&
    (!Number.isInteger(totalShots) || totalShots < 0)
  ) {
    throw new Error(
      `totalShots must be a non-negative integer, got ${totalShots}`,
    );
  }

  // Validates the buckets of all parts once, even of effects outside their window.
  activeParts(effects, buckets);
  const superWindows = superWindowsOf(options.abilities ?? []);
  const windows = resolveWindows(effects, options, {
    casts: options.abilities ?? [],
    superWindows,
    weaponElement: weapon.element,
  });
  // Conditions of multiplier parts (ADR 0014), fixed for one simulation. Windows of
  // weaponMatchesTriggerElement come only from abilities of the weapon element (effectWindows.ts).
  const superElement = (options.abilities ?? []).find(
    (cast) => cast.ability.kind === "super",
  )?.ability.element;
  const meetsCondition = (part: MultiplierPart) =>
    (part.superElements === undefined ||
      (superElement !== undefined &&
        part.superElements.includes(superElement))) &&
    (part.condition === undefined ||
      part.condition === "weaponMatchesTriggerElement" ||
      (part.condition === "weaponMatchesSuperElement" &&
        superElement === weapon.element));
  const partsCache = new Map<string, ActiveParts>();
  // Excluded effects are already inside a value, e.g. the included effects of an ability component.
  const partsAt = (
    timeMs: number,
    excluded: readonly string[] = [],
  ): ActiveParts => {
    const active = effects.filter(
      (effect) =>
        !excluded.includes(effect.id) &&
        windows
          .get(effect.id)!
          .some((w) => w.startMs <= timeMs && timeMs < w.endMs),
    );
    const key = active.map((effect) => effect.id).join("|");
    let parts = partsCache.get(key);
    if (!parts) {
      const all = activeParts(active, buckets);
      // States of the player granted by the active effects (ADR 0015, U6-2)
      const statuses = new Set(active.flatMap((e) => e.grantsStatus ?? []));
      parts = {
        ...all,
        multiplierParts: all.multiplierParts.filter(
          (part) =>
            meetsCondition(part) &&
            (part.requiresStatus === undefined ||
              part.requiresStatus.some((s) => statuses.has(s))) &&
            (part.requiresEffectIds === undefined ||
              part.requiresEffectIds.some((id) =>
                active.some((e) => e.id === id),
              )),
        ),
      };
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
  // Reload time × factor of the strongest active reloadDuration part; no source says how several
  // factors stack (ADR 0014).
  const reloadMsAt = (timeMs: number) => {
    const factors = partsAt(timeMs)
      .timingParts.filter(
        (part) =>
          part.change === "reloadDuration" &&
          appliesToWeaponType(part.weaponTypes, weapon.weaponType),
      )
      .map((part) => {
        if (part.factor === undefined)
          throw new Error("reloadDuration needs a factor");
        return part.factor;
      });
    return reloadTimeMs * Math.min(1, ...factors);
  };
  const shotIntervalMs = MS_PER_MINUTE / fireRateRpm;
  const damagePhaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const isInPhase = (timeMs: number) => timeMs <= damagePhaseMs;

  // A reload starts with the last shot of a magazine; a noReload part active then skips it.
  const blockingWindows = superWindows.filter((w) => w.endMs > w.startMs);
  // Moves a shot behind every super window that overlaps its charge.
  const afterSuperWindows = (timeMs: number) => {
    let result = timeMs;
    for (const window of blockingWindows) {
      if (result >= window.startMs && result - chargeTimeMs < window.endMs) {
        result = window.endMs + chargeTimeMs;
      }
    }
    return result;
  };

  // Held draw: the number of steps with the most damage per shot cycle; 0 steps if holding does not
  // pay. Returns the extra time and the damage factor of the shot.
  const holdAt = (timeMs: number): { holdMs: number; factor: number } => {
    const none = { holdMs: 0, factor: 1 };
    if (weapon.ammo !== "primary") return none;
    const part = partsAt(timeMs).holdDrawParts.find((p) =>
      appliesToWeaponType(p.weaponTypes, weapon.weaponType),
    );
    if (!part) return none;
    const stepMs = requireValue(part.stepMs, "stepMs");
    const stepFactor = requireValue(part.stepFactor, "stepFactor");
    const maxFactor = requireValue(part.maxFactor, "maxFactor");
    let best = none;
    let bestRate = 1 / shotIntervalMs;
    for (let steps = 1; ; steps++) {
      const factor = Math.min(1 + (stepFactor - 1) * steps, maxFactor);
      const rate = factor / (shotIntervalMs + steps * stepMs);
      if (rate > bestRate) {
        best = { holdMs: steps * stepMs, factor };
        bestRate = rate;
      }
      if (factor >= maxFactor) break;
    }
    return best;
  };

  // Casts that reload the weapon at once (U7), e.g. Marksman's Dodge: a cast during a reload ends
  // it, a cast while the magazine is not empty fills it up. Casts before the previous shot are spent.
  const refillsMs = (options.abilities ?? [])
    .filter((cast) => cast.ability.refillsMagazine)
    .flatMap((cast) => cast.castsMs)
    .sort((a, b) => a - b);
  let refillIndex = 0;
  const refillBefore = (fromMs: number, untilMs: number): number | undefined => {
    while (refillIndex < refillsMs.length && refillsMs[refillIndex] < fromMs) refillIndex++;
    const atMs = refillsMs[refillIndex];
    if (atMs === undefined || atMs >= untilMs) return undefined;
    refillIndex++;
    return atMs;
  };

  const shots: Shot[] = [];
  const reloadsMs: number[] = [];
  const holdFactors: number[] = [];
  let shotMs = chargeTimeMs;
  let leftInMagazine = magazine;
  for (let i = 0; i < totalShots; i++) {
    if (i > 0) {
      const previousMs = shotMs;
      shotMs += shotIntervalMs;
      if (leftInMagazine === 0 && !noReloadAt(previousMs)) {
        const readyMs = shotMs + reloadMsAt(previousMs);
        const refillMs = refillBefore(previousMs, readyMs);
        if (refillMs === undefined) reloadsMs.push(previousMs);
        shotMs = refillMs === undefined ? readyMs : Math.max(shotMs, refillMs);
        leftInMagazine = magazine;
      } else if (leftInMagazine === 0 || refillBefore(previousMs, shotMs) !== undefined) {
        leftInMagazine = magazine;
      }
    }
    leftInMagazine--;
    const hold = holdAt(shotMs);
    shotMs = afterSuperWindows(shotMs + hold.holdMs);
    if (!isInPhase(shotMs)) break;
    shots.push({ timeMs: shotMs });
    holdFactors.push(hold.factor);
  }
  // Damage factor of the held draw for the shot that makes a hit at timeMs
  const anyHold = holdFactors.some((factor) => factor !== 1);
  const holdFactorAt = (timeMs: number) => {
    if (!anyHold) return 1;
    let factor = 1;
    shots.forEach((shot, index) => {
      if (shot.timeMs <= timeMs) factor = holdFactors[index];
    });
    return factor;
  };

  const instances = weapon.damageInstances
    .filter((instance) => catalyst || !instance.requiresCatalyst)
    .map((instance) => ({
      id: instance.id,
      delivery: instance.delivery,
      delayMs: requireValue(instance.delayMs, "delayMs"),
      damage: requireValue(instance.damagePerTick, "damagePerTick"),
      ticks: requireValue(instance.ticks, "ticks"),
      tickIntervalMs: requireValue(instance.tickIntervalMs, "tickIntervalMs"),
    }));

  const damageSource: DamageSource = "weapon";
  // Imported packages (ADR 0013): effects inside the value per shot do not count again, and the
  // catalyst switch applies the catalyst options as multipliers in their bucket.
  const included = weapon.includedEffectIds ?? [];
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  const optionParts = (weapon.options ?? [])
    .filter((option) => option.kind === "catalyst" && catalyst)
    .map((option) => {
      if (!bucketIds.has(option.bucketId)) {
        throw new Error(`Unknown bucket "${option.bucketId}"`);
      }
      const part: MultiplierPart = {
        type: "multiplier",
        bucketId: option.bucketId,
        multiplier: option.factor,
        damageSources: [damageSource],
      };
      return {
        part,
        windowMs: option.windowSeconds
          ? requireValue(option.windowSeconds, "windowSeconds") * MS_PER_SECOND
          : null,
      };
    });
  // Options with a window count only from the first shot of the weapon on
  const optionPartsAt = (timeMs: number) =>
    optionParts
      .filter(
        ({ windowMs }) =>
          windowMs === null ||
          shots.length === 0 ||
          timeMs <= shots[0].timeMs + windowMs,
      )
      .map(({ part }) => part);
  // Stacks of a hit: the shots of the current run before the shot that makes the hit; a gap longer
  // than refreshMs ends the run.
  const stacksAt = (timeMs: number, refreshMs: number) => {
    let stacks = 0;
    let previousMs: number | undefined;
    for (const shot of shots) {
      if (shot.timeMs > timeMs) break;
      stacks =
        previousMs !== undefined && shot.timeMs - previousMs > refreshMs
          ? 1
          : stacks + 1;
      previousMs = shot.timeMs;
    }
    return Math.max(0, stacks - 1);
  };
  const resolveHitStacks = (part: MultiplierPart, timeMs: number): MultiplierPart => {
    const { hitStacks, ...plain } = part;
    if (hitStacks === undefined) return part;
    const stacks = Math.min(
      stacksAt(
        timeMs,
        hitStacks.refreshMs
          ? requireValue(hitStacks.refreshMs, "refreshMs")
          : Number.POSITIVE_INFINITY,
      ),
      requireValue(hitStacks.maxStacks, "maxStacks"),
    );
    const factor =
      stacks === 0
        ? 1
        : (1 + (requireValue(part.multiplier, "multiplier") - 1) * stacks) *
          requireValue(hitStacks.bossFactor, "bossFactor");
    return { ...plain, multiplier: { ...part.multiplier, value: factor } };
  };
  const statPart = weaponStatPart(options.weaponStat, weapon.ammo);
  const multiplierAt = (timeMs: number, element: Element): Factors => {
    const holdDraw = holdFactorAt(timeMs);
    return {
      ...bucketFactors(
        [
          ...partsAt(timeMs, included).multiplierParts.map((part) =>
            resolveHitStacks(part, timeMs),
          ),
          ...optionPartsAt(timeMs),
          ...(statPart ? [statPart] : []),
        ],
        buckets,
        { damageSource, element, weaponType: weapon.weaponType },
      ),
      ...(holdDraw !== 1 ? { holdDraw } : {}),
    };
  };
  const counterFactorAt = (counterId: CounterId, timeMs: number) =>
    partsAt(timeMs, included)
      .counterModifierParts.filter((part) => part.counterId === counterId)
      .reduce(
        (product, part) => product * requireValue(part.factor, "factor"),
        1,
      );

  const events: RunEvent[] = [];
  for (const shot of shots) {
    for (const instance of instances) {
      for (let tick = 0; tick < instance.ticks; tick++) {
        const timeMs =
          shot.timeMs + instance.delayMs + tick * instance.tickIntervalMs;
        if (!isInPhase(timeMs)) continue;
        events.push({
          timeMs,
          group: EVENT_GROUP.weaponHit,
          handle: (_, emit) => {
            const factors = multiplierAt(timeMs, weapon.element);
            emit({
              id: instance.id,
              timeMs,
              damage: instance.damage * productOf(factors),
              damageSource,
              element: weapon.element,
              weaponType: weapon.weaponType,
              ...(instance.delivery ? { delivery: instance.delivery } : {}),
              factors,
            });
          },
        });
      }
    }
  }
  events.push(
    ...thresholdEvents(weapon, shots, counterFactorAt, isInPhase, multiplierAt),
  );
  for (const part of weapon.intrinsicParts) {
    if (part.type !== "damageOverTime") continue;
    if (part.requiresCatalyst && !catalyst) continue;
    events.push(
      ...damageOverTimeEvents(part, shots, isInPhase, multiplierAt, weapon),
    );
  }
  const statParts = abilityStatParts(options.abilityStats ?? [], buckets);
  for (const cast of options.abilities ?? []) {
    events.push(
      ...abilityHitEvents(cast, isInPhase, (timeMs, component) =>
        bucketFactors(
          [
            ...partsAt(timeMs, component.includedEffectIds).multiplierParts,
            ...(component.scalesWithAbilityStat ? statParts : []),
          ],
          buckets,
          {
            damageSource: cast.ability.kind,
            element: cast.ability.element,
            abilityId: cast.ability.id,
          },
        ),
      ),
    );
  }
  // Damage of its own at a fixed rate in each window of its effect, e.g. Storm's Keep: generic
  // damage, so only parts for keyword damage apply (Aegis applies only the debuff).
  for (const effect of effects) {
    for (const part of effect.parts) {
      if (part.type !== "periodicDamage") continue;
      events.push(
        ...periodicEvents(part, windows.get(effect.id)!, isInPhase, (timeMs) =>
          bucketFactors(partsAt(timeMs).multiplierParts, buckets, {
            damageSource: "keyword",
            element: part.element,
          }),
        ),
      );
    }
  }
  // Keyword damage (ADR 0015): parts for keyword damage apply, for an ability keyword also parts
  // for all abilities at once. Ignition inherits the bonuses of the hit that applied the scorch, in
  // the element of the keyword; melee buffs do not count ("Melee Damage Buffs do not scale
  // Ignition nor Scorch damage", Compendium), so a melee source counts like keyword damage.
  // A keyword bonus of the weapon scales keyword damage its hits set off.
  const weaponKeywordBonus = (keyword: Keyword, source: TimedDamageInstance) =>
    source.damageSource === "weapon"
      ? (weapon.keywordBonuses ?? [])
          .filter((bonus) => bonus.keywordId === keyword.id)
          .reduce(
            (product, bonus) => product * requireValue(bonus.factor, "factor"),
            1,
          )
      : 1;
  const keywordMultiplierAt = (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ): Factors => {
    const keywordBonus = weaponKeywordBonus(keyword, source);
    return {
      ...sourceMultiplierAt(timeMs, keyword, source),
      ...(keywordBonus !== 1 ? { keywordBonus } : {}),
    };
  };
  const sourceMultiplierAt = (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ): Factors => {
    if (keyword.damageCategory === "inheritsSource") {
      if (source.damageSource === "weapon") {
        // Weapon options (catalyst, perks) stay with the shots: their factors come from values
        // per shot without the ignitions (ADR 0015, U4a-4).
        return bucketFactors(
          [
            ...partsAt(timeMs, included).multiplierParts,
            ...(statPart ? [statPart] : []),
          ],
          buckets,
          {
            damageSource,
            element: keyword.element,
            weaponType: weapon.weaponType,
          },
        );
      }
      if (
        source.damageSource !== "melee" &&
        source.damageSource !== "keyword"
      ) {
        // The ability stat counts too: Aegis measures the ignitions of a grenade growing with the
        // grenade stat (ADR 0015, U5).
        return bucketFactors(
          [...partsAt(timeMs).multiplierParts, ...statParts],
          buckets,
          {
            damageSource: source.damageSource,
            element: keyword.element,
            abilityId: source.abilityId,
          },
        );
      }
    }
    const parts = partsAt(timeMs)
      .multiplierParts.filter(
        (part) =>
          part.damageSources.includes("keyword") ||
          (keyword.damageCategory === "ability" &&
            ABILITY_DAMAGE_SOURCES.every((s) =>
              part.damageSources.includes(s),
            )),
      )
      .map((part) => ({ ...part, damageSources: ["keyword" as const] }));
    return bucketFactors(parts, buckets, {
      damageSource: "keyword",
      element: keyword.element,
    });
  };
  // Keyword parts of the weapon and of the abilities in the build are always active (ADR 0015).
  const weaponKeywordParts = [
    ...weapon.intrinsicParts.filter(
      (part): part is AppliesKeywordPart => part.type === "appliesKeyword",
    ),
    ...(options.abilities ?? []).flatMap(
      (cast) => cast.ability.keywordParts ?? [],
    ),
  ];
  const damageInstances = runEvents(
    events,
    keywordOnHit({
      keywords: options.keywords ?? [],
      keywordPartsAt: (timeMs) => [
        ...weaponKeywordParts,
        ...partsAt(timeMs).keywordParts,
      ],
      multiplierAt: keywordMultiplierAt,
      stackFactorAt: counterFactorAt,
      isInPhase,
    }),
  );

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  const dps = damagePhaseSeconds > 0 ? totalDamage / damagePhaseSeconds : 0;
  return { shots, reloadsMs, damageInstances, superWindows, totalDamage, dps };
}

/** Super windows of all super casts with usage data, sorted by start. */
function superWindowsOf(casts: AbilityCast[]): SuperWindow[] {
  return casts
    .flatMap(({ ability, castsMs }) => {
      if (ability.kind !== "super" || !ability.usage) return [];
      const { durationMs, exact } = superWindowMs(ability.usage);
      return castsMs.map((startMs) => ({
        abilityId: ability.id,
        startMs,
        endMs: startMs + durationMs,
        exact,
      }));
    })
    .sort((a, b) => a.startMs - b.startMs);
}

/** Hits of all components of an ability after each cast: delay, then ticks. */
function abilityHitEvents(
  { ability, castsMs }: AbilityCast,
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number, component: AbilityComponent) => Factors,
): RunEvent[] {
  const components = ability.components.map((component) => ({
    id: `${ability.id}.${component.id}`,
    component,
    delayMs: requireValue(component.delayMs, "delayMs"),
    damage: requireValue(component.damagePerTick, "damagePerTick"),
    ticks: requireValue(component.ticks, "ticks"),
    tickIntervalMs: requireValue(component.tickIntervalMs, "tickIntervalMs"),
  }));
  const result: RunEvent[] = [];
  for (const castMs of castsMs) {
    for (const component of components) {
      for (let tick = 0; tick < component.ticks; tick++) {
        const timeMs =
          castMs + component.delayMs + tick * component.tickIntervalMs;
        if (!isInPhase(timeMs)) continue;
        result.push({
          timeMs,
          group: EVENT_GROUP.abilityHit,
          handle: (_, emit) => {
            const factors = multiplierAt(timeMs, component.component);
            emit({
              id: component.id,
              timeMs,
              damage: component.damage * productOf(factors),
              damageSource: ability.kind,
              element: ability.element,
              abilityId: ability.id,
              ...(component.component.delivery
                ? { delivery: component.component.delivery }
                : {}),
              factors,
            });
          },
        });
      }
    }
  }
  return result;
}

/** Hits of a periodic damage part: one interval after each window start, then every interval. */
function periodicEvents(
  part: PeriodicDamagePart,
  windows: { startMs: number; endMs: number }[],
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number) => Factors,
): RunEvent[] {
  const intervalMs = requireValue(part.intervalMs, "intervalMs");
  const damage = requireValue(part.damage, "damage");
  if (intervalMs <= 0) {
    throw new Error(`intervalMs must be positive, got ${intervalMs}`);
  }
  const result: RunEvent[] = [];
  for (const window of windows) {
    for (
      let timeMs = window.startMs + intervalMs;
      timeMs < window.endMs && isInPhase(timeMs);
      timeMs += intervalMs
    ) {
      const atMs = timeMs;
      result.push({
        timeMs: atMs,
        group: EVENT_GROUP.periodic,
        handle: (_, emit) => {
          const factors = multiplierAt(atMs);
          emit({
            id: part.id,
            timeMs: atMs,
            damage: damage * productOf(factors),
            damageSource: "keyword",
            element: part.element,
            factors,
          });
        },
      });
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
 * target already holds the maximum number of active sources, a release deals only its impact
 * (reconstructed from Aegis, docs/mechanics/taken-seeker.md). Damage is converted to the main
 * source's scale (ADR 0011).
 */
function damageOverTimeEvents(
  part: DamageOverTimePart,
  shots: Shot[],
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number, element: Element) => Factors,
  weapon: Weapon,
): RunEvent[] {
  const count = requireValue(
    part.applicationsPerTrigger,
    "applicationsPerTrigger",
  );
  const firstDelayMs = requireValue(part.firstDelayMs, "firstDelayMs");
  const intervalMs = requireValue(part.intervalMs, "intervalMs");
  const sourceScale = part.sourceScale
    ? requireValue(part.sourceScale, "sourceScale")
    : 1;
  const impactDamage =
    requireValue(part.impactDamage, "impactDamage") * sourceScale;
  const tickDamage = requireValue(part.tickDamage, "tickDamage") * sourceScale;
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
  const hit = (timeMs: number, damage: number): TimedDamageInstance => {
    const factors = multiplierAt(timeMs, weapon.element);
    return {
      id: part.id,
      timeMs,
      damage: damage * productOf(factors),
      damageSource: "weapon",
      element: weapon.element,
      weaponType: weapon.weaponType,
      factors,
    };
  };

  return releases.filter(isInPhase).map((releaseMs) => ({
    timeMs: releaseMs,
    group: EVENT_GROUP.damageOverTime,
    handle: (target, emit) => {
      const activeUntilMs = (
        target.activeSourcesUntilMs.get(part.id) ?? []
      ).filter((untilMs) => untilMs >= releaseMs);
      target.activeSourcesUntilMs.set(part.id, activeUntilMs);
      emit(hit(releaseMs, impactDamage));
      if (activeUntilMs.length >= maxActive) return;

      activeUntilMs.push(
        releaseMs + firstTickDelayMs + (ticks - 1) * tickIntervalMs,
      );
      for (let tick = 0; tick < ticks; tick++) {
        const timeMs = releaseMs + firstTickDelayMs + tick * tickIntervalMs;
        if (isInPhase(timeMs)) emit(hit(timeMs, tickDamage));
      }
    },
  }));
}

/**
 * Applies the counter parts of the weapon after each shot in time order and creates a damage
 * instance whenever a counter reaches its threshold. Counter modifiers active at the time of an
 * application scale its stacks, rounded up. Not modeled yet: decay of stacks over time
 * (docs/mechanics/scorch-and-ignition.md).
 */
function thresholdEvents(
  weapon: Weapon,
  shots: Shot[],
  counterFactorAt: (counterId: CounterId, timeMs: number) => number,
  isInPhase: (timeMs: number) => boolean,
  multiplierAt: (timeMs: number, element: Element) => Factors,
): RunEvent[] {
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
  return applications
    .filter((application) => isInPhase(application.timeMs))
    .map((application) => ({
      timeMs: application.timeMs,
      group: EVENT_GROUP.threshold,
      handle: (target, emit) => {
        const counter = target.counters.get(application.counterId) ?? {
          stacks: 0,
          blockedUntilMs: -Infinity,
        };
        target.counters.set(application.counterId, counter);
        if (application.timeMs < counter.blockedUntilMs) return;

        counter.stacks += application.stacks;
        const reached = thresholds.find(
          (t) =>
            t.part.counterId === application.counterId &&
            counter.stacks >= t.threshold,
        );
        if (!reached) return;
        const factors = multiplierAt(application.timeMs, reached.part.element);
        emit({
          id: reached.part.damageInstanceId,
          timeMs: application.timeMs,
          damage: reached.damage * productOf(factors),
          damageSource: "weapon",
          element: reached.part.element,
          weaponType: weapon.weaponType,
          factors,
        });
        counter.stacks = 0;
        counter.blockedUntilMs = application.timeMs + reached.cooldownMs;
      },
    }));
}
