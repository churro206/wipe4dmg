// Effects of the aspects and fragments by fixed rules (ADR 0015, U6-2; rules approved by the owner on
// 2026-10-22). One effect per window kind of an aspect or fragment; several rules may apply:
// A a Court row with a value → like the exotics (prebuilt kill buff, window from the rotation, U7)
// B "Scorch Stacks inflicted are increased by 50%" → counter modifier, e.g. Ember of Ashes
// C keyword sources of U4b: on named hits → keyword part; rounds after kills → prebuilt
// D "Powered Melee Hits grant Radiant for 8 seconds" → the parts of Radiant in a window per hit
// E grants a state (Amplified, Frost Armor, …) → kept the whole damage phase (optimal play); from
//   kills only → prebuilt with the duration of the text
// F quoted bonuses: melee → bucket melee (additive); grenade/super/Light Abilities → bucket
//   aspectBonus; not on a boss → none; others → later (no source for the bucket)
// G no effect from A to E, but Aegis measured an ability with it (base row plus only such items, e.g.
//   Blade Barrage with Knock 'Em Down) → an effect that selects the ability variant
// H Aegis measured damage of its own in the tab Sustained (type "tick", e.g. Storm's Keep, Hellion)
//   → damage at the measured rate the whole damage phase, from the row with the fewest assumptions;
//   the measurement replaces the open rows of the item (no damage, class ability, keyword later)
// Without any of that: no damage.

import type {
  AbilityData,
  AegisAbilityRow,
  AegisTotalRow,
  CompendiumEntry,
  CourtEntry,
  DamageSource,
  Effect,
  EffectPart,
  Element,
  EffectProvider,
  ManifestSubclassItem,
  Source,
  StatusId,
} from "../../src/data/schema.ts";
import {
  BUCKET_OF_CATEGORY,
  bonusQuotes,
  kebab,
  sameName,
} from "./exoticArmor.ts";
import { courtVerdict, STATUS_NAMES, type Verdict } from "./exoticEffects.ts";
import type { KeywordSource } from "./keywordSources.ts";
import { subclassItemNamed } from "./manifestAbilities.ts";
import { nameKey, variantRows } from "../../src/engine/abilityVariants.ts";

export type SubclassEffectInputs = {
  compendium: CompendiumEntry[]; // subclass tabs
  subclassItems: ManifestSubclassItem[];
  court: CourtEntry[];
  keywordSources: KeywordSource[]; // findKeywordSources over the same entries
  effects: Effect[]; // effects.json: Radiant, Weaken, Well, and the effects kept there
  reservedIds: string[]; // effects of buff-effects.json, e.g. the fireteam Banner of War
  abilities: (Pick<AbilityData, "id" | "name" | "kind"> &
    Partial<Pick<AbilityData, "package" | "aegisRowId">>)[];
  aegisRows: AegisAbilityRow[]; // rule G: rows of the abilities with an aspect or fragment
  aegisTotals: AegisTotalRow[]; // rule H: tab Sustained
  meleeNames: string[];
  sources: { court: Source; compendium: Source; clarity: Source; aegisTotals: Source };
  codes: Record<string, number>; // effect-codes.json: codes once given stay
};

export type SubclassEffectKind =
  | "always"
  | "preBuilt"
  | "triggered"
  | "missingDuration"
  | "rotation"
  | "classAbility"
  | "keywordLater"
  | "notAgainstBoss"
  | "bonusLater"
  | "abilityVariant"
  | "ownDamage"
  | "noText"
  | "noDamage";

export type SubclassEffectRow = {
  id: string;
  name: string; // manifest name, e.g. "Ember of Ashes"
  subclasses: string; // e.g. "solar, prismatic"
  rule: string; // A to F
  kind: SubclassEffectKind;
  reason: string; // in German
  check: string;
  effectId?: string;
};

export type GeneratedSubclassEffect = {
  subclassItemId: string;
  activation: "always" | "preBuilt";
  effect: Effect;
};

const COUNTER = /Scorch Stacks inflicted are increased by (\d+(?:\.\d+)?)%/i;
const GRANTS_EFFECT =
  /\b(Powered Melee|[A-Z][\w ]*?) Hits grant (Radiant) for (\d+(?:\.\d+)?)/;
