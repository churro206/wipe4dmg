// Weapon packages from Aegis and Quantum (ADR 0013): base row, package, timing, options, gate,
// gaps, codes and the review table docs/weapon-import.md.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadWeaponImportInputs } from "../scripts/lib/weaponImportInputs";
import {
  bossParagraphs,
  buildWeaponImport,
  renderWeaponImport,
} from "../scripts/lib/weaponPackages";
import rawBuckets from "../src/data/buckets.json";
import rawCodes from "../src/data/weapon-codes.json";
import rawGaps from "../src/data/weapon-gaps.json";
import rawPackages from "../src/data/weapon-packages.json";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow, Weapon, WeaponGap } from "../src/data/schema";
import { loadKeywords } from "../src/engine/loadKeywords";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";

const result = buildWeaponImport(loadWeaponImportInputs());
const byName = (name: string) => result.packages.find((w) => w.name === name);
const value = (n: { value: number | null }) => n.value;
// Aegis' time to empty contains the first charge where the row has the note "…ms charge" (charge +
// intervals + reloads; 21 of 22 such rows fit); Quantum's and a row without the note count from the
// first shot, which waits for the charge.
const chargeRows = loadWeaponImportInputs().sustained.rows.filter((r) => r.chargeMs !== null);
const uncountedChargeMs = (
  weapon: { name: string; chargeTimeMs: { value: number | null } },
  timingSource: string | null,
) =>
  timingSource === "Aegis" && chargeRows.some((r) => r.name === weapon.name)
    ? 0
    : (weapon.chargeTimeMs.value ?? 0);
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawAbilityRows),
);

// S4 part C (ADR 0017): Barrow-Dyad from parts. The bullet with Target Lock on average (Clarity
// +25 %), 6 Blighted Seekers per magazine of 39 (Compendium "maximum of 6 Seekers"), each seeker
// explosion plus impact ("1172/97 seeker"); one cycle of 39 bullets and 6 seekers every 4.6 s
// (Aegis Sustained).
describe("Barrow-Dyad", () => {
  it("is built from the bullet with Target Lock and 6 seekers per magazine", () => {
    const barrow = byName("Barrow-Dyad")!;
    expect(barrow).toBeDefined();
    expect(value(barrow.damageInstances[0].damagePerTick)).toBeCloseTo((112 * 1.25) / 3.17, 2);
    const seekers = barrow.damageInstances[1];
    expect(value(seekers.damagePerTick)).toBeCloseTo((1172 + 97) / 3.17, 2);
    expect(value(seekers.ticks)).toBe(6);
    expect(value(seekers.everyNthShot!)).toBe(39);
    expect(value(barrow.magazine)).toBe(39);
    const cycleMs = 39 * (60_000 / value(barrow.fireRateRpm)!) + value(barrow.reloadTimeMs)!;
    expect(cycleMs).toBeCloseTo(4600, -1);
  });
});

