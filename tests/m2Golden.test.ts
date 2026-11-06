// Golden weapons of the rule templates N-th hit and extra part (ADR 0019, block M2). The values come
// from the Clarity texts and Quantum's rows by hand, not from the files: red without the item rules.

import { describe, expect, it } from "vitest";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { loadKeywords, loadStatusModifiers } from "../src/engine/loadKeywords";
import { simulate } from "../src/engine/simulate";
import { weaponById } from "./support/weapons";

const buckets = loadBuckets(rawBuckets);
const keywords = loadKeywords(rawKeywords, AegisAbilityRow.array().parse(rawAbilityRows));
const statusModifiers = loadStatusModifiers(rawKeywords);

const run = (id: string, seconds: number, catalyst = false, assumptions: string[] = []) =>
  simulate(weaponById(id), seconds, [], buckets, { keywords, statusModifiers, catalyst, assumptions });
const only = (result: ReturnType<typeof run>, id: string) =>
  result.damageInstances.filter((d) => d.id === id);

describe("N-th shot: Khvostov 7G-0X (Clarity: every 7th shot deals 252.52 % increased damage)", () => {
  it("the 7th, 14th ... shot of a magazine brings 252.52 % of the shot on top, 6 in a magazine of 43", () => {
    const result = run("khvostov-7g-0x", 6);
    const shots = only(result, "shot");
    const sevenths = only(result, "seventh");
    expect(sevenths.length).toBeGreaterThanOrEqual(6);
    sevenths.forEach((d) => expect(d.damage / shots[0].damage).toBeCloseTo(2.5252, 3));
    expect(sevenths[0].timeMs).toBe(shots[6].timeMs);
    expect(sevenths[1].timeMs).toBe(shots[13].timeMs);
    // Quantum's magazine of 43: 43 x 28 + 6 x 28 x 2.5252 = 1627.8
    const magazine = [...shots.slice(0, 43), ...sevenths.slice(0, 6)];
    expect(magazine.reduce((s, d) => s + d.damage, 0) / shots[0].damage).toBeCloseTo(1627.8 / 28, 1);
  });
});

describe("N-th shot restarts with the reload: Khvostov 7G-0X (the reload resets the count)", () => {
  it("the first 7th shot of the second magazine is its own 7th, not the 8th of the count", () => {
    const result = run("khvostov-7g-0x", 12);
    const shots = only(result, "shot");
    const sevenths = only(result, "seventh");
    expect(sevenths[6].timeMs).toBe(shots[43 + 6].timeMs);
  });
});

describe("N-th hit with extra parts: Malfeasance (Compendium: embedding 5 slugs makes them explode)", () => {
  it("the 5th hit sets off 5 slugs of Quantum's 71 each", () => {
    const result = run("malfeasance", 3);
    const slugs = only(result, "slug");
    expect(slugs.slice(0, 5).map((d) => d.timeMs)).toEqual(Array(5).fill(only(result, "shot")[4].timeMs));
    slugs.forEach((d) => expect(d.damage).toBeCloseTo(71, 0));
  });
  it("the catalyst brings Quantum's row cata: shot 103, slug 85.4", () => {
    const result = run("malfeasance", 3, true);
    expect(only(result, "shot-cata")[0].damage).toBeCloseTo(103, 0);
    expect(only(result, "slug-cata")[0].damage).toBeCloseTo(85.4, 1);
    expect(only(result, "shot")).toHaveLength(0);
  });
});

describe("N-th hit with delayed parts: Cloudstrike (Clarity: 3 Precision Hits, strike after 1.1 s, storm 0.5 s later)", () => {
  it("the 3rd shot calls a strike of 973 at +1100 ms and a storm of 584 at +1600 ms", () => {
    const result = run("cloudstrike", 6);
    const third = only(result, "shot")[2];
    const strike = only(result, "strike")[0];
    const storm = only(result, "storm")[0];
    expect(strike.timeMs - third.timeMs).toBe(1100);
    expect(storm.timeMs - third.timeMs).toBeCloseTo(1600, 3);
    // Quantum: (7084 - 10 x 450) - (5088 - 7 x 450) = 646 per series, split 973 : 584
    expect(strike.damage).toBeCloseTo((646 * 973) / (973 + 584), 1);
    expect(storm.damage).toBeCloseTo((646 * 584) / (973 + 584), 1);
    expect(strike.damage + storm.damage).toBeCloseTo(646, 1);
    expect(only(result, "strike").every((d) => d.timeMs >= only(result, "shot")[2].timeMs)).toBe(true);
  });
});

