// Effects of the exotic damage buffs by fixed rules (ADR 0015, U6-1; rules approved by the owner on
// 2026-10-22). One boss, no adds; play is optimal, so stacked buffs count at their highest stage.
// Court rows with a value come first, one verdict per row; without one, the texts of Compendium and
// Clarity decide. The first rule that matches wins:
// 1 the bonus cannot work on a boss (reflected projectiles, barricade, several enemies, low health)
// 2 the text describes damage of its own → later, like the other exotics with own damage
// 3 a kill or finisher triggers it → "prebuilt": active from 0 s for its duration, off by default;
//   without a duration the value is missing
// 4 a grenade, melee or super cast, an ability hit or the end of the super triggers it → rotation
//   (U6-1b); the class ability triggers it → U7
// 5 it needs another buff, e.g. Roaring Flames or Frost Armor → U6-2
// 6 the bonus names one ability: an ability of the model gets it the whole damage phase, otherwise gap
// 7 stacks per weapon hit → MultiplierPart.hitStacks, counted from the hits of the rotation; a
//   buff that grows while holding a draw (Oathkeeper) → HoldDrawPart, held only when it pays
// 8 no text → gap

import {
  DamageSource,
  type AbilityKind,
  type ClarityEntry,
  type CompendiumEntry,
  type Effect,
  type EffectTrigger,
  type Element,
  type ExoticArmorEffect,
  type ExoticArmorEntry,
  type MultiplierPart,
  type StatModifier,
  type StatusId,
  type WeaponType,
  type Source,
} from "../../src/data/schema.ts";
import { MS_PER_SECOND } from "../../src/engine/units.ts";

type HoldDrawModifier = Extract<StatModifier, { stat: "drawHold" }>;
import { NOT_AGAINST_BOSS, sameName } from "./exoticArmor.ts";

export type ExoticEffectInputs = {
  armor: ExoticArmorEntry[]; // exotic-armor.json
  compendium: CompendiumEntry[]; // tab Exotic Armors
  clarity: ClarityEntry[];
  abilities: { id: string; name: string; kind: AbilityKind }[]; // abilities.json
  effects: Effect[]; // effects.json, e.g. the duration of Well of Radiance
  sources: { court: Source; compendium: Source; clarity: Source };
};

export type ExoticEffectKind =
  | "always"
  | "preBuilt"
  | "missingDuration"
  | "notAgainstBoss"
  | "ownDamage"
  | "triggered"
  | "rotation"
  | "classAbility"
  | "needsEffect"
  | "abilityGap"
  | "hitStacks"
  | "heldDraw"
  | "noText"
  | "gap";

/** One line of the review table docs/exotic-effects.md. */
export type ExoticEffectRow = {
  exoticArmorId: string;
  name: string;
  rule: number;
  kind: ExoticEffectKind;
  reason: string; // in German
  check: string; // Court against Compendium and Clarity
  effectId?: string; // for always and preBuilt
};

// Court rows: what triggers the buff, in this order
const NEEDS_EFFECT = /While (?:any stacks of|having an active)|Roaring Flame/i;
// also the class abilities of aspects, e.g. Quickfall (dodge) or the Void Soul from a rift
const CLASS_ABILITY =
  /Class Ability|Exiting Invisibility|Quickfall|Vanishing Step|Void Soul/i;
const ROTATION =
  /\bSuper\b|\bRift\b|Well of Radiance|Grenade|Ability Damage hit|Shield Throw|Melee hit/i;
const ARC_OR_STASIS = /Arc or Stasis|Stasis or Arc/i;
const KILL = /\bkill(?:s|ing)?\b|\bFinish/i;
// A debuff whose element follows the equipped super, e.g. Chromatic Fire
const SUPER_DEPENDENT = /based on the equipped Super/i;
const NOT_REFRESHABLE = /not refreshable/i;
const SUPER_CAST = /On Super Cast|Casting your Super/;
// Element of the grenades an exotic overcharges, e.g. "overcharging a Void Grenade"
const OVERCHARGED_ELEMENT =
  /overcharging an? (Arc|Solar|Void|Stasis|Strand) Grenade/i;
// A super end the text names besides Court, e.g. "On Fists of Havoc End: Grants x4 Arc Weapon
// Surge for 30 [6] seconds"
const TEXT_SUPER_END =
  /On ([A-Z][\w ]+?) End:\s+Grants x4 (Arc|Solar|Void|Stasis|Strand) Weapon Surge for (\d+(?:\.\d+)?)/;

const OWN_DAMAGE = /\bDoT\b|are dealt (?:increasingly )?/i;
const HIT_STACKS =
  /Hits? against (?:a )?Combatants?:?\s+grants? (?:a )?stacks?/i;
// The buff grows while the perfect draw is held (Oathkeeper)
const HELD_BUFF = /increased damage every ([\d.]+) seconds/i;
const HELD_DRAW =
  /(\d+(?:\.\d+)?)% increased damage against PVE Combatants for every ([\d.]+) seconds[^.\n]*?up to a (\d+)% increase/i;
