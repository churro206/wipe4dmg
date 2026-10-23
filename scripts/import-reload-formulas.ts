// Imports d2foundry's reload formulas into src/data/reload-formulas.json (factor for a catalyst's
// reload stat in the weapon import).
// Run: npm run import:reload

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { ReloadFormulaSnapshot } from "../src/data/schema.ts";
import {
  parseReloadFormulas,
  RELOAD_FORMULAS_URL,
} from "./lib/reloadFormulas.ts";

const response = await fetch(RELOAD_FORMULAS_URL);
if (!response.ok)
  throw new Error(`Download failed: ${response.status} ${response.statusText}`);

const snapshot = ReloadFormulaSnapshot.parse({
  source: {
    name: "d2foundry oracle_engine (build_resources/weapon_formulas.json, reload)",
    url: "https://github.com/d2foundry/oracle_engine",
    retrieved: new Date().toISOString().slice(0, 10),
    status: "unverified",
    note: "Does not reproduce Aegis's measured reload; used only as a factor for catalyst reload stats.",
  },
  types: parseReloadFormulas(
    (await response.json()) as Parameters<typeof parseReloadFormulas>[0],
  ),
});
writeFileSync(
  new URL("../src/data/reload-formulas.json", import.meta.url),
  await format(JSON.stringify(snapshot), { parser: "json" }),
);
console.log(
  `d2foundry: wrote ${Object.keys(snapshot.types).length} weapon types to reload-formulas.json`,
);
