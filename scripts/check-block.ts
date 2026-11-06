// Part of the M gate: the weapons a block names against the weapon status (Quantum within the limit,
// no open sentence, a row each). Run after the tests, whose snapshot fails on a stale status file.
// Usage: npm run check:block -- <block id>
import { readFileSync } from "node:fs";
import { ManifestWeapons, StatusLimits, WeaponStatusFile } from "../src/data/schema.ts";
import { blockLine, blockWeaponProblems } from "./lib/weaponStatus.ts";

const id = process.argv[2];
const line = id ? blockLine(readFileSync("docs/plans/current.md", "utf8"), id) : undefined;
if (!line) {
  console.error(`NOT DONE: no block "${id ?? ""}" in docs/plans/current.md.`);
  process.exit(1);
}

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const { problems, reported } = blockWeaponProblems(
  line,
  WeaponStatusFile.parse(readJson("src/data/weapon-status.json")).weapons,
  ManifestWeapons.parse(readJson("src/data/manifest-weapons.json")).weapons.map((weapon) => weapon.name),
  readFileSync("docs/known-inaccuracies.md", "utf8"),
  StatusLimits.parse(readJson("src/data/status-limits.json")).quantumDeviation,
);
for (const note of reported) console.log(`Reported: ${note}`);
if (problems.length > 0) {
  console.error(`NOT DONE: ${id}, weapon status:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`Block ${id}: weapon status OK.`);
