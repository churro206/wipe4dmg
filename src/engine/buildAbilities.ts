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
  build: Pick<Build, "abilities" | "abilityStats" | "exoticArmorId"> &
    Partial<Pick<Build, "selections">>,
  abilities: Ability[],
  abilityStats: AbilityStatScaling[],
  effects: Effect[],
): AbilitySimulation {
  const selected = new Set((build.selections ?? []).map((s) => s.effectId));
  const casts = (build.abilities ?? []).map(({ abilityId, castsMs }) => {
    const ability = abilities.find((a) => a.id === abilityId);
    if (!ability) throw new Error(`Unknown ability "${abilityId}"`);
    // A variant measured with the worn exotic armor and/or selected aspects and fragments replaces
    // the ability (ADR 0014, U6-2 rule G); the one with the most of them wins.
    const requirements = (a: Ability) =>
      (a.exoticArmorId ? 1 : 0) + (a.requiresEffectIds?.length ?? 0);
    const variant = abilities
      .filter(
        (a) =>
          a.variantOf === abilityId &&
          (a.exoticArmorId === undefined ||
            a.exoticArmorId === build.exoticArmorId) &&
          (a.requiresEffectIds ?? []).every((id) => selected.has(id)),
      )
      .sort((a, b) => requirements(b) - requirements(a))[0];
    return { ability: variant ?? ability, castsMs };
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

// Cast times of one ability (ADR 0009: the rotation sets the casts; energy and cooldowns are not
// checked). All return new sorted lists inside the damage phase.

/** Adds a cast the given gap after the last one, at most at the end of the damage phase. */
export function addCast(
  castsMs: number[],
  damagePhaseMs: number,
  gapMs: number,
): number[] {
  if (castsMs.length === 0) return [0];
  const last = Math.max(...castsMs);
  return [...castsMs, Math.min(last + gapMs, damagePhaseMs)].sort(
    (a, b) => a - b,
  );
}

/** Removes one cast; an ability keeps at least one cast. */
export function removeCast(castsMs: number[], index: number): number[] {
  if (castsMs.length <= 1) return castsMs;
  return castsMs.filter((_, i) => i !== index);
}

/** Moves one cast to a new time inside the damage phase. */
export function setCast(
  castsMs: number[],
  index: number,
  timeMs: number,
  damagePhaseMs: number,
): number[] {
  const clamped = Math.min(Math.max(timeMs, 0), damagePhaseMs);
  return castsMs
    .map((ms, i) => (i === index ? clamped : ms))
    .sort((a, b) => a - b);
}
