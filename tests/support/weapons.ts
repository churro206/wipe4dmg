// All weapon Data Files, loaded like the UI does (ADR 0012).

import { readdirSync, readFileSync } from "node:fs";
import type { Weapon } from "../../src/data/schema";
import { loadWeapons } from "../../src/engine/loadWeapon";

const WEAPON_DIR = "src/data/weapons";

export const rawWeapons: Record<string, unknown>[] = readdirSync(WEAPON_DIR)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(`${WEAPON_DIR}/${file}`, "utf8")));

export const weapons = loadWeapons(rawWeapons);

export function weaponById(id: string): Weapon {
  const weapon = weapons.find((w) => w.id === id);
  if (!weapon) throw new Error(`Unknown weapon "${id}"`);
  return weapon;
}
