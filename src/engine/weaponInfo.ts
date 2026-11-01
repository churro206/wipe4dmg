// What the UI needs to know about a weapon (ADR 0012, ADR 0013): whether it has a catalyst and
// which effects matter for it.

import type { Effect, StatusId, Weapon } from "../data/schema";
import { effectAppliesToWeapon } from "./effectParts";
import { hasOwnDamage, statusRulesOf } from "./effectRules";

/** A catalyst exists as rules that ask for it (hasItem catalyst) or as catalyst options of a package. */
export function hasCatalyst(weapon: Weapon): boolean {
  return (
    weapon.catalyst !== undefined ||
    (weapon.rules ?? []).some((rule) =>
      (rule.if ?? []).some(
        (condition) =>
          condition.type === "hasItem" && condition.id === "catalyst" && !condition.not,
      ),
    ) ||
    (weapon.options ?? []).some((o) => o.kind === "catalyst")
  );
}

/** States that parts of these effects require, e.g. Amplified for No Backup Plans (U6-2). */
export function neededStatuses(effects: Effect[]): Set<StatusId> {
  return new Set(
    effects.flatMap((e) =>
      e.modifiers.flatMap((p) => (p.type === "multiplier" ? (p.requiresStatus ?? []) : [])),
    ),
  );
}

/**
 * An effect matters if it changes this weapon or the damage of abilities (e.g. Radiant on Golden
 * Gun), or grants a state another selected effect needs. The UI hides the others; selections keep
 * them (ADR 0012, point 6).
 */
export function effectRelevantTo(
  effect: Effect,
  weapon: Weapon,
  needed: ReadonlySet<StatusId> = new Set(),
): boolean {
  return (
    effectAppliesToWeapon(effect, weapon) ||
    // states only count if something needs them, e.g. Amplified for No Backup Plans (U6-2)
    (effect.grantsStatus ?? []).some((s) => needed.has(s)) ||
    // changes an ability, e.g. Knock 'Em Down for Blade Barrage (U6-2 rule G)
    effect.changesAbilityIds !== undefined ||
    // damage of its own, e.g. Storm's Keep
    hasOwnDamage(effect) ||
    effect.modifiers.some(
      (part) =>
        part.type === "multiplier" &&
        part.damageSources.some((source) => source !== "weapon"),
    ) ||
    // a keyword it applies with the hits of abilities, e.g. Jolt on grenades
    statusRulesOf(effect).some(
      (rule) =>
        rule.on.on === "hit" &&
        rule.on.filter?.damageSources?.some((source) => source !== "weapon"),
    )
  );
}
