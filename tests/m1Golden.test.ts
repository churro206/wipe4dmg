// Golden weapons of the rule templates DoT and Status (ADR 0019, block M1). The values come from
// the Clarity texts by hand, not from the files: red without the item rules.

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
const ignitions = (result: ReturnType<typeof run>) =>
  result.damageInstances.filter((d) => d.keywordId === "ignition" && d.id !== "burn");

describe("DoT template: Le Monarque (Poison Arrows)", () => {
  // Clarity: "Poison deals 70 [2.5] damage every 0.25 seconds for 1.35 seconds, totalling 420 [15]"
  it("every arrow poisons for 6 ticks of 70, one tick every 250 ms, 420 in all", () => {
    const result = run("le-monarque", 10);
    const [arrow] = only(result, "shot");
    const offsets = only(result, "poison").map((d) => d.timeMs - arrow.timeMs);
    // the next arrow comes 1200 ms later and brings its own ticks; the first arrow's six are all there
    [250, 500, 750, 1000, 1250, 1500].forEach((offset) => expect(offsets).toContain(offset));
    expect(offsets.filter((o) => o > 1500 && o < 1700)).toEqual([]);
    only(result, "poison").forEach((d) => expect(d.damage).toBeCloseTo(70));
    // the first 1450 ms hold only the ticks of the first arrow: 5 of its 6 (420 in all with the 6th)
    expect(only(result, "poison").filter((d) => d.timeMs - arrow.timeMs < 1450)).toHaveLength(5);
  });
});

describe("DoT template: Thorn (Corruption, Soul Devourer)", () => {
  // Clarity: "dealing 30 [0.4] damage every 0.5 seconds for 2 seconds" (4 ticks); Soul Devourer
  // "increases poison damage by 200%" for up to 11 seconds
  it("an early shot corrupts for 4 ticks of 90, a late one for 4 ticks of 30", () => {
    const result = run("thorn", 20, false, ["pre-stacked"]);
    const shots = only(result, "shot");
    const early = shots[0];
    const late = shots.find((s) => s.timeMs > 12000)!;
    const ticksOf = (shot: { timeMs: number }) =>
      only(result, "corruption").filter((d) => d.timeMs > shot.timeMs && d.timeMs <= shot.timeMs + 2000);
    // ticks of neighbouring shots overlap (a shot every 430 ms): the first one has only its own
    expect(ticksOf(early)[0].damage).toBeCloseTo(90);
    expect(ticksOf(late)[0].damage).toBeCloseTo(30);
    expect(only(result, "corruption").filter((d) => d.timeMs <= early.timeMs + 500)).toHaveLength(
      1,
    );
  });
});

describe("Status template: scorch and ignition", () => {
  // Compendium/Clarity: Two-Tailed Fox "applies 60 Scorch": the second burst reaches 120 stacks
  it("Two-Tailed Fox: no ignition after one burst, the first one with the second", () => {
    const result = run("two-tailed-fox", 10);
    const [first, second] = only(result, "shot");
    expect(ignitions(result).length).toBeGreaterThan(0);
    expect(ignitions(result)[0].timeMs).toBeGreaterThanOrEqual(second.timeMs);
    expect(ignitions(result).filter((d) => d.timeMs <= first.timeMs + 1)).toHaveLength(0);
  });

  // Clarity: "Landing 10 out of 12 pellets ... Ignites": the second shell (Solar) ignites
  it("Conditional Finality: the second shell of a magazine ignites, the first does not", () => {
    const result = run("conditional-finality", 3);
    const [first, second] = only(result, "shot");
    const times = ignitions(result).map((d) => d.timeMs);
    expect(times.length).toBeGreaterThan(0);
    expect(times.every((t) => t >= second.timeMs)).toBe(true);
    expect(times.filter((t) => t < second.timeMs)).toHaveLength(0);
    expect(first.timeMs).toBeLessThan(second.timeMs);
  });

  // Clarity: "Direct Hits apply Volatile": enough hits on the volatile target make it explode
  it("Fighting Lion: a direct hit applies Volatile, the next hits make it explode", () => {
    const result = run("fighting-lion", 20);
    expect(result.damageInstances.some((d) => d.keywordId === "volatile")).toBe(true);
  });
});

