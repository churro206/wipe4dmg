// The weapon status (V1): pure rules behind src/data/weapon-status.json. The numbers come from the
// engine (tests/lib/weaponStatusData.ts); here are the sentences, the trust and the computed status.

import type {
  QuantumWeaponRow,
  Source,
  WeaponCauseClass,
  WeaponFactors,
  WeaponStatusFile,
} from "../../src/data/schema.ts";
import { itemQuotes, uncoveredSentences } from "./items/uncovered.ts";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type QuantumBasis = "total" | "magazine";

/** What a row can be compared by: all ammo, or one magazine where the ammo is unlimited. */
function basisOf(row: QuantumWeaponRow): QuantumBasis | null {
  if (row.totalDamage !== null && row.totalShots) return "total";
  if (row.magDamage !== null && row.magazine) return "magazine";
  return null;
}

/**
 * The Quantum row a weapon is compared with: the row its item names (`quantumCheck`), else the row its
 * timing comes from, else the first row without a variant. Never the row with the closest number.
 */
export function quantumRowFor(
  rows: QuantumWeaponRow[],
  name: string,
  item: unknown,
): { row: QuantumWeaponRow; basis: QuantumBasis } | null {
  const usable = (row: QuantumWeaponRow | undefined) => {
    const basis = row ? basisOf(row) : null;
    return row && basis ? { row, basis } : null;
  };
  const named = (item as { quantumCheck?: { row: string } } | null)?.quantumCheck?.row;
  if (named) {
    const found = usable(rows.find((r) => r.id === named));
    if (!found) throw new Error(`quantumCheck of ${name}: no usable Quantum row "${named}"`);
    return found;
  }
  const timing = /\$quantum\[([^\]]+)\]\.timing\.totalShots/.exec(JSON.stringify(item ?? null))?.[1];
  const fromTiming = usable(rows.find((r) => r.id === timing));
  if (fromTiming) return fromTiming;
  return usable(rows.find((r) => norm(r.name) === norm(name) && r.variant === "" && basisOf(r))) ?? null;
}

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

/** A row that says it leaves something out of the weapon: "w/o weaken", "base damage, no buffs". */
export const isStrippedRow = (row: Pick<QuantumWeaponRow, "variant">): boolean =>
  /no buffs|w\/o|without/i.test(row.variant);

/** A row of Quantum with "cata" in its variant: the model runs without the catalyst. */
export const isCatalystRow = (row: Pick<QuantumWeaponRow, "variant">): boolean => /\bcata\b/i.test(row.variant);

export type FactorInput = {
  measured: number; // the total of the row
  rowShots: number; // shots the row counts over that total
  rowDamages: number[]; // its damage values: precision, body
  modelShots: number;
  modelHits: number; // hits of the main part, the one that lands first
  modelDamage: number; // the first of them
  modelTotal: number;
};

/**
 * Total = shots × hits per shot × damage per hit × mechanic, each factor model / row (Plan W).
 * The damage value of the row is the one that gives whole hits per shot; without one, the one the model
 * reads, and what remains of the row is its mechanic. The product of the factors is model / measured.
 */
