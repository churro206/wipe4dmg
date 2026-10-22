// Super timings (super-timings.json): the package of a super is spread over its hits, and the super
// window lasts until the weapon is ready again. Total damage per use stays the Aegis value.

import { describe, expect, it } from "vitest";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawArmor from "../src/data/exotic-armor.json";
import rawManifest from "../src/data/manifest-abilities.json";
import rawTimings from "../src/data/super-timings.json";
import {
  AbilityKeyword,
  AegisAbilityRow,
  ExoticArmorEntry,
  ManifestAbilities,
  SuperTiming,
  type Ability,
} from "../src/data/schema";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { superWindowMs } from "../src/engine/superWindow";

const load = (timings: SuperTiming[]) =>
  loadAbilities(
    rawAbilities,
    AegisAbilityRow.array().parse(rawRows),
    loadAbilityStats(rawAbilityStats),
    ManifestAbilities.parse(rawManifest).abilities,
    { effects: loadEffects(rawEffects), buckets: loadBuckets(rawBuckets) },
    AbilityKeyword.array().parse(rawAbilityKeywords),
    ExoticArmorEntry.array().parse(rawArmor),
    timings,
  );
const timings = SuperTiming.array().parse(rawTimings);
const timed = load(timings);
const untimed = load([]);
const byId = (list: Ability[], id: string) => list.find((a) => a.id === id)!;
const perUse = (a: Ability) =>
  a.components.reduce(
    (sum, c) => sum + c.damagePerTick.value! * c.ticks.value!,
    0,
  );
const hitTimes = (a: Ability) => {
  const c = a.components[0];
  return Array.from(
    { length: c.ticks.value! },
    (_, i) => c.delayMs.value! + i * c.tickIntervalMs.value!,
  );
};

describe("super timings", () => {
  it("spread Golden Gun Marksman over three shots with x40 scorch each", () => {
    const marksman = byId(timed, "golden-gun-marksman");
    expect(hitTimes(marksman)).toEqual([1200, 1600, 2000]);
    expect(superWindowMs(marksman.usage!)).toEqual({
      durationMs: 2200,
      exact: false,
    });
    expect(marksman.keywordParts?.[0].stacks?.value).toBe(40);
  });

  it("give Celestial Nighthawk its own single shot", () => {
    const nighthawk = byId(
      timed,
      "golden-gun-marksman-with-celestial-nighthawk",
    );
    expect(hitTimes(nighthawk)).toEqual([1200]);
    expect(superWindowMs(nighthawk.usage!).durationMs).toBe(1300);
  });

  it("let variants without own timing use the timing of their base", () => {
    const cuirass = byId(
      timed,
      "thundercrash-with-cuirass-of-the-falling-star",
    );
    expect(hitTimes(cuirass)).toEqual([1200]);
  });

  it("keep a window from the Compendium where the timing has none (Chaos Reach)", () => {
    const chaosReach = byId(timed, "chaos-reach");
    expect(superWindowMs(chaosReach.usage!)).toEqual({
      durationMs: 4000,
      exact: true,
    });
    expect(hitTimes(chaosReach)[0]).toBe(670);
  });

  // Invariants for every timed super, not samples.
  it.each(timings.map((t) => [t.abilityId, t.exoticArmorId ?? ""]))(
    "%s %s: same damage per use, hits inside the window",
    (abilityId, exoticArmorId) => {
      const id = exoticArmorId ? `${abilityId}-with-${exoticArmorId}` : abilityId;
      const ability = byId(timed, id);
      expect(perUse(ability)).toBeCloseTo(perUse(byId(untimed, id)), 6);
      const window = superWindowMs(ability.usage!);
      expect(window.durationMs).toBeGreaterThan(0);
      if (ability.components.length > 0)
        expect(Math.max(...hitTimes(ability))).toBeLessThanOrEqual(
          window.durationMs,
        );
    },
  );

  it("time every super that has damage", () => {
    const supers = timed.filter(
      (a) => a.kind === "super" && a.components.length > 0,
    );
    const atCast = supers.filter((a) => a.components[0].delayMs.value === 0);
    expect(atCast.map((a) => a.id)).toEqual(["hammer-of-sol"]);
  });

  it("reject a timing for an ability that does not exist", () => {
    expect(() =>
      load([{ ...timings[0], abilityId: "no-such-super" }]),
    ).toThrow(/no-such-super/);
  });
});
