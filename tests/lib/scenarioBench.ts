// Scenario bench (ADR 0017, ADR 0018, B2): a scenario is one measured row of the Aegis tab "Weapons" as
// a build with its playstyle, made by hand (fixtures in tests/scenarios/) or by the generator
// (tests/lib/scenarioGen.ts). The bench runs each scenario through the engine and compares the
// result with the measurement on the scale of Aegis "visual" (wipe ÷ full modifiers).
//
// Only rows that the model took no value from (not "fitted", I1) and that the fixed lot puts into the
// check set (I10) count. Key figure: delta pairs (I11), then rank, absolute values are information.

import { z } from "zod";
import { GuardianClass, Subclass, type Build } from "../../src/data/schema";
import { fitArtifact } from "../../src/engine/artifacts";
import { buildSimulation } from "../../src/engine/buildSimulation";
import { simulate, type SimulationResult } from "../../src/engine/simulate";
import { buckets, effects, exoticArmor, gameData, weapons } from "../../src/ui/data";
import { deltaPairs, spearman, type DeltaPair, type Item } from "./ranking";
import { lotOf, type Lot, type MissingSwitch, type Skipped } from "./scenarioGen";

/** Share of the measurement a row may miss and still count as an absolute hit (information only). */
export const TOLERANCE = 0.03;
/** A delta pair holds if model and Aegis differ by at most this many percentage points (as in the ranking gate). */
export const DELTA_LIMIT = 2;
/** Spearman needs this many rows. */
const MIN_RANK_ROWS = 5;
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
  "generated", // made by the generator from a row (tests/lib/scenarioGen.ts); the system is not known
]);
export type ScenarioSystem = z.infer<typeof ScenarioSystem>;

/** The tab of the Aegis sheet a scenario comes from (block P). */
export const ScenarioTab = z.enum(["weapons", "sustained", "swap", "abilities"]);
export type ScenarioTab = z.infer<typeof ScenarioTab>;

export const Scenario = z.object({
  id: z.string(),
  // Omitted: "weapons". The other tabs measure by their own rule (see `modelTotal`).
  tab: ScenarioTab.optional(),
  aegisRow: z.string(), // id of the row in its Aegis snapshot (aegis-weapons, -totals or -abilities)
  // Copied from the row; the bench checks it against the snapshot. Weapons: Wipe; Sustained and
  // Swap: Total; Abilities: damage per use at `build.abilityStat`.
  wipe: z.number().positive(),
  fullModifiers: z.number().positive().default(1), // Weapons only
  system: ScenarioSystem,
  build: z.object({
    weaponId: z.string(), // Sustained: the weapon; Swap and Abilities: the weapon that stands by
    weaponsStat: z.number().nonnegative().optional(), // Sustained: the Weapons stat of the row
    // Swap and Abilities: the ability of the row, cast once at the start
    abilityId: z.string().optional(),
    guardianClass: GuardianClass.optional(),
    subclass: Subclass.optional(),
    // Swap and Abilities: the stat of super, grenade and melee (Aegis: 200, or 100 per use)
    abilityStat: z.number().nonnegative().optional(),
    catalyst: z.boolean().optional(), // omitted: off
    effectIds: z.array(z.string()).optional(), // effects.json, active the whole phase
    exoticArmorId: z.string().optional(),
    exoticPreBuilt: z.boolean().optional(), // its kill buffs are built up before (Build.exoticPreBuilt)
    // The weapon's setup stands at the start: Aegis counts no deploying shot, e.g. a Guidance Ring
    setupDeployed: z.boolean().optional(),
    playstyle: z.string().optional(), // Build.playstyle, e.g. the Golden Gun shots of Still Hunt
  }),
  playstyle: z.array(z.string()), // the assumptions of the Aegis row, as written there
  // Weapons: shots of the measurement; the cadence follows the build. Other tabs: none.
  shots: z.number().int().positive().optional(),
  comparesTo: z.string().optional(), // scenario of the same weapon (hand-made: the paper probe's pair)
  excluded: z.string().optional(), // why the scenario does not count
  note: z.string().optional(), // what the paper probe found (docs/plans/r0-paper-probe.md)
});
export type Scenario = z.infer<typeof Scenario>;

export const tabOf = (s: Scenario): ScenarioTab => s.tab ?? "weapons";

