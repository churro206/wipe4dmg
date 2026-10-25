import { describe, expect, it } from "vitest";
import {
  abilityEntries,
  armorEntries,
  artifactEntries,
  buffEntries,
  classAbilityEntries,
  classPerkEntries,
  glossaryEntries,
  subclassItemEntries,
  weaponEntries,
} from "../scripts/lib/coverageCatalog";
import { CoverageCatalog, type CompendiumEntry } from "../src/data/schema";
import { realCatalog } from "./lib/coverageCatalogData";

const entry = (
  tab: string,
  section: string,
  name: string,
  text = `Text of ${name}.`,
  extra = "",
): CompendiumEntry => ({ tab, section, name, text, extra });

describe("weaponEntries", () => {
  const entries = [
    entry("Exotic Weapons", "Kinetic Slot Weapons", "Hawkmoon Paracausal Shot ↑Trance"),
    entry("Exotic Weapons", "Power Weapons", "Thunderlord Reign Havoc"),
    entry("Exotic Weapons", "Energy Slot Weapons", "Mystery Gun Some Frame"),
    entry("Exotic Weapons", "", "Header row"),
    entry("Weapon Perks", "Weapon Traits", "Hawkmoon Perk"),
  ];
  const names = [
    { name: "Hawkmoon", catalyst: true },
    { name: "Thunderlord", catalyst: true },
    { name: "Mystery Gun", catalyst: false },
  ];
  const weapons = [
    { id: "hawkmoon", name: "Hawkmoon", damageInstances: 1, intrinsics: 1, catalyst: true },
    { id: "thunderlord", name: "Thunderlord", damageInstances: 2, intrinsics: 0, catalyst: false },
  ];
  const result = weaponEntries({
    entries,
    names,
    weapons,
    gaps: [{ name: "Mystery Gun", reason: "no Quantum row" }],
  });
  const byName = (name: string) => result.find((e) => e.name === name)!;

  it("lists one row per exotic weapon, named by the longest weapon name the entry starts with", () => {
    expect(result.map((e) => e.name)).toEqual([
      "Hawkmoon",
      "Thunderlord",
      "Mystery Gun",
    ]);
    expect(byName("Hawkmoon").inGame).toBe(entries[0].text);
    expect(byName("Hawkmoon").group).toBe("Kinetic");
    expect(byName("Thunderlord").group).toBe("Power");
  });

  it("tells what the model has, the catalyst included", () => {
    expect(byName("Hawkmoon")).toMatchObject({
      status: "full",
      iconKey: "weapon:hawkmoon",
    });
    expect(byName("Hawkmoon").inCalculator).toContain("Catalyst");
    expect(byName("Thunderlord").inCalculator).toMatch(
      /Catalyst: without an effect/,
    );
  });

  it("gives the reason of a gap, and fails for an entry without a weapon name", () => {
    expect(byName("Mystery Gun")).toMatchObject({
      status: "missing",
      inCalculator: "Not imported: no Quantum row",
    });
    expect(() =>
      weaponEntries({
        entries: [entry("Exotic Weapons", "Power Weapons", "Unknown Gun")],
        names,
        weapons,
        gaps: [],
      }),
    ).toThrow(/Unknown Gun/);
  });
});

describe("armorEntries", () => {
  const armor = (
    id: string,
    name: string,
    kind: Parameters<typeof armorEntries>[0]["armor"][number]["kind"],
    column?: 1 | 2,
  ) => ({ id, name, guardianClass: "hunter" as const, kind, column });
  const compendium = [
    entry("Exotic Armors", "hunter", "Celestial Nighthawk"),
    entry("Exotic Armors", "hunter", "Lucky Pants"),
    entry("Exotic Armors", "hunter", "Cloak of Mist"),
    entry("Exotic Armors", "hunter", "Gap Boots"),
  ];
  const result = armorEntries({
    entries: compendium,
    armor: [
      armor("celestial-nighthawk", "Celestial Nighthawk", "abilityVariant"),
      armor("lucky-pants", "Lucky Pants", "noDamage"),
      armor("cloak-of-mist", "Cloak of Mist", "ownDamage"),
      armor("gap-boots", "Gap Boots", "gap"),
    ],
  });

  it("maps the kind of an exotic to a status with a reason", () => {
    expect(result.map((e) => [e.name, e.status])).toEqual([
      ["Celestial Nighthawk", "full"],
      ["Lucky Pants", "leftOut"],
      ["Cloak of Mist", "missing"],
      ["Gap Boots", "missing"],
    ]);
    expect(result[0].group).toBe("Hunter");
    expect(result[0].iconKey).toBe("armor:celestial-nighthawk");
  });

  it("marks a Compendium exotic without an item as missing and matches shortened names", () => {
    const [missing] = armorEntries({ entries: compendium, armor: [] });
    expect(missing).toMatchObject({ name: "Celestial Nighthawk", status: "missing" });
    const [short] = armorEntries({
      entries: [entry("Exotic Armors", "titan", "Loreley Splendor")],
      armor: [
        {
          id: "loreley-splendor-helm",
          name: "Loreley Splendor Helm",
          guardianClass: "titan",
          kind: "ownDamage",
        },
      ],
    });
    expect(short.iconKey).toBe("armor:loreley-splendor-helm");
  });
});

