// Loads abilities.json (ADR 0009). An ability with a package gets its components from one Aegis row,
// so a new Aegis import updates it without copying values. Components from the Compendium
// (ability-components.json, U9) replace the package of the base ability; its variants stay packages.
//
// Stat split: Aegis measured the package at the stat where the bonus starts (100) and at the maximum
// (200). The package is split into a part that scales with the ability stat and a fixed part, so that
// both measurements are met exactly; in between the stat scales linearly per point.
//
// Included multipliers: an Aegis package may contain a multiplier effect, e.g. Radiant in Golden Gun.
// With the effects at hand, the loader divides it out, so the effect applies only if the build has it.
// Other included effects (e.g. Ember of Ashes, which changes scorch stacks) stay inside the value.
//
// Providers: without own providers, an ability gets its classes and subclasses from the manifest
// ability items (manifest-abilities.json), including Prismatic, and the hash of its element item.

import {
  Ability,
  type Bucket,
  type Effect,
  AbilityData,
  GuardianClass,
  Subclass,
  type AbilityComponent,
  type AbilityComponents,
  type AbilityKeyword,
  type AbilityKind,
  type ManifestAbility,
  type Provider,
  type AbilityStatScaling,
  type AegisAbilityRow,
  type ExoticArmorEntry,
  type Source,
  type SuperTiming,
} from "../data/schema";
import { elementItem, itemsOfAbility } from "./abilityNames";
import { nameKey, variantRows } from "./abilityVariants";
import { activeParts, combinedMultiplier } from "./effectParts";
import { requireValue } from "./requireValue";

// Shares closer to 0 or 1 than this are treated as 0 or 1: Aegis rounds measured damage to whole
// numbers, e.g. Thundercrash 14694 / 10136 = x1.4497 instead of x1.45.
const SHARE_TOLERANCE = 0.01;

/**
 * Validates the raw abilities Data File, resolves packages from the Aegis rows and providers from
 * the manifest ability items.
 */
