// Formats the review table docs/aegis-coverage.md (block C): a verdict for every Aegis row.
// tests/aegisCoverage.test.ts compares it with the file; npm run coverage rewrites the file.

import {
  countVerdicts,
  missingKeys,
  type AegisTab,
  type CoverageRow,
  type Verdict,
} from "../lib/aegisCoverage";

const TABS: { tab: AegisTab; title: string }[] = [
  { tab: "weapons", title: "Weapons" },
  { tab: "sustained", title: "Sustained" },
  { tab: "swap", title: "Swap" },
];
const VERDICT: Record<Verdict, string> = {
  model: "im Modell",
  skipped: "übersprungen",
  missing: "fehlt",
};
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function aegisCoverageMarkdown(rows: CoverageRow[]): string {
  const counts = countVerdicts(rows);
  const lines = [
    "# Abdeckung der Aegis-Zeilen",
    "",
    "Generiert von `npm run coverage` (`tests/lib/aegisCoverage.ts`), nicht von Hand bearbeiten. Jede Zeile der Reiter Weapons, Sustained und Swap hat ein Urteil:",
    "**im Modell** (Zeile genutzt oder geprüft, oder das Item steckt mit allen Annahmen im Modell), **übersprungen** (mit Grund) oder **fehlt** (Item oder Annahme nicht im Modell). Legendary Frames sind übersprungen (Inhaber, 2026-10-25).",
    "",
    "## Übersicht",
    "",
    "| Reiter | Zeilen | im Modell | übersprungen | fehlt |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...counts.map(
      (c) =>
        `| ${TABS.find((t) => t.tab === c.tab)!.title} | ${c.total} | ${c.model} | ${c.skipped} | ${c.missing} |`,
    ),
    "",
    "## Was fehlt",
    "",
    "Item oder Annahme, mit der Zahl der Zeilen, die sie nennen. Das ist die Arbeitsliste für die nächsten Kategorie-Blöcke (Schwelle: `CLAUDE.md`, „Breite vor Genauigkeit“).",
    "",
    ...missingKeys(rows).map(([key, n]) => `- ${key}: ${n}`),
  ];
  for (const { tab, title } of TABS) {
    lines.push("", `## ${title}`, "", "| Zeile | Urteil | Detail |", "| --- | --- | --- |");
    for (const row of rows.filter((r) => r.tab === tab))
      lines.push(`| ${cell(row.label)} | ${VERDICT[row.verdict]} | ${cell(row.detail)} |`);
  }
  return lines.join("\n") + "\n";
}
