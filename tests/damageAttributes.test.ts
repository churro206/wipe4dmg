// Attributes of a damage instance and the scale of damage values (ADR 0015, points 4 and 7).

import { describe, expect, it } from "vitest";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawManifest from "../src/data/manifest-abilities.json";
import {
  AegisAbilityRow,
  DamageSource,
  ManifestAbilities,
  type Ability,
} from "../src/data/schema";
import { damageBySource } from "../src/engine/analysis";
import { damageScaleOf } from "../src/engine/damageScale";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { loadWeapons } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";
import { rawWeapons } from "./support/weapons";

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const abilityStats = loadAbilityStats(rawAbilityStats);
const abilities = loadAbilities(
  rawAbilities,
  AegisAbilityRow.array().parse(rawRows),
  abilityStats,
  ManifestAbilities.parse(rawManifest).abilities,
  { effects, buckets },
);
const source = {
  name: "test",
  retrieved: "2026-10-21",
  status: "verified" as const,
};

/** Ability for tests; not game data. */
const testAbility: Ability = {
  id: "test-grenade",
  code: 9001,
  name: "Test Grenade",
  kind: "grenade",
  element: "void",
  providers: [{ kind: "subclass", classes: ["warlock"], subclasses: ["void"] }],
  components: [
    {
      id: "explosion",
      name: "Explosion",
      delayMs: { value: 0, source },
      damagePerTick: { value: 100, source },
      ticks: { value: 1, source },
      tickIntervalMs: { value: 0, source },
      scalesWithAbilityStat: false,
      delivery: "splash",
    },
  ],
};

describe("damage sources", () => {
  it("include class abilities and keywords", () => {
    expect(DamageSource.parse("classAbility")).toBe("classAbility");
    expect(DamageSource.parse("keyword")).toBe("keyword");
  });
});

describe("attributes of a damage instance", () => {
  const weapon = {
    ...testWeapon,
    damageInstances: [
      { ...testWeapon.damageInstances[0], delivery: "impact" as const },
    ],
  };
  const { damageInstances } = simulate(weapon, 30, [], buckets, {
    abilities: [{ ability: testAbility, castsMs: [0] }],
  });
  const weaponHit = damageInstances.find((d) => d.damageSource === "weapon")!;
  const abilityHit = damageInstances.find((d) => d.damageSource === "grenade")!;

  it("a weapon hit carries the weapon type and its delivery", () => {
    expect(weaponHit).toMatchObject({
      weaponType: "rocketLauncher",
      delivery: "impact",
    });
    expect(weaponHit.abilityId).toBeUndefined();
  });

  it("an ability hit carries the ability and its delivery, no weapon type", () => {
    expect(abilityHit).toMatchObject({
      abilityId: "test-grenade",
      delivery: "splash",
    });
    expect(abilityHit.weaponType).toBeUndefined();
  });

  it("the delivery stays open where the data does not name it", () => {
    const plain = simulate(testWeapon, 30, [], buckets).damageInstances[0];
    expect(plain.delivery).toBeUndefined();
  });
});

describe("scale of a damage value", () => {
  const value = (name: string) => ({ value: 1, source: { ...source, name } });

  it("follows from the source of the value", () => {
    expect(damageScaleOf(value("Aegis Boss Damage sheet, row x"))).toBe(
      "aegisVisual",
    );
    expect(
      damageScaleOf(value("Quantum Damage-ics (column Body Damage)")),
    ).toBe("quantum");
    expect(
      damageScaleOf(value("Destiny Data Compendium, Arc, Thundercrash")),
    ).toBe("compendium");
    expect(damageScaleOf(value("Test fixture"))).toBeUndefined();
  });

  // An item's expression, e.g. (Quantum with ring − without) ÷ Compendium's 3 seekers: the damage is
  // the first term, the rest are counts and factors (scripts/lib/items/refs.ts)
  it("of an expression is the scale of its first source", () => {
    expect(
      damageScaleOf(value("Expression over Quantum Damage-ics (primaries), row a; Destiny Data Compendium: b")),
    ).toBe("quantum");
    expect(damageScaleOf(value("Expression over Clarity: c"))).toBeUndefined();
  });

  it("is known for every damage value of weapons and abilities", () => {
    const weaponValues = loadWeapons(rawWeapons).flatMap((w) =>
      w.damageInstances.map((d) => [w.id, d.damagePerTick] as const),
    );
    const abilityValues = abilities.flatMap((a) =>
      a.components.map((c) => [a.id, c.damagePerTick] as const),
    );
    const unknown = [...weaponValues, ...abilityValues]
      .filter(([, v]) => damageScaleOf(v) === undefined)
      .map(([id, v]) => `${id}: ${v.source.name}`);
    expect(unknown).toEqual([]);
  });
});

describe("damage by source", () => {
  it("lists class abilities and keywords after the abilities", () => {
    const result = {
      shots: [],
      superWindows: [],
      totalDamage: 4,
      dps: 0,
      damageInstances: (
        ["keyword", "classAbility", "melee", "weapon"] as const
      ).map((damageSource) => ({
        id: damageSource,
        timeMs: 0,
        damage: 1,
        damageSource,
        element: "arc" as const,
      })),
    };
    expect(damageBySource(result).map((s) => s.damageSource)).toEqual([
      "weapon",
      "melee",
      "classAbility",
      "keyword",
    ]);
  });
});
