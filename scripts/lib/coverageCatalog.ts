// The catalog behind the wiki page "Coverage of the calculator": everything of the game by category,
// with what it does in the game and in the calculator. English, because players read it.
// Pure functions; tests/coverageCatalog.test.ts writes src/data/coverage-catalog.json (npm run coverage).

import type {
  AbilityKind,
  CatalogCategoryId,
  CatalogEntry,
  CatalogStatus,
  CompendiumEntry,
  CourtEntry,
  CoverageCatalog,
  ExoticArmorEntry,
  GapReason,
  ManifestSubclassItem,
  WeaponGap,
} from "../../src/data/schema.ts";
import type { ArtifactRow } from "./artifacts.ts";
import type { BuffRow } from "./buffs.ts";
import { kebab, sameName } from "./exoticArmor.ts";
import { subclassItemNamed } from "./manifestAbilities.ts";
import {
  DAMAGE_WORD,
  type SubclassEffectKind,
  type SubclassEffectRow,
} from "./subclassEffects.ts";

// The rows of abilityCoverage (src/engine/coverage.ts); the scripts project cannot import the engine.
export type MissingReason =
  | GapReason
  | "noAegisRow"
  | "notYetModelled";

export type AbilityCoverageRow = {
  kind: AbilityKind;
  element: string;
  name: string;
  status: "components" | "package" | "effectOnly" | "missing";
  abilityId?: string;
  superWindow?: "exact" | "estimate" | "none";
  reason?: MissingReason;
};

export const REASON: Record<MissingReason, string> = {
  noAegisRow: "no Aegis measurement",
  aegisNotNormalised: "Aegis values not normalised (buffs in the value)",
  aegisOnlyWithUnmodelledBuffs:
    "Aegis only measures with buffs that are not an effect yet",
  effectNotModelled: "only gives a buff that is not an effect yet",
  noUsableData: "no usable data",
  notYetModelled: "not added yet",
};

const TITLES: Record<CatalogCategoryId, string> = {
  weapons: "Weapons",
  subclass: "Subclass",
  abilities: "Abilities",
  aspects: "Aspects",
  fragments: "Fragments",
  buffs: "Buffs and Debuffs",
  armor: "Armor",
  artifacts: "Artifacts",
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const flat = (text: string) => text.replace(/\s+/g, " ").trim();
// The Compendium leaves out a leading "The" ("Huckleberry" for "The Huckleberry").
const compact = (text: string) =>
  text
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/[*^]+$/, "")
    .replace(/^the\s+/, "")
    .replace(/\s+/g, "");
const NO_ITEM = "Not in the calculator yet: the import has no item for it.";
/** Prefix of the icon keys that the import finds by the name of the item (scripts/import-bungie-icons.ts). */
export const NAMED_ICON = "named:";

const make = (
  status: CatalogStatus,
  fields: Omit<CatalogEntry, "status">,
): CatalogEntry => ({ ...fields, status });

/** The entries that need an icon found by name, once per name; id is the key without its prefix. */
export function namedCatalogEntries(
  catalog: CoverageCatalog,
): { id: string; name: string }[] {
  const byId = new Map<string, string>();
  for (const { entries } of catalog) {
    for (const { iconKey, name } of entries) {
      if (iconKey?.startsWith(NAMED_ICON) && !byId.has(iconKey)) {
        byId.set(iconKey, name);
      }
    }
  }
  return [...byId].map(([key, name]) => ({
    id: key.slice(NAMED_ICON.length),
    name,
  }));
}

/**
 * The categories in the order of the page. An entry whose own icon key has no icon (or none at all,
 * e.g. an artifact perk) gets the key "named:<name>"; npm run import:icons finds that icon by the name.
 */
export function buildCatalog(
  parts: Record<CatalogCategoryId, CatalogEntry[]>,
  hasIcon: (key: string) => boolean,
): CoverageCatalog {
  return (Object.keys(TITLES) as CatalogCategoryId[]).map((id) => ({
    id,
    title: TITLES[id],
    entries: parts[id].map((entry) => ({
      ...entry,
      iconKey:
        entry.iconKey && hasIcon(entry.iconKey)
          ? entry.iconKey
          : `${NAMED_ICON}${kebab(entry.name)}`,
    })),
  }));
}

