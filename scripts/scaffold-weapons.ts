// One-time scaffold of the weapon items (ADR 0019, Q1): writes src/data/items/weapons/<id>.json for
// every exotic with a Quantum base row that has no item file yet, and the link codes of the new ones
// (alphabetical after the highest, as build:weapons does). Existing files are never overwritten; after
// this run the files belong to the author. Run once: npm run scaffold:weapons, then npm run build:weapons.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { format } from "prettier";
import {
  ClaritySnapshot,
  ManifestWeapons,
  QuantumWeaponSnapshot,
} from "../src/data/schema.ts";
import { slug } from "./lib/aegisBosses.ts";
import { ITEM_WEAPONS_DIR } from "./lib/items/loadItems.ts";
import { scaffoldWeaponItems } from "./lib/weaponScaffold.ts";

const DATA = new URL("../src/data/", import.meta.url);
const read = (file: string): unknown => JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

const manifest = ManifestWeapons.parse(read("manifest-weapons.json"));
const quantum = QuantumWeaponSnapshot.parse(read("quantum-weapons.json"));
const clarity = ClaritySnapshot.parse(read("clarity.json"));
const codes = read("weapon-codes.json") as Record<string, number>;

const existing = new Set(
  manifest.weapons
    .map((w) => w.name)
    .map(slug)
    .filter((id) => existsSync(new URL(`${id}.json`, ITEM_WEAPONS_DIR))),
);
const { items, skipped } = scaffoldWeaponItems({
  quantum: quantum.rows,
  manifest: manifest.weapons,
  clarity: clarity.entries,
  aliases: read("weapon-aliases.json") as Record<string, string>,
  existingIds: existing,
  retrieved: "2026-11-03",
});

let next = Math.max(0, ...Object.values(codes)) + 1;
for (const item of items as { id: string }[]) {
  const file = new URL(`${item.id}.json`, ITEM_WEAPONS_DIR);
  if (existsSync(file)) throw new Error(`${item.id}.json exists; the scaffold never overwrites`);
  writeFileSync(file, await format(JSON.stringify(item), { parser: "json" }));
  codes[item.id] ??= next++;
}
writeFileSync(
  new URL("weapon-codes.json", DATA),
  await format(
    JSON.stringify(Object.fromEntries(Object.entries(codes).sort(([, a], [, b]) => a - b))),
    { parser: "json" },
  ),
);
console.log(`Wrote ${items.length} item files; ${existing.size} existed; skipped ${skipped.length}:`);
for (const s of skipped) console.log(`  ${s.name}: ${s.reason}`);
