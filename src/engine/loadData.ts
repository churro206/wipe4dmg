import {
  AbilityStatScaling,
  AegisAbilityRow,
  Boss,
  Bucket,
  Effect,
  IconIndex,
  ManifestAbilities,
  type ManifestAbility,
} from "../data/schema";

/** Validates the raw buckets Data File. Throws if it does not match the schema. */
export function loadBuckets(raw: unknown): Bucket[] {
  return Bucket.array().parse(raw);
}

/** Validates the raw effects Data File. Throws if it does not match the schema. */
export function loadEffects(raw: unknown): Effect[] {
  return Effect.array().parse(raw);
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

/** Validates the Aegis abilities Data File (ADR 0009). */
export function loadAegisAbilityRows(raw: unknown): AegisAbilityRow[] {
  return AegisAbilityRow.array().parse(raw);
}

/** Validates the manifest abilities Data File and returns its ability items (ADR 0008). */
export function loadManifestAbilities(raw: unknown): ManifestAbility[] {
  return ManifestAbilities.parse(raw).abilities;
}
