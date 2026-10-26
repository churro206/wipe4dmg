import { describe, expect, it } from "vitest";
import {
  abilityEntries,
  armorEntries,
  artifactEntries,
  buffEntries,
  buildCatalog,
  catalystEntries,
  classAbilityEntries,
  glossaryEntries,
  namedCatalogEntries,
  subclassItemEntries,
  tidyText,
  weaponEntries,
} from "../scripts/lib/coverageCatalog";
import rawIcons from "../src/data/icons.json";
import {
  CoverageCatalog,
  type ClarityEntry,
  type CompendiumEntry,
} from "../src/data/schema";
import noIcon from "./fixtures/coverage-no-icon.json";
import textFallback from "./fixtures/coverage-text-fallback.json";
import { realCatalog } from "./lib/coverageCatalogData";

const icons: Record<string, string> = rawIcons.icons;

const entry = (
  tab: string,
  section: string,
  name: string,
  text = `Text of ${name}.`,
  extra = "",
): CompendiumEntry => ({ tab, section, name, text, extra });

const clarityEntry = (
  itemName: string | null,
  name: string,
  type: string,
  text: string,
  hash = 1,
): ClarityEntry => ({ hash, name, type, itemName, text });

describe("weaponEntries", () => {
  const entries = [
    entry("Exotic Weapons", "Kinetic Slot Weapons", "Hawkmoon Paracausal Shot ↑Trance"),
    entry("Exotic Weapons", "Power Weapons", "Thunderlord Reign Havoc"),
    entry("Exotic Weapons", "Energy Slot Weapons", "Mystery Gun Some Frame"),
    entry("Exotic Weapons", "", "Header row"),
    entry("Weapon Perks", "Weapon Traits", "Hawkmoon Perk"),
  ];
  const names = [
    { name: "Hawkmoon", hash: 1, catalyst: { name: "Hawkmoon Catalyst", hash: 11 } },
    { name: "Thunderlord", hash: 2, catalyst: { name: "Lightning Catalyst", hash: 22 } },
    { name: "Mystery Gun", hash: 3, catalyst: null },
  ];
  const weapons = [
    {
      id: "hawkmoon",
      name: "Hawkmoon",
      damageInstances: 1,
      intrinsics: 1,
      catalyst: { effect: "damage" as const, lines: ["+10% weapon damage"] },
    },
    {
      id: "thunderlord",
      name: "Thunderlord",
      damageInstances: 2,
      intrinsics: 0,
      catalyst: { effect: "none" as const, lines: [] },
    },
  ];
  const clarity = [
    clarityEntry("Hawkmoon", "Paracausal Shot", "Weapon Frame Exotic", "On kill, gain a stack.\n-\n-"),
    clarityEntry("Hawkmoon", "Hunter's Trance", "Weapon Trait Exotic", "Grants range."),
    clarityEntry("Hawkmoon", "Hawkmoon Catalyst", "Weapon Catalyst Exotic", "Adds a round.\nClarity's Exotic Weapon Insights built by Someone. Enjoy! ♥"),
  ];
  const result = weaponEntries({
    entries,
    names,
    weapons,
    gaps: [{ name: "Mystery Gun", reason: "no Quantum row" }],
    clarity,
  });
  const byName = (name: string) => result.find((e) => e.name === name)!;

  it("lists one row per exotic weapon, named by the longest weapon name the entry starts with", () => {
    expect(result.map((e) => e.name)).toEqual([
      "Hawkmoon",
      "Thunderlord",
      "Mystery Gun",
    ]);
    expect(byName("Hawkmoon").group).toBe("Kinetic");
    expect(byName("Thunderlord").group).toBe("Power");
  });

  it("tells the game text from Clarity, frame before trait, without clutter and without a type line", () => {
    expect(byName("Hawkmoon").inGame).toBe(
      "Paracausal Shot: On kill, gain a stack.\nHunter's Trance: Grants range.",
    );
    expect(byName("Hawkmoon").fallback).toBeUndefined();
  });

  it("uses the Compendium text, marked as fallback, only where Clarity has none", () => {
    expect(byName("Thunderlord")).toMatchObject({
      inGame: entries[1].text,
      fallback: true,
    });
  });

  it("tells what the model has; the catalyst has its own row", () => {
    expect(byName("Hawkmoon")).toMatchObject({
      status: "full",
      iconKey: "weapon:hawkmoon",
      inCalculator: "1 damage instance(s), 1 intrinsic effect(s).",
    });
  });

  it("gives the reason of a gap, and fails for an entry without a weapon name", () => {
    expect(byName("Mystery Gun")).toMatchObject({
      status: "missing",
      inCalculator: "Not imported: no Quantum row",
      iconHash: 3,
    });
    expect(() =>
      weaponEntries({
        entries: [entry("Exotic Weapons", "Power Weapons", "Unknown Gun")],
        names,
        weapons,
        gaps: [],
        clarity,
      }),
    ).toThrow(/Unknown Gun/);
  });

  describe("catalystEntries", () => {
    const catalysts = catalystEntries({ entries, names, weapons, clarity });

    it("names a catalyst after its weapon, only for weapons that have one", () => {
      expect(catalysts.map((e) => e.name)).toEqual([
        "Hawkmoon Catalyst",
        "Thunderlord Catalyst",
      ]);
      expect(catalysts[0]).toMatchObject({
        group: "Kinetic",
        iconHash: 11,
        inGame: "Adds a round.",
      });
    });

    it("rates the catalyst by what it does against one boss", () => {
      expect(catalysts[0]).toMatchObject({
        status: "full",
        inCalculator: "+10% weapon damage",
      });
      expect(catalysts[1].status).toBe("leftOut");
      const unknown = catalystEntries({
        entries,
        names,
        weapons: [{ ...weapons[0], catalyst: null }],
        clarity,
      });
      expect(unknown[0].status).toBe("missing");
    });
  });
});

