// Baseline for the unified mechanics model (ADR 0015, point 10): the Total Damage of every weapon,
// ability and selectable exotic armor piece before the refactor. A step of the refactor may change
// a value only where it intends to; update the file with `npx vitest -u` and explain the change in
// the commit.

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
import { exoticArmorEffects } from "../src/engine/exoticArmor";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { loadWeapon, loadWeapons } from "../src/engine/loadWeapon";
import { loadKeywords } from "../src/engine/loadKeywords";
import { simulate } from "../src/engine/simulate";
import { hasCatalyst } from "../src/engine/weaponInfo";
import rawHandModel from "./fixtures/one-thousand-voices-hand-model.json";
import { rawWeapons } from "./support/weapons";

const SNAPSHOT = "./__snapshots__/mechanics-baseline.json";
const DAMAGE_PHASES_SECONDS = [30, 600]; // a short damage phase and full ammo
// About 2 s alone; in the full parallel run it passed the default 5 s now and then.
const TIMEOUT_MS = 30_000;
const ABILITY_DAMAGE_PHASE_SECONDS = 120;
const ABILITY_STATS = [100, 200];
const BUFFED_EFFECT_IDS = ["weaken", "surge-3x", "radiant"];

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
// Abilities and exotics run next to the former hand model, so their values stay comparable.
const otv = loadWeapon(rawHandModel);
const keywords = loadKeywords(
  rawKeywords,
  AegisAbilityRow.array().parse(rawRows),
);
const buffed = BUFFED_EFFECT_IDS.map((id) => effects.find((e) => e.id === id)!);

const round = (value: number) => Math.round(value * 100) / 100;

/** Total Damage, or the error message if the simulator rejects the input. */
function total(run: () => number): number | string {
  try {
    return round(run());
  } catch (error) {
    return `error: ${(error as Error).message}`;
  }
}

function weaponTotals(weapon: Weapon): Record<string, number | string> {
  const result: Record<string, number | string> = {};
  const catalysts = hasCatalyst(weapon) ? [false, true] : [false];
  for (const seconds of DAMAGE_PHASES_SECONDS) {
    for (const catalyst of catalysts) {
      for (const [label, selected] of [
        ["plain", []],
        ["buffed", buffed],
      ] as [string, Effect[]][]) {
        const key = `${seconds}s ${label}${catalyst ? " catalyst" : ""}`;
        result[key] = total(
          () =>
            simulate(weapon, seconds, selected, buckets, { catalyst, keywords })
              .totalDamage,
        );
      }
    }
  }
  return result;
}

function abilityTotals(): Record<string, Record<string, number | string>> {
  const result: Record<string, Record<string, number | string>> = {};
  // class abilities deal no damage of their own (U7)
  for (const ability of abilities.filter((a) => a.kind !== "classAbility")) {
    const scaling = abilityStats.find((s) => s.kind === ability.kind)!;
    result[ability.id] = Object.fromEntries(
      ABILITY_STATS.map((stat) => [
        `stat ${stat}`,
        total(
          () =>
            simulate(otv, ABILITY_DAMAGE_PHASE_SECONDS, [], buckets, {
              abilities: [{ ability, castsMs: [0] }],
              abilityStats: [{ scaling, value: stat }],
              keywords,
            }).totalDamage,
        ),
      ]),
    );
  }
  return result;
}

function exoticArmorTotals(preBuilt = false): Record<string, number | string> {
  return Object.fromEntries(
    armor
      .filter((entry) => entry.kind !== "noDamage" && entry.kind !== "gap")
      .filter(
        (entry) =>
          !preBuilt ||
          generated.some(
            (g) => g.exoticArmorId === entry.id && g.activation === "preBuilt",
          ),
      )
      .map((entry) => [
        entry.id,
        total(
          () =>
            simulate(
              otv,
              600,
              exoticArmorEffects(entry, effects, generated, { preBuilt }),
              buckets,
            ).totalDamage,
        ),
      ]),
  );
}

describe("mechanics baseline (ADR 0015)", () => {
  it("covers all weapons, abilities and exotic armor", () => {
    expect(weapons.length).toBeGreaterThan(49);
    expect(abilities.length).toBeGreaterThan(70);
  });

  it("keeps the Total Damage of the baseline", async () => {
    const baseline = {
      weapons: Object.fromEntries(weapons.map((w) => [w.id, weaponTotals(w)])),
      abilities: abilityTotals(),
      exoticArmorOnOneThousandVoices: exoticArmorTotals(),
      // ADR 0015, U6-1: kill buffs built up before the damage phase
      exoticArmorPreBuiltOnOneThousandVoices: exoticArmorTotals(true),
    };
    await expect(JSON.stringify(baseline, null, 2) + "\n").toMatchFileSnapshot(
      SNAPSHOT,
    );
  }, TIMEOUT_MS);
});
