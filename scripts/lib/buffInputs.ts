// Reads the Data Files the buff effects need. Shared by npm run build:buffs and the test that checks
// the generated file is current.

import { existsSync, readFileSync } from "node:fs";
import {
  ClaritySnapshot,
  CourtSnapshot,
  Effect,
  ExoticArmorEffect,
  SubclassEffect,
} from "../../src/data/schema.ts";
import type { BuffInputs } from "./buffs.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadBuffInputs(): BuffInputs {
  const court = CourtSnapshot.parse(read("court-buffs.json"));
  const clarity = ClaritySnapshot.parse(read("clarity.json"));
  const effects = Effect.array().parse(read("effects.json"));
  const subclass = SubclassEffect.array().parse(read("subclass-effects.json"));
  const exotic = ExoticArmorEffect.array().parse(read("exotic-armor-effects.json"));
  const previous = existsSync(new URL("buff-effects.json", DATA))
    ? Effect.array().parse(read("buff-effects.json"))
    : [];
  const codeOwners = [
    ...effects,
    ...subclass.map((e) => e.effect),
    ...previous,
  ];
  const usedCodes = [
    ...codeOwners.flatMap((e) => [e.code, ...(e.formerCodes ?? []).map((f) => f.code)]),
    ...Object.values(read("effect-codes.json") as Record<string, number>),
  ];
  return {
    court: court.entries,
    courtSource: court.source,
    clarity: clarity.entries,
    claritySource: clarity.source,
    existingEffectIds: new Set([
      ...effects.map((e) => e.id),
      ...subclass.map((e) => e.effect.id),
      ...exotic.map((e) => e.effect.id),
    ]),
    codes: Object.fromEntries(previous.map((e) => [e.id, e.code])),
    nextCode: Math.max(...usedCodes) + 1,
  };
}
