// Scenario bench (ADR 0017, stage S0): a scenario is one measured row of the Aegis tab "Weapons" as a
// build with its playstyle. The bench runs each scenario through the engine and compares the result
// with the measurement on the scale of Aegis "visual" (wipe ÷ full modifiers), without any standard
// buffs. The key figure is the share of scenarios within the tolerance, overall and per system.

import { z } from "zod";
import type { Build } from "../../src/data/schema";
import { buildSimulation } from "../../src/engine/buildSimulation";
import { simulateCore } from "../../src/engine/core/simulateCore";
import { simulate } from "../../src/engine/simulate";
import { buckets, effects, exoticArmor, gameData, weapons } from "../../src/ui/data";

/** Share of the measurement a scenario may miss and still count as a hit (plan S0: ±3 %). */
export const TOLERANCE = 0.03;
// Long enough for the trailing damage of every scenario (ignitions, seeker ticks); the shot limit
// ends the shots.
const PHASE_SECONDS = 120;

/** The system a scenario checks first (plan: findings of the paper probe). */
export const ScenarioSystem = z.enum([
  "base", // one plain shot
  "factor", // a factor from the text, e.g. Reaper's Tithe, charge levels
  "parts", // a shot made of parts and their counts, e.g. wolfpack rounds, seekers
  "scorch", // scorch, burn and ignitions
  "volatile", // volatile and its cooldown
  "hitShare", // parts that hit a boss only partly, e.g. Truth's bomblets
]);
export type ScenarioSystem = z.infer<typeof ScenarioSystem>;

export const Scenario = z.object({
  id: z.string(),
  aegisRow: z.string(), // id of the row in aegis-weapons.json
  wipe: z.number().positive(), // copied from the row; the bench checks it against the snapshot
  fullModifiers: z.number().positive(), // ditto
  system: ScenarioSystem,
  build: z.object({
    weaponId: z.string(),
    catalyst: z.boolean().optional(), // omitted: off
    effectIds: z.array(z.string()).optional(), // effects.json, active the whole phase
    exoticArmorId: z.string().optional(),
    // The weapon's setup stands at the start: Aegis counts no deploying shot, e.g. a Guidance Ring
    setupDeployed: z.boolean().optional(),
    playstyle: z.string().optional(), // Build.playstyle, e.g. the Golden Gun shots of Still Hunt
  }),
  playstyle: z.array(z.string()), // the assumptions of the Aegis row, as written there
  shots: z.number().int().positive(), // shots of the measurement; the cadence follows the build
  comparesTo: z.string().optional(), // scenario of the same weapon: the bench also checks the ratio
  excluded: z.string().optional(), // why the scenario does not count in the key figure
  note: z.string().optional(), // what the paper probe found (docs/plans/r0-paper-probe.md)
});
export type Scenario = z.infer<typeof Scenario>;

/** Measured value on the scale of Aegis "visual". */
export const measured = (s: Scenario) => s.wipe / s.fullModifiers;

/** Total Damage of the scenario's shots and everything they set off; null if the core cannot run it. */
export function modelTotal(
  s: Scenario,
  run: typeof simulate = simulate,
): number | null {
  if (!weapons.some((w) => w.id === s.build.weaponId)) return null;
  const effectIds = s.build.effectIds ?? [];
  for (const id of effectIds) {
    if (!effects.some((e) => e.id === id)) throw new Error(`Unknown effect "${id}" in ${s.id}`);
  }
  const armor = exoticArmor.find((a) => a.id === s.build.exoticArmorId);
  if (s.build.exoticArmorId && !armor) {
    throw new Error(`Unknown exotic armor "${s.build.exoticArmorId}" in ${s.id}`);
  }
  const build: Build = {
    weaponId: s.build.weaponId,
    guardianClass: armor?.guardianClass ?? "titan",
    subclass: "arc",
    catalyst: s.build.catalyst ?? false,
    ...(s.build.playstyle ? { playstyle: s.build.playstyle } : {}),
    ...(armor ? { exoticArmorId: armor.id } : {}),
    selections: effectIds.map((effectId) => ({
      effectId,
      provider: effects.find((e) => e.id === effectId)!.providers[0].kind,
    })),
    // Aegis holds the effects of a measurement the whole time.
    effectWindows: Object.fromEntries(
      effectIds.map((id) => [id, { startMs: 0, durationMs: PHASE_SECONDS * 1000 }]),
    ),
    damagePhaseSeconds: PHASE_SECONDS,
  };
  const { selected, options } = buildSimulation(build, gameData);
  const weapon = weapons.find((w) => w.id === s.build.weaponId)!;
  return run(weapon, PHASE_SECONDS, selected, buckets, {
    ...options,
    shotLimit: s.shots,
    ...(s.build.setupDeployed ? { setupDeployed: true } : {}),
  }).totalDamage;
}

