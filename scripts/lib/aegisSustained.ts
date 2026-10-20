// Converts the tab "Sustained" of the Aegis Boss Damage sheet into AegisSustainedRow records
// (ADR 0013, point 7): the second timing source of the weapon import.

import type { AegisSustainedRow } from "../../src/data/schema.ts";
import { normalize, slug } from "./aegisBosses.ts";
import { splitAssumptions } from "./aegisWeapons.ts";
import { parseCsv } from "./csv.ts";

const REQUIRED_COLUMNS = ["Name", "Type", "#", "Distribution", "TtE"] as const;
// The tab also lists abilities ("super", "grenade", "melee", "tick"); only weapons are kept.
const AMMO: Record<string, AegisSustainedRow["ammo"]> = {
  primary: "primary",
  special: "special",
  power: "heavy",
};

const toNumber = (text: string): number | null => {
  const number = Number(text.replace(/,/g, ""));
  return text.trim() !== "" && Number.isFinite(number) ? number : null;
};
const msIn = (notes: string, word: string): number | null => {
  const match = new RegExp(`(\\d+)\\s*ms ${word}\\b`, "i").exec(notes);
  return match ? Number(match[1]) : null;
};

/** "3-3-3-3-2" → [3, 3, 3, 3, 2]; "1-1-1..." repeats; "N/A", "INF" or "complicated" → []. */
function distribution(text: string): {
  magazines: number[];
  repeating: boolean;
} {
  const repeating = text.endsWith("...");
  const parts = text.replace(/\.\.\.$/, "").split("-");
  const magazines = parts.map(Number);
  return magazines.every((n) => Number.isInteger(n) && n > 0)
    ? { magazines, repeating }
    : { magazines: [], repeating: false };
}

/** Parses the CSV of the tab "Sustained". Columns are found by their header names. */
export function parseAegisSustained(csv: string): AegisSustainedRow[] {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex((row) =>
    REQUIRED_COLUMNS.every((column) => row.map(normalize).includes(column)),
  );
  if (headerIndex < 0) {
    throw new Error("Header row of the Aegis tab Sustained not found");
  }
  const header = rows[headerIndex].map(normalize);
  const column = (name: string) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`Column "${name}" not found`);
    return index;
  };
  const c = {
    name: column("Name"),
    type: column("Type"),
    family: column("Family"),
    shots: column("#"),
    notes: column("Notes"),
    distribution: column("Distribution"),
    peakRate: column("peak Rate"),
    timeToEmpty: column("TtE"),
    base: column("Base"),
  };

  const usedIds = new Map<string, number>();
  const result: AegisSustainedRow[] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const ammo = AMMO[normalize(row[c.type] ?? "")];
    const shots = toNumber(row[c.shots] ?? "");
    if (!ammo || shots === null) continue;
    const [name, ...rest] = (row[c.name] ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
    if (!name) continue;
    const assumptions = splitAssumptions(rest.join(", "));
    const baseId = slug([name, ...assumptions].join(" "));
    const count = (usedIds.get(baseId) ?? 0) + 1;
    usedIds.set(baseId, count);
    const notes = (row[c.notes] ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .join("; ");
    result.push({
      id: count === 1 ? baseId : `${baseId}-${count}`,
      name,
      assumptions,
      ammo,
      family: normalize(row[c.family] ?? ""),
      shots,
      ...distribution(normalize(row[c.distribution] ?? "")),
      reloadMs: msIn(notes, "reload"),
      chargeMs: msIn(notes, "charge"),
      swapMs: msIn(notes, "swap"),
      notes,
      peakRateSeconds: toNumber(row[c.peakRate] ?? ""),
      timeToEmptySeconds: toNumber(row[c.timeToEmpty] ?? ""),
      base: toNumber(row[c.base] ?? ""),
    });
  }
  return result;
}
