// Keyword sources from the Compendium subclass texts (ADR 0015, U4b): who applies which keyword, by
// fixed rules per sentence. U5 attaches the ability hits to the abilities, U6 the hit filters to the
// generated effects. One boss without adds: kills never happen in the damage phase; a kill buff with
// a duration can be built up before it (ADR 0015).

import type {
  CompendiumEntry,
  DamageSource,
  Element,
  KeywordId,
} from "../../src/data/schema.ts";

export type KeywordSourceKind =
  | "abilityHit" // the ability applies it with its own hits (U5)
  | "hitFilter" // an aspect or fragment applies it to the named hits (U6)
  | "preBuilt" // a kill buff with a duration, optional before the damage phase
  | "kill" // a kill trigger without duration: never in the damage phase
  | "classAbility" // class ability usage as trigger (U7)
  | "ownDamage" // damage of the aspect or fragment itself (later)
  | "definition"; // glossary text of the keyword

export type KeywordSource = {
  tab: string;
  section: string;
  name: string;
  keywordId: KeywordId;
  stacks: number | null; // scorch or bolt charge stacks
  kind: KeywordSourceKind;
  filter: { elements: Element[]; damageSources: DamageSource[] } | null;
  durationSeconds: number | null; // of a kill buff built up before the phase
  quote: string;
};

const KEYWORD_NAMES: Record<string, KeywordId> = {
  scorch: "ignition",
  scorching: "ignition",
  jolt: "jolt",
  volatile: "volatile",
  unravel: "unravel",
  unraveling: "unravel",
};
// "inflicts x60+30 Scorch", "inflicting Jolt", "applies Unravel"
const APPLIES =
  /\b(?:inflict(?:s|ing)?|appl(?:y|ies|ying))\s+(?:x(\d+)\+\d+\s+)?(Scorch|Jolt|Volatile|Unravel)\b/i;
// "Grants x4 Bolt Charge"
const BOLT_CHARGE = /\bgrants?\s+x(\d+)\s+Bolt Charge\b/i;
// "grant Volatile Rounds to Void Weapons for 11.25 [7.5] seconds"
const ROUNDS =
  /\bgrants?\s+(Volatile|Unraveling|Scorching)\s+Rounds\s+to\s+(\w+)\s+Weapons\b/i;
const DURATION = /\bfor\s+(\d+(?:\.\d+)?)\s*(?:\[[^\]]*\]\s*)?seconds?\b/i;
// Not an application: a condition for something else, or the cooldown before applying again.
const NOT_APPLYING =
  /\b(?:upon|when|after)\s+inflicting\b|\bbefore being able to (?:inflict|apply)\b/i;
const KILL =/\b(?:kills?|killing|killed|finishers?|final blows?|defeat)\b/i;
const CLASS_ABILITY = /\bclass ability usage\b|\bon class ability\b/i;
const ABILITY_SECTIONS = /^(Grenade|Melee|Super|Class) Abilities$/;
const ELEMENTS: Element[] = ["arc", "solar", "void", "stasis", "strand", "kinetic"];
// The hits a sentence names before its verb, e.g. "Arc Grenades", "Void Ability Damage".
const SUBJECT =
  /^(Arc|Solar|Void|Stasis|Strand|Kinetic)?\s*(Grenade Ability Damage|Grenades?|Melee(?: Ability)?(?: Damage| Hits?)?|Super(?: Ability)?(?: Damage)?|Ability Damage|Weapons?(?: Hits?| Damage)?)\b/i;
const ABILITY_DAMAGE: DamageSource[] = [
  "grenade",
  "melee",
  "super",
  "classAbility",
];

function sourcesOf(word: string): DamageSource[] {
  const w = word.toLowerCase();
  if (w.startsWith("grenade")) return ["grenade"];
  if (w.startsWith("melee")) return ["melee"];
  if (w.startsWith("super")) return ["super"];
  if (w.startsWith("weapon")) return ["weapon"];
  return ABILITY_DAMAGE;
}

const elementOf = (word: string | undefined): Element[] =>
  word ? ELEMENTS.filter((e) => e === word.toLowerCase()) : [];

/** Sentences with the last header line before them, e.g. "On Class Ability Usage:". */
function sentencesOf(text: string): { sentence: string; header: string }[] {
  const result: { sentence: string; header: string }[] = [];
  let header = "";
  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      header = "";
      continue;
    }
    if (line.trim().endsWith(":")) {
      header = line.trim();
      continue;
    }
    for (const sentence of line.split(/(?<=[.!])\s+/))
      result.push({ sentence, header });
  }
  return result;
}

