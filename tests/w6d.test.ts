// W6d (Plan W): Fafnir and Turncoat become items, both by the owner's exception on Aegis (ADR 0019).
// Same way as the UI: gameData, buildSimulation.

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

describe("W6d: Fafnir, Turncoat", () => {
  it("are items now, not packages", () => {
    for (const id of ["fafnir", "turncoat"]) expect(weaponById(id).id, id).toBe(id);
  });

  it("Fafnir: Quantum Nova at the start, 9 shots, three lacerations each 0.75 s later", () => {
    const r = run({}, weaponById("fafnir"));
    const shots = hits(r, "shot");
    const lacerations = hits(r, "laceration");
    expect(hits(r, "nova")).toHaveLength(1);
    expect(shots).toHaveLength(9);
    expect(lacerations).toHaveLength(27);
    expect(lacerations[0].timeMs - shots[0].timeMs).toBe(750);
  });

  it("Fafnir: every hit under Quantum Nova carries the Strong Weaken (30 %)", () => {
    const r = run({}, weaponById("fafnir"));
    for (const d of [...hits(r, "shot"), ...hits(r, "laceration")]) {
      expect(d.factors.debuff).toBeCloseTo(1.3, 5);
    }
  });

  it("Turncoat: every third shot carries an Explosive Payload", () => {
    const r = run({ damagePhaseSeconds: 4 }, weaponById("turncoat"));
    const shots = hits(r, "shot");
    const payloads = hits(r, "payload");
    expect(shots.length).toBeGreaterThanOrEqual(9);
    expect(payloads.map((p) => shots.findIndex((s) => s.timeMs === p.timeMs) + 1).slice(0, 3)).toEqual([3, 6, 9]);
  });

  it("Turncoat: full Latent Power after 10 precision hits brings 13 s of Unleashed Power at 225 rpm, with Weaken", () => {
    const r = run({ damagePhaseSeconds: 30 }, weaponById("turncoat"));
    const shots = hits(r, "shot");
    const unleashed = hits(r, "unleashed-payload");
    expect(unleashed.length).toBeGreaterThan(0);
    // the 10th shot fills the bar, the shots after it run in the mode
    expect(unleashed[0].timeMs).toBe(shots[10].timeMs);
    expect(shots[12].timeMs - shots[11].timeMs).toBeCloseTo(60000 / 225, -1);
    expect(shots[11].factors.debuff).toBeCloseTo(1.15, 5);
    expect(shots[0].factors.debuff ?? 1).toBe(1);
  });

  it("Turncoat: with Latent Power built before the phase, the first shot already runs in the mode", () => {
    const r = run({ weaponPreBuilt: true }, weaponById("turncoat"));
    expect(hits(r, "unleashed-payload")[0].timeMs).toBe(hits(r, "shot")[0].timeMs);
  });
});
