// Stacks per weapon hit (Lucky Pants, Peacekeepers): hit n has n - 1 stacks, a gap longer than the
// refresh time ends the run, bosses take less damage from buffed shots (Compendium).

import { describe, expect, it } from "vitest";
import type { Effect, SourcedNumber, Weapon } from "../src/data/schema";
import { simulate } from "../src/engine/simulate";
import { buckets } from "../src/ui/data";
import { testWeapon, withPartRules } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-23", status: "derived" },
});

type HitStacks = { maxStacks: SourcedNumber; refreshMs?: SourcedNumber; bossFactor: SourcedNumber };

// The shape the import writes for stacks per weapon hit (scripts/lib/exoticEffects.ts)
const effect = (hitStacks: HitStacks, window?: SourcedNumber): Effect => {
  const part = {
    type: "multiplier" as const,
    bucketId: "exoticIntrinsic",
    damageSources: ["weapon" as const],
  };
  const onHit = { on: "hit" as const, filter: { damageSources: ["weapon" as const] } };
  return {
    id: "stacker",
    name: "Stacker",
    code: 9999,
    shortName: "Stk",
    providers: [{ kind: "armor", slot: "exotic" }],
    modifiers: [],
    ...(window ? { durationMs: window } : {}),
    buffs: [
      {
        id: "stacks",
        name: "Stacker",
        modifiers: [
          { ...part, multiplier: sourced(1.5), perStack: true }, // +50 % per stack
          { ...part, multiplier: hitStacks.bossFactor },
        ],
        maxStacks: hitStacks.maxStacks,
        ...(hitStacks.refreshMs ? { durationMs: hitStacks.refreshMs } : {}),
      },
    ],
    rules: [
      { id: "start", on: onHit, if: [{ type: "buff", id: "stacks", not: true }], do: [{ type: "grantBuff", buff: "stacks" }] },
      { id: "raise", on: onHit, if: [{ type: "buff", id: "stacks" }], do: [{ type: "addStacks", buff: "stacks" }] },
    ],
  };
};

// testWeapon fires at 0 s, 3 s and 6 s (60 rpm, one shot per magazine, 2 s reload)
const damages = (hitStacks: HitStacks, window?: SourcedNumber) =>
  simulate(testWeapon, 10, [effect(hitStacks, window)], buckets).damageInstances.map(
    (instance) => instance.damage,
  );

describe("stacks per weapon hit", () => {
  it("hit n has n - 1 stacks, up to the maximum", () => {
    expect(
      damages({ maxStacks: sourced(1), bossFactor: sourced(1) }),
    ).toEqual([1000, 1500, 1500]);
  });

  it("a gap longer than the refresh time ends the run", () => {
    expect(
      damages({
        maxStacks: sourced(10),
        refreshMs: sourced(2000),
        bossFactor: sourced(1),
      }),
    ).toEqual([1000, 1000, 1000]);
  });

  it("the boss factor applies to buffed shots only", () => {
    expect(
      damages({ maxStacks: sourced(10), bossFactor: sourced(0.5) }),
    ).toEqual([1000, 1500 * 0.5, 2000 * 0.5]);
  });

  // The effect owns the rules: outside its window it grants and counts nothing (Lucky Pants: 6 s)
  it("stacks only grow inside the window of the effect", () => {
    expect(
      damages({ maxStacks: sourced(10), bossFactor: sourced(1) }, sourced(4000)),
    ).toEqual([1000, 1500, 1000]);
  });
});

// S4 part C (ADR 0017): the hits of a part that every Nth shot sets off count as hits too, e.g. the
// Blighted Seekers of Barrow-Dyad that fill the reload ("overwriting regular shots", Compendium).
describe("stacks per weapon hit with every-Nth-shot parts", () => {
  // 60 rpm, magazine 2, reload 2 s: shots at 0, 1, 4 and 5 s; every 2nd shot a seeker 1.5 s later.
  const seekerWeapon: Weapon = withPartRules({
    ...testWeapon,
    ammo: "primary",
    fireRateRpm: sourced(60),
    magazine: sourced(2),
    reloadTimeMs: sourced(2000),
    damageInstances: [
      { ...testWeapon.damageInstances[0], id: "shot", damagePerTick: sourced(100) },
      {
        ...testWeapon.damageInstances[0],
        id: "seeker",
        damagePerTick: sourced(10),
        delayMs: sourced(1500),
        everyNthShot: sourced(2),
      },
    ],
  });
  const run = () =>
    simulate(
      seekerWeapon,
      5.5,
      [effect({ maxStacks: sourced(10), refreshMs: sourced(2000), bossFactor: sourced(1) })],
      buckets,
    ).damageInstances.map((d) => [d.id, d.timeMs, d.damage]);

  it("a seeker in the reload keeps the run, and gets the stacks of the hits before it", () => {
    expect(run()).toEqual([
      ["shot", 0, 100],
      ["shot", 1000, 150],
      ["seeker", 2500, 20],
      ["shot", 4000, 250],
      ["shot", 5000, 300],
    ]);
  });
});
