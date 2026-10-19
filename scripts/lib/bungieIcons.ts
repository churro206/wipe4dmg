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

/** Icon refs of abilities: the manifest item of their element (ADR 0009); throws if there is none. */
export function abilityIconRefs(
  abilities: { id: string; name: string; kind: AbilityKind; element: string }[],
  manifestAbilities: ManifestAbility[],
): IconRef[] {
  return abilities.map((ability) => {
    const item = elementItem(
      itemsOfAbility(manifestAbilities, ability),
      ability.element,
    );
    if (!item)
      throw new Error(
        `${ability.id}: "${ability.name}" is not in the manifest abilities`,
      );
    return {
      key: `ability:${ability.id}`,
      manifestRef: {
        table: "DestinyInventoryItemDefinition" as const,
        hash: item.hash,
      },
    };
  });
}

/** File below public/ for an icon, e.g. icons/item-123.png; keeps the image type. */
export function iconFileName(ref: ManifestRef, iconPath: string): string {
  const extension = /\.(png|jpg)$/.exec(iconPath)?.[1];
  if (!extension) throw new Error(`Unknown image type: ${iconPath}`);
  return `icons/${TABLE_PREFIXES[ref.table]}-${ref.hash}.${extension}`;
}
