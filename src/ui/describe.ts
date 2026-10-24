// Short English texts for effects, sources and provider groups in the UI.

import {
  DamageSource,
  type Ability,
  type Effect,
  type EffectPart,
  type Element,
  type ExoticArmorEffect,
  type ExoticArmorEntry,
  type FormerCodeReason,
  type ProviderKind,
  type StatusId,
  type Weapon,
  type WeaponType,
} from "../data/schema";
import type { ReplacedEffect } from "../engine/buildLink";
import { exoticArmorEffects } from "../engine/exoticArmor";
import { superWindowMs } from "../engine/superWindow";
import { abilities } from "./data";
import { integer, seconds, secondsInput } from "./format";

export const PROVIDER_LABELS: Record<ProviderKind, string> = {
  subclass: "Subclass",
  armor: "Armor",
  artifact: "Artifact",
  fireteamSupport: "Fireteam Support",
};

export const GROUP_LABELS: Record<string, string> = {
  super: "one Super",
  surge: "one Surge level",
};

/**
 * Hover card of the catalyst switch: what it does in the calculator, then the game text. Damage as
 * a bonus, timing as before → after, or why it does nothing here.
 */
export function describeCatalyst(weapon: Weapon): string[] {
  const catalyst = weapon.catalyst;
  const lines: string[] = [];
  for (const option of (weapon.options ?? []).filter(
    (o) => o.kind === "catalyst",
  ))
    lines.push(`${bonusPercent(option.factor.value)}% weapon damage`);
  const timing = catalyst?.timing;
  if (timing) {
    const change = (
      label: string,
      before: number | null,
      after: number | null,
    ) =>
      before !== after
        ? `${label} ${before === null ? "∞" : integer.format(before)} → ${after === null ? "∞" : integer.format(after)}`
        : null;
    const changes = [
      change("Magazine", weapon.magazine.value, timing.magazine.value),
      weapon.ammo === "primary"
        ? null
        : change("ammo", weapon.totalShots.value, timing.totalShots.value),
      change(
        "rate of fire",
        round(weapon.fireRateRpm.value),
        round(timing.fireRateRpm.value),
      ),
      change("reload ms", weapon.reloadTimeMs.value, timing.reloadTimeMs.value),
    ].filter((c): c is string => c !== null);
    if (changes.length > 0) lines.push(changes.join(", "));
  }
  if (catalyst?.effect === "none")
    lines.push("No effect against one boss without adds");
  if (catalyst?.effect === "unknown")
    lines.push("Not in the calculator yet: no source measured it");
  const [first, ...rest] = (catalyst?.description ?? "")
    .split("\n")
    .filter((line) => line.trim() !== "");
  if (first) lines.push(`In game: ${neutralVoice(first)}`, ...rest.map(neutralVoice));
  return lines;
}

/** Game texts sometimes speak as the weapon ("I gain 30 Stability"); cards state it neutrally. */
export function neutralVoice(text: string): string {
  return text
    .replace(/\bI (\w+)/g, (_, verb: string) => verb[0].toUpperCase() + verb.slice(1))
    .replace(/\b[Mm]y\b/g, "the wielder's")
    .replace(/\b[Mm]e\b/g, "the wielder");
}

const round = (value: number | null) =>
  value === null ? null : Math.round(value);
const bonusPercent = (value: number | null) =>
  `${(value ?? 1) >= 1 ? "+" : ""}${integer.format(((value ?? 1) - 1) * 100)}`;

/** Icon key of an effect; surges show the mod of the weapon element, as in the game. */
export function effectIconKey(effect: Effect, weaponElement: Element): string {
  return effect.elementIconKey
    ? `${effect.elementIconKey}:${weaponElement}`
    : `effect:${effect.id}`;
}

const FORMER_CODE_REASONS: Record<FormerCodeReason, string> = {
  onlyFromExoticArmor: "is only available from exotic armor",
};

