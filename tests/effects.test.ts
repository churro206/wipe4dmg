import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { Effect, MultiplierPart } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const DAMAGE_PHASE_SECONDS = 600;

const baseTotal = simulate(weapon, DAMAGE_PHASE_SECONDS).totalDamage;
const byId = (id: string) => effects.find((e) => e.id === id)!;
const multiplierPartsOf = (effect: Effect) =>
  effect.parts.filter((p): p is MultiplierPart => p.type === "multiplier");
const multiplierOf = (effect: Effect) =>
  multiplierPartsOf(effect)[0].multiplier.value!;

/** Builds a test effect with one multiplier part. Values are test inputs, not game values. */
function testEffect(
  id: string,
  bucketId: string,
  multiplier: number,
  options: Partial<MultiplierPart> = {},
): Effect {
  return {
    id,
    name: id,
    code: 9001,
    shortName: "test",
    providers: [{ kind: "subclass" }],
    parts: [
      {
        type: "multiplier",
        bucketId,
        multiplier: {
          value: multiplier,
          source: { name: "test", retrieved: "2026-10-18", status: "verified" },
        },
        damageSources: ["weapon"],
        ...options,
      },
    ],
  };
}

describe("data files", () => {
  it("every multiplier part refers to an existing bucket", () => {
    const bucketIds = new Set(buckets.map((b) => b.id));
    for (const effect of effects) {
      for (const part of multiplierPartsOf(effect)) {
        expect(bucketIds).toContain(part.bucketId);
      }
    }
  });

  it("effect ids are unique", () => {
    const ids = effects.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("simulate: effects", () => {
  it("marks weapon damage instances with their damage source and element", () => {
    const { damageInstances } = simulate(weapon, DAMAGE_PHASE_SECONDS);
    for (const instance of damageInstances) {
      expect(instance.damageSource).toBe("weapon");
      expect(instance.element).toBe(weapon.element);
    }
  });

  it("does not change damage without effects", () => {
    expect(
      simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets).totalDamage,
    ).toBe(baseTotal);
  });

  it("applies only the highest effect in a bucket with stacking rule highest", () => {
    const low = testEffect("low", "empowering", 1.2);
    const high = testEffect("high", "empowering", 1.25);
    const { totalDamage } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [low, high],
      buckets,
    );
    expect(totalDamage).toBeCloseTo(baseTotal * 1.25);
  });

  it("multiplies effects within a bucket with stacking rule multiplicative", () => {
    const multiplicative = [
      { ...buckets[0], id: "mult", stacking: "multiplicative" as const },
    ];
    const a = testEffect("a", "mult", 1.2);
    const b = testEffect("b", "mult", 1.1);
    const { totalDamage } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [a, b],
      multiplicative,
    );
    expect(totalDamage).toBeCloseTo(baseTotal * 1.2 * 1.1);
  });

  it("adds effects within a bucket with stacking rule additive", () => {
    const additive = [
      { ...buckets[0], id: "add", stacking: "additive" as const },
    ];
    const a = testEffect("a", "add", 1.2);
    const b = testEffect("b", "add", 1.1);
    const { totalDamage } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [a, b],
      additive,
    );
    expect(totalDamage).toBeCloseTo(baseTotal * 1.3);
  });

  it("multiplies the buckets with each other", () => {
    const empowering = testEffect("e", "empowering", 1.25);
    const debuff = testEffect("d", "debuff", 1.3);
    const { totalDamage } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [empowering, debuff],
      buckets,
    );
    expect(totalDamage).toBeCloseTo(baseTotal * 1.25 * 1.3);
  });

  it("ignores a multiplier for another element", () => {
    const otherElement = weapon.element === "arc" ? "void" : "arc";
    const surge = testEffect("s", "surge", 1.25, { elements: [otherElement] });
    expect(
      simulate(weapon, DAMAGE_PHASE_SECONDS, [surge], buckets).totalDamage,
    ).toBe(baseTotal);
  });

  it("ignores a multiplier for another damage source", () => {
    const superOnly = testEffect("s", "empowering", 1.25, {
      damageSources: ["super"],
    });
    expect(
      simulate(weapon, DAMAGE_PHASE_SECONDS, [superOnly], buckets).totalDamage,
    ).toBe(baseTotal);
  });

  it("rejects an effect with an unknown bucket", () => {
    const unknown = testEffect("u", "noSuchBucket", 1.25);
    expect(() =>
      simulate(weapon, DAMAGE_PHASE_SECONDS, [unknown], buckets),
    ).toThrow("noSuchBucket");
  });

  it("rejects an effect whose multiplier is missing", () => {
    const missing = testEffect("m", "empowering", 1.25);
    multiplierPartsOf(missing)[0].multiplier.value = null;
    expect(() =>
      simulate(weapon, DAMAGE_PHASE_SECONDS, [missing], buckets),
    ).toThrow("multiplier");
  });

  it("multiplies the effects from the data file across buckets", () => {
    // The same set Aegis assumes for its "Single" column: surge, buff, debuff, Weapons stat 200.
    const chosen = [
      "surge-3x",
      "lumina-noble-rounds",
      "tractor-cannon",
      "weapons-stat-200",
    ].map(byId);
    const expected = chosen.reduce(
      (product, e) => product * multiplierOf(e),
      baseTotal,
    );
    // Whole damage phase for every effect: this test is about stacking, not about durations.
    const wholePhase = Object.fromEntries(
      chosen.map((e) => [e.id, { startMs: 0 }]),
    );
    expect(
      simulate(weapon, DAMAGE_PHASE_SECONDS, chosen, buckets, {
        effectWindows: wholePhase,
      }).totalDamage,
    ).toBeCloseTo(expected);
  });
});