describe("Extra part from two Quantum rows: Grand Overture (rows with and without rockets)", () => {
  it("a slug of 566 and a missile of 494 per hit", () => {
    const result = run("grand-overture", 8);
    only(result, "shot").slice(0, 3).forEach((d) => expect(d.damage).toBeCloseTo(566, 0));
    // (21200 - 11320) / 20
    only(result, "missile").slice(0, 3).forEach((d) => expect(d.damage).toBeCloseTo(494, 0));
    expect(only(result, "missile").length).toBeGreaterThan(0);
  });
});

describe("Ex Diris: Enrage after 4 Direct Hits, Hive Moth every 2 Direct Hits with a cooldown of 3 s", () => {
  it("the shots come faster after the 4th hit (Quantum's rows no enrage / max enrage)", () => {
    const shots = only(run("ex-diris", 12), "shot");
    const early = shots[1].timeMs - shots[0].timeMs;
    const late = shots[8].timeMs - shots[7].timeMs;
    expect(late).toBeLessThan(early);
    expect(early / late).toBeCloseTo(95 / 60, 1);
  });
  it("a moth of 525 follows the 2nd hit, the next one not within 3000 ms", () => {
    const moths = only(run("ex-diris", 12), "moth");
    expect(moths[0].damage).toBeCloseTo(525);
    expect(moths[1].timeMs - moths[0].timeMs).toBeGreaterThanOrEqual(3000);
  });
});

describe("Alethonym: impale (Compendium: 79 every 0.8 s up to 6 times, explosion of 697 on the sixth tick)", () => {
  it("an impact of Quantum's 102, six ticks of 79 at 800 ms and the explosion of 697 with the sixth tick", () => {
    const result = run("alethonym", 6);
    const shot = only(result, "shot")[0];
    // impales stack without limit: the ticks of later shots overlap, the first six belong to the first shot
    const ticks = only(result, "impale")
      .map((d) => d)
      .filter((d) => d.timeMs <= shot.timeMs + 4000 && d.timeMs % 800 === shot.timeMs % 800)
      .slice(0, 6);
    expect(shot.damage).toBeCloseTo(102);
    expect(ticks).toHaveLength(6);
    ticks.forEach((d) => expect(d.damage).toBeCloseTo(79));
    expect(ticks[5].timeMs - ticks[0].timeMs).toBe(4000);
    const explosion = only(result, "explosion")[0];
    expect(explosion.damage).toBeCloseTo(697);
    expect(explosion.timeMs).toBe(ticks[5].timeMs);
  });
});

describe("Euphony: a shot is a burst of 3 hits (Compendium), Unwound spawns 3 Threadlings per 6 hits, each Threadling hit is a Spindle stack (+2 % damage)", () => {
  it("every 2nd shot brings 3 Threadlings of Aegis' measured tick (976 / 3.31: Quantum's owner has no Euphony)", () => {
    const result = run("euphony", 8);
    const threadlings = only(result, "threadling");
    const shots = only(result, "shot");
    expect(threadlings.slice(0, 3).map((d) => d.timeMs)).toEqual(Array(3).fill(shots[1].timeMs));
    expect(threadlings.slice(3, 6).map((d) => d.timeMs)).toEqual(Array(3).fill(shots[3].timeMs));
    // the first set has no Spindle yet; the later ones carry it
    threadlings.slice(0, 3).forEach((d) => expect(d.damage).toBeCloseTo(976 / 3.31, 0));
  });
  it("the burst is Aegis' measured value (4356 in the game at Full Modifiers 3.31), not Quantum's 1140", () => {
    expect(only(run("euphony", 2), "shot")[0].damage).toBeCloseTo(1317.5, 0);
  });
  it("Spindle: three stacks after the first set raise the next shot by 3 x 2 %", () => {
    const shots = only(run("euphony", 12), "shot");
    expect(shots[2].damage / shots[0].damage).toBeCloseTo(1.06, 3);
    expect(shots[4].damage / shots[0].damage).toBeCloseTo(1.12, 3);
  });
});

