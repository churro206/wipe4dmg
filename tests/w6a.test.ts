// W6a (Plan W): five primaries as hand items, shot and rate from Quantum rows, mechanics from the Clarity
// quotes. Same way as the UI: gameData, buildSimulation.

import { describe, expect, it } from "vitest";
import type { Build, Weapon } from "../src/data/schema";
import { fitArtifact } from "../src/engine/artifacts";
import { buildSimulation } from "../src/engine/buildSimulation";
import { simulate, type SimulationResult } from "../src/engine/simulate";
import { buckets, gameData, weaponById } from "../src/ui/data";

const run = (fields: Partial<Build>, weapon: Weapon): SimulationResult => {
  const build: Build = {
    weaponId: weapon.id,
    guardianClass: "titan",
    subclass: "arc",
    catalyst: false,
    selections: [],
    effectWindows: {},
    damagePhaseSeconds: 30,
    ...fields,
  };
  const { artifactId } = fitArtifact(gameData.artifacts, build.artifactId, build.selections);
  if (artifactId) build.artifactId = artifactId;
  const { selected, options } = buildSimulation(build, gameData);
  return simulate(weapon, build.damagePhaseSeconds, selected, buckets, options);
};
const hits = (r: SimulationResult, id: string) =>
  r.damageInstances.filter((d) => d.id === id).sort((a, b) => a.timeMs - b.timeMs);

describe("W6a: five primaries from Quantum rows", () => {
  it("are items now, not packages", () => {
    for (const id of ["cerberus-1", "skyburner-s-oath", "suros-regime", "sweet-business", "touch-of-malice"]) {
      expect(weaponById(id).id, id).toBe(id);
    }
  });

  it("Touch of Malice: the refunded last round is never reloaded (30 s at 260 RPM)", () => {
    const r = run({}, weaponById("touch-of-malice"));
    expect(r.reloadsMs).toEqual([]);
    expect(hits(r, "shot").length).toBeGreaterThan(125);
  });

  it("Touch of Malice catalyst: Precision Instrument grows 4.17 % per hit up to 25 % at 6 stacks", () => {
    const plain = hits(run({}, weaponById("touch-of-malice")), "shot");
    const cat = hits(run({ catalyst: true }, weaponById("touch-of-malice")), "shot");
    expect(cat[0].damage / plain[0].damage).toBeCloseTo(1, 3);
    expect(cat[1].damage / plain[1].damage).toBeCloseTo(1 + 0.25 / 6, 3);
    // the damage is rounded per shot: 1.252 for the 142 of Quantum's row
    expect(cat[6].damage / plain[6].damage).toBeCloseTo(1.25, 2);
    expect(cat[60].damage / plain[60].damage).toBeCloseTo(1.25, 2);
  });

  it("SUROS Regime: the bottom half of the magazine deals 7.5 % more (34 rounds, from the 18th), the reload resets it", () => {
    const shots = hits(run({ damagePhaseSeconds: 60 }, weaponById("suros-regime")), "shot");
    expect(shots[16].damage / shots[0].damage).toBeCloseTo(1, 3);
    expect(shots[17].damage / shots[0].damage).toBeCloseTo(1.075, 3);
    expect(shots[33].damage / shots[0].damage).toBeCloseTo(1.075, 3);
    expect(shots[34].damage / shots[0].damage).toBeCloseTo(1, 3);
    expect(shots[34 + 17].damage / shots[0].damage).toBeCloseTo(1.075, 3);
  });

  it("Sweet Business: an explosive round with every 8th shot", () => {
    const r = run({}, weaponById("sweet-business"));
    const shots = hits(r, "shot").length;
    expect(hits(r, "explosive").length).toBe(Math.floor(shots / 8));
    // 56 of the explosive round on Quantum's scale: 20 / 41 x 56 = 27.3 against 30 of a precision hit
    const explosive = hits(r, "explosive")[0];
    expect(explosive.damage).toBeGreaterThan(0);
  });

  it("Skyburner's Oath: the catalyst adds Scorch on every second direct hit, so it deals more", () => {
    const plain = run({}, weaponById("skyburner-s-oath"));
    const cat = run({ catalyst: true }, weaponById("skyburner-s-oath"));
    expect(hits(cat, "shot").length).toBe(hits(plain, "shot").length);
    expect(cat.totalDamage).toBeGreaterThan(plain.totalDamage);
    // the hip-fired shot scorches already without the catalyst: more than the shots alone
    const shotsOnly = hits(plain, "shot").reduce((sum, d) => sum + d.damage, 0);
    expect(plain.totalDamage).toBeGreaterThan(shotsOnly);
  });

  it("Cerberus+1: 31 rounds at 360 RPM, then a reload of 1.12 s (Quantum row far range)", () => {
    const r = run({}, weaponById("cerberus-1"));
    const shots = hits(r, "shot");
    expect(shots[31].timeMs - shots[30].timeMs).toBeGreaterThan(1000);
    expect(shots[1].timeMs - shots[0].timeMs).toBeCloseTo(60000 / 360, -1);
  });
});
