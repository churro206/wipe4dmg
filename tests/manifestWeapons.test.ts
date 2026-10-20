// Exotic weapons from the Bungie manifest for the weapon import (ADR 0013): type, element, ammo,
// intrinsic, perks and catalyst perks.

import { describe, expect, it } from "vitest";
import {
  extractManifestWeapons,
  type WeaponManifestTables,
} from "../scripts/lib/manifestWeapons";
import rawManifestWeapons from "../src/data/manifest-weapons.json";
import { ManifestWeapons } from "../src/data/schema";

const INTRINSIC = 3956125808;
const PERKS = 4241085061;
const COSMETICS = 2048875504;

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
    ],
  },
});
const plug = (hash: number, name: string, plugCategoryIdentifier: string) => ({
  hash,
  displayProperties: { name },
  plug: { plugCategoryIdentifier },
});

const tables: WeaponManifestTables = {
  items: {
    1201830623: weapon(1201830623, "Truth", [10, 11, 12, 13, 14]),
    10: plug(10, "Prototype Trueseeker", "intrinsics"),
    11: plug(11, "Volatile Launch", "tubes"),
    15: plug(15, "Hard Launch", "tubes"),
    16: plug(16, "Empty Traits Socket", "frames"), // placeholder, left out
    12: plug(12, "Grenades and Horseshoes", "frames"),
    13: plug(13, "Kill Tracker", "v400.plugs.weapons.masterworks.trackers"),
    14: plug(14, "Default Ornament", "exotic_all_skins"),
    726894353: {
      hash: 726894353,
      displayProperties: { name: "Truth Catalyst" },
      traitIds: ["item.exotic_catalyst"],
      perks: [{ perkHash: 2225619423 }, { perkHash: 3469836202 }],
    },
    // An armor piece and a legendary weapon are left out.
    20: { hash: 20, displayProperties: { name: "Helm" }, itemType: 2 },
    21: {
      ...weapon(21, "Legendary", [10]),
      inventory: { tierType: 5 },
    },
  },
  plugSets: {
    900: { reusablePlugItems: [{ plugItemHash: 15 }, { plugItemHash: 16 }] },
  },
  sandboxPerks: {
    2225619423: { displayProperties: { name: "Reaper's Tithe" } },
    3469836202: { displayProperties: { name: "" } },
  },
};

describe("extractManifestWeapons", () => {
  it("reads type, element, ammo, intrinsic, perks and catalyst of an exotic weapon", () => {
    expect(extractManifestWeapons(tables)).toEqual([
      {
        hash: 1201830623,
        name: "Truth",
        weaponType: "rocketLauncher",
        element: "void",
        ammo: "heavy",
        intrinsics: ["Prototype Trueseeker"],
        perks: ["Grenades and Horseshoes", "Hard Launch", "Volatile Launch"],
        catalyst: { name: "Truth Catalyst", perks: ["Reaper's Tithe"] },
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

describe("manifest-weapons.json", () => {
  const { weapons } = ManifestWeapons.parse(rawManifestWeapons);

  it("holds the test cases Truth and Thunderlord", () => {
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

  it("has unique names and hashes", () => {
    expect(new Set(weapons.map((w) => w.name)).size).toBe(weapons.length);
    expect(new Set(weapons.map((w) => w.hash)).size).toBe(weapons.length);
  });
});