const GRANT_VERB = String.raw`\b(?:grants?|granting|bestowing|gains?|generates?)\b[^.\n]{0,60}?`;
const KILL_WORD = /\bKills?\b|\bFinishers?\b|\bKilling\b/;
const STATUS_DURATION = /for (\d+(?:\.\d+)?)(?:\+[\d.]+)? seconds/i;
const NOT_ON_BOSS =
  /towards it|against Stasis Crystals|Frozen Enemies|from Guardians|towards Assault/i;
const DAMAGE_WORD =
  /damage|weaken|radiant|surge|amplif|empower|volatile|jolt|scorch|ignit|unravel|bolt charge/i;
const MS_PER_SECOND = 1000;
const PERCENT = 100;
const factorOf = (percent: number) => (PERCENT + percent) / PERCENT;
const flat = (text: string) => text.replace(/\s+/g, " ").trim();
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type BonusScope = {
  bucketId: string;
  damageSources: DamageSource[];
  elements?: Element[];
};
const MELEE_SCOPE: BonusScope = { bucketId: "melee", damageSources: ["melee"] };

/** Scope of a bonus on grenades and supers: "Grenade and Super Ability Damage", "Light Abilities". */
function abilityScope(sentence: string, tab: string): BonusScope | null {
  const light = /\bLight Abilities\b/i.test(sentence);
  if (!light && !(/\bgrenade\b/i.test(sentence) && /\bsuper\b/i.test(sentence))) return null;
  const element = tab.toLowerCase() as Element;
  return {
    bucketId: "aspectBonus",
    damageSources: light ? ["grenade", "melee", "super"] : ["grenade", "super"],
    elements: light ? ["arc", "solar", "void"] : tab === "Prismatic" ? undefined : [element],
  };
}

/** Sentences of a text with the heading line above them, e.g. "While Radiant:". */
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
    for (const sentence of line.split(/\.(?!\d)\s*/))
      if (sentence.trim()) result.push({ sentence: sentence.trim(), header });
  }
  return result;
}

type Found = Pick<SubclassEffectRow, "rule" | "kind" | "reason" | "check"> & {
  parts?: EffectPart[];
  grantsStatus?: StatusId[];
  durationMs?: Effect["durationMs"];
  trigger?: Effect["trigger"];
  suffix?: string; // name of the effect after the item, e.g. "(Radiant)"
};

const fromCourt = (verdict: Verdict): Found => ({
  rule: "A",
  // a Court trigger without a rule stays open in the rotation, e.g. invisibility from a kill
  kind:
    verdict.kind === "needsEffect"
      ? "always"
      : verdict.kind === "noText" || verdict.kind === "gap"
        ? "rotation"
        : (verdict.kind as SubclassEffectKind),
  reason: verdict.reason,
  check: verdict.check,
  ...(verdict.part ? { parts: [verdict.part] } : {}),
  ...(verdict.durationMs ? { durationMs: verdict.durationMs } : {}),
  ...(verdict.trigger ? { trigger: verdict.trigger } : {}),
});

