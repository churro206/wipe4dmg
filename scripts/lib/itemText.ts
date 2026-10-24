// Texts of an item from the community sources, shared by the review rules (uptime, text check):
// the Compendium entry, the Court rows and the Clarity entries of its name.

import type { ClarityEntry, CompendiumEntry, CourtEntry } from "../../src/data/schema.ts";

export type ItemTextSources = {
  compendium: CompendiumEntry[];
  court: CourtEntry[];
  clarity: ClarityEntry[];
};

export type ItemText = { from: string; text: string };

// "for 10 seconds", "lasts 6s", "21s" in a Court source name; "10+5": the +5 is another item,
// "6 [2.5]": the bracket is PvP.
export const DURATION =
  /\b(?:for(?: up to)?|lasts?|lasting|duration of|within)\s+(\d+(?:\.\d+)?)\??(?:\+\d+(?:\.\d+)?)?\s*(?:\[[^\]]*\])?\s*s(?:ec(?:ond)?s?)?\b/i;
// Lines whose duration is not the one of a damage bonus: cooldowns, movement, healing, defensive
// states, longer supers, how long an object lives.
export const NOT_A_BUFF =
  /\b(cooldown|lunge|sprint|overshield|cure|restoration|blind|woven mail|frost armor|longer|held for|replaces)\b/i;
export const SOURCE_SECONDS = /,\s*(\d+(?:\.\d+)?)s\)/;
export const COURT_SECONDS = /^(\d+(?:\.\d+)?)s/;

// "Well of Radiance (standing inside)" is the Compendium entry "Well of Radiance".
export const baseName = (name: string) => name.replace(/\s*\(.*\)$/, "").trim();

export const courtRowsOf = (name: string, sources: ItemTextSources): CourtEntry[] =>
  sources.court.filter((r) => r.name === baseName(name));

export const courtQuote = (row: CourtEntry) =>
  `Court ${row.group || row.category}: ${row.name} | ${row.pve} | ${row.pveDuration}`;

/** Compendium and Clarity texts of a name (Clarity also by the item a perk belongs to). */
export function itemTexts(name: string, sources: ItemTextSources): ItemText[] {
  const base = baseName(name);
  return [
    ...sources.compendium.filter((e) => e.name === base).map((e) => ({ from: `Compendium ${e.tab}`, text: e.text })),
    ...sources.clarity
      .filter((e) => e.name === base || e.itemName === base)
      .map((e) => ({ from: `Clarity ${e.name}`, text: e.text })),
  ];
}

/** First duration of a damage bonus in the texts, line by line. */
export function durationInTexts(texts: ItemText[]): { seconds: number; quote: string } | undefined {
  for (const { from, text } of texts) {
    for (const line of text.split("\n")) {
      if (NOT_A_BUFF.test(line)) continue;
      const m = DURATION.exec(line);
      if (m) return { seconds: Number(m[1]), quote: `${from}: ${line.trim()}` };
    }
  }
  return undefined;
}
