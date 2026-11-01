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
    "fitted", // taken from a row of an Aegis measurement (I1); that row is the item's Eichung, no check
    "missing", // still unknown; value is null
  ]),
  row: z.string().optional(), // id of the Aegis row of a "fitted" value
  note: z.string().optional(),
  // Exact text the value was taken from; Compendium quotes are checked against its snapshot.
  quote: z.string().optional(),
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

/** How a hit reaches the target (ADR 0015, point 4); open where the sources do not name it. */
export const Delivery = z.enum(["impact", "splash", "dot"]);
export type Delivery = z.infer<typeof Delivery>;

/** Scale of a damage value: the source it was measured in (ADR 0015, point 7). */
export const DamageScale = z.enum(["aegisVisual", "quantum", "compendium"]);
export type DamageScale = z.infer<typeof DamageScale>;

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
  // Only every Nth shot of the weapon sets it off (the Nth, 2Nth, ...), e.g. the cluster of every
  // third rocket with Prototype Trueseeker
  everyNthShot: SourcedNumber.optional(),
  // A factor per tick (the length of `ticks`), e.g. the three Golden Gun shots x1, x1.45, x1.9
  tickFactors: z.array(SourcedNumber).optional(),
  delivery: Delivery.optional(),
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

/** Where a damage instance comes from; multiplier parts filter by it. */
export const DamageSource = z.enum([
  "weapon",
  "grenade",
  "melee",
  "super",
  "classAbility",
  "keyword", // e.g. ignition, jolt, volatile (ADR 0015, point 5)
]);
export type DamageSource = z.infer<typeof DamageSource>;

/** Damage source of an ability; the weapon is not an ability. */
export const AbilityKind = z.enum(["super", "grenade", "melee", "classAbility"]);
export type AbilityKind = z.infer<typeof AbilityKind>;

/**
 * Statuses on the target (the status container, architecture sections 6 and 8): one state machine
 * with its own values per status (status definitions, from keywords.json).
 */
export const TargetStatusId = z.enum([
  "scorch", // stacks up to a threshold, then ignition; burns meanwhile
  "volatile",
  "jolt",
  "unravel",
  "boltCharge", // stacks on the player, discharged by a hit
  "weaken", // debuff: a multiplier in the debuff bucket while it lasts
]);
export type TargetStatusId = z.infer<typeof TargetStatusId>;

/** Keywords with damage of their own that the engine models (ADR 0015, point 5). */
export const KeywordId = z.enum([
  "ignition",
  "jolt",
  "volatile",
  "unravel",
  "boltCharge",
]);
export type KeywordId = z.infer<typeof KeywordId>;

/** What sets a keyword off: stacks of a counter, damage the target takes, or player stacks. */
export const KeywordTrigger = z.discriminatedUnion("type", [
  // e.g. ignition at x100 scorch: the stacks are those of the keyword's own status
  z.object({
    type: z.literal("counter"),
    threshold: SourcedNumber,
  }),
  // e.g. jolt after the target took 115 damage; whether the hit that applies it counts
  z.object({
    type: z.literal("damageTaken"),
    threshold: SourcedNumber,
    applyingHitCounts: z.boolean(),
  }),
  // e.g. bolt charge at x10 stacks on the player, set off by an ability hit
  z.object({
    type: z.literal("playerStacks"),
    stacks: SourcedNumber,
    // hits that set it off: by damage source, or keyword damage of these keywords
    dischargedBy: z.object({
      damageSources: z.array(DamageSource),
      keywordIds: z.array(KeywordId),
      source: Source,
    }),
  }),
]);
export type KeywordTrigger = z.infer<typeof KeywordTrigger>;

/**
 * Burn of a counter's stacks (scorch): a target with stacks takes damage that grows with them. The
 * stacks hold for a while and then fall (ADR 0017, stage S2).
 */
export const CounterBurn = z.object({
  baseDamage: SourcedNumber, // per tick, before the stacks
  damagePerStack: SourcedNumber,
  firstTickDelayMs: SourcedNumber, // from the first stacks on a clean target
  secondTickDelayMs: SourcedNumber, // from the first tick
  tickIntervalMs: SourcedNumber, // from the second tick on
  holdMs: SourcedNumber, // the stacks stay as they are for this long after an application
  decayStackIntervalMs: SourcedNumber, // after the hold one stack falls this often
});
export type CounterBurn = z.infer<typeof CounterBurn>;

/** A keyword as written in keywords.json; the damage comes from its Aegis row when loading. */
export const KeywordData = z.object({
  id: KeywordId,
  status: TargetStatusId, // the status on the target that holds its state, e.g. scorch for ignition
  name: z.string(),
  element: Element,
  compendium: z.object({ tab: z.string(), entry: z.string() }), // source of the quotes
  aegisRowId: z.string(), // damage per trigger, Aegis visual scale
  trigger: KeywordTrigger,
  delayMs: SourcedNumber.optional(), // from the trigger to the damage; 0 if omitted
  cooldownMs: SourcedNumber.optional(), // between two triggers; none if omitted
  durationMs: SourcedNumber.optional(), // of the debuff; open if the source sets it (unravel)
  burn: CounterBurn.optional(), // only for a counter trigger: damage of the stacks before the trigger
  removedOnTrigger: z.boolean(), // the debuff or the stacks are gone after the trigger
  // Which multipliers apply: those of abilities (volatile), only element-wide ones (bolt charge),
  // or those of the source that applied it (ignition, without melee buffs).
  damageCategory: z.enum(["ability", "generic", "inheritsSource"]),
});
export type KeywordData = z.infer<typeof KeywordData>;

export const Keyword = KeywordData.extend({ damage: SourcedNumber });
export type Keyword = z.infer<typeof Keyword>;
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
  maxActivePerTarget: SourcedNumber, // further releases deal their impact, but no ticks
  // Factor from the value source's scale to the main source's scale (ADR 0011); 1 if omitted.
  sourceScale: SourcedNumber.optional(),
});
export type DamageOverTimePart = z.infer<typeof DamageOverTimePart>;

/**
 * Effect part that applies a keyword to the target with every matching hit, e.g. Volatile Rounds
 * (ADR 0015, point 1). The filters work like those of a multiplier part.
 */
export const AppliesKeywordPart = z.object({
  type: z.literal("appliesKeyword"),
  keywordId: KeywordId,
  damageSources: z.array(DamageSource).min(1),
  elements: z.array(Element).optional(),
  weaponTypes: z.array(WeaponType).optional(),
  abilityIds: z.array(z.string()).optional(),
  durationMs: SourcedNumber.optional(), // replaces the duration of the keyword, e.g. of Unravel
  // Only these damage instances apply it, e.g. "fusion-grenade.package"; omitted: all matching hits.
  damageInstanceIds: z.array(z.string()).optional(),
  stacks: SourcedNumber.optional(), // for keywords with stacks, e.g. x40 scorch or x4 bolt charge
  source: Source,
});
export type AppliesKeywordPart = z.infer<typeof AppliesKeywordPart>;

/**
 * Fixed parts of a weapon that work without any selected effect. The scorch of its explosions is
 * a rule of the weapon (`on hit → applyStatus`), not a part.
 */
export const IntrinsicPart = z.discriminatedUnion("type", [
  CounterPart,
  ThresholdPart,
  DamageOverTimePart,
]);
export type IntrinsicPart = z.infer<typeof IntrinsicPart>;

/**
 * A selectable catalyst, perk or mod of an imported weapon (ADR 0013, point 8): a factor on the
 * weapon's damage for the whole damage phase. Duration and condition from the Compendium tell
 * where that is too generous. A catalyst with a window (single cases by override, e.g. Truth's
 * Reaper's Tithe: 15 s from the first shot) has a buff of the weapon with the id of the option; the
 * engine then counts the factor in that buff only (Weapon.buffs, rules of the weapon).
 */
export const WeaponOption = z.object({
  id: z.string(),
  name: z.string(), // e.g. "Reaper's Tithe x4"
  kind: z.enum(["catalyst", "perk", "weaponMod"]),
  factor: SourcedNumber,
  bucketId: z.string(), // bucket of the factor, e.g. "weaponPerk"
  durationSeconds: z.number().positive().nullable(), // null: none found or permanent
  condition: z.string().nullable(), // text from the Compendium, e.g. "simultaneously killed enemies"
});
export type WeaponOption = z.infer<typeof WeaponOption>;

/** Shots, magazine and reload of a weapon with its catalyst; replaces the weapon's own timing. */
export const CatalystTiming = z.object({
  // Omitted: the weapon's own rate holds; a rule sets the catalyst's (e.g. once a Guidance Ring stands)
  fireRateRpm: SourcedNumber.optional(),
  magazine: SourcedNumber,
  totalShots: SourcedNumber, // null for primary ammo (unlimited)
  reloadTimeMs: SourcedNumber,
});
export type CatalystTiming = z.infer<typeof CatalystTiming>;

export const CatalystEffect = z.enum([
  "damage",
  "timing",
  "damageAndTiming",
  "none",
  "unknown",
]);
export type CatalystEffect = z.infer<typeof CatalystEffect>;

export const WeaponCatalyst = z.object({
  name: z.string(), // perk names, e.g. "Reaper's Tithe"
  description: z.string(), // Clarity text of the catalyst, one line per paragraph
  effect: CatalystEffect,
  timing: CatalystTiming.optional(),
});
export type WeaponCatalyst = z.infer<typeof WeaponCatalyst>;

/** Why an exotic weapon in scope is not imported (ADR 0013, point 10). */
export const WeaponGap = z.object({
  name: z.string(),
  reason: z.string(),
});
export type WeaponGap = z.infer<typeof WeaponGap>;

/** What creates a damage instance. */

/**
 * A state of the player that effects grant and parts require (ADR 0015, U6-2), e.g. Amplified from
 * Ascension for No Backup Plans. Without damage of its own.
 */