describe("Truth (expected from the hand table of 2026-10-20)", () => {
  const truth = byName("Truth")!;

  it("takes type, element and ammo from the manifest", () => {
    expect(truth).toMatchObject({
      id: "truth",
      weaponType: "rocketLauncher",
      element: "void",
      ammo: "heavy",
    });
  });

  // S3 (ADR 0017): the hit of the Aegis row and the cluster of every third rocket (8 × 490) instead
  // of the row's average 2179.289.
  it("takes the single hit of the Aegis row per rocket and a cluster of every third", () => {
    expect(truth.damageInstances).toHaveLength(2);
    expect(value(truth.damageInstances[0].damagePerTick)).toBeCloseTo(
      5682 / 3.16,
      3,
    );
    const cluster = truth.damageInstances[1];
    expect(value(cluster.damagePerTick)).toBeCloseTo(490 / 3.16, 3);
    expect(value(cluster.ticks)).toBe(8);
    expect(value(cluster.everyNthShot!)).toBe(3);
  });

  // Override (meta probe 2026-10-23): Aegis before Quantum, 14 instead of 20 rockets.
  it("takes magazine and rockets from Aegis Sustained", () => {
    expect(value(truth.magazine)).toBe(3);
    expect(value(truth.totalShots)).toBe(14);
  });

  it("fires 3-3-3-3-2 with a 2134 ms gap per reload, the last rocket at 13.333 s", () => {
    const buckets = loadBuckets(rawBuckets);
    const shots = simulate(truth, 30, [], buckets).shots;
    expect(shots).toHaveLength(14);
    expect(shots[3].timeMs - shots[2].timeMs).toBeCloseTo(2134, 0);
    expect(shots.at(-1)!.timeMs).toBeCloseTo(13_333, 0);
  });

  it("offers the catalyst Reaper's Tithe x4 with factor 1.40, duration and condition", () => {
    expect(truth.options).toEqual([
      expect.objectContaining({
        id: "reaper-s-tithe-x4",
        name: "Reaper's Tithe x4",
        kind: "catalyst",
        durationSeconds: 15,
      }),
    ]);
    const tithe = truth.options![0];
    expect(value(tithe.factor)).toBeCloseTo(1.4, 3);
    expect(tithe.condition).toContain("simultaneously killed enemies");
  });

  // Clarity: "for 15 seconds … Timer only starts after firing" (override, 2026-10-24).
  it("limits Reaper's Tithe x4 to 15 s from the first rocket", () => {
    const tithe = truth.options![0];
    expect(tithe).not.toHaveProperty("windowSeconds");
    const buff = truth.buffs!.find((b) => b.id === tithe.id)!;
    expect(value(buff.durationMs!)).toBe(15_000);
    expect(value(buff.modifiers[0].multiplier)).toBeCloseTo(1.4, 3);
    expect(truth.rules!.some((r) => r.id === `${tithe.id}-window`)).toBe(true);
    const buckets = loadBuckets(rawBuckets);
    const long = {
      ...truth,
      totalShots: { ...truth.totalShots, value: 30 },
    };
    const run = simulate(long, 60, [], buckets, { catalyst: true });
    const firstMs = run.shots[0].timeMs;
    const early = run.damageInstances.find(
      (h) => h.timeMs < firstMs + 15_000,
    )!;
    const late = run.damageInstances.find(
      (h) => h.timeMs > firstMs + 15_500,
    )!;
    expect(late.damage / early.damage).toBeCloseTo(1 / 1.4, 2);
  });
});

describe("Thunderlord", () => {
  const entry = () =>
    result.report.weapons.find((w) => w.name === "Thunderlord")!;

  it("is a package with Reign Havoc and lightning in the average per bullet", () => {
    const thunderlord = byName("Thunderlord")!;
    expect(value(thunderlord.damageInstances[0].damagePerTick)).toBeCloseTo(
      113.888,
      3,
    );
    expect(value(thunderlord.totalShots)).toBe(379);
  });

  it("takes the Quantum timing without catalyst, since the catalyst refills ammo (Clarity)", () => {
    // Aegis "Sustained" assumes the catalyst ("only one reload"); Clarity: "Triggering a
    // Lightning Strike refills 5 ammo from reserves."
    expect(entry().timingSource).toBe("Quantum");
    expect(entry().timeToEmptySeconds).toBe(57.6);
    expect(entry().notes.join(" ")).toContain("Katalysator ändert das Timing");
  });
});

