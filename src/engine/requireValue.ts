import type { SourcedNumber } from "../data/schema";

/** Returns the value, or throws if it is missing (ADR 0002: never compute with guessed values). */
export function requireValue(sourced: SourcedNumber, field: string): number {
  if (sourced.value === null) {
    throw new Error(`${field} is missing (status "${sourced.source.status}")`);
  }
  return sourced.value;
}
