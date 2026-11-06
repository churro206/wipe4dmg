// "What changed" (V4): the difference between two stands of weapon-status.json, as a list a player reads
// ("Outbreak Prime 30 s: 5824 → 21266").

import type { WeaponChange, WeaponStatusFile } from "../data/schema.ts";

type Row = WeaponStatusFile["weapons"][number];
type Time = "s10" | "s30" | "s60";

const TIMES: Time[] = ["s10", "s30", "s60"];
const TIME_LABEL: Record<Time, string> = { s10: "10 s", s30: "30 s", s60: "60 s" };
const STATUS_LABEL: Record<Row["status"], string> = { complete: "Complete", partial: "Partial", estimated: "Estimated" };
const MIN_MOVE = 0.001; // below 0.1 % it is rounding, not a change

/** The damage value that moved most (relative), or null when none moved by at least 0.1 %. */
function biggestMove(before: Row, now: Row): WeaponChange | null {
  let best: { rel: number; change: WeaponChange } | null = null;
  for (const catalyst of [false, true]) {
    const a = catalyst ? before.damage.catalyst : before.damage.base;
    const b = catalyst ? now.damage.catalyst : now.damage.base;
    if (!a || !b) continue;
    for (const time of TIMES) {
      const rel = a[time] === 0 ? (b[time] === 0 ? 0 : 1) : Math.abs(b[time] / a[time] - 1);
      if (rel < MIN_MOVE) continue;
      // The base values win a tie with the catalyst values: they come first and `>` keeps them.
      if (!best || rel > best.rel) {
        best = { rel, change: { id: now.id, name: now.name, kind: "damage", time, catalyst, from: a[time], to: b[time] } };
      }
    }
  }
  return best?.change ?? null;
}

/** All changes from `before` to `now`: new weapons, removed ones, then per weapon its damage and status. */
export function diffWeaponStatus(before: Row[], now: Row[]): WeaponChange[] {
  const old = new Map(before.map((w) => [w.id, w]));
  const current = new Map(now.map((w) => [w.id, w]));
  const changes: WeaponChange[] = [];
  for (const w of now) {
    const prev = old.get(w.id);
    if (!prev) {
      changes.push({ id: w.id, name: w.name, kind: "new" });
      continue;
    }
    const damage = biggestMove(prev, w);
    if (damage) changes.push(damage);
    if (prev.status !== w.status) {
      changes.push({ id: w.id, name: w.name, kind: "status", from: STATUS_LABEL[prev.status], to: STATUS_LABEL[w.status] });
    }
  }
  for (const w of before) if (!current.has(w.id)) changes.push({ id: w.id, name: w.name, kind: "removed" });
  return changes;
}

const round = (v: number | string | undefined): string => (typeof v === "number" ? String(Math.round(v)) : String(v ?? ""));

/** One line of the list. */
export function changeText(change: WeaponChange): string {
  switch (change.kind) {
    case "new":
      return `${change.name} is new`;
    case "removed":
      return `${change.name} is gone`;
    case "status":
      return `${change.name} status: ${change.from} → ${change.to}`;
    case "damage":
      return `${change.name} ${TIME_LABEL[change.time!]}${change.catalyst ? " with Catalyst" : ""}: ${round(change.from)} → ${round(change.to)}`;
  }
}
