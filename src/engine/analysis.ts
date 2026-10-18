// Derived views of a simulation result for charts: damage by instance, damage curve, DPS by length.

import type { Bucket, Effect, Weapon } from "../data/schema";
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
