import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { Ability, type SuperUsage } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { shotsOnly } from "./support/testWeapon";
import { simulate } from "../src/engine/simulate";
import { superWindowMs } from "../src/engine/superWindow";

const weapon = shotsOnly(loadWeapon(raw));
const buckets = loadBuckets(rawBuckets);
const chargeTimeMs = weapon.chargeTimeMs.value!;
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

// All numbers below are test inputs, not game values.
const castUsage = (castMs: number | null): SuperUsage => ({
  type: "cast",
  castMs: n(castMs),
});
const shotsUsage = (
  shots: number,
  shotIntervalMs: number | null,
): SuperUsage => ({
  type: "shots",
  shots: n(shots),
  shotIntervalMs: n(shotIntervalMs),
  baseDurationMs: n(12_000),
});
const drainUsage = (
  drainPerAttack: number | null,
  attackIntervalMs: number | null,
): SuperUsage => ({
  type: "drain",
  baseDurationMs: n(21_000),
  drainPerAttack: n(drainPerAttack),
  attackIntervalMs: n(attackIntervalMs),
});

const testSuper = (usage: SuperUsage, kind: "super" | "grenade" = "super") =>
  Ability.parse({
    id: "test-ability",
    code: 1,
    name: "Test",
    kind,
    element: "solar",
    providers: [{ kind: "subclass" }],
    usage,
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
    ],
  });

describe("superWindowMs", () => {
  it("lasts the cast animation for cast supers, 0 if it is unknown", () => {
    expect(superWindowMs(castUsage(800))).toEqual({
      durationMs: 800,
      exact: true,
    });
    expect(superWindowMs(castUsage(null))).toEqual({
      durationMs: 0,
      exact: false,
    });
  });

  it("ends with the last shot for shot supers that fire as fast as possible", () => {
    expect(superWindowMs(shotsUsage(3, 1000))).toEqual({
      durationMs: 2000,
      exact: true,
    });
  });

  it("never lasts longer than the base duration", () => {
    expect(superWindowMs(shotsUsage(20, 1000))).toEqual({
      durationMs: 12_000,
      exact: true,
    });
  });

  it("uses the base duration as upper bound if the shot interval is unknown", () => {
    expect(superWindowMs(shotsUsage(3, null))).toEqual({
      durationMs: 12_000,
      exact: false,
    });
  });

  it("ends with the one shot, without a shot interval (e.g. Celestial Nighthawk)", () => {
    expect(superWindowMs(shotsUsage(1, null))).toEqual({
      durationMs: 0,
      exact: true,
    });
  });

  it("ends when passive drain and attacks use up the energy for drain supers", () => {
    // 1 / (1 / 21000 ms + 0.12 / 1500 ms) = 7836 ms
    const window = superWindowMs(drainUsage(0.12, 1500));
    expect(window.exact).toBe(true);
    expect(window.durationMs).toBeCloseTo(7836, 0);
  });

  it("lasts exactly the base duration for a channel without attacks", () => {
    expect(superWindowMs(drainUsage(0, null))).toEqual({
      durationMs: 21_000,
      exact: true,
    });
  });

  it("uses the base duration as upper bound if the attack values are unknown", () => {
    expect(superWindowMs(drainUsage(0.12, null))).toEqual({
      durationMs: 21_000,
      exact: false,
    });
    expect(superWindowMs(drainUsage(null, 1500))).toEqual({
      durationMs: 21_000,
      exact: false,
    });
  });

  it("lasts until the weapon is ready again for timed supers; an estimate is not exact", () => {
    const timed = (
      status: "verified" | "unverified" | "derived",
    ): SuperUsage => ({
      type: "timed",
      weaponReadyMs: { value: 2200, source: { ...source, status } },
    });
    expect(superWindowMs(timed("verified"))).toEqual({
      durationMs: 2200,
      exact: true,
    });
    // A derived value comes from a text with a calculation: exact, unlike an unverified estimate.
    expect(superWindowMs(timed("derived"))).toEqual({
      durationMs: 2200,
      exact: true,
    });
    expect(superWindowMs(timed("unverified"))).toEqual({
      durationMs: 2200,
      exact: false,
    });
  });

  it("throws without a base duration", () => {
    const usage: SuperUsage = {
      ...shotsUsage(3, null),
      baseDurationMs: n(null),
    };
    expect(() => superWindowMs(usage)).toThrow(/baseDurationMs/);
  });
});

describe("simulate with a super window", () => {
  const run = (castsMs: number[], ability: Ability) =>
    simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, {
      abilities: [{ ability, castsMs }],
    });
  const shotTimes = (result: ReturnType<typeof simulate>) =>
    result.shots.map((s) => s.timeMs);
  const without = shotTimes(
    simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets),
  );

  it("reports the window of every super cast", () => {
    const result = run([3000], testSuper(shotsUsage(3, 1000)));
    expect(result.superWindows).toEqual([
      { abilityId: "test-ability", startMs: 3000, endMs: 5000, exact: true },
    ]);
  });

  it("neither charges nor fires the weapon inside the window", () => {
    const result = run([0], testSuper(shotsUsage(3, 1000)));
    expect(shotTimes(result)[0]).toBe(2000 + chargeTimeMs);
    for (const time of shotTimes(result)) {
      expect(time - chargeTimeMs >= 2000 || time < 0).toBe(true);
    }
  });

  it("keeps the shots before the window and delays the later ones", () => {
    const castMs = without[2] + 100;
    const shots = shotTimes(run([castMs], testSuper(shotsUsage(3, 1000))));
    expect(shots.slice(0, 3)).toEqual(without.slice(0, 3));
    expect(shots[3]).toBe(castMs + 2000 + chargeTimeMs);
    expect(shots.length).toBeLessThanOrEqual(without.length);
  });

  it("does not move shots for a cast super with unknown cast time", () => {
    expect(shotTimes(run([0], testSuper(castUsage(null))))).toEqual(without);
  });

  it("does not block the weapon for grenades and melees", () => {
    const grenade = { ...testSuper(castUsage(0)), usage: undefined };
    const result = run([0], Ability.parse({ ...grenade, kind: "grenade" }));
    expect(shotTimes(result)).toEqual(without);
    expect(result.superWindows).toEqual([]);
  });

  it("does not block the weapon for a super without usage data", () => {
    const noUsage = { ...testSuper(castUsage(0)), usage: undefined };
    expect(shotTimes(run([0], Ability.parse(noUsage)))).toEqual(without);
  });
});

describe("Ability schema with usage", () => {
  it("allows usage only for supers", () => {
    expect(() => testSuper(castUsage(0), "grenade")).toThrow(/usage/);
  });
});