/** Rules a scenario file must keep; the bench test checks them. */
export function scenarioProblems(s: Scenario): string[] {
  const tab = tabOf(s);
  const problems: string[] = [];
  if (tab === "weapons" && s.shots === undefined) problems.push("a Weapons scenario needs `shots`");
  if (tab !== "weapons" && s.fullModifiers !== 1) problems.push("only Weapons rows have Full Modifiers");
  if ((tab === "swap" || tab === "abilities") && (!s.build.abilityId || s.build.abilityStat === undefined)) {
    problems.push("a Swap or Abilities scenario needs `abilityId` and `abilityStat`");
  }
  return problems;
}

/** Measured value: Weapons on the scale of Aegis "visual" (wipe by full modifiers), the others as the row says. */
export const measured = (s: Scenario) => s.wipe / s.fullModifiers;

/** The build of a scenario; `withAbility` false leaves the cast out (Swap and Abilities take the difference). */
function scenarioBuild(s: Scenario, withAbility: boolean): Build {
  const effectIds = s.build.effectIds ?? [];
  for (const id of effectIds) {
    if (!effects.some((e) => e.id === id)) throw new Error(`Unknown effect "${id}" in ${s.id}`);
  }
  const armor = exoticArmor.find((a) => a.id === s.build.exoticArmorId);
  if (s.build.exoticArmorId && !armor) {
    throw new Error(`Unknown exotic armor "${s.build.exoticArmorId}" in ${s.id}`);
  }
  const stat = s.build.abilityStat;
  const selections = effectIds.map((effectId) => ({
    effectId,
    provider: effects.find((e) => e.id === effectId)!.providers[0].kind,
  }));
  // Artifact perks (e.g. Limit Break) need the artifact that holds them
  const { artifactId } = fitArtifact(gameData.artifacts, undefined, selections);
  return {
    weaponId: s.build.weaponId,
    guardianClass: s.build.guardianClass ?? armor?.guardianClass ?? "titan",
    subclass: s.build.subclass ?? "arc",
    catalyst: s.build.catalyst ?? false,
    ...(s.build.playstyle ? { playstyle: s.build.playstyle } : {}),
    ...(armor ? { exoticArmorId: armor.id } : {}),
    ...(s.build.exoticPreBuilt ? { exoticPreBuilt: true } : {}),
    ...(artifactId === undefined ? {} : { artifactId }),
    selections,
    // Aegis holds the effects of a measurement the whole time.
    effectWindows: Object.fromEntries(
      effectIds.map((id) => [id, { startMs: 0, durationMs: PHASE_SECONDS * 1000 }]),
    ),
    damagePhaseSeconds: PHASE_SECONDS,
    ...(s.build.weaponsStat === undefined ? {} : { weaponsStat: s.build.weaponsStat }),
    ...(stat === undefined ? {} : { abilityStats: { super: stat, grenade: stat, melee: stat } }),
    ...(withAbility && s.build.abilityId
      ? { abilities: [{ abilityId: s.build.abilityId, castsMs: [0] }] }
      : {}),
  };
}

type Instance = SimulationResult["damageInstances"][number];

/**
 * Total Damage of the scenario as its tab measures it; null if the core cannot run it.
 * - Weapons: the shots and everything they set off (shot limit of the row).
 * - Sustained: the weapon and its keyword damage over the phase (as the Aegis tab Sustained).
 * - Swap: what the cast adds besides the weapon's own damage (difference with and without the cast).
 * - Abilities: the same, without the burn of scorch (the Aegis package holds the ignitions, ADR 0015).
 */
export function modelTotal(
  s: Scenario,
  run: typeof simulate = simulate,
): number | null {
  if (!weapons.some((w) => w.id === s.build.weaponId)) return null;
  const tab = tabOf(s);
  const damage = (withAbility: boolean) => {
    const { selected, options } = buildSimulation(scenarioBuild(s, withAbility), gameData);
    const weapon = weapons.find((w) => w.id === s.build.weaponId)!;
    return run(weapon, PHASE_SECONDS, selected, buckets, {
      ...options,
      ...(s.shots === undefined ? {} : { shotLimit: s.shots }),
      // An assumption of the scenario, read by the rules of the weapon (condition `playstyle`)
      ...(s.build.setupDeployed
        ? { assumptions: [...(options.assumptions ?? []), "setup-stands"] }
        : {}),
    });
  };
  if (tab === "weapons") return damage(true).totalDamage;
  const sum = (keep: (d: Instance) => boolean, withAbility: boolean) =>
    damage(withAbility)
      .damageInstances.filter(keep)
      .reduce((total, d) => total + d.damage, 0);
  if (tab === "sustained") {
    return sum((d) => d.damageSource === "weapon" || d.damageSource === "keyword", true);
  }
  const keep = (d: Instance) => d.damageSource !== "weapon" && (tab === "swap" || d.id !== "burn");
  return sum(keep, true) - sum(keep, false);
}

