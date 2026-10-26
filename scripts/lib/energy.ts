// Ability energy from the Compendium (block 3, "Energie einfach"): cooldowns and chunk scalars of all
// abilities from the subclass tabs, the stat factors, and the energy modifiers of exotics, aspects and
// abilities from a spec table. The spec names the Compendium line and what the line changes; the value
// comes from the line. Every Compendium line about energy gets a verdict in docs/energy-import.md.

import type {
  AbilityData,
  AbilityEnergy,
  CompendiumEntry,
  EnergyData,
  EnergyModifier,
  EnergyOverrides,
  EnergyStat,
  Source,
} from "../../src/data/schema.ts";

const URL = "https://destiny2.science/data-compendium";
const GAME_MECHANICS = "docs/sources/compendium-game-mechanics-energy.txt";

export type EnergyInputs = {
  abilities: AbilityData[];
  compendiumAbilities: CompendiumEntry[];
  compendiumArmor: CompendiumEntry[];
  overrides: EnergyOverrides; // single cases where another source beats the Compendium (K5)
  retrieved: string; // date of the Compendium snapshots
};

// Stat factors (Compendium, Game Mechanics). Regeneration at stat 100: owner value (ADR 0014, point 9).
const OWNER_REGEN: Source = {
  name: "Owner (Gemini answer citing Reddit), ADR 0014 point 9",
  retrieved: "2026-10-23",
  status: "unverified",
  quote:
    "Seit den Anpassungen im Monument of Triumph-Update regenerieren Granaten und Nahkampf-Fähigkeiten bei Stat 100 exakt 2,48-mal so schnell (entspricht +148 % höherer Regenerationsrate) wie bei Stat 0.",
  note: "The Compendium leaves the rate open (\"?%\"). Linear from stat 0 to 100 is our assumption; the stat no longer changes regeneration above 100.",
};
const gameMechanics = (quote: string, note?: string): Source => ({
  name: "Destiny Data Compendium, Game Mechanics, Armor Stats",
  url: URL,
  retrieved: "2026-10-23",
  status: "verified",
  quote,
  note: `Saved in ${GAME_MECHANICS}.${note ? ` ${note}` : ""}`,
});
const missingGain = (kind: string): Source => ({
  ...gameMechanics(`Provides up to ?% Increased ${kind} Ability Chunk Gains at 100 points.`),
  status: "missing",
});

export const ENERGY_STATS: EnergyStat[] = [
  {
    kind: "grenade",
    fullAtStat: 100,
    regenAtFullStat: { value: 2.48, source: OWNER_REGEN },
    gainBonusAtFullStat: {
      value: 2.115,
      source: gameMechanics(
        "Stat provides up to ?% Additional Base Grenade Ability Regeneration Rate and 211.5%% Increased Grenade Ability Gains at 100 points.",
      ),
    },
  },
  {
    kind: "melee",
    fullAtStat: 100,
    regenAtFullStat: { value: 2.48, source: OWNER_REGEN },
    gainBonusAtFullStat: { value: null, source: missingGain("Melee") },
  },
  {
    kind: "super",
    fullAtStat: 100,
    regenAtFullStat: {
      value: 1,
      source: gameMechanics(
        "Super | Grants Increased Super Ability Gains per point.",
        "The super stat names only gains, no regeneration rate.",
      ),
    },
    gainBonusAtFullStat: { value: null, source: missingGain("Super") },
  },
];

// "Base Cooldown: 52.1 seconds" or, with the PvP value in brackets, "56 [148.4]s"
const COOLDOWN = /Base Cooldown:\s*(\d+(?:\.\d+)?)(?: seconds|\s*\[[^\]]*\]s)|^(?:.*\n)*?\s*(\d+(?:\.\d+)?) seconds\./;
const CHUNK = /Chunk Scalar:\s*(\d+(?:\.\d+)?)x/;

