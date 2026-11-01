// Burn of scorch (ADR 0017, stage S2): a scorched target takes damage from its stacks; the stacks
// decay and an ignition ends the burn.

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow, type Weapon } from "../src/data/schema";
import { compareResults } from "../src/engine/analysis";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { withScorchHits } from "./support/testWeapon";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawRows),
);
const PHASE_SECONDS = 30;

/** Copy of the weapon with one application of `stacks` right at the shot; test input, not game data. */
const withStacks = (stacks: number): Weapon => withScorchHits(weapon, stacks, 1);

const burnOf = (
  w: Weapon,
  selected = effects.slice(0, 0),
  shotLimit = 1,
) =>
  simulate(w, PHASE_SECONDS, selected, buckets, { keywords, shotLimit })
    .damageInstances.filter((d) => d.id === "burn");

// Compendium, Solar: 2.7 + 0.175 x stacks; the stacks hold 2.3 s, then fall by 25 per second.
const burnDamage = (stacks: number) => 2.7 + 0.175 * stacks;

describe("burn of scorch in the core", () => {
  it("ticks after 0.5 s, 0.93 s later, then every 0.56 s, and falls with the decaying stacks", () => {
    const burn = burnOf(withStacks(40));
    const shotMs = simulate(withStacks(40), PHASE_SECONDS, [], buckets, {
      keywords,
      shotLimit: 1,
    }).shots[0].timeMs;
    expect(burn.map((d) => d.timeMs - shotMs)).toEqual([
      500, 1430, 1990, 2550, 3110, 3670,
    ]);
    // After 2.3 s one stack falls every 0.04 s. The burn is a solar effect that the weapon applied,
    // so it carries the weapon's bonus on its keyword damage (B3b step 5: the source is the hit).
    const bonus = weapon.keywordBonuses![0].factor.value!;
    const expected = [40, 40, 40, 34, 20, 6].map((s) => burnDamage(s) * bonus);
    burn.forEach((d, i) => expect(d.damage).toBeCloseTo(expected[i], 6));
    expect(burn).toHaveLength(expected.length);
  });

  it("stops at an ignition: the stacks are gone", () => {
    expect(burnOf(withStacks(100))).toEqual([]);
  });

  it("is keyword damage of the element of the Ignition", () => {
    const [first] = burnOf(withStacks(40));
    expect(first).toMatchObject({ damageSource: "keyword", element: "solar" });
  });

  it("inherits the multipliers of the weapon that applied the scorch", () => {
    const surge = effects.find((e) => e.id === "surge-3x")!;
    const plain = burnOf(withStacks(40));
    const boosted = burnOf(withStacks(40), [surge]);
    expect(boosted[0].damage / plain[0].damage).toBeGreaterThan(1);
  });

  it("is no proc of the keyword in the comparison counters", () => {
    const result = simulate(withStacks(40), PHASE_SECONDS, [], buckets, {
      keywords,
      shotLimit: 1,
    });
    expect(result.damageInstances.some((d) => d.id === "burn")).toBe(true);
    expect(
      compareResults(result, result).some((row) => row.key === "keyword:ignition"),
    ).toBe(false);
  });

  it("comes through the one entry of the simulator", () => {
    const viaEntry = simulate(withStacks(40), PHASE_SECONDS, [], buckets, {
      keywords,
      shotLimit: 1,
    });
    expect(viaEntry.damageInstances.filter((d) => d.id === "burn")).toHaveLength(6);
  });
});
