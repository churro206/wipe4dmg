// Effects of the exotic damage buffs by fixed rules (ADR 0015, U6-1; rules approved by the owner on
// 2026-10-22). One boss, no adds; play is optimal, so stacked buffs count at their highest stage.
// Court rows with a value come first, one verdict per row; without one, the texts of Compendium and
// Clarity decide. The first rule that matches wins:
// 1 the bonus cannot work on a boss (reflected projectiles, barricade, several enemies, low health)
// 2 the text describes damage of its own → later, like the other exotics with own damage
// 3 a kill or finisher triggers it → "prebuilt": active from 0 s for its duration, off by default;
//   without a duration the value is missing
// 4 a grenade, melee or super cast, an ability hit or the end of the super triggers it → rotation
//   (U6-1b); the class ability triggers it → U7
// 5 it needs another buff, e.g. Roaring Flames or Frost Armor → U6-2
// 6 the bonus names one ability: an ability of the model gets it the whole damage phase, otherwise gap
// 7 stacks per weapon hit → own model later
// 8 no text → gap

import {
  DamageSource,
  type AbilityKind,
  type ClarityEntry,
  type CompendiumEntry,
  type Effect,
  type Element,
  type ExoticArmorEffect,
  type ExoticArmorEntry,
  type MultiplierPart,
  type Source,
} from "../../src/data/schema.ts";
import { sameName } from "./exoticArmor.ts";

export type ExoticEffectInputs = {
  armor: ExoticArmorEntry[]; // exotic-armor.json
  compendium: CompendiumEntry[]; // tab Exotic Armors
  clarity: ClarityEntry[];
  abilities: { id: string; name: string; kind: AbilityKind }[]; // abilities.json
  sources: { court: Source; compendium: Source; clarity: Source };
};

export type ExoticEffectKind =
  | "always"
  | "preBuilt"
  | "missingDuration"
  | "notAgainstBoss"
  | "ownDamage"
  | "rotation"
  | "classAbility"
  | "needsEffect"
  | "abilityGap"
  | "hitStacks"
  | "noText";

/** One line of the review table docs/exotic-effects.md. */
export type ExoticEffectRow = {
  exoticArmorId: string;
  name: string;
  rule: number;
  kind: ExoticEffectKind;
  reason: string; // in German
  check: string; // Court against Compendium and Clarity
  effectId?: string; // for always and preBuilt
};

// Court rows: what triggers the buff, in this order
const NEEDS_EFFECT = /While (?:any stacks of|having an active)|Roaring Flame/i;
const CLASS_ABILITY = /Class Ability|Exiting Invisibility/i;
const ROTATION =
  /\bSuper\b|\bRift\b|Well of Radiance|Grenade|Ability Damage hit|Shield Throw|Melee hit/i;
const KILL = /\bkill(?:s|ing)?\b|\bFinish/i;
// A debuff whose element follows the equipped super, e.g. Chromatic Fire
const SUPER_DEPENDENT = /based on the equipped Super/i;

// Texts without a Court value
const NOT_AGAINST_BOSS =
  /Reflected Projectiles deal|damage towards|within \d+ met(?:re|er)s of \d+ enemies|below \d+% Health|at Critical Health|Noble Seekers/i;
const OWN_DAMAGE = /\bDoT\b|are dealt (?:increasingly )?/i;
const HIT_STACKS =
  /Hits? against (?:a )?Combatants?:?\s+grants? (?:a )?stacks?|increased damage every [\d.]+ seconds/i;
// The nearest trigger before the bonus decides; on the same end, the first kind of the list wins.
const TEXT_TRIGGERS: [RegExp, "rotation" | "classAbility" | "kill"][] = [
  [
    // stacks built inside an ability, e.g. "Hits and Kills during Stormtrance grant a stack"
    /On Super Cast|Super Ability Cast|Casting your Super|On (?:Grenade|Melee)[^:.\n]{0,40}(?:Usage|Cast)|\bHits and Kills\b/g,
    "rotation",
  ],
  [/On Class Ability Usage/gi, "classAbility"],
  // "a kill, or upon being not receiving damage": the kill is not needed
  [
    /\b(?:Kills?|Killing|Finisher)\b(?!,? or (?:upon )?(?:being )?not (?:taking|receiving) damage)/gi,
    "kill",
  ],
];
// Subjects that name no ability, e.g. "Weapons receive 15% increased damage"
const GENERIC_SUBJECT = /^(?:weapons?|damage buff)$/i;
// Bonuses only for heat weapons do not count: no heat weapon in the import (ADR 0015)
const HEAT = /\bHeat\b/;
const DURATION = /for (\d+(?:\.\d+)?) seconds/i;
const SUPER_ELEMENT =
  /While an? (Arc|Solar|Void|Stasis|Strand) Super Ability is equipped/i;
