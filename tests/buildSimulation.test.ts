// One way from a build to the simulator inputs, shared by UI, optimizer and tests (plan 2026-10-22).

import { describe, expect, it } from "vitest";
import type { Build } from "../src/data/schema";
import { buildSimulation } from "../src/engine/buildSimulation";
import { gameData } from "../src/ui/data";

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

describe("buildSimulation", () => {
  it("selects the effects of the selections", () => {
    const { selected } = buildSimulation(
      build({ selections: [{ effectId: "weaken", provider: "fireteamSupport" }] }),
      gameData,
    );
    expect(selected.map((e) => e.id)).toEqual(["weaken"]);
  });

  it("uses the ability variant of the worn exotic", () => {
    const { options } = buildSimulation(
      build({
        abilities: [{ abilityId: "thundercrash", castsMs: [0] }],
        exoticArmorId: "cuirass-of-the-falling-star",
      }),
      gameData,
    );
    expect(options.abilities?.[0].ability.exoticArmorId).toBe(
      "cuirass-of-the-falling-star",
    );
  });

  it("adds the effects of the exotic, prebuilt ones only with the switch", () => {
    const ids = (exoticPreBuilt: boolean) =>
      buildSimulation(
        build({ exoticArmorId: "doom-fang-pauldron", exoticPreBuilt }),
        gameData,
      ).selected.map((e) => e.id);
    expect(ids(false)).not.toContain("exotic-armor:doom-fang-pauldron");
    expect(ids(true)).toContain("exotic-armor:doom-fang-pauldron");
  });

  it("passes catalyst, windows and keywords", () => {
    const { options } = buildSimulation(build({ catalyst: true }), gameData);
    expect(options.catalyst).toBe(true);
    expect(options.keywords).toBe(gameData.keywords);
  });
});
