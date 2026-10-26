// Extended meta probe: all Aegis rows of exotic weapons (Sustained) and supers (Swap), made by rule
// (scripts/lib/probeAuto.ts) instead of by hand. Reference is the median of the hand-made entries
// (tests/metaProbe.test.ts). Rows whose assumptions we all have as switches are gated: outside the
// tolerance, a row must be listed in tests/fixtures/meta-probe-auto.json with its reason. Rows with
// an assumption without switch are only reported; their list of missing switches is the work list.
// Table: npm run probe (writes docs/meta-probe-auto.md)

import { describe, expect, it } from "vitest";
import { AegisTotalsSnapshot } from "../src/data/schema";
import rawTotals from "../src/data/aegis-totals.json";
import { abilities, artifactData, effects, exoticArmor, weapons } from "../src/ui/data";
import auto from "./fixtures/meta-probe-auto.json";
import probe from "./fixtures/meta-probe.json";
import { aegisTotal, ourTotal, type Entry } from "./lib/probe";
import { autoEntries, type AutoEntry } from "../scripts/lib/probeAuto";

const TOLERANCE = 0.15;

const { rows } = AegisTotalsSnapshot.parse(rawTotals);
type AegisRow = (typeof rows)[number];
const manual = probe.entries as Entry[];
const deviations: Record<string, string> = auto.deviations;

const ratioOf = <E extends Entry>(entry: E) => {
  const { row, total } = aegisTotal(rows, entry);
  const ours = ourTotal(entry);
  return { entry, row, aegis: total, ours, ratio: ours / total };
};
const manualRatios = manual.map((e) => ratioOf(e).ratio).sort((a, b) => a - b);
const median = manualRatios[Math.floor(manualRatios.length / 2)];

const { entries, skipped } = autoEntries(rows, {
  weapons,
  abilities,
  effects,
  exoticArmor,
  artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
  ignored: auto.ignored,
  covered: new Set(manual.map((e) => e.aegisId)),
});
const all = entries.map((e: AutoEntry) => ratioOf(e));
const gated = all.filter((r) => r.entry.unmapped.length === 0);
const reported = all.filter((r) => r.entry.unmapped.length > 0);
const relative = (r: { ratio: number }) => r.ratio / median;
const outside = (r: { ratio: number }) =>
  Math.abs(relative(r) - 1) > TOLERANCE;

const fmt = (x: number) => Math.round(x).toLocaleString("en-US");
const label = (r: AegisRow) => [r.name, ...r.assumptions].join(", ");
const byRatio = (a: { ratio: number }, b: { ratio: number }) =>
  relative(a) - relative(b);

// How many rows an assumption without switch is part of: the list of missing switches.
const missing = new Map<string, number>();
for (const r of reported) {
  for (const a of r.entry.unmapped) missing.set(a, (missing.get(a) ?? 0) + 1);
}
const insideOf = (list: typeof all) => list.filter((r) => !outside(r)).length;

const table = [
  "# Gesamtprobe nach Regel (generiert)",
  "",
  `Erzeugt mit \`npm run probe\` (\`tests/metaProbeAuto.test.ts\`, Regel in \`scripts/lib/probeAuto.ts\`). Alle Aegis-Zeilen mit exotischer Waffe (Tab Sustained) oder Super (Tab Swap). Bezug ist der Median der handgebauten Zeilen (\`docs/meta-probe.md\`): ${median.toFixed(3)}. Grenze ±${TOLERANCE * 100} %.`,
  "",
  `Vollständig abgebildet (geprüft): ${gated.length}, davon innerhalb der Grenze ${insideOf(gated)}. Abweichungen stehen mit Grund in \`tests/fixtures/meta-probe-auto.json\` und blockieren nichts. Mit Annahme ohne Schalter (nur berichtet): ${reported.length}, davon innerhalb der Grenze ${insideOf(reported)}. Nicht vergleichbar (übersprungen): ${skipped.length}.`,
  "",
  "## Vollständig abgebildet",
  "",
  "| Aegis-Zeile | Aegis | Modell | relativ | Grund der Abweichung |",
  "| --- | ---: | ---: | ---: | --- |",
  ...gated
    .sort(byRatio)
    .map(
      (r) =>
        `| ${label(r.row)} | ${fmt(r.aegis)} | ${fmt(r.ours)} | ${relative(r).toFixed(3)} | ${deviations[r.entry.aegisId] ?? ""} |`,
    ),
  "",
  "## Annahme ohne Schalter",
  "",
  "| Aegis-Zeile | Aegis | Modell | relativ | ohne Schalter |",
  "| --- | ---: | ---: | ---: | --- |",
  ...reported
    .sort(byRatio)
    .map(
      (r) =>
        `| ${r.row.name} | ${fmt(r.aegis)} | ${fmt(r.ours)} | ${relative(r).toFixed(3)} | ${r.entry.unmapped.join("; ")} |`,
    ),
  "",
  "## Fehlende Schalter",
  "",
  "Annahme von Aegis ohne Schalter, mit der Zahl der berichteten Zeilen, die sie enthalten.",
  "",
  ...[...missing.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([a, n]) => `- ${a}: ${n}`),
  "",
  "## Übersprungen",
  "",
  ...skipped.map((s) => `- ${label(s.row)}: ${s.reason}`),
  "",
].join("\n");

describe("meta probe by rule", () => {
  it("writes the table docs/meta-probe-auto.md", async () => {
    await expect(table).toMatchFileSnapshot("../docs/meta-probe-auto.md");
  });

  it.each(gated.map((r) => [r.entry.aegisId, r] as const))(
    "%s lies within the tolerance or is a known deviation",
    (id, r) => {
      if (outside(r)) {
        expect(
          deviations[id],
          `outside the tolerance: ${relative(r).toFixed(3)}`,
        ).toBeDefined();
      } else {
        expect(
          deviations[id],
          "listed as deviation but inside the tolerance",
        ).toBeUndefined();
      }
    },
  );
});