const ELEMENT = /\b(Arc|Solar|Void|Stasis|Strand)\b/i;
const ABILITY_SOURCES: [RegExp, DamageSource][] = [
  [/\bgrenade/i, "grenade"],
  [/\bsuper\b/i, "super"],
  [/\bclass\b/i, "classAbility"],
];

const MS_PER_SECOND = 1000;
const PERCENT = 100;
// in this order, so 14 % gives exactly 1.14
const factorOf = (percent: number) => (PERCENT + percent) / PERCENT;

const numbers = (text: string, unit: string) =>
  [
    ...text
      .replace(/\[[^\]]*\]/g, "")
      .matchAll(new RegExp(String.raw`(\d+(?:\.\d+)?)${unit}`, "g")),
  ].map((m) => Number(m[1]));

const elementOf = (text: string): Element | undefined =>
  ELEMENT.exec(text)?.[1].toLowerCase() as Element | undefined;

const flat = (text: string) => text.replace(/\s+/g, " ").trim();

type Verdict = Omit<ExoticEffectRow, "exoticArmorId" | "name" | "effectId"> & {
  part?: MultiplierPart;
  durationMs?: { value: number; source: Source };
};

/** Court against the quoted bonuses of the texts. */
function courtCheck(percent: number, entry: ExoticArmorEntry): string {
  if (entry.bonuses.length === 0) return "nur Court";
  const quoted = entry.bonuses.map((b) => b.percent);
  return quoted.includes(percent)
    ? `Court = Text (${percent} %)`
    : `Abweichung: Court ${percent} %, Text ${[...new Set(quoted)].join(" / ")} %`;
}

function courtVerdict(
  row: ExoticArmorEntry["courtBuffs"][number],
  entry: ExoticArmorEntry,
  text: string,
  court: Source,
): Verdict {
  const trigger = flat(row.trigger);
  const value = `${flat(row.pve ?? "")} für ${flat(row.pveDuration ?? "")}`;
  const percent = Math.max(...numbers(row.pve ?? "", "%"));
  const check = courtCheck(percent, entry);
  if (NEEDS_EFFECT.test(trigger))
    return {
      rule: 5,
      kind: "needsEffect",
      reason: `braucht einen anderen Buff („${trigger}“), U6-2`,
      check,
    };
  if (CLASS_ABILITY.test(trigger))
    return {
      rule: 4,
      kind: "classAbility",
      reason: `Auslöser Class Ability („${trigger}“), U7`,
      check,
    };
  if (ROTATION.test(trigger) || SUPER_DEPENDENT.test(text))
    return {
      rule: 4,
      kind: "rotation",
      reason: `Auslöser in der Rotation („${trigger}“${SUPER_DEPENDENT.test(text) ? "; Debuff hängt vom Element des Supers ab" : ""}), U6-1b`,
      check,
    };
  if (!KILL.test(trigger))
    return {
      rule: 8,
      kind: "noText",
      reason: `Auslöser unklar („${trigger}“)`,
      check,
    };
  const durations = numbers(row.pveDuration ?? "", "s");
  if (durations.length === 0)
    return {
      rule: 3,
      kind: "missingDuration",
      reason: `Kill-Buff ohne Dauer in Court (${value}; „${trigger}“)`,
      check,
    };
  // Court lists the stages in rising order; the duration of the highest stage comes last
  const seconds = durations[durations.length - 1];
  const element = row.bucketId === "surge" ? elementOf(trigger) : undefined;
  const source: Source = {
    ...court,
    name: `Court Stacking Guide (${row.bucketId}, PvE ${flat(row.pve ?? "")}, ${flat(row.pveDuration ?? "")})`,
    note: `„${trigger}“; prebuilt before the damage phase at the highest stage (ADR 0015)`,
  };
  return {
    rule: 3,
    kind: "preBuilt",
    reason: `vorher aufgebaut: ${row.bucketId} +${percent} % für ${seconds} s („${trigger}“)`,
    check,
    part: {
      type: "multiplier",
      bucketId: row.bucketId,
      multiplier: { value: factorOf(percent), source },
      damageSources:
        row.bucketId === "debuff" ? [...DamageSource.options] : ["weapon"],
      ...(element ? { elements: [element] } : {}),
    },
    durationMs: { value: seconds * MS_PER_SECOND, source },
  };
}

