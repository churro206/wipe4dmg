// Super window (ADR 0009): how long a super keeps the player busy, so the weapon cannot fire.
// The player uses the super as fast as possible. Missing values give an estimate (exact = false).

import type { SuperUsage } from "../data/schema";
import { requireValue } from "./requireValue";

export type SuperWindowLength = {
  durationMs: number;
  exact: boolean; // false: a value is missing; 0 for an unknown cast, else the base duration
};

export function superWindowMs(usage: SuperUsage): SuperWindowLength {
  switch (usage.type) {
    case "timed": {
      const { value, source } = usage.weaponReadyMs;
      return value === null
        ? { durationMs: 0, exact: false }
        : { durationMs: value, exact: source.status !== "unverified" };
    }
    case "cast":
      return usage.castMs.value === null
        ? { durationMs: 0, exact: false }
        : { durationMs: usage.castMs.value, exact: true };
    case "shots": {
      const baseMs = requireValue(usage.baseDurationMs, "baseDurationMs");
      const shots = usage.shots.value;
      const intervalMs = usage.shotIntervalMs.value;
      // one shot needs no interval: the window ends with it
      if (shots === 1) return { durationMs: 0, exact: true };
      if (shots === null || intervalMs === null) {
        return { durationMs: baseMs, exact: false };
      }
      return {
        durationMs: Math.min(baseMs, (shots - 1) * intervalMs),
        exact: true,
      };
    }
    case "drain": {
      // Energy share per ms: passive 1 / base duration, plus one attack's drain per attack interval.
      const baseMs = requireValue(usage.baseDurationMs, "baseDurationMs");
      const drain = usage.drainPerAttack.value;
      const intervalMs = usage.attackIntervalMs.value;
      // A channel without attacks, e.g. Chaos Reach, lasts exactly its base duration.
      if (drain === 0) return { durationMs: baseMs, exact: true };
      if (drain === null || intervalMs === null) {
        return { durationMs: baseMs, exact: false };
      }
      return { durationMs: 1 / (1 / baseMs + drain / intervalMs), exact: true };
    }
  }
}
