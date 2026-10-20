// Formats the coverage list docs/coverage.md (US-15). German, like all documents for readers.
// tests/coverage.test.ts compares it with the file; npm run coverage rewrites the file.
// The output has no date, so the comparison only fails when the data changes.

import type { AbilityKind, Effect } from "../../src/data/schema";
import type {
  AbilityCoverageRow,
  CoverageStatus,
  MissingReason,
} from "../../src/engine/coverage";

const STATUS: Record<CoverageStatus, string> = {
  components: "✅ Teile",
  package: "🟡 Paket",
  effectOnly: "🔵 Nur Buff",
  missing: "❌ fehlt",
};
const WINDOW = {
  exact: "exakt",
  estimate: "Schätzung",
  none: "blockiert nicht",
};
const REASON: Record<MissingReason, string> = {
  noAegisRow: "keine Aegis-Messung",
  aegisNotNormalised: "Aegis-Werte nicht normiert (Buffs im Wert)",
  aegisOnlyWithUnmodelledBuffs:
    "Aegis misst nur mit Buffs, die noch kein Effect sind",
  effectNotModelled: "gibt nur einen Buff, der noch kein Effect ist",
  noUsableData: "keine brauchbaren Daten",
  notYetModelled: "noch nicht angelegt",
};
const KINDS: { kind: AbilityKind; title: string }[] = [
  { kind: "super", title: "Supers" },
  { kind: "grenade", title: "Grenades" },
  { kind: "melee", title: "Melees" },
];

const percent = (value: number) => `${Math.round((value - 1) * 1000) / 10} %`;

export function coverageMarkdown(
  rows: AbilityCoverageRow[],
  effects: Effect[],
): string {
  const lines = [
    "# Abdeckung des Rechners",
    "",
    "Generiert mit `npm run coverage` aus den Data Files. Nicht von Hand bearbeiten.",
    "",
    "Legende: ✅ Teile = eigene Damage Instances aus dem Compendium, vom Gate gegen Aegis geprüft.",
    "🟡 Paket = gemessener Wert pro Einsatz aus Aegis (ADR 0009). 🔵 Nur Buff = Super ohne eigenen Schaden.",
    "❌ fehlt = noch nicht im Rechner, mit Grund. Super Window: exakt, Schätzung (ein Wert fehlt) oder blockiert nicht.",
    "",
    "## Überblick",
    "",
    "| Art | ✅ Teile | 🟡 Paket | 🔵 Nur Buff | ❌ fehlt | Gesamt |",
    "| --- | --- | --- | --- | --- | --- |",
    ...KINDS.map(({ kind, title }) => {
      const ofKind = rows.filter((r) => r.kind === kind);
      const count = (status: CoverageStatus) =>
        ofKind.filter((r) => r.status === status).length;
      return `| ${title} | ${count("components")} | ${count("package")} | ${count("effectOnly")} | ${count("missing")} | ${ofKind.length} |`;
    }),
    `| Effects | ${effects.length} modelliert | | | | |`,
  ];

  for (const { kind, title } of KINDS) {
    const isSuper = kind === "super";
    lines.push(
      "",
      `## ${title}`,
      "",
      isSuper
        ? "| Element | Super | Modell | Super Window | Aegis-Zeile oder Grund |"
        : `| Element | ${title.slice(0, -1)} | Modell | Aegis-Zeile oder Grund |`,
      isSuper ? "| --- | --- | --- | --- | --- |" : "| --- | --- | --- | --- |",
    );
    for (const row of rows.filter((r) => r.kind === kind)) {
      const detail = row.reason
        ? REASON[row.reason]
        : row.aegisRowId
          ? `\`${row.aegisRowId}\``
          : "–";
      const window = row.superWindow ? WINDOW[row.superWindow] : "–";
      lines.push(
        isSuper
          ? `| ${row.element} | ${row.name} | ${STATUS[row.status]} | ${window} | ${detail} |`
          : `| ${row.element} | ${row.name} | ${STATUS[row.status]} | ${detail} |`,
      );
    }
  }

  lines.push(
    "",
    "## Effects",
    "",
    "| Effect | Bucket | Wirkung | Wirkt auf | Dauer |",
    "| --- | --- | --- | --- | --- |",
  );
  for (const effect of effects) {
    const multipliers = effect.parts.flatMap((part) =>
      part.type === "multiplier"
        ? [
            {
              text: `${part.bucketId} +${percent(part.multiplier.value ?? NaN)}`,
              sources:
                part.damageSources.join(", ") +
                (part.abilityIds ? ` (nur ${part.abilityIds.join(", ")})` : ""),
            },
          ]
        : part.type === "timing"
          ? [{ text: `Timing: ${part.change}`, sources: "weapon" }]
          : [
              {
                text: `${part.counterId} ×${part.factor.value}`,
                sources: "weapon",
              },
            ],
    );
    const duration = effect.durationMs?.value
      ? `${effect.durationMs.value / 1000} s`
      : "ganze Phase oder Rotation";
    lines.push(
      `| ${effect.name} | ${[...new Set(effect.parts.map((p) => (p.type === "multiplier" ? p.bucketId : "–")))].join(", ")} | ${multipliers.map((m) => m.text).join("; ")} | ${[...new Set(multipliers.map((m) => m.sources))].join("; ")} | ${duration} |`,
    );
  }
  return lines.join("\n") + "\n";
}
