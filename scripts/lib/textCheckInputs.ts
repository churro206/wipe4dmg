// Reads the Data Files the text check needs. Shared by npm run check:text and its test.

import { readFileSync } from "node:fs";
import { AbilityData, AbilityGrant, Weapon } from "../../src/data/schema.ts";
import type { TextCheckInputs } from "./textCheck.ts";
import { loadUptimeInputs } from "./uptimeInputs.ts";

const DATA = new URL("../../src/data/", import.meta.url);
const read = (file: string): unknown => JSON.parse(readFileSync(new URL(file, DATA), "utf8"));

export function loadTextCheckInputs(): TextCheckInputs {
  return {
    ...loadUptimeInputs(),
    weapons: Weapon.array().parse(read("weapon-packages.json")),
    grants: AbilityGrant.array().parse(read("ability-grants.json")),
    abilityNames: Object.fromEntries(
      AbilityData.array()
        .parse(read("abilities.json"))
        .map((a) => [a.id, a.name]),
    ),
  };
}
