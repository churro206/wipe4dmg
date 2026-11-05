// The timeline of an expanded row of the weapon table (V3): the simulation of the bare weapon and the
// magazines it fires.

import type { SimulationResult } from "../engine/core/types";

/**
 * Shots per magazine: a magazine ends at a reload or at a refill that lets the weapon go on (Vex
 * Mythoclast: 25, 20, 16, 13, 11, 9, 8). The last entry is the magazine the phase ended in.
 */
export function magazineChain(result: Pick<SimulationResult, "shots" | "reloadsMs" | "refillsMs">): number[] {
  const ends = [...result.reloadsMs, ...result.refillsMs].sort((a, b) => a - b);
  const chain: number[] = [];
  let from = 0;
  for (const end of ends) {
    let n = 0;
    while (from + n < result.shots.length && result.shots[from + n].timeMs <= end) n++;
    if (n > 0) chain.push(n);
    from += n;
  }
  if (from < result.shots.length) chain.push(result.shots.length - from);
  return chain;
}
