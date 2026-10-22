// The one way from a build to the simulator inputs (plan 2026-10-22): the UI, the optimizer, the
// tests and the Discord bot (US-13) all use it, so none of them can compute a build differently.

import type {
  Ability,
  AbilityStatScaling,
  Build,
  Effect,
  ExoticArmorEffect,
  ExoticArmorEntry,
  Keyword,
} from "../data/schema";
import { abilitySimulation } from "./buildAbilities";
import { exoticArmorEffects } from "./exoticArmor";
import type { SimulationOptions } from "./simulate";

/** All loaded Data Files a build refers to. */
export type GameData = {
  effects: Effect[]; // effects.json and the subclass effects
  abilities: Ability[]; // with the variants of the exotic armor
  abilityStats: AbilityStatScaling[];
  keywords: Keyword[];
  exoticArmor: ExoticArmorEntry[];
  exoticArmorEffects: ExoticArmorEffect[];
};

/**
 * Effects and simulator options of a build: its selected effects, the abilities with their casts,
 * stats and granted effects (e.g. Well of Radiance from the super), and the exotic armor with its
 * ability variants and effects (prebuilt kill buffs only with the switch).
 */
export function buildSimulation(
  build: Build,
  data: GameData,
): { selected: Effect[]; options: SimulationOptions } {
  const abilityPart = abilitySimulation(
    build,
    data.abilities,
    data.abilityStats,
    data.effects,
  );
  const own = data.effects.filter((effect) =>
    build.selections.some((s) => s.effectId === effect.id),
  );
  const exotic = data.exoticArmor.find((e) => e.id === build.exoticArmorId);
  const fromExotic = exotic
    ? exoticArmorEffects(exotic, data.effects, data.exoticArmorEffects, {
        preBuilt: build.exoticPreBuilt,
      })
    : [];
  const extra = [...abilityPart.grantedEffects, ...fromExotic];
  return {
    selected: [
      ...own,
      ...extra.filter((e, i) => !own.includes(e) && extra.indexOf(e) === i),
    ],
    options: {
      catalyst: build.catalyst,
      effectWindows: { ...build.effectWindows, ...abilityPart.grantedWindows },
      abilities: abilityPart.casts,
      abilityStats: abilityPart.stats,
      keywords: data.keywords,
    },
  };
}
