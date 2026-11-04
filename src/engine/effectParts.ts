// Effect parts (ADR 0006): splitting by type, overrides and the multiplier per bucket.

import {
  CounterId,
  type ActionModifier,
  type Bucket,
  type DamageSource,
  type Effect,
  type Element,
  type KeywordId,
  type MultiplierPart,
  type StatModifier,
  type Weapon,
  type WeaponType,
} from "../data/schema";
import { statusRulesOf } from "./effectRules";
import { requireValue } from "./requireValue";

/** Counter that the stacks of a keyword fill (keywords.json, trigger "counter"). */
export const KEYWORD_COUNTERS: Partial<Record<KeywordId, CounterId>> = {
  ignition: "scorch",
};

export type ActiveParts = {
  multiplierParts: MultiplierPart[];
  statModifiers: StatModifier[];
  actionModifiers: ActionModifier[];
};

/** What a damage instance is, as far as multiplier parts care. */
export type DamageTarget = {
  damageSource: DamageSource;
  element: Element;
  weaponType?: WeaponType; // omitted for abilities
  abilityId?: string; // set for damage of an ability
  keywordId?: KeywordId; // set for keyword damage, whatever source set it off
  partId?: string; // set for the hit of a part of a weapon item
};

/**
 * Returns the parts of all effects, split by type. Multiplier parts of an overridden effect are
 * dropped in the buckets of the overriding effect. Throws if a part refers to an unknown bucket.
 */
export function activeParts(effects: Effect[], buckets: Bucket[]): ActiveParts {
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  const multiplierParts: MultiplierPart[] = [];
  const statModifiers: StatModifier[] = [];
  const actionModifiers: ActionModifier[] = [];

  for (const effect of effects) {
    const overriddenBuckets = new Set(
      effects
        .filter((other) => other.overrides?.includes(effect.id))
        .flatMap((other) => other.modifiers)
        .flatMap((part) => (part.type === "multiplier" ? [part.bucketId] : [])),
    );
    for (const part of effect.modifiers) {
      if (part.type === "stat") {
        statModifiers.push(part);
        continue;
      }
      if (part.type === "action") {
        actionModifiers.push(part);
        continue;
      }
      if (!bucketIds.has(part.bucketId)) {
        throw new Error(`Unknown bucket "${part.bucketId}"`);
      }
      if (!overriddenBuckets.has(part.bucketId)) multiplierParts.push(part);
    }
  }
  return { multiplierParts, statModifiers, actionModifiers };
}

/** A part without weapon types applies to everything; a part with weapon types only to those weapons. */
export function appliesToWeaponType(
  weaponTypes: WeaponType[] | undefined,
  weaponType: WeaponType | undefined,
): boolean {
  return (
    weaponTypes === undefined ||
    (weaponType !== undefined && weaponTypes.includes(weaponType))
  );
}

/**
 * Whether an effect changes the weapon (ADR 0012): a multiplier part for weapon damage of its
 * element and weapon type, a timing part for its weapon type, or a counter modifier for a counter
 * of the weapon (e.g. Ember of Ashes needs scorch), or a keyword its hits apply.
 */
