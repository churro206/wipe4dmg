// I1: an override that quotes a row of the Aegis tab Weapons takes a value from it, unless the quote
// only backs an assumption or a cross-check. A row that gives a value must be `fitted` in the
// packages, or the bench would count it as a check. A quote of a row that is neither fitted nor
// listed below fails: decide whether a value came from it.

import { describe, expect, it } from "vitest";
import rawWeaponRows from "../src/data/aegis-weapons.json";
import rawOverrides from "../src/data/weapon-overrides.json";
import rawPackages from "../src/data/weapon-packages.json";
import { AegisWeaponSnapshot } from "../src/data/schema";
import { abilities } from "../src/ui/data";
import { fittedRows } from "./lib/fittedRows";

/** Quoted rows that give no value (checked 2026-10-31), with the reason. They stay checks. */
const NO_VALUE: Record<string, string> = {
  "pulse-rifle-outbreak-perfected-average-per-burst-no-nanites-appended-mag-up-to-rewind-end":
    "Aegis' unit differs by a factor of four; the override takes Quantum's 80 per bullet and quotes the row only for the conflict",
  "trace-rifle-ager-s-scepter-average-will-given-form":
    "cross-check of the catalyst factor +80 % from Clarity (critShot 222 against 561 ÷ 15.09), not its source",
};

const weaponRowIds = new Set(AegisWeaponSnapshot.parse(rawWeaponRows).rows.map((r) => r.id));
const fitted = fittedRows(rawPackages, abilities).weaponRows;

type Override = { weapon: string; quotes?: { source: string; entry: string }[] };
const quoted = (rawOverrides as Override[]).flatMap((o) =>
  (o.quotes ?? [])
    .filter((q) => q.source === "aegis" && weaponRowIds.has(q.entry))
    .map((q) => [`${o.weapon}: ${q.entry}`, q.entry] as const),
);

describe("overrides that quote an Aegis Weapons row", () => {
  it("exist", () => {
    expect(quoted.length).toBeGreaterThan(0);
  });

  it.each(quoted)("%s is fitted or listed as giving no value", (_, row) => {
    expect(fitted.has(row) || row in NO_VALUE).toBe(true);
  });

  it("lists no row that is fitted after all or no longer quoted", () => {
    const rows = new Set(quoted.map(([, row]) => row));
    for (const row of Object.keys(NO_VALUE)) {
      expect(rows.has(row), `${row} is not quoted`).toBe(true);
      expect(fitted.has(row), `${row} is fitted`).toBe(false);
    }
  });
});
