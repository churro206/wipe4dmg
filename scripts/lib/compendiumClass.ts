// Converts the Compendium tab "Exotic Class" (htmlview page) into plain-text entries (ADR 0015, U6-3).
// Rows of perks hold two perks, each in three columns (name, icon, text); rows with one cell are the
// section titles ("Class-agnostic Perks", "Hunter-exclusive Perks", ...).

import type { CompendiumEntry } from "../../src/data/schema.ts";
import { cellText } from "./compendiumAbilities.ts";

const TAB = "Exotic Class";
const PERKS_PER_ROW = 2;
const COLUMNS = 3; // name, icon, text
const SECTIONS: [RegExp, string][] = [
  [/^Class-agnostic/i, "any"],
  [/^Hunter-exclusive/i, "hunter"],
  [/^Titan-exclusive/i, "titan"],
  [/^Warlock-exclusive/i, "warlock"],
];

/** Parses the tab: one entry per perk with its class (section "any" for every class) and text. */
export function parseCompendiumClassTab(html: string): CompendiumEntry[] {
  const rows = html
    .split(/<tr[^>]*>/)
    .slice(1)
    .map((row) =>
      [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
        cellText(m[1]),
      ),
    );

  const entries: CompendiumEntry[] = [];
  let section: string | undefined;
  for (const cells of rows) {
    const title = SECTIONS.find(([pattern]) => pattern.test(cells[0] ?? ""));
    if (cells.length === 1 && title) section = title[1];
    if (section === undefined || cells.length < PERKS_PER_ROW * COLUMNS) continue;
    for (let i = 0; i < PERKS_PER_ROW; i++) {
      const name = cells[i * COLUMNS];
      const text = cells[i * COLUMNS + 2];
      if (name === "" || text === "") continue;
      entries.push({ tab: TAB, section, name, text, extra: "" });
    }
  }
  if (entries.length === 0)
    throw new Error(`No entries found in the Compendium tab "${TAB}"`);
  return entries;
}
