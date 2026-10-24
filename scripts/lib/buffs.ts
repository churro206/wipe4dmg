// Effects of the buffs, debuffs, mods and artifact perks from Court's Stacking Guide (ADR 0015,
// block "all buffs"). A spec names the Court row and says where the effect appears (provider, damage
// sources, weapon types); value and duration come from the row. Every other Court row gets a verdict
// (covered by an existing effect, exotic armor, weapon, skipped with a reason), so none is lost.
// Run: npm run build:buffs

import type {
  ClarityEntry,
  CourtEntry,
  DamageSource,
  Effect,
  EffectProvider,
  Element,
  Source,
  WeaponType,
} from "../../src/data/schema.ts";

const MS_PER_SECOND = 1000;
const ALL_SOURCES: DamageSource[] = [
  "weapon",
  "grenade",
  "melee",
  "super",
  "classAbility",
  "keyword",
];
const ARTIFACT: EffectProvider[] = [{ kind: "artifact", slot: "artifact" }];
const FIRETEAM: EffectProvider[] = [{ kind: "fireteamSupport" }];
// Golden Gun gets the Radiant value for its Super (effects.json, Well of Radiance)
const GOLDEN_GUN = ["golden-gun-deadshot", "golden-gun-marksman"];

export type BuffSpec = {
  id: string;
  name: string;
  shortName: string;
  court: { category: string; name: string; itemType?: string };
  providers: EffectProvider[];
  bucketId: "debuff" | "empowering" | "surge" | "amplification";
  damageSources: DamageSource[];
  weaponTypes?: WeaponType[];
  elements?: Element[];
  superElements?: Element[];
  stage?: number; // which percentage of a staged row; omitted: the highest (last)
  elementIconKey?: string; // icon follows the weapon element, e.g. "surge"
  noDuration?: boolean; // lasts the whole damage phase although the row names a time
  goldenGun?: boolean; // the Super part for Golden Gun, as Radiant
  /** Raises the effects of another spec: each line of the row ("15%->25%") for these effects. */
  improves?: { effectIds: string[]; line: number }[];
  note?: string;
};

const DEBUFF_SOURCES = ALL_SOURCES;
const weakenPerk = (
  id: string,
  name: string,
  itemType: string,
  superElements?: Element[],
): BuffSpec => ({
  id,
  name,
  shortName: name,
  court: { category: "Global Debuffs", name, itemType },
  providers: ARTIFACT,
  bucketId: "debuff",
  damageSources: DEBUFF_SOURCES,
  ...(superElements ? { superElements } : {}),
});

