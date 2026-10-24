// Reads the Data Files the artifacts need. Shared by npm run build:artifacts and the test that checks
// the generated file is current.

import { existsSync, readFileSync } from "node:fs";
import {
  ArtifactData,
  CompendiumSnapshot,
  Effect,
  SourcedNumber,
  SubclassEffect,
  ExoticArmorEffect,
} from "../../src/data/schema.ts";
import type { ArtifactInputs } from "./artifacts.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadArtifactInputs(): ArtifactInputs {
  const previous = existsSync(new URL("artifacts.json", DATA))
    ? ArtifactData.parse(read("artifacts.json"))
    : undefined;
  return {
    compendium: CompendiumSnapshot.parse(read("compendium-artifacts.json")).entries,
    effects: [
      ...Effect.array().parse(read("effects.json")),
      ...Effect.array().parse(read("buff-effects.json")),
      ...SubclassEffect.array().parse(read("subclass-effects.json")).map((e) => e.effect),
      ...ExoticArmorEffect.array().parse(read("exotic-armor-effects.json")).map((e) => e.effect),
    ],
    slots: SourcedNumber.array().length(3).parse(read("artifact-slots.json")),
    codes: Object.fromEntries((previous?.artifacts ?? []).map((a) => [a.id, a.code])),
  };
}
