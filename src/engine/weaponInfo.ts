// What the UI needs to know about a weapon (ADR 0012, ADR 0013): whether it has a catalyst or
// ignitions, and which effects matter for it.

import type { Effect, StatusId, Weapon } from "../data/schema";
import { effectAppliesToWeapon } from "./effectParts";

/** A catalyst exists as parts of a hand model or as catalyst options of an imported package. */
export function hasCatalyst(weapon: Weapon): boolean {
  return (
    weapon.catalyst !== undefined ||
    weapon.damageInstances.some((i) => i.requiresCatalyst) ||
    weapon.intrinsicParts.some(
      (p) => p.type === "damageOverTime" && p.requiresCatalyst,
    ) ||
    (weapon.options ?? []).some((o) => o.kind === "catalyst")
  );
}

/** Ignitions come from scorch the weapon applies (ADR 0015) or from a threshold part. */
export function hasIgnition(weapon: Weapon): boolean {
  return weapon.intrinsicParts.some(
    (p) =>
      p.type === "threshold" ||
      (p.type === "appliesKeyword" && p.keywordId === "ignition"),
  );
}

/** States that parts of these effects require, e.g. Amplified for No Backup Plans (U6-2). */
export function neededStatuses(effects: Effect[]): Set<StatusId> {
  return new Set(
    effects.flatMap((e) =>
      e.parts.flatMap((p) => (p.type === "multiplier" ? (p.requiresStatus ?? []) : [])),
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
    effect.parts.some((part) => part.type === "periodicDamage") ||
    effect.parts.some(
      (part) =>
        (part.type === "multiplier" || part.type === "appliesKeyword") &&
        part.damageSources.some((source) => source !== "weapon"),
    )
  );
}