export const StatusId = z.enum([
  "amplified",
  "frostArmor",
  "roaringFlames",
  "wovenMail",
  "voidOvershield",
  "restoration",
]);
export type StatusId = z.infer<typeof StatusId>;

/** Effect part that multiplies damage (ADR 0006). */
export const MultiplierPart = z.object({
  type: z.literal("multiplier"),
  bucketId: z.string(), // reference to Bucket.id
  multiplier: SourcedNumber, // e.g. 1.25
  damageSources: z.array(DamageSource).min(1),
  elements: z.array(Element).optional(), // omitted: all elements
  weaponTypes: z.array(WeaponType).optional(), // omitted: all weapon types
  abilityIds: z.array(z.string()).optional(), // omitted: all abilities; set: only these abilities
  // Not these abilities, where the item has a lower cap for them, e.g. Feast of Light (Nova Bomb 50 %)
  excludeAbilityIds: z.array(z.string()).min(1).optional(),
  // Damage of these keywords from any source instead of the damage sources, e.g. Dawn Chorus
  // ("Ignitions from any source deal 100% increased damage")
  keywordIds: z.array(KeywordId).min(1).optional(),
  // weaponMatchesSuperElement: only while the weapon has the element of the super, e.g. Mantle of
  // Battle Harmony (ADR 0014); weaponMatchesTriggerElement: only in windows opened by an ability of
  // the weapon's element, e.g. Foetracer (ADR 0015, U6-1b)
  condition: z
    .enum(["weaponMatchesSuperElement", "weaponMatchesTriggerElement"])
    .optional(),
  // Only with a super of these elements, e.g. Weaken from Chromatic Fire with a Void super
  superElements: z.array(Element).optional(),
  // Only while one of these states is granted, e.g. No Backup Plans (ADR 0015, U6-2)
  requiresStatus: z.array(StatusId).min(1).optional(),
  // Only while one of these other effects is active, e.g. Expanding Abyss raises Weaken
  requiresEffectIds: z.array(z.string()).min(1).optional(),
  // Stacks per weapon hit, e.g. Lucky Pants, Peacekeepers: `multiplier` is the factor of one stack
  // (1.45 = +45 %), hit n has n - 1 stacks. A longer gap than refreshMs ends the run (omitted: never).
  // Bosses take bossFactor times the damage of a buffed shot (one stack or more).
  hitStacks: z
    .object({
      maxStacks: SourcedNumber,
      refreshMs: SourcedNumber.optional(),
      bossFactor: SourcedNumber,
    })
    .optional(),
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
  // noReload: skips reloads; reloadDuration: reload time × factor (ADR 0014)
  change: z.enum(["noReload", "reloadDuration"]),
  factor: z.number().positive().optional(), // required for reloadDuration, e.g. 0.9
  weaponTypes: z.array(WeaponType).optional(), // omitted: all weapon types
  source: Source,
});
export type TimingPart = z.infer<typeof TimingPart>;

/**
 * Effect part for a draw that grows while held (Oathkeeper): each step of stepMs held makes the
 * shot stepFactor stronger (1.375 = +37.5 %), up to maxFactor. The engine takes, per shot, the
 * hold with the most damage per second, so a hold that costs more time than it brings is not taken.
 * Primary ammo weapons only.
 */
export const HoldDrawPart = z.object({
  type: z.literal("holdDraw"),
  weaponTypes: z.array(WeaponType).min(1),
  stepMs: SourcedNumber,
  stepFactor: SourcedNumber,
  maxFactor: SourcedNumber,
});
export type HoldDrawPart = z.infer<typeof HoldDrawPart>;

/**
 * Effect part with damage of its own at a fixed rate while the effect is active, e.g. the Bolt
 * Charge discharges of Storm's Keep or the turret of Hellion: the first hit one interval after the
 * start of the window. Generic damage like Bolt Charge: only multipliers for keyword damage apply,
 * as Aegis applies only the debuff to these rows.
 */
export const PeriodicDamagePart = z.object({
  type: z.literal("periodicDamage"),
  id: z.string(), // damage instance id, e.g. "storms-keep"
  element: Element,
  damage: SourcedNumber, // per hit, Aegis visual scale, without the factors of Aegis
  intervalMs: SourcedNumber,
});
export type PeriodicDamagePart = z.infer<typeof PeriodicDamagePart>;

export const EffectPart = z.discriminatedUnion("type", [
  MultiplierPart,
  HoldDrawPart,
  TimingPart,
  CounterModifierPart,
  AppliesKeywordPart,
  PeriodicDamagePart,
]);
export type EffectPart = z.infer<typeof EffectPart>;

// ---------------------------------------------------------------------------------------------
// Rules: trigger, conditions, actions (docs/architecture.md section 6, ADR 0018, stage B3).
// Event - Condition - Action (Dayal et al. 1988): the conditions of a rule are checked before its
// actions; the rules of one event run in file order. New engine code only for a new type here (I3);
// tests/ruleTypes.test.ts lists the allowed types. Until B4 every number is a SourcedNumber; B4 adds
// `$` references (RuleValue).
// ---------------------------------------------------------------------------------------------

/** A number in a rule: today a SourcedNumber; in B4 also a `$` reference. */
export const RuleValue = SourcedNumber;
export type RuleValue = z.infer<typeof RuleValue>;

/** Which hits or shots a trigger matches; omitted fields match all. Same meaning as in MultiplierPart. */
export const HitFilter = z.object({
  damageSources: z.array(DamageSource).min(1).optional(),
  elements: z.array(Element).min(1).optional(),
  weaponTypes: z.array(WeaponType).min(1).optional(),
  abilityIds: z.array(z.string()).min(1).optional(),
  statuses: z.array(TargetStatusId).min(1).optional(), // damage of these statuses, e.g. ignition
});
export type HitFilter = z.infer<typeof HitFilter>;

/** A player state of the weapon actor (architecture section 8). */
export const ActorState = z.enum([
  "ready",
  "charging",
  "cooldown",
  "reloading",
  "locked",
]);
export type ActorState = z.infer<typeof ActorState>;

/**
 * Trigger of a rule. Without a filter, `shot` and `hit` mean the owner's own weapon or ability; the
 * rules of an effect fire only inside its windows.
 */
export const Trigger = z.discriminatedUnion("on", [
  // A shot of a weapon (before its hits)
  z.object({ on: z.literal("shot"), filter: HitFilter.optional() }),
  // A hit: of one of the owner's parts, or any hit the filter matches. precision: only (true) or
  // never (false) precision hits; a hit is a precision hit if its part can be one (all-precision play)
  z.object({
    on: z.literal("hit"),
    part: z.string().optional(),
    precision: z.boolean().optional(),
    filter: HitFilter.optional(),
  }),
  z.object({
    on: z.literal("cast"),
    kinds: z.array(AbilityKind).min(1).optional(),
    abilityIds: z.array(z.string()).min(1).optional(),
  }),
  z.object({ on: z.literal("reload"), edge: z.enum(["start", "end"]) }),
  // A status on the target: applied (stacks added) or its threshold reached (e.g. ignition)
  z.object({
    on: z.literal("status"),
    status: TargetStatusId,
    event: z.enum(["applied", "threshold"]),
  }),
  // everyMs: every interval while the owner is active, first one interval after the window start
  // (e.g. Storm's Keep); expires: the end of a buff, mode or window of this id
  z
    .object({
      on: z.literal("timer"),
      everyMs: RuleValue.optional(),
      expires: z.string().optional(),
    })
    .refine((t) => (t.everyMs === undefined) !== (t.expires === undefined), {
      message: "a timer needs exactly one of everyMs and expires",
    }),
  // Start of the damage phase: what the playstyle has built before (e.g. Pre-stacked)
  z.object({ on: z.literal("phaseStart") }),
]);
export type Trigger = z.infer<typeof Trigger>;

export const CompareOp = z.enum(["<", "<=", "=", ">=", ">"]);
export type CompareOp = z.infer<typeof CompareOp>;

/** Condition of a rule or a modifier; `not` inverts it. */
export const Condition = z.discriminatedUnion("type", [
  // A counter of the owner, e.g. the Perfect Fifth counter
  z.object({
    type: z.literal("counter"),
    id: z.string(),
    op: CompareOp,
    value: RuleValue,
    not: z.boolean().optional(),
  }),
  // Stacks of a status on the target or of a buff of the player
  z.object({
    type: z.literal("stacks"),
    status: TargetStatusId.optional(),
    buff: z.string().optional(),
    op: CompareOp,
    value: RuleValue,
    not: z.boolean().optional(),
  }),
  z.object({ type: z.literal("buff"), id: z.string(), not: z.boolean().optional() }),
  z.object({ type: z.literal("actor"), state: ActorState, not: z.boolean().optional() }),
  // A mode of the owner has this value (setMode), e.g. the Guidance Ring stands
  z.object({
    type: z.literal("mode"),
    id: z.string(),
    is: z.string(),
    not: z.boolean().optional(),
  }),
  // The build plays this playstyle or assumption (Build.playstyle, scenario assumptions)
  z.object({ type: z.literal("playstyle"), id: z.string(), not: z.boolean().optional() }),
  // The build has this item; "catalyst" means the catalyst of the owner's weapon
  z.object({ type: z.literal("hasItem"), id: z.string(), not: z.boolean().optional() }),
]);
export type Condition = z.infer<typeof Condition>;

/**
 * Passive change while its owner (effect, buff, status) is active. A multiplier lands in exactly one
 * bucket; `perStack` scales it with the stacks of its buff: 1 + (multiplier - 1) x stacks.
 */
export const MultiplierModifier = MultiplierPart.extend({
  perStack: z.boolean().optional(),
});
export type MultiplierModifier = z.infer<typeof MultiplierModifier>;

/**
 * A status without damage of its own and without a trigger, as written in keywords.json (Weaken):
 * while it lasts, its modifiers (multipliers in one bucket) apply to the damage the target takes.
 */
