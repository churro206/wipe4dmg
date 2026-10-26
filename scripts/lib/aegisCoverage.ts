// Rule of block C (coverage): every row of the Aegis tabs Weapons, Sustained and Swap gets a verdict.
//   model    the row is used or probed, or its item is in the model with all its assumptions
//   skipped  the row is not needed, with the reason (another mode, a burst before the swap, a legendary
//            frame, a factor Aegis sets differently, ...)
//   missing  the item or an assumption is not in the model; `keys` name what is missing
// The rule only reads what the other rules decided (weapon import, meta probe, effects, abilities).

import type {
  Ability,
  AegisTotalRow,
  AegisWeaponRow,
  Effect,
} from "../../src/data/schema.ts";
import type { ReportWeapon } from "./weaponPackages.ts";

export type Verdict = "model" | "skipped" | "missing";
export type AegisTab = "weapons" | "sustained" | "swap";

export type CoverageRow = {
  tab: AegisTab;
  id: string;
  label: string; // name and assumptions
  verdict: Verdict;
  detail: string;
  keys: string[]; // for missing: what is missing, to count the rows per missing item
};

export type CoverageInput = {
  weaponRows: AegisWeaponRow[];
  weaponReport: ReportWeapon[];
  totals: AegisTotalRow[];
  weapons: { name: string }[];
  exoticWeaponNames: string[]; // every exotic weapon of the manifest
  abilities: Ability[];
  effects: Effect[];
  probe: {
    manual: Set<string>; // ids of the hand-made probe entries
    entries: { aegisId: string; unmapped: string[] }[];
    skipped: { row: { id: string }; reason: string }[];
  };
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const labelOf = (row: { name: string; assumptions: string[] }) =>
  [row.name, ...row.assumptions].join(", ");

const WEAPON_TYPES = ["power", "special", "primary"];
// Swap rows of a weapon or class ability that is swapped in: Aegis measures one burst.
const SWAP_BURSTS = ["burst", "swap", "LP"];
// Reasons of the weapon import that name something the model does not have; the others describe
// another mode of the weapon or a thing that is modelled on its own (exotic armor, artifact).
const MISSING_REASON = /fremder Perk|nicht modelliert/;

const SMALL_WORDS = new Set(["of", "the", "and", "a", "an", "in", "to", "for"]);
/** "Adaptive frame" or "Balanced heat weapon - 450RPM primary" name an archetype; exotics are in title case. */
const isArchetype = (name: string) =>
  name.split(/\s+/).some((word) => /^[a-z]/.test(word) && !SMALL_WORDS.has(word));

export function aegisCoverage(input: CoverageInput): CoverageRow[] {
  const rows: CoverageRow[] = [];
  const weaponByName = new Set(input.weapons.map((w) => norm(w.name)));
  const reportByName = new Map(input.weaponReport.map((w) => [norm(w.name), w]));
  const abilityOf = (name: string, kinds: string[]) =>
    input.abilities.find(
      (a) => kinds.includes(a.kind) && norm(a.name) === norm(name),
    );
  const ownDamage = new Map(
    input.effects
      .filter((e) => e.parts.some((p) => p.type === "periodicDamage"))
      .map((e) => [norm(e.name), e]),
  );
  const entryOf = new Map(input.probe.entries.map((e) => [e.aegisId, e]));
  const skippedOf = new Map(input.probe.skipped.map((s) => [s.row.id, s.reason]));

  const make = (
    tab: AegisTab,
    row: { id: string; name: string; assumptions: string[] },
    verdict: Verdict,
    detail: string,
    keys: string[] = [],
  ) => rows.push({ tab, id: row.id, label: labelOf(row), verdict, detail, keys });

  // A weapon row whose name is no exotic of the model: an archetype or a legendary weapon (no exotic
  // of the manifest, e.g. Bequest) is skipped (owner 2026-10-25), an exotic is missing.
  const exotics = new Set(input.exoticWeaponNames.map(norm));
  const unknownWeapon = (tab: AegisTab, row: AegisWeaponRow | AegisTotalRow) => {
    if (isArchetype(row.name)) make(tab, row, "skipped", "legendary frame (owner 2026-10-25)");
    else if (!exotics.has(norm(row.name)))
      make(tab, row, "skipped", "legendary weapon (owner 2026-10-25)");
    else
      make(tab, row, "missing", "exotic weapon not in the model", [`weapon: ${row.name}`]);
  };

  // Tab Weapons: the weapon import decided base row, options and unused rows.
  for (const row of input.weaponRows) {
    const weapon = reportByName.get(norm(row.name));
    if (!weapon) {
      unknownWeapon("weapons", row);
      continue;
    }
    const option = weapon.options.find((o) => o.rowId === row.id);
    const unused = weapon.unusedRows.find((u) => u.rowId === row.id);
    if (weapon.baseRow?.id === row.id) {
      make("weapons", row, "model", "base row of the package");
    } else if (option) {
      make("weapons", row, "model", `option "${option.name}"`);
    } else if (unused) {
      if (MISSING_REASON.test(unused.reason)) {
        const keys = unused.reason
          .split("; ")
          .filter((part) => MISSING_REASON.test(part))
          .map((part) => part.replace(/^[^:]*:\s*/, ""));
        make("weapons", row, "missing", unused.reason, keys);
      } else make("weapons", row, "skipped", unused.reason);
    } else if (weapon.status === "gap") {
      make("weapons", row, "missing", `weapon without package: ${weapon.gapReason ?? ""}`, [
        `${weapon.name} (no package)`,
      ]);
    } else {
      make("weapons", row, "skipped", "same option as another row");
    }
  }

  // Tabs Sustained and Swap: the totals under the standard factors.
  const probeVerdict = (tab: AegisTab, row: AegisTotalRow) => {
    if (input.probe.manual.has(row.id)) {
      make(tab, row, "model", "gate: hand-made probe entry");
      return;
    }
    const entry = entryOf.get(row.id);
    if (entry) {
      if (entry.unmapped.length === 0) make(tab, row, "model", "gate: probe entry by rule");
      else
        make(tab, row, "missing", `no switch for: ${entry.unmapped.join("; ")}`, entry.unmapped);
      return;
    }
    const reason = skippedOf.get(row.id);
    if (reason) make(tab, row, "skipped", reason);
    else make(tab, row, "missing", "no probe entry", ["no probe entry"]);
  };
  const abilityVerdict = (tab: AegisTab, row: AegisTotalRow, kind: string) => {
    if (abilityOf(row.name, [kind])) make(tab, row, "model", `${kind} in the model, value not probed`);
    else if (ownDamage.has(norm(row.name)))
      make(tab, row, "model", "own damage of an aspect or fragment (rule H)");
    else make(tab, row, "missing", `${kind} not in the model`, [`${kind}: ${row.name}`]);
  };

  // Rule H takes, per item, the tick row with the fewest assumptions; the others are variants.
  const chosenTick = new Map<string, string>();
  for (const row of input.totals) {
    if (row.tab !== "sustained" || row.type !== "tick") continue;
    const best = chosenTick.get(norm(row.name));
    const current = best ? input.totals.find((r) => r.id === best)! : undefined;
    if (!current || row.assumptions.length < current.assumptions.length)
      chosenTick.set(norm(row.name), row.id);
  }

  for (const row of input.totals) {
    const tab: AegisTab = row.tab;
    if (tab === "sustained") {
      if (WEAPON_TYPES.includes(row.type)) {
        const gap = reportByName.get(norm(row.name));
        if (weaponByName.has(norm(row.name))) probeVerdict(tab, row);
        else if (gap)
          make(tab, row, "missing", `weapon without package: ${gap.gapReason ?? ""}`, [
            `${gap.name} (no package)`,
          ]);
        else unknownWeapon(tab, row);
      } else if (row.type === "tick") {
        if (!ownDamage.has(norm(row.name)))
          make(tab, row, "missing", "own damage not in the model", [`own damage: ${row.name}`]);
        else if (chosenTick.get(norm(row.name)) === row.id)
          make(tab, row, "model", "own damage (rule H)");
        else
          make(tab, row, "missing", "variant of an item with own damage", [
            `variant of ${row.name}`,
          ]);
      } else if (row.type === "grenade" || row.type === "melee") {
        abilityVerdict(tab, row, row.type);
      } else {
        make(tab, row, "missing", `row type "${row.type}" not handled`, [`type ${row.type}`]);
      }
    } else if (row.type === "super") {
      if (abilityOf(row.name, ["super"])) probeVerdict(tab, row);
      else make(tab, row, "missing", "super not in the model", [`super: ${row.name}`]);
    } else if (SWAP_BURSTS.includes(row.type)) {
      make(tab, row, "skipped", "burst before the swap; the simulation fires the whole phase");
    } else if (row.type === "grenade" || row.type === "melee") {
      abilityVerdict(tab, row, row.type);
    } else {
      make(tab, row, "missing", `row type "${row.type}" not handled`, [`type ${row.type}`]);
    }
  }
  return rows;
}

/** Counts per tab and verdict. */
export function countVerdicts(rows: CoverageRow[]) {
  return (["weapons", "sustained", "swap"] as AegisTab[]).map((tab) => {
    const ofTab = rows.filter((r) => r.tab === tab);
    return {
      tab,
      total: ofTab.length,
      model: ofTab.filter((r) => r.verdict === "model").length,
      skipped: ofTab.filter((r) => r.verdict === "skipped").length,
      missing: ofTab.filter((r) => r.verdict === "missing").length,
    };
  });
}

/** What is missing, with the number of rows that name it, the most frequent first. */
export function missingKeys(rows: CoverageRow[]): [string, number][] {
  const count = new Map<string, number>();
  for (const row of rows)
    if (row.verdict === "missing")
      for (const key of new Set(row.keys)) count.set(key, (count.get(key) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
