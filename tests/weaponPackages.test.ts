// Weapon packages from Aegis and Quantum (ADR 0013): base row, package, timing, options, gate,
// gaps, codes and the review table docs/weapon-import.md.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadWeaponImportInputs } from "../scripts/lib/weaponImportInputs";
import {
  buildWeaponImport,
  renderWeaponImport,
} from "../scripts/lib/weaponPackages";
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
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawAbilityRows),
);

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

  it("uses the Aegis row with Prototype Trueseeker as the package per rocket", () => {
    expect(truth.damageInstances).toHaveLength(1);
    expect(value(truth.damageInstances[0].damagePerTick)).toBeCloseTo(
      2179.289,
      3,
    );
  });

  it("takes magazine, rockets and reload from Quantum", () => {
    expect(value(truth.magazine)).toBe(3);
    expect(value(truth.totalShots)).toBe(20);
    expect(value(truth.reloadTimeMs)).toBe(2350);
  });

  it("derives the shot interval so that all rockets are out after 17.4 s", () => {
    const buckets = loadBuckets(rawBuckets);
    const shots = simulate(truth, 30, [], buckets).shots;
    expect(shots).toHaveLength(20);
    expect(shots.at(-1)!.timeMs).toBeCloseTo(17_400, -1);
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
  const total = (weapon: Weapon) =>
    simulate(weapon, 600, [], loadBuckets(rawBuckets), { keywords })
      .totalDamage;

  it("take the shot from the Quantum row without ignitions", () => {
    expect(value(otv.damageInstances[0].damagePerTick)).toBeCloseTo(2180, 3);
    expect(value(fox.damageInstances[0].damagePerTick)).toBeCloseTo(2340, 3);
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

  it("match the Quantum rows with ignitions within 3 %", () => {
    expect(Math.abs(total(otv) / 28430 - 1)).toBeLessThan(0.03);
    expect(Math.abs(total(fox) / 26950 - 1)).toBeLessThan(0.03);
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
    "Hierarchy of Needs":
      "Aegis shoots through the Guidance Ring; Quantum variant 'Guidance Ring' gives ×1.38",
    Hawkmoon: "Quantum's magazine damage includes the Paracausal Shot",
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

describe("rules", () => {
  it("names a reason for every gap", () => {
    for (const gap of result.gaps) expect(gap.reason, gap.name).not.toBe("");
  });

  it("keeps every package valid and within ±3 % of the Quantum time to empty", () => {
    const buckets = loadBuckets(rawBuckets);
    for (const weapon of result.packages) {
      Weapon.parse(weapon);
      const timeToEmpty = result.report.weapons.find(
        (w) => w.name === weapon.name,
      )!.timeToEmptySeconds;
      if (timeToEmpty === null) continue;
      const shots = simulate(weapon, timeToEmpty * 2, [], buckets, {
        keywords,
      }).shots;
      expect(shots.at(-1)!.timeMs / 1000, weapon.name).toBeCloseTo(
        timeToEmpty,
        0,
      );
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