export type BenchRow = {
  scenario: Scenario;
  measured: number;
  model: number | null;
  deviation: number | null; // model ÷ measured − 1
  ratioDeviation: number | null; // the same for the ratio to comparesTo
};

export function runBench(scenarios: Scenario[]): BenchRow[] {
  const rows = scenarios.map((scenario) => {
    const model = modelTotal(scenario, simulateCore);
    return {
      scenario,
      measured: measured(scenario),
      model,
      deviation: model === null ? null : model / measured(scenario) - 1,
      ratioDeviation: null as number | null,
    };
  });
  for (const row of rows) {
    const id = row.scenario.comparesTo;
    if (id === undefined) continue;
    const other = rows.find((r) => r.scenario.id === id);
    if (!other) throw new Error(`${row.scenario.id} compares to unknown scenario "${id}"`);
    if (row.model === null || other.model === null || other.model === 0) continue;
    row.ratioDeviation = row.model / other.model / (row.measured / other.measured) - 1;
  }
  return rows;
}

const within = (deviation: number | null) =>
  deviation !== null && Math.abs(deviation) <= TOLERANCE;

/** Hits within the tolerance and the counted scenarios, overall and per system. */
export function keyFigures(rows: BenchRow[]) {
  const counted = rows.filter((r) => r.scenario.excluded === undefined);
  const figure = (list: BenchRow[], pick: (r: BenchRow) => number | null) => ({
    hits: list.filter((r) => within(pick(r))).length,
    of: list.length,
  });
  const ratios = counted.filter((r) => r.scenario.comparesTo !== undefined);
  return {
    total: figure(counted, (r) => r.deviation),
    ratios: figure(ratios, (r) => r.ratioDeviation),
    bySystem: ScenarioSystem.options.map((system) => ({
      system,
      ...figure(
        counted.filter((r) => r.scenario.system === system),
        (r) => r.deviation,
      ),
    })),
  };
}

const percent = (value: number | null) =>
  value === null ? "—" : `${value >= 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1)} %`;
const amount = (value: number | null) => (value === null ? "—" : value.toFixed(0));

/** The bench as Markdown: table "scenario | source | model | deviation" and the key figures. */
export function benchMarkdown(rows: BenchRow[]): string {
  const figures = keyFigures(rows);
  const share = ({ hits, of }: { hits: number; of: number }) => `${hits} of ${of}`;
  return [
    "# Scenario bench",
    "",
    "Generated by `tests/scenarioBench.test.ts`; update with `npx vitest -u` and explain the change in the commit.",
    `Values on the scale of Aegis "visual" (wipe ÷ full modifiers). Tolerance ±${TOLERANCE * 100} %.`,
    "",
    "## Key figures",
    "",
    `- Total: ${share(figures.total)}`,
    `- Ratios between rows of one weapon: ${share(figures.ratios)}`,
    ...figures.bySystem.map((f) => `- ${f.system}: ${share(f)}`),
    "",
    "## Scenarios",
    "",
    "| Scenario | System | Source | Model | Deviation | Ratio | Note |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${r.scenario.id} | ${r.scenario.system} | ${amount(r.measured)} | ${amount(r.model)} | ${percent(r.deviation)} | ${r.scenario.comparesTo ? percent(r.ratioDeviation) : ""} | ${r.scenario.excluded ? `not counted: ${r.scenario.excluded}` : r.model === null ? "weapon not in the core" : ""} |`,
    ),
    "",
  ].join("\n");
}
