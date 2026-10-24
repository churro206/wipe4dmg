// Formats the review table docs/aegis-coverage.md (block C): a verdict for every Aegis row.
// tests/aegisCoverage.test.ts compares it with the file; npm run coverage rewrites the file.

import {
  countVerdicts,
  type AegisTab,
  type CoverageRow,
  type Verdict,
} from "../lib/aegisCoverage";
import type { ImpactVerdict, KeyImpact } from "../lib/missingImpact";

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
const IMPACT: Record<ImpactVerdict, string> = {
  above: "über Schwelle",
  below: "unter Schwelle",
  item: "Item fehlt",
  noPair: "kein Paar, Wert aus Text",
  playstyle: "Spielweise oder Notiz",
};
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
/** The ratio of the pair with the largest effect, as "+30,0 %". */
const signedImpact = (impact: KeyImpact) => {
  if (impact.impact === null) return "";
  const ratio = impact.pairs.reduce((a, b) =>
    Math.abs(b.ratio - 1) > Math.abs(a.ratio - 1) ? b : a,
  ).ratio;
  const percent = ((ratio - 1) * 100).toFixed(1).replace(".", ",");
  return `${ratio >= 1 ? "+" : ""}${percent} %`;
};

export function aegisCoverageMarkdown(rows: CoverageRow[], impacts: KeyImpact[]): string {
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
    "Item oder Annahme, mit der Zahl der Zeilen, die sie nennen, und der Wirkung (`tests/lib/missingImpact.ts`). Die Wirkung kommt aus zwei Aegis-Zeilen desselben Items im selben Reiter, die sich nur um den Eintrag unterscheiden (größte Abweichung aller Paare); sie gilt für das Item, ist also eine Obergrenze für einen Build. Schwelle 2 % (`CLAUDE.md`, „Breite vor Genauigkeit“). Das ist die Arbeitsliste für die nächsten Kategorie-Blöcke.",
    "",
    "| Eintrag | Zeilen | Urteil | Wirkung | Paare |",
    "| --- | ---: | --- | ---: | ---: |",
    ...impacts.map(
      (i) =>
        `| ${cell(i.key)} | ${i.rows} | ${IMPACT[i.verdict]} | ${signedImpact(i)} | ${i.pairs.length || ""} |`,
    ),
  ];
  for (const { tab, title } of TABS) {
    lines.push("", `## ${title}`, "", "| Zeile | Urteil | Detail |", "| --- | --- | --- |");
    for (const row of rows.filter((r) => r.tab === tab))
      lines.push(`| ${cell(row.label)} | ${VERDICT[row.verdict]} | ${cell(row.detail)} |`);
  }
  return lines.join("\n") + "\n";
}
