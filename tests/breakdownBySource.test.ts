import { describe, expect, it } from "vitest";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { Ability } from "../src/data/schema";
import { damageBySource } from "../src/engine/analysis";
import { abilityStatMultiplier } from "../src/engine/abilityStats";
import { breakdown } from "../src/engine/breakdown";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { shotsOnly } from "./support/testWeapon";
import { simulate, type SimulationOptions } from "../src/engine/simulate";

const weapon = shotsOnly(loadWeapon(raw));
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const superStat = loadAbilityStats(rawAbilityStats).find(
  (s) => s.kind === "super",
)!;
const pick = (...ids: string[]) => effects.filter((e) => ids.includes(e.id));
const DAMAGE_PHASE_SECONDS = 30;

const source = {
  name: "test",
  retrieved: "2026-10-19",
  status: "verified",
} as const;
const n = (value: number) => ({ value, source });
// Test super; values are test inputs, not game values.
const testSuper = Ability.parse({
  id: "test-super",
  code: 1,
  name: "Test Super",
  kind: "super",
  element: "void",
  providers: [{ kind: "subclass" }],
  components: [
    {
      id: "hit",
      name: "Hit",
      delayMs: n(0),
      damagePerTick: n(10_000),
      ticks: n(1),
      tickIntervalMs: n(0),
      scalesWithAbilityStat: true,
    },
  ],
});
const withSuper: SimulationOptions = {
  abilities: [{ ability: testSuper, castsMs: [0] }],
};

describe("damageBySource", () => {
  it("puts all damage on the weapon without abilities", () => {
    const result = simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets);
    expect(damageBySource(result)).toEqual([
      { damageSource: "weapon", damage: result.totalDamage, share: 1 },
    ]);
  });

  it("splits the damage into weapon and ability sources in a fixed order", () => {
    const result = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      withSuper,
    );
    const shares = damageBySource(result);
    expect(shares.map((s) => s.damageSource)).toEqual(["weapon", "super"]);
    expect(shares[1].damage).toBe(10_000);
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1);
  });
});

describe("breakdown per damage source", () => {
  const entryOf = (entries: ReturnType<typeof breakdown>, bucketId: string) =>
    entries.find((e) => e.bucketId === bucketId)!;

  it("lists the multiplier for every damage source of the build that the bucket applies to", () => {
    const entries = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      pick("weaken", "well-of-radiance"),
      buckets,
      withSuper,
    );
    const debuffSources = entryOf(entries, "debuff").multipliersBySource;
    expect(debuffSources.map((m) => m.damageSource)).toEqual([
      "weapon",
      "super",
    ]);
    const empowering = entryOf(entries, "empowering").multipliersBySource;
    expect(empowering.map((m) => m.damageSource)).toEqual(["weapon"]);
  });

  it("shows the ability stat as its own bucket that only applies to abilities", () => {
    const options: SimulationOptions = {
      ...withSuper,
      abilityStats: [{ scaling: superStat, value: 200 }],
    };
    const entries = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      options,
    );
    const stat = entryOf(entries, "abilityStat");
    expect(stat.multiplier).toBe(1);
    expect(stat.multipliersBySource).toEqual([
      {
        damageSource: "super",
        abilityId: "test-super",
        multiplier: abilityStatMultiplier(superStat, 200),
      },
    ]);
    const withStat = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      options,
    );
    expect(withStat.totalDamage - stat.totalDamageWithout).toBeCloseTo(
      10_000 * (abilityStatMultiplier(superStat, 200) - 1),
    );
  });

  it("keeps the weapon multiplier for the existing view", () => {
    const entries = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      pick("weaken"),
      buckets,
      withSuper,
    );
    const debuff = entryOf(entries, "debuff");
    expect(debuff.multiplier).toBe(
      debuff.multipliersBySource.find((m) => m.damageSource === "weapon")!
        .multiplier,
    );
  });

  it("lists the multipliers per ability, so a buff for one ability shows only there", () => {
    // Same test super under the id of Golden Gun, which Radiant applies to.
    const goldenGun = Ability.parse({
      ...testSuper,
      id: "golden-gun-marksman",
    });
    const entries = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      pick("radiant"),
      buckets,
      { abilities: [{ ability: goldenGun, castsMs: [0] }] },
    );
    expect(entryOf(entries, "empowering").multipliersBySource).toEqual([
      { damageSource: "weapon", multiplier: 1.2 },
      {
        damageSource: "super",
        abilityId: "golden-gun-marksman",
        multiplier: 1.2,
      },
    ]);
    const other = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      pick("radiant"),
      buckets,
      withSuper,
    );
    expect(
      entryOf(other, "empowering").multipliersBySource.map(
        (m) => m.damageSource,
      ),
    ).toEqual(["weapon"]);
  });
});
