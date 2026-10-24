// Text check (block "Text-Abgleich", owner 2026-10-24): every multiplier part, catalyst and grant
// is set next to the texts of its item in Clarity, the Compendium, Court and its source quote.
// The errors so far were transcriptions (Star-Eater subject, Verity duration, Hellion, Spark of
// Feedback), not formulas. Checks:
// - value: (m − 1) × 100 is a percentage in the text; Aegis and Quantum measurements count as
//   measured, a percentage in the text is still compared within ±25 %;
// - duration: the duration of the effect or grant is one the text names (DURATION);
// - target: damage sources, elements and weapon types against the words of the text;
// - unused: percentages in the text no part uses (information, no deviation).
// Review table: docs/text-check.md; every deviation needs a reason in tests/fixtures/text-check.json.

import type { AbilityGrant, Effect, MultiplierPart, Source, Weapon, WeaponType } from "../../src/data/schema.ts";
import {
  COURT_SECONDS,
  courtQuote,
  courtRowsOf,
  DURATION,
  itemTexts,
  NOT_A_BUFF,
  type ItemText,
  type ItemTextSources,
} from "./itemText.ts";

export type TextCheckInputs = ItemTextSources & {
  effects: { file: string; effect: Effect }[];
  weapons: Weapon[];
  grants: AbilityGrant[];
  abilityNames: Record<string, string>;
};

export type CheckKind = "value" | "duration" | "target";
export type CheckVerdict =
  | "ok" // the text names the model's value
  | "via" // the value is the one of another effect the text names, e.g. "x4 Surge"
  | "measured" // Aegis or Quantum measured it; no percentage in the text contradicts it
  | "noText" // no text of the item names a value or duration
  | "deviation";

export type TextCheckRow = {
  key: string; // stable, for reasons: "<effect id>#<part>:value", "<effect id>:duration", …
  item: string;
  check: CheckKind;
  model: string;
  verdict: CheckVerdict;
  text: string; // the line that decided, or what the text names instead
  unused?: number[]; // percentages of the item's texts no part uses (value rows of part 0 only)
};

// Relative tolerance of a measured value against a percentage in the text.
const MEASURED_TOLERANCE = 0.25;
// Absolute tolerance of a percentage, for values like 1.333 against "33%".
const PERCENT_TOLERANCE = 0.5;

const PERCENT = /(\d+(?:\.\d+)?)\s*%/g;
// "[10%]" and "[2.5s]" are PvP values.
const withoutPvp = (text: string) => text.replace(/\[[^\]]*\]/g, " ");

const percentsIn = (text: string): number[] =>
  [...withoutPvp(text).matchAll(PERCENT)].map((m) => Number(m[1]));

const isMeasured = (source: Source) => /\b(aegis|quantum)\b/i.test(source.name);

const round = (n: number) => Math.round(n * 100) / 100;
const pctOf = (multiplier: number) => round(Math.abs(multiplier - 1) * 100);

const ELEMENTS = ["kinetic", "arc", "solar", "void", "stasis", "strand"] as const;

const WEAPON_WORDS: Record<WeaponType, RegExp> = {
  autoRifle: /\bauto rifles?\b/,
  bow: /\bbows?\b/,
  fusionRifle: /(?<!linear )\bfusion rifles?\b/,
  glaive: /\bglaives?\b/,
  grenadeLauncher: /\bgrenade launchers?\b/,
  handCannon: /\bhand cannons?\b/,
  linearFusionRifle: /\blinear fusion rifles?\b/,
  machineGun: /\bmachine ?guns?\b/,
  pulseRifle: /\bpulse rifles?\b/,
  rocketLauncher: /\brockets?\b/,
  scoutRifle: /\bscout rifles?\b/,
  shotgun: /\bshotguns?\b/,
  sidearm: /\bsidearms?\b/,
  submachineGun: /\b(submachine guns?|smgs?)\b/,
  sniperRifle: /\bsniper/,
  sword: /\bswords?\b/,
  traceRifle: /\btrace rifles?\b/,
};

