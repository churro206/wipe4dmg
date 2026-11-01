// Status container of the core (docs/architecture.md sections 6 and 8, ADR 0018 B3a): one state per
// status on the target (TargetStatusId), whatever its kind. It replaces keywordRun.ts and burn.ts and
// keeps their behavior; the values come from the status definitions (keywords.json).
//
// A hit passes the statuses in this order:
// 1. Every active status that goes off by damage taken (Jolt, Volatile, Unravel) counts the damage of
//    the hit (not of its own hits). Past the threshold and outside the cooldown it goes off: its
//    damage follows after the delay, the cooldown starts, and a status removed on trigger is gone.
// 2. A status with player stacks (Bolt Charge) at its stack count goes off after its delay if the hit
//    is one that discharges it; the stacks are used up.
// 3. Rules that apply a status (`on hit → applyStatus`, run by the core after steps 1 and 2) apply it:
//    - damage taken: applies it or refreshes the duration. While the cooldown runs, a status
//      removed on trigger cannot be applied again. A fresh application counts the applying hit only
//      if the keyword says so (Jolt yes, Volatile no).
//    - stacks (Scorch): adds stacks, scaled by action modifiers (Ember of Ashes) and rounded up. At
//      the threshold the keyword (Ignition) goes off at once with the bonuses of the applying hit, the
//      stacks reset and the cooldown blocks new stacks.
//    - player stacks (Bolt Charge): adds stacks up to the stack count.
//
// Burn of scorch (ADR 0017, stage S2): a target with stacks takes damage that grows with them. The
// stacks hold after an application and then fall one by one; an ignition takes them all. The first
// stacks on a clean target start the ticks, a tick without stacks ends them.

import type {
  Keyword,
  MultiplierPart,
  StatusModifierData,
  TargetStatusId,
} from "../../data/schema";
import { productOf, type Factors } from "../effectParts";
import {
  statusState,
  type OnHit,
  type RunEvent,
  type StatusState,
  type TargetState,
} from "../eventRun";
import { requireValue } from "../requireValue";
import type { TimedDamageInstance } from "./types";

export const KEYWORD_EVENT_GROUP = 4;
// Guards rounding up against floating point noise, e.g. 40 x 1.5 = 60.00000000000001.
const ROUNDING_TOLERANCE = 1e-9;

type Burn = {
  /** The stacks at a time, after the hold and the fall of the ones not refreshed. */
  stacksAt: (state: StatusState, timeMs: number) => number;
  /** Lets the stacks fall that were not refreshed; call before adding stacks. */
  decay: (state: StatusState, timeMs: number) => void;
  /** Stacks were added by `source`: starts the ticks on a clean target. */
  applied: (
    state: StatusState,
    timeMs: number,
    source: TimedDamageInstance,
    schedule: (event: RunEvent) => void,
  ) => void;
  /** An ignition took the stacks: the running ticks end. */
  reset: (state: StatusState) => void;
};

function createBurn(
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

  const stacksAt = (state: StatusState, timeMs: number) => {
    const fallingMs = timeMs - (state.appliedMs ?? timeMs) - holdMs;
    return fallingMs <= 0
      ? state.stacks
      : Math.max(
          0,
          state.stacks - Math.floor(fallingMs / decayStackIntervalMs),
        );
  };

  const tick = (
    state: StatusState,
    generation: number,
    index: number,
    timeMs: number,
  ): RunEvent => ({
    timeMs,
    group: KEYWORD_EVENT_GROUP,
    handle: (_, emit, schedule) => {
      if ((state.burnGeneration ?? 0) !== generation) return;
      const stacks = stacksAt(state, timeMs);
      if (stacks <= 0 || !isInPhase(timeMs) || !state.burnSource) {
        state.stacks = 0;
        state.burning = false;
        return;
      }
      const factors = factorsAt(timeMs, keyword, state.burnSource);
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
          state,
          generation,
          index + 1,
          timeMs + (index === 0 ? secondTickDelayMs : tickIntervalMs),
        ),
      );
    },
  });

  return {
    stacksAt,
    decay: (state, timeMs) => {
      state.stacks = stacksAt(state, timeMs);
    },
    applied: (state, timeMs, source, schedule) => {
      state.appliedMs = timeMs;
      state.burnSource = source;
      if (state.burning || state.stacks <= 0) return;
      state.burning = true;
      schedule(
        tick(state, state.burnGeneration ?? 0, 0, timeMs + firstTickDelayMs),
      );
    },
    reset: (state) => {
      state.burnGeneration = (state.burnGeneration ?? 0) + 1;
      state.burning = false;
    },
  };
}

