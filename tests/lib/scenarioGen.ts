// Scenario generator (B2, docs/architecture.md section 12): every row of the Aegis tab Weapons whose
// assumptions all have a switch becomes a scenario. The switches are the same as in probeAuto
// (catalyst, effect by name, exotic armor with its stacks); an assumption that says how Aegis fired
// (weaponAssumptions) or that the weapon has anyway (intrinsic) needs none. A perk or mod of the
// weapon has no switch in the core and stays on the list "missing switch". The scenarios made by
// hand are fixtures and win over a generated one for the same row.

import { assumptionName } from "../../scripts/lib/aegisWeapons";
import { isExecution } from "../../scripts/lib/weaponAssumptions";
import type { AegisWeaponRow, Effect, ExoticArmorEntry, Weapon } from "../../src/data/schema";
import type { Scenario } from "./scenarioBench";

export type GenData = {
  weapons: Weapon[];
  effects: Pick<Effect, "id" | "name">[];
  exoticArmor: ExoticArmorEntry[];
  /** Assumptions that need no switch, with the reason. */
  ignored: Record<string, string>;
};

export type MissingSwitch = { row: AegisWeaponRow; unmapped: string[] };
export type Skipped = { row: AegisWeaponRow; reason: string };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// "Lumina (Blessing of the Sky)" is found as "Lumina".
const withoutNote = (s: string) => s.replace(/\(.*\)/, "");

/** Id of a generated scenario; the Aegis row ids are unique, so are these. */
export const generatedId = (row: AegisWeaponRow) => `gen-${row.id}`;

export function generateScenarios(
  rows: AegisWeaponRow[],
  data: GenData,
  /** Aegis rows that a scenario made by hand covers already. */
  covered: Set<string>,
): { scenarios: Scenario[]; missing: MissingSwitch[]; skipped: Skipped[] } {
  const scenarios: Scenario[] = [];
  const missing: MissingSwitch[] = [];
  const skipped: Skipped[] = [];
  const weaponByName = new Map(data.weapons.map((w) => [norm(w.name), w]));
  const effectByName = new Map<string, string>();
  for (const e of data.effects) {
    const key = norm(withoutNote(e.name));
    if (!effectByName.has(key)) effectByName.set(key, e.id);
  }
  const armorByName = new Map(data.exoticArmor.map((a) => [norm(a.name), a]));
  const intrinsicArmor = new Map<string, ExoticArmorEntry>();
  for (const a of data.exoticArmor) {
    if (a.intrinsic && !intrinsicArmor.has(norm(a.intrinsic))) {
      intrinsicArmor.set(norm(a.intrinsic), a);
    }
  }
  const ignored = new Set(Object.keys(data.ignored).map(norm));

  for (const row of rows) {
    if (covered.has(row.id)) continue;
    const weapon = weaponByName.get(norm(row.name));
    if (!weapon) {
      skipped.push({ row, reason: "no exotic weapon of the model" });
      continue;
    }
    if (row.wipe <= 0 || row.perShot <= 0) {
      skipped.push({ row, reason: "no measured value" });
      continue;
    }
    const build: Scenario["build"] = { weaponId: weapon.id };
    const effectIds: string[] = [];
    const unmapped: string[] = [];
    const intrinsics = new Set(weapon.intrinsics.map((i) => norm(i.name)));
    const catalystOptions = new Set(
      (weapon.options ?? []).filter((o) => o.kind === "catalyst").map((o) => norm(assumptionName(o.name))),
    );
    const catalystPerks = new Set((weapon.catalyst?.name ?? "").split(/,\s*/).map(norm));

    for (const assumption of row.assumptions) {
      const name = assumptionName(assumption);
      const key = norm(name);
      const effectId = effectByName.get(norm(withoutNote(assumption))) ?? effectByName.get(key);
      const armor = armorByName.get(key);
      const stacked = intrinsicArmor.get(norm(assumption.replace(/\s+x\d+$/, "")));
      if (key === "catalyst" || catalystOptions.has(key) || catalystPerks.has(key)) {
        build.catalyst = true;
      } else if (intrinsics.has(key)) continue;
      else if (effectId) effectIds.push(effectId);
      else if (armor) {
        build.exoticArmorId = armor.id;
        // Damage of its own or an effect without value is not modelled (ADR 0014).
        if (armor.kind === "ownDamage" || armor.kind === "gap") {
          unmapped.push(`${armor.name} (${armor.kind})`);
        }
      } else if (stacked) {
        // "Feast of Light x6": the intrinsic of an exotic, with its stacks built up before.
        build.exoticArmorId = stacked.id;
        build.exoticPreBuilt = true;
      } else if (ignored.has(key) || isExecution(name)) continue;
      else unmapped.push(assumption);
    }

    if (unmapped.length > 0) {
      missing.push({ row, unmapped });
      continue;
    }
    if (effectIds.length > 0) build.effectIds = [...new Set(effectIds)];
    scenarios.push({
      id: generatedId(row),
      aegisRow: row.id,
      wipe: row.wipe,
      fullModifiers: row.fullModifiers,
      system: "generated",
      build,
      playstyle: row.assumptions,
      shots: row.shots,
    });
  }
  return { scenarios, missing, skipped };
}

/** Fixed lot (I10): the hash of the row id decides, so new rows never move the old ones. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export type Lot = "calibration" | "check";

/** About 70 % of the rows fall into the calibration set, the rest into the check set. */
export const lotOf = (rowId: string): Lot => (fnv1a(rowId) % 10 < 7 ? "calibration" : "check");