/** Cooldown and chunk scalar of every base ability from the "extra" cell of its Compendium entry. */
export function abilityEnergy(inputs: EnergyInputs): AbilityEnergy[] {
  return inputs.abilities
    .filter((a) => a.compendium && !a.variantOf)
    .map((ability) => {
      const { tab, entry: name } = ability.compendium!;
      const entry = inputs.compendiumAbilities.find((e) => e.tab === tab && e.name === name);
      if (!entry) throw new Error(`no Compendium entry ${tab} / ${name} for ${ability.id}`);
      const source = (quote: string): Source => ({
        name: `Destiny Data Compendium, ${tab} (${name})`,
        url: URL,
        retrieved: inputs.retrieved,
        status: "verified",
        quote,
      });
      const cooldown = entry.extra.match(COOLDOWN);
      const chunk = entry.extra.match(CHUNK);
      const seconds = cooldown?.[1] ?? cooldown?.[2];
      const override = inputs.overrides.abilities.find((o) => o.abilityId === ability.id);
      const chunkScalar =
        override?.chunkScalar ??
        (chunk ? { value: Number(chunk[1]), source: source(chunk[0]) } : undefined);
      return {
        abilityId: ability.id,
        cooldownSeconds:
          override?.cooldownSeconds ??
          (seconds
            ? { value: Number(seconds), source: source(cooldown![0].trim()) }
            : {
                value: null,
                source: { ...source(entry.extra), status: "missing" as const, quote: undefined },
              }),
        ...(chunkScalar ? { chunkScalar } : {}),
      };
    });
}

type ItemRef = { snapshot: "armor" | "abilities"; name: string; tab?: string };

/** One energy change: the Compendium line it comes from and what it changes. */
export type EnergySpec = Omit<EnergyModifier, "value" | "name" | "fixed"> & {
  item: ItemRef;
  line: RegExp; // the line with the value
  // percent: first "N%" ÷ 100; factor: first "N.Nx"; one: the text says "an extra" or "Fully"
  read: "percent" | "factor" | "one";
  percentOf?: RegExp; // percent: the number in its first group instead of the first "N%"
  fixed?: true;
  note?: string;
};

const GRENADE = { kinds: ["grenade" as const] };
const MELEE = { kinds: ["melee" as const] };
const SUPER = { kinds: ["super" as const] };
const armor = (name: string): ItemRef => ({ snapshot: "armor", name });

