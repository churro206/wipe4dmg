// Converts the tab "Abilties" of the Aegis Boss Damage sheet into AegisAbilityRow records (ADR 0009).

import type {
  AegisAbilityCategory,
  AegisAbilityRow,
  SourcedNumber,
} from "../../src/data/schema.ts";
import { AEGIS_SHEET_URL, normalize, slug } from "./aegisBosses.ts";
import { parseCsv } from "./csv.ts";

const REQUIRED_COLUMNS = ["Type", "Subtype", "Modifiers", "Patch"] as const;
const STAT_GROUPS = {
  stat100: "VISUAL - 100 stat",
  stat200: "VISUAL - 200 stat",
} as const;
const CATEGORIES: readonly AegisAbilityCategory[] = [
  "super",
  "grenade",
  "melee",
  "miscellaneous",
];
const SOURCE_NAME =
  "Aegis Boss Damage sheet (tab Abilties, column visual Value)";

/** Effect name and id; a name may carry a remark in parentheses, e.g. "Well of Radiance (standing inside)". */
export type EffectName = { id: string; name: string };

type StatColumns = {
  wipe: number;
  uses: number;
  fullModifiers: number;
  value: number;
};

const toNumber = (text: string): number | null => {
  if (text === "" || text === "/" || text === "N/A") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
};

/** "average - Ember of Ashes, with ignition" → ["average", "Ember of Ashes", "with ignition"] */
const splitAssumptions = (text: string): string[] =>
  text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .flatMap((part) =>
      part.startsWith("average - ")
        ? ["average", part.slice(10).trim()]
        : [part],
    );

const effectKey = (name: string) =>
  name
    .replace(/\(.*?\)/g, "")
    .trim()
    .toLowerCase();

/** Index of the first column with this header at or after the start of a stat group. */
function columnFrom(header: string[], name: string, start: number): number {
  const index = header.findIndex((cell, i) => i >= start && cell === name);
  if (index < 0)
    throw new Error(`Column "${name}" not found after column ${start}`);
  return index;
}

/**
 * Parses the CSV of the tab "Abilties". Columns are found by their header names; the two
 * "visual Value" columns are told apart by the group row above ("VISUAL - 100 stat", "VISUAL - 200 stat").
 */
export function parseAegisAbilities(
  csv: string,
  retrieved: string,
  effects: EffectName[],
): AegisAbilityRow[] {
  const rows = parseCsv(csv).map((row) => row.map(normalize));
  const headerIndex = rows.findIndex((row) =>
    REQUIRED_COLUMNS.every((column) => row.includes(column)),
  );
  if (headerIndex < 1) {
    throw new Error(
      `No header row with the columns ${REQUIRED_COLUMNS.join(", ")} found`,
    );
  }
  const header = rows[headerIndex];
  const groupRow = rows[headerIndex - 1];
  const column = (name: string) => header.indexOf(name);
  const statColumns = (group: string) => {
    const start = groupRow.indexOf(group);
    if (start < 0) throw new Error(`No group "${group}" above the header row`);
    return {
      wipe: columnFrom(header, "Wipe", start),
      uses: columnFrom(header, "#", start),
      fullModifiers: columnFrom(header, "Full Modifiers", start),
      value: columnFrom(header, "visual Value", start),
    };
  };
  const columns = {
    stat100: statColumns(STAT_GROUPS.stat100),
    stat200: statColumns(STAT_GROUPS.stat200),
  };
  const at = {
    type: column("Type"),
    name: column("Subtype"),
    primaryTick: column("primary Tick"),
    secondaryTicks: column("secondary Ticks"),
    modifiers: column("Modifiers"),
    patch: column("Patch"),
  };

  const dataRows = rows
    .slice(headerIndex + 1)
    .filter((row) => (row[at.type] ?? "") !== "");
  const baseline = usualFullModifiers(dataRows, [
    columns.stat100,
    columns.stat200,
  ]);
  const effectByKey = new Map(
    effects.map((effect) => [effectKey(effect.name), effect.id]),
  );

  const result = new Map<string, AegisAbilityRow>();
  for (const row of dataRows) {
    const category = row[at.type].toLowerCase() as AegisAbilityCategory;
    if (!CATEGORIES.includes(category))
      throw new Error(`Unknown ability type "${row[at.type]}"`);
    const name = row[at.name] ?? "";
    const assumptions = splitAssumptions(row[at.modifiers] ?? "");
    const id = slug([category, name, ...assumptions].join(" "));
    const fullModifiers = [columns.stat100, columns.stat200].map((c) =>
      toNumber(row[c.fullModifiers] ?? ""),
    );
    const atBaseline = fullModifiers.every(
      (value) => value === null || value === baseline,
    );

    const ability: AegisAbilityRow = {
      id,
      category,
      name,
      assumptions,
      includedEffectIds: atBaseline
        ? [
            ...new Set(
              assumptions.flatMap(
                (a) => effectByKey.get(a.toLowerCase()) ?? [],
              ),
            ),
          ]
        : [],
      primaryTick: row[at.primaryTick] ?? "",
      secondaryTicks: row[at.secondaryTicks] ?? "",
      perUseStat100: perUse(row, columns.stat100, baseline, retrieved),
      perUseStat200: perUse(row, columns.stat200, baseline, retrieved),
      gameVersion: row[at.patch] ?? "",
    };

    const existing = result.get(id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(ability)) {
      throw new Error(`Duplicate ability row "${id}" with different values`);
    }
    result.set(id, ability);
  }
  return [...result.values()];
}

/** The most common Full Modifiers value of the sheet, i.e. Aegis' standard multipliers. */
function usualFullModifiers(rows: string[][], groups: StatColumns[]): number {
  const counts = new Map<number, number>();
  for (const row of rows) {
    for (const group of groups) {
      const value = toNumber(row[group.fullModifiers] ?? "");
      if (value !== null) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  const [usual] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!usual) throw new Error("No Full Modifiers values found");
  return usual[0];
}

function perUse(
  row: string[],
  columns: StatColumns,
  baseline: number,
  retrieved: string,
): SourcedNumber {
  const value = toNumber(row[columns.value] ?? "");
  const fullModifiers = toNumber(row[columns.fullModifiers] ?? "");
  const measurement = `Wipe ${row[columns.wipe]} / # ${row[columns.uses]} / Full Modifiers ${row[columns.fullModifiers]}`;
  const source = { name: SOURCE_NAME, url: AEGIS_SHEET_URL, retrieved };
  if (value === null) {
    return {
      value: null,
      source: {
        ...source,
        status: "missing",
        note: `Aegis: "${row[columns.value]}"`,
      },
    };
  }
  if (fullModifiers === 1) {
    return {
      value,
      source: {
        ...source,
        status: "unverified",
        note: `${measurement}; not normalised, buffs are inside the value`,
      },
    };
  }
  if (fullModifiers !== baseline) {
    return {
      value,
      source: {
        ...source,
        status: "unverified",
        note: `${measurement}; Full Modifiers differ from the usual ${baseline}, so Aegis divided out further multipliers`,
      },
    };
  }
  return {
    value,
    source: { ...source, status: "verified", note: measurement },
  };
}
