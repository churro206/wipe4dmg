// Shared by the meta probe tests (block 5 and its extension): an entry rebuilds one row of the Aegis
// tabs "Sustained" and "Swap" as a build and compares our total with the Aegis total.

import type { AegisTotalRow, Build } from "../../src/data/schema";
import { buildSimulation } from "../../src/engine/buildSimulation";
import { simulate } from "../../src/engine/simulate";
import { buckets, gameData, weaponById } from "../../src/ui/data";

export type Entry = {
  aegisId: string;
  kind: "weapon" | "ability";
  build: Partial<Build>;
  selections?: string[];
  removed?: { column?: keyof AegisTotalRow; factor?: number; reason: string }[];
};

// Long enough to fire all ammo of a heavy weapon and to finish a super.
export const PHASE_SECONDS = 120;
export const STANDARD_WEAPON_EFFECTS = [
  "surge-3x",
  "lumina-noble-rounds",
  "tractor-cannon",
];
export const STANDARD_ABILITY_EFFECTS = ["tractor-cannon"];
export const DEFAULT_WEAPON_ID = "one-thousand-voices";

// An ability entry counts what the ability adds: the weapon of the build makes keyword damage of
// its own (e.g. ignitions of One Thousand Voices).
export function ourTotal(entry: Entry): number {
  if (entry.kind === "weapon") return damageOf(entry, entry.build);
  return damageOf(entry, entry.build) - damageOf(entry, { ...entry.build, abilities: [] });
}

export function damageOf(entry: Entry, fields: Partial<Build>): number {
  const effectIds = [
    ...(entry.kind === "weapon"
      ? STANDARD_WEAPON_EFFECTS
      : STANDARD_ABILITY_EFFECTS),
    ...(entry.selections ?? []),
  ];
  const build: Build = {
    weaponId: DEFAULT_WEAPON_ID,
    guardianClass: "titan",
    subclass: "arc",
    catalyst: false,
    selections: effectIds.map((effectId) => ({
      effectId,
      provider: "fireteamSupport",
    })),
    // Aegis holds its standard factors the whole time.
    effectWindows: Object.fromEntries(
      effectIds.map((id) => [
        id,
        { startMs: 0, durationMs: PHASE_SECONDS * 1000 },
      ]),
    ),
    damagePhaseSeconds: PHASE_SECONDS,
    ...(entry.kind === "ability"
      ? { abilityStats: { super: 200, grenade: 200, melee: 200 } }
      : { weaponsStat: 200 }),
    ...fields,
  };
  const { selected, options } = buildSimulation(build, gameData);
  const result = simulate(
    weaponById(build.weaponId),
    build.damagePhaseSeconds,
    selected,
    buckets,
    options,
  );
  return result.damageInstances
    .filter((d) =>
      entry.kind === "weapon"
        ? d.damageSource === "weapon" || d.damageSource === "keyword"
        : d.damageSource !== "weapon",
    )
    .reduce((sum, d) => sum + d.damage, 0);
}

/** The Aegis total of the row without the factors we do not model (entry.removed). */
export function aegisTotal(
  rows: AegisTotalRow[],
  entry: Entry,
): { row: AegisTotalRow; total: number } {
  const row = rows.find((r) => r.id === entry.aegisId);
  if (!row || row.total === null) {
    throw new Error(`Aegis row ${entry.aegisId} not found or without total`);
  }
  const removed = (entry.removed ?? []).reduce((p, r) => {
    const factor = r.factor ?? (r.column ? row[r.column] : null);
    if (typeof factor !== "number") {
      throw new Error(`Nothing to remove for ${entry.aegisId}: ${r.reason}`);
    }
    return p * factor;
  }, 1);
  return { row, total: row.total / removed };
}
