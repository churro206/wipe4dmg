// Ability components from the Compendium texts (ADR 0009 point 2, U9). Rules:
// - R1: every "N [PvP] <up to two words> damage" in a sentence is one component; "Collision" damage
//   needs flying into the boss and does not count (one boss, ADR 0015).
// - R2: "every X seconds for Y seconds" after the value in the same sentence gives Y / X ticks.
// - R3: "X seconds after" in the same sentence gives the delay from the hit.
// - R4: "every X seconds up to N times" gives N ticks (the first number; "16+9" is base plus extension).
// - R5: a sentence that states a total ("with all/both", "increased by X% to", "maximum of") replaces
//   the components before it; it is the sum of the alternatives above. Sentences about Guardians are
//   PvP and do not count.
// Values are per hit of the super timing. An ability uses its components only if it is enabled
// below and the sum is within the tolerance of its Aegis row (the gate, ADR 0009 point 4), keyword
// damage included as Aegis measured it; otherwise it stays a package.

import type {
  AbilityComponent,
  AbilityComponents,
  AbilityData,
  AbilityKeyword,
  AbilityStatScaling,
  AegisAbilityRow,
  CompendiumEntry,
  Source,
  SuperTiming,
} from "../../src/data/schema.ts";

/** Gate tolerance for abilities from components (owner, 2026-10-23). */
export const COMPONENT_TOLERANCE = 0.15;

// Abilities converted so far; the others stay packages until their rules are checked.
export const COMPONENT_ABILITY_IDS = [
  "fusion-grenade",
  "thundercrash",
  "shadowshot-deadfall",
  "solar-grenade",
  "thermite-grenade",
  "tripmine-grenade",
  "axion-bolt-grenade",
  "disorienting-blow",
  "seismic-strike",
  "lightweight-knife",
  "weighted-throwing-knife",
  "hammer-strike",
  "incinerator-snap",
  "phantom-surge",
  "snare-bomb",
  "shield-bash",
  "frenzied-blade",
  "arcane-needle",
  "magnetic-grenade",
  "vortex-grenade",
  "celestial-fire",
];

const URL = "https://destiny2.science/data-compendium";
const NUMBER = String.raw`(\d[\d,]*(?:\.\d+)?)`;
const DAMAGE = new RegExp(
  String.raw`${NUMBER}\s+((?:[A-Za-z]+\s+){0,2})damage`,
  "gi",
);
const TICKS = new RegExp(
  String.raw`^[^.]*?every (?:${NUMBER} )?seconds? for ${NUMBER} seconds`,
  "i",
);
const TICKS_TIMES = new RegExp(
  String.raw`^[^.]*?every ${NUMBER} seconds? up to ${NUMBER}(?:\+\d+)? times`,
  "i",
);
const TOTAL = /\bwith (?:all|both)\b|\bscoring all\b|\bincreas(?:e|ed|es)\b[^.]*?\bto\b|\bmaximum of\b/i;
const DELAY = new RegExp(String.raw`${NUMBER} seconds after`, "i");
const EXCLUDED_WORDS = ["collision"];

const toNumber = (text: string) => Number(text.replace(/,/g, ""));
const slug = (text: string) =>
  text.trim().toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Sentences of a Compendium text without the PvP values in brackets. */
