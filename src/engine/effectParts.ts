// Effect parts (ADR 0006): splitting by type, overrides and the multiplier per bucket.

import type {
  Bucket,
  CounterModifierPart,
  DamageSource,
  Effect,
  Element,
  MultiplierPart,
  TimingPart,
  WeaponType,
} from "../data/schema";
import { requireValue } from "./requireValue";

export type ActiveParts = {
  multiplierParts: MultiplierPart[];
  timingParts: TimingPart[];
  counterModifierParts: CounterModifierPart[];
};

/** What a damage instance is, as far as multiplier parts care. */
export type DamageTarget = {
  damageSource: DamageSource;
  element: Element;
  weaponType?: WeaponType; // omitted for abilities
};

/**
 * Returns the parts of all effects, split by type. Multiplier parts of an overridden effect are
 * dropped in the buckets of the overriding effect. Throws if a part refers to an unknown bucket.
 */
export function activeParts(effects: Effect[], buckets: Bucket[]): ActiveParts {
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  const multiplierParts: MultiplierPart[] = [];
  const timingParts: TimingPart[] = [];
  const counterModifierParts: CounterModifierPart[] = [];

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
      if (part.type === "counterModifier") {
        counterModifierParts.push(part);
        continue;
      }
      if (!bucketIds.has(part.bucketId)) {
        throw new Error(`Unknown bucket "${part.bucketId}"`);
      }
      if (!overriddenBuckets.has(part.bucketId)) multiplierParts.push(part);
    }
  }
  return { multiplierParts, timingParts, counterModifierParts };
}

/** A part without weapon types applies to everything; a part with weapon types only to those weapons. */
export function appliesToWeaponType(
  weaponTypes: WeaponType[] | undefined,
  weaponType: WeaponType | undefined,
): boolean {
  return (
    weaponTypes === undefined ||
    (weaponType !== undefined && weaponTypes.includes(weaponType))
  );
}

/** Combines the matching parts per bucket by its stacking rule. Lists only buckets with matching parts. */
export function bucketMultipliers(
  parts: MultiplierPart[],
  buckets: Bucket[],
  target: DamageTarget,
): { bucket: Bucket; multiplier: number }[] {
  const result: { bucket: Bucket; multiplier: number }[] = [];
  for (const bucket of buckets) {
    const values = parts
      .filter(
        (part) =>
          part.bucketId === bucket.id &&
          part.damageSources.includes(target.damageSource) &&
          (part.elements === undefined ||
            part.elements.includes(target.element)) &&
          appliesToWeaponType(part.weaponTypes, target.weaponType),
      )
      .map((part) => requireValue(part.multiplier, "multiplier"));
    if (values.length === 0) continue;

    let multiplier: number;
    switch (bucket.stacking) {
      case "highest":
        multiplier = Math.max(...values);
        break;
      case "multiplicative":
        multiplier = values.reduce((product, value) => product * value, 1);
        break;
      case "additive":
        multiplier = 1 + values.reduce((sum, value) => sum + (value - 1), 0);
        break;
    }
    result.push({ bucket, multiplier });
  }
  return result;
}

/** Buckets multiply with each other. */
export function combinedMultiplier(
  parts: MultiplierPart[],
  buckets: Bucket[],
  target: DamageTarget,
): number {
  return bucketMultipliers(parts, buckets, target).reduce(
    (product, entry) => product * entry.multiplier,
    1,
  );
}
