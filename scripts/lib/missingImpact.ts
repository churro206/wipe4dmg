// Rule of block D (impact of what is missing): every missing key of the coverage (scripts/lib/aegisCoverage.ts)
// gets the effect Aegis measures for it.
//   above   two rows of the same item in the same tab differ only by the key; their totals differ by at
//           least the threshold (the larger effect of all pairs counts)
//   below   the same, under the threshold: the value from the text is enough (CLAUDE.md, "Breite vor
//           Genauigkeit")
//   item    the item itself is not in the model (weapon, super, ability, own damage, variant)
//   noPair     no such pair for a named perk or buff (title case): the effect needs its text
//   playstyle  no such pair for a playstyle or a note of Aegis (lower case, e.g. "1H2L combo",
//              "excludes ..."): needs a timing model or nothing
// The ratio is the effect on the item, an upper bound of the effect on a build that uses it.

import type { AegisTab, CoverageRow } from "./aegisCoverage.ts";
import { missingKeys } from "./aegisCoverage.ts";

export type MeasuredRow = {
  tab: AegisTab;
  id: string;
  name: string;
  assumptions: string[];
  total: number | null; // Weapons: the wipe of the test; Sustained and Swap: the total
};
export type Pair = { tab: AegisTab; withId: string; withoutId: string; ratio: number };
export type ImpactVerdict = "above" | "below" | "item" | "noPair" | "playstyle";
export type KeyImpact = {
  key: string;
  rows: number;
  verdict: ImpactVerdict;
  impact: number | null; // largest |ratio − 1| of the pairs
  pairs: Pair[];
};

// Owner rule in CLAUDE.md: a missing mechanic matters from 2 % of the total damage of a build.
export const IMPACT_THRESHOLD = 0.02;

const ITEM_KEY = /^(weapon|super|melee|grenade|own damage|variant of|type )|\(no package\)$|^no probe entry$/;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const setKey = (assumptions: string[]) => assumptions.map(norm).sort().join("|");

export function missingImpact(coverage: CoverageRow[], measured: MeasuredRow[]): KeyImpact[] {
  const byId = new Map(measured.map((r) => [`${r.tab}/${r.id}`, r]));
  // Rows of one item, found by tab, name and assumption set.
  const bySet = new Map(
    measured.map((r) => [`${r.tab}/${norm(r.name)}/${setKey(r.assumptions)}`, r]),
  );

  const pairsOf = new Map<string, Pair[]>();
  for (const row of coverage) {
    if (row.verdict !== "missing") continue;
    const withRow = byId.get(`${row.tab}/${row.id}`);
    if (!withRow?.total) continue;
    for (const key of new Set(row.keys)) {
      const rest = withRow.assumptions.filter((a) => norm(a) !== norm(key));
      if (rest.length !== withRow.assumptions.length - 1) continue;
      const without = bySet.get(`${row.tab}/${norm(withRow.name)}/${setKey(rest)}`);
      if (!without?.total) continue;
      const pairs = pairsOf.get(key) ?? [];
      pairs.push({
        tab: row.tab,
        withId: withRow.id,
        withoutId: without.id,
        ratio: withRow.total / without.total,
      });
      pairsOf.set(key, pairs);
    }
  }

  const impacts = missingKeys(coverage).map(([key, rows]): KeyImpact => {
    const pairs = pairsOf.get(key) ?? [];
    if (pairs.length > 0) {
      const impact = Math.max(...pairs.map((p) => Math.abs(p.ratio - 1)));
      return { key, rows, pairs, impact, verdict: impact >= IMPACT_THRESHOLD ? "above" : "below" };
    }
    const verdict = ITEM_KEY.test(key) ? "item" : /^[A-Z]/.test(key) ? "noPair" : "playstyle";
    return { key, rows, pairs, impact: null, verdict };
  });
  const order: ImpactVerdict[] = ["above", "item", "noPair", "playstyle", "below"];
  return impacts.sort(
    (a, b) =>
      order.indexOf(a.verdict) - order.indexOf(b.verdict) ||
      (b.impact ?? 0) - (a.impact ?? 0) ||
      b.rows - a.rows ||
      a.key.localeCompare(b.key),
  );
}
