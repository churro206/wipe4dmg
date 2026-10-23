// Exotic weapons and exotic armor from the Bungie manifest for the weapon import (ADR 0013):
// weapon type, element, ammo, perk names and texts, armor intrinsics, and a name lookup over the
// whole manifest for the assumptions of the Aegis rows.

import { describe, expect, it } from "vitest";
import {
  extractExoticArmor,
  extractManifestWeapons,
  lookupManifestTerms,
  type WeaponManifestTables,
} from "../scripts/lib/manifestWeapons";
import rawManifestArmor from "../src/data/manifest-armor.json";
import rawManifestTerms from "../src/data/manifest-terms.json";
import rawManifestWeapons from "../src/data/manifest-weapons.json";
import {
  ManifestArmor,
  ManifestTerms,
  ManifestWeapons,
} from "../src/data/schema";

const INTRINSIC = 3956125808;
const PERKS = 4241085061;
const COSMETICS = 2048875504;
const MODS = 2685412949;

// Shaped like the manifest of 2026-10-20 (version 245114.26.10.13.2000-1); hashes of plugs and
// plug sets are test input.
const weapon = (hash: number, name: string, sockets: number[]) => ({
  hash,
  displayProperties: { name },
  itemType: 3,
  itemSubType: 10, // rocket launcher
  defaultDamageType: 4, // void
  equippingBlock: { ammoType: 3 }, // heavy
  inventory: { tierType: 6 }, // exotic
  collectibleHash: 1763840761,
  sockets: {
    socketEntries: sockets.map((plug, i) => ({
      singleInitialItemHash: plug,
      reusablePlugSetHash: i === 1 ? 900 : undefined,
    })),
    socketCategories: [
      { socketCategoryHash: INTRINSIC, socketIndexes: [0] },
      { socketCategoryHash: PERKS, socketIndexes: [1, 2, 3] },
      { socketCategoryHash: COSMETICS, socketIndexes: [4] },
      { socketCategoryHash: MODS, socketIndexes: [5] },
    ],
  },
});
const plug = (
  hash: number,
  name: string,
  plugCategoryIdentifier: string,
  itemTypeDisplayName = "",
  description = "",
) => ({
  hash,
  displayProperties: { name, description },
  itemTypeDisplayName,
  plug: { plugCategoryIdentifier },
});

const tables: WeaponManifestTables = {
  items: {
    1201830623: {
      ...weapon(1201830623, "Truth", [10, 11, 12, 13, 14, 17]),
      stats: {
        stats: {
          4284893193: { statHash: 4284893193, value: 15 },
          3871231066: { statHash: 3871231066, value: 1 },
          1: { statHash: 1, value: 0 }, // zero, left out
          2: { statHash: 2, value: 7 }, // unnamed, left out
        },
      },
    },
    10: plug(
      10,
      "Prototype Trueseeker",
      "intrinsics",
      "Intrinsic",
      "This weapon's rockets have tracking.",
    ),
    11: plug(11, "Volatile Launch", "tubes", "Launcher Barrel"),
    15: plug(15, "Hard Launch", "tubes", "Launcher Barrel"),
    16: plug(16, "Empty Traits Socket", "frames"), // placeholder, left out
    12: plug(12, "Grenades and Horseshoes", "frames", "Trait"),
    13: plug(13, "Kill Tracker", "v400.plugs.weapons.masterworks.trackers"),
    14: plug(14, "Default Ornament", "exotic_all_skins"),
    17: plug(17, "Backup Mag", "v400.weapon.mod_magazine", "Weapon Mod"),
    726894353: {
      hash: 726894353,
      displayProperties: { name: "Truth Catalyst" },
      traitIds: ["item.exotic_catalyst"],
      perks: [{ perkHash: 2225619423 }, { perkHash: 3469836202 }],
      investmentStats: [{ statTypeHash: 4188031367, value: 20 }],
    },
    // Exotic leg armor of the hunter with an intrinsic that names a weapon type.
    300: {
      hash: 300,
      displayProperties: { name: "Lucky Pants" },
      itemType: 2,
      itemSubType: 29,
      classType: 1,
      inventory: { tierType: 6 },
      collectibleHash: 1,
      sockets: {
        socketEntries: [{ singleInitialItemHash: 30 }],
        socketCategories: [{ socketCategoryHash: 1, socketIndexes: [0] }],
      },
    },
    30: plug(
      30,
      "Illegally Modded Holster",
      "intrinsics",
      "Intrinsic",
      "Hand Cannons ready faster and gain increased accuracy and bonus damage.",
    ),
    40: plug(40, "Harsh Refraction", "artifact_perks", "Artifact Perk"),
    // A legendary weapon is left out.
    21: {
      ...weapon(21, "Legendary", [10]),
      inventory: { tierType: 5 },
    },
  },
  plugSets: {
    900: { reusablePlugItems: [{ plugItemHash: 15 }, { plugItemHash: 16 }] },
  },
  sandboxPerks: {
    2225619423: {
      displayProperties: {
        name: "Reaper's Tithe",
        description: "Multiple simultaneous final blows queue up a buff.",
      },
    },
    3469836202: { displayProperties: { name: "" } },
  },
  stats: {
    4284893193: { displayProperties: { name: "Rounds Per Minute" } },
    3871231066: { displayProperties: { name: "Magazine" } },
    4188031367: { displayProperties: { name: "Reload Speed" } },
    1: { displayProperties: { name: "Impact" } },
  },
};

