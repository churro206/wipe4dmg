import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { DamageOverTimePart, Weapon } from "../src/data/schema";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const LONG_DAMAGE_PHASE_SECONDS = 600;
const CATALYST = { catalyst: true };

const seekerOf = (w: Weapon): DamageOverTimePart => {
  const part = w.intrinsicParts.find((p) => p.type === "damageOverTime");
  if (part?.type !== "damageOverTime") throw new Error("no seeker part");
  return part;
};
const seeker = seekerOf(weapon);
const seekerInstances = (result: ReturnType<typeof simulate>) =>
  result.damageInstances.filter((d) => d.id === seeker.id);

/** Copy with one seeker per shot right at the shot and no limit; test input, not game data. */
function oneSeekerPerShot(): Weapon {
  const copy = structuredClone(weapon);
  const part = seekerOf(copy);
  part.applicationsPerTrigger.value = 1;
  part.firstDelayMs.value = 0;
  part.intervalMs.value = 0;
  part.maxActivePerTarget.value = 1000;
  return copy;
}

describe("simulate: catalyst (Taken Seeker)", () => {
  it("creates no seekers without the catalyst", () => {
    expect(
      seekerInstances(simulate(weapon, LONG_DAMAGE_PHASE_SECONDS)),
    ).toEqual([]);
  });

  it("releases the first seeker at the first detonation", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    expect(seekerInstances(result)[0].timeMs).toBe(
      result.shots[0].timeMs + seeker.firstDelayMs.value!,
    );
  });

  it("deals one impact and all ticks per seeker", () => {
    const test = oneSeekerPerShot();
    const part = seekerOf(test);
    const result = simulate(
      test,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    const instances = seekerInstances(result);
    const impacts = instances.filter(
      (d) => d.damage === part.impactDamage.value,
    );
    const ticks = instances.filter((d) => d.damage === part.tickDamage.value);
    expect(impacts).toHaveLength(result.shots.length);
    expect(ticks).toHaveLength(result.shots.length * part.ticks.value!);
  });

  it("spaces the ticks of a seeker by the tick interval", () => {
    const test = oneSeekerPerShot();
    const part = seekerOf(test);
    const result = simulate(
      test,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    const [impact, firstTick, secondTick] = seekerInstances(result);
    expect(firstTick.timeMs - impact.timeMs).toBeCloseTo(
      part.firstTickDelayMs.value!,
    );
    expect(secondTick.timeMs - firstTick.timeMs).toBeCloseTo(
      part.tickIntervalMs.value!,
    );
  });

  it("keeps at most the allowed number of seekers active on the target", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    const firstShot = result.shots[0].timeMs;
    const impactsDuringFirstShot = seekerInstances(result).filter(
      (d) =>
        d.damage === seeker.impactDamage.value && d.timeMs < firstShot + 1000,
    );
    expect(impactsDuringFirstShot).toHaveLength(
      seeker.maxActivePerTarget.value!,
    );
  });

  it("applies weapon multipliers to seeker damage", () => {
    const surge = effects.find((e) => e.id === "solar-surge-4x")!;
    const part = surge.parts[0];
    if (part.type !== "multiplier") throw new Error("expected multiplier");
    const [impact] = seekerInstances(
      simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [surge], buckets, CATALYST),
    );
    expect(impact.damage).toBeCloseTo(
      seeker.impactDamage.value! * part.multiplier.value!,
    );
  });

  it("increases the total damage", () => {
    const without = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [], buckets);
    const withCatalyst = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    expect(withCatalyst.totalDamage).toBeGreaterThan(without.totalDamage);
  });

  it.each([
    "applicationsPerTrigger",
    "firstDelayMs",
    "intervalMs",
    "impactDamage",
    "tickDamage",
    "ticks",
    "tickIntervalMs",
    "firstTickDelayMs",
    "maxActivePerTarget",
  ] as const)("rejects a seeker part whose %s is missing", (field) => {
    const incomplete = structuredClone(weapon);
    seekerOf(incomplete)[field].value = null;
    expect(() => simulate(incomplete, 30, [], buckets, CATALYST)).toThrow(
      field,
    );
  });
});