describe("investigated cases (W1-4d)", () => {
  const entry = (name: string) =>
    result.report.weapons.find((w) => w.name === name)!;

  it("Whisper of the Worm: Whispered Breathing is the catalyst; base from Aegis ÷ Quantum factor", () => {
    const whisper = byName("Whisper of the Worm")!;
    // 1250.909 ÷ (1251 / 850) = 849.94, the Quantum value without catalyst
    expect(value(whisper.damageInstances[0].damagePerTick)).toBeCloseTo(
      849.94,
      1,
    );
    const catalyst = whisper.options!.find((o) => o.kind === "catalyst")!;
    expect(value(catalyst.factor)).toBeCloseTo(1251 / 850, 3);
  });

  it("Ager's Scepter: catalyst +80 % from the text (override), not Quantum's 67 / 38", () => {
    const ager = byName("Ager's Scepter")!;
    const catalyst = ager.options!.find((o) => o.kind === "catalyst")!;
    // Aegis single hits (222 / 3.31) / (561 / 15.09) = 1.804 confirm it
    expect(value(catalyst.factor)).toBe(1.8);
  });

  it("Whisper of the Worm: White Nail refills the magazine, so no reloads", () => {
    const whisper = byName("Whisper of the Worm")!;
    expect(value(whisper.magazine)).toBe(38);
    expect(entry("Whisper of the Worm").timeToEmptySeconds).toBe(31.7);
  });

  it("Izanagi's Burden: the stacked Honed Edge x4 is no base row", () => {
    const izanagi = byName("Izanagi's Burden")!;
    expect(value(izanagi.damageInstances[0].damagePerTick)).toBeCloseTo(
      658.45,
      2,
    );
  });

  it("Sleeper Simulant: override to 14 shots without catalyst, 250 ms longer per shot", () => {
    const sleeper = byName("Sleeper Simulant")!;
    expect(value(sleeper.totalShots)).toBe(14);
    expect(entry("Sleeper Simulant").notes.join(" ")).toContain("Override");
  });
});

describe("weapons with scorch (ADR 0015, U4a-4)", () => {
  const otv = byName("One Thousand Voices")!;
  const fox = byName("Two-Tailed Fox")!;
  const effects = loadEffects(rawEffects);
  const total =(weapon: Weapon) =>
    simulate(weapon, 600, [], loadBuckets(rawBuckets), { keywords })
      .totalDamage;

  it("take the shot from the Aegis row without its ignitions (Aegis before Quantum)", () => {
    // (31106 - 2 x 2814) / 3.16 / 4 and (20191 - 2243) / 3.16 / 2; Quantum: 2180 and 2340
    expect(value(otv.damageInstances[0].damagePerTick)).toBeCloseTo(2015.66, 1);
    expect(value(fox.damageInstances[0].damagePerTick)).toBeCloseTo(2839.87, 1);
  });

  it("apply scorch per shot: x60 from the text, x90 from 9 explosions (override)", () => {
    const stacks = (weapon: Weapon) =>
      weapon.intrinsicParts.flatMap((p) =>
        p.type === "appliesKeyword" ? [[p.keywordId, value(p.stacks!)]] : [],
      );
    expect(stacks(fox)).toEqual([["ignition", 60]]);
    expect(stacks(otv)).toEqual([["ignition", 90]]);
  });

  it("take the ignition bonus of One Thousand Voices from its text", () => {
    expect(otv.keywordBonuses).toMatchObject([
      { keywordId: "ignition", factor: { value: 1.316 } },
    ]);
    expect(fox.keywordBonuses).toBeUndefined();
  });

  it("match the Aegis rows of One Thousand Voices with Ember of Ashes within 3 %", () => {
    // The row without Ember is the base; with Ember every shot ignites (36499 / 3.16 for 4 shots).
    const ember = effects.find((e) => e.id === "ember-of-ashes")!;
    const withEmber = simulate(otv, 600, [ember], loadBuckets(rawBuckets), {
      keywords,
      shotLimit: 4,
    }).totalDamage;
    expect(Math.abs(withEmber / (36499 / 3.16) - 1)).toBeLessThan(0.03);
    expect(total(otv)).toBeGreaterThan(0);
    expect(total(fox)).toBeGreaterThan(0);
  });

  it("take the catalyst of One Thousand Voices from Aegis with the ignitions taken out", () => {
    const catalyst = otv.options!.find((o) => o.kind === "catalyst")!;
    // (85319 - 4 x 2814) / 8 against (31106 - 2 x 2814) / 4, both Aegis rows
    expect(value(catalyst.factor)).toBeCloseTo(1.4534, 3);
    // "dealing 22 ticks of damage, one tick every 0.25 seconds, for 5.65 seconds" is how long a
    // seeker ticks, not how long the catalyst lasts.
    expect(catalyst.durationSeconds).toBeNull();
  });
});

