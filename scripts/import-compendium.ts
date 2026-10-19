// Imports the subclass tabs of the Destiny Data Compendium into src/data/compendium-abilities.json (ADR 0009).
// The CSV export of this sheet is blocked, so the script reads the public htmlview pages.
// Run: npm run import:compendium

import { writeFileSync } from "node:fs";
import { CompendiumSnapshot } from "../src/data/schema.ts";
import { parseCompendiumTab } from "./lib/compendiumAbilities.ts";

const SHEET_ID = "1WaxvbLx7UoSZaBqdFr1u32F2uWVLo-CJunJB4nlGUE4";
const TABS: Record<string, string> = {
  Arc: "618967225",
  Solar: "1186062409",
  Void: "1907852650",
  Stasis: "1088259962",
  Strand: "1870531554",
  Prismatic: "1918152785",
};
const OUTPUT = new URL("../src/data/compendium-abilities.json", import.meta.url);

const entries = [];
for (const [tab, gid] of Object.entries(TABS)) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview/sheet?headers=true&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download of tab ${tab} failed: ${response.status} ${response.statusText}`);
  }
  const tabEntries = parseCompendiumTab(await response.text(), tab);
  console.log(`${tab}: ${tabEntries.length} entries`);
  entries.push(...tabEntries);
}

const snapshot = CompendiumSnapshot.parse({
  source: {
    name: "Destiny Data Compendium (subclass tabs)",
    url: "https://destiny2.science/data-compendium",
    retrieved: new Date().toISOString().slice(0, 10),
    status: "verified",
  },
  entries,
});
writeFileSync(OUTPUT, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Wrote ${entries.length} entries to src/data/compendium-abilities.json`);
