// Breakdown (glossary): per bucket its multiplier and the total damage without that bucket.
// A bucket can apply differently per damage source, e.g. surges only to the weapon and the ability
// stat only to abilities, so the multiplier is listed for every damage source of the build: the
// weapon and each ability, since a buff can apply to single abilities (e.g. Radiant to Golden Gun).

import type {
  Bucket,
  DamageSource,
  Effect,
  Element,
  Weapon,
  WeaponType,
} from "../data/schema";
import { abilityStatParts } from "./abilityStats";
import { activeParts, bucketMultipliers } from "./effectParts";
import { simulate, type SimulationOptions } from "./simulate";

export type BreakdownEntry = {
  bucketId: string;
  name: string;
  multiplier: number; // for the weapon's own damage; 1 if the bucket does not apply to it
  // Every damage source of the build that the bucket applies to, weapon first, then each ability.
  multipliersBySource: {
    damageSource: DamageSource;
    abilityId?: string; // set for an ability
    multiplier: number;
  }[];
  totalDamageWithout: number;
};

type SourceTarget = {
  damageSource: DamageSource;
  element: Element;
  weaponType?: WeaponType;
  abilityId?: string;
};

export function breakdown(
  weapon: Weapon,
  damagePhaseSeconds: number,
  effects: Effect[],
  buckets: Bucket[],
  options: SimulationOptions = {},
): BreakdownEntry[] {
  const parts = [
    ...activeParts(effects, buckets).multiplierParts,
    ...abilityStatParts(options.abilityStats ?? [], buckets),
  ];
  const targets: SourceTarget[] = [
    {
      damageSource: "weapon",
      element: weapon.element,
      weaponType: weapon.weaponType,
    },
  ];
  for (const { ability } of options.abilities ?? []) {
    if (!targets.some((t) => t.abilityId === ability.id)) {
      targets.push({
        damageSource: ability.kind,
        element: ability.element,
        abilityId: ability.id,
      });
    }
  }
  const bySource = targets.map((target) => ({
    damageSource: target.damageSource,
    abilityId: target.abilityId,
    entries: bucketMultipliers(parts, buckets, target),
  }));

  return buckets.flatMap((bucket) => {
    const multipliersBySource = bySource.flatMap(
      ({ damageSource, abilityId, entries }) => {
        const entry = entries.find((e) => e.bucket.id === bucket.id);
        if (!entry) return [];
        return [
          {
            damageSource,
            ...(abilityId ? { abilityId } : {}),
            multiplier: entry.multiplier,
          },
        ];
      },
    );
    if (multipliersBySource.length === 0) return [];
    const weaponEntry = multipliersBySource.find(
      (m) => m.damageSource === "weapon",
    );
    return [
      {
        bucketId: bucket.id,
        name: bucket.name,
        multiplier: weaponEntry?.multiplier ?? 1,
        multipliersBySource,
        totalDamageWithout: simulate(
          weapon,
          damagePhaseSeconds,
          withoutBucket(effects, bucket.id),
          buckets,
          {
            ...options,
            abilityStats: options.abilityStats?.filter(
              (stat) => stat.scaling.bucketId !== bucket.id,
            ),
          },
        ).totalDamage,
      },
    ];
  });
}

/** Drops the multiplier parts of one bucket; other parts of the effects stay, e.g. timing. */
function withoutBucket(effects: Effect[], bucketId: string): Effect[] {
  return effects
    .map((effect) => ({
      ...effect,
      modifiers: effect.modifiers.filter(
        (part) => !(part.type === "multiplier" && part.bucketId === bucketId),
      ),
      // A buff keeps its rules; its multipliers of that bucket become neutral
      ...(effect.buffs
        ? {
            buffs: effect.buffs.map((buff) => ({
              ...buff,
              modifiers: buff.modifiers.map((part) =>
                part.bucketId === bucketId
                  ? { ...part, multiplier: { ...part.multiplier, value: 1 } }
                  : part,
              ),
            })),
          }
        : {}),
    }))
    .filter(
      (effect) => effect.modifiers.length > 0 || (effect.buffs?.length ?? 0) > 0,
    );
}
