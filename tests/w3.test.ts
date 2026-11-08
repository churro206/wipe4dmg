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

  it("Still Hunt, Cayde's Retribution: 6 shots charge, then 3 Golden Gun shots of 2, 2.9 and 3.8 times (20 shots: 14 plain + 6 golden)", () => {
    // the first playstyle is the optimal one (Cayde's Retribution); the plain shot is the second
    const plain = run({ playstyle: "plain", damagePhaseSeconds: 60 }, weaponById("still-hunt"));
    const golden = run({ damagePhaseSeconds: 60 }, weaponById("still-hunt"));
    const base = hits(plain, "shot")[0].damage;
    expect(hits(plain, "shot").length).toBe(20);
    const shots = hits(golden, "shot");
    const gold = hits(golden, "golden-shot");
    expect(shots.length).toBe(14);
    expect(gold.length).toBe(6);
    // order of the cycle: 6 plain, golden x3, 6 plain, golden x3, 2 plain
    const all = [...shots, ...gold].sort((a, b) => a.timeMs - b.timeMs);
    expect(all.slice(0, 9).map((s) => s.id)).toEqual([...Array(6).fill("shot"), ...Array(3).fill("golden-shot")]);
    expect(gold.slice(0, 3).map((g) => g.damage / base)).toEqual([2, 2 * 1.45, 2 * 1.9].map((x) => expect.closeTo(x, 3)));
    // the check against the Quantum total (20 940): -1.2 %
    expect(golden.totalDamage / 20940 - 1).toBeGreaterThan(-0.02);
    expect(golden.totalDamage / 20940 - 1).toBeLessThan(0.02);
  });

  it("Third Iteration: an Amalgamation Round marks the boss, then 15 marked spread shots, reload and charge (Aegis cycle 9.05 s)", () => {
    const r = run({ damagePhaseSeconds: 30 }, weaponById("third-iteration"));
    const rounds = hits(r, "amalgamation-round");
    const marked = hits(r, "spread-shot-marked");
    expect(hits(r, "spread-shot").length).toBe(0);
    // Quantum: Amalgamation Round 570, spread shot on a marked target 220
    expect(rounds[0].damage).toBe(570);
    expect(marked[0].damage).toBe(220);
    // one magazine: the round first, then 15 spread shots at 200 rpm, all inside the 5 s mark
    const firstCycle = [...rounds, ...marked].sort((a, b) => a.timeMs - b.timeMs).slice(0, 17);
    expect(firstCycle.map((h) => h.id)).toEqual([
      "amalgamation-round",
      ...Array(15).fill("spread-shot-marked"),
      "amalgamation-round",
    ]);
    expect(marked[14].timeMs - rounds[0].timeMs).toBeCloseTo(15 * 300, 0);
    // the next round after the reload (3 410 ms) and the charge (the round's rate of 52 rpm)
    const cycleMs = rounds[1].timeMs - rounds[0].timeMs;
    expect(cycleMs).toBeCloseTo(15 * 300 + 60000 / 52 + 3410, 0);
    // check against Aegis ("Amalgamation Round into 15 marked shots": 3 861 every 9.05 s)
    expect(cycleMs / 9050 - 1).toBeLessThan(0.02);
    expect((570 + 15 * 220) / 3861 - 1).toBeLessThan(0.02);
  });

  it("Anarchy: a grenade is 20 trap ticks every 0.5 s (Quantum 'double-stick' 2 912 per grenade), the catalyst adds Jolt (Aegis x1.157)", () => {
    const base = run({ damagePhaseSeconds: 60 }, weaponById("anarchy"));
    const ticks = hits(base, "trap-tick");
    expect(ticks.length % 20).toBe(0);
    expect(ticks[1].timeMs - ticks[0].timeMs).toBe(500);
    expect(ticks[0].damage * 20).toBeCloseTo(84458 / 29, 1);
    // Quantum's time to empty (150 s): 29 grenades, 84 458; the ticks of the last two are cut by the window
    const whole = run({ damagePhaseSeconds: 150 }, weaponById("anarchy"));
    expect(whole.totalDamage / 84458 - 1).toBeGreaterThan(-0.06);
    expect(whole.totalDamage / 84458 - 1).toBeLessThan(0);
    // check against Aegis ("average per trap, double stick, Jolting Feedback" 3 368.5 against Quantum 2 912.3)
    const cata = run({ damagePhaseSeconds: 60, catalyst: true }, weaponById("anarchy"));
    expect(cata.totalDamage / base.totalDamage / 1.157 - 1).toBeGreaterThan(-0.02);
    expect(cata.totalDamage / base.totalDamage / 1.157 - 1).toBeLessThan(0.02);
  });

  it("The Last Word: with 4 stacks of Fan Fire the reload takes 0.8 / 0.9 times as long (the stored reload already holds 0.9)", () => {
    const shots = hits(run({ damagePhaseSeconds: 30 }, weaponById("the-last-word")), "shot");
    const interval = shots[1].timeMs - shots[0].timeMs;
    const gap = shots[8].timeMs - shots[7].timeMs - interval;
    // Quantum reload 1 640 ms
    expect(gap / 1640).toBeCloseTo(0.8 / 0.9, 2);
  });
});
