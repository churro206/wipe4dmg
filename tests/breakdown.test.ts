import { describe, expect, it } from "vitest";
import rawBosses from "../src/data/bosses.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { breakdown } from "../src/engine/breakdown";
import { loadBosses, loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const pick = (...ids: string[]) => effects.filter((e) => ids.includes(e.id));
const DAMAGE_PHASE_SECONDS = 30;

describe("breakdown", () => {
  it("is empty without effects", () => {
    expect(breakdown(weapon, DAMAGE_PHASE_SECONDS, [], buckets)).toEqual([]);
  });

  it("lists every bucket with an active multiplier, in bucket order", () => {
    const selected = pick("tractor-cannon", "well-of-radiance", "surge-3x");
    const ids = breakdown(weapon, DAMAGE_PHASE_SECONDS, selected, buckets).map(
      (entry) => entry.bucketId,
    );
    const bucketOrder = buckets.map((b) => b.id);
    expect(ids).toEqual(
      bucketOrder.filter((id) =>
        ["empowering", "debuff", "surge"].includes(id),
      ),
    );
  });

  it("shows the combined multiplier of a bucket", () => {
    const selected = pick("radiant", "well-of-radiance");
    const [empowering] = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      selected,
      buckets,
    );
    const well = selected.find((e) => e.id === "well-of-radiance")!.parts[0];
    if (well.type !== "multiplier") throw new Error("expected multiplier");
    expect(empowering.multiplier).toBe(well.multiplier.value);
  });

  it("shows the total damage without the multipliers of a bucket", () => {
    const selected = pick("radiant", "tractor-cannon");
    const entries = breakdown(weapon, DAMAGE_PHASE_SECONDS, selected, buckets);
    const debuff = entries.find((e) => e.bucketId === "debuff")!;
    expect(debuff.totalDamageWithout).toBeCloseTo(
      simulate(weapon, DAMAGE_PHASE_SECONDS, pick("radiant"), buckets)
        .totalDamage,
    );
  });

  it("keeps the other parts of an effect when its bucket is left out", () => {
    // Particle Reconstruction: without the debuff bucket, its no-reload part still applies.
    const particleReconstruction = pick("particle-reconstruction");
    const [debuff] = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      particleReconstruction,
      buckets,
    );
    const timingOnly = particleReconstruction.map((e) => ({
      ...e,
      parts: e.parts.filter((p) => p.type !== "multiplier"),
    }));
    expect(debuff.totalDamageWithout).toBeCloseTo(
      simulate(weapon, DAMAGE_PHASE_SECONDS, timingOnly, buckets).totalDamage,
    );
  });
});

describe("breakdown with catalyst", () => {
  it("passes the catalyst option to the simulation", () => {
    const selected = pick("radiant");
    const [empowering] = breakdown(
      weapon,
      DAMAGE_PHASE_SECONDS,
      selected,
      buckets,
      {
        catalyst: true,
      },
    );
    expect(empowering.totalDamageWithout).toBeCloseTo(
      simulate(weapon, DAMAGE_PHASE_SECONDS, [], buckets, { catalyst: true })
        .totalDamage,
    );
  });
});

describe("loadBosses", () => {
  it("accepts the bosses data file", () => {
    expect(loadBosses(rawBosses).length).toBeGreaterThan(0);
  });
});
