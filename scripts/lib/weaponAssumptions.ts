// Kinds of the assumptions in the Aegis weapon rows (ADR 0013, point 3), found automatically by a
// chain of rules, and the links between weapons, exotic armor and abilities (point 4).

import type {
  AbilityKind,
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
};

const MAX_SPELLING_DISTANCE = 2;
const MIN_LENGTH_FOR_SPELLING = 8; // short names differ too easily

// Stage 3: how Aegis fired, or what the value includes or excludes. Patterns, not names.
const EXECUTION: RegExp[] = [
  /^(average|light|heavy|body|burst|volley|loaded|charged|uncharged|hitscan|hipfire|ads|aerial|direct impact|full mag|single mag|first mag|max height|per trap|double stick|single projectile|all three shots|both modes|power cycling|successive shots|standard target model|ground pool|no initial trace|no stacks|double hit throw)$/i,
  /\bcharged?\b/i, // "1/3 charge", "fully charged"
  /^projectile\b/i,
  /^\d+ (impact|shots?|bursts?)$/i,
  /^(\d+[LHR])+$/i, // light, heavy and reload sequences, e.g. "3L1H1R"
  /[HL]{6,}/, // long sword combos, e.g. "Nano-Assault HLLHLLHLLHLLH"
  /^(with|without|includes?|excludes?|pre-stacked)\b/i,
  /\b(excluded|included)$/i,
  /\b(mode|modes|duration)$/i,
  /\b(loaded|ready)$/i, // states of the weapon, e.g. "Missile Loaded"
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
): AssumptionClass | null {
  if (/^catalyst$/i.test(name)) return { kind: "catalyst", stage: 1 };
  const lists: [AssumptionKind, string[]][] = [
    ["intrinsic", weapon.intrinsics],
    ["catalyst", weapon.catalyst?.perks ?? []],
    ["perk", weapon.perks],
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
    fromSockets(name, context.weapon) ??
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