/** Hint for effects of an old link that were replaced, e.g. Surge 4x; null if none. */
export function replacedMessage(
  replaced: ReplacedEffect[],
  effects: Effect[],
): string | null {
  const texts = replaced.map(({ code, effectId, reason }) => {
    const effect = effects.find((e) => e.id === effectId)!;
    const old = effect.formerCodes!.find((f) => f.code === code)!;
    return `${old.name} ${FORMER_CODE_REASONS[reason]}; the link now uses ${effect.name}.`;
  });
  return texts.length > 0 ? texts.join(" ") : null;
}

export const WEAPON_TYPE_LABELS: Record<WeaponType, string> = {
  autoRifle: "Auto Rifle",
  bow: "Bow",
  fusionRifle: "Fusion Rifle",
  glaive: "Glaive",
  grenadeLauncher: "Grenade Launcher",
  handCannon: "Hand Cannon",
  linearFusionRifle: "Linear Fusion Rifle",
  machineGun: "Machine Gun",
  pulseRifle: "Pulse Rifle",
  rocketLauncher: "Rocket Launcher",
  scoutRifle: "Scout Rifle",
  shotgun: "Shotgun",
  sidearm: "Sidearm",
  submachineGun: "SMG",
  sniperRifle: "Sniper Rifle",
  sword: "Sword",
  traceRifle: "Trace Rifle",
};

// Hover cards explain what an item does in the calculator, in plain words and without sources (U8).
const ELEMENT_LABELS: Record<Element, string> = {
  kinetic: "Kinetic",
  arc: "Arc",
  solar: "Solar",
  void: "Void",
  stasis: "Stasis",
  strand: "Strand",
};
const BUCKET_LABELS: Record<string, string> = {
  empowering: "Empowering Buff",
  debuff: "Debuff",
  surge: "Surge",
  amplification: "Amplification",
  exoticIntrinsic: "Exotic",
  weaponPerk: "Perk",
};
const SOURCE_DAMAGE: Record<DamageSource, string> = {
  weapon: "weapon damage",
  grenade: "grenade damage",
  melee: "melee damage",
  super: "Super damage",
  classAbility: "class ability damage",
  keyword: "keyword damage",
};
const SOURCE_HITS: Record<DamageSource, string> = {
  weapon: "weapons",
  grenade: "Grenades",
  melee: "Melees",
  super: "Supers",
  classAbility: "Class Abilities",
  keyword: "Keywords",
};
const KEYWORD_LABELS: Record<string, string> = {
  ignition: "Scorch",
  jolt: "Jolt",
  volatile: "Volatile",
  unravel: "Unravel",
  boltCharge: "Bolt Charge",
};
const STATE_LABELS: Record<StatusId, string> = {
  amplified: "Amplified",
  frostArmor: "Frost Armor",
  roaringFlames: "Roaring Flames",
  wovenMail: "Woven Mail",
  voidOvershield: "Void Overshield",
  restoration: "Restoration",
};

const list = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
const percentOf = (value: number | null) =>
  integer.format(((value ?? 1) - 1) * 100);
const nameOfAbility = (id: string) =>
  abilities.find((a) => a.id === id)?.name ?? id;

/** Target of a part, e.g. "weapon damage (Solar, Shotgun)" or "damage from all sources". */
function targetOf(part: {
  damageSources: DamageSource[];
  elements?: Element[];
  weaponTypes?: WeaponType[];
  abilityIds?: string[];
}): string {
  const all = DamageSource.options.every((s) => part.damageSources.includes(s));
  const base = all
    ? "damage from all sources"
    : list(part.damageSources.map((s) => SOURCE_DAMAGE[s]));
  const detail = [
    ...(part.elements ?? []).map((e) => ELEMENT_LABELS[e]),
    ...(part.weaponTypes ?? []).map((t) => WEAPON_TYPE_LABELS[t]),
    ...(part.abilityIds ?? []).map(nameOfAbility),
  ];
  return detail.length ? `${base} (${detail.join(", ")})` : base;
}

