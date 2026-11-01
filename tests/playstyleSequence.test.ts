// A playstyle of the weapon that replaces its shot by a sequence of hits with a factor each (ADR 0017,
// stage S3), e.g. the three Golden Gun shots of Still Hunt (x1, x1.45, x1.9), or by a shot at its own
// rate (stage S4), e.g. a lower charge of Whirling Ovation. Since ADR 0018 B3a step 2 the weapon lists
// its playstyles, the parts carry the condition `playstyle` and the rate is a `modifyStat` rule.

import { describe, expect, it } from "vitest";
import type { SourcedNumber, Weapon } from "../src/data/schema";
import { playstylesOf, plainShotLabel } from "../src/engine/playstyle";
import { simulate } from "../src/engine/simulate";
import { testWeapon, withPartRules } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-30", status: "unverified" },
});

const sniper: Weapon = {
  ...withPartRules(
    {
      ...testWeapon,
      magazine: sourced(3),
      damageInstances: [
        testWeapon.damageInstances[0],
        {
          ...testWeapon.damageInstances[0],
          id: "goldenGun",
          damagePerTick: sourced(2000),
          ticks: sourced(3),
          tickIntervalMs: sourced(500),
          tickFactors: [sourced(1), sourced(1.5), sourced(2)],
        },
        {
          ...testWeapon.damageInstances[0],
          id: "quickShot",
          name: "Quick shot",
          damagePerTick: sourced(400),
        },
      ],
    },
    {
      parts: {
        shot: { except: ["golden-gun", "quick"] },
        goldenGun: { only: "golden-gun" },
        quickShot: { only: "quick" },
      },
      rates: { quick: 120 },
    },
  ),
  playstyles: [
    { id: "default", label: "Plain" },
    { id: "golden-gun", label: "Golden Gun" },
    { id: "quick", label: "Quick shot", selectable: true },
  ],
};

describe("playstyle sequence", () => {
  const run = simulate;
  const damages = (id: string, options = {}) =>
    run(sniper, 2.5, [], [], { shotLimit: 1, ...options }).damageInstances.filter(
      (d) => d.id === id,
    );

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

  it("fires the playstyle's shot at its own rate", () => {
    const hits = run(sniper, 1.2, [], [], { playstyle: "quick" }).damageInstances;
    expect(hits.map((d) => d.id)).toEqual(["quickShot", "quickShot", "quickShot"]);
    expect(hits.map((d) => d.timeMs)).toEqual([0, 500, 1000]);
  });

  it("keeps the rate of the weapon in the plain shot", () => {
    const hits = run(sniper, 1.2, [], [], {}).damageInstances;
    expect(hits.map((d) => d.timeMs)).toEqual([0, 1000]);
  });

  it("ignores a playstyle the weapon does not have", () => {
    expect(damages("shot", { playstyle: "other" }).map((d) => d.damage)).toEqual([1000]);
  });
});

describe("playstylesOf", () => {
  it("offers only the selectable playstyles", () => {
    expect(playstylesOf(sniper)).toEqual([{ id: "quick", name: "Quick shot" }]);
  });

  it("labels the plain shot with the entry default", () => {
    expect(plainShotLabel(sniper)).toBe("Plain");
    expect(plainShotLabel({})).toBeUndefined();
  });
});
