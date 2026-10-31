// Scenario bench (ADR 0017, ADR 0018, B2): the hand-made scenarios in tests/scenarios/ and the ones the
// generator makes from the other rows of the Aegis tab Weapons, against their rows. The table with
// the key figures is frozen in a file snapshot; a stage may change it only where it intends to
// (update with `npx vitest -u`, explain the change in the commit).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import rawAegis from "../src/data/aegis-weapons.json";
import rawPackages from "../src/data/weapon-packages.json";
import { AegisWeaponSnapshot } from "../src/data/schema";
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
const generated = generateScenarios(
  aegis,
  { weapons, effects, exoticArmor, ignored: switches.ignored },
  new Set(handMade.map((s) => s.aegisRow)),
);
const scenarios = [...handMade, ...generated.scenarios];
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
