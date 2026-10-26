// What the UI needs to know about the chosen weapon (W1-6): catalyst, ignitions, relevant effects.

import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import rawSubclass from "../src/data/subclass-effects.json";
import rawPackages from "../src/data/weapon-packages.json";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import { loadWeapons } from "../src/engine/loadWeapon";
import {
  effectRelevantTo,
  hasCatalyst,
  hasIgnition,
  neededStatuses,
} from "../src/engine/weaponInfo";
import { testWeapon } from "./support/testWeapon";
import { weaponById } from "./support/weapons";

const otv = weaponById("one-thousand-voices");
const packages = loadWeapons(rawPackages);
const pkg = (name: string) => packages.find((w) => w.name === name)!;
const effect = (id: string) =>
  loadEffects(rawEffects).find((e) => e.id === id)!;

describe("hasCatalyst", () => {
  it("knows catalyst parts of a hand model and catalyst options of a package", () => {
    expect(hasCatalyst(otv)).toBe(true);
    expect(hasCatalyst(pkg("Truth"))).toBe(true);
    expect(hasCatalyst(testWeapon)).toBe(false);
  });
});

describe("hasIgnition", () => {
  it("is true for weapons that apply scorch or have a threshold part", () => {
    expect(hasIgnition(otv)).toBe(true);
    expect(hasIgnition(pkg("Two-Tailed Fox"))).toBe(true);
    expect(hasIgnition(pkg("Truth"))).toBe(false);
  });
});

describe("effectRelevantTo", () => {
  it("keeps effects for the weapon and effects for abilities", () => {
    expect(effectRelevantTo(effect("surge-3x"), testWeapon)).toBe(true);
    expect(effectRelevantTo(effect("weaken"), testWeapon)).toBe(true);
  });

  it("drops weapon-only effects that do not fit the weapon", () => {
    expect(
      effectRelevantTo(effect("particle-reconstruction"), testWeapon),
    ).toBe(false);
    expect(effectRelevantTo(effect("ember-of-ashes"), testWeapon)).toBe(false);
  });

  it("keeps Radiant for a void weapon, since it buffs Golden Gun", () => {
    expect(effectRelevantTo(effect("radiant"), pkg("Truth"))).toBe(true);
  });

  it("keeps keywords on ability hits and states (U8): Spark of Shock, Lightning Surge", () => {
    const subclass = loadSubclassEffects(rawSubclass, { preBuilt: true });
    const of = (id: string) => subclass.find((e) => e.id === id)!;
    expect(effectRelevantTo(of("spark-of-shock"), testWeapon)).toBe(true);
    expect(
      effectRelevantTo(of("lightning-surge"), testWeapon, new Set(["amplified"])),
    ).toBe(true);
  });

  it("keeps a state-only item only if something needs its state (No Backup Plans needs Amplified)", () => {
    const ascension = loadSubclassEffects(rawSubclass, { preBuilt: true }).find(
      (e) => e.id === "ascension",
    )!;
    expect(effectRelevantTo(ascension, testWeapon)).toBe(false);
    expect(
      effectRelevantTo(ascension, testWeapon, new Set(["amplified"])),
    ).toBe(true);
  });
});

describe("neededStatuses", () => {
  it("collects the states that parts of the given effects require", () => {
    const surge = effect("surge-3x");
    const needing = {
      ...surge,
      parts: surge.parts.map((p) => ({ ...p, requiresStatus: ["amplified" as const] })),
    };
    expect([...neededStatuses([effect("weaken"), needing])]).toEqual(["amplified"]);
  });
});
