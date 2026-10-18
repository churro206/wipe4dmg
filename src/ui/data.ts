// Data Files loaded once for the UI, validated by the engine loaders.

import rawBosses from "../data/bosses.json";
import rawBuckets from "../data/buckets.json";
import rawEffects from "../data/effects.json";
import raw from "../data/weapons/one-thousand-voices.json";
import type { LinkRegistry } from "../engine/buildLink";
import { loadBosses, loadBuckets, loadEffects } from "../engine/loadData";
import { loadWeapon } from "../engine/loadWeapon";

export const weapon = loadWeapon(raw);
export const buckets = loadBuckets(rawBuckets);
export const effects = loadEffects(rawEffects);
export const bosses = loadBosses(rawBosses).filter(
  (boss) => boss.damagePhaseSeconds.value !== null,
);
export const activities = [...new Set(bosses.map((boss) => boss.activity))];
export const linkRegistry: LinkRegistry = { weapons: [weapon], effects };