/** Who a bonus says it names, e.g. "Hellion Projectiles" or "Enhanced Tripmine Grenades"; "" if none. */
function subjectOf(text: string, quote: string, index: number): string {
  const before = text.slice(0, index);
  const start = Math.max(
    ...[...before.matchAll(/\.(?!\d)|\n/g)].map((m) => m.index + 1),
    0,
  );
  // "Diamond Lance damage is increased by 144%" names its subject inside the quote
  const inQuote = /^([A-Za-z][A-Za-z ]*?)\s+damage (?:is )?increased/i.exec(
    quote,
  );
  const clean = (s: string) =>
    flat(
      s
        .split(":")
        .pop()!
        .replace(
          /x\d+\s*[=|]?|\d+(?:\.\d+)?%|\[[^\]]*\]|[•|=?]|\b(?:deals?|receive|grants?)\b/gi,
          "",
        ),
    ).replace(GENERIC_SUBJECT, "");
  const subject = clean(before.slice(start) + (inQuote ? inQuote[1] : ""));
  if (subject !== "") return subject;
  // a heading line above, e.g. "Enhanced Tripmine Grenades"
  const heading = before.slice(0, start).trimEnd().split("\n").pop() ?? "";
  return /%|\.$/.test(heading) ? "" : clean(heading);
}

/** Ability whose name the subject names, e.g. Tripmine Grenade in "Enhanced Tripmine Grenades". */
function abilityOf(
  subject: string,
  abilities: ExoticEffectInputs["abilities"],
): ExoticEffectInputs["abilities"][number] | undefined {
  const singular = (s: string) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/s$/, ""))
      .join(" ");
  return abilities.find((a) => singular(subject).includes(singular(a.name)));
}

