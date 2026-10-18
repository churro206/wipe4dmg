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

import type {
  Bucket,
  DamageSource,
  Effect,
  Element,
  MultiplierPart,
  SourcedNumber,
  TimingPart,
  Weapon,
  WeaponType,
} from "../data/schema";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;

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

  const { multiplierParts, timingParts } = activeParts(effects, buckets);
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
  const multiplier = combinedMultiplier(
    multiplierParts,
    buckets,
    damageSource,
    weapon.element,
    weapon.weaponType,
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
            damage: instance.damage * multiplier,
            damageSource,
            element: weapon.element,
          });
        }
      }
    }
  }
  damageInstances.sort((a, b) => a.timeMs - b.timeMs);

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  return { shots, damageInstances, totalDamage };
}

/**
 * Returns the parts of all effects, split by type. Multiplier parts of an overridden effect are
 * dropped in the buckets of the overriding effect. Throws if a part refers to an unknown bucket.
 */
function activeParts(
  effects: Effect[],
  buckets: Bucket[],
): { multiplierParts: MultiplierPart[]; timingParts: TimingPart[] } {
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  const multiplierParts: MultiplierPart[] = [];
  const timingParts: TimingPart[] = [];

  for (const effect of effects) {
    const overriddenBuckets = new Set(
      effects
        .filter((other) => other.overrides?.includes(effect.id))
        .flatMap((other) => other.parts)
        .flatMap((part) => (part.type === "multiplier" ? [part.bucketId] : [])),
    );
    for (const part of effect.parts) {
      if (part.type === "timing") {
        timingParts.push(part);
        continue;
      }
      if (!bucketIds.has(part.bucketId)) {
        throw new Error(`Unknown bucket "${part.bucketId}"`);
      }
      if (!overriddenBuckets.has(part.bucketId)) multiplierParts.push(part);
    }
  }
  return { multiplierParts, timingParts };
}

function appliesToWeaponType(
  weaponTypes: WeaponType[] | undefined,
  weaponType: WeaponType,
): boolean {
  return weaponTypes === undefined || weaponTypes.includes(weaponType);
}

/** Combines the matching parts per bucket by its stacking rule; buckets multiply with each other. */
function combinedMultiplier(
  parts: MultiplierPart[],
  buckets: Bucket[],
  damageSource: DamageSource,
  element: Element,
  weaponType: WeaponType,
): number {
  let total = 1;
  for (const bucket of buckets) {
    const values = parts
      .filter(
        (part) =>
          part.bucketId === bucket.id &&
          part.damageSources.includes(damageSource) &&
          (part.elements === undefined || part.elements.includes(element)) &&
          appliesToWeaponType(part.weaponTypes, weaponType),
      )
      .map((part) => requireValue(part.multiplier, "multiplier"));
    if (values.length === 0) continue;

    switch (bucket.stacking) {
      case "highest":
        total *= Math.max(...values);
        break;
      case "multiplicative":
        total *= values.reduce((product, value) => product * value, 1);
        break;
      case "additive":
        total *= 1 + values.reduce((sum, value) => sum + (value - 1), 0);
        break;
    }
  }
  return total;
}

/** Returns the value, or throws if it is missing (ADR 0002: never compute with guessed values). */
function requireValue(sourced: SourcedNumber, field: string): number {
  if (sourced.value === null) {
    throw new Error(`${field} is missing (status "${sourced.source.status}")`);
  }
  return sourced.value;
}
