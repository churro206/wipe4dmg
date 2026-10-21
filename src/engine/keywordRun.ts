// Keywords on the target in the event run (ADR 0015, U4a): Jolt, Volatile and Unravel.
//
// For every hit, in this order:
// 1. Every active keyword counts the damage the target takes (not from its own hits). Past the
//    threshold and outside the cooldown it goes off: its damage follows after the delay, the
//    cooldown starts, and a keyword removed on trigger is gone.
// 2. Every active appliesKeyword part that matches the hit applies its keyword or refreshes the
//    duration. While the cooldown runs, a keyword removed on trigger cannot be applied again. A
//    fresh application counts the applying hit only if the keyword says so (Jolt yes, Volatile no).
// Not modelled yet: ignition through keywords and bolt charge (player stacks).

import type { AppliesKeywordPart, Keyword, KeywordId } from "../data/schema";
import { appliesToWeaponType } from "./effectParts";
import type { KeywordState, OnHit, TargetState } from "./eventRun";
import { requireValue } from "./requireValue";
import type { TimedDamageInstance } from "./simulate";

export const KEYWORD_EVENT_GROUP = 4;

export type KeywordContext = {
  keywords: Keyword[];
  keywordPartsAt: (timeMs: number) => AppliesKeywordPart[];
  multiplierAt: (timeMs: number, keyword: Keyword) => number;
  isInPhase: (timeMs: number) => boolean;
};

const matches = (part: AppliesKeywordPart, hit: TimedDamageInstance) =>
  part.damageSources.includes(hit.damageSource) &&
  (part.elements === undefined || part.elements.includes(hit.element)) &&
  appliesToWeaponType(part.weaponTypes, hit.weaponType) &&
  (part.abilityIds === undefined ||
    (hit.abilityId !== undefined && part.abilityIds.includes(hit.abilityId)));

/** The handler for the event run that applies keywords and sets them off. */
export function keywordOnHit({
  keywords,
  keywordPartsAt,
  multiplierAt,
  isInPhase,
}: KeywordContext): OnHit {
  const byId = new Map(keywords.map((k) => [k.id, k]));
  const keywordOf = (id: KeywordId) => {
    const keyword = byId.get(id);
    if (!keyword) throw new Error(`Unknown keyword "${id}"`);
    if (keyword.trigger.type !== "damageTaken") {
      throw new Error(`Keyword "${id}" is not modelled yet`);
    }
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

  return (hit, target, schedule) => {
    const timeMs = hit.timeMs;
    const takeDamage = (keyword: Keyword, state: KeywordState) => {
      if (keyword.trigger.type !== "damageTaken") return;
      state.damageTakenSinceTrigger += hit.damage;
      const threshold = requireValue(keyword.trigger.threshold, "threshold");
      if (state.damageTakenSinceTrigger < threshold) return;
      if (timeMs < state.cooldownUntilMs) return;

      const hitMs =
        timeMs +
        (keyword.delayMs ? requireValue(keyword.delayMs, "delayMs") : 0);
      state.damageTakenSinceTrigger = 0;
      state.cooldownUntilMs =
        timeMs +
        (keyword.cooldownMs
          ? requireValue(keyword.cooldownMs, "cooldownMs")
          : 0);
      if (keyword.removedOnTrigger) state.activeUntilMs = -Infinity;
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
              multiplierAt(hitMs, keyword),
            damageSource: "keyword",
            keywordId: keyword.id,
            element: keyword.element,
          }),
      });
    };

    for (const [id, state] of target.keywords) {
      if (hit.keywordId === id || state.activeUntilMs <= timeMs) continue;
      takeDamage(keywordOf(id), state);
    }

    for (const part of keywordPartsAt(timeMs)) {
      if (!matches(part, hit)) continue;
      const keyword = keywordOf(part.keywordId);
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
