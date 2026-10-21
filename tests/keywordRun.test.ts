// Keywords on the target (ADR 0015, U4a): a part applies the keyword with a hit; damage the target
// takes from any source sets it off past the threshold, then the cooldown blocks it.

import { describe, expect, it } from "vitest";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import {
  AegisAbilityRow,
  type Ability,
  type DamageSource,
  type Effect,
  type KeywordId,
} from "../src/data/schema";
import { effectAppliesToWeapon } from "../src/engine/effectParts";
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

/** Effect that applies stacks of a keyword with every hit of the given sources; not game data. */
const stacksOf = (
  keywordId: KeywordId,
  stacks: number,
  damageSources: DamageSource[] = ["weapon"],
): Effect => ({
  id: `test-stacks-${keywordId}`,
  name: "test",
  code: 9102,
  shortName: "test",
  providers: [{ kind: "fireteamSupport" }],
  parts: [
    {
      type: "appliesKeyword",
      keywordId,
      damageSources,
      stacks: { value: stacks, source },
      source,
    },
  ],
});

/** Ability with one hit right at the cast; not game data. */
const testAbility = (kind: "grenade" | "melee"): Ability => ({
  id: `test-${kind}`,
  code: 9103,
  name: "test",
  kind,
  element: "solar",
  providers: [
    { kind: "subclass", classes: ["warlock"], subclasses: ["solar"] },
  ],
  components: [
    {
      id: "hit",
      name: "Hit",
      delayMs: { value: 0, source },
      damagePerTick: { value: 1000, source },
      ticks: { value: 1, source },
      tickIntervalMs: { value: 0, source },
      scalesWithAbilityStat: false,
    },
  ],
});

describe("ignition through scorch stacks", () => {
  it("goes off at x100 scorch, inheriting the bonuses of the weapon hit", () => {
    // x40 per hit: 0 -> 40, 3000 -> 80, 6000 -> 120 = ignition; 9000 -> 40, 12000 -> 80
    const plain = keywordHits([stacksOf("ignition", 40)]);
    expect(plain.map((d) => d.timeMs)).toEqual([6000]);
    expect(plain[0]).toMatchObject({
      keywordId: "ignition",
      element: "solar",
      damage: damageOf("ignition"),
    });
    const shot = (selected: Effect[]) =>
      run(selected).damageInstances.find((d) => d.damageSource === "weapon")!
        .damage;
    const surgeFactor = shot([effect("surge-3x")]) / shot([]);
    const surged = keywordHits([stacksOf("ignition", 40), effect("surge-3x")]);
    expect(surged[0].damage).toBeCloseTo(damageOf("ignition") * surgeFactor);
  });

  it("Ember of Ashes adds 50 % to the stacks, rounded up", () => {
    const hits = keywordHits([
      stacksOf("ignition", 40),
      effect("ember-of-ashes"),
    ]);
    expect(hits.map((d) => d.timeMs)).toEqual([3000, 9000]);
  });

  it("melee buffs do not scale the ignition of a melee hit", () => {
    const meleeBuff: Effect = {
      id: "test-melee-buff",
      name: "test",
      code: 9104,
      shortName: "test",
      providers: [{ kind: "fireteamSupport" }],
      parts: [
        {
          type: "multiplier",
          bucketId: "empowering",
          multiplier: { value: 2, source },
          damageSources: ["melee"],
        },
      ],
    };
    const ignition = (selected: Effect[]) =>
      keywordHits([stacksOf("ignition", 100, ["melee"]), ...selected], {
        abilities: [{ ability: testAbility("melee"), castsMs: [0] }],
      })[0];
    expect(ignition([meleeBuff]).damage).toBeCloseTo(ignition([]).damage);
  });
});

describe("bolt charge", () => {
  const withGrenadeAt = (castMs: number) => ({
    abilities: [{ ability: testAbility("grenade"), castsMs: [castMs] }],
  });

  it("an ability hit at x10 stacks discharges it after 0.5 s and uses up the stacks", () => {
    const hits = keywordHits([stacksOf("boltCharge", 10)], withGrenadeAt(4000));
    expect(hits.map((d) => d.timeMs)).toEqual([4500]);
    expect(hits[0]).toMatchObject({
      keywordId: "boltCharge",
      element: "arc",
      damage: damageOf("boltCharge"),
    });
  });

  it("does not discharge below x10 stacks or without an ability hit", () => {
    expect(
      keywordHits([stacksOf("boltCharge", 4)], withGrenadeAt(4000)),
    ).toEqual([]);
    expect(keywordHits([stacksOf("boltCharge", 10)])).toEqual([]);
  });
});

describe("keywords of a weapon", () => {
  const scorchWeapon = (bonus?: number) => ({
    ...weapon,
    intrinsicParts: [
      {
        type: "appliesKeyword" as const,
        keywordId: "ignition" as const,
        damageSources: ["weapon" as const],
        stacks: { value: 40, source },
        source,
      },
    ],
    ...(bonus
      ? {
          keywordBonuses: [
            {
              keywordId: "ignition" as const,
              factor: { value: bonus, source },
            },
          ],
        }
      : {}),
  });
  const ignitions = (
    w: ReturnType<typeof scorchWeapon>,
    selected: Effect[] = [],
  ) =>
    simulate(w, 30, selected, buckets, { keywords }).damageInstances.filter(
      (d) => d.keywordId === "ignition",
    );

  it("an intrinsic part applies scorch with every shot", () => {
    expect(ignitions(scorchWeapon()).map((d) => d.timeMs)).toEqual([6000]);
  });

  it("the weapon's keyword bonus scales its ignitions", () => {
    expect(ignitions(scorchWeapon(1.316))[0].damage).toBeCloseTo(
      damageOf("ignition") * 1.316,
    );
  });

  it("counts as a weapon that Ember of Ashes changes", () => {
    expect(
      ignitions(scorchWeapon(), [effect("ember-of-ashes")]).map(
        (d) => d.timeMs,
      ),
    ).toEqual([3000, 9000]);
    expect(
      effectAppliesToWeapon(effect("ember-of-ashes"), scorchWeapon()),
    ).toBe(true);
    expect(effectAppliesToWeapon(effect("ember-of-ashes"), weapon)).toBe(false);
  });
});

describe("weapon options and keyword damage", () => {
  it("a catalyst factor stays with the shots and does not scale the ignitions", () => {
    const scorched = {
      ...weapon,
      intrinsicParts: [
        {
          type: "appliesKeyword" as const,
          keywordId: "ignition" as const,
          damageSources: ["weapon" as const],
          stacks: { value: 100, source },
          source,
        },
      ],
      options: [
        {
          id: "catalyst",
          name: "catalyst",
          kind: "catalyst" as const,
          factor: { value: 2, source },
          bucketId: "weaponPerk",
          durationSeconds: null,
          condition: null,
        },
      ],
    };
    const ignition = (catalyst: boolean) =>
      simulate(scorched, 30, [], buckets, {
        keywords,
        catalyst,
      }).damageInstances.find((d) => d.keywordId === "ignition")!.damage;
    expect(ignition(true)).toBeCloseTo(ignition(false));
  });
});