export function loadAbilities(
  raw: unknown,
  aegisRows: AegisAbilityRow[],
  abilityStats: AbilityStatScaling[],
  manifestAbilities: ManifestAbility[] = [],
  normalise?: { effects: Effect[]; buckets: Bucket[] },
  // ability-keywords.json (ADR 0015, U5): keyword parts, and keyword damage taken out of packages.
  abilityKeywords: AbilityKeyword[] = [],
  // exotic-armor.json (ADR 0014, rule 1): variants from the Aegis rows of the ability variants
  exoticArmor: Pick<
    ExoticArmorEntry,
    "id" | "name" | "kind" | "aegisRowIds" | "superShots"
  >[] = [],
  // super-timings.json: hits and super window of supers used as fast as possible
  superTimings: SuperTiming[] = [],
  // ability-components.json (U9): components from the Compendium replace the package of the base
  abilityComponents: AbilityComponents[] = [],
): Ability[] {
  const data = AbilityData.array().parse(raw);
  for (const timing of superTimings)
    if (!data.some((a) => a.id === timing.abilityId))
      throw new Error(`super timing for unknown ability "${timing.abilityId}"`);
  for (const entry of abilityComponents)
    if (!data.some((a) => a.id === entry.abilityId && a.package))
      throw new Error(`components for unknown package "${entry.abilityId}"`);
  // A variant row measures the same ability with the assumptions of the base row plus the exotic
  // and/or aspects and fragments, e.g. "Thundercrash" with "Cuirass of the Falling Star" or "Blade
  // Barrage" with "Knock Em Down". It shares the code of its base: links store the base, the worn
  // exotic and the selected items choose the variant.
  type Extra =
    | { kind: "exotic"; id: string; name: string; superShots?: ExoticArmorEntry["superShots"] }
    | { kind: "effect"; id: string; name: string };
  const changing = (normalise?.effects ?? []).filter(
    (e) => e.changesAbilityIds,
  );
  const variants = data.flatMap((ability) => {
    const base = aegisRows.find((r) => r.id === ability.aegisRowId);
    if (!ability.package || !base) return [];
    const resolve = (assumption: string, row: AegisAbilityRow): Extra | undefined => {
      const exotic = exoticArmor.find(
        (e) =>
          e.kind === "abilityVariant" &&
          e.name === assumption &&
          e.aegisRowIds.includes(row.id),
      );
      if (exotic)
        return { kind: "exotic", id: exotic.id, name: exotic.name, superShots: exotic.superShots };
      const effect = changing.find(
        (e) =>
          nameKey(e.name) === nameKey(assumption) &&
          e.changesAbilityIds!.includes(ability.id),
      );
      return effect ? { kind: "effect", id: effect.id, name: effect.name } : undefined;
    };
    return variantRows(base, aegisRows, resolve).flatMap(({ row, extras }) => {
      const exotics = extras.filter((e) => e.kind === "exotic");
      if (exotics.length > 1) return [];
      const exotic = exotics[0];
      const effectIds = extras.filter((e) => e.kind === "effect").map((e) => e.id);
      return [
        {
          ...ability,
          id: `${ability.id}-with-${extras.map((e) => e.id).join("-")}`,
          name: `${ability.name} (${extras.map((e) => e.name).join(" + ")})`,
          aegisRowId: row.id,
          variantOf: ability.id,
          ...(exotic ? { exoticArmorId: exotic.id } : {}),
          ...(effectIds.length ? { requiresEffectIds: effectIds } : {}),
          // the exotic changes the shots, e.g. Celestial Nighthawk: one shot
          ...(ability.usage?.type === "shots" && exotic?.superShots
            ? {
                usage: {
                  ...ability.usage,
                  shots: {
                    value: exotic.superShots.value,
                    source: {
                      name: `Destiny Data Compendium, Exotic Armors (${exotic.name})`,
                      url: "https://destiny2.science/data-compendium",
                      retrieved: ability.usage.shots.source.retrieved,
                      status: "verified" as const,
                      quote: exotic.superShots.quote,
                    },
                  },
                },
              }
            : {}),
        },
      ];
    });
  });
  return [...data, ...variants]
    .map(({ components, ...withPackage }) => {
      const baseId = withPackage.variantOf ?? withPackage.id;
      // a variant keeps the keywords of its base
      const own = abilityKeywords.filter((k) => k.abilityId === baseId);
      // Package per use at stat 100 without keyword damage and included multipliers.
      const packageSum = (a: AbilityData) =>
        packageComponents(
          a.id,
          a.aegisRowId!,
          a.kind,
          a.extraIncludedEffectIds ?? [],
          aegisRows,
          abilityStats,
          own,
        )
          .map((c) => (normalise ? withoutIncludedMultipliers(c, a, normalise) : c))
          .reduce((sum, c) => sum + requireValue(c.damagePerTick, "damagePerTick"), 0);
      const baseComponents = abilityComponents.find((e) => e.abilityId === baseId);
      // A variant of an ability from components takes the base components times the Aegis ratio
      // variant / base, so the measured difference stays (ADR 0011: sources only as ratios).
      const fromText =
        baseComponents && withPackage.variantOf
          ? scaled(
              baseComponents,
              packageSum(withPackage) /
                packageSum(data.find((a) => a.id === baseId)!),
              withPackage.aegisRowId!,
            )
          : baseComponents;
      const ability = fromText
        ? { ...withPackage, package: undefined }
        : withPackage;
      // the variant's own timing, else the timing of its base
      const timing =
        superTimings.find(
          (t) =>
            t.abilityId === baseId && t.exoticArmorId === ability.exoticArmorId,
        ) ??
        superTimings.find((t) => t.abilityId === baseId && !t.exoticArmorId);
      const hits = timing ? requireValue(timing.hits, "hits") : 1;
      const packaged = ability.package
        ? packageComponents(
            ability.id,
            ability.aegisRowId!,
            ability.kind,
            ability.extraIncludedEffectIds ?? [],
            aegisRows,
            abilityStats,
            own,
          ).map((component) =>
            normalise
              ? withoutIncludedMultipliers(component, ability, normalise)
              : component,
          )
        : (fromText?.components ?? components ?? []);
      if (timing && !ability.package && !fromText && packaged.length > 0)
        throw new Error(`${ability.id}: a super timing needs a package`);
      const loaded = !timing
        ? packaged
        : fromText
          ? packaged.map((c) => atHits(c, timing))
          : packaged.map((c) => spreadOverHits(c, timing));
      return Ability.parse({
        ...ability,
        ...(timing?.weaponReadyMs
          ? { usage: { type: "timed", weaponReadyMs: timing.weaponReadyMs } }
          : {}),
        ...(ability.providers
          ? {}
          : manifestProviders(ability, manifestAbilities)),
        components: loaded,
        ...(own.length > 0
          ? {
              keywordParts: own.map((k) => ({
                type: "appliesKeyword",
                keywordId: k.keywordId,
                damageSources: [ability.kind],
                abilityIds: [ability.id],
                // once per cast: only the first component applies it
                damageInstanceIds: [`${ability.id}.${loaded[0].id}`],
                // spread over the hits like the damage, e.g. x120 scorch per Golden Gun = x40 per shot
                ...(k.stacksPerUse
                  ? {
                      stacks: {
                        ...k.stacksPerUse,
                        value:
                          k.stacksPerUse.value === null
                            ? null
                            : k.stacksPerUse.value / hits,
                      },
                    }
                  : {}),
                source: k.source,
              })),
            }
          : {}),
      });
    });
}

