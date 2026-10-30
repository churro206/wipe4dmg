// What the core knows at a time, independent of the event loop: the effects active then and the
// factors they give a hit (ADR 0017). The shot history grows while the loop runs; a lookup at a time
// sees only the shots made until then.

import type {
  Bucket,
  CounterId,
  Effect,
  Element,
  Keyword,
  KeywordId,
  MultiplierPart,
  Weapon,
  AppliesKeywordPart,
  DamageSource,
} from "../../data/schema";
import { abilityStatParts } from "../abilityStats";
import {
  activeParts,
  bucketFactors,
  type ActiveParts,
  type Factors,
} from "../effectParts";
import { resolveWindows } from "../effectWindows";
import { requireValue } from "../requireValue";
import type {
  AbilityCast,
  Shot,
  SimulationOptions,
  SuperWindow,
  TimedDamageInstance,
} from "../simulate";
import { weaponStatPart } from "../weaponStats";
import { MS_PER_SECOND } from "../units";

const ABILITY_DAMAGE_SOURCES: DamageSource[] = ["grenade", "melee", "super"];

/** The shots made so far and the held draw factor of each. */
export type ShotHistory = { shots: Shot[]; holdFactors: number[] };

export function createContext(
  weapon: Weapon,
  effects: Effect[],
  buckets: Bucket[],
  options: SimulationOptions,
  superWindows: SuperWindow[],
  history: ShotHistory,
) {
  const catalyst = options.catalyst ?? false;
  const damageSource: DamageSource = "weapon";
  // Validates the buckets of all parts once, even of effects outside their window.
  activeParts(effects, buckets);
  const windows = resolveWindows(effects, options, {
    casts: options.abilities ?? ([] as AbilityCast[]),
    superWindows,
    weaponElement: weapon.element,
  });
  const superElement = (options.abilities ?? []).find(
    (cast) => cast.ability.kind === "super",
  )?.ability.element;
  const meetsCondition = (part: MultiplierPart) =>
    (part.superElements === undefined ||
      (superElement !== undefined &&
        part.superElements.includes(superElement))) &&
    (part.condition === undefined ||
      part.condition === "weaponMatchesTriggerElement" ||
      (part.condition === "weaponMatchesSuperElement" &&
        superElement === weapon.element));
  const partsCache = new Map<string, ActiveParts>();
  // Excluded effects are already inside a value, e.g. the included effects of an ability component.
  const partsAt = (
    timeMs: number,
    excluded: readonly string[] = [],
  ): ActiveParts => {
    const active = effects.filter(
      (effect) =>
        !excluded.includes(effect.id) &&
        windows
          .get(effect.id)!
          .some((w) => w.startMs <= timeMs && timeMs < w.endMs),
    );
    const key = active.map((effect) => effect.id).join("|");
    let parts = partsCache.get(key);
    if (!parts) {
      const all = activeParts(active, buckets);
      const statuses = new Set(active.flatMap((e) => e.grantsStatus ?? []));
      parts = {
        ...all,
        multiplierParts: all.multiplierParts.filter(
          (part) =>
            meetsCondition(part) &&
            (part.requiresStatus === undefined ||
              part.requiresStatus.some((s) => statuses.has(s))) &&
            (part.requiresEffectIds === undefined ||
              part.requiresEffectIds.some((id) =>
                active.some((e) => e.id === id),
              )),
        ),
      };
      partsCache.set(key, parts);
    }
    return parts;
  };

  // Imported packages (ADR 0013): effects inside the value per shot do not count again, and the
  // catalyst switch applies the catalyst options as multipliers in their bucket.
  const included = weapon.includedEffectIds ?? [];
  const bucketIds = new Set(buckets.map((bucket) => bucket.id));
  const optionParts = (weapon.options ?? [])
    .filter((option) => option.kind === "catalyst" && catalyst)
    .map((option) => {
      if (!bucketIds.has(option.bucketId)) {
        throw new Error(`Unknown bucket "${option.bucketId}"`);
      }
      const part: MultiplierPart = {
        type: "multiplier",
        bucketId: option.bucketId,
        multiplier: option.factor,
        damageSources: [damageSource],
      };
      return {
        part,
        windowMs: option.windowSeconds
          ? requireValue(option.windowSeconds, "windowSeconds") * MS_PER_SECOND
          : null,
      };
    });
  // Options with a window count only from the first shot of the weapon on
  const optionPartsAt = (timeMs: number) =>
    optionParts
      .filter(
        ({ windowMs }) =>
          windowMs === null ||
          history.shots.length === 0 ||
          timeMs <= history.shots[0].timeMs + windowMs,
      )
      .map(({ part }) => part);

  // Damage factor of the held draw for the shot that makes a hit at timeMs
  const holdFactorAt = (timeMs: number) => {
    for (let i = history.shots.length - 1; i >= 0; i--) {
      if (history.shots[i].timeMs <= timeMs) return history.holdFactors[i];
    }
    return 1;
  };
  // Stacks of a hit: the shots of the current run before the shot that makes the hit; a gap longer
  // than refreshMs ends the run.
  const stacksAt = (timeMs: number, refreshMs: number) => {
    let stacks = 0;
    let previousMs: number | undefined;
    for (const shot of history.shots) {
      if (shot.timeMs > timeMs) break;
      stacks =
        previousMs !== undefined && shot.timeMs - previousMs > refreshMs
          ? 1
          : stacks + 1;
      previousMs = shot.timeMs;
    }
    return Math.max(0, stacks - 1);
  };
  const resolveHitStacks = (
    part: MultiplierPart,
    timeMs: number,
  ): MultiplierPart => {
    const { hitStacks, ...plain } = part;
    if (hitStacks === undefined) return part;
    const stacks = Math.min(
      stacksAt(
        timeMs,
        hitStacks.refreshMs
          ? requireValue(hitStacks.refreshMs, "refreshMs")
          : Number.POSITIVE_INFINITY,
      ),
      requireValue(hitStacks.maxStacks, "maxStacks"),
    );
    const factor =
      stacks === 0
        ? 1
        : (1 + (requireValue(part.multiplier, "multiplier") - 1) * stacks) *
          requireValue(hitStacks.bossFactor, "bossFactor");
    return { ...plain, multiplier: { ...part.multiplier, value: factor } };
  };

  const statPart = weaponStatPart(options.weaponStat, weapon.ammo);
  const multiplierAt = (
    timeMs: number,
    element: Element,
    keywordId?: KeywordId,
  ): Factors => {
    const holdDraw = holdFactorAt(timeMs);
    return {
      ...bucketFactors(
        [
          ...partsAt(timeMs, included).multiplierParts.map((part) =>
            resolveHitStacks(part, timeMs),
          ),
          ...optionPartsAt(timeMs),
          ...(statPart ? [statPart] : []),
        ],
        buckets,
        {
          damageSource,
          element,
          weaponType: weapon.weaponType,
          ...(keywordId ? { keywordId } : {}),
        },
      ),
      ...(holdDraw !== 1 ? { holdDraw } : {}),
    };
  };
  const counterFactorAt = (counterId: CounterId, timeMs: number) =>
    partsAt(timeMs, included)
      .counterModifierParts.filter((part) => part.counterId === counterId)
      .reduce(
        (product, part) => product * requireValue(part.factor, "factor"),
        1,
      );

  const statParts = abilityStatParts(options.abilityStats ?? [], buckets);

  // Keyword damage (ADR 0015): see simulate.ts for the rules; the core keeps them unchanged.
  const weaponKeywordBonus = (keyword: Keyword, source: TimedDamageInstance) =>
    source.damageSource === "weapon"
      ? (weapon.keywordBonuses ?? [])
          .filter((bonus) => bonus.keywordId === keyword.id)
          .reduce(
            (product, bonus) => product * requireValue(bonus.factor, "factor"),
            1,
          )
      : 1;
  const sourceMultiplierAt = (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ): Factors => {
    if (keyword.damageCategory === "inheritsSource") {
      if (source.damageSource === "weapon") {
        return bucketFactors(
          [
            ...partsAt(timeMs, included).multiplierParts,
            ...(statPart ? [statPart] : []),
          ],
          buckets,
          {
            damageSource,
            element: keyword.element,
            weaponType: weapon.weaponType,
            keywordId: keyword.id,
          },
        );
      }
      if (
        source.damageSource !== "melee" &&
        source.damageSource !== "keyword"
      ) {
        return bucketFactors(
          [...partsAt(timeMs).multiplierParts, ...statParts],
          buckets,
          {
            damageSource: source.damageSource,
            element: keyword.element,
            abilityId: source.abilityId,
            keywordId: keyword.id,
          },
        );
      }
    }
    const parts = partsAt(timeMs)
      .multiplierParts.filter(
        (part) =>
          part.damageSources.includes("keyword") ||
          (keyword.damageCategory === "ability" &&
            ABILITY_DAMAGE_SOURCES.every((s) =>
              part.damageSources.includes(s),
            )),
      )
      .map((part) => ({ ...part, damageSources: ["keyword" as const] }));
    return bucketFactors(parts, buckets, {
      damageSource: "keyword",
      element: keyword.element,
      keywordId: keyword.id,
    });
  };
  const keywordMultiplierAt = (
    timeMs: number,
    keyword: Keyword,
    source: TimedDamageInstance,
  ): Factors => {
    const keywordBonus = weaponKeywordBonus(keyword, source);
    return {
      ...sourceMultiplierAt(timeMs, keyword, source),
      ...(keywordBonus !== 1 ? { keywordBonus } : {}),
    };
  };
  // Keyword parts of the weapon and of the abilities in the build are always active (ADR 0015).
  const weaponKeywordParts = [
    ...weapon.intrinsicParts.filter(
      (part): part is AppliesKeywordPart => part.type === "appliesKeyword",
    ),
    ...(options.abilities ?? []).flatMap(
      (cast) => cast.ability.keywordParts ?? [],
    ),
  ];

  return {
    catalyst,
    damageSource,
    windows,
    included,
    statParts,
    partsAt,
    multiplierAt,
    counterFactorAt,
    keywordMultiplierAt,
    weaponKeywordParts,
  };
}

export type CoreContext = ReturnType<typeof createContext>;
