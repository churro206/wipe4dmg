// The weapon status (V1): pure rules behind src/data/weapon-status.json. The numbers come from the
// engine (tests/lib/weaponStatusData.ts); here are the sentences, the trust and the computed status.

import type { Source, WeaponStatusFile } from "../../src/data/schema.ts";
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

/** Computed: estimated beats partial beats complete; complete needs Quantum within the limit (status-limits.json). */
export function statusOf(parts: {
  open: number;
  quoteDeviation: number | null;
  estimated: boolean;
  tolerance: number;
}): "complete" | "partial" | "estimated" {
  if (parts.estimated) return "estimated";
  if (parts.open > 0 || parts.quoteDeviation === null || Math.abs(parts.quoteDeviation) > parts.tolerance) {
    return "partial";
  }
  return "complete";
}

/** The target of a checklist line: everything before "Gate:" (no Gate, no Wiederherstellen). */
const targetOf = (line: string): string => line.split("Gate:")[0];

/** Whole-word, case-sensitive occurrence of a name in a text. */
function mentions(text: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`).test(text);
}

/** The first open block of the plan (`- [ ] M3 ...`) that names the weapon in its target, e.g. "M3". */
export function planBlockOf(name: string, plan: string): string | null {
  for (const line of plan.split("\n")) {
    const m = /^- \[ \] (\S+)/.exec(line);
    if (m && mentions(targetOf(line), name)) return m[1];
  }
  return null;
}

/** The weapons (of `names`) that a block line names in its target. */
export function namedWeapons(line: string, names: string[]): string[] {
  const target = targetOf(line);
  return names.filter((name) => mentions(target, name));
}

/** The lines of the section "## Quantum-Abweichungen" of known-inaccuracies.md; only they explain a deviation. */
function quantumSection(inaccuracies: string): string[] {
  const lines = inaccuracies.split("\n");
  const start = lines.findIndex((l) => /^##\s+Quantum-Abweichungen\b/.test(l));
  if (start < 0) return [];
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end);
}

export type StatusRow = Pick<WeaponStatusFile["weapons"][number], "name" | "sentences" | "quantum">;

/**
 * The check of `npm run blocks` after the gates: the weapons the block's target names, against the
 * weapon status. Red: no row, open sentences, Quantum off by more than `tolerance`. A deviation that a
 * line in the section "Quantum-Abweichungen" of known-inaccuracies names the weapon in is only reported.
 */
export function blockWeaponProblems(
  line: string,
  rows: StatusRow[],
  knownNames: string[],
  inaccuracies: string,
  tolerance: number,
): { problems: string[]; reported: string[] } {
  const problems: string[] = [];
  const reported: string[] = [];
  const names = [...new Set([...knownNames, ...rows.map((r) => r.name)])];
  for (const name of namedWeapons(line, names)) {
    const row = rows.find((r) => r.name === name);
    if (!row) {
      problems.push(`${name}: named by the block, but has no row in src/data/weapon-status.json.`);
      continue;
    }
    const open = row.sentences.filter((s) => s.state === "open").length;
    if (open > 0) problems.push(`${name}: ${open} open sentence${open === 1 ? "" : "s"} (state "open").`);
    const deviation = row.quantum?.deviation;
    if (deviation !== undefined && Math.abs(deviation) > tolerance) {
      const text = `${name}: ${deviation > 0 ? "+" : ""}${(deviation * 100).toFixed(1)} % against Quantum (limit ${tolerance * 100} %).`;
      if (quantumSection(inaccuracies).some((l) => mentions(l, name))) {
        reported.push(`${text} Explained in docs/known-inaccuracies.md.`);
      } else {
        problems.push(text);
      }
    }
  }
  return { problems, reported };
}