// Stacks per weapon hit: value, maximum, refresh and boss penalty from the text
const STACK_BONUS = /(\d+(?:\.\d+)?)% increased [^.\n]*? per stack/i;
const STACK_MAX = /(?:maximum of|up to) (\d+) stacks/i;
const STACK_REFRESH = /refresh the [^.\n]*? duration/i;
const STACK_DURATION = /Grants [^.\n]*?for (\d+(?:\.\d+)?) seconds?/i;
const BOSS_PENALTY = /Bosses take (\d+(?:\.\d+)?)% decreased damage/i;
const STACK_WEAPONS: [RegExp, WeaponType][] = [
  [/\bHand Cannons?\b/i, "handCannon"],
  [/\bSubmachine Guns?\b/i, "submachineGun"],
];
// The nearest trigger before the bonus decides; on the same end, the first kind of the list wins.
const TEXT_TRIGGERS: [RegExp, "rotation" | "classAbility" | "kill"][] = [
  [
    // stacks built inside an ability, e.g. "Hits and Kills during Stormtrance grant a stack"
    // a class ability among the triggers needs U7, e.g. "On Grenade or Class Ability Usage"
    /On [^:.\n]{0,40}Class Ability Usage/g,
    "classAbility",
  ],
  [
    /On Super Cast|Casting your Super|On (?:Grenade|Melee)[^:.\n]{0,40}(?:Usage|Cast)|\bHits and Kills\b/g,
    "rotation",
  ],
  // "a kill, or upon being not receiving damage": the kill is not needed
  [
    /\b(?:Kills?|Killing|Finisher)\b(?!,? or (?:upon )?(?:being )?not (?:taking|receiving) damage)/gi,
    "kill",
  ],
];
// Subjects that name no ability, e.g. "Weapons receive 15% increased damage"
const GENERIC_SUBJECT = /^(?:weapons?|damage buff)$/i;
// Bonuses only for heat weapons do not count: no heat weapon in the import (ADR 0015)
const HEAT = /\bHeat\b/;
const DURATION = /for (\d+(?:\.\d+)?) seconds/i;
const SUPER_ELEMENT =
  /While an? (Arc|Solar|Void|Stasis|Strand) Super Ability is equipped/i;
const ELEMENT = /\b(Arc|Solar|Void|Stasis|Strand)\b/i;
const ABILITY_SOURCES: [RegExp, DamageSource][] = [
  [/\bgrenade/i, "grenade"],
  [/\bsuper\b/i, "super"],
  [/\bclass\b/i, "classAbility"],
];

const PERCENT = 100;
// in this order, so 14 % gives exactly 1.14
const factorOf = (percent: number) => (PERCENT + percent) / PERCENT;

const numbers = (text: string, unit: string) =>
  [
    ...text
      .replace(/\[[^\]]*\]/g, "")
      .matchAll(new RegExp(String.raw`(\d+(?:\.\d+)?)${unit}`, "g")),
  ].map((m) => Number(m[1]));

const elementOf = (text: string): Element | undefined =>
  ELEMENT.exec(text)?.[1].toLowerCase() as Element | undefined;

const flat = (text: string) => text.replace(/\s+/g, " ").trim();

export type Verdict = Omit<ExoticEffectRow, "exoticArmorId" | "name" | "effectId"> & {
  part?: MultiplierPart | HoldDrawModifier;
  durationMs?: { value: number; source: Source };
  trigger?: EffectTrigger;
};

/** Court against the bonuses quoted in the texts. */
function courtCheck(percent: number, quoted: number[]): string {
  if (quoted.length === 0) return "nur Court";
  return quoted.includes(percent)
    ? `Court = Text (${percent} %)`
    : `Abweichung: Court ${percent} %, Text ${[...new Set(quoted)].join(" / ")} %`;
}

// States the texts name (ADR 0015, U6-2), e.g. "While Amplified, Restoration, … is active"
export const STATUS_NAMES: [StatusId, RegExp][] = [
  ["amplified", /Amplified/i],
  ["frostArmor", /Frost Armor/i],
  ["roaringFlames", /Roaring Flame/i],
  ["wovenMail", /Woven Mail/i],
  ["voidOvershield", /Void Overshield/i],
  ["restoration", /Restoration/i],
];
const statusesIn = (text: string) =>
  STATUS_NAMES.filter(([, p]) => p.test(text)).map(([s]) => s);
const WHILE_ACTIVE = /While [^:.\n]*\bis active/gi;
const WEAPON_TYPES: [RegExp, WeaponType][] = [[/\bShotguns?\b/i, "shotgun"]];
// Hazardous Propulsion: the exodus rockets are shot by the class ability and their hits build the
// stacks; the stacks are taken as built before the damage phase (owner, 2026-10-24)
const EXODUS = /Exodus Rockets/i;
// Clarity: "increasing "rocket-type" damage … includes: Rocket Launchers"; Court adds grenade
// launchers in its notes. Clarity names the perk's own list, so it wins.
const ROCKET_TYPE: [RegExp, WeaponType][] = [[/"rocket-type" damage/i, "rocketLauncher"]];

