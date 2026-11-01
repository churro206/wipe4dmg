// Loads keywords.json (ADR 0015, point 5): the damage per trigger comes from the keyword's Aegis
// row, so the value has one source of truth. The file also holds statuses without damage and without
// a trigger (Weaken, architecture section 6): `loadStatusModifiers` reads those.

import {
  keywordDataOf,
  statusModifiersOf,
  type AegisAbilityRow,
  type Keyword,
  type StatusModifierData,
} from "../data/schema";

export function loadKeywords(raw: unknown, rows: AegisAbilityRow[]): Keyword[] {
  return keywordDataOf(raw).map((keyword) => {
    const row = rows.find((r) => r.id === keyword.aegisRowId);
    if (!row) {
      throw new Error(
        `Unknown Aegis row "${keyword.aegisRowId}" for keyword "${keyword.id}"`,
      );
    }
    return { ...keyword, damage: row.perUseStat100 };
  });
}

/** The statuses of keywords.json that only modify damage (Weaken). */
export function loadStatusModifiers(raw: unknown): StatusModifierData[] {
  return statusModifiersOf(raw);
}
