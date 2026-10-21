import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { Effect } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { effectWindows } from "../src/engine/effectWindows";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const fullWeapon = loadWeapon(raw);
// Shots only: every damage instance is a shot with the same base damage.
const weapon = { ...fullWeapon, intrinsicParts: [] };
const baseDamage = weapon.damageInstances[0].damagePerTick.value!;
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const LONG_DAMAGE_PHASE_SECONDS = 120;

/** Test effect with one multiplier part and an optional duration; values are test inputs. */
function testEffect(
  id: string,
  multiplier: number,
  durationMs?: number,
): Effect {
  const source = {
    name: "test",
    retrieved: "2026-10-18",
    status: "verified",
  } as const;
  return {
    id,
    name: id,
    code: 9001,
    shortName: "test",
    providers: [{ kind: "subclass" }],
    parts: [
      {
        type: "multiplier",
        bucketId: "empowering",
        multiplier: { value: multiplier, source },
        damageSources: ["weapon"],
      },
    ],
    ...(durationMs === undefined
      ? {}
      : { durationMs: { value: durationMs, source } }),
  };
}

const boosted = (result: ReturnType<typeof simulate>) =>
  result.damageInstances.filter((d) => d.damage > baseDamage + 1e-9);

describe("effect windows", () => {
  it("lets an effect without duration last the whole damage phase", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [testEffect("e", 1.25)],
      buckets,
    );
    expect(boosted(result)).toHaveLength(result.damageInstances.length);
  });

  it("applies an effect with a duration only from 0 until the duration ends", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [testEffect("e", 1.25, 5000)],
      buckets,
    );
    for (const instance of result.damageInstances) {
      expect(instance.damage > baseDamage).toBe(instance.timeMs < 5000);
    }
  });

  it("uses the start and duration from the rotation", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [testEffect("e", 1.25, 5000)],
      buckets,
      { effectWindows: { e: { startMs: 3000, durationMs: 4000 } } },
    );
    for (const instance of result.damageInstances) {
      const active = instance.timeMs >= 3000 && instance.timeMs < 7000;
      expect(instance.damage > baseDamage).toBe(active);
    }
  });

  it("lets a rotation without duration run until the end of the damage phase", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [testEffect("e", 1.25, 5000)],
      buckets,
      { effectWindows: { e: { startMs: 3000 } } },
    );
    for (const instance of result.damageInstances) {
      expect(instance.damage > baseDamage).toBe(instance.timeMs >= 3000);
    }
  });

  it("takes the duration of an effect from the data file", () => {
    // Empowering Rift: its duration ends while One Thousand Voices still fires.
    const rift = byId("empowering-rift");
    const result = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [rift], buckets);
    const lastBoosted = boosted(result).at(-1)!;
    const firstPlain = result.damageInstances.find(
      (d) => d.damage === baseDamage,
    )!;
    expect(lastBoosted.timeMs).toBeLessThan(rift.durationMs!.value!);
    expect(firstPlain.timeMs).toBeGreaterThanOrEqual(rift.durationMs!.value!);
  });

  it("removes only the reloads that fall into the window of a timing effect", () => {
    const magazine = weapon.magazine.value!;
    const shotIntervalMs = 60_000 / weapon.fireRateRpm.value!;
    const pr = byId("particle-reconstruction");
    const firstReloadAt = (
      windows: Record<string, { startMs: number; durationMs?: number }>,
    ) => {
      const { shots } = simulate(
        weapon,
        LONG_DAMAGE_PHASE_SECONDS,
        [pr],
        buckets,
        {
          effectWindows: windows,
        },
      );
      return shots[magazine].timeMs - shots[magazine - 1].timeMs;
    };
    // Active during the whole first magazine: no reload.
    expect(
      firstReloadAt({ "particle-reconstruction": { startMs: 0 } }),
    ).toBeCloseTo(shotIntervalMs);
    // Ends before the first magazine is empty: the reload happens.
    expect(
      firstReloadAt({
        "particle-reconstruction": { startMs: 0, durationMs: 1000 },
      }),
    ).toBeGreaterThan(shotIntervalMs + 1);
  });

  it("applies an override only while both effects are active", () => {
    const pr = byId("particle-reconstruction");
    const divinity = byId("divinity");
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [pr, divinity],
      buckets,
      {
        effectWindows: { divinity: { startMs: 0, durationMs: 5000 } },
      },
    );
    const prPart = pr.parts.find((p) => p.type === "multiplier")!;
    const divinityPart = divinity.parts[0];
    if (prPart.type !== "multiplier" || divinityPart.type !== "multiplier") {
      throw new Error("expected multipliers");
    }
    for (const instance of result.damageInstances) {
      const expected =
        instance.timeMs < 5000
          ? divinityPart.multiplier.value!
          : prPart.multiplier.value!;
      expect(instance.damage).toBeCloseTo(baseDamage * expected);
    }
  });

  it("applies a counter modifier only inside its window", () => {
    const ember = byId("ember-of-ashes");
    const lateEmber = simulate(
      fullWeapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [ember],
      buckets,
      {
        effectWindows: { "ember-of-ashes": { startMs: 999_000 } },
      },
    );
    const noEmber = simulate(
      fullWeapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
    );
    expect(lateEmber.totalDamage).toBeCloseTo(noEmber.totalDamage);
  });
});

describe("effectWindows", () => {
  it("clips the windows to the damage phase and gives the uptime", () => {
    const windows = effectWindows(
      [
        testEffect("short", 1.2, 5000),
        testEffect("long", 1.2),
        testEffect("late", 1.2, 5000),
      ],
      10,
      { effectWindows: { late: { startMs: 8000 } } },
    );
    expect(windows).toEqual([
      { effectId: "short", startMs: 0, endMs: 5000, uptime: 0.5 },
      { effectId: "long", startMs: 0, endMs: 10_000, uptime: 1 },
      { effectId: "late", startMs: 8000, endMs: 10_000, uptime: 0.2 },
    ]);
  });
});
