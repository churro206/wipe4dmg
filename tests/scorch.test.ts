import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow, type Keyword } from "../src/data/schema";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { actionOf, withScorchHits } from "./support/testWeapon";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const keywords = loadKeywords(rawKeywords, AegisAbilityRow.array().parse(rawRows));
const byId = (id: string) => effects.find((e) => e.id === id)!;
const LONG_DAMAGE_PHASE_SECONDS = 600;

const ignitionData = keywords.find((k) => k.id === "ignition")!;
/** The ignition with another cooldown; a test input, not a game value. */
const withCooldown = (cooldownMs: number): Keyword[] =>
  keywords.map((k) =>
    k.id === "ignition"
      ? { ...k, cooldownMs: { ...k.cooldownMs!, value: cooldownMs } }
      : k,
  );

const run = (
  w = weapon,
  selected: ReturnType<typeof byId>[] = [],
  options: { keywords?: Keyword[]; phaseSeconds?: number } = {},
) =>
  simulate(w, options.phaseSeconds ?? LONG_DAMAGE_PHASE_SECONDS, selected, buckets, {
    keywords: options.keywords ?? keywords,
  });
const ignitionsOf = (result: ReturnType<typeof simulate>) =>
  result.damageInstances.filter((d) => d.id === "ignition");

// The ignition of the hand model is the keyword of keywords.json with the bonus of the weapon
const ignitionDamage =
  ignitionData.damage.value! * weapon.keywordBonuses![0].factor.value!;

describe("simulate: scorch and ignition", () => {
  it("creates ignitions as solar keyword damage with the bonus of the weapon", () => {
    const ignitions = ignitionsOf(run());
    expect(ignitions.length).toBeGreaterThan(0);
    for (const ignition of ignitions) {
      expect(ignition.damageSource).toBe("keyword");
      expect(ignition.element).toBe(ignitionData.element);
      expect(ignition.damage).toBeCloseTo(ignitionDamage, 3);
    }
  });

  it("triggers an ignition when the stacks reach the threshold", () => {
    // 50 stacks per shot: shots 2, 4, 6, ... reach 100.
    const result = run(withScorchHits(weapon, 50, 1));
    const ignitions = ignitionsOf(result);
    expect(ignitions).toHaveLength(Math.floor(result.shots.length / 2));
    expect(ignitions[0].timeMs).toBe(result.shots[1].timeMs);
  });

  it("applies no stacks during the cooldown after an ignition", () => {
    // 100 stacks per shot, but the cooldown blocks the next shot.
    const test = withScorchHits(weapon, 100, 1);
    const noCooldown = run(test, [], { keywords: withCooldown(0) });
    const shotIntervalMs =
      noCooldown.shots[1].timeMs - noCooldown.shots[0].timeMs;
    const blocked = run(test, [], {
      keywords: withCooldown(shotIntervalMs + 1),
    });
    expect(ignitionsOf(noCooldown)).toHaveLength(noCooldown.shots.length);
    expect(ignitionsOf(blocked).length).toBeLessThan(noCooldown.shots.length);
  });

  it("ignores ignitions after the end of the damage phase", () => {
    const delayed = withScorchHits(weapon, 100, 1, 500);
    const firstShotSeconds = weapon.chargeTimeMs.value! / 1000;
    expect(
      ignitionsOf(run(delayed, [], { phaseSeconds: firstShotSeconds })),
    ).toEqual([]);
  });

  it("increases scorch stacks with Ember of Ashes, rounded up", () => {
    // 20 applications of 3 stacks: 60 without Ember, 20 x ceil(4.5) = 100 with Ember.
    const test = withScorchHits(weapon, 3, 20);
    const without = run(test);
    const withEmber = run(test, [byId("ember-of-ashes")]);
    expect(ignitionsOf(withEmber)).toHaveLength(withEmber.shots.length);
    expect(ignitionsOf(without).length).toBeLessThan(without.shots.length);
  });

  it("applies weapon multipliers to ignitions", () => {
    const surge = byId("surge-3x");
    const surgePart = surge.modifiers[0];
    if (surgePart.type !== "multiplier") throw new Error("expected multiplier");
    const [ignition] = ignitionsOf(run(weapon, [surge]));
    expect(ignition.damage).toBeCloseTo(
      ignitionDamage * surgePart.multiplier.value!,
      3,
    );
  });

  it.each([
    ["count", "ticks"],
    ["delayMs", "delayMs"],
    ["intervalMs", "tickIntervalMs"],
  ] as const)(
    "rejects a detonation whose %s is missing",
    (field, name) => {
      const incomplete = structuredClone(weapon);
      actionOf(incomplete, "detonations", "spawn")[field]!.value = null;
      expect(() => run(incomplete, [], { phaseSeconds: 30 })).toThrow(name);
    },
  );

  it("rejects scorch whose stacks are missing", () => {
    const incomplete = structuredClone(weapon);
    actionOf(incomplete, "scorch", "applyStatus").stacks!.value = null;
    expect(() => run(incomplete, [], { phaseSeconds: 30 })).toThrow("stacks");
  });
});

// In-game measurements of 2026-10-20 (docs/data-sources.md, Messprotokoll; docs/guides/measurements.md).
describe("One Thousand Voices against the in-game measurements", () => {
  const firstMagazine = (effectIds: string[]) => {
    const result = run(weapon, effectIds.map(byId));
    const lastShotMs = result.shots[3].timeMs;
    // Explosions of the 4th shot come after it, so count until the next shot.
    const endMs = result.shots[4].timeMs;
    expect(lastShotMs).toBeLessThan(endMs);
    return ignitionsOf(result).filter((d) => d.timeMs < endMs).length;
  };

  it("ignites 2 of 4 shots without Ember of Ashes (test 1)", () => {
    expect(firstMagazine(["particle-reconstruction"])).toBe(2);
  });

  it("ignites 4 of 4 shots with Ember of Ashes (test 1)", () => {
    expect(firstMagazine(["particle-reconstruction", "ember-of-ashes"])).toBe(
      4,
    );
  });

  it("staggers the explosions of a shot (test 2)", () => {
    expect(actionOf(weapon, "detonations", "spawn").intervalMs!.value).toBeGreaterThan(0);
  });

  it("fires a shot about every 1.75 s (test 3: 1 s 45 frames)", () => {
    const { shots } = run(weapon, [byId("particle-reconstruction")]);
    const measuredMs = 1750;
    const oneFrameMs = 1000 / 60;
    expect(
      Math.abs(shots[1].timeMs - shots[0].timeMs - measuredMs),
    ).toBeLessThanOrEqual(2 * oneFrameMs);
  });
});
