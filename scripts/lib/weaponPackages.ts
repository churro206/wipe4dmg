// Builds weapon packages from Aegis and Quantum (ADR 0013): base row, package per shot, timing from
// the Quantum time to empty, options from "with / without" rows, automatic gate, gaps, link codes
// and the review table docs/weapon-import.md. The simulator check of the time to empty runs in
// tests/weaponPackages.test.ts, since scripts cannot load the engine directly.

import type {
  AegisSustainedRow,
  CatalystEffect,
  ClarityEntry,
  WeaponOverride,
  AegisSustainedSnapshot,
  AegisWeaponRow,
  AegisWeaponSnapshot,
  CompendiumEntry,
  Effect,
  KeywordData,
  ManifestArmorPiece,
  ManifestTerms,
  ManifestWeapon,
  QuantumWeaponRow,
  QuantumWeaponSnapshot,
  Source,
  Weapon,
  WeaponGap,
  WeaponOption,
} from "../../src/data/schema.ts";
import { slug } from "./aegisBosses.ts";
import { assumptionName } from "./aegisWeapons.ts";
import {
  abilityKindsNamed,
  armorForWeapon,
  changesTiming,
  clarityCatalysts,
  classifyAssumption,
  timingImpact,
  type AssumptionClass,
  type AssumptionKind,
} from "./weaponAssumptions.ts";

export type WeaponImportInputs = {
  aegis: AegisWeaponSnapshot;
  sustained: AegisSustainedSnapshot;
  quantum: QuantumWeaponSnapshot;
  manifestVersion: string;
  manifest: ManifestWeapon[];
  armor: ManifestArmorPiece[];
  terms: ManifestTerms["terms"];
  compendium: CompendiumEntry[];
  effects: Effect[];
  keywords: KeywordData[];
  codes: Record<string, number>;
  clarity: ClarityEntry[];
  overrides: WeaponOverride[];
};

// Spellings of a source that differ from the manifest beyond case, e.g. Quantum's typo.
const NAME_ALIASES: Record<string, string> = {
  "verglass curve": "verglas curve",
};
const nameKey = (name: string) => {
  const key = name.toLowerCase();
  return NAME_ALIASES[key] ?? key;
};
/** Whether a row of Aegis or Quantum names this manifest weapon; the sheets differ in case. */
const sameName = (rowName: string, manifestName: string) =>
  nameKey(rowName) === nameKey(manifestName);

// Catalysts, perks and mods of a weapon are weapon perks in Court's stacking guide.
const OPTION_BUCKET = "weaponPerk";
const TOLERANCE = 0.03; // ±3 %, ADR 0011 and ADR 0013
const OVERRIDE_TIMING = "override"; // row id of a timing whose values an override states
const RPM_HINT = 0.25; // a derived fire rate this far from the Quantum rpm is worth a look
const BURST_TOLERANCE = 0.005; // Aegis rounds its hits; a burst sums them
// A catalyst changes damage or timing if a value moves by more than rounding (1 %).
const CATALYST_MIN_CHANGE = 0.01;
// Words of a catalyst text that would change boss damage if a source quantified them.
const CATALYST_DAMAGE = /\b(damage|scorch|jolt|unravel|weaken|ignit)/i;
const KILLS = /\b(kills?|killing|killed|final blows?)\b/i;
// Conditions one boss without adds never meets (owner, ADR 0015): kills, several enemies, allies,
// pickups, shields, damage taken, freezing and shattering, players; or a perk that does nothing.
const NO_BOSS = new RegExp(
  [
    KILLS.source,
    /\b(separate enemies|\d+ enemies|enemies within|of \d+ enemies|allies|an ally|ally)\b/
      .source,
    /\b(pick(?:ing)? up|pickups?|ionic traces?|stasis shards?|orbs? of power|tangles?|firesprites|void breach(?:es)?)\b/
      .source,
    /\b(shield break|elemental shield|arc shield|damage taken|self-damage|frozen|freezing|shatter\w*|players?|grapple|flinch)\b/
      .source,
  ].join("|"),
  "i",
);
// Sentences that only qualify a buff (how long it lingers, what removes it) do nothing alone.
const QUALIFIER =
  /\b(removes? (?:the|all) (?:buff|stacks)|buff (?:lingers|duration|can be|remains)|effect lingers|cannot be refreshed|persists through stow|activates this perk)\b/i;
const BROKEN = /\bdoes not function\b/i; // e.g. Black Talon: "this catalyst does not function"

/**
 * The paragraphs of a catalyst text that can work against one boss without adds. A line ending in
 * ":" opens a paragraph with the bullet lines below it; a condition anywhere drops the whole
 * paragraph.
 */
export function bossParagraphs(text: string): string {
  if (BROKEN.test(text)) return "";
  const paragraphs: string[][] = [];
  for (const line of text.split("\n")) {
    const last = paragraphs.at(-1);
    if (last && /^\s*•/.test(line) && /:\s*$/.test(last[0])) last.push(line);
    else paragraphs.push([line]);
  }
  return paragraphs
    .filter((p) => !p.some((line) => NO_BOSS.test(line)))
    .filter((p) => !(p.length === 1 && QUALIFIER.test(p[0])))
    .map((p) => p.join("\n"))
    .join("\n");
}
const BASE_KINDS: AssumptionKind[] = [
  "execution",
  "intrinsic",
  "perk",
  "weaponMod",
  "effect",
];
const OPTION_KINDS: AssumptionKind[] = ["catalyst", "perk", "weaponMod"];
const CONDITION_WORDS =
  /\b(kill|kills|killed|final blow|defeat|precision|while|after|when|hits?)\b/i;
const DURATION =
  /\bfor (\d+(?:\.\d+)?)(?:\s*↑\s*\d+(?:\.\d+)?)?\s*(?:\[[^\]]*\]\s*)?seconds?\b/i;
const TICKS = /\bticks?\b/i;

export type ReportOption = {
  name: string;
  kind: WeaponOption["kind"];
  factor: number;
  durationSeconds: number | null;
  condition: string | null;
  notes: string[];
};
export type ReportWeapon = {
  name: string;
  weaponType: string;
  element: string;
  ammo: string;
  status: "package" | "gap";
  gapReason: string | null;
  baseRow: AegisWeaponRow | null;
  perShot: number | null;
  magazine: number | null;
  totalShots: number | null;
  reloadSeconds: number | null;
  timeToEmptySeconds: number | null;
  timingSource: "Aegis" | "Quantum" | null;
  quantumRpm: number | null;
  derivedRpm: number | null;
  scaleDeviation: number | null;
  includedEffectIds: string[];
  options: ReportOption[];
  unusedRows: { assumptions: string[]; reason: string }[];
  notes: string[];
  armor: string[];
  abilityKinds: string[];
  catalystEffect?: CatalystEffect;
  catalystTiming?: Timing;
  catalystText?: string;
};

const CATALYST_LABELS: Record<CatalystEffect, string> = {
  damage: "Schaden",
  timing: "Timing",
  damageAndTiming: "Schaden und Timing",
  none: "keine",
  unknown: "unbekannt",
};
export type ReportAssumption = AssumptionClass & {
  assumption: string;
  weapon: string;
};
export type WeaponReport = {
  aegisRetrieved: string;
  quantumRetrieved: string;
  manifestVersion: string;
  weapons: ReportWeapon[];
  assumptions: ReportAssumption[];
};
export type WeaponImportResult = {
  packages: Weapon[];
  gaps: WeaponGap[];
  codes: Record<string, number>;
  report: WeaponReport;
};

const KIND_LABELS: Record<AssumptionKind, string> = {
  execution: "Ausführung",
  intrinsic: "Intrinsic",
  catalyst: "Katalysator",
  perk: "Perk",
  weaponMod: "Mod",
  effect: "Effect",
  exoticArmor: "Exotic-Rüstung",
  artifactPerk: "Artefakt",
  foreignPerk: "fremder Perk",
  notModelled: "nicht modelliert",
};

/**
 * Labels of a Quantum variant in the words of Aegis: "cata, w/o weaken" → ["catalyst", "without weaken"].
 */
const quantumLabel = (variant: string): string[] =>
  variant
    .split(",")
    .map((part) =>
      part
        .trim()
        .replace(/^cata\b/i, "catalyst")
        .replace(/^w\/o\s+/i, "without ")
        .replace(/^w\/\s*/i, "with "),
    )
    .filter((part) => part !== "");

/**
 * Scale check (ADR 0011, point 1): Aegis against Quantum, smallest deviation of two ways. Single
 * hit ÷ full modifiers against Quantum body or precision damage (fails for weapons with several
 * parts, e.g. Gjallarhorn), or the Aegis average per shot against Quantum total damage ÷ shots
 * (fails where the sources assume different things, e.g. Truth without cluster bombs at Quantum).
 */
function scaleDeviation(
  row: AegisWeaponRow,
  quantum: QuantumWeaponRow,
): number | null {
  const pairs: [number | null, number | null][] = [
    [
      row.critShot === null ? null : row.critShot / row.fullModifiers,
      quantum.precisionDamage,
    ],
    [
      row.bodyShot === null ? null : row.bodyShot / row.fullModifiers,
      quantum.bodyDamage,
    ],
    [
      row.perShot,
      quantum.totalDamage !== null && quantum.totalShots
        ? quantum.totalDamage / quantum.totalShots
        : null,
    ],
  ];
  if (quantum.precisionDamage === null && row.critShot !== null)
    pairs.push([row.critShot / row.fullModifiers, quantum.bodyDamage]);
  const deviations = pairs
    .filter((p): p is [number, number] => p[0] !== null && p[1] !== null)
    .filter(([, q]) => q > 0)
    .map(([a, q]) => Math.abs(a / q - 1));
  return deviations.length > 0 ? Math.min(...deviations) : null;
}

