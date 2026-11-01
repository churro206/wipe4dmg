// Rows of the Aegis tabs Weapons and Abilties that the model takes values from (I1, docs/architecture.md).
// They are the Eichung of an item and no longer count as a check; the bench leaves them out of the
// check set.

import type { Ability, Source } from "../../src/data/schema";

/** Every object of a JSON value that has the shape of a Source (name, retrieved and status). */
export function sourcesOf(json: unknown): Source[] {
  const found: Source[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value !== null && typeof value === "object") {
      const o = value as Record<string, unknown>;
      if (
        typeof o.name === "string" &&
        typeof o.retrieved === "string" &&
        typeof o.status === "string"
      ) {
        found.push(o as unknown as Source);
      }
      Object.values(o).forEach(walk);
    }
  };
  walk(json);
  return found;
}

/**
 * Rows used as input: Weapons rows (and Sustained rows of an item's `$aegisSustained`) named by a
 * `fitted` source of the weapon packages, and the rows
 * of ability packages and of variants of abilities from components (ratio to the base row).
 */
export function fittedRows(
  weaponPackages: unknown,
  abilities: Pick<Ability, "package" | "variantOf" | "aegisRowId">[],
): { weaponRows: Set<string>; abilityRows: Set<string> } {
  const weaponRows = new Set(
    sourcesOf(weaponPackages)
      .filter((s) => s.status === "fitted" && s.row !== undefined)
      .map((s) => s.row!),
  );
  const abilityRows = new Set(
    abilities
      .filter((a) => (a.package !== undefined || a.variantOf !== undefined) && a.aegisRowId)
      .map((a) => a.aegisRowId!),
  );
  return { weaponRows, abilityRows };
}
