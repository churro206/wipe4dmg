// Rule that makes probe entries from the Aegis totals (extension of block 5): every row of an exotic
// weapon (tab Sustained) or a super (tab Swap) whose assumptions we have as switches becomes an
// entry. An assumption we cannot map stays on the entry (unmapped), so the table is also the list of
// missing switches; only fully mapped rows are gated.

import type {
  Ability,
  AegisTotalRow,
  ArtifactPerk,
  Build,
  ExoticArmorEntry,
  Weapon,
} from "../../src/data/schema.ts";
import { catalystBuffs } from "./items/weaponItem.ts";

/** One row of the Aegis tabs "Sustained" and "Swap" rebuilt as a build. */
export type Entry = {
  aegisId: string;
  kind: "weapon" | "ability";
  build: Partial<Build>;
  selections?: string[];
  removed?: { column?: keyof AegisTotalRow; factor?: number; reason: string }[];
};

type NamedEffect = { id: string; name: string };

export type AutoSkip = { row: AegisTotalRow; reason: string };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// "Lumina (Blessing of the Sky)" is found as "Lumina".
const withoutNote = (s: string) => s.replace(/\(.*\)/, "");

const STANDARD_FACTORS = { surge: 1.22, buff: 1.35, debuff: 1.3 };
const WEAPON_TYPES = ["power", "special", "primary"];
const LIMIT_BREAK = 1.15;

export type AutoData = {
  weapons: Weapon[];
  abilities: Ability[];
  effects: NamedEffect[];
  exoticArmor: ExoticArmorEntry[];
  /** Perks of the seasonal artifacts: a perk name stands for its effect ("Combination Argent Blade"). */
  artifactPerks: ArtifactPerk[];
  /** Assumptions that need no switch, with the reason (descriptions of the measurement). */
  ignored: Record<string, string>;
  /** Ids of rows that the hand-made entries cover already. */
  covered: Set<string>;
};

/** An entry with the assumptions of its row that we have no switch for (empty: fully mapped). */
export type AutoEntry = Entry & { unmapped: string[] };

export function autoEntries(
  rows: AegisTotalRow[],
  data: AutoData,
): { entries: AutoEntry[]; skipped: AutoSkip[] } {
  const entries: AutoEntry[] = [];
  const skipped: AutoSkip[] = [];
  const weaponByName = new Map(data.weapons.map((w) => [norm(w.name), w]));
  const abilityByName = new Map(
    data.abilities.filter((a) => a.kind === "super").map((a) => [norm(a.name), a]),
  );
  const effectByName = new Map<string, string>();
  for (const e of data.effects) {
    const key = norm(withoutNote(e.name));
    if (!effectByName.has(key)) effectByName.set(key, e.id);
  }
  for (const perk of data.artifactPerks) {
    if (!effectByName.has(norm(perk.name))) effectByName.set(norm(perk.name), perk.effectId);
  }
  const armorByName = new Map(data.exoticArmor.map((a) => [norm(a.name), a]));
  const intrinsicArmor = new Map<string, ExoticArmorEntry>();
  for (const a of data.exoticArmor) {
    if (a.intrinsic && !intrinsicArmor.has(norm(a.intrinsic))) {
      intrinsicArmor.set(norm(a.intrinsic), a);
    }
  }
  const ignored = new Map(
    Object.entries(data.ignored).map(([k, v]) => [norm(k), v]),
  );

  for (const row of rows) {
    if (data.covered.has(row.id)) continue;
    const isWeapon = row.tab === "sustained" && WEAPON_TYPES.includes(row.type);
    const isSuper = row.tab === "swap" && row.type === "super";
    const weapon = isWeapon ? weaponByName.get(norm(row.name)) : undefined;
    const ability = isSuper ? abilityByName.get(norm(row.name)) : undefined;
    if (!weapon && !ability) continue;
    if (row.total === null) {
      skipped.push({ row, reason: "no total (INF)" });
      continue;
    }
    if (
      weapon &&
      (row.surge !== STANDARD_FACTORS.surge ||
        row.buff !== STANDARD_FACTORS.buff ||
        row.debuff !== STANDARD_FACTORS.debuff)
    ) {
      skipped.push({ row, reason: "factors differ from the standard of Aegis" });
      continue;
    }

    const selections: string[] = [];
    const removed: NonNullable<Entry["removed"]> = [];
    const build: Entry["build"] = {};
    const unmapped: string[] = [];
    const own = new Set([
      ...(weapon?.options ?? []).map((o) => norm(o.name)),
      ...(weapon?.intrinsics ?? []).map((i) => norm(i.name)),
    ]);
    // "Burning Ambition, The Lament Catalyst": the perk names of the catalyst, and the buffs its
    // rules grant (an item file, e.g. Reaper's Tithe x4 of Truth).
    const catalystPerks = new Set([
      ...(weapon?.catalyst?.name ?? "").split(/,\s*/).map(norm),
      ...(weapon ? catalystBuffs(weapon) : []).map((b) => norm(b.name)),
    ]);
    for (const assumption of row.assumptions) {
      const key = norm(assumption);
      const effectId = effectByName.get(key);
      const armor = armorByName.get(key);
      if (key === "catalyst" || catalystPerks.has(key)) build.catalyst = true;
      else if (key === "limitbreak") {
        removed.push({ factor: LIMIT_BREAK, reason: "Limit Break is not modelled" });
      } else if (effectId) selections.push(effectId);
      else if (armor) {
        build.exoticArmorId = armor.id;
        // Damage of its own or an effect without value is not modelled (ADR 0014).
        if (armor.kind === "ownDamage" || armor.kind === "gap") {
          unmapped.push(`${armor.name} (${armor.kind})`);
        }
      } else if (intrinsicArmor.has(key.replace(/x\d+$/, ""))) {
        // "Feast of Light x6": the intrinsic of an exotic, with its stacks built up before.
        build.exoticArmorId = intrinsicArmor.get(key.replace(/x\d+$/, ""))!.id;
        build.exoticPreBuilt = true;
      } else if (own.has(key) || ignored.has(key)) continue;
      else unmapped.push(assumption);
    }

    if (weapon) {
      build.weaponId = weapon.id;
      // Aegis holds the Weapons stat at 200 (1.15 primary and special, 1.10 power), a row with
      // factor 1 has no stat bonus.
      if (row.stat === 1) build.weaponsStat = 100;
      entries.push({
        aegisId: row.id,
        kind: "weapon",
        build,
        selections,
        removed,
        unmapped,
      });
    } else if (ability) {
      const provider = ability.providers[0];
      build.guardianClass = provider.classes?.[0] ?? "titan";
      build.subclass = provider.subclasses?.[0] ?? "arc";
      build.abilities = [{ abilityId: ability.id, castsMs: [0] }];
      entries.push({
        aegisId: row.id,
        kind: "ability",
        build,
        selections,
        removed,
        unmapped,
      });
    }
  }
  return { entries, skipped };
}