const SOURCE_WORDS: Record<MultiplierPart["damageSources"][number], RegExp> = {
  weapon: /\b(weapons?|guns?|rifles?|launchers?|bows?|swords?|glaives?|shots?|projectiles?|rounds?)\b/,
  grenade: /\bgrenades?\b/,
  melee: /\bmelees?\b/,
  super: /\bsupers?\b/,
  classAbility: /\bclass abilit/,
  keyword: /\b(ignitions?|jolts?|volatile|unravel|bolt charge|scorch|explosions?)\b/,
};

/** Texts of an effect: its source quotes, its Court rows, Compendium and Clarity. */
function effectTexts(effect: Effect, sources: ItemTextSources): ItemText[] {
  const quotes = [
    ...effect.parts.flatMap((p) => (p.type === "multiplier" ? [p.multiplier.source] : [])),
    ...(effect.durationMs ? [effect.durationMs.source] : []),
  ].flatMap((s) => (s.quote ? [{ from: "quote", text: s.quote }] : []));
  const court = courtRowsOf(effect.name, sources).map((r) => ({
    from: courtQuote(r),
    text: [r.pve, r.pveDuration, r.trigger, r.notes].filter(Boolean).join("\n"),
  }));
  return [...dedupe(quotes), ...court, ...itemTexts(effect.name, sources)];
}

const dedupe = (texts: ItemText[]) => texts.filter((t, i) => texts.findIndex((u) => u.text === t.text) === i);

const firstLine = (texts: ItemText[], test: (line: string) => boolean): string | undefined => {
  for (const { from, text } of texts)
    for (const line of text.split("\n")) if (test(line)) return `${from}: ${line.trim()}`;
  return undefined;
};

const near = (a: number, b: number) => Math.abs(a - b) <= PERCENT_TOLERANCE;

/**
 * Value of a factor against the texts. stackCounts: a value N × p is the text's p at N stacks, e.g.
 * "Reaper's Tithe x4" with 10 % per stack.
 */
function valueVerdict(
  multiplier: number,
  source: Source,
  texts: ItemText[],
  stackCounts: number[],
  via: { name: string; values: number[] }[],
): { verdict: CheckVerdict; text: string } {
  const pct = pctOf(multiplier);
  const matches = (p: number) => near(p, pct) || stackCounts.some((n) => near(p * n, pct));
  const hit = firstLine(texts, (line) => percentsIn(line).some(matches));
  if (hit) return { verdict: "ok", text: hit };
  const all = texts.flatMap((t) => percentsIn(t.text));
  if (isMeasured(source)) {
    const close = all.find((p) => Math.abs(p - pct) <= MEASURED_TOLERANCE * pct);
    if (close !== undefined || all.length === 0)
      return { verdict: "measured", text: close !== undefined ? `${close} % im Text` : source.name };
  }
  const joined = texts.map((t) => withoutPvp(t.text).toLowerCase()).join("\n");
  const ref = via.find((v) => joined.includes(v.name.toLowerCase()) && v.values.some((p) => near(p, pct)));
  if (ref) return { verdict: "via", text: ref.name };
  if (texts.length === 0) return { verdict: "noText", text: "" };
  return { verdict: "deviation", text: all.length > 0 ? `Text: ${[...new Set(all)].join(", ")} %` : "Text ohne Prozentzahl" };
}

/** Durations the texts name: Court duration column (with its value) and DURATION per line. */
function durationsIn(
  texts: ItemText[],
  court: { pve: string | null; duration: string }[],
): { seconds: number; quote: string }[] {
  const found = court.flatMap(({ pve, duration }) => {
    const m = COURT_SECONDS.exec(duration);
    return m ? [{ seconds: Number(m[1]), quote: `Court: ${pve ?? ""} | ${duration}` }] : [];
  });
  for (const { from, text } of texts)
    for (const line of text.split("\n")) {
      if (NOT_A_BUFF.test(line)) continue;
      for (const m of line.matchAll(new RegExp(DURATION.source, "gi")))
        found.push({ seconds: Number(m[1]), quote: `${from}: ${line.trim()}` });
    }
  return found;
}

/**
 * A line that names one of the item's values and a duration decides alone (Verity: "x5 | 100% …
 * for 4 seconds", not the 8 s of a lower level); otherwise any duration of the text.
 */
