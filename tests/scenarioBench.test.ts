// Scenario bench (ADR 0017, ADR 0018, B2): the hand-made scenarios in tests/scenarios/ and the ones the
// generator makes from the other rows of the Aegis tab Weapons, against their rows. The table with
// the key figures is frozen in a file snapshot; a stage may change it only where it intends to
// (update with `npx vitest -u`, explain the change in the commit).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawAegis from "../src/data/aegis-weapons.json";
import rawTotals from "../src/data/aegis-totals.json";
import rawPackages from "../src/data/weapon-packages.json";
import { COMPONENT_TOLERANCE } from "../scripts/lib/abilityComponents";
import { AegisAbilityRow, AegisTotalsSnapshot, AegisWeaponSnapshot } from "../src/data/schema";
import { abilities, effects, exoticArmor, weapons } from "../src/ui/data";
import switches from "./fixtures/scenario-switches.json";
import { fittedRows } from "./lib/fittedRows";
import {
  benchMarkdown,
  checkPairs,
  checkSet,
  judge,
  keyFigures,
  runBench,
  Scenario,
  scenarioProblems,
  tabOf,
} from "./lib/scenarioBench";
import { generateScenarios, lotOf } from "./lib/scenarioGen";

const DIR = "tests/scenarios";
const SNAPSHOT = "./__snapshots__/scenario-bench.md";

const handMade = readdirSync(DIR)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .flatMap((file) =>
    Scenario.array().parse(JSON.parse(readFileSync(join(DIR, file), "utf8"))),
  );
const aegis = AegisWeaponSnapshot.parse(rawAegis).rows;
const totals = AegisTotalsSnapshot.parse(rawTotals).rows;
const abilityRows = AegisAbilityRow.array().parse(rawAbilityRows);
const generated = generateScenarios(
  aegis,
  { weapons, effects, exoticArmor, ignored: switches.ignored },
  new Set(handMade.map((s) => s.aegisRow)),
);
// The Weapons figures stay as they were (block P, step 1): the other tabs have their own tests below.
const all = [...handMade, ...generated.scenarios];
const scenarios = all.filter((s) => tabOf(s) === "weapons");
const otherTabs = all.filter((s) => tabOf(s) !== "weapons");
const fitted = fittedRows(rawPackages, abilities).weaponRows;
const judged = judge(runBench(scenarios), fitted);

describe("scenarios", () => {
  it("have unique ids and rows, and compare only to scenarios of the same weapon", () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const rows = scenarios.map((s) => s.aegisRow);
    expect(new Set(rows).size).toBe(rows.length);
    for (const s of scenarios.filter((s) => s.comparesTo !== undefined)) {
      const other = scenarios.find((o) => o.id === s.comparesTo);
      expect(other?.build.weaponId, s.id).toBe(s.build.weaponId);
    }
  });

  it.each(scenarios.map((s) => [s.id, s] as const))(
    "%s quotes its Aegis row",
    (_, s) => {
      const row = aegis.find((r) => r.id === s.aegisRow);
      expect(row, s.aegisRow).toBeDefined();
      expect([s.wipe, s.fullModifiers]).toEqual([row!.wipe, row!.fullModifiers]);
      // The playstyle is the row's own list of assumptions.
      expect(s.playstyle).toEqual(row!.assumptions);
      expect(s.shots).toBe(row!.shots);
    },
  );

  it("generates a scenario for a good part of the rows of exotic weapons", () => {
    expect(generated.scenarios.length).toBeGreaterThan(50);
  });

  it("keep the rules of their tab", () => {
    for (const s of all) expect(scenarioProblems(s), s.id).toEqual([]);
  });
});

describe("scenarios of the other tabs (block P)", () => {
  const others = runBench(otherTabs);
  const byId = (id: string) => others.find((r) => r.scenario.id === id)!;

  it.each(otherTabs.map((s) => [s.id, s] as const))("%s quotes its Aegis row", (_, s) => {
    const tab = tabOf(s);
    if (tab === "abilities") {
      const row = abilityRows.find((r) => r.id === s.aegisRow);
      expect(row, s.aegisRow).toBeDefined();
      const perUse = s.build.abilityStat === 200 ? row!.perUseStat200 : row!.perUseStat100;
      expect(s.wipe).toBe(perUse.value);
      expect(s.playstyle).toEqual(row!.assumptions);
    } else {
      const row = totals.find((r) => r.id === s.aegisRow);
      expect(row, s.aegisRow).toBeDefined();
      expect(row!.tab).toBe(tab);
      expect(s.wipe).toBe(row!.total);
      expect(s.playstyle).toEqual(row!.assumptions);
    }
  });

  // Today's values of the meta probe (docs/meta-probe.md), the same build through the one scenario path.
  it("Sustained: Xenophage gives the value of the meta probe", () => {
    expect(byId("sustained-xenophage").model!).toBeCloseTo(67645, -2);
  });

  it("Swap: Gathering Storm with Limit Break as a switch gives the probe value times at most 1.15", () => {
    // Meta probe: 12,866 with Limit Break taken out of the Aegis total. The perk raises damage of the
    // source "super" only (effects.json), so the keyword damage of the super (jolt) stays out: less than 1.15.
    const ratio = byId("swap-gathering-storm-limit-break").model! / 12866;
    expect(ratio).toBeGreaterThan(1.13);
    expect(ratio).toBeLessThanOrEqual(1.15);
  });

  it("Abilities: Gathering Storm lies within the tolerance of the ability gate", () => {
    const r = byId("abilities-gathering-storm");
    expect(Math.abs(r.deviation!)).toBeLessThanOrEqual(COMPONENT_TOLERANCE);
  });

  it("Sustained and Swap rows have no lot, Abilities rows keep theirs", () => {
    const judgedOthers = judge(others, new Set());
    for (const r of judgedOthers) {
      if (tabOf(r.scenario) === "abilities") expect(r.lot).toBe(lotOf(r.scenario.aegisRow));
      else expect(r.lot).toBe("check");
    }
  });
});

describe("check set", () => {
  it("holds no row that the model took a value from (I1)", () => {
    for (const r of checkSet(judged)) expect(fitted.has(r.scenario.aegisRow), r.scenario.id).toBe(false);
  });

  it("holds only rows of the fixed lot (I10)", () => {
    for (const r of checkSet(judged)) expect(lotOf(r.scenario.aegisRow), r.scenario.id).toBe("check");
  });

  it("builds a delta pair only on a row in the check set", () => {
    const ids = new Set(checkSet(judged).map((r) => r.scenario.aegisRow));
    for (const p of checkPairs(judged)) expect(ids.has(p.id), p.item).toBe(true);
  });

  it("has delta pairs, the main key figure (I11)", () => {
    expect(keyFigures(judged).pairs.of).toBeGreaterThan(0);
  });
});

describe("scenario bench", () => {
  it("keeps the frozen table and key figures", async () => {
    await expect(
      benchMarkdown(judged, generated.missing, generated.skipped),
    ).toMatchFileSnapshot(SNAPSHOT);
  });
});
