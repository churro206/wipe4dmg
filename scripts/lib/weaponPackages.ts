// Builds weapon packages from Aegis and Quantum (ADR 0013): base row, package per shot, timing from
// the Quantum time to empty, options from "with / without" rows, automatic gate, gaps, link codes
// and the review table docs/weapon-import.md. The simulator check of the time to empty runs in
// tests/weaponPackages.test.ts, since scripts cannot load the engine directly.

import type {
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
  type AssumptionClass,
  type AssumptionKind,
} from "./weaponAssumptions.ts";

export type WeaponImportInputs = {
  aegis: AegisWeaponSnapshot;
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

    // Timing from Quantum: the row without variant, else a variant that only describes the
    // execution (e.g. "direct impact", "ADS"), else a catalyst row with a warning.
    const variantKinds = (row: QuantumWeaponRow) =>
      row.variant === ""
        ? []
        : quantumLabel(row.variant).map(
            (label) =>
              classifyAssumption(label, {
                weapon: manifest,
                effects: effectNames,
                armor: inputs.armor,
                terms: inputs.terms,
              }).kind,
          );
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
    const quantum = (plain[0] ?? withCatalyst[0])?.row;
    if (!quantum) {
      gap(
        candidates.length === 0
          ? "keine Quantum-Zeile"
          : `keine passende Quantum-Zeile (nur ${candidates.map(({ row }) => `„${row.variant}“`).join(", ")})`,
      );
      continue;
    }
    if (plain.length === 0)
      entry.notes.push(
        `⚠ Timing aus der Quantum-Zeile „${quantum.variant}“ mit Katalysator`,
      );
    else if (quantum.variant !== "")
      entry.notes.push(`Timing aus der Quantum-Zeile „${quantum.variant}“`);
    if (plain.length > 1)
      entry.notes.push(
        `${plain.length} passende Quantum-Zeilen, die erste gilt („${quantum.note}“)`,
      );
    entry.magazine = quantum.magazine;
    entry.totalShots = quantum.totalShots;
    entry.reloadSeconds = quantum.reloadSeconds;
    entry.timeToEmptySeconds = quantum.timeToEmptySeconds;
    entry.quantumRpm = quantum.rpm;
    entry.scaleDeviation = scaleDeviation(base, quantum);
    const { magazine, totalShots, reloadSeconds, timeToEmptySeconds, rpm } =
      quantum;
    if (magazine === null || totalShots === null || reloadSeconds === null) {
      gap(
        `Quantum ohne Magazin, Munition oder Reload (${JSON.stringify(quantum.textCells)})`,
      );
      continue;
    }
    if (entry.scaleDeviation === null) {
      gap("Skala nicht prüfbar: keine vergleichbaren Einzeltreffer");
      continue;
    }
    if (entry.scaleDeviation > TOLERANCE) {
      gap(
        `Skala Aegis gegen Quantum weicht um ${(entry.scaleDeviation * 100).toFixed(1)} % ab`,
      );
      continue;
    }
    const reloads = Math.ceil(totalShots / magazine) - 1;
    let intervalSeconds: number;
    let timingNote: string;
    if (timeToEmptySeconds !== null && totalShots > 1) {
      intervalSeconds =
        (timeToEmptySeconds - reloads * reloadSeconds) / (totalShots - 1);
      timingNote = `Derived: (Time to Empty ${timeToEmptySeconds} s − ${reloads} reloads × ${reloadSeconds} s) ÷ ${totalShots - 1} intervals (ADR 0013)`;
    } else if (rpm !== null) {
      intervalSeconds = 60 / rpm;
      timingNote = "Quantum fire rate; no Time to Empty";
      entry.notes.push("ohne Zeit bis leer: Abstand aus der rpm");
    } else {
      gap("Quantum ohne Zeit bis leer und ohne rpm");
      continue;
    }
    if (intervalSeconds <= 0) {
      gap("abgeleiteter Abstand ≤ 0");
      continue;
    }
    const derivedRpm = 60 / intervalSeconds;
    entry.derivedRpm = derivedRpm;
    if (rpm !== null && Math.abs(derivedRpm / rpm - 1) > RPM_HINT)
      entry.notes.push(
        `abgeleitete Feuerrate ${derivedRpm.toFixed(0)} statt ${rpm} rpm`,
      );

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
        source: quantumSource(
          quantum,
          "Quantum counts the time to empty from the first shot",
        ),
      },
      fireRateRpm: {
        value: Number(derivedRpm.toFixed(3)),
        source: quantumSource(quantum, timingNote),
      },
      magazine: { value: magazine, source: quantumSource(quantum) },
      totalShots: { value: totalShots, source: quantumSource(quantum) },
      reloadTimeMs: {
        value: Math.round(reloadSeconds * 1000),
        source: quantumSource(quantum),
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
    "Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Quantum. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.",
    "",
    "| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...packages
      .map((w) =>
        [
          w.name,
          w.weaponType,
          w.element,
          cell(w.baseRow!.assumptions.join(", ") || "keine") +
            ` (${w.baseRow!.shots} ${w.baseRow!.shots === 1 ? "Shot" : "Shots"})`,
          de(w.perShot!, 1),
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