describe("classPerkEntries", () => {
  const entries = [
    entry("Exotic Class", "any", "Spirit of Verity"),
    entry("Exotic Class", "hunter", "Spirit of Nothing"),
  ];
  const result = classPerkEntries({
    entries,
    armor: [
      {
        id: "spirit-of-verity",
        name: "Spirit of Verity",
        guardianClass: null,
        kind: "damageBuff",
        column: 2,
      },
    ],
  });

  it("rates a perk of the model by its kind and marks a perk without an item as missing", () => {
    expect(result.map((e) => [e.group, e.name, e.status])).toEqual([
      ["Any class", "Spirit of Verity", "full"],
      ["Hunter", "Spirit of Nothing", "missing"],
    ]);
    expect(result[0].iconKey).toBe("armor:spirit-of-verity");
  });
});

describe("classAbilityEntries", () => {
  const entries = [
    entry("Solar", "Class Abilities", "Healing Rift", "Heals allies."),
    entry("Solar", "Class Abilities", "Empowering Rift", "Empowering buff."),
    entry("Class Abilities", "", "Marksman's Dodge", "Reloads the weapon."),
  ];
  const result = classAbilityEntries({
    entries,
    modelled: [{ tab: "Solar", entry: "Empowering Rift", id: "empowering-rift" }],
    effectNames: [],
  });

  it("tells modelled class abilities from those without a damage effect", () => {
    expect(result.map((e) => [e.name, e.status])).toEqual([
      ["Healing Rift", "leftOut"],
      ["Empowering Rift", "full"],
      ["Marksman's Dodge", "leftOut"],
    ]);
  });
});

describe("glossaryEntries", () => {
  const entries = [
    entry("Arc", "Glossary", "Jolted", "Jolted Enemies release chain lightning, dealing damage."),
    entry("Arc", "Glossary", "Blind", "Blinded enemies cannot see."),
    entry("Void", "Glossary", "Invisibility", "Invisible guardians deal 25% more damage."),
    entry("Arc", "Fragments", "Spark of Ions", "Fragment, not glossary."),
  ];
  const result = glossaryEntries({
    entries,
    keywordLinks: [{ tab: "Arc", entry: "Jolted" }],
    effectNames: [],
  });

  it("takes only glossary terms and rates them by keyword and damage words", () => {
    expect(result.map((e) => [e.name, e.status])).toEqual([
      ["Jolted", "full"],
      ["Blind", "leftOut"],
      ["Invisibility", "missing"],
    ]);
  });
});

describe("abilityEntries", () => {
  const compendium = [entry("Arc", "Super Abilities", "Chaos Reach", "A beam.")];
  const row = (
    extra: Partial<Parameters<typeof abilityEntries>[0][number]> = {},
  ) => ({
    kind: "super" as const,
    element: "Arc",
    name: "Chaos Reach",
    status: "package" as const,
    ...extra,
  });

  it("is full for a measured ability and approx for an estimated super window", () => {
    expect(abilityEntries([row({ superWindow: "exact" })], compendium)[0]).toMatchObject({
      status: "full",
      group: "Arc Supers",
      inGame: "A beam.",
    });
    expect(abilityEntries([row({ superWindow: "estimate" })], compendium)[0]).toMatchObject({
      status: "approx",
    });
  });

  it("gives the reason of a missing ability", () => {
    const [missing] = abilityEntries(
      [row({ status: "missing", reason: "noAegisRow" })],
      compendium,
    );
    expect(missing).toMatchObject({ status: "missing" });
    expect(missing.inCalculator).toMatch(/no Aegis measurement/);
  });
});

describe("subclassItemEntries", () => {
  const compendium = [
    entry("Solar", "Aspects", "Sol Invictus", "Sunspots grant Radiant."),
    entry("Prismatic", "Aspects", "Sol Invictus", "Prismatic text."),
    entry("Solar", "Fragments", "Ember of Ashes", "Scorch grows."),
  ];
  const row = (name: string, kind: Parameters<typeof subclassItemEntries>[0]["rows"][number]["kind"]) => ({
    id: name.toLowerCase().replace(/ /g, "-"),
    name,
    subclasses: "solar, prismatic",
    kind,
  });
  const rows = [row("Sol Invictus", "triggered"), row("Ember of Ashes", "noDamage")];

  it("splits aspects and fragments by the Compendium section", () => {
    const aspects = subclassItemEntries({ rows, entries: compendium, section: "aspect" });
    const fragments = subclassItemEntries({ rows, entries: compendium, section: "fragment" });
    expect(aspects.map((e) => e.name)).toEqual(["Sol Invictus"]);
    expect(aspects[0]).toMatchObject({
      group: "Solar",
      status: "full",
      inGame: "Sunspots grant Radiant.",
      iconKey: "effect:sol-invictus",
    });
    expect(fragments.map((e) => [e.name, e.status])).toEqual([
      ["Ember of Ashes", "leftOut"],
    ]);
  });

  it("joins the rows of an item: all in is full, some in is approx, none in is missing", () => {
    const status = (kinds: Parameters<typeof row>[1][]) =>
      subclassItemEntries({
        rows: kinds.map((kind) => row("Sol Invictus", kind)),
        entries: compendium,
        section: "aspect",
      }).map((e) => e.status);
    expect(status(["always", "triggered"])).toEqual(["full"]);
    expect(status(["always", "classAbility"])).toEqual(["approx"]);
    expect(status(["classAbility", "noDamage"])).toEqual(["missing"]);
  });
});