function durationVerdict(
  seconds: number,
  all: { seconds: number; quote: string }[],
  values: number[] = [],
): { verdict: CheckVerdict; text: string } {
  const withValue = all.filter((f) => percentsIn(f.quote).some((p) => values.some((v) => near(p, v))));
  const found = withValue.length > 0 ? withValue : all;
  const hit = found.find((f) => f.seconds === seconds);
  if (hit) return { verdict: "ok", text: hit.quote };
  if (found.length === 0) return { verdict: "noText", text: "" };
  return { verdict: "deviation", text: found.map((f) => `${f.seconds} s (${f.quote})`).join("; ") };
}

const ALL_SOURCES = Object.keys(SOURCE_WORDS);

// Buckets that only raise weapon damage: Empowering Buffs (Bungie 9.7.0, docs/mechanics/
// damage-stacking.md) and Court's "Weapon Surges"; "Rift grants 20% increased damage" means weapons.
const WEAPON_BUCKETS = new Set(["empowering", "surge"]);

const sentencesOf = (text: string) => text.split(/(?<=[.!?])\s+|\n/);

/**
 * What the part applies to that the text does not say, or what the text narrows that the part does
 * not. A part on every damage source is a debuff of the target: the text's words say how it is
 * applied, not what it raises. A part with the sources of a model effect the text names (e.g.
 * "grants Radiant") takes them from that effect. A narrowing counts only in the sentences that name
 * the part's value or the effect with that value, if any do (Gyrfalcon's: "Volatile Rounds to Void
 * Weapons" is another bonus; Fever and Chill: "Bows = 3 Crits" is the trigger).
 */
function targetFindings(
  part: MultiplierPart,
  texts: ItemText[],
  via: { name: string; values: number[]; sources: string[][] }[],
  abilityNames: Record<string, string>,
): string[] {
  if (ALL_SOURCES.every((s) => part.damageSources.includes(s as MultiplierPart["damageSources"][number]))) return [];
  const text = texts.map((t) => withoutPvp(t.text).toLowerCase()).join("\n");
  const pct = pctOf(part.multiplier.value!);
  const viaNames = via.filter((v) => v.values.some((p) => near(p, pct))).map((v) => v.name.toLowerCase());
  const withValue = sentencesOf(text).filter(
    (s) => percentsIn(s).some((p) => near(p, pct)) || viaNames.some((n) => s.includes(n)),
  );
  const narrowing = withValue.length > 0 ? withValue.join("\n") : text;
  const sameSources = (sources: string[]) =>
    sources.length === part.damageSources.length && part.damageSources.every((s) => sources.includes(s));
  const named = via.some((v) => text.includes(v.name.toLowerCase()) && v.sources.some(sameSources));
  const implied = (s: string) =>
    s === "weapon" &&
    (WEAPON_BUCKETS.has(part.bucketId) || (part.weaponTypes ?? []).some((w) => WEAPON_WORDS[w].test(text)));
  const findings: string[] = [];
  if (!named)
    for (const s of part.damageSources)
      if (!SOURCE_WORDS[s].test(text) && !implied(s)) findings.push(`${s} nicht im Text`);
  for (const e of part.elements ?? []) if (!new RegExp(`\\b${e}\\b`).test(text)) findings.push(`${e} nicht im Text`);
  if (!part.elements && !part.condition && !part.superElements) {
    const named = ELEMENTS.filter((e) => new RegExp(`\\b${e} (weapons?|damage|abilit)`).test(narrowing));
    if (named.length > 0) findings.push(`Text nennt ${named.join("/")}, Part gilt für alle Elemente`);
  }
  for (const w of part.weaponTypes ?? []) if (!WEAPON_WORDS[w].test(text)) findings.push(`${w} nicht im Text`);
  // "Golden Gun: Deadshot" is named as "Golden Gun"
  const abilities = (part.abilityIds ?? []).map((id) => (abilityNames[id] ?? id).replace(/:.*$/, ""));
  if (!named && abilities.length > 0 && !abilities.some((a) => text.includes(a.toLowerCase())))
    findings.push(`${abilities.join("/")} nicht im Text`);
  if (!part.weaponTypes && part.damageSources.includes("weapon")) {
    const named = (Object.keys(WEAPON_WORDS) as WeaponType[]).filter((w) => WEAPON_WORDS[w].test(narrowing));
    if (named.length > 0) findings.push(`Text nennt ${named.join("/")}, Part gilt für alle Waffen`);
  }
  return findings;
}

