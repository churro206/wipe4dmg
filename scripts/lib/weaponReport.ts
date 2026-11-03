// The report of the weapon import: its types and the review table docs/weapon-import.md (ADR 0013,
// point 11). Own file so that the package builder only fills the report and does not render it.

import type {
  AegisWeaponRow,
  CatalystEffect,
  WeaponOption,
} from "../../src/data/schema.ts";
import { assumptionName } from "./aegisWeapons.ts";
import type { Timing } from "./timing.ts";
import type { AssumptionClass, AssumptionKind } from "./weaponAssumptions.ts";

export type ReportOption = {
  rowId: string | null; // Aegis row of the option; null where Quantum or an override gives the factor
  name: string;
  kind: WeaponOption["kind"];
  factor: number;
  durationSeconds: number | null;
  condition: string | null;
  notes: string[];
};
export type ReportWeapon = {
  name: string;
  weaponType: string;
  element: string;
  ammo: string;
  status: "package" | "gap" | "item"; // item: from an item file, not built from rows (B4a)
  gapReason: string | null;
  itemFile?: string; // the item file of an item
  itemReview?: string[]; // texts of the item that changed since the file was written
  itemUncovered?: number; // sentences with a number that no $clarity or notModelled quote covers
  baseRow: AegisWeaponRow | null;
  perShot: number | null;
  magazine: number | null;
  totalShots: number | null;
  reloadSeconds: number | null;
  timeToEmptySeconds: number | null;
  timingSource: "Aegis" | "Quantum" | null;
  quantumRpm: number | null;
  derivedRpm: number | null;
  scaleDeviation: number | null;
  includedEffectIds: string[];
  options: ReportOption[];
  unusedRows: { rowId: string; assumptions: string[]; reason: string }[];
  notes: string[];
  armor: string[];
  abilityKinds: string[];
  catalystEffect?: CatalystEffect;
  catalystTiming?: Timing;
  catalystText?: string;
};
export type ReportAssumption = AssumptionClass & {
  assumption: string;
  weapon: string;
};
export type WeaponReport = {
  aegisRetrieved: string;
  quantumRetrieved: string;
  manifestVersion: string;
  weapons: ReportWeapon[];
  assumptions: ReportAssumption[];
};

const CATALYST_LABELS: Record<CatalystEffect, string> = {
  damage: "Schaden",
  timing: "Timing",
  damageAndTiming: "Schaden und Timing",
  none: "keine",
  unknown: "unbekannt",
};

export const KIND_LABELS: Record<AssumptionKind, string> = {
  execution: "Ausführung",
  intrinsic: "Intrinsic",
  catalyst: "Katalysator",
  perk: "Perk",
  weaponMod: "Mod",
  effect: "Effect",
  exoticArmor: "Exotic-Rüstung",
  artifactPerk: "Artefakt",
  foreignPerk: "fremder Perk",
  notModelled: "nicht modelliert",
};

/** A number in German notation with a fixed count of decimals. */
export const de = (n: number, digits = 0) =>
  n.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const percent = (n: number | null) =>
  n === null ? "–" : `${de(n * 100, 1)} %`;

