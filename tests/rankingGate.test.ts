// Ranking gate (docs/product.md, "Rangfolge-Gate"), measuring stage: groups the rows of the meta probe
// by what they check and writes Spearman, top hits, delta pairs and coverage per group to
// docs/ranking-gate.md. No thresholds yet; they follow once the owner has confirmed the numbers.

import { describe, expect, it } from "vitest";
import { AegisTotalsSnapshot } from "../src/data/schema";
import rawTotals from "../src/data/aegis-totals.json";
import { abilities, artifactData, effects, exoticArmor, weapons } from "../src/ui/data";
import auto from "./fixtures/meta-probe-auto.json";
import probe from "./fixtures/meta-probe.json";
import { aegisTotal, ourTotal, type Entry } from "./lib/probe";
import { autoEntries } from "../scripts/lib/probeAuto";
import { deltaPairs, spearman, topHits, type Item } from "./lib/ranking";

import deviations from "./fixtures/ranking-gate.json";

const SPEARMAN_MIN = 0.9;
const topHitDeviations: Record<string, string> = deviations.topHits;
const pairDeviations: Record<string, string> = deviations.pairs;
const MIN_ROWS = 5;
const TOP = 3;
const WITHIN = 5;
const DELTA_LIMIT = 2;

const { rows } = AegisTotalsSnapshot.parse(rawTotals);
const manual = probe.entries as Entry[];

// Column "Prüft" of the top-20 questions in docs/product.md.
const GROUPS = [
  { name: "Supers", test: (r: (typeof rows)[number]) => r.tab === "swap" && r.type === "super" },
  { name: "Heavy", test: (r: (typeof rows)[number]) => r.tab === "sustained" && r.type === "power" },
  { name: "Special", test: (r: (typeof rows)[number]) => r.tab === "sustained" && r.type === "special" },
];

const { entries: autoMade } = autoEntries(rows, {
  weapons,
  abilities,
  effects,
  exoticArmor,
  artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
  ignored: auto.ignored,
  covered: new Set(manual.map((e) => e.aegisId)),
});

const measure = (entry: Entry, mapped: boolean) => {
  const { row, total } = aegisTotal(rows, entry);
  const item: Item = {
    id: row.id,
    tab: row.tab,
    name: row.name,
    assumptions: row.assumptions,
    aegis: total,
    ours: ourTotal(entry),
  };
  return { row, item, mapped };
};
const all = [
  ...manual.map((e) => measure(e, true)),
  ...autoMade.map((e) => measure(e, e.unmapped.length === 0)),
];

const f = (x: number | null, digits = 2) => (x === null ? "–" : x.toFixed(digits));

const stats = GROUPS.map((group) => {
  const inGroup = all.filter((m) => group.test(m.row));
  const checked = inGroup.filter((m) => m.mapped).map((m) => m.item);
  const everything = inGroup.map((m) => m.item);
  const rank = (items: Item[]) =>
    items.length >= MIN_ROWS
      ? {
          rho: spearman(items.map((i) => i.aegis), items.map((i) => i.ours)),
          hits: topHits(items.map((i) => i.aegis), items.map((i) => i.ours), TOP, WITHIN),
        }
      : null;
  return {
    name: group.name,
    total: rows.filter((r) => group.test(r) && r.total !== null).length,
    checked,
    everything,
    checkedRank: rank(checked),
    allRank: rank(everything),
    pairs: deltaPairs(checked),
  };
});

const cell = (r: { rho: number | null; hits: number } | null) =>
  r ? `${f(r.rho)} | ${r.hits}/${TOP}` : "< 5 | –";

const table = [
  "# Rangfolge-Gate (generiert)",
  "",
  `Erzeugt mit \`npm run probe\` (\`tests/rankingGate.test.ts\`). Gruppen nach der Spalte „Prüft“ in \`docs/product.md\`. Spearman zwischen unserer und der Aegis-Rangfolge; Treffer = Zahl der Aegis-Top-${TOP}, die bei uns in den Top ${WITHIN} stehen; Delta-Paare = zwei Zeilen, die sich um genau eine Annahme unterscheiden (Abstand in Prozentpunkten). Ab ${MIN_ROWS} Zeilen pro Gruppe. Schwellen: Spearman ≥ ${SPEARMAN_MIN}, ${TOP} von ${TOP}, Delta ±${DELTA_LIMIT}. Abweichungen stehen mit Grund in \`tests/fixtures/ranking-gate.json\` und blockieren nichts; eine neue Abweichung macht den Test rot.`,
  "",
  "„Geprüft“ sind nur Zeilen, deren Annahmen alle einen Schalter haben; „alle“ enthält auch die Zeilen mit Annahme ohne Schalter.",
  "",
  "| Gruppe | Aegis-Zeilen | im Modell | Abdeckung | geprüft | Spearman | Treffer | alle | Spearman | Treffer |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...stats.map(
    (s) =>
      `| ${s.name} | ${s.total} | ${s.everything.length} | ${((s.everything.length / s.total) * 100).toFixed(0)} % | ${s.checked.length} | ${cell(s.checkedRank)} | ${s.everything.length} | ${cell(s.allRank)} |`,
  ),
  "",
  "## Delta-Paare (geprüfte Zeilen)",
  "",
  "| Gruppe | Zeile | zusätzliche Annahme | Aegis | Modell | Abstand | Grund der Abweichung |",
  "| --- | --- | --- | ---: | ---: | ---: | --- |",
  ...stats.flatMap((s) =>
    s.pairs
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .map(
        (p) =>
          `| ${s.name} | ${p.item} | ${p.added} | ${f(p.aegisDelta, 1)} | ${f(p.ourDelta, 1)} | ${f(p.gap, 1)} | ${pairDeviations[`${s.name}: ${p.item} + ${p.added}`] ?? ""} |`,
      ),
  ),
  "",
].join("\n");

describe("ranking gate", () => {
  it("writes the table docs/ranking-gate.md", async () => {
    await expect(table).toMatchFileSnapshot("../docs/ranking-gate.md");
  });

  describe.each(stats.map((s) => [s.name, s] as const))("%s", (name, s) => {
    it(`has a Spearman of at least ${SPEARMAN_MIN}`, () => {
      if (!s.checkedRank) return;
      expect(s.checkedRank.rho ?? 0).toBeGreaterThanOrEqual(SPEARMAN_MIN);
    });

    it(`has the Aegis top ${TOP} in our top ${WITHIN} or a known deviation`, () => {
      if (!s.checkedRank) return;
      if (s.checkedRank.hits < TOP) {
        expect(topHitDeviations[name], `hits: ${s.checkedRank.hits}/${TOP}`).toBeDefined();
      } else {
        expect(topHitDeviations[name], "listed as deviation but all hits").toBeUndefined();
      }
    });

    it.each(s.pairs.map((p) => [`${name}: ${p.item} + ${p.added}`, p] as const))(
      "%s lies within the limit or is a known deviation",
      (key, p) => {
        if (Math.abs(p.gap) > DELTA_LIMIT) {
          expect(pairDeviations[key], `gap: ${p.gap.toFixed(1)}`).toBeDefined();
        } else {
          expect(pairDeviations[key], "listed as deviation but inside the limit").toBeUndefined();
        }
      },
    );
  });

  it("lists no deviation that no longer exists", () => {
    const keys = new Set(stats.flatMap((s) => s.pairs.map((p) => `${s.name}: ${p.item} + ${p.added}`)));
    for (const key of Object.keys(pairDeviations)) expect(keys.has(key), key).toBe(true);
  });
});