export type BenchRow = {
  scenario: Scenario;
  measured: number;
  model: number | null;
  deviation: number | null; // model ÷ measured − 1
};

export function runBench(scenarios: Scenario[]): BenchRow[] {
  return scenarios.map((scenario) => {
    const model = modelTotal(scenario);
    return {
      scenario,
      measured: measured(scenario),
      model,
      deviation: model === null ? null : model / measured(scenario) - 1,
    };
  });
}

/** A bench row with the verdicts of I1 (fitted) and I10 (lot). */
export type Judged = BenchRow & { fitted: boolean; lot: Lot };

/** `fitted`: ids of the Aegis rows the model took values from (tests/lib/fittedRows.ts). */
export const judge = (rows: BenchRow[], fitted: Set<string>): Judged[] =>
  rows.map((r) => ({
    ...r,
    fitted: fitted.has(r.scenario.aegisRow),
    // Sustained and Swap have no lot: every row that no value came from is checked (plan P).
    lot: ["sustained", "swap"].includes(tabOf(r.scenario)) ? "check" : lotOf(r.scenario.aegisRow),
  }));

/** Rows that count: a value, not excluded. */
const counted = (rows: Judged[]) =>
  rows.filter((r) => r.scenario.excluded === undefined && r.model !== null);
/** The check set: counted rows that no value came from and the lot puts aside for checking. */
export const checkSet = (rows: Judged[]) =>
  counted(rows).filter((r) => !r.fitted && r.lot === "check");

const toItem = (r: Judged): Item => ({
  id: r.scenario.aegisRow,
  tab: tabOf(r.scenario),
  name: r.scenario.build.abilityId ?? r.scenario.build.weaponId,
  assumptions: r.scenario.playstyle,
  aegis: r.measured,
  ours: r.model!,
});

/**
 * Delta pairs of the check set: the row with the extra assumption is in the check set, the row
 * without it may be any counted row (its value cancels in the delta).
 */
export function checkPairs(rows: Judged[]): DeltaPair[] {
  const ids = new Set(checkSet(rows).map((r) => r.scenario.aegisRow));
  return deltaPairs(counted(rows).map(toItem)).filter((p) => ids.has(p.id));
}

const within = (deviation: number | null) =>
  deviation !== null && Math.abs(deviation) <= TOLERANCE;

export function keyFigures(rows: Judged[]) {
  const check = checkSet(rows);
  const pairs = checkPairs(rows);
  const rank =
    check.length >= MIN_RANK_ROWS
      ? spearman(
          check.map((r) => r.measured),
          check.map((r) => r.model!),
        )
      : null;
  return {
    pairs: { hits: pairs.filter((p) => Math.abs(p.gap) <= DELTA_LIMIT).length, of: pairs.length },
    rank: { rho: rank, rows: check.length },
    absolute: {
      check: { hits: check.filter((r) => within(r.deviation)).length, of: check.length },
      all: {
        hits: counted(rows).filter((r) => within(r.deviation)).length,
        of: counted(rows).length,
      },
    },
    rows: {
      total: rows.length,
      handMade: rows.filter((r) => r.scenario.system !== "generated").length,
      generated: rows.filter((r) => r.scenario.system === "generated").length,
      fitted: rows.filter((r) => r.fitted).length,
      calibration: counted(rows).filter((r) => !r.fitted && r.lot === "calibration").length,
      check: check.length,
      excluded: rows.filter((r) => r.scenario.excluded !== undefined).length,
      notRunnable: rows.filter((r) => r.model === null).length,
    },
  };
}

const percent = (value: number | null) =>
  value === null ? "—" : `${value >= 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1)} %`;
