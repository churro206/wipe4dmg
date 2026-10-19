// Gate for abilities (ADR 0009): every ability with an Aegis row, simulated alone without effects,
// must match the Aegis value per use at stat 100 and stat 200 within the tolerance.

import { describe, expect, it } from "vitest";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawManifest from "../src/data/manifest-abilities.json";
import raw from "../src/data/weapons/one-thousand-voices.json";
import {
  AegisAbilityRow,
  ManifestAbilities,
  type Ability,
} from "../src/data/schema";
import { loadAbilities } from "../src/engine/loadAbilities";
import { loadAbilityStats, loadBuckets } from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const TOLERANCE = 0.1; // ±10 %, ADR 0009
const LONG_DAMAGE_PHASE_SECONDS = 120;

const weapon = loadWeapon(raw);
const buckets = loadBuckets(rawBuckets);
const abilityStats = loadAbilityStats(rawAbilityStats);
const rows = AegisAbilityRow.array().parse(rawRows);
const abilities = loadAbilities(
  rawAbilities,
  rows,
  abilityStats,
  ManifestAbilities.parse(rawManifest).abilities,
);

/** Damage of one cast of the ability alone, without effects, at the given stat. */
function perUse(ability: Ability, stat: number): number {
  const scaling = abilityStats.find((s) => s.kind === ability.kind)!;
  const result = simulate(weapon, LONG_DAMAGE_PHASE_SECONDS, [], buckets, {
    abilities: [{ ability, castsMs: [0] }],
    abilityStats: [{ scaling, value: stat }],
  });
  return result.damageInstances
    .filter((d) => d.abilityId === ability.id)
    .reduce((sum, d) => sum + d.damage, 0);
}

const gated = abilities.filter((a) => a.aegisRowId);

describe("ability gate against Aegis", () => {
  it("has abilities to check", () => {
    expect(gated.length).toBeGreaterThan(0);
  });

  for (const ability of gated) {
    const row = rows.find((r) => r.id === ability.aegisRowId);

    it(`${ability.id} refers to an Aegis row that Aegis normalised`, () => {
      expect(row, ability.aegisRowId).toBeDefined();
      expect(row!.perUseStat100.source.status).not.toBe("missing");
      expect(row!.perUseStat100.source.note).not.toContain("not normalised");
    });

    for (const [stat, value] of [
      [100, row?.perUseStat100.value],
      [200, row?.perUseStat200.value],
    ] as const) {
      if (value === null || value === undefined) continue;
      it(`${ability.id} matches Aegis at stat ${stat} within ${TOLERANCE * 100}%`, () => {
        expect(perUse(ability, stat) / value).toBeGreaterThanOrEqual(
          1 - TOLERANCE,
        );
        expect(perUse(ability, stat) / value).toBeLessThanOrEqual(
          1 + TOLERANCE,
        );
      });
    }
  }
});
