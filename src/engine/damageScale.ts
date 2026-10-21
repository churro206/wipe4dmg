// Scale of a damage value (ADR 0015, point 7): it follows from the source the value comes from.
// The engine does not convert yet; the bridge between scales comes with the keywords (U4).

import type { DamageScale, SourcedNumber } from "../data/schema";

const SCALE_BY_SOURCE: [prefix: string, scale: DamageScale][] = [
  ["Aegis", "aegisVisual"],
  ["Quantum", "quantum"],
  ["Destiny Data Compendium", "compendium"],
];

/** The scale of a damage value, or undefined if its source has no known scale. */
export function damageScaleOf(value: SourcedNumber): DamageScale | undefined {
  return SCALE_BY_SOURCE.find(([prefix]) =>
    value.source.name.startsWith(prefix),
  )?.[1];
}
