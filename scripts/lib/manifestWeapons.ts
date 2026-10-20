// Extracts exotic weapons and exotic armor from the manifest (ADR 0013): weapon type, element, ammo,
// the names of intrinsic, perks, mods and catalyst perks with their texts, and the intrinsic of
// each exotic armor piece. The weapon import matches these names against the assumptions of the
// Aegis rows and finds armor that names a weapon type.

import type {
  Element,
  GuardianClass,
  ManifestArmorPiece,
  ManifestTerms,
  ManifestWeapon,
  WeaponType,
} from "../../src/data/schema.ts";

const WEAPON_ITEM_TYPE = 3;
const ARMOR_ITEM_TYPE = 2;
const EXOTIC_TIER = 6;
const INTRINSIC_CATEGORY = 3956125808; // socket category "Intrinsic Traits"
const PERK_CATEGORY = 4241085061; // socket category "Weapon Perks"
const MOD_CATEGORY = 2685412949; // socket category "Weapon Mods", e.g. the parts of Praxic Blade
const INTRINSIC_PLUG = "intrinsics";
const CATALYST_TRAIT = "item.exotic_catalyst";
const TRACKER = /trackers/;
const EMPTY_SOCKET = /^Empty .* Socket$/; // placeholders of craftable versions, e.g. "Empty Catalyst Socket"

// DestinyItemSubType
const WEAPON_TYPES: Record<number, WeaponType> = {
  6: "autoRifle",
  7: "shotgun",
  8: "machineGun",
  9: "handCannon",
  10: "rocketLauncher",
  11: "fusionRifle",
  12: "sniperRifle",
  13: "pulseRifle",
  14: "scoutRifle",
  17: "sidearm",
  18: "sword",
  22: "linearFusionRifle",
  23: "grenadeLauncher",
  24: "submachineGun",
  25: "traceRifle",
  31: "bow",
  33: "glaive",
};
const ARMOR_SLOTS: Record<number, ManifestArmorPiece["slot"]> = {
  26: "helmet",
  27: "gauntlets",
  28: "chest",
  29: "legs",
  30: "classItem",
};
// DamageType
const ELEMENTS: Record<number, Element> = {
  1: "kinetic",
  2: "arc",
  3: "solar",
  4: "void",
  6: "stasis",
  7: "strand",
};
// DestinyAmmunitionType
const AMMO: Record<number, ManifestWeapon["ammo"]> = {
  1: "primary",
  2: "special",
  3: "heavy",
};
// DestinyClass; 3 = any class
const CLASSES: Record<number, GuardianClass> = {
  0: "titan",
  1: "hunter",
  2: "warlock",
};

/** Only the fields of the manifest tables this module reads. */
export type ManifestWeaponItem = {
  hash: number;
  displayProperties?: { name?: string; description?: string };
  itemTypeDisplayName?: string;
  itemType?: number;
  itemSubType?: number;
  classType?: number;
  defaultDamageType?: number;
  equippingBlock?: { ammoType?: number };
  inventory?: { tierType?: number };
  collectibleHash?: number;
  traitIds?: string[];
  perks?: { perkHash: number }[];
  plug?: { plugCategoryIdentifier?: string };
  sockets?: {
    socketEntries: {
      singleInitialItemHash?: number;
      reusablePlugSetHash?: number;
      randomizedPlugSetHash?: number;
    }[];
    socketCategories: { socketCategoryHash: number; socketIndexes: number[] }[];
  };
};
export type WeaponManifestTables = {
  items: Record<string, ManifestWeaponItem>;
  plugSets: Record<string, { reusablePlugItems?: { plugItemHash: number }[] }>;
  sandboxPerks: Record<
    string,
    { displayProperties?: { name?: string; description?: string } }
  >;
};

const nameOf = (item: ManifestWeaponItem | undefined) =>
  item?.displayProperties?.name ?? "";

/** Plugs in the sockets of the given categories: the initial plug and every option. */
function plugs(
  item: ManifestWeaponItem,
  categories: number[],
  { items, plugSets }: WeaponManifestTables,
): ManifestWeaponItem[] {
  const sockets = item.sockets;
  const indexes = (sockets?.socketCategories ?? [])
    .filter((c) => categories.includes(c.socketCategoryHash))
    .flatMap((c) => c.socketIndexes);
  const result = new Map<number, ManifestWeaponItem>();
  for (const index of indexes) {
    const entry = sockets?.socketEntries[index];
    if (!entry) continue;
    const hashes = [
      entry.singleInitialItemHash,
      ...[entry.reusablePlugSetHash, entry.randomizedPlugSetHash].flatMap(
        (set) =>
          set === undefined
            ? []
            : (plugSets[set]?.reusablePlugItems ?? []).map(
                (p) => p.plugItemHash,
              ),
      ),
    ];
    for (const hash of hashes) {
      const plug = hash === undefined ? undefined : items[hash];
      if (plug) result.set(plug.hash, plug);
    }
  }
  return [...result.values()];
}

/** Sorted names without placeholders and trackers. */
const plugNames = (list: ManifestWeaponItem[]): string[] =>
  [
    ...new Set(
      list
        .filter(
          (plug) =>
            nameOf(plug) &&
            !EMPTY_SOCKET.test(nameOf(plug)) &&
            !TRACKER.test(plug.plug?.plugCategoryIdentifier ?? ""),
        )
        .map(nameOf),
    ),
  ].sort();