function describePart(part: EffectPart): string {
  switch (part.type) {
    case "multiplier": {
      const conditions = [
        part.condition === "weaponMatchesSuperElement"
          ? "if the weapon matches the element of your Super"
          : part.condition === "weaponMatchesTriggerElement"
            ? "in the element of the triggering ability"
            : "",
        part.superElements
          ? `only with a ${list(part.superElements.map((e) => ELEMENT_LABELS[e]))} Super`
          : "",
        part.requiresStatus
          ? `while you have ${list(part.requiresStatus.map((s) => STATE_LABELS[s]))}`
          : "",
        part.requiresEffectIds ? "while the effect it improves is active" : "",
      ].filter(Boolean);
      const bucket = BUCKET_LABELS[part.bucketId];
      return `+${percentOf(part.multiplier.value)}% ${targetOf(part)}${
        bucket ? ` (${bucket})` : ""
      }${conditions.length ? `, ${conditions.join(", ")}` : ""}`;
    }
    case "timing":
      return part.change === "noReload"
        ? "The weapon does not need to reload"
        : `Reloading takes only ${integer.format((part.factor ?? 1) * 100)}%`;
    case "counterModifier":
      return `+${percentOf(part.factor.value)}% Scorch stacks`;
    case "holdDraw":
      return `Holding a perfect draw adds +${percentOf(part.stepFactor.value)}% damage every ${integer.format((part.stepMs.value ?? 0) / 1000)} s (up to +${percentOf(part.maxFactor.value)}%), only when the hold pays off`;
    case "appliesKeyword": {
      const hits = part.damageSources
        .map((s) =>
          part.elements?.length
            ? `${list(part.elements.map((e) => ELEMENT_LABELS[e]))} ${SOURCE_HITS[s]}`
            : SOURCE_HITS[s],
        )
        .join(", ");
      const stacks = part.stacks?.value ? `x${part.stacks.value} ` : "";
      return `Applies ${stacks}${KEYWORD_LABELS[part.keywordId] ?? part.keywordId} on hits from ${hits}`;
    }
  }
}

/** Damage per cast of an ability, all components and ticks. */
const perUse = (a: Ability) =>
  a.components.reduce(
    (sum, c) => sum + (c.damagePerTick.value ?? 0) * (c.ticks.value ?? 0),
    0,
  );

/** "Blade Barrage: 11,600 instead of 8,500 damage per cast" for each variant of the filter. */
function variantLines(isVariant: (a: Ability) => boolean): string[] {
  return abilities
    .filter((a) => a.variantOf && isVariant(a))
    .map((variant) => {
      const base = abilities.find((a) => a.id === variant.variantOf)!;
      return `${base.name}: ${integer.format(perUse(variant))} instead of ${integer.format(perUse(base))} damage per cast`;
    });
}

/** What an effect does, one line per part, state and changed ability. */
export function describeEffect(effect: Effect): string[] {
  return [
    ...effect.parts.map(describePart),
    ...(effect.grantsStatus
      ? [`Grants ${list(effect.grantsStatus.map((s) => STATE_LABELS[s]))}`]
      : []),
    ...(effect.changesAbilityIds
      ? variantLines(
          (a) =>
            !a.exoticArmorId &&
            a.requiresEffectIds?.length === 1 &&
            a.requiresEffectIds[0] === effect.id,
        )
      : []),
  ];
}

/** When an effect is active, e.g. "5 s after each hit of a Void Grenade". */
export function describeDuration(effect: Effect): string {
  const durationMs = effect.durationMs?.value;
  const length =
    durationMs == null ? "" : `${secondsInput.format(durationMs / 1000)} s`;
  const trigger = effect.trigger;
  if (!trigger)
    return length
      ? `from the start of the Damage Phase for ${length}`
      : "the whole Damage Phase";
  const elements = trigger.elements
    ? `${list(trigger.elements.map((e) => ELEMENT_LABELS[e]))} `
    : "";
  const kinds = `${elements}${list((trigger.abilityKinds ?? []).map((k) => ABILITY_KIND_NAMES[k]))}`;
  const what = trigger.abilityIds
    ? list(trigger.abilityIds.map(nameOfAbility))
    : trigger.abilityKinds
      ? `${/^[AEIOU]/.test(kinds) ? "an" : "a"} ${kinds}`
      : "an ability";
  switch (trigger.on) {
    case "cast":
      return trigger.abilityKinds?.includes("super") && !trigger.abilityIds
        ? `${length} after each Super cast`
        : `${length} after each cast of ${what}`;
    case "hit":
      return `${length} after each hit of ${what}${
        trigger.refresh ? "" : ", not refreshable"
      }`;
    case "superEnd":
      return `${length} after the end of ${trigger.abilityIds ? what : "the Super"}`;
    case "untilSuperCast":
      return `from the start while the Super is charged, until ${length} after the Super cast`;
  }
}

