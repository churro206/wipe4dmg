// A damage instance that only every Nth shot sets off (ADR 0017, stage S3), e.g. the cluster of every
// third rocket with Prototype Trueseeker: the Nth, 2Nth, ... shot deals it, the others do not.

import { describe, expect, it } from "vitest";
import type { SourcedNumber, Weapon } from "../src/data/schema";
import { simulateCore } from "../src/engine/core/simulateCore";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-30", status: "derived" },
});

// 60 rpm, every third shot adds a cluster of 4 hits of 10
const rocket: Weapon = {
  ...testWeapon,
  ammo: "primary",
  fireRateRpm: sourced(60),
  magazine: sourced(10),
  reloadTimeMs: sourced(0),
  damageInstances: [
    { ...testWeapon.damageInstances[0], id: "rocket", damagePerTick: sourced(100) },
    {
      ...testWeapon.damageInstances[0],
      id: "cluster",
      damagePerTick: sourced(10),
      ticks: sourced(4),
      everyNthShot: sourced(3),
    },
  ],
};

describe.each([
  ["simulate", simulate],
  ["simulateCore", simulateCore],
])("every Nth shot (%s)", (_, run) => {
  it("sets off the instance with the 3rd, 6th, ... shot", () => {
    const result = run(rocket, 6.5);
    const clusterTimes = result.damageInstances
      .filter((d) => d.id === "cluster")
      .map((d) => d.timeMs);
    expect(clusterTimes).toEqual([2000, 2000, 2000, 2000, 5000, 5000, 5000, 5000]);
    expect(result.damageInstances.filter((d) => d.id === "rocket")).toHaveLength(7);
  });

  it("counts shots of the whole weapon, not of a magazine", () => {
    const small = { ...rocket, magazine: sourced(2), reloadTimeMs: sourced(1000) };
    const result = run(small, 3.5);
    const third = result.shots[2].timeMs;
    const clusters = result.damageInstances.filter((d) => d.id === "cluster");
    expect(clusters.map((d) => d.timeMs)).toEqual([third, third, third, third]);
  });
});
