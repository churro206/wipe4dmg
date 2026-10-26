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
    piece("Rain of Fire"),
    piece("Hazardous Propulsion"),
    piece("Boots of the Assembler"),
    piece("Wishful Ignorance"),
    piece("Athrys's Embrace"),
    piece("Dunemarchers"),
    piece("Speedloader Slacks"),
    piece("Crest of Alpha Lupi"),
    piece("Helm of Saint-14"),
    piece("Gemini Jester"),
    piece("Wings of Sacred Dawn"),
    piece("One-Eyed Mask"),
    piece("Mk. 44 Stand Asides"),
    piece("Armamentarium"),
    piece("Hoarfrost-Z"),
    piece(
      "Radiant Dance Machines",
      "Increases hip fire range for weapons that use Primary ammo.",
    ),
    piece("An Insurmountable Skullfort", "Melee kills restore health."),
    { ...piece("Stormdancer's Brace"), intrinsics: ["Ascending Amplitude"] },
  ],
  aegisAbilities: [
    {
      id: "super-thundercrash-cuirass",
      assumptions: ["Cuirass of the Falling Star"],
    },
    {
      id: "super-stormtrance-ascending-amplitude",
      assumptions: ["Ascending Amplitude"],
    },
    { id: "super-reflected", assumptions: ["Antaeus Wards Intrinsic"] },
    { id: "super-thundercrash", assumptions: [] },
  ],
  court: [
    court("Mantle of Battle Harmony", "Weapon Surges", "25%"),
    court("Hazardous Propulsion*", "Empowering Buffs", "35%"),
    court("Synthoceps", "Exotic Intrinsics", null),
    court("Peacekeepers", "Exotic Intrinsics", null),
    court("Liar's Handshake", "Exotic Intrinsics", null),
    court("Wishful Ignorance", "Exotic Intrinsics", null),
    court("Athrys's Embrace", "Exotic Intrinsics", null),
  ],
  effects: [
    { id: "radiant", name: "Radiant" },
    { id: "lumina-noble-rounds", name: "Lumina (Blessing of the Sky)" },
    {
      id: "banner-shield",
      name: "Weapons of Light (Banner Shield, Ward of Dawn)",
    },
  ],
  meleeNames: ["Frenzied Blade", "Weighted Throwing Knife"],
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
      "Rain of Fire",
      "Fusion Rifle Kills grant Radiant for 7.5 seconds.",
    ),
    compendium(
      "Boots of the Assembler",
      "Passively grants +30 Airborne Effectiveness to Lumina.\nEmpowering Rift Seeker: grants 35% [15%] increased damage for 5 seconds (Empowering Buff)",
    ),
    compendium(
      "Wishful Ignorance",
      "Wish-Dragon's Talons:\n25% | 60% | 120% Increased Flechette Storm and Frenzied Blade damage.",
    ),
    compendium(
      "Athrys's Embrace",
      "Strengthened Throwing Knife:\n300% [100%] increased Weighted Throwing Knife damage.",
    ),
    compendium(
      "Ophidia Spathe",
      "Grants 200% Increased Throwing Knife Damage.",
    ),
    compendium(
      "Lunafaction Boots",
      "+100 Reload Speed and 0.9x Reload Duration Multiplier. Empowering Rifts grant 100% [50%] Increased Damage Falloff Distance.",
    ),
    compendium(
      "Speedloader Slacks",
      "Tight Fit:\n+40 | +40 | +45 Reload Speed\n- | 0.925x | 0.89x Reload Duration Multiplier",
    ),
    compendium(
      "Crest of Alpha Lupi",
      "On Class Ability Usage: restores Health. Grants 20% Grenade Energy.",
    ),
    compendium(
      "Helm of Saint-14",
      "Weapons of Light from Ward of Dawn can now persist outside of the bubble for 15 seconds. Dealing damage grants stacks of The Saint.",
    ),
    compendium(
      "Gemini Jester",
      "Misdirection: Deals ~0 damage but counts as a Hit. Disorients Minors.",
    ),
    compendium(
      "Wings of Sacred Dawn",
      "Grants 15% Damage Resist. Solar Weapon Kills grant Restoration and refill stowed weapons.",
    ),
    compendium(
      "One-Eyed Mask",
      "Upon receiving damage: Highlights the first enemy that dealt damage. Killing it grants an Overshield.",
    ),
    compendium(
      "Mk. 44 Stand Asides",
      "While Juggernaut's Shield is active: Grants a stack of Bolt Charge every 1.5 seconds.",
    ),
    compendium("Armamentarium", "On Grenade Ability Usage: Refills Magazine."),
    compendium(
      "Hoarfrost-Z",
      "Barricades grant allies increased weapon reload speed and stability.",
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
      text: "Melee hits release chain lightning that deals 300 damage.",
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

  it("skips the PvP value in brackets", () => {
    expect(
      bonusQuotes("grants 35% [15%] increased damage", "compendium"),
    ).toMatchObject([{ percent: 35, quote: "35% [15%] increased damage" }]);
  });

  it("takes the highest of stacked values", () => {
    expect(
      bonusQuotes(
        "25% | 60% | 120% Increased Flechette Storm and Frenzied Blade damage.",
        "compendium",
      ),
    ).toMatchObject([{ percent: 120 }]);
  });

  it("marks bonuses that name a melee ability", () => {
    expect(
      bonusQuotes(
        "Talons: 120% Increased Flechette Storm and Frenzied Blade damage.",
        "compendium",
        ["Frenzied Blade"],
      ),
    ).toMatchObject([{ melee: true }]);
  });

  it("marks bonuses below a melee heading, but not a weapon bonus next to a melee bonus", () => {
    expect(
      bonusQuotes(
        "Strengthened Throwing Knife:\n• Deals 300% [100%] Increased Damage",
        "clarity",
      ),
    ).toMatchObject([{ percent: 300, melee: true }]);
    expect(
      bonusQuotes(
        "Burning Fists:\nx2 = 160% Melee Damage, and 20% Increased Weapon Damage.",
        "compendium",
      ),
    ).toMatchObject([{ percent: 20, melee: false }]);
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

  it("rule 1 also finds the exotic by its intrinsic, e.g. Ascending Amplitude", () => {
    expect(byName["Stormdancer's Brace"]).toMatchObject({
      kind: "abilityVariant",
      rule: 1,
      aegisRowIds: ["super-stormtrance-ascending-amplitude"],
    });
  });

  it("rule 1 skips an intrinsic that does not work against a boss, e.g. Biotic Enhancements", () => {
    expect(byName["Antaeus Wards"].aegisRowIds).toEqual([]);
  });

  it("rule 2 matches Court names with markers like *", () => {
    expect(byName["Hazardous Propulsion"]).toMatchObject({
      kind: "damageBuff",
      rule: 2,
      courtBuffs: [{ bucketId: "empowering", pve: "35%" }],
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

  it("rule 4c: the text grants a modelled effect", () => {
    expect(byName["Rain of Fire"]).toMatchObject({
      kind: "grantsEffect",
      rule: 4,
      grantsEffectIds: ["radiant"],
    });
  });

  it("rule 4c ignores names after 'to', e.g. airborne effectiveness to Lumina", () => {
    expect(byName["Boots of the Assembler"]).toMatchObject({
      kind: "damageBuff",
      rule: 4,
      grantsEffectIds: [],
      bonusBucket: { bucketId: "empowering", basis: "text" },
      bonuses: [{ percent: 35 }],
    });
  });

  it("melee abilities by name and knives with PvP values stay melee gaps", () => {
    expect(byName["Wishful Ignorance"]).toMatchObject({ kind: "gap", rule: 3 });
    expect(byName["Wishful Ignorance"].bonuses).toMatchObject([
      { percent: 120, melee: true },
    ]);
    expect(byName["Athrys's Embrace"].bonuses).toMatchObject([
      { percent: 300, melee: true },
    ]);
  });

  it("rule 5: a reload duration multiplier is weapon timing; damage falloff is no bonus", () => {
    expect(byName["Lunafaction Boots"]).toMatchObject({
      kind: "weaponTiming",
      rule: 5,
      bonuses: [],
      timing: { change: "reloadDuration", factor: 0.9 },
    });
  });

  it("rule 5: stacked reload factors take the strongest", () => {
    expect(byName["Speedloader Slacks"].timing).toMatchObject({
      factor: 0.89,
    });
  });

  it("rule 5: energy only is kept as its own kind (owner, 2026-10-21)", () => {
    expect(byName["Crest of Alpha Lupi"]).toMatchObject({
      kind: "energyOnly",
      rule: 5,
    });
  });

  it("rule 5: extending a buff the model keeps up anyway changes nothing", () => {
    expect(byName["Helm of Saint-14"]).toMatchObject({
      kind: "noDamage",
      rule: 5,
    });
    expect(byName["Helm of Saint-14"].reason).toContain("banner-shield");
  });

  it("rule 5: refilling stowed weapons only changes nothing for one weapon", () => {
    expect(byName["Wings of Sacred Dawn"]).toMatchObject({
      kind: "noDamage",
      rule: 5,
    });
  });

  it("rule 5: names the kind of timing a gap needs", () => {
    expect(byName.Armamentarium).toMatchObject({ kind: "gap", rule: 5 });
    expect(byName.Armamentarium.reason).toContain("Grenade");
    expect(byName["Hoarfrost-Z"].reason).toContain("Reload Speed");
  });

  it("rule 5: Bolt Charge is own damage", () => {
    expect(byName["Mk. 44 Stand Asides"]).toMatchObject({
      kind: "ownDamage",
      rule: 5,
    });
  });

  it("damage received, ~0 damage and ammo types are no damage or timing", () => {
    expect(byName["One-Eyed Mask"]).toMatchObject({ kind: "noDamage" });
    expect(byName["Gemini Jester"]).toMatchObject({ kind: "noDamage" });
    expect(byName["Radiant Dance Machines"]).toMatchObject({
      kind: "noDamage",
    });
  });

  it("rule 6: nothing about damage, timing or energy", () => {
    expect(byName["Gemini Jester"]).toMatchObject({
      kind: "noDamage",
      rule: 6,
    });
  });

  it("rule 5: own damage is kept as its own kind for later", () => {
    expect(byName.Dunemarchers).toMatchObject({ kind: "ownDamage", rule: 5 });
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
    expect(kinds["Stormdancer's Brace"]).toBe("abilityVariant");
    expect(kinds["Mantle of Battle Harmony"]).toBe("damageBuff");
    expect(kinds["Rain of Fire"]).toBe("grantsEffect");
    expect(kinds["Promethium Spur"]).toBe("grantsEffect");
  });
});
