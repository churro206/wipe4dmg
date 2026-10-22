// Short German texts for effects, sources and provider groups in the UI.

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
  type WeaponType,
} from "../data/schema";
import type { ReplacedEffect } from "../engine/buildLink";
import { exoticArmorEffects } from "../engine/exoticArmor";
import { superWindowMs } from "../engine/superWindow";
import { abilities } from "./data";
import { integer, seconds, secondsInput } from "./format";

export const PROVIDER_LABELS: Record<ProviderKind, string> = {
  subclass: "Subklasse",
  armor: "Rüstung",
  artifact: "Artefakt",
  fireteamSupport: "Fireteam Support",
};

export const GROUP_LABELS: Record<string, string> = {
  super: "ein Super",
  surge: "eine Surge-Stufe",
};

/** Icon key of an effect; surges show the mod of the weapon element, as in the game. */
export function effectIconKey(effect: Effect, weaponElement: Element): string {
  return effect.elementIconKey
    ? `${effect.elementIconKey}:${weaponElement}`
    : `effect:${effect.id}`;
}

const FORMER_CODE_REASONS: Record<FormerCodeReason, string> = {
  onlyFromExoticArmor: "gibt es nur über Exotic-Rüstung",
};

/** Hint for effects of an old link that were replaced, e.g. Surge 4x; null if none. */
export function replacedMessage(
  replaced: ReplacedEffect[],
  effects: Effect[],
): string | null {
  const texts = replaced.map(({ code, effectId, reason }) => {
    const effect = effects.find((e) => e.id === effectId)!;
    const old = effect.formerCodes!.find((f) => f.code === code)!;
    return `${old.name} ${FORMER_CODE_REASONS[reason]}; der Link nutzt jetzt ${effect.name}.`;
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
  empowering: "Empowering-Buff",
  debuff: "Debuff",
  surge: "Surge",
  amplification: "Amplification",
  exoticIntrinsic: "Exotic",
  weaponPerk: "Perk",
};
const SOURCE_DAMAGE: Record<DamageSource, string> = {
  weapon: "Waffenschaden",
  grenade: "Grenade-Schaden",
  melee: "Melee-Schaden",
  super: "Super-Schaden",
  classAbility: "Class-Ability-Schaden",
  keyword: "Keyword-Schaden",
};
const SOURCE_HITS: Record<DamageSource, string> = {
  weapon: "Waffen",
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
    : `${items.slice(0, -1).join(", ")} oder ${items[items.length - 1]}`;
const percentOf = (value: number | null) =>
  integer.format(((value ?? 1) - 1) * 100);
const nameOfAbility = (id: string) =>
  abilities.find((a) => a.id === id)?.name ?? id;

/** Target of a part, e.g. "Waffenschaden (Solar, Shotgun)" or "Schaden aus allen Quellen". */
function targetOf(part: {
  damageSources: DamageSource[];
  elements?: Element[];
  weaponTypes?: WeaponType[];
  abilityIds?: string[];
}): string {
  const all = DamageSource.options.every((s) => part.damageSources.includes(s));
  const base = all
    ? "Schaden aus allen Quellen"
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
          ? "wenn die Waffe das Element deines Supers hat"
          : part.condition === "weaponMatchesTriggerElement"
            ? "im Element der auslösenden Ability"
            : "",
        part.superElements
          ? `nur mit ${list(part.superElements.map((e) => ELEMENT_LABELS[e]))}-Super`
          : "",
        part.requiresStatus
          ? `solange du ${list(part.requiresStatus.map((s) => STATE_LABELS[s]))} hast`
          : "",
      ].filter(Boolean);
      const bucket = BUCKET_LABELS[part.bucketId];
      return `+${percentOf(part.multiplier.value)} % ${targetOf(part)}${
        bucket ? ` (${bucket})` : ""
      }${conditions.length ? `, ${conditions.join(", ")}` : ""}`;
    }
    case "timing":
      return part.change === "noReload"
        ? "Die Waffe muss nicht nachladen"
        : `Nachladen dauert nur ${integer.format((part.factor ?? 1) * 100)} %`;
    case "counterModifier":
      return `+${percentOf(part.factor.value)} % Scorch-Stapel`;
    case "appliesKeyword": {
      const hits = part.damageSources
        .map((s) =>
          part.elements?.length
            ? `${list(part.elements.map((e) => ELEMENT_LABELS[e]))}-${SOURCE_HITS[s]}`
            : SOURCE_HITS[s],
        )
        .join(", ");
      const stacks = part.stacks?.value ? `x${part.stacks.value} ` : "";
      return `Setzt ${stacks}${KEYWORD_LABELS[part.keywordId] ?? part.keywordId} bei Treffern von ${hits}`;
    }
  }
}

/** What an effect does, one line per part and state. */
export function describeEffect(effect: Effect): string[] {
  return [
    ...effect.parts.map(describePart),
    ...(effect.grantsStatus
      ? [`Gibt dir ${list(effect.grantsStatus.map((s) => STATE_LABELS[s]))}`]
      : []),
  ];
}

