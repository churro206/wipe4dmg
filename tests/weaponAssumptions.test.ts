// Kinds of the assumptions in the Aegis weapon rows (ADR 0013, point 3) and the links between
// weapons, exotic armor and abilities (point 4).

import { describe, expect, it } from "vitest";
import { assumptionName } from "../scripts/lib/aegisWeapons";
import {
  abilityKindsNamed,
  armorForWeapon,
  classifyAssumption,
  type AssumptionContext,
} from "../scripts/lib/weaponAssumptions";
import rawAegis from "../src/data/aegis-weapons.json";
import rawEffects from "../src/data/effects.json";
import rawArmor from "../src/data/manifest-armor.json";
import rawTerms from "../src/data/manifest-terms.json";
import rawWeapons from "../src/data/manifest-weapons.json";
import {
  AegisWeaponSnapshot,
  ManifestArmor,
  ManifestTerms,
  ManifestWeapons,
  type ManifestArmorPiece,
  type ManifestWeapon,
} from "../src/data/schema";

// Test input shaped like manifest-weapons.json and manifest-armor.json of 2026-10-20.
const truth: ManifestWeapon = {
  hash: 1201830623,
  name: "Truth",
  weaponType: "rocketLauncher",
  element: "void",
  ammo: "heavy",
  intrinsics: ["Prototype Trueseeker"],
  perks: ["Grenades and Horseshoes", "Volatile Launch"],
  mods: ["Backup Mag"],
  catalyst: { name: "Truth Catalyst", perks: ["Reaper's Tithe"] },
  description: "This weapon's rockets have tracking.",
};
const eriana: ManifestWeapon = {
  ...truth,
  hash: 1,
  name: "Eriana's Vow",
  weaponType: "handCannon",
  intrinsics: ["Looks Can Kill"],
  perks: ["Death At First Glance"],
  mods: [],
  catalyst: null,
  description: "Grenade kills grant bonus melee damage.",
};
const luckyPants: ManifestArmorPiece = {
  hash: 2,
  name: "Lucky Pants",
  guardianClass: "hunter",
  slot: "legs",
  intrinsics: ["Illegally Modded Holster"],
  description:
    "Hand Cannons ready faster and gain increased accuracy and bonus damage.",
};
const context = (weapon: ManifestWeapon): AssumptionContext => ({
  weapon,
  effects: [
    { id: "ember-of-ashes", name: "Ember of Ashes" },
    { id: "weaken", name: "Weaken" },
  ],
  armor: [luckyPants],
  terms: {
    "Illegally Modded Holster": [
      { itemType: "Intrinsic", plugCategory: "intrinsics" },
    ],
    "Harsh Refraction": [
      { itemType: "Artifact Perk", plugCategory: "artifact_perks" },
    ],
    "Pack Hunter": [{ itemType: "Trait", plugCategory: "frames" }],
    "Impact Casing": [
      { itemType: "Weapon Mod", plugCategory: "v400.weapon.mod_damage" },
    ],
    "Celestial Nighthawk": [{ itemType: "Helmet", plugCategory: "" }],
  },
});
const kind = (assumption: string, weapon = truth) =>
  classifyAssumption(assumption, context(weapon));

describe("assumptionName", () => {
  it("drops the stack count and a remark in parentheses", () => {
    expect(assumptionName("Reaper's Tithe x4")).toBe("Reaper's Tithe");
    expect(assumptionName("Impact Core (solar)")).toBe("Impact Core");
    expect(assumptionName("average")).toBe("average");
  });
});

describe("classifyAssumption, stage 1: sockets of the weapon", () => {
  it("finds intrinsic, perk, mod and catalyst perk", () => {
    expect(kind("Prototype Trueseeker")).toEqual({
      kind: "intrinsic",
      stage: 1,
    });
    expect(kind("Volatile Launch")).toEqual({ kind: "perk", stage: 1 });
    expect(kind("Backup Mag")).toEqual({ kind: "weaponMod", stage: 1 });
    expect(kind("Reaper's Tithe x4")).toEqual({ kind: "catalyst", stage: 1 });
    expect(kind("catalyst")).toEqual({ kind: "catalyst", stage: 1 });
  });

  it("accepts a spelling up to 2 characters apart and says so", () => {
    expect(kind("Prototype Truthseeker")).toEqual({
      kind: "intrinsic",
      stage: 1,
      similarTo: "Prototype Trueseeker",
    });
  });
});

