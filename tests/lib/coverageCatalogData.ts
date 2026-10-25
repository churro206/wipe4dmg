// The input of the coverage catalog (scripts/lib/coverageCatalog.ts) from the data files of the model;
// the catalog is the wiki page "Coverage of the calculator" (src/data/coverage-catalog.json).

import { buildArtifacts } from "../../scripts/lib/artifacts";
import { loadArtifactInputs } from "../../scripts/lib/artifactInputs";
import {
  abilityEntries,
  armorEntries,
  artifactEntries,
  buffEntries,
  buildCatalog,
  catalystEntries,
  classAbilityEntries,
  glossaryEntries,
  subclassItemEntries,
  weaponEntries,
  type GeneralState,
  type WeaponInput,
} from "../../scripts/lib/coverageCatalog";
import { loadSubclassEffectInputs } from "../../scripts/lib/subclassEffectInputs";
import { subclassEffects } from "../../scripts/lib/subclassEffects";
import rawGaps from "../../src/data/ability-gaps.json";
import rawArmor from "../../src/data/compendium-armor.json";
import rawAbilities from "../../src/data/compendium-abilities.json";
import rawClass from "../../src/data/compendium-class.json";
import rawArtifacts from "../../src/data/compendium-artifacts.json";
import rawClarity from "../../src/data/clarity.json";
import rawCourt from "../../src/data/court-buffs.json";
import rawIcons from "../../src/data/icons.json";
import rawManifestAbilities from "../../src/data/manifest-abilities.json";
import rawManifestWeapons from "../../src/data/manifest-weapons.json";
import rawWeaponGaps from "../../src/data/weapon-gaps.json";
import rawWeapons from "../../src/data/compendium-weapons.json";
import {
  AbilityGap,
  ClaritySnapshot,
  CompendiumSnapshot,
  CounterId,
  CourtSnapshot,
  ManifestAbilities,
  ManifestWeapons,
  StatusId,
  WeaponGap,
  type CoverageCatalog,
  type Weapon,
} from "../../src/data/schema";
import { abilityCoverage } from "../../src/engine/coverage";
import { describeCatalyst } from "../../src/ui/describe";
import {
  abilities,
  aegisRows,
  effects,
  exoticArmor,
  keywords,
  weapons,
} from "../../src/ui/data";

const icons: Record<string, string> = rawIcons.icons;

/** What the model does with the catalyst; the lines from "In game:" on are the game text, which Clarity gives. */
function modelLines(weapon: Weapon): string[] {
  const lines = describeCatalyst(weapon);
  const gameText = lines.findIndex((line) => line.startsWith("In game:"));
  return gameText < 0 ? lines : lines.slice(0, gameText);
}

// The general buffs and debuffs (owner, 2026-10-25): states that stand for themselves in the game.
// What a weapon, armor piece, aspect, fragment, super or artifact perk gives is told at that item.
// category: Court's category (stacking rule); court: its row with trigger and value, if it has one.
const GENERAL_STATES: GeneralState[] = [
  { name: "Weaken", category: "Global Debuffs", iconKey: "effect:weaken" },
  { name: "Radiant", category: "Empowering Buffs", iconKey: "effect:radiant" },
  {
    name: "Empowering Rift",
    category: "Empowering Buffs",
    court: "Empowering Rift",
    iconKey: "effect:empowering-rift",
  },
  {
    name: "Well of Radiance",
    category: "Empowering Buffs",
    court: "Well of Radiance",
    iconKey: "effect:well-of-radiance",
  },
  {
    name: "Weapons of Light",
    category: "Empowering Buffs",
    court: "Weapons of Light",
    iconKey: "effect:banner-shield",
  },
  {
    name: "Weapon Surge",
    category: "Weapon Surges",
    court: "Kinetic Surge Mod",
    iconKey: "surge:kinetic",
  },
];

export function realCatalog(): CoverageCatalog {
  const abilityTexts = CompendiumSnapshot.parse(rawAbilities).entries;
  // Effects and the states and counters of the model carry the names of the glossary terms.
  const statusName = (id: string) => {
    const words = id.replace(/([A-Z])/g, " $1"); // "frostArmor" -> "frost Armor"
    return words.charAt(0).toUpperCase() + words.slice(1);
  };
  const effectNames = [
    ...effects.map((e) => e.name),
    ...StatusId.options.map(statusName),
    "Overshield", // the glossary leaves out "Void"
    ...CounterId.options.map(statusName), // Scorch
  ];
  const subclassRows = subclassEffects(loadSubclassEffectInputs()).rows;
  const subclassItems = ManifestAbilities.parse(rawManifestAbilities).subclassItems ?? [];
  const clarity = ClaritySnapshot.parse(rawClarity).entries;
  const court = CourtSnapshot.parse(rawCourt);
  const weaponInputs: WeaponInput[] = weapons.map((w) => ({
    id: w.id,
    name: w.name,
    damageInstances: w.damageInstances.length,
    intrinsics: w.intrinsics.length,
    catalyst: w.catalyst
      ? {
          effect: w.catalyst.effect,
          lines: modelLines(w),
        }
      : null,
  }));
  const weaponNames = ManifestWeapons.parse(rawManifestWeapons).weapons.map((w) => ({
    name: w.name,
    hash: w.hash,
    catalyst: w.catalyst ? { name: w.catalyst.name, hash: w.catalyst.hash } : null,
  }));
  const weaponTexts = CompendiumSnapshot.parse(rawWeapons).entries;
  return buildCatalog(
    {
      weapons: weaponEntries({
        entries: weaponTexts,
        names: weaponNames,
        weapons: weaponInputs,
        gaps: WeaponGap.array().parse(rawWeaponGaps),
        clarity,
      }),
      catalysts: catalystEntries({
        entries: weaponTexts,
        names: weaponNames,
        weapons: weaponInputs,
        clarity,
      }),
      subclass: glossaryEntries({
        entries: abilityTexts,
        keywordLinks: keywords.map((k) => k.compendium),
        effectNames,
      }),
      abilities: [
        ...abilityEntries(
          abilityCoverage(
            abilityTexts,
            abilities,
            aegisRows,
            AbilityGap.array().parse(rawGaps),
          ),
          abilityTexts,
        ),
        ...classAbilityEntries({
          entries: abilityTexts,
          modelled: abilities.flatMap((a) =>
            a.kind === "classAbility" && a.compendium
              ? [{ tab: a.compendium.tab, entry: a.compendium.entry, id: a.id }]
              : [],
          ),
          effectNames,
        }),
      ],
      aspects: subclassItemEntries({
        rows: subclassRows,
        items: subclassItems,
        entries: abilityTexts,
        clarity,
        section: "aspect",
      }),
      fragments: subclassItemEntries({
        rows: subclassRows,
        items: subclassItems,
        entries: abilityTexts,
        clarity,
        section: "fragment",
      }),
      buffs: buffEntries({
        states: GENERAL_STATES,
        court: court.entries,
        categories: court.categories,
      }),
      armor: armorEntries({
        entries: CompendiumSnapshot.parse(rawArmor).entries,
        perks: CompendiumSnapshot.parse(rawClass).entries,
        armor: exoticArmor,
        clarity,
      }),
      artifacts: artifactEntries({
        rows: buildArtifacts(loadArtifactInputs()).rows,
        entries: CompendiumSnapshot.parse(rawArtifacts).entries,
      }),
    },
    (key) => key in icons,
  );
}
