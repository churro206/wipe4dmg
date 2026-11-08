// I1 (docs/architecture.md): a value that comes from a row of the Aegis tabs Weapons or Abilties is
// an input, not a check. Its source has the status "fitted" and names the row; `fittedRows` collects
// those rows, and the bench leaves them out of the check set.

import { describe, expect, it } from "vitest";
import rawSustainedRows from "../src/data/aegis-sustained.json";
import rawWeaponRows from "../src/data/aegis-weapons.json";
import rawPackages from "../src/data/weapon-packages.json";
import { AegisSustainedSnapshot, AegisWeaponSnapshot, Source } from "../src/data/schema";
import { abilities, aegisRows } from "../src/ui/data";
import { fittedRows, sourcesOf } from "./lib/fittedRows";

const WEAPON_TAB = "Aegis Boss Damage sheet (tab Weapons";
const weaponIds = new Set(AegisWeaponSnapshot.parse(rawWeaponRows).rows.map((r) => r.id));
const sustainedIds = new Set(AegisSustainedSnapshot.parse(rawSustainedRows).rows.map((r) => r.id));
const abilityIds = new Set(aegisRows.map((r) => r.id));

describe("status fitted", () => {
  it("is a status of Source and needs a row", () => {
    const base = { name: "x", retrieved: "2026-10-31" };
    expect(Source.safeParse({ ...base, status: "fitted", row: "r" }).success).toBe(true);
    expect(Source.safeParse({ ...base, status: "verified" }).success).toBe(true);
  });

  it("marks every value that comes from a row of the Aegis tab Weapons", () => {
    const aegis = sourcesOf(rawPackages).filter((s) => s.name.startsWith(WEAPON_TAB));
    // 95 after W2 (five packages became items, 100+ before), 86 after W3 Anarchy; falls further with every item until A2
    expect(aegis.length).toBeGreaterThan(80);
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
    // An item file can also take a number of a Sustained row ($aegisSustained, e.g. Truth's 14 shots).
    // The bench knows that row by its id in the totals, with the prefix of the tab.
    const sustainedRows = [...weaponRows].filter((id) => !weaponIds.has(id));
    expect(sustainedRows.length).toBeGreaterThan(0);
    for (const id of sustainedRows)
      expect(id.startsWith("sustained-") && sustainedIds.has(id.slice("sustained-".length)), id).toBe(true);
    expect(weaponRows.has("sustained-truth-prototype-truthseeker-argent-ordnance")).toBe(true);
    expect(weaponRows.has("truth-prototype-truthseeker-argent-ordnance")).toBe(false);
    expect(weaponRows.has("sustained-the-queenbreaker-rewind-rounds-combat-sights")).toBe(true);
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