export const BUFF_SPECS: BuffSpec[] = [
  {
    id: "expanding-abyss",
    name: "Expanding Abyss",
    shortName: "Abyss",
    court: {
      category: "Amplification Modifiers",
      name: "Expanding Abyss",
    },
    providers: ARTIFACT,
    bucketId: "debuff",
    damageSources: DEBUFF_SOURCES,
    elements: ["void"],
    improves: [
      { effectIds: ["weaken"], line: 0 },
      { effectIds: ["tractor-cannon", "moebius-tether"], line: 1 },
      { effectIds: ["deadfall-tether"], line: 2 },
    ],
    note: "Court: Void damage only; does not affect Divinity. Raises only the Weaken switch and the tethers, not the Weaken of exotic armor.",
  },
  weakenPerk("debilitating-wave", "Debilitating Wave", "Slayer Baron Apothecary Satchel", ["void"]),
  weakenPerk("maligned-harvest", "Maligned Harvest", "Tablet of Ruin"),
  weakenPerk("singularity-blade", "Singularity Blade", "Encrypted Data Disk"),
  weakenPerk("supernova", "Supernova", "NPA Repulsion Regulator"),
  weakenPerk("void-infestation", "Void Infestation", "Encrypted Data Disk"),
  weakenPerk("weakened-clear", "Weakened Clear", "Slayer Baron Apothecary Satchel"),
  {
    id: "radiant-orbs",
    name: "Radiant Orbs",
    shortName: "Orbs",
    court: {
      category: "Empowering Buffs",
      name: "While a Solar or Prismatic Subclass is equipped, and picking up an Orb of Power",
    },
    providers: ARTIFACT,
    bucketId: "empowering",
    damageSources: ["weapon"],
    goldenGun: true,
  },
  {
    id: "heart-of-the-flame",
    name: "Heart of the Flame",
    shortName: "Heart Flame",
    court: { category: "Empowering Buffs", name: "Heart of the Flame" },
    providers: [...ARTIFACT, ...FIRETEAM],
    bucketId: "empowering",
    damageSources: ["weapon"],
    goldenGun: true,
  },
  {
    id: "prismatic-transfer",
    name: "Prismatic Transfer",
    shortName: "Transfer",
    court: { category: "Empowering Buffs", name: "Prismatic Transfer" },
    providers: [...ARTIFACT, ...FIRETEAM],
    bucketId: "empowering",
    damageSources: ["weapon"],
  },
  {
    id: "weapons-of-light",
    name: "Weapons of Light (Ward of Dawn)",
    shortName: "Weapons of Light",
    court: { category: "Empowering Buffs", name: "Weapons of Light" },
    providers: FIRETEAM,
    bucketId: "empowering",
    damageSources: ["weapon"],
  },
  {
    id: "precision-equity",
    elementIconKey: "surge",
    name: "Precision Equity",
    shortName: "Equity",
    court: { category: "Weapon Surges", name: "Precision Equity" },
    providers: ARTIFACT,
    bucketId: "surge",
    damageSources: ["weapon"],
  },
  {
    id: "that-fresh-bullet-smell",
    elementIconKey: "surge",
    name: "That Fresh Bullet Smell",
    shortName: "Bullet Smell",
    court: { category: "Weapon Surges", name: "That Fresh Bullet Smell" },
    providers: ARTIFACT,
    bucketId: "surge",
    damageSources: ["weapon"],
    elements: ["kinetic"],
  },
  {
    id: "void-weapon-channelling",
    elementIconKey: "surge",
    name: "Void Weapon Channelling",
    shortName: "Void Channel",
    court: { category: "Weapon Surges", name: "Void Weapon Channelling" },
    providers: ARTIFACT,
    bucketId: "surge",
    damageSources: ["weapon"],
    elements: ["void"],
  },
  {
    id: "argent-blade",
    name: "Argent Blade",
    shortName: "Argent Blade",
    court: { category: "Amplification Modifiers", name: "Argent Blade" },
    providers: ARTIFACT,
    bucketId: "amplification",
    damageSources: ["weapon"],
    weaponTypes: ["sword"],
  },
  {
    id: "argent-ordnance",
    name: "Argent Ordnance",
    shortName: "Ordnance",
    court: { category: "Amplification Modifiers", name: "Argent Ordnance" },
    providers: ARTIFACT,
    bucketId: "amplification",
    damageSources: ["weapon"],
    weaponTypes: ["rocketLauncher"],
  },
  {
    id: "argent-quiver",
    name: "Argent Quiver",
    shortName: "Quiver",
    court: { category: "Amplification Modifiers", name: "Argent Quiver" },
    providers: ARTIFACT,
    bucketId: "amplification",
    damageSources: ["weapon"],
    weaponTypes: ["bow"],
    stage: 0,
    note: "Court: 35 % on primary bows, 25 % on heavy bows; the primary value applies.",
  },
  {
    id: "sniper-meditation",
    name: "Sniper's Meditation",
    shortName: "Meditation",
    court: { category: "Amplification Modifiers", name: "Sniper's Mediation" },
    providers: ARTIFACT,
    bucketId: "amplification",
    damageSources: ["weapon"],
    weaponTypes: ["sniperRifle"],
  },
  {
    id: "targeting-autoloader",
    name: "Targeting Autoloader",
    shortName: "Autoloader",
    court: { category: "Amplification Modifiers", name: "Targeting Autoloader" },
    providers: ARTIFACT,
    bucketId: "amplification",
    damageSources: ["weapon"],
    weaponTypes: ["autoRifle"],
  },
  {
    id: "arc-compounding",
    name: "Arc Compounding",
    shortName: "Arc Compound",
    court: { category: "Amplification Modifiers", name: "Arc Compounding" },
    providers: ARTIFACT,
    bucketId: "amplification",
    damageSources: ALL_SOURCES,
    elements: ["arc"],
    noDuration: true,
    note: "Needs Arc Blind on the target (assumed up).",
  },
  {
    id: "remote-shield",
    name: "Remote Shield (Edge of Action)",
    shortName: "Remote Shield",
    court: { category: "Amplification Modifiers", name: "Remote Shield" },
    providers: FIRETEAM,
    bucketId: "amplification",
    damageSources: ["weapon"],
  },
];