function findAll(
  name: string,
  text: string,
  entry: CompendiumEntry,
  inputs: SubclassEffectInputs,
): Found[] {
  const found: Found[] = [];
  const quote = (q: string): Source => ({ ...inputs.sources.compendium, note: `„${q}“ (${entry.tab}, ${name})` });
  const bonuses = bonusQuotes(text, "compendium", inputs.meleeNames);

  // A: Court rows with a value
  for (const row of inputs.court.filter(
    (r) => sameName(r.name, name) && r.pve && r.category in BUCKET_OF_CATEGORY,
  ))
    found.push(
      fromCourt(
        courtVerdict(
          { bucketId: BUCKET_OF_CATEGORY[row.category], trigger: row.trigger, pve: row.pve, pveDuration: row.pveDuration },
          bonuses.map((b) => b.percent),
          text,
          inputs,
        ),
      ),
    );
  const fromCourtRow = found.length > 0;

  // B: more scorch stacks
  const counter = COUNTER.exec(text);
  if (counter)
    found.push({
      rule: "B",
      kind: "always",
      reason: `Scorch-Stapel ×${factorOf(Number(counter[1]))} („${counter[0]}“)`,
      check: "Text",
      parts: [{ type: "counterModifier", counterId: "scorch", factor: { value: factorOf(Number(counter[1])), source: quote(counter[0]) } }],
    });

  // C: keyword sources (U4b)
  for (const k of inputs.keywordSources.filter((k) => k.tab === entry.tab && k.name === entry.name)) {
    const part = (damageSources: DamageSource[], elements: string[]): EffectPart => ({
      type: "appliesKeyword",
      keywordId: k.keywordId,
      damageSources,
      ...(elements.length ? { elements: elements as never } : {}),
      ...(k.stacks ? { stacks: { value: k.stacks, source: quote(k.quote) } } : {}),
      source: quote(k.quote),
    });
    if (k.kind === "hitFilter" && k.filter)
      found.push({
        rule: "C",
        kind: "always",
        reason: `${k.keywordId} auf Treffer von ${k.filter.elements.join("/")} ${k.filter.damageSources.join(", ")} („${k.quote}“)`,
        check: "Text",
        parts: [part(k.filter.damageSources, k.filter.elements)],
      });
    else if (k.kind === "preBuilt" && k.filter && k.durationSeconds)
      found.push({
        rule: "C",
        kind: "preBuilt",
        reason: `vorher aufgebaut: ${k.keywordId} auf ${k.filter.elements.join("/")} Waffen für ${k.durationSeconds} s („${k.quote}“)`,
        check: "Text",
        parts: [part(k.filter.damageSources, k.filter.elements)],
        durationMs: { value: k.durationSeconds * MS_PER_SECOND, source: quote(k.quote) },
      });
    else
      found.push({
        rule: "C",
        kind: k.kind === "classAbility" ? "classAbility" : "keywordLater",
        reason: `${k.keywordId}: ${
          k.kind === "kill" ? "Kill ohne Dauer, feuert nie" : k.kind === "classAbility" ? "Auslöser Class Ability, U7" : "eigener Schaden oder geänderte Ability, später"
        } („${k.quote}“)`,
        check: "Text",
      });
  }

  // D: grants Radiant on hits, without a Court row
  const grants = fromCourtRow ? null : GRANTS_EFFECT.exec(text);
  if (grants) {
    const effect = inputs.effects.find((e) => e.name === grants[2] || e.id === grants[2].toLowerCase())!;
    const melee = /melee/i.test(grants[1]);
    found.push({
      rule: "D",
      kind: melee ? "triggered" : "rotation",
      reason: `${effect.name} ${melee ? "ab Melee-Treffer" : "ohne Regel"} für ${grants[3]} s („${grants[0]}“)`,
      check: "Text",
      ...(melee
        ? {
            parts: effect.parts,
            durationMs: { value: Number(grants[3]) * MS_PER_SECOND, source: quote(grants[0]) },
            trigger: { on: "hit" as const, refresh: true, abilityKinds: ["melee" as const] },
            suffix: `(${effect.name})`,
          }
        : {}),
    });
  }

  // E: states
  const statusFound = new Map<string, { statuses: StatusId[]; seconds?: number; quotes: string[] }>();
  for (const { sentence, header } of sentencesOf(text)) {
    for (const [status, pattern] of STATUS_NAMES) {
      const grant = new RegExp(GRANT_VERB + pattern.source, "i").exec(sentence) ??
        (status === "restoration" ? /Restoration x\d+/i.exec(sentence) : null);
      if (!grant || /^While\b/i.test(sentence)) continue;
      const kill = KILL_WORD.test(sentence) || KILL_WORD.test(header);
      const duration = STATUS_DURATION.exec(sentence);
      const key = kill ? `kill:${duration?.[1] ?? "-"}` : "always";
      const entryOf = statusFound.get(key) ?? { statuses: [], quotes: [], ...(kill && duration ? { seconds: Number(duration[1]) } : {}) };
      if (!entryOf.statuses.includes(status)) entryOf.statuses.push(status);
      entryOf.quotes.push(grant[0]);
      statusFound.set(key, entryOf);
    }
  }
  for (const [key, s] of statusFound) {
    const quotes = [...new Set(s.quotes)].map((q) => `„${q}“`).join(", ");
    if (key === "always")
      found.push({ rule: "E", kind: "always", reason: `Zustand ${s.statuses.join(", ")}, die ganze Phase gehalten (${quotes})`, check: "Text", grantsStatus: s.statuses });
    else if (s.seconds === undefined)
      found.push({ rule: "E", kind: "missingDuration", reason: `Zustand ${s.statuses.join(", ")} nur durch Kills, ohne Dauer (${quotes})`, check: "Text" });
    else
      found.push({
        rule: "E",
        kind: "preBuilt",
        reason: `vorher aufgebaut: Zustand ${s.statuses.join(", ")} für ${s.seconds} s (${quotes})`,
        check: "Text",
        grantsStatus: s.statuses,
        durationMs: { value: s.seconds * MS_PER_SECOND, source: quote(s.quotes[0]) },
      });
  }

  // F: quoted bonuses. Melee → the additive melee bucket (Court); grenade/super/"Light Abilities" →
  // bucket aspectBonus (no Court category, assumed multiplicative); the highest value per item and
  // scope, the window from "<item> for N seconds" (kills build it up) or "within N seconds" (Spark of
  // Feedback, block Uptime), otherwise the whole phase.
  const window =
    new RegExp(`${escapeRegExp(name)} for (\\d+(?:\\.\\d+)?) seconds`, "i").exec(text) ??
    /\bwithin (\d+(?:\.\d+)?) seconds\b/i.exec(text);
  const scoped = new Map<string, { bonus: (typeof bonuses)[number]; scope: BonusScope }>();
  for (const b of bonuses) {
    const sentence = sentencesOf(text).find((s) => s.sentence.includes(b.quote))?.sentence ?? b.quote;
    const scope =
      b.melee || /\bMelee Abilities deal\b/i.test(sentence) ? MELEE_SCOPE : abilityScope(sentence, entry.tab);
    if (!scope || (scope !== MELEE_SCOPE && fromCourtRow)) continue;
    const key = `${scope.bucketId}|${scope.damageSources}|${scope.elements}`;
    if (!scoped.has(key) || scoped.get(key)!.bonus.percent < b.percent) scoped.set(key, { bonus: b, scope });
  }
  for (const { bonus: b, scope } of scoped.values()) {
    const source: Source = {
      ...quote(b.quote),
      ...(scope.bucketId === "aspectBonus"
        ? { status: "unverified" as const, note: `„${b.quote}“ (${entry.tab}, ${name}); no Court category, assumed to multiply with every other bucket` }
        : {}),
    };
    found.push({
      rule: "F",
      kind: window ? "preBuilt" : "always",
      reason: `${scope.bucketId === "melee" ? "Melee" : "Ability"}-Bonus +${b.percent} % im Bucket ${scope.bucketId}${window ? `, ${window[1]} s` : ""} („${flat(b.quote)}“)`,
      check: "Text",
      parts: [
        {
          type: "multiplier",
          bucketId: scope.bucketId,
          multiplier: { value: factorOf(b.percent), source },
          damageSources: scope.damageSources,
          ...(scope.elements ? { elements: scope.elements } : {}),
        },
      ],
      ...(window ? { durationMs: { value: Number(window[1]) * MS_PER_SECOND, source: quote(window[0]) } } : {}),
    });
  }
  const seen = new Set<string>();
  for (const b of bonuses.filter((b) => !b.melee && !fromCourtRow)) {
    const sentence = sentencesOf(text).find((s) => s.sentence.includes(b.quote))?.sentence ?? b.quote;
    if (abilityScope(sentence, entry.tab) || /\bMelee Abilities deal\b/i.test(sentence)) continue;
    // both bonus patterns may match the same sentence
    if (seen.has(`${sentence}|${b.percent}`)) continue;
    seen.add(`${sentence}|${b.percent}`);
    found.push(
      NOT_ON_BOSS.test(sentence)
        ? { rule: "F", kind: "notAgainstBoss", reason: `wirkt nicht gegen einen Boss („${flat(sentence)}“)`, check: "Text" }
        : { rule: "F", kind: "bonusLater", reason: `Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („${flat(sentence)}“)`, check: `Text ${b.percent} %` },
    );
  }
  return found;
}

