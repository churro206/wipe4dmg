// Derived views of a simulation result for charts: damage by instance, damage curve, DPS by length.

import {
  KeywordId,
  type Bucket,
  type DamageSource,
  type Effect,
  type Weapon,
} from "../data/schema";
import {
  simulate,
  type SimulationOptions,
  type SimulationResult,
} from "./simulate";
import { MS_PER_SECOND } from "./units";

export type DamageShare = {
  id: string; // damage instance id of the weapon (e.g. "shot", "ignition") or the ability id
  damageSource: DamageSource;
  abilityId?: string; // set for an ability; all its components form one entry
  damage: number;
  share: number; // of the total damage, 0 to 1
};

/**
 * Damage per weapon damage instance id and per ability. Weapon entries come first, ordered by
 * their first damage instance, then the abilities in the order super, grenade, melee.
 */
export function damageShares(result: SimulationResult): DamageShare[] {
  const entries = new Map<string, Omit<DamageShare, "share">>();
  for (const instance of result.damageInstances) {
    const id = instance.abilityId ?? instance.id;
    const entry = entries.get(id);
    if (entry) {
      entry.damage += instance.damage;
    } else {
      entries.set(id, {
        id,
        damageSource: instance.damageSource,
        ...(instance.abilityId ? { abilityId: instance.abilityId } : {}),
        damage: instance.damage,
      });
    }
  }
  const order = (e: Omit<DamageShare, "share">) =>
    SOURCE_ORDER.indexOf(e.damageSource);
  return [...entries.values()]
    .sort((a, b) => order(a) - order(b))
    .map((entry) => ({
      ...entry,
      share: result.totalDamage > 0 ? entry.damage / result.totalDamage : 0,
    }));
}

export type SourceShare = {
  damageSource: DamageSource;
  damage: number;
  share: number; // of the total damage, 0 to 1
};

const SOURCE_ORDER: DamageSource[] = [
  "weapon",
  "super",
  "grenade",
  "melee",
  "classAbility",
  "keyword",
];

/** Damage per damage source in the order weapon, super, grenade, melee, class ability, keyword; only sources with damage. */
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

export type MultiplierShare = {
  id: string; // "base", a bucket id, "holdDraw", "keywordBonus" or "catalyst"
  damage: number;
  share: number; // of the total damage, 0 to 1
};

/**
 * Total damage split into base, each multiplier and the catalyst (outer donut ring). The catalyst is
 * the total minus the total of the run without it, so base and multipliers come from that run. Per
 * damage instance the base is its damage without the factors above 1 (factors below 1 stay in the
 * base, so no slice is negative); the extra damage splits by ln(factor) ÷ ln(product), so the order
 * of the buckets does not matter. The slices add up to the total damage.
 */
export function damageByMultiplier(
  result: SimulationResult,
  withoutCatalyst?: SimulationResult,
): MultiplierShare[] {
  const catalyst = withoutCatalyst
    ? result.totalDamage - withoutCatalyst.totalDamage
    : 0;
  const decomposed = catalyst > 0 ? withoutCatalyst! : result;
  const damageById = new Map<string, number>([["base", 0]]);
  const add = (id: string, damage: number) =>
    damageById.set(id, (damageById.get(id) ?? 0) + damage);
  for (const instance of decomposed.damageInstances) {
    const raising = Object.entries(instance.factors).filter(([, f]) => f > 1);
    const product = raising.reduce((p, [, f]) => p * f, 1);
    const base = instance.damage / product;
    add("base", base);
    const logProduct = Math.log(product);
    for (const [id, factor] of raising) {
      add(id, ((instance.damage - base) * Math.log(factor)) / logProduct);
    }
  }
  const [base, ...multipliers] = [...damageById].map(([id, damage]) => ({
    id,
    damage,
  }));
  const slices = [
    base,
    ...multipliers.sort((a, b) => b.damage - a.damage),
    ...(catalyst > 0 ? [{ id: "catalyst", damage: catalyst }] : []),
  ].filter((slice) => slice.damage > 0);
  return slices.map((slice) => ({
    ...slice,
    share: result.totalDamage > 0 ? slice.damage / result.totalDamage : 0,
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

export type ComparisonRow = {
  // a keyword counter is "keyword:<id>", e.g. "keyword:jolt": how often its damage fires
  key: "totalDamage" | "dps" | "shots" | `keyword:${KeywordId}`;
  a: number;
  b: number;
  difference: number; // a - b
  relative: number | null; // a / b - 1; null if b is 0
};

/**
 * Key figures of two simulations side by side (US-09), then one counter per keyword that fires in
 * one of them (Ignition, Jolt, Volatile, Unravel, Bolt Charge), in the order of the schema.
 */
export function compareResults(
  a: SimulationResult,
  b: SimulationResult,
): ComparisonRow[] {
  // The burn ticks of scorch carry the keyword too, but they are no proc (ADR 0017 S2)
  const procs = (result: SimulationResult, id: KeywordId) =>
    result.damageInstances.filter((d) => d.keywordId === id && d.id !== "burn")
      .length;
  const counters = KeywordId.options
    .map((id): [ComparisonRow["key"], number, number] => [
      `keyword:${id}`,
      procs(a, id),
      procs(b, id),
    ])
    .filter(([, valueA, valueB]) => valueA > 0 || valueB > 0);
  const pairs: [ComparisonRow["key"], number, number][] = [
    ["totalDamage", a.totalDamage, b.totalDamage],
    ["dps", a.dps, b.dps],
    ["shots", a.shots.length, b.shots.length],
    ...counters,
  ];
  return pairs.map(([key, valueA, valueB]) => ({
    key,
    a: valueA,
    b: valueB,
    difference: valueA - valueB,
    relative: valueB === 0 ? null : valueA / valueB - 1,
  }));
}