export const ENERGY_SPECS: EnergySpec[] = [
  // Extra charges
  ...(
    [
      ["armamentarium", "Armamentarium", GRENADE],
      ["claws-of-ahamkara", "Claws of Ahamkara", MELEE],
      ["nothing-manacles", "Nothing Manacles", { kinds: ["grenade"], abilityIds: ["scatter-grenade"] }],
      ["ophidia-spathe", "Ophidia Spathe", { kinds: ["melee"], elements: ["solar"] }],
      ["starfire-protocol", "Starfire Protocol", { kinds: ["grenade"], abilityIds: ["fusion-grenade"] }],
      ["shinobus-vow", "Shinobu's Vow", { kinds: ["grenade"], abilityIds: ["skip-grenade"] }],
      ["second-chance", "Second Chance", { kinds: ["melee"], abilityIds: ["shield-throw"] }],
      ["wishful-ignorance", "Wishful Ignorance", { kinds: ["melee"], abilityIds: ["frenzied-blade"] }],
    ] as const
  ).map(
    ([id, name, target]): EnergySpec => ({
      id: `${id}-charge`,
      item: armor(name),
      line: /(extra|additional) .*Charge/,
      read: "one",
      from: { exoticArmorId: id },
      target: { ...target, kinds: [...target.kinds] } as EnergySpec["target"],
      change: "charges",
    }),
  ),
  {
    id: "chaos-accelerant-charge",
    item: { snapshot: "abilities", name: "Chaos Accelerant", tab: "Void" },
    line: /^Grants an extra Grenade Ability Charge/,
    read: "one",
    from: { effectId: "chaos-accelerant" },
    target: GRENADE,
    change: "charges",
  },
  // Regeneration
  {
    id: "starfire-protocol-regen",
    item: armor("Starfire Protocol"),
    line: /Additional Base Fusion Grenade Regeneration Rate/,
    read: "percent",
    from: { exoticArmorId: "starfire-protocol" },
    target: { kinds: ["grenade"], abilityIds: ["fusion-grenade"] },
    change: "regenBase",
  },
  {
    id: "eye-of-another-world-regen",
    item: armor("Eye of Another World"),
    line: /Additional Base Grenade, Melee, and Class Regeneration Rate/,
    read: "percent",
    from: { exoticArmorId: "eye-of-another-world" },
    target: { kinds: ["grenade", "melee"] },
    change: "regenBase",
  },
  {
    id: "chaos-accelerant-regen",
    item: { snapshot: "abilities", name: "Chaos Accelerant", tab: "Void" },
    line: /Passively grants 1\.15x Grenade Regeneration Speed/,
    read: "factor",
    from: { effectId: "chaos-accelerant" },
    target: {
      kinds: ["grenade"],
      abilityIds: ["magnetic-grenade", "void-spike-grenade", "suppressor-grenade"],
    },
    change: "regenSpeed",
  },
  ...(
    [
      ["grenade", "melee"],
      ["melee", "grenade"],
    ] as const
  ).map(
    ([cast, gets]): EnergySpec => ({
      id: `heart-of-inmost-light-${gets}`,
      item: armor("Heart of Inmost Light"),
      line: /^x1 = .*Additional Base Grenade and Melee Regeneration Rate/,
      read: "percent",
      from: { exoticArmorId: "heart-of-inmost-light" },
      target: { kinds: [gets] },
      change: "regenBase",
      trigger: { on: "cast", abilities: { kinds: [cast] }, durationSeconds: 5 },
      note: "One stack (x1) for 5 seconds after a cast of the other ability; class ability not modelled.",
    }),
  ),
  // Energy per trigger
  {
    id: "starfire-protocol-weapon-hit",
    item: armor("Starfire Protocol"),
    line: /Fusion Grenade Ability Energy per Weapon Hit up to once every 0\.4 seconds/,
    read: "percent",
    from: { exoticArmorId: "starfire-protocol" },
    target: { kinds: ["grenade"], abilityIds: ["fusion-grenade"] },
    change: "energy",
    trigger: { on: "weaponHit", cooldownSeconds: 0.4 },
    requiresAnyEffectIds: ["radiant", "well-of-radiance", "empowering-rift"],
    note: "While Radiant or in Well of Radiance or Empowering Rift; the weapon hits at least every 0.4 seconds.",
  },
  {
    id: "shinobus-vow-skip-hit",
    item: armor("Shinobu's Vow"),
    line: /^Skip Grenades hits grant/,
    read: "percent",
    from: { exoticArmorId: "shinobus-vow" },
    target: { kinds: ["grenade"], abilityIds: ["skip-grenade"] },
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["grenade"], abilityIds: ["skip-grenade"] } },
  },
  {
    id: "young-ahamkaras-spine-hit",
    item: armor("Young Ahamkara's Spine"),
    line: /^Grenade and Melee Ability Hits grant/,
    read: "percent",
    from: { exoticArmorId: "young-ahamkaras-spine" },
    target: { kinds: ["grenade"], abilityIds: ["tripmine-grenade"] },
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["grenade", "melee"] } },
  },
  {
    id: "an-insurmountable-skullfort-hit",
    item: armor("An Insurmountable Skullfort"),
    line: /Melee Ability Energy on Powered Melee Hit/,
    read: "percent",
    from: { exoticArmorId: "an-insurmountable-skullfort" },
    target: { kinds: ["melee"], elements: ["arc"] },
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["melee"], elements: ["arc"] } },
  },
  {
    id: "shards-of-galanor-refund",
    item: armor("Shards of Galanor"),
    line: /^Elite = ~20% \| Boss = 50%/,
    read: "percent",
    percentOf: /Boss = (\d+(?:\.\d+)?)%/,
    fixed: true,
    from: { exoticArmorId: "shards-of-galanor" },
    target: { kinds: ["super"], abilityIds: ["blade-barrage"] },
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["super"], abilityIds: ["blade-barrage"] } },
    note: "Value against a boss; the refund is unaffected by the super stat.",
  },
  {
    id: "apotheosis-veil-restore",
    item: armor("Apotheosis Veil"),
    line: /^Fully restores Health, Grenade, Melee, and Class Ability Energy/,
    read: "one",
    fixed: true,
    from: { exoticArmorId: "apotheosis-veil" },
    target: { kinds: ["grenade", "melee"] },
    change: "energy",
    trigger: { on: "cast", abilities: SUPER },
    note: "On super cast. The 66% per second for 8 seconds after the super is missing (no trigger at the super end).",
  },
  {
    id: "lucky-raspberry-jolt",
    item: armor("Lucky Raspberry"),
    line: /^Grants 15% Arcbolt Grenade Ability Energy/,
    read: "percent",
    from: { exoticArmorId: "lucky-raspberry" },
    target: { kinds: ["grenade"], abilityIds: ["arcbolt-grenade"] },
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["grenade"], abilityIds: ["arcbolt-grenade"] } },
    note: "Upon inflicting Jolt; the first target of an Arcbolt is jolted. Chain damage needs a second enemy.",
  },
  {
    id: "mask-of-fealty-hit",
    item: armor("Mask of Fealty"),
    line: /^Grants 7\.5% Fixed Melee Ability Energy/,
    read: "percent",
    fixed: true,
    from: { exoticArmorId: "mask-of-fealty" },
    target: { kinds: ["melee"], abilityIds: ["withering-blade"] },
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["melee"], abilityIds: ["withering-blade"] } },
    note: "On Withering Blade hits and bounces; counted once per cast.",
  },
  {
    id: "ballistic-slam-super",
    item: { snapshot: "abilities", name: "Ballistic Slam", tab: "Arc" },
    line: /^Grants 3% Super Energy/,
    read: "percent",
    from: { abilityId: "ballistic-slam" },
    target: SUPER,
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["melee"], abilityIds: ["ballistic-slam"] } },
  },
  // Class abilities (U7)
  {
    id: "gamblers-dodge-melee",
    item: { snapshot: "abilities", name: "Gambler's Dodge", tab: "Class Abilities" },
    line: /^Performs a deft tumble that grants/,
    read: "percent",
    percentOf: /up to (\d+(?:\.\d+)?)% \[/,
    fixed: true,
    from: { abilityId: "gamblers-dodge" },
    target: MELEE,
    change: "energy",
    trigger: { on: "cast", abilities: { kinds: ["classAbility"], abilityIds: ["gamblers-dodge"] } },
    note: "Value at 100 Melee Stat (the default); near the boss it doubles, capped at a full bar.",
  },
  {
    id: "empowering-rift-regen",
    item: { snapshot: "abilities", name: "Empowering Rift", tab: "Class Abilities" },
    line: /Additional Base Grenade and Melee/,
    read: "percent",
    percentOf: /(\d+(?:\.\d+)?)% \[[^\]]*\] Additional Base Grenade and Melee/,
    from: { abilityId: "empowering-rift" },
    target: { kinds: ["grenade", "melee"] },
    change: "regenBase",
    trigger: {
      on: "cast",
      abilities: { kinds: ["classAbility"], abilityIds: ["empowering-rift"] },
      durationSeconds: 15,
    },
    note: "While standing in the Rift for its 15 seconds.",
  },
];

