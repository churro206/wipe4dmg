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

  it("reads the innate charges and the regeneration speed by charges held", () => {
    expect(cooldown("lightweight-knife").charges?.value).toBe(2);
    expect(cooldown("frenzied-blade").charges?.value).toBe(3);
    expect(cooldown("frenzied-blade").regenByCharges?.map((s) => s.value)).toEqual([1.15, 1.55, 1.95]);
    expect(cooldown("arcane-needle").regenByCharges?.map((s) => s.value)).toEqual([1.16, 1.64, 2.6]);
    expect(cooldown("arcane-needle").prismaticRegen?.value).toBe(0.7);
    expect(cooldown("thundercrash").charges).toBeUndefined();
  });

  it("the nominal cooldown ÷ the speed at 0 charges is Flat Gain's T0 (Arcane Needle 126 s)", () => {
    const needle = cooldown("arcane-needle");
    expect(needle.cooldownSeconds.value! / needle.regenByCharges![0].value!).toBeCloseTo(126, 0);
    const blade = cooldown("frenzied-blade");
    expect(blade.cooldownSeconds.value! / blade.regenByCharges![0].value! / 143).toBeCloseTo(1, 1);
  });

  it("gives class abilities the class mod scaler of their chunk scalar (RyTako: 1x → 0.4, 0.8x → 0.6, 0.5x → 1)", () => {
    const expected: Record<number, number> = { 1: 0.4, 0.8: 0.6, 0.5: 1 };
    const classAbilities = result.data.abilities.filter((a) =>
      ["marksmans-dodge", "gamblers-dodge", "rally-barricade", "towering-barricade"].includes(a.abilityId),
    );
    expect(classAbilities).toHaveLength(4);
    for (const a of classAbilities)
      expect(a.classModScalar?.value).toBe(expected[a.chunkScalar!.value!]);
    expect(cooldown("fusion-grenade").classModScalar).toBeUndefined();
  });

  it("has a cooldown for every ability", () => {
    expect(result.data.abilities.filter((a) => a.cooldownSeconds.value === null)).toEqual([]);
  });
});

describe("energy modifiers from the Compendium lines", () => {
  it("reads percentages, factors and extra charges", () => {
    expect(modifier("starfire-protocol-weapon-hit").value.value).toBe(0.05);
    expect(modifier("starfire-protocol-regen").value.value).toBe(0.08); // Flat Gain, at stat 0 (K4)
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

  it("every effect that changes only energy has a modifier (armor mods, Q3 part 4)", () => {
    const from = new Set(
      result.data.modifiers.flatMap((m) => ("effectId" in m.from ? [m.from.effectId] : [])),
    );
    const without = effects.filter((e) => e.changesEnergy && !from.has(e.id)).map((e) => e.id);
    expect(without).toEqual([]);
  });

  it("class mods: 12/17/20 % with 1/2/3 mods, at most once per 7 s for the damage mods", () => {
    expect([1, 2, 3].map((n) => modifier(`bomber-${n}x`).value.value)).toEqual([0.12, 0.17, 0.2]);
    expect(modifier("outreach-3x").scaledByClassMod).toBe(true);
    expect(modifier("distribution-3x").target.kinds).toEqual(["grenade", "melee", "classAbility"]);
    expect(modifier("momentum-transfer-3x").trigger).toMatchObject({ on: "cast", cooldownSeconds: 7 });
    expect(modifier("momentum-transfer-3x").scaledByClassMod).toBeUndefined();
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
