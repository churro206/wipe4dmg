// Keyword sources from the Compendium subclass texts (ADR 0015, U4b): who applies which keyword, by
// fixed rules per sentence. U5 attaches the ability hits to the abilities, U6 the hit filters to the
// generated effects. One boss without adds: kills never happen in the damage phase; a kill buff with
// a duration can be built up before it (ADR 0015).

import type {
  AbilityData,
  AbilityKeyword,
  AegisAbilityRow,
  CompendiumEntry,
  DamageSource,
  Element,
  KeywordData,
  KeywordId,
  SuperTiming,
} from "../../src/data/schema.ts";

export type KeywordInputs = {
  compendium: CompendiumEntry[];
  abilities: AbilityData[];
  aegisRows: AegisAbilityRow[];
  keywords: KeywordData[];
  superTimings: SuperTiming[];
};

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
  emberStacks: number | null; // bonus stacks with Ember of Ashes, the "+20" in "x40+20"
  perShot: boolean; // the sentence says "per shot"
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
// "inflicts x60+30 Scorch", "apply up to x100+50 [x50+25] Scorch", "damage and x60+30 Scorch by
// scoring all 3 knives", "inflicting Jolt"; the number after "+" is the bonus of Ember of Ashes, the
// bracket the PvP value.
const APPLIES =
  /\b(?:inflict(?:s|ing)?|appl(?:y|ies|ying)|and(?=\s+x\d))\s+(?:up to\s+)?(?:x(\d+)\+(\d+(?:\.\d+)?)(?:\s*\[[^\]]*\])?\s+)?(Scorch|Jolt|Volatile|Unravel)\b/i;
const PER_SHOT = /\bper shot\b/i;
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
          : KEYWORD_NAMES[(isRounds ? match[1] : match[3]).toLowerCase()];
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
          emberStacks: !isBolt && !isRounds && match[2] ? Number(match[2]) : null,
          perShot: PER_SHOT.test(sentence),
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

// ---------- keywords of abilities (U5) ----------

export type AbilityKeywordGap = {
  abilityId: string;
  keywordId: KeywordId;
  reason: string;
};

const WIPE = /Wipe (\d+) \/ # (\d+) \/ Full Modifiers ([\d.]+)/;
const SHOTS = /\b(\d+) Shot\b/;
const EMBER = /^Ember of Ashes$/i;
// Name of a keyword's trigger in the Aegis ticks, e.g. "1592 ignition", "228 jolt".
const TICK_NAMES: Record<KeywordId, string> = {
  ignition: "ignition",
  jolt: "jolt",
  volatile: "volatile",
  unravel: "unravel",
  boltCharge: "bolt",
};

/**
 * Triggers of a keyword in one use of a super, as in the event run (keywordRun.ts). Its hits from
 * super-timings.json add stacks to a counter (Ignition) or damage taken (Jolt, Volatile: the wipe
 * spread evenly over the hits, the applying hit only if the keyword says so); past the threshold it
 * goes off and resets. During the cooldown no stacks land and a keyword removed on trigger is not
 * applied again. The value of one trigger is the keyword's own Aegis row.
 */
export function superTriggers(
  timing: SuperTiming,
  stacksPerHit: number,
  keyword: KeywordData,
  aegisRows: AegisAbilityRow[],
  wipe: number,
): { triggers: number; tick: number; note: string } | null {
  if (keyword.trigger.type === "playerStacks") return null;
  const threshold = keyword.trigger.threshold.value;
  const tick = Number(
    aegisRows.find((r) => r.id === keyword.aegisRowId)?.primaryTick,
  );
  const hits = timing.hits.value;
  const first = timing.firstHitMs.value;
  const interval = timing.hitIntervalMs.value;
  if (!threshold || !tick || !hits || first === null || interval === null)
    return null;
  const counter = keyword.trigger.type === "counter";
  const applyingHitCounts =
    keyword.trigger.type === "damageTaken" && keyword.trigger.applyingHitCounts;
  // A keyword removed on trigger (Volatile) is applied again by the next hit after the cooldown.
  const removed = counter || keyword.removedOnTrigger;
  const perHit = counter ? stacksPerHit : wipe / hits;
  const cooldown = keyword.cooldownMs?.value ?? 0;
  let active = false;
  let amount = 0;
  let triggers = 0;
  let blockedUntil = -Infinity;
  for (let hit = 0; hit < hits; hit++) {
    const timeMs = first + hit * interval;
    // stacks or a removed keyword do not land during the cooldown, damage taken still counts
    if (removed && timeMs < blockedUntil) continue;
    if (!active) {
      active = true;
      amount = 0;
      if (!counter && !applyingHitCounts) continue;
    }
    amount += perHit;
    if (amount >= threshold && timeMs >= blockedUntil) {
      triggers++;
      amount = 0;
      blockedUntil = timeMs + cooldown;
      if (removed) active = false;
    }
  }
  return triggers === 0
    ? null
    : {
        triggers,
        tick,
        note: `${hits} hits x${Math.round(perHit)} ${counter ? "stacks" : "damage"} every ${interval} ms, cooldown ${cooldown} ms -> ${triggers} trigger(s) of ${tick} (${keyword.aegisRowId})`,
      };
}

