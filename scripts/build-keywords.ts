// Finds the keyword sources in the Compendium subclass texts (ADR 0015, U4b), derives the keywords of
// the abilities (U5) and writes src/data/ability-keywords.json and the review table
// docs/keyword-sources.md. No download: run npm run import:compendium and import:abilities first.
// Run: npm run build:keywords

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { loadKeywordInputs } from "./lib/keywordInputs.ts";
import {
  abilityKeywords,
  findKeywordSources,
  renderKeywordSources,
} from "./lib/keywordSources.ts";

const ROOT = new URL("../", import.meta.url);
const inputs = loadKeywordInputs();
const sources = findKeywordSources(inputs.compendium);
const abilities = abilityKeywords(inputs);
writeFileSync(
  new URL("src/data/ability-keywords.json", ROOT),
  await format(JSON.stringify(abilities.entries), { parser: "json" }),
);
writeFileSync(
  new URL("docs/keyword-sources.md", ROOT),
  renderKeywordSources(sources, abilities),
);
console.log(
  `Wrote ${sources.length} keyword sources and ${abilities.entries.length} ability keywords (${abilities.gaps.length} gaps); review docs/keyword-sources.md`,
);
