// A setup the shots build and deploy (Guidance Ring of Hierarchy of Needs) as rules (architecture
// section 6, ADR 0018 B3a step 3): shots before it and the shot that deploys it deal no setup damage;
// it lasts its duration, then the next shot deploys it again; with the assumption "pre-stacked" the
// first shot deploys it; the catalyst's rate starts once it stands; with "setup-stands" it stands
// at the start of the phase and deals setup damage from the first shot.

import { describe, expect, it } from "vitest";
import type { SourcedNumber, Weapon } from "../src/data/schema";
import { simulate } from "../src/engine/simulate";
import { partRules, setupRules } from "../scripts/lib/partRules";
import { testWeapon } from "./support/testWeapon";

const sourced = (value: number): SourcedNumber => ({
  value,
  source: { name: "test", url: "", retrieved: "2026-10-26", status: "derived" },
});

// 60 rpm (1 s per shot), with the catalyst 120 rpm once the ring stands; the ring stands 5 s
const arrow = { ...testWeapon.damageInstances[0], id: "arrow", damagePerTick: sourced(100) };
const seekers = {
  ...testWeapon.damageInstances[0],
  id: "seekers",
  damagePerTick: sourced(10),
  ticks: sourced(3),
};
const ringRules = (catalystRpm?: number) =>
  setupRules({
    mode: "ring",
    shotsBefore: sourced(4),
    shotsBeforePreBuilt: sourced(1),
    durationMs: sourced(5000),
    ...(catalystRpm ? { catalystRpm: sourced(catalystRpm) } : {}),
  });
const ringBow: Weapon = {
  ...testWeapon,
  weaponType: "bow",
  ammo: "primary",
  fireRateRpm: sourced(60),
  magazine: sourced(1),
  reloadTimeMs: sourced(0),
  damageInstances: [arrow, seekers],
  rules: [
    ...partRules(arrow),
    ...partRules(seekers, { mode: { id: "ring", is: "up" } }),
    ...ringRules(120),
  ],
  catalyst: {
    name: "Cat",
    description: "",
    effect: "timing",
    // No rate: the weapon's own one holds until the ring stands (the rule sets the catalyst's)
    timing: {
      magazine: sourced(1),
      totalShots: sourced(null as unknown as number),
      reloadTimeMs: sourced(0),
    },
  },
};

const seekerShots = (result: ReturnType<typeof simulate>) =>
  result.shots
    .map((shot, index) => ({ shot, index }))
    .filter(({ shot }) =>
      result.damageInstances.some((d) => d.id === "seekers" && d.timeMs === shot.timeMs),
    )
    .map(({ index }) => index + 1);

describe("weapon setup as rules", () => {
  it("without Pre-stacked: 3 shots build, the 4th deploys, seekers from the 5th on", () => {
    const result = simulate(ringBow, 7.5);
    expect(result.shots.map((s) => s.timeMs)).toEqual([0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]);
    // deployed at 3 s, stands until 8 s
    expect(seekerShots(result)).toEqual([5, 6, 7, 8]);
  });

  it("with Pre-stacked: the 1st shot deploys, seekers from the 2nd on", () => {
    const result = simulate(ringBow, 3, [], [], { assumptions: ["pre-stacked"] });
    expect(seekerShots(result)).toEqual([2, 3, 4]);
  });

  it("after its duration the next shot deploys it again, without seekers", () => {
    // deployed at 0 s, stands until 5 s: the shot at 5 s deploys again
    const result = simulate(ringBow, 7, [], [], { assumptions: ["pre-stacked"] });
    expect(seekerShots(result)).toEqual([2, 3, 4, 5, 7, 8]);
  });

  it("standing at the start, seekers and the catalyst's rate from the 1st shot", () => {
    // An Aegis measurement counts no deploying shot (scenario bench)
    const result = simulate(ringBow, 6, [], [], { catalyst: true, assumptions: ["setup-stands"] });
    expect(result.shots.map((s) => s.timeMs)).toEqual([
      0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000,
    ]);
    // deployed at 0 s, stands until 5 s: the shot at 5 s deploys again
    expect(seekerShots(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13]);
  });

  it("the catalyst's rate only once it stands, and then for good", () => {
    const result = simulate(ringBow, 12, [], [], { catalyst: true });
    // 4 shots 1 s apart, then 0.5 s, also after the ring has run out at 8 s
    expect(result.shots.map((s) => s.timeMs).slice(0, 8)).toEqual([
      0, 1000, 2000, 3000, 3500, 4000, 4500, 5000,
    ]);
    expect(result.shots.map((s) => s.timeMs).slice(-3)).toEqual([11000, 11500, 12000]);
  });

  it("without the catalyst the rate stays", () => {
    const result = simulate(ringBow, 5, [], [], { assumptions: ["setup-stands"] });
    expect(result.shots.map((s) => s.timeMs)).toEqual([0, 1000, 2000, 3000, 4000, 5000]);
  });

  it("both assumptions together: the ring stands, it is not built twice", () => {
    const result = simulate(ringBow, 7, [], [], { assumptions: ["pre-stacked", "setup-stands"] });
    expect(seekerShots(result)).toEqual([1, 2, 3, 4, 5, 7, 8]);
  });
});
