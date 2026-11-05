// The weapon ranking of the coverage page (V2): sort and filter of the rows of weapon-status.json.

import type { WeaponStatusFile } from "../data/schema";

export type WeaponRow = WeaponStatusFile["weapons"][number];
export type WeaponState = WeaponRow["status"];
export type SortKey = "name" | "status" | "s10" | "s30" | "s60";

/** The traffic light of a computed status; the status itself comes from the data file. */
export function lightOf(status: WeaponState): { color: "green" | "yellow" | "red"; label: string } {
  switch (status) {
    case "complete":
      return { color: "green", label: "Complete" };
    case "partial":
      return { color: "yellow", label: "Partial" };
    case "estimated":
      return { color: "red", label: "Estimated" };
  }
}

const STATUS_ORDER: Record<WeaponState, number> = { complete: 0, partial: 1, estimated: 2 };

/**
 * The rows filtered by status and name part, then sorted by `sort`: descending unless `ascending`
 * (name: Z to A, status: estimated first, damage: largest first). Ties go by name.
 */
export function rankWeapons(
  rows: WeaponRow[],
  opts: { sort: SortKey; ascending?: boolean; status?: WeaponState | "all"; text?: string },
): WeaponRow[] {
  const text = (opts.text ?? "").trim().toLowerCase();
  const kept = rows.filter(
    (r) =>
      (opts.status === undefined || opts.status === "all" || r.status === opts.status) &&
      (text === "" || r.name.toLowerCase().includes(text)),
  );
  const key = (r: WeaponRow): number | string => {
    if (opts.sort === "name") return r.name;
    if (opts.sort === "status") return STATUS_ORDER[r.status];
    return r.damage.base[opts.sort];
  };
  const sign = opts.ascending ? 1 : -1;
  return [...kept].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    const c = typeof x === "string" ? x.localeCompare(y as string) : x - (y as number);
    return sign * c || a.name.localeCompare(b.name);
  });
}
