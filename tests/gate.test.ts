// Release gate (docs/requirements.md): results match the values of the data sources.
// Every reference with machine-readable conditions is checked here.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawReferenceMultipliers from "../src/data/reference-multipliers.json";
import rawReferenceValues from "../src/data/reference-values.json";
import { ReferenceMultiplier, ReferenceValue } from "../src/data/schema";
import raw from "../src/data/weapons/one-thousand-voices.json";
import { activeParts, combinedMultiplier } from "../src/engine/effectParts";
import { loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const byIds = (ids: string[]) =>
  ids.map((id) => {
    const effect = effects.find((e) => e.id === id);
    if (!effect) throw new Error(`Unknown effect "${id}"`);
    return effect;
  });

const referenceValues = ReferenceValue.array()
  .parse(rawReferenceValues)
  .filter((r) => r.scenario !== undefined);
const referenceMultipliers = ReferenceMultiplier.array().parse(
  rawReferenceMultipliers,
);

describe("gate: total damage", () => {
  it.each(referenceValues.map((r) => [r.id, r] as const))(
    "matches %s",
    (_, reference) => {
      const scenario = reference.scenario!;
      const scenarioWeapon = scenario.withIntrinsicParts
        ? weapon
        : { ...weapon, intrinsicParts: [] };
      const { totalDamage } = simulate(
        scenarioWeapon,
        scenario.damagePhaseSeconds,
        byIds(scenario.effectIds),
        buckets,
      );
      expect(totalDamage).toBeGreaterThanOrEqual(reference.totalDamageMin);
      expect(totalDamage).toBeLessThanOrEqual(reference.totalDamageMax);
    },
  );
});

describe("gate: multipliers", () => {
  it.each(referenceMultipliers.map((r) => [r.id, r] as const))(
    "matches %s",
    (_, reference) => {
      const { multiplierParts } = activeParts(
        byIds(reference.effectIds),
        buckets,
      );
      const multiplier = combinedMultiplier(multiplierParts, buckets, {
        damageSource: "weapon",
        element: weapon.element,
        weaponType: weapon.weaponType,
      });
      expect(multiplier).toBeGreaterThanOrEqual(reference.multiplierMin);
      expect(multiplier).toBeLessThanOrEqual(reference.multiplierMax);
    },
  );
});
