// Imports the Aegis tabs "Sustained" and "Swap" into src/data/aegis-totals.json: the total damage of
// one item under the standard factors of Aegis, the reference of the meta probe (block 5).
// Run: npm run import:totals

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { AegisTotalsSnapshot } from "../src/data/schema.ts";
import { AEGIS_SHEET_URL } from "./lib/aegisBosses.ts";
import { parseAegisTotals } from "./lib/aegisTotals.ts";

const SHEET_ID = "1_5wtBjRYHHxuF4oJKDb_iOGZs-wTkzB6RYbnyNLbuz4";
const TABS = { sustained: "1455724279", swap: "544204052" } as const;

async function download(gid: string): Promise<string> {
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`,
  );
  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

const rows = [];
for (const [tab, gid] of Object.entries(TABS) as [keyof typeof TABS, string][]) {
  const tabRows = parseAegisTotals(await download(gid), tab);
  console.log(`Aegis ${tab}: ${tabRows.length} rows`);
  rows.push(...tabRows);
}
const snapshot = AegisTotalsSnapshot.parse({
  source: {
    name: "Aegis Boss Damage sheet (tabs Sustained and Swap, column Total)",
    url: AEGIS_SHEET_URL,
    retrieved: new Date().toISOString().slice(0, 10),
    status: "verified",
  },
  rows,
});
writeFileSync(
  new URL("../src/data/aegis-totals.json", import.meta.url),
  await format(JSON.stringify(snapshot), { parser: "json" }),
);
console.log(`Aegis: wrote ${rows.length} rows to aegis-totals.json`);
