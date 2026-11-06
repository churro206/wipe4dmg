// V4: older stands of src/data/weapon-status.json from git, for the list "What changed".

import { execFileSync } from "node:child_process";
import { WeaponStatusFile } from "../../src/data/schema.ts";
import { diffWeaponStatus } from "../../src/ui/weaponChanges.ts";

const FILE = "src/data/weapon-status.json";
const MAX_COMMITS = 30; // how far back to look for a stand that differs

const git = (...args: string[]): string =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

/** The weapons of weapon-status.json at a git revision, e.g. "HEAD" or "61c1fc8~1". */
export const statusAt = (revision: string): WeaponStatusFile["weapons"] =>
  WeaponStatusFile.parse(JSON.parse(git("show", `${revision}:${FILE}`))).weapons;

/** The commits that changed the file, newest first (short hashes). */
export const commitsOfStatus = (): string[] =>
  git("log", `-n${MAX_COMMITS}`, "--format=%h", "--", FILE).split("\n").filter((l) => l !== "");

/**
 * The newest stand in git that differs from `now`: HEAD while the working file has uncommitted
 * changes, otherwise the one before the last commit. `commit` is "" when none differs.
 */
export function baselineFor(now: WeaponStatusFile["weapons"]): WeaponStatusFile["weapons"];
export function baselineFor(now: WeaponStatusFile["weapons"], withCommit: true): { weapons: WeaponStatusFile["weapons"]; commit: string };
export function baselineFor(now: WeaponStatusFile["weapons"], withCommit?: true) {
  for (const commit of commitsOfStatus()) {
    const weapons = statusAt(commit);
    if (diffWeaponStatus(weapons, now).length > 0) return withCommit ? { weapons, commit } : weapons;
  }
  return withCommit ? { weapons: now, commit: "" } : now;
}
