// Data Files loaded once for the UI, validated by the engine loaders.

import rawAbilities from "../data/abilities.json";
import rawAbilityComponents from "../data/ability-components.json";
import rawAbilityEnergy from "../data/ability-energy.json";
import rawAbilityGrants from "../data/ability-grants.json";
import rawAbilityKeywords from "../data/ability-keywords.json";
import rawAbilityStats from "../data/ability-stats.json";
import rawAegisAbilities from "../data/aegis-abilities.json";
import rawArtifacts from "../data/artifacts.json";
import rawBosses from "../data/bosses.json";
import rawBuckets from "../data/buckets.json";
import rawBuffEffects from "../data/buff-effects.json";
import rawCastTimes from "../data/cast-times.json";
import rawCoverageCatalog from "../data/coverage-catalog.json";
import rawEffects from "../data/effects.json";
import rawIcons from "../data/icons.json";
import rawKeywords from "../data/keywords.json";
import rawManifestAbilities from "../data/manifest-abilities.json";
import rawSubclassEffects from "../data/subclass-effects.json";
import rawSuperTimings from "../data/super-timings.json";
import rawPackages from "../data/weapon-packages.json";
import rawWeaponStats from "../data/weapon-stats.json";
import rawExoticArmorEffects from "../data/exotic-armor-effects.json";
import rawExoticArmor from "../data/exotic-armor.json";
import {
  AbilityComponents,
  AbilityGrant,
  AbilityKeyword,
  ArtifactData,
  CastTimes,
  CoverageCatalog,
  EnergyData,
  ExoticArmorEffect,
  ExoticArmorEntry,
  SuperTiming,
  type Weapon,
} from "../data/schema";
import type { LinkRegistry } from "../engine/buildLink";
import type { GameData } from "../engine/buildSimulation";
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
  loadSubclassEffects,
  loadWeaponStats,
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
// Effects of effects.json and of the aspects and fragments (ADR 0015, U6-2). An aspect or fragment
// whose effect works only built up before the damage phase (e.g. Volatile Rounds after kills) counts
// as built up when it is selected (owner, U8).
export const baseEffects = loadEffects(rawEffects);
export const effects = [
  ...baseEffects,
  ...loadEffects(rawBuffEffects), // Court buffs, debuffs and artifact perks (npm run build:buffs)
  ...loadSubclassEffects(rawSubclassEffects, { preBuilt: true }),
];
export const bosses = loadBosses(rawBosses).filter(
  (boss) => boss.damagePhaseSeconds.value !== null,
);
/** Raids and dungeons alphabetically; the encounters inside keep their order in the game. */
export const activities = [...new Set(bosses.map((boss) => boss.activity))].sort(
  (a, b) => a.localeCompare(b, "en"),
);
export const abilityStats = loadAbilityStats(rawAbilityStats);
export const weaponStats = loadWeaponStats(rawWeaponStats);
export const aegisRows = loadAegisAbilityRows(rawAegisAbilities);
export const keywords = loadKeywords(rawKeywords, aegisRows);
// Exotic armor (ADR 0014) and the effects generated from its damage buffs (ADR 0015, U6).
export const exoticArmor = ExoticArmorEntry.array().parse(rawExoticArmor);
// Packages take their values from the Aegis rows unless ability-components.json has components
// from the Compendium (U9), providers from the manifest items (ADR 0009),
// keywords from ability-keywords.json (ADR 0015, U5), variants with exotic armor (ADR 0014), hits
// and super windows from super-timings.json.
export const abilities = loadAbilities(
  rawAbilities,
  aegisRows,
  abilityStats,
  loadManifestAbilities(rawManifestAbilities),
  { effects, buckets },
  AbilityKeyword.array().parse(rawAbilityKeywords),
  exoticArmor,
  SuperTiming.array().parse(rawSuperTimings),
  AbilityComponents.array().parse(rawAbilityComponents),
);
export const generatedExoticEffects = ExoticArmorEffect.array().parse(
  rawExoticArmorEffects,
);
// Seasonal artifacts with their perks per tier (npm run build:artifacts).
export const artifactData = ArtifactData.parse(rawArtifacts);
// What the calculator covers, for the wiki page "Coverage of the calculator" (npm run coverage).
export const coverageCatalog = CoverageCatalog.parse(rawCoverageCatalog);
// Everything a build refers to, for buildSimulation (src/engine/buildSimulation.ts).
export const gameData: GameData = {
  effects,
  abilities,
  abilityStats,
  weaponStats,
  keywords,
  exoticArmor,
  exoticArmorEffects: generatedExoticEffects,
  artifacts: artifactData,
  // Cooldowns, stat factors and energy modifiers (npm run build:energy)
  energy: EnergyData.parse(rawAbilityEnergy),
  // Effects at every cast or hit, e.g. Radiant from Acrobat's Dodge (npm run build:grants)
  abilityGrants: AbilityGrant.array().parse(rawAbilityGrants),
  // How long a cast keeps the player busy (cast-times.json)
  castTimes: CastTimes.parse(rawCastTimes),
};
export const linkRegistry: LinkRegistry = {
  weapons,
  effects,
  abilities,
  exoticArmor,
  artifacts: artifactData.artifacts,
};

const importedIcons = loadIconIndex(rawIcons).icons;
// A variant with exotic armor or an effect (ADR 0014) shows the icon of its ability.
const icons: Record<string, string> = {
  ...Object.fromEntries(
    abilities.flatMap((a) => {
      const path = a.variantOf && importedIcons[`ability:${a.variantOf}`];
      return path ? [[`ability:${a.id}`, path]] : [];
    }),
  ),
  ...importedIcons,
};

/** URL of an imported Bungie icon (ADR 0008), e.g. iconUrl("effect:radiant"); undefined if missing. */
export function iconUrl(key: string): string | undefined {
  const path = icons[key];
  return path ? `${import.meta.env.BASE_URL}${path}` : undefined;
}
