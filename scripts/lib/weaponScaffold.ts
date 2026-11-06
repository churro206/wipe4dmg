// Scaffold of the weapon items (ADR 0019, Q1, docs/architecture.md section 5.2): one item file per
// exotic from its Quantum base row, once. The file holds the template "hit" and "timing" and the
// catalyst of the "cata" row; the author adds the mechanics (W1 to W4) and the file is his from then on.
// Every number is a `$quantum` or `$manifest` reference, so the file has no value of its own.

import type {
  ClarityEntry,
  ManifestWeapon,
  QuantumWeaponRow,
  WeaponType,
} from "../../src/data/schema.ts";
import { slug } from "./aegisBosses.ts";
import { textHash } from "./hash.ts";
import { timingFromQuantum } from "./timing.ts";

export type ScaffoldInputs = {
  quantum: QuantumWeaponRow[];
  manifest: ManifestWeapon[];
  clarity: ClarityEntry[];
  /** Spelling in Quantum (lower case) → name in the manifest, e.g. "tesselation" → "Tessellation". */
  aliases: Record<string, string>;
  /** Ids of the weapons that have an item file already; they stay as they are. */
  existingIds: Set<string>;
  /** Date of the structure sources, e.g. "2026-11-03". */
  retrieved: string;
};

export type ScaffoldResult = {
  items: Record<string, unknown>[];
  skipped: { name: string; reason: string }[];
};

/** Manifest stat that holds the charge of a weapon type: fusion rifles charge, bows draw. */
const CHARGE_STATS: Partial<Record<WeaponType, string>> = {
  fusionRifle: "Charge Time",
  linearFusionRifle: "Charge Time",
  bow: "Draw Time",
};

// Quantum rounds the time to empty to 0.1 s, so the rate of a cata row differs from the plain one
// by rounding alone; only a larger difference counts as the catalyst's.
const RATE_NOISE = 0.02;

const CATALYST_TYPE = "Weapon Catalyst Exotic";

const nameKey = (name: string) => name.toLowerCase();

const derived = (id: string, retrieved: string, note: string) => ({
  name: `Item file ${id}`,
  retrieved,
  status: "derived",
  note,
});

type Timed = Exclude<ReturnType<typeof timingFromQuantum>, { problem: string }>;
const timed = (row: QuantumWeaponRow): Timed | null => {
  const timing = timingFromQuantum(row);
  return "problem" in timing ? null : timing;
};

/** The timing fields of the catalyst: those that differ from the weapon without it. */
function catalystTiming(plain: Timed, cata: Timed, cataRow: string) {
  const ref = (field: string) => `$quantum[${cataRow}].timing.${field}`;
  const reload = (t: Timed) => Math.round(t.engineReloadSeconds * 1000);
  const rateDiffers = Math.abs(plain.intervalSeconds / cata.intervalSeconds - 1) > RATE_NOISE;
  const differs =
    rateDiffers ||
    plain.magazine !== cata.magazine ||
    plain.totalShots !== cata.totalShots ||
    reload(plain) !== reload(cata);
  if (!differs) return null;
  return {
    ...(rateDiffers ? { fireRateRpm: ref("fireRateRpm") } : {}),
    magazine: ref("magazine"),
    totalShots: ref("totalShots"),
    reloadTimeMs: ref("reloadTimeMs"),
  };
}

const hitOf = (row: QuantumWeaponRow) => row.precisionDamage ?? row.bodyDamage;