/** The review table as Markdown (ADR 0013, point 11). */
export function renderWeaponImport(report: WeaponReport): string {
  const packages = report.weapons.filter((w) => w.status === "package");
  const gaps = report.weapons.filter((w) => w.status === "gap");
  const items = report.weapons.filter((w) => w.status === "item");
  const lines: string[] = [
    "# Waffen-Import: Prüftabelle",
    "",
    "Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.",
    "",
    `Stand: Aegis ${report.aegisRetrieved}, Quantum ${report.quantumRetrieved} (Quantum nennt keinen Patch pro Zeile), Manifest ${report.manifestVersion}.`,
    "",
    `Umfang: exotische Special- und Heavy-Waffen. **${packages.length} Pakete**, ${items.length} Items, ${gaps.length} Lücken.`,
    "",
    "## Pakete",
    "",
    "Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.",
    "",
    "| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...packages
      .map((w) =>
        [
          w.name,
          w.weaponType,
          w.element,
          cell(w.baseRow!.assumptions.join(", ") || "keine") +
            ` (${w.baseRow!.shots} ${w.baseRow!.shots === 1 ? "Shot" : "Shots"})`,
          de(w.perShot!, 1),
          w.timingSource ?? "–",
          w.totalShots,
          w.magazine,
          `${de(w.reloadSeconds!, 2)} s`,
          w.timeToEmptySeconds === null
            ? "–"
            : `${de(w.timeToEmptySeconds, 1)} s`,
          `${w.quantumRpm ?? "–"} → ${de(w.derivedRpm!, 0)}`,
          percent(w.scaleDeviation),
          cell(
            [
              ...w.notes,
              ...(w.includedEffectIds.length > 0
                ? [`eingerechnet: ${w.includedEffectIds.join(", ")}`]
                : []),
            ].join("; ") || "–",
          ),
        ].join(" | "),
      )
      .map((row) => `| ${row} |`),
    "",
    "## Items",
    "",
    "Waffen aus einer Item-Datei (B4a): Struktur von Hand, Zahlen als Verweise auf die Snapshots. **Prüfen**, wenn ein Text sich seit dem Schreiben der Datei geändert hat.",
    "",
    `Sätze mit Zahl ohne \`$clarity\`- oder \`notModelled\`-Zitat (ADR 0019): **${items.reduce((sum, w) => sum + (w.itemUncovered ?? 0), 0)}**. Die Zahl sinkt je Block.`,
    "",
    "| Waffe | Datei | Sätze ohne Regel | Prüfen |",
    "| --- | --- | ---: | --- |",
    ...items.map(
      (w) =>
        `| ${w.name} | \`${w.itemFile}\` | ${w.itemUncovered ?? 0} | ${cell((w.itemReview ?? []).join("; ") || "–")} |`,
    ),
    "",
    "## Optionen",
    "",
    "Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.",
    "",
    "| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...packages.flatMap((w) =>
      w.options.map((o) => {
        const flagged =
          o.durationSeconds !== null ||
          o.condition !== null ||
          o.notes.some((n) => n.startsWith("keine Dauer"));
        return `| ${[
          w.name,
          `${flagged ? "⚠ " : ""}${cell(o.name)}`,
          KIND_LABELS[o.kind],
          `×${de(o.factor, 3)}`,
          o.durationSeconds === null ? "–" : `${de(o.durationSeconds, 0)} s`,
          cell(o.condition ?? "–"),
          cell(o.notes.join("; ") || "–"),
        ].join(" | ")} |`;
      }),
    ),
    "",
    "## Katalysatoren",
    "",
    "Was der Katalysator gegen einen Boss tut, entscheiden die Quellen: **Schaden** (Option mit Faktor), **Timing** (Zeile mit Katalysator, gleiche Quelle und Ausführung, sonst Zahlen aus Clarity), **keine** (gemessen ohne Unterschied oder kein Schaden und Timing im Text), **unbekannt** (Clarity nennt Schaden oder Timing, keine Quelle misst es).",
    "",
    "| Waffe | Munition | Wirkung | Timing ohne → mit | Text (Anfang) |",
    "| --- | --- | --- | --- | --- |",
    ...packages
      .filter((w) => w.catalystEffect !== undefined)
      .map((w) => {
        const t = w.catalystTiming;
        return `| ${[
          w.name,
          w.ammo,
          CATALYST_LABELS[w.catalystEffect!],
          t
            ? `Magazin ${w.magazine} → ${t.magazine}, Shots ${w.totalShots ?? "∞"} → ${t.totalShots ?? "∞"}, Zeit bis leer ${w.timeToEmptySeconds === null ? "–" : de(w.timeToEmptySeconds, 1)} → ${t.timeToEmptySeconds === null ? "–" : de(t.timeToEmptySeconds, 1)} s, rpm ${de(w.derivedRpm ?? 0, 0)} → ${de(60 / t.intervalSeconds, 0)}`
            : "–",
          cell((w.catalystText ?? "").split("\n")[0].slice(0, 120) || "–"),
        ].join(" | ")} |`;
      }),
    "",
    "## Lücken",
    "",
    "| Waffe | Typ | Grund |",
    "| --- | --- | --- |",
    ...gaps.map(
      (w) => `| ${w.name} | ${w.weaponType} | ${cell(w.gapReason ?? "")} |`,
    ),
    "",
    "## Nicht genutzte Aegis-Zeilen",
    "",
    "| Waffe | Annahmen | Grund |",
    "| --- | --- | --- |",
    ...report.weapons.flatMap((w) =>
      w.unusedRows.map(
        (r) =>
          `| ${w.name} | ${cell(r.assumptions.join(", "))} | ${cell(r.reason)} |`,
      ),
    ),
    "",
    "## Auffällige Annahmen",
    "",
    "Ähnliche Schreibweise (Stufe 1) und ohne Beleg eingeordnet (Stufe 5). Bitte prüfen.",
    "",
    "| Waffe | Annahme | Einordnung |",
    "| --- | --- | --- |",
    ...report.assumptions
      .filter((a) => a.similarTo || a.stage === 5)
      .map(
        (a) =>
          `| ${a.weapon} | ${cell(a.assumption)} | ${
            a.similarTo
              ? `${KIND_LABELS[a.kind]} „${a.similarTo}“ (ähnliche Schreibweise)`
              : "nicht modelliert, ohne Beleg"
          } |`,
      ),
    "",
    "## Kandidaten für neue Effects",
    "",
    "Annahmen, die wir noch nicht abbilden, nach Zahl der Waffen.",
    "",
    "| Annahme | Art | Waffen |",
    "| --- | --- | --- |",
    ...candidateRows(report.assumptions),
    "",
    "## Wechselwirkungen",
    "",
    "Exotic-Rüstung, deren Intrinsic den Waffentyp nennt, und Abilities, die Intrinsic oder Katalysator der Waffe nennen (ADR 0013, Punkt 4). Kandidaten für E1, noch nicht im Rechner.",
    "",
    "| Waffe | Exotic-Rüstung | Abilities |",
    "| --- | --- | --- |",
    ...report.weapons
      .filter((w) => w.armor.length > 0 || w.abilityKinds.length > 0)
      .map(
        (w) =>
          `| ${w.name} | ${w.armor.join(", ") || "–"} | ${w.abilityKinds.join(", ") || "–"} |`,
      ),
    "",
  ];
  return lines.join("\n");
}

function candidateRows(assumptions: ReportAssumption[]): string[] {
  const kinds: AssumptionKind[] = [
    "notModelled",
    "artifactPerk",
    "exoticArmor",
    "foreignPerk",
  ];
  const byName = new Map<string, { kind: AssumptionKind; weapons: string[] }>();
  for (const a of assumptions.filter((x) => kinds.includes(x.kind))) {
    const key = assumptionName(a.assumption);
    const item = byName.get(key) ?? { kind: a.kind, weapons: [] };
    if (!item.weapons.includes(a.weapon)) item.weapons.push(a.weapon);
    byName.set(key, item);
  }
  return [...byName.entries()]
    .sort(
      ([a, x], [b, y]) =>
        y.weapons.length - x.weapons.length || a.localeCompare(b),
    )
    .map(
      ([name, { kind, weapons }]) =>
        `| ${cell(name)} | ${KIND_LABELS[kind]} | ${weapons.join(", ")} |`,
    );
}
