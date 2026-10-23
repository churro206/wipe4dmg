// d2foundry's reload formulas (oracle_engine, build_resources/weapon_formulas.json): seconds per
// reload stat for each weapon type. They do not reproduce Aegis's measured reload (0.44 to 1.5
// times the formula), so the weapon import uses them only as a factor for a catalyst's reload stat
// (owner, 2026-10-23).

import type {
  ReloadFormula,
  ReloadFormulaSnapshot,
} from "../../src/data/schema.ts";

export const RELOAD_FORMULAS_URL =
  "https://raw.githubusercontent.com/d2foundry/oracle_engine/master/build_resources/weapon_formulas.json";

// d2foundry names that are not the manifest type in camel case.
const TYPE_ALIASES: Record<string, string> = { "Combat Bow": "bow" };
const MAX_STAT = 100;
const ANIMATION = /(\d+)% decreased Reload Animation Duration/i;

type RawReload = {
  evpp: number;
  vpp: number;
  offset: number;
  ammo_percent?: number;
};
type RawType = Record<string, unknown> & {
  cat?: Record<string, { reload?: RawReload }>;
};

const camel = (name: string) =>
  name
    .split(/\s+/)
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");

const formula = (r: RawReload): ReloadFormula => ({
  evpp: r.evpp,
  vpp: r.vpp,
  offset: r.offset,
  ammoPercent: r.ammo_percent ?? 1,
});
const empty = (r: RawReload) => r.evpp === 0 && r.vpp === 0 && r.offset === 0;

export function parseReloadFormulas(
  raw: Record<string, RawType>,
): ReloadFormulaSnapshot["types"] {
  const types: ReloadFormulaSnapshot["types"] = {};
  for (const [name, type] of Object.entries(raw)) {
    // Grenade launchers have no default, only "special" and "heavy": the first one stands in.
    const base =
      type.cat?.default?.reload ??
      Object.values(type.cat ?? {}).find((c) => c.reload && !empty(c.reload))
        ?.reload;
    if (!base) continue;
    const weapons: Record<string, ReloadFormula> = {};
    for (const [key, entry] of Object.entries(type)) {
      if (key === "cat" || typeof entry !== "object" || entry === null)
        continue;
      const { name: weapon, cat } = entry as { name?: string; cat?: string };
      const own =
        cat && cat !== "default" ? type.cat?.[cat]?.reload : undefined;
      if (weapon && own && !empty(own)) weapons[weapon] = formula(own);
    }
    types[TYPE_ALIASES[name] ?? camel(name)] = {
      default: formula(base),
      weapons,
    };
  }
  return types;
}

export function reloadFormulaOf(
  types: ReloadFormulaSnapshot["types"],
  weaponType: string,
  name: string,
): ReloadFormula | undefined {
  const type = types[weaponType];
  return type ? (type.weapons[name] ?? type.default) : undefined;
}

export function reloadSeconds(f: ReloadFormula, stat: number): number {
  const s = Math.min(Math.max(stat, 0), MAX_STAT);
  return (f.evpp * s * s + f.vpp * s + f.offset) * f.ammoPercent;
}

/** Reload with the catalyst ÷ reload without: its reload stat, and a shorter animation it names. */
export function catalystReloadFactor(
  f: ReloadFormula,
  stat: number,
  delta: number,
  catalystText: string,
): number {
  const animation = ANIMATION.exec(catalystText);
  return (
    (reloadSeconds(f, stat + delta) / reloadSeconds(f, stat)) *
    (animation ? 1 - Number(animation[1]) / 100 : 1)
  );
}
