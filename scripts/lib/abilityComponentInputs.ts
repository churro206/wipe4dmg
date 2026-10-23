// Reads the Data Files the ability component rules need (ADR 0009, U9). Shared by
// npm run build:abilities and the tests that check the generated files are current.

import { readFileSync } from "node:fs";
import {
  AbilityData,
  AbilityKeyword,
  AbilityStatScaling,
  AegisAbilityRow,
  CompendiumSnapshot,
  SuperTiming,
} from "../../src/data/schema.ts";
import type { AbilityComponentInputs } from "./abilityComponents.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadAbilityComponentInputs(): AbilityComponentInputs {
  const compendium = CompendiumSnapshot.parse(read("compendium-abilities.json"));
  return {
    compendium: compendium.entries,
    retrieved: compendium.source.retrieved,
    abilities: AbilityData.array().parse(read("abilities.json")),
    aegisRows: AegisAbilityRow.array().parse(read("aegis-abilities.json")),
    abilityKeywords: AbilityKeyword.array().parse(read("ability-keywords.json")),
    superTimings: SuperTiming.array().parse(read("super-timings.json")),
    abilityStats: AbilityStatScaling.array().parse(read("ability-stats.json")),
  };
}