export function factorsOf(input: FactorInput, tolerance: number): WeaponFactors | null {
  const { measured, rowDamages, modelShots, modelHits, modelDamage, modelTotal } = input;
  if (rowDamages.length === 0 || modelHits === 0 || modelShots === 0 || input.rowShots === 0) return null;
  const nearest = (values: number[]) =>
    values.reduce((a, b) => (Math.abs(b - modelDamage) < Math.abs(a - modelDamage) ? b : a));
  const perShot = (damage: number) => measured / (damage * input.rowShots);
  const whole = (x: number) => x >= 1 - tolerance && Math.abs(x / Math.round(x) - 1) <= tolerance;
  // Several hits only of the value the model reads: 28 × 2.03 on Tommy's Matchbook is chance, not two hits
  const read = nearest(rowDamages);
  const fitting = rowDamages.filter((d) => whole(perShot(d)) && (d === read || Math.round(perShot(d)) === 1));
  const rowDamage = fitting.includes(read) ? read : (fitting[0] ?? read);

  // A row that counts ammo, not what lands: several of its shots make one hit (Choir of One)
  const counted = whole(1 / perShot(rowDamage)) && perShot(rowDamage) < 1;
  const rowShots = counted ? input.rowShots * perShot(rowDamage) : input.rowShots;
  const rowPerShot = measured / (rowDamage * rowShots);
  const rowHitsPerShot = whole(rowPerShot) ? Math.round(rowPerShot) : 1;
  return {
    shots: modelShots / rowShots,
    hitsPerShot: modelHits / modelShots / rowHitsPerShot,
    damagePerHit: modelDamage / rowDamage,
    // What neither side counts as a hit; the rounding of whole hits stays here, so the product is model / measured
    mechanic: (modelTotal / (modelHits * modelDamage)) * (rowHitsPerShot / rowPerShot),
    rowPlain: rowHitsPerShot === 1 && whole(rowPerShot),
  };
}

export type CauseInput = {
  quantum: {
    deviation: number;
    circular: boolean;
    strippedRow: boolean;
    factors: WeaponFactors | null;
  } | null;
  aegis: { row: string; deviation: number; assumptions: string[] }[];
  open: number; // sentences with a number that neither a rule nor notModelled carries
  ruleShares: { id: string; share: number }[];
  tolerance: number;
};

const times = (x: number) => `×${x.toFixed(2)}`;
const signed = (x: number) => `${x > 0 ? "+" : ""}${(x * 100).toFixed(1)} %`;

/** The largest factor of the Quantum comparison names the error. */
function factorCause(deviation: number, factors: WeaponFactors | null): WeaponStatusFile["weapons"][number]["cause"] {
  const mechanicClass: WeaponCauseClass = deviation > 0 ? "rule-too-strong" : "mechanic-missing";
  if (!factors) return { class: mechanicClass, why: `${signed(deviation)} against Quantum; the row has no damage value to split it by.` };
  const parts = [
    { key: "shots", label: "Shots", value: factors.shots, cls: "counting" },
    { key: "hits", label: "Hits per shot", value: factors.hitsPerShot, cls: "counting" },
    { key: "damage", label: "Damage per hit", value: factors.damagePerHit, cls: "base-damage" },
    { key: "mechanic", label: "Everything on top of the hits", value: factors.mechanic, cls: factors.mechanic > 1 ? "rule-too-strong" : "mechanic-missing" },
  ] as const;
  const largest = parts.reduce((a, b) => (Math.abs(Math.log(b.value)) > Math.abs(Math.log(a.value)) ? b : a));
  return { class: largest.cls, why: `${largest.label} ${times(largest.value)} against the Quantum row.` };
}

/**
 * The one class of a weapon (table in Plan W, docs/plans/ground-up-model.md): compares Quantum and Aegis,
 * then the factors and the rule shares. Reports a cause; it does not excuse a deviation.
 */