function textVerdict(
  entry: ExoticArmorEntry,
  text: string,
  inputs: ExoticEffectInputs,
): Verdict {
  const compendium = entry.bonuses.filter((b) => b.source === "compendium" && !b.melee);
  const clarity = entry.bonuses.filter((b) => b.source === "clarity" && !b.melee);
  const max = (list: typeof entry.bonuses) =>
    list.length ? `${Math.max(...list.map((b) => b.percent))} %` : "–";
  const check = `Compendium ${max(compendium)}, Clarity ${max(clarity)}`;
  if (text.trim() === "")
    return { rule: 8, kind: "noText", reason: "kein Text in Compendium oder Clarity", check };
  const notAgainstBoss = NOT_AGAINST_BOSS.exec(text);
  if (notAgainstBoss)
    return {
      rule: 1,
      kind: "notAgainstBoss",
      reason: `wirkt nicht gegen einen Boss („${notAgainstBoss[0]}“)`,
      check,
    };
  const own = OWN_DAMAGE.exec(text);
  if (own)
    return { rule: 2, kind: "ownDamage", reason: `eigener Schaden („${own[0].trim()}“), später`, check };
  const stacks = HIT_STACKS.exec(text);
  if (stacks)
    return {
      rule: 7,
      kind: "hitStacks",
      reason: `Stapel pro Waffentreffer („${stacks[0]}“), eigenes Modell später`,
      check,
    };

  const indexOf = (quote: string) => {
    const index = text.indexOf(quote);
    return index < 0 ? text.length : index;
  };
  const lineOf = (quote: string) => {
    const index = indexOf(quote);
    return text.slice(text.lastIndexOf("\n", index) + 1, text.indexOf("\n", index) >>> 0);
  };
  const usable = entry.bonuses.filter((b) => !b.melee && !HEAT.test(lineOf(b.quote)));
  const subjects = usable
    .map((b) => subjectOf(text, b.quote, indexOf(b.quote)))
    .filter((s) => s !== "");
  const unknown = subjects.find((s) => !abilityOf(s, inputs.abilities));
  if (usable.length === 0 || unknown !== undefined)
    return {
      rule: 6,
      kind: "abilityGap",
      reason:
        unknown !== undefined
          ? `Bonus nur für „${unknown}“, nicht im Modell`
          : "nur Melee-Boni, Melee-Bucket in U6-4",
      check,
    };
  const bonus = usable.reduce((a, b) => (b.percent > a.percent ? b : a));
  const index = indexOf(bonus.quote);
  const ability = subjects.length ? abilityOf(subjects[0], inputs.abilities) : undefined;

  const end = (m: RegExpMatchArray) => m.index! + m[0].length;
  const trigger = TEXT_TRIGGERS.flatMap(([pattern, kind]) =>
    [...text.slice(0, index).matchAll(pattern)].map((m) => ({ kind, match: m })),
  ).sort((a, b) => end(b.match) - end(a.match))[0];
  if (trigger?.kind === "rotation")
    return {
      rule: 4,
      kind: "rotation",
      reason: `Auslöser in der Rotation („${trigger.match[0]}“), U6-1b`,
      check,
    };
  if (trigger?.kind === "classAbility")
    return {
      rule: 4,
      kind: "classAbility",
      reason: `Auslöser Class Ability („${trigger.match[0]}“), U7`,
      check,
    };

  const sources: DamageSource[] = ability
    ? [ability.kind]
    : ABILITY_SOURCES.filter(([p]) => p.test(bonus.quote)).map(([, s]) => s);
  const damageSources: DamageSource[] =
    sources.length > 0
      ? sources
      : /\bability\b/i.test(bonus.quote)
        ? ABILITY_SOURCES.map(([, s]) => s)
        : ["weapon"];
  const element =
    elementOf(bonus.quote) ??
    (damageSources.includes("super")
      ? (SUPER_ELEMENT.exec(text)?.[1].toLowerCase() as Element | undefined)
      : undefined);
  const source: Source = {
    ...inputs.sources[bonus.source],
    note: `„${bonus.quote}“; bucket ${entry.bonusBucket!.bucketId} (${entry.bonusBucket!.basis}); highest stage (optimal play)`,
  };
  const part: MultiplierPart = {
    type: "multiplier",
    bucketId: entry.bonusBucket!.bucketId,
    multiplier: { value: factorOf(bonus.percent), source },
    damageSources,
    ...(element ? { elements: [element] } : {}),
    ...(ability ? { abilityIds: [ability.id] } : {}),
  };
  const target = `${damageSources.join(", ")}${element ? ` (${element})` : ""}${ability ? `, nur ${ability.name}` : ""}`;
  if (trigger?.kind !== "kill")
    return {
      rule: 6,
      kind: "always",
      reason: `immer aktiv: +${bonus.percent} % auf ${target}`,
      check,
      part,
    };
  const duration = DURATION.exec(text.slice(trigger.match.index));
  if (!duration)
    return {
      rule: 3,
      kind: "missingDuration",
      reason: `Kill-Buff ohne Dauer im Text („${trigger.match[0]}“)`,
      check,
    };
  const seconds = Number(duration[1]);
  return {
    rule: 3,
    kind: "preBuilt",
    reason: `vorher aufgebaut: +${bonus.percent} % auf ${target} für ${seconds} s („${trigger.match[0]}“ … „${duration[0]}“)`,
    check,
    part,
    durationMs: {
      value: seconds * MS_PER_SECOND,
      source: { ...source, note: `„${duration[0]}“ after „${trigger.match[0]}“; prebuilt before the damage phase (ADR 0015)` },
    },
  };
}

