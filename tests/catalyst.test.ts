// The Taken Seekers of the One Thousand Voices catalyst as rules of the weapon: every detonation
// releases one (an impact), and while fewer than five tick, it ticks too (a counter; a helper hit at
// the last tick takes it off again).

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow, type Weapon } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { actionOf } from "./support/testWeapon";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const keywords = loadKeywords(rawKeywords, AegisAbilityRow.array().parse(rawRows));
const LONG_DAMAGE_PHASE_SECONDS = 600;

const run = (w: Weapon, selected = effects.slice(0, 0), catalyst = true) =>
  simulate(w, LONG_DAMAGE_PHASE_SECONDS, selected, buckets, { catalyst, keywords });

const IMPACT = "takenSeeker";
const TICK = "takenSeekerTick";
const partOf = (w: Weapon, id: string) => w.damageInstances.find((p) => p.id === id)!;
const hitsOf = (result: ReturnType<typeof simulate>, id: string) =>
  result.damageInstances.filter((d) => d.id === id);

// What the rules say: detonations of a shot, the ticks of a seeker, the limit
const detonations = actionOf(weapon, "detonations", "spawn");
const ticks = actionOf(weapon, "seeker-ticks", "spawn", TICK);
const limit = weapon.rules!
  .find((r) => r.id === "seeker-ticks")!
  .if!.find((c) => c.type === "counter")!;
const limitValue = limit.type === "counter" ? limit.value.value! : 0;

/** Copy with one seeker per shot right at the shot and no limit; test input, not game data. */
function oneSeekerPerShot(): Weapon {
  const copy = structuredClone(weapon);
  const spawn = actionOf(copy, "detonations", "spawn");
  spawn.delayMs!.value = 0;
  spawn.count!.value = 1;
  spawn.intervalMs!.value = 0;
  const rule = copy.rules!.find((r) => r.id === "seeker-ticks")!;
  const counter = rule.if!.find((c) => c.type === "counter")!;
  if (counter.type === "counter") counter.value.value = 1000;
  return copy;
}

describe("simulate: catalyst (Taken Seeker)", () => {
  it("creates no seekers without the catalyst", () => {
    const result = run(weapon, [], false);
    expect(hitsOf(result, IMPACT)).toEqual([]);
    expect(hitsOf(result, TICK)).toEqual([]);
  });

  it("releases the first seeker at the first detonation", () => {
    const result = run(weapon);
    expect(hitsOf(result, IMPACT)[0].timeMs).toBe(
      result.shots[0].timeMs + detonations.delayMs!.value!,
    );
  });

  it("deals one impact and all ticks per seeker", () => {
    const result = run(oneSeekerPerShot());
    expect(hitsOf(result, IMPACT)).toHaveLength(result.shots.length);
    expect(hitsOf(result, TICK)).toHaveLength(
      result.shots.length * ticks.count!.value!,
    );
  });

  it("spaces the ticks of a seeker by the tick interval", () => {
    const result = run(oneSeekerPerShot());
    const [impact] = hitsOf(result, IMPACT);
    const [firstTick, secondTick] = hitsOf(result, TICK);
    expect(firstTick.timeMs - impact.timeMs).toBeCloseTo(ticks.delayMs!.value!);
    expect(secondTick.timeMs - firstTick.timeMs).toBeCloseTo(
      ticks.intervalMs!.value!,
    );
  });

  // The limit applies to the ticks only; every seeker still deals its impact. Reconstructed
  // from the Aegis measurements (docs/mechanics/taken-seeker.md, ADR 0011 rule 4).
  it("deals the impact of every seeker, also beyond the limit", () => {
    const result = run(weapon);
    const nextShot = result.shots[1].timeMs;
    expect(
      hitsOf(result, IMPACT).filter((d) => d.timeMs < nextShot),
    ).toHaveLength(detonations.count!.value!);
  });

  it("keeps at most the allowed number of seekers ticking on the target", () => {
    const result = run(weapon);
    // A seeker ticks if a tick follows its impact after the first tick delay; it is active
    // from its impact to its last tick.
    const tickTimes = new Set(hitsOf(result, TICK).map((d) => d.timeMs));
    const firstTickDelay = ticks.delayMs!.value!;
    const lastTickDelay =
      firstTickDelay + (ticks.count!.value! - 1) * ticks.intervalMs!.value!;
    const ticking = hitsOf(result, IMPACT)
      .filter((d) => tickTimes.has(d.timeMs + firstTickDelay))
      .map((d) => [d.timeMs, d.timeMs + lastTickDelay] as const);
    const mostActive = Math.max(
      ...ticking.map(
        ([start]) =>
          ticking.filter(([from, to]) => from <= start && start <= to).length,
      ),
    );
    expect(mostActive).toBe(limitValue);
  });

  it("deals the damage of its parts, converted to the main source's scale", () => {
    const [impact] = hitsOf(run(weapon), IMPACT);
    expect(impact.damage).toBeCloseTo(partOf(weapon, IMPACT).damagePerTick.value!);
    expect(partOf(weapon, IMPACT).damagePerTick.value).toBeLessThan(84);
  });

  it("applies weapon multipliers to seeker damage", () => {
    const surge = effects.find((e) => e.id === "surge-3x")!;
    const part = surge.modifiers[0];
    if (part.type !== "multiplier") throw new Error("expected multiplier");
    const [impact] = hitsOf(run(weapon, [surge]), IMPACT);
    expect(impact.damage).toBeCloseTo(
      partOf(weapon, IMPACT).damagePerTick.value! * part.multiplier.value!,
    );
  });

  it("increases the total damage", () => {
    expect(run(weapon).totalDamage).toBeGreaterThan(
      run(weapon, [], false).totalDamage,
    );
  });

  it.each([IMPACT, TICK])("rejects the part %s whose damage is missing", (id) => {
    const incomplete = structuredClone(weapon);
    partOf(incomplete, id).damagePerTick.value = null;
    expect(() => run(incomplete)).toThrow("damagePerTick");
  });

  it.each([
    ["count", "ticks"],
    ["delayMs", "delayMs"],
    ["intervalMs", "tickIntervalMs"],
  ] as const)("rejects seeker ticks whose %s is missing", (field, name) => {
    const incomplete = structuredClone(weapon);
    actionOf(incomplete, "seeker-ticks", "spawn", TICK)[field]!.value = null;
    expect(() => run(incomplete)).toThrow(name);
  });

  it("rejects a limit that is missing", () => {
    const incomplete = structuredClone(weapon);
    const counter = incomplete
      .rules!.find((r) => r.id === "seeker-ticks")!
      .if!.find((c) => c.type === "counter")!;
    if (counter.type === "counter") counter.value.value = null;
    expect(() => run(incomplete)).toThrow("counter value");
  });
});
