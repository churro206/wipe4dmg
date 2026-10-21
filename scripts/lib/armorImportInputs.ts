// Reads the Data Files the armor import needs (ADR 0014). Shared by npm run build:armor and
// the test that checks the generated files are current.

import { readFileSync } from "node:fs";
import {
  AegisAbilityRow,
  ClaritySnapshot,
  CompendiumSnapshot,
  CourtSnapshot,
  ManifestArmor,
} from "../../src/data/schema.ts";
import type { ArmorImportInputs } from "./exoticArmor.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

const courtOf = (snapshot: CourtSnapshot) => ({
  court: snapshot.entries,
  courtCategories: snapshot.categories,
});

export function loadArmorImportInputs(): ArmorImportInputs {
  return {
    armor: ManifestArmor.parse(read("manifest-armor.json")).armor,
    aegisAbilities: AegisAbilityRow.array().parse(read("aegis-abilities.json")),
    ...courtOf(CourtSnapshot.parse(read("court-buffs.json"))),
    compendium: CompendiumSnapshot.parse(read("compendium-armor.json")).entries,
    clarity: ClaritySnapshot.parse(read("clarity.json")).entries.filter(
      (e) => e.type === "Armor Trait Exotic",
    ),
  };
}
