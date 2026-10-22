// Gate for abilities (ADR 0009): every ability with an Aegis row, simulated alone, must match the
// Aegis value per use at stat 100 and stat 200 within the tolerance. Multipliers taken out of a
// package (e.g. Radiant in Golden Gun) are active, as in the Aegis measurement.

import { describe, expect, it } from "vitest";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import rawManifest from "../src/data/manifest-abilities.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import {
  AbilityKeyword,
  AegisAbilityRow,
  ManifestAbilities,
  type Ability,
} from "../src/data/schema";
import { loadAbilities } from "../src/engine/loadAbilities";
import { loadKeywords } from "../src/engine/loadKeywords";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { loadWeapon } from "../src/engine/loadWeapon";
import { simulate } from "../src/engine/simulate";

const TOLERANCE = 0.1; // ±10 %, ADR 0009
const LONG_DAMAGE_PHASE_SECONDS = 120;

// The weapon only stands by: no scorch of its own, so the keyword counters belong to the ability.
const weapon = { ...loadWeapon(raw), intrinsicParts: [] };
const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const abilityStats = loadAbilityStats(rawAbilityStats);
const rows = AegisAbilityRow.array().parse(rawRows);
const abilityKeywords = AbilityKeyword.array().parse(rawAbilityKeywords);
const keywords = loadKeywords(rawKeywords, rows);
const abilities = loadAbilities(
  rawAbilities,
  rows,
  abilityStats,
  ManifestAbilities.parse(rawManifest).abilities,
  { effects, buckets },
  abilityKeywords,
);
const CAST_GAP_MS = 5000; // further apart than every keyword cooldown

/**
 * Damage per use of the ability alone at the given stat, with the effects Aegis measured. Where
 * Aegis counted keyword damage into the package (ADR 0015, U5), the measurement is replayed with its
 * number of uses and that keyword damage counts as well.
 */
function perUse(ability: Ability, stat: number): number {
  const scaling = abilityStats.find((s) => s.kind === ability.kind)!;
  const measuredIds = new Set(
    ability.components.flatMap((c) => [
      ...(c.normalisedEffectIds ?? []),
      ...(c.includedEffectIds ?? []),
    ]),
  );
  const measured = effects.filter((e) => measuredIds.has(e.id));
  const baked = abilityKeywords.filter(
    (k) => k.abilityId === ability.id && k.bakedInPackage,
  );
  const uses = baked[0]?.bakedInPackage?.uses ?? 1;
  const bakedIds = new Set(baked.map((k) => k.keywordId));
  const result = simulate(
    weapon,
    LONG_DAMAGE_PHASE_SECONDS + (uses * CAST_GAP_MS) / 1000,
    measured,
    buckets,
    {
      abilities: [
        {
          ability,
          castsMs: Array.from({ length: uses }, (_, i) => i * CAST_GAP_MS),
        },
      ],
      abilityStats: [{ scaling, value: stat }],
      keywords,
    },
  );
  const total = result.damageInstances
    .filter(
      (d) =>
        d.abilityId === ability.id ||
        (d.keywordId !== undefined && bakedIds.has(d.keywordId)),
    )
    .reduce((sum, d) => sum + d.damage, 0);
  return total / uses;
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
