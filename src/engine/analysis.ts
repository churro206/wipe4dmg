// Derived views of a simulation result for charts: damage by instance, damage curve, DPS by length.

import type { Bucket, DamageSource, Effect, Weapon } from "../data/schema";
import {
  simulate,
  type SimulationOptions,
  type SimulationResult,
} from "./simulate";

const MS_PER_SECOND = 1000;

export type DamageShare = {
  id: string; // damage instance id, e.g. "shot", "ignition", "takenSeeker"
  damage: number;
  share: number; // of the total damage, 0 to 1
};

/** Damage per damage instance id, ordered by the first damage instance of each id. */
export function damageByInstance(result: SimulationResult): DamageShare[] {
  const totals = new Map<string, number>();
  for (const instance of result.damageInstances) {
    totals.set(instance.id, (totals.get(instance.id) ?? 0) + instance.damage);
  }
  return [...totals].map(([id, damage]) => ({
    id,
    damage,
    share: result.totalDamage > 0 ? damage / result.totalDamage : 0,
  }));
}

export type SourceShare = {
  damageSource: DamageSource;
  damage: number;
  share: number; // of the total damage, 0 to 1
};

const SOURCE_ORDER: DamageSource[] = ["weapon", "super", "grenade", "melee"];

/** Damage per damage source in the order weapon, super, grenade, melee; only sources with damage. */
export function damageBySource(result: SimulationResult): SourceShare[] {
  return SOURCE_ORDER.flatMap((damageSource) => {
    const instances = result.damageInstances.filter(
      (d) => d.damageSource === damageSource,
    );
    if (instances.length === 0) return [];
    const damage = instances.reduce((sum, d) => sum + d.damage, 0);
    const share = result.totalDamage > 0 ? damage / result.totalDamage : 0;
    return [{ damageSource, damage, share }];
  });
}

export type CurvePoint = {
  timeMs: number;
  totalDamage: number; // cumulative up to and including this time
};

/** Damage Curve (glossary): cumulative damage over the damage phase, one point per time. */
export function damageCurve(
  result: SimulationResult,
  damagePhaseSeconds: number,
): CurvePoint[] {
  const points: CurvePoint[] = [{ timeMs: 0, totalDamage: 0 }];
  let total = 0;
  for (const instance of result.damageInstances) {
    total += instance.damage;
    const last = points[points.length - 1];
    if (last.timeMs === instance.timeMs) {
      last.totalDamage = total;
    } else {
      points.push({ timeMs: instance.timeMs, totalDamage: total });
    }
  }
  const endMs = damagePhaseSeconds * MS_PER_SECOND;
  if (points[points.length - 1].timeMs < endMs) {
    points.push({ timeMs: endMs, totalDamage: total });
  }
  return points;
}

/** DPS of the same build for several damage phase lengths, e.g. to show burst versus sustain. */
export function dpsByDamagePhase(
  weapon: Weapon,
  effects: Effect[],
  buckets: Bucket[],
  options: SimulationOptions,
  lengthsSeconds: number[],
): { seconds: number; dps: number }[] {
  return lengthsSeconds.map((seconds) => ({
    seconds,
    dps: simulate(weapon, seconds, effects, buckets, options).dps,
  }));
}

export type ComparisonRow = {
  key: "totalDamage" | "dps" | "shots" | "ignitions";
  a: number;
  b: number;
  difference: number; // a - b
  relative: number | null; // a / b - 1; null if b is 0
};

/** Key figures of two simulations side by side (US-09). */
export function compareResults(
  a: SimulationResult,
  b: SimulationResult,
): ComparisonRow[] {
  const ignitions = (result: SimulationResult) =>
    result.damageInstances.filter((d) => d.id === "ignition").length;
  const pairs: [ComparisonRow["key"], number, number][] = [
    ["totalDamage", a.totalDamage, b.totalDamage],
    ["dps", a.dps, b.dps],
    ["shots", a.shots.length, b.shots.length],
    ["ignitions", ignitions(a), ignitions(b)],
  ];
  return pairs.map(([key, valueA, valueB]) => ({
    key,
    a: valueA,
    b: valueB,
    difference: valueA - valueB,
    relative: valueB === 0 ? null : valueA / valueB - 1,
  }));
}
