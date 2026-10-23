// Ability energy from the Compendium (block 3): cooldowns, stat factors and energy modifiers.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawGenerated from "../src/data/ability-energy.json";
import { EnergyData } from "../src/data/schema";
import { loadEnergyInputs } from "../scripts/lib/energyInputs";
import { energyData, renderEnergy } from "../scripts/lib/energy";
import { effects, exoticArmor } from "../src/ui/data";

const result = energyData(loadEnergyInputs());
const modifier = (id: string) => result.data.modifiers.find((m) => m.id === id)!;
const cooldown = (id: string) =>
  result.data.abilities.find((a) => a.abilityId === id)!;

describe("cooldowns from the Compendium", () => {
  it("reads the base cooldown and chunk scalar of grenades and melees", () => {
    expect(cooldown("vortex-grenade").cooldownSeconds.value).toBe(219.5);
    expect(cooldown("vortex-grenade").chunkScalar?.value).toBe(0.5);
    expect(cooldown("ballistic-slam").cooldownSeconds.value).toBe(164.6);
  });

  it("reads the cooldown of supers, which have no chunk scalar", () => {
    expect(cooldown("thundercrash").cooldownSeconds.value).toBe(556);
    expect(cooldown("thundercrash").chunkScalar).toBeUndefined();
  });

  it("has a cooldown for every ability", () => {
    expect(result.data.abilities.filter((a) => a.cooldownSeconds.value === null)).toEqual([]);
  });
});

describe("energy modifiers from the Compendium lines", () => {
  it("reads percentages, factors and extra charges", () => {
    expect(modifier("starfire-protocol-weapon-hit").value.value).toBe(0.05);
    expect(modifier("starfire-protocol-regen").value.value).toBe(0.2);
    expect(modifier("chaos-accelerant-regen").value.value).toBe(1.15);
    expect(modifier("starfire-protocol-charge").value.value).toBe(1);
  });

  it("takes the boss value of Shards of Galanor, unaffected by the stat", () => {
    expect(modifier("shards-of-galanor-refund").value.value).toBe(0.5);
    expect(modifier("shards-of-galanor-refund").fixed).toBe(true);
  });

  it("refers only to exotics and effects that exist", () => {
    const effectIds = new Set(effects.map((e) => e.id));
    const exoticIds = new Set(exoticArmor.map((e) => e.id));
    for (const m of result.data.modifiers) {
      if ("exoticArmorId" in m.from) expect(exoticIds).toContain(m.from.exoticArmorId);
      if ("effectId" in m.from) expect(effectIds).toContain(m.from.effectId);
      for (const id of m.requiresAnyEffectIds ?? []) expect(effectIds).toContain(id);
    }
  });

  it("gives every Compendium line about energy a verdict", () => {
    expect(result.rows.filter((r) => r.verdict === "unclassified")).toEqual([]);
  });
});

describe("generated files are current (run npm run build:energy)", () => {
  it("ability-energy.json matches the Compendium snapshots", () => {
    expect(EnergyData.parse(rawGenerated)).toEqual(result.data);
  });

  it("docs/energy-import.md matches", () => {
    expect(renderEnergy(result.data, result.rows)).toBe(
      readFileSync("docs/energy-import.md", "utf8").replace(/\r\n/g, "\n"),
    );
  });
});
