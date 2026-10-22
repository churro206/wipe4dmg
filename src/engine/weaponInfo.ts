// What the UI needs to know about a weapon (ADR 0012, ADR 0013): whether it has a catalyst or
// ignitions, and which effects matter for it.

import type { Effect, Weapon } from "../data/schema";
import { effectAppliesToWeapon } from "./effectParts";

/** A catalyst exists as parts of a hand model or as catalyst options of an imported package. */
export function hasCatalyst(weapon: Weapon): boolean {
  return (
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

/**
 * An effect matters if it changes this weapon or the damage of abilities (e.g. Radiant on Golden
 * Gun). The UI hides the others; selections keep them (ADR 0012, point 6).
 */
export function effectRelevantTo(effect: Effect, weapon: Weapon): boolean {
  return (
    effectAppliesToWeapon(effect, weapon) ||
    // states change other effects, e.g. Amplified for No Backup Plans (ADR 0015, U6-2)
    effect.grantsStatus !== undefined ||
    effect.parts.some(
      (part) =>
        (part.type === "multiplier" || part.type === "appliesKeyword") &&
        part.damageSources.some((source) => source !== "weapon"),
    )
  );
}
