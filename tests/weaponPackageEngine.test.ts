// Imported weapon packages in the simulator (ADR 0013): the catalyst switch applies catalyst
// options as multipliers, and effects already inside the value per shot do not count twice.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import type { Weapon } from "../src/data/schema";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const effect = (id: string) => effects.find((e) => e.id === id)!;
const source = {
  name: "Test fixture, not a game value",
  retrieved: "2026-10-20",
  status: "unverified" as const,
};
// Test input: a package with a catalyst option ×1.4 and Ember of Ashes inside its value.
const pkg: Weapon = {
  ...testWeapon,
  includedEffectIds: ["ember-of-ashes", "weaken"],
  options: [
    {
      id: "catalyst-buff",
      name: "Catalyst Buff",
      kind: "catalyst",
      factor: { value: 1.4, source },
      bucketId: "weaponPerk",
      durationSeconds: null,
      condition: null,
    },
  ],
};
const total = (ids: string[] = [], catalyst = false) =>
  simulate(pkg, 600, ids.map(effect), buckets, { catalyst }).totalDamage;

describe("weapon package options", () => {
  it("applies catalyst options only with the catalyst", () => {
    expect(total([], true) / total()).toBeCloseTo(1.4, 6);
  });

  it("stacks the option in its bucket with other effects", () => {
    expect(total(["surge-3x"], true) / total(["surge-3x"])).toBeCloseTo(1.4, 6);
  });
});

describe("effects included in a package", () => {
  it("does not apply them again to the weapon", () => {
    expect(total(["weaken"])).toBe(total());
  });

  it("still applies effects that are not included", () => {
    expect(total(["surge-3x"])).toBeGreaterThan(total());
  });
});