export const StatusModifierData = z
  .object({
    id: TargetStatusId,
    name: z.string(),
    compendium: z.object({ tab: z.string(), entry: z.string() }), // source of the quotes
    durationMs: SourcedNumber, // of an application that names none
    modifiers: z.array(MultiplierPart).min(1),
  })
  .refine((s) => new Set(s.modifiers.map((m) => m.bucketId)).size === 1, {
    message: "a status lands in exactly one bucket",
    path: ["modifiers"],
  });
export type StatusModifierData = z.infer<typeof StatusModifierData>;

/**
 * keywords.json holds keywords (with trigger and damage) and statuses without damage (Weaken); the
 * statuses are told apart by their `modifiers`. These read one kind each.
 */
const isModifierStatus = (entry: unknown) =>
  typeof entry === "object" && entry !== null && "modifiers" in entry;
const entriesOf = (raw: unknown): unknown[] => {
  if (!Array.isArray(raw)) throw new Error("keywords.json must be an array");
  return raw;
};
export const keywordDataOf = (raw: unknown): KeywordData[] =>
  KeywordData.array().parse(entriesOf(raw).filter((e) => !isModifierStatus(e)));
export const statusModifiersOf = (raw: unknown): StatusModifierData[] =>
  StatusModifierData.array().parse(entriesOf(raw).filter(isModifierStatus));

/** Timing of a weapon: rate, reload (factor; 0 skips it), charge, or a draw that grows while held. */
export const StatModifier = z.discriminatedUnion("stat", [
  z.object({
    type: z.literal("stat"),
    stat: z.literal("rpm"),
    value: RuleValue,
    weaponTypes: z.array(WeaponType).min(1).optional(),
  }),
  z.object({
    type: z.literal("stat"),
    stat: z.literal("reload"),
    factor: RuleValue, // reload time x factor; 0: no reload
    weaponTypes: z.array(WeaponType).min(1).optional(),
  }),
  z.object({
    type: z.literal("stat"),
    stat: z.literal("chargeMs"),
    value: RuleValue,
    weaponTypes: z.array(WeaponType).min(1).optional(),
  }),
  // The policy takes, per shot, the hold with the most damage per second (Oathkeeper)
  z.object({
    type: z.literal("stat"),
    stat: z.literal("drawHold"),
    stepMs: RuleValue,
    stepFactor: RuleValue,
    maxFactor: RuleValue,
    weaponTypes: z.array(WeaponType).min(1),
  }),
]);
export type StatModifier = z.infer<typeof StatModifier>;

/** Changes an action of another item, e.g. Ember of Ashes: applyStatus scorch x1.5, rounded up. */
export const ActionModifier = z.object({
  type: z.literal("action"),
  action: z.enum(["applyStatus"]),
  status: TargetStatusId,
  factor: RuleValue,
});
export type ActionModifier = z.infer<typeof ActionModifier>;

export const Modifier = z.union([MultiplierModifier, StatModifier, ActionModifier]);
export type Modifier = z.infer<typeof Modifier>;

/** A buff of the player that rules grant: one bucket, a duration, stacks up to a maximum. */
export const BuffDefinition = z
  .object({
    id: z.string(),
    name: z.string(),
    modifiers: z.array(MultiplierModifier).min(1),
    durationMs: RuleValue.optional(), // omitted: until the end of the phase
    maxStacks: RuleValue.optional(), // omitted: 1
  })
  .refine((b) => new Set(b.modifiers.map((m) => m.bucketId)).size === 1, {
    message: "a buff lands in exactly one bucket",
    path: ["modifiers"],
  });
export type BuffDefinition = z.infer<typeof BuffDefinition>;

/** What a rule does (architecture section 6). Delays count from the event. */
export const Action = z.discriminatedUnion("type", [
  // Hits of one of the owner's parts: count hits, intervalMs apart; factor scales each hit
  z.object({
    type: z.literal("spawn"),
    part: z.string(),
    delayMs: RuleValue.optional(),
    count: RuleValue.optional(),
    intervalMs: RuleValue.optional(),
    factor: RuleValue.optional(),
  }),
  // Adds to a counter of the owner or to the stacks of an active buff (refreshes its duration)
  z
    .object({
      type: z.literal("addStacks"),
      counter: z.string().optional(),
      buff: z.string().optional(),
      by: RuleValue.optional(), // omitted: 1
    })
    .refine((a) => (a.counter === undefined) !== (a.buff === undefined), {
      message: "addStacks needs exactly one of counter and buff",
    }),
  z.object({ type: z.literal("resetCounter"), counter: z.string() }),
  z.object({
    type: z.literal("applyStatus"),
    status: TargetStatusId,
    stacks: RuleValue.optional(),
    durationMs: RuleValue.optional(), // omitted: the status definition's
    delayMs: RuleValue.optional(),
  }),
  // Grants a buff of the owner (BuffDefinition) or restarts it; durationMs replaces the definition's
  z.object({
    type: z.literal("grantBuff"),
    buff: z.string(),
    stacks: RuleValue.optional(),
    durationMs: RuleValue.optional(),
  }),
  // Fills the magazine of the owner's weapon (or all weapons for an ability); omitted rounds: full
  z.object({ type: z.literal("refill"), rounds: RuleValue.optional() }),
  // A stat modifier for a while; omitted durationMs: until the end of the phase
  z.object({
    type: z.literal("modifyStat"),
    modifier: StatModifier,
    durationMs: RuleValue.optional(),
  }),
  // Sets a mode of the owner, e.g. a playstyle's fire mode or a deployed Guidance Ring
  z.object({
    type: z.literal("setMode"),
    mode: z.string(),
    to: z.string(),
    durationMs: RuleValue.optional(), // omitted: until set again
  }),
  // Energy of an ability kind as a share of a full bar
  z.object({ type: z.literal("addResource"), resource: AbilityKind, amount: RuleValue }),
  z.object({
    type: z.literal("modifyAction"),
    modifier: ActionModifier,
    durationMs: RuleValue.optional(),
  }),
  // Damage of its own without a weapon part, e.g. a Storm's Keep discharge
  z.object({
    type: z.literal("damage"),
    id: z.string(),
    damage: RuleValue,
    element: Element,
    damageSource: DamageSource,
    delivery: Delivery.optional(),
  }),
]);
export type Action = z.infer<typeof Action>;

export const Rule = z.object({
  id: z.string(), // unique within its owner
  on: Trigger,
  if: z.array(Condition).optional(),
  do: z.array(Action).min(1),
  cooldownMs: RuleValue.optional(), // the rule does not fire again within this time
  source: Source.optional(), // where the structure comes from, e.g. the Clarity text
});
export type Rule = z.infer<typeof Rule>;

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
  // Reload Duration Multiplier the sources' reload already contains (K1: Quantum and Aegis reload
  // with Rally Barricade); a reloadDuration part counts only beyond it. Omitted: none.
  reloadDurationIncluded: SourcedNumber.optional(),
  damageInstances: z.array(DamageInstance).min(1),
  intrinsicParts: z.array(IntrinsicPart),
  // Rules of the weapon (architecture section 6): the weapon owns them and its counters, modes and
  // buffs. A part that a `spawn` action names is set off by the rules only (B3a, step by step).
  rules: z.array(Rule).optional(),
  buffs: z.array(BuffDefinition).optional(),
  // Bonus on keyword damage that this weapon set off, e.g. "Solar Effects that are initially
  // applied by One Thousand Voices deal 31.6% increased damage" (ADR 0015, U4a-4).
  keywordBonuses: z
    .array(z.object({ keywordId: KeywordId, factor: SourcedNumber }))
    .optional(),
  intrinsics: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      source: Source,
    }),
  ),
  // The playstyles the build picker offers (Build.playstyle), e.g. the charge levels of Whirling
  // Ovation; the first entry is the plain shot and the default. Assumptions of a scenario that no
  // player picks (Build.playstyle "cayde-s-retribution") need no entry. The rules read the playstyle
  // with the condition `playstyle`: a playstyle's shot takes the place of the plain one by
  // `playstyle not` on the rule of the shot; its rate is a `modifyStat` on `phaseStart` and wins
  // over the timing of a catalyst.
  playstyles: z.array(z.object({ id: z.string(), label: z.string() })).min(2).optional(),
  // Imported packages (ADR 0013): modelled effects Aegis measured inside the value per shot.
  includedEffectIds: z.array(z.string()).optional(),
  // Imported packages: catalyst, perks and mods as factors from the "with / without" rows.
  options: z.array(WeaponOption).optional(),
  // The catalyst of an imported package and what it does against one boss, decided by the sources:
  // damage (an option with factor), timing (rows with catalyst differ), none (the rows with catalyst
  // equal those without, e.g. kill effects) or unknown (no source with catalyst).
  catalyst: WeaponCatalyst.optional(),
});
export type Weapon = z.infer<typeof Weapon>;

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

/** Where the game shows an own effect, e.g. Ember of Ashes as a fragment (U2). */
export const Slot = z.enum([
  "super",
  "classAbility",
  "aspect",
  "fragment",
  // own empowering buffs and debuffs of the subclass, kept up without a chosen item, e.g. Radiant
  "buffs",
  "mod",
  "stat",
  "artifact",
  "exotic", // exotic armor (ADR 0014)
]);
export type Slot = z.infer<typeof Slot>;

// Slots each own provider can fill; teammates provide effects without a slot.
const SLOTS_OF: Record<ProviderKind, Slot[]> = {
  subclass: ["super", "classAbility", "aspect", "fragment", "buffs"],
  armor: ["mod", "stat", "exotic"],
  artifact: ["artifact"],
  fireteamSupport: [],
};

export const Provider = z.object({
  kind: ProviderKind,
  classes: z.array(GuardianClass).optional(), // omitted: every class
  subclasses: z.array(Subclass).optional(), // only for kind subclass; omitted: every subclass
});
export type Provider = z.infer<typeof Provider>;

