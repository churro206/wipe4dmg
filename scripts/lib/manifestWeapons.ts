// Extracts the exotic weapons from the manifest item table (ADR 0013): weapon type, element, ammo
// and the names of intrinsic, perks and catalyst perks. The weapon import matches these names
// against the assumptions of the Aegis rows.

import type {
  Element,
  ManifestWeapon,
  WeaponType,
} from "../../src/data/schema.ts";

const WEAPON_ITEM_TYPE = 3;
const EXOTIC_TIER = 6;
const INTRINSIC_CATEGORY = 3956125808; // socket category "Intrinsic Traits"
const PERK_CATEGORY = 4241085061; // socket category "Weapon Perks"
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

/** Only the fields of the manifest tables this module reads. */
export type ManifestWeaponItem = {
  hash: number;
  displayProperties?: { name?: string };
  itemType?: number;
  itemSubType?: number;
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
  sandboxPerks: Record<string, { displayProperties?: { name?: string } }>;
};

const nameOf = (item: ManifestWeaponItem | undefined) =>
  item?.displayProperties?.name ?? "";

/** Names of all plugs in the sockets of one category: the initial plug and every option. */
function plugNames(
  weapon: ManifestWeaponItem,
  category: number,
  { items, plugSets }: WeaponManifestTables,
): string[] {
  const sockets = weapon.sockets;
  const indexes =
    sockets?.socketCategories.find((c) => c.socketCategoryHash === category)
      ?.socketIndexes ?? [];
  const names = new Set<string>();
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
      const name = nameOf(plug);
      if (
        name &&
        !EMPTY_SOCKET.test(name) &&
        !TRACKER.test(plug?.plug?.plugCategoryIdentifier ?? "")
      )
        names.add(name);
    }
  }
  return [...names].sort();
}

/**
 * Exotic weapons, one per name. The manifest keeps old versions of reissued weapons; the item
 * with a collectible and the most sockets wins. The catalyst is the item "<name> Catalyst".
 */
export function extractManifestWeapons(
  tables: WeaponManifestTables,
): ManifestWeapon[] {
  const items = Object.values(tables.items);
  const catalysts = new Map(
    items
      .filter((item) => item.traitIds?.includes(CATALYST_TRAIT))
      .map((item) => [nameOf(item), item]),
  );
  const rank = (item: ManifestWeaponItem) =>
    (item.collectibleHash ? 1000 : 0) +
    (item.sockets?.socketEntries.length ?? 0);

  const byName = new Map<string, ManifestWeaponItem>();
  for (const item of items) {
    if (
      item.itemType !== WEAPON_ITEM_TYPE ||
      item.inventory?.tierType !== EXOTIC_TIER
    )
      continue;
    const name = nameOf(item);
    const current = byName.get(name);
    if (name && (!current || rank(item) > rank(current)))
      byName.set(name, item);
  }

  const weapons: ManifestWeapon[] = [];
  for (const [name, item] of byName) {
    const weaponType = WEAPON_TYPES[item.itemSubType ?? -1];
    const element = ELEMENTS[item.defaultDamageType ?? -1];
    const ammo = AMMO[item.equippingBlock?.ammoType ?? -1];
    if (!weaponType || !element || !ammo) continue;
    const catalyst = catalysts.get(`${name} Catalyst`);
    weapons.push({
      hash: item.hash,
      name,
      weaponType,
      element,
      ammo,
      intrinsics: plugNames(item, INTRINSIC_CATEGORY, tables),
      perks: plugNames(item, PERK_CATEGORY, tables),
      catalyst: catalyst
        ? {
            name: nameOf(catalyst),
            perks: (catalyst.perks ?? [])
              .map(
                (p) =>
                  tables.sandboxPerks[p.perkHash]?.displayProperties?.name ??
                  "",
              )
              .filter((perk) => perk !== ""),
          }
        : null,
    });
  }
  return weapons.sort((a, b) => a.name.localeCompare(b.name));
}
