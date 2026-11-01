import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { Effect } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { shotsOnly } from "./support/testWeapon";
import { simulate } from "../src/engine/simulate";

// Without intrinsic parts (scorch, ignition): totals compare the damage of the shots only.
const weapon = shotsOnly(loadWeapon(raw));
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const DAMAGE_PHASE_SECONDS = 600;

const shotIntervalMs = 60_000 / weapon.fireRateRpm.value!;
const magazine = weapon.magazine.value!;
const baseTotal = simulate(weapon, DAMAGE_PHASE_SECONDS).totalDamage;

const particleReconstruction = byId("particle-reconstruction");
const debuffOf = (effect: Effect) => {
  const part = effect.modifiers.find((p) => p.type === "multiplier")!;
  return part.type === "multiplier" ? part.multiplier.value! : NaN;
};

/** A no-reload effect for another weapon type; test input, not game data. */
const noReloadFor = (weaponType: "rocketLauncher"): Effect => ({
  id: "test-no-reload",
  name: "test",
  code: 9001,
  shortName: "test",
  providers: [{ kind: "artifact" }],
  modifiers: [
    {
      type: "stat",
      stat: "reload",
      factor: {
        value: 0,
        source: { name: "test", retrieved: "2026-10-18", status: "verified" },
      },
      weaponTypes: [weaponType],
    },
  ],
});

describe("simulate: stat modifiers of the rules (B3b step 1)", () => {
  // The actor reads the stat modifiers of the effects and of the weapon's rules alike
  const withReloadRule = (factor: number) => {
    const source = { name: "test", retrieved: "2026-11-01", status: "verified" as const };
    return {
      ...weapon,
      rules: [
        ...(weapon.rules ?? []),
        {
          id: "reload-rule",
          on: { on: "phaseStart" as const },
          do: [
            {
              type: "modifyStat" as const,
              modifier: {
                type: "stat" as const,
                stat: "reload" as const,
                factor: { value: factor, source },
              },
            },
          ],
        },
      ],
    };
  };
  const gapOf = (w: typeof weapon) => {
    const { shots } = simulate(w, DAMAGE_PHASE_SECONDS);
    return shots[magazine].timeMs - shots[magazine - 1].timeMs;
  };

  it("a reload factor 0 of a rule skips the reload", () => {
    expect(gapOf(withReloadRule(0))).toBeCloseTo(shotIntervalMs);
  });

  it("a reload factor of a rule shortens the reload", () => {
    const reloadMs = gapOf(weapon) - shotIntervalMs;
    expect(gapOf(withReloadRule(0.5))).toBeCloseTo(shotIntervalMs + reloadMs * 0.5);
  });
});

describe("simulate: timing effects", () => {
  it("knows the weapon type", () => {
    expect(weapon.weaponType).toBe("fusionRifle");
  });

  it("removes reloads with Particle Reconstruction", () => {
    const { shots } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [particleReconstruction],
      buckets,
    );
    expect(shots[magazine].timeMs - shots[magazine - 1].timeMs).toBeCloseTo(
      shotIntervalMs,
    );
  });

  it("keeps reloads when the timing effect is for another weapon type", () => {
    const { shots } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [noReloadFor("rocketLauncher")],
      buckets,
    );
    expect(shots[magazine].timeMs - shots[magazine - 1].timeMs).toBeGreaterThan(
      shotIntervalMs + 1,
    );
  });

  it("applies the Particle Reconstruction debuff to fusion rifles", () => {
    const { totalDamage } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [particleReconstruction],
      buckets,
    );
    expect(totalDamage).toBeCloseTo(
      baseTotal * debuffOf(particleReconstruction),
    );
  });

  it("ignores a multiplier for another weapon type", () => {
    const rocketOnly: Effect = {
      ...structuredClone(byId("weaken")),
      id: "rocket-only",
    };
    const part = rocketOnly.modifiers[0];
    if (part.type === "multiplier") part.weaponTypes = ["rocketLauncher"];
    expect(
      simulate(weapon, DAMAGE_PHASE_SECONDS, [rocketOnly], buckets).totalDamage,
    ).toBe(baseTotal);
  });

  it("lets Divinity override the Particle Reconstruction debuff but not its timing", () => {
    const divinity = byId("divinity");
    const withBoth = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [particleReconstruction, divinity],
      buckets,
    );
    expect(withBoth.totalDamage).toBeCloseTo(baseTotal * debuffOf(divinity));
    expect(
      withBoth.shots[magazine].timeMs - withBoth.shots[magazine - 1].timeMs,
    ).toBeCloseTo(shotIntervalMs);
  });

  it("keeps the stronger debuff when a 30% weaken meets Particle Reconstruction", () => {
    const tractor = byId("tractor-cannon");
    const { totalDamage } = simulate(
      weapon,
      DAMAGE_PHASE_SECONDS,
      [particleReconstruction, tractor],
      buckets,
      { effectWindows: { "tractor-cannon": { startMs: 0 } } },
    );
    expect(totalDamage).toBeCloseTo(baseTotal * debuffOf(tractor));
  });
});
