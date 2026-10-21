import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { DamageOverTimePart, Weapon } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
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
/** Damage of an impact or tick after the conversion to the main source's scale (ADR 0011). */
const scaled = (part: DamageOverTimePart, value: number | null) =>
  value! * (part.sourceScale?.value ?? 1);

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
      (d) => d.damage === scaled(part, part.impactDamage.value),
    );
    const ticks = instances.filter(
      (d) => d.damage === scaled(part, part.tickDamage.value),
    );
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

  // The limit applies to the ticks only; every seeker still deals its impact. Reconstructed
  // from the Aegis measurements (docs/mechanics/taken-seeker.md, ADR 0011 rule 4).
  it("deals the impact of every seeker, also beyond the limit", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    const nextShot = result.shots[1].timeMs;
    const impactsOfFirstShot = seekerInstances(result).filter(
      (d) =>
        d.damage === scaled(seeker, seeker.impactDamage.value) &&
        d.timeMs < nextShot,
    );
    expect(impactsOfFirstShot).toHaveLength(
      seeker.applicationsPerTrigger.value!,
    );
  });

  it("keeps at most the allowed number of seekers ticking on the target", () => {
    const result = simulate(
      weapon,
      LONG_DAMAGE_PHASE_SECONDS,
      [],
      buckets,
      CATALYST,
    );
    // A seeker ticks if a tick follows its impact after the first tick delay; it is active
    // from its impact to its last tick.
    const instances = seekerInstances(result);
    const tickTimes = new Set(
      instances
        .filter((d) => d.damage === scaled(seeker, seeker.tickDamage.value))
        .map((d) => d.timeMs),
    );
    const firstTickDelay = seeker.firstTickDelayMs.value!;
    const lastTickDelay =
      firstTickDelay + (seeker.ticks.value! - 1) * seeker.tickIntervalMs.value!;
    const ticking = instances
      .filter(
        (d) =>
          d.damage === scaled(seeker, seeker.impactDamage.value) &&
          tickTimes.has(d.timeMs + firstTickDelay),
      )
      .map((d) => [d.timeMs, d.timeMs + lastTickDelay] as const);
    const mostActive = Math.max(
      ...ticking.map(
        ([start]) =>
          ticking.filter(([from, to]) => from <= start && start <= to).length,
      ),
    );
    expect(mostActive).toBe(seeker.maxActivePerTarget.value!);
  });

  it("converts seeker damage to the main source's scale", () => {
    expect(seeker.sourceScale?.value).toBeLessThan(1);
    const [impact] = seekerInstances(
      simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [], buckets, CATALYST),
    );
    expect(impact.damage).toBeCloseTo(
      seeker.impactDamage.value! * seeker.sourceScale!.value!,
    );
  });

  it("rejects a seeker part whose source scale is missing", () => {
    const incomplete = structuredClone(weapon);
    seekerOf(incomplete).sourceScale!.value = null;
    expect(() => simulate(incomplete, 30, [], buckets, CATALYST)).toThrow(
      "sourceScale",
    );
  });

  it("applies weapon multipliers to seeker damage", () => {
    const surge = effects.find((e) => e.id === "surge-3x")!;
    const part = surge.parts[0];
    if (part.type !== "multiplier") throw new Error("expected multiplier");
    const [impact] = seekerInstances(
      simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [surge], buckets, CATALYST),
    );
    expect(impact.damage).toBeCloseTo(
      scaled(seeker, seeker.impactDamage.value) * part.multiplier.value!,
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
