// Classifies every exotic armor piece by fixed rules (ADR 0014, point 5); the first rule that matches wins.
// 1 Aegis ability package assumes it → abilityVariant
// 2 Court row with a value → damageBuff (bucket from Court's category)
// 3 Court lists it as exotic intrinsic → damageBuff with the bonus from Compendium or Clarity, else gap
// 4 a text grants an effect the model knows, e.g. Radiant → grantsEffect (4c); otherwise a text names a
//   damage bonus → damageBuff with the bucket from the text (4a), else from Court's definition of
//   exotic intrinsics (4b)
// 5 without a damage bonus (owner, 2026-10-21: drop only what does not influence damage at all):
//   extends an effect the model keeps up anyway (e.g. Weapons of Light) → noDamage;
//   quoted Reload Duration Multiplier → weaponTiming; own damage → ownDamage (later);
//   other timing (magazine, ammo, fire rate) → gap; energy only → energyOnly (kept as gap);
//   other damage words → gap
// 6 nothing of that → noDamage
// Bonuses on melee damage do not count in rules 3 and 4: melee buffs add up with each other
// (Compendium "Game Mechanics"), which the model does not know yet.

import type {
  ArmorBonusBucket,
  ArmorBonusQuote,
  ClarityEntry,
  CompendiumEntry,
  CourtCategory,
  CourtEntry,
  ExoticArmorEntry,
  ManifestArmorPiece,
} from "../../src/data/schema.ts";

export type ArmorImportInputs = {
  armor: ManifestArmorPiece[];
  aegisAbilities: { id: string; assumptions: string[] }[];
  court: CourtEntry[];
  courtCategories: CourtCategory[];
  compendium: CompendiumEntry[]; // tab Exotic Armors
  clarity: ClarityEntry[];
  effects: { id: string; name: string }[]; // modelled effects, see effects.json
  meleeNames: string[]; // melee abilities from the manifest, e.g. "Frenzied Blade"
};

// Court's categories (ADR 0006, point 3) to buckets in buckets.json.
const BUCKET_OF_CATEGORY: Record<string, string> = {
  "Global Debuffs": "debuff",
  "Empowering Buffs": "empowering",
  "Weapon Surges": "surge",
  "Amplification Modifiers": "amplification",
  "Exotic Intrinsics": "exoticIntrinsic",
};
const INTRINSICS = "Exotic Intrinsics";
const INTRINSICS_DEFINITION = "EXOTICS INTRINSICS"; // name in Court's category overview

const NUMBER = String.raw`(\d+(?:\.\d+)?)`;
const NOT_A_BONUS = String.raw`(?!\s*(?:resist|reduction|falloff|range|distance))`;
const BONUS_PATTERNS = [
  // "55% increased damage", "70% increased Super Damage", "100% more damage", with stacked values
  // before ("25% | 60% | 120% Increased …") and a PvP value after ("35% [15%] increased damage")
  new RegExp(
    String.raw`(?:\d+(?:\.\d+)?%\s*\|\s*)*${NUMBER}%(?:\s*\[[^\]]*\])?\s+(?:increased|more|bonus|additional)\s+(?:[A-Za-z']+\s+){0,5}?damage${NOT_A_BONUS}`,
    "gi",
  ),
  // "Melee damage is increased by 150%"
  new RegExp(
    String.raw`(?:[A-Za-z]+\s+){0,2}?damage (?:is )?increased by ${NUMBER}%`,
    "gi",
  ),
];
const MELEE_WORDS = ["melee", "knife", "knives"];
const RESIST = /damage (resist(ance)?|reduction)/gi;
const DAMAGE_WORD = /damage|surge|weaken|ignit|radiant|empower|amplif|debuff/i;
const OWN_DAMAGE =
  /\bdeal(?:s|ing)?\s+(?:up to\s+)?[\d,]+|explo(?:sion|des?)|detonat|projectile|scorch|ignit|\bjolt|unravel/i;
const TIMING_WORD =
  /reload|magazine|\bammo\b|rate of fire|fire rate|\brpm\b|charge time|draw time|refill/i;
const ENERGY = /\benergy\b/i;
// "0.9x Reload Duration Multiplier", with stacked values before: "- | 0.925x | 0.89x Reload …"
const RELOAD_FACTOR =
  /(?:(?:\d+(?:\.\d+)?\??x|-)\s*\|\s*)*\d+(?:\.\d+)?\??x\s+Reload Duration Multiplier/i;
const EXTENDS = String.raw`[^.\n]{0,60}\b(?:can now persist|persists?|lasts? longer|extends?)\b`;
const BUCKET_WORDS =
  "empowering buffs?|weapon surges?|global debuffs?|debuffs?|amplification modifiers?";