const GENERATES: SubclassEffectKind[] = ["always", "preBuilt", "triggered"];

/** Review rows of all aspects and fragments and the effects of the generating kinds. */
export function subclassEffects(inputs: SubclassEffectInputs): {
  rows: SubclassEffectRow[];
  effects: GeneratedSubclassEffect[];
  codes: Record<string, number>;
} {
  const rows: SubclassEffectRow[] = [];
  const effects: GeneratedSubclassEffect[] = [];
  const codes = { ...inputs.codes };
  let nextCode =
    Math.max(
      0,
      ...Object.values(codes),
      ...inputs.effects.flatMap((e) => [e.code, ...(e.formerCodes ?? []).map((f) => f.code)]),
    ) + 1;
  const names = [...new Set(inputs.subclassItems.map((i) => i.name))].sort((a, b) => a.localeCompare(b, "en"));
  for (const name of names) {
    const items = inputs.subclassItems.filter((i) => i.name === name);
    const entries = inputs.compendium
      .filter(
        (e) =>
          /^(aspects?|fragments)$/i.test(e.section) &&
          !/^Prismatic Grenade/.test(e.text) &&
          items.some((i) => i.subclass === e.tab.toLowerCase() && subclassItemNamed(i.name, e.name)),
      )
      .sort((a, b) => Number(a.tab === "Prismatic") - Number(b.tab === "Prismatic"));
    // an item named like a buff keeps its own ids, e.g. "banner-of-war-aspect" beside the fireteam buff
    const id = kebab(name) + (inputs.reservedIds.includes(kebab(name)) ? "-aspect" : "");
    const subclasses = [...new Set(items.map((i) => i.subclass))];
    const base = { id, name, subclasses: subclasses.join(", ") };
    if (entries.length === 0) {
      rows.push({ ...base, rule: "–", kind: "noText", reason: "kein Compendium-Text" , check: "–" });
      continue;
    }
    const entry = entries[0];
    const found = findAll(name, entry.text, entry, inputs);
    if (found.length === 0) {
      rows.push({
        ...base,
        rule: "–",
        kind: "noDamage",
        reason: DAMAGE_WORD.test(entry.text) ? "nennt Schaden nur als Bedingung oder Auslöser" : "kein Schadenswort",
        check: "–",
      });
      continue;
    }
    const providers = providersOf(items);
    let count = 0;
    for (const f of found) {
      const row: SubclassEffectRow = { ...base, rule: f.rule, kind: f.kind, reason: f.reason, check: f.check };
      if (GENERATES.includes(f.kind) && (f.parts?.length || f.grantsStatus)) {
        const effectId = count === 0 ? id : `${id}-${count + 1}`;
        count++;
        // an effect kept in effects.json keeps its code there, e.g. Ember of Ashes
        codes[effectId] ??=
          inputs.effects.find((e) => e.id === effectId)?.code ?? nextCode++;
        effects.push({
          subclassItemId: id,
          activation: f.kind === "preBuilt" ? "preBuilt" : "always",
          effect: {
            id: effectId,
            code: codes[effectId],
            name: f.suffix ? `${name} ${f.suffix}` : name,
            shortName: name,
            manifestRef: { table: "DestinyInventoryItemDefinition", hash: items[0].hash },
            providers,
            parts: f.parts ?? [],
            ...(f.grantsStatus ? { grantsStatus: f.grantsStatus } : {}),
            ...(f.durationMs ? { durationMs: f.durationMs } : {}),
            ...(f.trigger ? { trigger: f.trigger } : {}),
          },
        });
        row.effectId = effectId;
      }
      rows.push(row);
    }
  }

  // G: items without an effect that Aegis measured an ability with
  const withEffect = new Set(effects.map((e) => e.subclassItemId));
  const eligible = new Map(
    names
      .filter((name) => !withEffect.has(kebab(name)))
      .map((name) => [nameKey(name), name]),
  );
  const changes = new Map<string, { abilityIds: string[]; rowIds: string[] }>();
  for (const ability of inputs.abilities.filter((a) => a.package)) {
    const base = inputs.aegisRows.find((r) => r.id === ability.aegisRowId);
    if (!base) continue;
    for (const { row, extras } of variantRows(base, inputs.aegisRows, (a) => eligible.get(nameKey(a))))
      for (const name of extras) {
        const entry = changes.get(name) ?? { abilityIds: [], rowIds: [] };
        if (!entry.abilityIds.includes(ability.id)) entry.abilityIds.push(ability.id);
        entry.rowIds.push(row.id);
        changes.set(name, entry);
      }
  }
  for (const [name, { abilityIds, rowIds }] of changes) {
    const id = kebab(name);
    const items = inputs.subclassItems.filter((i) => i.name === name);
    codes[id] ??= nextCode++;
    effects.push({
      subclassItemId: id,
      activation: "always",
      effect: {
        id,
        code: codes[id],
        name,
        shortName: name,
        manifestRef: { table: "DestinyInventoryItemDefinition", hash: items[0].hash },
        providers: providersOf(items),
        parts: [],
        changesAbilityIds: abilityIds,
      },
    });
    // the item now has damage: drop its "no damage" row
    const noDamage = rows.findIndex((r) => r.id === id && r.kind === "noDamage");
    if (noDamage >= 0) rows.splice(noDamage, 1);
    rows.push({
      id,
      name,
      subclasses: [...new Set(items.map((i) => i.subclass))].join(", "),
      rule: "G",
      kind: "abilityVariant",
      reason: `ändert ${abilityIds.join(", ")} (Aegis-Zeilen ${rowIds.map((r) => `\`${r}\``).join(", ")})`,
      check: "Aegis",
      effectId: id,
    });
  }

  // H: damage of its own measured in the tab Sustained
  for (const name of names) {
    const row = inputs.aegisTotals
      .filter(
        (r) =>
          r.tab === "sustained" &&
          r.type === "tick" &&
          r.base !== null &&
          r.rateSeconds !== null &&
          sameName(r.name, name),
      )
      .sort((a, b) => a.assumptions.length - b.assumptions.length)[0];
    if (!row) continue;
    const items = inputs.subclassItems.filter((i) => i.name === name);
    const id = kebab(name);
    const own = effects.filter((e) => e.subclassItemId === id).length;
    const effectId = own === 0 ? id : `${id}-${own + 1}`;
    codes[effectId] ??= nextCode++;
    const element = (items.find((i) => i.subclass !== "prismatic") ?? items[0]).subclass as Element;
    const measured = `${row.name}${row.assumptions.length ? ` (${row.assumptions.join(", ")})` : ""}: Base ${row.base}, peak Rate ${row.rateSeconds} s`;
    const window = ownDamageWindow(inputs, items);
    const source = (value: number): { value: number; source: Source } => ({
      value,
      source: {
        ...inputs.sources.aegisTotals,
        name: "Aegis Boss Damage, tab Sustained",
        quote: measured,
        note: "Base is one hit before the factors of Aegis (only Debuff 1.3 and the stat, both left out); peak Rate is the time between two hits at the practical rate of Aegis.",
      },
    });
    effects.push({
      subclassItemId: id,
      activation: window?.preBuilt ? "preBuilt" : "always",
      effect: {
        id: effectId,
        code: codes[effectId],
        name,
        shortName: name,
        manifestRef: { table: "DestinyInventoryItemDefinition", hash: items[0].hash },
        providers: providersOf(items),
        parts: [
          {
            type: "periodicDamage",
            id: effectId,
            element,
            damage: source(row.base!),
            intervalMs: source(Math.round(row.rateSeconds! * MS_PER_SECOND)),
          },
        ],
        ...(window ? { durationMs: window.durationMs } : {}),
        ...(window?.trigger ? { trigger: window.trigger } : {}),
      },
    });
    // the measurement replaces the open rows of the item
    for (let i = rows.length - 1; i >= 0; i--)
      if (rows[i].id === id && REPLACED_BY_MEASUREMENT.includes(rows[i].kind)) rows.splice(i, 1);
    rows.push({
      id,
      name,
      subclasses: [...new Set(items.map((i) => i.subclass))].join(", "),
      rule: "H",
      kind: "ownDamage",
      reason: `${row.base} alle ${row.rateSeconds} s ${window ? window.label : "die ganze Phase"} (Aegis-Zeile \`${row.id}\`)`,
      check: "Aegis",
      effectId,
    });
  }
  return { rows, effects, codes };
}