/** Descriptions of items and of their sandbox perks. */
const texts = (
  list: ManifestWeaponItem[],
  { sandboxPerks }: WeaponManifestTables,
): string[] =>
  list.flatMap((item) => [
    item.displayProperties?.description ?? "",
    ...(item.perks ?? []).map(
      (p) => sandboxPerks[p.perkHash]?.displayProperties?.description ?? "",
    ),
  ]);

/** One line per text, without empty lines and repeats. */
const joinTexts = (lines: string[]) =>
  [...new Set(lines.map((line) => line.trim()).filter((line) => line))].join(
    "\n",
  );

/**
 * One item per name among the exotics of an item type. The manifest keeps old versions of
 * reissued items; the item with a collectible and the most sockets wins.
 */
function exoticsByName(
  items: ManifestWeaponItem[],
  itemType: number,
): Map<string, ManifestWeaponItem> {
  const rank = (item: ManifestWeaponItem) =>
    (item.collectibleHash ? 1000 : 0) +
    (item.sockets?.socketEntries.length ?? 0);
  const byName = new Map<string, ManifestWeaponItem>();
  for (const item of items) {
    if (item.itemType !== itemType || item.inventory?.tierType !== EXOTIC_TIER)
      continue;
    const name = nameOf(item);
    const current = byName.get(name);
    if (name && (!current || rank(item) > rank(current)))
      byName.set(name, item);
  }
  return byName;
}

/** Exotic weapons, one per name. The catalyst is the item "<name> Catalyst". */
export function extractManifestWeapons(
  tables: WeaponManifestTables,
): ManifestWeapon[] {
  const items = Object.values(tables.items);
  const catalysts = new Map(
    items
      .filter((item) => item.traitIds?.includes(CATALYST_TRAIT))
      .map((item) => [nameOf(item), item]),
  );

  const weapons: ManifestWeapon[] = [];
  for (const [name, item] of exoticsByName(items, WEAPON_ITEM_TYPE)) {
    const weaponType = WEAPON_TYPES[item.itemSubType ?? -1];
    const element = ELEMENTS[item.defaultDamageType ?? -1];
    const ammo = AMMO[item.equippingBlock?.ammoType ?? -1];
    if (!weaponType || !element || !ammo) continue;
    const catalyst = catalysts.get(`${name} Catalyst`);
    const catalystPerks = (catalyst?.perks ?? []).map(
      (p) => tables.sandboxPerks[p.perkHash]?.displayProperties ?? {},
    );
    const intrinsics = plugs(item, [INTRINSIC_CATEGORY], tables);
    weapons.push({
      hash: item.hash,
      name,
      weaponType,
      element,
      ammo,
      intrinsics: plugNames(intrinsics),
      perks: plugNames(plugs(item, [PERK_CATEGORY], tables)),
      mods: plugNames(plugs(item, [MOD_CATEGORY], tables)),
      catalyst: catalyst
        ? {
            name: nameOf(catalyst),
            perks: catalystPerks
              .map((perk) => perk.name ?? "")
              .filter((perk) => perk !== ""),
          }
        : null,
      description: joinTexts([
        ...texts(intrinsics, tables),
        ...catalystPerks.map((perk) => perk.description ?? ""),
      ]),
    });
  }
  return weapons.sort((a, b) => a.name.localeCompare(b.name));
}

/** Exotic armor, one per name, with the names and texts of its intrinsic plugs. */
export function extractExoticArmor(
  tables: WeaponManifestTables,
): ManifestArmorPiece[] {
  const armor: ManifestArmorPiece[] = [];
  for (const [name, item] of exoticsByName(
    Object.values(tables.items),
    ARMOR_ITEM_TYPE,
  )) {
    const slot = ARMOR_SLOTS[item.itemSubType ?? -1];
    if (!slot) continue;
    const categories = (item.sockets?.socketCategories ?? []).map(
      (c) => c.socketCategoryHash,
    );
    const intrinsics = plugs(item, categories, tables).filter(
      (plug) => plug.plug?.plugCategoryIdentifier === INTRINSIC_PLUG,
    );
    armor.push({
      hash: item.hash,
      name,
      guardianClass: CLASSES[item.classType ?? -1] ?? null,
      slot,
      intrinsics: plugNames(intrinsics),
      description: joinTexts(texts(intrinsics, tables)),
    });
  }
  return armor.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Item type, plug category and text of every manifest item with one of the names, ignoring case. The
 * weapon import uses this to tell what an Aegis assumption is (ADR 0013, point 3). Names without
 * a match are left out.
 */
export function lookupManifestTerms(
  names: string[],
  tables: WeaponManifestTables,
): ManifestTerms["terms"] {
  const wanted = new Map(names.map((name) => [name.toLowerCase(), name]));
  const found: ManifestTerms["terms"] = {};
  for (const item of Object.values(tables.items)) {
    const name = wanted.get(nameOf(item).toLowerCase());
    if (!name) continue;
    const match = {
      itemType: item.itemTypeDisplayName ?? "",
      plugCategory: item.plug?.plugCategoryIdentifier ?? "",
      description: joinTexts(texts([item], tables)),
    };
    const list = (found[name] ??= []);
    const same = list.find(
      (m) =>
        m.itemType === match.itemType && m.plugCategory === match.plugCategory,
    );
    if (!same) list.push(match);
    else if (!same.description) same.description = match.description;
  }
  return found;
}
