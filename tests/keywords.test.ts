// Keywords of the subclasses as data (ADR 0015, point 5): mechanics quoted from the Compendium,
// damage per trigger from the Aegis row.

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawCompendium from "../src/data/compendium-abilities.json";
import rawKeywords from "../src/data/keywords.json";
import { hasQuote } from "../scripts/lib/compendiumAbilities";
import {
  AegisAbilityRow,
  CompendiumSnapshot,
  KeywordData,
  type KeywordData as KeywordDataType,
  type SourcedNumber,
} from "../src/data/schema";
import { KEYWORD_COUNTERS } from "../src/engine/effectParts";
import { loadKeywords } from "../src/engine/loadKeywords";

const rows = AegisAbilityRow.array().parse(rawRows);
const compendium = CompendiumSnapshot.parse(rawCompendium);
const data = KeywordData.array().parse(rawKeywords);
const keywords = loadKeywords(rawKeywords, rows);
const keyword = (id: string) => keywords.find((k) => k.id === id)!;

/** All sourced numbers of a keyword entry, with their field name. */
function sourcedNumbers(entry: object): [string, SourcedNumber][] {
  return Object.entries(entry).flatMap(([field, value]) => {
    if (value && typeof value === "object" && "source" in value)
      return [[field, value as SourcedNumber]];
    if (value && typeof value === "object" && !Array.isArray(value))
      return sourcedNumbers(value);
    return [];
  });
}

describe("keywords.json", () => {
  it("has the keywords with damage of their own that the engine models (ADR 0015)", () => {
    expect(data.map((k) => k.id).sort()).toEqual([
      "boltCharge",
      "ignition",
      "jolt",
      "unravel",
      "volatile",
    ]);
  });

  it("quotes every mechanic from the glossary entry its source names", () => {
    // "Destiny Data Compendium, Solar (Scorch)" names tab and entry; otherwise the keyword's entry.
    const entryOf = (
      value: SourcedNumber,
      fallback: KeywordDataType["compendium"],
    ) => {
      const named = /^Destiny Data Compendium, (\w+) \(([^)]+)\)/.exec(
        value.source.name,
      );
      return named ? { tab: named[1], entry: named[2] } : fallback;
    };
    const missing = data.flatMap((entry) =>
      sourcedNumbers(entry)
        .filter(([, value]) => value.source.quote !== undefined)
        .filter(
          ([, value]) =>
            !hasQuote(compendium.entries, {
              ...entryOf(value, entry.compendium),
              quote: value.source.quote!,
            }),
        )
        .map(([field]) => `${entry.id}.${field}`),
    );
    expect(missing).toEqual([]);
  });

  it("names an existing Aegis row for the damage of every keyword", () => {
    for (const entry of data) {
      expect(
        rows.some((r) => r.id === entry.aegisRowId),
        entry.id,
      ).toBe(true);
    }
  });
});

describe("KEYWORD_COUNTERS", () => {
  it("names the counter of every keyword that goes off by a counter", () => {
    const fromData = Object.fromEntries(
      data.flatMap((k) =>
        k.trigger.type === "counter" ? [[k.id, k.trigger.counterId]] : [],
      ),
    );
    expect(KEYWORD_COUNTERS).toEqual(fromData);
  });
});

describe("loadKeywords", () => {
  it("takes the damage per trigger from the Aegis row (Aegis visual scale)", () => {
    expect(keyword("jolt").damage.value).toBe(99.13);
    expect(keyword("ignition").damage.value).toBe(675.217);
    expect(keyword("volatile").damage.value).toBe(93.913);
    expect(keyword("boltCharge").damage.value).toBe(677.826);
    expect(keyword("unravel").damage.value).toBe(39.13);
  });

  it("keeps the ignition cooldown that the measurements allow (ADR 0011, rule 3)", () => {
    expect(keyword("ignition").cooldownMs.value).toBe(1300);
  });

  it("rejects an unknown Aegis row", () => {
    const [first] = rawKeywords;
    expect(() =>
      loadKeywords([{ ...first, aegisRowId: "no-such-row" }], rows),
    ).toThrow(/no-such-row/);
  });
});
