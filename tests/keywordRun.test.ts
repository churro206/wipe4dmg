// Keywords on the target (ADR 0015, U4a): a part applies the keyword with a hit; damage the target
// takes from any source sets it off past the threshold, then the cooldown blocks it.

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import {
  AegisAbilityRow,
  type Effect,
  type KeywordId,
} from "../src/data/schema";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { simulate, type SimulationOptions } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawRows),
);
const damageOf = (id: KeywordId) =>
  keywords.find((k) => k.id === id)!.damage.value!;
const source = {
  name: "test",
  retrieved: "2026-10-21",
  status: "verified" as const,
};
// Shots at 0, 3000, 6000, 9000 and 12000 ms (one shot per magazine, reload 2000 ms).
const weapon = {
  ...testWeapon,
  totalShots: { ...testWeapon.totalShots, value: 5 },
};

/** Effect that applies a keyword with every weapon hit; not game data. */
const applies = (keywordId: KeywordId, durationMs?: number): Effect => ({
  id: `test-applies-${keywordId}`,
  name: "test",
  code: 9101,
  shortName: "test",
  providers: [{ kind: "fireteamSupport" }],
  parts: [
    {
      type: "appliesKeyword",
      keywordId,
      damageSources: ["weapon"],
      ...(durationMs ? { durationMs: { value: durationMs, source } } : {}),
      source,
    },
  ],
});
const effect = (id: string) => effects.find((e) => e.id === id)!;

const run = (selected: Effect[], options: SimulationOptions = {}) =>
  simulate(weapon, 30, selected, buckets, { keywords, ...options });
const keywordHits = (selected: Effect[], options?: SimulationOptions) =>
  run(selected, options).damageInstances.filter(
    (d) => d.damageSource === "keyword",
  );

describe("keywords on the target", () => {
  it("deal nothing without a part that applies them", () => {
    expect(keywordHits([])).toEqual([]);
  });

  it("Volatile: the applying hit does not count, the next hit sets it off and removes it", () => {
    const hits = keywordHits([applies("volatile")]);
    // 0 applies, 3000 explodes (cooldown 1 s blocks reapplying), 6000 applies, 9000 explodes, ...
    expect(hits.map((d) => d.timeMs)).toEqual([3000, 9000]);
    expect(hits[0]).toMatchObject({
      keywordId: "volatile",
      element: "void",
      damage: damageOf("volatile"),
    });
  });

  it("Jolt: the applying hit counts; it lasts 10 s after it was applied", () => {
    const window = {
      effectWindows: { "test-applies-jolt": { startMs: 0, durationMs: 1000 } },
    };
    const hits = keywordHits([applies("jolt")], window);
    expect(hits.map((d) => d.timeMs)).toEqual([0, 3000, 6000, 9000]);
    expect(hits[0]).toMatchObject({ keywordId: "jolt", element: "arc" });
  });

  it("Unravel: the threads follow the hit after their delay", () => {
    const hits = keywordHits([applies("unravel", 9000)]);
    expect(hits[0]).toMatchObject({ keywordId: "unravel", timeMs: 250 });
  });
});

describe("multipliers on keyword damage", () => {
  const volatileDamage = (selected: Effect[]) =>
    keywordHits([applies("volatile"), ...selected])[0].damage;

  it("global debuffs apply, e.g. Weaken", () => {
    const shot = (selected: Effect[]) =>
      run(selected).damageInstances.find((d) => d.damageSource === "weapon")!
        .damage;
    const weakenFactor = shot([effect("weaken")]) / shot([]);
    expect(volatileDamage([effect("weaken")])).toBeCloseTo(
      damageOf("volatile") * weakenFactor,
    );
  });

  it("weapon buffs do not apply, e.g. a surge", () => {
    expect(volatileDamage([effect("surge-3x")])).toBeCloseTo(
      damageOf("volatile"),
    );
  });
});