/** Provider of an effect: own effects also name their slot. */
export const EffectProvider = Provider.extend({
  slot: Slot.optional(), // required for own effects, see SLOTS_OF
}).refine(
  (p) =>
    p.slot === undefined
      ? SLOTS_OF[p.kind].length === 0
      : SLOTS_OF[p.kind].includes(p.slot),
  { message: "slot does not fit the provider kind", path: ["slot"] },
);
export type EffectProvider = z.infer<typeof EffectProvider>;

/** Why an effect code was retired; the UI explains it when an old link is opened. */
export const FormerCodeReason = z.enum(["onlyFromExoticArmor"]);
export type FormerCodeReason = z.infer<typeof FormerCodeReason>;

export const FormerCode = z.object({
  code: z.number().int().positive(),
  name: z.string(), // name of the removed effect
  reason: FormerCodeReason,
});

/** Kinds with a stat of their own in the stats block; the class stat has no known factor (U7). */
export const StatAbilityKind = AbilityKind.exclude(["classAbility"]);
export type StatAbilityKind = z.infer<typeof StatAbilityKind>;

/**
 * Event of the rotation that opens the window of an effect (ADR 0015, U6-1b):
 * cast: the cast of an ability; hit: its first hit (cast plus the delay of its first component);
 * superEnd: the end of the super window; untilSuperCast: from 0 s while the super is charged, so
 * the window ends at the first super cast plus the duration (whole phase without a super cast).
 */
export const EffectTrigger = z.object({
  on: z.enum(["cast", "hit", "superEnd", "untilSuperCast"]),
  abilityKinds: z.array(AbilityKind).optional(), // omitted: any kind
  abilityIds: z.array(z.string()).optional(), // omitted: any ability
  elements: z.array(Element).optional(), // of the ability; omitted: any element
  // true: a new trigger inside the window restarts its duration; false: it is ignored (Foetracer)
  refresh: z.boolean(),
});
export type EffectTrigger = z.infer<typeof EffectTrigger>;

/**
 * Anything a build can switch on or off that changes damage or timing (ADR 0006).
 * Active in a window: start and duration (ADR 0006, stage B).
 */

export const Effect = z
  .object({
    id: z.string(),
    name: z.string(),
    code: z.number().int().positive(), // short code for build links; never reused
    shortName: z.string(), // for tight spaces, e.g. the optimizer ranking
    manifestRef: ManifestRef.optional(), // icon source in the Bungie manifest (ADR 0008)
    // Icon that follows the weapon element instead: key "<elementIconKey>:<element>" in icon-refs.json,
    // e.g. "surge" for the Weapon Surge mod of each element.
    elementIconKey: z.string().optional(),
    // Codes of removed effects that old build links read as this effect; never reused.
    formerCodes: z.array(FormerCode).optional(),
    providers: z.array(EffectProvider).min(1),
    // A build provides at most one effect of a group itself, e.g. one surge level or one super.
    // Effects from teammates are not limited by groups.
    exclusiveGroup: z.string().optional(),
    parts: z.array(EffectPart), // empty only for an effect that grants a state or changes abilities
    // States the player has while the effect is active, e.g. Amplified (ADR 0015, U6-2)
    grantsStatus: z.array(StatusId).min(1).optional(),
    // Abilities with a variant measured with this aspect or fragment, e.g. Knock 'Em Down changes
    // Blade Barrage (U6-2 rule G); the variant applies while the effect is selected.
    changesAbilityIds: z.array(z.string()).min(1).optional(),
    // Duration after its start; omitted if the effect lasts the whole damage phase or the duration
    // depends on the source (e.g. Radiant, tethers). The rotation can override start and duration.
    durationMs: SourcedNumber.optional(),
    // Opens a window of durationMs at each matching event of the rotation instead of one from 0 s
    // (ADR 0015, U6-1b), e.g. Star-Eater Scales at each super cast.
    trigger: EffectTrigger.optional(),
    // Effect ids whose multiplier parts in the same buckets are ignored while this effect is active,
    // regardless of value, e.g. Divinity over Particle Reconstruction.
    overrides: z.array(z.string()).optional(),
  })
  .refine(
    (e) =>
      e.parts.length > 0 ||
      e.grantsStatus !== undefined ||
      e.changesAbilityIds !== undefined,
    {
      message:
        "an effect needs parts, a state it grants or abilities it changes",
      path: ["parts"],
    },
  );
export type Effect = z.infer<typeof Effect>;

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
  delivery: Delivery.optional(),
  // Effects already inside the value, e.g. Ember of Ashes in an Aegis package; never applied again here.
  includedEffectIds: z.array(z.string()).optional(),
  // Multiplier effects taken out of the value when loading, e.g. Radiant in a Golden Gun package;
  // they apply again like any effect if the build has them (ADR 0009 point 5).
  normalisedEffectIds: z.array(z.string()).optional(),
});
export type AbilityComponent = z.infer<typeof AbilityComponent>;

/**
 * Components of an ability from its Compendium text (ability-components.json, npm run
 * build:abilities). They replace the Aegis package of the base ability; values are per hit of the
 * super timing (ADR 0009 point 2).
 */
export const AbilityComponents = z.object({
  abilityId: z.string(),
  components: z.array(AbilityComponent).min(1),
});
export type AbilityComponents = z.infer<typeof AbilityComponents>;

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
  // From super-timings.json: the weapon is ready again this long after the cast.
  z.object({ type: z.literal("timed"), weaponReadyMs: SourcedNumber }),
]);
export type SuperUsage = z.infer<typeof SuperUsage>;

/**
 * Timing of a super used as fast as possible (super-timings.json): its package is spread evenly
 * over the hits. Without weaponReadyMs the window from `usage` stays, e.g. Chaos Reach.
 */
export const SuperTiming = z.object({
  abilityId: z.string(),
  exoticArmorId: z.string().optional(), // timing of the variant with this exotic, e.g. Celestial Nighthawk
  firstHitMs: SourcedNumber,
  hitIntervalMs: SourcedNumber,
  hits: SourcedNumber,
  weaponReadyMs: SourcedNumber.optional(),
});
export type SuperTiming = z.infer<typeof SuperTiming>;

const AbilityFields = z.object({
  id: z.string(),
  code: z.number().int().positive(), // short code for build links; never reused
  name: z.string(),
  kind: AbilityKind,
  element: Element, // kinetic: a class ability of every subclass, without an element of its own
  providers: z.array(Provider).min(1), // classes and subclasses that have the ability
  manifestHash: z.number().int().optional(), // ability item in the Bungie manifest, for the icon
  usage: SuperUsage.optional(), // supers only; omitted: the super does not block the weapon
  // Effects the ability applies on its first cast, e.g. the tether of Moebius Quiver.
  grantsEffectIds: z.array(z.string()).optional(),
  // Aegis row (aegis-abilities.json) the ability is checked against without effects; for a
  // package also the source of its value.
  aegisRowId: z.string().optional(),
  // True if the value comes from the Aegis row as one package instead of own components.
  package: z.literal(true).optional(),
  // Effects inside the package value that the Aegis import could not recognise, e.g. the tether
  // behind "includes debuff".
  extraIncludedEffectIds: z.array(z.string()).optional(),
  // Multiplier inside the Aegis row that no effect describes, derived from other Aegis rows; the
  // package is divided by it, e.g. Feast of Light x6 on Bladefury. Not passed on to variants.
  includedFactor: SourcedNumber.optional(),
  // Compendium entry that describes the ability; the source of quotes and of the coverage list.
  compendium: z.object({ tab: z.string(), entry: z.string() }).optional(),
  // Variant measured with an exotic armor piece (ADR 0014): replaces the ability `variantOf` while
  // the build wears `exoticArmorId`, e.g. Thundercrash with Cuirass of the Falling Star.
  variantOf: z.string().optional(),
  exoticArmorId: z.string().optional(),
  // Variant measured with aspects or fragments (U6-2 rule G): applies while all are selected.
  requiresEffectIds: z.array(z.string()).min(1).optional(),
  // Castable only while this effect is active, in the window of the rotation, e.g. the Prismatic
  // grenades while Transcendence lasts; casts outside are dropped.
  duringEffectId: z.string().optional(),
  // Each cast reloads the weapon at once, e.g. Marksman's Dodge "reloads all weapons" (U7).
  refillsMagazine: z.literal(true).optional(),
  // Empty only for supers that just grant effects, e.g. Ward of Dawn.
  components: z.array(AbilityComponent),
  // Keywords its hits apply (ADR 0015, U5); set when loading from ability-keywords.json.
  keywordParts: z.array(AppliesKeywordPart).optional(),
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
  kind: AbilityKind;
}) =>
  (ability.components?.length ?? 0) > 0 ||
  ability.package === true ||
  (ability.grantsEffectIds?.length ?? 0) > 0 ||
  // a class ability may act only on the shot plan or on energy, e.g. Gambler's Dodge (U7)
  ability.kind === "classAbility";
const damageOrGrantsError = {
  message: "an ability needs components, a package or granted effects",
  path: ["components"],
};

/**
 * A keyword an ability applies per use (ADR 0015, U5), generated by npm run build:keywords from the
 * Compendium texts. bakedInPackage: keyword damage Aegis counted into the package value; loading
 * takes it out, the keyword run adds it back.
 */
export const AbilityKeyword = z.object({
  abilityId: z.string(),
  keywordId: KeywordId,
  stacksPerUse: SourcedNumber.optional(), // base stacks before Ember of Ashes
  bakedInPackage: z
    .object({
      triggers: z.number().int().positive(), // in the whole Aegis measurement
      tick: z.number().positive(), // raw value of one trigger in the Aegis row
      uses: z.number().int().positive(),
      fullModifiers: z.number().positive(),
      note: z.string(),
    })
    .optional(),
  source: Source,
});
export type AbilityKeyword = z.infer<typeof AbilityKeyword>;

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
  // Omitted: derived from manifest-abilities.json, including Prismatic.
  providers: z.array(Provider).min(1).optional(),
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
 * An effect an ability grants at every cast or hit, e.g. Radiant from Acrobat's Dodge (block
 * "Effekte durch Abilities", npm run build:grants). The window opens at each cast or first hit and
 * lasts durationMs; a new cast inside the window restarts it.
 */