/** Verdict of one Court row with a value; quoted: the bonuses of the texts, for the check. */
export function courtVerdict(
  row: ExoticArmorEntry["courtBuffs"][number],
  quoted: number[],
  text: string,
  inputs: Pick<ExoticEffectInputs, "abilities" | "effects" | "sources">,
): Verdict {
  const court = inputs.sources.court;
  const trigger = flat(row.trigger);
  const value = `${flat(row.pve ?? "")} für ${flat(row.pveDuration ?? "")}`;
  // A class ability opens the window with its cast (U7); Hazardous Propulsion (rocket hits) and
  // Heart of Inmost Light (grenade as well) are other cases
  const exodus = EXODUS.test(trigger);
  const classCast = CLASS_ABILITY.test(trigger) && !/Grenade/i.test(trigger) && !exodus;
  const stages = numbers(row.pve ?? "", "%");
  // one cast is one stack: the first stage, e.g. Mask of Bakris 10 / 21 / 33 %
  const percent = classCast ? stages[0] : Math.max(...stages);
  const check = courtCheck(percent, quoted);
  if (NEEDS_EFFECT.test(trigger)) {
    // the states from the trigger, else from a "While … is active" sentence of the text
    const statuses = statusesIn(trigger).length
      ? statusesIn(trigger)
      : [
          ...new Set(
            [...text.matchAll(WHILE_ACTIVE)].flatMap((m) => statusesIn(m[0])),
          ),
        ];
    // a state the exotic grants itself, e.g. Fr0st-EE5: "Grants a stack of Frost Armor"
    const own = statuses.filter((s) =>
      new RegExp(String.raw`grants? (?:a stack of |x\d+ )?${STATUS_NAMES.find(([id]) => id === s)![1].source}`, "i").test(text),
    );
    if (statuses.length === 0)
      return { rule: 5, kind: "gap", reason: `Zustand unklar („${trigger}“)`, check };
    const element = [...trigger.matchAll(new RegExp(ELEMENT, "gi"))].length === 1 ? elementOf(trigger) : undefined;
    const weaponTypes = WEAPON_TYPES.filter(([p]) => p.test(trigger)).map(([, t]) => t);
    const source: Source = {
      ...court,
      name: `Court Stacking Guide (${row.bucketId}, PvE ${flat(row.pve ?? "")}, ${flat(row.pveDuration ?? "")})`,
      note: `„${trigger}“; while the player has ${statuses.join(" or ")} (ADR 0015, U6-2)`,
    };
    return {
      rule: 5,
      kind: "needsEffect",
      reason: `${row.bucketId} +${percent} %${element ? ` (${element})` : ""}${weaponTypes.length ? ` auf ${weaponTypes.join(", ")}` : ""}, ${
        own.length ? `Zustand ${own.join(", ")} gibt das Exotic selbst` : `braucht ${statuses.join(" oder ")}`
      } („${trigger}“)`,
      check,
      part: {
        type: "multiplier",
        bucketId: row.bucketId,
        multiplier: { value: factorOf(percent), source },
        damageSources: ["weapon"],
        ...(element ? { elements: [element] } : {}),
        ...(weaponTypes.length ? { weaponTypes } : {}),
        ...(own.length ? {} : { requiresStatus: statuses }),
      },
    };
  }
  if (CLASS_ABILITY.test(trigger) && !classCast && !exodus)
    return {
      rule: 4,
      kind: "classAbility",
      reason: `Auslöser Class Ability („${trigger}“), U7`,
      check,
    };
  const superDependent = SUPER_DEPENDENT.test(text);
  const rotation = classCast || (ROTATION.test(trigger) && !superDependent);
  if (!rotation && !superDependent && !exodus && !KILL.test(trigger))
    return {
      rule: 8,
      kind: "noText",
      reason: `Auslöser unklar („${trigger}“)`,
      check,
    };
  const found: FoundTrigger | undefined = classCast
    ? {
        trigger: { on: "cast", refresh: !NOT_REFRESHABLE.test(text), abilityKinds: ["classAbility"] },
        label: "ab Cast einer Class Ability",
      }
    : rotation
      ? rotationTrigger(trigger, text, inputs)
      : undefined;
  if (rotation && !found)
    return {
      rule: 4,
      kind: "rotation",
      reason: `Auslöser in der Rotation ohne Regel („${trigger}“)`,
      check,
    };
  // Court lists the stages in rising order; the duration of the highest stage comes last
  const durations = numbers(row.pveDuration ?? "", "s");
  const seconds =
    durations.length > 0
      ? durations[durations.length - 1]
      : found?.durationMs !== undefined
        ? found.durationMs.value / MS_PER_SECOND
        : undefined;
  if (seconds === undefined)
    return {
      rule: rotation ? 4 : 3,
      kind: "missingDuration",
      reason: `${rotation ? "Buff" : "Kill-Buff"} ohne Dauer in Court (${value}; „${trigger}“)`,
      check,
    };
  // A surge in one named element; with a trigger condition the element follows the ability
  const elements = [...trigger.matchAll(new RegExp(ELEMENT, "gi"))];
  const element =
    row.bucketId === "surge" && !found?.condition && elements.length === 1
      ? elementOf(trigger)
      : undefined;
  // "While an Arc or Stasis Super Ability is equipped": the buff applies to weapons of both
  const weaponElements: Element[] = classCast && ARC_OR_STASIS.test(text) ? ["arc", "stasis"] : [];
  const rocketTypes = exodus ? ROCKET_TYPE.filter(([p]) => p.test(text)).map(([, t]) => t) : [];
  // "Precision kill causes a Void AOE which applies Weaken": only with a super of that element
  const superElement = superDependent ? elementOf(trigger) : undefined;
  const source: Source = {
    ...court,
    name: `Court Stacking Guide (${row.bucketId}, PvE ${flat(row.pve ?? "")}, ${flat(row.pveDuration ?? "")})`,
    note: `„${trigger}“; ${found ? `window from the rotation (ADR 0015, U6-1b)` : "prebuilt before the damage phase at the highest stage (ADR 0015)"}`,
  };
  const target = `${row.bucketId} +${percent} % für ${seconds} s`;
  return {
    rule: found ? 4 : 3,
    kind: found ? "triggered" : "preBuilt",
    reason: found
      ? `${found.label}: ${target} („${trigger}“)`
      : `vorher aufgebaut: ${target}${superElement ? `, nur mit ${superElement} Super` : ""} („${trigger}“)`,
    check,
    part: {
      type: "multiplier",
      bucketId: row.bucketId,
      multiplier: { value: factorOf(percent), source },
      damageSources:
        row.bucketId === "debuff" ? [...DamageSource.options] : ["weapon"],
      ...(element ? { elements: [element] } : {}),
      ...(weaponElements.length ? { elements: weaponElements } : {}),
      ...(rocketTypes.length ? { weaponTypes: rocketTypes } : {}),
      ...(found?.condition ? { condition: found.condition } : {}),
      ...(superElement ? { superElements: [superElement] } : {}),
    },
    durationMs: {
      value: seconds * MS_PER_SECOND,
      source: found?.durationMs && durations.length === 0 ? found.durationMs.source : source,
    },
    ...(found ? { trigger: found.trigger } : {}),
  };
}

