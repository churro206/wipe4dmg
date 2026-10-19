// Data schema for all Data Files.
// Terms follow docs/glossary (Damage Instance, Bucket, Build, ...).
// Rule: an unknown value is `null` with status "missing". We never guess values.

import { z } from "zod";

/** Where a value comes from and how reliable it is. */
export const Source = z.object({
  name: z.string(), // e.g. "Clarity via light.gg"
  url: z.string().url().optional(),
  retrieved: z.string(), // ISO date, e.g. "2026-10-18"
  status: z.enum([
    "verified", // confirmed by a reliable, current source
    "unverified", // found, but old or secondary source
    "measured", // our own Shooting Range measurement
    "missing", // still unknown; value is null
  ]),
  note: z.string().optional(),
});
export type Source = z.infer<typeof Source>;

/** A number together with its source. */
export const SourcedNumber = z.object({
  value: z.number().nullable(),
  source: Source,
});
export type SourcedNumber = z.infer<typeof SourcedNumber>;

/** Stacking rule of a Bucket. */
export const StackingRule = z.enum([
  "highest", // only the highest multiplier in the bucket applies
  "multiplicative", // all multipliers in the bucket multiply
  "additive", // multipliers add up: 1 + (m1 - 1) + (m2 - 1)
]);

export const Bucket = z.object({
  id: z.string(), // e.g. "empowering", "debuff", "surge", "weaponPerk"
  name: z.string(),
  stacking: StackingRule,
  source: Source,
});
export type Bucket = z.infer<typeof Bucket>;

/** One hit (or a series of ticks) caused by a single shot. */
export const DamageInstance = z.object({
  id: z.string(), // e.g. "beam", "explosion", "takenSeeker"
  name: z.string(),
  delayMs: SourcedNumber, // time from shot release to the first hit
  damagePerTick: SourcedNumber, // damage of one tick against the reference target
  ticks: SourcedNumber, // number of ticks; 1 for a single hit
  tickIntervalMs: SourcedNumber, // 0 for a single hit
  canPrecision: z.boolean(),
  requiresCatalyst: z.boolean(),
});
export type DamageInstance = z.infer<typeof DamageInstance>;

export const Element = z.enum([
  "kinetic",
  "arc",
  "solar",
  "void",
  "stasis",
  "strand",
]);
export type Element = z.infer<typeof Element>;

export const WeaponType = z.enum([
  "autoRifle",
  "bow",
  "fusionRifle",
  "glaive",
  "grenadeLauncher",
  "handCannon",
  "linearFusionRifle",
  "machineGun",
  "pulseRifle",
  "rocketLauncher",
  "scoutRifle",
  "shotgun",
  "sidearm",
  "submachineGun",
  "sniperRifle",
  "sword",
  "traceRifle",
]);
export type WeaponType = z.infer<typeof WeaponType>;

/** Tables of the Bungie Destiny 2 manifest that hold the icons we use (ADR 0008). */
export const ManifestTable = z.enum([
  "DestinyInventoryItemDefinition",
  "DestinySandboxPerkDefinition",
  "DestinyTraitDefinition",
  "DestinyStatDefinition",
  "DestinyDamageTypeDefinition",
]);
export type ManifestTable = z.infer<typeof ManifestTable>;

/** An entry of the Bungie manifest, e.g. the item of a super or a keyword trait. */
export const ManifestRef = z.object({
  table: ManifestTable,
  hash: z.number().int().nonnegative(),
});
export type ManifestRef = z.infer<typeof ManifestRef>;

/** Icon of something that is not an effect or weapon, e.g. a subclass or a kind of damage. */
export const IconRef = z.object({
  key: z.string(), // e.g. "subclass:warlock:solar", "damage:ignition"
  manifestRef: ManifestRef,
});
export type IconRef = z.infer<typeof IconRef>;

/** Written by the icon import: icon file per key, with the manifest version as source. */
export const IconIndex = z.object({
  manifestVersion: z.string(),
  retrieved: z.string(),
  icons: z.record(z.string(), z.string()), // key -> path below public/, e.g. icons/item-1.png
});
export type IconIndex = z.infer<typeof IconIndex>;

/** Counters on the target or the player (ADR 0006). */
export const CounterId = z.enum(["scorch"]);
export type CounterId = z.infer<typeof CounterId>;

