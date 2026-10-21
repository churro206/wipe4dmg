// Loads keywords.json (ADR 0015, point 5): the damage per trigger comes from the keyword's Aegis
// row, so the value has one source of truth.

import {
  KeywordData,
  type AegisAbilityRow,
  type Keyword,
} from "../data/schema";

export function loadKeywords(raw: unknown, rows: AegisAbilityRow[]): Keyword[] {
  return KeywordData.array()
    .parse(raw)
    .map((keyword) => {
      const row = rows.find((r) => r.id === keyword.aegisRowId);
      if (!row) {
        throw new Error(
          `Unknown Aegis row "${keyword.aegisRowId}" for keyword "${keyword.id}"`,
        );
      }
      return { ...keyword, damage: row.perUseStat100 };
    });
}
