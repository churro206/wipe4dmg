// Ability variants measured with an exotic armor piece (ADR 0014, rule 1), generated from the Aegis
// rows the armor import names: same ability and assumptions as the base row plus the exotic.

import { describe, expect, it } from "vitest";
import rawAbilityKeywords from "../src/data/ability-keywords.json";
import rawAbilityStats from "../src/data/ability-stats.json";
import rawAbilities from "../src/data/abilities.json";
import rawRows from "../src/data/aegis-abilities.json";
import rawBuckets from "../src/data/buckets.json";
import rawEffects from "../src/data/effects.json";
import rawArmor from "../src/data/exotic-armor.json";
import rawManifest from "../src/data/manifest-abilities.json";
import {
  AbilityKeyword,
  AegisAbilityRow,
  ExoticArmorEntry,
  ManifestAbilities,
} from "../src/data/schema";
import { abilitySimulation } from "../src/engine/buildAbilities";
import { loadAbilities } from "../src/engine/loadAbilities";
import {
  loadAbilityStats,
  loadBuckets,
  loadEffects,
} from "../src/engine/loadData";
import { abilitiesFor } from "../src/engine/providers";
import { superWindowMs } from "../src/engine/superWindow";

const buckets = loadBuckets(rawBuckets);
const effects = loadEffects(rawEffects);
const rows = AegisAbilityRow.array().parse(rawRows);
const stats = loadAbilityStats(rawAbilityStats);
const abilities = loadAbilities(
  rawAbilities,
  rows,
  stats,
  ManifestAbilities.parse(rawManifest).abilities,
  { effects, buckets },
  AbilityKeyword.array().parse(rawAbilityKeywords),
  ExoticArmorEntry.array().parse(rawArmor),
);
const perUse = (id: string) =>
  abilities
    .find((a) => a.id === id)!
    .components.reduce((sum, c) => sum + (c.damagePerTick.value ?? 0), 0);
const rowValue = (id: string) =>
  rows.find((r) => r.id === id)!.perUseStat100.value!;

describe("ability variants with exotic armor", () => {
  it("Thundercrash with Cuirass of the Falling Star from its Aegis row", () => {
    const variant = abilities.find(
      (a) =>
        a.variantOf === "thundercrash" &&
        a.exoticArmorId === "cuirass-of-the-falling-star",
    )!;
    expect(variant.aegisRowId).toBe(
      "super-thundercrash-cuirass-of-the-falling-star",
    );
    // the ratio of the Aegis rows stays: with / without
    expect(perUse(variant.id) / perUse("thundercrash")).toBeCloseTo(
      rowValue("super-thundercrash-cuirass-of-the-falling-star") /
        rowValue("super-thundercrash"),
    );
  });

  it("Golden Gun: Marksman with Celestial Nighthawk: one shot, so the super window ends with it", () => {
    const variant = abilities.find(
      (a) =>
        a.variantOf === "golden-gun-marksman" &&
        a.exoticArmorId === "celestial-nighthawk",
    )!;
    expect(variant.usage).toMatchObject({ type: "shots", shots: { value: 1 } });
    expect(superWindowMs(variant.usage!).durationMs).toBe(0);
  });

  it("the build uses the variant while the exotic is worn", () => {
    const build = (exoticArmorId?: string) =>
      abilitySimulation(
        { abilities: [{ abilityId: "thundercrash", castsMs: [0] }], exoticArmorId },
        abilities,
        stats,
        effects,
      ).casts[0].ability;
    expect(build("cuirass-of-the-falling-star").exoticArmorId).toBe(
      "cuirass-of-the-falling-star",
    );
    expect(build().id).toBe("thundercrash");
  });

  it("lists the generated variants", () => {
    expect(
      abilities.filter((a) => a.variantOf).map((a) => a.id),
    ).toMatchSnapshot();
  });

  it("does not offer a variant as an ability of its own", () => {
    expect(
      abilitiesFor(abilities, "super", "titan", "arc").filter((a) => a.variantOf),
    ).toEqual([]);
  });
});
