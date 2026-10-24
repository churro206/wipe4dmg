// Weapons stat as a slider (0 to 200): against bosses only the part above 100 counts, +0.15 % per
// point for primary and special weapons, +0.1 % for power weapons (Compendium, Game Mechanics).

import { describe, expect, it } from "vitest";
import type { Build } from "../src/data/schema";
import { buildSimulation } from "../src/engine/buildSimulation";
import { simulate } from "../src/engine/simulate";
import { buckets, gameData, weaponById } from "../src/ui/data";

const build = (fields: Partial<Build>): Build => ({
  weaponId: "one-thousand-voices",
  guardianClass: "titan",
  subclass: "arc",
  catalyst: false,
  selections: [],
  effectWindows: {},
  damagePhaseSeconds: 30,
  ...fields,
});

const damageOf = (fields: Partial<Build>) => {
  const b = build(fields);
  const { selected, options } = buildSimulation(b, gameData);
  // Weapon damage only: keyword damage (One Thousand Voices ignites) is not scaled by the stat.
  return simulate(
    weaponById(b.weaponId),
    30,
    selected,
    buckets,
    options,
  )
    .damageInstances.filter((d) => d.damageSource === "weapon")
    .reduce((sum, d) => sum + d.damage, 0);
};

describe("Weapons stat", () => {
  it("has no bonus up to 100 and without a value", () => {
    const base = damageOf({});
    expect(damageOf({ weaponsStat: 100 })).toBeCloseTo(base, 6);
    expect(damageOf({ weaponsStat: 30 })).toBeCloseTo(base, 6);
  });

  it("gives power weapons +0.1 % per point above 100 (+10 % at 200)", () => {
    const base = damageOf({ weaponId: "gjallarhorn" });
    expect(damageOf({ weaponId: "gjallarhorn", weaponsStat: 200 }) / base)
      .toBeCloseTo(1.1, 6);
    expect(damageOf({ weaponId: "gjallarhorn", weaponsStat: 130 }) / base)
      .toBeCloseTo(1.03, 6);
  });

  it("gives primary and special weapons +0.15 % per point (+15 % at 200)", () => {
    const base = damageOf({ weaponId: "sunshot" });
    expect(damageOf({ weaponId: "sunshot", weaponsStat: 200 }) / base)
      .toBeCloseTo(1.15, 6);
  });
});