type FoundTrigger = {
  trigger: EffectTrigger;
  label: string; // in German, for the review table
  condition?: MultiplierPart["condition"];
  durationMs?: { value: number; source: Source }; // when the window lasts as long as an effect
};

/** Ability of the model a trigger names, e.g. "Arc Staff" or "Shield Throw". */
const abilityNamed = (name: string, abilities: ExoticEffectInputs["abilities"]) =>
  abilities.find((a) => a.name.toLowerCase() === flat(name).toLowerCase());

/** Window of a Court trigger in the rotation (rule 4); undefined if no rule fits. */
function rotationTrigger(
  trigger: string,
  text: string,
  inputs: Pick<ExoticEffectInputs, "abilities" | "effects">,
): FoundTrigger | undefined {
  const refresh = !NOT_REFRESHABLE.test(text);
  const superEnd = /(?:^|:)\s*([A-Z][\w ]*?) Super deactivation|On Super end/i.exec(trigger);
  if (superEnd) {
    const ability = superEnd[1] ? abilityNamed(superEnd[1], inputs.abilities) : undefined;
    if (superEnd[1] && !ability) return undefined;
    return {
      trigger: { on: "superEnd", refresh, ...(ability ? { abilityIds: [ability.id] } : {}) },
      label: `ab Ende von ${ability?.name ?? "jedem Super"}`,
      ...(ability ? { condition: "weaponMatchesTriggerElement" } : {}),
    };
  }
  if (/while matching Super is Charged/i.test(trigger))
    return {
      trigger: { on: "untilSuperCast", refresh },
      label: "bis zum Super-Cast (Super geladen), passend zum Super",
      condition: "weaponMatchesSuperElement",
    };
  const well = /Well of Radiance/.exec(trigger);
  if (well) {
    const ability = abilityNamed(well[0], inputs.abilities);
    const effect = inputs.effects.find((e) => e.name.startsWith(well[0]));
    if (!ability || !effect?.durationMs?.value) return undefined;
    return {
      trigger: { on: "cast", refresh, abilityIds: [ability.id] },
      label: `ab Cast von ${ability.name}, solange Well steht, passend zum Super`,
      condition: "weaponMatchesSuperElement",
      durationMs: {
        value: effect.durationMs.value!,
        source: { ...effect.durationMs.source, note: `duration of ${effect.id} (effects.json)` },
      },
    };
  }
  if (/Ability Damage hit/i.test(trigger))
    return {
      trigger: { on: "hit", refresh },
      label: `ab Treffer jeder Ability, Element der Ability${refresh ? "" : ", nicht auffrischbar"}`,
      condition: "weaponMatchesTriggerElement",
    };
  if (/Charged Grenade/i.test(trigger)) {
    const element = OVERCHARGED_ELEMENT.exec(text)?.[1].toLowerCase() as Element | undefined;
    return {
      trigger: {
        on: "hit",
        refresh,
        abilityKinds: ["grenade"],
        ...(element ? { elements: [element] } : {}),
      },
      label: `ab Treffer einer ${element ? `${element} ` : ""}Grenade`,
    };
  }
  // "Void Grenade damage applies Weaken", e.g. Echo of Undermining
  const grenadeDamage = /(Arc|Solar|Void|Stasis|Strand) Grenade damage applies/i.exec(trigger);
  if (grenadeDamage) {
    const element = grenadeDamage[1].toLowerCase() as Element;
    return {
      trigger: { on: "hit", refresh, abilityKinds: ["grenade"], elements: [element] },
      label: `ab Treffer einer ${element} Grenade`,
    };
  }
  const hit = /([A-Z][\w ]*?) hit applies/.exec(trigger);
  if (hit) {
    const ability = abilityNamed(hit[1], inputs.abilities);
    const kind = ability ? undefined : /melee/i.test(hit[1]) ? "melee" : undefined;
    if (!ability && !kind) return undefined;
    return {
      trigger: {
        on: "hit",
        refresh,
        ...(ability ? { abilityIds: [ability.id] } : { abilityKinds: [kind!] }),
      },
      label: `ab Treffer von ${ability?.name ?? "jeder Melee"}`,
    };
  }
  return undefined;
}

/** Who a bonus says it names, e.g. "Hellion Projectiles" or "Enhanced Tripmine Grenades"; "" if none. */
function subjectOf(text: string, quote: string, index: number): string {
  const before = text.slice(0, index);
  const start = Math.max(
    ...[...before.matchAll(/\.(?!\d)|\n/g)].map((m) => m.index + 1),
    0,
  );
  // "Diamond Lance damage is increased by 144%" names its subject inside the quote
  const inQuote = /^([A-Za-z][A-Za-z ]*?)\s+damage (?:is )?increased/i.exec(
    quote,
  );
  const clean = (s: string) =>
    flat(
      s
        .split(":")
        .pop()!
        .replace(
          /x\d+\s*[=|]?|\d+(?:\.\d+)?%|\[[^\]]*\]|[•|=?]|\b(?:deals?|receive|grants?)\b/gi,
          "",
        ),
    ).replace(GENERIC_SUBJECT, "");
  const subject = clean(before.slice(start) + (inQuote ? inQuote[1] : ""));
  if (subject !== "") return subject;
  // a heading line above, e.g. "Enhanced Tripmine Grenades"
  const heading = before.slice(0, start).trimEnd().split("\n").pop() ?? "";
  return /%|\.$/.test(heading) ? "" : clean(heading);
}

