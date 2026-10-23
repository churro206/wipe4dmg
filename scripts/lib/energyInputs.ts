// Reads the Data Files the energy data needs. Shared by npm run build:energy and the test that checks
// the generated file is current.

import { readFileSync } from "node:fs";
import { AbilityData, CompendiumSnapshot } from "../../src/data/schema.ts";
import type { EnergyInputs } from "./energy.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown => JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadEnergyInputs(): EnergyInputs {
  const abilities = CompendiumSnapshot.parse(read("compendium-abilities.json"));
  const armor = CompendiumSnapshot.parse(read("compendium-armor.json"));
  return {
    abilities: AbilityData.array().parse(read("abilities.json")),
    compendiumAbilities: abilities.entries,
    compendiumArmor: armor.entries,
    retrieved: abilities.source.retrieved,
  };
}
