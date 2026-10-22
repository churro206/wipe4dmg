import { describe, expect, it } from "vitest";
import {
  extractManifestAbilities,
  extractSubclassItems,
  subclassItemNamed,
  unreadSubclassCategories,
} from "../scripts/lib/manifestAbilities";
import rawCompendium from "../src/data/compendium-abilities.json";
import rawManifestAbilities from "../src/data/manifest-abilities.json";
import { CompendiumSnapshot, ManifestAbilities } from "../src/data/schema";

// Shortened items in the layout of DestinyInventoryItemDefinition; hashes are test inputs.
const item = (hash: number, name: string, category?: string) => ({
  hash,
  displayProperties: { name, icon: `/icons/${hash}.png`, hasIcon: true },
  ...(category ? { plug: { plugCategoryIdentifier: category } } : {}),
});
const items = {
  1: item(1, "Arcbolt Grenade", "shared.arc.grenades"),
  2: item(2, "Arcbolt Grenade", "hunter.prism.grenades"),
  3: item(3, "Golden Gun: Marksman", "hunter.solar.supers"),
  4: item(4, "Thunderclap", "titan.arc.melee"),
  5: item(5, "Hand Cannon Reserves", "enhancements.v2_arms"),
  6: item(6, "Some Weapon"),
  7: item(7, "Silence and Squall", "hunter.stasis.supers"),
};

describe("extractManifestAbilities", () => {
  const abilities = extractManifestAbilities(items);

  it("reads slot, class and subclass from the plug category", () => {
    expect(abilities).toContainEqual({
      name: "Golden Gun: Marksman",
      kind: "super",
      guardianClass: "hunter",
      subclass: "solar",
      hash: 3,
    });
    expect(abilities).toContainEqual({
      name: "Thunderclap",
      kind: "melee",
      guardianClass: "titan",
      subclass: "arc",
      hash: 4,
    });
  });

  it("marks grenades of an element as shared by all classes and maps prism to prismatic", () => {
    expect(abilities).toContainEqual({
      name: "Arcbolt Grenade",
      kind: "grenade",
      guardianClass: null,
      subclass: "arc",
      hash: 1,
    });
    expect(abilities).toContainEqual({
      name: "Arcbolt Grenade",
      kind: "grenade",
      guardianClass: "hunter",
      subclass: "prismatic",
      hash: 2,
    });
  });

  it("ignores items that are no ability", () => {
    expect(abilities.map((a) => a.hash).sort()).toEqual([1, 2, 3, 4, 7]);
  });

  it("is sorted by name, class and subclass, so a new import only shows real changes", () => {
    expect(abilities.map((a) => a.name)).toEqual([
      "Arcbolt Grenade",
      "Arcbolt Grenade",
      "Golden Gun: Marksman",
      "Silence and Squall",
      "Thunderclap",
    ]);
  });
});

describe("extractSubclassItems", () => {
  const subclassItems = extractSubclassItems({
    ...items,
    8: item(8, "Knock 'Em Down", "hunter.solar.aspects"),
    9: item(9, "Ember of Ashes", "shared.solar.trinkets"),
    10: item(10, "Facet of Courage", "shared.prism.trinkets"),
    11: item(11, "Empty Fragment Socket", "shared.solar.trinkets"),
    12: item(12, "Shatterdive", "hunter.stasis.totems"),
  });

  it("reads the older Stasis aspects (totems)", () => {
    expect(subclassItems).toContainEqual({
      name: "Shatterdive",
      kind: "aspect",
      guardianClass: "hunter",
      subclass: "stasis",
      hash: 12,
    });
  });

  it("reads aspects with their class and fragments for every class", () => {
    expect(subclassItems.filter((i) => i.hash !== 12)).toEqual([
      {
        name: "Ember of Ashes",
        kind: "fragment",
        guardianClass: null,
        subclass: "solar",
        hash: 9,
      },
      {
        name: "Facet of Courage",
        kind: "fragment",
        guardianClass: null,
        subclass: "prismatic",
        hash: 10,
      },
      {
        name: "Knock 'Em Down",
        kind: "aspect",
        guardianClass: "hunter",
        subclass: "solar",
        hash: 8,
      },
    ]);
  });

  it("names the plug categories that look like aspects or fragments but are not read", () => {
    expect(
      unreadSubclassCategories({ 12: item(12, "X", "warlock.prism.fragments_v2") }),
    ).toEqual(["warlock.prism.fragments_v2 (1: X)"]);
  });
});

describe("manifest-abilities.json", () => {
  const data = ManifestAbilities.parse(rawManifestAbilities);

  it("has a manifest item for every aspect and fragment of the Compendium", () => {
    // The Prismatic sections also list grenades, e.g. Hailfire Spike ("Prismatic Grenade")
    const compendium = CompendiumSnapshot.parse(rawCompendium).entries.filter(
      (e) =>
        /^(aspects?|fragments)$/i.test(e.section) &&
        !/^Prismatic Grenade/.test(e.text),
    );
    const missing = compendium.filter(
      (e) =>
        !(data.subclassItems ?? []).some(
          (m) =>
            m.subclass === e.tab.toLowerCase() &&
            subclassItemNamed(m.name, e.name),
        ),
    );
    expect(missing.map((e) => `${e.tab} ${e.name}`)).toEqual([]);
  });

  it("covers supers, grenades and melees of all three classes and Prismatic", () => {
    for (const kind of ["super", "grenade", "melee"] as const) {
      expect(
        data.abilities.some((a) => a.kind === kind),
        kind,
      ).toBe(true);
    }
    for (const guardianClass of ["titan", "hunter", "warlock"] as const) {
      expect(
        data.abilities.some(
          (a) =>
            a.guardianClass === guardianClass && a.subclass === "prismatic",
        ),
        guardianClass,
      ).toBe(true);
    }
  });
});