function packageComponents(
  abilityId: string,
  aegisRowId: string,
  kind: AbilityKind,
  extraIncludedEffectIds: string[],
  aegisRows: AegisAbilityRow[],
  abilityStats: AbilityStatScaling[],
  abilityKeywords: AbilityKeyword[],
): AbilityComponent[] {
  const row = aegisRows.find((r) => r.id === aegisRowId);
  if (!row) throw new Error(`${abilityId}: unknown Aegis row "${aegisRowId}"`);
  // Keyword damage Aegis counted into the package, per use in visual value; the keyword run adds it
  // back. It grows with the stat of a grenade or super, not of a melee (Aegis stat 200 / stat 100,
  // ADR 0015 U5).
  const baked = abilityKeywords.flatMap((k) =>
    k.bakedInPackage ? [k.bakedInPackage] : [],
  );
  const keywordPerUse = baked.reduce(
    (sum, b) => sum + (b.triggers * b.tick) / (b.uses * b.fullModifiers),
    0,
  );
  const atStat100 =
    requireValue(row.perUseStat100, `${aegisRowId} perUseStat100`) -
    keywordPerUse;
  const scaling = abilityStats.find((s) => s.kind === kind);
  if (!scaling) throw new Error(`${abilityId}: no stat scaling for "${kind}"`);
  const statFactor =
    1 +
    requireValue(scaling.damagePerPoint, "damagePerPoint") *
      (scaling.maxStat - scaling.bonusFromStat);

  const atStat200 =
    row.perUseStat200.value === null
      ? null
      : row.perUseStat200.value -
        // melee buffs do not scale ignition (Compendium); Aegis melee rows match exactly this way
        keywordPerUse * (kind === "melee" ? 1 : statFactor);
  const share =
    atStat200 === null
      ? 1
      : clampShare((atStat200 / atStat100 - 1) / (statFactor - 1));
  const valueSource = (note: string): Source => ({
    ...row.perUseStat100.source,
    status: atStat200 === null ? "unverified" : row.perUseStat100.source.status,
    note: `${row.perUseStat100.source.note ?? ""}; package ${aegisRowId}: ${note}${
      baked.length > 0
        ? `; keyword damage taken out: ${baked.map((b) => b.note).join("; ")}`
        : ""
    }`,
  });
  const modelSource: Source = {
    name: "Package model (ADR 0009)",
    retrieved: row.perUseStat100.source.retrieved,
    status: "unverified",
    note: "All damage at the cast; the time profile of the package is not modelled.",
  };
  const component = (
    id: string,
    name: string,
    damage: number,
    scales: boolean,
    note: string,
  ) => ({
    id,
    name,
    delayMs: { value: 0, source: modelSource },
    damagePerTick: { value: damage, source: valueSource(note) },
    ticks: { value: 1, source: modelSource },
    tickIntervalMs: { value: 0, source: modelSource },
    scalesWithAbilityStat: scales,
    includedEffectIds: [
      ...new Set([...row.includedEffectIds, ...extraIncludedEffectIds]),
    ],
  });

  if (atStat200 === null) {
    return [
      component(
        "package",
        "Package",
        atStat100,
        true,
        "no value at stat 200, assumed to scale fully",
      ),
    ];
  }
  if (share === 1) {
    return [
      component(
        "package",
        "Package",
        atStat100,
        true,
        "scales fully with the ability stat",
      ),
    ];
  }
  if (share === 0) {
    return [
      component(
        "package",
        "Package",
        atStat100,
        false,
        "does not scale with the ability stat",
      ),
    ];
  }
  const percent = Math.round(share * 100);
  return [
    component(
      "package",
      "Package",
      atStat100 * share,
      true,
      `${percent}% scale with the ability stat`,
    ),
    component(
      "packageFixed",
      "Package (fixed part)",
      atStat100 * (1 - share),
      false,
      `${100 - percent}% fixed`,
    ),
  ];
}

