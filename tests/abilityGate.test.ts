// Gate for abilities (ADR 0009): every ability with an Aegis row, simulated alone, must match the
// Aegis value per use at stat 100 and stat 200 within the tolerance. Multipliers taken out of a
// package (e.g. Radiant in Golden Gun) are active, as in the Aegis measurement.

import { describe, expect, it } from "vitest";
import rawAbilityComponents from "../src/data/ability-components.json";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawKeywords from "../src/data/keywords.json";
import rawManifest from "../src/data/manifest-abilities.json";
import rawSuperTimings from "../src/data/super-timings.json";
import raw from "./fixtures/one-thousand-voices-hand-model.json";
import { COMPONENT_TOLERANCE } from "../scripts/lib/abilityComponents";
import {
  AbilityComponents,
  AbilityKeyword,
  AegisAbilityRow,
  ManifestAbilities,
  SuperTiming,
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

const TOLERANCE = COMPONENT_TOLERANCE; // ±15 % (owner, 2026-10-23; ADR 0009 had ±10 %)
const LONG_DAMAGE_PHASE_SECONDS = 120;

// The weapon only stands by: no scorch of its own and no damage, so the keyword counters belong to
// the ability and only its own hits set off Jolt or Volatile, as in the Aegis measurement.
const standBy = loadWeapon(raw);
const weapon = {
  ...standBy,
  intrinsicParts: [],
  damageInstances: standBy.damageInstances.map((d) => ({
    ...d,
    damagePerTick: { ...d.damagePerTick, value: 0 },
  })),
};
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
  [],
  SuperTiming.array().parse(rawSuperTimings),
  AbilityComponents.array().parse(rawAbilityComponents),
);
const CAST_GAP_MS = 5000; // further apart than every keyword cooldown
// Scorch stacks fall after 2.3 s without new ones (burn, ADR 0017 S2): casts of an Ignition package
// follow each other within that hold time, and after the Ignition cooldown of 1.3 s.
const SCORCH_CAST_GAP_MS = 1500;
// A package with keyword damage taken out must give back the measurement. 2.5 %: a super row takes
// out the plain Ignition row (1553), but Aegis' ignitions had Radiant like the shots ("Ignition
// damage can be increased ... if the initial Scorch source had a damage increase", Compendium).
const BAKED_TOLERANCE = 0.025;

/**
 * Damage per use of the ability alone at the given stat, with the effects Aegis measured. Where
 * Aegis counted keyword damage into the package (ADR 0015, U5), the measurement is replayed with its
 * number of uses. All keyword damage of the ability counts: the weapon applies none, and keyword
 * damage on top of a package that already holds it would count twice.
 */
function perUse(ability: Ability, stat: number): number {
  const scaling = abilityStats.find((s) => s.kind === ability.kind)!;
  // components from the Compendium hold no effects; Aegis' assumptions (e.g. Ember) apply as effects
  const row = rows.find((r) => r.id === ability.aegisRowId);
  const measuredIds = new Set([
    ...(ability.package ? [] : (row?.includedEffectIds ?? [])),
    ...ability.components.flatMap((c) => [
      ...(c.normalisedEffectIds ?? []),
      ...(c.includedEffectIds ?? []),
    ]),
  ]);
  const measured = effects.filter((e) => measuredIds.has(e.id));
  const baked = abilityKeywords.filter(
    (k) => k.abilityId === ability.id && k.bakedInPackage,
  );
  const uses = baked[0]?.bakedInPackage?.uses ?? 1;
  const gapMs = baked.some((k) => k.keywordId === "ignition")
    ? SCORCH_CAST_GAP_MS
    : CAST_GAP_MS;
  const result = simulate(
    weapon,
    LONG_DAMAGE_PHASE_SECONDS + (uses * gapMs) / 1000,
    measured,
    buckets,
    {
      abilities: [
        {
          ability,
          castsMs: Array.from({ length: uses }, (_, i) => i * gapMs),
        },
      ],
      abilityStats: [{ scaling, value: stat }],
      keywords,
    },
  );
  // The burn of scorch is no part of Aegis' package (it holds the ignitions, ADR 0015 U5): the core
  // adds it since ADR 0017 S2, so it stays out of this comparison (+3 % on two packages if counted).
  const total = result.damageInstances
    .filter(
      (d) =>
        d.id !== "burn" &&
        (d.abilityId === ability.id || d.keywordId !== undefined),
    )
    .reduce((sum, d) => sum + d.damage, 0);
  return total / uses;
}

const gated = abilities.filter((a) => a.aegisRowId);

// Rows with Full Modifiers 1.00 that Aegis' tab Swap itself takes as the normalised base (then times
// debuff and stat), and whose own assumptions are play style only.
const SWAP_BASE: Record<string, string> = {
  "super-glacial-quake-heavy-attacks":
    "Swap bases ≈ Abilities rows: heavy attacks + Biotic Enhancements 60,066 vs 62,925, + Feast of Light x6 + Hail the Storm 84,125 vs 81,892",
  "super-song-of-flame-snap-spam":
    "All Song of Flame rows have Full Modifiers 1.00 and Swap takes them as base (Warlord's Fury, One-Two Punch, Celestial Fire spam, Ember of Ashes, Shieldcrush: 90,741 vs 110,884); stat 200 / 100 = 1.450, the full super stat; Flat Gain / Aegis ×1.49 like the normalised supers",
  "super-song-of-flame-dawn-chorus-snap-spam":
    "same block as snap spam, with Dawn Chorus",
};

describe("ability gate against Aegis", () => {
  it("has abilities to check", () => {
    expect(gated.length).toBeGreaterThan(0);
  });

  for (const ability of gated) {
    const row = rows.find((r) => r.id === ability.aegisRowId);

    it(`${ability.id} refers to an Aegis row that Aegis normalised`, () => {
      expect(row, ability.aegisRowId).toBeDefined();
      expect(row!.perUseStat100.source.status).not.toBe("missing");
      if (!SWAP_BASE[row!.id])
        expect(row!.perUseStat100.source.note).not.toContain("not normalised");
    });

    for (const [stat, value] of [
      [100, row?.perUseStat100.value],
      [200, row?.perUseStat200.value],
    ] as const) {
      if (value === null || value === undefined) continue;
      it(`${ability.id} matches Aegis at stat ${stat} within ${TOLERANCE * 100}%`, () => {
        // without the factor of buffs no effect describes, e.g. Feast of Light x6 on Bladefury
        const expected = value / (ability.includedFactor?.value ?? 1);
        expect(perUse(ability, stat) / expected).toBeGreaterThanOrEqual(
          1 - TOLERANCE,
        );
        expect(perUse(ability, stat) / expected).toBeLessThanOrEqual(
          1 + TOLERANCE,
        );
      });
    }
  }

  it("rule: every package with a keyword gives back the Aegis value (±2.5 %), nothing counts twice", () => {
    const off = gated
      .filter(
        (a) => a.package && abilityKeywords.some((k) => k.abilityId === a.id),
      )
      .map((a) => {
        const row = rows.find((r) => r.id === a.aegisRowId)!;
        return { id: a.id, ratio: perUse(a, 100) / row.perUseStat100.value! };
      })
      .filter(({ ratio }) => Math.abs(ratio - 1) > BAKED_TOLERANCE);
    expect(off).toEqual([]);
  });
});