/** Lines the review table covers: energy gains, charges and regeneration. */
const ENERGY_LINE =
  /\d+(?:\.\d+)?%[^.\n]{0,40}?(Grenade|Melee|Super|Class|Ability)[^.\n]{0,15}Energy|\b(extra|additional)\b[^.\n]*Charge|Regeneration (Rate|Speed)|Recharge Rate/i;

// Verdicts by rule, in this order; the first match wins.
const AUTO_SKIPS: [RegExp, string][] = [
  [/\bkill|final blow|defeat/i, "Kills: ein Boss, keine Adds (ADR 0015)"],
  [/\b(drain|drains|consum|cost)/i, "Verbrauch, kein Gewinn"],
  [/\borbs?\b/i, "Orbs entstehen nur aus Kills"],
  [/damaged|critical health|guard|block|receiv|being hit|shield/i, "Schaden nehmen gehört nicht zur Spielweise"],
  [/^(?!.*(grenade|melee|super)).*class/i, "Class Ability nicht modelliert"],
];

// Verdicts by hand for the lines no spec or rule covers: item name → reason.
const NOT_IN_MODEL = "Ability oder Item nicht im Modell";
const STACKS = "Stapel oder Zähler, Aufbau nicht modelliert";
const OWN_SUPER = "verlängert die laufende Super, keine neue";
const CONDITION = "Bedingung außerhalb des Boss-Kampfs (Sprint, Gruppe, Aufheben)";
export const SKIPPED: Record<string, string> = {
  "An Insurmountable Skullfort": "nur der höchste Wert (Powered Melee Hit) zählt, „up to once per melee“",
  "Apotheosis Veil": "Trigger am Ende der Super fehlt; übernommen ist der Cast",
  "Arcane Needle": "eingebaute Ladungen der Ability nicht modelliert",
  Benevolence: "Heilen von Verbündeten nicht modelliert",
  "Blight Ranger": OWN_SUPER,
  "Bolt Charge": STACKS,
  "Caliban's Hand": "Proximity Knife und Scorch-Ticks pro Melee nicht modelliert",
  "Chaos Reach": OWN_SUPER,
  "Child of the Old Gods": "Healing Rift nicht modelliert",
  "Contraverse Hold": "Chaotic Exchange (Charged Grenade halten) nicht modelliert",
  "Crown of Tempests": STACKS,
  "Fallen Sunstar": "Ionic Traces ohne Wert",
  "Fr0st-EE5": CONDITION,
  "Frenzied Blade": "eingebaute Ladungen der Ability nicht modelliert",
  "Geomag Stabilizers": OWN_SUPER,
  "Getaway Artist": "Arc Soul nicht modelliert",
  Grapple: NOT_IN_MODEL,
  "Graviton Forfeit": "Unsichtbarkeit nicht modelliert",
  "Hallowfire Heart": "Werte unter dem Maximum fehlen („?%“), Bedingung Super geladen",
  "Handheld Supernova Chaos Accelerant": "Handheld Supernova nicht modelliert",
  "Howl of the Storm": NOT_IN_MODEL,
  Hunger: "Stasis Shards nicht modelliert",
  "Icarus Dash": "Class Ability nicht modelliert",
  "Into The Fray": "Woven Mail als Bedingung nicht modelliert",
  "Lucky Raspberry": "Chain-Schaden braucht ein zweites Ziel",
  "Mask of Fealty": "übernommen ist der Treffer",
  "Melas Panoplia": "Forge Master nicht modelliert",
  Moirai: NOT_IN_MODEL,
  "Nezarec's Sin": "Auslöser ist ein Kill",
  Omnioculus: NOT_IN_MODEL,
  "Orpheus Rig": "Treffer auf mehrere Gegner (Tethers) nicht modelliert",
  "Osmiomancy Gloves": NOT_IN_MODEL,
  "Peregrine Greaves": "Champions, Tormentors und Minibosses, nicht Bosse",
  "Phoenix Protocol": "Auslöser ist ein Kill",
  Provision: "Grenade halten nicht modelliert",
  "Raiju's Harness": "Werte fehlen („?%“)",
  Shards: "Stasis Crystals nicht modelliert",
  Shieldburst: STACKS,
  "Shinobu's Vow": STACKS,
  "Shiver Strike": "nur wenn kein Treffer",
  "Song of Flame": OWN_SUPER,
  "Stasis Shard": "Stasis Shards nicht modelliert",
  Sunbracers: "Auslöser ist ein Kill",
  "Throwing Hammer": CONDITION,
  "Touch of Thunder": NOT_IN_MODEL,
  "Touch of Winter": "Bosse lassen sich nicht einfrieren",
  Transcendence: "Transcendence nicht modelliert",
  "Ursa Furiosa": "Unbreakable nicht modelliert",
  "Verity's Brow": STACKS,
  "Widow's Silk": NOT_IN_MODEL,
  "Winter's Guile": STACKS,
  "Wishful Ignorance": CONDITION,
  "Young Ahamkara's Spine": "Crackshot nicht modelliert",
};