/** Spreads a package component evenly over the hits of a super timing; the sum stays the same. */
function spreadOverHits(
  component: AbilityComponent,
  timing: SuperTiming,
): AbilityComponent {
  const hits = requireValue(timing.hits, "hits");
  const damage = requireValue(component.damagePerTick, "damagePerTick");
  return {
    ...component,
    delayMs: timing.firstHitMs,
    ticks: timing.hits,
    tickIntervalMs: timing.hitIntervalMs,
    damagePerTick: {
      ...component.damagePerTick,
      value: damage / hits,
      source: {
        ...component.damagePerTick.source,
        note: `${component.damagePerTick.source.note ?? ""}; spread over ${hits} hits (super-timings.json)`,
      },
    },
  };
}

/** Components of a base ability times the Aegis ratio of a variant, e.g. with Cuirass. */
function scaled(
  base: AbilityComponents,
  factor: number,
  aegisRowId: string,
): AbilityComponents {
  return {
    ...base,
    components: base.components.map((c) => ({
      ...c,
      damagePerTick: {
        value: requireValue(c.damagePerTick, "damagePerTick") * factor,
        source: {
          ...c.damagePerTick.source,
          status: "unverified",
          note: `${c.damagePerTick.source.note ?? ""}; times x${factor.toFixed(3)}, Aegis ratio of ${aegisRowId} to the base row`,
        },
      },
    })),
  };
}

/**
 * Places a component from the Compendium (values per hit) on the hits of a super timing: it starts
 * at the first hit and, for several hits, repeats once per hit.
 */
function atHits(
  component: AbilityComponent,
  timing: SuperTiming,
): AbilityComponent {
  const hits = requireValue(timing.hits, "hits");
  const ticks = requireValue(component.ticks, "ticks");
  if (hits > 1 && ticks > 1)
    throw new Error(`${component.id}: ticks per hit over several hits are not modelled`);
  const firstHitMs = requireValue(timing.firstHitMs, "firstHitMs");
  return {
    ...component,
    delayMs: {
      value: requireValue(component.delayMs, "delayMs") + firstHitMs,
      source: {
        ...component.delayMs.source,
        note: `${component.delayMs.source.note ?? ""}; plus first hit at ${firstHitMs} ms (super-timings.json)`,
      },
    },
    ...(hits > 1 ? { ticks: timing.hits, tickIntervalMs: timing.hitIntervalMs } : {}),
  };
}