describe("extractManifestWeapons", () => {
  it("reads type, element, ammo, perks, mods, catalyst and texts of an exotic weapon", () => {
    expect(extractManifestWeapons(tables)).toEqual([
      {
        hash: 1201830623,
        name: "Truth",
        weaponType: "rocketLauncher",
        element: "void",
        ammo: "heavy",
        intrinsics: ["Prototype Trueseeker"],
        perks: ["Grenades and Horseshoes", "Hard Launch", "Volatile Launch"],
        mods: ["Backup Mag"],
        catalyst: {
          name: "Truth Catalyst",
          hash: 726894353,
          perks: ["Reaper's Tithe"],
          stats: { "Reload Speed": 20 },
        },
        description:
          "This weapon's rockets have tracking.\nMultiple simultaneous final blows queue up a buff.",
        stats: { Magazine: 1, "Rounds Per Minute": 15 },
      },
    ]);
  });

  it("keeps one item per name: the one with a collectible and the most sockets", () => {
    const old = {
      ...weapon(5, "Truth", [10]),
      collectibleHash: undefined,
    };
    const result = extractManifestWeapons({
      ...tables,
      items: { ...tables.items, 5: old },
    });
    expect(result.map((w) => w.hash)).toEqual([1201830623]);
  });

  it("has no catalyst when the manifest names none", () => {
    const items = { ...tables.items };
    delete items[726894353];
    expect(extractManifestWeapons({ ...tables, items })[0].catalyst).toBe(null);
  });
});

describe("extractExoticArmor", () => {
  it("reads class, slot, intrinsic and its text", () => {
    expect(extractExoticArmor(tables)).toEqual([
      {
        hash: 300,
        name: "Lucky Pants",
        guardianClass: "hunter",
        slot: "legs",
        intrinsics: ["Illegally Modded Holster"],
        description:
          "Hand Cannons ready faster and gain increased accuracy and bonus damage.",
      },
    ]);
  });
});

describe("lookupManifestTerms", () => {
  it("finds item type and text of a name anywhere in the manifest, ignoring case", () => {
    expect(
      lookupManifestTerms(
        ["harsh refraction", "Illegally Modded Holster", "average"],
        tables,
      ),
    ).toEqual({
      "harsh refraction": [
        {
          itemType: "Artifact Perk",
          plugCategory: "artifact_perks",
          description: "",
        },
      ],
      "Illegally Modded Holster": [
        {
          itemType: "Intrinsic",
          plugCategory: "intrinsics",
          description:
            "Hand Cannons ready faster and gain increased accuracy and bonus damage.",
        },
      ],
    });
  });
});

describe("manifest data files", () => {
  const { weapons } = ManifestWeapons.parse(rawManifestWeapons);
  const { armor } = ManifestArmor.parse(rawManifestArmor);
  const { terms } = ManifestTerms.parse(rawManifestTerms);

  it("hold the test cases Truth and Thunderlord", () => {
    const truth = weapons.find((w) => w.name === "Truth");
    expect(truth).toMatchObject({
      weaponType: "rocketLauncher",
      element: "void",
      ammo: "heavy",
      intrinsics: ["Prototype Trueseeker"],
      catalyst: { perks: ["Reaper's Tithe"] },
    });
    expect(weapons.find((w) => w.name === "Thunderlord")).toMatchObject({
      weaponType: "machineGun",
      element: "arc",
      intrinsics: ["Reign Havoc"],
    });
  });

  it("have unique names and hashes", () => {
    expect(new Set(weapons.map((w) => w.name)).size).toBe(weapons.length);
    expect(new Set(weapons.map((w) => w.hash)).size).toBe(weapons.length);
    expect(new Set(armor.map((a) => a.name)).size).toBe(armor.length);
  });

  it("know Lucky Pants and its intrinsic", () => {
    expect(armor.find((a) => a.name === "Lucky Pants")).toMatchObject({
      guardianClass: "hunter",
      slot: "legs",
      intrinsics: ["Illegally Modded Holster"],
    });
    expect(terms["Illegally Modded Holster"]).toContainEqual(
      expect.objectContaining({
        itemType: "Intrinsic",
        plugCategory: "intrinsics",
      }),
    );
  });
});
