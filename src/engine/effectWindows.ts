// Effect windows (ADR 0006, stage B): when each selected effect is active in the damage phase.

import type { Effect } from "../data/schema";
import { requireValue } from "./requireValue";

const MS_PER_SECOND = 1000;

/** Start and duration of an effect in the rotation. Without a duration it lasts until the end. */
export type EffectWindowInput = {
  startMs: number;
  durationMs?: number;
};

export type EffectWindowOptions = {
  // Per effect id; replaces the default window (start 0, duration from the data file).
  effectWindows?: Record<string, EffectWindowInput>;
};

/** Window [startMs, endMs) per effect id; endMs is Infinity if the effect lasts until the end. */
export function resolveWindows(
  effects: Effect[],
  options: EffectWindowOptions,
): Map<string, { startMs: number; endMs: number }> {
  const windows = new Map<string, { startMs: number; endMs: number }>();
  for (const effect of effects) {
    const input = options.effectWindows?.[effect.id];
    if (input) {
      const endMs =
        input.durationMs === undefined
          ? Infinity
          : input.startMs + input.durationMs;
      windows.set(effect.id, { startMs: input.startMs, endMs });
    } else {
      const endMs =
        effect.durationMs === undefined
          ? Infinity
          : requireValue(effect.durationMs, "durationMs");
      windows.set(effect.id, { startMs: 0, endMs });
    }
  }
  return windows;
}

export type EffectWindow = {
  effectId: string;
  startMs: number;
  endMs: number;
  uptime: number; // share of the damage phase, 0 to 1
};

/** Windows of the effects, clipped to the damage phase, with their uptime. */
export function effectWindows(
  effects: Effect[],
  damagePhaseSeconds: number,
  options: EffectWindowOptions,
): EffectWindow[] {
  const phaseMs = damagePhaseSeconds * MS_PER_SECOND;
  const windows = resolveWindows(effects, options);
  return effects.map((effect) => {
    const window = windows.get(effect.id)!;
    const startMs = Math.min(window.startMs, phaseMs);
    const endMs = Math.min(window.endMs, phaseMs);
    return {
      effectId: effect.id,
      startMs,
      endMs,
      uptime: phaseMs > 0 ? (endMs - startMs) / phaseMs : 0,
    };
  });
}
