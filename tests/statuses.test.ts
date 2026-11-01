// States of the player, e.g. Amplified or Frost Armor (ADR 0015, U6-2): an effect grants a state,
// a part that requires it applies only while one of its granting effects is active.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import { Effect } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const source = {
  name: "test",
  retrieved: "2026-10-22",
  status: "verified" as const,
};

/** Effects for tests; not game data. */
const granting = (durationMs?: number): Effect => ({
  id: "test-amplified",
  name: "test",
  code: 9201,
  shortName: "test",
  providers: [{ kind: "fireteamSupport" }],
  modifiers: [],
  grantsStatus: ["amplified"],
  ...(durationMs ? { durationMs: { value: durationMs, source } } : {}),
});
const requiring: Effect = {
  id: "test-needs-amplified",
  name: "test",
  code: 9202,
  shortName: "test",
  providers: [{ kind: "fireteamSupport" }],
  modifiers: [
    {
      type: "multiplier",
      bucketId: "empowering",
      multiplier: { value: 1.35, source },
      damageSources: ["weapon"],
      requiresStatus: ["amplified", "wovenMail"],
    },
  ],
};
// shots at 0, 3 and 6 s
const ratios = (selected: Effect[]) => {
  const base = simulate(testWeapon, 60, [], buckets).damageInstances;
  return simulate(testWeapon, 60, selected, buckets).damageInstances.map(
    (d, i) => d.damage / base[i].damage,
  );
};

describe("states of the player", () => {
  it("an effect may only grant a state, without parts", () => {
    expect(Effect.parse(granting()).grantsStatus).toEqual(["amplified"]);
    expect(() => Effect.parse({ ...granting(), grantsStatus: [] })).toThrow();
  });

  it("a part that requires a state applies only while the state is granted", () => {
    expect(ratios([requiring])).toEqual([1, 1, 1]);
    expect(ratios([requiring, granting()])).toEqual([1.35, 1.35, 1.35]);
  });

  it("the state ends with the window of its granting effect", () => {
    expect(ratios([requiring, granting(4000)])).toEqual([1.35, 1.35, 1]);
  });
});
