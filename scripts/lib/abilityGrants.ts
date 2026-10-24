// Effects granted by abilities (block "Effekte durch Abilities", owner 2026-10-24): every line of an
// ability's Compendium text that names a buff or debuff gets a verdict. A line that grants an effect
// of the model (Radiant, Weaken) without a kill becomes an AbilityGrant: its window opens at each cast
// (or first hit, if the line names hits) and lasts the first number of "for N seconds" ("10+5": the
// +5 comes from Ember of Solace, "6 [2.5]": the bracket is PvP). Without a duration in the line, the
// Court row of the ability in the effect's sandbox group gives it (e.g. Twilight Arsenal, Weaken 6s).
// An ability whose own granted effect (grantsEffectIds) fills the same bucket keeps that effect, e.g.
// the Deadfall tether. Review table: docs/ability-grants.md.

import type {
  AbilityData,
  AbilityGrant,
  CompendiumEntry,
  CourtEntry,
  Effect,
  Source,
} from "../../src/data/schema.ts";

const URL = "https://destiny2.science/data-compendium";
const COURT_URL = "https://destiny2.science/court-sheet";

export type GrantInputs = {
  abilities: AbilityData[];
  compendium: CompendiumEntry[];
  court: CourtEntry[];
  effects: Effect[];
  retrieved: string; // date of the Compendium snapshot
  courtRetrieved: string;
};

// Court group listing the sources of an effect with their PvE duration.
const COURT_GROUP: Record<string, string> = { weaken: "WEAKEN SANDBOX SOURCES" };

// Effects of the model an ability can grant, by the word in the Compendium text.
const MODELLED: { word: RegExp; effectId: string }[] = [
  { word: /\bradiant\b/i, effectId: "radiant" },
  { word: /\bweaken(s|ed|ing)?\b/i, effectId: "weaken" },
];
// Buffs and debuffs without a damage part of their own: states, healing, keywords with their own model.
const NO_DAMAGE =
  /\b(amplified|frost armor|woven mail|overshield|devour|cure|restoration|invisib\w*|bolt charge|volatile rounds|unraveling rounds|suppression|disorient\w*|blind\w*|truesight)\b/i;

export type GrantVerdict =
  | "grant" // becomes an AbilityGrant
  | "kill" // needs a kill: one boss, no adds (ADR 0015)
  | "leave" // only after leaving the ability's aura, the player stays inside (Well of Radiance)
  | "heavyAttack" // only the super's heavy attack; Aegis plays light attacks (Spectral Blades)
  | "condition" // the effect is a condition of the line, not granted by it ("While Radiant:")
  | "noDuration" // granted, but the line gives no duration
  | "noDamage" // only states without a damage part of their own
  | "ownEffect"; // the ability grants the effect already through grantsEffectIds

export type GrantRow = {
  abilityId: string;
  abilityName: string;
  line: string;
  verdict: GrantVerdict;
  grant?: AbilityGrant;
};

const GRANT_VERB = /\b(grant|grants|granting|inflict|inflicts|inflicting|apply|applies|applying|bestow\w*)\b/i;
const DURATION =
  /\bfor (\d+(?:\.\d+)?)\??(?:\+\d+(?:\.\d+)?)?\s*(?:\[[^\]]*\])?\s*s(?:econds?)?\b/i;

export function abilityGrants(inputs: GrantInputs): { grants: AbilityGrant[]; rows: GrantRow[] } {
  const rows = inputs.abilities.flatMap((ability) => {
    if (!ability.compendium || ability.variantOf) return [];
    const entry = inputs.compendium.find(
      (e) => e.tab === ability.compendium?.tab && e.name === ability.compendium?.entry,
    );
    if (!entry) return [];
    return entry.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => MODELLED.some((m) => m.word.test(line)) || NO_DAMAGE.test(line))
      .flatMap((line) => linesOf(ability, line, inputs));
  });
  // one grant per ability and effect: the first line that grants it
  const grants = rows.flatMap((r, i) =>
    r.grant &&
    !rows
      .slice(0, i)
      .some((o) => o.grant?.abilityId === r.abilityId && o.grant.effectId === r.grant!.effectId)
      ? [r.grant]
      : [],
  );
  return { grants, rows };
}

const bucketsOf = (effect: Effect | undefined): string[] =>
  (effect?.parts ?? []).flatMap((p) => (p.type === "multiplier" ? [p.bucketId] : []));

