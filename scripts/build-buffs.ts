// Generates the effects of the buffs, debuffs, mods and artifact perks from Court's Stacking Guide
// into src/data/buff-effects.json and the review table docs/buff-import.md. No download: run
// npm run import:court first to refresh the source.
// Run: npm run build:buffs

import { writeFileSync } from "node:fs";
import { format } from "prettier";
import { loadBuffInputs } from "./lib/buffInputs.ts";
import { buffEffects, renderBuffs } from "./lib/buffs.ts";

const ROOT = new URL("../", import.meta.url);
const { effects, rows } = buffEffects(loadBuffInputs());
writeFileSync(
  new URL("src/data/buff-effects.json", ROOT),
  await format(JSON.stringify(effects), { parser: "json" }),
);
writeFileSync(new URL("docs/buff-import.md", ROOT), renderBuffs(rows));
const unclassified = rows.filter((r) => r.verdict === "unclassified");
console.log(
  `Wrote ${effects.length} buff effects from ${rows.length} Court rows (${unclassified.length} unclassified); review docs/buff-import.md`,
);
for (const row of unclassified) console.log(`  unclassified: ${row.category} | ${row.name}`);
