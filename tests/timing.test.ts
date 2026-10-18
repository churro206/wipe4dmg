import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { Effect } from "../src/data/schema";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

// Without intrinsic parts (scorch, ignition): totals compare the damage of the shots only.
const weapon = { ...loadWeapon(raw), intrinsicParts: [] };
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byId = (id: string) => effects.find((e) => e.id === id)!;
const DAMAGE_PHASE_SECONDS = 600;

const shotIntervalMs = 60_000 / weapon.fireRateRpm.value!;
const magazine = weapon.magazine.value!;
const baseTotal = simulate(weapon, DAMAGE_PHASE_SECONDS).totalDamage;

const particleReconstruction = byId("particle-reconstruction");
const debuffOf = (effect: Effect) => {
  const part = effect.parts.find((p) => p.type === "multiplier")!;
  return part.type === "multiplier" ? part.multiplier.value! : NaN;
};

/** A no-reload effect for another weapon type; test input, not game data. */
const noReloadFor = (weaponType: "rocketLauncher"): Effect => ({
  id: "test-no-reload",
  name: "test",
  category: "artifact",
  parts: [
    {
      type: "timing",
      change: "noReload",
      weaponTypes: [weaponType],
      source: { name: "test", retrieved: "2026-10-18", status: "verified" },
    },
  ],
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
    const part = rocketOnly.parts[0];
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
