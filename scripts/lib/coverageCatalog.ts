// The catalog behind the wiki page "Coverage of the calculator": everything of the game by category,
// with what it does in the game and in the calculator. English, because players read it.
// Pure functions; tests/coverageCatalog.test.ts writes src/data/coverage-catalog.json (npm run coverage).

import type {
  AbilityKind,
  CatalogCategoryId,
  CatalogEntry,
  CatalogStatus,
  CatalystEffect,
  ClarityEntry,
  CompendiumEntry,
  CourtEntry,
  CoverageCatalog,
  ExoticArmorEntry,
  GapReason,
  ManifestSubclassItem,
  WeaponGap,
} from "../../src/data/schema.ts";
import type { ArtifactRow } from "./artifacts.ts";
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
  catalysts: "Catalysts",
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

/**
 * Game texts without the clutter of the sources: lines that are only "-" (empty cells of Court's
 * sheet), the credit line of Clarity, no-break spaces and repeated blank lines.
 */
export function tidyText(text: string): string {
  const lines = text
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "-" && !/^Clarity's .*Enjoy!/.test(line));
  return lines
    .filter((line, i) => line !== "" || (i > 0 && lines[i - 1] !== ""))
    .join("\n")
    .trim();
}
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
): { id: string; name: string; hash?: number }[] {
  const byId = new Map<string, { name: string; hash?: number }>();
  for (const { entries } of catalog) {
    for (const { iconKey, name, iconHash } of entries) {
      if (iconKey?.startsWith(NAMED_ICON) && !byId.has(iconKey)) {
        byId.set(iconKey, { name, ...(iconHash ? { hash: iconHash } : {}) });
      }
    }
  }
  return [...byId].map(([key, item]) => ({
    id: key.slice(NAMED_ICON.length),
    ...item,
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

/**
 * Text of the community database Clarity (src/data/clarity.json) as lines "Name: text", the entries
 * in the given order. Clarity is the text source of weapons, catalysts, armor, aspects and fragments;
 * the Compendium only fills in where Clarity has no entry (the entry then has fallback: true).
 */
function clarityBlock(entries: ClarityEntry[], withNames: boolean): string {
  return entries
    .map((e) => (withNames ? `${e.name}: ${tidyText(e.text)}` : tidyText(e.text)))
    .join("\n");
}

/** Clarity entries of one item (weapon, catalyst or armor piece) by their `itemName`, frames first. */
function clarityOf(
  clarity: ClarityEntry[],
  itemName: string,
  types: string[],
): ClarityEntry[] {
  return clarity
    .filter(
      (c) => c.itemName !== null && types.includes(c.type) && sameName(c.itemName, itemName),
    )
    .sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type));
}

/** The game text of an entry: Clarity, else the Compendium text marked as fallback. */
function inGameText(
  community: ClarityEntry[],
  compendium: string,
  withNames = true, // the name of the entry is the name of the perk or trait; false when it is the item's own
): Pick<CatalogEntry, "inGame" | "fallback"> {
  const texts = community.filter((c) => tidyText(c.text) !== ""); // some Clarity texts are empty
  return texts.length > 0
    ? { inGame: clarityBlock(texts, withNames) }
    : { inGame: tidyText(compendium), fallback: true };
}

export type WeaponInput = {
  id: string;
  name: string;
  damageInstances: number;
  intrinsics: number;
  // What the model does with the catalyst, null if the weapon has none in the model
  catalyst: { effect: CatalystEffect; lines: string[] } | null;
};

export type WeaponName = {
  name: string;
  hash: number; // the weapon in the manifest
  catalyst: { name: string; hash: number } | null; // the catalyst of the manifest
};

/** The exotic weapons of the Compendium, once each; the name is the longest manifest name the entry starts with. */
function compendiumWeapons(
  entries: CompendiumEntry[],
  names: WeaponName[],
): { known: WeaponName; entry: CompendiumEntry; group: string }[] {
  const seen = new Set<string>();
  const result: { known: WeaponName; entry: CompendiumEntry; group: string }[] = [];
  for (const entry of entries) {
    if (entry.tab !== "Exotic Weapons" || entry.section === "") continue;
    // The Compendium writes "Cerberus +1", the manifest "Cerberus+1": compare without spaces.
    const known = names
      .filter((n) => compact(entry.name).startsWith(compact(n.name)))
      .sort((a, b) => b.name.length - a.name.length)[0];
    if (!known) {
      throw new Error(`No weapon name for Compendium entry "${entry.name}"`);
    }
    if (seen.has(known.name)) continue;
    seen.add(known.name);
    result.push({ known, entry, group: entry.section.replace(/ (Slot )?Weapons$/, "") });
  }
  return result;
}

const WEAPON_TYPES = ["Weapon Frame Exotic", "Weapon Trait Exotic"];
const CATALYST_TYPES = ["Weapon Catalyst Exotic"];
const ARMOR_TYPES = ["Armor Trait Exotic"];

/** One row per exotic weapon: the game text is the frame and the traits of Clarity. */
export function weaponEntries(input: {
  entries: CompendiumEntry[];
  names: WeaponName[]; // all exotic weapons of the manifest
  weapons: WeaponInput[];
  gaps: WeaponGap[];
  clarity: ClarityEntry[];
}): CatalogEntry[] {
  return compendiumWeapons(input.entries, input.names).map(({ known, entry, group }) => {
    const base = {
      name: known.name,
      group,
      ...inGameText(clarityOf(input.clarity, known.name, WEAPON_TYPES), entry.text),
    };
    const weapon = input.weapons.find((w) => sameName(w.name, known.name));
    const gap = input.gaps.find((g) => sameName(g.name, known.name));
    return weapon
      ? make("full", {
          ...base,
          inCalculator: `${weapon.damageInstances} damage instance(s), ${weapon.intrinsics} intrinsic effect(s).`,
          iconKey: `weapon:${weapon.id}`,
        })
      : make("missing", {
          ...base,
          inCalculator: gap ? `Not imported: ${gap.reason}` : "Not imported yet.",
          iconHash: known.hash, // a weapon the model has no id for: exactly this item of the manifest
        });
  });
}

const CATALYST_STATUS: Record<CatalystEffect, [CatalogStatus, string]> = {
  damage: ["full", "Adds weapon damage."],
  timing: ["full", "Changes magazine, ammo or reload."],
  damageAndTiming: ["full", "Adds weapon damage and changes magazine, ammo or reload."],
  none: ["leftOut", "No effect against one boss without adds."],
  unknown: ["missing", "Not in the calculator yet: no source measured it."],
};

/**
 * One row per catalyst of an exotic weapon, named as in the game with the weapon in brackets
 * ("Truth Catalyst (Truth)"); the game text is the catalyst text of Clarity.
 */
export function catalystEntries(input: {
  entries: CompendiumEntry[];
  names: WeaponName[];
  weapons: WeaponInput[];
  clarity: ClarityEntry[];
}): CatalogEntry[] {
  return compendiumWeapons(input.entries, input.names).flatMap(({ known, group }) => {
    if (!known.catalyst) return [];
    const texts = clarityOf(input.clarity, known.name, CATALYST_TYPES)
      .map((c) => tidyText(c.text))
      .filter((text) => text !== "");
    const base = {
      name: `${known.catalyst.name} (${known.name})`,
      group,
      inGame: texts.length > 0 ? texts.join("\n") : "No text in Clarity.",
      iconHash: known.catalyst.hash,
    };
    const weapon = input.weapons.find((w) => sameName(w.name, known.name));
    if (!weapon) {
      return [make("missing", { ...base, inCalculator: "Not in the calculator yet: the weapon is not imported." })];
    }
    const effect = weapon.catalyst?.effect ?? "unknown";
    const [status, text] = CATALYST_STATUS[effect];
    const lines = weapon.catalyst?.lines ?? [];
    return [
      make(status, {
        ...base,
        inCalculator: lines.length > 0 ? lines.join("\n") : text,
      }),
    ];
  });
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
  text: Pick<CatalogEntry, "inGame" | "fallback">,
  armor: ArmorInput,
  group: string,
): CatalogEntry {
  const [status, calculator] = ARMOR_KIND[armor.kind];
  return make(status, {
    name: armor.name,
    group,
    ...text,
    inCalculator: status === "leftOut" ? `Left out: ${calculator}` : calculator,
    detail: SLOT_LABEL[armor.slot],
    iconKey: `armor:${armor.id}`,
  });
}

/**
 * Exotic armor pieces (tab Exotic Armors) and the perks of the Exotic Class Items (tab Exotic
 * Class), grouped by guardian class (then "Any class"), in a class by slot: helmet, arms, chest,
 * legs, class item, class item perks. A piece or perk the import has no item for (no plug in the
 * manifest, docs/known-inaccuracies.md) is missing. The game text of a piece is Clarity's armor
 * trait; Clarity has no text for the perks of the class items, so they use the Compendium (the one
 * exception to one text source per category).
 */
export function armorEntries(input: {
  entries: CompendiumEntry[];
  perks: CompendiumEntry[];
  armor: ArmorInput[];
  clarity: ClarityEntry[];
}): CatalogEntry[] {
  const rows = [
    ...input.entries.map((entry) => {
      // The Compendium shortens some names ("Loreley Splendor" for "Loreley Splendor Helm") and spells
      // one differently from the manifest ("Promethium Spurs", the manifest "Promethium Spur").
      const armor = input.armor
        .filter(
          (a) =>
            a.column === undefined &&
            (a.guardianClass === null || a.guardianClass === entry.section) &&
            (compact(a.name).startsWith(compact(entry.name)) ||
              compact(entry.name).startsWith(compact(a.name))),
        )
        .sort(
          (a, b) =>
            Math.abs(compact(a.name).length - compact(entry.name).length) -
            Math.abs(compact(b.name).length - compact(entry.name).length),
        )[0];
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
      const isPerk = slot === SLOT_ORDER.indexOf("classPerk");
      // Perks: Compendium text. Pieces: Clarity's trait, else the Compendium text as fallback.
      const text: Pick<CatalogEntry, "inGame" | "fallback"> = isPerk
        ? { inGame: tidyText(entry.text) }
        : inGameText(
            clarityOf(input.clarity, armor?.name ?? entry.name, ARMOR_TYPES),
            entry.text,
          );
      return armor
        ? armorEntry(text, armor, group)
        : make("missing", {
            name: entry.name,
            group,
            ...text,
            inCalculator: NO_ITEM,
            ...(isPerk ? { detail: SLOT_LABEL.classPerk } : {}),
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
        inGame: tidyText(e.text),
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
      const base = { name: e.name, group: e.tab, inGame: tidyText(e.text) };
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
      inGame: tidyText(
        entries.find((e) => e.tab === row.element && e.name === row.name)?.text ?? "",
      ),
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
 * Aspects or fragments: the review rows of the subclass effects with the text of Clarity. Aspects are
 * grouped by class and subclass ("Titan · Solar"), sorted by class, then subclass; fragments by subclass.
 */
export function subclassItemEntries(input: {
  rows: Pick<SubclassEffectRow, "id" | "name" | "subclasses" | "kind">[];
  items: Pick<ManifestSubclassItem, "name" | "guardianClass" | "subclass">[];
  entries: CompendiumEntry[];
  clarity: ClarityEntry[];
  section: "aspect" | "fragment";
}): CatalogEntry[] {
  const wanted = input.section === "aspect" ? /^aspects?$/i : /^fragments$/i;
  const clarityType = input.section === "aspect" ? "Subclass Aspect" : "Subclass Fragment";
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
    const community = input.clarity
      .filter((c) => c.type === clarityType && subclassItemNamed(first.name, c.name))
      .slice(0, 1);
    return [
      make(status, {
        name: first.name,
        group:
          input.section === "aspect"
            ? `${guardianClass ? capitalise(guardianClass) : "Any class"} · ${main.tab}`
            : main.tab,
        ...inGameText(community, main.text, false),
        inCalculator: status === "leftOut" ? `Left out: ${text}` : text,
        iconKey: `effect:${first.id}`,
        // The item itself: without an icon of its effect the import takes exactly this one
        ...(community[0] ? { iconHash: community[0].hash } : {}),
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

/**
 * A state of the game that stands for itself and is no part of one item (owner, 2026-10-25): what a
 * buff of an exotic, an aspect, a fragment, a super or an artifact does is told at that item.
 */
export type GeneralState = {
  name: string;
  category: string; // category of Court's sheet, e.g. "Global Debuffs"; gives the stacking rule
  court?: string; // row of Court's sheet with the trigger and the value; omitted: the category text
  iconKey: string;
};

/** The general buffs and debuffs, with the text of Court's Stacking Guide; one row per state. */
export function buffEntries(input: {
  states: GeneralState[];
  court: CourtEntry[];
  categories: { name: string; description: string; stacking: string }[];
}): CatalogEntry[] {
  return input.states.map((state) => {
    const category = input.categories.find(
      (c) => c.name.toLowerCase() === state.category.toLowerCase(),
    );
    if (!category) throw new Error(`${state.name}: no Court category "${state.category}"`);
    const row = state.court
      ? input.court.find(
          (c) =>
            c.name === state.court && c.category.toLowerCase() === state.category.toLowerCase(),
        )
      : undefined;
    if (state.court && !row) {
      throw new Error(`${state.name}: no Court row "${state.court}" in "${state.category}"`);
    }
    // "~" in Court's sheet means no fixed duration; what follows it says what the duration is
    const duration = flat(row?.pveDuration ?? "").replace(/^~\s*/, "");
    const value = row?.pve
      ? [`Value: ${flat(row.pve)}`, duration ? `Duration: ${duration}` : ""]
          .filter(Boolean)
          .join(" · ")
      : "";
    return make("full", {
      name: state.name,
      group: state.category,
      inGame: tidyText(
        [row ? row.trigger : category.description, value, `Stacking: ${flat(category.stacking)}`]
          .filter(Boolean)
          .join("\n"),
      ),
      inCalculator: "A switch in the Effects list.",
      iconKey: state.iconKey,
    });
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
      inGame: tidyText(
        input.entries.find((e) => e.section === group && e.name === row.perk)?.text ?? "",
      ),
    };
    return row.verdict === "imported"
      ? make("full", { ...base, inCalculator: "A switch in the Effects list." })
      : make("leftOut", { ...base, inCalculator: `Left out: ${row.target}` });
  });
}
