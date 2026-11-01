// Multipliers that apply to single abilities, and included multipliers that are taken out of
// Aegis packages (ADR 0009 point 5, amended 2026-10-20).

import { describe, expect, it } from "vitest";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawManifest from "../src/data/manifest-abilities.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import {
  AegisAbilityRow,
  ManifestAbilities,
  type AegisAbilityRow as Row,
  type MultiplierPart,
} from "../src/data/schema";
import { bucketMultipliers } from "../src/engine/effectParts";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { shotsOnly } from "./support/testWeapon";
import { simulate } from "../src/engine/simulate";

const weapon = shotsOnly(loadWeapon(raw));
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const abilityStats = loadAbilityStats(rawAbilityStats);
const rows = AegisAbilityRow.array().parse(rawRows);
const byId = (id: string) => effects.find((e) => e.id === id)!;

const source = {
  name: "test",
  retrieved: "2026-10-20",
  status: "verified",
} as const;

describe("multiplier parts for single abilities", () => {
  // Test part; the value is a test input, not a game value.
  const part: MultiplierPart = {
    type: "multiplier",
    bucketId: "empowering",
    multiplier: { value: 1.2, source },
    damageSources: ["super"],
    abilityIds: ["golden-gun-marksman"],
  };
  const multiplierFor = (abilityId?: string) =>
    bucketMultipliers([part], buckets, {
      damageSource: "super",
      element: "solar",
      abilityId,
    })[0]?.multiplier ?? 1;

  it("applies to the listed abilities", () => {
    expect(multiplierFor("golden-gun-marksman")).toBe(1.2);
  });

  it("does not apply to other abilities of the same damage source", () => {
    expect(multiplierFor("thundercrash")).toBe(1);
    expect(multiplierFor(undefined)).toBe(1);
  });
});

describe("included multipliers in Aegis packages", () => {
  // Test row in the format of the Aegis import; values are test inputs, not game values.
  const testRow = (includedEffectIds: string[]): Row => ({
    id: "test-row",
    category: "super",
    name: "test",
    assumptions: [],
    includedEffectIds,
    primaryTick: "",
    secondaryTicks: "",
    perUseStat100: { value: 1200, source },
    perUseStat200: { value: null, source: { ...source, status: "missing" } },
    gameVersion: "9.7.0.3",
  });
  const testAbility = {
    id: "golden-gun-marksman",
    code: 1,
    name: "Test Golden Gun",
    kind: "super",
    element: "solar",
    providers: [{ kind: "subclass" }],
    aegisRowId: "test-row",
    package: true,
  };
  const load = (includedEffectIds: string[]) =>
    loadAbilities(
      [testAbility],
      [testRow(includedEffectIds)],
      abilityStats,
      [],
      {
        effects,
        buckets,
      },
    )[0].components[0];

  it("takes an included multiplier that applies to the ability out of the value", () => {
    const component = load(["radiant"]);
    expect(component.damagePerTick.value).toBeCloseTo(1200 / 1.2);
    expect(component.normalisedEffectIds).toEqual(["radiant"]);
    expect(component.includedEffectIds).toEqual([]);
  });

  it("keeps included effects that are no multiplier for the ability", () => {
    const component = load(["ember-of-ashes"]);
    expect(component.damagePerTick.value).toBeCloseTo(1200);
    expect(component.includedEffectIds).toEqual(["ember-of-ashes"]);
    expect(component.normalisedEffectIds ?? []).toEqual([]);
  });

  it("keeps the value without effects to normalise with", () => {
    const [ability] = loadAbilities(
      [testAbility],
      [testRow(["radiant"])],
      abilityStats,
    );
    expect(ability.components[0].damagePerTick.value).toBeCloseTo(1200);
  });
});

describe("Golden Gun with Radiant and Well of Radiance", () => {
  const abilities = loadAbilities(
    rawAbilities,
    rows,
    abilityStats,
    ManifestAbilities.parse(rawManifest).abilities,
    { effects, buckets },
  );
  const marksman = abilities.find((a) => a.id === "golden-gun-marksman")!;
  const aegisValue = rows.find((r) => r.id === marksman.aegisRowId)!
    .perUseStat100.value!;
  const damageWith = (effectIds: string[]) =>
    simulate(weapon, 30, effectIds.map(byId), buckets, {
      abilities: [{ ability: marksman, castsMs: [0] }],
    })
      .damageInstances.filter((d) => d.abilityId === marksman.id)
      .reduce((sum, d) => sum + d.damage, 0);

  it("matches the Aegis value with Radiant, as Aegis measured it", () => {
    expect(damageWith(["radiant"])).toBeCloseTo(aegisValue);
  });

  it("is 20 % lower without Radiant", () => {
    expect(damageWith([])).toBeCloseTo(aegisValue / 1.2);
  });

  it("counts Well of Radiance as Radiant", () => {
    expect(damageWith(["well-of-radiance"])).toBeCloseTo(aegisValue);
  });

  it("does not stack Radiant and Well of Radiance", () => {
    expect(damageWith(["radiant", "well-of-radiance"])).toBeCloseTo(aegisValue);
  });

  it("leaves Radiant on other supers unchanged", () => {
    const thundercrash = abilities.find((a) => a.id === "thundercrash")!;
    const damage = (effectIds: string[]) =>
      simulate(weapon, 30, effectIds.map(byId), buckets, {
        abilities: [{ ability: thundercrash, castsMs: [0] }],
      })
        .damageInstances.filter((d) => d.abilityId === thundercrash.id)
        .reduce((sum, d) => sum + d.damage, 0);
    expect(damage(["radiant"])).toBeCloseTo(damage([]));
  });
});