describe("primaries", () => {
  it("Bad Juju: unlimited ammo, timing from Quantum per bullet", () => {
    const juju = byName("Bad Juju")!;
    expect(juju.ammo).toBe("primary");
    expect(value(juju.totalShots)).toBeNull();
    expect(value(juju.magazine)).toBe(31);
    expect(value(juju.fireRateRpm)).toBe(450);
  });

  it("Bad Juju: Aegis measures a 3-round burst (wipe 1446 = 3 × 482), the package is per bullet", () => {
    expect(
      value(byName("Bad Juju")!.damageInstances[0].damagePerTick),
    ).toBeCloseTo(95.846 / 3, 2);
    // Vigilance Wing fires 5-round bursts: 2605 = 5 × 521
    expect(
      value(byName("Vigilance Wing")!.damageInstances[0].damagePerTick),
    ).toBeCloseTo(172.668 / 5, 2);
  });

  // Catches a burst counted as one bullet (×3, ×5) and a shot of several projectiles divided by
  // mistake (Trinity Ghoul ÷3); extra damage in the Aegis average (poison, ignitions) stays inside.
  const KNOWN_OFF: Record<string, string> = {
    Hawkmoon: "Quantum's magazine damage includes the Paracausal Shot",
    Alethonym:
      "Aegis' average holds impact and impale ticks (337 impact, 237 tick), Quantum only the impact",
  };
  it("rule: one round of a primary deals 0.5 to 2 times the round of its Quantum timing row", () => {
    const inputs = loadWeaponImportInputs();
    const off = result.packages
      .filter((w) => w.ammo === "primary" && !(w.name in KNOWN_OFF))
      .flatMap((w) => {
        const row = inputs.quantum.rows.find(
          (r) => r.id === w.magazine.source.name.split("row ")[1],
        );
        if (!row?.magDamage || !row.magazine) return [];
        const ratio =
          value(w.damageInstances[0].damagePerTick)! /
          (row.magDamage / row.magazine);
        return ratio > 2 || ratio < 0.5
          ? [`${w.name} ${ratio.toFixed(2)}`]
          : [];
      });
    expect(off).toEqual([]);
  });
});

