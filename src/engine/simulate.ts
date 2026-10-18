// Simulator: builds the timeline of shots and damage instances in a damage phase (ADR 0001).
//
// Timing model (matches Time to Empty in Quantum Damage-ics, see docs/data-sources.md):
// - The damage phase starts at 0 ms with the first charge; the first shot follows after the charge time.
// - Shots within a magazine are one shot interval (60000 / fireRateRpm) apart.
// - After the last shot of a magazine, the reload time adds to the shot interval.
// - The weapon fires at most totalShots shots.
// - A shot or damage instance counts if it happens at or before the end of the damage phase.
//
// No effects yet: the result is the weapon on its own (v0.1).

import type { SourcedNumber, Weapon } from "../data/schema";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;

export type Shot = {
  timeMs: number;
};

export type TimedDamageInstance = {
  id: string; // DamageInstance id from the weapon
  timeMs: number;
  damage: number;
};

export type SimulationResult = {
  shots: Shot[];
  damageInstances: TimedDamageInstance[];
  totalDamage: number;
};

export function simulate(
  weapon: Weapon,
  damagePhaseSeconds: number,
): SimulationResult {
  const chargeTimeMs = requireValue(weapon.chargeTimeMs, "chargeTimeMs");
  const fireRateRpm = requireValue(weapon.fireRateRpm, "fireRateRpm");
  const magazine = requireValue(weapon.magazine, "magazine");
  const totalShots = requireValue(weapon.totalShots, "totalShots");
  const reloadTimeMs = requireValue(weapon.reloadTimeMs, "reloadTimeMs");

  if (fireRateRpm <= 0) {
    throw new Error(`fireRateRpm must be positive, got ${fireRateRpm}`);
  }
  if (!Number.isInteger(magazine) || magazine < 1) {
    throw new Error(`magazine must be a positive integer, got ${magazine}`);
  }
  if (!Number.isInteger(totalShots) || totalShots < 0) {
    throw new Error(
      `totalShots must be a non-negative integer, got ${totalShots}`,
    );
  }

  const shotIntervalMs = MS_PER_MINUTE / fireRateRpm;
  const damagePhaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const isInPhase = (timeMs: number) => timeMs <= damagePhaseMs;

  const shots: Shot[] = [];
  for (let i = 0; i < totalShots; i++) {
    const reloads = Math.floor(i / magazine);
    const timeMs = chargeTimeMs + i * shotIntervalMs + reloads * reloadTimeMs;
    if (!isInPhase(timeMs)) break;
    shots.push({ timeMs });
  }

  // Catalyst is not selectable yet, so catalyst-only damage instances never happen.
  const instances = weapon.damageInstances
    .filter((instance) => !instance.requiresCatalyst)
    .map((instance) => ({
      id: instance.id,
      delayMs: requireValue(instance.delayMs, "delayMs"),
      damage: requireValue(instance.damagePerTick, "damagePerTick"),
      ticks: requireValue(instance.ticks, "ticks"),
      tickIntervalMs: requireValue(instance.tickIntervalMs, "tickIntervalMs"),
    }));

  const damageInstances: TimedDamageInstance[] = [];
  for (const shot of shots) {
    for (const instance of instances) {
      for (let tick = 0; tick < instance.ticks; tick++) {
        const timeMs =
          shot.timeMs + instance.delayMs + tick * instance.tickIntervalMs;
        if (isInPhase(timeMs)) {
          damageInstances.push({
            id: instance.id,
            timeMs,
            damage: instance.damage,
          });
        }
      }
    }
  }
  damageInstances.sort((a, b) => a.timeMs - b.timeMs);

  const totalDamage = damageInstances.reduce((sum, d) => sum + d.damage, 0);
  return { shots, damageInstances, totalDamage };
}

/** Returns the value, or throws if it is missing (ADR 0002: never compute with guessed values). */
function requireValue(sourced: SourcedNumber, field: string): number {
  if (sourced.value === null) {
    throw new Error(`${field} is missing (status "${sourced.source.status}")`);
  }
  return sourced.value;
}
