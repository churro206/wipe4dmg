// Converts the Compendium tab "Exotic Armors" (htmlview page) into plain-text entries (ADR 0014).
// The tab has three class columns (Armor, Icon, Notes); the row below each name row holds the intrinsic names.
// It stops at the section "Aeon Sects", whose entries are not armor pieces.

import type { CompendiumEntry } from "../../src/data/schema.ts";
import { cellText } from "./compendiumAbilities.ts";

const TAB = "Exotic Armors";
const CLASSES = ["hunter", "titan", "warlock"] as const;
const COLUMNS = 3; // Armor, Icon, Notes per class
const END_SECTION = "Aeon Sects";

/** Parses the tab: one entry per exotic with class (section), notes (text) and intrinsic (extra). */
export function parseCompendiumArmorTab(html: string): CompendiumEntry[] {
  const rows = html
    .split(/<tr[^>]*>/)
    .slice(1)
    .map((row) =>
      [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
        cellText(m[1]),
      ),
    );

  const entries: CompendiumEntry[] = [];
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];
    if (cells[0] === END_SECTION) break;
    if (cells.length < CLASSES.length * COLUMNS || cells[0] === "Armor")
      continue;
    const intrinsics = rows[i + 1] ?? [];
    CLASSES.forEach((guardianClass, c) => {
      const name = cells[c * COLUMNS];
      const text = cells[c * COLUMNS + 2];
      if (name === "" || text === "") return;
      entries.push({
        tab: TAB,
        section: guardianClass,
        name,
        text,
        extra: intrinsics[c] ?? "",
      });
    });
  }
  if (entries.length === 0)
    throw new Error(`No entries found in the Compendium tab "${TAB}"`);
  return entries;
}
