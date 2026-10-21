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
  ],
  compendium: [
    compendium(
      "Synthoceps",
      "While surrounded: Melee damage is increased by 150%.",
    ),
    compendium(
      "Antaeus Wards",
      "Reflected projectiles deal 25% increased damage.",
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
      { percent: 55, quote: "55% increased damage", source: "clarity" },
      { percent: 100, quote: "100% more damage", source: "clarity" },
    ]);
    expect(
      bonusQuotes("Melee damage is increased by 150%.", "compendium"),
    ).toEqual([
      {
        percent: 150,
        quote: "damage is increased by 150%",
        source: "compendium",
      },
    ]);
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
      bonuses: [{ percent: 150, source: "compendium" }],
    });
  });

  it("rule 3 without a value is a gap", () => {
    expect(byName.Peacekeepers).toMatchObject({ kind: "gap", rule: 3 });
  });

  it("rule 4: a damage bonus without a bucket is a gap", () => {
    expect(byName["Antaeus Wards"]).toMatchObject({ kind: "gap", rule: 4 });
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
