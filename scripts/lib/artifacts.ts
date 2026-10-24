// Seasonal artifacts from the Compendium tab "Artifact Perks" (seasonal artifact block). Every perk
// of every artifact gets a verdict: it switches on an effect of the model (name match or alias), or
// it is skipped with a reason, so none is lost. Only perks with an effect go into artifacts.json.
// Run: npm run build:artifacts

import type {
  ArtifactData,
  CompendiumEntry,
  Effect,
  SourcedNumber,
} from "../../src/data/schema.ts";

/** Perks whose name in the Compendium differs from the effect they switch on. */
const ALIASES: Record<string, string> = {
  "Combination Argent Blade": "argent-blade",
  "Elemental Overdrive": "elemental-overdrive-solar",
  "That Fresh Bullets Smell": "that-fresh-bullet-smell",
};

const NO_DAMAGE = "no damage (handling, ammo, healing, resistance or energy)";
const ADDS = "triggers only on kills or finishers of adds (ADR 0015: one boss, no adds)";
const UNDER_5 = "damage of its own under 5 % of a typical build";

/** Perks without an effect, with the reason (Compendium texts, tab Artifact Perks). */
const SKIPPED: Record<string, string> = {
  "Press The Advantage": NO_DAMAGE,
  "Dielectric": ADDS + "; Bolt Charge from Arc-debuffed kills",
  "Elemental Orbs: Arc": "needs 6 Arc weapon kills (adds); the orb itself is under 5 %",
  "Kinetic Synthesis": NO_DAMAGE,
  "Armorsmith": "needs a Combatant shield break or a finisher, which a boss does not give (+100 % melee for 6 s)",
  "Kinetic Rupture": "Compendium: 'Tends to decrease damage by 25% to 50% on almost every situation'",
  "Reload at Range": NO_DAMAGE,
  "Counter Energy": "needs a Champion stun; only ability energy",
  "Riposte": "Compendium: 'THIS DOESN'T DO ANYTHING AT ALL'",
  "Sword Storm Combo": "103 damage every 0.53 s for 6 s per combo: " + UNDER_5,
  "Power from Pain": ADDS + "; only Devour",
  "Fierce Proxemics": NO_DAMAGE,
  "Blinding Jolts": ADDS,
  "Tazer Tag": "about 800 to 1245 Arc damage per Arc melee: " + UNDER_5,
  "Rapid Remedy": NO_DAMAGE,
  "Sticker Shock": "raises three grenades only (Flux, Fusion, Magnetic): " + UNDER_5,
  "Threaded Blast": "288 damage per destroyed Tangle: " + UNDER_5,
  "Radiant Shrapnel": "needs damage of 10 % of the target's health or Scorched kills; a boss does not give it",
  "Elemental Benevolence": NO_DAMAGE,
  "Cauterized Darkness": "Compendium: only against Non-Boss Combatants",
  "Frost Renewal": NO_DAMAGE,
  "Elemental Daze": "needs a Champion stun; one explosion of 315: " + UNDER_5,
  "Horde Shuttle": "Threadlings need damage of 10 % of the target's health",
  "Shoulder to Shoulder": NO_DAMAGE,
  "Tangled Web": ADDS,
  "Refresh Threads": NO_DAMAGE,
  "Elemental Coalescence": NO_DAMAGE,
  "Frigid Glare": NO_DAMAGE,
  "Pack Tactics": "raises Threadling damage only: " + UNDER_5,
  "Iron Lord's Vigor": NO_DAMAGE,
  "Semi-Auto Striker": NO_DAMAGE,
  "Energy Acceleration": "Micro-Missile shockwave of 120: " + UNDER_5,
  "Hold the Line": NO_DAMAGE,
  "Vile Weave": "Sever on Tangle damage and Tangle cooldown: " + UNDER_5,
  "Elemental Supercharger": NO_DAMAGE,
  "Volatile Marksman": "Volatile Rounds need a model of the Volatile detonation of a weapon hit (later)",
  "Flashover": "needs x10 Bolt Charge; Bolt Discharge damage is not modelled for weapons (later)",
  "Heavy Ordnance Regeneration": "only grenade and melee regeneration after Machine Gun or Rocket hits (energy, later)",
  "Unraveling Orbs": "needs an Orb of Power pickup or Tangle throw; Unraveling Rounds (Unravel damage) are not modelled",
  "Defibrillating Blast": "needs a Champion stun; Bolt Charge",
  "Photonic Flare": ADDS,
  "No Bell": "Glaive melee only: " + UNDER_5,
  "Void Flux": ADDS,
  "Elemental Siphon": NO_DAMAGE,
  "Harsh Refraction": "three tiers by weapon rarity, Trace Rifles only (skipped in docs/buff-import.md too)",
  "Perpetual Destruction": NO_DAMAGE,
  "Gold from Lead": NO_DAMAGE,
  "To Shreds": "needs 6 hits on a Severed enemy for Unravel: " + UNDER_5,
  "Wind Chill": NO_DAMAGE,
  "Brain Freeze": "Slow only",
  "Crystalline Converter": "Crystals from Shards; the Shatter itself is the aspect's",
  "Hail The Storm": "five Ice Shards of 46 and +12.5 % / +25 % Shatter damage: " + UNDER_5,
  "Total Carnage": ADDS,
  "Conductive Cosmic Crystal": "+5 % Arc and Void ability damage only against Stasis-debuffed targets, which needs a second element",
  "Served Cold": NO_DAMAGE,
  "Trace Evidence": NO_DAMAGE,
  "Retinal Burn": "Blind and a shockwave of 454 with a 1 s cooldown after Arc hits: " + UNDER_5,
  "Kinetic Impacts": "Grenade Launcher shockwave of 454 (150 x 2 for Primary and Special): " + UNDER_5,
  "The Thick of It": NO_DAMAGE,
  "Curative Orbs": NO_DAMAGE,
  "Killing Breeze": NO_DAMAGE,
  "Void Renewal": NO_DAMAGE,
  "Old God's Rite": "needs Devour kills and a Breach pickup; 180 per Orb on a boss: " + UNDER_5,
  "Energy Diffusion Substrate": NO_DAMAGE,
  "Blade Stamina": NO_DAMAGE,
  "Creeping Chill": "Compendium: 'Has no effect'",
  "Void Hegemony": NO_DAMAGE,
  "Bad Amplitude": "Jolt on Arc ability damage to a Champion",
  "Incendiary Rifle Rounds": "Scorch on Solar Sniper hits: " + UNDER_5,
  "Solar Fulmination": "Ignitions deal one more instance of 171; needs the Ignition model of a weapon (later)",
  "Sustained Fire": NO_DAMAGE,
  "Shock and Awe": ADDS + "; a lightning burst of 126",
  "Torch": "Compendium: only against Non-Boss Combatants",
  "Pillar of Ice": ADDS,
  "Revitalizing Blast": "needs a Champion stun; an Ignition",
  "Rays of Precision": ADDS + "; an Ignition on Solar precision kills",
  "Anti-Champion Nosecone": "Compendium: damage against Champions only",
  "Solo Operative": "Compendium: only while solo, not a fireteam build",
  "Wished Into Being": NO_DAMAGE,
  "Dragon's Bite": "needs the third shield break of a Combatant",
  "Kindling Trigger": "Scorch without damage increases: " + UNDER_5,
  "Blast Radius": NO_DAMAGE,
  "Improved Unraveling": "raises Unraveling Threads only: " + UNDER_5,
  "Strand Soldier": "Unraveling Rounds after Woven Mail; Unravel damage is not modelled",
  "Conductive Cosmic Needle": "+5 % per Strand debuff on Arc and Void abilities; needs Strand debuffs from a second element",
  "Volatile Flow": "Volatile Rounds need a model of the Volatile detonation of a weapon hit (later)",
  "Suppressing Glaive": "Suppression only",
  "Unto the Breach": ADDS,
  "Protective Breach": NO_DAMAGE,
  "Amped Up": "Amplified lasts 20 s: the build already has it for the whole phase",
  "Counter Charge": NO_DAMAGE,
  "Squad Goals": "buffs for allies only",
  "Bricks from Beyond": NO_DAMAGE,
  "Lightning Strikes Twice": "grenade regeneration (energy, later)",
  "Overload Grenades": "disruption only",
  "Passive Aggressive Guard": NO_DAMAGE,
  "Shatter Orbs": NO_DAMAGE,
};

