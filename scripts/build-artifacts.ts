// Generates the seasonal artifacts with their perks into src/data/artifacts.json and the review
// table docs/artifact-import.md. No download: run npm run import:compendium first to refresh the
// source.
// Run: npm run build:artifacts

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { loadArtifactInputs } from "./lib/artifactInputs.ts";
import { buildArtifacts, renderArtifacts } from "./lib/artifacts.ts";

const ROOT = new URL("../", import.meta.url);
const inputs = loadArtifactInputs();
const { data, rows } = buildArtifacts(inputs);
writeFileSync(
  new URL("src/data/artifacts.json", ROOT),
  await format(JSON.stringify(data), { parser: "json" }),
);
writeFileSync(new URL("docs/artifact-import.md", ROOT), renderArtifacts(rows, inputs.effects));
const unclassified = rows.filter((r) => r.verdict === "unclassified");
console.log(
  `Wrote ${data.artifacts.length} artifacts with ${data.artifacts.reduce((n, a) => n + a.perks.length, 0)} perks from ${rows.length} Compendium perks (${unclassified.length} unclassified); review docs/artifact-import.md`,
);
for (const row of unclassified) console.log(`  unclassified: ${row.artifact} | ${row.perk}`);
