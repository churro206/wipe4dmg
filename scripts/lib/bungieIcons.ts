// Which icons to import from the Bungie manifest and how to name the files (ADR 0008).

import type {
  AbilityKind,
  Effect,
  IconRef,
  ManifestAbility,
  ManifestRef,
  ManifestTable,
  Weapon,
} from "../../src/data/schema.ts";
import { elementItem, itemsOfAbility } from "../../src/engine/abilityNames.ts";

const TABLE_PREFIXES: Record<ManifestTable, string> = {
  DestinyInventoryItemDefinition: "item",
  DestinySandboxPerkDefinition: "perk",
  DestinyTraitDefinition: "trait",
  DestinyStatDefinition: "stat",
  DestinyDamageTypeDefinition: "damage",
};

/** All icons the app needs: effects and weapons from their data files, plus the extra refs. */
export function collectIconRefs(
  effects: Effect[],
  weapons: Weapon[],
  extras: IconRef[],
): IconRef[] {
  const refs: IconRef[] = [
    ...effects.flatMap((effect) =>
      effect.manifestRef
        ? [{ key: `effect:${effect.id}`, manifestRef: effect.manifestRef }]
        : [],
    ),
    ...weapons.map((weapon) => ({
      key: `weapon:${weapon.id}`,
      manifestRef: {
        table: "DestinyInventoryItemDefinition" as const,
        hash: weapon.manifestHash,
      },
    })),
    ...extras,
  ];
  const keys = new Set<string>();
  for (const ref of refs) {
    if (keys.has(ref.key)) throw new Error(`Duplicate icon key "${ref.key}"`);
    keys.add(ref.key);
  }
  return refs;
}

/**
 * Icon refs of abilities: the manifest item of their element (ADR 0009); throws if there is none.
 * A class ability has the same name in every subclass, so it also gets one icon per element under
 * "ability:<id>:<element>"; the Prismatic item is left out, the UI takes the element of the super.
 */
export function abilityIconRefs(
  abilities: { id: string; name: string; kind: AbilityKind; element: string }[],
  manifestAbilities: ManifestAbility[],
): IconRef[] {
  const ref = (key: string, hash: number): IconRef => ({
    key,
    manifestRef: { table: "DestinyInventoryItemDefinition", hash },
  });
  return abilities.flatMap((ability) => {
    const items = itemsOfAbility(manifestAbilities, ability);
    const item = elementItem(items, ability.element);
    if (!item)
      throw new Error(
        `${ability.id}: "${ability.name}" is not in the manifest abilities`,
      );
    const key = `ability:${ability.id}`;
    const perElement =
      ability.kind === "classAbility"
        ? items
            .filter((i) => i.subclass !== "prismatic")
            .map((i) => ref(`${key}:${i.subclass}`, i.hash))
        : [];
    return [ref(key, item.hash), ...perElement];
  });
}

/** File below public/ for an icon, e.g. icons/item-123.png; keeps the image type. */
export function iconFileName(ref: ManifestRef, iconPath: string): string {
  const extension = /\.(png|jpg)$/.exec(iconPath)?.[1];
  if (!extension) throw new Error(`Unknown image type: ${iconPath}`);
  return `icons/${TABLE_PREFIXES[ref.table]}-${ref.hash}.${extension}`;
}

/** Item with an icon, as far as the lookup by name reads it. */
export type NamedIconItem = {
  hash: number;
  displayProperties?: { name?: string; hasIcon?: boolean };
  itemType?: number; // DestinyItemType of the Bungie API
  itemTypeDisplayName?: string; // e.g. "Artifact Perk"
  plug?: { plugCategoryIdentifier?: string };
};

const describeItem = (item: NamedIconItem) =>
  `${item.hash} (type ${item.itemType ?? "?"}, "${item.itemTypeDisplayName ?? ""}", ${item.plug?.plugCategoryIdentifier ?? "no plug"})`;

// DestinyItemType values of the Bungie API: the perks and mods of the game text are mods; armor,
// weapons and emblems often carry the same name and are the wrong icon for them.
const ITEM_TYPE_MOD = 19;
const ITEM_TYPES_OF_OTHER_THINGS = [2, 3, 14]; // armor, weapon, emblem
const ARTIFACT_PERK_PLUG = "artifact_perks";

/**
 * Lower rank wins: an artifact perk, a mod, an item of unknown type, then armor, weapons, emblems
 * and ornaments (a weapon ornament is a mod too, with the picture of the weapon: "Wind Chill").
 */
function nameRank(item: NamedIconItem): number {
  if (item.plug?.plugCategoryIdentifier === ARTIFACT_PERK_PLUG) return 0;
  const isOtherThing =
    (item.itemType !== undefined && ITEM_TYPES_OF_OTHER_THINGS.includes(item.itemType)) ||
    item.itemTypeDisplayName?.includes("Ornament");
  if (isOtherThing) return 3;
  return item.itemType === ITEM_TYPE_MOD ? 1 : 2;
}

/**
 * Icon refs of effects without a manifest ref (the generated buff effects, the coverage page): the
 * manifest item with the name of the effect, without a trailing "(…)"; with several items of that
 * name a mod wins over armor, weapons and emblems. An entry with a `hash` takes exactly that item if
 * it has an icon. Effects with no item are returned apart; `ambiguous` lists names with several
 * items and the one taken, for the log of the import.
 */
export function namedIconRefs(
  effects: (Pick<Effect, "id" | "name"> & { hash?: number })[],
  items: Record<string, NamedIconItem>,
  keyPrefix = "effect",
): { refs: IconRef[]; missing: string[]; ambiguous: string[] } {
  // The game text and the manifest spell some names differently ("Wished Into Being", "Wished into Being").
  const byName = new Map<string, NamedIconItem[]>();
  for (const item of Object.values(items)) {
    const name = item.displayProperties?.name?.toLowerCase();
    if (name && item.displayProperties?.hasIcon) {
      byName.set(name, [...(byName.get(name) ?? []), item]);
    }
  }
  const refs: IconRef[] = [];
  const missing: string[] = [];
  const ambiguous: string[] = [];
  const ref = (key: string, hash: number): IconRef => ({
    key,
    manifestRef: { table: "DestinyInventoryItemDefinition", hash },
  });
  for (const effect of effects) {
    const key = `${keyPrefix}:${effect.id}`;
    if (effect.hash !== undefined && items[String(effect.hash)]?.displayProperties?.hasIcon) {
      refs.push(ref(key, effect.hash));
      continue;
    }
    const name = effect.name.replace(/ \(.*\)$/, "");
    const candidates = byName.get(name.toLowerCase()) ?? [];
    const item = [...candidates].sort((a, b) => nameRank(a) - nameRank(b))[0];
    if (!item) {
      missing.push(effect.id);
      continue;
    }
    refs.push(ref(key, item.hash));
    if (candidates.length > 1) {
      ambiguous.push(
        `${name}: took ${item.hash} of ${candidates.map(describeItem).join(", ")}`,
      );
    }
  }
  return { refs, missing, ambiguous };
}
