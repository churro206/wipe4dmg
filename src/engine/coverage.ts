// Coverage: which abilities of the game the calculator models and how (ADR 0009, US-15).
// The list of abilities comes from the Compendium snapshot, so it shows gaps as well.

import type {
  Ability,
  AbilityGap,
  AbilityKind,
  AegisAbilityRow,
  CompendiumEntry,
  GapReason,
} from "../data/schema";
import { superWindowMs } from "./superWindow";

const SECTIONS: Record<string, AbilityKind> = {
  "Super Abilities": "super",
  "Grenade Abilities": "grenade",
  "Melee Abilities": "melee",
};

export type CoverageStatus =
  | "components" // own components from the Compendium, checked by the gate
  | "package" // value per use from one Aegis row
  | "effectOnly" // super that only grants effects, e.g. Well of Radiance
  | "missing";

export type MissingReason =
  | GapReason // a known gap from ability-gaps.json
  | "noAegisRow" // Aegis has no measurement of this ability
  | "notYetModelled"; // usable data exists, the ability is not in abilities.json yet

export type AbilityCoverageRow = {
  kind: AbilityKind;
  element: string; // Compendium tab, e.g. "Solar"
  name: string; // Compendium name
  status: CoverageStatus;
  abilityId?: string;
  aegisRowId?: string;
  superWindow?: "exact" | "estimate" | "none"; // supers only
  reason?: MissingReason; // missing abilities only
};

/** One row per ability of the Compendium, in Compendium order. Throws for an unknown Compendium link. */
export function abilityCoverage(
  entries: CompendiumEntry[],
  abilities: Ability[],
  aegisRows: AegisAbilityRow[],
  gaps: AbilityGap[] = [],
): AbilityCoverageRow[] {
  // Aspect enhancements such as "Touch of Flame" sit in the ability sections without a cooldown.
  const abilityEntries = entries.filter(
    (e) => SECTIONS[e.section] && e.extra !== "",
  );
  for (const ability of abilities) {
    const link = ability.compendium;
    if (
      link &&
      !abilityEntries.some((e) => e.tab === link.tab && e.name === link.entry)
    ) {
      throw new Error(
        `${ability.id}: no Compendium ability "${link.entry}" in tab ${link.tab}`,
      );
    }
  }

  for (const gap of gaps) {
    const { tab, entry } = gap.compendium;
    if (!abilityEntries.some((e) => e.tab === tab && e.name === entry)) {
      throw new Error(`Gap: no Compendium ability "${entry}" in tab ${tab}`);
    }
    if (
      abilities.some(
        (a) => a.compendium?.tab === tab && a.compendium.entry === entry,
      )
    ) {
      throw new Error(
        `Gap: "${entry}" is modelled; remove it from ability-gaps.json`,
      );
    }
  }

  return abilityEntries.map((entry) => {
    const kind = SECTIONS[entry.section];
    const base = { kind, element: entry.tab, name: entry.name };
    const ability = abilities.find(
      (a) =>
        a.compendium?.tab === entry.tab && a.compendium.entry === entry.name,
    );
    if (!ability) {
      return {
        ...base,
        status: "missing",
        reason:
          gaps.find(
            (g) =>
              g.compendium.tab === entry.tab &&
              g.compendium.entry === entry.name,
          )?.reason ?? missingReason(entry, aegisRows),
      };
    }
    const status: CoverageStatus = ability.package
      ? "package"
      : ability.components.length === 0
        ? "effectOnly"
        : "components";
    return {
      ...base,
      status,
      abilityId: ability.id,
      ...(ability.aegisRowId ? { aegisRowId: ability.aegisRowId } : {}),
      ...(kind === "super" ? { superWindow: windowRating(ability) } : {}),
    };
  });
}

function windowRating(ability: Ability): "exact" | "estimate" | "none" {
  if (!ability.usage) return "none";
  return superWindowMs(ability.usage).exact ? "exact" : "estimate";
}

/** Compendium and Aegis spell names differently, e.g. "Golden Gun: Deadshot" and "Golden Gun - Deadshot". */
const nameKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/&/g, "and")
    .replace(/\bgrenade\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function missingReason(
  entry: CompendiumEntry,
  aegisRows: AegisAbilityRow[],
): "noAegisRow" | "aegisNotNormalised" | "notYetModelled" {
  const key = nameKey(entry.name);
  const rows = aegisRows.filter((row) => {
    const rowKey = nameKey(row.name);
    return rowKey.startsWith(key) || key.startsWith(rowKey);
  });
  if (rows.length === 0) return "noAegisRow";
  return rows.some((r) => r.perUseStat100.source.status === "verified")
    ? "notYetModelled"
    : "aegisNotNormalised";
}