export function scaffoldWeaponItems(inputs: ScaffoldInputs): ScaffoldResult {
  const items: Record<string, unknown>[] = [];
  const skipped: ScaffoldResult["skipped"] = [];
  for (const weapon of inputs.manifest) {
    const id = slug(weapon.name);
    if (inputs.existingIds.has(id)) continue;
    const skip = (reason: string) => skipped.push({ name: weapon.name, reason });

    const rows = inputs.quantum.filter(
      (r) => nameKey(inputs.aliases[nameKey(r.name)] ?? r.name) === nameKey(weapon.name),
    );
    if (rows.length === 0) {
      skip("no Quantum row");
      continue;
    }
    // The plain row; a weapon with the catalyst built in has only the "cata" row
    const plainRow = rows.find((r) => r.variant === "");
    const cataRow = rows.find((r) => r.variant === "cata");
    const base = plainRow ?? cataRow;
    if (!base) {
      skip(`no base row (only ${rows.map((r) => `"${r.variant}"`).join(", ")})`);
      continue;
    }
    if (hitOf(base) === null) {
      skip(`no hit damage in ${base.id}`);
      continue;
    }
    const baseTiming = timed(base);
    if (!baseTiming) {
      skip(`no timing from ${base.id}: ${(timingFromQuantum(base) as { problem: string }).problem}`);
      continue;
    }
    const texts = inputs.clarity.filter((e) => e.itemName === weapon.name);
    const unique = texts.filter((e, i) => texts.findIndex((o) => o.name === e.name) === i);
    if (unique.length === 0) {
      skip("no Clarity text");
      continue;
    }

    const precision = base.precisionDamage !== null;
    const timingRef = (field: string) => `$quantum[${base.id}].timing.${field}`;
    const chargeStat = CHARGE_STATS[weapon.weaponType];
    const hasCharge = chargeStat !== undefined && weapon.stats[chargeStat] !== undefined;

    // Catalyst: from the "cata" row beside the plain one; a perk of the manifest or a Clarity entry
    // without such a row is a catalyst whose effect no source quantifies
    const catalystEntries = unique.filter((e) => e.type === CATALYST_TYPE);
    const builtIn = plainRow === undefined;
    // Built in: the base row has the catalyst already, so its timing is not a difference (unknown)
    const hasCatalyst = weapon.catalyst !== null || catalystEntries.length > 0 || cataRow !== undefined;
    let catalyst: Record<string, unknown> | undefined;
    if (hasCatalyst) {
      const names = [...new Set([...(weapon.catalyst?.perks ?? []), ...catalystEntries.map((e) => e.name)])];
      const cataTiming = cataRow && !builtIn ? timed(cataRow) : null;
      const timing = cataRow && cataTiming ? catalystTiming(baseTiming, cataTiming, cataRow.id) : null;
      const damageSame = cataRow && !builtIn ? hitOf(cataRow) === hitOf(base) : false;
      catalyst = {
        name: names.join(", ") || weapon.catalyst?.name || "Catalyst",
        description: catalystEntries.map((e) => e.text).join("\n"),
        // Timing only if the cata row changes nothing else; a changed hit or no change at all is a
        // catalyst whose effect the author has to read from the text
        effect: timing && damageSame ? "timing" : "unknown",
        ...(timing ? { timing } : {}),
      };
    }

    items.push({
      id,
      kind: "exoticWeapon",
      name: weapon.name,
      texts: unique.map((e) => ({ source: "clarity", entry: e.name, hash: textHash(e.text) })),
      chargeTimeMs: hasCharge
        ? `$manifest[${weapon.name}].stat("${chargeStat}")`
        : {
            value: 0,
            source: derived(
              id,
              inputs.retrieved,
              "Derived: the weapon has no charge of its own; the Quantum time to empty counts from the first shot",
            ),
          },
      fireRateRpm: timingRef("fireRateRpm"),
      magazine: timingRef("magazine"),
      totalShots: timingRef("totalShots"),
      reloadTimeMs: timingRef("reloadTimeMs"),
      ...(catalyst ? { catalyst } : {}),
      parts: {
        shot: {
          name: "Shot",
          damage: `$quantum[${base.id}].${precision ? "precisionDamage" : "bodyDamage"}`,
          ...(precision ? { precision: true } : {}),
          delivery: "impact",
        },
      },
      rules: [{ id: "shot", on: { on: "shot" }, do: [{ type: "spawn", part: "shot" }] }],
    });
  }
  return { items, skipped };
}
