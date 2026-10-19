// Abilities of a build for the simulator (ADR 0009): casts, stat values and the effects that the
// abilities grant, with their windows from the first cast.

import type {
  Ability,
  AbilityStatScaling,
  Build,
  Effect,
} from "../data/schema";
import type { AbilityStatValue } from "./abilityStats";
import type { EffectWindowInput } from "./effectWindows";
import { grantedEffectWindows } from "./grantedEffects";
import type { AbilityCast } from "./simulate";

export type AbilitySimulation = {
  casts: AbilityCast[];
  stats: AbilityStatValue[];
  grantedEffects: Effect[]; // add to the selected effects
  grantedWindows: Record<string, EffectWindowInput>; // add to the effect windows
};

export function abilitySimulation(
  build: Pick<Build, "abilities" | "abilityStats">,
  abilities: Ability[],
  abilityStats: AbilityStatScaling[],
  effects: Effect[],
): AbilitySimulation {
  const casts = (build.abilities ?? []).map(({ abilityId, castsMs }) => {
    const ability = abilities.find((a) => a.id === abilityId);
    if (!ability) throw new Error(`Unknown ability "${abilityId}"`);
    return { ability, castsMs };
  });
  const stats = build.abilityStats
    ? abilityStats.map((scaling) => ({
        scaling,
        value: build.abilityStats![scaling.kind],
      }))
    : [];
  const grantedWindows = grantedEffectWindows(casts, effects);
  return {
    casts,
    stats,
    grantedEffects: effects.filter((effect) => effect.id in grantedWindows),
    grantedWindows,
  };
}
