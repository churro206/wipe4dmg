// Kinds of the assumptions in the Aegis weapon rows (ADR 0013, point 3), found automatically by a
// chain of rules, and the links between weapons, exotic armor and abilities (point 4).

import type {
  AbilityKind,
  ClarityEntry,
  CompendiumEntry,
  Effect,
  ManifestArmorPiece,
  ManifestTerms,
  ManifestWeapon,
  WeaponType,
} from "../../src/data/schema.ts";
import { assumptionName } from "./aegisWeapons.ts";

export type AssumptionKind =
  | "execution" // how Aegis fired, or what the value includes or excludes
  | "intrinsic"
  | "catalyst"
  | "perk"
  | "weaponMod"
  | "effect" // a modelled effect inside the value
  | "exoticArmor"
  | "artifactPerk"
  | "foreignPerk" // a perk of another weapon
  | "notModelled";

export type AssumptionClass = {
  kind: AssumptionKind;
  stage: 1 | 2 | 3 | 4 | 5; // rule that decided, see ADR 0013, point 3
  similarTo?: string; // stage 1: name in the manifest with a slightly different spelling
  effectId?: string; // kind "effect"
  armorName?: string; // kind "exoticArmor"
};

export type AssumptionContext = {
  weapon: ManifestWeapon;
  effects: { id: string; name: string }[];
  armor: ManifestArmorPiece[];
  terms: ManifestTerms["terms"];
  // Clarity names the catalyst perks of a weapon, e.g. Whispered Breathing (not in the manifest).
  clarity?: ClarityEntry[];
};

const CATALYST_TYPE = "Weapon Catalyst Exotic";

/** Names of the catalyst entries Clarity lists for a weapon, e.g. ["Whisper Catalyst", "Whispered Breathing"]. */
export const clarityCatalysts = (
  weaponName: string,
  clarity: ClarityEntry[] = [],
): ClarityEntry[] =>
  clarity.filter((e) => e.itemName === weaponName && e.type === CATALYST_TYPE);

const MAX_SPELLING_DISTANCE = 2;
const MIN_LENGTH_FOR_SPELLING = 8; // short names differ too easily

// Stage 3: how Aegis fired, or what the value includes or excludes. Patterns, not names.
const EXECUTION: RegExp[] = [
  /^(average|light|heavy|body|burst|volley|loaded|charged|uncharged|hitscan|hip-?fire|ads|aerial|direct impact|full mag|single mag|first mag|max height|per trap|double stick|single projectile|all three shots|both modes|power cycling|successive shots|standard target model|ground pool|no initial trace|no stacks|double hit throw|base|grounded|airborne)$/i,
  /^\d+-burst$/i, // fire modes, e.g. Revision Zero "4-burst"
  /^(point blank|undamaged|one ring)$/i, // distance or state while firing
  /^\d+ stacks$/i, // stacks of the own intrinsic, built up as in "pre-stacked"
  /\bcharged?\b/i, // "1/3 charge", "fully charged"
  /^projectile\b/i,
  /^\d+ (impact|shots?|bursts?)$/i,
  /^(\d+[LHR])+$/i, // light, heavy and reload sequences, e.g. "3L1H1R"
  /[HL]{6,}/, // long sword combos, e.g. "Nano-Assault HLLHLLHLLHLLH"
  /^(with|without|includes?|excludes?|pre-stacked)\b/i,
  /\b(excluded|included)$/i,
  /\b(mode|modes|duration)$/i,
  /\b(loaded|ready)$/i, // states of the weapon, e.g. "Missile Loaded"
  /^(\d+[LHR])+ combo$/i, // "1H2L combo"
  /^(heavy|light) (attacks|spam)$/i,
  /^(held down|precision|simulated|spaced\*?)$/i,
  /^(average|assumes?|starts? at|hone before)\b/i, // "average across both shots", "assumes max frenzy"
  /\b(height|uptime|consistency|when available)$/i, // "max projectile height", "volleys when available"
  /\bboss (model|against wall)$/i, // "typical boss model"
  /^\d+ ammo consumed$/i,
  /^(one|two|three|\d+) kills?$/i,
];
const INCLUDES = /\binclude[sd]?\b/i;
const ARMOR_ITEM_TYPES =
  /^(Helmet|Gauntlets|Chest Armor|Leg Armor|Titan Mark|Warlock Bond|Hunter Cloak)$/;

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Edit distance between two strings (insert, delete, replace). */
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** Stage 1: the sockets of the weapon, exact first, then with a slightly different spelling. */
function fromSockets(
  name: string,
  weapon: ManifestWeapon,
  clarity?: ClarityEntry[],
): AssumptionClass | null {
  if (/^catalyst$/i.test(name)) return { kind: "catalyst", stage: 1 };
  const lists: [AssumptionKind, string[]][] = [
    ["intrinsic", weapon.intrinsics],
    [
      "catalyst",
      [
        ...(weapon.catalyst?.perks ?? []),
        ...clarityCatalysts(weapon.name, clarity).map((e) => e.name),
      ],
    ],
    // A perk of another weapon slotted as a refit is named "<perk> Refit" (Barrow-Dyad: "Target Lock Refit").
    ["perk", weapon.perks.flatMap((p) => [p, p.replace(/ Refit$/, "")])],
    ["weaponMod", weapon.mods],
  ];
  const key = normalize(name);
  for (const [kind, names] of lists) {
    if (names.some((n) => normalize(n) === key)) return { kind, stage: 1 };
  }
  if (key.length < MIN_LENGTH_FOR_SPELLING) return null;
  for (const [kind, names] of lists) {
    const similar = names.find(
      (n) => distance(normalize(n), key) <= MAX_SPELLING_DISTANCE,
    );
    if (similar) return { kind, stage: 1, similarTo: similar };
  }
  return null;
}

