// Overrides of the weapon import (ADR 0013, point 7): every override names its reason and quotes a
// snapshot; the quote must still be there, so a changed source shows up after an import.

import { describe, expect, it } from "vitest";
import rawClarity from "../src/data/clarity.json";
import rawCompendium from "../src/data/compendium-weapons.json";
import rawOverrides from "../src/data/weapon-overrides.json";
import {
  ClaritySnapshot,
  CompendiumSnapshot,
  WeaponOverride,
} from "../src/data/schema";

const overrides = WeaponOverride.array().parse(rawOverrides);
const clarity = ClaritySnapshot.parse(rawClarity).entries;
const compendium = CompendiumSnapshot.parse(rawCompendium).entries;

describe("weapon-overrides.json", () => {
  it.each(overrides.map((o) => [o.weapon, o] as const))(
    "%s quotes text that is still in the snapshot",
    (_, override) => {
      expect(override.reason).not.toBe("");
      expect(override.quotes.length).toBeGreaterThan(0);
      for (const quote of override.quotes) {
        const texts =
          quote.source === "clarity"
            ? clarity.filter((e) => e.name === quote.entry).map((e) => e.text)
            : compendium
                .filter((e) => e.name.startsWith(quote.entry))
                .map((e) => e.text);
        expect(
          texts.some((text) => text.includes(quote.text)),
          `${quote.source}: ${quote.entry}`,
        ).toBe(true);
      }
    },
  );
});