export type WeaponInput = {
  id: string;
  name: string;
  damageInstances: number;
  intrinsics: number;
  catalyst: boolean; // the model has an effect or a timing change of the catalyst
};

/** One row per exotic weapon of the Compendium; its name is the longest weapon name the entry starts with. */
export function weaponEntries(input: {
  entries: CompendiumEntry[];
  names: { name: string; catalyst: boolean }[]; // all exotic weapons of the manifest
  weapons: WeaponInput[];
  gaps: WeaponGap[];
}): CatalogEntry[] {
  const seen = new Set<string>();
  const result: CatalogEntry[] = [];
  for (const entry of input.entries) {
    if (entry.tab !== "Exotic Weapons" || entry.section === "") continue;
    // The Compendium writes "Cerberus +1", the manifest "Cerberus+1": compare without spaces.
    const known = input.names
      .filter((n) => compact(entry.name).startsWith(compact(n.name)))
      .sort((a, b) => b.name.length - a.name.length)[0];
    if (!known) {
      throw new Error(`No weapon name for Compendium entry "${entry.name}"`);
    }
    if (seen.has(known.name)) continue;
    seen.add(known.name);
    const base = {
      name: known.name,
      group: entry.section.replace(/ (Slot )?Weapons$/, ""),
      inGame: entry.text,
    };
    const weapon = input.weapons.find((w) => sameName(w.name, known.name));
    const gap = input.gaps.find((g) => sameName(g.name, known.name));
    if (weapon) {
      const catalyst = !known.catalyst
        ? "No Catalyst."
        : weapon.catalyst
          ? "Catalyst: modelled."
          : "Catalyst: without an effect in the calculator.";
      result.push(
        make("full", {
          ...base,
          inCalculator: `${weapon.damageInstances} damage instance(s), ${weapon.intrinsics} intrinsic effect(s). ${catalyst}`,
          iconKey: `weapon:${weapon.id}`,
        }),
      );
    } else {
      result.push(
        make("missing", {
          ...base,
          inCalculator: gap ? `Not imported: ${gap.reason}` : "Not imported yet.",
        }),
      );
    }
  }
  return result;
}

type ArmorInput = Pick<
  ExoticArmorEntry,
  "id" | "name" | "guardianClass" | "kind" | "slot"
> &
  Partial<Pick<ExoticArmorEntry, "column">>;

const CLASS_ORDER = ["hunter", "titan", "warlock", "any"];
const SLOT_ORDER: ExoticArmorEntry["slot"][] = [
  "helmet",
  "gauntlets",
  "chest",
  "legs",
  "classItem",
  "classPerk",
];
const SLOT_LABEL: Record<ExoticArmorEntry["slot"], string> = {
  helmet: "Helmet",
  gauntlets: "Arms",
  chest: "Chest",
  legs: "Legs",
  classItem: "Class item",
  classPerk: "Class item perk",
};
// A piece the import has no item for sits behind the pieces of its class, before the class item perks.
const UNKNOWN_SLOT = SLOT_ORDER.indexOf("classItem") + 0.5;

const ARMOR_KIND: Record<
  ExoticArmorEntry["kind"],
  [CatalogStatus, string]
> = {
  abilityVariant: ["full", "Changes an ability; Aegis measured it with this armor."],
  damageBuff: ["full", "Damage buff from Court's Stacking Guide, as an effect."],
  grantsEffect: ["full", "Grants an effect the calculator knows."],
  weaponTiming: ["full", "Changes the timing of the weapon."],
  ownDamage: ["missing", "Deals damage of its own; not modelled yet."],
  energyOnly: [
    "missing",
    "Only gives ability or super energy; the rotation sets the casts, so it has no effect yet.",
  ],
  gap: ["missing", "Has a damage effect without a usable value in the sources."],
  noDamage: ["leftOut", "No damage effect (survival, energy or movement only)."],
};

function armorEntry(
  entry: CompendiumEntry,
  armor: ArmorInput,
  group: string,
): CatalogEntry {
  const [status, text] = ARMOR_KIND[armor.kind];
  return make(status, {
    name: armor.name,
    group,
    inGame: entry.text,
    inCalculator: status === "leftOut" ? `Left out: ${text}` : text,
    detail: SLOT_LABEL[armor.slot],
    iconKey: `armor:${armor.id}`,
  });
}