/** Court rows that are not switches here, with the reason; the other rows come from the rules below. */
const SKIPPED: Record<string, string> = {
  "Scanner Augment^": "Raid mod of Deep Stone Crypt, not part of a normal build",
  "Sect of Force Mod": "Does not apply to Bosses (Elite, Miniboss, Champion only)",
  "Shocked": "Raid mod (Glyphkeeper), not part of a normal build",
  "Song of Flame": "Radiant only during the Super, in which the weapon does not fire",
  "Harsh Refraction": "Three tiers by weapon rarity and needs an element-matching debuff; Trace Rifles only",
  "Solo Operative": "Only while solo, not a fireteam build",
  "Torch": "Only against non-Boss combatants",
};
const WEAPON_ROWS = new Set([
  "Slayer's Fang",
  "Skyburner's Oath",
  "Vexcalibur",
  "The Navigator",
  "Kinetic Intrinsic Buff",
  "Consume weapon's reserves; hits apply Weaken on hit",
  "Damage hit",
]);
const ARMOR_ITEM = /^(Hunter|Titan|Warlock) (Helmet|Chest|Arms|Legs|Class Item)/;
// Exotic armor rows whose cells are shifted in the sheet or whose item type is not an armor slot
const EXOTIC_ARMOR_ROWS = new Set([
  "Empowering Rift:", // Boots of the Assembler
  "Mask of Bakris",
  "Actium War Rig",
  "The Path of Burning Steps",
]);
const COVERED: Record<string, string> = {
  "Deadfall Tether": "deadfall-tether",
  "Moebius Tether": "moebius-tether",
  "Banner Shield": "banner-shield",
  "Well of Radiance": "well-of-radiance",
  "Empowering Rift": "empowering-rift",
  "After leaving Well": "radiant",
  "Lumina's": "lumina-noble-rounds",
  "Kinetic Surge Mod": "surge-1x, surge-2x, surge-3x",
  "Weapons Stat": "weapon-stats.json (slider)",
  "Elemental Overdrive": "elemental-overdrive-solar",
  "Particle Reconstruction": "particle-reconstruction",
  "Sustained Damage hit": "divinity",
  "Combination Argent Blade": "argent-blade",
};

export type BuffVerdict =
  | "imported"
  | "covered"
  | "weaken"
  | "exotic"
  | "weapon"
  | "skipped"
  | "unclassified";

export type BuffRow = {
  category: string;
  group: string;
  name: string;
  verdict: BuffVerdict;
  target: string; // effect id(s) or reason
};

/** First percentage of each line, or the target after "->" ("15%->25%"). */
export function percentLines(text: string): number[] {
  return text
    .split("\n")
    .map((line) => [...line.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1])))
    .filter((values) => values.length > 0)
    .map((values) => values[values.length - 1]);
}

/** Seconds of the first time in the duration cell ("10s", "4.5s"); undefined for "~" and "∞". */
export function durationSeconds(text: string | null): number | undefined {
  const match = text?.match(/(\d+(?:\.\d+)?)s\b/);
  return match ? Number(match[1]) : undefined;
}

const factorOf = (percent: number) => Math.round((1 + percent / 100) * 10000) / 10000;

/** Rows with an empty cell are shifted one column to the left: the value is then in the trigger cell. */
function valueCells(row: CourtEntry): { pve: string; duration: string | null } {
  return /%/.test(row.pve ?? "") || !/%/.test(row.trigger)
    ? { pve: row.pve ?? "", duration: row.pveDuration }
    : { pve: row.trigger, duration: row.pve };
}