/** Duration and condition of an option: Clarity first, then the Compendium tab Weapon Perks. */
function perkText(
  names: string[],
  compendium: CompendiumEntry[],
  clarity: ClarityEntry[],
): { durationSeconds: number | null; condition: string | null } | null {
  for (const name of names) {
    const key = name.toLowerCase();
    const text =
      clarity.find((e) => e.name.toLowerCase() === key)?.text ??
      compendium.find(
        (e) => e.tab === "Weapon Perks" && e.name.toLowerCase() === key,
      )?.text;
    if (!text) continue;
    // A sentence about ticks gives how long damage over time lasts, not the perk (e.g. the Taken
    // Seekers of One Thousand Voices: "22 ticks of damage, ... for 5.65 seconds").
    const duration = text
      .split(/(?<=[.!])\s+|\n/)
      .filter((sentence) => !TICKS.test(sentence))
      .map((sentence) => DURATION.exec(sentence))
      .find((match) => match !== null);
    const firstLine = text.split("\n")[0];
    return {
      durationSeconds: duration ? Number(duration[1]) : null,
      condition: CONDITION_WORDS.test(firstLine) ? firstLine : null,
    };
  }
  return null;
}

// Scorch from the Compendium text of an exotic weapon, e.g. "inflicts x60+30 Scorch" (base stacks
// before Ember of Ashes), and a bonus on the ignitions it sets off (ADR 0015, U4a-4).
const SCORCH = /\binflict(?:s|ing)? x(\d+)\+\d+ Scorch\b/i;
const SCORCH_BONUS =
  /Solar Effects that are initially applied by [^.]+? deal (\d+(?:\.\d+)?)% increased damage/i;
// Quantum rows without ignitions, e.g. "Does not consider Scorch; without ignition".
const WITHOUT_IGNITIONS = /without ignition|does not consider ignitions/i;
const AEGIS_IGNITION_TICK = /\b(\d+) ignition\b/i;

type ScorchRule = {
  stacksPerShot: number;
  quote: string;
  bonus: { factor: number; quote: string } | null;
  quantumRow: QuantumWeaponRow;
};

/**
 * A weapon whose Compendium text applies scorch becomes a package with an appliesKeyword part, if
 * Quantum has a row without ignitions: the shot comes from that row, the ignitions from the keyword
 * run. An override may set the stacks per shot, e.g. 9 explosions of x10 for One Thousand Voices.
 */
function scorchRule(
  weaponName: string,
  compendium: CompendiumEntry[],
  quantum: QuantumWeaponRow[],
  override: WeaponOverride | undefined,
): ScorchRule | null {
  const text = compendium.find(
    (e) => e.tab === "Exotic Weapons" && e.name.startsWith(weaponName),
  )?.text;
  const match = text ? SCORCH.exec(text) : null;
  if (!text || !match) return null;
  const quantumRow = quantum.find(
    (r) =>
      sameName(r.name, weaponName) &&
      r.variant === "" &&
      WITHOUT_IGNITIONS.test(r.note),
  );
  if (!quantumRow) return null;
  const bonus = SCORCH_BONUS.exec(text);
  return {
    stacksPerShot: override?.scorchStacksPerShot ?? Number(match[1]),
    quote: match[0],
    bonus: bonus
      ? {
          factor: Number((1 + Number(bonus[1]) / 100).toFixed(4)),
          quote: bonus[0],
        }
      : null,
    quantumRow,
  };
}

/**
 * Value per shot of an Aegis row without its ignitions. Aegis counts them in ("2814 ignition"); how
 * many there were follows from the stacks per shot and the threshold, one ignition per full counter
 * (the shots are further apart than the cooldown). Null if the row names no ignition.
 */
function perShotWithoutIgnitions(
  row: AegisWeaponRow,
  stacksPerShot: number,
  threshold: number,
): number | null {
  const tick = AEGIS_IGNITION_TICK.exec(row.otherTicks)?.[1];
  if (!tick) return null;
  let stacks = 0;
  let ignitions = 0;
  for (let shot = 0; shot < row.shots; shot++) {
    stacks += stacksPerShot;
    if (stacks >= threshold) {
      ignitions++;
      stacks = 0;
    }
  }
  return (row.wipe - ignitions * Number(tick)) / row.fullModifiers / row.shots;
}

/** Bullets per Aegis shot if its wipe is a whole multiple of the precision hit, else 1. */
function burstBullets(row: AegisWeaponRow): number {
  if (!row.critShot) return 1;
  const ratio = row.wipe / (row.shots * row.critShot);
  const bullets = Math.round(ratio);
  return bullets > 1 && Math.abs(ratio / bullets - 1) < BURST_TOLERANCE
    ? bullets
    : 1;
}

const blockingReason = (classes: ReportAssumption[]): string =>
  classes
    .filter((c) => !BASE_KINDS.includes(c.kind))
    .map(
      (c) =>
        `${KIND_LABELS[c.kind]}: ${c.assumption}${c.armorName && c.armorName !== c.assumption ? ` (${c.armorName})` : ""}`,
    )
    .join("; ");

/** Timing of a package; the simulator reaches timeToEmptySeconds with these values. */
export type Timing = {
  rowId: string;
  magazine: number;
  totalShots: number | null; // null: unlimited (primary ammo)
  reloadSeconds: number; // as the source states it
  engineReloadSeconds: number; // what the simulator adds after the interval of the last shot
  intervalSeconds: number;
  timeToEmptySeconds: number | null; // null: unlimited ammo
  note: string;
};
type TimingProblem = { problem: string };

/**
 * Aegis "Sustained" reloads right after the last shot of a magazine: time to empty =
 * (shots − magazines) × interval + reloads × reload. The simulator counts one interval before each
 * reload, so it gets reload − interval. Without reloads (an intrinsic refills the magazine) the
 * whole ammo is one magazine.
 */
export function timingFromAegis(
  row: AegisSustainedRow,
  noReloads = false,
): Timing | TimingProblem {
  const timeToEmpty = row.timeToEmptySeconds;
  // A magazine of one without a reload in the notes (e.g. Ex Diris): the reload is inside the fire
  // rate, so all ammo is one magazine.
  if (
    row.magazines.length > 0 &&
    row.magazines.every((m) => m === 1) &&
    row.reloadMs === null &&
    row.swapMs === null
  )
    noReloads = true;
  const magazine = noReloads ? row.shots : row.magazines[0];
  if (!magazine || timeToEmpty === null || row.shots < 1)
    return {
      problem: `Zeile „${row.id}“ ohne Magazin-Folge oder Zeit bis leer`,
    };
  const regular =
    noReloads ||
    row.magazines.every(
      (m, i) =>
        m === magazine || (i === row.magazines.length - 1 && m < magazine),
    );
  if (!regular)
    return {
      problem: `unregelmäßige Magazin-Folge ${row.magazines.join("-")}`,
    };
  const magazines = Math.ceil(row.shots / magazine);
  const reloads = magazines - 1;
  const reloadMs = row.reloadMs ?? row.swapMs;
  if (reloads > 0 && reloadMs === null)
    return { problem: "kein Reload in den Notizen" };
  const reloadSeconds = (reloadMs ?? 0) / 1000;
  const intervalSeconds =
    row.shots > magazines
      ? (timeToEmpty - reloads * reloadSeconds) / (row.shots - magazines)
      : (row.peakRateSeconds ?? reloadSeconds);
  const engineReloadSeconds = reloadSeconds - intervalSeconds;
  if (intervalSeconds <= 0 || (reloads > 0 && engineReloadSeconds < 0))
    return {
      problem: `Zeit bis leer ${timeToEmpty} s passt nicht zu ${reloads} Reloads à ${reloadSeconds} s`,
    };
  return {
    rowId: row.id,
    magazine,
    totalShots: row.shots,
    reloadSeconds,
    engineReloadSeconds: Math.max(0, engineReloadSeconds),
    intervalSeconds,
    timeToEmptySeconds: timeToEmpty,
    note: `Derived: (TtE ${timeToEmpty} s − ${reloads} reloads × ${reloadSeconds} s) ÷ ${row.shots - magazines} intervals within magazines (ADR 0013)`,
  };
}

/**
 * Quantum counts one interval before each reload, like the simulator. Primary ammo is unlimited
 * ("inf"): the timing is magazine, fire rate and reload, without total shots and time to empty.
 */
export function timingFromQuantum(
  row: QuantumWeaponRow,
  noReloads = false,
): Timing | TimingProblem {
  const { totalShots, timeToEmptySeconds, rpm } = row;
  const reloadSeconds = row.reloadSeconds ?? (noReloads ? 0 : null);
  if (row.textCells.totalShots === "inf") {
    if (row.magazine === null || reloadSeconds === null || rpm === null)
      return {
        problem: `unbegrenzte Munition, aber ohne Magazin, Reload oder rpm (${JSON.stringify(row.textCells)})`,
      };
    return {
      rowId: row.id,
      magazine: row.magazine,
      totalShots: null,
      reloadSeconds,
      engineReloadSeconds: reloadSeconds,
      intervalSeconds: 60 / rpm,
      timeToEmptySeconds: null,
      note: "Quantum fire rate; primary ammo is unlimited (Quantum: inf)",
    };
  }
  const magazine = noReloads ? totalShots : row.magazine;
  if (magazine === null || totalShots === null || reloadSeconds === null)
    return {
      problem: `ohne Magazin, Munition oder Reload (${JSON.stringify(row.textCells)})`,
    };
  const reloads = Math.ceil(totalShots / magazine) - 1;
  let intervalSeconds: number;
  let note: string;
  if (timeToEmptySeconds !== null && totalShots > 1) {
    intervalSeconds =
      (timeToEmptySeconds - reloads * reloadSeconds) / (totalShots - 1);
    note = `Derived: (Time to Empty ${timeToEmptySeconds} s − ${reloads} reloads × ${reloadSeconds} s) ÷ ${totalShots - 1} intervals (ADR 0013)`;
    // With one shot per magazine the reloads fill the time; the interval does not matter.
    if (intervalSeconds <= 0 && magazine === 1) intervalSeconds = 0.001;
  } else if (rpm !== null) {
    intervalSeconds = 60 / rpm;
    note = "Quantum fire rate; no Time to Empty";
  } else {
    return { problem: "ohne Zeit bis leer und ohne rpm" };
  }
  if (intervalSeconds <= 0) return { problem: "abgeleiteter Abstand ≤ 0" };
  return {
    rowId: row.id,
    magazine,
    totalShots,
    reloadSeconds,
    engineReloadSeconds: reloadSeconds,
    intervalSeconds,
    timeToEmptySeconds:
      timeToEmptySeconds ??
      (totalShots - 1) * intervalSeconds + reloads * reloadSeconds,
    note,
  };
}

