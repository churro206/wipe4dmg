// A playstyle of the weapon that replaces its shot by a sequence of hits with a factor each (ADR 0017,
// stage S3), e.g. the three Golden Gun shots of Still Hunt (x1, x1.45, x1.9).

import { describe, expect, it } from "vitest";
import type { SourcedNumber, Weapon } from "../src/data/schema";
import { simulateCore } from "../src/engine/core/simulateCore";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-30", status: "derived" },
});

const sniper: Weapon = {
  ...testWeapon,
  damageInstances: [
    testWeapon.damageInstances[0],
    {
      ...testWeapon.damageInstances[0],
      id: "goldenGun",
      damagePerTick: sourced(2000),
      ticks: sourced(3),
      tickIntervalMs: sourced(500),
      tickFactors: [sourced(1), sourced(1.5), sourced(2)],
      playstyle: { id: "golden-gun", replaces: "shot" },
    },
  ],
};

const damages = (id: string, options = {}) =>
  simulateCore(sniper, 2.5, [], [], { shotLimit: 1, ...options }).damageInstances.filter(
    (d) => d.id === id,
  );

describe("playstyle sequence (simulateCore)", () => {
  it("fires the plain shot without the playstyle", () => {
    expect(damages("shot").map((d) => d.damage)).toEqual([1000]);
    expect(damages("goldenGun")).toEqual([]);
  });

  it("replaces the shot by the hits of the sequence, each with its factor", () => {
    const options = { playstyle: "golden-gun" };
    expect(damages("shot", options)).toEqual([]);
    const hits = damages("goldenGun", options);
    expect(hits.map((d) => d.damage)).toEqual([2000, 3000, 4000]);
    expect(hits.map((d) => d.timeMs)).toEqual([0, 500, 1000]);
  });

  it("ignores a playstyle the weapon does not have", () => {
    expect(damages("shot", { playstyle: "other" }).map((d) => d.damage)).toEqual([1000]);
  });
});
