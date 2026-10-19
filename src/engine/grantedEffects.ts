// Granted effects (ADR 0009): an ability can apply effects on its first cast, e.g. Moebius Quiver
// its tether. Their windows start at that cast and keep the duration from the effects data file.

import type { Effect } from "../data/schema";
import type { EffectWindowInput } from "./effectWindows";
import { requireValue } from "./requireValue";
import type { AbilityCast } from "./simulate";

/** Window per granted effect id, for the effectWindows option of the simulator. */
export function grantedEffectWindows(
  casts: AbilityCast[],
  effects: Effect[],
): Record<string, EffectWindowInput> {
  const windows: Record<string, EffectWindowInput> = {};
  for (const { ability, castsMs } of casts) {
    if (castsMs.length === 0) continue;
    const startMs = Math.min(...castsMs);
    for (const effectId of ability.grantsEffectIds ?? []) {
      const effect = effects.find((e) => e.id === effectId);
      if (!effect) {
        throw new Error(`${ability.id} grants unknown effect "${effectId}"`);
      }
      windows[effectId] = effect.durationMs
        ? { startMs, durationMs: requireValue(effect.durationMs, "durationMs") }
        : { startMs };
    }
  }
  return windows;
}
