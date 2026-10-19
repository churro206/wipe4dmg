// Ability stats (ADR 0009): the super, grenade and melee stat scale the damage of their abilities.

import type {
  AbilityStatScaling,
  Bucket,
  MultiplierPart,
} from "../data/schema";
import { requireValue } from "./requireValue";

/** Damage multiplier of a stat value: 1 up to bonusFromStat, then a fixed bonus per point. */
export function abilityStatMultiplier(
  scaling: AbilityStatScaling,
  stat: number,
): number {
  if (stat < 0 || stat > scaling.maxStat) {
    throw new Error(
      `${scaling.kind} stat must be between 0 and ${scaling.maxStat}, got ${stat}`,
    );
  }
  const perPoint = requireValue(scaling.damagePerPoint, "damagePerPoint");
  return 1 + perPoint * Math.max(0, stat - scaling.bonusFromStat);
}

/** The value of a super, grenade or melee stat of the build with its scaling. */
export type AbilityStatValue = {
  scaling: AbilityStatScaling;
  value: number;
};

/**
 * Turns the stat values into multiplier parts for the abilities of the stat's kind. Throws if a
 * stat refers to an unknown bucket.
 */
export function abilityStatParts(
  stats: AbilityStatValue[],
  buckets: Bucket[],
): MultiplierPart[] {
  return stats.map(({ scaling, value }) => {
    if (!buckets.some((bucket) => bucket.id === scaling.bucketId)) {
      throw new Error(`Unknown bucket "${scaling.bucketId}"`);
    }
    return {
      type: "multiplier",
      bucketId: scaling.bucketId,
      multiplier: {
        value: abilityStatMultiplier(scaling, value),
        source: scaling.damagePerPoint.source,
      },
      damageSources: [scaling.kind],
    };
  });
}