export type ArtifactVerdict = "imported" | "skipped" | "unclassified";

export type ArtifactRow = {
  artifact: string;
  season: string;
  tier: number;
  perk: string;
  verdict: ArtifactVerdict;
  target: string; // effect id or reason
};

export type ArtifactInputs = {
  compendium: CompendiumEntry[];
  effects: Effect[]; // every loaded effect
  slots: SourcedNumber[]; // artifact-slots.json (owner screenshot)
  codes: Record<string, number>; // artifact id -> code, once given they stay
};

const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace("channelling", "channeling")
    .replace(/[^a-z0-9]/g, "");

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Effect a perk switches on: the alias, else the artifact effect of the same name. */
export function effectOfPerk(name: string, effects: Effect[]): Effect | undefined {
  const artifactEffects = effects.filter((e) =>
    e.providers.some((p) => p.kind === "artifact"),
  );
  const alias = ALIASES[name];
  if (alias) {
    const effect = artifactEffects.find((e) => e.id === alias);
    if (!effect) throw new Error(`Alias of "${name}": no artifact effect "${alias}"`);
    return effect;
  }
  return artifactEffects.find((e) => normalize(e.name) === normalize(name));
}

export function buildArtifacts(inputs: ArtifactInputs): {
  data: ArtifactData;
  rows: ArtifactRow[];
} {
  const header = /^(.+) \(([^)]+)\)$/;
  const rows: ArtifactRow[] = [];
  const bySection = new Map<string, ArtifactData["artifacts"][number]>();
  let nextCode = Math.max(0, ...Object.values(inputs.codes)) + 1;

  for (const entry of inputs.compendium) {
    const [, name, season] = entry.section.match(header) ?? [];
    if (!name) throw new Error(`Artifact section "${entry.section}" has no season`);
    const tier = Number(entry.extra.match(/column (\d)/)?.[1]);
    if (![1, 2, 3].includes(tier)) throw new Error(`${entry.name}: no tier in "${entry.extra}"`);
    const id = kebab(name);
    let artifact = bySection.get(id);
    if (!artifact) {
      inputs.codes[id] ??= nextCode++;
      artifact = { id, code: inputs.codes[id], name, season, perks: [] };
      bySection.set(id, artifact);
    }
    const effect = effectOfPerk(entry.name, inputs.effects);
    if (effect) {
      if (artifact.perks.some((p) => p.effectId === effect.id))
        throw new Error(`${name}: two perks switch on "${effect.id}"`);
      artifact.perks.push({ name: entry.name, tier, effectId: effect.id });
    }
    const reason = SKIPPED[entry.name];
    rows.push({
      artifact: name,
      season,
      tier,
      perk: entry.name,
      ...(effect
        ? { verdict: "imported", target: effect.id }
        : reason
          ? { verdict: "skipped", target: reason }
          : { verdict: "unclassified", target: "" }),
    });
  }
  return {
    data: { slots: inputs.slots, artifacts: [...bySection.values()] },
    rows,
  };
}