describe("catalysts", () => {
  // Quantum's time to empty of a bow is shots × 60 ÷ rpm (17.4 s ÷ 9 = 1.93 s, rpm 31); the nock is
  // inside it. Gate: manifest draw 1.328 s + nock 0.6 s = 1.93 s; with Archer's Tempo (Clarity
  // −43.7 % draw) 1.35 s, Aegis 1.333 s.
  it("Leviathan's Breath: one arrow every 1.93 s, with Archer's Tempo every 1.33 s, nock inside", () => {
    const leviathan = byName("Leviathan's Breath")!;
    expect(60 / value(leviathan.fireRateRpm)!).toBeCloseTo(1.935, 2);
    expect(value(leviathan.reloadTimeMs)).toBe(0);
    const timing = leviathan.catalyst!.timing!;
    expect(60 / value(timing.fireRateRpm)!).toBeCloseTo(1.333, 2);
    expect(value(timing.reloadTimeMs)).toBe(0);
    expect(value(timing.totalShots)).toBe(14);
  });

  // Aegis "average, one ring" (in-game): wipe 18 188 in 6 arrows = 6 × 735 crit + 18 × 485 seeker +
  // 2 ignitions of 2345 + 358 burn (not modelled); without the burn 17 830 ÷ 6 ÷ 3.31 buffs = 897.8
  // per arrow. 2 in 6 means every 3rd arrow ignites: arrows further apart than the ignition cooldown
  // (1.3 s), i.e. at the pace without the catalyst (1.36 s); Aegis names no pace (derived).
  it("Hierarchy of Needs: arrow, 3 seekers and their ignitions give Aegis' 898 per arrow within ±3 %", () => {
    const hierarchy = byName("Hierarchy of Needs")!;
    // 13 arrows (the first deploys the ring): 12 with seekers, 4 full cycles of 3, before 20 s
    const result = simulate(hierarchy, 17.5, [], loadBuckets(rawBuckets), {
      catalyst: false,
      keywords,
      assumptions: ["pre-stacked"],
    });
    // arrows with the ring: from the 2nd on, before the ring is set again after 20 s
    const ringArrows = result.shots.length - 1;
    const damage = result.damageInstances
      .filter((d) => d.timeMs > result.shots[0].timeMs)
      .reduce((sum, d) => sum + d.damage, 0);
    expect(Math.abs(damage / ringArrows / 897.8 - 1)).toBeLessThan(0.03);
  });

  it("Telesto: 4 rounds per magazine without, 7 with the catalyst (Clarity 4🠚7)", () => {
    const telesto = byName("Telesto")!;
    expect(value(telesto.magazine)).toBe(4);
    expect(value(telesto.catalyst!.timing!.magazine)).toBe(7);
    expect(telesto.catalyst!.effect).toBe("timing");
  });

  it("Gjallarhorn: Quantum's plain row has the catalyst magazine 2; without it 1", () => {
    const gjally = byName("Gjallarhorn")!;
    expect(value(gjally.magazine)).toBe(1);
    expect(value(gjally.catalyst!.timing!.magazine)).toBe(2);
  });

  it("Thunderlord: the catalyst refills from lightning strikes, so no reloads (Quantum cata)", () => {
    const thunderlord = byName("Thunderlord")!;
    const t = thunderlord.catalyst!.timing!;
    expect(value(t.magazine)).toBe(value(t.totalShots));
  });

  it("rule: every package with a catalyst in the manifest or Clarity offers it", () => {
    const inputs = loadWeaponImportInputs();
    const missing = result.packages
      .filter((w) => {
        const m = inputs.manifest.find((x) => x.hash === w.manifestHash)!;
        return m.catalyst !== null && w.catalyst === undefined;
      })
      .map((w) => w.name);
    expect(missing).toEqual([]);
  });

  it("rule: a catalyst never lowers damage", () => {
    const lower = result.packages.flatMap((w) =>
      (w.options ?? [])
        .filter((o) => o.kind === "catalyst" && value(o.factor)! < 1)
        .map((o) => `${w.name} ×${value(o.factor)}`),
    );
    expect(lower).toEqual([]);
  });

  it("rule: with the catalyst, the simulator reaches its time to empty within ±3 %", () => {
    const off = result.report.weapons
      .filter((r) => r.catalystTiming?.timeToEmptySeconds)
      .flatMap((r) => {
        const weapon = byName(r.name)!;
        const timeToEmpty = r.catalystTiming!.timeToEmptySeconds!;
        const shots = simulate(
          weapon,
          timeToEmpty * 2,
          [],
          loadBuckets(rawBuckets),
          {
            catalyst: true,
            keywords,
          },
        ).shots;
        const last = (shots.at(-1)!.timeMs - uncountedChargeMs(weapon, r.timingSource)) / 1000;
        return Math.abs(last / timeToEmpty - 1) > 0.03
          ? [`${r.name} ${last.toFixed(1)} s vs ${timeToEmpty.toFixed(1)} s`]
          : [];
      });
    expect(off).toEqual([]);
  });
});

