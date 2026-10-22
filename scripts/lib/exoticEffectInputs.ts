// Reads the Data Files the exotic effects need (ADR 0015, U6-1). Shared by npm run build:armor and
// the test that checks the generated files are current.

import { readFileSync } from "node:fs";
import {
  AbilityData,
  ClaritySnapshot,
  CompendiumSnapshot,
  CourtSnapshot,
  ExoticArmorEntry,
} from "../../src/data/schema.ts";
import type { ExoticEffectInputs } from "./exoticEffects.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadExoticEffectInputs(
  armor = ExoticArmorEntry.array().parse(read("exotic-armor.json")),
): ExoticEffectInputs {
  const compendium = CompendiumSnapshot.parse(read("compendium-armor.json"));
  const clarity = ClaritySnapshot.parse(read("clarity.json"));
  return {
    armor,
    compendium: compendium.entries,
    clarity: clarity.entries.filter((e) => e.type === "Armor Trait Exotic"),
    abilities: AbilityData.array().parse(read("abilities.json")),
    sources: {
      court: CourtSnapshot.parse(read("court-buffs.json")).source,
      compendium: compendium.source,
      clarity: clarity.source,
    },
  };
}
