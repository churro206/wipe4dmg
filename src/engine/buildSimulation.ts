// The one way from a build to the simulator inputs (plan 2026-10-22): the UI, the optimizer, the
// tests and the Discord bot (US-13) all use it, so none of them can compute a build differently.

import type {
  Ability,
  AbilityGrant,
  AbilityKind,
  AbilityStatScaling,
  ArtifactData,
  Bucket,
  Build,
  CastTimes,
  Effect,
  EnergyData,
  ExoticArmorEffect,
  ExoticArmorEntry,
  Keyword,
  Theta,
  Weapon,
  WeaponStatScaling,
} from "../data/schema";
import { artifactPerksOf } from "./artifacts";
import { abilitySimulation, nextCastOf } from "./buildAbilities";
import { refillsOnCast } from "./effectRules";
import { classPerksOf, exoticArmorEffects } from "./exoticArmor";
import { castGrantEffects } from "./grantedEffects";
import { simulate, type SimulationOptions } from "./simulate";

/** All loaded Data Files a build refers to. */
export type GameData = {
  effects: Effect[]; // effects.json and the subclass effects
  abilities: Ability[]; // with the variants of the exotic armor
  abilityStats: AbilityStatScaling[];
  weaponStats: WeaponStatScaling[]; // weapon-stats.json
  keywords: Keyword[];
  exoticArmor: ExoticArmorEntry[];
  exoticArmorEffects: ExoticArmorEffect[];
  artifacts: ArtifactData; // artifacts.json: perks per tier and the slots of the game screen
  energy: EnergyData; // ability-energy.json: the casts the energy allows (block 3)
  abilityGrants: AbilityGrant[]; // ability-grants.json: effects at every cast or hit, e.g. Radiant
  castTimes: CastTimes; // cast-times.json: how long a cast keeps the player busy
  theta: Theta; // theta.json: factor per scale and damage source (I6)
};

/**
 * Effects and simulator options of a build: its selected effects, the abilities with the casts the
 * energy allows,
 * stats and granted effects (e.g. Well of Radiance from the super), and the exotic armor with its
 * ability variants and effects (prebuilt kill buffs only with the switch), and the perks of the
 * Exotic Class Item. The artifact perks must fit the slots of the artifact (src/engine/artifacts.ts).
 */
export function buildSimulation(
  build: Build,
  data: GameData,
): { selected: Effect[]; options: SimulationOptions } {
  artifactPerksOf(build, data.artifacts); // throws for a combination the game does not allow
  const abilityPart = abilitySimulation(
    build,
    data.abilities,
    data.abilityStats,
    data.effects,
    data.energy,
    data.castTimes,
  );
  const own = data.effects.filter((effect) =>
    build.selections.some((s) => s.effectId === effect.id),
  );
  const exotic = data.exoticArmor.find((e) => e.id === build.exoticArmorId);
  const fromExotic = [
    ...(exotic ? [exotic] : []),
    ...classPerksOf(build, data.exoticArmor),
  ].flatMap((piece) =>
    exoticArmorEffects(piece, data.effects, data.exoticArmorEffects, {
      preBuilt: build.exoticPreBuilt,
    }),
  );
  const extra = [
    ...abilityPart.grantedEffects,
    ...castGrantEffects(abilityPart.casts, data.abilityGrants, data.effects),
    ...fromExotic,
  ];
  return {
    selected: [
      ...own,
      ...extra.filter((e, i) => !own.includes(e) && extra.indexOf(e) === i),
    ],
    options: {
      catalyst: build.catalyst,
      ...(build.weaponPreBuilt ? { assumptions: ["pre-stacked"] } : {}),
      ...(build.playstyle ? { playstyle: build.playstyle } : {}),
      effectWindows: { ...build.effectWindows, ...abilityPart.grantedWindows },
      abilities: abilityPart.casts,
      abilityStats: abilityPart.stats,
      ...(build.weaponsStat === undefined
        ? {}
        : {
            weaponStat: { scalings: data.weaponStats, value: build.weaponsStat },
          }),
      keywords: data.keywords,
      theta: data.theta,
    },
  };
}

/**
 * Earliest time of one more cast of the build's ability of this kind that the energy allows (block
 * 3). An ability that refills the magazine goes to the next full reload from then on, where it
 * saves the most (U7, play like an experienced player); without one left, the earliest time.
 */
export function nextCastFor(
  build: Build,
  kind: AbilityKind,
  data: GameData,
  weapon: Weapon,
  buckets: Bucket[],
): number | undefined {
  const earliestMs = nextCastOf(build, kind, data.abilities, data.energy, data.effects, data.castTimes);
  const pick = (build.abilities ?? []).find(
    (p) => data.abilities.find((a) => a.id === p.abilityId)?.kind === kind,
  );
  const ability = data.abilities.find((a) => a.id === pick?.abilityId);
  if (earliestMs === undefined || !ability || !refillsOnCast(ability)) {
    return earliestMs;
  }
  const { selected, options } = buildSimulation(build, data);
  const { reloadsMs } = simulate(weapon, build.damagePhaseSeconds, selected, buckets, options);
  return reloadsMs.find((ms) => ms >= earliestMs) ?? earliestMs;
}