const REPLACED_BY_MEASUREMENT: SubclassEffectKind[] = ["noDamage", "classAbility", "keywordLater"];

// Rule H window (block "Uptime", owner 2026-10-24): damage of its own lasts as long as its source.
// "On Class Ability Usage: Grants Hellion for 20 seconds", "Rifts created by the user grant an Arc
// Soul … lasts 15 seconds": a window at each class ability cast. "Arc Kills … charge up an Ionic
// Sentry … Lasts for 15 seconds": charged by kills, so built up before the phase, one window from 0 s.
const CLASS_CAST_SOURCE = /^(On Class Ability Usage|Rifts created by the user)/im;
const KILL_CHARGED = /\bkills?\b[^.\n]*\bcharge/i;
const LIFETIME = /\b(?:lasts(?: for)?|grants [\w' ]+? for) (\d+(?:\.\d+)?) seconds\b/i;

function ownDamageWindow(
  inputs: SubclassEffectInputs,
  items: ManifestSubclassItem[],
):
  | { durationMs: NonNullable<Effect["durationMs"]>; trigger?: Effect["trigger"]; preBuilt: boolean; label: string }
  | undefined {
  const entry = inputs.compendium
    .filter(
      (e) =>
        /^(aspects?|fragments)$/i.test(e.section) &&
        items.some((i) => i.subclass === e.tab.toLowerCase() && subclassItemNamed(i.name, e.name)),
    )
    .sort((a, b) => Number(a.tab === "Prismatic") - Number(b.tab === "Prismatic"))[0];
  if (!entry) return undefined;
  const classCast = CLASS_CAST_SOURCE.test(entry.text);
  const killCharged = !classCast && KILL_CHARGED.test(entry.text);
  const lifetime = LIFETIME.exec(entry.text);
  if ((!classCast && !killCharged) || !lifetime) return undefined;
  const seconds = Number(lifetime[1]);
  const durationMs = {
    value: seconds * MS_PER_SECOND,
    source: { ...inputs.sources.compendium, note: `„${lifetime[0]}“ (${entry.tab}, ${entry.name})` },
  };
  return classCast
    ? {
        durationMs,
        trigger: { on: "cast", refresh: true, abilityKinds: ["classAbility"] },
        preBuilt: false,
        label: `für ${seconds} s ab Cast einer Class Ability`,
      }
    : { durationMs, preBuilt: true, label: `für ${seconds} s ab Beginn der Phase (durch Kills vorher aufgeladen)` };
}

function providersOf(items: ManifestSubclassItem[]): EffectProvider[] {
  const subclasses = [...new Set(items.map((i) => i.subclass))];
  return subclasses.map((subclass) => {
    const classes = [...new Set(items.filter((i) => i.subclass === subclass).map((i) => i.guardianClass))];
    return {
      kind: "subclass",
      slot: items[0].kind,
      subclasses: [subclass],
      ...(classes.includes(null) ? {} : { classes: classes as never }),
    };
  });
}

const KIND_TITLES: [SubclassEffectKind, string][] = [
  ["always", "Immer aktiv"],
  ["preBuilt", "Vorher aufgebaut, Option"],
  ["triggered", "Fenster aus der Rotation"],
  ["missingDuration", "Ohne Dauer"],
  ["rotation", "Auslöser in der Rotation, offen"],
  ["classAbility", "Auslöser Class Ability, U7"],
  ["keywordLater", "Keyword ohne Modell, später"],
  ["notAgainstBoss", "Wirkt nicht gegen einen Boss"],
  ["bonusLater", "Bonus ohne Bucket-Quelle, Recherche in der Inventur"],
  ["abilityVariant", "Ändert eine Ability (Aegis-Variante)"],
  ["ownDamage", "Eigener Schaden (Aegis Sustained)"],
  ["noText", "Ohne Compendium-Text"],
  ["noDamage", "Ohne Schadenswirkung"],
];

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Review table docs/subclass-effects.md (ADR 0015, U6-2). */
export function renderSubclassEffects(rows: SubclassEffectRow[]): string {
  const lines = [
    "# Prüftabelle Subklassen-Effekte",
    "",
    "Erzeugt von `npm run build:keywords` (ADR 0015, U6-2), nicht von Hand bearbeiten.",
    "Quellen: Manifest (Aspects, Fragments), Compendium (Subklassen-Reiter), Court's Stacking Guide, Aegis (Abilities, Sustained). Regeln A bis H in `scripts/lib/subclassEffects.ts`.",
    "Ein Boss, keine Adds; Zustände ohne Kill-Auslöser gelten die ganze Phase (optimal gespielt).",
    "",
    "| Art | Zeilen |",
    "| --- | --- |",
    ...KIND_TITLES.map(([kind, title]) => `| ${title} | ${rows.filter((r) => r.kind === kind).length} |`),
  ];
  for (const [kind, title] of KIND_TITLES) {
    const own = rows.filter((r) => r.kind === kind);
    if (own.length === 0) continue;
    lines.push("", `## ${title}`, "");
    if (kind === "noDamage" || kind === "noText") {
      lines.push(own.map((r) => `${r.name} (${r.subclasses})`).join(", "));
      continue;
    }
    lines.push(
      "| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |",
      "| --- | --- | --- | --- | --- |",
      ...own.map((r) => `| ${cell(r.name)} | ${r.subclasses} | ${r.rule} | ${cell(r.reason)} | ${cell(r.check)} |`),
    );
  }
  return lines.join("\n") + "\n";
}