export function effectAppliesToWeapon(effect: Effect, weapon: Weapon): boolean {
  // Counters the weapon fills: the statuses its rules apply (scorch)
  const counterIds = new Set<CounterId>([
    ...(weapon.rules ?? []).flatMap((rule) =>
      rule.do.flatMap((action) => {
        if (action.type !== "applyStatus") return [];
        const counterId = CounterId.safeParse(action.status);
        return counterId.success ? [counterId.data] : [];
      }),
    ),
  ]);
  // The multipliers of its buffs count like its own (e.g. the stacks of Lucky Pants)
  const modifiers = [
    ...effect.modifiers,
    ...(effect.buffs ?? []).flatMap((buff) => buff.modifiers),
  ];
  // A status its rules apply with weapon hits (e.g. Volatile Rounds)
  const appliesWithWeapon = statusRulesOf(effect).some((rule) => {
    const filter = rule.on.on === "hit" ? rule.on.filter : undefined;
    return (
      (filter?.damageSources === undefined ||
        filter.damageSources.includes("weapon")) &&
      (filter?.elements === undefined ||
        filter.elements.includes(weapon.element)) &&
      appliesToWeaponType(filter?.weaponTypes, weapon.weaponType)
    );
  });
  if (appliesWithWeapon) return true;
  return modifiers.some((part) => {
    switch (part.type) {
      case "multiplier":
        // keyword damage of the weapon's own counters, e.g. the ignitions of scorch
        if (part.keywordIds)
          return part.keywordIds.some((id) => {
            const counterId = KEYWORD_COUNTERS[id];
            return counterId !== undefined && counterIds.has(counterId);
          });
        return (
          part.damageSources.includes("weapon") &&
          (part.elements === undefined ||
            part.elements.includes(weapon.element)) &&
          appliesToWeaponType(part.weaponTypes, weapon.weaponType)
        );
      case "stat":
        return part.stat === "drawHold"
          ? weapon.ammo === "primary" &&
              appliesToWeaponType(part.weaponTypes, weapon.weaponType)
          : appliesToWeaponType(part.weaponTypes, weapon.weaponType);
      case "action": {
        const counterId = CounterId.safeParse(part.status);
        return counterId.success && counterIds.has(counterId.data);
      }
    }
  });
}

/** Combines the matching parts per bucket by its stacking rule. Lists only buckets with matching parts. */
export function bucketMultipliers(
  parts: MultiplierPart[],
  buckets: Bucket[],
  target: DamageTarget,
): { bucket: Bucket; multiplier: number }[] {
  const result: { bucket: Bucket; multiplier: number }[] = [];
  for (const bucket of buckets) {
    const values = parts
      .filter(
        (part) =>
          part.bucketId === bucket.id &&
          (part.keywordIds
            ? target.keywordId !== undefined &&
              part.keywordIds.includes(target.keywordId)
            : part.damageSources.includes(target.damageSource)) &&
          (part.elements === undefined ||
            part.elements.includes(target.element)) &&
          appliesToWeaponType(part.weaponTypes, target.weaponType) &&
          (part.abilityIds === undefined ||
            (target.abilityId !== undefined &&
              part.abilityIds.includes(target.abilityId))) &&
          !(
            target.abilityId !== undefined &&
            part.excludeAbilityIds?.includes(target.abilityId)
          ) &&
          !(
            target.partId !== undefined &&
            part.excludePartIds?.includes(target.partId)
          ),
      )
      .map((part) => requireValue(part.multiplier, "multiplier"));
    if (values.length === 0) continue;

    let multiplier: number;
    switch (bucket.stacking) {
      case "highest":
        multiplier = Math.max(...values);
        break;
      case "multiplicative":
        multiplier = values.reduce((product, value) => product * value, 1);
        break;
      case "additive":
        multiplier = 1 + values.reduce((sum, value) => sum + (value - 1), 0);
        break;
    }
    result.push({ bucket, multiplier });
  }
  return result;
}

/** Buckets multiply with each other. */
export function combinedMultiplier(
  parts: MultiplierPart[],
  buckets: Bucket[],
  target: DamageTarget,
): number {
  return productOf(bucketFactors(parts, buckets, target));
}

/** Factor per bucket id (or another named factor, e.g. holdDraw) that scaled a damage instance. */
export type Factors = Record<string, number>;

/** The multiplier of each bucket with matching parts, by bucket id. */
export function bucketFactors(
  parts: MultiplierPart[],
  buckets: Bucket[],
  target: DamageTarget,
): Factors {
  return Object.fromEntries(
    bucketMultipliers(parts, buckets, target).map((entry) => [
      entry.bucket.id,
      entry.multiplier,
    ]),
  );
}

export function productOf(factors: Factors): number {
  return Object.values(factors).reduce((product, value) => product * value, 1);
}