describe("classifyAssumption, stage 2: modelled effects", () => {
  it("finds an effect by name", () => {
    expect(kind("Ember of Ashes")).toEqual({
      kind: "effect",
      stage: 2,
      effectId: "ember-of-ashes",
    });
  });

  it("reads 'include' as an effect inside the value, but not 'exclude'", () => {
    expect(kind("Nightsworn ticks include weaken")).toEqual({
      kind: "effect",
      stage: 2,
      effectId: "weaken",
    });
    expect(kind("excludes weaken").kind).toBe("execution");
    expect(kind("weaken excluded").kind).toBe("execution");
  });
});

describe("classifyAssumption, stage 3: execution", () => {
  it.each([
    "average",
    "heavy",
    "body",
    "full mag",
    "1/3 charge",
    "fully charged",
    "projectile - spaced (~9m)",
    "62 impact",
    "7 shots",
    "3L1H1R",
    "1H2L",
    "Nano-Assault HLLHLLHLLHLLH",
    "with lightning strikes",
    "includes ignition/scorch",
    "excludes Bolt Charge",
    "Linear Fusion Mode",
    "entire turret duration",
    "Missile Loaded",
  ])("%s", (assumption) => {
    expect(kind(assumption)).toEqual({ kind: "execution", stage: 3 });
  });
});

describe("classifyAssumption, stage 4: whole manifest", () => {
  it("finds exotic armor by its name or its intrinsic", () => {
    expect(kind("Illegally Modded Holster", eriana)).toEqual({
      kind: "exoticArmor",
      stage: 4,
      armorName: "Lucky Pants",
    });
    expect(kind("Celestial Nighthawk")).toEqual({
      kind: "exoticArmor",
      stage: 4,
      armorName: "Celestial Nighthawk",
    });
  });

  it("tells artifact perks, weapon mods and perks of other weapons apart", () => {
    expect(kind("Harsh Refraction")).toEqual({
      kind: "artifactPerk",
      stage: 4,
    });
    expect(kind("Impact Casing")).toEqual({ kind: "weaponMod", stage: 4 });
    expect(kind("Pack Hunter")).toEqual({ kind: "foreignPerk", stage: 4 });
  });
});

describe("classifyAssumption, stage 5: default", () => {
  it("treats anything else as not modelled", () => {
    expect(kind("blighted")).toEqual({ kind: "notModelled", stage: 5 });
  });
});

describe("links between weapons, armor and abilities", () => {
  it("finds exotic armor that names the weapon type", () => {
    expect(armorForWeapon(eriana, [luckyPants])).toEqual(["Lucky Pants"]);
    expect(armorForWeapon(truth, [luckyPants])).toEqual([]);
  });

  it("finds ability kinds named in the texts of a weapon", () => {
    expect(abilityKindsNamed(eriana.description)).toEqual(["grenade", "melee"]);
    expect(abilityKindsNamed(truth.description)).toEqual([]);
  });
});

describe("real data", () => {
  const aegis = AegisWeaponSnapshot.parse(rawAegis);
  const { weapons } = ManifestWeapons.parse(rawWeapons);
  const { armor } = ManifestArmor.parse(rawArmor);
  const { terms } = ManifestTerms.parse(rawTerms);
  const effects = rawEffects.map(({ id, name }) => ({ id, name }));
  const real = (weaponName: string, assumption: string) =>
    classifyAssumption(assumption, {
      weapon: weapons.find((w) => w.name === weaponName)!,
      effects,
      armor,
      terms,
    });

  it("classifies the test cases and the owner's example", () => {
    expect(real("Truth", "Prototype Truthseeker").kind).toBe("intrinsic");
    expect(real("Truth", "Reaper's Tithe x4").kind).toBe("catalyst");
    expect(real("Thunderlord", "with lightning strikes").kind).toBe(
      "execution",
    );
    expect(real("Eriana's Vow", "Illegally Modded Holster")).toMatchObject({
      kind: "exoticArmor",
      armorName: "Lucky Pants",
    });
  });

  it("links Lucky Pants to hand cannons", () => {
    const vow = weapons.find((w) => w.name === "Eriana's Vow")!;
    expect(armorForWeapon(vow, armor)).toContain("Lucky Pants");
  });

  it("classifies every assumption of the rows in scope", () => {
    const byName = new Map(weapons.map((w) => [w.name, w]));
    for (const row of aegis.rows) {
      const weapon = byName.get(row.name);
      if (!weapon || weapon.ammo === "primary") continue;
      for (const assumption of row.assumptions) {
        expect(
          classifyAssumption(assumption, { weapon, effects, armor, terms })
            .kind,
        ).toBeTruthy();
      }
    }
  });
});
