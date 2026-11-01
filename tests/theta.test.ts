// Canonical scale (docs/architecture.md I6, ADR 0018 B4a step 4): a part carries its scale as a field,
// theta.json holds one factor per scale and damage source, and the core multiplies it onto the base
// value of the part. Aegis visual is the canonical scale: its factors are 1.

import { describe, expect, it } from "vitest";
import rawPackages from "../src/data/weapon-packages.json";
import rawTheta from "../src/data/theta.json";
import { DamageScale, DamageSource, Theta, type Weapon } from "../src/data/schema";
import { buildSimulation } from "../src/engine/buildSimulation";
import { damageScaleOf } from "../src/engine/damageScale";
import { loadBuckets } from "../src/engine/loadData";
import { loadWeapons } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import rawBuckets from "../src/data/buckets.json";
import { runtimePart, type ImportPart } from "../scripts/lib/partRules";
import { gameData } from "../src/ui/data";
import { testWeapon } from "./support/testWeapon";

const buckets = loadBuckets(rawBuckets);
const source = { name: "Test fixture", retrieved: "2026-11-01", status: "derived" as const };

/** A theta with every factor 1 except the given cell. */
const thetaWith = (scale: DamageScale, damageSource: DamageSource, factor: number): Theta => {
  const cells = Object.fromEntries(
    DamageScale.options.map((s) => [
      s,
      Object.fromEntries(
        DamageSource.options.map((d) => [d, s === scale && d === damageSource ? factor : 1]),
      ),
    ]),
  );
  return Theta.parse({ source, factors: cells });
};

const withScale = (scale: DamageScale | undefined): Weapon => ({
  ...testWeapon,
  damageInstances: testWeapon.damageInstances.map((part) => ({
    ...part,
    ...(scale ? { scale } : {}),
  })),
});

const total = (weapon: Weapon, theta?: Theta) =>
  simulate(weapon, 10, [], buckets, theta ? { theta } : {}).totalDamage;

describe("theta.json", () => {
  const theta = Theta.parse(rawTheta);

  it("has a factor for every scale and every damage source, and every factor has a value", () => {
    for (const scale of DamageScale.options) {
      for (const damageSource of DamageSource.options) {
        expect(theta.factors[scale][damageSource]).toBeGreaterThan(0);
      }
    }
  });

  it("starts at 1 everywhere (calibration is B5)", () => {
    const all = Object.values(theta.factors).flatMap((cells) => Object.values(cells));
    expect(all.every((factor) => factor === 1)).toBe(true);
  });

  it("rejects a factor other than 1 on the canonical scale", () => {
    expect(() => thetaWith("aegisVisual", "weapon", 1.1)).toThrow(/canonical/);
  });

  it("rejects a missing scale", () => {
    const { aegisVisual, ...rest } = theta.factors;
    expect(aegisVisual).toBeDefined();
    expect(() => Theta.parse({ source, factors: rest })).toThrow();
  });
});

describe("the core multiplies theta onto the part", () => {
  it("a part on the quantum scale is scaled by the quantum factor of its damage source", () => {
    const plain = total(withScale("quantum"));
    expect(total(withScale("quantum"), thetaWith("quantum", "weapon", 1.25))).toBeCloseTo(
      plain * 1.25,
      6,
    );
  });

  it("the factor of another scale or damage source does not apply", () => {
    const plain = total(withScale("quantum"));
    expect(total(withScale("quantum"), thetaWith("compendium", "weapon", 2))).toBe(plain);
    expect(total(withScale("quantum"), thetaWith("quantum", "super", 2))).toBe(plain);
  });

  it("a part without a scale counts as canonical: no factor applies", () => {
    const plain = total(withScale(undefined));
    expect(total(withScale(undefined), thetaWith("quantum", "weapon", 2))).toBe(plain);
    expect(total(withScale("aegisVisual"), thetaWith("quantum", "weapon", 2))).toBe(plain);
  });

  it("without theta the result is the base (all factors 1)", () => {
    expect(total(withScale("quantum"))).toBe(total(withScale("quantum"), Theta.parse(rawTheta)));
  });

  it("buildSimulation hands theta.json to the core", () => {
    const { options } = buildSimulation(
      {
        weaponId: "one-thousand-voices",
        guardianClass: "titan",
        subclass: "arc",
        catalyst: false,
        selections: [],
        effectWindows: {},
        damagePhaseSeconds: 30,
      },
      gameData,
    );
    expect(options.theta).toEqual(Theta.parse(rawTheta));
  });
});

describe("the import writes the scale", () => {
  const part = (sourceName: string): ImportPart => ({
    id: "shot",
    name: "Shot",
    delayMs: { value: 0, source },
    damagePerTick: { value: 1, source: { ...source, name: sourceName } },
    ticks: { value: 1, source },
    tickIntervalMs: { value: 0, source },
    canPrecision: false,
  });

  it("runtimePart sets the scale of the source of the damage value", () => {
    expect(runtimePart(part("Aegis Weapons sheet, row x")).scale).toBe("aegisVisual");
    expect(runtimePart(part("Quantum Damage-ics (column Body Damage)")).scale).toBe("quantum");
  });

  it("every part of every weapon package carries the scale of its source", () => {
    const wrong = loadWeapons(rawPackages).flatMap((weapon) =>
      weapon.damageInstances
        .filter((part) => part.scale !== (damageScaleOf(part.damagePerTick) ?? "aegisVisual"))
        .map((part) => `${weapon.id}.${part.id}: ${part.scale} (${part.damagePerTick.source.name})`),
    );
    expect(wrong).toEqual([]);
  });
});
