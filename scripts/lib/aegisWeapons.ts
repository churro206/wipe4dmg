// Converts the tab "Weapons" of the Aegis Boss Damage sheet into AegisWeaponRow records (ADR 0013).

import type { AegisWeaponRow, WeaponType } from "../../src/data/schema.ts";
import { normalize, slug } from "./aegisBosses.ts";
import { parseCsv } from "./csv.ts";

const REQUIRED_COLUMNS = ["Type", "Subtype", "Modifiers", "Patch"] as const;
const VISUAL_GROUP = "VISUAL";

// Aegis names weapon types in the singular, e.g. "Rocket launcher".
const WEAPON_TYPES: Record<string, WeaponType> = {
  "Auto rifle": "autoRifle",
  Bow: "bow",
  "Fusion rifle": "fusionRifle",
  Glaive: "glaive",
  "Grenade launcher": "grenadeLauncher",
  "Hand cannon": "handCannon",
  "Linear fusion rifle": "linearFusionRifle",
  "Machine gun": "machineGun",
  "Pulse rifle": "pulseRifle",
  "Rocket launcher": "rocketLauncher",
  "Scout rifle": "scoutRifle",
  Shotgun: "shotgun",
  Sidearm: "sidearm",
  SMG: "submachineGun",
  "Sniper rifle": "sniperRifle",
  Sword: "sword",
  "Trace rifle": "traceRifle",
};

const toNumber = (text: string): number | null => {
  if (text === "" || text === "/" || text === "N/A") return null;
  const number = Number(text.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
};

const requireNumber = (text: string, column: string, row: string): number => {
  const number = toNumber(text);
  if (number === null)
    throw new Error(`Row "${row}": column "${column}" is not a number`);
  return number;
};

/** "average - Prototype Truthseeker, Reaper's Tithe x4" → ["average", "Prototype Truthseeker", "Reaper's Tithe x4"] */
export const splitAssumptions = (text: string): string[] =>
  text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .flatMap((part) =>
      part.startsWith("average - ")
        ? ["average", part.slice(10).trim()]
        : [part],
    );

/**
 * Name of an assumption without stack count and remark: "Reaper's Tithe x4" → "Reaper's Tithe",
 * "Impact Core (solar)" → "Impact Core".
 */
export const assumptionName = (assumption: string): string =>
  assumption.replace(/\s+x\d+$/, "").replace(/\s*\([^)]*\)$/, "");

/**
 * Parses the CSV of the tab "Weapons". Columns are found by their header names; "Wipe", "#",
 * "Full Modifiers" and "visual Value" are read from the group "VISUAL" in the row above, since the
 * group "HEALTHBAR" repeats some of them.
 */
export function parseAegisWeapons(csv: string): AegisWeaponRow[] {
  const rows = parseCsv(csv).map((row) => row.map(normalize));
  const headerIndex = rows.findIndex((row) =>
    REQUIRED_COLUMNS.every((column) => row.includes(column)),
  );
  if (headerIndex < 1) {
    throw new Error("Header row of the Aegis tab Weapons not found");
  }
  const header = rows[headerIndex];
  const visualStart = rows[headerIndex - 1].indexOf(VISUAL_GROUP);
  if (visualStart < 0) throw new Error(`Group "${VISUAL_GROUP}" not found`);
  const column = (name: string, start = 0) => {
    const index = header.findIndex((cell, i) => i >= start && cell === name);
    if (index < 0) throw new Error(`Column "${name}" not found`);
    return index;
  };
  const columns = {
    type: column("Type"),
    name: column("Subtype"),
    crit: column("crit Shot"),
    body: column("body Shot"),
    other: column("other Ticks"),
    modifiers: column("Modifiers"),
    wipe: column("Wipe", visualStart),
    shots: column("#", visualStart),
    fullModifiers: column("Full Modifiers", visualStart),
    perShot: column("visual Value", visualStart),
    patch: column("Patch"),
  };

  const usedIds = new Map<string, number>();
  return rows
    .slice(headerIndex + 1)
    .filter((row) => row[columns.name])
    .map((row) => {
      const typeName = row[columns.type];
      const weaponType = WEAPON_TYPES[typeName];
      if (!weaponType)
        throw new Error(`Unknown Aegis weapon type "${typeName}"`);
      const name = row[columns.name];
      const assumptions = splitAssumptions(row[columns.modifiers]);
      const baseId = slug([typeName, name, ...assumptions].join(" "));
      const count = (usedIds.get(baseId) ?? 0) + 1;
      usedIds.set(baseId, count);
      const label = `${name} ${row[columns.modifiers]}`.trim();
      return {
        id: count === 1 ? baseId : `${baseId}-${count}`,
        weaponType,
        name,
        critShot: toNumber(row[columns.crit]),
        bodyShot: toNumber(row[columns.body]),
        otherTicks: row[columns.other],
        assumptions,
        wipe: requireNumber(row[columns.wipe], "Wipe", label),
        shots: requireNumber(row[columns.shots], "#", label),
        fullModifiers: requireNumber(
          row[columns.fullModifiers],
          "Full Modifiers",
          label,
        ),
        perShot: requireNumber(row[columns.perShot], "visual Value", label),
        gameVersion: row[columns.patch],
      };
    });
}