describe("Quicksilver Storm: Missile Tracers every 13 hits (the Grenades Prepped grenade is not modelled)", () => {
  it("the 13th hit loads a missile of Quantum's difference ((1560 - 51 x 24) / 3 = 112)", () => {
    const result = run("quicksilver-storm", 4);
    const missiles = only(result, "missile");
    expect(missiles[0].damage).toBeCloseTo(112, 0);
    expect(missiles[0].timeMs).toBe(only(result, "shot")[12].timeMs);
    expect(missiles[1].timeMs).toBe(only(result, "shot")[25].timeMs);
  });
});

describe("Vex Mythoclast: Temporal Unlimiter, 6 Overcharge stacks built up before (pre-stacked)", () => {
  it("three linear shots of 1475 x Quantum's scale at the start, none without", () => {
    expect(only(run("vex-mythoclast", 3), "linear")).toHaveLength(0);
    const linear = only(run("vex-mythoclast", 3, false, ["pre-stacked"]), "linear");
    expect(linear).toHaveLength(3);
    expect(linear[0].damage).toBeCloseTo((1475 * 113) / (66 * 1.8), 0);
  });
});

describe("Vex Mythoclast: catalyst Calculated Balance (Clarity: landing 15 hits within 3 seconds of each grants 20 % increased damage for 5 seconds)", () => {
  it("the shots after the 15th carry +20 % for 5 s, renewed by every further 15 hits; without the catalyst nothing", () => {
    const shots = only(run("vex-mythoclast", 10, true), "shot");
    const plain = only(run("vex-mythoclast", 10), "shot");
    expect(shots[14].damage / plain[14].damage).toBeCloseTo(1, 3);
    expect(shots[15].damage / plain[15].damage).toBeCloseTo(1.2, 3);
    // 15 hits take 2.25 s at the pace of 150 ms, the buff of 5 s is renewed before it ends
    expect(shots[40].damage / plain[40].damage).toBeCloseTo(1.2, 3);
  });
});

describe("Vex Mythoclast: Timeless Mythoclast (Clarity: emptying refills 80 % of the hits (rounded up), at least 9 hits)", () => {
  it("the magazine of 25 gets 20, then 16, 13, 11, 9, 8 without a reload; 8 hits are too few: the reload follows", () => {
    const shots = only(run("vex-mythoclast", 20), "shot");
    const gap = (i: number) => shots[i + 1].timeMs - shots[i].timeMs;
    // 25 + 20 + 16 + 13 + 11 + 9 + 8 = 102 shots in a chain
    const chain = [25, 20, 16, 13, 11, 9, 8];
    let end = -1;
    chain.forEach((n, k) => {
      end += n;
      if (k < chain.length - 1) expect(gap(end)).toBe(150);
    });
    expect(end).toBe(101);
    expect(gap(101)).toBeGreaterThanOrEqual(150 + 1120);
  });
  it("the refill also comes when the reload pushes the next shot out of the phase: 67 shots in 10 s, 193 in 30 s", () => {
    expect(only(run("vex-mythoclast", 10), "shot")).toHaveLength(67);
    expect(only(run("vex-mythoclast", 30), "shot")).toHaveLength(193);
  });
});