// A sentence that names the bucket, e.g. "Weapon damage increases are Empowering Buffs."
const STATED_BUCKET = new RegExp(
  String.raw`[^.\n]*\b(?:are|is|counts? as)\s+(?:an?\s+)?(${BUCKET_WORDS})`,
  "i",
);
// The same in brackets, e.g. "(Empowering Buff)"
const BRACKETED_BUCKET = new RegExp(String.raw`\((${BUCKET_WORDS})\)`, "i");
const BUCKET_OF_WORD: [RegExp, string][] = [
  [/empower/i, "empowering"],
  [/surge/i, "surge"],
  [/debuff/i, "debuff"],
  [/amplif/i, "amplification"],
];

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The heading of the block above a position, e.g. "Strengthened Throwing Knife:"; empty if none. */
function headingAbove(text: string, index: number): string {
  const lines = text.slice(0, index).split("\n").slice(0, -1).reverse();
  for (const line of lines) {
    if (line.trim() === "") return "";
    if (line.trim().endsWith(":")) return line;
  }
  return "";
}

/** Damage bonuses in a text, in order of appearance; melee if the bonus or the heading above it names melee. */
export function bonusQuotes(
  text: string,
  source: ArmorBonusQuote["source"],
  meleeNames: string[] = [],
): ArmorBonusQuote[] {
  const melee = new RegExp(
    [...MELEE_WORDS, ...meleeNames.map(escapeRegExp)].join("|"),
    "i",
  );
  return BONUS_PATTERNS.flatMap((pattern) =>
    [...text.matchAll(pattern)].map((m) => ({
      index: m.index,
      bonus: {
        // highest of stacked values, PvP values in brackets left out
        percent: Math.max(
          ...[
            ...m[0].replace(/\[[^\]]*\]/g, "").matchAll(/(\d+(?:\.\d+)?)%/g),
          ].map((n) => Number(n[1])),
        ),
        quote: m[0],
        source,
        melee: melee.test(m[0]) || melee.test(headingAbove(text, m.index)),
      },
    })),
  )
    .sort((a, b) => a.index - b.index)
    .map((m) => m.bonus);
}

/** Modelled effects a text grants, e.g. "grant Radiant for 7.5 seconds" (rule 4c). */
export function grantedEffects(
  text: string,
  effects: ArmorImportInputs["effects"],
): { id: string; quote: string }[] {
  return effects.flatMap((effect) => {
    // "Lumina (Blessing of the Sky)" may be named "Lumina" or "Blessing of the Sky";
    // a name after "to" is a target, e.g. "grants +30 Airborne Effectiveness to Lumina"
    const names = effect.name.split(/\s*[()]\s*/).filter((n) => n !== "");
    for (const name of names) {
      const match = new RegExp(
        String.raw`\b(?:grants?|gains?)\b[^.\n]{0,60}?(?<!\bto )\b${escapeRegExp(name)}\b`,
        "i",
      ).exec(text);
      if (match) return [{ id: effect.id, quote: match[0] }];
    }
    return [];
  });
}

/** Quoted Reload Duration Multiplier, strongest of stacked values (rule 5). */
export function reloadFactor(
  text: string,
  source: "compendium" | "clarity",
): ExoticArmorEntry["timing"] {
  const match = RELOAD_FACTOR.exec(text);
  if (!match) return null;
  const factors = [...match[0].matchAll(/(\d+(?:\.\d+)?)\??x/g)].map((m) =>
    Number(m[1]),
  );
  return {
    change: "reloadDuration",
    factor: Math.min(...factors),
    quote: match[0],
    source,
  };
}

/** Modelled effects a text only extends, e.g. "Weapons of Light … can now persist" (rule 5). */
function extendedEffects(
  text: string,
  effects: ArmorImportInputs["effects"],
): { id: string; quote: string }[] {
  return effects.flatMap((effect) => {
    const names = effect.name.split(/\s*[()]\s*/).filter((n) => n !== "");
    for (const name of names) {
      const match = new RegExp(
        String.raw`\b${escapeRegExp(name)}\b${EXTENDS}`,
        "i",
      ).exec(text);
      if (match) return [{ id: effect.id, quote: match[0] }];
    }
    return [];
  });
}

/** Bucket a text names itself (rule 4a). */
function statedBucket(text: string): ArmorBonusBucket | null {
  const match = STATED_BUCKET.exec(text) ?? BRACKETED_BUCKET.exec(text);
  if (!match) return null;
  const bucket = BUCKET_OF_WORD.find(([word]) => word.test(match[1]));
  return bucket
    ? { bucketId: bucket[1], basis: "text", quote: match[0].trim() }
    : null;
}

// Sources write some names with typographic apostrophes, e.g. "Fortune’s Favor", and Court marks
// some with a trailing * or ^, e.g. "Hazardous Propulsion*".
const plainName = (name: string) =>
  name
    .replace(/’/g, "'")
    .replace(/[*^]+$/, "")
    .trim();