/** Part that adds stacks to a counter, here a number of applications after each shot (ADR 0006). */
export const CounterPart = z.object({
  type: z.literal("counter"),
  counterId: CounterId,
  trigger: z.literal("shot"),
  stacks: SourcedNumber, // stacks per application
  applicationsPerTrigger: SourcedNumber,
  firstDelayMs: SourcedNumber, // from the shot to the first application
  intervalMs: SourcedNumber, // between two applications
});
export type CounterPart = z.infer<typeof CounterPart>;

/** Part that creates a damage instance when a counter reaches a threshold, then resets it (ADR 0006). */
export const ThresholdPart = z.object({
  type: z.literal("threshold"),
  counterId: CounterId,
  threshold: SourcedNumber,
  cooldownMs: SourcedNumber, // after the threshold no stacks can be applied
  damageInstanceId: z.string(), // e.g. "ignition"
  damage: SourcedNumber,
  element: Element,
});
export type ThresholdPart = z.infer<typeof ThresholdPart>;

/**
 * Part that releases a damage over time source after each shot, e.g. the Taken Seekers of the
 * One Thousand Voices catalyst: one impact, then ticks (ADR 0006, category Damage over Time).
 */
export const DamageOverTimePart = z.object({
  type: z.literal("damageOverTime"),
  id: z.string(), // damage instance id, e.g. "takenSeeker"
  requiresCatalyst: z.boolean(),
  trigger: z.literal("shot"),
  applicationsPerTrigger: SourcedNumber, // sources released per shot
  firstDelayMs: SourcedNumber, // from the shot to the first release
  intervalMs: SourcedNumber, // between two releases
  impactDamage: SourcedNumber,
  tickDamage: SourcedNumber,
  ticks: SourcedNumber,
  tickIntervalMs: SourcedNumber,
  firstTickDelayMs: SourcedNumber, // from the impact to the first tick
  maxActivePerTarget: SourcedNumber, // further releases are lost while this many are active
});
export type DamageOverTimePart = z.infer<typeof DamageOverTimePart>;

/** Fixed parts of a weapon that work without any selected effect, e.g. scorch from explosions. */
export const IntrinsicPart = z.discriminatedUnion("type", [
  CounterPart,
  ThresholdPart,
  DamageOverTimePart,
]);
export type IntrinsicPart = z.infer<typeof IntrinsicPart>;

export const Weapon = z.object({
  id: z.string(),
  code: z.number().int().positive(), // short code for build links; never reused
  name: z.string(),
  manifestHash: z.number().int(),
  gameVersion: z.string(), // game version the data refers to, e.g. "9.7.0.5"
  weaponType: WeaponType,
  element: Element,
  ammo: z.enum(["primary", "special", "heavy"]),
  chargeTimeMs: SourcedNumber, // time from the start of the damage phase to the first shot
  fireRateRpm: SourcedNumber, // shots per minute within a magazine; for charged weapons the full cycle
  magazine: SourcedNumber,
  totalShots: SourcedNumber, // magazine plus reserves
  reloadTimeMs: SourcedNumber, // extra time after the last shot of a magazine, on top of the shot interval
  damageInstances: z.array(DamageInstance).min(1),
  intrinsicParts: z.array(IntrinsicPart),
  intrinsics: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      source: Source,
    }),
  ),
});
export type Weapon = z.infer<typeof Weapon>;

/** What creates a damage instance. */
export const DamageSource = z.enum(["weapon", "grenade", "melee", "super"]);
export type DamageSource = z.infer<typeof DamageSource>;

/** Effect part that multiplies damage (ADR 0006). */
export const MultiplierPart = z.object({
  type: z.literal("multiplier"),
  bucketId: z.string(), // reference to Bucket.id
  multiplier: SourcedNumber, // e.g. 1.25
  damageSources: z.array(DamageSource).min(1),
  elements: z.array(Element).optional(), // omitted: all elements
  weaponTypes: z.array(WeaponType).optional(), // omitted: all weapon types
});
export type MultiplierPart = z.infer<typeof MultiplierPart>;

/** Effect part that scales the stacks of every application to a counter, rounded up. */
export const CounterModifierPart = z.object({
  type: z.literal("counterModifier"),
  counterId: CounterId,
  factor: SourcedNumber, // e.g. 1.5 for +50%
});
export type CounterModifierPart = z.infer<typeof CounterModifierPart>;

