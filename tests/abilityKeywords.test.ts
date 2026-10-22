// Keywords of abilities (ADR 0015, U5): which keyword an ability applies per use, and which keyword
// damage Aegis counted into its package (taken out when loading, so nothing counts twice).

import { describe, expect, it } from "vitest";
import { abilityKeywords } from "../scripts/lib/keywordSources";
import { loadKeywordInputs } from "../scripts/lib/keywordInputs";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import { AbilityKeyword } from "../src/data/schema";

const { entries, gaps } = abilityKeywords(loadKeywordInputs());
const of = (abilityId: string) => entries.filter((e) => e.abilityId === abilityId);
const value = (n?: { value: number | null }) => n?.value ?? null;

describe("abilityKeywords", () => {
  it("takes the scorch per use from the largest quoted stacks", () => {
    // "inflicts x45+27 Scorch with all 9 drones"
    expect(value(of("swarm-grenade")[0].stacksPerUse)).toBe(45);
    // "x60+30 Scorch by scoring all 3 knives"
    expect(value(of("knife-trick")[0].stacksPerUse)).toBe(60);
  });

  it("multiplies scorch per shot with the shots of a Golden Gun", () => {
    // "inflicts x40+10 Scorch per shot", "6 Shot Golden Gun" / "3 Shot Golden Gun"
    expect(value(of("golden-gun-deadshot")[0].stacksPerUse)).toBe(240);
    expect(value(of("golden-gun-marksman")[0].stacksPerUse)).toBe(120);
  });

  it("counts the ignitions inside an Aegis package by the scorch of its uses", () => {
    // Fusion: 2 uses with Ember of Ashes, x40+20 each = 120 -> 1 ignition of 1592
    expect(of("fusion-grenade")[0].bakedInPackage).toMatchObject({
      triggers: 1,
      tick: 1592,
      uses: 2,
      fullModifiers: 2.3,
    });
    // Thermite: 20 uses with Ember of x40+40; an ignition removes all scorch, so every second use
    // (80 + 80) sets one off -> 10 ignitions
    expect(of("thermite-grenade")[0].bakedInPackage?.triggers).toBe(10);
    // Hammer Strike: no ignition in the Aegis ticks, nothing to take out
    expect(of("hammer-strike")[0].bakedInPackage).toBeUndefined();
  });

  it("applies jolt and volatile without stacks", () => {
    expect(of("pocket-singularity")).toMatchObject([
      { keywordId: "volatile" },
    ]);
    expect(of("pocket-singularity")[0].stacksPerUse).toBeUndefined();
  });

  it("lists what it cannot model as a gap with a reason", () => {
    expect(gaps.map((g) => g.abilityId)).toContain("arcane-needle"); // unravel without duration
  });

  it("reads stacks with a PvP value in brackets", () => {
    // "apply up to x100+50 [x50+25] Scorch by scoring hits with all 5 burning sparks"
    expect(value(of("incinerator-snap")[0].stacksPerUse)).toBe(100);
  });

  it("ability-keywords.json is current (run npm run build:keywords)", () => {
    expect(AbilityKeyword.array().parse(rawAbilityKeywords)).toEqual(entries);
  });
});