/**
 * Exotic armor pieces (tab Exotic Armors) and the perks of the Exotic Class Items (tab Exotic
 * Class), grouped by guardian class (then "Any class"), in a class by slot: helmet, arms, chest,
 * legs, class item, class item perks. A piece or perk the import has no item for (no plug in the
 * manifest, docs/known-inaccuracies.md) is missing.
 */
export function armorEntries(input: {
  entries: CompendiumEntry[];
  perks: CompendiumEntry[];
  armor: ArmorInput[];
}): CatalogEntry[] {
  const rows = [
    ...input.entries.map((entry) => {
      // The Compendium shortens some names ("Loreley Splendor" for "Loreley Splendor Helm").
      const armor = input.armor
        .filter(
          (a) =>
            a.column === undefined &&
            (a.guardianClass === null || a.guardianClass === entry.section) &&
            compact(a.name).startsWith(compact(entry.name)),
        )
        .sort((a, b) => a.name.length - b.name.length)[0];
      return { entry, armor, slot: armor ? SLOT_ORDER.indexOf(armor.slot) : UNKNOWN_SLOT };
    }),
    ...input.perks.map((entry) => ({
      entry,
      armor: input.armor.find(
        (a) => a.column !== undefined && sameName(a.name, entry.name),
      ),
      slot: SLOT_ORDER.indexOf("classPerk"),
    })),
  ];
  return rows
    .sort(
      (a, b) =>
        CLASS_ORDER.indexOf(a.entry.section) - CLASS_ORDER.indexOf(b.entry.section) ||
        a.slot - b.slot,
    )
    .map(({ entry, armor, slot }) => {
      const group = entry.section === "any" ? "Any class" : capitalise(entry.section);
      return armor
        ? armorEntry(entry, armor, group)
        : make("missing", {
            name: entry.name,
            group,
            inGame: entry.text,
            inCalculator: NO_ITEM,
            ...(slot === SLOT_ORDER.indexOf("classPerk")
              ? { detail: SLOT_LABEL.classPerk }
              : {}),
          });
    });
}

/** Class abilities (rifts, barricades, dodges): in the model or with a reason by the damage words of the text. */
export function classAbilityEntries(input: {
  entries: CompendiumEntry[];
  modelled: { tab: string; entry: string; id: string }[];
  effectNames: string[];
}): CatalogEntry[] {
  // The tab "Class Abilities" is the list; the subclass tabs repeat some of them (Solar's Phoenix Dive).
  const listed = new Set(
    input.entries.filter((e) => e.tab === "Class Abilities").map((e) => e.name),
  );
  return input.entries
    .filter((e) =>
      e.tab === "Class Abilities"
        ? !e.name.startsWith("Class Abilities") // the heading row of the tab
        : e.section === "Class Abilities" && !listed.has(e.name),
    )
    .map((e) => {
      const base = {
        name: e.name,
        group: "Class abilities",
        inGame: e.text,
      };
      const ability = input.modelled.find(
        (m) => m.tab === e.tab && m.entry === e.name,
      );
      if (ability) {
        return make("full", {
          ...base,
          inCalculator: "Cast in the rotation; its damage and buffs count.",
          iconKey: `ability:${ability.id}`,
        });
      }
      if (input.effectNames.some((n) => sameName(n, e.name))) {
        return make("full", {
          ...base,
          inCalculator: "A switch in the Effects list.",
        });
      }
      return DAMAGE_WORD.test(e.text)
        ? make("missing", { ...base, inCalculator: "Not in the calculator yet." })
        : make("leftOut", { ...base, inCalculator: "Left out: no damage effect." });
    });
}

