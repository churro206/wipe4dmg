// Converts the Clarity database (descriptions/clarity.json of the Live-Clarity-Database) into plain
// text entries by manifest hash (ADR 0013). Data by Clarity, https://www.d2clarity.com.

import type { ClarityEntry } from "../../src/data/schema.ts";

type RawLine = { text?: string };
type RawBlock = { linesContent?: RawLine[]; classNames?: string[] };
type RawEntry = {
  hash: number;
  name: string;
  type: string;
  itemName?: string;
  descriptions?: { en?: RawBlock[] };
};

/** Every entry with its English text; blocks become lines, spacers are dropped. Sorted by hash. */
export function parseClarity(raw: Record<string, RawEntry>): ClarityEntry[] {
  return Object.values(raw)
    .map((entry) => ({
      hash: entry.hash,
      name: entry.name,
      type: entry.type,
      itemName: entry.itemName || null,
      text: (entry.descriptions?.en ?? [])
        .map((block) =>
          (block.linesContent ?? [])
            .map((line) => line.text ?? "")
            .join("")
            .trim(),
        )
        .filter((line) => line !== "")
        .join("\n"),
    }))
    .sort((a, b) => a.hash - b.hash);
}