function findRow(entries: CourtEntry[], spec: BuffSpec): CourtEntry {
  const found = entries.filter(
    (e) =>
      e.category.toLowerCase() === spec.court.category.toLowerCase() &&
      e.name === spec.court.name &&
      (spec.court.itemType === undefined || e.itemType === spec.court.itemType),
  );
  if (found.length !== 1) {
    throw new Error(
      `Court row "${spec.court.name}" (${spec.court.category}) found ${found.length} times`,
    );
  }
  return found[0];
}

export type BuffInputs = {
  court: CourtEntry[];
  courtSource: Source;
  clarity: ClarityEntry[];
  claritySource: Source;
  existingEffectIds: Set<string>; // effects.json, subclass and exotic effects
  codes: Record<string, number>; // codes once given stay
  nextCode: number; // first free code
};

function buildEffect(spec: BuffSpec, row: CourtEntry, inputs: BuffInputs, code: number): Effect {
  const { pve, duration } = valueCells(row);
  const source: Source = {
    name: `Court Stacking Guide (${spec.court.category}, ${row.name})`,
    url: inputs.courtSource.url,
    retrieved: inputs.courtSource.retrieved,
    status: "verified",
    quote: pve.replace(/\n/g, " / "),
    ...(spec.note ? { note: spec.note } : {}),
  };
  const percents = percentLines(pve);
  const percent = percents[spec.stage ?? percents.length - 1];
  const base = {
    type: "multiplier" as const,
    bucketId: spec.bucketId,
    damageSources: spec.damageSources,
    ...(spec.weaponTypes ? { weaponTypes: spec.weaponTypes } : {}),
    ...(spec.elements ? { elements: spec.elements } : {}),
    ...(spec.superElements ? { superElements: spec.superElements } : {}),
  };
  const parts: Effect["parts"] = [];
  if (spec.improves) {
    // "15%->25%": the value after the arrow of each line, for the effects named in the spec
    const lines = pve.split("\n").filter((l) => l.includes("->"));
    for (const { effectIds, line } of spec.improves) {
      const target = Number(lines[line]?.split("->")[1]?.replace("%", ""));
      if (!Number.isFinite(target)) throw new Error(`${row.name}: no line ${line}`);
      parts.push({
        ...base,
        multiplier: { value: factorOf(target), source },
        requiresEffectIds: effectIds,
      });
    }
  } else {
    if (percent === undefined) throw new Error(`${row.name}: no percentage in "${pve}"`);
    parts.push({ ...base, multiplier: { value: factorOf(percent), source } });
    if (spec.goldenGun) {
      parts.push({
        ...base,
        damageSources: ["super"],
        abilityIds: GOLDEN_GUN,
        multiplier: { value: factorOf(percent), source },
      });
    }
  }
  const seconds = spec.noDuration ? undefined : durationSeconds(duration);
  return {
    id: spec.id,
    name: spec.name,
    code,
    shortName: spec.shortName,
    ...(spec.elementIconKey ? { elementIconKey: spec.elementIconKey } : {}),
    providers: spec.providers,
    parts,
    ...(seconds !== undefined
      ? {
          durationMs: {
            value: seconds * MS_PER_SECOND,
            source: { ...source, quote: duration ?? undefined, note: undefined },
          },
        }
      : {}),
  };
}

function classify(row: CourtEntry): Pick<BuffRow, "verdict" | "target"> {
  const spec = BUFF_SPECS.find((s) => s.court.name === row.name && s.court.category.toLowerCase() === row.category.toLowerCase());
  if (spec) return { verdict: "imported", target: spec.id };
  if (
    row.category === "Exotic Intrinsics" ||
    ARMOR_ITEM.test(row.itemType ?? "") ||
    EXOTIC_ARMOR_ROWS.has(row.name)
  ) {
    return { verdict: "exotic", target: "build:armor (exotic-armor-effects.json)" };
  }
  if (COVERED[row.name] !== undefined) return { verdict: "covered", target: COVERED[row.name] };
  if (SKIPPED[row.name] !== undefined) return { verdict: "skipped", target: SKIPPED[row.name] };
  if (WEAPON_ROWS.has(row.name)) return { verdict: "weapon", target: "weapon packages" };
  if (/^Prismatic/i.test(row.group) || row.group.startsWith("ALL ELEMENTS")) {
    return { verdict: "skipped", target: "Prismatic Spirit (fragment): block Aspects and Fragments" };
  }
  if (row.category === "Global Debuffs" && valueCells(row).pve === "15%") {
    return { verdict: "weaken", target: "weaken" };
  }
  return { verdict: "unclassified", target: "" };
}

