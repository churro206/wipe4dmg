// Scenario bench (ADR 0017, stage S0): every scenario in tests/scenarios/ against its Aegis row. The
// table with the key figure is frozen in a file snapshot; a stage of the new core may change it only
// where it intends to (update with `npx vitest -u`, explain the change in the commit).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import rawAegis from "../src/data/aegis-weapons.json";
import { AegisWeaponSnapshot } from "../src/data/schema";
import { benchMarkdown, runBench, Scenario } from "./lib/scenarioBench";

const DIR = "tests/scenarios";
const SNAPSHOT = "./__snapshots__/scenario-bench.md";

const scenarios = readdirSync(DIR)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .flatMap((file) =>
    Scenario.array().parse(JSON.parse(readFileSync(join(DIR, file), "utf8"))),
  );
const aegis = AegisWeaponSnapshot.parse(rawAegis).rows;

describe("scenarios", () => {
  it("have unique ids and compare only to scenarios of the same weapon", () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
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
});

describe("scenario bench", () => {
  it("keeps the frozen table and key figure", async () => {
    await expect(benchMarkdown(runBench(scenarios))).toMatchFileSnapshot(SNAPSHOT);
  });
});
