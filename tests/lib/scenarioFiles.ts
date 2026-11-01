// The scenarios made by hand: the fixtures in tests/scenarios/ (block P). Shared by the bench and the
// coverage table, which needs to know which Aegis rows a fixture covers.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Scenario } from "./scenarioBench";

const DIR = "tests/scenarios";

export function handMadeScenarios(): Scenario[] {
  return readdirSync(DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .flatMap((file) => Scenario.array().parse(JSON.parse(readFileSync(join(DIR, file), "utf8"))));
}
