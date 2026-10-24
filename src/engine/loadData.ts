import {
  AbilityStatScaling,
  WeaponStatScaling,
  AegisAbilityRow,
  Boss,
  Bucket,
  Effect,
  IconIndex,
  ManifestAbilities,
  type ManifestAbility,
  SubclassEffect,
} from "../data/schema";

/** Validates the raw buckets Data File. Throws if it does not match the schema. */
export function loadBuckets(raw: unknown): Bucket[] {
  return Bucket.array().parse(raw);
}

/** Validates the raw effects Data File. Throws if it does not match the schema. */
export function loadEffects(raw: unknown): Effect[] {
  return Effect.array().parse(raw);
}

/**
 * Effects of the aspects and fragments (subclass-effects.json, ADR 0015 U6-2); prebuilt ones, e.g.
 * Volatile Rounds after kills, only with the option.
 */
export function loadSubclassEffects(
  raw: unknown,
  { preBuilt = false }: { preBuilt?: boolean } = {},
): Effect[] {
  return SubclassEffect.array()
    .parse(raw)
    .filter((e) => e.activation === "always" || preBuilt)
    .map((e) => e.effect);
}

/** Validates the raw bosses Data File. Throws if it does not match the schema. */
export function loadBosses(raw: unknown): Boss[] {
  return Boss.array().parse(raw);
}

/** Validates the icon index written by the icon import (ADR 0008). */
export function loadIconIndex(raw: unknown): IconIndex {
  return IconIndex.parse(raw);
}

/** Validates the raw ability stats Data File (ADR 0009). */
export function loadAbilityStats(raw: unknown): AbilityStatScaling[] {
  return AbilityStatScaling.array().parse(raw);
}

/** Validates the raw Weapons stat Data File. */
export function loadWeaponStats(raw: unknown): WeaponStatScaling[] {
  return WeaponStatScaling.array().parse(raw);
}

/** Validates the Aegis abilities Data File (ADR 0009). */
export function loadAegisAbilityRows(raw: unknown): AegisAbilityRow[] {
  return AegisAbilityRow.array().parse(raw);
}

/** Validates the manifest abilities Data File and returns its ability items (ADR 0008). */
export function loadManifestAbilities(raw: unknown): ManifestAbility[] {
  return ManifestAbilities.parse(raw).abilities;
}
