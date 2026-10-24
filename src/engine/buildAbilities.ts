// Abilities of a build for the simulator (ADR 0009): casts, stat values and the effects that the
// abilities grant, with their windows from the first cast. With energy data, the casts are those
// the energy allows (block 3).

import type {
  Ability,
  AbilityStatScaling,
  Build,
  Effect,
  EnergyData,
} from "../data/schema";
import { energyCasts, nextCastMs, type EnergyContext } from "./abilityEnergy";
import type { AbilityStatValue } from "./abilityStats";
import type { EffectWindowInput } from "./effectWindows";
import { grantedEffectWindows } from "./grantedEffects";
import { requireValue } from "./requireValue";
import type { AbilityCast } from "./simulate";

const MS_PER_SECOND = 1000;

export type AbilitySimulation = {
  casts: AbilityCast[];
  stats: AbilityStatValue[];
  grantedEffects: Effect[]; // add to the selected effects
  grantedWindows: Record<string, EffectWindowInput>; // add to the effect windows
};

type AbilityBuild = Pick<Build, "abilities" | "abilityStats" | "exoticArmorId"> &
  Partial<Pick<Build, "selections" | "damagePhaseSeconds" | "effectWindows">>;

export function abilitySimulation(
  build: AbilityBuild,
  abilities: Ability[],
  abilityStats: AbilityStatScaling[],
  effects: Effect[],
  energy?: EnergyData,
): AbilitySimulation {
  const requested = requestedCasts(build, abilities, effects);
  const context = energyContext(build, requested, energy);
  const casts = context ? energyCasts(requested, context) : requested;
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

/**
 * The casts of the rotation as entered, with the variant of each ability. An ability bound to an
 * effect (duringEffectId) keeps only the casts inside the window of that effect.
 */
function requestedCasts(
  build: AbilityBuild,
  abilities: Ability[],
  effects: Effect[],
): AbilityCast[] {
  const selected = new Set((build.selections ?? []).map((s) => s.effectId));
  const insideWindow = (ability: Ability, castMs: number): boolean => {
    const id = ability.duringEffectId;
    if (id === undefined) return true;
    const effect = effects.find((e) => e.id === id);
    if (!effect || !selected.has(id)) return false;
    const input = build.effectWindows?.[id];
    const startMs = input?.startMs ?? 0;
    const durationMs =
      input ? input.durationMs : effect.durationMs && requireValue(effect.durationMs, "durationMs");
    return castMs >= startMs && (durationMs === undefined || castMs < startMs + durationMs);
  };
  return (build.abilities ?? []).map(({ abilityId, castsMs }) => {
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
    return {
      ability: variant ?? ability,
      castsMs: castsMs.filter((ms) => insideWindow(ability, ms)),
    };
  });
}

/** What the energy of the build depends on: stats, exotic, selected and granted effects. */
function energyContext(
  build: AbilityBuild,
  requested: AbilityCast[],
  energy: EnergyData | undefined,
): EnergyContext | undefined {
  if (!energy || build.damagePhaseSeconds === undefined) return undefined;
  return {
    data: energy,
    stats: build.abilityStats,
    exoticArmorId: build.exoticArmorId,
    effectIds: new Set([
      ...(build.selections ?? []).map((s) => s.effectId),
      ...requested.flatMap((c) => c.ability.grantsEffectIds ?? []),
    ]),
    damagePhaseMs: build.damagePhaseSeconds * MS_PER_SECOND,
  };
}

/**
 * Earliest time of one more cast of the ability of this kind that the energy allows; undefined if
 * none fits into the damage phase. Without a cast yet: 0.
 */
export function nextCastOf(
  build: AbilityBuild,
  kind: Ability["kind"],
  abilities: Ability[],
  energy: EnergyData,
  effects: Effect[],
): number | undefined {
  const requested = requestedCasts(build, abilities, effects);
  const own = requested.find((c) => c.ability.kind === kind);
  const context = energyContext(build, requested, energy);
  if (!own || !context) return undefined;
  return nextCastMs(energyCasts(requested, context), own.ability, context);
}

// Cast times of one ability (ADR 0009: the rotation sets the casts, the energy gives the earliest
// time). All return new sorted lists inside the damage phase.

/** Adds a cast at the given time. */
export function addCast(castsMs: number[], atMs: number): number[] {
  return [...castsMs, atMs].sort((a, b) => a - b);
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