/** What an exotic armor piece does in the calculator: changed abilities and its effects. */
export function describeExotic(
  entry: ExoticArmorEntry,
  effects: Effect[],
  generated: ExoticArmorEffect[],
): string[] {
  const variants = variantLines(
    (a) => a.exoticArmorId === entry.id && !a.requiresEffectIds,
  );
  const preBuiltIds = new Set(
    generated
      .filter(
        (g) => g.exoticArmorId === entry.id && g.activation === "preBuilt",
      )
      .map((g) => g.effect.id),
  );
  const lines = exoticArmorEffects(entry, effects, generated, {
    preBuilt: true,
  }).map(
    (effect) =>
      `${describeEffect(effect).join("; ")}, ${describeDuration(effect)}${
        preBuiltIds.has(effect.id) ? " (with “Pre-stacked”)" : ""
      }`,
  );
  const all = [...variants, ...lines];
  return all.length > 0 ? all : ["Not modeled in the calculator yet."];
}

const ABILITY_KIND_NAMES: Record<Ability["kind"], string> = {
  super: "Super",
  grenade: "Grenade",
  melee: "Melee",
  classAbility: "Class Ability",
};

/** Two letters as a placeholder until the effect has an icon, e.g. "Surge 4x" -> "S4". */
export function monogram(shortName: string): string {
  const words = shortName.split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : shortName.slice(0, 2);
  return letters.toUpperCase();
}

/** Level at the end of a short name, e.g. "Surge 4x" -> "4x"; for effects that share an icon. */
export function levelBadge(shortName: string): string | undefined {
  return /(\d+x)$/.exec(shortName)?.[1];
}

/** Lines for the hover card of an ability: model, assumptions, included effects, super window. */
export function describeAbility(ability: Ability, effects: Effect[]): string[] {
  const nameOf = (id: string) => effects.find((e) => e.id === id)?.name ?? id;
  const total = ability.components.reduce(
    (sum, c) => sum + (c.damagePerTick.value ?? 0) * (c.ticks.value ?? 0),
    0,
  );
  const scaling = ability.components
    .filter((c) => c.scalesWithAbilityStat)
    .reduce(
      (sum, c) => sum + (c.damagePerTick.value ?? 0) * (c.ticks.value ?? 0),
      0,
    );
  const lines = [
    ability.components.length === 0
      ? "No damage of its own, buff only"
      : `${integer.format(total)} damage per cast (stat 100, without buffs)`,
  ];
  if (total > 0 && scaling > 0) {
    lines.push(
      `${integer.format((scaling / total) * 100)}% of it scales with the stat`,
    );
  }
  if (ability.keywordParts?.length) {
    lines.push(...ability.keywordParts.map(describePart));
  }
  if (ability.grantsEffectIds?.length) {
    lines.push(`Includes: ${ability.grantsEffectIds.map(nameOf).join(", ")}`);
  }
  if (ability.kind === "super") lines.push(describeSuperWindow(ability));
  return lines;
}

/** How long the super keeps the weapon from firing, and whether that is exact. */
export function describeSuperWindow(ability: Ability): string {
  if (!ability.usage) return "Super Window: does not block the weapon";
  const { durationMs, exact } = superWindowMs(ability.usage);
  const length = `${seconds.format(durationMs / 1000)} s`;
  switch (ability.usage.type) {
    case "timed":
      return `Super Window: ${length}${exact ? "" : " (estimate)"}`;
    case "cast":
      return exact
        ? `Super Window: cast ${length}`
        : "Super Window: cast only, duration unknown (counts as 0 s)";
    case "shots":
      return exact
        ? `Super Window: ${length} until the last shot`
        : `Super Window: at most ${length} (shot interval unknown)`;
    case "drain":
      return exact
        ? `Super Window: ${length} until the energy runs out`
        : `Super Window: at most ${length} (drain per attack unknown)`;
  }
}