describe("gaps closed by overrides and rules (2026-10-23)", () => {
  const perShot = (name: string) =>
    value(byName(name)!.damageInstances[0].damagePerTick)!;

  it("Alethonym: Quantum row 'Spam', one grenade per reload", () => {
    const w = byName("Alethonym")!;
    expect(value(w.magazine)).toBe(1);
    expect(value(w.totalShots)).toBeNull();
    expect(value(w.reloadTimeMs)).toBe(1620);
  });

  it("Cerberus+1: Quantum 'normal, close range' for Aegis 'point blank'", () => {
    const w = byName("Cerberus+1")!;
    expect(value(w.magazine)).toBe(31);
    expect(value(w.fireRateRpm)).toBe(360);
  });

  it("SUROS Regime: Spinning Up (more damage per second than Dual Speed Receiver)", () => {
    const w = byName("SUROS Regime")!;
    expect(perShot("SUROS Regime")).toBeCloseTo(26.8, 0);
    expect(value(w.fireRateRpm)).toBe(712);
  });

  it("Duality: Quantum measures with the catalyst (8 rounds); without it 6 (Clarity 6🠚8)", () => {
    const w = byName("Duality")!;
    expect(value(w.magazine)).toBe(6);
    expect(value(w.catalyst!.timing!.magazine)).toBe(8);
  });

  it("Ex Diris: magazine 1 without a reload in the notes, the reload is inside the fire rate", () => {
    expect(value(byName("Ex Diris")!.totalShots)).toBe(35);
  });

  it("Ice Breaker: 10 shots without reload, timing from Aegis", () => {
    const w = byName("Ice Breaker")!;
    expect(value(w.totalShots)).toBe(10);
    expect(value(w.magazine)).toBe(10);
  });

  it("Finality's Auger: 21 shots in magazines of 6 (Aegis Sustained)", () => {
    const w = byName("Finality's Auger")!;
    expect(value(w.totalShots)).toBe(21);
    expect(value(w.magazine)).toBe(6);
  });

  it("The Queenbreaker: Combat Sights (more total damage); magazine 5 without Rewind Rounds, Aegis timing with it", () => {
    const w = byName("The Queenbreaker")!;
    expect(perShot("The Queenbreaker")).toBeCloseTo(1966.5, 0);
    expect(value(w.magazine)).toBe(5);
    expect(value(w.catalyst!.timing!.magazine)).toBe(11);
  });

  it("Witherhoard: a full blight per shot (Quantum 'passive', 20 shots in 90 s); the catalyst reloads while stowed (50 s)", () => {
    const w = byName("Witherhoard")!;
    expect(value(w.totalShots)).toBe(20);
    const report = result.report.weapons.find((r) => r.name === "Witherhoard")!;
    expect(report.timeToEmptySeconds).toBeCloseTo(90, 0);
    expect(report.catalystTiming!.timeToEmptySeconds).toBeCloseTo(50, 0);
  });
});

describe("catalyst paragraphs against one boss without adds", () => {
  it("drops a paragraph with its bullets when its condition needs adds, allies, pickups or shields", () => {
    const text = [
      "Grants 20 Range.",
      "Upon breaking a Combatant's Elemental Shield:",
      "• Grants a 30 HP Overshield for 10 seconds.",
      "Grants 30 Handling and 40 Reload Speed while within 15 meters of an ally.",
      "Scoring Weapon Hits against 3 Separate Enemies within 3 seconds of each grants 35% increased damage.",
      "Picking up Ionic Traces refill 4 ammo from reserves.",
      "Deals increased damage against Minibosses, Bosses, and Vehicles.",
    ].join("\n");
    expect(bossParagraphs(text)).toBe(
      "Grants 20 Range.\nDeals increased damage against Minibosses, Bosses, and Vehicles.",
    );
  });

  it("drops sentences that only qualify a buff, and a catalyst that does not function", () => {
    expect(
      bossParagraphs("Grants 20 Range.\nStowing the weapon removes the buff."),
    ).toBe("Grants 20 Range.");
    expect(
      bossParagraphs(
        "Due to an unresolved bug, this catalyst does not function.\nThe intended behavior was 10% more damage.",
      ),
    ).toBe("");
  });

  it("keeps a condition one boss can meet (within 15 meters of an enemy)", () => {
    const text = "While within 15 meters of an enemy, grants 20 Reload Speed.";
    expect(bossParagraphs(text)).toBe(text);
  });

  it("rule: about 30 or more catalysts have no effect against one boss", () => {
    const none = result.packages.filter((w) => w.catalyst?.effect === "none");
    expect(none.length).toBeGreaterThanOrEqual(30);
    expect(byName("Wish-Ender")!.catalyst!.effect).toBe("none");
    expect(byName("Vigilance Wing")!.catalyst!.effect).toBe("none");
  });
});

