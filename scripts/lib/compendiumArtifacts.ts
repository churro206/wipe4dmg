// Converts the Compendium tab "Artifact Perks" (htmlview page) into plain-text entries (seasonal
// artifact block). The tab lists one artifact after the other: a header row with the name and the
// season ("Encrypted Data Disk (Renegades)"), then seven rows of three perks. Each perk row is a
// row of names (cells 2, 5, 8) and a row of texts (cells 1, 3, 5). The column of a perk is its tier
// in the game: column 1 is the bottom row of the artifact screen (one diamond), column 3 the top
// row (three diamonds).

import type { CompendiumEntry } from "../../src/data/schema.ts";
import { cellText } from "./compendiumAbilities.ts";

const TAB = "Artifact Perks";
const HEADER = /^(.+) \(([^)]+)\)$/;
const NAME_CELLS = [2, 5, 8];
const TEXT_CELLS = [1, 3, 5];

/** Parses the tab: one entry per perk, section = "Artifact (Season)", extra = "row R column C". */
export function parseCompendiumArtifactsTab(html: string): CompendiumEntry[] {
  const rows = html
    .split(/<tr[^>]*>/)
    .slice(1)
    .map((row) =>
      [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
        cellText(m[1]),
      ),
    );

  const entries: CompendiumEntry[] = [];
  let artifact: string | undefined;
  let perkRow = 0;
  let names: string[] | undefined;
  for (const cells of rows) {
    if (cells.length === 3 && HEADER.test(cells[1])) {
      artifact = cells[1];
      perkRow = 0;
      names = undefined;
      continue;
    }
    if (artifact === undefined) continue;
    if (cells.length === 10 && NAME_CELLS.every((i) => cells[i] !== "")) {
      names = NAME_CELLS.map((i) => cells[i]);
      continue;
    }
    if (names !== undefined && cells.length === 7) {
      perkRow++;
      TEXT_CELLS.forEach((cell, column) => {
        const text = cells[cell];
        if (text === "") return;
        entries.push({
          tab: TAB,
          section: artifact!,
          name: names![column],
          text,
          extra: `row ${perkRow} column ${column + 1}`,
        });
      });
      names = undefined;
    }
  }
  if (entries.length === 0)
    throw new Error(`No entries found in the Compendium tab "${TAB}"`);
  return entries;
}
