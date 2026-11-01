// Release gate (docs/requirements.md): results match the values of the data sources.
// Every reference with machine-readable conditions is checked here.

import { describe, expect, it } from "vitest";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawReferenceMultipliers from "../src/data/reference-multipliers.json";
import rawReferenceValues from "../src/data/reference-values.json";
import { ReferenceMultiplier, ReferenceValue } from "../src/data/schema";
import { activeParts, combinedMultiplier } from "../src/engine/effectParts";
import rawAbilityRows from "../src/data/aegis-abilities.json";
import rawKeywords from "../src/data/keywords.json";
import { AegisAbilityRow } from "../src/data/schema";
import rawWeaponStats from "../src/data/weapon-stats.json";
import {
  loadBuckets,
  loadEffects,
  loadWeaponStats,
} from "../src/engine/loadData";
import { weaponStatPart } from "../src/engine/weaponStats";
import { loadKeywords } from "../src/engine/loadKeywords";
import { simulate } from "../src/engine/simulate";
import { weaponById } from "./support/weapons";

const buckets = loadBuckets(rawBuckets);
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawAbilityRows),
);
const effects = loadEffects(rawEffects);
const weaponStats = loadWeaponStats(rawWeaponStats);
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
      const weapon = weaponById(reference.weaponId);
      // Shots only: without the intrinsic parts and the scorch the weapon applies by its rules
      const scenarioWeapon = scenario.withIntrinsicParts
        ? weapon
        : {
            ...weapon,
            intrinsicParts: [],
            rules: weapon.rules?.filter(
              (rule) => !rule.do.some((action) => action.type === "applyStatus"),
            ),
          };
      const { damageInstances } = simulate(
        scenarioWeapon,
        scenario.damagePhaseSeconds,
        byIds(scenario.effectIds),
        buckets,
        { keywords },
      );
      // The references count shots and ignitions; the burn of scorch (ADR 0017 S2) is not in them.
      const totalDamage = damageInstances
        .filter((d) => d.id !== "burn")
        .reduce((sum, d) => sum + d.damage, 0);
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
      const weapon = weaponById(reference.weaponId);
      const statPart =
        reference.weaponsStat === undefined
          ? null
          : weaponStatPart(
              { scalings: weaponStats, value: reference.weaponsStat },
              weapon.ammo,
            );
      const multiplier = combinedMultiplier(
        [...multiplierParts, ...(statPart ? [statPart] : [])],
        buckets,
        {
          damageSource: "weapon",
          element: weapon.element,
          weaponType: weapon.weaponType,
        },
      );
      expect(multiplier).toBeGreaterThanOrEqual(reference.multiplierMin);
      expect(multiplier).toBeLessThanOrEqual(reference.multiplierMax);
    },
  );
});
