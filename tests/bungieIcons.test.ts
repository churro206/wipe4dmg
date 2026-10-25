import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  abilityIconRefs,
  collectIconRefs,
  iconFileName,
  namedIconRefs,
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
import { itemsOfAbility } from "../src/engine/abilityNames";

const effects = loadEffects(rawEffects);
const weapons = [loadWeapon(raw)];
const manifestAbilities = ManifestAbilities.parse(rawManifest).abilities;
// the Prismatic grenades of Transcendence are no plug of the manifest abilities: icon by name
const abilityRefs = abilityIconRefs(
  AbilityData.array()
    .parse(rawAbilities)
    .filter((a) => itemsOfAbility(manifestAbilities, a).length > 0),
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

  it("adds an icon per element for a class ability", () => {
    const rift = (subclass: string, hash: number): ManifestAbility => ({
      name: "Healing Rift",
      kind: "classAbility",
      guardianClass: "warlock",
      subclass,
      hash,
    });
    const refs = abilityIconRefs(
      [
        {
          id: "healing-rift",
          name: "Healing Rift",
          kind: "classAbility",
          element: "kinetic",
        },
      ],
      [rift("prismatic", 5), rift("arc", 3), rift("solar", 4)],
    );
    expect(refs.map((r) => [r.key, r.manifestRef.hash])).toEqual([
      ["ability:healing-rift", 5],
      ["ability:healing-rift:arc", 3],
      ["ability:healing-rift:solar", 4],
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

describe("namedIconRefs", () => {
  const items = {
    "1": { hash: 1, displayProperties: { name: "Argent Blade", hasIcon: true } },
    "2": { hash: 2, displayProperties: { name: "Remote Shield", hasIcon: true } },
    "3": { hash: 3, displayProperties: { name: "Supernova", hasIcon: false } },
  };
  const effect = (id: string, name: string) => ({ ...effects[0], id, name });

  it("finds the item by the name of the effect, without a trailing bracket", () => {
    const { refs, missing } = namedIconRefs(
      [effect("argent-blade", "Argent Blade"), effect("remote-shield", "Remote Shield (Edge of Action)")],
      items,
    );
    expect(refs.map((r) => [r.key, r.manifestRef.hash])).toEqual([
      ["effect:argent-blade", 1],
      ["effect:remote-shield", 2],
    ]);
    expect(missing).toEqual([]);
  });

  it("names the effects without an item that has an icon", () => {
    const { refs, missing } = namedIconRefs([effect("supernova", "Supernova")], items);
    expect(refs).toEqual([]);
    expect(missing).toEqual(["supernova"]);
  });

  describe("with several items of one name", () => {
    // The Thick of It is an artifact perk (a mod) and also an emblem and a weapon.
    const same = {
      "10": { hash: 10, itemType: 14, displayProperties: { name: "The Thick of It", hasIcon: true } },
      "11": { hash: 11, itemType: 3, displayProperties: { name: "The Thick of It", hasIcon: true } },
      "12": { hash: 12, itemType: 19, displayProperties: { name: "The Thick of It", hasIcon: true } },
      "13": { hash: 13, displayProperties: { name: "Gold from Lead", hasIcon: true } },
      "14": { hash: 14, itemType: 14, displayProperties: { name: "Gold from Lead", hasIcon: true } },
    };

    it("takes the mod before emblems and weapons, and an item of unknown type before an emblem", () => {
      const { refs, ambiguous } = namedIconRefs(
        [effect("the-thick-of-it", "The Thick of It"), effect("gold-from-lead", "Gold from Lead")],
        same,
      );
      expect(refs.map((r) => r.manifestRef.hash)).toEqual([12, 13]);
      expect(ambiguous[0]).toMatch(/The Thick of It: took 12/);
    });

    it("takes an artifact perk before a weapon ornament, which is a mod with a weapon's picture", () => {
      const { refs } = namedIconRefs([effect("wind-chill", "Wind Chill")], {
        "20": {
          hash: 20,
          itemType: 19,
          itemTypeDisplayName: "Weapon Ornament",
          plug: { plugCategoryIdentifier: "v470_events_dawning_submachinegun0_skins" },
          displayProperties: { name: "Wind Chill", hasIcon: true },
        },
        "21": {
          hash: 21,
          itemType: 19,
          itemTypeDisplayName: "Artifact Perk",
          plug: { plugCategoryIdentifier: "artifact_perks" },
          displayProperties: { name: "Wind Chill", hasIcon: true },
        },
      });
      expect(refs.map((r) => r.manifestRef.hash)).toEqual([21]);
    });

    it("compares names without regard to case", () => {
      const { refs } = namedIconRefs([effect("wished", "Wished Into Being")], {
        "30": { hash: 30, displayProperties: { name: "Wished into Being", hasIcon: true } },
      });
      expect(refs.map((r) => r.manifestRef.hash)).toEqual([30]);
    });

    it("takes exactly the item of a hash that has an icon, else looks up the name", () => {
      const { refs } = namedIconRefs(
        [
          { ...effect("a", "The Thick of It"), hash: 10 },
          { ...effect("b", "The Thick of It"), hash: 999 },
        ],
        same,
      );
      expect(refs.map((r) => r.manifestRef.hash)).toEqual([10, 12]);
    });
  });
});