// Outbreak Perfected. By hand from the texts: Clarity "Scoring 12 Hits ... spawns 2 to 3 SIVA Nanites"
// (mean 2.5), "Nanites deal 77"; Compendium "x1 = 30%" ... "x5 = 150%", then 2.1 % per nanite up to 300 %.
describe("Outbreak Perfected: The Corruption Spreads (Clarity: 12 hits spawn 2 to 3 nanites of 77, 9 seconds)", () => {
  it("every 12th shot brings 2.5 nanites of 77 on top", () => {
    const result = run("outbreak-perfected", 4);
    const nanites = only(result, "nanite");
    expect(nanites.length).toBeGreaterThanOrEqual(2);
    expect(nanites[0].timeMs).toBe(only(result, "shot")[11].timeMs);
    expect(nanites[0].damage).toBeCloseTo(2.5 * 77, 0);
  });
  it("Compendium: +30 % per nanite up to 5, then +2.1 % per nanite; the shots after the 12th, 24th, 36th hit carry it", () => {
    const shots = only(run("outbreak-perfected", 8), "shot");
    expect(shots[11].damage / shots[0].damage).toBeCloseTo(1, 3);
    expect(shots[12].damage / shots[0].damage).toBeCloseTo(1 + 0.3 * 2.5, 3);
    expect(shots[24].damage / shots[0].damage).toBeCloseTo(1 + 0.3 * 5, 3);
    expect(shots[36].damage / shots[0].damage).toBeCloseTo(1 + 0.3 * 5 + 0.021 * 2.5, 3);
  });
  it("up to +300 % (x100): the multiplier never passes 4", () => {
    const shots = only(run("outbreak-perfected", 60), "shot");
    expect(Math.max(...shots.map((d) => d.damage)) / shots[0].damage).toBeCloseTo(4, 3);
  });
  it("the Nanites buff does not touch the nanite hit itself (Aegis: 132 nanite with and without)", () => {
    const nanites = only(run("outbreak-perfected", 30), "nanite");
    expect(nanites.length).toBeGreaterThan(3);
    nanites.forEach((d) => expect(d.damage).toBeCloseTo(nanites[0].damage, 6));
  });
  it("the catalyst raises the nanite damage by 25 %", () => {
    const plain = only(run("outbreak-perfected", 3), "nanite")[0].damage;
    const cata = only(run("outbreak-perfected", 3, true), "nanite")[0].damage;
    expect(cata / plain).toBeCloseTo(1.25, 3);
  });
});

describe("Outbreak Perfected: Rewind Rounds (Clarity: emptying refills 60 % of the hits (rounded up), at least 28.75 % of the magazine)", () => {
  it("the magazine of 36 gets 27 (36 shots + 3 x 2.5 nanite hits = 43.5 hits), then more without a reload; the chain ends with a reload", () => {
    const shots = only(run("outbreak-perfected", 30), "shot");
    const gaps = shots.slice(0, -1).map((d, i) => shots[i + 1].timeMs - d.timeMs);
    const reloads = gaps.flatMap((g, i) => (g > 1000 ? [i] : []));
    // the hit of the 36th shot is still in the queue when the reload starts (by hand: 36, 25, 14 = 75
    // shots, then a reload; 36, 27, 15 = 78 shots). The 1 second after a refill does not count (Clarity).
    expect(reloads.slice(0, 2)).toEqual([74, 74 + 78]);
    expect(gaps[35]).toBeLessThan(150);
    expect(gaps[35 + 25]).toBeLessThan(150);
  });
});

describe("Slayer's Fang: Nightsworn Sight, built up before (pre-stacked)", () => {
  it("the first shot deals 15 % more, later hits are weakened (+15 %) on top", () => {
    const stacked = only(run("slayer-s-fang", 6, false, ["pre-stacked"]), "shot");
    const plain = only(run("slayer-s-fang", 6), "shot");
    expect(stacked[0].damage / plain[0].damage).toBeCloseTo(1.15, 3);
    expect(stacked[1].damage / plain[1].damage).toBeCloseTo(1.15 * 1.15, 3);
  });
  it("without pre-stacked the buff and Weaken do not exist", () => {
    const plain = only(run("slayer-s-fang", 6), "shot");
    expect(plain[1].damage).toBeCloseTo(plain[0].damage);
  });
});