export type EnergyRow = {
  snapshot: string;
  section: string;
  name: string;
  line: string;
  verdict: "imported" | "skipped" | "unclassified";
  target: string; // modifier id or reason
};

const firstPercent = (line: string) => Number(line.match(/(\d+(?:\.\d+)?)%/)![1]) / 100;
const firstFactor = (line: string) => Number(line.match(/(\d+(?:\.\d+)?)x/)![1]);

function findLine(inputs: EnergyInputs, spec: EnergySpec): { entry: CompendiumEntry; line: string } {
  const entries =
    spec.item.snapshot === "armor" ? inputs.compendiumArmor : inputs.compendiumAbilities;
  for (const entry of entries) {
    if (entry.name !== spec.item.name || (spec.item.tab && entry.tab !== spec.item.tab)) continue;
    const line = entry.text.split("\n").find((l) => spec.line.test(l));
    if (line) return { entry, line: line.trim() };
  }
  throw new Error(`energy spec ${spec.id}: no line ${spec.line} in ${spec.item.name}`);
}

function modifier(inputs: EnergyInputs, spec: EnergySpec): EnergyModifier {
  const { entry, line } = findLine(inputs, spec);
  const value =
    spec.read === "percent"
      ? spec.percentOf
        ? Number(line.match(spec.percentOf)![1]) / 100
        : firstPercent(line)
      : spec.read === "factor"
        ? firstFactor(line)
        : 1;
  const tab = spec.item.snapshot === "armor" ? "Exotic Armors" : entry.tab;
  const { id, from, target, change, trigger, requiresAnyEffectIds, note } = spec;
  return {
    id,
    from,
    target,
    change,
    ...(trigger ? { trigger } : {}),
    ...(requiresAnyEffectIds ? { requiresAnyEffectIds } : {}),
    name: spec.item.name,
    fixed: spec.fixed ?? false,
    value: {
      value,
      source: {
        name: `Destiny Data Compendium, ${tab} (${spec.item.name})`,
        url: URL,
        retrieved: inputs.retrieved,
        status: "verified",
        quote: line,
        ...(note || spec.read === "one"
          ? { note: [spec.read === "one" ? "Value 1 from the wording." : "", note ?? ""].join(" ").trim() }
          : {}),
      },
    },
  };
}

