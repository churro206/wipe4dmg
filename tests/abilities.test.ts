import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import { Ability, type Effect } from "../src/data/schema";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const DAMAGE_PHASE_SECONDS = 30;

const source = {
  name: "test",
  retrieved: "2026-10-19",
  status: "verified",
} as const;
const n = (value: number | null) => ({
  value,
  source: value === null ? { ...source, status: "missing" as const } : source,
});

// Test ability: an impact, then 4 ticks one second apart. Values are test inputs, not game values.
const testAbility: Ability = Ability.parse({
  id: "test-super",
  code: 1,
  name: "Test Super",
  kind: "super",
  element: "arc",
  providers: [{ kind: "subclass", classes: ["titan"], subclasses: ["arc"] }],
  components: [
    {
      id: "impact",
      name: "Impact",
      delayMs: n(0),
      damagePerTick: n(1000),
      ticks: n(1),
      tickIntervalMs: n(0),
      scalesWithAbilityStat: true,
    },
    {
      id: "aftershock",
      name: "Aftershock",
      delayMs: n(750),
      damagePerTick: n(100),
      ticks: n(4),
      tickIntervalMs: n(1000),
      scalesWithAbilityStat: true,
    },
  ],
});

const abilityInstances = (result: ReturnType<typeof simulate>) =>
  result.damageInstances.filter((d) => d.damageSource !== "weapon");

describe("Ability schema", () => {
  it("rejects an ability with the damage source weapon", () => {
    expect(() => Ability.parse({ ...testAbility, kind: "weapon" })).toThrow();
  });

  it("rejects an ability without components", () => {
    expect(() => Ability.parse({ ...testAbility, components: [] })).toThrow();
  });
});

describe("simulate with abilities", () => {
  const cast = (castsMs: number[], ability: Ability = testAbility) => ({
    abilities: [{ ability, castsMs }],
  });

  it("creates the damage instances of every component after a cast", () => {
    const result = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      cast([2000]),
    );
    expect(
      abilityInstances(result).map((d) => [d.id, d.timeMs, d.damage]),
    ).toEqual([
      ["test-super.impact", 2000, 1000],
      ["test-super.aftershock", 2750, 100],
      ["test-super.aftershock", 3750, 100],
      ["test-super.aftershock", 4750, 100],
      ["test-super.aftershock", 5750, 100],
    ]);
  });

  it("gives the instances the ability's damage source, element and id", () => {
    const [impact] = abilityInstances(
      simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, cast([0])),
    );
    expect(impact).toMatchObject({
      damageSource: "super",
      element: "arc",
      abilityId: "test-super",
    });
  });

  it("repeats the components for every cast", () => {
    const result = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      cast([0, 10_000]),
    );
    expect(abilityInstances(result)).toHaveLength(10);
  });

  it("drops instances after the end of the damage phase", () => {
    const result = simulate(weapon, 3, [], buckets, cast([2000]));
    expect(abilityInstances(result).map((d) => d.timeMs)).toEqual([2000, 2750]);
  });

  it("adds the ability damage to the weapon damage", () => {
    const weaponOnly = simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets);
    const withAbility = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      cast([0]),
    );
    expect(withAbility.totalDamage).toBeCloseTo(weaponOnly.totalDamage + 1400);
    expect(withAbility.shots).toEqual(weaponOnly.shots);
  });

  it("applies multipliers that list the ability's damage source", () => {
    const weaken = byId("weaken"); // debuff for weapon, grenade, melee and super
    const result = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [weaken],
      buckets,
      cast([0]),
    );
    const factor =
      weaken.parts[0].type === "multiplier"
        ? weaken.parts[0].multiplier.value!
        : NaN;
    expect(abilityInstances(result)[0].damage).toBeCloseTo(1000 * factor);
  });

  it("ignores multipliers for other damage sources", () => {
    const weaponOnlyBuff: Effect = { ...byId("weapons-stat-200") };
    const result = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [weaponOnlyBuff],
      buckets,
      cast([0]),
    );
    expect(abilityInstances(result)[0].damage).toBe(1000);
  });

  it("ignores multipliers limited to weapon types", () => {
    const fusionOnly: Effect = {
      ...byId("weaken"),
      id: "fusion-only",
      parts: [
        {
          type: "multiplier",
          bucketId: "debuff",
          multiplier: n(2),
          damageSources: ["super"],
          weaponTypes: ["fusionRifle"],
        },
      ],
    };
    const result = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [fusionOnly],
      buckets,
      cast([0]),
    );
    expect(abilityInstances(result)[0].damage).toBe(1000);
  });

  it("throws on a missing component value", () => {
    const broken = structuredClone(testAbility);
    broken.components[0].damagePerTick = n(null);
    expect(() =>
      simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, cast([0], broken)),
    ).toThrow(/damagePerTick/);
  });
});