/** Glossary terms of the subclasses (Jolted, Scorch, Volatile, ...): keywords and statuses of the model. */
export function glossaryEntries(input: {
  entries: CompendiumEntry[];
  keywordLinks: { tab: string; entry: string }[];
  effectNames: string[];
}): CatalogEntry[] {
  return input.entries
    .filter((e) => e.section === "Glossary")
    .map((e) => {
      const base = { name: e.name, group: e.tab, inGame: e.text };
      if (input.keywordLinks.some((k) => k.tab === e.tab && k.entry === e.name)) {
        return make("full", {
          ...base,
          inCalculator: "A keyword with its own damage; the damage phase triggers it.",
        });
      }
      if (input.effectNames.some((n) => sameName(n, e.name))) {
        return make("full", { ...base, inCalculator: "A switch in the Effects list." });
      }
      return DAMAGE_WORD.test(e.text)
        ? make("missing", { ...base, inCalculator: "Not in the calculator yet." })
        : make("leftOut", { ...base, inCalculator: "Left out: no damage effect." });
    });
}

const ABILITY_GROUP: Record<AbilityKind, string> = {
  super: "Supers",
  grenade: "Grenades",
  melee: "Melees",
  classAbility: "Class abilities",
};

/** Supers, grenades and melees (rows of abilityCoverage) with the Compendium text. */
export function abilityEntries(
  rows: AbilityCoverageRow[],
  entries: CompendiumEntry[],
): CatalogEntry[] {
  return rows.map((row) => {
    const base = {
      name: row.name,
      group: `${row.element} ${ABILITY_GROUP[row.kind]}`,
      inGame:
        entries.find((e) => e.tab === row.element && e.name === row.name)?.text ?? "",
      ...(row.abilityId ? { iconKey: `ability:${row.abilityId}` } : {}),
    };
    if (row.status === "missing") {
      return make("missing", {
        ...base,
        inCalculator: `Not in yet: ${REASON[row.reason!]}.`,
      });
    }
    const text =
      row.status === "components"
        ? "Damage instances from the Compendium, checked against Aegis."
        : row.status === "package"
          ? "Damage per cast measured by Aegis."
          : "Only grants buffs; no damage of its own.";
    return row.superWindow === "estimate"
      ? make("approx", {
          ...base,
          inCalculator: `${text} The length of the Super is estimated.`,
        })
      : make("full", { ...base, inCalculator: text });
  });
}

const SUBCLASS_KIND: Record<SubclassEffectKind, [CatalogStatus, string]> = {
  always: ["full", "Active the whole damage phase."],
  preBuilt: ["full", "Counts as built up before the damage phase once it is chosen."],
  triggered: ["full", "Active in a window that the rotation opens."],
  abilityVariant: ["full", "Changes an ability; Aegis measured the variant."],
  ownDamage: ["full", "Deals damage of its own, measured by Aegis."],
  missingDuration: ["missing", "The sources give no duration."],
  rotation: ["missing", "Its trigger in the rotation is not modelled yet."],
  classAbility: ["missing", "Needs the class ability as trigger; not modelled yet."],
  keywordLater: ["missing", "Needs a keyword the calculator does not have yet."],
  bonusLater: ["missing", "Gives a bonus without a source for its bucket."],
  notAgainstBoss: ["leftOut", "Does not work against a boss."],
  noText: ["leftOut", "No text in the Compendium."],
  noDamage: ["leftOut", "No damage effect."],
};

const SUBCLASS_ORDER = ["Arc", "Solar", "Void", "Stasis", "Strand", "Prismatic"];

/**
 * Aspects or fragments: the review rows of the subclass effects with the Compendium text. Aspects are
 * grouped by class and subclass ("Titan · Solar"), sorted by class, then subclass; fragments by subclass.
 */
