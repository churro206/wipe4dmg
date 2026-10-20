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
import { Weapon, WeaponGap } from "../src/data/schema";
import { loadBuckets } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";

const result = buildWeaponImport(loadWeaponImportInputs());
const byName = (name: string) => result.packages.find((w) => w.name === name);
const value = (n: { value: number | null }) => n.value;

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

  it("Two-Tailed Fox: gap until a hand model covers scorch and ignitions", () => {
    expect(byName("Two-Tailed Fox")).toBeUndefined();
    expect(entry("Two-Tailed Fox").gapReason).toContain("Handmodell");
  });
});

describe("rules", () => {
  it("leaves hand-modelled weapons to their Data File", () => {
    expect(byName("One Thousand Voices")).toBeUndefined();
    expect(result.report.handModelled).toContain("One Thousand Voices");
  });

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
      const shots = simulate(weapon, timeToEmpty * 2, [], buckets).shots;
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