export type StatusContext = {
  keywords: Keyword[];
  // Statuses without damage and trigger (Weaken); their multipliers join the formula with B3b
  modifierStatuses?: StatusModifierData[];
  // The multiplier for the damage of a keyword; source is the hit that applied it (Ignition).
  multiplierAt: (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ) => Factors;
  // Factor of the action modifiers on the stacks an application brings (Ember of Ashes)
  stackFactorAt: (status: TargetStatusId, timeMs: number) => number;
  isInPhase: (timeMs: number) => boolean;
};

/** What an application brings: stacks (read when the status has stacks) and a duration. */
type StatusApplication = {
  stacks?: () => number;
  durationMs?: () => number; // replaces the duration of the keyword
};

/** What adding stacks did: nothing (cooldown), stacks below the threshold, or the threshold was reached. */
export type StackOutcome = "blocked" | "stacked" | "threshold";

const optionalMs = (value: Keyword["delayMs"], field: string) =>
  value ? requireValue(value, field) : 0;

export function createStatusContainer({
  keywords,
  modifierStatuses = [],
  multiplierAt,
  stackFactorAt,
  isInPhase,
}: StatusContext) {
  const byStatus = new Map(keywords.map((k) => [k.status, k]));
  const modifierOf = new Map(modifierStatuses.map((s) => [s.id, s]));
  // Burn of the stacks of a status, from the keyword that is set off by it.
  const burns = new Map(
    keywords.flatMap((keyword) => {
      const burn = createBurn(keyword, multiplierAt, isInPhase);
      return keyword.trigger.type === "counter" && burn
        ? [[keyword.status, burn] as const]
        : [];
    }),
  );

  /**
   * Adds stacks to a status with a threshold. The stacks are scaled by the action modifiers and
   * rounded up. Below the threshold the burn starts or goes on, at it the stacks and the burn reset
   * and the cooldown blocks new stacks; the caller then lets the status go off.
   */
  const addStacks = (
    target: TargetState,
    status: TargetStatusId,
    add: {
      stacks: number;
      timeMs: number;
      threshold: number;
      cooldownMs: number;
      source: TimedDamageInstance; // the hit whose bonuses the burn inherits
      schedule: (event: RunEvent) => void;
    },
  ): StackOutcome => {
    const { timeMs } = add;
    const state = statusState(target, status);
    if (timeMs < state.blockedUntilMs) return "blocked";
    const burning = burns.get(status);
    burning?.decay(state, timeMs);
    state.stacks += Math.ceil(
      add.stacks * stackFactorAt(status, timeMs) - ROUNDING_TOLERANCE,
    );
    if (state.stacks < add.threshold) {
      burning?.applied(state, timeMs, add.source, add.schedule);
      return "stacked";
    }
    burning?.reset(state);
    state.stacks = 0;
    state.blockedUntilMs = timeMs + add.cooldownMs;
    return "threshold";
  };

  /** What one hit does to statuses: sets them off (goOff, takeDamage) and applies them. */
  const session = (
    hit: TimedDamageInstance,
    schedule: (event: RunEvent) => void,
  ) => {
    const timeMs = hit.timeMs;
    /** Queues the damage of a keyword; source is the hit whose bonuses it may inherit. */
    const goOff = (keyword: Keyword, source: TimedDamageInstance) => {
      const hitMs = timeMs + optionalMs(keyword.delayMs, "delayMs");
      if (!isInPhase(hitMs)) return;
      schedule({
        timeMs: hitMs,
        group: KEYWORD_EVENT_GROUP,
        handle: (_, emit) => {
          const factors = multiplierAt(hitMs, keyword, source);
          emit({
            id: keyword.id,
            timeMs: hitMs,
            damage: requireValue(keyword.damage, "damage") * productOf(factors),
            damageSource: "keyword",
            keywordId: keyword.id,
            element: keyword.element,
            factors,
          });
        },
      });
    };
    const takeDamage = (keyword: Keyword, state: StatusState) => {
      if (keyword.trigger.type !== "damageTaken") return;
      state.damageTakenSinceTrigger += hit.damage;
      const threshold = requireValue(keyword.trigger.threshold, "threshold");
      if (state.damageTakenSinceTrigger < threshold) return;
      if (timeMs < state.cooldownUntilMs) return;

      state.damageTakenSinceTrigger = 0;
      state.cooldownUntilMs =
        timeMs + optionalMs(keyword.cooldownMs, "cooldownMs");
      if (keyword.removedOnTrigger) state.activeUntilMs = -Infinity;
      goOff(keyword, hit);
    };
    /** Applies the status of a keyword to the target (steps 3 of the order above). */
    const apply = (
      target: TargetState,
      keyword: Keyword,
      application: StatusApplication,
    ) => {
      const state = statusState(target, keyword.status);
      const stacksOf = () => {
        if (application.stacks === undefined) {
          throw new Error(`Keyword "${keyword.id}" needs stacks`);
        }
        return application.stacks();
      };
      switch (keyword.trigger.type) {
        case "counter": {
          const outcome = addStacks(target, keyword.status, {
            stacks: stacksOf(),
            timeMs,
            threshold: requireValue(keyword.trigger.threshold, "threshold"),
            cooldownMs: optionalMs(keyword.cooldownMs, "cooldownMs"),
            source: hit,
            schedule,
          });
          if (outcome === "threshold") goOff(keyword, hit);
          return;
        }
        case "playerStacks": {
          const max = requireValue(keyword.trigger.stacks, "stacks");
          state.playerStacks = Math.min(max, state.playerStacks + stacksOf());
          return;
        }
        case "damageTaken":
          break;
      }
      if (keyword.removedOnTrigger && timeMs < state.cooldownUntilMs) return;
      const durationMs =
        application.durationMs?.() ??
        (keyword.durationMs
          ? requireValue(keyword.durationMs, "durationMs")
          : undefined);
      if (durationMs === undefined) {
        throw new Error(`Keyword "${keyword.id}" needs a duration`);
      }
      const wasActive = state.activeUntilMs > timeMs;
      state.activeUntilMs = Math.max(state.activeUntilMs, timeMs + durationMs);
      if (wasActive) return;
      state.damageTakenSinceTrigger = 0;
      if (
        keyword.trigger.type === "damageTaken" &&
        keyword.trigger.applyingHitCounts
      ) {
        takeDamage(keyword, state);
      }
    };
    return { goOff, takeDamage, apply };
  };

  /** The handler for the event run that applies statuses and sets them off. */
  const onHit: OnHit = (hit, target, schedule) => {
    const { goOff, takeDamage } = session(hit, schedule);
    const timeMs = hit.timeMs;

    // 1. damage taken
    for (const [id, state] of target.statuses) {
      const keyword = byStatus.get(id);
      if (!keyword || keyword.trigger.type !== "damageTaken") continue;
      if (hit.keywordId === keyword.id || state.activeUntilMs <= timeMs) continue;
      takeDamage(keyword, state);
    }

    // 2. player stacks
    for (const [id, state] of target.statuses) {
      const keyword = byStatus.get(id);
      if (!keyword || keyword.trigger.type !== "playerStacks") continue;
      const { dischargedBy } = keyword.trigger;
      const discharges =
        dischargedBy.damageSources.includes(hit.damageSource) ||
        (hit.keywordId !== undefined &&
          dischargedBy.keywordIds.includes(hit.keywordId));
      if (!discharges) continue;
      if (state.playerStacks < requireValue(keyword.trigger.stacks, "stacks")) {
        continue;
      }
      state.playerStacks = 0;
      goOff(keyword, hit);
    }

  };

  /**
   * Applies a status by a rule (action applyStatus), step 3 of the order above, with `source` as the
   * hit whose bonuses the status inherits.
   */
  const applyStatus = (
    target: TargetState,
    status: TargetStatusId,
    application: { stacks?: number; durationMs?: number },
    source: TimedDamageInstance,
    schedule: (event: RunEvent) => void,
  ) => {
    const modifier = modifierOf.get(status);
    if (modifier) {
      // Applied again, the duration is refreshed, never shortened
      const state = statusState(target, status);
      const lastsMs =
        application.durationMs ?? requireValue(modifier.durationMs, "durationMs");
      state.activeUntilMs = Math.max(state.activeUntilMs, source.timeMs + lastsMs);
      return;
    }
    const keyword = byStatus.get(status);
    if (!keyword) throw new Error(`No definition for status "${status}"`);
    const { stacks, durationMs } = application;
    session(source, schedule).apply(target, keyword, {
      ...(stacks === undefined ? {} : { stacks: () => stacks }),
      ...(durationMs === undefined ? {} : { durationMs: () => durationMs }),
    });
  };

  /** Stacks of a status on the target at a time (a burning status lets them fall after the hold). */
  const stacksOnTarget = (
    target: TargetState,
    status: TargetStatusId,
    timeMs: number,
  ) => {
    const state = statusState(target, status);
    return burns.get(status)?.stacksAt(state, timeMs) ?? state.stacks;
  };

  /** The multipliers of the statuses without damage that are active on the target at a time. */
  const modifiersOnTarget = (
    target: TargetState,
    timeMs: number,
  ): MultiplierPart[] =>
    [...modifierOf.values()].flatMap((definition) =>
      statusState(target, definition.id).activeUntilMs > timeMs
        ? definition.modifiers
        : [],
    );

  return { onHit, addStacks, applyStatus, stacksOnTarget, modifiersOnTarget };
}

export type StatusContainer = ReturnType<typeof createStatusContainer>;
