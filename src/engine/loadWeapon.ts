import { Weapon } from "../data/schema";

/** Validates raw data from a weapon Data File. Throws if it does not match the schema. */
export function loadWeapon(raw: unknown): Weapon {
  return Weapon.parse(raw);
}
