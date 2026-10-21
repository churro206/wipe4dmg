import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawBuckets from "../src/data/buckets.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { Ability, AegisAbilityRow, type AbilityKind } from "../src/data/schema";
import { abilityStatMultiplier } from "../src/engine/abilityStats";
import { loadAbilityStats, loadBuckets } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const abilityStats = loadAbilityStats(rawAbilityStats);
const scalingOf = (kind: AbilityKind) =>
  abilityStats.find((s) => s.kind === kind)!;

const source = {
  name: "test",
  retrieved: "2026-10-19",
  status: "verified",
} as const;
const n = (value: number) => ({ value, source });

// Test super with a part that scales with the super stat and one that does not (e.g. an ignition).
// Values are test inputs, not game values.
const testSuper = Ability.parse({
  id: "test-super",
  code: 1,
  name: "Test Super",
  kind: "super",
  element: "solar",
  providers: [{ kind: "subclass" }],
  components: [
    {
      id: "hit",
      name: "Hit",
      delayMs: n(0),
      damagePerTick: n(1000),
      ticks: n(1),
      tickIntervalMs: n(0),
      scalesWithAbilityStat: true,
    },
    {
      id: "ignition",
      name: "Ignition",
      delayMs: n(0),
      damagePerTick: n(500),
      ticks: n(1),
      tickIntervalMs: n(0),
      scalesWithAbilityStat: false,
    },
  ],
});

const damageOf = (stats: { kind: AbilityKind; value: number }[]) => {
  const result = simulate(weapon, 10, [], buckets, {
    abilities: [{ ability: testSuper, castsMs: [0] }],
    abilityStats: stats.map(({ kind, value }) => ({
      scaling: scalingOf(kind),
      value,
    })),
  });
  const byId = (id: string) =>
    result.damageInstances.find((d) => d.id === `test-super.${id}`)!.damage;
  return { hit: byId("hit"), ignition: byId("ignition") };
};

describe("ability-stats.json", () => {
  it("has the damage per point above 100 for super, grenade and melee", () => {
    expect(abilityStats.map((s) => s.kind).sort()).toEqual([
      "grenade",
      "melee",
      "super",
    ]);
    for (const stat of abilityStats) {
      expect(stat.damagePerPoint.value, stat.kind).toBeGreaterThan(0);
      expect(stat.damagePerPoint.source.status, stat.kind).toBe("verified");
    }
  });

  it("matches the typical factor from stat 100 to 200 measured by Aegis within 1%", () => {
    const rows = AegisAbilityRow.array().parse(rawRows);
    for (const stat of abilityStats) {
      const factors = rows
        .filter(
          (r) =>
            r.category === stat.kind &&
            r.perUseStat100.source.status === "verified",
        )
        .flatMap((r) =>
          r.perUseStat100.value && r.perUseStat200.value
            ? [r.perUseStat200.value / r.perUseStat100.value]
            : [],
        )
        .sort((a, b) => a - b);
      const median = factors[Math.floor(factors.length / 2)];
      expect(
        abilityStatMultiplier(stat, stat.maxStat) / median,
        stat.kind,
      ).toBeCloseTo(1, 2);
    }
  });
});

describe("abilityStatMultiplier", () => {
  const superStat = () => scalingOf("super");

  it("is 1 up to the stat where the damage bonus starts", () => {
    expect(abilityStatMultiplier(superStat(), 0)).toBe(1);
    expect(abilityStatMultiplier(superStat(), superStat().bonusFromStat)).toBe(
      1,
    );
  });

  it("grows linearly per point above that stat", () => {
    const stat = superStat();
    const perPoint = stat.damagePerPoint.value!;
    expect(abilityStatMultiplier(stat, stat.bonusFromStat + 50)).toBeCloseTo(
      1 + 50 * perPoint,
    );
  });

  it("rejects values above the maximum stat or below 0", () => {
    expect(() =>
      abilityStatMultiplier(superStat(), superStat().maxStat + 1),
    ).toThrow(/stat/);
    expect(() => abilityStatMultiplier(superStat(), -1)).toThrow(/stat/);
  });
});

describe("simulate with ability stats", () => {
  it("leaves the damage unchanged without stats", () => {
    expect(damageOf([])).toEqual({ hit: 1000, ignition: 500 });
  });

  it("scales only the components that scale with the ability stat", () => {
    const factor = abilityStatMultiplier(scalingOf("super"), 200);
    const damage = damageOf([{ kind: "super", value: 200 }]);
    expect(damage.hit).toBeCloseTo(1000 * factor);
    expect(damage.ignition).toBe(500);
  });

  it("uses only the stat of the ability's own kind", () => {
    expect(
      damageOf([
        { kind: "grenade", value: 200 },
        { kind: "melee", value: 200 },
      ]),
    ).toEqual({
      hit: 1000,
      ignition: 500,
    });
  });

  it("does not change weapon damage", () => {
    const without = simulate(weapon, 10, [], buckets);
    const withStats = simulate(weapon, 10, [], buckets, {
      abilityStats: [{ scaling: scalingOf("super"), value: 200 }],
    });
    expect(withStats.totalDamage).toBe(without.totalDamage);
  });

  it("fails if the bucket of the ability stat is unknown", () => {
    const unknownBucket = { ...scalingOf("super"), bucketId: "nope" };
    expect(() =>
      simulate(weapon, 10, [], buckets, {
        abilities: [{ ability: testSuper, castsMs: [0] }],
        abilityStats: [{ scaling: unknownBucket, value: 200 }],
      }),
    ).toThrow(/bucket/);
  });
});
