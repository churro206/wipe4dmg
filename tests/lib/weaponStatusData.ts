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
  type Source,
  type WeaponStatusFile,
} from "../../src/data/schema";
import { abilities, artifactData, effects, exoticArmor, weapons } from "../../src/ui/data";
import { bareWeaponRun } from "../../src/ui/weaponBuild";
import { ITEM_WEAPONS_DIR } from "../../scripts/lib/items/loadItems";
import {
  causeOf,
  factorsOf,
  isCatalystRow,
  isStrippedRow,
  planBlockOf,
  quantumRowFor,
  sentenceStates,
  statusOf,
  trustOf,
} from "../../scripts/lib/weaponStatus";
import switches from "../fixtures/scenario-switches.json";
import { fittedRows, sourcesOf } from "./fittedRows";
import { handMadeScenarios } from "./scenarioFiles";
import { judge, runBench, tabOf } from "./scenarioBench";
import { generateAbilityScenarios, generateScenarios, generateTotalScenarios } from "./scenarioGen";
import rawAbilityRows from "../../src/data/aegis-abilities.json";
import { AegisAbilityRow } from "../../src/data/schema";

const round = (x: number, digits: number) => Math.round(x * 10 ** digits) / 10 ** digits;
const SECONDS = [10, 30, 60] as const;
const ALL_AMMO_SECONDS = 120;

// The build is the one of the expanded row (src/ui/weaponBuild.ts)
function run(weaponId: string, catalyst: boolean, seconds: number, shotLimit?: number): number {
  const weapon = weapons.find((w) => w.id === weaponId)!;
  return bareWeaponRun(weapon, catalyst, seconds, shotLimit).totalDamage;
}

const over = (weaponId: string, catalyst: boolean) => {
  const [s10, s30, s60] = SECONDS.map((s) => round(run(weaponId, catalyst, s), 1));
  return { s10, s30, s60 };
};

/** The part of the first hit: what the comparison splits into shots × hits × damage. */
function mainPart(result: ReturnType<typeof bareWeaponRun>) {
  const first = result.damageInstances.reduce<(typeof result.damageInstances)[number] | null>(
    (a, b) => (a === null || b.timeMs < a.timeMs ? b : a),
    null,
  );
  if (!first) return null;
  const hits = result.damageInstances.filter((d) => d.id === first.id);
  return { id: first.id, hits: hits.length, damage: first.damage, sum: hits.reduce((s, d) => s + d.damage, 0) };
}

/** What the total over all ammo loses without each rule; the rule that spawns the main part is the weapon itself. */
function ruleSharesOf(weapon: (typeof weapons)[number]) {
  const whole = bareWeaponRun(weapon, false, ALL_AMMO_SECONDS);
  const main = mainPart(whole)?.id;
  if (!main || whole.totalDamage === 0) return [];
  return (weapon.rules ?? [])
    .filter((rule) => !rule.do.some((action) => action.type === "spawn" && action.part === main))
    .map((rule) => {
      const without = bareWeaponRun({ ...weapon, rules: weapon.rules!.filter((r) => r !== rule) }, false, ALL_AMMO_SECONDS);
      return { id: rule.id, share: round((whole.totalDamage - without.totalDamage) / whole.totalDamage, 4) };
    })
    .filter((rule) => rule.share !== 0);
}

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
  // The rows a package or an item (hand-made, `$aegis` refs resolve to `fitted` sources) takes values from
  const { weaponRows } = fittedRows([rawPackages, weapons], abilities);
  return judge(runBench(all), weaponRows);
}

/** The sources of a weapon: those of its package (until A2) and those the item's refs resolved to. */
export function weaponSources(weapon: unknown, pkg: unknown): Source[] {
  return [...sourcesOf(pkg), ...sourcesOf(weapon)];
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
        const sources = weaponSources(w, packages.get(w.id));
        const trust = trustOf(sources);
        const texts = clarity.filter((c) => c.itemName === w.name).map((c) => c.text);
        const sentences = sentenceStates(texts, item);

        const compared = quantumRowFor(quantum, w.name, item);
        const q = compared?.row;
        const basis = compared?.basis ?? null;
        const measured = q ? (basis === "total" ? q.totalDamage : q.magDamage) : null;
        const rowShots = q ? (basis === "total" ? q.totalShots : q.magazine)! : null;
        const compareRun = rowShots === null ? null : bareWeaponRun(w, false, ALL_AMMO_SECONDS, rowShots);
        const model = compareRun?.totalDamage ?? null;
        const main = compareRun ? mainPart(compareRun) : null;

        const rows = judged
          .filter((r) => r.scenario.build.weaponId === w.id)
          .map((r) => ({ ...r, fitted: r.fitted }));
        const independent = rows.filter((r) => !r.fitted);
        const hasFitted = sources.some((s) => s.status === "fitted");
        const deviation = model !== null && measured ? round(model / measured - 1, 4) : null;
        const open = sentences.filter((s) => s.state === "open").length;
        const aegisRows = independent.map((r) => ({
          row: r.scenario.aegisRow,
          assumptions: r.scenario.playstyle ?? [],
          measured: round(r.measured, 1),
          model: r.model === null ? null : round(r.model, 1),
          deviation: r.deviation === null ? null : round(r.deviation, 4),
        }));
        const ruleShares = ruleSharesOf(w);
        const quantumStatus =
          q && basis && model !== null && measured !== null && deviation !== null
            ? {
                row: q.id,
                rowNote: q.note ?? "",
                basis,
                measured: round(measured, 1),
                model: round(model, 1),
                deviation,
                circular: deviation === 0 && main !== null && round(main.sum, 1) === round(model, 1),
                catalystRow: isCatalystRow(q),
                strippedRow: isStrippedRow(q),
                factors: main
                  ? factorsOf(
                      {
                        measured,
                        rowShots: rowShots!,
                        rowDamages: [q.precisionDamage, q.bodyDamage].filter((d) => d !== null),
                        modelShots: compareRun!.shots.length,
                        modelHits: main.hits,
                        modelDamage: main.damage,
                        modelTotal: model,
                      },
                      limits.quantumDeviation,
                    )
                  : null,
              }
            : null;
        return {
          id: w.id,
          name: w.name,
          status: statusOf({
            open,
            quoteDeviation: deviation,
            estimated: trust === "estimated",
            tolerance: limits.quantumDeviation,
          }),
          trust,
          damage: { base: over(w.id, false), catalyst: w.catalyst ? over(w.id, true) : null },
          cause: causeOf({
            quantum: quantumStatus,
            aegis: aegisRows.flatMap((r) => (r.deviation === null ? [] : [{ ...r, deviation: r.deviation }])),
            open,
            ruleShares,
            tolerance: limits.quantumDeviation,
          }),
          ruleShares,
          sentences,
          quantum: quantumStatus,
          aegis: {
            check: independent.length > 0 ? "checked" : hasFitted ? "no independent check" : "no row",
            rows: aegisRows,
          },
          planBlock: planBlockOf(w.name, plan),
        };
      }),
  };
}
