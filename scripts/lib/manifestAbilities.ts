// Extracts the ability items (supers, grenades, melees, class abilities) from the manifest item table
// (ADR 0008). The plug category names slot, class and subclass, e.g. "hunter.prism.supers" or
// "shared.arc.grenades".

import type {
  AbilityKind,
  GuardianClass,
  ManifestAbility,
  ManifestSubclassItem,
  Subclass,
} from "../../src/data/schema.ts";

const CATEGORY =
  /^(hunter|titan|warlock|shared)\.(arc|solar|void|stasis|strand|prism)\.(supers|grenades|melee|class_abilities)$/;
const KINDS: Record<string, AbilityKind> = {
  supers: "super",
  grenades: "grenade",
  melee: "melee",
  class_abilities: "classAbility",
};

/** Only the fields of DestinyInventoryItemDefinition this module reads. */
export type ManifestItem = {
  hash: number;
  displayProperties?: { name?: string; hasIcon?: boolean };
  plug?: { plugCategoryIdentifier?: string };
  itemTypeDisplayName?: string; // e.g. "Solar Aspect"
};

export function extractManifestAbilities(
  items: Record<string, ManifestItem>,
): ManifestAbility[] {
  const abilities: ManifestAbility[] = [];
  for (const item of Object.values(items)) {
    const match = CATEGORY.exec(item.plug?.plugCategoryIdentifier ?? "");
    const name = item.displayProperties?.name;
    if (!match || !name) continue;
    const [, owner, element, slot] = match;
    abilities.push({
      name,
      kind: KINDS[slot],
      guardianClass: owner === "shared" ? null : (owner as GuardianClass),
      subclass: (element === "prism" ? "prismatic" : element) as Subclass,
      hash: item.hash,
    });
  }
  return abilities.sort((a, b) => key(a).localeCompare(key(b)));
}

const key = (a: ManifestAbility | ManifestSubclassItem) =>
  [a.name, a.kind, a.guardianClass ?? "", a.subclass, a.hash].join("|");

// Aspects per class, e.g. "hunter.solar.aspects"; fragments for all, e.g. "shared.solar.fragments".
// Stasis plugs are older: aspects "hunter.stasis.totems", fragments "shared.stasis.trinkets".
const SUBCLASS_CATEGORY =
  /^(hunter|titan|warlock|shared)\.(arc|solar|void|stasis|strand|prism)\.(aspects|totems|fragments|trinkets)$/;
const SUBCLASS_KINDS: Record<string, ManifestSubclassItem["kind"]> = {
  aspects: "aspect",
  totems: "aspect",
  fragments: "fragment",
  trinkets: "fragment",
};
// Placeholder plugs of empty sockets, e.g. "Empty Fragment Socket"
const EMPTY_SOCKET = /^Empty\b/;

/** Aspects and fragments (ADR 0015, U6-2), sorted like the abilities. */
export function extractSubclassItems(
  items: Record<string, ManifestItem>,
): ManifestSubclassItem[] {
  const result: ManifestSubclassItem[] = [];
  for (const item of Object.values(items)) {
    const match = SUBCLASS_CATEGORY.exec(item.plug?.plugCategoryIdentifier ?? "");
    const name = item.displayProperties?.name;
    if (!match || !name || EMPTY_SOCKET.test(name)) continue;
    const [, owner, element, slot] = match;
    result.push({
      name,
      kind: SUBCLASS_KINDS[slot],
      guardianClass: owner === "shared" ? null : (owner as GuardianClass),
      subclass: (element === "prism" ? "prismatic" : element) as Subclass,
      hash: item.hash,
    });
  }
  return result.sort((a, b) => key(a).localeCompare(key(b)));
}

const plain = (name: string) => name.replace(/[’']/g, "'").toLowerCase();

/**
 * Whether a manifest item is the aspect or fragment the Compendium names; the Compendium leaves
 * out the prefix of fragments, e.g. "Ashes" for "Ember of Ashes" or "Courage" for "Facet of Courage".
 */
export function subclassItemNamed(manifestName: string, compendiumName: string): boolean {
  const m = plain(manifestName);
  const c = plain(compendiumName);
  return m === c || m.endsWith(` of ${c}`);
}

/** Plug categories that name aspects or fragments but match no rule; the import reports them. */
export function unreadSubclassCategories(
  items: Record<string, ManifestItem>,
): string[] {
  const categories = new Map<string, string[]>();
  for (const item of Object.values(items)) {
    const category = item.plug?.plugCategoryIdentifier ?? "";
    const named =
      /aspect|fragment|trinket/i.test(category) ||
      /\b(?:aspect|fragment)\b/i.test(item.itemTypeDisplayName ?? "");
    if (named && !SUBCLASS_CATEGORY.test(category))
      categories.set(category, [
        ...(categories.get(category) ?? []),
        item.displayProperties?.name ?? "",
      ]);
  }
  // with the number of items and the first names, e.g. "shared.fragments (2: A, B)"
  return [...categories]
    .map(([c, names]) => `${c} (${names.length}: ${names.slice(0, 3).join(", ")})`)
    .sort();
}
