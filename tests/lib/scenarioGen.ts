// Scenario generator (B2, docs/architecture.md section 12): every row of the Aegis tab Weapons whose
// assumptions all have a switch becomes a scenario. The switches are the same as in probeAuto
// (catalyst, effect by name, exotic armor with its stacks); an assumption that says how Aegis fired
// (weaponAssumptions) or that the weapon has anyway (intrinsic) needs none. A perk or mod of the
// weapon has no switch in the core and stays on the list "missing switch". The scenarios made by
// hand are fixtures and win over a generated one for the same row.

import { assumptionName } from "../../scripts/lib/aegisWeapons";
import { fnv1a } from "../../scripts/lib/hash";
import { isExecution } from "../../scripts/lib/weaponAssumptions";
import { catalystBuffs } from "../../scripts/lib/items/weaponItem";
import type {
  Ability,
  AegisAbilityRow,
  AegisTotalRow,
  AegisWeaponRow,
  ArtifactPerk,
  Effect,
  ExoticArmorEntry,
  Weapon,
} from "../../src/data/schema";
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
export const generatedId = (row: { id: string }) => `gen-${row.id}`;

/**
 * The playstyle of the weapon that a word of Aegis names (B6): the label of an entry is the Aegis word.
 * The first entry is the plain shot, the default: it needs no playstyle in the build (`plain`).
 */