/** Ability whose name the subject names, e.g. Tripmine Grenade in "Enhanced Tripmine Grenades". */
function abilityOf(
  subject: string,
  abilities: ExoticEffectInputs["abilities"],
): ExoticEffectInputs["abilities"][number] | undefined {
  const singular = (s: string) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/s$/, ""))
      .join(" ");
  return abilities.find((a) => singular(subject).includes(singular(a.name)));
}

const CAP_LINE = /^(.+?)\s+receives?\s+up to\s+(\d+(?:\.\d+)?)%/gim;
const squash = (s: string) => s.replace(/\s+/g, "");

/**
 * Lower caps of a staged super buff, e.g. Feast of Light: "Nova Bomb, Thundercrash, and Twilight
 * Arsenal receive up to 50% Increased Super Damage". The line stands in the entry of the Exotic
 * Class Item, so the texts that quote the same stages count for the armor too. The base part skips
 * the capped supers; each cap becomes a part of its own.
 */
function withCaps(
  part: MultiplierPart,
  entry: ExoticArmorEntry,
  inputs: ExoticEffectInputs,
): MultiplierPart[] {
  if (
    part.abilityIds !== undefined ||
    part.damageSources.length !== 1 ||
    part.damageSources[0] !== "super"
  )
    return [part];
  const quotes = entry.bonuses.map((b) => squash(b.quote));
  const caps: { abilityIds: string[]; percent: number; line: string }[] = [];
  for (const c of inputs.compendium) {
    if (!quotes.some((q) => squash(c.text).includes(q))) continue;
    for (const m of c.text.matchAll(CAP_LINE)) {
      const names = m[1].split(/,\s*(?:and\s+)?|\s+and\s+/i).map((n) => n.trim().toLowerCase());
      const abilityIds = inputs.abilities
        .filter((a) => a.kind === "super" && names.some((n) => a.name.toLowerCase().startsWith(n)))
        .map((a) => a.id);
      if (abilityIds.length > 0)
        caps.push({ abilityIds, percent: Number(m[2]), line: flat(m[0]) });
    }
  }
  if (caps.length === 0) return [part];
  const excluded = caps.flatMap((c) => c.abilityIds);
  return [
    { ...part, excludeAbilityIds: excluded },
    ...caps.map((c) => ({
      ...part,
      multiplier: {
        value: factorOf(c.percent),
        source: { ...part.multiplier.source, note: `„${c.line}“ (Compendium, Exotic Class Item); ${part.multiplier.source.note ?? ""}` },
      },
      abilityIds: c.abilityIds,
    })),
  ];
}

/**
 * Rule 7: a buff that grows while the perfect draw is held (Oathkeeper). Clarity gives the value
 * per step and the maximum (the owner trusts it over the Compendium's 200 % after 2 s); the engine
 * takes the hold only when it pays (HoldDrawPart).
 */
function heldDrawVerdict(
  text: string,
  inputs: ExoticEffectInputs,
  check: string,
): Verdict {
  const held = HELD_DRAW.exec(text);
  if (!held)
    return { rule: 7, kind: "gap", reason: "Halte-Bonus nicht lesbar", check };
  const source: Source = {
    ...inputs.sources.clarity,
    note: `„${flat(held[0])}“; the engine holds only when damage per second rises (primary ammo bows)`,
  };
  const part: HoldDrawModifier = {
    type: "stat",
    stat: "drawHold",
    weaponTypes: ["bow"],
    stepMs: { value: Number(held[2]) * MS_PER_SECOND, source },
    stepFactor: { value: factorOf(Number(held[1])), source },
    maxFactor: { value: factorOf(Number(held[3])), source },
  };
  return {
    rule: 7,
    kind: "heldDraw",
    reason: `+${held[1]} % je ${held[2]} s Halten, höchstens +${held[3]} % auf Primary-Bögen; die Engine hält nur, wenn der Schaden pro Sekunde steigt (Gewinn erst ab Schusszyklus über etwa 1,3 s)`,
    check,
    part,
  };
}

/**
 * Rule 7: stacks per weapon hit. The engine counts the hits of the rotation (MultiplierPart.hitStacks);
 * the text gives the value per stack, the maximum, the refresh time and the penalty against bosses.
 */
function hitStacksVerdict(
  entry: ExoticArmorEntry,
  text: string,
  inputs: ExoticEffectInputs,
  check: string,
): Verdict {
  const bonus = STACK_BONUS.exec(text);
  const max = STACK_MAX.exec(text);
  const boss = BOSS_PENALTY.exec(text);
  const weaponTypes = STACK_WEAPONS.filter(([p]) => p.test(text)).map(([, t]) => t);
  if (!bonus || !max || !boss || weaponTypes.length !== 1)
    return {
      rule: 7,
      kind: "hitStacks",
      reason: "Stapel pro Waffentreffer, Wert, Maximum, Boss-Abzug oder Waffentyp nicht lesbar",
      check,
    };
  const duration = STACK_DURATION.exec(text);
  const refresh = STACK_REFRESH.test(text);
  const seconds = duration ? Number(duration[1]) : undefined;
  const source = (quote: string): Source => ({
    ...inputs.sources.compendium,
    note: `„${quote}“; stacks counted from the weapon hits of the rotation (hit n has n - 1 stacks)`,
  });
  const part: MultiplierPart = {
    type: "multiplier",
    bucketId: entry.bonusBucket?.bucketId ?? "exoticIntrinsic",
    multiplier: { value: factorOf(Number(bonus[1])), source: source(bonus[0]) },
    damageSources: ["weapon"],
    weaponTypes,
    hitStacks: {
      maxStacks: { value: Number(max[1]), source: source(max[0]) },
      ...(refresh && seconds !== undefined
        ? { refreshMs: { value: seconds * MS_PER_SECOND, source: source(duration![0]) } }
        : {}),
      bossFactor: { value: (PERCENT - Number(boss[1])) / PERCENT, source: source(boss[0]) },
    },
  };
  return {
    rule: 7,
    kind: "hitStacks",
    reason: `+${bonus[1]} % pro Stapel, höchstens ${max[1]}, auf ${weaponTypes.join(", ")}; Boss nimmt ${boss[1]} % weniger Schaden von gebufften Schüssen${refresh ? `; Lücke über ${seconds} s beendet die Serie` : seconds !== undefined ? `; Fenster ${seconds} s ab Beginn` : ""}`,
    check,
    part,
    ...(!refresh && seconds !== undefined
      ? { durationMs: { value: seconds * MS_PER_SECOND, source: source(duration![0]) } }
      : {}),
  };
}