describe("buffEntries", () => {
  const court = [
    {
      category: "Global Debuffs",
      group: "WEAKEN",
      name: "Tractor Cannon",
      itemType: null,
      requirement: "",
      trigger: "Hit with the shot",
      pve: "30%",
      pveDuration: "5s",
      notes: "Stacks with nothing.",
    },
  ];
  const row = (verdict: Parameters<typeof buffEntries>[0]["rows"][number]["verdict"], target: string) => ({
    category: "Global Debuffs",
    group: "WEAKEN",
    name: "Tractor Cannon",
    verdict,
    target,
  });

  it("is full for imported rows and left out with the reason for skipped rows", () => {
    expect(buffEntries({ rows: [row("imported", "tractor-cannon")], court })[0]).toMatchObject({
      status: "full",
      group: "Global Debuffs",
    });
    expect(
      buffEntries({ rows: [row("skipped", "Only while solo")], court })[0],
    ).toMatchObject({ status: "leftOut", inCalculator: "Left out: Only while solo" });
  });

  it("leaves out exotic and weapon rows; they belong to Armor and Weapons", () => {
    expect(
      buffEntries({ rows: [row("exotic", ""), row("weapon", "")], court }),
    ).toEqual([]);
  });

  it("fails for an unclassified row", () => {
    expect(() => buffEntries({ rows: [row("unclassified", "")], court })).toThrow(
      /Tractor Cannon/,
    );
  });
});

describe("artifactEntries", () => {
  const compendium = [
    entry("Artifact Perks", "Encrypted Data Disk (Renegades)", "Sniper's Meditation", "Sniper text."),
    entry("Artifact Perks", "Encrypted Data Disk (Renegades)", "Bricks from Beyond", "Bricks text."),
  ];
  const result = artifactEntries({
    rows: [
      { artifact: "Encrypted Data Disk", season: "Renegades", tier: 1, perk: "Sniper's Meditation", verdict: "imported", target: "snipers-meditation" },
      { artifact: "Encrypted Data Disk", season: "Renegades", tier: 2, perk: "Bricks from Beyond", verdict: "skipped", target: "no damage effect" },
    ],
    entries: compendium,
  });

  it("groups by artifact and tells imported from skipped perks", () => {
    expect(result.map((e) => [e.group, e.name, e.status])).toEqual([
      ["Encrypted Data Disk (Renegades)", "Sniper's Meditation", "full"],
      ["Encrypted Data Disk (Renegades)", "Bricks from Beyond", "leftOut"],
    ]);
    expect(result[0].iconKey).toBe("artifact:encrypted-data-disk");
  });
});

describe("src/data/coverage-catalog.json", () => {
  const catalog = realCatalog();

  it("is up to date; run npm run coverage after changing data files", async () => {
    await expect(JSON.stringify(catalog, null, 2) + "\n").toMatchFileSnapshot(
      "../src/data/coverage-catalog.json",
    );
  });

  it("follows the schema and has the categories in the order of the page", () => {
    expect(() => CoverageCatalog.parse(catalog)).not.toThrow();
    expect(catalog.map((c) => c.id)).toEqual([
      "weapons",
      "class",
      "subclass",
      "abilities",
      "aspects",
      "fragments",
      "buffs",
      "armor",
      "artifacts",
    ]);
  });

  it("explains every entry once and gives a reason for everything not fully in", () => {
    for (const category of catalog) {
      expect(category.entries.length, category.title).toBeGreaterThan(0);
      const keys = category.entries.map((e) => `${e.group} | ${e.name}`);
      const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
      expect(duplicates, `${category.title}: duplicates`).toEqual([]);
      for (const e of category.entries) {
        expect(e.inGame, `${category.title}: ${e.name}`).not.toBe("");
        expect(e.inCalculator, `${category.title}: ${e.name}`).not.toBe("");
      }
    }
  });

  it("has the abilities the plausibility gate relies on", () => {
    const find = (id: string, name: string) =>
      catalog.find((c) => c.id === id)!.entries.find((e) => e.name === name);
    expect(find("abilities", "Thundercrash")?.status).not.toBe("missing");
    expect(find("abilities", "Song of Flame")?.status).toBe("missing");
    expect(find("weapons", "One Thousand Voices")?.status).toBe("full");
  });
});
