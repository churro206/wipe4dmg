// Imports the subclass tabs and the tab Class Abilities of the Destiny Data Compendium into src/data/compendium-abilities.json (ADR 0009)
// and the tabs Exotic Weapons and Weapon Perks into src/data/compendium-weapons.json (ADR 0013),
// the tab Exotic Armors into src/data/compendium-armor.json (ADR 0014) and the tab Exotic Class into
// src/data/compendium-class.json (ADR 0015, U6-3).
// The CSV export of this sheet is blocked, so the script reads the public htmlview pages.
// Run: npm run import:compendium

import { writeFileSync } from "node:fs";
import { CompendiumSnapshot } from "../src/data/schema.ts";
import type { CompendiumEntry } from "../src/data/schema.ts";
import { parseCompendiumTab } from "./lib/compendiumAbilities.ts";
import { parseCompendiumArmorTab } from "./lib/compendiumArmor.ts";
import { parseCompendiumClassTab } from "./lib/compendiumClass.ts";

const SHEET_ID = "1WaxvbLx7UoSZaBqdFr1u32F2uWVLo-CJunJB4nlGUE4";
const SNAPSHOTS: {
  file: string;
  sourceName: string;
  tabs: Record<string, string>;
  parse?: (html: string) => CompendiumEntry[]; // default: parseCompendiumTab
}[] = [
  {
    file: "compendium-abilities.json",
    sourceName: "Destiny Data Compendium (subclass tabs)",
    tabs: {
      Arc: "618967225",
      Solar: "1186062409",
      Void: "1907852650",
      Stasis: "1088259962",
      Strand: "1870531554",
      Prismatic: "1918152785",
      "Class Abilities": "527596209",
    },
  },
  {
    file: "compendium-weapons.json",
    sourceName: "Destiny Data Compendium (tabs Exotic Weapons, Weapon Perks)",
    tabs: { "Exotic Weapons": "441434520", "Weapon Perks": "1662574278" },
  },
  {
    file: "compendium-armor.json",
    sourceName: "Destiny Data Compendium (tab Exotic Armors)",
    tabs: { "Exotic Armors": "1500097863" },
    parse: parseCompendiumArmorTab,
  },
  {
    file: "compendium-class.json",
    sourceName: "Destiny Data Compendium (tab Exotic Class)",
    tabs: { "Exotic Class": "20898389" },
    parse: parseCompendiumClassTab,
  },
];

for (const { file, sourceName, tabs, parse } of SNAPSHOTS) {
  const entries = [];
  for (const [tab, gid] of Object.entries(tabs)) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview/sheet?headers=true&gid=${gid}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Download of tab ${tab} failed: ${response.status} ${response.statusText}`,
      );
    }
    const html = await response.text();
    const tabEntries = parse ? parse(html) : parseCompendiumTab(html, tab);
    console.log(`${tab}: ${tabEntries.length} entries`);
    entries.push(...tabEntries);
  }

  const snapshot = CompendiumSnapshot.parse({
    source: {
      name: sourceName,
      url: "https://destiny2.science/data-compendium",
      retrieved: new Date().toISOString().slice(0, 10),
      status: "verified",
    },
    entries,
  });
  writeFileSync(
    new URL(`../src/data/${file}`, import.meta.url),
    JSON.stringify(snapshot, null, 2) + "\n",
  );
  console.log(`Wrote ${entries.length} entries to src/data/${file}`);
}
