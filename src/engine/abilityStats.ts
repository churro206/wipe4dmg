// Ability stats (ADR 0009): the super, grenade and melee stat scale the damage of their abilities.

import type { AbilityStatScaling } from "../data/schema";
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
