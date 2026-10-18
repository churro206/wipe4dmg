import { Boss, Bucket, Effect, IconIndex } from "../data/schema";

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
