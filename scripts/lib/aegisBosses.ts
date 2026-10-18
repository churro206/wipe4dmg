// Converts the tab "Bosses" of the Aegis Boss Damage sheet into Boss records (ADR 0005).

import type { Boss } from "../../src/data/schema.ts";
import { parseCsv } from "./csv.ts";

export const AEGIS_SHEET_URL = "https://destiny2.science/boss-damage";

const REQUIRED_COLUMNS = ["Activity", "Boss", "Phase"] as const;
const DESCRIPTION_COLUMN = "1 phase Description";

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Parses the CSV of the tab "Bosses". Columns are found by their header names. */
export function parseAegisBosses(csv: string, retrieved: string): Boss[] {
  const rows = parseCsv(csv).map((row) => row.map(normalize));
  const headerIndex = rows.findIndex((row) =>
    REQUIRED_COLUMNS.every((column) => row.includes(column)),
  );
  if (headerIndex < 0) {
    throw new Error(
      `No header row with the columns ${REQUIRED_COLUMNS.join(", ")} found`,
    );
  }
  const header = rows[headerIndex];
  const column = (name: string) => header.indexOf(name);
  const activityAt = column("Activity");
  const nameAt = column("Boss");
  const phaseAt = column("Phase");
  const descriptionAt = column(DESCRIPTION_COLUMN);

  const bosses: Boss[] = [];
  const ids = new Set<string>();
  for (const row of rows.slice(headerIndex + 1)) {
    const name = row[nameAt] ?? "";
    if (name === "") continue;
    const activity = row[activityAt] ?? "";
    const id = slug(`${activity} ${name}`);
    if (ids.has(id)) throw new Error(`Duplicate boss id "${id}"`);
    ids.add(id);

    const phaseText = row[phaseAt] ?? "";
    const phase = Number(phaseText);
    const hasPhase = phaseText !== "" && Number.isFinite(phase) && phase > 0;
    bosses.push({
      id,
      activity,
      name,
      damagePhaseSeconds: {
        value: hasPhase ? phase : null,
        source: {
          name: "Aegis Boss Damage sheet (tab Bosses, column Phase)",
          url: AEGIS_SHEET_URL,
          retrieved,
          status: hasPhase ? "verified" : "missing",
          ...(hasPhase ? {} : { note: `Aegis: "${phaseText}"` }),
        },
      },
      description: descriptionAt >= 0 ? (row[descriptionAt] ?? "") : "",
    });
  }
  return bosses;
}
