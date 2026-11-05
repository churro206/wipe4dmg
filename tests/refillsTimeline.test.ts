// V3: the result names the refills (Vex Mythoclast: Timeless Mythoclast), so that the timeline of the
// weapon table can show the magazine chain 25, 20, 16, 13, 11, 9, 8 (Clarity: 80 % of the hits, at least 9).

import { describe, expect, it } from "vitest";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { loadKeywords, loadStatusModifiers } from "../src/engine/loadKeywords";
import { simulate } from "../src/engine/simulate";
import { magazineChain } from "../src/ui/weaponTimeline";
import { weaponById } from "./support/weapons";

const buckets = loadBuckets(rawBuckets);
const keywords = loadKeywords(rawKeywords, AegisAbilityRow.array().parse(rawAbilityRows));
const statusModifiers = loadStatusModifiers(rawKeywords);
const run = (id: string, seconds: number) =>
  simulate(weaponById(id), seconds, [], buckets, { keywords, statusModifiers });

describe("refills in the result", () => {
  it("Vex Mythoclast: six refills, the chain of magazines is 25, 20, 16, 13, 11, 9, 8", () => {
    const result = run("vex-mythoclast", 20);
    expect(result.refillsMs).toHaveLength(6);
    expect(magazineChain(result).slice(0, 7)).toEqual([25, 20, 16, 13, 11, 9, 8]);
  });
  it("a weapon without a refill rule has none: the magazines end in reloads", () => {
    const result = run("khvostov-7g-0x", 12);
    expect(result.refillsMs).toEqual([]);
    expect(magazineChain(result)[0]).toBe(43);
    expect(magazineChain(result)).toHaveLength(result.reloadsMs.length + 1);
  });
});
