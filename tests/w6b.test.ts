// W6b (Plan W): five weapons with a gap in the sources as hand items. Same way as the UI: gameData,
// buildSimulation.

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

describe("W6b: five weapons with a gap", () => {
  it("are items now, not packages", () => {
    for (const id of ["new-land-beyond", "wavesplitter", "no-time-to-explain", "finality-s-auger", "ice-breaker"]) {
      expect(weaponById(id).id, id).toBe(id);
    }
  });

  it("Ice Breaker: 10 shots of 1 224 at 49 RPM, no reload, then nothing", () => {
    const r = run({ damagePhaseSeconds: 60 }, weaponById("ice-breaker"));
    const shots = hits(r, "shot");
    expect(shots).toHaveLength(10);
    expect(r.reloadsMs).toEqual([]);
    expect(shots[1].timeMs - shots[0].timeMs).toBeCloseTo(60000 / 49, -1);
  });

  it("Finality's Auger: 21 rounds in magazines of 6, a reload after each", () => {
    const r = run({ damagePhaseSeconds: 60 }, weaponById("finality-s-auger"));
    expect(hits(r, "shot")).toHaveLength(21);
    expect(r.reloadsMs).toHaveLength(3);
  });

  it("No Time to Explain: never reloaded, the portal fires from the 10th shot on, faster with the catalyst", () => {
    const plain = run({}, weaponById("no-time-to-explain"));
    const cat = run({ catalyst: true }, weaponById("no-time-to-explain"));
    expect(plain.reloadsMs).toEqual([]);
    const shots = hits(plain, "shot").length;
    // ten precision hits build the stacks, the portal shares start with the next shot
    expect(hits(plain, "portal")).toHaveLength(shots - 10);
    expect(hits(plain, "portal")[0].timeMs).toBe(hits(plain, "shot")[10].timeMs);
    expect(hits(cat, "portal")).toHaveLength(0);
    expect(hits(cat, "portal-catalyst").length).toBe(shots - 10);
    // 1.25 s against 0.85 s per burst: the portal share grows by 1.25 / 0.85
    const share = (r: SimulationResult, id: string) => hits(r, id)[0].damage;
    expect(share(cat, "portal-catalyst") / share(plain, "portal")).toBeCloseTo(1.25 / 0.85, 2);
  });

  it("New Land Beyond: the catalyst refills the magazine on every shot, so it is never reloaded", () => {
    const plain = run({}, weaponById("new-land-beyond"));
    const cat = run({ catalyst: true }, weaponById("new-land-beyond"));
    expect(plain.reloadsMs.length).toBeGreaterThan(0);
    expect(cat.reloadsMs).toEqual([]);
    expect(hits(cat, "shot").length).toBeGreaterThan(hits(plain, "shot").length);
  });

  it("Wavesplitter: one shot of Quantum's average row per round, 100 rounds before the reload", () => {
    const r = run({ damagePhaseSeconds: 60 }, weaponById("wavesplitter"));
    const shots = hits(r, "shot");
    expect(shots.length).toBeGreaterThan(100);
    expect(shots[100].timeMs - shots[99].timeMs).toBeGreaterThan(1000);
  });
});
