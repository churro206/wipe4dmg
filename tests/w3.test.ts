// W3 (Plan W): conditional perks of 8 exotics, values by hand from the Clarity quotes (M-Gate: one golden
// weapon per template). Same way as the UI: gameData, buildSimulation.

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

describe("W3: conditional buffs and reload", () => {
  it("Ace of Spades, pre-stacked: the first 6 shots deal 1.68 times (Memento Mori 68 %), the 7th is plain", () => {
    const plain = hits(run({}, weaponById("ace-of-spades")), "shot");
    const pre = hits(run({ playstyle: "pre-stacked" }, weaponById("ace-of-spades")), "shot");
    for (let i = 0; i < 6; i++) expect(pre[i].damage / plain[i].damage, `shot ${i + 1}`).toBeCloseTo(1.68, 3);
    expect(pre[6].damage / plain[6].damage).toBeCloseTo(1, 3);
  });

  it("Xenophage catalyst, pre-stacked: the Rampage stacks run out one at a time (33.1, 21, 10 %, 4.5 s each)", () => {
    const plain = hits(run({ catalyst: true }, weaponById("xenophage")), "shot");
    const pre = hits(run({ catalyst: true, playstyle: "pre-stacked" }, weaponById("xenophage")), "shot");
    const ratioAt = (ms: number) => {
      const i = plain.findIndex((s) => s.timeMs >= ms);
      return pre[i].damage / plain[i].damage;
    };
    expect(ratioAt(0)).toBeCloseTo(1.331, 3);
    expect(ratioAt(5000)).toBeCloseTo(1.21, 3);
    expect(ratioAt(9500)).toBeCloseTo(1.1, 3);
    expect(ratioAt(14000)).toBeCloseTo(1, 3);
  });

  it("Monte Carlo, pre-stacked: 5 stacks of Markov Chain deal 1.65 times for 4.5 s, then nothing", () => {
    const plain = hits(run({}, weaponById("monte-carlo")), "shot");
    const pre = hits(run({ playstyle: "pre-stacked" }, weaponById("monte-carlo")), "shot");
    expect(pre[0].damage / plain[0].damage).toBeCloseTo(1.65, 3);
    const late = plain.findIndex((s) => s.timeMs >= 5000);
    expect(pre[late].damage / plain[late].damage).toBeCloseTo(1, 3);
  });

  it("The Chaperone: Roadborn after two precision hits, damage 1.22 times and rate 1.42 times", () => {
    const plain = hits(run({}, weaponById("the-chaperone")), "shot");
    const shots = hits(run({ damagePhaseSeconds: 30 }, weaponById("the-chaperone")), "shot");
    expect(shots[0].damage).toBe(plain[0].damage);
    expect(shots[1].damage / shots[0].damage).toBeCloseTo(1, 3);
    expect(shots[2].damage / shots[0].damage).toBeCloseTo(1.22, 3);
    const base = shots[1].timeMs - shots[0].timeMs;
    const fast = shots[3].timeMs - shots[2].timeMs;
    expect(base / fast).toBeCloseTo(1.42, 2);
  });

  it("The Chaperone catalyst: every 3rd precision hit gives a round back, so the 7th shot is fired earlier", () => {
    const without = hits(run({ damagePhaseSeconds: 60 }, weaponById("the-chaperone")), "shot");
    const withCat = hits(run({ catalyst: true, damagePhaseSeconds: 60 }, weaponById("the-chaperone")), "shot");
    expect(withCat.length).toBe(without.length);
    // the 7th shot comes without the reload after 6 rounds (the 3rd and the 6th hit gave a round each)
    expect(withCat[6].timeMs).toBeLessThan(without[6].timeMs);
  });

  it("Izanagi's Burden: Honed Edge x4 turns 20 rounds into 5 shots, each after the held reload (3.2 s)", () => {
    const plain = run({ damagePhaseSeconds: 60 }, weaponById("izanagi-s-burden"));
    const honed = run(
      { playstyle: "honed-edge-x4", damagePhaseSeconds: 60 },
      weaponById("izanagi-s-burden"),
    );
    expect(hits(plain, "shot").length).toBe(20);
    const shots = hits(honed, "honed-shot");
    expect(shots.length).toBe(5);
    // interval of the weapon's rate plus the held reload of 3 200 ms
    const rpm = plain.shots[1].timeMs - plain.shots[0].timeMs;
    expect(shots[1].timeMs - shots[0].timeMs).toBeCloseTo(rpm + 3200, 0);
    // a precision shot of ~2 500 against 659 of the plain shot (+291 % critical damage)
    expect(shots[0].damage / hits(plain, "shot")[0].damage).toBeCloseTo(
      (2982 * (1 + 2.91)) / (1 + 3.7) / 659,
      1,
    );
  });

  it("Izanagi's Burden catalyst: the honed shot deals 20 % more (Quantum row 2 982)", () => {
    const honed = { playstyle: "honed-edge-x4", damagePhaseSeconds: 60 };
    const without = hits(run(honed, weaponById("izanagi-s-burden")), "honed-shot");
    const catalystRun = run({ ...honed, catalyst: true }, weaponById("izanagi-s-burden"));
    const withCat = hits(catalystRun, "honed-shot-catalyst");
    expect(withCat[0].damage / without[0].damage).toBeCloseTo((1 + 3.7) / (1 + 2.91), 3);
    // the check against Quantum (row "cata, 4x Honed Edge"): 5 shots, total damage 14 910
    expect(catalystRun.totalDamage).toBeCloseTo(14910, 0);
  });

  it("The Last Word: with 4 stacks of Fan Fire the reload takes 0.8 / 0.9 times as long (the stored reload already holds 0.9)", () => {
    const shots = hits(run({ damagePhaseSeconds: 30 }, weaponById("the-last-word")), "shot");
    const interval = shots[1].timeMs - shots[0].timeMs;
    const gap = shots[8].timeMs - shots[7].timeMs - interval;
    // Quantum reload 1 640 ms
    expect(gap / 1640).toBeCloseTo(0.8 / 0.9, 2);
  });
});