const sameName = (a: string, b: string) => plainName(a) === plainName(b);

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const quoted = (bonuses: ArmorBonusQuote[]) =>
  bonuses.map((b) => `${b.source}: „${b.quote}“`).join("; ");
const MELEE_NOTE =
  "Melee-Boni zählen nicht (Melee-Buffs addieren sich, Modell fehlt)";

type Verdict = Pick<
  ExoticArmorEntry,
  "kind" | "rule" | "reason" | "bonusBucket"
>;

/** Verdict for a bonus from a text once its bucket is known (rules 3 and 4). */
function textBonus(
  rule: number,
  bonuses: ArmorBonusQuote[],
  bucket: ArmorBonusBucket,
): Verdict {
  const usable = bonuses.filter((b) => !b.melee);
  const melee = bonuses.length > usable.length ? `; ${MELEE_NOTE}` : "";
  if (usable.length === 0)
    return {
      kind: "gap",
      rule,
      reason: `nur Melee-Boni (${quoted(bonuses)}); Melee-Buffs addieren sich, Modell fehlt`,
      bonusBucket: null,
    };
  return {
    kind: "damageBuff",
    rule,
    reason: `${bucket.bucketId} (${bucket.basis === "court" ? "Court-Liste" : `„${bucket.quote}“`}); ${quoted(usable)}${melee}`,
    bonusBucket: bucket,
  };
}

function verdict(
  aegisRowIds: string[],
  court: CourtEntry[],
  bonuses: ArmorBonusQuote[],
  granted: { id: string; quote: string }[],
  timing: ExoticArmorEntry["timing"],
  effects: ArmorImportInputs["effects"],
  text: string,
  intrinsicsDefinition: string,
): Verdict {
  if (aegisRowIds.length > 0)
    return {
      kind: "abilityVariant",
      rule: 1,
      reason: `Aegis-Paket: ${aegisRowIds.join(", ")}`,
      bonusBucket: null,
    };
  const valued = court.filter(
    (e) => e.pve !== null && e.category !== INTRINSICS,
  );
  if (valued.length > 0)
    return {
      kind: "damageBuff",
      rule: 2,
      reason: valued
        .map((e) => `Court ${e.category}: ${e.pve} für ${e.pveDuration}`)
        .join("; "),
      bonusBucket: null,
    };
  if (court.some((e) => e.category === INTRINSICS))
    return bonuses.length > 0
      ? textBonus(3, bonuses, {
          bucketId: "exoticIntrinsic",
          basis: "court",
          quote: INTRINSICS,
        })
      : {
          kind: "gap",
          rule: 3,
          reason:
            "Court Exotic Intrinsic, aber kein Wert in Compendium oder Clarity",
          bonusBucket: null,
        };
  if (granted.length > 0)
    return {
      kind: "grantsEffect",
      rule: 4,
      reason: `gibt ${granted.map((g) => `${g.id} („${g.quote}“)`).join("; ")}`,
      bonusBucket: null,
    };
  if (bonuses.length > 0)
    return textBonus(
      4,
      bonuses,
      statedBucket(text) ?? {
        bucketId: "exoticIntrinsic",
        basis: "courtDefinition",
        quote: intrinsicsDefinition,
      },
    );
  const extended = extendedEffects(text, effects);
  if (extended.length > 0)
    return {
      kind: "noDamage",
      rule: 5,
      reason: `verlängert ${extended.map((e) => `${e.id} („${e.quote}“)`).join("; ")}; das Modell hält auffrischbare Buffs ohnehin die ganze Damage Phase aktiv`,
      bonusBucket: null,
    };
  if (timing)
    return {
      kind: "weaponTiming",
      rule: 5,
      reason: `Reload ×${timing.factor} (${timing.source}: „${timing.quote}“)`,
      bonusBucket: null,
    };
  const withoutResist = text.replace(RESIST, "");
  if (OWN_DAMAGE.test(withoutResist))
    return {
      kind: "ownDamage",
      rule: 5,
      reason: `eigener Schaden („${OWN_DAMAGE.exec(withoutResist)![0]}“), Damage Instances von Exotics kommen später`,
      bonusBucket: null,
    };
  if (TIMING_WORD.test(text))
    return {
      kind: "gap",
      rule: 5,
      reason: `Timing ohne Faktor („${TIMING_WORD.exec(text)![0]}“), Modell fehlt`,
      bonusBucket: null,
    };
  if (ENERGY.test(text))
    return {
      kind: "energyOnly",
      rule: 5,
      reason: "nur Energie; die Rotation legt die Casts fest, Modell fehlt",
      bonusBucket: null,
    };
  if (DAMAGE_WORD.test(withoutResist))
    return {
      kind: "gap",
      rule: 5,
      reason: "Text nennt Schaden, aber keinen klaren Bonus",
      bonusBucket: null,
    };
  return {
    kind: "noDamage",
    rule: 6,
    reason: "kein Schadenswort im Text",
    bonusBucket: null,
  };
}

