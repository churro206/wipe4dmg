// Scale of a damage value (ADR 0015, point 7): it follows from the source the value comes from.
// The engine does not convert yet; the bridge between scales comes with the keywords (U4).

import type { DamageScale, SourcedNumber } from "../data/schema.ts";

const SCALE_BY_SOURCE: [prefix: string, scale: DamageScale][] = [
  ["Aegis", "aegisVisual"],
  ["Quantum", "quantum"],
  ["Destiny Data Compendium", "compendium"],
];

/** An item's expression names its sources in order of their references (scripts/lib/items/refs.ts). */
const EXPRESSION = "Expression over ";

/**
 * The scale of a damage value, or undefined if its source has no known scale. An expression takes
 * the scale of its first source: the damage stands first, counts and factors follow.
 */
export function damageScaleOf(value: SourcedNumber): DamageScale | undefined {
  const name = value.source.name.startsWith(EXPRESSION)
    ? value.source.name.slice(EXPRESSION.length)
    : value.source.name;
  return SCALE_BY_SOURCE.find(([prefix]) => name.startsWith(prefix))?.[1];
}
