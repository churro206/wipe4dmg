// Generates the ability energy (cooldowns, stat factors, modifiers of exotics, aspects and abilities)
// from the Compendium snapshots into src/data/ability-energy.json and the review table
// docs/energy-import.md. No download: run npm run import:compendium first to refresh the source.
// Run: npm run build:energy

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { energyData, renderEnergy } from "./lib/energy.ts";
import { loadEnergyInputs } from "./lib/energyInputs.ts";

const ROOT = new URL("../", import.meta.url);
const { data, rows } = energyData(loadEnergyInputs());
writeFileSync(
  new URL("src/data/ability-energy.json", ROOT),
  await format(JSON.stringify(data), { parser: "json" }),
);
writeFileSync(new URL("docs/energy-import.md", ROOT), renderEnergy(data, rows));
const unclassified = rows.filter((r) => r.verdict === "unclassified");
console.log(
  `Wrote ${data.abilities.length} cooldowns and ${data.modifiers.length} modifiers from ${rows.length} Compendium lines (${unclassified.length} unclassified); review docs/energy-import.md`,
);
for (const row of unclassified) console.log(`  unclassified: ${row.name} | ${row.line.slice(0, 110)}`);
