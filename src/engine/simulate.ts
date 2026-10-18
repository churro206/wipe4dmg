// Simulator: builds the timeline of shots in a damage phase (ADR 0001).
// Damage is not computed yet, because the damage values are still missing.
//
// Timing model:
// - The damage phase starts at 0 ms with the first charge.
// - A shot happens when its charge completes; the next charge starts right after.
// - After the last shot of a magazine, a reload follows before the next charge.
// - A shot counts if it happens at or before the end of the damage phase.
// - Not modeled yet: beam duration (not measured) and reserves (value missing).

import type { SourcedNumber, Weapon } from "../data/schema";

const MS_PER_SECOND = 1000;

export type Shot = {
  timeMs: number;
};

export function simulate(weapon: Weapon, damagePhaseSeconds: number): Shot[] {
  const chargeTimeMs = requireValue(weapon.chargeTimeMs, "chargeTimeMs");
  const magazine = requireValue(weapon.magazine, "magazine");
  const reloadTimeMs = requireValue(weapon.reloadTimeMs, "reloadTimeMs");

  // Guards against an endless loop.
  if (chargeTimeMs <= 0) {
    throw new Error(`chargeTimeMs must be positive, got ${chargeTimeMs}`);
  }
  if (!Number.isInteger(magazine) || magazine < 1) {
    throw new Error(`magazine must be a positive integer, got ${magazine}`);
  }

  const damagePhaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const shots: Shot[] = [];
  let timeMs = 0;
  let roundsInMagazine = magazine;

  while (true) {
    if (roundsInMagazine === 0) {
      timeMs += reloadTimeMs;
      roundsInMagazine = magazine;
    }
    timeMs += chargeTimeMs;
    // Negated form also stops for NaN.
    if (!(timeMs <= damagePhaseMs)) break;
    shots.push({ timeMs });
    roundsInMagazine--;
  }

  return shots;
}

/** Returns the value, or throws if it is missing (ADR 0002: never compute with guessed values). */
function requireValue(sourced: SourcedNumber, field: string): number {
  if (sourced.value === null) {
    throw new Error(`${field} is missing (status "${sourced.source.status}")`);
  }
  return sourced.value;
}