export function renderArtifacts(rows: ArtifactRow[], effects: Effect[]): string {
  const cell = (text: string) => text.replace(/\n/g, " ").replace(/\|/g, "/");
  const lines = [
    "# Artifacts und ihre Perks",
    "",
    "Generiert von `npm run build:artifacts` aus `src/data/compendium-artifacts.json` (nicht von Hand ändern). Jeder Perk jedes Artifacts hat ein Urteil:",
    "",
    "- **imported**: der Perk schaltet einen Effect ein (`src/data/artifacts.json`). Gleichnamige Perks mehrerer Artifacts teilen sich den Effect.",
    "- **skipped**: kein Effect, mit Grund. Der Perk belegt im Spiel trotzdem einen Slot; die Auswahl in der App rechnet damit, dass die übrigen Slots solche Perks halten.",
    "- Tier: 1 = unterste Reihe (eine Raute), 3 = oberste Reihe (drei Rauten); Spalte im Compendium.",
    "",
    "| Artifact | Season | Tier | Perk | Urteil | Effect / Grund |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const r of rows) {
    lines.push(
      `| ${cell(r.artifact)} | ${r.season} | ${r.tier} | ${cell(r.perk)} | ${r.verdict} | ${cell(r.target)} |`,
    );
  }
  const used = new Set(rows.filter((r) => r.verdict === "imported").map((r) => r.target));
  const orphans = effects.filter(
    (e) => e.providers.some((p) => p.kind === "artifact") && !used.has(e.id),
  );
  if (orphans.length > 0) {
    lines.push("", "## Effects mit Provider Artifact ohne Perk", "");
    for (const e of orphans) lines.push(`- ${e.id}`);
  }
  return lines.join("\n") + "\n";
}
