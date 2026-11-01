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
import { abilities, buckets, effects, exoticArmor, gameData, weapons } from "../../src/ui/data";
import { deltaPairs, spearman, topHits, type DeltaPair, type Item } from "./ranking";
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

/** The id of a row in the pairs: the scenario at stat 200 is a row of its own beside the one at stat 100. */
export const itemId = (s: Scenario) =>
  tabOf(s) === "abilities" && s.build.abilityStat === 200 ? `${s.aegisRow}@stat-200` : s.aegisRow;

/** Weapons are labelled by id (frozen in the snapshot); the other tabs by the name of weapon or ability. */
const nameOf = (s: Scenario): string => {
  if (tabOf(s) === "weapons") return s.build.weaponId;
  if (s.build.abilityId) return abilities.find((a) => a.id === s.build.abilityId)?.name ?? s.build.abilityId;
  return weapons.find((w) => w.id === s.build.weaponId)?.name ?? s.build.weaponId;
};

const toItem = (r: Judged): Item => ({
  id: itemId(r.scenario),
  tab: tabOf(r.scenario),
  name: nameOf(r.scenario),
  assumptions: r.scenario.playstyle,
  aegis: r.measured,
  ours: r.model!,
});

/**
 * Delta pairs of the check set: the row with the extra assumption is in the check set, the row
 * without it may be any counted row (its value cancels in the delta).
 */
