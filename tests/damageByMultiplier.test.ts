// Outer donut ring: total damage split into base, each bucket and the catalyst (block 2, 2026-10-24).

import { describe, expect, it } from "vitest";
import { damageByMultiplier } from "../src/engine/analysis";
import type {
  SimulationResult,
  TimedDamageInstance,
} from "../src/engine/simulate";

// Test inputs, not game values.
const hit = (damage: number, factors: Record<string, number>): TimedDamageInstance => ({
  id: "shot",
  timeMs: 0,
  damage,
  damageSource: "weapon",
  element: "solar",
  factors,
});
const resultOf = (instances: TimedDamageInstance[]): SimulationResult => {
  const totalDamage = instances.reduce((sum, d) => sum + d.damage, 0);
  return {
    shots: [],
    reloadsMs: [],
    damageInstances: instances,
    superWindows: [],
    totalDamage,
    dps: totalDamage,
  };
};
const damageOf = (shares: { id: string; damage: number }[], id: string) =>
  shares.find((s) => s.id === id)?.damage;
const sum = (shares: { damage: number }[]) =>
  shares.reduce((total, s) => total + s.damage, 0);

describe("damageByMultiplier", () => {
  it("one bucket takes the whole extra damage: Radiant 1.2 is 1 − 1/1.2 of the damage", () => {
    const shares = damageByMultiplier(resultOf([hit(120, { empowering: 1.2 })]));
    expect(damageOf(shares, "base")).toBeCloseTo(100);
    expect(damageOf(shares, "empowering")).toBeCloseTo(20);
    expect(damageOf(shares, "empowering")! / 120).toBeCloseTo(1 - 1 / 1.2);
  });

  it("two buckets with the same factor share the extra damage in halves", () => {
    const shares = damageByMultiplier(
      resultOf([hit(144, { empowering: 1.2, debuff: 1.2 })]),
    );
    expect(damageOf(shares, "empowering")).toBeCloseTo(22);
    expect(damageOf(shares, "debuff")).toBeCloseTo(22);
  });

  it("splits by the logarithm of each factor, so the order of the buckets does not matter", () => {
    const shares = damageByMultiplier(
      resultOf([hit(100 * 2 * 1.5, { surge: 2, debuff: 1.5 })]),
    );
    const extra = 300 - 100;
    expect(damageOf(shares, "surge")).toBeCloseTo(
      (extra * Math.log(2)) / Math.log(3),
    );
    expect(damageOf(shares, "debuff")).toBeCloseTo(
      (extra * Math.log(1.5)) / Math.log(3),
    );
  });

  it("adds up to the total damage over several instances", () => {
    const result = resultOf([
      hit(120, { empowering: 1.2 }),
      hit(50, {}),
      hit(130, { surge: 1.3, holdDraw: 1 }),
    ]);
    const shares = damageByMultiplier(result);
    expect(sum(shares)).toBeCloseTo(result.totalDamage);
    expect(shares.reduce((total, s) => total + s.share, 0)).toBeCloseTo(1);
  });

  it("keeps factors under 1 in the base, so no slice is negative", () => {
    const shares = damageByMultiplier(
      resultOf([hit(100 * 1.5 * 0.8, { surge: 1.5, boss: 0.8 })]),
    );
    expect(damageOf(shares, "base")).toBeCloseTo(80);
    expect(damageOf(shares, "surge")).toBeCloseTo(40);
    expect(damageOf(shares, "boss")).toBeUndefined();
  });

  it("the catalyst is the total with minus the total without it; the rest comes from the run without", () => {
    const withCatalyst = resultOf([hit(120, { empowering: 1.2 }), hit(120, { empowering: 1.2 })]);
    const without = resultOf([hit(120, { empowering: 1.2 })]);
    const shares = damageByMultiplier(withCatalyst, without);
    expect(damageOf(shares, "catalyst")).toBeCloseTo(120);
    expect(damageOf(shares, "base")).toBeCloseTo(100);
    expect(damageOf(shares, "empowering")).toBeCloseTo(20);
    expect(sum(shares)).toBeCloseTo(withCatalyst.totalDamage);
    expect(shares.at(-1)!.id).toBe("catalyst");
  });

  it("puts the base first and leaves out empty slices", () => {
    const shares = damageByMultiplier(
      resultOf([hit(120, { empowering: 1.2, debuff: 1 })]),
    );
    expect(shares.map((s) => s.id)).toEqual(["base", "empowering"]);
  });

  it("is empty without damage", () => {
    expect(damageByMultiplier(resultOf([]))).toEqual([]);
  });
});