describe("tidyText", () => {
  it("drops lines that are only a dash, the Clarity credit, no-break spaces and double blank lines", () => {
    expect(tidyText("On hit\n-\n-")).toBe("On hit");
    expect(tidyText("Text\nClarity's Exotic Weapon Insights built by Someone. Enjoy! ♥")).toBe("Text");
    expect(tidyText("A b\n\n\n\nC")).toBe("A b\n\nC");
  });
});

describe("armorEntries", () => {
  type Piece = Parameters<typeof armorEntries>[0]["armor"][number];
  const armor = (
    id: string,
    name: string,
    kind: Piece["kind"],
    slot: Piece["slot"] = "helmet",
    guardianClass: Piece["guardianClass"] = "hunter",
    column?: 1 | 2,
  ): Piece => ({ id, name, guardianClass, kind, slot, column });
  const compendium = [
    entry("Exotic Armors", "hunter", "Celestial Nighthawk"),
    entry("Exotic Armors", "hunter", "Lucky Pants"),
    entry("Exotic Armors", "hunter", "Cloak of Mist"),
    entry("Exotic Armors", "hunter", "Gap Boots"),
    entry("Exotic Armors", "hunter", "Energy Mask"),
    entry("Exotic Armors", "hunter", "Other Energy Mask"),
  ];
  const result = armorEntries({
    clarity: [clarityEntry("Celestial Nighthawk", "Golden Gun Trait", "Armor Trait Exotic", "One shot.\n-")],
    entries: compendium,
    perks: [],
    armor: [
      armor("celestial-nighthawk", "Celestial Nighthawk", "abilityVariant"),
      armor("lucky-pants", "Lucky Pants", "noDamage", "legs"),
      armor("cloak-of-mist", "Cloak of Mist", "ownDamage", "chest"),
      armor("gap-boots", "Gap Boots", "gap", "legs"),
      armor("energy-mask", "Energy Mask", "energyOnly"),
      armor("other-energy-mask", "Other Energy Mask", "energyOnly"),
    ],
    energyArmorIds: ["energy-mask"],
  });

  it("maps the kind of an exotic to a status with a reason", () => {
    const byName = (name: string) => result.find((e) => e.name === name)!;
    expect(byName("Celestial Nighthawk").status).toBe("full");
    expect(byName("Lucky Pants").status).toBe("leftOut");
    expect(byName("Cloak of Mist").status).toBe("missing");
    expect(byName("Gap Boots").status).toBe("missing");
    // energy only: in the calculator when the energy model has a modifier of it (K7)
    expect(byName("Energy Mask").status).toBe("full");
    expect(byName("Other Energy Mask").status).toBe("missing");
    expect(result[0].group).toBe("Hunter");
    expect(result[0].iconKey).toBe("armor:celestial-nighthawk");
  });

  it("takes the game text of a piece from Clarity and that of a class item perk from the Compendium", () => {
    expect(result[0].inGame).toBe("Golden Gun Trait: One shot.");
    expect(result[0].fallback).toBeUndefined();
    expect(result.find((e) => e.name === "Lucky Pants")).toMatchObject({
      inGame: "Text of Lucky Pants.",
      fallback: true,
    });
    const [perk] = armorEntries({
      clarity: [],
      entries: [],
      perks: [entry("Exotic Class", "any", "Spirit of Verity", "Grants damage.")],
      armor: [armor("spirit-of-verity", "Spirit of Verity", "damageBuff", "classPerk", null, 2)],
    });
    expect(perk).toMatchObject({ inGame: "Grants damage." });
    expect(perk.fallback).toBeUndefined();
  });

  it("sorts by class, then by slot: helmet, arms, chest, legs, class item, class item perks", () => {
    const piece = (name: string, section: string) =>
      entry("Exotic Armors", section, name);
    const sorted = armorEntries({
      clarity: [],
      entries: [
        piece("Warlock Legs", "warlock"),
        piece("Hunter Chest", "hunter"),
        piece("Titan Helm", "titan"),
        piece("Hunter Arms", "hunter"),
        piece("Hunter Class Item", "hunter"),
        piece("Hunter Legs", "hunter"),
        piece("Hunter Helm", "hunter"),
      ],
      perks: [
        entry("Exotic Class", "any", "Spirit of Verity"),
        entry("Exotic Class", "hunter", "Spirit of Nothing"),
      ],
      armor: [
        armor("w-legs", "Warlock Legs", "noDamage", "legs", "warlock"),
        armor("h-chest", "Hunter Chest", "noDamage", "chest"),
        armor("t-helm", "Titan Helm", "noDamage", "helmet", "titan"),
        armor("h-arms", "Hunter Arms", "noDamage", "gauntlets"),
        armor("h-class", "Hunter Class Item", "noDamage", "classItem"),
        armor("h-legs", "Hunter Legs", "noDamage", "legs"),
        armor("h-helm", "Hunter Helm", "noDamage", "helmet"),
        armor("spirit-of-verity", "Spirit of Verity", "damageBuff", "classPerk", null, 2),
      ],
    });
    expect(sorted.map((e) => [e.group, e.name, e.detail])).toEqual([
      ["Hunter", "Hunter Helm", "Helmet"],
      ["Hunter", "Hunter Arms", "Arms"],
      ["Hunter", "Hunter Chest", "Chest"],
      ["Hunter", "Hunter Legs", "Legs"],
      ["Hunter", "Hunter Class Item", "Class item"],
      ["Hunter", "Spirit of Nothing", "Class item perk"],
      ["Titan", "Titan Helm", "Helmet"],
      ["Warlock", "Warlock Legs", "Legs"],
      ["Any class", "Spirit of Verity", "Class item perk"],
    ]);
  });

  it("rates a class perk of the model by its kind and marks one without an item as missing", () => {
    const perks = armorEntries({
      clarity: [],
      entries: [],
      perks: [
        entry("Exotic Class", "any", "Spirit of Verity"),
        entry("Exotic Class", "hunter", "Spirit of Nothing"),
      ],
      armor: [
        armor("spirit-of-verity", "Spirit of Verity", "damageBuff", "classPerk", null, 2),
      ],
    });
    expect(perks.map((e) => [e.group, e.name, e.status])).toEqual([
      ["Hunter", "Spirit of Nothing", "missing"],
      ["Any class", "Spirit of Verity", "full"],
    ]);
    expect(perks[1].iconKey).toBe("armor:spirit-of-verity");
  });

  it("marks a Compendium exotic without an item as missing and matches shortened names", () => {
    const [missing] = armorEntries({ clarity: [], entries: compendium, perks: [], armor: [] });
    expect(missing).toMatchObject({ name: "Celestial Nighthawk", status: "missing" });
    const [short] = armorEntries({
      clarity: [],
      entries: [entry("Exotic Armors", "titan", "Loreley Splendor")],
      perks: [],
      armor: [armor("loreley-splendor-helm", "Loreley Splendor Helm", "ownDamage", "helmet", "titan")],
    });
    expect(short.iconKey).toBe("armor:loreley-splendor-helm");
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
    expect(new Set(result.map((e) => e.group))).toEqual(new Set(["Class abilities"]));
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
  const items = [
    { name: "Sol Invictus", guardianClass: "titan" as const, subclass: "solar" as const },
    { name: "Sol Invictus", guardianClass: "titan" as const, subclass: "prismatic" as const },
    { name: "Ember of Ashes", guardianClass: null, subclass: "solar" as const },
  ];

  const clarity = [
    clarityEntry(null, "Sol Invictus", "Subclass Aspect", "Sunspots grant Sol Invictus.\n• 100% faster.", 777),
  ];

  it("splits aspects and fragments by the Compendium section", () => {
    const aspects = subclassItemEntries({ rows, items, entries: compendium, clarity, section: "aspect" });
    const fragments = subclassItemEntries({ rows, items, entries: compendium, clarity, section: "fragment" });
    expect(aspects.map((e) => e.name)).toEqual(["Sol Invictus"]);
    expect(fragments[0].group).toBe("Solar");
    expect(aspects[0]).toMatchObject({
      group: "Titan · Solar",
      status: "full",
      iconKey: "effect:sol-invictus",
    });
    expect(fragments.map((e) => [e.name, e.status])).toEqual([
      ["Ember of Ashes", "leftOut"],
    ]);
  });

  it("takes the game text from Clarity and the item hash for the icon; the Compendium only as fallback", () => {
    const [aspect] = subclassItemEntries({ rows, items, entries: compendium, clarity, section: "aspect" });
    expect(aspect.inGame).toBe("Sunspots grant Sol Invictus.\n• 100% faster.");
    expect(aspect.iconHash).toBe(777);
    expect(aspect.fallback).toBeUndefined();
    const [fragment] = subclassItemEntries({ rows, items, entries: compendium, clarity, section: "fragment" });
    expect(fragment).toMatchObject({ inGame: "Scorch grows.", fallback: true });
  });

  it("joins the rows of an item: all in is full, some in is approx, none in is missing", () => {
    const status = (kinds: Parameters<typeof row>[1][]) =>
      subclassItemEntries({
        rows: kinds.map((kind) => row("Sol Invictus", kind)),
        items,
        entries: compendium,
        clarity: [],
        section: "aspect",
      }).map((e) => e.status);
    expect(status(["always", "triggered"])).toEqual(["full"]);
    expect(status(["always", "classAbility"])).toEqual(["approx"]);
    expect(status(["classAbility", "noDamage"])).toEqual(["missing"]);
  });

  it("sorts aspects by class (Hunter, Titan, Warlock), then by subclass (Arc, Solar, Void, ...)", () => {
    const texts = [
      entry("Void", "Aspects", "Void Aspect"),
      entry("Solar", "Aspects", "Warlock Solar Aspect"),
      entry("Arc", "Aspects", "Warlock Arc Aspect"),
      entry("Solar", "Aspects", "Hunter Solar Aspect"),
    ];
    const aspect = (name: string, guardianClass: "hunter" | "titan" | "warlock", subclass: "arc" | "solar" | "void") => ({
      item: { name, guardianClass, subclass },
      row: { id: name, name, subclasses: subclass, kind: "always" as const },
    });
    const all = [
      aspect("Void Aspect", "titan", "void"),
      aspect("Warlock Solar Aspect", "warlock", "solar"),
      aspect("Warlock Arc Aspect", "warlock", "arc"),
      aspect("Hunter Solar Aspect", "hunter", "solar"),
    ];
    const sorted = subclassItemEntries({
      rows: all.map((a) => a.row),
      items: all.map((a) => a.item),
      entries: texts,
      clarity: [],
      section: "aspect",
    });
    expect(sorted.map((e) => e.group)).toEqual([
      "Hunter · Solar",
      "Titan · Void",
      "Warlock · Arc",
      "Warlock · Solar",
    ]);
  });
});

describe("buffEntries", () => {
  const court = [
    {
      category: "Empowering Buffs",
      group: "ABILITIES",
      name: "Empowering Rift",
      itemType: "Warlock Class Ability",
      requirement: "",
      trigger: "Standing in an Empowering Rift",
      pve: "20%",
      pveDuration: "~\nlasts while in the Rift",
      notes: "-\n-",
    },
  ];
  const categories = [
    {
      name: "GLOBAL DEBUFFS",
      description: "An effect inflicted by us Guardians onto an enemy target",
      stacking: "Cannot stack with other Global Debuffs;\nhighest takes precedence",
    },
    {
      name: "EMPOWERING BUFFS",
      description: "An effect applied directly onto a Guardian",
      stacking: "Cannot stack with other Empowering Buffs",
    },
  ];
  const states = [
    { name: "Weaken", category: "Global Debuffs", iconKey: "effect:weaken" },
    {
      name: "Empowering Rift",
      category: "Empowering Buffs",
      court: "Empowering Rift",
      iconKey: "effect:empowering-rift",
    },
  ];
  const result = buffEntries({ states, court, categories });

  it("tells a general state with the row of Court where there is one, else with the category text", () => {
    expect(result[0]).toMatchObject({
      name: "Weaken",
      group: "Global Debuffs",
      status: "full",
      iconKey: "effect:weaken",
      inGame:
        "An effect inflicted by us Guardians onto an enemy target\nStacking: Cannot stack with other Global Debuffs; highest takes precedence",
    });
    expect(result[1].inGame).toBe(
      "Standing in an Empowering Rift\nValue: 20% · Duration: lasts while in the Rift\nStacking: Cannot stack with other Empowering Buffs",
    );
  });

  it("keeps no line that is only a dash and none of the buffs that belong to an item", () => {
    expect(result.every((e) => !/^-$/m.test(e.inGame))).toBe(true);
    expect(result.map((e) => e.name)).not.toContain("Praxic Blade");
  });

  it("fails for a state without its Court category or row", () => {
    expect(() =>
      buffEntries({ states: [{ ...states[0], category: "Nope" }], court, categories }),
    ).toThrow(/Nope/);
    expect(() =>
      buffEntries({ states: [{ ...states[1], court: "Nope" }], court, categories }),
    ).toThrow(/Nope/);
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
    // The perk has its own icon, found by its name (buildCatalog adds the key).
    expect(result[0].iconKey).toBeUndefined();
  });
});

describe("buildCatalog", () => {
  const entryOf = (name: string, iconKey?: string) => ({
    name,
    group: "Group",
    status: "full" as const,
    inGame: "Game.",
    inCalculator: "Calculator.",
    ...(iconKey ? { iconKey } : {}),
  });
  const empty = {
    weapons: [],
    catalysts: [],
    subclass: [],
    abilities: [],
    aspects: [],
    fragments: [],
    buffs: [],
    armor: [],
    artifacts: [],
  };

  it("keeps the order of the page, without a class category", () => {
    expect(buildCatalog(empty, () => true).map((c) => c.id)).toEqual([
      "weapons",
      "catalysts",
      "subclass",
      "abilities",
      "aspects",
      "fragments",
      "buffs",
      "armor",
      "artifacts",
    ]);
  });

  it("looks an icon up by the name of the entry when its own key has no icon", () => {
    const catalog = buildCatalog(
      {
        ...empty,
        weapons: [entryOf("Hawkmoon", "weapon:hawkmoon"), entryOf("Lost Gun", "weapon:lost-gun")],
        artifacts: [entryOf("Sniper's Meditation")],
      },
      (key) => key === "weapon:hawkmoon",
    );
    expect(catalog[0].entries.map((e) => e.iconKey)).toEqual([
      "weapon:hawkmoon",
      "named:lost-gun",
    ]);
    expect(catalog[8].entries[0].iconKey).toBe("named:snipers-meditation");
  });

  it("keeps the hash of the item an icon is looked up by", () => {
    const catalog = buildCatalog(
      { ...empty, catalysts: [{ ...entryOf("Truth Catalyst"), iconHash: 5 }] },
      () => false,
    );
    expect(namedCatalogEntries(catalog)).toEqual([
      { id: "truth-catalyst", name: "Truth Catalyst", hash: 5 },
    ]);
  });

  it("lists every name that needs an icon from the manifest once", () => {
    const catalog = buildCatalog(
      {
        ...empty,
        weapons: [entryOf("Hawkmoon", "weapon:hawkmoon")],
        artifacts: [entryOf("Horde Shuttle"), entryOf("Horde Shuttle"), entryOf("Torch")],
      },
      (key) => key === "weapon:hawkmoon",
    );
    expect(namedCatalogEntries(catalog)).toEqual([
      { id: "horde-shuttle", name: "Horde Shuttle" },
      { id: "torch", name: "Torch" },
    ]);
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
      "catalysts",
      "subclass",
      "abilities",
      "aspects",
      "fragments",
      "buffs",
      "armor",
      "artifacts",
    ]);
  });

  it("tells the game text of weapons, catalysts, aspects, fragments and armor from Clarity, with the listed exceptions", () => {
    const fallback = catalog.flatMap((c) =>
      c.entries.filter((e) => e.fallback).map((e) => `${c.id}: ${e.name}`),
    );
    expect(fallback).toEqual(textFallback.entries);
  });

  it("has no clutter left in a game text: no line that is only a dash, no credit of Clarity", () => {
    for (const category of catalog) {
      for (const e of category.entries) {
        expect(e.inGame, `${category.id}: ${e.name}`).not.toMatch(/^-$/m);
        expect(e.inGame, `${category.id}: ${e.name}`).not.toMatch(/Clarity's/);
      }
    }
  });

  it("names catalysts after their weapon, and keeps the buffs to general states", () => {
    const entries = (id: string) => catalog.find((c) => c.id === id)!.entries;
    expect(entries("catalysts").every((e) => e.name.endsWith(" Catalyst"))).toBe(true);
    expect(entries("catalysts").map((e) => e.name)).toContain("Ace of Spades Catalyst");
    const buffs = entries("buffs").map((e) => e.name);
    expect(buffs).toContain("Weaken");
    expect(buffs).not.toContain("Praxic Blade");
    expect(buffs).not.toContain("Heartshadow");
  });

  it("puts class abilities into Abilities and the class item perks into Armor", () => {
    const entries = (id: string) => catalog.find((c) => c.id === id)!.entries;
    expect(
      entries("abilities").filter((e) => e.group === "Class abilities").length,
    ).toBeGreaterThan(0);
    expect(
      entries("armor").some((e) => e.name === "Spirit of Verity" && e.group === "Any class"),
    ).toBe(true);
  });

  it("gives every entry an icon key that the icon index knows, except the listed ones", () => {
    // Names the manifest has no item with an icon for; they show two letters (npm run import:icons warns).
    const withoutIcon = catalog.flatMap((c) =>
      c.entries.filter((e) => !e.iconKey || !(e.iconKey in icons)).map((e) => `${c.id}: ${e.name}`),
    );
    expect(withoutIcon).toEqual(noIcon.entries);
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
    expect(find("abilities", "Hammer of Sol (Sol Invictus Aspect)")?.status).toBe("missing");
    expect(find("weapons", "One Thousand Voices")?.status).toBe("full");
  });
});
