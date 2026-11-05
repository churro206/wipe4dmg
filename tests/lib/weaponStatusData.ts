// The input of the weapon status (scripts/lib/weaponStatus.ts) from the data files and the engine;
// the result is src/data/weapon-status.json (V1). Aegis rows are a report, not a gate (ADR 0018).

import { readdirSync, readFileSync } from "node:fs";
import rawAegis from "../../src/data/aegis-weapons.json";
import rawTotals from "../../src/data/aegis-totals.json";
import rawClarity from "../../src/data/clarity.json";
import rawPackages from "../../src/data/weapon-packages.json";
import rawQuantum from "../../src/data/quantum-weapons.json";
import rawLimits from "../../src/data/status-limits.json";
import {
  AegisTotalsSnapshot,
  AegisWeaponSnapshot,
  ClaritySnapshot,
  QuantumWeaponSnapshot,
  StatusLimits,
  type Build,
  type WeaponStatusFile,
} from "../../src/data/schema";
import { buildSimulation } from "../../src/engine/buildSimulation";
import { simulate } from "../../src/engine/simulate";
import { abilities, artifactData, buckets, effects, exoticArmor, gameData, weapons } from "../../src/ui/data";
import { ITEM_WEAPONS_DIR } from "../../scripts/lib/items/loadItems";
import { planBlockOf, sentenceStates, statusOf, trustOf } from "../../scripts/lib/weaponStatus";
import switches from "../fixtures/scenario-switches.json";
import { fittedRows, sourcesOf } from "./fittedRows";
import { handMadeScenarios } from "./scenarioFiles";
import { judge, runBench, tabOf } from "./scenarioBench";
import { generateAbilityScenarios, generateScenarios, generateTotalScenarios } from "./scenarioGen";
import rawAbilityRows from "../../src/data/aegis-abilities.json";
import { AegisAbilityRow } from "../../src/data/schema";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const round = (x: number, digits: number) => Math.round(x * 10 ** digits) / 10 ** digits;
const SECONDS = [10, 30, 60] as const;
const ALL_AMMO_SECONDS = 120;

const buildOf = (weaponId: string, catalyst: boolean, seconds: number): Build => ({
  weaponId,
  guardianClass: "titan",
  subclass: "arc",
  catalyst,
  selections: [],
  effectWindows: {},
  damagePhaseSeconds: seconds,
});

function run(weaponId: string, catalyst: boolean, seconds: number, shotLimit?: number): number {
  const weapon = weapons.find((w) => w.id === weaponId)!;
  const { selected, options } = buildSimulation(buildOf(weaponId, catalyst, seconds), gameData);
  return simulate(weapon, seconds, selected, buckets, {
    ...options,
    ...(shotLimit === undefined ? {} : { shotLimit }),
  }).totalDamage;
}

const over = (weaponId: string, catalyst: boolean) => {
  const [s10, s30, s60] = SECONDS.map((s) => round(run(weaponId, catalyst, s), 1));
  return { s10, s30, s60 };
};

/** Every Aegis row of the Weapons and Sustained tabs the bench runs, judged. */
function aegisJudged() {
  const handMade = handMadeScenarios();
  const taken = new Set(handMade.map((s) => s.aegisRow));
  const generated = generateScenarios(
    AegisWeaponSnapshot.parse(rawAegis).rows,
    { weapons, effects, exoticArmor, ignored: switches.ignored },
    taken,
  );
  const shared = {
    abilities,
    effects,
    exoticArmor,
    artifactPerks: artifactData.artifacts.flatMap((a) => a.perks),
    ignored: switches.ignoredTotals,
  };
  const totals = generateTotalScenarios(
    AegisTotalsSnapshot.parse(rawTotals).rows,
    { weapons, ...shared },
    taken,
  );
  const abilityRows = generateAbilityScenarios(AegisAbilityRow.array().parse(rawAbilityRows), shared, taken);
  const all = [...handMade, ...generated.scenarios, ...totals.scenarios, ...abilityRows.scenarios].filter(
    (s) => tabOf(s) === "weapons" || tabOf(s) === "sustained",
  );
  const { weaponRows } = fittedRows(rawPackages, abilities);
  return judge(runBench(all), weaponRows);
}

export function realWeaponStatus(): WeaponStatusFile {
  const clarity = ClaritySnapshot.parse(rawClarity).entries;
  const quantum = QuantumWeaponSnapshot.parse(rawQuantum).rows;
  const limits = StatusLimits.parse(rawLimits);
  const judged = aegisJudged();
  const plan = readFileSync(new URL("../../docs/plans/current.md", import.meta.url), "utf8");
  const items = new Map(
    readdirSync(ITEM_WEAPONS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => [f.replace(/\.json$/, ""), JSON.parse(readFileSync(new URL(f, ITEM_WEAPONS_DIR), "utf8"))]),
  );
  const packages = new Map((rawPackages as { id: string }[]).map((p) => [p.id, p]));

  return {
    weapons: [...weapons]
      .sort((a, b) => (a.id < b.id ? -1 : 1))
      .map((w) => {
        const item = items.get(w.id) ?? null;
        const sources = sourcesOf(packages.get(w.id));
        const trust = trustOf(sources);
        const texts = clarity.filter((c) => c.itemName === w.name).map((c) => c.text);
        const sentences = sentenceStates(texts, item);

        const q = quantum.find(
          (r) => norm(r.name) === norm(w.name) && r.variant === "" && r.totalDamage !== null && r.totalShots,
        );
        const measured = q?.totalDamage ?? null;
        const model = q ? run(w.id, false, ALL_AMMO_SECONDS, q.totalShots!) : null;

        const rows = judged
          .filter((r) => r.scenario.build.weaponId === w.id)
          .map((r) => ({ ...r, fitted: r.fitted }));
        const independent = rows.filter((r) => !r.fitted);
        const hasFitted = sources.some((s) => s.status === "fitted");
        const deviation = model !== null && measured ? round(model / measured - 1, 4) : null;
        return {
          id: w.id,
          name: w.name,
          status: statusOf({
            open: sentences.filter((s) => s.state === "open").length,
            quoteDeviation: deviation,
            estimated: trust === "estimated",
            tolerance: limits.quantumDeviation,
          }),
          trust,
          damage: { base: over(w.id, false), catalyst: w.catalyst ? over(w.id, true) : null },
          sentences,
          quantum:
            q && model !== null && measured !== null && deviation !== null
              ? { row: q.id, measured: round(measured, 1), model: round(model, 1), deviation }
              : null,
          aegis: {
            check: independent.length > 0 ? "checked" : hasFitted ? "no independent check" : "no row",
            rows: independent.map((r) => ({
              row: r.scenario.aegisRow,
              assumptions: r.scenario.playstyle ?? [],
              measured: round(r.measured, 1),
              model: r.model === null ? null : round(r.model, 1),
              deviation: r.deviation === null ? null : round(r.deviation, 4),
            })),
          },
          planBlock: planBlockOf(w.name, plan),
        };
      }),
  };
}
