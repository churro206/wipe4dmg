# Buffs, Debuffs, Mods und Artifact-Perks aus Court

Generiert von `npm run build:buffs` aus `src/data/court-buffs.json` (nicht von Hand ändern). Jede Court-Zeile hat ein Urteil:

- **imported**: eigener Schalter in `src/data/buff-effects.json` (Wert und Dauer aus Court).
- **covered**: schon in `effects.json` (Wert gleich Court). **weaken**: 15 % Weaken, der Schalter `weaken` gilt für alle Quellen.
- **exotic**: Exotic-Rüstung, `docs/exotic-effects.md`. **weapon**: Exotic-Waffe oder Perk, steckt im Waffenpaket.
- **skipped**: kein Schalter, mit Grund.

| Kategorie | Gruppe | Name | Urteil | Ziel / Grund |
| --- | --- | --- | --- | --- |
| Global Debuffs | POWERFUL WEAKEN | Deadfall Tether | covered | deadfall-tether |
| Global Debuffs | POWERFUL WEAKEN | Moebius Tether | covered | moebius-tether |
| Global Debuffs | POWERFUL WEAKEN | Felwinter's Helm | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | POWERFUL WEAKEN | Consume weapon's reserves; hits apply Weaken on hit | weapon | weapon packages |
| Global Debuffs | POWERFUL WEAKEN | Damage hit | weapon | weapon packages |
| Global Debuffs | MISC DEBUFFS | Scanner Augment^ | skipped | Raid mod of Deep Stone Crypt, not part of a normal build |
| Global Debuffs | MISC DEBUFFS | Sustained Damage hit | covered | divinity |
| Global Debuffs | MISC DEBUFFS | While Devour is active: | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | While Weaken has been Siphoned and in Alt Fire Mode: | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Deterministic Chaos | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Heartshadow | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Praxic Blade | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Slayer's Fang | weapon | weapon packages |
| Global Debuffs | MISC DEBUFFS | Tessellation* | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Third Iteration* | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Turncoat | weaken | weaken |
| Global Debuffs | MISC DEBUFFS | Gwisin Vest | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | MISC DEBUFFS | Khepri's Sting | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Second Chance | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Chromatic Fire | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Contraverse Hold | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Felwinter's Helm | exotic | build:armor (exotic-armor-effects.json) |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Spectral Blades | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Snare Bomb | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | On the Prowl | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Stylish Executioner | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Trapper's Ambush | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Twilight Arsenal | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Ward of Dawn | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Nova Warp | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Child of the Old Gods | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Echo of Undermining | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Facet of Dominance | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Demoralize | weaken | weaken |
| Global Debuffs | WEAKEN SANDBOX SOURCES | Withering Gaze | weaken | weaken |
| Global Debuffs | ARTIFACT PERKS | Debilitating Wave | imported | debilitating-wave |
| Global Debuffs | ARTIFACT PERKS | Maligned Harvest | imported | maligned-harvest |
| Global Debuffs | ARTIFACT PERKS | Particle Reconstruction | covered | particle-reconstruction |
| Global Debuffs | ARTIFACT PERKS | Singularity Blade | imported | singularity-blade |
| Global Debuffs | ARTIFACT PERKS | Supernova | imported | supernova |
| Global Debuffs | ARTIFACT PERKS | Void Infestation | imported | void-infestation |
| Global Debuffs | ARTIFACT PERKS | Weakened Clear | imported | weakened-clear |
| Empowering Buffs | ABILITIES | Banner Shield | covered | banner-shield |
| Empowering Buffs | ABILITIES | Well of Radiance | covered | well-of-radiance |
| Empowering Buffs | ABILITIES | Empowering Rift | covered | empowering-rift |
| Empowering Buffs | ABILITIES | Song of Flame | skipped | Radiant only during the Super, in which the weapon does not fire |
| Empowering Buffs | ABILITIES | After leaving Well | covered | radiant |
| Empowering Buffs | EXOTICS | Weapons of Light | imported | weapons-of-light |
| Empowering Buffs | EXOTICS | Lumina's | covered | lumina-noble-rounds |
| Empowering Buffs | EXOTICS | Gyrfalcon's Hauberk | exotic | build:armor (exotic-armor-effects.json) |
| Empowering Buffs | EXOTICS | Sealed Ahamkara Grasps | exotic | build:armor (exotic-armor-effects.json) |
| Empowering Buffs | EXOTICS | No Backup Plans* | exotic | build:armor (exotic-armor-effects.json) |
| Empowering Buffs | EXOTICS | Hazardous Propulsion* | exotic | build:armor (exotic-armor-effects.json) |
| Empowering Buffs | EXOTICS | Empowering Rift: | exotic | build:armor (exotic-armor-effects.json) |
| Empowering Buffs | EXOTICS | Wormgod Caress* | exotic | build:armor (exotic-armor-effects.json) |
| Empowering Buffs | ARMOR MODS | Shocked | skipped | Raid mod (Glyphkeeper), not part of a normal build |
| Empowering Buffs | ARTIFACT PERKS | While a Solar or Prismatic Subclass is equipped, and picking up an Orb of Power | imported | radiant-orbs |
| Empowering Buffs | ARTIFACT PERKS | Heart of the Flame | imported | heart-of-the-flame |
| Empowering Buffs | ARTIFACT PERKS | Prismatic Transfer | imported | prismatic-transfer |
| Weapon Surges | ARMOR MODS | Kinetic Surge Mod | covered | surge-1x, surge-2x, surge-3x |
| Weapon Surges | EXOTICS: | Eternal Warrior | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Doom Fang Pauldron | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Blight Ranger | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Fr0st-EE5 | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Ballidorse Wrathweavers | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Foetracer | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Mantle of Battle Harmony | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | EXOTICS: | Sanguine Alchemy | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | ALL ELEMENTS | Mantle of Battle Harmony | exotic | build:armor (exotic-armor-effects.json) |
| Weapon Surges | PRISMATIC: | Spirit of the Eternal Warrior | skipped | Prismatic Spirit (fragment): block Aspects and Fragments |
| Weapon Surges | PRISMATIC: | Spirit of the Foetracer | skipped | Prismatic Spirit (fragment): block Aspects and Fragments |
| Weapon Surges | ARTIFACT PERKS | Precision Equity | imported | precision-equity |
| Weapon Surges | ARTIFACT PERKS | That Fresh Bullet Smell | imported | that-fresh-bullet-smell |
| Weapon Surges | ARTIFACT PERKS | Void Weapon Channelling | imported | void-weapon-channelling |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Weapons Stat | covered | weapons-stat-200 |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Sect of Force Mod | skipped | Does not apply to Bosses (Elite, Miniboss, Champion only) |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Remote Shield | imported | remote-shield |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | The Navigator | weapon | weapon packages |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Slayer's Fang | weapon | weapon packages |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Skyburner's Oath | weapon | weapon packages |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Vexcalibur | weapon | weapon packages |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Mask of Bakris | exotic | build:armor (exotic-armor-effects.json) |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Actium War Rig | exotic | build:armor (exotic-armor-effects.json) |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | The Path of Burning Steps | exotic | build:armor (exotic-armor-effects.json) |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Kinetic Intrinsic Buff | weapon | weapon packages |
| Amplification Modifiers | OUTLIER DAMAGE BUFFS | Kinetic Intrinsic Buff | weapon | weapon packages |
| Amplification Modifiers | ARTIFACT PERKS | Arc Compounding | imported | arc-compounding |
| Amplification Modifiers | ARTIFACT PERKS | Argent Blade | imported | argent-blade |
| Amplification Modifiers | ARTIFACT PERKS | Argent Ordnance | imported | argent-ordnance |
| Amplification Modifiers | ARTIFACT PERKS | Argent Quiver | imported | argent-quiver |
| Amplification Modifiers | ARTIFACT PERKS | Combination Argent Blade | covered | argent-blade |
| Amplification Modifiers | ARTIFACT PERKS | Elemental Overdrive | covered | elemental-overdrive-solar |
| Amplification Modifiers | ARTIFACT PERKS | Expanding Abyss | imported | expanding-abyss |
| Amplification Modifiers | ARTIFACT PERKS | Harsh Refraction | skipped | Three tiers by weapon rarity and needs an element-matching debuff; Trace Rifles only |
| Amplification Modifiers | ARTIFACT PERKS | Sniper's Mediation | imported | sniper-meditation |
| Amplification Modifiers | ARTIFACT PERKS | Solo Operative | skipped | Only while solo, not a fireteam build |
| Amplification Modifiers | ARTIFACT PERKS | Targeting Autoloader | imported | targeting-autoloader |
| Amplification Modifiers | ARTIFACT PERKS | Torch | skipped | Only against non-Boss combatants |