/** One entry per exotic armor piece of the manifest, sorted by name. */
export function classifyExoticArmor(
  inputs: ArmorImportInputs,
): ExoticArmorEntry[] {
  const definition = inputs.courtCategories.find(
    (c) => c.name === INTRINSICS_DEFINITION,
  );
  if (!definition)
    throw new Error(`Court's category "${INTRINSICS_DEFINITION}" is missing`);
  const intrinsicsDefinition = definition.description.split("\n")[0];

  return [...inputs.armor]
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((piece) => {
      const compendiumText = inputs.compendium
        .filter((e) => sameName(e.name, piece.name))
        .map((e) => e.text)
        .join("\n");
      const clarityText = inputs.clarity
        .filter((e) => e.itemName !== null && sameName(e.itemName, piece.name))
        .map((e) => e.text)
        .join("\n");
      const court = inputs.court.filter(
        (e) => sameName(e.name, piece.name) && e.category in BUCKET_OF_CATEGORY,
      );
      const aegisRowIds = inputs.aegisAbilities
        .filter((r) => r.assumptions.includes(piece.name))
        .map((r) => r.id);
      const bonuses = [
        ...bonusQuotes(compendiumText, "compendium", inputs.meleeNames),
        ...bonusQuotes(clarityText, "clarity", inputs.meleeNames),
      ];
      const texts = [compendiumText, clarityText].join("\n");
      const granted = grantedEffects(texts, inputs.effects);
      const timing =
        reloadFactor(compendiumText, "compendium") ??
        reloadFactor(clarityText, "clarity");
      const { bonusBucket, ...rest } = verdict(
        aegisRowIds,
        court,
        bonuses,
        granted,
        timing,
        inputs.effects,
        [texts, piece.description].join("\n"),
        intrinsicsDefinition,
      );
      return {
        id: kebab(piece.name),
        hash: piece.hash,
        name: piece.name,
        guardianClass: piece.guardianClass,
        slot: piece.slot,
        intrinsic: piece.intrinsics[0] ?? null,
        ...rest,
        aegisRowIds,
        courtBuffs: court.map((e) => ({
          bucketId: BUCKET_OF_CATEGORY[e.category],
          trigger: e.trigger,
          pve: e.pve,
          pveDuration: e.pveDuration,
        })),
        bonuses,
        bonusBucket,
        grantsEffectIds: granted.map((g) => g.id),
        timing,
      };
    });
}

const KIND_TITLES: [ExoticArmorEntry["kind"], string][] = [
  ["abilityVariant", "Ability-Varianten (Regel 1)"],
  ["damageBuff", "Schadens-Buffs (Regeln 2 bis 4)"],
  ["grantsEffect", "Geben einen Effect (Regel 4c)"],
  ["weaponTiming", "Waffen-Timing (Regel 5)"],
  ["ownDamage", "Eigener Schaden, kommt später (Regel 5)"],
  ["energyOnly", "Nur Energie, Modell fehlt (Regel 5)"],
  ["gap", "Lücken (Regeln 3 bis 5)"],
  ["noDamage", "Ohne Schadenswirkung (Regeln 5 und 6)"],
];

const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Review table docs/armor-import.md (ADR 0014, point 5). */
export function renderArmorImport(entries: ExoticArmorEntry[]): string {
  const lines = [
    "# Prüftabelle Exotic-Rüstung",
    "",
    "Erzeugt von `npm run build:armor` (ADR 0014), nicht von Hand bearbeiten.",
    "Quellen: Manifest, Aegis „Abilties“, Court's Stacking Guide, Compendium „Exotic Armors“, Clarity.",
    "",
    "| Art | Anzahl |",
    "| --- | --- |",
    ...KIND_TITLES.map(
      ([kind, title]) =>
        `| ${title} | ${entries.filter((e) => e.kind === kind).length} |`,
    ),
  ];
  for (const [kind, title] of KIND_TITLES) {
    lines.push(
      "",
      `## ${title}`,
      "",
      "| Exotic | Klasse | Slot | Regel | Grund |",
      "| --- | --- | --- | --- | --- |",
      ...entries
        .filter((e) => e.kind === kind)
        .map(
          (e) =>
            `| ${cell(e.name)} | ${e.guardianClass ?? "alle"} | ${e.slot} | ${e.rule} | ${cell(e.reason)} |`,
        ),
    );
  }
  return lines.join("\n") + "\n";
}
