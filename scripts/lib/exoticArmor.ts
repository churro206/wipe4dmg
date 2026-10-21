// Classifies every exotic armor piece by fixed rules (ADR 0014, point 5); the first rule that matches wins.
// 1 Aegis ability package assumes it → abilityVariant
// 2 Court row with a value → damageBuff (bucket from Court's category)
// 3 Court lists it as exotic intrinsic → damageBuff with the bonus from Compendium or Clarity, else gap
// 4 a text names a damage bonus, no source names the bucket → gap
// 5 a text names damage without a clear bonus → gap
// 6 no damage word → noDamage

import type {
  ArmorBonusQuote,
  ClarityEntry,
  CompendiumEntry,
  CourtEntry,
  ExoticArmorEntry,
  ManifestArmorPiece,
} from "../../src/data/schema.ts";

export type ArmorImportInputs = {
  armor: ManifestArmorPiece[];
  aegisAbilities: { id: string; assumptions: string[] }[];
  court: CourtEntry[];
  compendium: CompendiumEntry[]; // tab Exotic Armors
  clarity: ClarityEntry[];
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

const NOT_A_BONUS = String.raw`(?!\s*(?:resist|reduction))`;
const BONUS_PATTERNS = [
  // "55% increased damage", "70% increased Super Damage", "100% more damage"
  new RegExp(
    String.raw`(\d+(?:\.\d+)?)%\s+(?:increased|more|bonus|additional)\s+(?:[A-Za-z]+\s+){0,2}?damage${NOT_A_BONUS}`,
    "gi",
  ),
  // "damage is increased by 150%"
  /damage (?:is )?increased by (\d+(?:\.\d+)?)%/gi,
];
const RESIST = /damage (resist(ance)?|reduction)/gi;
const DAMAGE_WORD = /damage|surge|weaken|ignit|radiant|empower|amplif|debuff/i;

/** Damage bonuses in a text, in order of appearance. */
export function bonusQuotes(
  text: string,
  source: ArmorBonusQuote["source"],
): ArmorBonusQuote[] {
  return BONUS_PATTERNS.flatMap((pattern) =>
    [...text.matchAll(pattern)].map((m) => ({
      index: m.index,
      bonus: { percent: Number(m[1]), quote: m[0], source },
    })),
  )
    .sort((a, b) => a.index - b.index)
    .map((m) => m.bonus);
}

// Sources write some names with typographic apostrophes, e.g. "Fortune’s Favor".
const sameName = (a: string, b: string) =>
  a.replace(/’/g, "'") === b.replace(/’/g, "'");

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type Verdict = Pick<ExoticArmorEntry, "kind" | "rule" | "reason">;

function verdict(
  aegisRowIds: string[],
  court: CourtEntry[],
  bonuses: ArmorBonusQuote[],
  text: string,
): Verdict {
  if (aegisRowIds.length > 0)
    return {
      kind: "abilityVariant",
      rule: 1,
      reason: `Aegis-Paket: ${aegisRowIds.join(", ")}`,
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
    };
  if (court.some((e) => e.category === INTRINSICS))
    return bonuses.length > 0
      ? {
          kind: "damageBuff",
          rule: 3,
          reason: `Court Exotic Intrinsic; ${bonuses.map((b) => `${b.source}: „${b.quote}“`).join("; ")}`,
        }
      : {
          kind: "gap",
          rule: 3,
          reason:
            "Court Exotic Intrinsic, aber kein Wert in Compendium oder Clarity",
        };
  if (bonuses.length > 0)
    return {
      kind: "gap",
      rule: 4,
      reason: `Bucket fehlt; ${bonuses.map((b) => `${b.source}: „${b.quote}“`).join("; ")}`,
    };
  if (DAMAGE_WORD.test(text.replace(RESIST, "")))
    return {
      kind: "gap",
      rule: 5,
      reason: "Text nennt Schaden, aber keinen klaren Bonus",
    };
  return { kind: "noDamage", rule: 6, reason: "kein Schadenswort im Text" };
}

/** One entry per exotic armor piece of the manifest, sorted by name. */
export function classifyExoticArmor(
  inputs: ArmorImportInputs,
): ExoticArmorEntry[] {
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
        ...bonusQuotes(compendiumText, "compendium"),
        ...bonusQuotes(clarityText, "clarity"),
      ];
      return {
        id: kebab(piece.name),
        hash: piece.hash,
        name: piece.name,
        guardianClass: piece.guardianClass,
        slot: piece.slot,
        intrinsic: piece.intrinsics[0] ?? null,
        ...verdict(
          aegisRowIds,
          court,
          bonuses,
          [compendiumText, clarityText, piece.description].join("\n"),
        ),
        aegisRowIds,
        courtBuffs: court.map((e) => ({
          bucketId: BUCKET_OF_CATEGORY[e.category],
          trigger: e.trigger,
          pve: e.pve,
          pveDuration: e.pveDuration,
        })),
        bonuses,
      };
    });
}

const KIND_TITLES: [ExoticArmorEntry["kind"], string][] = [
  ["abilityVariant", "Ability-Varianten (Regel 1)"],
  ["damageBuff", "Schadens-Buffs (Regeln 2 und 3)"],
  ["gap", "Lücken (Regeln 3 bis 5)"],
  ["noDamage", "Ohne Schadenswirkung (Regel 6)"],
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
