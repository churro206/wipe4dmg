// Finds the keyword sources in the Compendium subclass texts (ADR 0015, U4b) and writes the review
// table docs/keyword-sources.md. No download: run npm run import:compendium first.
// Run: npm run build:keywords

import { readFileSync, writeFileSync } from "node:fs";
import { CompendiumSnapshot } from "../src/data/schema.ts";
import {
  findKeywordSources,
  renderKeywordSources,
} from "./lib/keywordSources.ts";

const ROOT = new URL("../", import.meta.url);
const compendium = CompendiumSnapshot.parse(
  JSON.parse(
    readFileSync(new URL("src/data/compendium-abilities.json", ROOT), "utf8"),
  ),
);
const sources = findKeywordSources(compendium.entries);
writeFileSync(
  new URL("docs/keyword-sources.md", ROOT),
  renderKeywordSources(sources),
);
console.log(
  `Wrote ${sources.length} keyword sources; review docs/keyword-sources.md`,
);
