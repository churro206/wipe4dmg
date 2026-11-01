// Types of the simulation: input options and the result of the core (ADR 0017, ADR 0018 I2).

import type {
  Ability,
  DamageSource,
  Delivery,
  Element,
  Keyword,
  KeywordId,
  StatusModifierData,
  WeaponType,
} from "../../data/schema";
import type { AbilityStatValue } from "../abilityStats";
import type { Factors } from "../effectParts";
import type { EffectWindowOptions } from "../effectWindows";
import type { WeaponStatValue } from "../weaponStats";

export type Shot = {
  timeMs: number;
};

export type TimedDamageInstance = {
  id: string; // DamageInstance id from the weapon, or "<ability id>.<component id>"
  timeMs: number;
  damage: number;
  damageSource: DamageSource;
  element: Element;
  abilityId?: string; // set for damage instances of an ability
  weaponType?: WeaponType; // set for damage instances of the weapon
  keywordId?: KeywordId; // set for keyword damage, e.g. ignition (ADR 0015, point 5)
  delivery?: Delivery; // impact, splash or dot, where the data names it
  // What scaled the damage: factor per bucket id, plus holdDraw and keywordBonus outside buckets
  factors: Factors;
};

/** An ability of the build and the times of its casts in the damage phase. */
export type AbilityCast = {
  ability: Ability;
  castsMs: number[];
  castMs?: number; // time each cast keeps the player busy (castTimes.ts); a super uses its window
};

export type { AbilityStatValue };

export type SimulationOptions = EffectWindowOptions & {
  catalyst?: boolean; // default: without catalyst
  abilities?: AbilityCast[]; // default: no abilities
  abilityStats?: AbilityStatValue[]; // default: no stat bonus
  weaponStat?: WeaponStatValue; // Weapons stat; default: no stat bonus
  keywords?: Keyword[]; // keywords.json; needed once a part applies a keyword
  statusModifiers?: StatusModifierData[]; // keywords.json: Weaken; its effect on the formula is B3b
  setupPreBuilt?: boolean; // the weapon's setup charges are built before the phase ("Pre-stacked")
  // The setup stands at the start of the phase, e.g. in an Aegis measurement without the deploying shot
  setupDeployed?: boolean;
  playstyle?: string; // Build.playstyle (playstyle.ts)
  shotLimit?: number; // the weapon fires at most this many shots, e.g. those of a measurement
};

/** Time in which a super keeps the player busy; exact is false if a value of the super is missing. */
export type SuperWindow = {
  abilityId: string;
  startMs: number;
  endMs: number;
  exact: boolean;
};

export type SimulationResult = {
  shots: Shot[];
  reloadsMs: number[]; // start of each full reload, i.e. the last shot of its magazine
  damageInstances: TimedDamageInstance[];
  superWindows: SuperWindow[];
  totalDamage: number;
  dps: number; // total damage per second of the damage phase; 0 for an empty damage phase
};
