// Converts the tabs "Sustained" and "Swap" of the Aegis Boss Damage sheet into AegisTotalRow
// records: the total damage of one item under the standard factors of Aegis (surge, buff, debuff,
// stat 200). The meta probe (block 5) compares our builds against these totals.

import type { AegisTotalRow } from "../../src/data/schema.ts";
import { normalize, slug } from "./aegisBosses.ts";
import { splitAssumptions } from "./aegisWeapons.ts";
import { parseCsv } from "./csv.ts";

const REQUIRED_COLUMNS = [
  "Name",
  "Type",
  "#",
  "Base",
  "Perk",
  "Surge",
  "Buff",
  "Debuff",
  "200",
  "Total",
] as const;

const toNumber = (text: string): number | null => {
  const number = Number(text.replace(/,/g, ""));
  return text.trim() !== "" && Number.isFinite(number) ? number : null;
};

/** Parses the CSV of the tab "Sustained" or "Swap". Columns are found by their header names. */
export function parseAegisTotals(
  csv: string,
  tab: AegisTotalRow["tab"],
): AegisTotalRow[] {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex((row) =>
    REQUIRED_COLUMNS.every((column) => row.map(normalize).includes(column)),
  );
  if (headerIndex < 0) {
    throw new Error(`Header row of the Aegis tab ${tab} not found`);
  }
  const header = rows[headerIndex].map(normalize);
  const c = Object.fromEntries(
    REQUIRED_COLUMNS.map((name) => [name, header.indexOf(name)]),
  ) as Record<(typeof REQUIRED_COLUMNS)[number], number>;

  const usedIds = new Map<string, number>();
  const result: AegisTotalRow[] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const [name, ...rest] = (row[c.Name] ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    const type = normalize(row[c.Type] ?? "");
    if (!name || !type) continue;
    const assumptions = splitAssumptions(rest.join(", "));
    const baseId = slug([tab, name, ...assumptions].join(" "));
    const count = (usedIds.get(baseId) ?? 0) + 1;
    usedIds.set(baseId, count);
    const value = (column: (typeof REQUIRED_COLUMNS)[number]) =>
      toNumber(row[c[column]] ?? "");
    result.push({
      id: count === 1 ? baseId : `${baseId}-${count}`,
      tab,
      name,
      assumptions,
      type,
      shots: value("#"),
      base: value("Base"),
      perk: value("Perk"),
      surge: value("Surge"),
      buff: value("Buff"),
      debuff: value("Debuff"),
      stat: value("200"),
      total: value("Total"),
    });
  }
  return result;
}
