// Loads abilities.json (ADR 0009). An ability with a package gets its components from one Aegis row,
// so a new Aegis import updates it without copying values.
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
  type AbilityKeyword,
  type AbilityKind,
  type ManifestAbility,
  type Provider,
  type AbilityStatScaling,
  type AegisAbilityRow,
  type ExoticArmorEntry,
  type Source,
} from "../data/schema";
import { elementItem, itemsOfAbility } from "./abilityNames";
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
): Ability[] {
  const data = AbilityData.array().parse(raw);
  // A variant row measures the same ability with the assumptions of the base row plus the exotic,
  // e.g. "Thundercrash" with "Cuirass of the Falling Star". It shares the code of its base: links
  // store the base, the worn exotic selects the variant.
  const variants = data.flatMap((ability) => {
    const base = aegisRows.find((r) => r.id === ability.aegisRowId);
    if (!ability.package || !base) return [];
    return exoticArmor
      .filter((e) => e.kind === "abilityVariant")
      .flatMap((exotic) =>
        exotic.aegisRowIds
          .map((id) => aegisRows.find((r) => r.id === id))
          .filter(
            (row): row is AegisAbilityRow =>
              row !== undefined &&
              row.category === base.category &&
              row.name === base.name &&
              sameSet(row.assumptions, [...base.assumptions, exotic.name]),
          )
          .map((row) => ({
            ...ability,
            id: `${ability.id}-with-${exotic.id}`,
            name: `${ability.name} (${exotic.name})`,
            aegisRowId: row.id,
            variantOf: ability.id,
            exoticArmorId: exotic.id,
            // the exotic changes the shots, e.g. Celestial Nighthawk: one shot
            ...(ability.usage?.type === "shots" && exotic.superShots
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
          })),
      );
  });
  return [...data, ...variants]
    .map(({ components, ...ability }) => {
      // a variant keeps the keywords of its base
      const own = abilityKeywords.filter(
        (k) => k.abilityId === (ability.variantOf ?? ability.id),
      );
      const loaded = ability.package
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
        : (components ?? []);
      return Ability.parse({
        ...ability,
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
                ...(k.stacksPerUse ? { stacks: k.stacksPerUse } : {}),
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
  kind: AbilityStatScaling["kind"],
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

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

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
