// P0: the checks compare like with like. The Quantum row is the one the item models, and an Aegis row
// counts the same bullets as the model. The damage of the game does not change here.

import { describe, expect, it } from "vitest";
import rawQuantum from "../src/data/quantum-weapons.json";
import { QuantumWeaponSnapshot } from "../src/data/schema";
import { quantumRowFor } from "../scripts/lib/weaponStatus";
import { hitsPerRowShot, shotsNamedByRow } from "./lib/scenarioGen";
import { modelTotal, type Scenario } from "./lib/scenarioBench";
import { realWeaponStatus } from "./lib/weaponStatusData";

const rows = QuantumWeaponSnapshot.parse(rawQuantum).rows;

describe("quantumRowFor", () => {
  it("takes the row the item names, whatever its order in the sheet", () => {
    const item = { quantumCheck: { row: "specials-linear-fusion-rifle-euphony-2", reason: "x" } };
    expect(quantumRowFor(rows, "Euphony", item)?.row.id).toBe("specials-linear-fusion-rifle-euphony-2");
  });

  it("throws on a named row that does not exist", () => {
    const item = { quantumCheck: { row: "no-such-row", reason: "x" } };
    expect(() => quantumRowFor(rows, "Euphony", item)).toThrow(/no-such-row/);
  });

  it("without a name takes the row the timing of the item comes from", () => {
    const item = { totalShots: "$quantum[specials-linear-fusion-rifle-arbalest-cata].timing.totalShots" };
    expect(quantumRowFor(rows, "Arbalest", item)?.row.id).toBe("specials-linear-fusion-rifle-arbalest-cata");
  });

  it("without an item takes the first row without a variant, and none if every row has one", () => {
    expect(quantumRowFor(rows, "Crimson", null)?.row.id).toBe("primaries-hand-cannon-crimson");
    expect(quantumRowFor(rows, "Anarchy", null)).toBeNull();
  });

  it("all ammo where the row has a total, one magazine for unlimited primary ammo", () => {
    expect(quantumRowFor(rows, "Euphony", null)?.basis).toBe("total");
    expect(quantumRowFor(rows, "Crimson", null)?.basis).toBe("magazine");
  });
});

describe("the units of an Aegis row", () => {
  const row = (wipe: number, critShot: number, shots: number) => ({ wipe, critShot, shots });

  it("reads the hits of one shot from wipe and crit", () => {
    expect(hitsPerRowShot(row(1821, 607, 1))).toBe(3); // Crimson, burst
    expect(hitsPerRowShot(row(2605, 521, 1))).toBe(5); // Vigilance Wing, burst
  });

  it("one hit, several shots or a broken ratio name no count", () => {
    expect(hitsPerRowShot(row(607, 607, 1))).toBeUndefined();
    expect(hitsPerRowShot(row(16128, 224, 6))).toBeUndefined();
    expect(hitsPerRowShot(row(1000, 607, 1))).toBeUndefined();
  });

  it("reads the shots of a measurement from its assumptions", () => {
    expect(shotsNamedByRow(["Illegally Modded Holster", "17 shots"], 13)).toBe(17);
    expect(shotsNamedByRow(["Conserve Momentum x0", "full mag"], 8)).toBe(8);
    expect(shotsNamedByRow(["hipfire", "1 mag"], 8)).toBe(8);
    expect(shotsNamedByRow(["average", "single mag"], 48)).toBe(48);
    expect(shotsNamedByRow(["burst"], 24)).toBeUndefined();
  });
});

describe("modelTotal with the hits of a row", () => {
  const scenario = (weaponId: string, wipe: number, fullModifiers: number): Scenario => ({
    id: `test-${weaponId}`,
    aegisRow: `test-${weaponId}`,
    wipe,
    fullModifiers,
    system: "generated",
    build: { weaponId },
    playstyle: ["burst"],
    shots: 1,
    hitsPerShot: 3,
  });

  it("counts the three bullets of a burst when the model fires single bullets", () => {
    const crimson = scenario("crimson", 1821, 15.09);
    expect(modelTotal(crimson)! / (1821 / 15.09)).toBeCloseTo(1, 1);
  });

  it("does not hide a weapon that fires too little: a magazine of 1 cannot hold three single bullets", () => {
    // Trinity Ghoul fires three arrows per draw, the model one: a real error, not a unit.
    expect(modelTotal(scenario("trinity-ghoul", 723, 3.31))).toBe(73);
  });

  it("leaves a weapon alone whose shot already is the burst", () => {
    expect(modelTotal(scenario("euphony", 4356, 3.31))).toBeCloseTo(1317.5, 0);
  });
});

describe("the weapon status against Quantum", () => {
  const status = realWeaponStatus().weapons;
  const of = (id: string) => status.find((w) => w.id === id)!;

  it("Euphony compares its Threadlings with the row that has them", () => {
    expect(of("euphony").quantum?.row).toBe("specials-linear-fusion-rifle-euphony-2");
    expect(Math.abs(of("euphony").quantum!.deviation)).toBeLessThan(0.03);
  });

  it("names the assumption of the row it compares with", () => {
    expect(of("euphony").quantum?.rowNote).toMatch(/Threadlings detonate instantly/);
  });

  it("a primary weapon without a total compares one magazine", () => {
    const crimson = of("crimson").quantum!;
    expect(crimson.basis).toBe("magazine");
    expect(crimson.measured).toBe(984);
    expect(crimson.model).toBe(984);
  });

  it("every item with a named row points at a row of its own weapon", () => {
    for (const id of ["euphony", "two-tailed-fox", "truth"]) {
      const row = rows.find((r) => r.id === of(id).quantum?.row);
      expect(row?.name, id).toBe(of(id).name);
    }
  });
});