function textVerdict(
  entry: ExoticArmorEntry,
  text: string,
  inputs: ExoticEffectInputs,
): Verdict {
  const compendium = entry.bonuses.filter((b) => b.source === "compendium" && !b.melee);
  const clarity = entry.bonuses.filter((b) => b.source === "clarity" && !b.melee);
  const max = (list: typeof entry.bonuses) =>
    list.length ? `${Math.max(...list.map((b) => b.percent))} %` : "–";
  const check = `Compendium ${max(compendium)}, Clarity ${max(clarity)}`;
  if (text.trim() === "")
    return { rule: 8, kind: "noText", reason: "kein Text in Compendium oder Clarity", check };
  const notAgainstBoss = NOT_AGAINST_BOSS.exec(text);
  if (notAgainstBoss)
    return {
      rule: 1,
      kind: "notAgainstBoss",
      reason: `wirkt nicht gegen einen Boss („${notAgainstBoss[0]}“)`,
      check,
    };
  const own = OWN_DAMAGE.exec(text);
  if (own)
    return { rule: 2, kind: "ownDamage", reason: `eigener Schaden („${own[0].trim()}“), später`, check };
  if (HELD_BUFF.test(text)) return heldDrawVerdict(text, inputs, check);
  const stacks = HIT_STACKS.exec(text);
  if (stacks) return hitStacksVerdict(entry, text, inputs, check);

  const indexOf = (quote: string) => {
    const index = text.indexOf(quote);
    return index < 0 ? text.length : index;
  };
  const lineOf = (quote: string) => {
    const index = indexOf(quote);
    return text.slice(text.lastIndexOf("\n", index) + 1, text.indexOf("\n", index) >>> 0);
  };
  const usable = entry.bonuses.filter((b) => !b.melee && !HEAT.test(lineOf(b.quote)));
  const subjects = usable
    .map((b) => subjectOf(text, b.quote, indexOf(b.quote)))
    .filter((s) => s !== "");
  const unknown = subjects.find((s) => !abilityOf(s, inputs.abilities));
  if (usable.length === 0 || unknown !== undefined)
    return {
      rule: 6,
      kind: "abilityGap",
      reason:
        unknown !== undefined
          ? `Bonus nur für „${unknown}“, nicht im Modell`
          : "nur Melee-Boni, Melee-Bucket in U6-4",
      check,
    };
  const bonus = usable.reduce((a, b) => (b.percent > a.percent ? b : a));
  const index = indexOf(bonus.quote);
  // the subject of the chosen bonus, not of the first one: "70% increased Super Damage" for every
  // super, then "Thundercrash receives up to 50%" (Spirit of the Star-Eater)
  const subject = subjectOf(text, bonus.quote, index);
  const ability = subject ? abilityOf(subject, inputs.abilities) : undefined;

  const end = (m: RegExpMatchArray) => m.index! + m[0].length;
  const trigger = TEXT_TRIGGERS.flatMap(([pattern, kind]) =>
    [...text.slice(0, index).matchAll(pattern)].map((m) => ({ kind, match: m })),
  ).sort((a, b) => end(b.match) - end(a.match))[0];
  const superCast =
    trigger?.kind === "rotation" && SUPER_CAST.test(trigger.match[0]);
  if (trigger?.kind === "rotation" && !superCast)
    return {
      rule: 4,
      kind: "rotation",
      reason: /Hits and Kills/.test(trigger.match[0])
        ? `Stapel aus Treffern in der Ability („${trigger.match[0]}“); das Paket nennt keine Trefferzahl, keine Gegenprobe möglich`
        : `Auslöser in der Rotation ohne Regel („${trigger.match[0]}“)`,
      check,
    };
  if (trigger?.kind === "classAbility")
    return {
      rule: 4,
      kind: "classAbility",
      reason: `Auslöser Class Ability („${trigger.match[0]}“), U7`,
      check,
    };

  const sources: DamageSource[] = ability
    ? [ability.kind]
    : ABILITY_SOURCES.filter(([p]) => p.test(bonus.quote)).map(([, s]) => s);
  const damageSources: DamageSource[] =
    sources.length > 0
      ? sources
      : /\bability\b/i.test(bonus.quote)
        ? ABILITY_SOURCES.map(([, s]) => s)
        : ["weapon"];
  const element =
    elementOf(bonus.quote) ??
    (damageSources.includes("super")
      ? (SUPER_ELEMENT.exec(text)?.[1].toLowerCase() as Element | undefined)
      : undefined);
  const source: Source = {
    ...inputs.sources[bonus.source],
    note: `„${bonus.quote}“; bucket ${entry.bonusBucket!.bucketId} (${entry.bonusBucket!.basis}); highest stage (optimal play)`,
  };
  const part: MultiplierPart = {
    type: "multiplier",
    bucketId: entry.bonusBucket!.bucketId,
    multiplier: { value: factorOf(bonus.percent), source },
    damageSources,
    ...(element ? { elements: [element] } : {}),
    ...(ability ? { abilityIds: [ability.id] } : {}),
  };
  const target = `${damageSources.join(", ")}${element ? ` (${element})` : ""}${ability ? `, nur ${ability.name}` : ""}`;
  if (trigger?.kind !== "kill" && !superCast)
    return {
      rule: 6,
      kind: "always",
      reason: `immer aktiv: +${bonus.percent} % auf ${target}`,
      check,
      part,
    };
  // a staged bonus lists its own duration per stage: take the one of the chosen (highest) stage
  const duration =
    DURATION.exec(lineOf(bonus.quote)) ?? DURATION.exec(text.slice(trigger.match.index));
  if (!duration)
    return {
      rule: superCast ? 4 : 3,
      kind: "missingDuration",
      reason: `${superCast ? "Buff" : "Kill-Buff"} ohne Dauer im Text („${trigger.match[0]}“)`,
      check,
    };
  const seconds = Number(duration[1]);
  if (superCast)
    return {
      rule: 4,
      kind: "triggered",
      reason: `ab jedem Super-Cast: +${bonus.percent} % auf ${target} für ${seconds} s („${trigger.match[0]}“ … „${duration[0]}“)`,
      check,
      part,
      durationMs: {
        value: seconds * MS_PER_SECOND,
        source: { ...source, note: `„${duration[0]}“ after „${trigger.match[0]}“ (ADR 0015, U6-1b)` },
      },
      trigger: { on: "cast", refresh: true, abilityKinds: ["super"] },
    };
  return {
    rule: 3,
    kind: "preBuilt",
    reason: `vorher aufgebaut: +${bonus.percent} % auf ${target} für ${seconds} s („${trigger.match[0]}“ … „${duration[0]}“)`,
    check,
    part,
    durationMs: {
      value: seconds * MS_PER_SECOND,
      source: { ...source, note: `„${duration[0]}“ after „${trigger.match[0]}“; prebuilt before the damage phase (ADR 0015)` },
    },
  };
}

