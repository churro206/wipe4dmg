# Artifacts und ihre Perks

Generiert von `npm run build:artifacts` aus `src/data/compendium-artifacts.json` (nicht von Hand ändern). Jeder Perk jedes Artifacts hat ein Urteil:

- **imported**: der Perk schaltet einen Effect ein (`src/data/artifacts.json`). Gleichnamige Perks mehrerer Artifacts teilen sich den Effect.
- **skipped**: kein Effect, mit Grund. Der Perk belegt im Spiel trotzdem einen Slot; die Auswahl in der App rechnet damit, dass die übrigen Slots solche Perks halten.
- Tier: 1 = unterste Reihe (eine Raute), 3 = oberste Reihe (drei Rauten); Spalte im Compendium.

| Artifact | Season | Tier | Perk | Urteil | Effect / Grund |
| --- | --- | --- | --- | --- | --- |
| Encrypted Data Disk | Renegades | 1 | Press The Advantage | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Encrypted Data Disk | Renegades | 2 | Dielectric | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); Bolt Charge from Arc-debuffed kills |
| Encrypted Data Disk | Renegades | 3 | Elemental Orbs: Arc | skipped | needs 6 Arc weapon kills (adds); the orb itself is under 5 % |
| Encrypted Data Disk | Renegades | 1 | Kinetic Synthesis | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Encrypted Data Disk | Renegades | 2 | Armorsmith | skipped | needs a Combatant shield break or a finisher, which a boss does not give (+100 % melee for 6 s) |
| Encrypted Data Disk | Renegades | 3 | Kinetic Rupture | skipped | Compendium: 'Tends to decrease damage by 25% to 50% on almost every situation' |
| Encrypted Data Disk | Renegades | 1 | Reload at Range | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Encrypted Data Disk | Renegades | 2 | Counter Energy | skipped | needs a Champion stun; only ability energy |
| Encrypted Data Disk | Renegades | 3 | Sniper's Meditation | imported | sniper-meditation |
| Encrypted Data Disk | Renegades | 1 | Riposte | skipped | Compendium: 'THIS DOESN'T DO ANYTHING AT ALL' |
| Encrypted Data Disk | Renegades | 2 | Combination Argent Blade | imported | argent-blade |
| Encrypted Data Disk | Renegades | 3 | Sword Storm Combo | skipped | 103 damage every 0.53 s for 6 s per combo: damage of its own under 5 % of a typical build |
| Encrypted Data Disk | Renegades | 1 | Power from Pain | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); only Devour |
| Encrypted Data Disk | Renegades | 2 | Singularity Blade | imported | singularity-blade |
| Encrypted Data Disk | Renegades | 3 | Void Infestation | imported | void-infestation |
| Encrypted Data Disk | Renegades | 1 | Fierce Proxemics | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Encrypted Data Disk | Renegades | 2 | Blinding Jolts | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| Encrypted Data Disk | Renegades | 3 | Tazer Tag | skipped | about 800 to 1245 Arc damage per Arc melee: damage of its own under 5 % of a typical build |
| Encrypted Data Disk | Renegades | 1 | Rapid Remedy | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Encrypted Data Disk | Renegades | 2 | Precision Equity | imported | precision-equity |
| Encrypted Data Disk | Renegades | 3 | Sticker Shock | skipped | raises three grenades only (Flux, Fusion, Magnetic): damage of its own under 5 % of a typical build |
| Implement of Curiosity | Reclamation | 1 | Fever and Chill | imported | fever-and-chill |
| Implement of Curiosity | Reclamation | 2 | Threaded Blast | skipped | 288 damage per destroyed Tangle: damage of its own under 5 % of a typical build |
| Implement of Curiosity | Reclamation | 3 | Radiant Shrapnel | skipped | needs damage of 10 % of the target's health or Scorched kills; a boss does not give it |
| Implement of Curiosity | Reclamation | 1 | Elemental Benevolence | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 2 | Cauterized Darkness | skipped | Compendium: only against Non-Boss Combatants |
| Implement of Curiosity | Reclamation | 3 | Shieldcrush | imported | shieldcrush |
| Implement of Curiosity | Reclamation | 1 | Frost Renewal | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 2 | Elemental Daze | skipped | needs a Champion stun; one explosion of 315: damage of its own under 5 % of a typical build |
| Implement of Curiosity | Reclamation | 3 | Elemental Overdrive | imported | elemental-overdrive-solar |
| Implement of Curiosity | Reclamation | 1 | Horde Shuttle | skipped | Threadlings need damage of 10 % of the target's health |
| Implement of Curiosity | Reclamation | 2 | Shoulder to Shoulder | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 3 | Tangled Web | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| Implement of Curiosity | Reclamation | 1 | Refresh Threads | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 2 | Elemental Coalescence | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 3 | Frigid Glare | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 1 | Pack Tactics | skipped | raises Threadling damage only: damage of its own under 5 % of a typical build |
| Implement of Curiosity | Reclamation | 2 | That Fresh Bullets Smell | imported | that-fresh-bullet-smell |
| Implement of Curiosity | Reclamation | 3 | Iron Lord's Vigor | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 1 | Semi-Auto Striker | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Implement of Curiosity | Reclamation | 2 | Energy Acceleration | skipped | Micro-Missile shockwave of 120: damage of its own under 5 % of a typical build |
| Implement of Curiosity | Reclamation | 3 | Argent Quiver | imported | argent-quiver |
| Tablet of Ruin | Heresy | 1 | Hold the Line | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Tablet of Ruin | Heresy | 2 | Vile Weave | skipped | Sever on Tangle damage and Tangle cooldown: damage of its own under 5 % of a typical build |
| Tablet of Ruin | Heresy | 3 | Particle Reconstruction | imported | particle-reconstruction |
| Tablet of Ruin | Heresy | 1 | Dielectric | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); Bolt Charge from Arc-debuffed kills |
| Tablet of Ruin | Heresy | 2 | Maligned Harvest | imported | maligned-harvest |
| Tablet of Ruin | Heresy | 3 | Elemental Supercharger | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Tablet of Ruin | Heresy | 1 | Volatile Marksman | skipped | Volatile Rounds need a model of the Volatile detonation of a weapon hit (later) |
| Tablet of Ruin | Heresy | 2 | Flashover | skipped | needs x10 Bolt Charge; Bolt Discharge damage is not modelled for weapons (later) |
| Tablet of Ruin | Heresy | 3 | Heavy Ordnance Regeneration | skipped | only grenade and melee regeneration after Machine Gun or Rocket hits (energy, later) |
| Tablet of Ruin | Heresy | 1 | Unraveling Orbs | skipped | needs an Orb of Power pickup or Tangle throw; Unraveling Rounds (Unravel damage) are not modelled |
| Tablet of Ruin | Heresy | 2 | Horde Shuttle | skipped | Threadlings need damage of 10 % of the target's health |
| Tablet of Ruin | Heresy | 3 | Defibrillating Blast | skipped | needs a Champion stun; Bolt Charge |
| Tablet of Ruin | Heresy | 1 | Photonic Flare | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| Tablet of Ruin | Heresy | 2 | No Bell | skipped | Glaive melee only: damage of its own under 5 % of a typical build |
| Tablet of Ruin | Heresy | 3 | Void Flux | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| Tablet of Ruin | Heresy | 1 | Elemental Siphon | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Tablet of Ruin | Heresy | 2 | Harsh Refraction | skipped | three tiers by weapon rarity, Trace Rifles only (skipped in docs/buff-import.md too) |
| Tablet of Ruin | Heresy | 3 | Limit Break | imported | limit-break |
| Tablet of Ruin | Heresy | 1 | Perpetual Destruction | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Tablet of Ruin | Heresy | 2 | Gold from Lead | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Tablet of Ruin | Heresy | 3 | To Shreds | skipped | needs 6 hits on a Severed enemy for Unravel: damage of its own under 5 % of a typical build |
| Slayer Baron Apothecary Satchel | Revenant | 1 | Wind Chill | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Frost Renewal | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Brain Freeze | skipped | Slow only |
| Slayer Baron Apothecary Satchel | Revenant | 1 | Crystalline Converter | skipped | Crystals from Shards; the Shatter itself is the aspect's |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Hail The Storm | skipped | five Ice Shards of 46 and +12.5 % / +25 % Shatter damage: damage of its own under 5 % of a typical build |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Supernova | imported | supernova |
| Slayer Baron Apothecary Satchel | Revenant | 1 | Total Carnage | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Debilitating Wave | imported | debilitating-wave |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Conductive Cosmic Crystal | skipped | +5 % Arc and Void ability damage only against Stasis-debuffed targets, which needs a second element |
| Slayer Baron Apothecary Satchel | Revenant | 1 | Power from Pain | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); only Devour |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Weakened Clear | imported | weakened-clear |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Served Cold | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 1 | Trace Evidence | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Retinal Burn | skipped | Blind and a shockwave of 454 with a 1 s cooldown after Arc hits: damage of its own under 5 % of a typical build |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Kinetic Impacts | skipped | Grenade Launcher shockwave of 454 (150 x 2 for Primary and Special): damage of its own under 5 % of a typical build |
| Slayer Baron Apothecary Satchel | Revenant | 1 | The Thick of It | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Curative Orbs | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Arc Compounding | imported | arc-compounding |
| Slayer Baron Apothecary Satchel | Revenant | 1 | Killing Breeze | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 2 | Void Renewal | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Slayer Baron Apothecary Satchel | Revenant | 3 | Old God's Rite | skipped | needs Devour kills and a Breach pickup; 180 per Orb on a boss: damage of its own under 5 % of a typical build |
| Hunter's Journal | Echoes | 1 | Elemental Siphon | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Hunter's Journal | Echoes | 2 | Counter Energy | skipped | needs a Champion stun; only ability energy |
| Hunter's Journal | Echoes | 3 | Prismatic Transfer | imported | prismatic-transfer |
| Hunter's Journal | Echoes | 1 | Energy Diffusion Substrate | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Hunter's Journal | Echoes | 2 | Blade Stamina | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Hunter's Journal | Echoes | 3 | Argent Blade | imported | argent-blade |
| Hunter's Journal | Echoes | 1 | Creeping Chill | skipped | Compendium: 'Has no effect' |
| Hunter's Journal | Echoes | 2 | Void Hegemony | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Hunter's Journal | Echoes | 3 | Expanding Abyss | imported | expanding-abyss |
| Hunter's Journal | Echoes | 1 | Press The Advantage | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Hunter's Journal | Echoes | 2 | Radiant Orbs | imported | radiant-orbs |
| Hunter's Journal | Echoes | 3 | Shieldcrush | imported | shieldcrush |
| Hunter's Journal | Echoes | 1 | Threaded Blast | skipped | 288 damage per destroyed Tangle: damage of its own under 5 % of a typical build |
| Hunter's Journal | Echoes | 2 | Bad Amplitude | skipped | Jolt on Arc ability damage to a Champion |
| Hunter's Journal | Echoes | 3 | Transference | imported | transference |
| Hunter's Journal | Echoes | 1 | Incendiary Rifle Rounds | skipped | Scorch on Solar Sniper hits: damage of its own under 5 % of a typical build |
| Hunter's Journal | Echoes | 2 | Solar Fulmination | skipped | Ignitions deal one more instance of 171; needs the Ignition model of a weapon (later) |
| Hunter's Journal | Echoes | 3 | Sniper's Meditation | imported | sniper-meditation |
| Hunter's Journal | Echoes | 1 | Sustained Fire | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Hunter's Journal | Echoes | 2 | Targeting Autoloader | imported | targeting-autoloader |
| Hunter's Journal | Echoes | 3 | Shock and Awe | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); a lightning burst of 126 |
| Queensfoil Censer | Wish | 1 | Fever and Chill | imported | fever-and-chill |
| Queensfoil Censer | Wish | 2 | Unraveling Orbs | skipped | needs an Orb of Power pickup or Tangle throw; Unraveling Rounds (Unravel damage) are not modelled |
| Queensfoil Censer | Wish | 3 | Horde Shuttle | skipped | Threadlings need damage of 10 % of the target's health |
| Queensfoil Censer | Wish | 1 | Torch | skipped | Compendium: only against Non-Boss Combatants |
| Queensfoil Censer | Wish | 2 | Pillar of Ice | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| Queensfoil Censer | Wish | 3 | Hail The Storm | skipped | five Ice Shards of 46 and +12.5 % / +25 % Shatter damage: damage of its own under 5 % of a typical build |
| Queensfoil Censer | Wish | 1 | Heart of the Flame | imported | heart-of-the-flame |
| Queensfoil Censer | Wish | 2 | Revitalizing Blast | skipped | needs a Champion stun; an Ignition |
| Queensfoil Censer | Wish | 3 | Rays of Precision | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); an Ignition on Solar precision kills |
| Queensfoil Censer | Wish | 1 | Armorsmith | skipped | needs a Combatant shield break or a finisher, which a boss does not give (+100 % melee for 6 s) |
| Queensfoil Censer | Wish | 2 | Anti-Champion Nosecone | skipped | Compendium: damage against Champions only |
| Queensfoil Censer | Wish | 3 | Solo Operative | skipped | Compendium: only while solo, not a fireteam build |
| Queensfoil Censer | Wish | 1 | Wished Into Being | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Queensfoil Censer | Wish | 2 | Dragon's Bite | skipped | needs the third shield break of a Combatant |
| Queensfoil Censer | Wish | 3 | Argent Ordnance | imported | argent-ordnance |
| Queensfoil Censer | Wish | 1 | Kindling Trigger | skipped | Scorch without damage increases: damage of its own under 5 % of a typical build |
| Queensfoil Censer | Wish | 2 | Creeping Chill | skipped | Compendium: 'Has no effect' |
| Queensfoil Censer | Wish | 3 | Frigid Glare | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Queensfoil Censer | Wish | 1 | Blast Radius | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Queensfoil Censer | Wish | 2 | Perpetual Destruction | skipped | no damage (handling, ammo, healing, resistance or energy) |
| Queensfoil Censer | Wish | 3 | To Shreds | skipped | needs 6 hits on a Severed enemy for Unravel: damage of its own under 5 % of a typical build |
| NPA Repulsion Regulator | Deep | 1 | Improved Unraveling | skipped | raises Unraveling Threads only: damage of its own under 5 % of a typical build |
| NPA Repulsion Regulator | Deep | 2 | Strand Soldier | skipped | Unraveling Rounds after Woven Mail; Unravel damage is not modelled |
| NPA Repulsion Regulator | Deep | 3 | Conductive Cosmic Needle | skipped | +5 % per Strand debuff on Arc and Void abilities; needs Strand debuffs from a second element |
| NPA Repulsion Regulator | Deep | 1 | Volatile Flow | skipped | Volatile Rounds need a model of the Volatile detonation of a weapon hit (later) |
| NPA Repulsion Regulator | Deep | 2 | Suppressing Glaive | skipped | Suppression only |
| NPA Repulsion Regulator | Deep | 3 | Shock and Awe | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds); a lightning burst of 126 |
| NPA Repulsion Regulator | Deep | 1 | Unto the Breach | skipped | triggers only on kills or finishers of adds (ADR 0015: one boss, no adds) |
| NPA Repulsion Regulator | Deep | 2 | Protective Breach | skipped | no damage (handling, ammo, healing, resistance or energy) |
| NPA Repulsion Regulator | Deep | 3 | Supernova | imported | supernova |
| NPA Repulsion Regulator | Deep | 1 | Amped Up | skipped | Amplified lasts 20 s: the build already has it for the whole phase |
| NPA Repulsion Regulator | Deep | 2 | Counter Charge | skipped | no damage (handling, ammo, healing, resistance or energy) |
| NPA Repulsion Regulator | Deep | 3 | Squad Goals | skipped | buffs for allies only |
| NPA Repulsion Regulator | Deep | 1 | Thunderous Retort | imported | thunderous-retort |
| NPA Repulsion Regulator | Deep | 2 | Bricks from Beyond | skipped | no damage (handling, ammo, healing, resistance or energy) |
| NPA Repulsion Regulator | Deep | 3 | Lightning Strikes Twice | skipped | grenade regeneration (energy, later) |
| NPA Repulsion Regulator | Deep | 1 | Sustained Fire | skipped | no damage (handling, ammo, healing, resistance or energy) |
| NPA Repulsion Regulator | Deep | 2 | Overload Grenades | skipped | disruption only |
| NPA Repulsion Regulator | Deep | 3 | Passive Aggressive Guard | skipped | no damage (handling, ammo, healing, resistance or energy) |
| NPA Repulsion Regulator | Deep | 1 | Shatter Orbs | skipped | no damage (handling, ammo, healing, resistance or energy) |
| NPA Repulsion Regulator | Deep | 2 | Targeting Autoloader | imported | targeting-autoloader |
| NPA Repulsion Regulator | Deep | 3 | Void Weapon Channeling | imported | void-weapon-channelling |
