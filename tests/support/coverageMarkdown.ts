// Formats the coverage list docs/coverage.md (US-15). English, because the website shows it.
// tests/coverage.test.ts compares it with the file; npm run coverage rewrites the file.
// The output has no date, so the comparison only fails when the data changes.

import type { AbilityKind, Effect } from "../../src/data/schema";
import type { countVerdicts } from "../../scripts/lib/aegisCoverage";
import { REASON } from "../../scripts/lib/coverageCatalog";
import type {
  AbilityCoverageRow,
  CoverageStatus,
} from "../../src/engine/coverage";

const STATUS: Record<CoverageStatus, string> = {
  components: "✅ Parts",
  package: "🟡 Package",
  effectOnly: "🔵 Buff only",
  missing: "❌ missing",
};
const WINDOW = {
  exact: "exact",
  estimate: "estimate",
  none: "does not block",
};
const KINDS: { kind: AbilityKind; title: string }[] = [
  { kind: "super", title: "Supers" },
  { kind: "grenade", title: "Grenades" },
  { kind: "melee", title: "Melees" },
];

const percent = (value: number) => `${Math.round((value - 1) * 1000) / 10}%`;

export function coverageMarkdown(
  rows: AbilityCoverageRow[],
  effects: Effect[],
  aegis: ReturnType<typeof countVerdicts>,
): string {
  const lines = [
    "# Coverage of the calculator",
    "",
    "Generated with `npm run coverage` from the data files. Do not edit by hand.",
    "",
    "Legend: ✅ Parts = own Damage Instances from the Compendium, checked against Aegis by the gate.",
    "🟡 Package = measured value per cast from Aegis. 🔵 Buff only = Super without damage of its own.",
    "❌ missing = not in the calculator yet, with reason. Super Window: exact, estimate (a value is missing) or does not block.",
    "",
    "## Overview",
    "",
    "| Kind | ✅ Parts | 🟡 Package | 🔵 Buff only | ❌ missing | Total |",
    "| --- | --- | --- | --- | --- | --- |",
    ...KINDS.map(({ kind, title }) => {
      const ofKind = rows.filter((r) => r.kind === kind);
      const count = (status: CoverageStatus) =>
        ofKind.filter((r) => r.status === status).length;
      return `| ${title} | ${count("components")} | ${count("package")} | ${count("effectOnly")} | ${count("missing")} | ${ofKind.length} |`;
    }),
    `| Effects | ${effects.length} modelled | | | | |`,
    "",
    "## Aegis measurements",
    "",
    "Every row of the Aegis sheets (Weapons, Sustained, Swap) has a verdict: in the model (used or checked against the model), skipped with a reason (another mode, a burst before a weapon swap, a legendary frame) or missing (an item or an assumption the model does not have).",
    "",
    "| Sheet | Rows | In the model | Skipped | Missing |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...aegis.map(
      (c) =>
        `| ${c.tab[0].toUpperCase()}${c.tab.slice(1)} | ${c.total} | ${c.model} | ${c.skipped} | ${c.missing} |`,
    ),
  ];

  for (const { kind, title } of KINDS) {
    const isSuper = kind === "super";
    lines.push(
      "",
      `## ${title}`,
      "",
      isSuper
        ? "| Element | Super | Model | Super Window | Aegis row or reason |"
        : `| Element | ${title.slice(0, -1)} | Model | Aegis row or reason |`,
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
    "| Effect | Bucket | Effect value | Applies to | Duration |",
    "| --- | --- | --- | --- | --- |",
  );
  for (const effect of effects) {
    const multipliers = effect.modifiers.map((part) => {
      switch (part.type) {
        case "multiplier":
          return {
            text: `${part.bucketId} +${percent(part.multiplier.value ?? NaN)}`,
            sources:
              part.damageSources.join(", ") +
              (part.abilityIds ? ` (only ${part.abilityIds.join(", ")})` : ""),
          };
        case "stat":
          return {
            text:
              part.stat === "reload"
                ? part.factor.value === 0
                  ? "Timing: noReload"
                  : "Timing: reloadDuration"
                : part.stat === "drawHold"
                  ? "Hold the draw"
                  : `Stat: ${part.stat}`,
            sources: "weapon",
          };
        case "action":
          return {
            text: `${part.status} ×${part.factor.value}`,
            sources: "weapon",
          };
      }
    });
    // what its rules do: a keyword it applies, damage of its own
    const ruleEntries = (effect.rules ?? []).flatMap((rule) =>
      rule.do.flatMap((action) =>
        action.type === "applyStatus" && rule.on.on === "hit"
          ? [{ text: "Applies a keyword", sources: "weapon" }]
          : action.type === "damage" && rule.on.on === "timer"
            ? [{ text: `Own damage: ${action.id}`, sources: "own damage" }]
            : [],
      ),
    );
    multipliers.push(...ruleEntries);
    const duration = effect.durationMs?.value
      ? `${effect.durationMs.value / 1000} s`
      : "whole phase or Rotation";
    lines.push(
      `| ${effect.name} | ${[...new Set([...effect.modifiers.map((p) => (p.type === "multiplier" ? p.bucketId : "–")), ...ruleEntries.map(() => "–")])].join(", ")} | ${multipliers.map((m) => m.text).join("; ")} | ${[...new Set(multipliers.map((m) => m.sources))].join("; ")} | ${duration} |`,
    );
  }
  return lines.join("\n") + "\n";
}
