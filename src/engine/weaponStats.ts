// Weapons stat: scales the damage of weapons against bosses, per ammo type (weapon-stats.json).

import type { MultiplierPart, WeaponStatScaling } from "../data/schema";
import { requireValue } from "./requireValue";

/** The Weapons stat of a build with the scaling of every ammo type. */
export type WeaponStatValue = {
  scalings: WeaponStatScaling[];
  value: number;
};

/**
 * Multiplier part of the Weapons stat for a weapon with the given ammo type, or null without a
 * bonus (stat up to 100).
 */
export function weaponStatPart(
  stat: WeaponStatValue | undefined,
  ammo: WeaponStatScaling["ammo"],
): MultiplierPart | null {
  if (!stat) return null;
  const scaling = stat.scalings.find((s) => s.ammo === ammo);
  if (!scaling) throw new Error(`No Weapons stat scaling for ${ammo} ammo`);
  if (stat.value < 0 || stat.value > scaling.maxStat) {
    throw new Error(
      `Weapons stat must be between 0 and ${scaling.maxStat}, got ${stat.value}`,
    );
  }
  const perPoint = requireValue(scaling.damagePerPoint, "damagePerPoint");
  return {
    type: "multiplier",
    bucketId: scaling.bucketId,
    multiplier: {
      value: 1 + perPoint * Math.max(0, stat.value - scaling.bonusFromStat),
      source: scaling.damagePerPoint.source,
    },
    damageSources: ["weapon"],
  };
}
