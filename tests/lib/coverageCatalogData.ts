// The input of the coverage catalog (scripts/lib/coverageCatalog.ts) from the data files of the model;
// the catalog is the wiki page "Coverage of the calculator" (src/data/coverage-catalog.json).

import { buildArtifacts } from "../../scripts/lib/artifacts";
import { loadArtifactInputs } from "../../scripts/lib/artifactInputs";
import { loadBuffInputs } from "../../scripts/lib/buffInputs";
import { buffEffects } from "../../scripts/lib/buffs";
import {
  abilityEntries,
  armorEntries,
  artifactEntries,
  buffEntries,
  buildCatalog,
  classAbilityEntries,
  glossaryEntries,
  subclassItemEntries,
  weaponEntries,
} from "../../scripts/lib/coverageCatalog";
import { loadSubclassEffectInputs } from "../../scripts/lib/subclassEffectInputs";
import { subclassEffects } from "../../scripts/lib/subclassEffects";
import rawGaps from "../../src/data/ability-gaps.json";
import rawArmor from "../../src/data/compendium-armor.json";
import rawAbilities from "../../src/data/compendium-abilities.json";
import rawClass from "../../src/data/compendium-class.json";
import rawArtifacts from "../../src/data/compendium-artifacts.json";
import rawCourt from "../../src/data/court-buffs.json";
import rawIcons from "../../src/data/icons.json";
import rawManifestAbilities from "../../src/data/manifest-abilities.json";
import rawManifestWeapons from "../../src/data/manifest-weapons.json";
import rawWeaponGaps from "../../src/data/weapon-gaps.json";
import rawWeapons from "../../src/data/compendium-weapons.json";
import {
  AbilityGap,
  CompendiumSnapshot,
  CounterId,
  CourtSnapshot,
  ManifestAbilities,
  ManifestWeapons,
  StatusId,
  WeaponGap,
  type CoverageCatalog,
} from "../../src/data/schema";
import { abilityCoverage } from "../../src/engine/coverage";
import {
  abilities,
  aegisRows,
  effects,
  exoticArmor,
  keywords,
  weapons,
} from "../../src/ui/data";

const icons: Record<string, string> = rawIcons.icons;

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
  return buildCatalog(
    {
      weapons: weaponEntries({
        entries: CompendiumSnapshot.parse(rawWeapons).entries,
        names: ManifestWeapons.parse(rawManifestWeapons).weapons.map((w) => ({
          name: w.name,
          catalyst: w.catalyst !== null,
        })),
        weapons: weapons.map((w) => ({
          id: w.id,
          name: w.name,
          damageInstances: w.damageInstances.length,
          intrinsics: w.intrinsics.length,
          catalyst: w.catalyst !== undefined,
        })),
        gaps: WeaponGap.array().parse(rawWeaponGaps),
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
        section: "aspect",
      }),
      fragments: subclassItemEntries({
        rows: subclassRows,
        items: subclassItems,
        entries: abilityTexts,
        section: "fragment",
      }),
      buffs: buffEntries({
        rows: buffEffects(loadBuffInputs()).rows,
        court: CourtSnapshot.parse(rawCourt).entries,
      }),
      armor: armorEntries({
        entries: CompendiumSnapshot.parse(rawArmor).entries,
        perks: CompendiumSnapshot.parse(rawClass).entries,
        armor: exoticArmor,
      }),
      artifacts: artifactEntries({
        rows: buildArtifacts(loadArtifactInputs()).rows,
        entries: CompendiumSnapshot.parse(rawArtifacts).entries,
      }),
    },
    (key) => key in icons,
  );
}
