// Stat curves of the ability energy (Q3, K3/K4), gated against the Flat Gain tables.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawEnergy from "../src/data/ability-energy.json";
import { EnergyData } from "../src/data/schema";
import { curveAt } from "../src/engine/abilityEnergy";

const data = EnergyData.parse(rawEnergy);
const stat = (kind: "grenade" | "melee" | "super") => data.stats.find((s) => s.kind === kind)!;
const modifier = (id: string) => data.modifiers.find((m) => m.id === id)!;
const rows = (file: string) =>
  readFileSync(`docs/sources/sheets/flatgain/${file}`, "utf8")
    .split(/\r?\n/)
    .map((line) => line.split("\t"));
const percent = (cell: string) => Number(cell.replace("%", "")) / 100;

describe("curveAt", () => {
  const points = [
    { stat: 0, value: 1 },
    { stat: 10, value: 2 },
  ];
  it("interpolates linearly and holds the ends", () => {
    expect(curveAt(points, 5)).toBe(1.5);
    expect(curveAt(points, 0)).toBe(1);
    expect(curveAt(points, 200)).toBe(2);
  });
});

describe("regeneration of the stat (K3)", () => {
  it("is not linear: stat 30 gives the Flat Gain cooldown ratio T0 / T3 of the grenades", () => {
    const grenades = rows("0-grenades.tsv")
      .filter((r) => /^\d+s$/.test(r[5] ?? "") && /^\d+s$/.test(r[6] ?? ""))
      .map((r) => ({ name: r[4], ratio: parseInt(r[5]) / parseInt(r[6]) }));
    const at30 = curveAt(stat("grenade").regenUnits.points, 30);
    // Swarm Grenade: its T3 cooldown has a second scalar in the sheet
    const fits = grenades.filter((g) => Math.abs(g.ratio / at30 - 1) < 0.03);
    expect(grenades.length).toBeGreaterThan(10);
    expect(grenades.filter((g) => !fits.includes(g)).map((g) => g.name)).toEqual(["Swarm Grenade"]);
    expect(curveAt(stat("grenade").regenUnits.points, 100)).toBeGreaterThan(3);
  });

  it("is the same for melee, and constant for the super (the stat names only gains)", () => {
    expect(stat("melee").regenUnits.points).toEqual(stat("grenade").regenUnits.points);
    expect(stat("super").regenUnits.points.every((p) => p.value === 1)).toBe(true);
  });
});

describe("chunk gains of the stat (K3)", () => {
  it("grow by the Flat Gain factor of a grenade at stat 100 (50 % → 58 %)", () => {
    const row = rows("0-grenades.tsv").find((r) => r[4] === "Lightning Grenade")!;
    const flat = percent(row[10]) / percent(row[9]);
    expect(curveAt(stat("grenade").gainScaler.points, 100)).toBeCloseTo(flat, 1);
  });

  it("are 0.4 at stat 0 and about 1 at stat 70 (the energy before Edge of Fate)", () => {
    const points = stat("grenade").gainScaler.points;
    expect(curveAt(points, 0)).toBeCloseTo(0.4, 2);
    expect(curveAt(points, 70)).toBeCloseTo(1, 1);
  });
});

describe("regeneration effects scale with the stat (K4)", () => {
  // Flat Gain, regen effects: value at 0 stat and at 100 stat (Renegades columns)
  const flat = (name: string, kind: string) => {
    const row = rows("1365845234-regen-effects.tsv").find((r) => r[2] === name && r[4] === kind)!;
    return { at0: percent(row[10]), at100: percent(row[11]) };
  };
  const scaler = curveAt(stat("grenade").effectScaler.points, 100);

  it.each([
    ["Eye of Another World", "Grenade", "eye-of-another-world-regen", 1],
    ["Starfire Protocol", "Grenade", "starfire-protocol-regen", 1],
    ["Heart of Inmost Light x2", "Grenade", "heart-of-inmost-light-grenade", 2],
  ])("%s: value at stat 0, ×scaler at stat 100", (name, kind, id, stacks) => {
    const { at0, at100 } = flat(name, kind);
    expect(modifier(id).value.value).toBeCloseTo(at0 / stacks, 3);
    expect((modifier(id).value.value as number) * scaler * stacks).toBeCloseTo(at100, 1);
  });
});
