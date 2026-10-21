// All weapons the UI loads: the imported packages (ADR 0013, ADR 0015 point 11: no hand models).

import rawPackages from "../../src/data/weapon-packages.json";
import type { Weapon } from "../../src/data/schema";
import { loadWeapons } from "../../src/engine/loadWeapon";

export const rawWeapons: Record<string, unknown>[] = rawPackages;

export const weapons = loadWeapons(rawWeapons);

export function weaponById(id: string): Weapon {
  const weapon = weapons.find((w) => w.id === id);
  if (!weapon) throw new Error(`Unknown weapon "${id}"`);
  return weapon;
}