// Clarity states what a catalyst adds with before and after, e.g. "Increases Magazine Size by 3
// (4🠚7)" or "Increases Reserves by 5 (9🠚14)".
const CATALYST_MAGAZINE =
  /Magazine Size by (?:\d+|one|two|three) \((\d+)🠚(\d+)\)/i;
const CATALYST_RESERVES = /Reserves by (\d+) \((\d+)🠚(\d+)\)/i;
// Ammo generation fills reserves from bricks; one boss without adds drops none.
const AMMO_GENERATION = /\d+ Ammo Generation/gi;

/**
 * Timing with the catalyst from the base and the numbers Clarity names (magazine, reserves); null
 * if it names none or the base magazine does not match the text.
 */
export function timingWithCatalyst(
  base: Timing,
  texts: string[],
): Timing | null {
  const text = texts.join("\n");
  const magazine = CATALYST_MAGAZINE.exec(text);
  const reserves = CATALYST_RESERVES.exec(text);
  if (!magazine && !reserves) return null;
  if (magazine && Number(magazine[1]) !== base.magazine) return null;
  const newMagazine = magazine ? Number(magazine[2]) : base.magazine;
  const totalShots =
    base.totalShots === null
      ? null
      : base.totalShots +
        (magazine ? newMagazine - base.magazine : 0) +
        (reserves ? Number(reserves[1]) : 0);
  const reloads =
    totalShots === null ? 0 : Math.ceil(totalShots / newMagazine) - 1;
  return {
    ...base,
    magazine: newMagazine,
    totalShots,
    timeToEmptySeconds:
      totalShots === null
        ? null
        : (totalShots - 1) * base.intervalSeconds +
          reloads * base.engineReloadSeconds,
    note: `${base.note}; with catalyst from Clarity: ${[magazine?.[0], reserves?.[0]].filter(Boolean).join(", ")} (assumption: the magazine counts to the ammo)`,
  };
}

/**
 * Timing without the catalyst from a timing with it, where Clarity names the magazine and reserves
 * before and after. Null if the text changes something else that the sources do not quantify
 * (reload speed as a stat, refills), or if the magazine does not match the timing.
 */
export function timingWithoutCatalyst(
  withCatalyst: Timing,
  texts: string[],
): { timing: Timing; quote: string } | null {
  const text = texts.join("\n");
  const magazine = CATALYST_MAGAZINE.exec(text);
  const reserves = CATALYST_RESERVES.exec(text);
  if (!magazine && !reserves) return null;
  if (magazine && Number(magazine[2]) !== withCatalyst.magazine) return null;
  const baseMagazine = magazine ? Number(magazine[1]) : withCatalyst.magazine;
  const totalShots =
    withCatalyst.totalShots === null
      ? null
      : withCatalyst.totalShots -
        (magazine ? Number(magazine[2]) - Number(magazine[1]) : 0) -
        (reserves ? Number(reserves[1]) : 0);
  const reloads =
    totalShots === null ? 0 : Math.ceil(totalShots / baseMagazine) - 1;
  return {
    timing: {
      ...withCatalyst,
      magazine: baseMagazine,
      totalShots,
      timeToEmptySeconds:
        totalShots === null
          ? null
          : (totalShots - 1) * withCatalyst.intervalSeconds +
            reloads * withCatalyst.engineReloadSeconds,
      note: `${withCatalyst.note}; without catalyst from Clarity: ${[magazine?.[0], reserves?.[0]].filter(Boolean).join(", ")}`,
    },
    quote: [magazine?.[0], reserves?.[0]].filter(Boolean).join("; "),
  };
}

/** Applies an override (fewer shots, longer interval) and recomputes the time to empty. */
function adjustTiming(
  timing: Timing,
  { totalShots, addIntervalSeconds }: NonNullable<WeaponOverride["timing"]>,
): Timing {
  const shots = totalShots ?? timing.totalShots;
  const interval = timing.intervalSeconds + (addIntervalSeconds ?? 0);
  // Unlimited ammo (primaries, Quantum): every shot takes longer, the reload stays.
  if (shots === null)
    return {
      ...timing,
      intervalSeconds: interval,
      note: `${timing.note}; override: +${addIntervalSeconds ?? 0} s per shot`,
    };
  const reloads = Math.ceil(shots / timing.magazine) - 1;
  // The simulator adds interval + engine reload between magazines; keep the stated reload.
  const engineReload = Math.max(
    0,
    timing.engineReloadSeconds - (addIntervalSeconds ?? 0),
  );
  return {
    ...timing,
    totalShots: shots,
    intervalSeconds: interval,
    engineReloadSeconds: engineReload,
    timeToEmptySeconds: (shots - 1) * interval + reloads * engineReload,
    note: `${timing.note}; override: ${totalShots ?? "same"} shots, +${addIntervalSeconds ?? 0} s per shot`,
  };
}

/** Catalyst factor from the Quantum rows with and without catalyst ("cata"), or null. */
function quantumCatalystFactor(
  name: string,
  rows: QuantumWeaponRow[],
): number | null {
  const plain = rows.find((r) => sameName(r.name, name) && r.variant === "");
  const cata = rows.find((r) => sameName(r.name, name) && r.variant === "cata");
  const metric = (r: QuantumWeaponRow | undefined) =>
    r?.precisionDamage ?? r?.bodyDamage ?? null;
  const [a, b] = [metric(cata), metric(plain)];
  return a !== null && b !== null && b > 0 && a !== b ? a / b : null;
}

const minDeviation = (values: (number | null)[]): number | null => {
  const known = values.filter((v): v is number => v !== null);
  return known.length > 0 ? Math.min(...known) : null;
};

