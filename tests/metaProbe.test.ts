// Meta probe (block 5): builds that rebuild rows of the Aegis tabs "Sustained" and "Swap", run
// through buildSimulation like the UI. Differences between builds must be right, absolute numbers
// need not: each ratio "ours ÷ Aegis" must lie near the median of all ratios.
// Table: npm run probe (writes docs/meta-probe.md)

import { describe, expect, it } from "vitest";
import type { AegisTotalRow, Build } from "../src/data/schema";
import { AegisTotalsSnapshot } from "../src/data/schema";
import { buildSimulation } from "../src/engine/buildSimulation";
import { simulate } from "../src/engine/simulate";
import { buckets, gameData, weaponById } from "../src/ui/data";
import rawTotals from "../src/data/aegis-totals.json";
import probe from "./fixtures/meta-probe.json";

type Entry = {
  aegisId: string;
  kind: "weapon" | "ability";
  build: Partial<Build>;
  selections?: string[];
  removed?: { column?: keyof AegisTotalRow; factor?: number; reason: string }[];
};

// Long enough to fire all ammo of a heavy weapon and to finish a super.
const PHASE_SECONDS = 120;
const STANDARD_WEAPON_EFFECTS = [
  "surge-3x",
  "lumina-noble-rounds",
  "tractor-cannon",
  "weapons-stat-200",
];
const STANDARD_ABILITY_EFFECTS = ["tractor-cannon"];
const TOLERANCE = 0.15;
const DEFAULT_WEAPON_ID = "one-thousand-voices";

const { rows } = AegisTotalsSnapshot.parse(rawTotals);
const entries = probe.entries as Entry[];

// An ability entry counts what the ability adds: the weapon of the build makes keyword damage of
// its own (e.g. ignitions of One Thousand Voices).
function ourTotal(entry: Entry): number {
  if (entry.kind === "weapon") return damageOf(entry, entry.build);
  return damageOf(entry, entry.build) - damageOf(entry, { ...entry.build, abilities: [] });
}

function damageOf(entry: Entry, fields: Partial<Build>): number {
  const effectIds = [
    ...(entry.kind === "weapon"
      ? STANDARD_WEAPON_EFFECTS
      : STANDARD_ABILITY_EFFECTS),
    ...(entry.selections ?? []),
  ];
  const build: Build = {
    weaponId: DEFAULT_WEAPON_ID,
    guardianClass: "titan",
    subclass: "arc",
    catalyst: false,
    selections: effectIds.map((effectId) => ({
      effectId,
      provider: "fireteamSupport",
    })),
    // Aegis holds its standard factors the whole time.
    effectWindows: Object.fromEntries(
      effectIds.map((id) => [
        id,
        { startMs: 0, durationMs: PHASE_SECONDS * 1000 },
      ]),
    ),
    damagePhaseSeconds: PHASE_SECONDS,
    ...(entry.kind === "ability"
      ? { abilityStats: { super: 200, grenade: 200, melee: 200 } }
      : {}),
    ...fields,
  };
  const { selected, options } = buildSimulation(build, gameData);
  const result = simulate(
    weaponById(build.weaponId),
    build.damagePhaseSeconds,
    selected,
    buckets,
    options,
  );
  return result.damageInstances
    .filter((d) =>
      entry.kind === "weapon"
        ? d.damageSource === "weapon" || d.damageSource === "keyword"
        : d.damageSource !== "weapon",
    )
    .reduce((sum, d) => sum + d.damage, 0);
}

function aegisTotal(entry: Entry): { row: AegisTotalRow; total: number } {
  const row = rows.find((r) => r.id === entry.aegisId);
  if (!row || row.total === null) {
    throw new Error(`Aegis row ${entry.aegisId} not found or without total`);
  }
  const removed = (entry.removed ?? []).reduce((p, r) => {
    const factor = r.factor ?? (r.column ? row[r.column] : null);
    if (typeof factor !== "number") {
      throw new Error(`Nothing to remove for ${entry.aegisId}: ${r.reason}`);
    }
    return p * factor;
  }, 1);
  return { row, total: row.total / removed };
}

const results = entries.map((entry) => {
  const { row, total } = aegisTotal(entry);
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
    " %.",
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
