// Weapon packages from Aegis and Quantum (ADR 0013): base row, package, timing, options, gate,
// gaps, codes and the review table docs/weapon-import.md.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadWeaponImportInputs } from "../scripts/lib/weaponImportInputs";
import { bossParagraphs, buildWeaponImport } from "../scripts/lib/weaponPackages";
import { renderWeaponImport } from "../scripts/lib/weaponReport";
import rawBuckets from "../src/data/buckets.json";
import rawCodes from "../src/data/weapon-codes.json";
import rawGaps from "../src/data/weapon-gaps.json";
import rawPackages from "../src/data/weapon-packages.json";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow, Weapon, WeaponGap } from "../src/data/schema";
import { loadKeywords } from "../src/engine/loadKeywords";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";

const result = buildWeaponImport(loadWeaponImportInputs());
const byName = (name: string) => result.packages.find((w) => w.name === name);
const value = (n: { value: number | null }) => n.value;
/** The packages that are no item file: the Aegis path (ADR 0019, until A2). */
const remainingPackages = () =>
  result.packages.filter((w) => result.report.weapons.find((r) => r.name === w.name)?.status !== "item");
/** Every Nth shot sets a part off: the counter of its rule counts N - 1 shots (partRules). */
const nthShotOf = (weapon: Weapon, partId: string) => {
  const count = weapon.rules!.find((rule) => rule.id === `${partId}-count`)!;
  const condition = count.if!.find((c) => c.type === "counter")!;
  if (condition.type !== "counter") throw new Error("no counter");
  return condition.value.value! + 1;
};
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

describe("Truth (item file src/data/items/weapons/truth.json, B4b)", () => {
  const truth = byName("Truth")!;

  it("takes type, element and ammo from the manifest", () => {
    expect(truth).toMatchObject({
      id: "truth",
      weaponType: "rocketLauncher",
      element: "void",
      ammo: "heavy",
    });
  });

  // The rocket from Quantum (1797, Aegis 5682 ÷ 3.16 = 1798.1), the cluster of every third rocket
  // (8 × 490 ÷ 3.16) from Aegis.
  it("takes the rocket from Quantum and a cluster of every third from Aegis", () => {
    expect(truth.damageInstances).toHaveLength(2);
    expect(value(truth.damageInstances[0].damagePerTick)).toBe(1797);
    const cluster = truth.damageInstances[1];
    expect(value(cluster.damagePerTick)).toBeCloseTo(490 / 3.16, 3);
    expect(nthShotOf(truth, cluster.id)).toBe(3);
  });

  it("takes magazine from Quantum and rockets from Aegis Sustained (14, not Quantum's 20)", () => {
    expect(value(truth.magazine)).toBe(3);
    expect(value(truth.totalShots)).toBe(14);
  });

  // Without Argent Ordnance: Quantum's reload 2.35 s in place of Aegis' 2.134 s
  it("fires 3-3-3-3-2 with a 2350 ms gap per reload, the last rocket at 14.197 s", () => {
    const buckets = loadBuckets(rawBuckets);
    const shots = simulate(truth, 30, [], buckets).shots;
    expect(shots).toHaveLength(14);
    expect(shots[1].timeMs - shots[0].timeMs).toBeCloseTo(533, 0);
    expect(shots[3].timeMs - shots[2].timeMs).toBeCloseTo(2350, 0);
    expect(shots.at(-1)!.timeMs).toBeCloseTo(9 * 533 + 4 * 2350, -1);
  });

  // Clarity: "40% increased damage for 15 seconds … Timer only starts after firing"
  it("limits Reaper's Tithe x4 (×1.4) to 15 s from the first rocket", () => {
    expect(truth.options).toBeUndefined();
    const buff = truth.buffs!.find((b) => b.name === "Reaper's Tithe x4")!;
    expect(value(buff.durationMs!)).toBe(15_000);
    expect(value(buff.modifiers[0].multiplier)).toBeCloseTo(1.4, 3);
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

describe("primaries", () => {
  it("Bad Juju: unlimited ammo, timing from Quantum per bullet", () => {
    const juju = byName("Bad Juju")!;
    expect(juju.ammo).toBe("primary");
    expect(value(juju.totalShots)).toBeNull();
    expect(value(juju.magazine)).toBe(31);
    expect(value(juju.fireRateRpm)).toBe(450);
  });

  // Catches a burst counted as one bullet (×3, ×5) and a shot of several projectiles divided by
  // mistake; extra damage in the Aegis average (poison, ignitions) stays inside. Since Q1 (ADR 0019)
  // only the packages that are no item (the Aegis path) are checked.
  const KNOWN_OFF: Record<string, string> = {
    Alethonym:
      "Aegis' average holds impact and impale ticks (337 impact, 237 tick), Quantum only the impact",
  };
  it("lock until A2: one round of a primary package deals 0.5 to 2 times the round of its Quantum timing row", () => {
    const inputs = loadWeaponImportInputs();
    const primaries = remainingPackages().filter((w) => w.ammo === "primary" && !(w.name in KNOWN_OFF));
    expect(primaries.length).toBeGreaterThan(0);
    const off = primaries.flatMap((w) => {
      const row = inputs.quantum.rows.find((r) => r.id === w.magazine.source.name.split("row ")[1]);
      if (!row?.magDamage || !row.magazine) return [];
      const ratio = value(w.damageInstances[0].damagePerTick)! / (row.magDamage / row.magazine);
      return ratio > 2 || ratio < 0.5 ? [`${w.name} ${ratio.toFixed(2)}`] : [];
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

  it("Witherhoard (item, M1): a full blight per shot (Quantum 'passive', 41180 in 20 shots); the catalyst reloads while stowed (50 s)", () => {
    const w = byName("Witherhoard")!;
    expect(value(w.totalShots)).toBe(20);
    expect(value(w.damageInstances[0].damagePerTick)).toBeCloseTo(41180 / 20, 1);
    // (90 s − 19 reloads × 1.62 s) ÷ 19 intervals, with the catalyst (50 s) ÷ the same
    expect(value(w.fireRateRpm)).toBeCloseTo(19.25, 1);
    expect(value(w.catalyst!.timing!.fireRateRpm)).toBeCloseTo(59.31, 1);
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

  // Value after Q1 (15 of the 29 packages left; before Q1 about 30 of 137), a lock until A2 removes
  // the Aegis path: no reason is claimed for "15", the classification must not silently drop.
  // M2: Ex Diris and Grand Overture (both "none") became items: 13 of 27 packages.
  it("lock until A2: at least 13 of the remaining packages keep a catalyst without effect (value after M2)", () => {
    const none = remainingPackages().filter((w) => w.catalyst?.effect === "none");
    expect(none.length).toBeGreaterThanOrEqual(13);
  });
});

describe("swords and catalyst-only measurements (2026-10-23)", () => {
  it("The Lament: one shot per combo, 13 combos in 40.5 s (Aegis counts ammo)", () => {
    const w = byName("The Lament")!;
    expect(value(w.totalShots)).toBe(13);
    expect(value(w.damageInstances[0].damagePerTick)).toBeCloseTo(4561, 0);
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