/** Energy Data File and one review row per Compendium line about energy. */
export function energyData(inputs: EnergyInputs): { data: EnergyData; rows: EnergyRow[] } {
  const modifiers = [
    ...ENERGY_SPECS.map((spec) => modifier(inputs, spec)),
    ...inputs.overrides.modifiers,
  ];
  const rows: EnergyRow[] = [];
  for (const [snapshot, entries] of [
    ["armor", inputs.compendiumArmor],
    ["abilities", inputs.compendiumAbilities],
  ] as const) {
    for (const entry of entries) {
      let heading = ""; // a line ending with ":" names the trigger of the lines below, e.g. "On Golden Gun Kill:"
      for (const raw of entry.text.split("\n")) {
        const line = raw.trim();
        if (line === "") heading = "";
        else if (line.endsWith(":")) heading = line;
        if (!ENERGY_LINE.test(line)) continue;
        const spec = ENERGY_SPECS.find(
          (s) =>
            s.item.snapshot === snapshot &&
            s.item.name === entry.name &&
            (!s.item.tab || s.item.tab === entry.tab) &&
            s.line.test(line),
        );
        const auto = AUTO_SKIPS.find(([re]) => re.test(`${heading} ${line}`));
        const hand = SKIPPED[entry.name];
        rows.push({
          snapshot,
          section: snapshot === "armor" ? entry.section : `${entry.tab}, ${entry.section}`,
          name: entry.name,
          line,
          ...(spec
            ? { verdict: "imported" as const, target: spec.id }
            : auto
              ? { verdict: "skipped" as const, target: auto[1] }
              : hand
                ? { verdict: "skipped" as const, target: hand }
                : { verdict: "unclassified" as const, target: "" }),
        });
      }
    }
  }
  return {
    data: { stats: ENERGY_STATS, abilities: abilityEnergy(inputs), modifiers },
    rows,
  };
}

const cell = (text: string) => text.replace(/\|/g, "\\|");

/** Review table: every Compendium line about energy with its verdict. */
export function renderEnergy(data: EnergyData, rows: EnergyRow[]): string {
  const missing = data.abilities.filter((a) => a.cooldownSeconds.value === null);
  const count = (v: EnergyRow["verdict"]) => rows.filter((r) => r.verdict === v).length;
  return [
    "# Energie-Import",
    "",
    "Generiert von `npm run build:energy` (`scripts/lib/energy.ts`). Nicht von Hand ändern.",
    "",
    `Cooldowns: ${data.abilities.length - missing.length} von ${data.abilities.length} Abilities${missing.length ? ` (fehlt: ${missing.map((a) => a.abilityId).join(", ")})` : ""}.`,
    `Compendium-Zeilen zu Energie: ${rows.length}, übernommen ${count("imported")}, übersprungen ${count("skipped")}, offen ${count("unclassified")}.`,
    "",
    "| Quelle | Reiter | Item | Zeile | Urteil | Ziel oder Grund |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${r.snapshot} | ${cell(r.section)} | ${cell(r.name)} | ${cell(r.line.slice(0, 160))} | ${r.verdict} | ${cell(r.target)} |`,
    ),
    "",
  ].join("\n");
}