const describePart = (p: MultiplierPart) =>
  [
    `${p.multiplier.value! >= 1 ? "+" : "−"}${pctOf(p.multiplier.value!)} % ${p.bucketId}`,
    p.damageSources.join("/"),
    p.elements?.join("/"),
    p.weaponTypes?.join("/"),
    p.hitStacks ? "pro Stapel" : undefined,
  ]
    .filter(Boolean)
    .join(", ");

const stacksOf = (name: string) => [...name.matchAll(/\bx(\d+)\b/gi)].map((m) => Number(m[1]));

export function textCheckRows(inputs: TextCheckInputs): TextCheckRow[] {
  const rows: TextCheckRow[] = [];
  // Effects of the model by name, for values the text gives by reference ("x4 Surge", "Weaken").
  const via = inputs.effects
    .filter(({ file }) => file === "effects.json" || file === "buff-effects.json")
    .map(({ effect }) => {
      const parts = effect.parts.filter((p): p is MultiplierPart => p.type === "multiplier" && p.multiplier.value !== null);
      return {
        name: effect.name.replace(/\s*\(.*\)$/, "").replace(/\s+x\d+$/i, ""),
        values: parts.map((p) => pctOf(p.multiplier.value!)),
        sources: parts.map((p) => p.damageSources as string[]),
      };
    });

  for (const { effect } of inputs.effects) {
    const texts = effectTexts(effect, inputs);
    const parts = effect.parts.filter((p): p is MultiplierPart => p.type === "multiplier" && p.multiplier.value !== null);
    const used = parts.map((p) => pctOf(p.multiplier.value!));
    const others = via.filter((v) => v.name !== effect.name.replace(/\s*\(.*\)$/, "").replace(/\s+x\d+$/i, ""));
    parts.forEach((part, i) => {
      const value = valueVerdict(part.multiplier.value!, part.multiplier.source, texts, stacksOf(effect.name), others);
      const unused =
        i === 0
          ? [...new Set(texts.flatMap((t) => percentsIn(t.text)))].filter((p) => !used.some((u) => near(u, p)))
          : undefined;
      rows.push({ key: `${effect.id}#${i}:value`, item: effect.name, check: "value", model: describePart(part), ...value, ...(unused?.length ? { unused } : {}) });
      if (texts.length === 0) return;
      const findings = targetFindings(part, texts, others, inputs.abilityNames);
      rows.push({
        key: `${effect.id}#${i}:target`,
        item: effect.name,
        check: "target",
        model: describePart(part),
        verdict: findings.length === 0 ? "ok" : "deviation",
        text: findings.join("; "),
      });
    });
    if (effect.durationMs?.value) {
      const court = courtRowsOf(effect.name, inputs).flatMap((r) =>
        r.pveDuration ? [{ pve: r.pve, duration: r.pveDuration }] : [],
      );
      rows.push({
        key: `${effect.id}:duration`,
        item: effect.name,
        check: "duration",
        model: `${effect.durationMs.value / 1000} s`,
        ...durationVerdict(effect.durationMs.value / 1000, durationsIn(texts, court), used),
      });
    }
  }

  for (const weapon of inputs.weapons) {
    for (const option of (weapon.options ?? []).filter((o) => o.kind === "catalyst" && o.factor.value !== null)) {
      const base = option.name.replace(/\s+x\d+$/i, "");
      const texts = [
        ...(weapon.catalyst ? [{ from: `Catalyst ${weapon.catalyst.name}`, text: weapon.catalyst.description }] : []),
        ...(option.factor.source.quote ? [{ from: "quote", text: option.factor.source.quote }] : []),
        ...itemTexts(base, inputs),
      ];
      const item = `${weapon.name}: ${option.name}`;
      // A ratio of two Aegis or Quantum rows (with and without the catalyst) measures it as a whole
      // (reload, ammo, a perk); the percentages of its text are parts of that, not the damage ratio.
      const value = valueVerdict(option.factor.value!, option.factor.source, dedupe(texts), stacksOf(option.name), []);
      const whole = /\(base row |with catalyst \/ without/.test(option.factor.source.note ?? "");
      rows.push({
        key: `catalyst:${weapon.id}:${option.id}:value`,
        item,
        check: "value",
        model: `${option.factor.value! >= 1 ? "+" : "−"}${pctOf(option.factor.value!)} % ${option.bucketId}`,
        ...(whole && value.verdict === "deviation"
          ? { verdict: "measured" as const, text: "Messung mit und ohne Catalyst" }
          : value),
      });
      if (option.durationSeconds !== null) {
        rows.push({
          key: `catalyst:${weapon.id}:${option.id}:duration`,
          item,
          check: "duration",
          model: `${option.durationSeconds} s`,
          ...durationVerdict(option.durationSeconds, durationsIn(dedupe(texts), []), [pctOf(option.factor.value!)]),
        });
      }
    }
  }

  for (const grant of inputs.grants) {
    const name = inputs.abilityNames[grant.abilityId] ?? grant.abilityId;
    const source = grant.durationMs.source;
    const texts = [
      ...(source.quote ? [{ from: "quote", text: source.quote }] : []),
      ...itemTexts(name, inputs),
    ];
    const court =
      /Court/.test(source.name) && source.quote
        ? source.quote.split("|").map((s) => ({ pve: null, duration: s.trim() }))
        : [];
    rows.push({
      key: `grant:${grant.abilityId}:${grant.effectId}:duration`,
      item: `${name} → ${grant.effectId}`,
      check: "duration",
      model: `${grant.durationMs.value! / 1000} s`,
      ...durationVerdict(grant.durationMs.value! / 1000, durationsIn(dedupe(texts), court)),
    });
  }
  return rows;
}

const VERDICT_TEXT: Record<CheckVerdict, string> = {
  ok: "ok",
  via: "über Effect",
  measured: "gemessen",
  noText: "kein Text",
  deviation: "**Abweichung**",
};

const cell = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");

export function renderTextCheck(rows: TextCheckRow[], reasons: Record<string, string>): string {
  const count = (v: CheckVerdict) => rows.filter((r) => r.verdict === v).length;
  const deviations = rows.filter((r) => r.verdict === "deviation");
  const open = deviations.filter((r) => !reasons[r.key]).length;
  const lines = [
    "# Text-Abgleich",
    "",
    "Generiert mit `npm run check:text` (Regel in `scripts/lib/textCheck.ts`). Jeder Multiplier-Part, Catalyst und Grant neben den Texten seines Items (Clarity, Compendium, Court, Zitat der Quelle). Wert: (m − 1) × 100 steht im Text; Aegis- und Quantum-Messungen zählen als gemessen, eine Prozentzahl im Text trotzdem auf ±25 %. Dauer: eine Dauer aus dem Text. Ziel: Quellen, Elemente und Waffentypen gegen die Wörter im Text. „Ungenutzt“: Prozentzahlen im Text, die kein Part des Items nutzt (nur zur Info). Gründe für Abweichungen: `tests/fixtures/text-check.json`.",
    "",
    `Zeilen ${rows.length}: ok ${count("ok")}, über Effect ${count("via")}, gemessen ${count("measured")}, kein Text ${count("noText")}, Abweichung ${deviations.length} (davon ohne Grund ${open}).`,
    "",
    "## Abweichungen",
    "",
    "| Item | Prüfung | Modell | Text | Grund |",
    "| --- | --- | --- | --- | --- |",
    ...deviations.map(
      (r) => `| ${cell(r.item)} | ${r.check} | ${cell(r.model)} | ${cell(r.text)} | ${cell(reasons[r.key] ?? "**offen**")} |`,
    ),
    "",
    "## Alle Zeilen",
    "",
    "| Item | Prüfung | Modell | Urteil | Text | Ungenutzt |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${cell(r.item)} | ${r.check} | ${cell(r.model)} | ${VERDICT_TEXT[r.verdict]} | ${cell(r.text)} | ${r.unused?.map((p) => `${p} %`).join(", ") ?? ""} |`,
    ),
  ];
  return `${lines.join("\n")}\n`;
}