describe("Status template: Weaken of Deterministic Chaos", () => {
  // Clarity: "this gun actually only Weakens after 32 uninterrupted rounds" for 6 seconds; Weaken
  // raises the damage the target takes by 15 %
  it("the 33rd round hits 15 % harder than the 31st, the 32nd weakens", () => {
    const shots = only(run("deterministic-chaos", 10), "shot");
    expect(shots.length).toBeGreaterThan(34);
    expect(shots[32].damage / shots[30].damage).toBeCloseTo(1.15, 3);
    expect(shots[31].damage / shots[30].damage).toBeCloseTo(1, 3);
  });
});

describe("Thorn without the playstyle pre-stacked", () => {
  it("has no Soul Devourer: every tick is 30", () => {
    const result = run("thorn", 5);
    only(result, "corruption").forEach((d) => expect(d.damage).toBeCloseTo(30));
  });
});

describe("Reload stat of a catalyst (reference $reload, d2foundry formula)", () => {
  // Osteo Striga: reload stat 18 + 30 with the catalyst; submachine gun formula
  // 0.0000608642 s² - 0.0191345 s + 2.62769 -> 1.84947 / 2.30299 = 0.8031 of the reload time
  it("Osteo Striga's catalyst reloads in 0.803 of the time", () => {
    const base = weaponById("osteo-striga");
    const factor = base.catalyst!.timing!.reloadTimeMs.value! / base.reloadTimeMs.value!;
    expect(factor).toBeCloseTo(0.8031, 3);
  });
});

describe("Witherhoard: the catalyst brings Quantum's row \"cata, single blight, boss\"", () => {
  // 41180 / 20 = 2059 per blight, with the catalyst 50606 / 20 = 2530.3
  it("a shot deals 2059 without and 2530.3 with the catalyst", () => {
    expect(only(run("witherhoard", 30), "blight")[0].damage).toBeCloseTo(2059);
    expect(only(run("witherhoard", 30, true), "blight-cata")[0].damage).toBeCloseTo(2530.3);
  });
});

describe("Dragon's Breath: the cadence is the one of the 3-fuel row", () => {
  it("fires as often as the 3-fuel row does (39 s for 11 rockets), not like the 1-fuel row", () => {
    const shots = run("dragon-s-breath", 60).shots;
    expect(shots.length).toBeGreaterThanOrEqual(11);
    expect(shots[10].timeMs).toBeGreaterThan(30000);
  });
});

describe("Divinity: Penance bursts (Clarity: 1060, first after 3.75 s, then every 3 s)", () => {
  it("bursts of 1060 at 3750, 6750, 9750 ms", () => {
    const penance = only(run("divinity", 12), "penance");
    expect(penance.slice(0, 3).map((d) => d.timeMs)).toEqual([3750, 6750, 9750]);
    penance.forEach((d) => expect(d.damage).toBeCloseTo(1060));
  });
  it("the hit is Quantum's 15 with the cage's 30 % for Divinity", () => {
    expect(only(run("divinity", 2), "shot")[0].damage).toBeCloseTo(19.5);
  });
});

describe("Dragon's Breath: fuel from ignitions (Quantum's fuel rows)", () => {
  // Quantum: the rocket at 1 fuel 1399, at 3 fuel (refuelled by ignitions) 2404, impact 189
  it("the first rocket has 1 fuel, after an ignition the next one has 3", () => {
    const result = run("dragon-s-breath", 12);
    const embeds = result.damageInstances.filter((d) => d.id.startsWith("embed-"));
    expect(embeds[0].id).toBe("embed-1x");
    expect(embeds[0].damage).toBeCloseTo(1399 - 189);
    expect(embeds.some((d) => d.id === "embed-3x")).toBe(true);
    expect(embeds.find((d) => d.id === "embed-3x")!.damage).toBeCloseTo(2404 - 189);
  });
});
