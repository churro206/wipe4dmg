import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  bonusQuotes,
  classifyExoticArmor,
  renderArmorImport,
  type ArmorImportInputs,
} from "../scripts/lib/exoticArmor";
import { loadArmorImportInputs } from "../scripts/lib/armorImportInputs";
import rawArmor from "../src/data/exotic-armor.json";
import { ExoticArmorEntry } from "../src/data/schema";

const piece = (name: string, description = "") => ({
  hash: name.length,
  name,
  guardianClass: "titan" as const,
  slot: "chest" as const,
  intrinsics: [`${name} Intrinsic`],
  description,
});
const court = (name: string, category: string, pve: string | null) => ({
  category,
  group: "",
  name,
  itemType: "Titan Chest",
  requirement: "",
  trigger: "kill",
  pve,
  pveDuration: pve === null ? null : "10s",
  notes: "",
});
const compendium = (name: string, text: string) => ({
  tab: "Exotic Armors",
  section: "titan",
  name,
  text,
  extra: "",
});

const inputs: ArmorImportInputs = {
  armor: [
    piece("Cuirass of the Falling Star"),
    piece("Mantle of Battle Harmony"),
    piece("Synthoceps"),
    piece("Peacekeepers"),
    piece("Antaeus Wards"),
    piece("Wormgod Caress"),
    piece("Liar's Handshake"),
    piece("Ophidia Spathe"),
    piece("Lunafaction Boots"),
    piece("Dunemarchers"),
    piece("An Insurmountable Skullfort", "Melee kills restore health."),
  ],
  aegisAbilities: [
    {
      id: "super-thundercrash-cuirass",
      assumptions: ["Cuirass of the Falling Star"],
    },
    { id: "super-thundercrash", assumptions: [] },
  ],
  court: [
    court("Mantle of Battle Harmony", "Weapon Surges", "25%"),
    court("Synthoceps", "Exotic Intrinsics", null),
    court("Peacekeepers", "Exotic Intrinsics", null),
    court("Liar's Handshake", "Exotic Intrinsics", null),
  ],
  courtCategories: [
    {
      name: "EXOTICS INTRINSICS",
      description:
        "An effect from Exotics applied directly onto your Weapon or Ability\nUnrelated to Debuffing, Empowering, or Surging",
      sources: "Most Exotic Weapons\nMost Exotic Armor",
      stacking: "Stacks with all other buffs\nand itself",
    },
  ],
  compendium: [
    compendium(
      "Synthoceps",
      "While surrounded: Super damage is increased by 50%.",
    ),
    compendium(
      "Antaeus Wards",
      "Reflected projectiles deal 25% increased damage.",
    ),
    compendium(
      "Wormgod Caress",
      "Grants 80% increased Melee Damage and 20% Increased Weapon Damage.",
    ),
    compendium("Liar's Handshake", "Deals 400% increased Melee Damage."),
    compendium(
      "Ophidia Spathe",
      "Grants 200% Increased Throwing Knife Damage.",
    ),
    compendium(
      "Lunafaction Boots",
      "Empowering Rifts grant 100% [50%] Increased Damage Falloff Distance.",
    ),
  ],
  clarity: [
    {
      hash: 1,
      name: "Glorious Charge",
      type: "Armor Trait Exotic",
      itemName: "Cuirass of the Falling Star",
      text: "Thundercrash deals 55% increased damage.",
    },
    {
      hash: 2,
      name: "Dune",
      type: "Armor Trait Exotic",
      itemName: "Dunemarchers",
      text: "Sprinting builds a linear damage charge.",
    },
    {
      hash: 3,
      name: "Peace",
      type: "Armor Trait Exotic",
      itemName: "Peacekeepers",
      text: "Submachine Guns reload while stowed.",
    },
    {
      hash: 4,
      name: "Wormgod",
      type: "Armor Trait Exotic",
      itemName: "Wormgod Caress",
      text: "Weapon damage increases are Empowering Buffs.",
    },
  ],
};

describe("bonusQuotes", () => {
  it("finds damage bonuses in several phrasings", () => {
    expect(
      bonusQuotes(
        "Thundercrash deals 55% increased damage. Ignitions deal 100% more damage.",
        "clarity",
      ),
    ).toEqual([
      {
        percent: 55,
        quote: "55% increased damage",
        source: "clarity",
        melee: false,
      },
      {
        percent: 100,
        quote: "100% more damage",
        source: "clarity",
        melee: false,
      },
    ]);
    expect(
      bonusQuotes("Melee damage is increased by 150%.", "compendium"),
    ).toEqual([
      {
        percent: 150,
        quote: "Melee damage is increased by 150%",
        source: "compendium",
        melee: true,
      },
    ]);
  });

  it("marks bonuses on melee damage, knives included", () => {
    expect(
      bonusQuotes("200% Increased Throwing Knife Damage", "compendium"),
    ).toMatchObject([{ percent: 200, melee: true }]);
  });

  it("ignores damage falloff distance", () => {
    expect(
      bonusQuotes(
        "100% [50%] Increased Damage Falloff Distance.",
        "compendium",
      ),
    ).toEqual([]);
  });

  it("ignores damage resistance", () => {
    expect(bonusQuotes("Grants 25% Damage Resist.", "clarity")).toEqual([]);
  });
});