export function checkPairs(rows: Judged[]): DeltaPair[] {
  const ids = new Set(checkSet(rows).map((r) => itemId(r.scenario)));
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

// ---- Groups (block P, step 4): what the rows check, column "Prüft" of docs/product.md ----

export const GROUPS = ["Weapons", "Supers", "Heavy", "Special", "Abilities"] as const;
export type Group = (typeof GROUPS)[number];
/** Groups that the ranking gate enforces (the thresholds of the former gate); the others report. */
export const GATED: readonly Group[] = ["Supers", "Heavy", "Special"];
export const SPEARMAN_MIN = 0.9;
export const TOP = 3;
export const WITHIN = 5;

/** The group of a scenario; `rowType` is the column "Type" of the Aegis row (Sustained, Swap). */
export function groupOf(s: Scenario, rowType: (aegisRow: string) => string | undefined): Group | null {
  const type = rowType(s.aegisRow);
  switch (tabOf(s)) {
    case "weapons":
      return "Weapons";
    case "abilities":
      return "Abilities";
    case "swap":
      return type === "super" ? "Supers" : null;
    case "sustained":
      return type === "power" ? "Heavy" : type === "special" ? "Special" : null;
  }
}

/** The scenario at stat 200 repeats its row; it counts for pairs, not for rank and coverage. */
const isStatVariant = (s: Scenario) => tabOf(s) === "abilities" && s.build.abilityStat === 200;

export type GroupFigures = {
  group: Group;
  aegisRows: number; // rows of the group in the Aegis sheet that hold a value
  covered: number; // of them with a scenario the core can run
  fitted: number; // of the covered, rows the model took a value from (information)
  check: number; // rows of the check set
  rank: { rho: number; hits: number } | null; // from 5 rows of the check set
  pairs: DeltaPair[]; // delta pairs of the check set
  rows: Judged[]; // the check set (without the scenarios at stat 200)
};

export function groupFigures(
  rows: Judged[],
  group: Group,
  rowType: (aegisRow: string) => string | undefined,
  aegisRows: number,
): GroupFigures {
  const inGroup = rows.filter((r) => groupOf(r.scenario, rowType) === group);
  const base = counted(inGroup).filter((r) => !isStatVariant(r.scenario));
  const check = checkSet(inGroup).filter((r) => !isStatVariant(r.scenario));
  const aegis = check.map((r) => r.measured);
  const ours = check.map((r) => r.model!);
  return {
    group,
    aegisRows,
    covered: new Set(base.map((r) => r.scenario.aegisRow)).size,
    fitted: new Set(base.filter((r) => r.fitted).map((r) => r.scenario.aegisRow)).size,
    check: check.length,
    rank:
      check.length >= MIN_RANK_ROWS
        ? { rho: spearman(aegis, ours), hits: topHits(aegis, ours, TOP, WITHIN) }
        : null,
    pairs: checkPairs(inGroup),
    rows: check,
  };
}

/** Key of a delta pair in `tests/fixtures/ranking-gate.json`. */
export const pairKey = (group: Group, p: DeltaPair) => `${group}: ${p.item} + ${p.added}`;

/** The groups as Markdown: the table of figures, the delta pairs with the reason of a known deviation. */
export function groupMarkdown(
  figures: GroupFigures[],
  pairDeviations: Record<string, string>,
  missingByGroup: Record<string, { unmapped: string[] }[]>,
): string {
  const cell = (f: GroupFigures) =>
    f.rank ? `${f.rank.rho.toFixed(2)} | ${f.rank.hits}/${TOP}` : "< 5 rows | —";
  return [
    "",
    "## Groups",
    "",
    `Rows by what they check (column "Prüft" of \`docs/product.md\`). Coverage: Aegis rows with a scenario the core can run. Fitted: of them, rows the model took a value from (information, not in the check set). Rank (check set, from ${MIN_RANK_ROWS} rows): Spearman, and how many of the Aegis top ${TOP} stand in our top ${WITHIN}. Thresholds for the groups ${GATED.join(", ")}: Spearman ≥ ${SPEARMAN_MIN}, ${TOP} of ${TOP}, delta pairs ±${DELTA_LIMIT}; known deviations with their reason in \`tests/fixtures/ranking-gate.json\`. The other groups report until the owner has confirmed their numbers.`,
    "",
    "| Group | Aegis rows | Covered | Coverage | Fitted | Check set | Spearman | Top 3 in 5 | Delta pairs |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...figures.map(
      (f) =>
        `| ${f.group} | ${f.aegisRows} | ${f.covered} | ${f.aegisRows === 0 ? "—" : `${Math.round((f.covered / f.aegisRows) * 100)} %`} | ${f.fitted} | ${f.check} | ${cell(f)} | ${f.pairs.filter((p) => Math.abs(p.gap) <= DELTA_LIMIT).length} of ${f.pairs.length} |`,
    ),
    "",
    "## Delta pairs by group (check set)",
    "",
    "| Group | Row | Extra assumption | Aegis | Model | Gap | Reason of the deviation |",
    "| --- | --- | --- | ---: | ---: | ---: | --- |",
    ...figures.flatMap((f) =>
      [...f.pairs]
        .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap) || a.item.localeCompare(b.item))
        .map(
          (p) =>
            `| ${f.group} | ${p.item} | ${p.added} | ${points(p.aegisDelta)} | ${points(p.ourDelta)} | ${points(p.gap)} | ${pairDeviations[pairKey(f.group, p)] ?? ""} |`,
        ),
    ),
    "",
    "## Rows of the check set by group",
    "",
    "Aegis in the scale of its tab (total, value per use at stat 100, or wipe by full modifiers).",
    "",
    "| Group | Aegis row | Aegis | Model | Deviation |",
    "| --- | --- | ---: | ---: | ---: |",
    ...figures.flatMap((f) =>
      [...f.rows]
        .sort((a, b) => a.scenario.aegisRow.localeCompare(b.scenario.aegisRow))
        .map(
          (r) =>
            `| ${f.group} | ${r.scenario.aegisRow} | ${amount(r.measured)} | ${amount(r.model)} | ${percent(r.deviation)} |`,
        ),
    ),
    "",
    "## Missing switches by group",
    "",
    "Assumptions of Aegis without a switch, with the number of rows of the group that name them.",
    ...figures.flatMap((f) => {
      const wanted = missingByAssumption(missingByGroup[f.group] ?? []);
      return [
        "",
        `### ${f.group} (${(missingByGroup[f.group] ?? []).length} rows)`,
        "",
        ...wanted.slice(0, 15).map(([a, n]) => `- ${a}: ${n}`),
        ...(wanted.length > 15 ? [`- … and ${wanted.length - 15} more`] : []),
      ];
    }),
    "",
  ].join("\n");
}

const percent = (value: number | null) =>
  value === null ? "—" : `${value >= 0 ? "+" : "−"}${Math.abs(value * 100).toFixed(1)} %`;
const points = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}`;
const amount = (value: number | null) => (value === null ? "—" : value.toFixed(0));
const MAX_LISTED = 40;

/** Assumptions without a switch, with the number of rows that name them, the most frequent first. */
export function missingByAssumption(missing: { unmapped: string[] }[]): [string, number][] {
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