/** All keyword sources in the entries, one per sentence and keyword. */
export function findKeywordSources(
  entries: CompendiumEntry[],
): KeywordSource[] {
  const result: KeywordSource[] = [];
  for (const entry of entries) {
    for (const { sentence, header } of sentencesOf(entry.text)) {
      if (NOT_APPLYING.test(sentence)) continue;
      const context = `${header} ${sentence}`;
      const found = [
        APPLIES.exec(sentence),
        BOLT_CHARGE.exec(sentence),
        ROUNDS.exec(sentence),
      ];
      for (const match of found) {
        if (!match) continue;
        const isRounds = match === found[2];
        const isBolt = match === found[1];
        const keywordId: KeywordId = isBolt
          ? "boltCharge"
          : KEYWORD_NAMES[(isRounds ? match[1] : match[2]).toLowerCase()];
        const stacks = isBolt
          ? Number(match[1])
          : !isRounds && match[1]
            ? Number(match[1])
            : null;
        const base = {
          tab: entry.tab,
          section: entry.section,
          name: entry.name,
          keywordId,
          stacks,
          filter: null,
          durationSeconds: null,
          quote: match[0],
        };
        const subject = SUBJECT.exec(sentence.slice(0, match.index).trim());
        const filter = isRounds
          ? { elements: elementOf(match[2]), damageSources: ["weapon" as const] }
          : subject
            ? {
                elements: elementOf(subject[1]),
                damageSources: sourcesOf(subject[2]),
              }
            : null;

        if (entry.section === "Glossary") {
          result.push({ ...base, kind: "definition" });
        } else if (KILL.test(context)) {
          const duration = DURATION.exec(sentence);
          result.push(
            duration
              ? {
                  ...base,
                  kind: "preBuilt",
                  filter,
                  durationSeconds: Number(duration[1]),
                }
              : { ...base, kind: "kill" },
          );
        } else if (CLASS_ABILITY.test(context)) {
          result.push({ ...base, kind: "classAbility" });
        } else if (ABILITY_SECTIONS.test(entry.section)) {
          result.push({ ...base, kind: "abilityHit" });
        } else if (filter) {
          result.push({ ...base, kind: "hitFilter", filter });
        } else {
          result.push({ ...base, kind: "ownDamage" });
        }
      }
    }
  }
  return result;
}

// ---------- review table ----------

const KIND_LABELS: Record<KeywordSourceKind, string> = {
  abilityHit: "Ability setzt es mit eigenen Treffern (U5)",
  hitFilter: "Aspect/Fragment setzt es auf genannte Treffer (U6)",
  preBuilt: "Kill-Buff mit Dauer: Option „vorher aufgebaut“",
  kill: "Kill ohne Dauer: feuert in der Damage Phase nie",
  classAbility: "Auslöser Class Ability (U7)",
  ownDamage:
    "Aspect/Fragment mit eigenem Schaden oder geänderter Ability, ohne genannten Treffer (U6 prüft)",
  definition: "Definition im Glossary",
};
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** The review table as Markdown. */
export function renderKeywordSources(sources: KeywordSource[]): string {
  const lines = [
    "# Keyword-Quellen: Prüftabelle",
    "",
    "Generiert von `npm run build:keywords` (ADR 0015, U4b), nicht von Hand bearbeiten.",
    "",
    "Quelle: Compendium-Subklassen-Reiter (`compendium-abilities.json`). Regel pro Satz: „inflict(s)/apply … Keyword“, „grants xN Bolt Charge“, „grant … Rounds to … Weapons“. Ein Boss, keine Adds: Kills feuern in der Damage Phase nie.",
    "",
    "| Art | Anzahl |",
    "| --- | --- |",
    ...(Object.keys(KIND_LABELS) as KeywordSourceKind[]).map(
      (kind) =>
        `| ${KIND_LABELS[kind]} | ${sources.filter((s) => s.kind === kind).length} |`,
    ),
  ];
  for (const kind of Object.keys(KIND_LABELS) as KeywordSourceKind[]) {
    const rows = sources.filter((s) => s.kind === kind);
    if (rows.length === 0) continue;
    lines.push(
      "",
      `## ${KIND_LABELS[kind]}`,
      "",
      "| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...rows.map((s) =>
        [
          s.tab,
          s.section,
          s.name,
          s.keywordId,
          s.stacks ?? "–",
          s.filter
            ? `${s.filter.elements.join(", ") || "alle Elemente"}: ${s.filter.damageSources.join(", ")}`
            : "–",
          s.durationSeconds === null ? "–" : `${s.durationSeconds} s`,
          `„${s.quote}“`,
        ]
          .map((c) => cell(String(c)))
          .join(" | ")
          .replace(/^/, "| ")
          .replace(/$/, " |"),
      ),
    );
  }
  return lines.join("\n") + "\n";
}