export const AbilityGrant = z.object({
  abilityId: z.string(), // base ability; its variants grant it too
  effectId: z.string(), // effect of effects.json whose parts apply in the window
  on: z.enum(["cast", "hit"]),
  durationMs: SourcedNumber,
});
export type AbilityGrant = z.infer<typeof AbilityGrant>;

/**
 * An ability item of the Bungie manifest (ADR 0008): its plug category names slot, class and
 * subclass, e.g. "hunter.prism.supers". Grenades of an element are shared by all classes.
 */
export const ManifestAbility = z.object({
  name: z.string(), // manifest spelling, e.g. "Silence and Squall"
  kind: AbilityKind,
  guardianClass: GuardianClass.nullable(), // null: every class
  subclass: Subclass,
  hash: z.number().int(),
});
export type ManifestAbility = z.infer<typeof ManifestAbility>;

/** An aspect or fragment item from the manifest (ADR 0015, U6-2). */
export const ManifestSubclassItem = z.object({
  name: z.string(), // manifest spelling, e.g. "Ember of Ashes"
  kind: z.enum(["aspect", "fragment"]),
  guardianClass: GuardianClass.nullable(), // null: every class
  subclass: Subclass,
  hash: z.number().int(),
});
export type ManifestSubclassItem = z.infer<typeof ManifestSubclassItem>;

/** Ability items from the manifest, written by npm run import:icons. */
export const ManifestAbilities = z.object({
  manifestVersion: z.string(),
  retrieved: z.string(),
  abilities: z.array(ManifestAbility),
  // aspects and fragments; missing in files written before U6-2
  subclassItems: z.array(ManifestSubclassItem).optional(),
});
export type ManifestAbilities = z.infer<typeof ManifestAbilities>;

/** An exotic weapon from the manifest with the names of its perks (ADR 0013). */
export const ManifestWeapon = z.object({
  hash: z.number().int(),
  name: z.string(),
  weaponType: WeaponType,
  element: Element,
  ammo: z.enum(["primary", "special", "heavy"]),
  intrinsics: z.array(z.string()), // socket category "Intrinsic Traits", e.g. "Prototype Trueseeker"
  perks: z.array(z.string()), // socket category "Weapon Perks" with all options, without trackers
  mods: z.array(z.string()), // socket category "Weapon Mods", e.g. the parts of Praxic Blade
  catalyst: z
    .object({
      name: z.string(),
      hash: z.number().int(),
      perks: z.array(z.string()),
      stats: z.record(z.string(), z.number()), // stat changes, e.g. { "Reload Speed": 20 }
    })
    .nullable(), // e.g. { name: "Truth Catalyst", hash: 726894353, perks: ["Reaper's Tithe"] }
  description: z.string(), // texts of intrinsic and catalyst perks, one per line
  stats: z.record(z.string(), z.number()), // displayed stats, e.g. { "Rounds Per Minute": 1000, "Magazine": 50 }
});
export type ManifestWeapon = z.infer<typeof ManifestWeapon>;

/** An exotic armor piece from the manifest with its intrinsic (ADR 0013). */
export const ManifestArmorPiece = z.object({
  hash: z.number().int(),
  name: z.string(),
  guardianClass: GuardianClass.nullable(), // null: any class
  // classPerk: a Spirit perk of the Prismatic Exotic Class Item (ADR 0015, U6-3), not a piece
  slot: z.enum(["helmet", "gauntlets", "chest", "legs", "classItem", "classPerk"]),
  intrinsics: z.array(z.string()), // e.g. ["Illegally Modded Holster"]
  description: z.string(), // texts of the intrinsics, one per line
});
export type ManifestArmorPiece = z.infer<typeof ManifestArmorPiece>;

/** Exotic armor from the manifest, written by npm run import:icons. */
export const ManifestArmor = z.object({
  manifestVersion: z.string(),
  retrieved: z.string(),
  armor: z.array(ManifestArmorPiece),
});
export type ManifestArmor = z.infer<typeof ManifestArmor>;

/** Kind of an exotic armor piece, set by the rules of the armor import (ADR 0014, point 5). */
export const ExoticArmorKind = z.enum([
  "abilityVariant", // Aegis measured an ability package with it
  "damageBuff", // Court names its bucket
  "grantsEffect", // grants an effect the model knows, e.g. Radiant
  "weaponTiming", // changes the shot plan by a quoted factor, e.g. 0.9x Reload Duration Multiplier
  "ownDamage", // deals damage of its own; damage instances of exotics come later (owner, 2026-10-21)
  "energyOnly", // only ability or super energy; the rotation sets the casts (owner: keep as gap)
  "gap", // damage effect without bucket or value, or unclear text
  "noDamage", // survival, energy or movement only
]);
export type ExoticArmorKind = z.infer<typeof ExoticArmorKind>;

/** A damage bonus quoted from a text, e.g. "Thundercrash deals 55% increased damage". */
export const ArmorBonusQuote = z.object({
  percent: z.number().positive(),
  quote: z.string(),
  source: z.enum(["compendium", "clarity"]),
  // Melee buffs add up with each other (Compendium "Game Mechanics"); not modelled yet.
  melee: z.boolean(),
});
export type ArmorBonusQuote = z.infer<typeof ArmorBonusQuote>;

/** Bucket of the quoted bonuses and what names it (ADR 0014, point 4). */
export const ArmorBonusBucket = z.object({
  bucketId: z.string(),
  // court: Court lists the exotic; text: the text names the bucket; courtDefinition: Court's
  // definition of exotic intrinsics, which come from "Most Exotic Armor"
  basis: z.enum(["court", "text", "courtDefinition"]),
  quote: z.string(),
});
export type ArmorBonusBucket = z.infer<typeof ArmorBonusBucket>;

/** One exotic armor piece with the result of the armor import (ADR 0014). */
export const ExoticArmorEntry = z.object({
  id: z.string(), // kebab-case of the name
  hash: z.number().int(),
  name: z.string(),
  guardianClass: GuardianClass.nullable(), // null: any class
  slot: ManifestArmorPiece.shape.slot,
  // classPerk only: the column of the class item it rolls in; one perk per column (Compendium)
  column: z.union([z.literal(1), z.literal(2)]).optional(),
  intrinsic: z.string().nullable(),
  kind: ExoticArmorKind,
  rule: z.number().int().positive(), // number of the first rule that matched
  reason: z.string(), // why the rule matched, in German for the review table
  aegisRowIds: z.array(z.string()), // ability packages that assume this exotic
  courtBuffs: z.array(
    z.object({
      bucketId: z.string(),
      trigger: z.string(),
      pve: z.string().nullable(),
      pveDuration: z.string().nullable(),
    }),
  ),
  bonuses: z.array(ArmorBonusQuote),
  bonusBucket: ArmorBonusBucket.nullable(), // null if no bonus is usable or Court rows name the buckets
  grantsEffectIds: z.array(z.string()), // effects of effects.json the texts say it grants (rule 4c)
  // Shots of the super it modifies, e.g. Celestial Nighthawk: "single high-damage shot" (rule 1)
  superShots: z
    .object({ value: z.number().int().positive(), quote: z.string() })
    .nullable()
    .optional(),
  // Quoted change of the shot plan (rule 5), strongest of stacked values.
  timing: z
    .object({
      change: z.literal("reloadDuration"),
      factor: z.number().positive(), // reload time × factor, e.g. 0.9
      quote: z.string(),
      source: z.enum(["compendium", "clarity"]),
    })
    .nullable(),
});
export type ExoticArmorEntry = z.infer<typeof ExoticArmorEntry>;

/**
 * An effect generated from a damage buff of an exotic armor piece (ADR 0015, U6-1), in
 * exotic-armor-effects.json. always: active the whole damage phase; preBuilt: built up before the
 * damage phase by kills, active from 0 s for its duration, an option that is off by default.
 */
export const ExoticArmorEffect = z.object({
  exoticArmorId: z.string(),
  activation: z.enum(["always", "preBuilt"]),
  effect: Effect,
});
export type ExoticArmorEffect = z.infer<typeof ExoticArmorEffect>;

/** An effect generated from an aspect or fragment (ADR 0015, U6-2), in subclass-effects.json. */
export const SubclassEffect = z.object({
  subclassItemId: z.string(), // kebab-case of the manifest name, e.g. "ember-of-torches"
  activation: z.enum(["always", "preBuilt"]),
  effect: Effect,
});
export type SubclassEffect = z.infer<typeof SubclassEffect>;

/** Item types of the names in the Aegis weapon assumptions, looked up in the whole manifest. */
export const ManifestTerms = z.object({
  manifestVersion: z.string(),
  retrieved: z.string(),
  terms: z.record(
    z.string(),
    z.array(
      z.object({
        itemType: z.string(),
        plugCategory: z.string(),
        description: z.string(), // item text, else the texts of its sandbox perks
      }),
    ),
  ),
});
export type ManifestTerms = z.infer<typeof ManifestTerms>;

/** Exotic weapons from the manifest, written by npm run import:icons. */
export const ManifestWeapons = z.object({
  manifestVersion: z.string(),
  retrieved: z.string(),
  weapons: z.array(ManifestWeapon),
});
export type ManifestWeapons = z.infer<typeof ManifestWeapons>;

