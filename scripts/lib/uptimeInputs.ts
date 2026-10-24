// Reads the Data Files the uptime rule needs. Shared by npm run build:uptime and its test.

import { readFileSync } from "node:fs";
import {
  ClaritySnapshot,
  CompendiumSnapshot,
  CourtSnapshot,
  Effect,
  ExoticArmorEffect,
  SubclassEffect,
} from "../../src/data/schema.ts";
import type { UptimeInputs } from "./uptime.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown => JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

const COMPENDIUM = [
  "compendium-abilities.json",
  "compendium-armor.json",
  "compendium-class.json",
  "compendium-artifacts.json",
];

export function loadUptimeInputs(): UptimeInputs {
  const plain = (file: string) =>
    Effect.array()
      .parse(read(file))
      .map((effect) => ({ file, effect }));
  return {
    effects: [
      ...plain("effects.json"),
      ...plain("buff-effects.json"),
      ...SubclassEffect.array()
        .parse(read("subclass-effects.json"))
        .map((e) => ({ file: "subclass-effects.json", effect: e.effect })),
      ...ExoticArmorEffect.array()
        .parse(read("exotic-armor-effects.json"))
        .map((e) => ({ file: "exotic-armor-effects.json", effect: e.effect })),
    ],
    compendium: COMPENDIUM.flatMap((file) => CompendiumSnapshot.parse(read(file)).entries),
    court: CourtSnapshot.parse(read("court-buffs.json")).entries,
    clarity: ClaritySnapshot.parse(read("clarity.json")).entries,
  };
}
