// Reads the Data Files the keyword rules need (ADR 0015, U4b and U5). Shared by npm run build:keywords
// and the tests that check the generated files are current.

import { readFileSync } from "node:fs";
import {
  AbilityData,
  AegisAbilityRow,
  CompendiumSnapshot,
  keywordDataOf,
  SuperTiming,
} from "../../src/data/schema.ts";
import type { KeywordInputs } from "./keywordSources.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadKeywordInputs(): KeywordInputs {
  return {
    compendium: CompendiumSnapshot.parse(read("compendium-abilities.json"))
      .entries,
    abilities: AbilityData.array().parse(read("abilities.json")),
    aegisRows: AegisAbilityRow.array().parse(read("aegis-abilities.json")),
    keywords: keywordDataOf(read("keywords.json")),
    superTimings: SuperTiming.array().parse(read("super-timings.json")),
  };
}