/** Why a known ability is not in abilities.json yet (coverage list, US-15). */
export const GapReason = z.enum([
  "aegisNotNormalised", // Aegis measured it only with buffs inside the value (Full Modifiers 1.00)
  "aegisOnlyWithUnmodelledBuffs", // every Aegis row assumes a buff that is not an effect yet
  "effectNotModelled", // the ability only grants a buff that is not an effect yet
  "noUsableData", // no source gives a usable value
]);
export type GapReason = z.infer<typeof GapReason>;

/** A Compendium ability that is knowingly not modelled, with the reason. */
export const AbilityGap = z.object({
  compendium: z.object({ tab: z.string(), entry: z.string() }),
  reason: GapReason,
  note: z.string(), // details for agents, e.g. which buffs are missing
});
export type AbilityGap = z.infer<typeof AbilityGap>;

/**
 * How the super, grenade or melee stat scales the damage of its abilities: a fixed bonus per point
 * above a stat, e.g. +0.45% super damage per point above 100 (Compendium, Game Mechanics).
 */
export const AbilityStatScaling = z.object({
  kind: StatAbilityKind,
  bucketId: z.string(), // bucket of the stat multiplier, e.g. "abilityStat"
  bonusFromStat: z.number().nonnegative(), // the damage bonus starts above this stat, e.g. 100
  maxStat: z.number().positive(), // highest stat, e.g. 200
  damagePerPoint: SourcedNumber, // e.g. 0.0045 for +0.45% per point
});
export type AbilityStatScaling = z.infer<typeof AbilityStatScaling>;

/**
 * How the Weapons stat scales the damage of weapons with one ammo type. Against bosses only the
 * part above `bonusFromStat` counts.
 */
export const WeaponStatScaling = z.object({
  ammo: z.enum(["primary", "special", "heavy"]),
  bucketId: z.string(), // bucket of the stat multiplier, e.g. "amplification"
  bonusFromStat: z.number().nonnegative(),
  maxStat: z.number().positive(),
  damagePerPoint: SourcedNumber, // e.g. 0.0015 for +0.15% per point
});
export type WeaponStatScaling = z.infer<typeof WeaponStatScaling>;

/** Energy of one ability (block 3): cooldown without stat bonus and the scalar of chunk energy gains. */
export const AbilityEnergy = z.object({
  abilityId: z.string(), // base ability; variants use the energy of their base
  cooldownSeconds: SourcedNumber, // e.g. Fusion Grenade "Base Cooldown: 105.4 seconds"
  chunkScalar: SourcedNumber.optional(), // grenades and melees, e.g. "Chunk Scalar: 0.875x"
  charges: SourcedNumber.optional(), // innate charges, e.g. "Innately has 3 Melee Ability Charges"; omitted: 1
  // Regeneration speed factor by charges held (index 0: none), e.g. Frenzied Blade 1.15, 1.55, 1.95; the
  // last one holds above. The cooldown above is the nominal one, Flat Gain's T0 is that ÷ the first factor.
  regenByCharges: z.array(SourcedNumber).min(1).optional(),
  prismaticRegen: SourcedNumber.optional(), // "On Prismatic: Penalized with an additional 0.7x Regeneration Speed"
});
export type AbilityEnergy = z.infer<typeof AbilityEnergy>;

/** A factor by stat: points sorted by stat, linear in between, the first and last value beyond them. */
export const StatCurve = z.object({
  points: z.array(z.object({ stat: z.number().nonnegative(), value: z.number().positive() })).min(2),
  source: Source,
});
export type StatCurve = z.infer<typeof StatCurve>;

/** How the super, grenade or melee stat speeds up the regeneration and the energy gains of its abilities. */
export const EnergyStat = z.object({
  kind: StatAbilityKind,
  fullAtStat: z.number().positive(), // the default stat (omitted stat in a build)
  regenUnits: StatCurve, // regeneration rate relative to stat 0, e.g. 3.115 at 100
  effectScaler: StatCurve, // factor on the additional base regeneration of effects (stat 0 = 1)
  gainScaler: StatCurve, // factor on chunk gains, 1 at about stat 70
});
export type EnergyStat = z.infer<typeof EnergyStat>;

/** Abilities whose energy changes: kinds, optionally only some abilities or elements. */
export const EnergyAbilities = z.object({
  kinds: z.array(AbilityKind).min(1),
  abilityIds: z.array(z.string()).min(1).optional(), // base abilities
  elements: z.array(Element).min(1).optional(),
});
export type EnergyAbilities = z.infer<typeof EnergyAbilities>;

/**
 * A change to ability energy from an exotic, an aspect or fragment, or an ability (block 3), with the
 * value from its text:
 * charges: extra charges; regenBase: additional base regeneration rate (adds to the stat factor);
 * regenSpeed: factor on the regeneration speed; energy: share of the bar per trigger.
 */
export const EnergyModifier = z.object({
  id: z.string(),
  name: z.string(), // item name
  from: z.union([
    z.object({ exoticArmorId: z.string() }),
    z.object({ effectId: z.string() }),
    z.object({ abilityId: z.string() }),
    z.object({ guardianClass: GuardianClass }), // e.g. Warlock grenade regeneration (K5)
  ]),
  target: EnergyAbilities,
  change: z.enum(["charges", "regenBase", "regenSpeed", "energy"]),
  value: SourcedNumber,
  fixed: z.boolean(), // energy: "Fixed" gains ignore chunk scalar and stat
  // Omitted: always. cast: each cast of these abilities (one hit per cast, one boss), for regen with
  // a duration; weaponHit: one weapon hit per cooldown during the whole phase.
  trigger: z
    .discriminatedUnion("on", [
      z.object({
        on: z.literal("cast"),
        abilities: EnergyAbilities,
        durationSeconds: z.number().positive().optional(),
      }),
      z.object({ on: z.literal("weaponHit"), cooldownSeconds: z.number().positive() }),
    ])
    .optional(),
  // Only while the build has one of these effects, e.g. Starfire Protocol while Radiant.
  requiresAnyEffectIds: z.array(z.string()).min(1).optional(),
});
export type EnergyModifier = z.infer<typeof EnergyModifier>;

/**
 * src/data/energy-overrides.json: single cases where another source beats the Compendium (K5), and
 * modifiers no Compendium line names (e.g. the Warlock grenade factor). Each value carries its source.
 */
export const EnergyOverrides = z.object({
  abilities: z.array(
    z.object({
      abilityId: z.string(),
      cooldownSeconds: SourcedNumber.optional(),
      chunkScalar: SourcedNumber.optional(),
    }),
  ),
  modifiers: z.array(EnergyModifier),
});
export type EnergyOverrides = z.infer<typeof EnergyOverrides>;

/** src/data/ability-energy.json, written by npm run build:energy. */
export const EnergyData = z.object({
  stats: z.array(EnergyStat),
  abilities: z.array(AbilityEnergy),
  modifiers: z.array(EnergyModifier),
});
export type EnergyData = z.infer<typeof EnergyData>;

/**
 * How long a grenade, melee or class ability cast keeps the player busy (src/data/cast-times.json):
 * the weapon does not fire and no other ability starts. Supers use their super window instead.
 */
export const CastTimes = z.object({
  defaultMs: SourcedNumber, // for every ability without an entry
  abilities: z.array(
    z.object({
      abilityId: z.string(), // base ability; variants use the time of their base
      castMs: SourcedNumber,
    }),
  ),
});
export type CastTimes = z.infer<typeof CastTimes>;

/** Community or own reference value for tests. */
export const ReferenceValue = z.object({
  id: z.string(),
  weaponId: z.string(), // the weapon the value belongs to (ADR 0012)
  description: z.string(),
  totalDamageMin: z.number(),
  totalDamageMax: z.number(),
  conditions: z.array(z.string()),
  // Machine-readable conditions for the gate test; omitted if the conditions are unclear.
  scenario: z
    .object({
      effectIds: z.array(z.string()),
      damagePhaseSeconds: z.number().nonnegative(),
      // false: shots only, e.g. "without ignition" (no intrinsic parts, no rule that applies a status)
      withIntrinsicParts: z.boolean(),
    })
    .optional(),
  source: Source,
});
export type ReferenceValue = z.infer<typeof ReferenceValue>;

/** Combined multiplier of a set of effects on the weapon's own damage, from a source. */
export const ReferenceMultiplier = z.object({
  id: z.string(),
  weaponId: z.string(),
  description: z.string(),
  effectIds: z.array(z.string()).min(1),
  weaponsStat: z.number().nonnegative().optional(), // Weapons stat of the scenario, e.g. 200
  multiplierMin: z.number(),
  multiplierMax: z.number(),
  source: Source,
});
export type ReferenceMultiplier = z.infer<typeof ReferenceMultiplier>;

/** Measured factor between two scenarios of the same weapon, e.g. with and without an effect (ADR 0011). */
const ReferenceScenario = z.object({
  effectIds: z.array(z.string()),
  catalyst: z.boolean(),
});
export const ReferenceFactor = z.object({
  id: z.string(),
  weaponId: z.string(),
  description: z.string(),
  baseline: ReferenceScenario,
  variant: ReferenceScenario,
  factor: z.number().positive(), // Total Damage of variant ÷ baseline
  source: Source,
});
export type ReferenceFactor = z.infer<typeof ReferenceFactor>;

/**
 * A perk of a seasonal artifact that changes damage and has an effect in the model. The game shows
 * the artifact as three rows of seven perks; the tier is the row (1 = one diamond, the bottom row,
 * 3 = three diamonds, the top row), which is the column of the Compendium tab.
 */
export const ArtifactPerk = z.object({
  name: z.string(), // as in the Compendium, e.g. "Sniper's Meditation"
  tier: z.number().int().min(1).max(3),
  effectId: z.string(), // the effect the perk switches on (effects.json, buff-effects.json)
});
export type ArtifactPerk = z.infer<typeof ArtifactPerk>;

