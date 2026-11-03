// Reads the Data Files the weapon import needs (ADR 0013). Shared by npm run build:weapons and
// the test that checks the generated files are current.

import { existsSync, readFileSync } from "node:fs";
import {
  AegisSustainedSnapshot,
  AegisWeaponSnapshot,
  ClaritySnapshot,
  CompendiumSnapshot,
  Effect,
  keywordDataOf,
  ManifestArmor,
  ManifestTerms,
  ManifestWeapons,
  QuantumWeaponSnapshot,
  ReloadFormulaSnapshot,
  WeaponOverride,
} from "../../src/data/schema.ts";
import { loadWeaponItems } from "./items/loadItems.ts";
import type { WeaponImportInputs } from "./weaponPackages.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadWeaponImportInputs(): WeaponImportInputs {
  const manifest = ManifestWeapons.parse(read("manifest-weapons.json"));
  const codesFile = new URL("weapon-codes.json", DATA);
  const aegis = AegisWeaponSnapshot.parse(read("aegis-weapons.json"));
  const sustained = AegisSustainedSnapshot.parse(read("aegis-sustained.json"));
  const quantum = QuantumWeaponSnapshot.parse(read("quantum-weapons.json"));
  const compendium = CompendiumSnapshot.parse(read("compendium-weapons.json"));
  const clarity = ClaritySnapshot.parse(read("clarity.json"));
  const reload = ReloadFormulaSnapshot.parse(read("reload-formulas.json"));
  const codes: Record<string, number> = existsSync(codesFile)
    ? (read("weapon-codes.json") as Record<string, number>)
    : {};
  return {
    aegis,
    sustained,
    quantum,
    manifestVersion: manifest.manifestVersion,
    manifest: manifest.weapons,
    armor: ManifestArmor.parse(read("manifest-armor.json")).armor,
    terms: ManifestTerms.parse(read("manifest-terms.json")).terms,
    compendium: compendium.entries,
    effects: Effect.array().parse(read("effects.json")),
    keywords: keywordDataOf(read("keywords.json")),
    clarity: clarity.entries,
    overrides: WeaponOverride.array().parse(read("weapon-overrides.json")),
    reloadFormulas: reload,
    codes,
    items: loadWeaponItems({ aegis, sustained, quantum, manifest, clarity, compendium, reload, codes }),
  };
}
