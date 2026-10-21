// Converts Court's Stacking Guide (htmlview page) into plain-text entries (ADR 0014).
// Table categories (debuffs, empowering buffs, surges, amplification) carry PvE values; the category
// "Exotic Intrinsics" only lists exotic armor by name, its values come from the Compendium.

import type { CourtCategory, CourtEntry } from "../../src/data/schema.ts";
import { cellText } from "./compendiumAbilities.ts";

const CATEGORY_PREFIX = "Category: ";
// Columns from the right end of a table row: NAME, TRIGGER, PVE %, PVE #s, PVP %, PVP #s, three notes, INTRODUCED.
const TABLE_COLUMNS = 10;
const ARMOR_TYPE = /^(Hunter|Titan|Warlock) \w+$/; // second line of an armor name cell, e.g. "Titan Chest"

/** Name, item type and a note below them, e.g. "Mantle of Battle Harmony\nWarlock Chest\n\nSurge Element matches …". */
function nameCell(text: string): {
  name: string;
  itemType: string | null;
  note: string;
} {
  const [name, itemType, ...rest] = text.split("\n");
  return {
    name,
    itemType: itemType?.trim() || null,
    note: rest.join(" ").trim(),
  };
}

const rowsOf = (html: string): string[][] =>
  html
    .split(/<tr[^>]*>/)
    .slice(1)
    .map((row) =>
      [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
        cellText(m[1]),
      ),
    );

/** The overview "Damage Buff Categories": name, description, sources and stacking rule of each category. */
export function parseCourtCategories(html: string): CourtCategory[] {
  const rows = rowsOf(html);
  const start = rows.findIndex((cells) => cells.includes("Modifier Category"));
  if (start === -1)
    throw new Error("No category overview found in Court's Stacking Guide");
  const categories: CourtCategory[] = [];
  for (const cells of rows.slice(start + 1)) {
    if (cells.some((c) => c.startsWith(CATEGORY_PREFIX))) break;
    const filled = cells.filter((c) => c !== "");
    if (filled.length < 4) continue;
    const [name, description, sources, stacking] = filled;
    categories.push({
      name: name.split("\n").join(" "),
      description,
      sources,
      stacking,
    });
  }
  return categories;
}

/** Parses the whole guide: table rows with values and exotic armor from name lists. */
export function parseCourtSheet(html: string): CourtEntry[] {
  const rows = rowsOf(html);
  const entries: CourtEntry[] = [];
  let category = "";
  let table = false;
  let group = "";
  for (const cells of rows) {
    const title = cells.find((c) => c.startsWith(CATEGORY_PREFIX));
    if (title) {
      category = title.split("\n")[0].slice(CATEGORY_PREFIX.length).trim();
      table = false;
      group = "";
      continue;
    }
    if (category === "") continue;
    if (cells.includes("PVE %")) {
      table = true;
      continue;
    }

    if (table) {
      if (cells.length < TABLE_COLUMNS + 1) continue;
      const end = cells.slice(-TABLE_COLUMNS);
      const [nameText, trigger, pve, pveDuration] = end;
      if (nameText === "" || pve === "") continue;
      if (cells[0] !== "") group = cells[0].split("\n")[0];
      const { name, itemType, note } = nameCell(nameText);
      entries.push({
        category,
        group,
        name,
        itemType,
        requirement: cells[cells.length - TABLE_COLUMNS - 1],
        trigger,
        pve,
        pveDuration,
        notes: [note, ...end.slice(6, 9)].filter((n) => n !== "").join("\n"),
      });
    } else {
      for (const cell of cells) {
        const { name, itemType } = nameCell(cell);
        if (itemType === null || !ARMOR_TYPE.test(itemType)) continue;
        if (entries.some((e) => e.category === category && e.name === name))
          continue;
        entries.push({
          category,
          group: "",
          name,
          itemType,
          requirement: "",
          trigger: "",
          pve: null,
          pveDuration: null,
          notes: "",
        });
      }
    }
  }
  if (entries.length === 0)
    throw new Error("No entries found in Court's Stacking Guide");
  return entries;
}