function sentences(text: string): string[] {
  return text
    .replace(/\s*\[[^\]]*\]/g, "")
    .split(/(?<=[.!])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Components of a Compendium entry by rules R1 to R3. */
export function parseComponents(
  entry: CompendiumEntry,
  retrieved: string,
): AbilityComponent[] {
  const quoted = (quote: string): Source => ({
    name: `Destiny Data Compendium, ${entry.tab}, ${entry.name}`,
    url: URL,
    retrieved,
    status: "verified",
    quote,
  });
  const implicit = (note: string): Source => ({
    name: `Destiny Data Compendium, ${entry.tab}, ${entry.name}`,
    url: URL,
    retrieved,
    status: "unverified",
    note,
  });
  const components: AbilityComponent[] = [];
  for (const sentence of sentences(entry.text)) {
    if (/^guardians\b/i.test(sentence)) continue;
    if (TOTAL.test(sentence) && DAMAGE.test(sentence)) components.length = 0;
    DAMAGE.lastIndex = 0;
    for (const match of sentence.matchAll(DAMAGE)) {
      const words = match[2].trim();
      if (EXCLUDED_WORDS.some((w) => words.toLowerCase().includes(w))) continue;
      const base = slug(words) || "hit";
      const id = components.some((c) => c.id === base)
        ? `${base}-${components.filter((c) => c.id.startsWith(base)).length + 1}`
        : base;
      const after = sentence.slice(match.index + match[0].length);
      // a stated "total of N damage" in the same sentence is its own component
      const times = /\btotal of\b/i.test(sentence) ? null : TICKS_TIMES.exec(after);
      const ticks = times ?? TICKS.exec(after);
      const delay = DELAY.exec(sentence.slice(0, match.index));
      const interval = times ? toNumber(times[1]) : ticks ? toNumber(ticks[1] ?? "1") : 0;
      components.push({
        id,
        name: words ? capitalise(words) : "Hit",
        delayMs: delay
          ? { value: toNumber(delay[1]) * 1000, source: quoted(delay[0]) }
          : { value: 0, source: implicit("No delay stated; at the hit") },
        damagePerTick: { value: toNumber(match[1]), source: quoted(sentence) },
        ticks: ticks
          ? {
              value: times ? toNumber(times[2]) : toNumber(ticks[2]) / interval,
              source: quoted(ticks[0].trim()),
            }
          : { value: 1, source: implicit("One hit") },
        tickIntervalMs: {
          value: interval * 1000,
          source: ticks ? quoted(ticks[0].trim()) : implicit("One hit"),
        },
        scalesWithAbilityStat: true,
      });
    }
  }
  return components;
}

export type AbilityComponentInputs = {
  compendium: CompendiumEntry[];
  retrieved: string;
  abilities: AbilityData[];
  aegisRows: AegisAbilityRow[];
  abilityKeywords: AbilityKeyword[];
  superTimings: SuperTiming[];
  abilityStats: AbilityStatScaling[];
};

export type AbilityComponentRow = {
  abilityId: string;
  name: string;
  components: AbilityComponent[];
  hits: number;
  // per use on the Aegis visual scale, keyword damage as Aegis measured it
  perUse: { 100: number; 200: number | null };
  aegis: { 100: number; 200: number | null };
  enabled: boolean;
  used: boolean;
};

const ratio = (value: number | null, reference: number | null) =>
  value === null || reference === null ? null : value / reference;
const withinTolerance = (r: number | null) =>
  r === null || Math.abs(r - 1) <= COMPONENT_TOLERANCE;

/** One row per ability with a Compendium entry and an Aegis row: components and gate result. */
export function abilityComponentRows(
  inputs: AbilityComponentInputs,
): AbilityComponentRow[] {
  return inputs.abilities.flatMap((ability) => {
    const entry = inputs.compendium.find(
      (e) => e.tab === ability.compendium?.tab && e.name === ability.compendium?.entry,
    );
    const row = inputs.aegisRows.find((r) => r.id === ability.aegisRowId);
    if (!entry || !row || row.perUseStat100.value === null) return [];
    const components = parseComponents(entry, inputs.retrieved);
    const timing = inputs.superTimings.find(
      (t) => t.abilityId === ability.id && !t.exoticArmorId,
    );
    const hits = timing?.hits.value ?? 1;
    const scaling = inputs.abilityStats.find((s) => s.kind === ability.kind)!;
    const statFactor =
      1 + scaling.damagePerPoint.value! * (scaling.maxStat - scaling.bonusFromStat);
    const own =
      hits *
      components.reduce((sum, c) => sum + c.damagePerTick.value! * c.ticks.value!, 0);
    const keyword = inputs.abilityKeywords
      .filter((k) => k.abilityId === ability.id && k.bakedInPackage)
      .reduce((sum, k) => {
        const b = k.bakedInPackage!;
        return sum + (b.triggers * b.tick) / (b.uses * b.fullModifiers);
      }, 0);
    const perUse = {
      100: own + keyword,
      // melee buffs do not scale ignition (Compendium, ADR 0015 U4a-3)
      200: own * statFactor + keyword * (ability.kind === "melee" ? 1 : statFactor),
    };
    const aegis = { 100: row.perUseStat100.value, 200: row.perUseStat200.value };
    const enabled = COMPONENT_ABILITY_IDS.includes(ability.id);
    return [
      {
        abilityId: ability.id,
        name: ability.name,
        components,
        hits,
        perUse,
        aegis,
        enabled,
        used:
          enabled &&
          components.length > 0 &&
          withinTolerance(ratio(perUse[100], aegis[100])) &&
          withinTolerance(ratio(perUse[200], aegis[200])),
      },
    ];
  });
}

/** The Data File: components of the abilities that pass the gate. */
export function abilityComponentsData(rows: AbilityComponentRow[]): AbilityComponents[] {
  return rows
    .filter((r) => r.used)
    .map((r) => ({ abilityId: r.abilityId, components: r.components }));
}

const percent = (r: number | null) =>
  r === null ? "–" : `${r >= 1 ? "+" : ""}${Math.round((r - 1) * 100)} %`;
const round = (n: number | null) => (n === null ? "–" : Math.round(n).toString());

/** Review table docs/ability-import.md. */
export function renderAbilityImport(rows: AbilityComponentRow[]): string {
  const lines = [
    "# Ability-Import aus Compendium-Teilen",
    "",
    "Generiert von `npm run build:abilities` (ADR 0009, U9). Nicht von Hand ändern.",
    "",
    `Teile pro Treffer aus dem Compendium-Text, mal Treffer aus \`super-timings.json\`, plus Keyword-Schaden wie von Aegis gemessen. Gate ±${COMPONENT_TOLERANCE * 100} % gegen die Aegis-Zeile bei Stat 100 und 200. „Paket“: Ability nutzt weiter das Aegis-Paket.`,
    "",
    `Teile: ${rows.filter((r) => r.used).length} von ${rows.length}.`,
    "",
    "| Ability | Teile (Wert × Ticks) | Treffer | Pro Einsatz 100 | Aegis 100 | Abw. 100 | Abw. 200 | Nutzt |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => {
      const parts =
        r.components
          .map((c) => `${c.name} ${c.damagePerTick.value}×${c.ticks.value}`)
          .join(", ") || "–";
      const uses = r.used ? "Teile" : r.enabled ? "Paket (Gate)" : "Paket";
      return `| ${r.name} | ${parts} | ${r.hits} | ${round(r.perUse[100])} | ${round(r.aegis[100])} | ${percent(ratio(r.perUse[100], r.aegis[100]))} | ${percent(ratio(r.perUse[200], r.aegis[200]))} | ${uses} |`;
    }),
    "",
  ];
  return lines.join("\n");
}
