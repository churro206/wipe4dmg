// Transcendence (Compendium, Prismatic Glossary): +5 % weapon damage for 20 s and the Prismatic
// grenade of the class, which can only be thrown while Transcendence lasts.

import { describe, expect, it } from "vitest";
import type { Build } from "../src/data/schema";
import { buildSimulation } from "../src/engine/buildSimulation";
import { withoutBoundAbilities } from "../src/ui/buildState";
import { gameData } from "../src/ui/data";

const build = (fields: Partial<Build>): Build => ({
  weaponId: "one-thousand-voices",
  guardianClass: "hunter",
  subclass: "prismatic",
  catalyst: false,
  selections: [{ effectId: "transcendence", provider: "subclass" }],
  effectWindows: {},
  damagePhaseSeconds: 30,
  ...fields,
});
const castsOf = (b: Build, abilityId: string) =>
  buildSimulation(b, gameData).options.abilities?.find((c) => c.ability.id === abilityId)
    ?.castsMs;
const grenade = { abilityId: "hailfire-spike", castsMs: [0, 10000, 25000] };

describe("Prismatic grenades", () => {
  it("are provided by Prismatic and their own class only", () => {
    const providers = (id: string) =>
      gameData.abilities.find((a) => a.id === id)!.providers.map((p) => [p.classes, p.subclasses]);
    expect(providers("hailfire-spike")).toEqual([[["hunter"], ["prismatic"]]]);
    expect(providers("electrified-snare")).toEqual([[["titan"], ["prismatic"]]]);
    expect(providers("freezing-singularity")).toEqual([[["warlock"], ["prismatic"]]]);
  });

  it("can only be thrown within the 20 s of Transcendence", () => {
    expect(castsOf(build({ abilities: [grenade] }), "hailfire-spike")).toEqual([0, 10000]);
  });

  it("follow the window of Transcendence in the rotation", () => {
    const later = build({
      abilities: [grenade],
      effectWindows: { transcendence: { startMs: 12000, durationMs: 20000 } },
    });
    expect(castsOf(later, "hailfire-spike")).toEqual([25000]);
  });

  it("leave the choice of the UI when Transcendence is switched off", () => {
    const choice = {
      grenade: { abilityId: "hailfire-spike", castsMs: [0] },
      melee: { abilityId: "knife-trick", castsMs: [0] },
    };
    expect(Object.keys(withoutBoundAbilities(choice, "transcendence"))).toEqual(["melee"]);
  });

  it("cannot be thrown without Transcendence", () => {
    expect(castsOf(build({ abilities: [grenade], selections: [] }), "hailfire-spike")).toEqual([]);
  });
});
