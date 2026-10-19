// Imports the tab "Abilties" of the Aegis Boss Damage sheet into src/data/aegis-abilities.json (ADR 0009).
// Run: npm run import:abilities

import { readFileSync, writeFileSync } from "node:fs";
import { format } from "prettier";
import { AegisAbilityRow, Effect } from "../src/data/schema.ts";
import { parseAegisAbilities } from "./lib/aegisAbilities.ts";

const SHEET_ID = "1_5wtBjRYHHxuF4oJKDb_iOGZs-wTkzB6RYbnyNLbuz4";
const ABILITIES_TAB_GID = "1439633538";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${ABILITIES_TAB_GID}`;
const EFFECTS = new URL("../src/data/effects.json", import.meta.url);
const OUTPUT = new URL("../src/data/aegis-abilities.json", import.meta.url);

const response = await fetch(CSV_URL);
if (!response.ok) {
  throw new Error(`Download failed: ${response.status} ${response.statusText}`);
}
const effects = Effect.array().parse(JSON.parse(readFileSync(EFFECTS, "utf8")));
const retrieved = new Date().toISOString().slice(0, 10);
const rows = AegisAbilityRow.array().parse(
  parseAegisAbilities(await response.text(), retrieved, effects),
);

// Formatted like the rest of the repository, so a new import only shows real changes.
writeFileSync(OUTPUT, await format(JSON.stringify(rows), { parser: "json" }));
const count = (category: string) =>
  rows.filter((r) => r.category === category).length;
const withEffects = rows.filter((r) => r.includedEffectIds.length > 0).length;
console.log(
  `Wrote ${rows.length} rows (super ${count("super")}, grenade ${count("grenade")}, melee ${count("melee")}, ` +
    `miscellaneous ${count("miscellaneous")}; ${withEffects} with included effects) to src/data/aegis-abilities.json`,
);