/**
 * Banner of War (Strand Titan aspect) for the fireteam: +10 % Sword damage for allies (Clarity).
 * Court does not list it. The melee part (+100 %, additive melee bucket, U6-4) and Bladefury (+40 %)
 * are not modelled. Kills extend the 15 s up to 30 s, so it counts for the whole damage phase.
 */
function bannerOfWar(inputs: BuffInputs, code: number): Effect {
  const entry = inputs.clarity.find((e) => e.name === "Banner of War");
  const quote = entry?.text.match(/\d+% Increased Sword Damage \(\d+% for the user\)/)?.[0];
  const percent = Number(quote?.match(/^(\d+)%/)?.[1]);
  if (!entry || !quote || !Number.isFinite(percent)) {
    throw new Error("Banner of War: Sword damage not found in Clarity");
  }
  return {
    id: "banner-of-war",
    name: "Banner of War (Strand Titan)",
    code,
    shortName: "Banner of War",
    providers: FIRETEAM,
    parts: [
      {
        type: "multiplier",
        bucketId: "amplification",
        multiplier: {
          value: factorOf(percent),
          source: { ...inputs.claritySource, quote, note: "Melee (+100 %) and Bladefury (+40 %) are not modelled." },
        },
        damageSources: ["weapon"],
        weaponTypes: ["sword"],
      },
    ],
  };
}

export function buffEffects(inputs: BuffInputs): { effects: Effect[]; rows: BuffRow[]; codes: Record<string, number> } {
  const codes = { ...inputs.codes };
  let nextCode = inputs.nextCode;
  const effects = BUFF_SPECS.map((spec) => {
    const row = findRow(inputs.court, spec);
    codes[spec.id] ??= nextCode++;
    return buildEffect(spec, row, inputs, codes[spec.id]);
  });
  codes["banner-of-war"] ??= nextCode++;
  effects.push(bannerOfWar(inputs, codes["banner-of-war"]));
  const rows = inputs.court
    .filter((e) => e.category !== "Exotic Intrinsics")
    .map((e) => ({ category: e.category, group: e.group, name: e.name, ...classify(e) }));
  for (const effect of effects) {
    for (const part of effect.parts) {
      if (part.type !== "multiplier") continue;
      for (const id of part.requiresEffectIds ?? []) {
        if (!inputs.existingEffectIds.has(id)) throw new Error(`${effect.id} requires unknown effect ${id}`);
      }
    }
  }
  return { effects, rows, codes };
}

export function renderBuffs(rows: BuffRow[]): string {
  const lines = [
    "# Buffs, Debuffs, Mods und Artifact-Perks aus Court",
    "",
    "Generiert von `npm run build:buffs` aus `src/data/court-buffs.json` (nicht von Hand ändern). Jede Court-Zeile hat ein Urteil:",
    "",
    "- **imported**: eigener Schalter in `src/data/buff-effects.json` (Wert und Dauer aus Court).",
    "- **covered**: schon in `effects.json` (Wert gleich Court). **weaken**: 15 % Weaken, der Schalter `weaken` gilt für alle Quellen.",
    "- **exotic**: Exotic-Rüstung, `docs/exotic-effects.md`. **weapon**: Exotic-Waffe oder Perk, steckt im Waffenpaket.",
    "- **skipped**: kein Schalter, mit Grund.",
    "",
    "| Kategorie | Gruppe | Name | Urteil | Ziel / Grund |",
    "| --- | --- | --- | --- | --- |",
  ];
  const cell = (text: string) => text.replace(/\n/g, " ").replace(/\|/g, "/");
  for (const r of rows) {
    lines.push(`| ${cell(r.category)} | ${cell(r.group)} | ${cell(r.name)} | ${r.verdict} | ${cell(r.target)} |`);
  }
  return lines.join("\n") + "\n";
}