export function subclassItemEntries(input: {
  rows: Pick<SubclassEffectRow, "id" | "name" | "subclasses" | "kind">[];
  items: Pick<ManifestSubclassItem, "name" | "guardianClass" | "subclass">[];
  entries: CompendiumEntry[];
  section: "aspect" | "fragment";
}): CatalogEntry[] {
  const wanted = input.section === "aspect" ? /^aspects?$/i : /^fragments$/i;
  const texts = input.entries.filter((e) => /^(aspects?|fragments)$/i.test(e.section));
  // An item has one review row per effect it gives (rules A to H), e.g. Roaring Flames three.
  const rowsOfItem = new Map<string, typeof input.rows>();
  for (const row of input.rows) {
    rowsOfItem.set(row.name, [...(rowsOfItem.get(row.name) ?? []), row]);
  }
  const sortKey = (group: string) => {
    const [guardianClass, subclass] = group.split(" · ");
    return [
      CLASS_ORDER.indexOf(guardianClass.toLowerCase().replace("any class", "any")),
      SUBCLASS_ORDER.indexOf(subclass),
    ];
  };
  const entries = [...rowsOfItem.values()].flatMap((rows) => {
    const [first] = rows;
    const tabs = first.subclasses.split(", ");
    const main = texts
      .filter(
        (e) =>
          tabs.includes(e.tab.toLowerCase()) && subclassItemNamed(first.name, e.name),
      )
      .sort((a, b) => Number(a.tab === "Prismatic") - Number(b.tab === "Prismatic"))[0];
    if (!main || !wanted.test(main.section)) return [];
    const parts = rows.map((row) => SUBCLASS_KIND[row.kind]);
    const statuses = new Set(parts.map(([status]) => status));
    // All parts in: full. Some in, some not: approx. None in: missing beats left out.
    const status: CatalogStatus =
      statuses.size === 1
        ? parts[0][0]
        : statuses.has("full")
          ? "approx"
          : statuses.has("missing")
            ? "missing"
            : "leftOut";
    const text = [...new Set(parts.map(([, part]) => part))].join(" ");
    const ofItem = input.items.filter((i) => i.name === first.name);
    const guardianClass = (
      ofItem.find((i) => i.subclass === main.tab.toLowerCase()) ?? ofItem[0]
    )?.guardianClass;
    return [
      make(status, {
        name: first.name,
        group:
          input.section === "aspect"
            ? `${guardianClass ? capitalise(guardianClass) : "Any class"} · ${main.tab}`
            : main.tab,
        inGame: main.text,
        inCalculator: status === "leftOut" ? `Left out: ${text}` : text,
        iconKey: `effect:${first.id}`,
      }),
    ];
  });
  return input.section === "aspect"
    ? entries.sort((a, b) => {
        const [classA, subA] = sortKey(a.group);
        const [classB, subB] = sortKey(b.group);
        return classA - classB || subA - subB;
      })
    : entries;
}

/** Court's rows of global buffs and debuffs, surges and the like; exotic and weapon rows are elsewhere. */
export function buffEntries(input: {
  rows: BuffRow[];
  court: CourtEntry[];
}): CatalogEntry[] {
  return input.rows.flatMap((row) => {
    if (row.verdict === "exotic" || row.verdict === "weapon") return [];
    if (row.verdict === "unclassified") {
      throw new Error(`Unclassified Court row "${row.name}" (${row.category})`);
    }
    const court = input.court.find(
      (c) => c.category === row.category && c.group === row.group && c.name === row.name,
    );
    const base = {
      name: row.name,
      group: row.category,
      inGame: flat([court?.trigger, court?.notes].filter(Boolean).join(" ")) || row.group,
    };
    if (row.verdict === "skipped") {
      return [make("leftOut", { ...base, inCalculator: `Left out: ${row.target}` })];
    }
    // The target of an imported or covered row is the id of its effect, which has an icon of its own.
    const effectId = /^[a-z0-9-]+$/.test(row.target) ? row.target : undefined;
    return [
      make("full", {
        ...base,
        ...(effectId ? { iconKey: `effect:${effectId}` } : {}),
        inCalculator:
          row.verdict === "imported"
            ? "A switch in the Effects list, value and duration from Court."
            : row.verdict === "weaken"
              ? "Covered by the Weaken switch."
              : `Covered by: ${row.target}.`,
      }),
    ];
  });
}

/** Perks of the seasonal artifacts: those with an effect are switches, the rest is left out with the reason. */
export function artifactEntries(input: {
  rows: ArtifactRow[];
  entries: CompendiumEntry[];
}): CatalogEntry[] {
  return input.rows.map((row) => {
    if (row.verdict === "unclassified") {
      throw new Error(`Unclassified artifact perk "${row.perk}" (${row.artifact})`);
    }
    const group = `${row.artifact} (${row.season})`;
    const base = {
      name: row.perk,
      group,
      inGame:
        input.entries.find((e) => e.section === group && e.name === row.perk)?.text ?? "",
    };
    return row.verdict === "imported"
      ? make("full", { ...base, inCalculator: "A switch in the Effects list." })
      : make("leftOut", { ...base, inCalculator: `Left out: ${row.target}` });
  });
}
