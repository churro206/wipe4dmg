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
  ReloadFormulaSnapshot,
  Source,
  SourcedNumber,
  Weapon,
  WeaponGap,
  WeaponOption,
  WeaponType,
} from "../../src/data/schema.ts";
import { slug } from "./aegisBosses.ts";
import { assumptionName } from "./aegisWeapons.ts";
import { catalystBuffs, type ResolvedItem } from "./items/weaponItem.ts";
import {
  type ImportPart,
  type PartPlaystyle,
  partRules,
  playstyleRateRule,
  runtimePart,
  statusOnHitRules,
} from "./partRules.ts";
import { catalystReloadFactor, reloadFormulaOf } from "./reloadFormulas.ts";
import {
  de,
  KIND_LABELS,
  type ReportAssumption,
  type ReportWeapon,
  type WeaponReport,
} from "./weaponReport.ts";
import {
  adjustTiming,
  CATALYST_MAGAZINE,
  type Timing,
  type TimingProblem,
  timingFromAegis,
  timingFromQuantum,
  timingWithCatalyst,
  timingWithoutCatalyst,
} from "./timing.ts";
import {
  abilityKindsNamed,
  armorForWeapon,
  changesTiming,
  clarityCatalysts,
  classifyAssumption,
  timingImpact,
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
  reloadFormulas: ReloadFormulaSnapshot;
  /** Weapon item files, resolved (B4a): an item takes the place of the package of its weapon. */
  items: ResolvedItem[];
};

// Spellings of a source that differ from the manifest beyond case, e.g. Quantum's typo.
const NAME_ALIASES: Record<string, string> = {
  "verglass curve": "verglas curve",
  "barrow dyad": "barrow-dyad", // Quantum
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
const NTH_SHOT_ID = "nthShot"; // damage instance of every Nth shot, e.g. a Trueseeker cluster
const RALLY_EFFECT_ID = "rally-barricade";
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

/**
 * Base row: only execution, the weapon's own intrinsic, perks and mods, and modelled effects.
 * Fewest stacked intrinsics, then fewest perks and mods (so a row with an extra perk can become an
 * option), then most shots, then fewest assumptions.
 */
function pickBaseRow(
  rows: AegisWeaponRow[],
  classesOf: Map<AegisWeaponRow, { assumption: string; kind: AssumptionKind }[]>,
): AegisWeaponRow | undefined {
  const count = (row: AegisWeaponRow, test: (c: { assumption: string; kind: AssumptionKind }) => boolean) =>
    classesOf.get(row)!.filter(test).length;
  const stackedOf = (row: AegisWeaponRow) =>
    count(row, (c) => c.kind === "intrinsic" && /\sx\d+$/.test(c.assumption));
  const extrasOf = (row: AegisWeaponRow) =>
    count(row, (c) => c.kind === "perk" || c.kind === "weaponMod");
  return rows
    .filter((row) => classesOf.get(row)!.every((c) => BASE_KINDS.includes(c.kind)))
    .sort(
      (a, b) =>
        stackedOf(a) - stackedOf(b) ||
        extrasOf(a) - extrasOf(b) ||
        b.shots - a.shots ||
        a.assumptions.length - b.assumptions.length,
    )[0];
}
const CONDITION_WORDS =
  /\b(kill|kills|killed|final blow|defeat|precision|while|after|when|hits?)\b/i;
const DURATION =
  /\bfor (\d+(?:\.\d+)?)(?:\s*↑\s*\d+(?:\.\d+)?)?\s*(?:\[[^\]]*\]\s*)?seconds?\b/i;
const TICKS = /\bticks?\b/i;

