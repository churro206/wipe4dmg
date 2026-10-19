// Extracts the ability items (supers, grenades, melees) from the manifest item table (ADR 0008).
// The plug category names slot, class and subclass, e.g. "hunter.prism.supers" or "shared.arc.grenades".

import type {
  AbilityKind,
  GuardianClass,
  ManifestAbility,
  Subclass,
} from "../../src/data/schema.ts";

const CATEGORY =
  /^(hunter|titan|warlock|shared)\.(arc|solar|void|stasis|strand|prism)\.(supers|grenades|melee)$/;
const KINDS: Record<string, AbilityKind> = {
  supers: "super",
  grenades: "grenade",
  melee: "melee",
};

/** Only the fields of DestinyInventoryItemDefinition this module reads. */
export type ManifestItem = {
  hash: number;
  displayProperties?: { name?: string };
  plug?: { plugCategoryIdentifier?: string };
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
  const key = (a: ManifestAbility) =>
    [a.name, a.kind, a.guardianClass ?? "", a.subclass, a.hash].join("|");
  return abilities.sort((a, b) => key(a).localeCompare(key(b)));
}
