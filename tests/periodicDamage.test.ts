// Damage of its own at a fixed rate while an effect is active, e.g. Storm's Keep or Hellion (Aegis
// tab Sustained): the first hit one interval after the window starts; only multipliers for keyword
// damage apply, like Aegis applies only the debuff.

import { describe, expect, it } from "vitest";
import type { Effect, MultiplierPart, SourcedNumber } from "../src/data/schema";
import { simulate } from "../src/engine/simulate";
import { buckets } from "../src/ui/data";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-24", status: "derived" },
});

const turret: Effect = {
  id: "turret",
  name: "Turret",
  code: 9999,
  shortName: "Tur",
  providers: [{ kind: "subclass", slot: "aspect" }],
  modifiers: [],
  rules: [
    {
      id: "tick",
      on: { on: "timer", everyMs: sourced(1500) },
      do: [
        {
          type: "damage",
          id: "turret",
          damage: sourced(100),
          element: "arc",
          damageSource: "keyword",
        },
      ],
    },
  ],
};

const multiplier = (
  id: string,
  bucketId: string,
  value: number,
  damageSources: MultiplierPart["damageSources"],
): Effect => ({
  id,
  name: id,
  code: 9998,
  shortName: id,
  providers: [{ kind: "armor", slot: "mod" }],
  modifiers: [
    { type: "multiplier", bucketId, multiplier: sourced(value), damageSources },
  ],
});

const turretHits = (effects: Effect[], options = {}) =>
  simulate(testWeapon, 5, effects, buckets, options).damageInstances.filter(
    (d) => d.id === "turret",
  );

describe("damage of its own (rule on timer everyMs, action damage)", () => {
  it("hits every interval from one interval after the start up to the end of the phase", () => {
    const hits = turretHits([turret]);
    expect(hits.map((d) => d.timeMs)).toEqual([1500, 3000, 4500]);
    expect(hits.every((d) => d.damage === 100 && d.element === "arc")).toBe(true);
    expect(hits.every((d) => d.damageSource === "keyword")).toBe(true);
  });

  it("only hits inside the window of the effect", () => {
    const hits = turretHits([turret], {
      effectWindows: { turret: { startMs: 1000, durationMs: 2000 } },
    });
    expect(hits.map((d) => d.timeMs)).toEqual([2500]);
  });

  it("debuffs apply, weapon buffs do not", () => {
    const hits = turretHits([
      turret,
      multiplier("weaken", "debuff", 1.3, ["weapon", "keyword"]),
      multiplier("surge", "surge", 1.22, ["weapon"]),
    ]);
    expect(hits[0].damage).toBeCloseTo(130);
  });
});