export type WeaponImportResult = {
  packages: Weapon[];
  gaps: WeaponGap[];
  codes: Record<string, number>;
  report: WeaponReport;
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
// A named tick, e.g. "490/36 cluster" (the boss takes the first) or "310 Perfect Fifth"
/** The value of a named tick, "490/36 cluster" → 490; with `sum` both parts, "1172/97 seeker" → 1269. */
const aegisNamedTick = (ticks: string, name: string, sum = false) => {
  const match = new RegExp(`\\b(\\d+)(?:\\/(\\d+))? ${name}\\b`, "i").exec(ticks);
  return Number(match?.[1]) + (sum ? Number(match?.[2] ?? 0) : 0);
};

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

/** Manifest stat that holds the charge of a weapon type (ms): fusion rifles charge, bows draw. */
const CHARGE_STATS: Partial<Record<WeaponType, string>> = {
  fusionRifle: "Charge Time",
  linearFusionRifle: "Charge Time",
  bow: "Draw Time",
};

/** A note "Derived…" marks a calculated value (status "derived"); any other secondary value stays "unverified". */
const derivedOrUnverified = (note?: string): "derived" | "unverified" =>
  note?.startsWith("Derived") ? "derived" : "unverified";

// Ammo generation fills reserves from bricks; one boss without adds drops none.
const AMMO_GENERATION = /\d+ Ammo Generation/gi;

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
  // K1: both sources reload with Rally Barricade, so its factor is in every weapon's reload.
  const rallyPart = inputs.effects
    .find((e) => e.id === RALLY_EFFECT_ID)
    ?.modifiers.find((p) => p.type === "stat" && p.stat === "reload");
  if (
    rallyPart?.type !== "stat" ||
    rallyPart.stat !== "reload" ||
    !rallyPart.factor.value
  )
    throw new Error(`${RALLY_EFFECT_ID}: no reload factor`);
  const reloadDurationIncluded = {
    value: rallyPart.factor.value,
    source: {
      name: "Quantum Damage-ics, Home (Assumptions Made)",
      url: "https://destiny2.science/quantum-damage-ics",
      retrieved: "2026-10-25",
      status: "verified",
      quote:
        "All weapons assume the effects of Rally barricade/Lunafactions reload speed boosting to minimize reload speeds to a consistent amount.",
      note: "Derived (gate tmp/reload-rally.ts, 2026-10-26): Quantum's reload equals d2foundry's formula at Reload Speed 100 × Rally's 0.9 for 87 of 117 weapons within ±10 % (median 1.002); Aegis Sustained's reload equals Quantum's (median 0.96, 28 weapons), not Quantum's without Rally (median 0.64). So both include Rally.",
    } satisfies Source,
  };
  const aegisSource = (row: AegisWeaponRow, note?: string): Source => ({
    name: `${inputs.aegis.source.name}, row ${row.id}`,
    url: inputs.aegis.source.url,
    retrieved: inputs.aegis.source.retrieved,
    // The value is the item's Eichung: this row no longer counts as a check (I1).
    status: "fitted",
    // A row without its catalyst is made from the catalyst row (see "synthetic"): that row is the Eichung.
    row: row.id.replace(/-without-catalyst$/, ""),
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
    status: derivedOrUnverified(note),
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
    const classesOfRows = (rows: AegisWeaponRow[]) =>
      new Map(
        rows.map((row) => [
          row,
          row.assumptions.map((assumption) => ({
            assumption,
            weapon: manifest.name,
            ...classifyAssumption(assumption, context),
          })),
        ]),
      );
    // An item file replaces the package: its structure is written by hand, its numbers resolved
    // from the snapshots. Every source's reload contains Rally Barricade (K1), so an item that does
    // not state it gets the same factor.
    const item = inputs.items.find((i) => i.weapon.name === manifest.name);
    if (item) {
      packages.push({
        ...item.weapon,
        reloadDurationIncluded: item.weapon.reloadDurationIncluded ?? reloadDurationIncluded,
      });
      entry.status = "item";
      entry.itemFile = `src/data/items/weapons/${item.weapon.id}.json`;
      entry.itemReview = item.review;
      // The base row is the row a part takes its number from; an item without one (Hierarchy of
      // Needs) has the base row a package would have.
      const weaponRows = inputs.aegis.rows.filter((r) => sameName(r.name, manifest.name));
      const rowId = item.weapon.damageInstances
        .map((d) => d.damagePerTick.source.row)
        .find((row) => row !== undefined);
      const itemClasses = classesOfRows(weaponRows);
      const baseRow =
        weaponRows.find((r) => r.id === rowId) ?? pickBaseRow(weaponRows, itemClasses) ?? null;
      entry.baseRow = baseRow;
      // A row with the base row's assumptions and one more that names a catalyst buff of the item is
      // the item with its catalyst, e.g. Truth with Reaper's Tithe x4.
      const buffs = catalystBuffs(item.weapon);
      for (const row of weaponRows) {
        if (row.id === baseRow?.id) continue;
        const own = new Set(row.assumptions.map(nameKey));
        const base = new Set((baseRow?.assumptions ?? []).map(nameKey));
        const extra = row.assumptions.filter((a) => !base.has(nameKey(a)));
        const buff =
          baseRow !== null && [...base].every((b) => own.has(b)) && extra.length === 1
            ? buffs.find((b) => nameKey(b.name) === nameKey(extra[0]))
            : undefined;
        const multiplier = buff?.modifiers[0].multiplier.value;
        if (buff && multiplier) {
          entry.options.push({
            rowId: row.id,
            name: buff.name,
            kind: "catalyst",
            factor: multiplier,
            durationSeconds: buff.durationMs?.value ? buff.durationMs.value / 1000 : null,
            condition: null,
            notes: ["buff of the item file, granted with the catalyst"],
          });
        } else {
          // An assumption the model lacks stays named (e.g. fireteam scaling), so the row counts as missing
          entry.unusedRows.push({
            rowId: row.id,
            assumptions: row.assumptions,
            reason: blockingReason(itemClasses.get(row)!) || "the item file uses another row",
          });
        }
      }
      continue;
    }
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
    const classesOf = classesOfRows(rows);
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

    let base = pickBaseRow(rows, classesOf);
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
          rowId: row.id,
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
      if (!effect || effect.modifiers.some((p) => p.type !== "multiplier"))
        continue;
      const factor = effect.modifiers.reduce(
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
    // Aegis before Quantum: the base row without the ignitions it counted in; Quantum's row without
    // ignitions only if Aegis names none (Quantum's shot lies 10 to 20 % off Aegis' measurement).
    const scorchShotFromAegis = withoutIgnitions(base);
    if (scorch) {
      const q = scorch.quantumRow;
      const stacks = `Scorch: x${scorch.stacksPerShot} pro Shot („${scorch.quote}“${override?.scorchStacksPerShot ? ", Override" : ""})`;
      if (scorchShotFromAegis !== null) {
        entry.perShot = scorchShotFromAegis / normaliseFactor;
        entry.notes.push(
          `${stacks}; Shot aus Aegis ohne Ignitions („${AEGIS_IGNITION_TICK.exec(base.otherTicks)![0]}“): ${de(entry.perShot, 1)}; Quantum ohne Ignitions ${de(q.totalDamage! / q.totalShots!, 1)}`,
        );
      } else {
        entry.perShot = q.totalDamage! / q.totalShots!;
        entry.notes.push(
          `${stacks}; Shot aus Quantum ohne Ignitions („${q.note}“): ${de(q.totalDamage!)} ÷ ${q.totalShots}`,
        );
      }
      if (scorch.bonus)
        entry.notes.push(
          `Ignitions ×${de(scorch.bonus.factor, 3)} („${scorch.bonus.quote}“)`,
        );
    }

    // The single hit of the row and the cluster of every Nth shot instead of the row's average
    // (override), on the scale of Aegis "visual".
    const nthRule = override?.nthShotPart;
    const nthTickName = nthRule?.tick ?? "cluster";
    const nthTick = nthRule
      ? aegisNamedTick(base.otherTicks, nthTickName, nthRule.sumTick)
      : undefined;
    if (nthRule) {
      if (base.critShot === null || !nthTick)
        throw new Error(
          `${manifest.name}: nthShotPart needs a hit and a ${nthTickName} tick in row ${base.id}`,
        );
      entry.perShot = base.critShot / base.fullModifiers / normaliseFactor;
      entry.notes.push(
        `${nthRule.name}: Treffer ${base.critShot} aus ${base.id}, alle ${nthRule.every} Schüsse ${nthRule.hits} × ${nthTick} („${base.otherTicks}“)${nthRule.scorchPerHit ? `, x${nthRule.scorchPerHit} Scorch` : ""} (Override)`,
      );
    }

    // The shots of a playstyle (override), on the scale of Aegis "visual": a sequence with hit and
    // factors of the 2nd and 3rd shot from the row's ticks ("6412 2nd, 8402 3rd"), else one shot of
    // the row's value per shot (e.g. a lower charge), at the override's interval if it has one.
    const playstyles = (override?.playstyleParts ?? []).map((rule) => {
      const row = inputs.aegis.rows.find((r) => r.id === rule.row);
      if (!row || row.critShot === null)
        throw new Error(`${manifest.name}: playstylePart needs row ${rule.row} with a hit`);
      const sequence = [...row.otherTicks.matchAll(/(\d+) (?:2nd|3rd)/g)].map(
        (m) => Number(m[1]) / row.critShot!,
      );
      const factors = sequence.length > 0 ? [1, ...sequence] : [];
      const damage = (sequence.length > 0 ? row.critShot / row.fullModifiers : row.perShot) /
        normaliseFactor;
      entry.notes.push(
        sequence.length > 0
          ? `${rule.name}: ${factors.length} Schüsse aus ${row.id} („${row.otherTicks}“), Faktoren ${factors.map((f) => de(f, 3)).join(", ")} (Override)`
          : `${rule.name}: Schuss ${de(damage, 1)} aus ${row.id}${rule.intervalSeconds ? `, alle ${de(rule.intervalSeconds, 3)} s` : ""} (Override)`,
      );
      return { rule, row, factors, damage };
    });

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
          rowId: row.id,
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
          rowId: row.id,
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
          rowId: row.id,
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
        rowId: row.id,
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
        rowId: null,
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
        rowId: null,
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
          ? timingFromQuantum(quantumById, noReloads, noReloads)
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
      timing = fromRow;
      entry.notes.push(`Timing aus Zeile ${timingOverride.row} (Override)`);
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
    // A catalyst's reload stat (manifest) as a factor on the measured reload: d2foundry's formula
    // reload(stat + catalyst) ÷ reload(stat) (owner, 2026-10-23). Quantum's reload does not depend
    // on the stat; Aegis plays with the catalyst, so its reload already has it.
    const reloadStat = manifest.stats["Reload Speed"];
    const reloadDelta = manifest.catalyst?.stats["Reload Speed"];
    const reloadFormula = reloadFormulaOf(
      inputs.reloadFormulas.types,
      manifest.weaponType,
      manifest.name,
    );
    const reloadFrom = catalystTiming ?? timing;
    if (
      !timingIsAegis &&
      reloadFormula &&
      reloadStat !== undefined &&
      reloadDelta &&
      reloadFrom.reloadSeconds > 0
    ) {
      const factor = catalystReloadFactor(
        reloadFormula,
        reloadStat,
        reloadDelta,
        catalystTexts.join("\n"),
      );
      const reloadSeconds = reloadFrom.reloadSeconds * factor;
      const engineReloadSeconds =
        reloadFrom.engineReloadSeconds +
        reloadSeconds -
        reloadFrom.reloadSeconds;
      const reloads =
        reloadFrom.totalShots === null
          ? 0
          : Math.ceil(reloadFrom.totalShots / reloadFrom.magazine) - 1;
      const note = `Derived: reload ${reloadFrom.reloadSeconds.toFixed(2)} s × ${factor.toFixed(3)} = ${reloadSeconds.toFixed(2)} s, d2foundry formula for reload stat ${reloadStat} → ${reloadStat + reloadDelta} (manifest)`;
      catalystTiming = {
        ...reloadFrom,
        reloadSeconds,
        engineReloadSeconds,
        timeToEmptySeconds:
          reloadFrom.timeToEmptySeconds === null
            ? null
            : reloadFrom.timeToEmptySeconds -
              reloads * (reloadFrom.engineReloadSeconds - engineReloadSeconds),
        note: `${reloadFrom.note}; ${note}`,
        reloadSource: {
          ...inputs.reloadFormulas.source,
          status: derivedOrUnverified(note),
          note,
        },
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
        scorchShotFromAegis !== null
          ? "Skala: Shot aus Aegis, keine Prüfung gegen Quantum (Quantum weicht beim Shot ab)"
          : "Skala: Shot aus Quantum, keine Prüfung gegen Aegis (Aegis zählt Ignitions mit)",
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
            status: "derived",
            note: `Derived (override): ${override?.reason ?? ""}${note ? `; ${note}` : ""}`,
          }
        : timingIsAegis || !timingQuantumRow
          ? sustainedSource(timing.rowId, note)
          : quantumSource(timingQuantumRow, note);
    const id = slug(manifest.name);
    const shotSource = (note?: string): Source =>
      scorch && scorchShotFromAegis === null
        ? quantumSource(scorch.quantumRow, note)
        : aegisSource(base, note);
    const setupSource = (note?: string): Source => ({
      name: `Weapon override for ${manifest.name} (Clarity, Compendium, Quantum)`,
      retrieved: inputs.aegis.source.retrieved,
      status: "derived",
      note: `Derived (override): ${override?.reason ?? ""}${note ? `; ${note}` : ""}`,
    });
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

    // The charge of a weapon is the manifest stat without any assumption: "Charge Time" of fusion
    // and linear fusion rifles, "Draw Time" of bows. Aegis' note "…ms charge" comes with the
    // catalyst or perks of its row (Bastion 683 against 800, Sleeper Simulant 750 against 1024),
    // so it only fills in where the manifest has no such stat (e.g. Grand Overture).
    const chargeStat = CHARGE_STATS[manifest.weaponType];
    const manifestChargeMs = chargeStat ? manifest.stats[chargeStat] : undefined;
    const aegisChargeMs =
      timing.chargeMs ??
      inputs.sustained.rows.find(
        (r) => sameName(r.name, manifest.name) && r.chargeMs !== null,
      )?.chargeMs;
    const chargeMs = manifestChargeMs || aegisChargeMs;
    const chargeSource: Source = manifestChargeMs
      ? {
          name: `Bungie manifest ${inputs.manifestVersion}, stat "${chargeStat}" of ${manifest.name}`,
          retrieved: inputs.aegis.source.retrieved,
          status: "verified",
          note: "The interval already contains it: the charge delays the first shot and every shot after a cast",
        }
      : timingSource(
          `Aegis Sustained note "${aegisChargeMs}ms charge"; the interval contains it`,
        );
    // The rate of the catalyst's timing; a setup whose catalyst timing holds only once it stands
    // (catalystTimingOnceDeployed) carries it in a rule, and the timing leaves the rate out
    const catalystRate: SourcedNumber | undefined =
      timingDiffers && catalystTiming
        ? {
            value: Number((60 / catalystTiming.intervalSeconds).toFixed(3)),
            source: timingSourceOf(catalystTiming, catalystTiming.note),
          }
        : undefined;
    const weapon: Weapon = {
      id,
      code: codes[id] ?? 0, // set below
      name: manifest.name,
      manifestHash: manifest.hash,
      gameVersion: base.gameVersion,
      weaponType: manifest.weaponType,
      element: manifest.element,
      ammo: manifest.ammo,
      // The interval already contains the charge (time to empty counts from the first shot): the
      // charge delays the first shot and every shot after a cast that blocked the weapon.
      chargeTimeMs: chargeMs
        ? { value: chargeMs, source: chargeSource }
        : {
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
      reloadDurationIncluded,
      damageInstances: [
        {
          id: "shot",
          name: scorch
            ? `Shot (${scorchShotFromAegis !== null ? "Aegis" : "Quantum"}, without ignitions)`
            : nthRule
              ? "Shot (Aegis single hit)"
              : "Shot (Aegis average)",
          delayMs: {
            value: 0,
            source: shotSource("Package: one value per shot"),
          },
          damagePerTick: {
            value: Number(entry.perShot!.toFixed(3)),
            source: scorch
              ? scorchShotFromAegis !== null
                ? shotSource(
                    `(Wipe − ignitions) ÷ Full Modifiers ÷ shots; ignitions from x${scorch.stacksPerShot} per shot and the threshold; assumptions: ${base.assumptions.join(", ") || "none"}`,
                  )
                : quantumSource(
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
        ...(nthRule && nthTick
          ? [
              {
                id: NTH_SHOT_ID,
                name: nthRule.name,
                delayMs: {
                  value: (nthRule.delaySeconds ?? 0) * 1000,
                  source: setupSource(),
                },
                damagePerTick: {
                  value: Number(
                    (nthTick / base.fullModifiers / normaliseFactor).toFixed(3),
                  ),
                  source: aegisSource(
                    base,
                    `Tick "${base.otherTicks}" ÷ Full Modifiers`,
                  ),
                },
                ticks: { value: nthRule.hits, source: setupSource() },
                tickIntervalMs: {
                  value: Number(((nthRule.tickIntervalSeconds ?? 0) * 1000).toFixed(3)),
                  source: setupSource(),
                },
                everyNthShot: { value: nthRule.every, source: setupSource() },
                canPrecision: false,
                requiresCatalyst: false,
              },
            ]
          : []),
        ...playstyles.map(({ rule, row, factors, damage }) => ({
          id: rule.id,
          name: rule.name,
          delayMs: { value: 0, source: setupSource() },
          damagePerTick: {
            value: Number(damage.toFixed(3)),
            source: aegisSource(
              row,
              `${factors.length > 0 ? "critShot" : "visual Value"} ÷ Full Modifiers; assumptions: ${row.assumptions.join(", ")}`,
            ),
          },
          ticks: { value: Math.max(1, factors.length), source: setupSource() },
          tickIntervalMs: {
            value: factors.length > 0 ? Math.round(60000 / entry.derivedRpm!) : 0,
            source: setupSource(
              factors.length > 0
                ? "the shots follow at the weapon's interval (60000 ÷ rpm)"
                : undefined,
            ),
          },
          ...(factors.length > 0
            ? {
                tickFactors: factors.map((f) => ({
                  value: Number(f.toFixed(3)),
                  source: aegisSource(row, `tick ÷ hit of "${row.otherTicks}"`),
                })),
              }
            : {}),
          canPrecision: false,
          requiresCatalyst: false,
        })),
      ] as ImportPart[],
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
                      ...(catalystRate ? { fireRateRpm: catalystRate } : {}),
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
                        source:
                          catalystTiming.reloadSource ??
                          timingSourceOf(catalystTiming),
                      },
                    },
                  }
                : {}),
            },
          }
        : {}),
    };

    // The playstyles (Weapon.playstyles): the shots of a playstyle take the place of the plain shot,
    // an arrow through two rings that of the hits through one ring; the rate is a rule
    // The picker offers the selectable ones; the others are assumptions of a scenario and need no entry
    const pickable = [
      ...playstyles.flatMap(({ rule }) =>
        rule.selectable ? [{ id: rule.id, label: rule.name }] : [],
      ),
    ];
    if (pickable.length > 0 && !override?.playstyleBaseName) {
      throw new Error(`${manifest.name}: playstyles in the picker need playstyleBaseName`);
    }
    const playstyleList =
      pickable.length > 0
        ? [
            { id: slug(override!.playstyleBaseName!), label: override!.playstyleBaseName! },
            ...pickable,
          ]
        : [];
    const shotPlaystyles = playstyles.map(({ rule }) => rule.id);
    const partPlaystyles: Record<string, PartPlaystyle> = {
      ...(shotPlaystyles.length > 0 ? { shot: { except: shotPlaystyles } } : {}),
      ...Object.fromEntries(shotPlaystyles.map((id) => [id, { only: id }])),
    };
    if (playstyleList.length > 0) weapon.playstyles = playstyleList;
    // The parts are set off by rules (architecture section 6): one `spawn` per part on every shot
    const importParts = weapon.damageInstances as ImportPart[];
    weapon.damageInstances = importParts.map(runtimePart);
    weapon.rules = [
      ...importParts.flatMap((part) => partRules(part, partPlaystyles[part.id])),
      ...playstyles.flatMap(({ rule }) =>
        rule.intervalSeconds
          ? [
              playstyleRateRule(rule.id, {
                value: Number((60 / rule.intervalSeconds).toFixed(3)),
                source: setupSource(`60 ÷ ${rule.intervalSeconds} s per shot`),
              }),
            ]
          : [],
      ),
      // Scorch from explosions: `on hit → applyStatus`, before Ember of Ashes (the hits of a part of
      // the nth shot or of a setup, and every hit of the weapon)
      ...(nthRule?.scorchPerHit
        ? statusOnHitRules({
            id: "scorch",
            status: "scorch",
            stacks: {
              value: nthRule.scorchPerHit,
              source: setupSource("Scorch per hit before Ember of Ashes"),
            },
            parts: [NTH_SHOT_ID],
            source: setupSource(),
          })
        : []),
      ...(scorch
        ? statusOnHitRules({
            id: "scorch",
            status: "scorch",
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
          })
        : []),
    ];
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