/**
 * A super end the text names besides the Court rows, e.g. Eternal Warrior: "On Fists of Havoc End:
 * Grants x4 Arc Weapon Surge for 30 [6] seconds"; the value of x4 comes from the Court surge row.
 */
function textSuperEnd(
  entry: ExoticArmorEntry,
  text: string,
  inputs: ExoticEffectInputs,
): Verdict | undefined {
  const match = TEXT_SUPER_END.exec(text);
  const surge = entry.courtBuffs.find((b) => b.bucketId === "surge" && b.pve);
  if (!match || !surge) return undefined;
  const ability = abilityNamed(match[1], inputs.abilities);
  const percent = Math.max(...numbers(surge.pve!, "%"));
  const element = match[2].toLowerCase() as Element;
  const seconds = Number(match[3]);
  if (!ability)
    return {
      rule: 4,
      kind: "rotation",
      reason: `Super „${match[1]}“ nicht im Modell („${match[0]}“)`,
      check: "nur Text",
    };
  const source: Source = {
    ...inputs.sources.compendium,
    note: `„${match[0]}“; x4 surge value from Court (${flat(surge.pve!)}) (ADR 0015, U6-1b)`,
  };
  return {
    rule: 4,
    kind: "triggered",
    reason: `ab Ende von ${ability.name}: surge +${percent} % (${element}) für ${seconds} s („${match[0]}“)`,
    check: `Court x4 = ${percent} %`,
    part: {
      type: "multiplier",
      bucketId: "surge",
      multiplier: { value: factorOf(percent), source },
      damageSources: ["weapon"],
      elements: [element],
    },
    durationMs: { value: seconds * MS_PER_SECOND, source },
    trigger: { on: "superEnd", refresh: true, abilityIds: [ability.id] },
  };
}

export const GENERATES: string[] = [
  "always",
  "preBuilt",
  "triggered",
  "needsEffect",
  "hitStacks",
  "heldDraw",
];

/** Review rows of all damage buffs and the effects of those that are always active, prebuilt or triggered. */
export function exoticEffects(inputs: ExoticEffectInputs): {
  rows: ExoticEffectRow[];
  effects: ExoticArmorEffect[];
} {
  const rows: ExoticEffectRow[] = [];
  const effects: ExoticArmorEffect[] = [];
  for (const entry of inputs.armor.filter((e) => e.kind === "damageBuff")) {
    const text = [
      ...inputs.compendium.filter((c) => sameName(c.name, entry.name)).map((c) => c.text),
      ...inputs.clarity
        .filter((c) => c.itemName !== null && sameName(c.itemName, entry.name))
        .map((c) => c.text),
    ].join("\n");
    const valued = entry.courtBuffs.filter((b) => b.pve !== null && b.pve.trim() !== "");
    const verdicts =
      valued.length > 0
        ? valued.map((row) =>
            courtVerdict(row, entry.bonuses.map((b) => b.percent), text, inputs),
          )
        : [textVerdict(entry, text, inputs)];
    const superEnd = textSuperEnd(entry, text, inputs);
    if (superEnd) verdicts.push(superEnd);
    for (const { part, durationMs, trigger, ...verdict } of verdicts) {
      const row: ExoticEffectRow = { exoticArmorId: entry.id, name: entry.name, ...verdict };
      if (part && GENERATES.includes(verdict.kind)) {
        const count = effects.filter((e) => e.exoticArmorId === entry.id).length;
        const effect: Effect = {
          id: `exotic-armor:${entry.id}${count > 0 ? `-${count + 1}` : ""}`,
          name: entry.name,
          code: entry.hash, // not part of build links; the exotic itself is
          shortName: entry.name,
          providers: [{ kind: "armor", slot: "exotic" }],
          modifiers: part.type === "multiplier" ? withCaps(part, entry, inputs) : [part],
          ...(durationMs ? { durationMs } : {}),
          ...(trigger ? { trigger } : {}),
        };
        effects.push({
          exoticArmorId: entry.id,
          activation: verdict.kind === "preBuilt" ? "preBuilt" : "always",
          effect,
        });
        row.effectId = effect.id;
      }
      rows.push(row);
    }
  }
  keywordBonusEffects(inputs, rows, effects);
  return { rows, effects };
}

