// Loads the item files (docs/architecture.md section 5, B4a step 5): every src/data/items/weapons/
// <id>.json is resolved against the snapshots (weaponItem.ts). The file name is the id.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import type { ItemSources } from "./refs.ts";
import { type ResolvedItem, resolveWeaponItem } from "./weaponItem.ts";

export const ITEM_WEAPONS_DIR = new URL("../../../src/data/items/weapons/", import.meta.url);

export function loadWeaponItems(
  sources: ItemSources,
  dir: URL = ITEM_WEAPONS_DIR,
): ResolvedItem[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const resolved = resolveWeaponItem(JSON.parse(readFileSync(new URL(file, dir), "utf8")), sources);
      if (`${resolved.weapon.id}.json` !== file)
        throw new Error(`item file ${file}: the file name must be the id "${resolved.weapon.id}"`);
      return resolved;
    });
}
