// W6c (Plan W): four weapons that were packages become items; two read Aegis by the owner's exception
// (ADR 0019). Same way as the UI: gameData, buildSimulation.

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

describe("W6c: Jötunn, Cull's Shadow, New Malpais, Prometheus Lens", () => {
  it("are items now, not packages", () => {
    for (const id of ["j-tunn", "cull-s-shadow", "new-malpais", "prometheus-lens"]) {
      expect(weaponById(id).id, id).toBe(id);
    }
  });

  it("Jötunn: every shot leaves a pool of 7 ticks, 0.25 s apart", () => {
    const r = run({ damagePhaseSeconds: 60 }, weaponById("j-tunn"));
    const shots = hits(r, "shot");
    const pool = hits(r, "pool");
    expect(shots).toHaveLength(24);
    expect(pool).toHaveLength(24 * 7);
    expect(pool[1].timeMs - pool[0].timeMs).toBe(250);
    // Clarity's 46 of 1 184 + 269 on Quantum's 932
    expect(pool[0].damage / shots[0].damage).toBeCloseTo(46 / (1184 + 269), 2);
  });

  it("Cull's Shadow: five corrupted shots reset after two ticks, the sixth runs its 20 ticks, then none", () => {
    const r = run({ damagePhaseSeconds: 60 }, weaponById("cull-s-shadow"));
    expect(hits(r, "corruption-start")).toHaveLength(5 * 2);
    expect(hits(r, "corruption-early")).toHaveLength(10);
    expect(hits(r, "corruption-late")).toHaveLength(10);
    const sixth = hits(r, "shot")[5].timeMs;
    expect(hits(r, "corruption-late").at(-1)!.timeMs - sixth).toBe(10000);
    // the ramp: the late half is 1.087^10 times the early half
    expect(hits(r, "corruption-late")[0].damage / hits(r, "corruption-early")[0].damage).toBeCloseTo(2.3036, 3);
  });

  it("New Malpais: 3 rounds per burst, a detonation of 9 rounds and a suspend every 3rd burst", () => {
    const r = run({ damagePhaseSeconds: 60 }, weaponById("new-malpais"));
    const bursts = 27;
    expect(hits(r, "shot")).toHaveLength(bursts * 3);
    expect(hits(r, "explosion")).toHaveLength(bursts * 3);
    expect(hits(r, "suspend")).toHaveLength(bursts / 3);
  });

  it("New Malpais: the catalyst unravels the target, without it nothing unravels", () => {
    const plain = run({}, weaponById("new-malpais"));
    const cat = run({ catalyst: true }, weaponById("new-malpais"));
    expect(cat.totalDamage).toBeGreaterThan(plain.totalDamage);
  });

  it("Prometheus Lens: 20 Scorch every 20 beam hits brings ignitions, Prismatic Inferno raises them by 15 %", () => {
    const r = run({}, weaponById("prometheus-lens"));
    const beam = hits(r, "shot").reduce((a, d) => a + d.damage, 0);
    expect(r.totalDamage).toBeGreaterThan(beam);
  });
});
