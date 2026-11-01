// What the rules of an effect do, for the code that needs to know without running them (ADR 0018, B3b
// step 3). Type imports only, so the import scripts can load it too.

import type { Effect, KeywordId, Rule, TargetStatusId } from "../data/schema.ts";

/** The status a keyword puts on the target (ignition is the burst of scorch). */
export const statusOfKeywordId = (id: KeywordId): TargetStatusId =>
  id === "ignition" ? "scorch" : id;

/** Rules of an effect that apply a status to the target with the hits they match. */
export const statusRulesOf = (effect: Effect): Rule[] =>
  (effect.rules ?? []).filter(
    (rule) =>
      rule.on.on === "hit" && rule.do.some((a) => a.type === "applyStatus"),
  );

/** Whether an effect has damage of its own at a fixed rate (`timer everyMs → damage`), e.g. Storm's Keep. */
export const hasOwnDamage = (effect: Effect): boolean =>
  (effect.rules ?? []).some(
    (rule) =>
      rule.on.on === "timer" &&
      rule.on.everyMs !== undefined &&
      rule.do.some((a) => a.type === "damage"),
  );