/** Effect part that changes the shot plan instead of damage (ADR 0006). */
export const TimingPart = z.object({
  type: z.literal("timing"),
  change: z.enum(["noReload"]),
  weaponTypes: z.array(WeaponType).optional(), // omitted: all weapon types
  source: Source,
});
export type TimingPart = z.infer<typeof TimingPart>;

export const EffectPart = z.discriminatedUnion("type", [
  MultiplierPart,
  TimingPart,
  CounterModifierPart,
]);
export type EffectPart = z.infer<typeof EffectPart>;

export const GuardianClass = z.enum(["titan", "hunter", "warlock"]);

/** Subclass of a build: one element, or Prismatic. */
export const Subclass = z.enum([
  "arc",
  "solar",
  "void",
  "stasis",
  "strand",
  "prismatic",
]);
export type Subclass = z.infer<typeof Subclass>;
export type GuardianClass = z.infer<typeof GuardianClass>;

/** Way a build gets an effect: itself (subclass, armor, artifact) or from a teammate. */
export const ProviderKind = z.enum([
  "subclass",
  "armor",
  "artifact",
  "fireteamSupport",
]);
export type ProviderKind = z.infer<typeof ProviderKind>;

export const Provider = z.object({
  kind: ProviderKind,
  classes: z.array(GuardianClass).optional(), // omitted: every class
  subclasses: z.array(Subclass).optional(), // only for kind subclass; omitted: every subclass
});
export type Provider = z.infer<typeof Provider>;

/**
 * Anything a build can switch on or off that changes damage or timing (ADR 0006).
 * Active in a window: start and duration (ADR 0006, stage B).
 */
export const Effect = z.object({
  id: z.string(),
  name: z.string(),
  code: z.number().int().positive(), // short code for build links; never reused
  shortName: z.string(), // for tight spaces, e.g. the optimizer ranking
  manifestRef: ManifestRef.optional(), // icon source in the Bungie manifest (ADR 0008)
  providers: z.array(Provider).min(1),
  // A build provides at most one effect of a group itself, e.g. one surge level or one super.
  // Effects from teammates are not limited by groups.
  exclusiveGroup: z.string().optional(),
  parts: z.array(EffectPart).min(1),
  // Duration after its start; omitted if the effect lasts the whole damage phase or the duration
  // depends on the source (e.g. Radiant, tethers). The rotation can override start and duration.
  durationMs: SourcedNumber.optional(),
  // Effect ids whose multiplier parts in the same buckets are ignored while this effect is active,
  // regardless of value, e.g. Divinity over Particle Reconstruction.
  overrides: z.array(z.string()).optional(),
});
export type Effect = z.infer<typeof Effect>;

/** Damage source of an ability; the weapon is not an ability. */
export const AbilityKind = z.enum(["super", "grenade", "melee"]);
export type AbilityKind = z.infer<typeof AbilityKind>;

/** Part of an ability that creates damage instances after each cast, e.g. impact or explosion (ADR 0009). */
export const AbilityComponent = z.object({
  id: z.string(), // e.g. "impact", "explosion", "ignition"
  name: z.string(),
  delayMs: SourcedNumber, // time from the cast to the first hit
  damagePerTick: SourcedNumber, // base damage without multipliers, Compendium scale
  ticks: SourcedNumber, // number of ticks; 1 for a single hit
  tickIntervalMs: SourcedNumber, // 0 for a single hit
  // Whether the ability stat (super, grenade or melee) scales this part; keyword damage often does not.
  scalesWithAbilityStat: z.boolean(),
  // Effects already inside the value, e.g. Radiant in an Aegis package; never applied again here.
  includedEffectIds: z.array(z.string()).optional(),
});
export type AbilityComponent = z.infer<typeof AbilityComponent>;

/**
 * How long a super keeps the player busy, i.e. its super window (ADR 0009). The player uses the
 * super as fast as possible. Missing values make the window an estimate: 0 for an unknown cast
 * animation, the base duration as upper bound otherwise.
 */