/**
 * The keywords each modelled ability applies with its hits, from its Compendium entry:
 * - stacks per use: the largest quoted stacks (a sentence "with all 9 drones" sums the hits); "per
 *   shot" times the shots of "N Shot".
 * - baked in the package: Aegis names keyword damage in the ticks ("1592 ignition"). How many
 *   triggers the measurement had follows from the stacks of its uses (with the Ember bonus if Aegis
 *   assumes Ember of Ashes): they add up, and each full counter is one trigger. No name in the
 *   ticks means no keyword damage in the package.
 */
export function abilityKeywords(inputs: KeywordInputs): {
  entries: AbilityKeyword[];
  gaps: AbilityKeywordGap[];
} {
  const sources = findKeywordSources(inputs.compendium).filter(
    (s) => s.kind === "abilityHit",
  );
  const entries: AbilityKeyword[] = [];
  const gaps: AbilityKeywordGap[] = [];
  for (const ability of inputs.abilities) {
    const ref = ability.compendium;
    if (!ref) continue;
    const own = sources.filter((s) => s.tab === ref.tab && s.name === ref.entry);
    const text =
      inputs.compendium.find((e) => e.tab === ref.tab && e.name === ref.entry)
        ?.text ?? "";
    const row = inputs.aegisRows.find((r) => r.id === ability.aegisRowId);
    for (const keywordId of [...new Set(own.map((s) => s.keywordId))]) {
      const keyword = inputs.keywords.find((k) => k.id === keywordId);
      if (!keyword) continue;
      const gap = (reason: string) =>
        gaps.push({ abilityId: ability.id, keywordId, reason });
      const withStacks = own
        .filter((s) => s.keywordId === keywordId && s.stacks !== null)
        .sort((a, b) => b.stacks! - a.stacks!);
      const needsStacks = keyword.trigger.type !== "damageTaken";
      if (needsStacks && withStacks.length === 0) {
        gap("Stapel ohne Zahl im Text");
        continue;
      }
      if (keyword.trigger.type === "damageTaken" && !keyword.durationMs) {
        gap("Dauer des Keywords hängt an der Quelle und fehlt im Text");
        continue;
      }
      // A super with several hits (super-timings.json) applies stacks with every hit if the
      // sentence says "per shot" or stands in the "Light Attack" paragraph, e.g. Daybreak x50 per
      // projectile (not Phoenix Dive x60). Burning Maul's cyclone (Heavy Attack) stays one per use.
      const timing = inputs.superTimings.find(
        (t) => t.abilityId === ability.id && !t.exoticArmorId,
      );
      const hits = timing?.hits.value ?? 1;
      const lightAttack = text
        .split(/\n\s*\n/)
        .filter((p) => p.trimStart().startsWith("Light Attack"));
      const perHitSource = withStacks.find(
        (s) => s.perShot || lightAttack.some((p) => p.includes(s.quote)),
      );
      const perHit = hits > 1 && perHitSource !== undefined;
      const chosen =
        (perHit ? perHitSource : withStacks[0]) ??
        own.find((s) => s.keywordId === keywordId)!;
      const shots = perHit
        ? hits
        : chosen.perShot
          ? Number(SHOTS.exec(text)?.[1] ?? 1)
          : 1;
      const source = {
        name: `Destiny Data Compendium, ${ref.tab} (${ref.entry})`,
        url: "https://destiny2.science/data-compendium",
        retrieved: "2026-10-21",
        status: "unverified" as const,
        quote: chosen.quote,
        note: perHit
          ? `First quoted stacks per hit times ${hits} hits (super-timings.json)`
          : shots > 1
            ? `Per shot times ${shots} shots ("${shots} Shot")`
            : "Largest quoted stacks of the entry, as one hit per use",
      };
      const entry: AbilityKeyword = {
        abilityId: ability.id,
        keywordId,
        ...(needsStacks
          ? { stacksPerUse: { value: chosen.stacks! * shots, source } }
          : {}),
        source,
      };

      const tickName = TICK_NAMES[keywordId];
      const tick = row
        ? new RegExp(`\\b(\\d+) ${tickName}\\b`, "i").exec(row.secondaryTicks)
        : null;
      const wipe = row ? WIPE.exec(row.perUseStat100.source.note ?? "") : null;
      if (row && tick && wipe) {
        const uses = Number(wipe[2]);
        if (keyword.trigger.type !== "counter" || !keyword.trigger.threshold.value) {
          gap(`Aegis rechnet ${tickName} ein, Anzahl der Auslösungen unbekannt`);
          continue;
        }
        const ember = row.assumptions.some((a) => EMBER.test(a));
        const perUse =
          (chosen.stacks! + (ember ? (chosen.emberStacks ?? 0) : 0)) * shots;
        let stacks = 0;
        let triggers = 0;
        for (let use = 0; use < uses; use++) {
          stacks += perUse;
          if (stacks >= keyword.trigger.threshold.value) {
            triggers++;
            stacks = 0;
          }
        }
        if (triggers === 0) {
          gap(`Aegis rechnet ${tickName} ein, die Stapel reichen laut Text nicht`);
          continue;
        }
        entry.bakedInPackage = {
          triggers,
          tick: Number(tick[1]),
          uses,
          fullModifiers: Number(wipe[3]),
          note: `${uses} uses x${perUse} stacks${ember ? " (with Ember of Ashes)" : ""} -> ${triggers} trigger(s) in Aegis row ${row.id}`,
        };
      } else if (row && wipe && timing) {
        // A super row names no ticks, but its measurement holds the triggers of its hits: replay the
        // hits with the keyword cooldown, and take the trigger value from the keyword's own Aegis row.
        // Stacks per hit as the engine spreads them: once per use is spread over the hits.
        const baked = superTriggers(
          timing,
          (((chosen.stacks ?? 0) +
            (row.assumptions.some((a) => EMBER.test(a)) ? (chosen.emberStacks ?? 0) : 0)) *
            shots) /
            hits,
          keyword,
          inputs.aegisRows,
          Number(wipe[1]),
        );
        if (baked)
          entry.bakedInPackage = {
            ...baked,
            uses: 1,
            fullModifiers: Number(wipe[3]),
            note: `${baked.note} in Aegis row ${row.id}`,
          };
      }
      entries.push(entry);
    }
  }
  return { entries, gaps };
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

/** The review table as Markdown, with the keywords of the abilities (U5). */
export function renderKeywordSources(
  sources: KeywordSource[],
  abilities: { entries: AbilityKeyword[]; gaps: AbilityKeywordGap[] },
): string {
  return `${renderSources(sources)}${renderAbilityKeywords(abilities)}`;
}

function renderAbilityKeywords({
  entries,
  gaps,
}: {
  entries: AbilityKeyword[];
  gaps: AbilityKeywordGap[];
}): string {
  const lines = [
    "",
    "## Keywords der Abilities (U5)",
    "",
    "Stapel pro Einsatz: größte genannte Zahl des Eintrags („with all 9 drones“), „per shot“ mal Shots. Im Aegis-Paket eingerechnet: Aegis nennt den Keyword-Schaden in den Ticks; die Zahl der Auslösungen folgt aus den Stapeln aller Einsätze der Messung (mit Ember-Bonus, wenn Aegis Ember of Ashes annimmt). Beim Laden wird dieser Schaden aus dem Paket herausgerechnet, der Keyword-Lauf fügt ihn wieder hinzu.",
    "",
    "| Ability | Keyword | Stapel pro Einsatz | Im Paket eingerechnet | Zitat |",
    "| --- | --- | --- | --- | --- |",
    ...entries.map(
      (e) =>
        `| ${e.abilityId} | ${e.keywordId} | ${e.stacksPerUse?.value ?? "–"} | ${
          e.bakedInPackage
            ? cell(
                `${e.bakedInPackage.triggers} × ${e.bakedInPackage.tick} (${e.bakedInPackage.note})`,
              )
            : "–"
        } | „${cell(e.source.quote ?? "")}“ |`,
    ),
    "",
    "### Lücken",
    "",
    "| Ability | Keyword | Grund |",
    "| --- | --- | --- |",
    ...gaps.map((g) => `| ${g.abilityId} | ${g.keywordId} | ${g.reason} |`),
  ];
  return lines.join("\n") + "\n";
}

function renderSources(sources: KeywordSource[]): string {
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
