// Imports Court's Stacking Guide into src/data/court-buffs.json (ADR 0014).
// The CSV export of this sheet is blocked, so the script reads the public htmlview page.
// Run: npm run import:court

import { writeFileSync } from "node:fs";
import { CourtSnapshot } from "../src/data/schema.ts";
import { parseCourtSheet } from "./lib/court.ts";

const SHEET_ID = "1i1KUwgVkd8qhwYj481gkV9sZNJQCE-C3Q-dpQutPCi4";
const GID = "2073397587";

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlview/sheet?headers=true&gid=${GID}`;
const response = await fetch(url);
if (!response.ok) {
  throw new Error(
    `Download of Court's Stacking Guide failed: ${response.status} ${response.statusText}`,
  );
}
const html = await response.text();
const entries = parseCourtSheet(html);
const dataChange = /Last Data Change: ([^—]+)/
  .exec(html.replace(/<[^>]*>/g, ""))?.[1]
  .trim();

const snapshot = CourtSnapshot.parse({
  source: {
    name: "Court's Stacking Guide (Destiny 2 Damage Buffs/Debuffs)",
    url: "https://destiny2.science/court-sheet",
    retrieved: new Date().toISOString().slice(0, 10),
    status: "verified",
    note: dataChange ? `Last Data Change: ${dataChange}` : undefined,
  },
  entries,
});
writeFileSync(
  new URL("../src/data/court-buffs.json", import.meta.url),
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(`Wrote ${entries.length} entries to src/data/court-buffs.json`);