/** Builds packages, gaps, codes and the report from the inputs; pure, no file access. */
export function buildWeaponImport(
  inputs: WeaponImportInputs,
): WeaponImportResult {
  const effectNames = inputs.effects.map(({ id, name }) => ({ id, name }));
  const aegisSource = (row: AegisWeaponRow, note?: string): Source => ({
    name: `${inputs.aegis.source.name}, row ${row.id}`,
    url: inputs.aegis.source.url,
    retrieved: inputs.aegis.source.retrieved,
    status: "verified",
    ...(note ? { note } : {}),
  });
  const sustainedSource = (rowId: string, note?: string): Source => ({
    name: `${inputs.sustained.source.name}, row ${rowId}`,
    url: inputs.sustained.source.url,
    retrieved: inputs.sustained.source.retrieved,
    status: "verified",
    ...(note ? { note } : {}),
  });
  const quantumSource = (row: QuantumWeaponRow, note?: string): Source => ({
    name: `Quantum Damage-ics (${row.tab}), row ${row.id}`,
    url: inputs.quantum.source.url,
    retrieved: inputs.quantum.source.retrieved,
    status: "unverified",
    ...(note ? { note } : {}),
  });

  const codes = { ...inputs.codes };
  const packages: Weapon[] = [];
  const gaps: WeaponGap[] = [];
  const reportWeapons: ReportWeapon[] = [];
  const assumptions: ReportAssumption[] = [];

  for (const manifest of inputs.manifest) {
    const entry: ReportWeapon = {
      name: manifest.name,
      weaponType: manifest.weaponType,
      element: manifest.element,
      ammo: manifest.ammo,
      status: "gap",
      gapReason: null,
      baseRow: null,
      perShot: null,
      magazine: null,
      totalShots: null,
      reloadSeconds: null,
      timeToEmptySeconds: null,
      timingSource: null,
      quantumRpm: null,
      derivedRpm: null,
      scaleDeviation: null,
      includedEffectIds: [],
      options: [],
      unusedRows: [],
      notes: [],
      armor: armorForWeapon(manifest, inputs.armor),
      abilityKinds: abilityKindsNamed(manifest.description),
    };
    reportWeapons.push(entry);
    const gap = (reason: string) => {
      entry.gapReason = reason;
      gaps.push({ name: manifest.name, reason });
    };

    const context = {
      weapon: manifest,
      effects: effectNames,
      armor: inputs.armor,
      terms: inputs.terms,
      clarity: inputs.clarity,
    };
    const override = inputs.overrides.find((o) => o.weapon === manifest.name);
    if (override) entry.notes.push(`Override: ${override.reason}`);
    if (override?.gap) {
      gap(override.gap);
      continue;
    }
    const catalysts = clarityCatalysts(manifest.name, inputs.clarity);
    const catalystChangesTiming = catalysts.some((c) => changesTiming(c.text));
    const catalystChangesAmmo = catalysts.some((c) =>
      /\breserves by \d|\+\d+ reserves\b/i.test(c.text),
    );
    // "refills the magazine" in the intrinsic (e.g. White Nail): no reloads.
    const refillsMagazine = inputs.clarity.some(
      (e) =>
        e.itemName === manifest.name &&
        e.type === "Weapon Frame Exotic" &&
        /refills the magazine/i.test(e.text),
    );

    const rows = inputs.aegis.rows.filter((r) =>
      sameName(r.name, manifest.name),
    );
    if (rows.length === 0) {
      gap("keine Aegis-Zeile");
      continue;
    }
    const classesOf = new Map(
      rows.map((row) => [
        row,
        row.assumptions.map((assumption) => ({
          assumption,
          weapon: manifest.name,
          ...classifyAssumption(assumption, context),
        })),
      ]),
    );
    for (const classes of classesOf.values()) {
      for (const c of classes) {
        if (
          !assumptions.some(
            (a) => a.weapon === c.weapon && a.assumption === c.assumption,
          )
        )
          assumptions.push(c);
      }
    }

    // Base row: only execution, the weapon's own intrinsic, perks and mods, and modelled effects.
    // Fewest perks and mods first, so a row with an extra perk can become an option; then most
    // shots, then fewest assumptions.
    const allowed = rows.filter((row) =>
      classesOf.get(row)!.every((c) => BASE_KINDS.includes(c.kind)),
    );
    const extrasOf = (row: AegisWeaponRow) =>
      classesOf
        .get(row)!
        .filter((c) => c.kind === "perk" || c.kind === "weaponMod").length;
    const stackedOf = (row: AegisWeaponRow) =>
      classesOf
        .get(row)!
        .filter((c) => c.kind === "intrinsic" && /\sx\d+$/.test(c.assumption))
        .length;
    let base = [...allowed].sort(
      (a, b) =>
        stackedOf(a) - stackedOf(b) ||
        extrasOf(a) - extrasOf(b) ||
        b.shots - a.shots ||
        a.assumptions.length - b.assumptions.length,
    )[0];
    if (override?.base) {
      const named = rows.find((r) => r.id === override.base);
      if (!named)
        throw new Error(
          `${manifest.name}: override base ${override.base} not found`,
        );
      base = named;
    }
    if (!base) {
      const catalystRow = rows.find(
        (row) =>
          classesOf.get(row)!.some((c) => c.kind === "catalyst") &&
          classesOf
            .get(row)!
            .every((c) => BASE_KINDS.includes(c.kind) || c.kind === "catalyst"),
      );
      const factor = quantumCatalystFactor(manifest.name, inputs.quantum.rows);
      if (catalystRow && factor !== null) {
        const without = classesOf
          .get(catalystRow)!
          .filter((c) => c.kind !== "catalyst");
        const synthetic: AegisWeaponRow = {
          ...catalystRow,
          id: `${catalystRow.id}-without-catalyst`,
          critShot: null,
          bodyShot: null,
          assumptions: without.map((c) => c.assumption),
          perShot: Number((catalystRow.perShot / factor).toFixed(3)),
        };
        rows.push(synthetic);
        classesOf.set(synthetic, without);
        base = synthetic;
        entry.notes.push(
          `Aegis misst nur mit Katalysator: Basis = ${de(catalystRow.perShot, 1)} ÷ ${de(factor, 3)} (Quantum mit / ohne Katalysator)`,
        );
      }
    }
    if (!base) {
      for (const row of rows)
        entry.unusedRows.push({
          assumptions: row.assumptions,
          reason: blockingReason(classesOf.get(row)!),
        });
      gap("keine Aegis-Zeile ohne fremde Annahmen");
      continue;
    }
    entry.baseRow = base;
    entry.perShot = base.perShot;
    // Included effects that only multiply weapon damage are taken out of the value, so they work
    // like any effect when the build has them (as Radiant in Golden Gun, ADR 0009, point 5).
    // Others (e.g. Ember of Ashes, which changes scorch) stay in and do not count twice.
    const included = classesOf
      .get(base)!
      .flatMap((c) => (c.effectId ? [c.effectId] : []));
    const normalised: string[] = [];
    let normaliseFactor = 1;
    for (const effectId of included) {
      const effect = inputs.effects.find((e) => e.id === effectId);
      if (!effect || effect.parts.some((p) => p.type !== "multiplier"))
        continue;
      const factor = effect.parts.reduce(
        (product, p) =>
          p.type === "multiplier" &&
          p.damageSources.includes("weapon") &&
          (p.elements === undefined || p.elements.includes(manifest.element)) &&
          (p.weaponTypes === undefined ||
            p.weaponTypes.includes(manifest.weaponType)) &&
          p.multiplier.value !== null
            ? product * p.multiplier.value
            : product,
        1,
      );
      normaliseFactor *= factor;
      normalised.push(effectId);
      entry.notes.push(
        `herausgerechnet: ${effect.name} ×${de(factor, 3)} (wirkt nur, wenn der Build ihn hat)`,
      );
    }
    entry.includedEffectIds = included.filter((id) => !normalised.includes(id));
    entry.perShot = base.perShot / normaliseFactor;
    // Bursts (primaries): Aegis counts a whole burst as one shot, wipe = bullets × critShot (e.g.
    // Bad Juju 1446 = 3 × 482). Divided only if Quantum's magazine counts single hits too (its
    // damage per round is one hit); Trinity Ghoul's three arrows are one round at Quantum.
    const bullets = burstBullets(base);
    const quantumPerRound = inputs.quantum.rows
      .filter((r) => sameName(r.name, manifest.name) && r.variant === "")
      .map((r) =>
        r.magDamage !== null && r.magazine ? r.magDamage / r.magazine : null,
      )[0];
    const hitAtQuantum =
      base.critShot !== null &&
      quantumPerRound !== null &&
      quantumPerRound !== undefined &&
      Math.abs(entry.perShot / bullets / quantumPerRound - 1) <
        Math.abs(entry.perShot / quantumPerRound - 1);
    if (override?.bulletsPerShot) {
      entry.perShot /= override.bulletsPerShot;
      entry.notes.push(
        `Aegis misst einen Burst aus ${override.bulletsPerShot} Kugeln (Override); Paket pro Kugel`,
      );
    } else if (manifest.ammo === "primary" && bullets > 1 && hitAtQuantum) {
      entry.perShot /= bullets;
      entry.notes.push(
        `Aegis misst einen Burst aus ${bullets} Kugeln (wipe ${de(base.wipe)} = ${bullets} × ${base.critShot}); Paket pro Kugel wie Quantums Magazin`,
      );
    }

    // Scorch (ADR 0015, U4a-4): the shot from Quantum without ignitions, the ignitions from the
    // keyword run. Aegis counts the ignitions into its rows.
    const scorch = scorchRule(
      manifest.name,
      inputs.compendium,
      inputs.quantum.rows,
      override,
    );
    const ignitionThreshold = inputs.keywords.find(
      (k) => k.trigger.type === "counter" && k.id === "ignition",
    )?.trigger;
    const withoutIgnitions = (row: AegisWeaponRow) =>
      scorch &&
      ignitionThreshold?.type === "counter" &&
      ignitionThreshold.threshold.value
        ? perShotWithoutIgnitions(
            row,
            scorch.stacksPerShot,
            ignitionThreshold.threshold.value,
          )
        : null;
    if (scorch) {
      const q = scorch.quantumRow;
      entry.perShot = q.totalDamage! / q.totalShots!;
      entry.notes.push(
        `Scorch: x${scorch.stacksPerShot} pro Shot („${scorch.quote}“${override?.scorchStacksPerShot ? ", Override" : ""}); Shot aus Quantum ohne Ignitions („${q.note}“): ${de(q.totalDamage!)} ÷ ${q.totalShots}`,
      );
      if (scorch.bonus)
        entry.notes.push(
          `Ignitions ×${de(scorch.bonus.factor, 3)} („${scorch.bonus.quote}“)`,
        );
    }

    // Options: rows that add only catalyst, perk or mod assumptions to the base row.
    const options: WeaponOption[] = [];
    for (const row of rows) {
      if (row === base) continue;
      const classes = classesOf.get(row)!;
      const missing = base.assumptions.filter(
        (a) => !row.assumptions.includes(a),
      );
      const extras = classes.filter(
        (c) => !base.assumptions.includes(c.assumption),
      );
      const isOption =
        missing.length === 0 &&
        extras.length > 0 &&
        extras.every((c) => OPTION_KINDS.includes(c.kind));
      if (!isOption) {
        entry.unusedRows.push({
          assumptions: row.assumptions,
          reason:
            blockingReason(classes) ||
            (missing.length > 0
              ? `ohne ${missing.join(", ")} der Basiszeile`
              : "gleiche Annahmen wie die Basiszeile"),
        });
        continue;
      }
      const name = extras.map((c) => c.assumption).join(", ");
      const id = slug(name);
      if (options.some((o) => o.id === id)) continue;
      const perHit =
        row.critShot !== null &&
        base.critShot !== null &&
        base.critShot > 0 &&
        row.critShot !== base.critShot
          ? row.critShot / base.critShot
          : null;
      const visual =
        row.shots === base.shots ? row.perShot / base.perShot : null;
      // With scorch: values per shot without the ignitions Aegis counted in, so different numbers
      // of shots compare.
      const rowWithout = withoutIgnitions(row);
      const baseWithout = withoutIgnitions(base);
      const scorchFactor =
        rowWithout !== null && baseWithout !== null && baseWithout > 0
          ? rowWithout / baseWithout
          : null;
      const factor = scorchFactor ?? perHit ?? visual;
      if (factor === null) {
        entry.unusedRows.push({
          assumptions: row.assumptions,
          reason:
            "Option ohne Faktor: Einzeltreffer gleich und andere Zahl an Shots",
        });
        continue;
      }
      // A catalyst adds damage; a lower row measures another mode (e.g. Devil's Ruin's laser).
      if (
        extras.some((c) => c.kind === "catalyst") &&
        factor < 1 - CATALYST_MIN_CHANGE
      ) {
        entry.unusedRows.push({
          assumptions: row.assumptions,
          reason: `Katalysator-Zeile mit kleinerem Wert (×${de(factor, 3)}): anderer Modus`,
        });
        continue;
      }
      const notes: string[] = [];
      if (perHit !== null && row.shots !== base.shots)
        notes.push(
          `Faktor aus Einzeltreffern; Mittelwert pro Shot wäre ×${de(row.perShot / base.perShot, 3)} (${base.shots} gegen ${row.shots} Shots)`,
        );
      const kind = (["catalyst", "perk", "weaponMod"] as const).find((k) =>
        extras.some((c) => c.kind === k),
      )!;
      const perkNames = extras.flatMap((c) =>
        /^catalyst$/i.test(c.assumption)
          ? [
              ...(manifest.catalyst?.perks ?? []),
              ...catalysts.map((c) => c.name),
            ]
          : [assumptionName(c.assumption), c.similarTo ?? ""],
      );
      const text = perkText(perkNames, inputs.compendium, inputs.clarity);
      if (!text) notes.push("keine Dauer im Compendium gefunden");
      options.push({
        id,
        name,
        kind,
        bucketId: OPTION_BUCKET,
        factor: {
          value: Number(factor.toFixed(4)),
          source: aegisSource(
            row,
            perHit !== null
              ? `Single hit ${row.critShot} / ${base.critShot} (base row ${base.id})`
              : `visual Value ${row.perShot} / ${base.perShot} (base row ${base.id})`,
          ),
        },
        durationSeconds: text?.durationSeconds ?? null,
        condition: text?.condition ?? null,
      });
      entry.options.push({
        name,
        kind,
        factor: Number(factor.toFixed(4)),
        durationSeconds: text?.durationSeconds ?? null,
        condition: text?.condition ?? null,
        notes,
      });
    }

    // Catalyst damage from a text (override), where no row measures it.
    if (
      override?.catalystFactor &&
      !options.some((o) => o.kind === "catalyst")
    ) {
      options.push({
        id: "catalyst",
        name: "Catalyst",
        kind: "catalyst",
        bucketId: OPTION_BUCKET,
        factor: {
          value: override.catalystFactor,
          source: aegisSource(base, `Derived (override): ${override.reason}`),
        },
        durationSeconds: null,
        condition: null,
      });
      entry.options.push({
        name: "Catalyst",
        kind: "catalyst",
        factor: override.catalystFactor,
        durationSeconds: null,
        condition: null,
        notes: ["Faktor aus dem Text (Override)"],
      });
    }
    // Catalyst damage from Quantum ("cata" against the plain row) where Aegis has no catalyst row.
    const catalystPerks = [
      ...(manifest.catalyst?.perks ?? []),
      ...catalysts.map((c) => c.name),
    ];
    const quantumFactor = quantumCatalystFactor(
      manifest.name,
      inputs.quantum.rows,
    );
    if (
      (manifest.catalyst !== null || catalysts.length > 0) &&
      !options.some((o) => o.kind === "catalyst") &&
      quantumFactor !== null &&
      // A catalyst adds damage; a lower "cata" row is another mode (e.g. Devil's Ruin).
      quantumFactor > 1 + CATALYST_MIN_CHANGE
    ) {
      const cataRow = inputs.quantum.rows.find(
        (r) => sameName(r.name, manifest.name) && r.variant === "cata",
      )!;
      const text = perkText(catalystPerks, inputs.compendium, inputs.clarity);
      const option: WeaponOption = {
        id: "catalyst",
        name: "Catalyst",
        kind: "catalyst",
        bucketId: OPTION_BUCKET,
        factor: {
          value: Number(quantumFactor.toFixed(4)),
          source: quantumSource(
            cataRow,
            "Precision (or body) damage with catalyst / without",
          ),
        },
        durationSeconds: text?.durationSeconds ?? null,
        condition: text?.condition ?? null,
      };
      options.push(option);
      entry.options.push({
        name: option.name,
        kind: option.kind,
        factor: option.factor.value!,
        durationSeconds: option.durationSeconds,
        condition: option.condition,
        notes: ["Faktor aus Quantum (cata / ohne)"],
      });
    }

    // Timing from two sources (point 7): Aegis "Sustained" first, Quantum second; both are compared.
    const classifyLabel = (label: string) =>
      classifyAssumption(label, context).kind;
    // A row may carry foreign assumptions (meta builds) if their texts say nothing about ammo,
    // reload or fire rate (point 15); rows with fewer of them come first.
    const timingSources = {
      compendium: inputs.compendium,
      terms: inputs.terms,
      armor: inputs.armor,
      effects: inputs.effects,
    };
    const foreignOf = (row: AegisSustainedRow) =>
      row.assumptions.filter((a) => !BASE_KINDS.includes(classifyLabel(a)));
    if (catalystChangesTiming)
      entry.notes.push(
        "Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt",
      );
    const sustainedUsable = inputs.sustained.rows
      .filter((r) => sameName(r.name, manifest.name))
      .filter((r) =>
        foreignOf(r).every(
          (a) =>
            timingImpact(a, classifyAssumption(a, context), timingSources) ===
            "neutral",
        ),
      )
      .sort(
        (a, b) =>
          foreignOf(a).length - foreignOf(b).length ||
          a.assumptions.length - b.assumptions.length,
      );
    // Aegis "Sustained" plays with the catalyst. If the catalyst changes the timing, its rows
    // only count as a fallback (below), unless an override asks for them.
    const sustainedRows =
      catalystChangesTiming && override?.timing?.from !== "Aegis"
        ? []
        : sustainedUsable;
    const aegisTimings = sustainedRows.map((row) =>
      timingFromAegis(row, refillsMagazine),
    );
    const aegis = aegisTimings.find((t): t is Timing => "intervalSeconds" in t);
    const aegisRow = aegis
      ? sustainedRows.find((r) => r.id === aegis.rowId)
      : undefined;
    if (aegisRow && foreignOf(aegisRow).length > 0)
      entry.notes.push(
        `Timing aus Aegis-Zeile mit ${foreignOf(aegisRow).join(", ")} (laut Text ohne Einfluss auf das Timing)`,
      );

    // Quantum: the row without variant, else a variant that only describes the execution
    // (e.g. "direct impact", "ADS"), else a catalyst row with a warning.
    const variantKinds = (row: QuantumWeaponRow) =>
      row.variant === "" ? [] : quantumLabel(row.variant).map(classifyLabel);
    const candidates = inputs.quantum.rows
      .filter((r) => sameName(r.name, manifest.name))
      .map((row) => ({ row, kinds: variantKinds(row) }));
    const plain = candidates.filter(({ kinds }) =>
      kinds.every((k) => k === "execution" || k === "intrinsic"),
    );
    const withCatalyst = candidates.filter(({ kinds }) =>
      kinds.every(
        (k) => k === "execution" || k === "intrinsic" || k === "catalyst",
      ),
    );
    const quantumRow = (
      plain[0] ?? (catalystChangesTiming ? undefined : withCatalyst[0])
    )?.row;
    const quantum = quantumRow
      ? timingFromQuantum(quantumRow, refillsMagazine)
      : null;
    if (refillsMagazine)
      entry.notes.push(
        "Intrinsic füllt das Magazin auf (Clarity): ohne Reload",
      );
    const quantumTiming =
      quantum && "intervalSeconds" in quantum ? quantum : undefined;

    // Timing with the catalyst: Aegis "Sustained" plays with it, Quantum names it "cata". Refills
    // (e.g. Thunderlord) are inside their time to empty. Here only as the fallback for weapons
    // that have no source without the catalyst; otherwise see below (same source as the base).
    const catalystQuantum = withCatalyst.filter(({ kinds }) =>
      kinds.includes("catalyst"),
    );
    const fallbackCatalystTiming = catalystChangesTiming
      ? [
          ...sustainedUsable.map((row) =>
            timingFromAegis(row, refillsMagazine),
          ),
          ...catalystQuantum.map(({ row }) =>
            timingFromQuantum(row, refillsMagazine),
          ),
        ].find((t): t is Timing => "intervalSeconds" in t)
      : undefined;

    let timing =
      override?.timing?.from === "Quantum"
        ? (quantumTiming ?? aegis)
        : (aegis ?? quantumTiming);
    // Set when the timing without catalyst comes back from a source with it.
    let derivedFrom: Timing | undefined;
    // An override names the row of the timing (a Sustained or Quantum id).
    const rowTiming = (id: string, noReloads: boolean): Timing => {
      const sustainedRow = inputs.sustained.rows.find((r) => r.id === id);
      const quantumById = inputs.quantum.rows.find((r) => r.id === id);
      const t = sustainedRow
        ? timingFromAegis(sustainedRow, noReloads)
        : quantumById
          ? timingFromQuantum(quantumById, noReloads)
          : { problem: "Zeile nicht gefunden" };
      if (!("intervalSeconds" in t))
        throw new Error(
          `${manifest.name}: override timing row ${id}: ${t.problem}`,
        );
      return t;
    };
    const timingOverride = override?.timing;
    if (timingOverride?.row) {
      // The named row shows its reloads; only the override drops them.
      const fromRow = rowTiming(
        timingOverride.row,
        timingOverride.noReloads === true,
      );
      if (timingOverride.rowHasCatalyst) {
        derivedFrom = fromRow;
        if (timingOverride.magazine) {
          const magazine = timingOverride.magazine;
          const shots = fromRow.totalShots;
          const reloads = shots === null ? 0 : Math.ceil(shots / magazine) - 1;
          timing = {
            ...fromRow,
            magazine,
            timeToEmptySeconds:
              shots === null
                ? null
                : (shots - 1) * fromRow.intervalSeconds +
                  reloads * fromRow.engineReloadSeconds,
            note: `${fromRow.note}; without catalyst: magazine ${magazine} (override)`,
          };
        } else {
          const derived = timingWithoutCatalyst(
            fromRow,
            catalysts.map((c) => c.text),
          );
          if (!derived)
            throw new Error(
              `${manifest.name}: Clarity names no magazine or reserves of the catalyst`,
            );
          timing = derived.timing;
        }
        entry.notes.push(
          `Timing-Zeile ${timingOverride.row} spielt mit Katalysator; ohne ihn ${timingOverride.magazine ? `Magazin ${timingOverride.magazine} (Override)` : "aus Clarity zurückgerechnet"}`,
        );
      } else {
        timing = fromRow;
        entry.notes.push(`Timing aus Zeile ${timingOverride.row} (Override)`);
      }
    }
    if (timingOverride?.values) {
      // Values the reason derives, e.g. from manifest stats and Quantum's reload per weapon type.
      const v = timingOverride.values;
      const reloads =
        v.totalShots === null ? 0 : Math.ceil(v.totalShots / v.magazine) - 1;
      timing = {
        rowId: OVERRIDE_TIMING,
        magazine: v.magazine,
        totalShots: v.totalShots,
        reloadSeconds: v.reloadSeconds,
        engineReloadSeconds: v.reloadSeconds,
        intervalSeconds: v.intervalSeconds,
        timeToEmptySeconds:
          v.totalShots === null
            ? null
            : (v.totalShots - 1) * v.intervalSeconds +
              reloads * v.reloadSeconds,
        note: "Values of the override",
      };
      entry.notes.push("Timing aus Override-Werten (Manifest, Quantum)");
    }
    if (!timing && fallbackCatalystTiming) {
      // Only sources with catalyst: back to the timing without it where Clarity names the numbers.
      const derived = timingWithoutCatalyst(
        fallbackCatalystTiming,
        catalysts.map((c) => c.text),
      );
      if (derived) {
        timing = derived.timing;
        derivedFrom = fallbackCatalystTiming;
        entry.notes.push(
          `Timing ohne Katalysator aus Clarity zurückgerechnet („${derived.quote}“); Annahme: das Magazin zählt zur Munition`,
        );
      } else if (!catalystChangesAmmo) {
        timing = fallbackCatalystTiming;
        entry.notes.push(
          "⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition",
        );
      }
    }
    if (timing && timingOverride?.shots) {
      // n shots fill the row's time to empty: one every tte ÷ n, no reloads (swords: combos).
      const n = timingOverride.shots;
      const total = timing.timeToEmptySeconds;
      if (total === null)
        throw new Error(
          `${manifest.name}: shots override needs a time to empty`,
        );
      timing = {
        ...timing,
        magazine: n,
        totalShots: n,
        reloadSeconds: 0,
        engineReloadSeconds: 0,
        intervalSeconds: total / n,
        timeToEmptySeconds: ((n - 1) * total) / n,
        note: `${timing.note}; ${n} shots in ${total} s (override)`,
      };
    }
    if (timing && timingOverride?.ammoPerShot) {
      const k = timingOverride.ammoPerShot;
      const shots = timing.totalShots === null ? null : timing.totalShots / k;
      const magazine = timing.magazine / k;
      if (
        !Number.isInteger(magazine) ||
        (shots !== null && !Number.isInteger(shots))
      )
        throw new Error(`${manifest.name}: ammo is no multiple of ${k}`);
      const interval = timing.intervalSeconds * k;
      // Aegis reloads right after the last shot (engine reload = reload − interval), Quantum not.
      const engineReload =
        timing.engineReloadSeconds === timing.reloadSeconds
          ? timing.reloadSeconds
          : Math.max(0, timing.reloadSeconds - interval);
      const reloads = shots === null ? 0 : Math.ceil(shots / magazine) - 1;
      timing = {
        ...timing,
        magazine,
        totalShots: shots,
        intervalSeconds: interval,
        engineReloadSeconds: engineReload,
        timeToEmptySeconds:
          shots === null
            ? null
            : (shots - 1) * interval + reloads * engineReload,
        note: `${timing.note}; ${k} ammo per shot (override)`,
      };
    }
    if (
      timing &&
      (timingOverride?.totalShots !== undefined ||
        timingOverride?.addIntervalSeconds !== undefined)
    )
      timing = adjustTiming(timing, timingOverride);
    if (!timing) {
      const reasons = [
        ...aegisTimings.map((t) => `Aegis: ${(t as TimingProblem).problem}`),
        sustainedRows.length === 0 &&
        inputs.sustained.rows.some((r) => sameName(r.name, manifest.name))
          ? "Aegis: nur Zeilen mit fremden Annahmen"
          : "",
        quantum && "problem" in quantum ? `Quantum: ${quantum.problem}` : "",
        candidates.length === 0
          ? "keine Quantum-Zeile"
          : !quantumRow
            ? `keine passende Quantum-Zeile (nur ${candidates.map(({ row }) => `„${row.variant}“`).join(", ")})`
            : "",
      ].filter((r) => r !== "");
      gap(
        `kein Timing: ${reasons.join("; ") || "keine Aegis- und keine Quantum-Zeile"}`,
      );
      continue;
    }
    const timingRowId = timing.rowId;
    const timingIsAegis = inputs.sustained.rows.some(
      (r) => r.id === timingRowId,
    );

    // Timing with the catalyst from the same source and execution as the base, so the difference
    // is the catalyst's and not the sources': Aegis "Sustained" (plays with it), the Quantum row
    // "cata, <same labels>", else the base plus the numbers Clarity names ("4🠚7").
    const catalystTexts = catalysts.map((c) => c.text);
    const catalystNamesTiming = catalysts.some((c) =>
      changesTiming(c.text.replace(AMMO_GENERATION, "")),
    );
    const labelsOf = (variant: string) =>
      quantumLabel(variant)
        .filter((l) => !/^catalyst$/i.test(l))
        .map((l) => l.toLowerCase())
        .sort()
        .join("|");
    let catalystTiming: Timing | undefined;
    // Quantum's plain row may already have the catalyst's magazine (e.g. Gjallarhorn 2, Clarity
    // "1🠚2"): then it is the timing with the catalyst, and the base comes back from Clarity.
    const catalystMagazine = CATALYST_MAGAZINE.exec(catalystTexts.join("\n"));
    const plainHasCatalyst =
      !derivedFrom &&
      catalystMagazine !== null &&
      Number(catalystMagazine[2]) === timing.magazine &&
      Number(catalystMagazine[1]) !== timing.magazine;
    const back = plainHasCatalyst
      ? timingWithoutCatalyst(timing, catalystTexts)
      : null;
    // An override that reshapes the timing (ammo per shot, combos, own values) is not in the raw
    // rows with the catalyst; only its own catalyst row counts then.
    const reshaped =
      timingOverride?.ammoPerShot !== undefined ||
      timingOverride?.shots !== undefined ||
      timingOverride?.values !== undefined;
    if (catalystNamesTiming && !reshaped) {
      if (derivedFrom) {
        catalystTiming = derivedFrom;
      } else if (back) {
        catalystTiming = timing;
        timing = back.timing;
        entry.notes.push(
          `Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („${back.quote}“)`,
        );
      } else if (timingIsAegis) {
        catalystTiming = sustainedUsable
          .map((row) => timingFromAegis(row, refillsMagazine))
          .find((t): t is Timing => "intervalSeconds" in t);
      } else {
        const baseLabels = labelsOf(
          inputs.quantum.rows.find((r) => r.id === timingRowId)?.variant ?? "",
        );
        const sameExecution = catalystQuantum.find(
          ({ row }) => labelsOf(row.variant) === baseLabels,
        );
        // Without a magazine the catalyst refills it (e.g. Thunderlord): all ammo is one magazine.
        const fromQuantum = sameExecution
          ? timingFromQuantum(
              sameExecution.row,
              refillsMagazine || sameExecution.row.magazine === null,
            )
          : undefined;
        catalystTiming =
          fromQuantum && "intervalSeconds" in fromQuantum
            ? fromQuantum
            : (timingWithCatalyst(timing, catalystTexts) ?? undefined);
      }
    }
    if (timingOverride?.catalystRow)
      catalystTiming = rowTiming(timingOverride.catalystRow, refillsMagazine);
    if (timingOverride?.catalystValues) {
      // The base timing with more ammo or a larger magazine; interval and reload stay.
      const magazine =
        timingOverride.catalystValues.magazine ?? timing.magazine;
      const shots =
        timingOverride.catalystValues.totalShots ?? timing.totalShots;
      const reloads = shots === null ? 0 : Math.ceil(shots / magazine) - 1;
      catalystTiming = {
        ...timing,
        magazine,
        totalShots: shots,
        timeToEmptySeconds:
          shots === null
            ? null
            : (shots - 1) * timing.intervalSeconds +
              reloads * timing.engineReloadSeconds,
        note: `${timing.note}; with the catalyst: magazine ${magazine}, ${shots ?? "∞"} shots (override)`,
      };
    }

    if (quantumRow && timing === quantumTiming) {
      if (plain.length === 0)
        entry.notes.push(
          `⚠ Timing aus der Quantum-Zeile „${quantumRow.variant}“ mit Katalysator`,
        );
      else if (quantumRow.variant !== "")
        entry.notes.push(
          `Timing aus der Quantum-Zeile „${quantumRow.variant}“`,
        );
    }
    // Aegis "Sustained" has no primaries, so both times to empty are known here.
    const aegisTtE = aegis?.timeToEmptySeconds ?? null;
    const quantumTtE = quantumTiming?.timeToEmptySeconds ?? null;
    if (aegis && quantumTiming && aegisTtE !== null && quantumTtE !== null) {
      const agree =
        aegis.totalShots === quantumTiming.totalShots &&
        Math.abs(aegisTtE - quantumTtE) <= TOLERANCE * quantumTtE;
      entry.notes.push(
        agree
          ? "Timing: Aegis und Quantum stimmen überein"
          : `⚠ Timing: Aegis ${aegis.totalShots} Shots in ${de(aegisTtE, 1)} s, Quantum ${quantumTiming.totalShots} Shots in ${de(quantumTtE, 1)} s; Aegis gilt`,
      );
    } else {
      entry.notes.push(`Timing nur aus ${timingIsAegis ? "Aegis" : "Quantum"}`);
    }
    entry.timingSource = timingIsAegis ? "Aegis" : "Quantum";
    entry.magazine = timing.magazine;
    entry.totalShots = timing.totalShots;
    entry.reloadSeconds = timing.reloadSeconds;
    entry.timeToEmptySeconds = timing.timeToEmptySeconds;
    entry.quantumRpm = quantumRow?.rpm ?? null;
    entry.derivedRpm = 60 / timing.intervalSeconds;
    if (
      timing.magazine > 1 &&
      entry.quantumRpm !== null &&
      Math.abs(entry.derivedRpm / entry.quantumRpm - 1) > RPM_HINT
    )
      entry.notes.push(
        `abgeleitete Feuerrate ${de(entry.derivedRpm, 0)} statt ${entry.quantumRpm} rpm`,
      );

    // Scale (point 10): Aegis against Quantum, or against "Base" in Aegis "Sustained". The Quantum
    // row is the one of the timing, also a catalyst row taken as fallback.
    const scaleRow =
      inputs.quantum.rows.find((r) => r.id === timing.rowId) ?? quantumRow;
    const timingSustainedRow = inputs.sustained.rows.find(
      (r) => r.id === timing.rowId,
    );
    const scaleSustained = timingSustainedRow ?? sustainedUsable[0];
    if (override?.perShotFromTiming) {
      if (!timingSustainedRow?.base)
        throw new Error(`${manifest.name}: timing row has no Base`);
      entry.perShot = timingSustainedRow.base;
      entry.notes.push(
        `Schaden pro Shot aus „Base“ der Sustained-Zeile ${timingSustainedRow.id} (Override)`,
      );
    }
    if (override?.perShot) {
      entry.perShot = override.perShot;
      entry.notes.push(
        `Schaden pro Shot ${de(override.perShot, 1)} (Override)`,
      );
    }
    // An overridden value per shot is checked against the hit of the Quantum row.
    const quantumHit = scaleRow
      ? (scaleRow.precisionDamage ?? scaleRow.bodyDamage)
      : null;
    entry.scaleDeviation =
      override?.perShotFromTiming || override?.perShot
        ? quantumHit
          ? Math.abs(entry.perShot! / quantumHit - 1)
          : null
        : minDeviation([
            scaleRow ? scaleDeviation(base, scaleRow) : null,
            scaleSustained?.base
              ? Math.abs(base.perShot / scaleSustained.base - 1)
              : null,
          ]);
    if (scorch) {
      entry.notes.push(
        "Skala: Shot aus Quantum, keine Prüfung gegen Aegis (Aegis zählt Ignitions mit)",
      );
    } else if (entry.scaleDeviation === null && !override?.aegisWins) {
      gap("Skala nicht prüfbar: keine vergleichbaren Werte");
      continue;
    }
    if (
      !scorch &&
      entry.scaleDeviation !== null &&
      entry.scaleDeviation > TOLERANCE &&
      override?.aegisWins
    ) {
      entry.notes.push(
        `Skala weicht um ${(entry.scaleDeviation * 100).toFixed(1)} % ab; Aegis gilt (Override)`,
      );
    } else if (
      !scorch &&
      entry.scaleDeviation !== null &&
      entry.scaleDeviation > TOLERANCE
    ) {
      gap(
        `Skala Aegis gegen Quantum weicht um ${(entry.scaleDeviation * 100).toFixed(1)} % ab`,
      );
      continue;
    }

    const timingQuantumRow = inputs.quantum.rows.find(
      (r) => r.id === timing.rowId,
    );
    const timingSource = (note?: string): Source =>
      timing.rowId === OVERRIDE_TIMING
        ? {
            name: `Bungie manifest ${inputs.manifestVersion} and Quantum, override for ${manifest.name}`,
            retrieved: inputs.aegis.source.retrieved,
            status: "unverified",
            note: `Derived (override): ${override?.reason ?? ""}${note ? `; ${note}` : ""}`,
          }
        : timingIsAegis || !timingQuantumRow
          ? sustainedSource(timing.rowId, note)
          : quantumSource(timingQuantumRow, note);
    const id = slug(manifest.name);
    const shotSource = (note?: string): Source =>
      scorch ? quantumSource(scorch.quantumRow, note) : aegisSource(base, note);
    const scorchSource = (quote: string, note?: string): Source => ({
      name: `Destiny Data Compendium, Exotic Weapons (${manifest.name})`,
      url: "https://destiny2.science/data-compendium",
      retrieved: inputs.aegis.source.retrieved,
      status: "verified",
      quote,
      ...(note ? { note } : {}),
    });
    // The catalyst and what it does against one boss, decided by the sources.
    const timingSourceOf = (t: Timing, note?: string): Source => {
      const row = inputs.quantum.rows.find((r) => r.id === t.rowId);
      return row ? quantumSource(row, note) : sustainedSource(t.rowId, note);
    };
    const timingDiffers =
      catalystTiming !== undefined &&
      (catalystTiming.magazine !== timing.magazine ||
        catalystTiming.totalShots !== timing.totalShots ||
        Math.abs(catalystTiming.intervalSeconds / timing.intervalSeconds - 1) >
          CATALYST_MIN_CHANGE ||
        Math.abs(
          catalystTiming.engineReloadSeconds - timing.engineReloadSeconds,
        ) >
          CATALYST_MIN_CHANGE * Math.max(timing.engineReloadSeconds, 1));
    // Damage and timing are checked apart: a claim in the text without a source that measured the
    // catalyst for it stays unknown (a question for Gemini); measured without a change is none.
    const catalystDamage = options.some((o) => o.kind === "catalyst");
    const catalystText = catalystTexts.join("\n");
    const damageMeasured =
      rows.some((r) => classesOf.get(r)!.some((c) => c.kind === "catalyst")) ||
      inputs.quantum.rows.some(
        (r) => sameName(r.name, manifest.name) && r.variant === "cata",
      );
    const timingMeasured =
      catalystTiming !== undefined &&
      !entry.notes.some((n) => n.startsWith("⚠ Timing mit Katalysator"));
    // One boss without adds gives no kills (owner): paragraphs about kills claim nothing here.
    const bossText = bossParagraphs(catalystText);
    const catalystEffect: CatalystEffect = override?.catalystEffect
      ? override.catalystEffect
      : catalystDamage && timingDiffers
        ? "damageAndTiming"
        : catalystDamage
          ? "damage"
          : timingDiffers
            ? "timing"
            : (CATALYST_DAMAGE.test(bossText) && !damageMeasured) ||
                (changesTiming(bossText.replace(AMMO_GENERATION, "")) &&
                  !timingMeasured)
              ? "unknown"
              : "none";
    const hasCatalyst = manifest.catalyst !== null || catalysts.length > 0;
    if (hasCatalyst) {
      entry.catalystEffect = catalystEffect;
      entry.catalystText = catalystText;
    }
    if (timingDiffers && catalystTiming) {
      entry.catalystTiming = catalystTiming;
      entry.notes.push(
        `Katalysator-Timing: ${catalystTiming.totalShots ?? "∞"} Shots, Magazin ${catalystTiming.magazine}, Zeit bis leer ${catalystTiming.timeToEmptySeconds === null ? "–" : `${de(catalystTiming.timeToEmptySeconds, 1)} s`}`,
      );
    }

    const weapon: Weapon = {
      id,
      code: codes[id] ?? 0, // set below
      name: manifest.name,
      manifestHash: manifest.hash,
      gameVersion: base.gameVersion,
      weaponType: manifest.weaponType,
      element: manifest.element,
      ammo: manifest.ammo,
      chargeTimeMs: {
        value: 0,
        source: timingSource("The time to empty counts from the first shot"),
      },
      fireRateRpm: {
        value: Number(entry.derivedRpm.toFixed(3)),
        source: timingSource(timing.note),
      },
      magazine: { value: timing.magazine, source: timingSource() },
      totalShots: { value: timing.totalShots, source: timingSource() },
      reloadTimeMs: {
        value: Math.round(timing.engineReloadSeconds * 1000),
        source: timingSource(
          timingIsAegis
            ? `Reload ${timing.reloadSeconds} s minus the shot interval: Aegis reloads right after the last shot, the simulator counts one interval before the reload`
            : undefined,
        ),
      },
      damageInstances: [
        {
          id: "shot",
          name: scorch
            ? "Shot (Quantum, without ignitions)"
            : "Shot (Aegis average)",
          delayMs: {
            value: 0,
            source: shotSource("Package: one value per shot"),
          },
          damagePerTick: {
            value: Number(entry.perShot!.toFixed(3)),
            source: scorch
              ? quantumSource(
                  scorch.quantumRow,
                  `Total Damage / total shots; ${scorch.quantumRow.note}`,
                )
              : aegisSource(
                  base,
                  `visual Value; assumptions: ${base.assumptions.join(", ") || "none"}`,
                ),
          },
          ticks: { value: 1, source: shotSource() },
          tickIntervalMs: { value: 0, source: shotSource() },
          canPrecision: false,
          requiresCatalyst: false,
        },
      ],
      intrinsicParts: scorch
        ? [
            {
              type: "appliesKeyword",
              keywordId: "ignition",
              damageSources: ["weapon"],
              stacks: {
                value: scorch.stacksPerShot,
                source: scorchSource(
                  scorch.quote,
                  override?.scorchStacksPerShot
                    ? `Per shot: ${override.reason}`
                    : "Base stacks before Ember of Ashes",
                ),
              },
              source: scorchSource(scorch.quote),
            },
          ]
        : [],
      ...(scorch?.bonus
        ? {
            keywordBonuses: [
              {
                keywordId: "ignition" as const,
                factor: {
                  value: scorch.bonus.factor,
                  source: scorchSource(scorch.bonus.quote),
                },
              },
            ],
          }
        : {}),
      intrinsics: manifest.intrinsics.map((name) => ({
        id: slug(name),
        name,
        description: manifest.description.split("\n")[0] ?? "",
        source: {
          name: "Bungie manifest",
          retrieved: inputs.aegis.source.retrieved,
          status: "verified",
          note: inputs.manifestVersion,
        },
      })),
      ...(entry.includedEffectIds.length > 0
        ? { includedEffectIds: entry.includedEffectIds }
        : {}),
      ...(options.length > 0 ? { options } : {}),
      ...(hasCatalyst
        ? {
            catalyst: {
              name:
                [...new Set(catalystPerks)].join(", ") ||
                manifest.catalyst?.name ||
                "Catalyst",
              description: catalystText,
              effect: catalystEffect,
              ...(timingDiffers && catalystTiming
                ? {
                    timing: {
                      fireRateRpm: {
                        value: Number(
                          (60 / catalystTiming.intervalSeconds).toFixed(3),
                        ),
                        source: timingSourceOf(
                          catalystTiming,
                          catalystTiming.note,
                        ),
                      },
                      magazine: {
                        value: catalystTiming.magazine,
                        source: timingSourceOf(catalystTiming),
                      },
                      totalShots: {
                        value: catalystTiming.totalShots,
                        source: timingSourceOf(
                          catalystTiming,
                          catalystTiming.totalShots === null
                            ? "unlimited (Quantum: inf)"
                            : undefined,
                        ),
                      },
                      reloadTimeMs: {
                        value: Math.round(
                          catalystTiming.engineReloadSeconds * 1000,
                        ),
                        source: timingSourceOf(catalystTiming),
                      },
                    },
                  }
                : {}),
            },
          }
        : {}),
    };

    entry.status = "package";
    packages.push(weapon);
  }

  // Link codes: kept forever, new ones in alphabetical order after the highest (point 13).
  let next = Math.max(0, ...Object.values(codes)) + 1;
  for (const weapon of [...packages].sort((a, b) => a.id.localeCompare(b.id))) {
    codes[weapon.id] ??= next++;
    weapon.code = codes[weapon.id];
  }
  const sortedCodes = Object.fromEntries(
    Object.entries(codes).sort(([, a], [, b]) => a - b),
  );

  return {
    packages,
    gaps,
    codes: sortedCodes,
    report: {
      aegisRetrieved: inputs.aegis.source.retrieved,
      quantumRetrieved: inputs.quantum.source.retrieved,
      manifestVersion: inputs.manifestVersion,
      weapons: reportWeapons,
      assumptions,
    },
  };
}

