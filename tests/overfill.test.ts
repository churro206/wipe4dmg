// W8 part 2: a refill that overfills the magazine past its size (Ager's Scepter, Will Given Form:
// "Overfills the magazine from reserves"). The rounds come from the reserves, so the total stays.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import { Weapon, type Rule } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const source = { name: "tests/overfill.test.ts", retrieved: "2026-11-11", status: "unverified" as const };
const n = (value: number) => ({ value, source });
const buckets = loadBuckets(rawBuckets);

// 600 rpm (a shot every 100 ms), magazine 10, 30 rounds in all, reload 1 s
const weaponWith = (rules: Rule[]) =>
  Weapon.parse({
    ...testWeapon,
    id: "overfill-test",
    fireRateRpm: n(600),
    magazine: n(10),
    totalShots: n(30),
    reloadTimeMs: n(1000),
    chargeTimeMs: n(0),
    damageInstances: [
      { id: "shot", name: "shot", delayMs: n(0), damagePerTick: n(1), ticks: n(1), tickIntervalMs: n(0), canPrecision: false },
    ],
    rules: [{ id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] }, ...rules],
  });

describe("refill with overfill", () => {
  it("fills the magazine past its size at the start: 20 shots before the first reload, 30 in all", () => {
    const result = simulate(
      weaponWith([{ id: "overfill", on: { on: "phaseStart" }, do: [{ type: "refill", rounds: n(10), overfill: true }] }]),
      10,
      [],
      buckets,
    );
    expect(result.reloadsMs[0]).toBeCloseTo(1900, 0);
    expect(result.damageInstances).toHaveLength(30);
  });

  it("without overfill the magazine stays at its size", () => {
    const result = simulate(
      weaponWith([{ id: "fill", on: { on: "phaseStart" }, do: [{ type: "refill", rounds: n(10) }] }]),
      10,
      [],
      buckets,
    );
    expect(result.reloadsMs[0]).toBeCloseTo(900, 0);
    expect(result.damageInstances).toHaveLength(30);
  });
});
