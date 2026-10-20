// Gate for weapon effects (ADR 0011): the factor an effect adds to the Total Damage of the
// weapon must match the factor a source measured ("with" row ÷ "without" row).
// Both scenarios use full ammo, so the factor compares the same number of shots.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawReferenceFactors from "../src/data/reference-factors.json";
import { ReferenceFactor } from "../src/data/schema";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { simulate } from "../src/engine/simulate";
import { weaponById } from "./support/weapons";

const TOLERANCE = 0.03; // ±3 %, ADR 0011 (Aegis and Quantum agree within 2 % on Ember of Ashes)
const FULL_AMMO_SECONDS = 600;

// Known model errors from the research on 2026-10-20 (docs/mechanics). Remove an id once
// its correction lands; the test then has to pass.
const KNOWN_DEVIATIONS = new Set<string>([]);

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const references = ReferenceFactor.array().parse(rawReferenceFactors);

const byIds = (ids: string[]) =>
  ids.map((id) => {
    const effect = effects.find((e) => e.id === id);
    if (!effect) throw new Error(`Unknown effect "${id}"`);
    return effect;
  });

const totalDamage = (weaponId: string, scenario: ReferenceFactor["baseline"]) =>
  simulate(
    weaponById(weaponId),
    FULL_AMMO_SECONDS,
    byIds(scenario.effectIds),
    buckets,
    {
      catalyst: scenario.catalyst,
    },
  ).totalDamage;

const modelFactor = (reference: ReferenceFactor) =>
  totalDamage(reference.weaponId, reference.variant) /
  totalDamage(reference.weaponId, reference.baseline);

describe("gate: weapon effect factors", () => {
  it("has references", () => {
    expect(references.length).toBeGreaterThan(0);
  });

  for (const reference of references) {
    const known = KNOWN_DEVIATIONS.has(reference.id);
    const test = known ? it.fails : it;
    test(`${reference.id} matches ×${reference.factor} within ${TOLERANCE * 100}%${
      known ? " (known deviation)" : ""
    }`, () => {
      const factor = modelFactor(reference);
      expect(factor).toBeGreaterThanOrEqual(reference.factor * (1 - TOLERANCE));
      expect(factor).toBeLessThanOrEqual(reference.factor * (1 + TOLERANCE));
    });
  }
});
