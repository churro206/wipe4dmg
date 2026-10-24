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
};

/**
 * Icon refs of effects without a manifest ref (the generated buff effects): the manifest item with
 * the name of the effect, without a trailing "(…)". Effects with no such item are returned apart.
 */
export function namedIconRefs(
  effects: Pick<Effect, "id" | "name">[],
  items: Record<string, NamedIconItem>,
  keyPrefix = "effect",
): { refs: IconRef[]; missing: string[] } {
  const byName = new Map<string, number>();
  for (const item of Object.values(items)) {
    const name = item.displayProperties?.name;
    if (name && item.displayProperties?.hasIcon && !byName.has(name)) {
      byName.set(name, item.hash);
    }
  }
  const refs: IconRef[] = [];
  const missing: string[] = [];
  for (const effect of effects) {
    const hash = byName.get(effect.name.replace(/ \(.*\)$/, ""));
    if (hash === undefined) missing.push(effect.id);
    else
      refs.push({
        key: `${keyPrefix}:${effect.id}`,
        manifestRef: { table: "DestinyInventoryItemDefinition", hash },
      });
  }
  return { refs, missing };
}
