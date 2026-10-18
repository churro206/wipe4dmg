import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawReferenceValues from "../src/data/reference-values.json";
import { ReferenceValue, type Weapon } from "../src/data/schema";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const referenceValues = ReferenceValue.array().parse(rawReferenceValues);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const LONG_DAMAGE_PHASE_SECONDS = 600;

const ignitionsOf = (result: ReturnType<typeof simulate>) =>
  result.damageInstances.filter((d) => d.id === "ignition");

const counterOf = (w: Weapon) => {
  const part = w.intrinsicParts.find((p) => p.type === "counter")!;
  if (part.type !== "counter") throw new Error("no counter part");
  return part;
};
const thresholdOf = (w: Weapon) => {
  const part = w.intrinsicParts.find((p) => p.type === "threshold")!;
  if (part.type !== "threshold") throw new Error("no threshold part");
  return part;
};

/**
 * Copy of the weapon with simple scorch values: one application per shot right at the shot.
 * The numbers are test inputs, not game values.
 */
function withScorch(
  stacks: number,
  applications: number,
  cooldownMs: number,
): Weapon {
  const copy = structuredClone(weapon);
  const counter = counterOf(copy);
  counter.stacks.value = stacks;
  counter.applicationsPerTrigger.value = applications;
  counter.firstDelayMs.value = 0;
  counter.intervalMs.value = 0;
  thresholdOf(copy).cooldownMs.value = cooldownMs;
  return copy;
}

describe("simulate: scorch and ignition", () => {
  it("matches the Quantum Damage-ics total damage with ignitions", () => {
    const reference = referenceValues.find(
      (r) => r.id === "quantum-with-ignition",
    )!;
    const { totalDamage } = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS);
    expect(totalDamage).toBeGreaterThanOrEqual(reference.totalDamageMin);
    expect(totalDamage).toBeLessThanOrEqual(reference.totalDamageMax);
  });

  it("creates ignitions as weapon damage of their element", () => {
    const ignitions = ignitionsOf(simulate(weapon, LONG_DAMAGE_PHASE_SECONDS));
    expect(ignitions.length).toBeGreaterThan(0);
    for (const ignition of ignitions) {
      expect(ignition.damageSource).toBe("weapon");
      expect(ignition.element).toBe(thresholdOf(weapon).element);
      expect(ignition.damage).toBe(thresholdOf(weapon).damage.value);
    }
  });

  it("triggers an ignition when the stacks reach the threshold", () => {
    // 50 stacks per shot: shots 2, 4, 6, ... reach 100.
    const result = simulate(withScorch(50, 1, 0), LONG_DAMAGE_PHASE_SECONDS);
    const ignitions = ignitionsOf(result);
    expect(ignitions).toHaveLength(Math.floor(result.shots.length / 2));
    expect(ignitions[0].timeMs).toBe(result.shots[1].timeMs);
  });

  it("applies no stacks during the cooldown after an ignition", () => {
    // 100 stacks per shot, but the cooldown blocks the next shot.
    const noCooldown = simulate(
      withScorch(100, 1, 0),
      LONG_DAMAGE_PHASE_SECONDS,
    );
    const shotIntervalMs =
      noCooldown.shots[1].timeMs - noCooldown.shots[0].timeMs;
    const withCooldown = simulate(
      withScorch(100, 1, shotIntervalMs + 1),
      LONG_DAMAGE_PHASE_SECONDS,
    );
    expect(ignitionsOf(noCooldown)).toHaveLength(noCooldown.shots.length);
    expect(ignitionsOf(withCooldown).length).toBeLessThan(
      noCooldown.shots.length,
    );
  });

  it("ignores ignitions after the end of the damage phase", () => {
    const delayed = withScorch(100, 1, 0);
    counterOf(delayed).firstDelayMs.value = 500;
    const firstShotSeconds = weapon.chargeTimeMs.value! / 1000;
    expect(ignitionsOf(simulate(delayed, firstShotSeconds))).toEqual([]);
  });

  it("increases scorch stacks with Ember of Ashes, rounded up", () => {
    // 20 applications of 3 stacks: 60 without Ember, 20 x ceil(4.5) = 100 with Ember.
    const test = withScorch(3, 20, 0);
    const ember = byId("ember-of-ashes");
    const without = simulate(test, LONG_DAMAGE_PHASE_SECONDS, [], buckets);
    const withEmber = simulate(
      test,
      LONG_DAMAGE_PHASE_SECONDS,
      [ember],
      buckets,
    );
    expect(ignitionsOf(withEmber)).toHaveLength(withEmber.shots.length);
    expect(ignitionsOf(without).length).toBeLessThan(without.shots.length);
  });

  it("applies weapon multipliers to ignitions", () => {
    const surge = byId("solar-surge-4x");
    const surgePart = surge.parts[0];
    if (surgePart.type !== "multiplier") throw new Error("expected multiplier");
    const ignitions = ignitionsOf(
      simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [surge], buckets),
    );
    expect(ignitions[0].damage).toBeCloseTo(
      thresholdOf(weapon).damage.value! * surgePart.multiplier.value!,
    );
  });

  it.each(["threshold", "cooldownMs", "damage"] as const)(
    "rejects a threshold part whose %s is missing",
    (field) => {
      const incomplete = structuredClone(weapon);
      thresholdOf(incomplete)[field].value = null;
      expect(() => simulate(incomplete, 30)).toThrow(field);
    },
  );

  it.each([
    "stacks",
    "applicationsPerTrigger",
    "firstDelayMs",
    "intervalMs",
  ] as const)("rejects a counter part whose %s is missing", (field) => {
    const incomplete = structuredClone(weapon);
    counterOf(incomplete)[field].value = null;
    expect(() => simulate(incomplete, 30)).toThrow(field);
  });
});
