// Parity of the new core with the old simulator (ADR 0017, stage S1): simulateCore() must give the
// same shots, reloads and damage as simulate() for every case of the mechanics baseline and every
// scenario of the bench. Stage S6 drops this test together with the old simulator.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawArmor from "../src/data/exotic-armor.json";
import rawGenerated from "../src/data/exotic-armor-effects.json";
import rawKeywords from "../src/data/keywords.json";
import rawManifest from "../src/data/manifest-abilities.json";
import {
  AbilityKeyword,
  AegisAbilityRow,
  ExoticArmorEffect,
  ExoticArmorEntry,
  ManifestAbilities,
  type Effect,
  type Weapon,
} from "../src/data/schema";
import { simulateCore } from "../src/engine/core/simulateCore";
import { exoticArmorEffects } from "../src/engine/exoticArmor";
import { loadAbilities } from "../src/engine/loadAbilities";
import { loadAbilityStats, loadBuckets, loadEffects } from "../src/engine/loadData";
import { loadKeywords } from "../src/engine/loadKeywords";
import { loadWeapon, loadWeapons } from "../src/engine/loadWeapon";
import { simulate, type SimulationOptions } from "../src/engine/simulate";
import { hasCatalyst } from "../src/engine/weaponInfo";
import rawHandModel from "./fixtures/one-thousand-voices-hand-model.json";
import { modelTotal, Scenario } from "./lib/scenarioBench";
import { rawWeapons } from "./support/weapons";

// The old simulator takes about 2 s for the whole matrix; the core runs it twice here.
const TIMEOUT_MS = 60_000;
const RELATIVE_TOLERANCE = 1e-9;

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const abilityStats = loadAbilityStats(rawAbilityStats);
const abilities = loadAbilities(
  rawAbilities,
  AegisAbilityRow.array().parse(rawRows),
  abilityStats,
  ManifestAbilities.parse(rawManifest).abilities,
  { effects, buckets },
  AbilityKeyword.array().parse(rawAbilityKeywords),
);
const armor = ExoticArmorEntry.array().parse(rawArmor);
const generated = ExoticArmorEffect.array().parse(rawGenerated);
const weapons = loadWeapons(rawWeapons);
const otv = loadWeapon(rawHandModel);
const keywords = loadKeywords(rawKeywords, AegisAbilityRow.array().parse(rawRows));
const buffed = ["weaken", "surge-3x", "radiant"].map(
  (id) => effects.find((e) => e.id === id)!,
);

/** Both simulators on the same input: equal shots, reloads, hits and damage, or the same error. */
function expectSame(
  label: string,
  weapon: Weapon,
  seconds: number,
  selected: Effect[],
  options: SimulationOptions,
) {
  const run = (f: typeof simulate) => {
    try {
      return f(weapon, seconds, selected, buckets, options);
    } catch (error) {
      return (error as Error).message;
    }
  };
  const old = run(simulate);
  const core = run(simulateCore);
  if (typeof old === "string" || typeof core === "string") {
    expect(core, label).toBe(old);
    return;
  }
  expect(core.shots, label).toEqual(old.shots);
  expect(core.reloadsMs, label).toEqual(old.reloadsMs);
  expect(core.damageInstances.length, label).toBe(old.damageInstances.length);
  expect(
    Math.abs(core.totalDamage - old.totalDamage),
    `${label}: ${core.totalDamage} against ${old.totalDamage}`,
  ).toBeLessThanOrEqual(RELATIVE_TOLERANCE * Math.max(1, old.totalDamage));
}

describe("core parity (ADR 0017, S1)", () => {
  it("matches the old simulator on every weapon of the baseline", () => {
    for (const weapon of weapons) {
      for (const seconds of [30, 600]) {
        for (const catalyst of hasCatalyst(weapon) ? [false, true] : [false]) {
          for (const [label, selected] of [
            ["plain", []],
            ["buffed", buffed],
          ] as [string, Effect[]][]) {
            expectSame(`${weapon.id} ${seconds}s ${label} ${catalyst}`, weapon, seconds, selected, {
              catalyst,
              keywords,
            });
          }
        }
      }
    }
  }, TIMEOUT_MS);

  it("matches on every ability next to the former hand model", () => {
    for (const ability of abilities.filter((a) => a.kind !== "classAbility")) {
      const scaling = abilityStats.find((s) => s.kind === ability.kind)!;
      expectSame(ability.id, otv, 120, [], {
        abilities: [{ ability, castsMs: [0] }],
        abilityStats: [{ scaling, value: 200 }],
        keywords,
      });
    }
  }, TIMEOUT_MS);

  it("matches on every exotic armor piece", () => {
    for (const entry of armor.filter((e) => e.kind !== "noDamage" && e.kind !== "gap")) {
      for (const preBuilt of [false, true]) {
        expectSame(
          `${entry.id} ${preBuilt}`,
          otv,
          600,
          exoticArmorEffects(entry, effects, generated, { preBuilt }),
          {},
        );
      }
    }
  }, TIMEOUT_MS);

  it("matches on every scenario of the bench", () => {
    const scenarios = readdirSync("tests/scenarios")
      .filter((file) => file.endsWith(".json"))
      .sort()
      .flatMap((file) =>
        Scenario.array().parse(
          JSON.parse(readFileSync(join("tests/scenarios", file), "utf8")),
        ),
      );
    expect(scenarios.length).toBeGreaterThan(30);
    for (const s of scenarios) {
      const old = modelTotal(s, simulate);
      const core = modelTotal(s, simulateCore);
      if (old === null || core === null) {
        expect(core, s.id).toBe(old);
        continue;
      }
      expect(Math.abs(core - old), s.id).toBeLessThanOrEqual(
        RELATIVE_TOLERANCE * Math.max(1, old),
      );
    }
  }, TIMEOUT_MS);
});
