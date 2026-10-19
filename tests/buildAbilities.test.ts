import { describe, expect, it } from "vitest";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawAegis from "../src/data/aegis-abilities.json";
import rawEffects from "../src/data/effects.json";
import rawManifest from "../src/data/manifest-abilities.json";
import { abilitySimulation } from "../src/engine/buildAbilities";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadAegisAbilityRows,
  loadEffects,
  loadManifestAbilities,
} from "../src/engine/loadData";
import { abilitiesFor } from "../src/engine/providers";

const effects = loadEffects(rawEffects);
const abilityStats = loadAbilityStats(rawAbilityStats);
const abilities = loadAbilities(
  rawAbilities,
  loadAegisAbilityRows(rawAegis),
  abilityStats,
  loadManifestAbilities(rawManifest),
);
const ids = (list: { id: string }[]) => list.map((a) => a.id);

describe("abilitiesFor", () => {
  it("lists the supers of class and subclass", () => {
    expect(ids(abilitiesFor(abilities, "super", "titan", "arc"))).toEqual([
      "thundercrash",
      "fists-of-havoc",
    ]);
  });

  it("lists Prismatic abilities of the class", () => {
    const supers = ids(abilitiesFor(abilities, "super", "hunter", "prismatic"));
    expect(supers).toContain("golden-gun-marksman");
    expect(supers).not.toContain("golden-gun-deadshot");
  });

  it("gives every class the grenades of the element", () => {
    for (const guardianClass of ["titan", "hunter", "warlock"] as const) {
      expect(
        ids(abilitiesFor(abilities, "grenade", guardianClass, "void")),
      ).toContain("magnetic-grenade");
    }
  });

  it("gives melees only to their class", () => {
    expect(ids(abilitiesFor(abilities, "melee", "warlock", "arc"))).toEqual([
      "ball-lightning",
    ]);
  });
});

describe("abilitySimulation", () => {
  it("turns the abilities of a build into casts and the stats into stat values", () => {
    const simulation = abilitySimulation(
      {
        abilities: [
          { abilityId: "hammer-of-sol", castsMs: [2000] },
          { abilityId: "fusion-grenade", castsMs: [0, 15_000] },
        ],
        abilityStats: { super: 200, grenade: 150, melee: 100 },
      },
      abilities,
      abilityStats,
      effects,
    );
    expect(simulation.casts.map((c) => [c.ability.id, c.castsMs])).toEqual([
      ["hammer-of-sol", [2000]],
      ["fusion-grenade", [0, 15_000]],
    ]);
    expect(simulation.stats.map((s) => [s.scaling.kind, s.value])).toEqual([
      ["super", 200],
      ["grenade", 150],
      ["melee", 100],
    ]);
  });

  it("adds the effects a super grants, with their window from the cast", () => {
    const simulation = abilitySimulation(
      { abilities: [{ abilityId: "well-of-radiance", castsMs: [3000] }] },
      abilities,
      abilityStats,
      effects,
    );
    expect(ids(simulation.grantedEffects)).toEqual(["well-of-radiance"]);
    expect(simulation.grantedWindows["well-of-radiance"].startMs).toBe(3000);
  });

  it("works for a build without abilities", () => {
    expect(abilitySimulation({}, abilities, abilityStats, effects)).toEqual({
      casts: [],
      stats: [],
      grantedEffects: [],
      grantedWindows: {},
    });
  });

  it("adds no stat values if the build has none, so there is no stat bonus", () => {
    const simulation = abilitySimulation(
      { abilities: [{ abilityId: "hammer-of-sol", castsMs: [0] }] },
      abilities,
      abilityStats,
      effects,
    );
    expect(simulation.stats).toEqual([]);
  });

  it("fails for an unknown ability", () => {
    expect(() =>
      abilitySimulation(
        { abilities: [{ abilityId: "nope", castsMs: [0] }] },
        abilities,
        abilityStats,
        effects,
      ),
    ).toThrow(/nope/);
  });
});
