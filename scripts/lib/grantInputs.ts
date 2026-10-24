// Reads the Data Files the ability grants need. Shared by npm run build:grants and the test that checks
// the generated file is current.

import { readFileSync } from "node:fs";
import {
  AbilityData,
  CompendiumSnapshot,
  CourtSnapshot,
  Effect,
} from "../../src/data/schema.ts";
import type { GrantInputs } from "./abilityGrants.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown => JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadGrantInputs(): GrantInputs {
  const compendium = CompendiumSnapshot.parse(read("compendium-abilities.json"));
  const court = CourtSnapshot.parse(read("court-buffs.json"));
  return {
    abilities: AbilityData.array().parse(read("abilities.json")),
    compendium: compendium.entries,
    court: court.entries,
    effects: Effect.array().parse(read("effects.json")),
    retrieved: compendium.source.retrieved,
    courtRetrieved: court.source.retrieved,
  };
}
