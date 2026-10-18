// Imports the tab "Bosses" of the Aegis Boss Damage sheet into src/data/bosses.json.
// Run: npm run import:bosses

import { writeFileSync } from "node:fs";
import { Boss } from "../src/data/schema.ts";
import { parseAegisBosses } from "./lib/aegisBosses.ts";

const SHEET_ID = "1_5wtBjRYHHxuF4oJKDb_iOGZs-wTkzB6RYbnyNLbuz4";
const BOSSES_TAB_GID = "1346678363";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${BOSSES_TAB_GID}`;
const OUTPUT = new URL("../src/data/bosses.json", import.meta.url);

const response = await fetch(CSV_URL);
if (!response.ok) {
  throw new Error(`Download failed: ${response.status} ${response.statusText}`);
}
const retrieved = new Date().toISOString().slice(0, 10);
const bosses = Boss.array().parse(
  parseAegisBosses(await response.text(), retrieved),
);

writeFileSync(OUTPUT, JSON.stringify(bosses, null, 2) + "\n");
const withPhase = bosses.filter((b) => b.damagePhaseSeconds.value !== null);
console.log(
  `Wrote ${bosses.length} bosses (${withPhase.length} with a damage phase) to src/data/bosses.json`,
);