export const Artifact = z.object({
  id: z.string(), // kebab-case, e.g. "encrypted-data-disk"
  code: z.number().int().positive(), // for build links; never reused
  name: z.string(),
  season: z.string(), // e.g. "Renegades"
  perks: z.array(ArtifactPerk), // only perks with an effect; the rest is in docs/artifact-import.md
});
export type Artifact = z.infer<typeof Artifact>;

/**
 * src/data/artifacts.json, written by npm run build:artifacts. A build equips one artifact and
 * fills its slots: slots[0] perks of tier 1, slots[1] of tier 2, slots[2] of tier 3 (the screen of
 * the game has seven slots). Perks without an effect fill the other slots, so only the perks with
 * an effect count against the slots here.
 */
export const ArtifactData = z.object({
  slots: z.array(SourcedNumber).length(3),
  artifacts: z.array(Artifact),
});
export type ArtifactData = z.infer<typeof ArtifactData>;

/** Input of the Simulator. Serialized into the URL for sharing (src/engine/buildLink.ts). */
export const Build = z.object({
  weaponId: z.string(),
  guardianClass: GuardianClass,
  subclass: Subclass,
  catalyst: z.boolean(),
  // The weapon's setup charges are built before the damage phase (assumption "pre-stacked" of the
  // weapon's rules, e.g. Guidance Ring charges persist through stow); omitted: off.
  weaponPreBuilt: z.boolean().optional(),
  // How the weapon is played where its shots differ (DamageInstance.playstyle), e.g. "cayde-s-retribution"
  // for the Golden Gun shots of Still Hunt; omitted: the plain shot. The link carries only the
  // selectable ones.
  playstyle: z.string().optional(),
  // Exotic armor piece (exotic-armor.json, ADR 0014); omitted: none. At most one per build.
  exoticArmorId: z.string().optional(),
  // The kill buffs of the exotic are built up before the damage phase (ADR 0015); omitted: off.
  exoticPreBuilt: z.boolean().optional(),
  // The two Spirit perks of a Prismatic Exotic Class Item (ADR 0015, U6-3); it is the build's
  // exotic, so not together with exoticArmorId. Omitted: none.
  classPerkIds: z.array(z.string()).max(2).optional(),
  // The seasonal artifact (artifacts.json); the selections with provider "artifact" are its perks.
  artifactId: z.string().optional(),
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
  // Abilities with the times of their casts (ADR 0009); omitted in links of format 2.
  abilities: z
    .array(
      z.object({
        abilityId: z.string(),
        castsMs: z.array(z.number().nonnegative()),
      }),
    )
    .optional(),
  // Super, grenade and melee stat; omitted: no stat bonus.
  abilityStats: z
    .object({
      super: z.number().nonnegative(),
      grenade: z.number().nonnegative(),
      melee: z.number().nonnegative(),
    })
    .optional(),
  // Weapons stat (0 to 200); omitted: no stat bonus.
  weaponsStat: z.number().nonnegative().optional(),
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

/**
 * How the calculator treats one thing of the game (wiki page "Coverage of the calculator").
 * full: in the calculator; approx: in, but with a known estimate; missing: not in yet, with reason;
 * leftOut: no damage effect or left out on purpose, with reason.
 */
export const CatalogStatus = z.enum(["full", "approx", "missing", "leftOut"]);
export type CatalogStatus = z.infer<typeof CatalogStatus>;

export const CatalogEntry = z.object({
  name: z.string(),
  group: z.string(), // sub-heading in the category, e.g. an element or a guardian class
  status: CatalogStatus,
  inGame: z.string(), // what it does in the game (Compendium or Court)
  inCalculator: z.string(), // what it does in the calculator, or why it is missing
  detail: z.string().optional(), // second line under the name, e.g. the armor slot
  iconKey: z.string().optional(), // key for iconUrl in the UI
  // Manifest item of an icon found by name ("named:" keys): the import takes exactly this item
  iconHash: z.number().int().optional(),
  // The text in-game is the Compendium text because Clarity has none for this entry
  fallback: z.literal(true).optional(),
});
export type CatalogEntry = z.infer<typeof CatalogEntry>;

export const CatalogCategoryId = z.enum([
  "weapons",
  "catalysts",
  "subclass",
  "abilities",
  "aspects",
  "fragments",
  "buffs",
  "armor",
  "artifacts",
]);
export type CatalogCategoryId = z.infer<typeof CatalogCategoryId>;

/** src/data/coverage-catalog.json, written by npm run coverage. */
export const CoverageCatalog = z.array(
  z.object({
    id: CatalogCategoryId,
    title: z.string(),
    entries: z.array(CatalogEntry),
  }),
);
export type CoverageCatalog = z.infer<typeof CoverageCatalog>;

/** One buff or debuff of Court's Stacking Guide (ADR 0014); values stay text, e.g. "20%*\nat max". */
export const CourtEntry = z.object({
  category: z.string(), // e.g. "Global Debuffs" or "Exotic Intrinsics"
  group: z.string(), // first cell of the row block, e.g. "WEAKEN SANDBOX SOURCES"; empty in name lists
  name: z.string(),
  itemType: z.string().nullable(), // e.g. "Hunter Chest"
  requirement: z.string(), // column FOUND/REQUIREMENT
  trigger: z.string(),
  pve: z.string().nullable(), // PvE value; null in name lists without values
  pveDuration: z.string().nullable(),
  notes: z.string(),
});
export type CourtEntry = z.infer<typeof CourtEntry>;

/** One row of Court's overview "Damage Buff Categories", e.g. "EXOTICS INTRINSICS". */
export const CourtCategory = z.object({
  name: z.string(),
  description: z.string(),
  sources: z.string(), // e.g. "Most Exotic Weapons\nMost Exotic Armor"
  stacking: z.string(),
});
export type CourtCategory = z.infer<typeof CourtCategory>;

export const CourtSnapshot = z.object({
  source: Source,
  categories: z.array(CourtCategory),
  entries: z.array(CourtEntry),
});
export type CourtSnapshot = z.infer<typeof CourtSnapshot>;

/** One row of the Aegis tab "Weapons": a measured scenario of one weapon (ADR 0013). */
export const AegisWeaponRow = z.object({
  id: z.string(), // kebab-case from weapon type, name and assumptions
  weaponType: WeaponType,
  name: z.string(), // weapon name for exotics, frame for legendaries, e.g. "Truth" or "Adaptive frame"
  critShot: z.number().nullable(), // damage of one precision hit in the test, e.g. 5682
  bodyShot: z.number().nullable(),
  otherTicks: z.string(), // further damage as text, e.g. "490/36 cluster"; for cross-checks only
  assumptions: z.array(z.string()), // e.g. ["average", "Prototype Truthseeker", "Reaper's Tithe x4"]
  wipe: z.number(), // measured damage of all shots
  shots: z.number().int().positive(),
  fullModifiers: z.number().positive(), // standard multipliers of the test, e.g. 3.16
  perShot: z.number(), // "visual Value": wipe ÷ shots ÷ full modifiers
  gameVersion: z.string(),
});
export type AegisWeaponRow = z.infer<typeof AegisWeaponRow>;

export const AegisWeaponSnapshot = z.object({
  source: Source,
  rows: z.array(AegisWeaponRow),
});
export type AegisWeaponSnapshot = z.infer<typeof AegisWeaponSnapshot>;

/** One row of the Quantum tabs Primaries, Specials and Heavies (ADR 0013). */
export const QuantumWeaponRow = z.object({
  id: z.string(), // kebab-case from tab, weapon type, name and variant
  tab: z.enum(["primaries", "specials", "heavies"]),
  weaponType: WeaponType,
  name: z.string(), // weapon name for exotics, frame for legendaries
  variant: z.string(), // label in the first column, e.g. "cata"; empty for the base row
  totalDamage: z.number().nullable(), // "Theoretical Total Damage"
  magDamage: z.number().nullable(),
  magazine: z.number().nullable(),
  totalShots: z.number().nullable(), // "Reserves + Magazine"
  rpm: z.number().nullable(),
  reloadSeconds: z.number().nullable(),
  timeToEmptySeconds: z.number().nullable(),
  bodyDamage: z.number().nullable(),
  precisionDamage: z.number().nullable(),
  // Cells with text instead of a number, by column, e.g. { totalShots: "inf" }.
  textCells: z.record(z.string(), z.string()),
  note: z.string(),
});
export type QuantumWeaponRow = z.infer<typeof QuantumWeaponRow>;

export const QuantumWeaponSnapshot = z.object({
  source: Source,
  rows: z.array(QuantumWeaponRow),
});
export type QuantumWeaponSnapshot = z.infer<typeof QuantumWeaponSnapshot>;

/** One row of the Aegis tab "Sustained": a full ammo dump of one weapon (ADR 0013, point 7). */
export const AegisSustainedRow = z.object({
  id: z.string(), // kebab-case from name and assumptions
  name: z.string(), // first line of the name cell, e.g. "Truth"
  assumptions: z.array(z.string()), // further lines, e.g. ["Prototype Truthseeker", "Argent Ordnance"]
  ammo: z.enum(["primary", "special", "heavy"]),
  family: z.string(), // e.g. "rocket"
  shots: z.number().int().nonnegative(), // column "#"
  magazines: z.array(z.number().int().positive()), // column "Distribution", e.g. [3, 3, 3, 3, 2]
  repeating: z.boolean(), // distribution ends with "...": the last value repeats
  reloadMs: z.number().nullable(), // from the notes, e.g. "2134ms reload"
  chargeMs: z.number().nullable(),
  swapMs: z.number().nullable(), // swap instead of reload, e.g. Parasite with Envious Arsenal
  notes: z.string(),
  peakRateSeconds: z.number().nullable(), // column "peak Rate": time between two shots
  timeToEmptySeconds: z.number().nullable(), // column "TtE"
  base: z.number().nullable(), // column "Base": damage per shot without buffs
});
export type AegisSustainedRow = z.infer<typeof AegisSustainedRow>;

export const AegisSustainedSnapshot = z.object({
  source: Source,
  rows: z.array(AegisSustainedRow),
});
export type AegisSustainedSnapshot = z.infer<typeof AegisSustainedSnapshot>;

/**
 * Total damage of one item in the Aegis tabs "Sustained" or "Swap" under the standard factors of
 * Aegis; total = base × perk × surge × buff × debuff × stat × shots. Empty factors are null (1.0).
 * The meta probe (block 5) compares our builds against it.
 */
export const AegisTotalRow = z.object({
  id: z.string(), // kebab-case from tab, name and assumptions
  tab: z.enum(["sustained", "swap"]),
  name: z.string(), // first line of the name cell, e.g. "Blade Barrage"
  assumptions: z.array(z.string()), // e.g. ["Knock 'Em Down", "Limit Break"]
  type: z.string(), // column "Type", e.g. "power", "super", "burst"
  family: z.string().nullable(), // column "Family" (Sustained only), e.g. "rocket", "effect", "turret"
  // column "peak Rate" (Sustained only): seconds between two shots or ticks, e.g. 1.46 for Storm's Keep
  rateSeconds: z.number().nullable(),
  shots: z.number().nullable(), // column "#"; null for "INF"
  base: z.number().nullable(),
  perk: z.number().nullable(),
  surge: z.number().nullable(),
  buff: z.number().nullable(),
  debuff: z.number().nullable(),
  stat: z.number().nullable(), // column "200": the stat bonus at 200
  total: z.number().nullable(), // null for "INF"
});
export type AegisTotalRow = z.infer<typeof AegisTotalRow>;

export const AegisTotalsSnapshot = z.object({
  source: Source,
  rows: z.array(AegisTotalRow),
});
export type AegisTotalsSnapshot = z.infer<typeof AegisTotalsSnapshot>;

/** One entry of the Clarity database: a perk, catalyst or armor trait with its text (ADR 0013). */
export const ClarityEntry = z.object({
  hash: z.number().int(), // manifest hash of the perk
  name: z.string(),
  type: z.string(), // e.g. "Weapon Catalyst Exotic", "Weapon Frame Exotic", "Armor Trait Exotic"
  itemName: z.string().nullable(), // weapon or armor the perk belongs to, e.g. "Truth"
  text: z.string(), // English description as plain text, one line per paragraph
});
export type ClarityEntry = z.infer<typeof ClarityEntry>;

/**
 * d2foundry's reload formula of a weapon type or exotic: seconds until the ammo is in the magazine
 * = (evpp·stat² + vpp·stat + offset) × ammoPercent, stat 0 to 100.
 */
export const ReloadFormula = z.object({
  evpp: z.number(),
  vpp: z.number(),
  offset: z.number(),
  ammoPercent: z.number(),
});
export type ReloadFormula = z.infer<typeof ReloadFormula>;

export const ReloadFormulaSnapshot = z.object({
  source: Source,
  // by manifest weapon type, e.g. "rocketLauncher"; weapons: own category by manifest name
  types: z.record(
    z.string(),
    z.object({
      default: ReloadFormula,
      weapons: z.record(z.string(), ReloadFormula),
    }),
  ),
});
export type ReloadFormulaSnapshot = z.infer<typeof ReloadFormulaSnapshot>;

export const ClaritySnapshot = z.object({
  source: Source,
  entries: z.array(ClarityEntry),
});
export type ClaritySnapshot = z.infer<typeof ClaritySnapshot>;

/**
 * A decision of the weapon import that no rule makes (ADR 0013, point 7). It names its reason and
 * quotes a snapshot; a test checks the quote is still there.
 */
export const WeaponOverride = z.object({
  weapon: z.string(), // manifest name, e.g. "Sleeper Simulant"
  reason: z.string(), // in German, shown in the review table
  quotes: z
    .array(
      z.object({
        source: z.enum([
          "clarity",
          "compendium",
          "aegis",
          "quantum",
          "manifest",
        ]),
        // Clarity entry name, the start of the Compendium entry name, the id of an Aegis
        // (Weapons, Sustained) or Quantum row, or the manifest name of a weapon (text in its stats)
        entry: z.string(),
        text: z.string(), // exact text in that entry (for rows: in one of its cells)
      }),
    )
    .min(1),
  gap: z.string().optional(), // keep the weapon out with this reason
  base: z.string().optional(), // id of the Aegis Weapons row to use as the base
  // Aegis wins over Quantum where their scale differs (owner, 2026-10-23); the reason says what
  // the Aegis value holds that Quantum's does not.
  aegisWins: z.boolean().optional(),
  // Damage per shot: the "Base" of the Sustained row of the timing (Aegis' own value for that
  // execution), or a value derived in the reason; bullets per Aegis shot for bursts.
  perShotFromTiming: z.boolean().optional(),
  perShot: z.number().positive().optional(),
  bulletsPerShot: z.number().int().min(2).optional(),
  // Damage factor of the catalyst from a text (e.g. Vorpal Weapon +20 % for primaries), where no
  // row measures it; the reason gives the derivation.
  catalystFactor: z.number().min(1).optional(),
  // What the catalyst does against one boss, where the text rule cannot tell (reason says why)
  catalystEffect: z.enum(["none", "unknown"]).optional(),
  // The catalyst option counts only this long from the weapon's first shot (WeaponOption.windowSeconds)
  catalystWindowSeconds: z.number().positive().optional(),
  // Scorch per shot where the text gives it per explosion, e.g. 9 x 10 for One Thousand Voices
  scorchStacksPerShot: z.number().int().positive().optional(),
  // The shot is the single hit of the base row (not its average); every Nth shot adds `hits` of the
  // tick that the row's other ticks name (`tick`, default "cluster": "490/36 cluster"), e.g. Truth with
  // Prototype Trueseeker, or Perfect Fifth of Polaris Lance ("310 Perfect Fifth") with its delay and
  // scorch per hit from the text.
  nthShotPart: z
    .object({
      name: z.string(),
      every: z.number().int().min(2),
      hits: z.number().int().positive(),
      tick: z.string().optional(),
      // The tick "A/B" names two parts of one hit that add up, e.g. explosion and impact of a
      // Barrow-Dyad seeker ("1172/97 seeker"); omitted: only A counts (Truth "490/36 cluster")
      sumTick: z.boolean().optional(),
      delaySeconds: z.number().positive().optional(),
      tickIntervalSeconds: z.number().positive().optional(), // between the hits; omitted: at once
      scorchPerHit: z.number().int().positive().optional(),
    })
    .optional(),
  // Playstyles whose shots replace the weapon's shot (Build.playstyle). A row with ticks "N 2nd, N 3rd"
  // gives a sequence at the weapon's interval, e.g. "all three shots" of Still Hunt with Cayde's
  // Retribution ("6412 2nd, 8402 3rd"); any other row one shot of its value per shot, every
  // `intervalSeconds` (derived in the reason), e.g. a lower charge of Whirling Ovation.
  playstyleParts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        row: z.string(), // id of the Aegis Weapons row
        intervalSeconds: z.number().positive().optional(),
        selectable: z.boolean().optional(), // the build picker offers it
      }),
    )
    .optional(),
  // Label of the plain shot in the build picker, where it offers playstyles
  playstyleBaseName: z.string().optional(),
  // A setup the shots build and deploy (WeaponSetup): the shot from a Quantum row without it, the
  // extra hits from the row with it; the reason derives the numbers from the quotes.
  setup: z
    .object({
      name: z.string(),
      shotsBefore: z.number().int().positive(),
      shotsBeforePreBuilt: z.number().int().positive(),
      durationSeconds: z.number().positive(),
      shotRow: z.string(), // Quantum row without the setup
      setupRow: z.string(), // Quantum row with it
      hits: z.number().int().positive(), // extra hits per shot, e.g. 3 seekers
      scorchPerHit: z.number().int().positive().optional(),
      catalystTimingOnceDeployed: z.boolean(),
      // A playstyle with more of these hits per shot (Build.playstyle), e.g. an arrow through two rings
      playstyle: z
        .object({ id: z.string(), name: z.string(), hits: z.number().int().positive() })
        .optional(),
    })
    .optional(),
  timing: z
    .object({
      from: z.enum(["Aegis", "Quantum"]), // use this source even if a rule would not
      row: z.string().optional(), // id of the Sustained or Quantum row of the timing
      // The row plays with the catalyst: it is the timing with it; without it from "magazine",
      // else from the numbers Clarity names ("6🠚8").
      rowHasCatalyst: z.boolean().optional(),
      magazine: z.number().int().positive().optional(),
      catalystRow: z.string().optional(), // Quantum or Sustained row of the timing with catalyst
      noReloads: z.boolean().optional(), // all ammo is one magazine (no reload, or inside the rate)
      // One shot uses this much ammo, the row counts ammo (e.g. Choir of One: 5 per projectile)
      ammoPerShot: z.number().int().min(2).optional(),
      // Shots in the row's time to empty, where the row counts something else (swords: combos)
      shots: z.number().int().positive().optional(),
      totalShots: z.number().int().positive().optional(),
      addIntervalSeconds: z.number().optional(), // e.g. a longer charge without the catalyst
      // Timing with the catalyst: the base timing with these values instead (e.g. more reserves)
      catalystValues: z
        .object({
          magazine: z.number().int().positive().optional(),
          totalShots: z.number().int().positive().optional(),
        })
        .optional(),
      // Timing where no row has one: values the reason derives (manifest stats, Quantum's reload
      // per weapon type). The reload follows the interval of the last shot, as with Quantum.
      values: z
        .object({
          magazine: z.number().int().positive(),
          totalShots: z.number().int().positive().nullable(), // null: primary ammo
          intervalSeconds: z.number().positive(),
          reloadSeconds: z.number().min(0),
        })
        .optional(),
    })
    .optional(),
});
export type WeaponOverride = z.infer<typeof WeaponOverride>;
