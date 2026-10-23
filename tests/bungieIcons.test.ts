import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  abilityIconRefs,
  collectIconRefs,
  iconFileName,
} from "../scripts/lib/bungieIcons";
import rawAbilities from "../src/data/abilities.json";
import rawManifest from "../src/data/manifest-abilities.json";
import rawEffects from "../src/data/effects.json";
import rawSubclassEffects from "../src/data/subclass-effects.json";
import rawIconRefs from "../src/data/icon-refs.json";
import rawIcons from "../src/data/icons.json";
import rawManifestWeapons from "../src/data/manifest-weapons.json";
import rawPackages from "../src/data/weapon-packages.json";
import {
  AbilityData,
  IconIndex,
  IconRef,
  ManifestAbilities,
  ManifestWeapon,
  Weapon,
  type ManifestAbility,
} from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadEffects, loadSubclassEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";

const effects = loadEffects(rawEffects);
const weapons = [loadWeapon(raw)];
const manifestAbilities = ManifestAbilities.parse(rawManifest).abilities;
const abilityRefs = abilityIconRefs(
  AbilityData.array().parse(rawAbilities),
  manifestAbilities,
);
const extras = [...IconRef.array().parse(rawIconRefs), ...abilityRefs];

describe("collectIconRefs", () => {
  const refs = collectIconRefs(effects, weapons, extras);

  it("collects effects, weapons and extras under their keys", () => {
    const keys = refs.map((r) => r.key);
    expect(keys).toContain("effect:well-of-radiance");
    expect(keys).toContain("weapon:one-thousand-voices");
    expect(keys).toContain("subclass:warlock:solar");
  });

  it("uses the inventory item table for weapons", () => {
    const weapon = refs.find((r) => r.key === "weapon:one-thousand-voices")!;
    expect(weapon.manifestRef).toEqual({
      table: "DestinyInventoryItemDefinition",
      hash: weapons[0].manifestHash,
    });
  });

  it("rejects duplicate keys", () => {
    expect(() =>
      collectIconRefs(effects, weapons, [...extras, extras[0]]),
    ).toThrow(extras[0].key);
  });
});

describe("abilityIconRefs", () => {
  // Manifest items in the format of manifest-abilities.json; hashes are test inputs.
  const manifest: ManifestAbility[] = [
    {
      name: "Silence and Squall",
      kind: "super",
      guardianClass: "hunter",
      subclass: "prismatic",
      hash: 2,
    },
    {
      name: "Silence and Squall",
      kind: "super",
      guardianClass: "hunter",
      subclass: "stasis",
      hash: 1,
    },
  ];
  const ability = {
    id: "silence-and-squall",
    name: "Silence & Squall",
    kind: "super" as const,
    element: "stasis" as const,
  };

  it("uses the element item of the ability, despite another spelling", () => {
    expect(abilityIconRefs([ability], manifest)).toEqual([
      {
        key: "ability:silence-and-squall",
        manifestRef: { table: "DestinyInventoryItemDefinition", hash: 1 },
      },
    ]);
  });

  it("fails for an ability that is not in the manifest", () => {
    expect(() =>
      abilityIconRefs([{ ...ability, name: "Nope" }], manifest),
    ).toThrow(/Nope/);
  });
});

describe("iconFileName", () => {
  it("names the file after table and hash and keeps the extension", () => {
    expect(
      iconFileName(
        { table: "DestinyInventoryItemDefinition", hash: 123 },
        "/common/destiny2_content/icons/abc.png",
      ),
    ).toBe("icons/item-123.png");
    expect(
      iconFileName(
        { table: "DestinyTraitDefinition", hash: 7 },
        "/common/destiny2_content/icons/def.jpg",
      ),
    ).toBe("icons/trait-7.jpg");
  });

  it("rejects an icon path without a known image type", () => {
    expect(() =>
      iconFileName({ table: "DestinyStatDefinition", hash: 1 }, "/icons/x.gif"),
    ).toThrow();
  });
});

describe("icons data file", () => {
  const index = IconIndex.parse(rawIcons);

  // Aspects and fragments too: a new subclass item without a run of import:icons shows initials.
  const allEffects = [
    ...effects,
    ...loadSubclassEffects(rawSubclassEffects, { preBuilt: true }),
  ];

  it("has an icon for every effect, aspect, fragment, weapon, ability and extra", () => {
    expect(abilityRefs.length).toBeGreaterThan(0);
    for (const ref of collectIconRefs(allEffects, weapons, extras)) {
      expect(index.icons[ref.key], ref.key).toBeDefined();
    }
  });

  it("has an icon for every catalyst switch whose catalyst is in the manifest", () => {
    const manifest = ManifestWeapon.array().parse(rawManifestWeapons.weapons);
    const missing = Weapon.array()
      .parse(rawPackages)
      .filter(
        (w) =>
          w.catalyst !== undefined &&
          manifest.find((m) => m.hash === w.manifestHash)?.catalyst &&
          !index.icons[`catalyst:${w.id}`],
      )
      .map((w) => w.name);
    expect(missing).toEqual([]);
  });

  it("points only to files in public/icons", () => {
    for (const path of Object.values(index.icons)) {
      expect(existsSync(`public/${path}`), path).toBe(true);
    }
  });
});
