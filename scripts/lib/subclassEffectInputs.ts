// Reads the Data Files the subclass effects need (ADR 0015, U6-2). Shared by npm run build:keywords
// and the tests that check the generated files are current.

import { existsSync, readFileSync } from "node:fs";
import {
  AbilityData,
  AegisAbilityRow,
  AegisTotalsSnapshot,
  ClaritySnapshot,
  CompendiumSnapshot,
  CourtSnapshot,
  Effect,
  ExoticArmorEntry,
  ManifestAbilities,
} from "../../src/data/schema.ts";
import { findKeywordSources } from "./keywordSources.ts";
import type { SubclassEffectInputs } from "./subclassEffects.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadSubclassEffectInputs(): SubclassEffectInputs {
  const compendium = CompendiumSnapshot.parse(read("compendium-abilities.json"));
  const court = CourtSnapshot.parse(read("court-buffs.json"));
  const manifest = ManifestAbilities.parse(read("manifest-abilities.json"));
  const totals = AegisTotalsSnapshot.parse(read("aegis-totals.json"));
  return {
    compendium: compendium.entries,
    subclassItems: manifest.subclassItems ?? [],
    court: court.entries,
    keywordSources: findKeywordSources(compendium.entries),
    effects: Effect.array().parse(read("effects.json")),
    reservedIds: Effect.array().parse(read("buff-effects.json")).map((e) => e.id),
    abilities: AbilityData.array().parse(read("abilities.json")),
    aegisRows: AegisAbilityRow.array().parse(read("aegis-abilities.json")),
    aegisTotals: totals.rows,
    variantExoticNames: ExoticArmorEntry.array()
      .parse(read("exotic-armor.json"))
      .filter((e) => e.kind === "abilityVariant")
      .map((e) => e.name),
    meleeNames: [
      ...new Set(manifest.abilities.filter((a) => a.kind === "melee").map((a) => a.name)),
    ],
    sources: {
      court: court.source,
      compendium: compendium.source,
      clarity: ClaritySnapshot.parse(read("clarity.json")).source,
      aegisTotals: totals.source,
    },
    codes: existsSync(new URL("effect-codes.json", DATA))
      ? (read("effect-codes.json") as Record<string, number>)
      : {},
  };
}
