// Imports the weapon sources for the weapon import (ADR 0013): the Aegis tabs "Weapons" and
// "Sustained" into src/data/aegis-weapons.json and aegis-sustained.json, the Quantum tabs
// Primaries, Specials and Heavies into src/data/quantum-weapons.json, and the Clarity database
// into src/data/clarity.json.
// Run: npm run import:weapons

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import {
  AegisSustainedSnapshot,
  ClaritySnapshot,
  AegisWeaponSnapshot,
  QuantumWeaponSnapshot,
} from "../src/data/schema.ts";
import { AEGIS_SHEET_URL } from "./lib/aegisBosses.ts";
import { parseAegisSustained } from "./lib/aegisSustained.ts";
import { parseClarity } from "./lib/clarity.ts";
import { parseAegisWeapons } from "./lib/aegisWeapons.ts";
import { parseQuantumWeapons, type QuantumTab } from "./lib/quantumWeapons.ts";

const AEGIS_SHEET_ID = "1_5wtBjRYHHxuF4oJKDb_iOGZs-wTkzB6RYbnyNLbuz4";
const AEGIS_WEAPONS_GID = "2139128689";
const AEGIS_SUSTAINED_GID = "1455724279";
const QUANTUM_SHEET_ID = "1x12Ar1-kHH2AzHY8Clkv-PIMxxDSZrIX3e4xiJuQ-uI";
const QUANTUM_TABS: Record<QuantumTab, string> = {
  primaries: "398985410",
  specials: "1681969818",
  heavies: "1406577322",
};

const csvUrl = (sheetId: string, gid: string) =>
  `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

async function download(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

// Formatted like the rest of the repository, so a new import only shows real changes.
async function write(file: string, data: unknown) {
  writeFileSync(
    new URL(`../src/data/${file}`, import.meta.url),
    await format(JSON.stringify(data), { parser: "json" }),
  );
}

const retrieved = new Date().toISOString().slice(0, 10);

const aegis = AegisWeaponSnapshot.parse({
  source: {
    name: "Aegis Boss Damage sheet (tab Weapons, column visual Value)",
    url: AEGIS_SHEET_URL,
    retrieved,
    status: "verified",
  },
  rows: parseAegisWeapons(
    await download(csvUrl(AEGIS_SHEET_ID, AEGIS_WEAPONS_GID)),
  ),
});
await write("aegis-weapons.json", aegis);
console.log(`Aegis: wrote ${aegis.rows.length} rows to aegis-weapons.json`);

const sustained = AegisSustainedSnapshot.parse({
  source: {
    name: "Aegis Boss Damage sheet (tab Sustained)",
    url: AEGIS_SHEET_URL,
    retrieved,
    status: "verified",
  },
  rows: parseAegisSustained(
    await download(csvUrl(AEGIS_SHEET_ID, AEGIS_SUSTAINED_GID)),
  ),
});
await write("aegis-sustained.json", sustained);
console.log(
  `Aegis: wrote ${sustained.rows.length} rows to aegis-sustained.json`,
);

// Clarity: perk, catalyst and armor trait texts (credited on the site, ADR 0013).
const CLARITY_URL =
  "https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/live/descriptions/clarity.json";
const clarity = ClaritySnapshot.parse({
  source: {
    name: "Clarity (Live-Clarity-Database, descriptions/clarity.json)",
    url: "https://www.d2clarity.com",
    retrieved,
    status: "verified",
  },
  entries: parseClarity(JSON.parse(await download(CLARITY_URL))),
});
await write("clarity.json", clarity);
console.log(`Clarity: wrote ${clarity.entries.length} entries to clarity.json`);

const quantumRows = [];
for (const [tab, gid] of Object.entries(QUANTUM_TABS) as [
  QuantumTab,
  string,
][]) {
  const rows = parseQuantumWeapons(
    await download(csvUrl(QUANTUM_SHEET_ID, gid)),
    tab,
  );
  console.log(`Quantum ${tab}: ${rows.length} rows`);
  quantumRows.push(...rows);
}
const quantum = QuantumWeaponSnapshot.parse({
  source: {
    name: "Quantum Damage-ics (tabs Primaries, Specials, Heavies)",
    url: "https://destiny2.science/quantum-damage-ics",
    retrieved,
    status: "unverified",
    note: "Partly older than the current patch (e.g. Truth 2024); the weapon import flags this (ADR 0013).",
  },
  rows: quantumRows,
});
await write("quantum-weapons.json", quantum);
console.log(
  `Quantum: wrote ${quantum.rows.length} rows to quantum-weapons.json`,
);