/** When an effect is active, e.g. "5 s nach jedem Treffer einer Void-Grenade". */
export function describeDuration(effect: Effect): string {
  const durationMs = effect.durationMs?.value;
  const length =
    durationMs == null ? "" : `${secondsInput.format(durationMs / 1000)} s`;
  const trigger = effect.trigger;
  if (!trigger)
    return length ? `ab Beginn der Damage Phase für ${length}` : "die ganze Damage Phase";
  const elements = trigger.elements
    ? `${list(trigger.elements.map((e) => ELEMENT_LABELS[e]))}-`
    : "";
  const what = trigger.abilityIds
    ? list(trigger.abilityIds.map(nameOfAbility))
    : trigger.abilityKinds
      ? `einer ${elements}${list(trigger.abilityKinds.map((k) => ABILITY_KIND_NAMES[k]))}`
      : "einer Ability";
  switch (trigger.on) {
    case "cast":
      return trigger.abilityKinds?.includes("super") && !trigger.abilityIds
        ? `${length} nach jedem Super-Cast`
        : `${length} nach jedem Einsatz von ${what}`;
    case "hit":
      return `${length} nach jedem Treffer ${trigger.abilityIds ? `von ${what}` : what}${
        trigger.refresh ? "" : ", nicht auffrischbar"
      }`;
    case "superEnd":
      return `${length} nach dem Ende ${trigger.abilityIds ? `von ${what}` : "des Supers"}`;
    case "untilSuperCast":
      return `ab Beginn, solange der Super geladen ist, bis ${length} nach dem Super-Cast`;
  }
}

/** What an exotic armor piece does in the calculator: changed abilities and its effects. */
export function describeExotic(
  entry: ExoticArmorEntry,
  effects: Effect[],
  generated: ExoticArmorEffect[],
): string[] {
  const perUse = (a: Ability) =>
    a.components.reduce(
      (sum, c) => sum + (c.damagePerTick.value ?? 0) * (c.ticks.value ?? 0),
      0,
    );
  const variants = abilities
    .filter((a) => a.exoticArmorId === entry.id && a.variantOf)
    .map((variant) => {
      const base = abilities.find((a) => a.id === variant.variantOf)!;
      return `${base.name}: ${integer.format(perUse(variant))} statt ${integer.format(perUse(base))} Schaden pro Einsatz`;
    });
  const preBuiltIds = new Set(
    generated
      .filter((g) => g.exoticArmorId === entry.id && g.activation === "preBuilt")
      .map((g) => g.effect.id),
  );
  const lines = exoticArmorEffects(entry, effects, generated, {
    preBuilt: true,
  }).map(
    (effect) =>
      `${describeEffect(effect).join("; ")}, ${describeDuration(effect)}${
        preBuiltIds.has(effect.id) ? " (mit „Vorher aufgebaut“)" : ""
      }`,
  );
  const all = [...variants, ...lines];
  return all.length > 0 ? all : ["Wirkt im Rechner noch nicht."];
}

const ABILITY_KIND_NAMES: Record<Ability["kind"], string> = {
  super: "Super",
  grenade: "Grenade",
  melee: "Melee",
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
export function describeAbility(
  ability: Ability,
  effects: Effect[],
): string[] {
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
      ? "Kein eigener Schaden, nur Buff"
      : `${integer.format(total)} Schaden pro Einsatz (Stat 100, ohne Buffs)`,
  ];
  if (total > 0 && scaling > 0) {
    lines.push(
      `${integer.format((scaling / total) * 100)} % davon wachsen mit dem Stat`,
    );
  }
  if (ability.keywordParts?.length) {
    lines.push(...ability.keywordParts.map(describePart));
  }
  if (ability.grantsEffectIds?.length) {
    lines.push(`Bringt mit: ${ability.grantsEffectIds.map(nameOf).join(", ")}`);
  }
  if (ability.kind === "super") lines.push(describeSuperWindow(ability));
  return lines;
}

/** How long the super keeps the weapon from firing, and whether that is exact. */
export function describeSuperWindow(ability: Ability): string {
  if (!ability.usage) return "Super Window: blockiert die Waffe nicht";
  const { durationMs, exact } = superWindowMs(ability.usage);
  const length = `${seconds.format(durationMs / 1000)} s`;
  switch (ability.usage.type) {
    case "cast":
      return exact
        ? `Super Window: Cast ${length}`
        : "Super Window: nur Cast, Dauer unbekannt (zählt als 0 s)";
    case "shots":
      return exact
        ? `Super Window: ${length} bis zum letzten Schuss`
        : `Super Window: höchstens ${length} (Schussabstand unbekannt)`;
    case "drain":
      return exact
        ? `Super Window: ${length}, bis die Energie leer ist`
        : `Super Window: höchstens ${length} (Verbrauch pro Angriff unbekannt)`;
  }
}

