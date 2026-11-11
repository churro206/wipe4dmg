// Overrides of the weapon import (ADR 0013, point 7): every override names its reason and quotes a
// snapshot; the quote must still be there, so a changed source shows up after an import.

import { describe, expect, it } from "vitest";
import rawClarity from "../src/data/clarity.json";
import rawCompendium from "../src/data/compendium-weapons.json";
import rawOverrides from "../src/data/weapon-overrides.json";
import rawAegis from "../src/data/aegis-weapons.json";
import rawSustained from "../src/data/aegis-sustained.json";
import rawQuantum from "../src/data/quantum-weapons.json";
import rawManifest from "../src/data/manifest-weapons.json";
import {
  ClaritySnapshot,
  CompendiumSnapshot,
  ManifestWeapons,
  WeaponOverride,
} from "../src/data/schema";

const overrides = WeaponOverride.array().parse(rawOverrides);
const manifest = ManifestWeapons.parse(rawManifest).weapons;
const clarity = ClaritySnapshot.parse(rawClarity).entries;
const compendium = CompendiumSnapshot.parse(rawCompendium).entries;
const rows: { id: string }[] = [
  ...rawAegis.rows,
  ...rawSustained.rows,
  ...rawQuantum.rows,
];
const cellsOf = (id: string) =>
  rows.filter((r) => r.id === id).map((r) => JSON.stringify(r));

describe("weapon-overrides.json", () => {
  it("is empty since W6d (Fafnir and Turncoat became items); A2 removes the file", () => {
    expect(overrides).toEqual([]);
  });

  it.each(overrides.map((o) => [o.weapon, o] as const))(
    "%s quotes text that is still in the snapshot",
    (_, override) => {
      expect(override.reason).not.toBe("");
      expect(override.quotes.length).toBeGreaterThan(0);
      for (const quote of override.quotes) {
        const texts =
          quote.source === "clarity"
            ? clarity.filter((e) => e.name === quote.entry).map((e) => e.text)
            : quote.source === "compendium"
              ? compendium
                  .filter((e) => e.name.startsWith(quote.entry))
                  .map((e) => e.text)
              : quote.source === "manifest"
                ? manifest
                    .filter((w) => w.name === quote.entry)
                    .map((w) => JSON.stringify(w.stats))
                : cellsOf(quote.entry);
        expect(
          texts.some((text) => text.includes(quote.text)),
          `${quote.source}: ${quote.entry}`,
        ).toBe(true);
      }
    },
  );

  it.each(overrides.map((o) => [o.weapon, o] as const))(
    "%s names only rows that exist",
    (_, override) => {
      for (const id of [
        override.base,
        override.timing?.row,
        override.timing?.catalystRow,
      ].filter((id): id is string => id !== undefined))
        expect(cellsOf(id).length, id).toBe(1);
    },
  );
});