// ---------- review table ----------

const de = (n: number, digits = 0) =>
  n.toLocaleString("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
const percent = (n: number | null) =>
  n === null ? "–" : `${de(n * 100, 1)} %`;

/** The review table as Markdown (ADR 0013, point 11). */
export function renderWeaponImport(report: WeaponReport): string {
  const packages = report.weapons.filter((w) => w.status === "package");
  const gaps = report.weapons.filter((w) => w.status === "gap");
  const lines: string[] = [
    "# Waffen-Import: Prüftabelle",
    "",
    "Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.",
    "",
    `Stand: Aegis ${report.aegisRetrieved}, Quantum ${report.quantumRetrieved} (Quantum nennt keinen Patch pro Zeile), Manifest ${report.manifestVersion}.`,
    "",
    `Umfang: exotische Special- und Heavy-Waffen. **${packages.length} Pakete**, ${gaps.length} Lücken.`,
    "",
    "## Pakete",
    "",
    "Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.",
    "",
    "| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...packages
      .map((w) =>
        [
          w.name,
          w.weaponType,
          w.element,
          cell(w.baseRow!.assumptions.join(", ") || "keine") +
            ` (${w.baseRow!.shots} ${w.baseRow!.shots === 1 ? "Shot" : "Shots"})`,
          de(w.perShot!, 1),
          w.timingSource ?? "–",
          w.totalShots,
          w.magazine,
          `${de(w.reloadSeconds!, 2)} s`,
          w.timeToEmptySeconds === null
            ? "–"
            : `${de(w.timeToEmptySeconds, 1)} s`,
          `${w.quantumRpm ?? "–"} → ${de(w.derivedRpm!, 0)}`,
          percent(w.scaleDeviation),
          cell(
            [
              ...w.notes,
              ...(w.includedEffectIds.length > 0
                ? [`eingerechnet: ${w.includedEffectIds.join(", ")}`]
                : []),
            ].join("; ") || "–",
          ),
        ].join(" | "),
      )
      .map((row) => `| ${row} |`),
    "",
    "## Optionen",
    "",
    "Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.",
    "",
    "| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...packages.flatMap((w) =>
      w.options.map((o) => {
        const flagged =
          o.durationSeconds !== null ||
          o.condition !== null ||
          o.notes.some((n) => n.startsWith("keine Dauer"));
        return `| ${[
          w.name,
          `${flagged ? "⚠ " : ""}${cell(o.name)}`,
          KIND_LABELS[o.kind],
          `×${de(o.factor, 3)}`,
          o.durationSeconds === null ? "–" : `${de(o.durationSeconds, 0)} s`,
          cell(o.condition ?? "–"),
          cell(o.notes.join("; ") || "–"),
        ].join(" | ")} |`;
      }),
    ),
    "",
    "## Katalysatoren",
    "",
    "Was der Katalysator gegen einen Boss tut, entscheiden die Quellen: **Schaden** (Option mit Faktor), **Timing** (Zeile mit Katalysator, gleiche Quelle und Ausführung, sonst Zahlen aus Clarity), **keine** (gemessen ohne Unterschied oder kein Schaden und Timing im Text), **unbekannt** (Clarity nennt Schaden oder Timing, keine Quelle misst es).",
    "",
    "| Waffe | Munition | Wirkung | Timing ohne → mit | Text (Anfang) |",
    "| --- | --- | --- | --- | --- |",
    ...packages
      .filter((w) => w.catalystEffect !== undefined)
      .map((w) => {
        const t = w.catalystTiming;
        return `| ${[
          w.name,
          w.ammo,
          CATALYST_LABELS[w.catalystEffect!],
          t
            ? `Magazin ${w.magazine} → ${t.magazine}, Shots ${w.totalShots ?? "∞"} → ${t.totalShots ?? "∞"}, Zeit bis leer ${w.timeToEmptySeconds === null ? "–" : de(w.timeToEmptySeconds, 1)} → ${t.timeToEmptySeconds === null ? "–" : de(t.timeToEmptySeconds, 1)} s, rpm ${de(w.derivedRpm ?? 0, 0)} → ${de(60 / t.intervalSeconds, 0)}`
            : "–",
          cell((w.catalystText ?? "").split("\n")[0].slice(0, 120) || "–"),
        ].join(" | ")} |`;
      }),
    "",
    "## Lücken",
    "",
    "| Waffe | Typ | Grund |",
    "| --- | --- | --- |",
    ...gaps.map(
      (w) => `| ${w.name} | ${w.weaponType} | ${cell(w.gapReason ?? "")} |`,
    ),
    "",
    "## Nicht genutzte Aegis-Zeilen",
    "",
    "| Waffe | Annahmen | Grund |",
    "| --- | --- | --- |",
    ...report.weapons.flatMap((w) =>
      w.unusedRows.map(
        (r) =>
          `| ${w.name} | ${cell(r.assumptions.join(", "))} | ${cell(r.reason)} |`,
      ),
    ),
    "",
    "## Auffällige Annahmen",
    "",
    "Ähnliche Schreibweise (Stufe 1) und ohne Beleg eingeordnet (Stufe 5). Bitte prüfen.",
    "",
    "| Waffe | Annahme | Einordnung |",
    "| --- | --- | --- |",
    ...report.assumptions
      .filter((a) => a.similarTo || a.stage === 5)
      .map(
        (a) =>
          `| ${a.weapon} | ${cell(a.assumption)} | ${
            a.similarTo
              ? `${KIND_LABELS[a.kind]} „${a.similarTo}“ (ähnliche Schreibweise)`
              : "nicht modelliert, ohne Beleg"
          } |`,
      ),
    "",
    "## Kandidaten für neue Effects",
    "",
    "Annahmen, die wir noch nicht abbilden, nach Zahl der Waffen.",
    "",
    "| Annahme | Art | Waffen |",
    "| --- | --- | --- |",
    ...candidateRows(report.assumptions),
    "",
    "## Wechselwirkungen",
    "",
    "Exotic-Rüstung, deren Intrinsic den Waffentyp nennt, und Abilities, die Intrinsic oder Katalysator der Waffe nennen (ADR 0013, Punkt 4). Kandidaten für E1, noch nicht im Rechner.",
    "",
    "| Waffe | Exotic-Rüstung | Abilities |",
    "| --- | --- | --- |",
    ...report.weapons
      .filter((w) => w.armor.length > 0 || w.abilityKinds.length > 0)
      .map(
        (w) =>
          `| ${w.name} | ${w.armor.join(", ") || "–"} | ${w.abilityKinds.join(", ") || "–"} |`,
      ),
    "",
  ];
  return lines.join("\n");
}

function candidateRows(assumptions: ReportAssumption[]): string[] {
  const kinds: AssumptionKind[] = [
    "notModelled",
    "artifactPerk",
    "exoticArmor",
    "foreignPerk",
  ];
  const byName = new Map<string, { kind: AssumptionKind; weapons: string[] }>();
  for (const a of assumptions.filter((x) => kinds.includes(x.kind))) {
    const key = assumptionName(a.assumption);
    const item = byName.get(key) ?? { kind: a.kind, weapons: [] };
    if (!item.weapons.includes(a.weapon)) item.weapons.push(a.weapon);
    byName.set(key, item);
  }
  return [...byName.entries()]
    .sort(
      ([a, x], [b, y]) =>
        y.weapons.length - x.weapons.length || a.localeCompare(b),
    )
    .map(
      ([name, { kind, weapons }]) =>
        `| ${cell(name)} | ${KIND_LABELS[kind]} | ${weapons.join(", ")} |`,
    );
}
