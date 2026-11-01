// FNV-1a (32 bit): a fixed hash for the lot of a row id (I10, tests/lib/scenarioGen.ts) and for the
// texts of an item file (I5, scripts/lib/items/weaponItem.ts).

export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** The hash of a text as eight hex digits, as an item file stores it. */
export const textHash = (text: string): string => fnv1a(text).toString(16).padStart(8, "0");