const IGNITION_BONUS =
  /\bIgnitions?\b[^.]*?\bdeals?\s+(\d+(?:\.\d+)?)%\s+increased damage/i;

/**
 * Bonus for the damage of a keyword from any source, e.g. Dawn Chorus: "Ignitions from any source
 * deal 100% increased damage". Always active; the piece is an ability variant too (Daybreak), so
 * it is not among the damage buffs.
 */
function keywordBonusEffects(
  inputs: ExoticEffectInputs,
  rows: ExoticEffectRow[],
  effects: ExoticArmorEffect[],
) {
  for (const entry of inputs.armor) {
    if (entry.kind === "damageBuff" || entry.bonuses.length === 0) continue;
    const found = [
      ...inputs.compendium
        .filter((c) => sameName(c.name, entry.name))
        .map((c) => ({ text: c.text, source: inputs.sources.compendium })),
      ...inputs.clarity
        .filter((c) => c.itemName !== null && sameName(c.itemName, entry.name))
        .map((c) => ({ text: c.text, source: inputs.sources.clarity })),
    ]
      .map((t) => ({ ...t, match: IGNITION_BONUS.exec(t.text) }))
      .find((t) => t.match);
    const bucketId = entry.courtBuffs[0]?.bucketId;
    if (!found?.match || !bucketId) continue;
    const percent = Number(found.match[1]);
    const effect: Effect = {
      id: `exotic-armor:${entry.id}-ignition`,
      name: entry.name,
      code: entry.hash,
      shortName: entry.name,
      providers: [{ kind: "armor", slot: "exotic" }],
      modifiers: [
        {
          type: "multiplier",
          bucketId,
          multiplier: {
            value: factorOf(percent),
            source: { ...found.source, note: `„${flat(found.match[0])}“; bucket ${bucketId} (court)` },
          },
          damageSources: ["keyword"],
          keywordIds: ["ignition"],
        },
      ],
    };
    effects.push({ exoticArmorId: entry.id, activation: "always", effect });
    rows.push({
      exoticArmorId: entry.id,
      name: entry.name,
      rule: 6,
      kind: "always",
      reason: `immer aktiv: +${percent} % auf Ignitions aus jeder Quelle („${flat(found.match[0])}“)`,
      check: `${found.source.name}`,
      effectId: effect.id,
    });
  }
}

const KIND_TITLES: [ExoticEffectKind, string][] = [
  ["always", "Immer aktiv (Regel 6)"],
  ["preBuilt", "Vorher aufgebaut, Option (Regel 3)"],
  ["missingDuration", "Kill-Buff ohne Dauer (Regel 3)"],
  ["triggered", "Fenster aus der Rotation (Regel 4)"],
  ["rotation", "Auslöser in der Rotation, offen (Regel 4)"],
  ["classAbility", "Auslöser Class Ability, U7 (Regel 4)"],
  ["needsEffect", "Gilt mit einem Zustand, z. B. Amplified (Regel 5)"],
  ["abilityGap", "Ability nicht im Modell (Regel 6)"],
  ["hitStacks", "Stapel pro Waffentreffer (Regel 7)"],
  ["heldDraw", "Bonus durch Halten (Regel 7)"],
  ["notAgainstBoss", "Wirkt nicht gegen einen Boss (Regel 1)"],
  ["ownDamage", "Eigener Schaden, später (Regel 2)"],
  ["noText", "Lücke (Regel 8)"],
  ["gap", "Lücke, Zustand unklar (Regel 5)"],
];

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Review table docs/exotic-effects.md (ADR 0015, U6-1). */
export function renderExoticEffects(rows: ExoticEffectRow[]): string {
  const lines = [
    "# Prüftabelle Exotic-Effekte",
    "",
    "Erzeugt von `npm run build:armor` (ADR 0015, U6-1), nicht von Hand bearbeiten.",
    "Quellen: Court's Stacking Guide, Compendium „Exotic Armors“, Clarity. Ein Boss, keine Adds; Stufen zählen mit dem höchsten Wert (optimal gespielt).",
    "Gegenprobe: Court-Wert gegen die Werte aus Compendium und Clarity.",
    "",
    "| Art | Zeilen |",
    "| --- | --- |",
    ...KIND_TITLES.map(
      ([kind, title]) => `| ${title} | ${rows.filter((r) => r.kind === kind).length} |`,
    ),
  ];
  for (const [kind, title] of KIND_TITLES) {
    const own = rows.filter((r) => r.kind === kind);
    if (own.length === 0) continue;
    lines.push(
      "",
      `## ${title}`,
      "",
      "| Exotic | Regel | Grund | Gegenprobe |",
      "| --- | --- | --- | --- |",
      ...own.map(
        (r) => `| ${cell(r.name)} | ${r.rule} | ${cell(r.reason)} | ${cell(r.check)} |`,
      ),
    );
  }
  return lines.join("\n") + "\n";
}