/** Review rows of all damage buffs and the effects of those that are always active or prebuilt. */
export function exoticEffects(inputs: ExoticEffectInputs): {
  rows: ExoticEffectRow[];
  effects: ExoticArmorEffect[];
} {
  const rows: ExoticEffectRow[] = [];
  const effects: ExoticArmorEffect[] = [];
  for (const entry of inputs.armor.filter((e) => e.kind === "damageBuff")) {
    const text = [
      ...inputs.compendium.filter((c) => sameName(c.name, entry.name)).map((c) => c.text),
      ...inputs.clarity
        .filter((c) => c.itemName !== null && sameName(c.itemName, entry.name))
        .map((c) => c.text),
    ].join("\n");
    const valued = entry.courtBuffs.filter((b) => b.pve !== null && b.pve.trim() !== "");
    const verdicts =
      valued.length > 0
        ? valued.map((row) => courtVerdict(row, entry, text, inputs.sources.court))
        : [textVerdict(entry, text, inputs)];
    for (const { part, durationMs, ...verdict } of verdicts) {
      const row: ExoticEffectRow = { exoticArmorId: entry.id, name: entry.name, ...verdict };
      if (part && (verdict.kind === "always" || verdict.kind === "preBuilt")) {
        const count = effects.filter((e) => e.exoticArmorId === entry.id).length;
        const effect: Effect = {
          id: `exotic-armor:${entry.id}${count > 0 ? `-${count + 1}` : ""}`,
          name: entry.name,
          code: entry.hash, // not part of build links; the exotic itself is
          shortName: entry.name,
          providers: [{ kind: "armor", slot: "exotic" }],
          parts: [part],
          ...(durationMs ? { durationMs } : {}),
        };
        effects.push({ exoticArmorId: entry.id, activation: verdict.kind, effect });
        row.effectId = effect.id;
      }
      rows.push(row);
    }
  }
  return { rows, effects };
}

const KIND_TITLES: [ExoticEffectKind, string][] = [
  ["always", "Immer aktiv (Regel 6)"],
  ["preBuilt", "Vorher aufgebaut, Option (Regel 3)"],
  ["missingDuration", "Kill-Buff ohne Dauer (Regel 3)"],
  ["rotation", "Auslöser in der Rotation, U6-1b (Regel 4)"],
  ["classAbility", "Auslöser Class Ability, U7 (Regel 4)"],
  ["needsEffect", "Braucht einen anderen Buff, U6-2 (Regel 5)"],
  ["abilityGap", "Ability nicht im Modell (Regel 6)"],
  ["hitStacks", "Stapel pro Waffentreffer, später (Regel 7)"],
  ["notAgainstBoss", "Wirkt nicht gegen einen Boss (Regel 1)"],
  ["ownDamage", "Eigener Schaden, später (Regel 2)"],
  ["noText", "Lücke (Regel 8)"],
];

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Review table docs/exotic-effects.md (ADR 0015, U6-1). */
export function renderExoticEffects(rows: ExoticEffectRow[]): string {
  const lines = [
    "# Prüftabelle Exotic-Effekte",
    "",
    "Erzeugt von `npm run build:armor` (ADR 0015, U6-1), nicht von Hand bearbeiten.",
    "Quellen: Court's Stacking Guide, Compendium „Exotic Armors“, Clarity. Ein Boss, keine Adds; Stufen zählen mit dem höchsten Wert (optimal gespielt).",
    "Gegenprobe: Court-Wert gegen die Werte aus Compendium und Clarity.",
    "",
    "| Art | Zeilen |",
    "| --- | --- |",
    ...KIND_TITLES.map(
      ([kind, title]) => `| ${title} | ${rows.filter((r) => r.kind === kind).length} |`,
    ),
  ];
  for (const [kind, title] of KIND_TITLES) {
    const own = rows.filter((r) => r.kind === kind);
    if (own.length === 0) continue;
    lines.push(
      "",
      `## ${title}`,
      "",
      "| Exotic | Regel | Grund | Gegenprobe |",
      "| --- | --- | --- | --- |",
      ...own.map(
        (r) => `| ${cell(r.name)} | ${r.rule} | ${cell(r.reason)} | ${cell(r.check)} |`,
      ),
    );
  }
  return lines.join("\n") + "\n";
}
