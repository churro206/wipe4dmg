// Held perfect draw (Oathkeeper): the engine picks, per shot, the hold that gives the most damage
// per second; a hold that costs more time than it brings, or that loses against whole shots in the
// rest of the phase, is not taken.

import { describe, expect, it } from "vitest";
import type { Effect, SourcedNumber, Weapon } from "../src/data/schema";
import { simulate } from "../src/engine/simulate";
import { buckets } from "../src/ui/data";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-23", status: "derived" },
});

const holder: Effect = {
  id: "holder",
  name: "Holder",
  code: 9998,
  shortName: "Hld",
  providers: [{ kind: "armor", slot: "exotic" }],
  modifiers: [
    {
      type: "stat",
      stat: "drawHold",
      weaponTypes: ["bow"],
      stepMs: sourced(500),
      stepFactor: sourced(1.375), // +37.5 % per step
      maxFactor: sourced(3), // up to +200 %
    },
  ],
};

const bow = (fireRateRpm: number): Weapon => ({
  ...testWeapon,
  weaponType: "bow",
  ammo: "primary",
  fireRateRpm: sourced(fireRateRpm),
  magazine: sourced(100),
  reloadTimeMs: sourced(0),
});

const run = (weapon: Weapon, effects: Effect[]) =>
  simulate(weapon, 20, effects, buckets);

describe("holdDraw", () => {
  it("a slow bow (2 s per shot) holds 5 steps: 2.5 s longer, ×2.875 damage", () => {
    const { shots, damageInstances } = run(bow(30), [holder]);
    expect(shots[0].timeMs).toBe(2500);
    expect(shots[1].timeMs - shots[0].timeMs).toBeCloseTo(4500);
    expect(damageInstances[0].damage).toBeCloseTo(1000 * 2.875, 6);
  });

  it("a fast bow (0.7 s per shot) does not hold: the hold costs more than it brings", () => {
    const withEffect = run(bow(85), [holder]);
    const plain = run(bow(85), []);
    expect(withEffect.shots).toEqual(plain.shots);
    expect(withEffect.totalDamage).toBeCloseTo(plain.totalDamage, 6);
  });

  it("never loses against not holding when whole shots in the phase decide, although the rate is a little better", () => {
    // 44 rpm: holding 5 steps gives ×2.875 per 3.86 s (0.744 per s) against 0.733 per s without, but
    // a phase of 20 s holds only 5 shots (14.4 shots worth) against 15 shots without
    const withEffect = run(bow(44), [holder]);
    const plain = run(bow(44), []);
    expect(withEffect.totalDamage).toBeGreaterThanOrEqual(plain.totalDamage - 1e-6);
    expect(withEffect.shots.length).toBeGreaterThan(5);
  });

  it("only applies to its weapon type", () => {
    const rocket = { ...testWeapon, ammo: "primary" as const };
    expect(run(rocket, [holder]).shots).toEqual(run(rocket, []).shots);
  });
});
