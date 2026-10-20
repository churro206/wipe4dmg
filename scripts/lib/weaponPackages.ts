// Builds weapon packages from Aegis and Quantum (ADR 0013): base row, package per shot, timing from
// the Quantum time to empty, options from "with / without" rows, automatic gate, gaps, link codes
// and the review table docs/weapon-import.md. The simulator check of the time to empty runs in
// tests/weaponPackages.test.ts, since scripts cannot load the engine directly.

import type {
  AegisSustainedRow,
  AegisSustainedSnapshot,
  AegisWeaponRow,
  AegisWeaponSnapshot,
  CompendiumEntry,
  Effect,
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
  handModelled: Weapon[];
  codes: Record<string, number>;
};

const TOLERANCE = 0.03; // ±3 %, ADR 0011 and ADR 0013
const RPM_HINT = 0.25; // a derived fire rate this far from the Quantum rpm is worth a look
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
};
export type ReportAssumption = AssumptionClass & {
  assumption: string;
  weapon: string;
};
export type WeaponReport = {
  aegisRetrieved: string;
  quantumRetrieved: string;
  manifestVersion: string;
  handModelled: string[];
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

/** Duration and condition of an option from the Compendium tab Weapon Perks. */
function perkText(
  names: string[],
  compendium: CompendiumEntry[],
): { durationSeconds: number | null; condition: string | null } | null {
  for (const name of names) {
    const entry = compendium.find(
      (e) =>
        e.tab === "Weapon Perks" && e.name.toLowerCase() === name.toLowerCase(),
    );
    if (!entry) continue;
    const duration = DURATION.exec(entry.text);
    const firstLine = entry.text.split("\n")[0];
    return {
      durationSeconds: duration ? Number(duration[1]) : null,
      condition: CONDITION_WORDS.test(firstLine) ? firstLine : null,
    };
  }
  return null;
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
type Timing = {
  rowId: string;
  magazine: number;
  totalShots: number;
  reloadSeconds: number; // as the source states it
  engineReloadSeconds: number; // what the simulator adds after the interval of the last shot
  intervalSeconds: number;
  timeToEmptySeconds: number;
  note: string;
};
type TimingProblem = { problem: string };

/**
 * Aegis "Sustained" reloads right after the last shot of a magazine: time to empty =
 * (shots − magazines) × interval + reloads × reload. The simulator counts one interval before each
 * reload, so it gets reload − interval.
 */
export function timingFromAegis(
  row: AegisSustainedRow,
): Timing | TimingProblem {
  const [magazine] = row.magazines;
  const timeToEmpty = row.timeToEmptySeconds;
  if (!magazine || timeToEmpty === null || row.shots < 1)
    return {
      problem: `Zeile „${row.id}“ ohne Magazin-Folge oder Zeit bis leer`,
    };
  const regular = row.magazines.every(
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

/** Quantum counts one interval before each reload, like the simulator. */
export function timingFromQuantum(
  row: QuantumWeaponRow,
): Timing | TimingProblem {
  const { magazine, totalShots, reloadSeconds, timeToEmptySeconds, rpm } = row;
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

const minDeviation = (values: (number | null)[]): number | null => {
  const known = values.filter((v): v is number => v !== null);
  return known.length > 0 ? Math.min(...known) : null;
};

/** Builds packages, gaps, codes and the report from the inputs; pure, no file access. */
export function buildWeaponImport(
  inputs: WeaponImportInputs,
): WeaponImportResult {
  const effectNames = inputs.effects.map(({ id, name }) => ({ id, name }));
  const handModelled = new Set(inputs.handModelled.map((w) => w.name));
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
  for (const weapon of inputs.handModelled) codes[weapon.id] ??= weapon.code;
  const packages: Weapon[] = [];
  const gaps: WeaponGap[] = [];
  const reportWeapons: ReportWeapon[] = [];
  const assumptions: ReportAssumption[] = [];

  const scope = inputs.manifest.filter(
    (w) => w.ammo !== "primary" && !handModelled.has(w.name),
  );
  for (const manifest of scope) {
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

    const rows = inputs.aegis.rows.filter((r) => r.name === manifest.name);
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
          ...classifyAssumption(assumption, {
            weapon: manifest,
            effects: effectNames,
            armor: inputs.armor,
            terms: inputs.terms,
          }),
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
    const base = [...allowed].sort(
      (a, b) =>
        extrasOf(a) - extrasOf(b) ||
        b.shots - a.shots ||
        a.assumptions.length - b.assumptions.length,
    )[0];
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
    entry.includedEffectIds = classesOf
      .get(base)!
      .flatMap((c) => (c.effectId ? [c.effectId] : []));

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
      const factor = perHit ?? visual;
      if (factor === null) {
        entry.unusedRows.push({
          assumptions: row.assumptions,
          reason:
            "Option ohne Faktor: Einzeltreffer gleich und andere Zahl an Shots",
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
          ? (manifest.catalyst?.perks ?? [])
          : [assumptionName(c.assumption), c.similarTo ?? ""],
      );
      const text = perkText(perkNames, inputs.compendium);
      if (!text) notes.push("keine Dauer im Compendium gefunden");
      options.push({
        id,
        name,
        kind,
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

    // Timing from two sources (point 7): Aegis "Sustained" first, Quantum second; both are compared.
    const classifyLabel = (label: string) =>
      classifyAssumption(label, {
        weapon: manifest,
        effects: effectNames,
        armor: inputs.armor,
        terms: inputs.terms,
      }).kind;
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
    const sustainedRows = inputs.sustained.rows
      .filter((r) => r.name === manifest.name)
      .filter((r) =>
        foreignOf(r).every(
          (a) =>
            timingImpact(
              a,
              classifyAssumption(a, {
                weapon: manifest,
                effects: effectNames,
                armor: inputs.armor,
                terms: inputs.terms,
              }),
              timingSources,
            ) === "neutral",
        ),
      )
      .sort(
        (a, b) =>
          foreignOf(a).length - foreignOf(b).length ||
          a.assumptions.length - b.assumptions.length,
      );
    const aegisTimings = sustainedRows.map(timingFromAegis);
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
      .filter((r) => r.name === manifest.name)
      .map((row) => ({ row, kinds: variantKinds(row) }));
    const plain = candidates.filter(({ kinds }) =>
      kinds.every((k) => k === "execution" || k === "intrinsic"),
    );
    const withCatalyst = candidates.filter(({ kinds }) =>
      kinds.every(
        (k) => k === "execution" || k === "intrinsic" || k === "catalyst",
      ),
    );
    const quantumRow = (plain[0] ?? withCatalyst[0])?.row;
    const quantum = quantumRow ? timingFromQuantum(quantumRow) : null;
    const quantumTiming =
      quantum && "intervalSeconds" in quantum ? quantum : undefined;

    const timing = aegis ?? quantumTiming;
    if (!timing) {
      const reasons = [
        ...aegisTimings.map((t) => `Aegis: ${(t as TimingProblem).problem}`),
        sustainedRows.length === 0 &&
        inputs.sustained.rows.some((r) => r.name === manifest.name)
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
    if (aegis && quantumTiming) {
      const agree =
        aegis.totalShots === quantumTiming.totalShots &&
        Math.abs(aegis.timeToEmptySeconds - quantumTiming.timeToEmptySeconds) <=
          TOLERANCE * quantumTiming.timeToEmptySeconds;
      entry.notes.push(
        agree
          ? "Timing: Aegis und Quantum stimmen überein"
          : `⚠ Timing: Aegis ${aegis.totalShots} Shots in ${de(aegis.timeToEmptySeconds, 1)} s, Quantum ${quantumTiming.totalShots} Shots in ${de(quantumTiming.timeToEmptySeconds, 1)} s; Aegis gilt`,
      );
    } else {
      entry.notes.push(
        `Timing nur aus ${timing === aegis ? "Aegis" : "Quantum"}`,
      );
    }
    entry.timingSource = timing === aegis ? "Aegis" : "Quantum";
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

    // Scale (point 10): Aegis against Quantum, or against "Base" in Aegis "Sustained".
    entry.scaleDeviation = minDeviation([
      quantumRow ? scaleDeviation(base, quantumRow) : null,
      sustainedRows[0]?.base
        ? Math.abs(base.perShot / sustainedRows[0].base - 1)
        : null,
    ]);
    if (entry.scaleDeviation === null) {
      gap("Skala nicht prüfbar: keine vergleichbaren Werte");
      continue;
    }
    if (entry.scaleDeviation > TOLERANCE) {
      gap(
        `Skala Aegis gegen Quantum weicht um ${(entry.scaleDeviation * 100).toFixed(1)} % ab`,
      );
      continue;
    }

    const timingSource = (note?: string): Source =>
      timing === aegis
        ? sustainedSource(aegis.rowId, note)
        : quantumSource(quantumRow!, note);
    const id = slug(manifest.name);
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
          timing === aegis
            ? `Reload ${timing.reloadSeconds} s minus the shot interval: Aegis reloads right after the last shot, the simulator counts one interval before the reload`
            : undefined,
        ),
      },
      damageInstances: [
        {
          id: "shot",
          name: "Shot (Aegis average)",
          delayMs: {
            value: 0,
            source: aegisSource(base, "Package: one value per shot"),
          },
          damagePerTick: {
            value: base.perShot,
            source: aegisSource(
              base,
              `visual Value; assumptions: ${base.assumptions.join(", ") || "none"}`,
            ),
          },
          ticks: { value: 1, source: aegisSource(base) },
          tickIntervalMs: { value: 0, source: aegisSource(base) },
          canPrecision: false,
          requiresCatalyst: false,
        },
      ],
      intrinsicParts: [],
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
      handModelled: [...handModelled].sort(),
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
    `Umfang: exotische Special- und Heavy-Waffen. **${packages.length} Pakete**, ${gaps.length} Lücken, von Hand modelliert: ${report.handModelled.join(", ") || "–"}.`,
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
