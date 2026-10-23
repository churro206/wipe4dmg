// Derives ability components from the Compendium texts (ADR 0009, U9) and writes
// src/data/ability-components.json and the review table docs/ability-import.md. No download: run
// npm run import:compendium and import:abilities first, and build:keywords for the keyword damage.
// Run: npm run build:abilities

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { loadAbilityComponentInputs } from "./lib/abilityComponentInputs.ts";
import {
  abilityComponentRows,
  abilityComponentsData,
  renderAbilityImport,
} from "./lib/abilityComponents.ts";

const ROOT = new URL("../", import.meta.url);
const rows = abilityComponentRows(loadAbilityComponentInputs());
const data = abilityComponentsData(rows);
writeFileSync(
  new URL("src/data/ability-components.json", ROOT),
  await format(JSON.stringify(data), { parser: "json" }),
);
writeFileSync(new URL("docs/ability-import.md", ROOT), renderAbilityImport(rows));
console.log(
  `Wrote components of ${data.length} of ${rows.length} abilities; review docs/ability-import.md`,
);
