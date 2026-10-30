// Layer 1 of the core (ADR 0017): a damage instance becomes a number. Base value × the factors of
// the buckets (buckets.json), the stat and the held draw. No state, no time.

import { productOf, type Factors } from "../effectParts";

/** Damage of one instance: the base value times the product of all factors. */
export function damageOf(base: number, factors: Factors): number {
  return base * productOf(factors);
}
