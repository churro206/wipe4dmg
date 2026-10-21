// Converts subclass tabs of the Destiny Data Compendium (htmlview pages) into plain-text entries (ADR 0009).
// The snapshot lets tests check that every quoted Compendium value is still current after a patch.

import type { CompendiumEntry } from "../../src/data/schema.ts";

const MIN_TEXT_LENGTH = 20; // shorter second cells are navigation, e.g. "Go back to the top! | Arc Subclasses"
const MAX_SECTION_LENGTH = 40; // longer single cells are notes, not section titles

/** Reference from a data value to the Compendium text it was taken from. */
export type CompendiumQuote = { tab: string; entry: string; quote: string };

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  nbsp: " ",
};

/** Cell HTML to text: <br> becomes a line break, tags are removed, entities decoded, spaces collapsed. */
export function cellText(html: string): string {
  return html
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&(\w+);/g, (match, name: string) => ENTITIES[name] ?? match)
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .trim();
}

/** Parses one tab: each table row with a name and a description becomes an entry of the section above it. */
export function parseCompendiumTab(
  html: string,
  tab: string,
): CompendiumEntry[] {
  const rows = html
    .split(/<tr[^>]*>/)
    .slice(1)
    .map((row) =>
      [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
        .map((m) => cellText(m[1]))
        .filter((t) => t !== ""),
    );

  const entries: CompendiumEntry[] = [];
  let section = "";
  for (const cells of rows) {
    if (cells.length === 1 && cells[0].length <= MAX_SECTION_LENGTH) {
      section = cells[0].split("\n")[0];
    } else if (cells.length >= 2 && cells.includes("Information")) {
      section = cells[0];
    } else if (cells.length >= 2 && cells[1].length >= MIN_TEXT_LENGTH) {
      entries.push({
        tab,
        section,
        name: cells[0].replace(/\s*\n\s*/g, " "), // e.g. "Golden Gun:<br> Marksman"
        text: cells[1],
        extra: cells.slice(2).join("\n"),
      });
    }
  }
  if (entries.length === 0)
    throw new Error(`No entries found in the Compendium tab "${tab}"`);
  return entries;
}

/** True if an entry of that tab and name contains the quote exactly. */
export function hasQuote(
  entries: CompendiumEntry[],
  { tab, entry, quote }: CompendiumQuote,
): boolean {
  return entries.some(
    (e) => e.tab === tab && e.name === entry && e.text.includes(quote),
  );
}
