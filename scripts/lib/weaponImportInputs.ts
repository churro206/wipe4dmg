// Reads the Data Files the weapon import needs (ADR 0013). Shared by npm run build:weapons and
// the test that checks the generated files are current.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  AegisSustainedSnapshot,
  AegisWeaponSnapshot,
  CompendiumSnapshot,
  Effect,
  ManifestArmor,
  ManifestTerms,
  ManifestWeapons,
  QuantumWeaponSnapshot,
  Weapon,
} from "../../src/data/schema.ts";
import type { WeaponImportInputs } from "./weaponPackages.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadWeaponImportInputs(): WeaponImportInputs {
  const manifest = ManifestWeapons.parse(read("manifest-weapons.json"));
  const codesFile = new URL("weapon-codes.json", DATA);
  return {
    aegis: AegisWeaponSnapshot.parse(read("aegis-weapons.json")),
    sustained: AegisSustainedSnapshot.parse(read("aegis-sustained.json")),
    quantum: QuantumWeaponSnapshot.parse(read("quantum-weapons.json")),
    manifestVersion: manifest.manifestVersion,
    manifest: manifest.weapons,
    armor: ManifestArmor.parse(read("manifest-armor.json")).armor,
    terms: ManifestTerms.parse(read("manifest-terms.json")).terms,
    compendium: CompendiumSnapshot.parse(read("compendium-weapons.json"))
      .entries,
    effects: Effect.array().parse(read("effects.json")),
    // Hand-modelled weapons (ADR 0012) win over the import (ADR 0013, point 12).
    handModelled: readdirSync(new URL("weapons/", DATA))
      .filter((file) => file.endsWith(".json"))
      .map((file) => Weapon.parse(read(`weapons/${file}`))),
    codes: existsSync(codesFile)
      ? (read("weapon-codes.json") as Record<string, number>)
      : {},
  };
}
