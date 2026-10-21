// Data Files loaded once for the UI, validated by the engine loaders.

import rawAbilities from "../data/abilities.json";
import rawAbilityStats from "../data/ability-stats.json";
import rawAegisAbilities from "../data/aegis-abilities.json";
import rawBosses from "../data/bosses.json";
import rawBuckets from "../data/buckets.json";
import rawEffects from "../data/effects.json";
import rawIcons from "../data/icons.json";
import rawKeywords from "../data/keywords.json";
import rawManifestAbilities from "../data/manifest-abilities.json";
import rawPackages from "../data/weapon-packages.json";
import type { Weapon } from "../data/schema";
import type { LinkRegistry } from "../engine/buildLink";
import { loadAbilities } from "../engine/loadAbilities";
import { loadKeywords } from "../engine/loadKeywords";
import {
  loadAbilityStats,
  loadAegisAbilityRows,
  loadBosses,
  loadBuckets,
  loadEffects,
  loadIconIndex,
  loadManifestAbilities,
} from "../engine/loadData";
import { loadWeapons } from "../engine/loadWeapon";

// Imported packages (ADR 0013; no hand models, ADR 0015 point 11), sorted by name.
export const weapons = loadWeapons(rawPackages).sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const DEFAULT_WEAPON_ID = "one-thousand-voices";
/** The weapon of a build; One Thousand Voices if the id is unknown. */
export const weaponById = (id: string): Weapon =>
  weapons.find((w) => w.id === id) ??
  weapons.find((w) => w.id === DEFAULT_WEAPON_ID)!;
export const buckets = loadBuckets(rawBuckets);
export const effects = loadEffects(rawEffects);
export const bosses = loadBosses(rawBosses).filter(
  (boss) => boss.damagePhaseSeconds.value !== null,
);
export const activities = [...new Set(bosses.map((boss) => boss.activity))];
export const abilityStats = loadAbilityStats(rawAbilityStats);
export const aegisRows = loadAegisAbilityRows(rawAegisAbilities);
export const keywords = loadKeywords(rawKeywords, aegisRows);
// Packages take their values from the Aegis rows, providers from the manifest items (ADR 0009).
export const abilities = loadAbilities(
  rawAbilities,
  aegisRows,
  abilityStats,
  loadManifestAbilities(rawManifestAbilities),
  { effects, buckets },
);
export const linkRegistry: LinkRegistry = {
  weapons,
  effects,
  abilities,
};

const icons = loadIconIndex(rawIcons).icons;

/** URL of an imported Bungie icon (ADR 0008), e.g. iconUrl("effect:radiant"); undefined if missing. */
export function iconUrl(key: string): string | undefined {
  const path = icons[key];
  return path ? `${import.meta.env.BASE_URL}${path}` : undefined;
}
