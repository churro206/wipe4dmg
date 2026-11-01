// Golden example Polaris Lance (docs/architecture.md section 11, ADR 0018 B3a step 4): the Perfect
// Fifth as rules. Every fifth precision hit sets off a Perfect Fifth after 0.5 s that applies 40
// scorch (60 with Ember of Ashes); burn and ignition come from the status container. The numbers of
// the table are computed on paper from the design; the legacy construction (every Nth shot plus a
// keyword part) must give the same hits.

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow, Weapon, type Rule } from "../src/data/schema";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const source = {
  name: "docs/architecture.md, section 11",
  retrieved: "2026-10-31",
  status: "unverified" as const,
};
const n = (value: number) => ({ value, source });

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const ember = effects.find((e) => e.id === "ember-of-ashes")!;
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawRows),
);

const part = (id: string, damage: number, canPrecision: boolean) => ({
  id,
  name: id,
  delayMs: n(0),
  damagePerTick: n(damage),
  ticks: n(1),
  tickIntervalMs: n(0),
  canPrecision,
  requiresCatalyst: false,
});
// 150 rpm: a shot every 0.4 s from 0 s, primary ammo, no reload (section 11)
const base = {
  ...testWeapon,
  id: "polaris-golden",
  weaponType: "scoutRifle" as const,
  element: "solar" as const,
  ammo: "primary" as const,
  fireRateRpm: n(150),
  magazine: n(1000),
  reloadTimeMs: n(0),
};

// The rules of section 5.4: all conditions of an event see the state before the event, so `count`
// counts the first four precision hits and `fifth` fires on the fifth (counter = 4).
const precisionHit = { on: "hit", part: "shot", precision: true } as const;
const rules: Rule[] = [
  { id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] },
  { id: "refill", on: precisionHit, do: [{ type: "refill", rounds: n(1) }] },
  {
    id: "count",
    on: precisionHit,
    if: [{ type: "counter", id: "fifth", op: "<", value: n(4) }],
    do: [{ type: "addStacks", counter: "fifth" }],
  },
  {
    id: "fifth",
    on: precisionHit,
    if: [{ type: "counter", id: "fifth", op: "=", value: n(4) }],
    do: [
      { type: "resetCounter", counter: "fifth" },
      { type: "spawn", part: "perfect-fifth", delayMs: n(500) },
    ],
  },
  {
    id: "scorch",
    on: { on: "hit", part: "perfect-fifth" },
    do: [{ type: "applyStatus", status: "scorch", stacks: n(40) }],
  },
];
const withRules: Weapon = Weapon.parse({
  ...base,
  damageInstances: [part("shot", 100, true), part("perfect-fifth", 200, false)],
  rules,
});

// The legacy construction of the same weapon: a part every 5th shot that applies the keyword
const legacy: Weapon = Weapon.parse({
  ...base,
  damageInstances: [
    part("shot", 100, true),
    {
      ...part("perfect-fifth", 200, false),
      delayMs: n(500),
      everyNthShot: n(5),
    },
  ],
  intrinsicParts: [
    {
      type: "appliesKeyword",
      keywordId: "ignition",
      damageSources: ["weapon"],
      damageInstanceIds: ["perfect-fifth"],
      stacks: n(40),
      source,
    },
  ],
});

const run = (weapon: Weapon, seconds: number, withEmber: boolean) =>
  simulate(weapon, seconds, withEmber ? [ember] : [], buckets, { keywords });
const timesOf = (
  result: ReturnType<typeof run>,
  id: string,
): number[] => result.damageInstances.filter((d) => d.id === id).map((d) => d.timeMs);

describe("Polaris Lance as rules (section 11)", () => {
  it("10.5 s without Ember: five Perfect Fifths, one ignition, nine burn ticks", () => {
    const result = run(withRules, 10.5, false);
    expect(timesOf(result, "perfect-fifth")).toEqual([2100, 4100, 6100, 8100, 10100]);
    expect(timesOf(result, "ignition")).toEqual([6100]);
    expect(timesOf(result, "burn")).toEqual([
      2600, 3530, 4090, 4650, 5210, 5770, 8600, 9530, 10090,
    ]);
  });

  it("10.5 s with Ember of Ashes: two ignitions, six burn ticks", () => {
    const result = run(withRules, 10.5, true);
    expect(timesOf(result, "perfect-fifth")).toEqual([2100, 4100, 6100, 8100, 10100]);
    expect(timesOf(result, "ignition")).toEqual([4100, 8100]);
    expect(timesOf(result, "burn")).toEqual([2600, 3530, 4090, 6600, 7530, 8090]);
  });

  it("30 s: 14 Perfect Fifths, 4 ignitions, 7 with Ember (the gate of everyNthShot)", () => {
    const without = run(withRules, 30, false);
    const withEmber = run(withRules, 30, true);
    expect(timesOf(without, "perfect-fifth")).toHaveLength(14);
    expect(timesOf(without, "ignition")).toHaveLength(4);
    expect(timesOf(withEmber, "perfect-fifth")).toHaveLength(14);
    expect(timesOf(withEmber, "ignition")).toHaveLength(7);
  });

  it.each([
    [10.5, false],
    [10.5, true],
    [30, false],
    [30, true],
  ])("gives the same hits as the legacy construction (%s s, Ember %s)", (seconds, withEmber) => {
    const key = (r: ReturnType<typeof run>) =>
      r.damageInstances.map((d) => [d.id, d.timeMs, d.damage]);
    expect(key(run(withRules, seconds, withEmber))).toEqual(
      key(run(legacy, seconds, withEmber)),
    );
  });

  it("refill: a precision hit gives a round back, so a small magazine never runs dry", () => {
    const small = (rulesOfWeapon: Rule[]) =>
      Weapon.parse({
        ...base,
        magazine: n(2),
        reloadTimeMs: n(2000),
        damageInstances: [part("shot", 100, true)],
        rules: rulesOfWeapon,
      });
    const shotRule = rules[0];
    const refillRule = rules[1];
    expect(timesOf(run(small([shotRule, refillRule]), 2, false), "shot")).toEqual([
      0, 400, 800, 1200, 1600, 2000,
    ]);
    // without the refill the magazine empties after two shots and the reload takes 2 s
    expect(timesOf(run(small([shotRule]), 3, false), "shot")).toEqual([
      0, 400, 2800,
    ]);
  });

  it("refill during a reload that is planned already is an error until B3b", () => {
    const empty = Weapon.parse({
      ...base,
      magazine: n(1),
      reloadTimeMs: n(2000),
      damageInstances: [part("shot", 100, true)],
      rules: [rules[0], rules[1]],
    });
    expect(() => run(empty, 3, false)).toThrow(/B3b/);
  });

  it("uses no rules for a weapon without them", () => {
    const result = run(Weapon.parse({ ...base, damageInstances: [part("shot", 100, true)] }), 2, false);
    expect(timesOf(result, "shot")).toEqual([0, 400, 800, 1200, 1600, 2000]);
  });
});
