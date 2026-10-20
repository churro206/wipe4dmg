// ADR 0012: several weapons. Every Data File in src/data/weapons is loaded, ids and codes are
// unique, every weapon has a gate, and the engine works for a weapon without the intrinsics of
// One Thousand Voices.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawReferenceFactors from "../src/data/reference-factors.json";
import rawReferenceMultipliers from "../src/data/reference-multipliers.json";
import rawReferenceValues from "../src/data/reference-values.json";
import {
  ReferenceFactor,
  ReferenceMultiplier,
  ReferenceValue,
} from "../src/data/schema";
import { decodeLink, encodeLink } from "../src/engine/buildLink";
import { effectAppliesToWeapon } from "../src/engine/effectParts";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapons } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";
import { testWeapon } from "./support/testWeapon";
import { rawWeapons, weaponById, weapons } from "./support/weapons";

const otv = weaponById("one-thousand-voices");
const effects = loadEffects(rawEffects);
const buckets = loadBuckets(rawBuckets);
const effect = (id: string) => effects.find((e) => e.id === id)!;

describe("loadWeapons", () => {
  it("loads every weapon Data File", () => {
    expect(weapons.map((w) => w.id)).toContain("one-thousand-voices");
    expect(weapons).toHaveLength(rawWeapons.length);
  });

  it("rejects a duplicate id", () => {
    expect(() =>
      loadWeapons([...rawWeapons, { ...rawWeapons[0], code: 998 }]),
    ).toThrow(/id/);
  });

  it("rejects a duplicate code", () => {
    expect(() =>
      loadWeapons([...rawWeapons, { ...rawWeapons[0], id: "copy" }]),
    ).toThrow(/code/);
  });
});

describe("gate values name their weapon", () => {
  const values = ReferenceValue.array().parse(rawReferenceValues);
  const multipliers = ReferenceMultiplier.array().parse(
    rawReferenceMultipliers,
  );
  const factors = ReferenceFactor.array().parse(rawReferenceFactors);
  const ids = new Set(weapons.map((w) => w.id));

  it("refers only to known weapons", () => {
    for (const reference of [...values, ...multipliers, ...factors]) {
      expect(ids, reference.id).toContain(reference.weaponId);
    }
  });

  it("gives every weapon at least one total damage gate", () => {
    for (const weapon of weapons) {
      const gates = values.filter(
        (r) => r.weaponId === weapon.id && r.scenario !== undefined,
      );
      expect(gates.length, weapon.id).toBeGreaterThan(0);
    }
  });
});

describe("effectAppliesToWeapon", () => {
  it("applies every own weapon effect to One Thousand Voices", () => {
    for (const id of [
      "particle-reconstruction",
      "ember-of-ashes",
      "surge-3x",
      "elemental-overdrive-solar",
    ]) {
      expect(effectAppliesToWeapon(effect(id), otv), id).toBe(true);
    }
  });

  it("leaves out effects for other weapon types, elements and counters", () => {
    for (const id of [
      "particle-reconstruction", // fusion rifles only
      "elemental-overdrive-solar", // solar only
      "ember-of-ashes", // needs scorch
    ]) {
      expect(effectAppliesToWeapon(effect(id), testWeapon), id).toBe(false);
    }
  });

  it("keeps effects without restriction", () => {
    expect(effectAppliesToWeapon(effect("surge-3x"), testWeapon)).toBe(true);
    expect(effectAppliesToWeapon(effect("weaken"), testWeapon)).toBe(true);
  });
});

describe("engine with a weapon other than One Thousand Voices", () => {
  const total = (ids: string[]) =>
    simulate(testWeapon, 600, ids.map(effect), buckets).totalDamage;

  it("deals damage per shot only", () => {
    expect(total([])).toBe(3000);
  });

  it("ignores effects that do not apply to the weapon", () => {
    expect(total(["particle-reconstruction", "ember-of-ashes"])).toBe(
      total([]),
    );
  });

  it("applies effects without restriction", () => {
    expect(total(["surge-3x"])).toBeGreaterThan(total([]));
  });

  it("round-trips a build link", () => {
    const registry = {
      weapons: [otv, testWeapon],
      effects,
      abilities: [],
    };
    const build = {
      weaponId: testWeapon.id,
      guardianClass: "titan" as const,
      subclass: "arc" as const,
      catalyst: false,
      damagePhaseSeconds: 30,
      selections: [],
      effectWindows: {},
    };
    expect(decodeLink(encodeLink({ build }, registry), registry).build).toEqual(
      build,
    );
  });
});
