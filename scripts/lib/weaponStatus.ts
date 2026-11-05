// The weapon status (V1): pure rules behind src/data/weapon-status.json. The numbers come from the
// engine (tests/lib/weaponStatusData.ts); here are the sentences, the trust and the computed status.

import type { Source } from "../../src/data/schema.ts";
import { itemQuotes, uncoveredSentences } from "./items/uncovered.ts";

export type SentenceState = { text: string; state: "rule" | "notModelled" | "open"; reason?: string };

/** Every sentence with a number of the texts: carried by a rule, left out with a reason, or open. */
export function sentenceStates(texts: string[], item: unknown): SentenceState[] {
  const notModelled = new Map<string, string>(
    ((item as { notModelled?: { quote: string; reason: string }[] } | null)?.notModelled ?? []).map(
      (n) => [n.quote, n.reason],
    ),
  );
  const ruleQuotes = item === null ? [] : itemQuotes(item).filter((q) => !notModelled.has(q));
  return uncoveredSentences(texts, []).map((text) => {
    if (ruleQuotes.some((q) => text.includes(q))) return { text, state: "rule" as const };
    const left = [...notModelled].find(([q]) => text.includes(q));
    if (left) return { text, state: "notModelled" as const, reason: left[1] };
    return { text, state: "open" as const };
  });
}

/** Fitted or missing values make a weapon estimated, derived or unverified ones derived. */
export function trustOf(sources: Pick<Source, "status">[]): "measured" | "derived" | "estimated" {
  const has = (...s: Source["status"][]) => sources.some((x) => s.includes(x.status));
  if (has("fitted", "missing")) return "estimated";
  if (has("derived", "unverified")) return "derived";
  return "measured";
}

export const QUANTUM_TOLERANCE = 0.02;

/** Computed: estimated beats partial beats complete; complete needs Quantum within 2 %. */
export function statusOf(parts: {
  open: number;
  quoteDeviation: number | null;
  estimated: boolean;
}): "complete" | "partial" | "estimated" {
  if (parts.estimated) return "estimated";
  if (
    parts.open > 0 ||
    parts.quoteDeviation === null ||
    Math.abs(parts.quoteDeviation) > QUANTUM_TOLERANCE
  ) {
    return "partial";
  }
  return "complete";
}

/** The first open block of the plan (`- [ ] M3 ...`) that names the weapon, e.g. "M3". */
export function planBlockOf(name: string, plan: string): string | null {
  for (const line of plan.split("\n")) {
    const m = /^- \[ \] (\S+)/.exec(line);
    if (m && line.includes(name)) return m[1];
  }
  return null;
}
