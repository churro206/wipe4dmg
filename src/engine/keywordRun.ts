// Keywords in the event run (ADR 0015, U4a).
//
// For every hit, in this order:
// 1. Every active keyword on the target that goes off by damage taken (Jolt, Volatile, Unravel)
//    counts the damage of the hit (not of its own hits). Past the threshold and outside the
//    cooldown it goes off: its damage follows after the delay, the cooldown starts, and a keyword
//    removed on trigger is gone.
// 2. A keyword with player stacks (Bolt Charge) at its stack count goes off after its delay if the
//    hit is one that discharges it; the stacks are used up.
// 3. Every active appliesKeyword part that matches the hit applies its keyword:
//    - damage taken: applies it or refreshes the duration. While the cooldown runs, a keyword
//      removed on trigger cannot be applied again. A fresh application counts the applying hit only
//      if the keyword says so (Jolt yes, Volatile no).
//    - counter (Ignition): adds stacks to the counter on the target, scaled by counter modifiers
//      (Ember of Ashes) and rounded up. At the threshold the keyword goes off at once with the
//      bonuses of the applying hit, the counter resets and the cooldown blocks new stacks.
//    - player stacks (Bolt Charge): adds stacks up to the stack count.

import type {
  AppliesKeywordPart,
  CounterId,
  Keyword,
  KeywordId,
} from "../data/schema";
import { appliesToWeaponType } from "./effectParts";
import type { KeywordState, OnHit, TargetState } from "./eventRun";
import { requireValue } from "./requireValue";
import type { TimedDamageInstance } from "./simulate";

export const KEYWORD_EVENT_GROUP = 4;
// Guards rounding up against floating point noise, e.g. 40 x 1.5 = 60.00000000000001.
const ROUNDING_TOLERANCE = 1e-9;

export type KeywordContext = {
  keywords: Keyword[];
  keywordPartsAt: (timeMs: number) => AppliesKeywordPart[];
  // The multiplier for the damage of a keyword; source is the hit that applied it (Ignition).
  multiplierAt: (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ) => number;
  stackFactorAt: (counterId: CounterId, timeMs: number) => number;
  isInPhase: (timeMs: number) => boolean;
};

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

/** The handler for the event run that applies keywords and sets them off. */
export function keywordOnHit({
  keywords,
  keywordPartsAt,
  multiplierAt,
  stackFactorAt,
  isInPhase,
}: KeywordContext): OnHit {
  const byId = new Map(keywords.map((k) => [k.id, k]));
  const keywordOf = (id: KeywordId) => {
    const keyword = byId.get(id);
    if (!keyword) throw new Error(`Unknown keyword "${id}"`);
    return keyword;
  };
  const stateOf = (target: TargetState, id: KeywordId): KeywordState => {
    let state = target.keywords.get(id);
    if (!state) {
      state = {
        activeUntilMs: -Infinity,
        damageTakenSinceTrigger: 0,
        cooldownUntilMs: -Infinity,
      };
      target.keywords.set(id, state);
    }
    return state;
  };
  const stacksOf = (part: AppliesKeywordPart) => {
    if (!part.stacks) {
      throw new Error(`Keyword "${part.keywordId}" needs stacks`);
    }
    return requireValue(part.stacks, "stacks");
  };

  return (hit, target, schedule) => {
    const timeMs = hit.timeMs;
    /** Queues the damage of a keyword; source is the hit whose bonuses it may inherit. */
    const goOff = (keyword: Keyword, source: TimedDamageInstance) => {
      const hitMs = timeMs + optionalMs(keyword.delayMs, "delayMs");
      if (!isInPhase(hitMs)) return;
      schedule({
        timeMs: hitMs,
        group: KEYWORD_EVENT_GROUP,
        handle: (_, emit) =>
          emit({
            id: keyword.id,
            timeMs: hitMs,
            damage:
              requireValue(keyword.damage, "damage") *
              multiplierAt(hitMs, keyword, source),
            damageSource: "keyword",
            keywordId: keyword.id,
            element: keyword.element,
          }),
      });
    };
    const takeDamage = (keyword: Keyword, state: KeywordState) => {
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
    const addCounterStacks = (keyword: Keyword, part: AppliesKeywordPart) => {
      if (keyword.trigger.type !== "counter") return;
      const { counterId } = keyword.trigger;
      const counter = target.counters.get(counterId) ?? {
        stacks: 0,
        blockedUntilMs: -Infinity,
      };
      target.counters.set(counterId, counter);
      if (timeMs < counter.blockedUntilMs) return;

      counter.stacks += Math.ceil(
        stacksOf(part) * stackFactorAt(counterId, timeMs) - ROUNDING_TOLERANCE,
      );
      if (counter.stacks < requireValue(keyword.trigger.threshold, "threshold"))
        return;
      counter.stacks = 0;
      counter.blockedUntilMs =
        timeMs + optionalMs(keyword.cooldownMs, "cooldownMs");
      goOff(keyword, hit);
    };

    // 1. damage taken
    for (const [id, state] of target.keywords) {
      if (hit.keywordId === id || state.activeUntilMs <= timeMs) continue;
      takeDamage(keywordOf(id), state);
    }

    // 2. player stacks
    for (const [id, stacks] of target.playerStacks) {
      const keyword = keywordOf(id);
      if (keyword.trigger.type !== "playerStacks") continue;
      const { dischargedBy } = keyword.trigger;
      const discharges =
        dischargedBy.damageSources.includes(hit.damageSource) ||
        (hit.keywordId !== undefined &&
          dischargedBy.keywordIds.includes(hit.keywordId));
      if (!discharges) continue;
      if (stacks < requireValue(keyword.trigger.stacks, "stacks")) continue;
      target.playerStacks.set(id, 0);
      goOff(keyword, hit);
    }

    // 3. applications
    for (const part of keywordPartsAt(timeMs)) {
      if (!matches(part, hit)) continue;
      const keyword = keywordOf(part.keywordId);
      switch (keyword.trigger.type) {
        case "counter":
          addCounterStacks(keyword, part);
          continue;
        case "playerStacks": {
          const max = requireValue(keyword.trigger.stacks, "stacks");
          const stacks = target.playerStacks.get(keyword.id) ?? 0;
          target.playerStacks.set(
            keyword.id,
            Math.min(max, stacks + stacksOf(part)),
          );
          continue;
        }
        case "damageTaken":
          break;
      }
      const state = stateOf(target, keyword.id);
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
}
