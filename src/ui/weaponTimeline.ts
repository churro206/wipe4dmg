// The timeline of an expanded row of the weapon table (V3): the simulation of the bare weapon and the
// magazines it fires.

import type { BuffWindow, SimulationResult } from "../engine/core/types";

/** "11 refills, 1 reload": the refills (a magazine that went on) and the reloads, counted apart. */
export function magazineNote(refills: number, reloads: number): string {
  const part = (n: number, word: string) => (n === 0 ? [] : [`${n} ${word}${n === 1 ? "" : "s"}`]);
  return [...part(refills, "refill"), ...part(reloads, "reload")].join(", ");
}

/**
 * One timeline row per buff and factor: its windows, cut at the end of the damage phase. A ramp buff
 * has a window per change of stacks, each labelled with its own factor, so it gets a row per step.
 */
export function buffRows(
  log: BuffWindow[],
  damagePhaseSeconds: number,
): { label: string; windows: { startMs: number; endMs: number; uptime: number }[] }[] {
  const phaseMs = damagePhaseSeconds * 1000;
  const rows = new Map<string, { label: string; windows: { startMs: number; endMs: number; uptime: number }[] }>();
  for (const w of log) {
    if (w.startMs >= phaseMs) continue;
    const percent = Math.round((w.factor - 1) * 1000) / 10;
    const label = `${w.name} ${percent >= 0 ? "+" : ""}${percent} %`;
    const key = `${w.buffId}|${label}`;
    const row = rows.get(key) ?? { label, windows: [] };
    row.windows.push({ startMs: w.startMs, endMs: Math.min(w.endMs, phaseMs), uptime: 1 });
    rows.set(key, row);
  }
  return [...rows.values()];
}

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