/** Divides the included effects that are multipliers for this ability out of the component value. */
function withoutIncludedMultipliers(
  component: AbilityComponent,
  ability: { id: string; kind: AbilityKind; element: Ability["element"] },
  { effects, buckets }: { effects: Effect[]; buckets: Bucket[] },
): AbilityComponent {
  const kept: string[] = [];
  const normalised: { id: string; factor: number }[] = [];
  for (const id of component.includedEffectIds ?? []) {
    const effect = effects.find((e) => e.id === id);
    const factor = effect
      ? combinedMultiplier(activeParts([effect], buckets).multiplierParts, buckets, {
          damageSource: ability.kind,
          element: ability.element,
          abilityId: ability.id,
        })
      : 1;
    if (factor === 1) kept.push(id);
    else normalised.push({ id, factor });
  }
  if (normalised.length === 0) return component;

  const factor = normalised.reduce((product, n) => product * n.factor, 1);
  const value = requireValue(component.damagePerTick, "damagePerTick");
  const source = component.damagePerTick.source;
  return {
    ...component,
    damagePerTick: {
      value: value / factor,
      source: {
        ...source,
        note: `${source.note ?? ""}; taken out: ${normalised
          .map((n) => `${n.id} x${n.factor}`)
          .join(", ")} (ADR 0009 point 5)`,
      },
    },
    includedEffectIds: kept,
    normalisedEffectIds: normalised.map((n) => n.id),
  };
}

function clampShare(share: number): number {
  if (share >= 1 - SHARE_TOLERANCE) return 1;
  if (share <= SHARE_TOLERANCE) return 0;
  return share;
}

/** Providers and icon hash from the manifest items of an ability; throws if there is none. */
function manifestProviders(
  ability: { id: string; name: string; kind: AbilityKind; element: string },
  manifestAbilities: ManifestAbility[],
): { providers: Provider[]; manifestHash: number } {
  const items = itemsOfAbility(manifestAbilities, ability);
  if (items.length === 0) {
    throw new Error(
      `${ability.id}: "${ability.name}" is not in the manifest abilities`,
    );
  }
  const bySubclassOrder = (a: Subclass, b: Subclass) =>
    Subclass.options.indexOf(a) - Subclass.options.indexOf(b);
  const shared = [
    ...new Set(
      items.filter((m) => m.guardianClass === null).map((m) => m.subclass),
    ),
  ].sort(bySubclassOrder);

  // Classes with the same subclasses share one provider, e.g. Prismatic for titan and warlock.
  const classesBySubclasses = new Map<string, GuardianClass[]>();
  for (const guardianClass of GuardianClass.options) {
    const subclasses = [
      ...new Set(
        items
          .filter(
            (m) =>
              m.guardianClass === guardianClass && !shared.includes(m.subclass),
          )
          .map((m) => m.subclass),
      ),
    ].sort(bySubclassOrder);
    if (subclasses.length === 0) continue;
    const groupKey = subclasses.join(",");
    classesBySubclasses.set(groupKey, [
      ...(classesBySubclasses.get(groupKey) ?? []),
      guardianClass,
    ]);
  }
  const providers: Provider[] = [
    ...(shared.length > 0
      ? [{ kind: "subclass" as const, subclasses: shared }]
      : []),
    ...[...classesBySubclasses].map(([groupKey, classes]) => ({
      kind: "subclass" as const,
      classes,
      subclasses: groupKey.split(",") as Subclass[],
    })),
  ];
  return {
    providers,
    manifestHash: elementItem(items, ability.element)!.hash,
  };
}
