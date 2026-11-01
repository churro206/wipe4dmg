// A part that requires other effects (e.g. Expanding Abyss raising Weaken) applies only while one of
// them is active in the same window.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import { Effect } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const source = {
  name: "test",
  retrieved: "2026-10-23",
  status: "verified" as const,
};

/** Effects for tests; not game data. */
const debuff = (id: string, multiplier: number, requires?: string[]): Effect => ({
  id,
  name: id,
  code: 9301 + id.length,
  shortName: id,
  providers: [{ kind: "fireteamSupport" }],
  modifiers: [
    {
      type: "multiplier",
      bucketId: "debuff",
      multiplier: { value: multiplier, source },
      damageSources: ["weapon"],
      ...(requires ? { requiresEffectIds: requires } : {}),
    },
  ],
});
const weaken = debuff("t-weaken", 1.15);
const improved = debuff("t-improved", 1.25, ["t-weaken"]);

const ratio = (selected: Effect[]) => {
  const base = simulate(testWeapon, 60, [], buckets).damageInstances[0];
  return (
    simulate(testWeapon, 60, selected, buckets).damageInstances[0].damage /
    base.damage
  );
};

describe("parts that require other effects", () => {
  it("do nothing alone", () => {
    expect(ratio([improved])).toBe(1);
  });

  it("raise the effect they improve (highest in the debuff bucket)", () => {
    expect(ratio([weaken])).toBeCloseTo(1.15);
    expect(ratio([weaken, improved])).toBeCloseTo(1.25);
  });
});