describe("classifyExoticArmor", () => {
  const byName = Object.fromEntries(
    classifyExoticArmor(inputs).map((e) => [e.name, e]),
  );

  it("rule 1: an Aegis ability package assumes the exotic", () => {
    expect(byName["Cuirass of the Falling Star"]).toMatchObject({
      kind: "abilityVariant",
      rule: 1,
      aegisRowIds: ["super-thundercrash-cuirass"],
      bonuses: [{ percent: 55, source: "clarity" }],
    });
  });

  it("rule 2: a Court row with a value names the bucket", () => {
    expect(byName["Mantle of Battle Harmony"]).toMatchObject({
      kind: "damageBuff",
      rule: 2,
      courtBuffs: [{ bucketId: "surge", pve: "25%", pveDuration: "10s" }],
    });
  });

  it("rule 3: Court lists an exotic intrinsic, the value comes from the Compendium", () => {
    expect(byName.Synthoceps).toMatchObject({
      kind: "damageBuff",
      rule: 3,
      courtBuffs: [{ bucketId: "exoticIntrinsic", pve: null }],
      bonusBucket: { bucketId: "exoticIntrinsic", basis: "court" },
      bonuses: [{ percent: 50, source: "compendium" }],
    });
  });

  it("rule 3 with melee bonuses only is a gap: melee buffs add up, not modelled yet", () => {
    expect(byName["Liar's Handshake"]).toMatchObject({ kind: "gap", rule: 3 });
    expect(byName["Liar's Handshake"].reason).toContain("Melee");
  });

  it("rule 3 without a value is a gap", () => {
    expect(byName.Peacekeepers).toMatchObject({ kind: "gap", rule: 3 });
  });

  it("rule 4a: the text names the bucket", () => {
    expect(byName["Wormgod Caress"]).toMatchObject({
      kind: "damageBuff",
      rule: 4,
      bonusBucket: {
        bucketId: "empowering",
        basis: "text",
        quote: "Weapon damage increases are Empowering Buffs",
      },
    });
    expect(byName["Wormgod Caress"].reason).toContain("Melee");
  });

  it("rule 4b: otherwise Court's definition of exotic intrinsics names the bucket", () => {
    expect(byName["Antaeus Wards"]).toMatchObject({
      kind: "damageBuff",
      rule: 4,
      bonusBucket: {
        bucketId: "exoticIntrinsic",
        basis: "courtDefinition",
        quote:
          "An effect from Exotics applied directly onto your Weapon or Ability",
      },
    });
  });

  it("rule 4 with melee bonuses only is a gap", () => {
    expect(byName["Ophidia Spathe"]).toMatchObject({ kind: "gap", rule: 4 });
  });

  it("damage falloff is no damage bonus", () => {
    expect(byName["Lunafaction Boots"]).toMatchObject({ kind: "gap", rule: 5 });
  });

  it("rule 5: a text about damage without a clear bonus is a gap", () => {
    expect(byName.Dunemarchers).toMatchObject({ kind: "gap", rule: 5 });
  });

  it("rule 6: no damage word means no damage effect", () => {
    expect(byName["An Insurmountable Skullfort"]).toMatchObject({
      kind: "noDamage",
      rule: 6,
    });
  });
});

describe("generated files are current (run npm run build:armor)", () => {
  const entries = classifyExoticArmor(loadArmorImportInputs());

  it("exotic-armor.json", () => {
    expect(ExoticArmorEntry.array().parse(rawArmor)).toEqual(entries);
  });

  it("docs/armor-import.md", () => {
    expect(
      readFileSync("docs/armor-import.md", "utf8").replace(/\r\n/g, "\n"),
    ).toBe(renderArmorImport(entries));
  });

  it("keeps the exotics of E1 usable", () => {
    const kinds = Object.fromEntries(entries.map((e) => [e.name, e.kind]));
    expect(kinds["Cuirass of the Falling Star"]).toBe("abilityVariant");
    expect(kinds["Celestial Nighthawk"]).toBe("abilityVariant");
    expect(kinds["Dawn Chorus"]).toBe("abilityVariant");
    expect(kinds["Mantle of Battle Harmony"]).toBe("damageBuff");
  });
});