function linesOf(ability: AbilityData, line: string, inputs: GrantInputs): GrantRow[] {
  const base = { abilityId: ability.id, abilityName: ability.name, line };
  const modelled = MODELLED.filter((m) => m.word.test(line));
  if (modelled.length === 0) return [{ ...base, verdict: "noDamage" }];
  const effectById = (id: string) => inputs.effects.find((e) => e.id === id);
  const ownBuckets = (ability.grantsEffectIds ?? []).flatMap((id) => bucketsOf(effectById(id)));
  return modelled.map(({ word, effectId }) => {
    if (bucketsOf(effectById(effectId)).some((b) => ownBuckets.includes(b)))
      return { ...base, verdict: "ownEffect" };
    if (/\bkill/i.test(line)) return { ...base, verdict: "kill" };
    if (/\bleaving\b/i.test(line)) return { ...base, verdict: "leave" };
    if (/^\[heavy attack\]/i.test(line)) return { ...base, verdict: "heavyAttack" };
    const granted =
      GRANT_VERB.test(line) || (effectId === "weaken" && /\bweaken(s|ed|ing)?\b/i.test(line));
    if (!granted || new RegExp(`^while ${word.source}`, "i").test(line))
      return { ...base, verdict: "condition" };
    const durationMs = durationOf(ability, effectId, line, inputs);
    if (!durationMs) return { ...base, verdict: "noDuration" };
    return {
      ...base,
      verdict: "grant",
      grant: {
        abilityId: ability.id,
        effectId,
        on: /\b(hit|hits|impact)\b/i.test(line) ? "hit" : "cast",
        durationMs,
      },
    };
  });
}

function durationOf(
  ability: AbilityData,
  effectId: string,
  line: string,
  inputs: GrantInputs,
): AbilityGrant["durationMs"] | undefined {
  const fromLine = DURATION.exec(line);
  if (fromLine) {
    const source: Source = {
      name: `Destiny Data Compendium, ${ability.compendium!.tab} (${ability.name})`,
      url: URL,
      retrieved: inputs.retrieved,
      status: "verified",
      quote: line,
      note: "Rule in scripts/lib/abilityGrants.ts: first number of \"for N seconds\" (without the bonus after \"+\" and the PvP value in brackets).",
    };
    return { value: Number(fromLine[1]) * 1000, source };
  }
  const row = inputs.court.find(
    (r) => r.group === COURT_GROUP[effectId] && r.name === ability.name && r.pveDuration,
  );
  const seconds = row && /^(\d+(?:\.\d+)?)s/.exec(row.pveDuration!);
  if (!row || !seconds) return undefined;
  return {
    value: Number(seconds[1]) * 1000,
    source: {
      name: `Court Stacking Guide (${row.group}, ${row.name})`,
      url: COURT_URL,
      retrieved: inputs.courtRetrieved,
      status: "verified",
      quote: `${row.trigger.replaceAll("\n", " ")} | ${row.pve} | ${row.pveDuration}`,
      note: `The Compendium line names no duration: "${line}"`,
    },
  };
}

const VERDICT_TEXT: Record<GrantVerdict, string> = {
  grant: "Effect pro Cast/Treffer",
  kill: "braucht einen Kill (ein Boss, keine Adds)",
  leave: "erst beim Verlassen der Aura (man bleibt drin)",
  heavyAttack: "nur Heavy Attack, Aegis spielt Light Attacks",
  condition: "Bedingung, nicht gewährt",
  noDuration: "ohne Dauer im Text",
  noDamage: "Zustand ohne eigenen Schaden",
  ownEffect: "eigener Effect der Ability belegt das Bucket schon (grantsEffectIds)",
};

export function renderGrants(rows: GrantRow[]): string {
  const lines = [
    "# Effekte durch Abilities",
    "",
    "Generiert mit `npm run build:grants` aus `compendium-abilities.json` (Regel in `scripts/lib/abilityGrants.ts`). Jede Zeile eines Ability-Texts, die einen Buff oder Debuff nennt, mit Urteil.",
    "",
    "| Ability | Urteil | Effect | Auslöser | Dauer | Zeile |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    const g = row.grant;
    lines.push(
      `| ${row.abilityName} | ${VERDICT_TEXT[row.verdict]} | ${g?.effectId ?? ""} | ${g?.on ?? ""} | ${g ? `${g.durationMs.value! / 1000} s` : ""} | ${row.line.replaceAll("|", "\\|")} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}
