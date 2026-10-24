// Uptime of effects (block "Uptime", owner 2026-10-24): an own effect lasts only as long as its text
// says, from the start of the damage phase, unless a modelled trigger (cast, hit, super) renews it;
// a buff from teammates (provider fireteamSupport) lasts the whole phase, the teammate keeps it up.
// Every effect without durationMs and without trigger gets a verdict; the text is the Compendium
// entry and the Court row of its name and the names of its sources ("Court … (…, 21s)").
// Review table: docs/uptime-import.md.

import type { Effect } from "../../src/data/schema.ts";
import {
  COURT_SECONDS,
  courtQuote,
  courtRowsOf,
  durationInTexts,
  itemTexts,
  SOURCE_SECONDS,
  type ItemTextSources,
} from "./itemText.ts";

export type UptimeInputs = ItemTextSources & {
  effects: { file: string; effect: Effect }[];
};

export type UptimeVerdict =
  | "window" // has durationMs or a trigger
  | "fireteam" // a teammate keeps it up the whole phase
  | "held" // the player renews it himself the whole phase, see HELD
  // works per hit or cast or inside another effect's window: keywords, stacks per hit, a bonus on one
  // ability, a raise of another effect (Expanding Abyss)
  | "event"
  | "state" // only grants a state; held from the start (owner 2026-10-23, "vorher aufgebaut gilt ab Wahl")
  | "none" // no time limit in its text
  | "open"; // its text names a duration, the effect has none

export type UptimeRow = {
  file: string;
  effectId: string;
  name: string;
  verdict: UptimeVerdict;
  seconds?: number; // first duration found in the text
  quote?: string; // where the duration or the reason comes from
};

// Effects the player renews himself the whole phase although a text names a duration, with reason.
const HELD: Record<string, string> = {
  "particle-reconstruction":
    "Compendium Artifact Perks: „(Linear) Fusion Rifle hits inflict an unique stacking weaken“; every hit renews the 10 s, the weapon fires the whole phase",
  "limit-break":
    "Compendium Artifact Perks: „One-Off Supers are only buffed for 8 seconds. Roaming Supers are buffed until it runs out.“ The bonus is only on super damage, which falls inside that time",
  "fever-and-chill":
    "Compendium Artifact Perks: „Upon scoring multiple Precision Hits within 3 seconds of each: Solar Weapons | Grants Radiant for 10+5 seconds. Incurs a 1.5s cooldown between triggers.“ The firing weapon renews it",
};

// Parts that last while their effect is active; the others work per hit or cast.
const TIMED_PARTS = new Set(["multiplier", "timing", "periodicDamage"]);

function worksPerEvent(effect: Effect): boolean {
  return effect.parts.every(
    (p) =>
      !TIMED_PARTS.has(p.type) ||
      (p.type === "multiplier" &&
        (p.hitStacks !== undefined || p.abilityIds !== undefined || p.requiresEffectIds !== undefined)),
  );
}

const sourceNames = (effect: Effect): string[] =>
  effect.parts.flatMap((p) => (p.type === "multiplier" ? [p.multiplier.source.name] : []));

function durationInText(
  effect: Effect,
  inputs: UptimeInputs,
): { seconds: number; quote: string } | undefined {
  for (const s of sourceNames(effect)) {
    const m = SOURCE_SECONDS.exec(s);
    if (m) return { seconds: Number(m[1]), quote: s };
  }
  for (const row of courtRowsOf(effect.name, inputs).filter((r) => r.pveDuration)) {
    const m = COURT_SECONDS.exec(row.pveDuration!);
    if (m) return { seconds: Number(m[1]), quote: courtQuote(row) };
  }
  return durationInTexts(itemTexts(effect.name, inputs));
}

export function uptimeRows(inputs: UptimeInputs): UptimeRow[] {
  return inputs.effects.map(({ file, effect }) => {
    const base = { file, effectId: effect.id, name: effect.name };
    if (effect.durationMs || effect.trigger) return { ...base, verdict: "window" as const };
    if (effect.providers.some((p) => p.kind === "fireteamSupport"))
      return { ...base, verdict: "fireteam" as const };
    if (HELD[effect.id]) return { ...base, verdict: "held" as const, quote: HELD[effect.id] };
    if (effect.parts.length === 0) return { ...base, verdict: "state" as const };
    if (worksPerEvent(effect)) return { ...base, verdict: "event" as const };
    const found = durationInText(effect, inputs);
    return found ? { ...base, verdict: "open" as const, ...found } : { ...base, verdict: "none" as const };
  });
}

const VERDICT_TEXT: Record<UptimeVerdict, string> = {
  window: "Fenster (Dauer oder Auslöser)",
  fireteam: "Teammate hält ihn, ganze Phase",
  held: "selbst erneuert, ganze Phase",
  event: "wirkt pro Treffer oder Cast, ohne Fenster",
  state: "nur Zustand, gilt ab Wahl",
  none: "kein Zeitlimit im Text, ganze Phase",
  open: "**offen:** Text nennt eine Dauer",
};

export function renderUptime(rows: UptimeRow[]): string {
  const count = (v: UptimeVerdict) => rows.filter((r) => r.verdict === v).length;
  const lines = [
    "# Uptime der Effects",
    "",
    "Generiert mit `npm run build:uptime` (Regel in `scripts/lib/uptime.ts`). Regel des Inhabers (2026-10-24): Eigene Quellen gelten nur für die Dauer aus ihrem Text, ab Beginn der Phase. Länger nur, wenn ein modellierter Auslöser sie auffrischt. Buffs von Teammates gelten die ganze Phase.",
    "",
    `Fenster ${count("window")}, Teammate ${count("fireteam")}, selbst erneuert ${count("held")}, pro Ereignis ${count("event")}, Zustand ${count("state")}, ohne Zeitlimit ${count("none")}, offen ${count("open")}.`,
    "",
    "| Effect | Datei | Urteil | Dauer | Text |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const r of rows) {
    lines.push(
      `| ${r.name} | ${r.file} | ${VERDICT_TEXT[r.verdict]} | ${r.seconds !== undefined ? `${r.seconds} s` : ""} | ${(r.quote ?? "").replaceAll("|", "\\|").replaceAll("\n", " ")} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}