export function playstyleNamed(
  weapon: Pick<Weapon, "playstyles"> | undefined,
  name: string,
): { id: string; plain: boolean } | undefined {
  const list = weapon?.playstyles ?? [];
  const index = list.findIndex((p) => norm(p.label) === norm(name));
  return index < 0 ? undefined : { id: list[index].id, plain: index === 0 };
}

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

    let playstyled = false;
    for (const assumption of row.assumptions) {
      const name = assumptionName(assumption);
      const key = norm(name);
      const effectId = effectByName.get(norm(withoutNote(assumption))) ?? effectByName.get(key);
      const armor = armorByName.get(key);
      const stacked = intrinsicArmor.get(norm(assumption.replace(/\s+x\d+$/, "")));
      const playstyle = playstyleNamed(weapon, name);
      if (key === "catalyst" || catalystOptions.has(key) || catalystPerks.has(key)) {
        build.catalyst = true;
      } else if (intrinsics.has(key)) continue;
      else if (playstyle) {
        // One build plays one playstyle; a second word of that kind has no switch.
        if (playstyled) unmapped.push(assumption);
        else {
          playstyled = true;
          if (!playstyle.plain) build.playstyle = playstyle.id;
        }
      } else if (effectId) effectIds.push(effectId);
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

// Standard of the Aegis tabs Sustained and Swap (block P): surge x3 (Surge 1.22), Lumina (Buff 1.35) and
// Tractor Cannon (Debuff 1.3) on the weapon, Tractor Cannon on a super, the Weapons stat 200 and the
// ability stats 200. All held the whole phase, like Aegis does.
export const STANDARD_WEAPON_EFFECTS = ["surge-3x", "lumina-noble-rounds", "tractor-cannon"];
export const STANDARD_ABILITY_EFFECTS = ["tractor-cannon"];
/** The weapon that stands by while a Swap row is cast (what the meta probe used). */
export const STANDING_BY_WEAPON = "one-thousand-voices";
export const AEGIS_STAT = 200;
const STANDARD_FACTORS = { surge: 1.22, buff: 1.35, debuff: 1.3 };
const WEAPON_TYPES = ["power", "special", "primary"];

export type TotalGenData = {
  weapons: Weapon[];
  abilities: Ability[];
  effects: Pick<Effect, "id" | "name">[];
  exoticArmor: ExoticArmorEntry[];
  /** Perks of the seasonal artifacts: a perk name stands for its effect ("Combination Argent Blade"). */
  artifactPerks: ArtifactPerk[];
  /** Assumptions that need no switch, with the reason. */
  ignored: Record<string, string>;
};
export type MissingTotalSwitch = { row: AegisTotalRow; unmapped: string[] };
export type SkippedTotal = { row: AegisTotalRow; reason: string };

type MappedAssumptions = Pick<
  Scenario["build"],
  "catalyst" | "exoticArmorId" | "exoticPreBuilt" | "playstyle"
> & {
  effectIds: string[];
  unmapped: string[];
};

/**
 * The switches for the assumptions of an Aegis row (the same for all tabs): catalyst, effect by
 * name (also an artifact perk), exotic armor with its stacks. What says how Aegis fired, or what the
 * weapon has anyway, needs none. The rest is `unmapped`, the list of missing switches.
 */
function assumptionMapper(
  data: Pick<TotalGenData, "effects" | "exoticArmor" | "artifactPerks" | "ignored">,
): (assumptions: string[], weapon?: Weapon, execution?: boolean) => MappedAssumptions {
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
  const ignored = new Set(Object.keys(data.ignored).map(norm));

  // `execution`: words that say how Aegis played ("heavy attacks", "fully charged") need no switch.
  // That holds where the model plays the item by its own plan (tab Weapons, an ability that links
  // the row); a super or weapon of the totals has no such plan, so the word stays a missing switch.
  return (assumptions, weapon, execution = false) => {
    const mapped: MappedAssumptions = { effectIds: [], unmapped: [] };
    const intrinsics = new Set((weapon?.intrinsics ?? []).map((i) => norm(i.name)));
    const catalystOptions = new Set(
      (weapon?.options ?? [])
        .filter((o) => o.kind === "catalyst")
        .map((o) => norm(assumptionName(o.name))),
    );
    // "Burning Ambition, The Lament Catalyst": the perk names of the catalyst, and the buffs its
    // rules grant (an item file, e.g. Reaper's Tithe x4 of Truth).
    const catalystPerks = new Set([
      ...(weapon?.catalyst?.name ?? "").split(/,\s*/).map(norm),
      ...(weapon ? catalystBuffs(weapon) : []).map((b) => norm(b.name)),
    ]);
    let playstyled = false;
    for (const assumption of assumptions) {
      const name = assumptionName(assumption);
      const key = norm(name);
      const playstyle = playstyleNamed(weapon, name);
      // "Roaring Flames x3" is the effect with 3 stacks; without the stack count in the model it is
      // no switch, unless the item plays by its own plan (see `execution`).
      const effectId =
        effectByName.get(norm(withoutNote(assumption))) ?? (execution ? effectByName.get(key) : undefined);
      const armor = armorByName.get(key);
      const stacked = intrinsicArmor.get(norm(assumption.replace(/\s+x\d+$/, "")));
      if (key === "catalyst" || catalystOptions.has(key) || catalystPerks.has(key)) {
        mapped.catalyst = true;
      } else if (intrinsics.has(key)) continue;
      else if (playstyle) {
        // A word that names a playstyle of the item (B6); one build plays one.
        if (playstyled) mapped.unmapped.push(assumption);
        else {
          playstyled = true;
          if (!playstyle.plain) mapped.playstyle = playstyle.id;
        }
      } else if (effectId) mapped.effectIds.push(effectId);
      else if (armor) {
        mapped.exoticArmorId = armor.id;
        // Damage of its own or an effect without value is not modelled (ADR 0014).
        if (armor.kind === "ownDamage" || armor.kind === "gap") {
          mapped.unmapped.push(`${armor.name} (${armor.kind})`);
        }
      } else if (stacked) {
        // "Feast of Light x6": the intrinsic of an exotic, with its stacks built up before.
        mapped.exoticArmorId = stacked.id;
        mapped.exoticPreBuilt = true;
      } else if (ignored.has(key) || (execution && isExecution(name))) continue;
      else mapped.unmapped.push(assumption);
    }
    return mapped;
  };
}

/**
 * Scenarios for the rows of exotic weapons (tab Sustained) and supers (tab Swap) of the Aegis totals.
 * The mapping of the assumptions is the one of the Weapons tab, plus the artifact perks by name;
 * "Limit Break" is a switch like any other (no factor is taken out of the Aegis total). A row with an
 * assumption that has no switch is reported in `missing` and makes no scenario.
 */
export function generateTotalScenarios(
  rows: AegisTotalRow[],
  data: TotalGenData,
  /** Aegis rows that a scenario made by hand covers already. */
  covered: Set<string>,
): { scenarios: Scenario[]; missing: MissingTotalSwitch[]; skipped: SkippedTotal[] } {
  const scenarios: Scenario[] = [];
  const missing: MissingTotalSwitch[] = [];
  const skipped: SkippedTotal[] = [];
  const weaponByName = new Map(data.weapons.map((w) => [norm(w.name), w]));
  const abilityByName = new Map(
    data.abilities.filter((a) => a.kind === "super").map((a) => [norm(a.name), a]),
  );
  const map = assumptionMapper(data);

  for (const row of rows) {
    if (covered.has(row.id)) continue;
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

    const { effectIds, unmapped, ...mapped } = map(row.assumptions, weapon);
    const build: Scenario["build"] = { weaponId: STANDING_BY_WEAPON, ...mapped };
    if (unmapped.length > 0) {
      missing.push({ row, unmapped });
      continue;
    }

    if (weapon) {
      build.weaponId = weapon.id;
      // Aegis holds the Weapons stat at 200; a row with factor 1 has no stat bonus.
      build.weaponsStat = row.stat === 1 ? 100 : AEGIS_STAT;
    } else if (ability) {
      const provider = ability.providers[0];
      build.abilityId = ability.id;
      build.guardianClass = provider.classes?.[0] ?? "titan";
      build.subclass = provider.subclasses?.[0] ?? "arc";
      build.abilityStat = AEGIS_STAT;
    }
    const standard = weapon ? STANDARD_WEAPON_EFFECTS : STANDARD_ABILITY_EFFECTS;
    build.effectIds = [...new Set([...standard, ...effectIds])];
    scenarios.push({
      id: generatedId(row),
      tab: row.tab,
      aegisRow: row.id,
      wipe: row.total,
      fullModifiers: 1,
      system: "generated",
      build,
      playstyle: row.assumptions,
    });
  }
  return { scenarios, missing, skipped };
}

export type AbilityGenData = Omit<TotalGenData, "weapons">;
export type MissingAbilitySwitch = { row: AegisAbilityRow; unmapped: string[] };
export type SkippedAbility = { row: AegisAbilityRow; reason: string };

/** The extra assumption of the scenario at stat 200 (delta pair against the one at stat 100). */
export const STAT_200 = "stat 200";

/**
 * Scenarios for the rows of the Aegis tab Abilities: the value per use of an ability, at stat 100 and
 * at stat 200 (a scenario of its own with the extra assumption "stat 200", so the pair is a delta pair).
 * Nothing is taken out of a package or a row: every assumption is a switch (also the effects the row
 * says it holds, `includedEffectIds`); the ability of a row is the one that links it (`aegisRowId`),
 * else the base ability of its name. A variant is built as its base ability with the armor and the
 * effects it requires. Fitted rows (packages, variants) are scenarios too; the bench judges them.
 */
export function generateAbilityScenarios(
  rows: AegisAbilityRow[],
  data: AbilityGenData,
  /** Aegis rows that a scenario made by hand covers already. */
  covered: Set<string>,
): { scenarios: Scenario[]; missing: MissingAbilitySwitch[]; skipped: SkippedAbility[] } {
  const scenarios: Scenario[] = [];
  const missing: MissingAbilitySwitch[] = [];
  const skipped: SkippedAbility[] = [];
  const map = assumptionMapper(data);
  const byId = new Map(data.abilities.map((a) => [a.id, a]));
  const linked = new Map(data.abilities.filter((a) => a.aegisRowId).map((a) => [a.aegisRowId!, a]));
  const baseByName = new Map(
    data.abilities.filter((a) => !a.variantOf).map((a) => [`${a.kind}:${norm(a.name)}`, a]),
  );

  for (const row of rows) {
    if (covered.has(row.id)) continue;
    const ability = linked.get(row.id) ?? baseByName.get(`${row.category}:${norm(row.name)}`);
    if (!ability) {
      skipped.push({ row, reason: "no ability of the model" });
      continue;
    }
    const stats = ([100, 200] as const).flatMap((stat) => {
      const value = (stat === 100 ? row.perUseStat100 : row.perUseStat200).value;
      return value === null || value <= 0 ? [] : [{ stat, value }];
    });
    if (stats.length === 0) {
      skipped.push({ row, reason: "no measured value" });
      continue;
    }
    const { effectIds, unmapped, ...mapped } = map(row.assumptions, undefined, linked.has(row.id));
    if (unmapped.length > 0) {
      missing.push({ row, unmapped });
      continue;
    }
    const base = ability.variantOf ? (byId.get(ability.variantOf) ?? ability) : ability;
    const provider = base.providers[0];
    const build: Scenario["build"] = {
      weaponId: STANDING_BY_WEAPON,
      guardianClass: provider.classes?.[0] ?? "titan",
      subclass: provider.subclasses?.[0] ?? "arc",
      abilityId: base.id,
      ...mapped,
      ...(ability.exoticArmorId ? { exoticArmorId: ability.exoticArmorId } : {}),
    };
    const switches = [
      ...new Set([...row.includedEffectIds, ...effectIds, ...(ability.requiresEffectIds ?? [])]),
    ];
    for (const { stat, value } of stats) {
      scenarios.push({
        id: stat === 100 ? generatedId(row) : `${generatedId(row)}-stat-200`,
        tab: "abilities",
        aegisRow: row.id,
        wipe: value,
        fullModifiers: 1,
        system: "generated",
        build: { ...build, abilityStat: stat, ...(switches.length > 0 ? { effectIds: switches } : {}) },
        playstyle: stat === 100 ? row.assumptions : [...row.assumptions, STAT_200],
      });
    }
  }
  return { scenarios, missing, skipped };
}

/** Fixed lot (I10): the hash of the row id decides, so new rows never move the old ones. */
export { fnv1a };

export type Lot = "calibration" | "check";

/** About 70 % of the rows fall into the calibration set, the rest into the check set. */
export const lotOf = (rowId: string): Lot => (fnv1a(rowId) % 10 < 7 ? "calibration" : "check");
