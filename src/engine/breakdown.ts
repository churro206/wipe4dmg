// Breakdown (glossary): per bucket its multiplier and the total damage without that bucket.

import type { Bucket, Effect, Weapon } from "../data/schema";
import { activeParts, bucketMultipliers } from "./effectParts";
import { simulate, type SimulationOptions } from "./simulate";

export type BreakdownEntry = {
  bucketId: string;
  name: string;
  multiplier: number; // for the weapon's own damage
  totalDamageWithout: number;
};

export function breakdown(
  weapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[],
  buckets: Bucket[],
  options: SimulationOptions = {},
): BreakdownEntry[] {
  const { multiplierParts } = activeParts(effects, buckets);
  const entries = bucketMultipliers(multiplierParts, buckets, {
    damageSource: "weapon",
    element: weapon.element,
    weaponType: weapon.weaponType,
  });
  return entries.map(({ bucket, multiplier }) => ({
    bucketId: bucket.id,
    name: bucket.name,
    multiplier,
    totalDamageWithout: simulate(
      weapon,
      damagePhaseSeconds,
      withoutBucket(effects, bucket.id),
      buckets,
      options,
    ).totalDamage,
  }));
}

/** Drops the multiplier parts of one bucket; other parts of the effects stay, e.g. timing. */
function withoutBucket(effects: Effect[], bucketId: string): Effect[] {
  return effects
    .map((effect) => ({
      ...effect,
      parts: effect.parts.filter(
        (part) => !(part.type === "multiplier" && part.bucketId === bucketId),
      ),
    }))
    .filter((effect) => effect.parts.length > 0);
}
