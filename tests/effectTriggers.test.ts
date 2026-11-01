// Effects whose windows open at events of the rotation (ADR 0015, U6-1b).

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import type {
  Ability,
  Effect,
  EffectTrigger,
  MultiplierPart,
} from "../src/data/schema";
import { resolveWindows } from "../src/engine/effectWindows";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const source = {
  name: "test",
  retrieved: "2026-10-22",
  status: "verified" as const,
};

/** Abilities and effects for tests; not game data. */
const ability = (fields: Partial<Ability>): Ability => ({
  id: "test-grenade",
  code: 9101,
  name: "Test Grenade",
  kind: "grenade",
  element: "void",
  providers: [{ kind: "subclass" }],
  components: [
    {
      id: "hit",
      name: "Hit",
      delayMs: { value: 500, source },
      damagePerTick: { value: 100, source },
      ticks: { value: 1, source },
      tickIntervalMs: { value: 0, source },
      scalesWithAbilityStat: false,
    },
  ],
  ...fields,
});
const triggered = (
  trigger: Partial<EffectTrigger>,
  durationMs = 6000,
  part: Partial<MultiplierPart> = {},
): Effect => ({
  id: "test-triggered",
  name: "test",
  code: 9102,
  shortName: "test",
  providers: [{ kind: "fireteamSupport" }],
  modifiers: [
    {
      type: "multiplier",
      bucketId: "debuff",
      multiplier: { value: 1.15, source },
      damageSources: ["weapon"],
      ...part,
    },
  ],
  durationMs: { value: durationMs, source },
  trigger: { on: "cast", refresh: true, ...trigger },
});
const grenade = ability({});
const superAbility = ability({
  id: "test-super",
  kind: "super",
  element: "arc",
});
const windowsOf = (
  effect: Effect,
  casts: { ability: Ability; castsMs: number[] }[],
  superWindows: { abilityId: string; startMs: number; endMs: number }[] = [],
  weaponElement: Ability["element"] = "void",
) =>
  resolveWindows([effect], {}, { casts, superWindows, weaponElement }).get(
    effect.id,
  );

describe("windows of triggered effects", () => {
  it("cast: one window per cast", () => {
    expect(
      windowsOf(triggered({}), [{ ability: grenade, castsMs: [1000, 20000] }]),
    ).toEqual([
      { startMs: 1000, endMs: 7000 },
      { startMs: 20000, endMs: 26000 },
    ]);
  });

  it("hit: opens at the first hit of the ability", () => {
    expect(
      windowsOf(triggered({ on: "hit" }), [
        { ability: grenade, castsMs: [1000] },
      ]),
    ).toEqual([{ startMs: 1500, endMs: 7500 }]);
  });

  it("refresh: a trigger inside the window restarts its duration", () => {
    expect(
      windowsOf(triggered({}), [{ ability: grenade, castsMs: [0, 5000] }]),
    ).toEqual([{ startMs: 0, endMs: 11000 }]);
  });

  it("without refresh a trigger inside the window is ignored", () => {
    expect(
      windowsOf(triggered({ refresh: false }), [
        { ability: grenade, castsMs: [0, 5000, 7000] },
      ]),
    ).toEqual([
      { startMs: 0, endMs: 6000 },
      { startMs: 7000, endMs: 13000 },
    ]);
  });

  it("filters the triggering abilities by kind, id and element", () => {
    const casts = [
      { ability: grenade, castsMs: [0] },
      { ability: superAbility, castsMs: [30000] },
    ];
    expect(windowsOf(triggered({ abilityKinds: ["super"] }), casts)).toEqual([
      { startMs: 30000, endMs: 36000 },
    ]);
    expect(
      windowsOf(triggered({ abilityIds: ["test-grenade"] }), casts),
    ).toEqual([{ startMs: 0, endMs: 6000 }]);
    expect(windowsOf(triggered({ elements: ["arc"] }), casts)).toEqual([
      { startMs: 30000, endMs: 36000 },
    ]);
  });

  it("superEnd: opens at the end of the super window", () => {
    expect(
      windowsOf(
        triggered({ on: "superEnd" }),
        [{ ability: superAbility, castsMs: [10000] }],
        [{ abilityId: "test-super", startMs: 10000, endMs: 25000 }],
      ),
    ).toEqual([{ startMs: 25000, endMs: 31000 }]);
  });

  it("untilSuperCast: from 0 s to the first super cast plus the duration", () => {
    const effect = triggered({ on: "untilSuperCast" }, 11000);
    expect(
      windowsOf(effect, [{ ability: superAbility, castsMs: [40000, 90000] }]),
    ).toEqual([{ startMs: 0, endMs: 51000 }]);
    expect(windowsOf(effect, [])).toEqual([{ startMs: 0, endMs: Infinity }]);
  });

  it("weaponMatchesTriggerElement keeps only windows of abilities of the weapon element", () => {
    const effect = triggered({ on: "hit", refresh: false }, 16000, {
      condition: "weaponMatchesTriggerElement",
    });
    const casts = [
      { ability: superAbility, castsMs: [0] },
      { ability: grenade, castsMs: [20000] },
    ];
    expect(windowsOf(effect, casts, [], "void")).toEqual([
      { startMs: 20500, endMs: 36500 },
    ]);
  });
});

describe("simulate with triggered effects", () => {
  const weapon = testWeapon;
  const damageAt = (selected: Effect[], castsMs: number[]) =>
    simulate(weapon, 60, selected, buckets, {
      abilities: [{ ability: grenade, castsMs }],
    }).damageInstances.filter((d) => d.damageSource === "weapon");

  it("applies the effect only to hits inside its windows", () => {
    // shots at 0, 3 and 6 s; the window of the first hit is [0.5 s, 6.5 s)
    const base = damageAt([], [0]);
    const buffed = damageAt([triggered({ on: "hit" })], [0]);
    expect(buffed.map((hit, i) => hit.damage / base[i].damage)).toEqual([
      1, 1.15, 1.15,
    ]);
  });

  it("superElements: applies only with a super of these elements", () => {
    const effect: Effect = {
      ...triggered({}),
      trigger: undefined,
      durationMs: undefined,
      modifiers: [
        {
          type: "multiplier",
          bucketId: "debuff",
          multiplier: { value: 1.15, source },
          damageSources: ["weapon"],
          superElements: ["void"],
        },
      ],
    };
    const total = (element: Ability["element"]) =>
      simulate(weapon, 60, [effect], buckets, {
        abilities: [
          { ability: ability({ id: "s", kind: "super", element }), castsMs: [] },
        ],
      }).totalDamage;
    const plain = simulate(weapon, 60, [], buckets).totalDamage;
    expect(total("void")).toBeCloseTo(plain * 1.15);
    expect(total("arc")).toBeCloseTo(plain);
  });
});
