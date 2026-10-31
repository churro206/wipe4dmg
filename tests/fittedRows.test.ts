// I1 (docs/architecture.md): a value that comes from a row of the Aegis tabs Weapons or Abilties is
// an input, not a check. Its source has the status "fitted" and names the row; `fittedRows` collects
// those rows, and the bench leaves them out of the check set.

import { describe, expect, it } from "vitest";
import rawWeaponRows from "../src/data/aegis-weapons.json";
import rawPackages from "../src/data/weapon-packages.json";
import { AegisWeaponSnapshot, Source } from "../src/data/schema";
import { abilities, aegisRows } from "../src/ui/data";
import { fittedRows, sourcesOf } from "./lib/fittedRows";

const WEAPON_TAB = "Aegis Boss Damage sheet (tab Weapons";
const weaponIds = new Set(AegisWeaponSnapshot.parse(rawWeaponRows).rows.map((r) => r.id));
const abilityIds = new Set(aegisRows.map((r) => r.id));

describe("status fitted", () => {
  it("is a status of Source and needs a row", () => {
    const base = { name: "x", retrieved: "2026-10-31" };
    expect(Source.safeParse({ ...base, status: "fitted", row: "r" }).success).toBe(true);
    expect(Source.safeParse({ ...base, status: "verified" }).success).toBe(true);
  });

  it("marks every value that comes from a row of the Aegis tab Weapons", () => {
    const aegis = sourcesOf(rawPackages).filter((s) => s.name.startsWith(WEAPON_TAB));
    expect(aegis.length).toBeGreaterThan(100);
    for (const s of aegis) {
      expect(s.status, s.name).toBe("fitted");
      expect(s.row, s.name).toBeDefined();
      // A row "…-without-catalyst" is made from the catalyst row, which `row` names.
      expect(s.name.includes(`row ${s.row}`), s.name).toBe(true);
      expect(weaponIds.has(s.row!), s.name).toBe(true);
    }
  });

  it("collects the rows of weapon packages and ability packages, and nothing else", () => {
    const { weaponRows, abilityRows } = fittedRows(rawPackages, abilities);
    expect(weaponRows.size).toBeGreaterThan(50);
    for (const id of weaponRows) expect(weaponIds.has(id), id).toBe(true);
    // A package takes its value from the row; a variant of an ability from components takes the
    // ratio of its row to the base row.
    const input = abilities.filter((a) => a.package !== undefined || a.variantOf !== undefined);
    expect(input.length).toBeGreaterThan(0);
    expect(abilityRows).toEqual(new Set(input.map((a) => a.aegisRowId)));
    for (const id of abilityRows) expect(abilityIds.has(id), id).toBe(true);
    // The base row of an ability from components is gated against: a check, not an input.
    const gated = abilities.filter(
      (a) => a.package === undefined && a.variantOf === undefined && a.aegisRowId,
    );
    expect(gated.length).toBeGreaterThan(0);
    for (const a of gated) expect(abilityRows.has(a.aegisRowId!), a.name).toBe(false);
  });
});
