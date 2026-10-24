// Generates the effects abilities grant at each cast or hit (e.g. Radiant from Acrobat's Dodge) from
// the Compendium and Court snapshots into src/data/ability-grants.json and the review table
// docs/ability-grants.md. No download: run npm run import:compendium first to refresh the source.
// Run: npm run build:grants

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { abilityGrants, renderGrants } from "./lib/abilityGrants.ts";
import { loadGrantInputs } from "./lib/grantInputs.ts";

const ROOT = new URL("../", import.meta.url);
const { grants, rows } = abilityGrants(loadGrantInputs());
writeFileSync(
  new URL("src/data/ability-grants.json", ROOT),
  await format(JSON.stringify(grants), { parser: "json" }),
);
writeFileSync(new URL("docs/ability-grants.md", ROOT), renderGrants(rows));
console.log(`Wrote ${grants.length} grants from ${rows.length} Compendium lines; review docs/ability-grants.md`);
