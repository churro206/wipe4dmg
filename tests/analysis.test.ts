import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import raw from "../src/data/weapons/one-thousand-voices.json";
import {
  compareResults,
  damageByInstance,
  damageCurve,
  dpsByDamagePhase,
} from "../src/engine/analysis";
import { loadBuckets } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const DAMAGE_PHASE_SECONDS = 30;
const result = simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, {
  catalyst: true,
});

describe("damageByInstance", () => {
  const entries = damageByInstance(result);

  it("has one entry per damage instance id", () => {
    const ids = new Set(result.damageInstances.map((d) => d.id));
    expect(entries.map((e) => e.id).sort()).toEqual([...ids].sort());
  });

  it("sums the damage per id and adds up to the total damage", () => {
    const sum = entries.reduce((total, e) => total + e.damage, 0);
    expect(sum).toBeCloseTo(result.totalDamage);
  });

  it("gives shares that add up to 1", () => {
    const shares = entries.reduce((total, e) => total + e.share, 0);
    expect(shares).toBeCloseTo(1);
  });

  it("orders the entries by their first damage instance", () => {
    const firstTime = (id: string) =>
      result.damageInstances.find((d) => d.id === id)!.timeMs;
    const times = entries.map((e) => firstTime(e.id));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("is empty without damage", () => {
    expect(damageByInstance(simulate(weapon, 0))).toEqual([]);
  });
});

describe("damageCurve", () => {
  const curve = damageCurve(result, DAMAGE_PHASE_SECONDS);

  it("starts at zero and ends at the end of the damage phase with the total damage", () => {
    expect(curve[0]).toEqual({ timeMs: 0, totalDamage: 0 });
    expect(curve.at(-1)!.timeMs).toBe(DAMAGE_PHASE_SECONDS * 1000);
    expect(curve.at(-1)!.totalDamage).toBeCloseTo(result.totalDamage);
  });

  it("never decreases", () => {
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].totalDamage).toBeGreaterThanOrEqual(
        curve[i - 1].totalDamage,
      );
      expect(curve[i].timeMs).toBeGreaterThanOrEqual(curve[i - 1].timeMs);
    }
  });

  it("has one point per distinct time of a damage instance", () => {
    const times = new Set(result.damageInstances.map((d) => d.timeMs));
    // plus the start and the end of the damage phase
    expect(curve.length).toBeLessThanOrEqual(times.size + 2);
    expect(curve.length).toBeGreaterThanOrEqual(times.size + 1);
  });
});

describe("dpsByDamagePhase", () => {
  it("returns the DPS of the simulation for each length", () => {
    const lengths = [5, 10, 30];
    const points = dpsByDamagePhase(weapon, [], buckets, {}, lengths);
    expect(points.map((p) => p.seconds)).toEqual(lengths);
    points.forEach((point) => {
      expect(point.dps).toBeCloseTo(
        simulate(weapon, point.seconds, [], buckets).dps,
      );
    });
  });
});

describe("compareResults", () => {
  it("gives both values, the difference and the relative change per key figure", () => {
    const a = simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, {
      catalyst: true,
    });
    const b = simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets);
    const rows = compareResults(a, b);
    const total = rows.find((r) => r.key === "totalDamage")!;
    expect(total.a).toBe(a.totalDamage);
    expect(total.b).toBe(b.totalDamage);
    expect(total.difference).toBeCloseTo(a.totalDamage - b.totalDamage);
    expect(total.relative).toBeCloseTo(a.totalDamage / b.totalDamage - 1);
    expect(rows.map((r) => r.key)).toEqual([
      "totalDamage",
      "dps",
      "shots",
      "ignitions",
    ]);
  });

  it("has no relative change when the comparison is zero", () => {
    const empty = simulate(weapon, 0);
    const [total] = compareResults(empty, empty);
    expect(total.relative).toBeNull();
  });
});
