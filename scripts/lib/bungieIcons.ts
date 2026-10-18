// Which icons to import from the Bungie manifest and how to name the files (ADR 0008).

import type {
  Effect,
  IconRef,
  ManifestRef,
  ManifestTable,
  Weapon,
} from "../../src/data/schema.ts";

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

/** File below public/ for an icon, e.g. icons/item-123.png; keeps the image type. */
export function iconFileName(ref: ManifestRef, iconPath: string): string {
  const extension = /\.(png|jpg)$/.exec(iconPath)?.[1];
  if (!extension) throw new Error(`Unknown image type: ${iconPath}`);
  return `icons/${TABLE_PREFIXES[ref.table]}-${ref.hash}.${extension}`;
}