const points = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}`;
const amount = (value: number | null) => (value === null ? "—" : value.toFixed(0));
const MAX_LISTED = 40;

/** Assumptions without a switch, with the number of rows that name them, the most frequent first. */
export function missingByAssumption(missing: MissingSwitch[]): [string, number][] {
  const count = new Map<string, number>();
  for (const m of missing) for (const a of new Set(m.unmapped)) count.set(a, (count.get(a) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** The bench as Markdown: key figures, delta pairs and rows of the check set, lists of what is missing. */
export function benchMarkdown(
  rows: Judged[],
  missing: MissingSwitch[],
  skipped: Skipped[],
): string {
  const figures = keyFigures(rows);
  const share = ({ hits, of }: { hits: number; of: number }) => `${hits} of ${of}`;
  const pairs = checkPairs(rows).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap) || a.id.localeCompare(b.id));
  const check = checkSet(rows);
  const wanted = missingByAssumption(missing);
  const skippedReasons = new Map<string, number>();
  for (const s of skipped) skippedReasons.set(s.reason, (skippedReasons.get(s.reason) ?? 0) + 1);
  return [
    "# Scenario bench",
    "",
    "Generated by `tests/scenarioBench.test.ts`; update with `npx vitest -u` and explain the change in the commit.",
    `Values on the scale of Aegis "visual" (wipe ÷ full modifiers). Only rows that the model took no value from (status \`fitted\`, I1) and that the fixed lot puts into the check set (FNV-1a of the row id, I10) count.`,
    "",
    "## Key figures",
    "",
    `- **Delta pairs (check set): ${share(figures.pairs)} within ${DELTA_LIMIT} percentage points**`,
    `- Rank (check set): Spearman ${figures.rank.rho === null ? "—" : figures.rank.rho.toFixed(2)} over ${figures.rank.rows} rows`,
    `- Absolute, information only: within ±${TOLERANCE * 100} % ${share(figures.absolute.check)} (check set), ${share(figures.absolute.all)} (all counted rows, mostly Eichung)`,
    `- Rows: ${figures.rows.total} scenarios (${figures.rows.handMade} by hand, ${figures.rows.generated} generated); fitted ${figures.rows.fitted}; calibration set ${figures.rows.calibration}; check set ${figures.rows.check}; not counted ${figures.rows.excluded}; core cannot run ${figures.rows.notRunnable}`,
    "",
    "## Delta pairs (check set)",
    "",
    "| Row with the extra assumption | Extra | Aegis | Model | Gap |",
    "| --- | --- | ---: | ---: | ---: |",
    ...pairs.map(
      (p) =>
        `| ${p.item} | ${p.added} | ${points(p.aegisDelta)} | ${points(p.ourDelta)} | ${points(p.gap)} |`,
    ),
    "",
    "## Rows of the check set",
    "",
    "| Scenario | Aegis row | Source | Model | Deviation |",
    "| --- | --- | ---: | ---: | ---: |",
    ...check.map(
      (r) =>
        `| ${r.scenario.id} | ${r.scenario.aegisRow} | ${amount(r.measured)} | ${amount(r.model)} | ${percent(r.deviation)} |`,
    ),
    "",
    "## Scenarios by hand",
    "",
    "Fixtures from `tests/scenarios/`. Fitted rows are the Eichung of their item and prove nothing; the lot decides for the others.",
    "",
    "| Scenario | System | Source | Model | Deviation | Fitted | Lot | Note |",
    "| --- | --- | ---: | ---: | ---: | --- | --- | --- |",
    ...rows
      .filter((r) => r.scenario.system !== "generated")
      .map(
        (r) =>
          `| ${r.scenario.id} | ${r.scenario.system} | ${amount(r.measured)} | ${amount(r.model)} | ${percent(r.deviation)} | ${r.fitted ? "fitted" : ""} | ${r.lot} | ${r.scenario.excluded ? `not counted: ${r.scenario.excluded}` : r.model === null ? "weapon not in the core" : ""} |`,
      ),
    "",
    `## Missing switches (${missing.length} rows)`,
    "",
    "Rows of the tab Weapons with an assumption the core has no switch for; they make no scenario. Assumption and number of rows.",
    "",
    ...wanted.slice(0, MAX_LISTED).map(([a, n]) => `- ${a}: ${n}`),
    ...(wanted.length > MAX_LISTED ? [`- … and ${wanted.length - MAX_LISTED} more`] : []),
    "",
    `## Skipped rows (${skipped.length})`,
    "",
    ...[...skippedReasons.entries()].sort().map(([reason, n]) => `- ${reason}: ${n}`),
    "",
  ].join("\n");
}