export const SuperUsage = z.discriminatedUnion("type", [
  // Cast and done, e.g. Nova Bomb or Well of Radiance; its effects keep working afterwards.
  z.object({ type: z.literal("cast"), castMs: SourcedNumber }),
  // A fixed number of shots, e.g. Golden Gun; ends with the last shot.
  z.object({
    type: z.literal("shots"),
    shots: SourcedNumber,
    shotIntervalMs: SourcedNumber,
    baseDurationMs: SourcedNumber,
  }),
  // Energy drains per second and per attack, e.g. Hammer of Sol; ends when the energy is empty.
  z.object({
    type: z.literal("drain"),
    baseDurationMs: SourcedNumber, // without attacks
    drainPerAttack: SourcedNumber, // share of the full energy, e.g. 0.12
    attackIntervalMs: SourcedNumber, // shortest time between two attacks
  }),
]);
export type SuperUsage = z.infer<typeof SuperUsage>;

const AbilityFields = z.object({
  id: z.string(),
  code: z.number().int().positive(), // short code for build links; never reused
  name: z.string(),
  kind: AbilityKind,
  element: Element,
  providers: z.array(Provider).min(1), // classes and subclasses that have the ability
  usage: SuperUsage.optional(), // supers only; omitted: the super does not block the weapon
  // Effects the ability applies on its first cast, e.g. the tether of Moebius Quiver.
  grantsEffectIds: z.array(z.string()).optional(),
  // Aegis row (aegis-abilities.json) the ability is checked against without effects; for a
  // package also the source of its value.
  aegisRowId: z.string().optional(),
  // True if the value comes from the Aegis row as one package instead of own components.
  package: z.literal(true).optional(),
  // Compendium entry that describes the ability; the source of quotes and of the coverage list.
  compendium: z.object({ tab: z.string(), entry: z.string() }).optional(),
  // Empty only for supers that just grant effects, e.g. Ward of Dawn.
  components: z.array(AbilityComponent),
});
const usageOnlyForSupers = (ability: {
  kind: AbilityKind;
  usage?: SuperUsage;
}) => ability.kind === "super" || !ability.usage;
const usageOnlyForSupersError = {
  message: "usage is only allowed for supers",
  path: ["usage"],
};
const damageOrGrants = (ability: {
  components?: unknown[];
  package?: true;
  grantsEffectIds?: string[];
}) =>
  (ability.components?.length ?? 0) > 0 ||
  ability.package === true ||
  (ability.grantsEffectIds?.length ?? 0) > 0;
const damageOrGrantsError = {
  message: "an ability needs components, a package or granted effects",
  path: ["components"],
};

/** Grenade, melee or super of a subclass with its ability components (ADR 0009). */
export const Ability = AbilityFields.refine(
  usageOnlyForSupers,
  usageOnlyForSupersError,
).refine(damageOrGrants, damageOrGrantsError);
export type Ability = z.infer<typeof Ability>;

/**
 * An ability as written in abilities.json: either its own components (values from the Compendium)
 * or a package, i.e. the measured value per use of one Aegis row (ADR 0009, fallback).
 */
export const AbilityData = AbilityFields.extend({
  components: z.array(AbilityComponent).optional(),
})
  .refine(usageOnlyForSupers, usageOnlyForSupersError)
  .refine(damageOrGrants, damageOrGrantsError)
  .refine((ability) => !(ability.components && ability.package), {
    message: "an ability has either components or a package",
  })
  .refine((ability) => !ability.package || ability.aegisRowId, {
    message: "a package needs an aegisRowId",
    path: ["aegisRowId"],
  });
export type AbilityData = z.infer<typeof AbilityData>;

/**
 * How the super, grenade or melee stat scales the damage of its abilities: a fixed bonus per point
 * above a stat, e.g. +0.45% super damage per point above 100 (Compendium, Game Mechanics).
 */
export const AbilityStatScaling = z.object({
  kind: AbilityKind,
  bucketId: z.string(), // bucket of the stat multiplier, e.g. "abilityStat"
  bonusFromStat: z.number().nonnegative(), // the damage bonus starts above this stat, e.g. 100
  maxStat: z.number().positive(), // highest stat, e.g. 200
  damagePerPoint: SourcedNumber, // e.g. 0.0045 for +0.45% per point
});
export type AbilityStatScaling = z.infer<typeof AbilityStatScaling>;

