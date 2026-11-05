// The weapon table of the coverage page (V2): sort, filter, rank and the cells of the rows of
// weapon-status.json. The limits of the traffic light come from status-limits.json.

import type { StatusLimits, WeaponStatusFile } from "../data/schema";

export type WeaponRow = WeaponStatusFile["weapons"][number];
export type WeaponState = WeaponRow["status"];
export type Time = "s10" | "s30" | "s60";
export type SortKey = "name" | "status" | "damage" | "quantum" | "aegis" | "trust" | "open";
export type Light = { color: "green" | "yellow" | "red" | null; label: string };

export const TIMES: { key: Time; label: string }[] = [
  { key: "s10", label: "10 s" },
  { key: "s30", label: "30 s" },
  { key: "s60", label: "60 s" },
];

const STATUS_LABEL: Record<WeaponState, string> = {
  complete: "Complete",
  partial: "Partial",
  estimated: "Estimated",
};

export const statusLabel = (status: WeaponState): string => STATUS_LABEL[status];

/**
 * The traffic light of the deviation against Quantum: green up to `quantumDeviation`, yellow up to
 * `quantumRed`, red above. Without a Quantum row (`null`) there is no colour, only "no row".
 */
export function quantumLight(deviation: number | null, limits: StatusLimits): Light {
  if (deviation === null) return { color: null, label: "no row" };
  const d = Math.abs(deviation);
  const color = d <= limits.quantumDeviation ? "green" : d <= limits.quantumRed ? "yellow" : "red";
  return { color, label: `${deviation > 0 ? "+" : ""}${(deviation * 100).toFixed(1)} %` };
}

/** The open sentences of a weapon: what its texts say that the model does not carry yet. */
export const openCount = (row: WeaponRow): number => row.sentences.filter((s) => s.state === "open").length;

/** "Comes in M3" for a weapon that an open block of the plan names; null otherwise. */
export const comesIn = (row: WeaponRow): string | null => (row.planBlock === null ? null : `Comes in ${row.planBlock}`);

/** The independent check against Aegis: the largest deviation of its rows, or why there is none. */
export function aegisCell(row: WeaponRow): { text: string; deviation: number | null } {
  if (row.aegis.check !== "checked") return { text: row.aegis.check, deviation: null };
  const deviations = row.aegis.rows.flatMap((r) => (r.deviation === null ? [] : [r.deviation]));
  if (deviations.length === 0) return { text: "no model", deviation: null };
  const worst = deviations.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a));
  const rows = row.aegis.rows.length;
  return {
    text: `${worst > 0 ? "+" : ""}${(worst * 100).toFixed(1)} %${rows > 1 ? ` (${rows} rows)` : ""}`,
    deviation: worst,
  };
}

const STATUS_ORDER: Record<WeaponState, number> = { complete: 0, partial: 1, estimated: 2 };
const TRUST_ORDER: Record<WeaponRow["trust"], number> = { measured: 0, derived: 1, estimated: 2 };

/** The rank of every weapon (1 = most damage) over the chosen time, independent of sort and filter. */
export function damageRanks(rows: WeaponRow[], time: Time): Map<string, number> {
  const sorted = [...rows].sort((a, b) => b.damage.base[time] - a.damage.base[time] || a.name.localeCompare(b.name));
  return new Map(sorted.map((r, i) => [r.id, i + 1]));
}

/**
 * The rows filtered by status and name part, then sorted by `sort`: descending unless `ascending`
 * (name: Z to A, status: estimated first, damage: most first, quantum and aegis: largest deviation first).
 * Rows without a value (no Quantum row, no check) come last in both directions. Ties go by name.
 */
export function rankWeapons(
  rows: WeaponRow[],
  opts: { sort: SortKey; time: Time; ascending?: boolean; status?: WeaponState | "all"; text?: string },
): WeaponRow[] {
  const text = (opts.text ?? "").trim().toLowerCase();
  const kept = rows.filter(
    (r) =>
      (opts.status === undefined || opts.status === "all" || r.status === opts.status) &&
      (text === "" || r.name.toLowerCase().includes(text)),
  );
  const key = (r: WeaponRow): number | string | null => {
    switch (opts.sort) {
      case "name":
        return r.name;
      case "status":
        return STATUS_ORDER[r.status];
      case "damage":
        return r.damage.base[opts.time];
      case "quantum":
        return r.quantum === null ? null : Math.abs(r.quantum.deviation);
      case "aegis": {
        const d = aegisCell(r).deviation;
        return d === null ? null : Math.abs(d);
      }
      case "trust":
        return TRUST_ORDER[r.trust];
      case "open":
        return openCount(r);
    }
  };
  const sign = opts.ascending ? 1 : -1;
  return [...kept].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    if (x === null || y === null) return x === y ? a.name.localeCompare(b.name) : x === null ? 1 : -1;
    const c = typeof x === "string" ? x.localeCompare(y as string) : x - (y as number);
    return sign * c || a.name.localeCompare(b.name);
  });
}
