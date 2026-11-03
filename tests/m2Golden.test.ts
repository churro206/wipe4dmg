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
    expect(strike.damage).toBeCloseTo(973);
    expect(storm.damage).toBeCloseTo(584);
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
