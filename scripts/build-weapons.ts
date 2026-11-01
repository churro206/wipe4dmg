// Builds the weapon packages from the snapshots (ADR 0013) and writes src/data/weapon-packages.json,
// src/data/weapon-gaps.json, src/data/weapon-codes.json and the review table docs/weapon-import.md.
// No download: run npm run import:weapons and npm run import:icons first to refresh the sources.
// Run: npm run build:weapons

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { loadWeaponImportInputs } from "./lib/weaponImportInputs.ts";
import { buildWeaponImport } from "./lib/weaponPackages.ts";
import { renderWeaponImport } from "./lib/weaponReport.ts";

const ROOT = new URL("../", import.meta.url);
const result = buildWeaponImport(loadWeaponImportInputs());

const writeJson = async (file: string, data: unknown) =>
  writeFileSync(
    new URL(`src/data/${file}`, ROOT),
    await format(JSON.stringify(data), { parser: "json" }),
  );
await writeJson("weapon-packages.json", result.packages);
await writeJson("weapon-gaps.json", result.gaps);
await writeJson("weapon-codes.json", result.codes);
writeFileSync(
  new URL("docs/weapon-import.md", ROOT),
  renderWeaponImport(result.report),
);
console.log(
  `Wrote ${result.packages.length} weapon packages and ${result.gaps.length} gaps; review docs/weapon-import.md`,
);
// Items whose text changed since the file was written (B4a)
for (const weapon of result.report.weapons)
  for (const line of weapon.itemReview ?? []) console.log(`Review: ${line}`);
