// Meta probe (block 5): builds that rebuild rows of the Aegis tabs "Sustained" and "Swap", run
// through buildSimulation like the UI. Differences between builds must be right, absolute numbers
// need not: each ratio "ours ÷ Aegis" must lie near the median of all ratios.
// Table: npm run probe (writes docs/meta-probe.md). Rows made by rule: tests/metaProbeAuto.test.ts.

import { describe, expect, it } from "vitest";
import { AegisTotalsSnapshot } from "../src/data/schema";
import rawTotals from "../src/data/aegis-totals.json";
import probe from "./fixtures/meta-probe.json";
import { aegisTotal, ourTotal, type Entry } from "./lib/probe";

const TOLERANCE = 0.15;

const { rows } = AegisTotalsSnapshot.parse(rawTotals);
const entries = probe.entries as Entry[];

const results = entries.map((entry) => {
  const { row, total } = aegisTotal(rows, entry);
  const ours = ourTotal(entry);
  return { entry, row, aegis: total, ours, ratio: ours / total };
});
const sortedRatios = results.map((r) => r.ratio).sort((a, b) => a - b);
const median = sortedRatios[Math.floor(sortedRatios.length / 2)];

const fmt = (x: number) => Math.round(x).toLocaleString("en-US");
const table = [
  "# Gesamtprobe mit Aegis (generiert)",
  "",
  "Erzeugt mit `npm run probe` aus `tests/fixtures/meta-probe.json` und `src/data/aegis-totals.json` (`npm run import:totals`). Quotient = unser Total ÷ Aegis-Total (ohne die herausgerechneten Faktoren); relativ = Quotient ÷ Median. Grenze ±" +
    TOLERANCE * 100 +
    " %. Die Zeilen nach Regel stehen in `docs/meta-probe-auto.md`.",
  "",
  `Median: ${median.toFixed(3)}`,
  "",
  "| Aegis-Zeile | Aegis | Modell | Quotient | relativ | herausgerechnet |",
  "| --- | ---: | ---: | ---: | ---: | --- |",
  ...results.map(
    (r) =>
      `| ${[r.row.name, ...r.row.assumptions].join(", ")} | ${fmt(r.aegis)} | ${fmt(r.ours)} | ${r.ratio.toFixed(3)} | ${(r.ratio / median).toFixed(3)} | ${(r.entry.removed ?? []).map((x) => x.reason).join("; ")} |`,
  ),
  "",
  "## Übersprungen",
  "",
  ...probe.skipped.map((s) => `- ${s.aegis}: ${s.reason}`),
  "",
].join("\n");

describe("meta probe against Aegis", () => {
  it("writes the table docs/meta-probe.md", async () => {
    await expect(table).toMatchFileSnapshot("../docs/meta-probe.md");
  });

  it.each(results.map((r) => [r.entry.aegisId, r] as const))(
    "%s lies within the tolerance of the median",
    (_, r) => {
      expect(Math.abs(r.ratio / median - 1)).toBeLessThanOrEqual(TOLERANCE);
    },
  );
});
