// Burn of scorch (ADR 0017, stage S2): a target with stacks takes damage that grows with them. The
// stacks hold after an application and then fall one by one; an ignition takes them all. The first
// stacks on a clean target start the ticks, a tick without stacks ends them.

import type { Keyword } from "../../data/schema";
import { productOf, type Factors } from "../effectParts";
import type { CounterState, RunEvent } from "../eventRun";
import { KEYWORD_EVENT_GROUP } from "../keywordRun";
import { requireValue } from "../requireValue";
import type { TimedDamageInstance } from "../simulate";

export type Burn = {
  /** Lets the stacks fall that were not refreshed; call before adding stacks. */
  decay: (counter: CounterState, timeMs: number) => void;
  /** Stacks were added by `source`: starts the ticks on a clean target. */
  applied: (
    counter: CounterState,
    timeMs: number,
    source: TimedDamageInstance,
    schedule: (event: RunEvent) => void,
  ) => void;
  /** An ignition took the stacks: the running ticks end. */
  reset: (counter: CounterState) => void;
};

export function createBurn(
  keyword: Keyword,
  factorsAt: (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ) => Factors,
  isInPhase: (timeMs: number) => boolean,
): Burn | undefined {
  const { burn } = keyword;
  if (!burn) return undefined;
  const baseDamage = requireValue(burn.baseDamage, "baseDamage");
  const damagePerStack = requireValue(burn.damagePerStack, "damagePerStack");
  const firstTickDelayMs = requireValue(
    burn.firstTickDelayMs,
    "firstTickDelayMs",
  );
  const secondTickDelayMs = requireValue(
    burn.secondTickDelayMs,
    "secondTickDelayMs",
  );
  const tickIntervalMs = requireValue(burn.tickIntervalMs, "tickIntervalMs");
  const holdMs = requireValue(burn.holdMs, "holdMs");
  const decayStackIntervalMs = requireValue(
    burn.decayStackIntervalMs,
    "decayStackIntervalMs",
  );

  const stacksAt = (counter: CounterState, timeMs: number) => {
    const fallingMs = timeMs - (counter.appliedMs ?? timeMs) - holdMs;
    return fallingMs <= 0
      ? counter.stacks
      : Math.max(
          0,
          counter.stacks - Math.floor(fallingMs / decayStackIntervalMs),
        );
  };

  const tick = (
    counter: CounterState,
    generation: number,
    index: number,
    timeMs: number,
  ): RunEvent => ({
    timeMs,
    group: KEYWORD_EVENT_GROUP,
    handle: (_, emit, schedule) => {
      if ((counter.burnGeneration ?? 0) !== generation) return;
      const stacks = stacksAt(counter, timeMs);
      if (stacks <= 0 || !isInPhase(timeMs) || !counter.burnSource) {
        counter.stacks = 0;
        counter.burning = false;
        return;
      }
      const factors = factorsAt(timeMs, keyword, counter.burnSource);
      emit({
        id: "burn",
        timeMs,
        damage: (baseDamage + damagePerStack * stacks) * productOf(factors),
        damageSource: "keyword",
        keywordId: keyword.id,
        element: keyword.element,
        factors,
      });
      schedule(
        tick(
          counter,
          generation,
          index + 1,
          timeMs + (index === 0 ? secondTickDelayMs : tickIntervalMs),
        ),
      );
    },
  });

  return {
    decay: (counter, timeMs) => {
      counter.stacks = stacksAt(counter, timeMs);
    },
    applied: (counter, timeMs, source, schedule) => {
      counter.appliedMs = timeMs;
      counter.burnSource = source;
      if (counter.burning || counter.stacks <= 0) return;
      counter.burning = true;
      schedule(
        tick(counter, counter.burnGeneration ?? 0, 0, timeMs + firstTickDelayMs),
      );
    },
    reset: (counter) => {
      counter.burnGeneration = (counter.burnGeneration ?? 0) + 1;
      counter.burning = false;
    },
  };
}