export function causeOf(e: CauseInput): WeaponStatusFile["weapons"][number]["cause"] {
  const off = (x: number) => Math.abs(x) > e.tolerance;
  const worst = e.aegis.length === 0
    ? null
    : e.aegis.reduce((a, b) => (Math.abs(b.deviation) > Math.abs(a.deviation) ? b : a));
  const q = e.quantum;

  if (q && off(q.deviation)) {
    if (q.strippedRow && q.deviation > 0) {
      return { class: "wrong-row", why: `${signed(q.deviation)} against a Quantum row that leaves out what the model carries.` };
    }
    if (worst && !off(worst.deviation)) {
      return { class: "wrong-row", why: `${signed(q.deviation)} against Quantum, but Aegis agrees: this row does not hold what is modelled.` };
    }
    if (worst && Math.sign(worst.deviation) !== Math.sign(q.deviation)) {
      return q.factors?.rowPlain
        ? { class: "wrong-row", why: `The Quantum row is the bare weapon (${signed(q.deviation)}), Aegis says the opposite (${signed(worst.deviation)}).` }
        : { class: "source-conflict", why: `Quantum ${signed(q.deviation)}, Aegis ${signed(worst.deviation)}: only a test in game can tell.` };
    }
    return factorCause(q.deviation, q.factors);
  }

  const baseOnly = q?.circular && e.open > 0;
  const readsQuantum = { class: "reads-quantum", why: `Damage and count come from the row it is compared with; ${e.open} sentences with numbers are still open.` } as const;
  if (!worst) {
    if (!q) return { class: "no-check", why: "Neither a Quantum row nor an independent Aegis row." };
    return baseOnly ? readsQuantum : { class: "ok", why: `${signed(q.deviation)} against Quantum, no Aegis row.` };
  }
  if (!off(worst.deviation)) {
    return baseOnly ? readsQuantum : { class: "ok", why: `Within the limit: Aegis ${signed(worst.deviation)}.` };
  }
  const row = `"${worst.row}"`;
  if (q && worst.assumptions.length === 0) {
    return { class: "source-conflict", why: `Quantum fits, Aegis ${signed(worst.deviation)} without any assumption (${row}).` };
  }
  if (worst.deviation < 0) {
    return { class: "mechanic-missing", why: `Aegis ${signed(worst.deviation)} with ${worst.assumptions.join(", ") || "no assumption"}.` };
  }
  if (e.aegis.some((a) => !off(a.deviation))) {
    return { class: "wrong-row", why: `Another Aegis row fits, ${row} is ${signed(worst.deviation)}: it measures something else than the model.` };
  }
  const excess = worst.deviation / (1 + worst.deviation);
  const largest = e.ruleShares.reduce<{ id: string; share: number } | null>((a, b) => (a === null || b.share > a.share ? b : a), null);
  if (largest && largest.share >= excess) {
    return { class: "rule-too-strong", why: `Aegis ${signed(worst.deviation)}; rule "${largest.id}" carries ${(largest.share * 100).toFixed(0)} % of the total.` };
  }
  return q
    ? { class: "source-conflict", why: `Quantum fits, Aegis ${signed(worst.deviation)} and no rule that large (${row}).` }
    : { class: "wrong-row", why: `Aegis ${signed(worst.deviation)} with no rule that large: ${row} measures something else than the model.` };
}

/** The target of a checklist line: everything before "Gate:" (no Gate, no Wiederherstellen). */
const targetOf = (line: string): string => line.split("Gate:")[0];

/** Whole-word, case-sensitive occurrence of a name in a text. */
function mentions(text: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`).test(text);
}

/** The first open block of the plan (`- [ ] W3 ...`) that names the weapon in its target, e.g. "W3". */
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

/** The checklist line of a block in docs/plans/current.md, without the checkbox; open or ticked off. */
export function blockLine(plan: string, id: string): string | undefined {
  for (const raw of plan.split("\n")) {
    const match = /^- \[[ x]\] (\S+)/.exec(raw);
    if (match?.[1] === id) return raw.slice(6).trim();
  }
  return undefined;
}

/**
 * The check of `npm run check:block` after the gates: the weapons the block's target names, against the
 * weapon status. Red: no row, open sentences, Quantum off by more than `tolerance`. A deviation that a
 * line in the section "Quantum-Abweichungen" of known-inaccuracies names the weapon in is only reported.
 * It applies to the blocks that bring weapons in: W1 to W4 (and the old M names).
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
  // Only these blocks bring weapons in. Other lines (W5, the balance) list weapons that they only decide on.
  if (!/^(M\S*|W[1-4]\b)/.test(line)) return { problems, reported };
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
