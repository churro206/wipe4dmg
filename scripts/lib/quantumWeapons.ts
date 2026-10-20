// Converts the Quantum Damage-ics tabs Primaries, Specials and Heavies into QuantumWeaponRow records (ADR 0013).

import type { QuantumWeaponRow, WeaponType } from "../../src/data/schema.ts";
import { normalize, slug } from "./aegisBosses.ts";
import { parseCsv } from "./csv.ts";

export type QuantumTab = QuantumWeaponRow["tab"];

const NAME_COLUMN = "Frame/Weapon";

// The first column holds either a section heading (weapon type, plural) or the label of a variant
// such as "cata". The heading stands on the first row of its section, which can be a base row.
const SECTIONS: Record<string, WeaponType> = {
  "Auto Rifles": "autoRifle",
  Bows: "bow",
  "Breech Grenade Launchers": "grenadeLauncher",
  "Fusion Rifles": "fusionRifle",
  Glaives: "glaive",
  "Grenade Launchers": "grenadeLauncher",
  "Hand Cannons": "handCannon",
  "Linear Fusion Rifles": "linearFusionRifle",
  "Machine Guns": "machineGun",
  "Pulse Rifles": "pulseRifle",
  "Rocket Launchers": "rocketLauncher",
  "Scout Rifles": "scoutRifle",
  Shotguns: "shotgun",
  Sidearms: "sidearm",
  SMGs: "submachineGun",
  "Sniper Rifles": "sniperRifle",
  Swords: "sword",
  "Trace Rifles": "traceRifle",
};

const NUMBER_COLUMNS = {
  totalDamage: "Theoretical Total Damage",
  magDamage: "1-Mag Damage",
  magazine: "Magazine Capacity",
  totalShots: "Reserves + Magazine",
  rpm: "Fire rate (rpm)",
  reloadSeconds: "Reload Speed (s)",
  timeToEmptySeconds: "Time to Empty (s)",
  bodyDamage: "Body Damage",
  precisionDamage: "Precision Damage",
} as const;
type NumberKey = keyof typeof NUMBER_COLUMNS;

/** Parses one tab. Rows before the first section heading have no weapon type and are an error. */
export function parseQuantumWeapons(
  csv: string,
  tab: QuantumTab,
): QuantumWeaponRow[] {
  const rows = parseCsv(csv).map((row) => row.map(normalize));
  const headerIndex = rows.findIndex((row) => row.includes(NAME_COLUMN));
  if (headerIndex < 0) {
    throw new Error(`Header row of the Quantum tab ${tab} not found`);
  }
  const header = rows[headerIndex];
  const column = (name: string) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`Column "${name}" not found in ${tab}`);
    return index;
  };
  const nameColumn = column(NAME_COLUMN);
  const noteColumn = column(NUMBER_COLUMNS.precisionDamage) + 1;
  const numberKeys = Object.keys(NUMBER_COLUMNS) as NumberKey[];
  const numberColumns = numberKeys.map(
    (key) => [key, column(NUMBER_COLUMNS[key])] as const,
  );

  let weaponType: WeaponType | null = null;
  const usedIds = new Map<string, number>();
  return rows
    .slice(headerIndex + 1)
    .filter((row) => row[nameColumn])
    .map((row) => {
      const first = row[0] ?? "";
      const section = SECTIONS[first];
      if (section) weaponType = section;
      if (!weaponType) {
        throw new Error(`Row "${row[nameColumn]}" in ${tab} has no section`);
      }
      const variant = section ? "" : first;
      const numbers = {} as Record<NumberKey, number | null>;
      const textCells: Record<string, string> = {};
      for (const [key, index] of numberColumns) {
        const text = row[index] ?? "";
        const number = Number(text.replace(/,/g, ""));
        if (text !== "" && Number.isFinite(number)) {
          numbers[key] = number;
        } else {
          numbers[key] = null;
          if (text !== "") textCells[key] = text;
        }
      }
      // "rocketLauncher" → "rocket Launcher", so the id reads heavies-rocket-launcher-truth
      const typeWords = weaponType.replace(/[A-Z]/g, (c) => ` ${c}`);
      const baseId = slug([tab, typeWords, row[nameColumn], variant].join(" "));
      const count = (usedIds.get(baseId) ?? 0) + 1;
      usedIds.set(baseId, count);
      return {
        id: count === 1 ? baseId : `${baseId}-${count}`,
        tab,
        weaponType,
        name: row[nameColumn],
        variant,
        ...numbers,
        textCells,
        note: row[noteColumn] ?? "",
      };
    });
}