/** Community or own reference value for tests. */
export const ReferenceValue = z.object({
  id: z.string(),
  description: z.string(),
  totalDamageMin: z.number(),
  totalDamageMax: z.number(),
  conditions: z.array(z.string()),
  // Machine-readable conditions for the gate test; omitted if the conditions are unclear.
  scenario: z
    .object({
      effectIds: z.array(z.string()),
      damagePhaseSeconds: z.number().nonnegative(),
      withIntrinsicParts: z.boolean(), // false: shots only, e.g. "without ignition"
    })
    .optional(),
  source: Source,
});
export type ReferenceValue = z.infer<typeof ReferenceValue>;

/** Combined multiplier of a set of effects on the weapon's own damage, from a source. */
export const ReferenceMultiplier = z.object({
  id: z.string(),
  description: z.string(),
  effectIds: z.array(z.string()).min(1),
  multiplierMin: z.number(),
  multiplierMax: z.number(),
  source: Source,
});
export type ReferenceMultiplier = z.infer<typeof ReferenceMultiplier>;

/** Input of the Simulator. Serialized into the URL for sharing (src/engine/buildLink.ts). */
export const Build = z.object({
  weaponId: z.string(),
  guardianClass: GuardianClass,
  subclass: Subclass,
  catalyst: z.boolean(),
  // Selected effects with their provider; the same effect may come from two providers.
  selections: z.array(
    z.object({ effectId: z.string(), provider: ProviderKind }),
  ),
  // Rotation: start and duration per effect id; without duration until the end of the phase.
  effectWindows: z.record(
    z.string(),
    z.object({
      startMs: z.number().nonnegative(),
      durationMs: z.number().nonnegative().optional(),
    }),
  ),
  damagePhaseSeconds: z.number().nonnegative(),
});
export type Build = z.infer<typeof Build>;

/** Known boss with the length of one damage phase; source for the quick select. */
export const Boss = z.object({
  id: z.string(), // kebab-case from activity and name, e.g. "last-wish-kalli"
  activity: z.string(),
  name: z.string(),
  damagePhaseSeconds: SourcedNumber, // null with status "missing" if the source has no number
  description: z.string(), // what the phase covers, e.g. "30s middle damage"; may be empty
});
export type Boss = z.infer<typeof Boss>;

/** Category of a row in the Aegis tab "Abilties"; "miscellaneous" mixes keyword damage, aspects and exotics. */
export const AegisAbilityCategory = z.enum([
  "super",
  "grenade",
  "melee",
  "miscellaneous",
]);
export type AegisAbilityCategory = z.infer<typeof AegisAbilityCategory>;

/**
 * One measured scenario from the Aegis tab "Abilties" (ADR 0009): damage per use of an ability
 * without Aegis' standard multipliers ("visual Value"). Reference for the ability gate and the
 * fallback package of an ability.
 */
export const AegisAbilityRow = z.object({
  id: z.string(), // kebab-case from category, name and assumptions
  category: AegisAbilityCategory,
  name: z.string(), // e.g. "Golden Gun - Marksman"
  assumptions: z.array(z.string()), // e.g. ["Knock Em Down", "Feast of Light x6"]
  // Modelled effects that Aegis measured inside the value; the engine must not apply them again.
  includedEffectIds: z.array(z.string()),
  primaryTick: z.string(), // tick columns as text, e.g. "916"; for cross-checks only
  secondaryTicks: z.string(), // e.g. "15 impact, 1592 ignition"
  perUseStat100: SourcedNumber,
  perUseStat200: SourcedNumber,
  gameVersion: z.string(),
});
export type AegisAbilityRow = z.infer<typeof AegisAbilityRow>;

/** One row of a Compendium subclass tab as plain text, e.g. the super "Thundercrash" (ADR 0009). */
export const CompendiumEntry = z.object({
  tab: z.string(), // e.g. "Arc"
  section: z.string(), // title above the row, e.g. "Super Abilities" or "Aspect"
  name: z.string(),
  text: z.string(), // description with line breaks
  extra: z.string(), // further cells, e.g. "Tier 2 Super\n\n556 seconds."
});
export type CompendiumEntry = z.infer<typeof CompendiumEntry>;

/** Snapshot of the Compendium texts; quoted values in other Data Files are checked against it. */
export const CompendiumSnapshot = z.object({
  source: Source,
  entries: z.array(CompendiumEntry),
});
export type CompendiumSnapshot = z.infer<typeof CompendiumSnapshot>;
