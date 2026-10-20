// What the UI needs to know about the chosen weapon (W1-6): catalyst, ignitions, relevant effects.

import { describe, expect, it } from "vitest";
import rawEffects from "../src/data/effects.json";
import rawPackages from "../src/data/weapon-packages.json";
import { loadEffects } from "../src/engine/loadData";
import { loadWeapons } from "../src/engine/loadWeapon";
import {
  effectRelevantTo,
  hasCatalyst,
  hasIgnition,
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
  it("is true only for weapons with a threshold part", () => {
    expect(hasIgnition(otv)).toBe(true);
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
});
