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

export const Weapon = z.object({
  id: z.string(),
  name: z.string(),
  manifestHash: z.number().int(),
  gameVersion: z.string(), // game version the data refers to, e.g. "9.7.0.5"
  element: z.enum(["kinetic", "arc", "solar", "void", "stasis", "strand"]),
  ammo: z.enum(["primary", "special", "heavy"]),
  chargeTimeMs: SourcedNumber, // time from the start of the damage phase to the first shot
  fireRateRpm: SourcedNumber, // shots per minute within a magazine; for charged weapons the full cycle
  magazine: SourcedNumber,
  totalShots: SourcedNumber, // magazine plus reserves
  reloadTimeMs: SourcedNumber, // extra time after the last shot of a magazine, on top of the shot interval
  damageInstances: z.array(DamageInstance).min(1),
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

/** A Buff, Debuff, Surge or Weapon Perk that changes damage. */
export const Effect = z.object({
  id: z.string(),
  name: z.string(),
  bucketId: z.string(), // reference to Bucket.id
  multiplier: SourcedNumber, // e.g. 1.25
  durationMs: SourcedNumber, // value null + status "verified" = permanent
  appliesTo: z.array(z.string()), // DamageInstance ids, or ["all"]
  category: z.enum([
    "subclass",
    "armor",
    "artifact",
    "fireteamSupport",
    "weapon",
  ]),
});
export type Effect = z.infer<typeof Effect>;

/** Community or own reference value for tests. */
export const ReferenceValue = z.object({
  id: z.string(),
  description: z.string(),
  totalDamageMin: z.number(),
  totalDamageMax: z.number(),
  conditions: z.array(z.string()),
  source: Source,
});
export type ReferenceValue = z.infer<typeof ReferenceValue>;

/** Input of the Simulator. Serialized into the URL for sharing. */
export const Build = z.object({
  weaponId: z.string(),
  catalyst: z.boolean(),
  effectIds: z.array(z.string()),
  damagePhaseSeconds: z.number().positive(),
});
export type Build = z.infer<typeof Build>;
