import { Weapon } from "../data/schema";

/** Validates raw data from a weapon Data File. Throws if it does not match the schema. */
export function loadWeapon(raw: unknown): Weapon {
  return Weapon.parse(raw);
}

/** Validates all weapon Data Files (ADR 0012). Throws on a schema error or a duplicate id or code. */
export function loadWeapons(raws: unknown[]): Weapon[] {
  const weapons = raws.map(loadWeapon);
  for (const key of ["id", "code"] as const) {
    const seen = new Set<string | number>();
    for (const weapon of weapons) {
      if (seen.has(weapon[key])) {
        throw new Error(`Duplicate weapon ${key} "${weapon[key]}"`);
      }
      seen.add(weapon[key]);
    }
  }
  return weapons;
}
