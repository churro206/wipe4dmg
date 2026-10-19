import { describe, expect, it } from "vitest";
import { extractManifestAbilities } from "../scripts/lib/manifestAbilities";
import rawManifestAbilities from "../src/data/manifest-abilities.json";
import { ManifestAbilities } from "../src/data/schema";

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

describe("manifest-abilities.json", () => {
  const data = ManifestAbilities.parse(rawManifestAbilities);

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
