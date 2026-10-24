// Cast times: a grenade, melee or class ability cast keeps the player busy (cast-times.json), a
// super for its super window (superWindow.ts). A cast starts when the player is free again, so the
// casts of all abilities are spaced in time order. The weapon does not fire during a cast
// (simulate.ts). A cast that no longer fits into the damage phase is dropped.

import type { Ability, CastTimes } from "../data/schema";
import { requireValue } from "./requireValue";
import type { AbilityCast } from "./simulate";
import { superWindowMs } from "./superWindow";

/** Time one cast of a grenade, melee or class ability keeps the player busy. */
export function castDurationMs(ability: Ability, times: CastTimes): number {
  const own = times.abilities.find((a) => a.abilityId === (ability.variantOf ?? ability.id));
  return requireValue(own?.castMs ?? times.defaultMs, "castMs");
}

/** Time a cast keeps the player busy: the super window of a super, else the cast time. */
function busyMs(ability: Ability, times: CastTimes): number {
  if (ability.kind !== "super") return castDurationMs(ability, times);
  return ability.usage ? superWindowMs(ability.usage).durationMs : 0;
}

/**
 * The casts of the rotation, each at its requested time or as soon as the cast before is over. The
 * abilities other than supers carry their cast time as castMs, for the shot plan.
 */
export function spaceCasts(
  casts: AbilityCast[],
  times: CastTimes,
  damagePhaseMs = Number.POSITIVE_INFINITY,
): AbilityCast[] {
  const requests = casts
    .flatMap((cast, index) => cast.castsMs.map((ms) => ({ index, ms })))
    .sort((a, b) => a.ms - b.ms || a.index - b.index);
  const result = casts.map((cast) => ({
    ...cast,
    castsMs: [] as number[],
    ...(cast.ability.kind === "super"
      ? {}
      : { castMs: castDurationMs(cast.ability, times) }),
  }));
  let freeAtMs = 0;
  for (const { index, ms } of requests) {
    const atMs = Math.max(ms, freeAtMs);
    if (atMs > damagePhaseMs) continue;
    result[index].castsMs.push(atMs);
    freeAtMs = atMs + busyMs(casts[index].ability, times);
  }
  return result;
}
