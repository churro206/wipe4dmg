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
// 3. Every active appliesKeyword part that matches the hit applies its status:
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
  AppliesKeywordPart,
  Keyword,
  KeywordId,
  TargetStatusId,
} from "../../data/schema";
import { appliesToWeaponType, productOf, type Factors } from "../effectParts";
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
  keywordPartsAt: (timeMs: number) => AppliesKeywordPart[];
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

/** What adding stacks did: nothing (cooldown), stacks below the threshold, or the threshold was reached. */
export type StackOutcome = "blocked" | "stacked" | "threshold";

const matches = (part: AppliesKeywordPart, hit: TimedDamageInstance) =>
  part.damageSources.includes(hit.damageSource) &&
  (part.elements === undefined || part.elements.includes(hit.element)) &&
  appliesToWeaponType(part.weaponTypes, hit.weaponType) &&
  (part.damageInstanceIds === undefined ||
    part.damageInstanceIds.includes(hit.id)) &&
  (part.abilityIds === undefined ||
    (hit.abilityId !== undefined && part.abilityIds.includes(hit.abilityId)));

const optionalMs = (value: Keyword["delayMs"], field: string) =>
  value ? requireValue(value, field) : 0;

export function createStatusContainer({
  keywords,
  keywordPartsAt,
  multiplierAt,
  stackFactorAt,
  isInPhase,
}: StatusContext) {
  const byId = new Map(keywords.map((k) => [k.id, k]));
  const byStatus = new Map(keywords.map((k) => [k.status, k]));
  const keywordOf = (id: KeywordId) => {
    const keyword = byId.get(id);
    if (!keyword) throw new Error(`Unknown keyword "${id}"`);
    return keyword;
  };
  // Burn of the stacks of a status, from the keyword that is set off by it.
  const burns = new Map(
    keywords.flatMap((keyword) => {
      const burn = createBurn(keyword, multiplierAt, isInPhase);
      return keyword.trigger.type === "counter" && burn
        ? [[keyword.status, burn] as const]
        : [];
    }),
  );
  const stacksOf = (part: AppliesKeywordPart) => {
    if (!part.stacks) {
      throw new Error(`Keyword "${part.keywordId}" needs stacks`);
    }
    return requireValue(part.stacks, "stacks");
  };

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

  /** The handler for the event run that applies statuses and sets them off. */
  const onHit: OnHit = (hit, target, schedule) => {
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

    // 3. applications
    for (const part of keywordPartsAt(timeMs)) {
      if (!matches(part, hit)) continue;
      const keyword = keywordOf(part.keywordId);
      const state = statusState(target, keyword.status);
      switch (keyword.trigger.type) {
        case "counter": {
          const outcome = addStacks(target, keyword.status, {
            stacks: stacksOf(part),
            timeMs,
            threshold: requireValue(keyword.trigger.threshold, "threshold"),
            cooldownMs: optionalMs(keyword.cooldownMs, "cooldownMs"),
            source: hit,
            schedule,
          });
          if (outcome === "threshold") goOff(keyword, hit);
          continue;
        }
        case "playerStacks": {
          const max = requireValue(keyword.trigger.stacks, "stacks");
          state.playerStacks = Math.min(max, state.playerStacks + stacksOf(part));
          continue;
        }
        case "damageTaken":
          break;
      }
      if (keyword.removedOnTrigger && timeMs < state.cooldownUntilMs) continue;
      const durationMs = part.durationMs ?? keyword.durationMs;
      if (!durationMs) {
        throw new Error(`Keyword "${keyword.id}" needs a duration`);
      }
      const wasActive = state.activeUntilMs > timeMs;
      state.activeUntilMs = Math.max(
        state.activeUntilMs,
        timeMs + requireValue(durationMs, "durationMs"),
      );
      if (wasActive) continue;
      state.damageTakenSinceTrigger = 0;
      if (
        keyword.trigger.type === "damageTaken" &&
        keyword.trigger.applyingHitCounts
      ) {
        takeDamage(keyword, state);
      }
    }
  };

  return { onHit, addStacks };
}

export type StatusContainer = ReturnType<typeof createStatusContainer>;
