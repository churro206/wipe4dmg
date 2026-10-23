// Stacks per weapon hit (Lucky Pants, Peacekeepers): hit n has n - 1 stacks, a gap longer than the
// refresh time ends the run, bosses take less damage from buffed shots (Compendium).

import { describe, expect, it } from "vitest";
import type { Effect, MultiplierPart, SourcedNumber } from "../src/data/schema";
import { simulate } from "../src/engine/simulate";
import { buckets } from "../src/ui/data";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-23", status: "derived" },
});

const effect = (hitStacks: NonNullable<MultiplierPart["hitStacks"]>): Effect => ({
  id: "stacker",
  name: "Stacker",
  code: 9999,
  shortName: "Stk",
  providers: [{ kind: "armor", slot: "exotic" }],
  parts: [
    {
      type: "multiplier",
      bucketId: "exoticIntrinsic",
      multiplier: sourced(1.5), // +50 % per stack
      damageSources: ["weapon"],
      hitStacks,
    },
  ],
});

// testWeapon fires at 0 s, 3 s and 6 s (60 rpm, one shot per magazine, 2 s reload)
const damages = (hitStacks: NonNullable<MultiplierPart["hitStacks"]>) =>
  simulate(testWeapon, 10, [effect(hitStacks)], buckets).damageInstances.map(
    (instance) => instance.damage,
  );

describe("hitStacks", () => {
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
});