describe("swords and catalyst-only measurements (2026-10-23)", () => {
  it("The Lament: one shot per combo, 13 combos in 40.5 s (Aegis counts ammo)", () => {
    const w = byName("The Lament")!;
    expect(value(w.totalShots)).toBe(13);
    expect(value(w.damageInstances[0].damagePerTick)).toBeCloseTo(4561, 0);
  });

  it("Wish-Keeper: Aegis measures with Vorpal Weapon; without it ÷1.2, the catalyst gives ×1.2", () => {
    const w = byName("Wish-Keeper")!;
    expect(value(w.damageInstances[0].damagePerTick)).toBeCloseTo(213.75, 1);
    expect(value(w.options!.find((o) => o.kind === "catalyst")!.factor)).toBe(
      1.2,
    );
  });
});

describe("rules", () => {
  it("names a reason for every gap", () => {
    for (const gap of result.gaps) expect(gap.reason, gap.name).not.toBe("");
  });

  it("keeps every package valid and within ±3 % of the Quantum time to empty", () => {
    const buckets = loadBuckets(rawBuckets);
    for (const weapon of result.packages) {
      Weapon.parse(weapon);
      const row = result.report.weapons.find((w) => w.name === weapon.name)!;
      const timeToEmpty = row.timeToEmptySeconds;
      if (timeToEmpty === null) continue;
      const shots = simulate(weapon, timeToEmpty * 2, [], buckets, {
        keywords,
      }).shots;
      expect(
        (shots.at(-1)!.timeMs - uncountedChargeMs(weapon, row.timingSource)) / 1000,
        weapon.name,
      ).toBeCloseTo(timeToEmpty, 0);
    }
  });

  it("charges every fusion rifle, linear fusion rifle and bow as long as its manifest stat says", () => {
    const charging = loadWeaponImportInputs().manifest.filter((w) =>
      ["fusionRifle", "linearFusionRifle", "bow"].includes(w.weaponType),
    );
    expect(charging.length).toBeGreaterThanOrEqual(25);
    for (const manifest of charging) {
      const stat = manifest.weaponType === "bow" ? "Draw Time" : "Charge Time";
      const weapon = result.packages.find((p) => p.name === manifest.name);
      if (!weapon || manifest.stats[stat] === undefined) continue;
      expect(weapon.chargeTimeMs.value, manifest.name).toBe(manifest.stats[stat]);
    }
    const byName = (name: string) => result.packages.find((p) => p.name === name)!;
    // examples from the three types that Aegis' notes did not cover
    expect(byName("Wish-Ender").chargeTimeMs.value).toBe(733);
    expect(byName("Lorentz Driver").chargeTimeMs.value).toBe(533);
    expect(byName("Fafnir").chargeTimeMs.value).toBe(1066);
  });

  it("shoots a primary bow every 60 ÷ rpm: the draw and the nock are inside Quantum's rate", () => {
    const bows = result.packages.filter(
      (w) => w.weaponType === "bow" && w.ammo === "primary" && w.magazine.value === 1,
    );
    expect(bows.length).toBeGreaterThanOrEqual(7);
    const buckets = loadBuckets(rawBuckets);
    for (const bow of bows) {
      expect(bow.reloadTimeMs.value, bow.name).toBe(0);
      const times = simulate(bow, 30, [], buckets, { keywords }).shots.map(
        (s) => s.timeMs,
      );
      const cycleMs = (times.at(-1)! - times[0]) / (times.length - 1);
      expect(cycleMs, bow.name).toBeCloseTo(60_000 / bow.fireRateRpm.value!, 0);
    }
  });

  it("never reuses a link code", () => {
    const codes = Object.values(result.codes);
    expect(new Set(codes).size).toBe(codes.length);
    expect(result.codes["one-thousand-voices"]).toBe(1);
  });
});

describe("generated files are current (run npm run build:weapons)", () => {
  it("weapon-packages.json", () => {
    expect(Weapon.array().parse(rawPackages)).toEqual(result.packages);
  });

  it("weapon-gaps.json", () => {
    expect(WeaponGap.array().parse(rawGaps)).toEqual(result.gaps);
  });

  it("weapon-codes.json", () => {
    expect(rawCodes).toEqual(result.codes);
  });

  it("docs/weapon-import.md", () => {
    expect(
      readFileSync("docs/weapon-import.md", "utf8").replace(/\r\n/g, "\n"),
    ).toBe(renderWeaponImport(result.report));
  });
});