/** Stage 2: a modelled effect by name, or "... include(s) <effect>". */
function fromEffects(
  name: string,
  effects: AssumptionContext["effects"],
): AssumptionClass | null {
  const key = normalize(name);
  const exact = effects.find((e) => normalize(e.name) === key);
  if (exact) return { kind: "effect", stage: 2, effectId: exact.id };
  if (!INCLUDES.test(name)) return null;
  const named = effects.find((e) =>
    new RegExp(
      `\\b${e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    ).test(name),
  );
  return named ? { kind: "effect", stage: 2, effectId: named.id } : null;
}

/** Stage 4: what the whole manifest says about the name. */
function fromManifest(
  name: string,
  { armor, terms }: AssumptionContext,
): AssumptionClass | null {
  const key = normalize(name);
  const piece = armor.find(
    (a) =>
      normalize(a.name) === key ||
      a.intrinsics.some((i) => normalize(i) === key),
  );
  if (piece) return { kind: "exoticArmor", stage: 4, armorName: piece.name };
  const matches =
    Object.entries(terms).find(([term]) => normalize(term) === key)?.[1] ?? [];
  if (matches.some((m) => ARMOR_ITEM_TYPES.test(m.itemType)))
    return { kind: "exoticArmor", stage: 4, armorName: name };
  if (matches.some((m) => m.itemType === "Artifact Perk"))
    return { kind: "artifactPerk", stage: 4 };
  if (matches.some((m) => m.itemType === "Weapon Mod"))
    return { kind: "weaponMod", stage: 4 };
  if (matches.some((m) => m.plugCategory !== ""))
    return { kind: "foreignPerk", stage: 4 };
  return null;
}

/** Kind of one assumption of an Aegis row of this weapon; the first stage with a match decides. */
export function classifyAssumption(
  assumption: string,
  context: AssumptionContext,
): AssumptionClass {
  const name = assumptionName(assumption);
  return (
    fromSockets(name, context.weapon, context.clarity) ??
    fromEffects(name, context.effects) ??
    (EXECUTION.some((pattern) => pattern.test(name))
      ? { kind: "execution", stage: 3 }
      : null) ??
    fromManifest(name, context) ?? { kind: "notModelled", stage: 5 }
  );
}

// How the texts of armor perks name weapon types.
const WEAPON_TYPE_WORDS: Record<WeaponType, RegExp> = {
  autoRifle: /\bauto rifles?\b/i,
  bow: /\bbows?\b/i,
  fusionRifle: /(?<!linear )\bfusion rifles?\b/i,
  glaive: /\bglaives?\b/i,
  grenadeLauncher: /\bgrenade launchers?\b/i,
  handCannon: /\bhand cannons?\b/i,
  linearFusionRifle: /\blinear fusion rifles?\b/i,
  machineGun: /\bmachine guns?\b/i,
  pulseRifle: /\bpulse rifles?\b/i,
  rocketLauncher: /\brocket launchers?\b/i,
  scoutRifle: /\bscout rifles?\b/i,
  shotgun: /\bshotguns?\b/i,
  sidearm: /\bsidearms?\b/i,
  submachineGun: /\b(submachine guns?|SMGs?)\b/i,
  sniperRifle: /\bsniper rifles?\b/i,
  sword: /\bswords?\b/i,
  traceRifle: /\btrace rifles?\b/i,
};

/** Exotic armor whose intrinsic text names the weapon type, e.g. Lucky Pants for hand cannons. */
export function armorForWeapon(
  weapon: ManifestWeapon,
  armor: ManifestArmorPiece[],
): string[] {
  const words = WEAPON_TYPE_WORDS[weapon.weaponType];
  return armor.filter((a) => words.test(a.description)).map((a) => a.name);
}

const ABILITY_WORDS: [AbilityKind | "classAbility", RegExp][] = [
  ["super", /\bsuper\b/i],
  ["grenade", /\bgrenades?\b/i],
  ["melee", /\bmelees?\b/i],
  ["classAbility", /\bclass abilit(y|ies)\b/i],
];

/** Ability kinds a text names, e.g. a weapon whose catalyst gives grenade energy. */
export function abilityKindsNamed(
  text: string,
): (AbilityKind | "classAbility")[] {
  return ABILITY_WORDS.filter(([, pattern]) => pattern.test(text))
    .map(([kind]) => kind)
    .sort();
}

// Words in a text that mean an assumption changes shots or time to empty (ADR 0013, point 15).
const TIMING_WORDS =
  /\b(reload\w*|ammo|ammunition|magazine|reserves?|fire rate|rate of fire|rounds per minute|rpm|charge time|charge rate|charges? faster|swap\w*|stow\w*|ready|readies|refill\w*|draw time)\b/i;

export type TimingSources = Omit<AssumptionContext, "effects" | "weapon"> & {
  compendium: CompendiumEntry[];
  effects: Effect[];
};

/** True if a text names ammo, reload, fire rate, charge or the like. */
export const changesTiming = (text: string): boolean => TIMING_WORDS.test(text);

/**
 * Whether an assumption changes shots or time to empty: "timing" if its text names ammo, reload,
 * fire rate and the like (or a modelled effect has a timing part), "neutral" if its texts say
 * nothing of that, "unknown" without any text.
 */
export function timingImpact(
  assumption: string,
  assumptionClass: AssumptionClass,
  { compendium, terms, armor, effects, clarity = [] }: TimingSources,
): "neutral" | "timing" | "unknown" {
  const name = assumptionName(assumption);
  const key = normalize(name);
  const effect = effects.find(
    (e) => e.id === assumptionClass.effectId || normalize(e.name) === key,
  );
  if (effect)
    return effect.parts.some((part) => part.type === "timing")
      ? "timing"
      : "neutral";
  const texts = [
    ...clarity.filter((e) => normalize(e.name) === key).map((e) => e.text),
    ...compendium
      .filter((e) => e.tab === "Weapon Perks" && normalize(e.name) === key)
      .map((e) => e.text),
    ...(
      Object.entries(terms).find(([term]) => normalize(term) === key)?.[1] ?? []
    ).map((m) => m.description),
    ...armor
      .filter(
        (a) =>
          normalize(a.name) === key ||
          a.intrinsics.some((i) => normalize(i) === key),
      )
      .map((a) => a.description),
  ].filter((text) => text.trim() !== "");
  if (texts.length === 0) return "unknown";
  return texts.some((text) => TIMING_WORDS.test(text)) ? "timing" : "neutral";
}
