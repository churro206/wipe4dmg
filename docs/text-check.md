# Text-Abgleich

Generiert mit `npm run check:text` (Regel in `scripts/lib/textCheck.ts`). Jeder Multiplier-Part, Catalyst und Grant neben den Texten seines Items (Clarity, Compendium, Court, Zitat der Quelle). Wert: (m − 1) × 100 steht im Text; Aegis- und Quantum-Messungen zählen als gemessen, eine Prozentzahl im Text trotzdem auf ±25 %. Dauer: eine Dauer aus dem Text. Ziel: Quellen, Elemente und Waffentypen gegen die Wörter im Text. „Ungenutzt“: Prozentzahlen im Text, die kein Part des Items nutzt (nur zur Info). Gründe für Abweichungen: `tests/fixtures/text-check.json`.

Zeilen 312: ok 285, über Effect 5, gemessen 7, kein Text 3, Abweichung 12 (davon ohne Grund 0).

## Abweichungen

| Item | Prüfung | Modell | Text | Grund |
| --- | --- | --- | --- | --- |
| Elemental Overdrive (solar pickup) | target | +22 % amplification, weapon, solar | solar nicht im Text | Text: „Pickup-Matching Weapon Damage“; das Effect ist die Variante mit Solar-Pickup, also Solar-Waffen. |
| Facet of Courage | target | +10 % aspectBonus, grenade/super, arc/solar/void | grenade nicht im Text; super nicht im Text; arc nicht im Text; solar nicht im Text; void nicht im Text | Compendium: „Light Abilities deal 10%“: Light = Arc, Solar, Void; Grenade und Super, weil Light Melees statt der 10 % die 50 % bekommen (Clarity: „Light Melee Abilities in PVE instead deal an additional 50%“, K6). Die Bedingung „Against enemies inflicted with Stasis or Strand Elemental Debuffs“ fehlt bis Q4 (known-inaccuracies). |
| Facet of Courage | target | +50 % melee, melee, arc/solar/void | arc nicht im Text; solar nicht im Text; void nicht im Text | Compendium: „Light Powered Melee Abilities deal 50%“: Light = Arc, Solar, Void (K6). |
| On Your Mark | duration | 3 s | 12 s (Compendium Solar: Grants the user and allies within 15 meters stacks of On Your Mark for 12 seconds, up to a maximum of 10 stacks.); 12 s (Clarity On Your Mark: Precision Hits grant you and allies within a 15 meter radius of you one stack of 'On Your Mark'. Precision Kills, and Precision Hits from Hand Cannons, grant 2 stacks. Casting your Class Ability grants one stack to yourself. Stacks last for 12 seconds. Maximum of 10 stacks.) | Die 3 s sind die Restoration aus dem Compendium (Zeilen über Heilung zählen nicht als Text); On Your Mark hat keinen Damage-Part, die 12 s gelten den Stapeln. |
| Eternal Warrior | duration | 30 s | 11 s (Court: 10% 17% 22% 25% \| 11s) | Compendium: „On Fists of Havoc End: Grants x4 Arc Weapon Surge for 30 seconds“; die 11 s aus Court gelten den Kill-Stapeln (erstes Effect, ok). Die Zeile nennt den Wert als „x4“, nicht als Prozentzahl. |
| Sanguine Alchemy | duration | 30 s | 5 s (Compendium Exotic Armors: Damaging an enemy applies a mark for 5 seconds.); 5 s (Compendium Exotic Armors: Kills grant Blood Magic for 5 seconds, up to a maximum of 15 seconds.); 10 s (Compendium Exotic Armors: Swapping to Sanguine Alchemy while in combat will disable all of its effects for 10 seconds.) | Court: „Instant 4x Surge Stacks: While in any Rift or Well of Radiance“, Dauer „~“: der Surge gilt, solange der Well steht (30 s, effects.json). Die 5 s und 10 s im Compendium sind Mark, Blood Magic und die Sperre beim Wechsel. |
| Star-Eater Scales | value | +50 % exoticIntrinsic, super | Text: 2, 0.5, 18.2, 36.4, 54.6, 59.7, 64.8, 70 % | Die Obergrenzen stehen nur im Eintrag des Exotic Class Items (Compendium): „Nova Bomb, Thundercrash, and Twilight Arsenal receive up to 50% Increased Super Damage“; Feast of Light ist dieselbe Fähigkeit. |
| Star-Eater Scales | target | +50 % exoticIntrinsic, super | Thundercrash/Twilight Arsenal/Nova Bomb/Nova Bomb nicht im Text | Siehe #1:value; die Supers stehen im Eintrag des Class Items. |
| Star-Eater Scales | value | +35 % exoticIntrinsic, super | Text: 2, 0.5, 18.2, 36.4, 54.6, 59.7, 64.8, 70 % | Die Obergrenze steht nur im Eintrag des Exotic Class Items (Compendium): „Needlestorm receives up to 35% Increased Super Damage“. |
| Star-Eater Scales | target | +35 % exoticIntrinsic, super | Needlestorm nicht im Text | Siehe #2:value; Needlestorm steht im Eintrag des Class Items. |
| Izanagi's Burden: Catalyst | value | +13.1 % weaponPerk | Text: 20, 155, 370 % | Override: Clarity +20 % gilt auf Honed Edge x4 (291 % → 370 % Crit). Ohne Catalyst ist Honed Edge pro Munition schwächer als normale Schüsse (14910 ÷ 1,20 = 12404 < 13180, Quantum), mit Catalyst stärker: Wirkung des Catalysts = 14910 ÷ 13180 = ×1,131. |
| Outbreak Perfected: Catalyst | value | +15 % weaponPerk | Text: 25 % | Override: Clarity +25 % gilt nur dem Nanite-Anteil (48 von 80 pro Kugel, Quantum): 32 + 48 × 1,25 = 92, also ×1,15. |

## Alle Zeilen

| Item | Prüfung | Modell | Urteil | Text | Ungenutzt |
| --- | --- | --- | --- | --- | --- |
| Well of Radiance (standing inside) | value | +25 % empowering, weapon | ok | Court ABILITIES: Well of Radiance \| 25% \| 30s*: 25% | 3.6 %, 10 %, 50 %, 40 % |
| Well of Radiance (standing inside) | target | +25 % empowering, weapon | ok |  |  |
| Well of Radiance (standing inside) | value | +20 % empowering, super | ok | Court ABILITIES: Well of Radiance \| 25% \| 30s*: Grants Radiant for 8s (12s with Solace) after leaving the Well - this Radiant is 20% |  |
| Well of Radiance (standing inside) | target | +20 % empowering, super | ok |  |  |
| Well of Radiance (standing inside) | duration | 30 s | ok | Court: 25% \| 30s* |  |
| Empowering Rift | value | +20 % empowering, weapon | ok | Court ABILITIES: Empowering Rift \| 20% \| 15s: 20% | 260 %, 230 %, 50 %, 15 % |
| Empowering Rift | target | +20 % empowering, weapon | ok |  |  |
| Empowering Rift | duration | 15 s | ok | Court: 20% \| 15s |  |
| Radiant | value | +20 % empowering, weapon | ok | Compendium Solar: Increases Weapon Damage by 20% [10%] for 10 seconds and can be extended up to 15 seconds by default. | 30 %, 25 % |
| Radiant | target | +20 % empowering, weapon | ok |  |  |
| Radiant | value | +20 % empowering, super | ok | Compendium Solar: Increases Weapon Damage by 20% [10%] for 10 seconds and can be extended up to 15 seconds by default. |  |
| Radiant | target | +20 % empowering, super | ok |  |  |
| Weapons of Light (Banner Shield, Ward of Dawn) | value | +25 % empowering, weapon | ok | Court EXOTICS: Weapons of Light \| 25% \| 15s: 25% |  |
| Weapons of Light (Banner Shield, Ward of Dawn) | target | +25 % empowering, weapon | ok |  |  |
| Lumina (Blessing of the Sky) | value | +35 % empowering, weapon | ok | Clarity Blessing of the Sky: Blessing of The Sky is an Empowering Buff that grants 35% [15%] increased Weapon Damage and 100 Class Stat for 11 seconds. |  |
| Lumina (Blessing of the Sky) | target | +35 % empowering, weapon | ok |  |  |
| Lumina (Blessing of the Sky) | duration | 11 s | ok | Clarity Blessing of the Sky: Blessing of The Sky is an Empowering Buff that grants 35% [15%] increased Weapon Damage and 100 Class Stat for 11 seconds. |  |
| Weaken | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Compendium Void: Weakened Enemies receive 15% [7.5%] increased damage and 20% Decreased Movement Speed for 6 [2.5] seconds. | 20 %, 30 %, 35 % |
| Weaken | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Divinity | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Clarity Judgment: Targets within a Vex Cage receive 15% increased damage from all sources (30% for Divinity). For sources that can deal precision damage, any damage dealt to a Vex Cage is treated as a Precision Hit. | 25 %, 50 %, 30 % |
| Divinity | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Tractor Cannon | value | +30 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Clarity Repulsor Force: Hits apply Suppression as well as a higher tier Weaken that increases all damage dealt to the target by 30% for 10 seconds. |  |
| Tractor Cannon | target | +30 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Tractor Cannon | duration | 10 s | ok | Clarity Repulsor Force: Hits apply Suppression as well as a higher tier Weaken that increases all damage dealt to the target by 30% for 10 seconds. |  |
| Moebius Tether | value | +30 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court POWERFUL WEAKEN: Moebius Tether \| 30% \| ~ lasts duration of Super: 30% |  |
| Moebius Tether | target | +30 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Moebius Tether | duration | 6 s | ok | quote: Moebius Anchor lasts for 6 seconds by default. |  |
| Deadfall Tether | value | +35 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court POWERFUL WEAKEN: Deadfall Tether \| 35% \| ~ lasts duration of Super: 35% |  |
| Deadfall Tether | target | +35 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Deadfall Tether | duration | 12 s | ok | quote: Deadfall Anchor lasts for 12 seconds by default. |  |
| Surge 1x | value | +10 % surge, weapon | kein Text |  |  |
| Surge 2x | value | +17 % surge, weapon | kein Text |  |  |
| Surge 3x | value | +22 % surge, weapon | gemessen | Court Stacking Guide (Weapon Surges: surge stacks 1x/2x/3x/4x = 10%/17%/22%/25%); Aegis Boss Damage (column Surge 1.220) |  |
| Elemental Overdrive (solar pickup) | value | +22 % amplification, weapon, solar | ok | Court ARTIFACT PERKS: Elemental Overdrive \| 22% \| 7s: 22% |  |
| Elemental Overdrive (solar pickup) | target | +22 % amplification, weapon, solar | **Abweichung** | solar nicht im Text |  |
| Elemental Overdrive (solar pickup) | duration | 7 s | ok | Court: 22% \| 7s |  |
| Particle Reconstruction | value | +27.6 % debuff, weapon, fusionRifle/linearFusionRifle | ok | Court ARTIFACT PERKS: Particle Reconstruction \| 5% 10.3% 15.8% 21.6% 27.6% \| 10s: 27.6% | 5 %, 10.3 %, 15.8 %, 21.6 %, 30 %, 15 %, 10.25 %, 10 % |
| Particle Reconstruction | target | +27.6 % debuff, weapon, fusionRifle/linearFusionRifle | ok |  |  |
| Transcendence | value | +5 % transcendence, weapon | ok | quote: Grants 5% Increased Weapon Damage, an additional 10% Grenade and Melee Regeneration Speed, and 20% [5%] Damage Resist for 20 seconds. | 10 %, 20 %, 50 %, 40 %, 35 %, 15 % |
| Transcendence | target | +5 % transcendence, weapon | ok |  |  |
| Transcendence | duration | 20 s | ok | quote: Grants 5% Increased Weapon Damage, an additional 10% Grenade and Melee Regeneration Speed, and 20% [5%] Damage Resist for 20 seconds. |  |
| Rally Barricade | duration | 20 s | ok | quote: Barricade lasts for 20 seconds |  |
| Limit Break | value | +15 % amplification, super | ok | quote: 15% Increased Super Ability Damage |  |
| Limit Break | target | +15 % amplification, super | ok |  |  |
| Thunderous Retort | value | +30 % amplification, super | ok | quote: 30% increased Arc Super Damage. |  |
| Thunderous Retort | target | +30 % amplification, super | ok |  |  |
| Shieldcrush | value | +50 % melee, melee | ok | quote: 50% [5%] Increased Powered Melee Damage. | 12 % |
| Shieldcrush | target | +50 % melee, melee | ok |  |  |
| Shieldcrush | value | +25 % amplification, grenade | ok | quote: 25% [5%] Increased Grenade Damage. |  |
| Shieldcrush | target | +25 % amplification, grenade | ok |  |  |
| Transference | value | +10 % amplification, grenade | ok | quote: 10% Increased Grenade and Melee Damage. | 4.2 %, 50 % |
| Transference | target | +10 % amplification, grenade | ok |  |  |
| Transference | value | +10 % melee, melee | ok | quote: 10% Increased Grenade and Melee Damage. |  |
| Transference | target | +10 % melee, melee | ok |  |  |
| Fever and Chill | value | +20 % empowering, weapon, solar | über Effect | Radiant | 25 % |
| Fever and Chill | target | +20 % empowering, weapon, solar | ok |  |  |
| Expanding Abyss | value | +25 % debuff, weapon/grenade/melee/super/classAbility/keyword, void | ok | quote: 15%->25% /  / 30%->35% /  / 35%->40% | 15 %, 30 %, 7.5 %, 10 %, 2.3 %, 8.7 %, 3.8 %, 3.7 % |
| Expanding Abyss | target | +25 % debuff, weapon/grenade/melee/super/classAbility/keyword, void | ok |  |  |
| Expanding Abyss | value | +35 % debuff, weapon/grenade/melee/super/classAbility/keyword, void | ok | quote: 15%->25% /  / 30%->35% /  / 35%->40% |  |
| Expanding Abyss | target | +35 % debuff, weapon/grenade/melee/super/classAbility/keyword, void | ok |  |  |
| Expanding Abyss | value | +40 % debuff, weapon/grenade/melee/super/classAbility/keyword, void | ok | quote: 15%->25% /  / 30%->35% /  / 35%->40% |  |
| Expanding Abyss | target | +40 % debuff, weapon/grenade/melee/super/classAbility/keyword, void | ok |  |  |
| Debilitating Wave | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | quote: 15% |  |
| Debilitating Wave | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Debilitating Wave | duration | 6 s | ok | Court: 15% \| 6s |  |
| Maligned Harvest | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | quote: 15% |  |
| Maligned Harvest | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Maligned Harvest | duration | 6 s | ok | Court: 15% \| 6s |  |
| Singularity Blade | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | quote: 15% |  |
| Singularity Blade | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Singularity Blade | duration | 6 s | ok | Court: 15% \| 6s |  |
| Supernova | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | quote: 15% |  |
| Supernova | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Supernova | duration | 8 s | ok | Court: 15% \| 8s |  |
| Void Infestation | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | quote: 15% |  |
| Void Infestation | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Void Infestation | duration | 6 s | ok | Court: 15% \| 6s |  |
| Weakened Clear | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | quote: 15% |  |
| Weakened Clear | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Weakened Clear | duration | 20 s | ok | Court: 15% \| 20s |  |
| Radiant Orbs | value | +20 % empowering, weapon | ok | quote: 20% |  |
| Radiant Orbs | target | +20 % empowering, weapon | ok |  |  |
| Radiant Orbs | value | +20 % empowering, super | ok | quote: 20% |  |
| Radiant Orbs | target | +20 % empowering, super | ok |  |  |
| Radiant Orbs | duration | 10 s | ok | Compendium Artifact Perks: Orbs of Power grant Radiant for 10+5 seconds. |  |
| Heart of the Flame | value | +20 % empowering, weapon | ok | quote: 20% | 6 % |
| Heart of the Flame | target | +20 % empowering, weapon | ok |  |  |
| Heart of the Flame | value | +20 % empowering, super | ok | quote: 20% |  |
| Heart of the Flame | target | +20 % empowering, super | ok |  |  |
| Heart of the Flame | duration | 10 s | ok | Court: 20% \| 10s |  |
| Prismatic Transfer | value | +20 % empowering, weapon | ok | quote: 20% |  |
| Prismatic Transfer | target | +20 % empowering, weapon | ok |  |  |
| Prismatic Transfer | duration | 10 s | ok | Court: 20% \| 10s |  |
| Weapons of Light (Ward of Dawn) | value | +25 % empowering, weapon | ok | quote: 25% |  |
| Weapons of Light (Ward of Dawn) | target | +25 % empowering, weapon | ok |  |  |
| Weapons of Light (Ward of Dawn) | duration | 15 s | ok | Court: 25% \| 15s |  |
| Precision Equity | value | +17 % surge, weapon | ok | quote: 17% | 12.5 % |
| Precision Equity | target | +17 % surge, weapon | ok |  |  |
| Precision Equity | duration | 11 s | ok | Court: 17% \| 11s |  |
| That Fresh Bullet Smell | value | +17 % surge, weapon, kinetic | ok | quote: 17% |  |
| That Fresh Bullet Smell | target | +17 % surge, weapon, kinetic | ok |  |  |
| That Fresh Bullet Smell | duration | 11 s | ok | Court: 17% \| 11s |  |
| Void Weapon Channelling | value | +25 % surge, weapon, void | ok | quote: 10% / 17% / 22% / 25% | 10 %, 17 %, 22 % |
| Void Weapon Channelling | target | +25 % surge, weapon, void | ok |  |  |
| Void Weapon Channelling | duration | 11 s | ok | Court: 10% 17% 22% 25% \| 11s |  |
| Argent Blade | value | +15 % amplification, weapon, sword | ok | quote: 15% |  |
| Argent Blade | target | +15 % amplification, weapon, sword | ok |  |  |
| Argent Blade | duration | 5 s | ok | Court: 15% \| 5s |  |
| Argent Ordnance | value | +15 % amplification, weapon, rocketLauncher | ok | quote: 15% |  |
| Argent Ordnance | target | +15 % amplification, weapon, rocketLauncher | ok |  |  |
| Argent Ordnance | duration | 4.5 s | ok | Court: 15% \| 4.5s |  |
| Argent Quiver | value | +35 % amplification, weapon, bow | ok | quote: 35% / Primaries /  / 25% / Heavies | 25 % |
| Argent Quiver | target | +35 % amplification, weapon, bow | ok |  |  |
| Sniper's Meditation | value | +15 % amplification, weapon, sniperRifle | ok | quote: 2.8% / 5.7% / 9% / 12% / 15% | 2.8 %, 5.7 %, 9 %, 12 % |
| Sniper's Meditation | target | +15 % amplification, weapon, sniperRifle | ok |  |  |
| Sniper's Meditation | duration | 7 s | ok | Compendium Artifact Perks: Grant a stack of Sniper's Meditation for 7 seconds. |  |
| Targeting Autoloader | value | +20 % amplification, weapon, autoRifle | ok | quote: 10% / 13% / 16% / 18% / 20% | 10 %, 13 %, 16 %, 18 %, 50 %, 100 %, 30 %, 40 % |
| Targeting Autoloader | target | +20 % amplification, weapon, autoRifle | ok |  |  |
| Targeting Autoloader | duration | 15 s | ok | Court: 10% 13% 16% 18% 20% \| 15s |  |
| Arc Compounding | value | +15 % amplification, weapon/grenade/melee/super/classAbility/keyword, arc | ok | quote: 15% |  |
| Arc Compounding | target | +15 % amplification, weapon/grenade/melee/super/classAbility/keyword, arc | ok |  |  |
| Remote Shield (Edge of Action) | value | +5 % amplification, weapon | ok | quote: 5% | 15 %, 85 % |
| Remote Shield (Edge of Action) | target | +5 % amplification, weapon | ok |  |  |
| Remote Shield (Edge of Action) | duration | 10 s | ok | Court: 5% \| 10s |  |
| Banner of War (Strand Titan) | value | +10 % amplification, weapon, sword | ok | quote: 10% Increased Sword Damage (20% for the user) | 20 %, 100 %, 40 % |
| Banner of War (Strand Titan) | target | +10 % amplification, weapon, sword | ok |  |  |
| Banner of War | value | +100 % melee, melee | ok | Compendium Strand: Grants 100% [Varies] Increased Melee Damage, 40% Increased Bladefury Damage, and 20% Increased Sword Damage. | 40 %, 20 %, 10 % |
| Banner of War | target | +100 % melee, melee | ok |  |  |
| Banner of War | duration | 15 s | ok | Compendium Strand: Raises a Banner of War for 15 seconds, buffing the user and nearby allies within 10 metres. |  |
| Child of the Old Gods | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Child of the Old Gods \| 15% \| 5s*: 15% | 4 %, 10 %, 20 %, 50 %, 33.4 %, 33.3 % |
| Child of the Old Gods | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Child of the Old Gods | duration | 5 s | ok | Court: 15% \| 5s* |  |
| Echo of Instability | duration | 11.25 s | ok | Compendium Void: Grenade Kills grant Volatile Rounds to Void Weapons for 11.25 [7.5] seconds. |  |
| Echo of Undermining | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Echo of Undermining \| 15% \| 5s*: 15% |  |
| Echo of Undermining | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Echo of Undermining | duration | 5 s | ok | Court: 15% \| 5s* |  |
| Ember of Torches (Radiant) | value | +20 % empowering, weapon | über Effect | Radiant |  |
| Ember of Torches (Radiant) | target | +20 % empowering, weapon | ok |  |  |
| Ember of Torches (Radiant) | value | +20 % empowering, super | über Effect | Radiant |  |
| Ember of Torches (Radiant) | target | +20 % empowering, super | ok |  |  |
| Ember of Torches (Radiant) | duration | 8 s | ok | Compendium Solar: Powered Melee Hits grant Radiant for 8+4 seconds to the user and allies within 8 meters. |  |
| Facet of Bravery | duration | 11.25 s | ok | Compendium Prismatic: Grenade Kills grant Volatile Rounds to Void Weapons for 11.25 [7.5] seconds. |  |
| Facet of Bravery | duration | 11.25 s | ok | Compendium Prismatic: Grenade Kills grant Volatile Rounds to Void Weapons for 11.25 [7.5] seconds. |  |
| Facet of Courage | value | +10 % aspectBonus, grenade/super, arc/solar/void | ok | Compendium Prismatic: Light Abilities deal 10% increased damage. | 50 % |
| Facet of Courage | target | +10 % aspectBonus, grenade/super, arc/solar/void | **Abweichung** | grenade nicht im Text; super nicht im Text; arc nicht im Text; solar nicht im Text; void nicht im Text |  |
| Facet of Courage | value | +50 % melee, melee, arc/solar/void | ok | Compendium Prismatic: Light Powered Melee Abilities deal 50% [10%] increased damage. | 10 % |
| Facet of Courage | target | +50 % melee, melee, arc/solar/void | **Abweichung** | arc nicht im Text; solar nicht im Text; void nicht im Text |  |
| Facet of Dawn (Radiant) | value | +20 % empowering, weapon | über Effect | Radiant |  |
| Facet of Dawn (Radiant) | target | +20 % empowering, weapon | ok |  |  |
| Facet of Dawn (Radiant) | value | +20 % empowering, super | über Effect | Radiant |  |
| Facet of Dawn (Radiant) | target | +20 % empowering, super | ok |  |  |
| Facet of Dawn (Radiant) | duration | 5 s | ok | Compendium Prismatic: Powered Melee Hits grant Radiant for 5 seconds. |  |
| Facet of Dominance | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Facet of Dominance \| 15% \| 5s*: 15% |  |
| Facet of Dominance | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Facet of Dominance | duration | 5 s | ok | Court: 15% \| 5s* |  |
| Knockout | value | +160 % melee, melee | ok | Compendium Arc: 160% [30%] increased Basic/Glaive Melee Damage | 30 %, 15 % |
| Knockout | target | +160 % melee, melee | ok |  |  |
| Knockout | duration | 6 s | ok | Compendium Arc: Grants Knockout for 6 seconds. |  |
| Offensive Bulwark | value | +160 % melee, melee | ok | Compendium Void: 160% [20%] increased Melee Damage, and increases Melee Lunge Range to 5.5 metres. | 9 % |
| Offensive Bulwark | target | +160 % melee, melee | ok |  |  |
| On the Prowl | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: On the Prowl \| 15% \| 6s: 15% |  |
| On the Prowl | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| On the Prowl | duration | 6 s | ok | Court: 15% \| 6s |  |
| On Your Mark | duration | 3 s | **Abweichung** | 12 s (Compendium Solar: Grants the user and allies within 15 meters stacks of On Your Mark for 12 seconds, up to a maximum of 10 stacks.); 12 s (Clarity On Your Mark: Precision Hits grant you and allies within a 15 meter radius of you one stack of 'On Your Mark'. Precision Kills, and Precision Hits from Hand Cannons, grant 2 stacks. Casting your Class Ability grants one stack to yourself. Stacks last for 12 seconds. Maximum of 10 stacks.) |  |
| Roaring Flames | duration | 20 s | ok | Compendium Solar: Solar Ability Kills and Ignition Kills grant a stack of Roaring Flames for 20 seconds, up to a maximum of 3 stacks. |  |
| Roaring Flames | value | +200 % melee, melee | ok | Compendium Solar: 67% \| 133% \| 200% Increased Melee Damage. | 67 %, 133 %, 20 %, 44 %, 73 % |
| Roaring Flames | target | +200 % melee, melee | ok |  |  |
| Roaring Flames | duration | 20 s | ok | Compendium Solar: Solar Ability Kills and Ignition Kills grant a stack of Roaring Flames for 20 seconds, up to a maximum of 3 stacks. |  |
| Roaring Flames | value | +73 % aspectBonus, grenade/super, solar | ok | Compendium Solar: 20% [13%] \| 44% [28%] \| 73% [44%] increased Grenade and Super Ability Damage. | 67 %, 133 %, 200 %, 20 %, 44 % |
| Roaring Flames | target | +73 % aspectBonus, grenade/super, solar | ok |  |  |
| Roaring Flames | duration | 20 s | ok | Compendium Solar: Solar Ability Kills and Ignition Kills grant a stack of Roaring Flames for 20 seconds, up to a maximum of 3 stacks. |  |
| Spark of Feedback | value | +100 % melee, melee | ok | Compendium Arc: 100% [50% \| 15% while Knockout is active] Increased Melee Damage for the next Melee Hit within 5 seconds. |  |
| Spark of Feedback | target | +100 % melee, melee | ok |  |  |
| Spark of Feedback | duration | 5 s | ok | Compendium Arc: 100% [50% \| 15% while Knockout is active] Increased Melee Damage for the next Melee Hit within 5 seconds. |  |
| Thread of Propagation | duration | 8 s | ok | Compendium Strand: Grants Unraveling Rounds to Strand Weapons for 8 [5] seconds. |  |
| Trapper's Ambush | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Trapper's Ambush \| 15% \| 10s: 15% | 50 %, 65 % |
| Trapper's Ambush | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Trapper's Ambush | duration | 10 s | ok | Court: 15% \| 10s |  |
| Arc Soul | duration | 15 s | ok | Compendium Arc: Arc Buddy lasts 15 seconds and fires homing projectiles that deal 69 [11] Arc Grenade Damage in 3-round bursts at a rate of 100RPM towards enemies within 24 meters. |  |
| Hellion | duration | 20 s | ok | Compendium Solar: Grants Hellion for 20 seconds. |  |
| Ionic Sentry | duration | 15 s | ok | Compendium Arc: Lasts for 15 seconds and has ? Construct HP. |  |
| Blight Ranger | value | +25 % surge, weapon | ok | Court EXOTICS:: Blight Ranger \| 25% \| 21s: 25% | 400 %, 75 %, 100 %, 50 %, 0 % |
| Blight Ranger | target | +25 % surge, weapon | ok |  |  |
| Blight Ranger | duration | 21 s | ok | Court: 25% \| 21s |  |
| Chromatic Fire | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Chromatic Fire \| 15% \| 6s: 15% |  |
| Chromatic Fire | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Chromatic Fire | duration | 6 s | ok | Court: 15% \| 6s |  |
| Contraverse Hold | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Contraverse Hold \| 15% \| 6s: 15% | 20 %, 5000 %, 3700 %, 3400 %, 2500 %, 60 % |
| Contraverse Hold | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Contraverse Hold | duration | 6 s | ok | Court: 15% \| 6s |  |
| Doom Fang Pauldron | value | +25 % surge, weapon, void | ok | Court EXOTICS:: Doom Fang Pauldron \| 10% 17% 22% 25% \| 11s: 25% | 10 %, 17 %, 22 %, 20 %, 100 % |
| Doom Fang Pauldron | target | +25 % surge, weapon, void | ok |  |  |
| Doom Fang Pauldron | duration | 11 s | ok | Court: 10% 17% 22% 25% \| 11s |  |
| Eternal Warrior | value | +25 % surge, weapon, arc | ok | Court EXOTICS:: Eternal Warrior \| 10% 17% 22% 25% \| 11s: 25% | 10 %, 17 %, 22 % |
| Eternal Warrior | target | +25 % surge, weapon, arc | ok |  |  |
| Eternal Warrior | duration | 11 s | ok | Court: 10% 17% 22% 25% \| 11s |  |
| Eternal Warrior | value | +25 % surge, weapon, arc | ok | Court EXOTICS:: Eternal Warrior \| 10% 17% 22% 25% \| 11s: 25% | 10 %, 17 %, 22 % |
| Eternal Warrior | target | +25 % surge, weapon, arc | ok |  |  |
| Eternal Warrior | duration | 30 s | **Abweichung** | 11 s (Court: 10% 17% 22% 25% \| 11s) |  |
| Felwinter's Helm | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Felwinter's Helm \| 15% \| 6s: 15% | 30 % |
| Felwinter's Helm | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Felwinter's Helm | duration | 6 s | ok | Court: 15% \| 6s |  |
| Foetracer | value | +25 % surge, weapon | ok | Court EXOTICS:: Foetracer \| 25% \| 16s: 25% |  |
| Foetracer | target | +25 % surge, weapon | ok |  |  |
| Foetracer | duration | 16 s | ok | Court: 25% \| 16s |  |
| Fortune's Favor | value | +15 % exoticIntrinsic, weapon | ok | Clarity Kismet: • 15% increased weapon damage against Combatants (20% for Heat-Based weapons) | 20 %, 5 % |
| Fortune's Favor | target | +15 % exoticIntrinsic, weapon | ok |  |  |
| Fr0st-EE5 | value | +22 % surge, weapon, stasis | ok | Court EXOTICS:: Fr0st-EE5 \| 22% \| ~: 22% | 100 %, 6.25 % |
| Fr0st-EE5 | target | +22 % surge, weapon, stasis | ok |  |  |
| Gwisin Vest | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court MISC DEBUFFS: Gwisin Vest \| 15% \| 10s: 15% |  |
| Gwisin Vest | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Gwisin Vest | duration | 10 s | ok | Court: 15% \| 10s |  |
| Gyrfalcon's Hauberk | value | +35 % empowering, weapon | ok | Court EXOTICS: Gyrfalcon's Hauberk \| 35% \| 6s: 35% | 500 % |
| Gyrfalcon's Hauberk | target | +35 % empowering, weapon | ok |  |  |
| Gyrfalcon's Hauberk | duration | 6 s | ok | Court: 35% \| 6s |  |
| Hallowfire Heart | value | +150 % exoticIntrinsic, super, solar | ok | Compendium Exotic Armors: 6.5% \| 13.6% \| 22% \| 32% \| 43% \| 57% \| 73% \| 93% \| 118% \| 150% Increased Super Damage. | 250 %, 6.5 %, 13.6 %, 22 %, 32 %, 43 %, 57 %, 73 %, 93 %, 118 %, 8 %, 20 %, 26 %, 33 %, 45 % |
| Hallowfire Heart | target | +150 % exoticIntrinsic, super, solar | ok |  |  |
| Hallowfire Heart | duration | 20 s | kein Text |  |  |
| Hazardous Propulsion | value | +35 % empowering, weapon, rocketLauncher | ok | Compendium Exotic Armors: Exodus Rocket grant increased Rocket and Micromissile Weapon Damage, up to 35% at x6 stacks. | 10 %, 15 %, 20 %, 40 %, 67 %, 17 %, 24 %, 30 %, 33 %, 600 % |
| Hazardous Propulsion | target | +35 % empowering, weapon, rocketLauncher | ok |  |  |
| Hazardous Propulsion | duration | 10 s | ok | Compendium Exotic Armors: Consumes all stacks, firing a homing Kinetic Micro-Missile per stack, each dealing up to 540 [28] Kinetic Damage over ? meters and granting a stack of Exodus Rocket for 10 seconds per hit scored. |  |
| Khepri's Sting | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court MISC DEBUFFS: Khepri's Sting \| 15% \| 15s: 15% | 30 % |
| Khepri's Sting | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Khepri's Sting | duration | 15 s | ok | Court: 15% \| 15s |  |
| Lucky Pants | value | +45 % exoticIntrinsic, weapon, handCannon, pro Stapel | ok | Compendium Exotic Armors: 45% increased Direct Impact damage against Combatants per stack, up to 450% at 10 stacks. | 30 %, 450 %, 33 %, 6.25 %, 11 %, 110 %, 5 %, 50 % |
| Lucky Pants | target | +45 % exoticIntrinsic, weapon, handCannon, pro Stapel | ok |  |  |
| Lucky Pants | duration | 6 s | ok | Compendium Exotic Armors: Grants Illegally Modded Holster for 6 seconds. |  |
| Mantle of Battle Harmony | value | +25 % surge, weapon | ok | Court EXOTICS:: Mantle of Battle Harmony \| 25% \| 11s: 25% | 1.5 %, 2 %, 2.5 %, 50 % |
| Mantle of Battle Harmony | target | +25 % surge, weapon | ok |  |  |
| Mantle of Battle Harmony | duration | 11 s | ok | Court: 25% \| 11s |  |
| Mantle of Battle Harmony | value | +25 % surge, weapon | ok | Court EXOTICS:: Mantle of Battle Harmony \| 25% \| 11s: 25% | 1.5 %, 2 %, 2.5 %, 50 % |
| Mantle of Battle Harmony | target | +25 % surge, weapon | ok |  |  |
| Mantle of Battle Harmony | duration | 10 s | ok | Court: 25% \| 10s |  |
| Mask of Bakris | value | +10 % amplification, weapon, arc/stasis | ok | Court OUTLIER DAMAGE BUFFS: Mask of Bakris \| 10% 21% 33% \| 11s: 10% | 21 %, 33 %, 60 % |
| Mask of Bakris | target | +10 % amplification, weapon, arc/stasis | ok |  |  |
| Mask of Bakris | duration | 11 s | ok | Court: 10% 21% 33% \| 11s |  |
| No Backup Plans | value | +35 % empowering, weapon, shotgun | ok | Compendium Exotic Armors: 35% [10%] increased Shotgun damage. | 100 %, 34 %, 50 %, 30 % |
| No Backup Plans | target | +35 % empowering, weapon, shotgun | ok |  |  |
| Peacekeepers | value | +5 % exoticIntrinsic, weapon, submachineGun, pro Stapel | ok | Compendium Exotic Armors: Damage Buff grants 5% increased Submachine Gun Impact Damage against Combatants per stack. | 33 %, 6.25 %, 25 %, 16.75 %, 100 % |
| Peacekeepers | target | +5 % exoticIntrinsic, weapon, submachineGun, pro Stapel | ok |  |  |
| Sanguine Alchemy | value | +25 % surge, weapon | ok | Court EXOTICS:: Sanguine Alchemy \| 25% \| ~: 25% | 10 % |
| Sanguine Alchemy | target | +25 % surge, weapon | ok |  |  |
| Sanguine Alchemy | duration | 30 s | **Abweichung** | 5 s (Compendium Exotic Armors: Damaging an enemy applies a mark for 5 seconds.); 5 s (Compendium Exotic Armors: Kills grant Blood Magic for 5 seconds, up to a maximum of 15 seconds.); 10 s (Compendium Exotic Armors: Swapping to Sanguine Alchemy while in combat will disable all of its effects for 10 seconds.) |  |
| Sealed Ahamkara Grasps | value | +35 % empowering, weapon | ok | Court EXOTICS: Sealed Ahamkara Grasps \| 35% \| 7s: 35% |  |
| Sealed Ahamkara Grasps | target | +35 % empowering, weapon | ok |  |  |
| Sealed Ahamkara Grasps | duration | 7 s | ok | Court: 35% \| 7s |  |
| Second Chance | value | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok | Court WEAKEN SANDBOX SOURCES: Second Chance \| 15% \| 10s: 15% | 11.25 %, 20 % |
| Second Chance | target | +15 % debuff, weapon/grenade/melee/super/classAbility/keyword | ok |  |  |
| Second Chance | duration | 10 s | ok | Court: 15% \| 10s |  |
| Spirit of the Eternal Warrior | value | +25 % surge, weapon | ok | Court PRISMATIC:: Spirit of the Eternal Warrior \| 25% \| 30s: 25% |  |
| Spirit of the Eternal Warrior | target | +25 % surge, weapon | ok |  |  |
| Spirit of the Eternal Warrior | duration | 30 s | ok | Court: 25% \| 30s |  |
| Spirit of the Foetracer | value | +25 % surge, weapon | ok | Court PRISMATIC:: Spirit of the Foetracer \| 25% \| 16s: 25% |  |
| Spirit of the Foetracer | target | +25 % surge, weapon | ok |  |  |
| Spirit of the Foetracer | duration | 16 s | ok | Court: 25% \| 16s |  |
| Spirit of the Star-Eater | value | +70 % exoticIntrinsic, super | ok | Compendium Exotic Class: 18.2% \| 36.4% \| 54.6% \| 59.7% \| 64.8% \| 70% increased Super Damage. | 18.2 %, 36.4 %, 54.6 %, 59.7 %, 64.8 % |
| Spirit of the Star-Eater | target | +70 % exoticIntrinsic, super | ok |  |  |
| Spirit of the Star-Eater | value | +50 % exoticIntrinsic, super | ok | Compendium Exotic Class: Nova Bomb, Thundercrash, and Twilight Arsenal receive up to 50% Increased Super Damage. |  |
| Spirit of the Star-Eater | target | +50 % exoticIntrinsic, super | ok |  |  |
| Spirit of the Star-Eater | value | +35 % exoticIntrinsic, super | ok | Compendium Exotic Class: Needlestorm receives up to 35% Increased Super Damage. |  |
| Spirit of the Star-Eater | target | +35 % exoticIntrinsic, super | ok |  |  |
| Spirit of the Star-Eater | duration | 14 s | ok | Compendium Exotic Class: Consumes all Feast of Light stacks, increasing Super Damage for 14 seconds. |  |
| Spirit of Verity | value | +100 % exoticIntrinsic, grenade | ok | Compendium Exotic Class: x5 = 100% increased Grenade Damage, +2.5% Bonus Grenade Energy/s for 4 seconds. | 40 %, 0.5 %, 55 %, 1 %, 70 %, 1.5 %, 85 %, 2 %, 2.5 % |
| Spirit of Verity | target | +100 % exoticIntrinsic, grenade | ok |  |  |
| Spirit of Verity | duration | 4 s | ok | Compendium Exotic Class: x5 = 100% increased Grenade Damage, +2.5% Bonus Grenade Energy/s for 4 seconds. |  |
| Star-Eater Scales | value | +70 % exoticIntrinsic, super | ok | Compendium Exotic Armors: 18.2% \| 36.4% \| 54.6% \| 59.7% \| 64.8% \| 70% increased Super Damage. | 2 %, 0.5 %, 18.2 %, 36.4 %, 54.6 %, 59.7 %, 64.8 % |
| Star-Eater Scales | target | +70 % exoticIntrinsic, super | ok |  |  |
| Star-Eater Scales | value | +50 % exoticIntrinsic, super | **Abweichung** | Text: 2, 0.5, 18.2, 36.4, 54.6, 59.7, 64.8, 70 % |  |
| Star-Eater Scales | target | +50 % exoticIntrinsic, super | **Abweichung** | Thundercrash/Twilight Arsenal/Nova Bomb/Nova Bomb nicht im Text |  |
| Star-Eater Scales | value | +35 % exoticIntrinsic, super | **Abweichung** | Text: 2, 0.5, 18.2, 36.4, 54.6, 59.7, 64.8, 70 % |  |
| Star-Eater Scales | target | +35 % exoticIntrinsic, super | **Abweichung** | Needlestorm nicht im Text |  |
| Star-Eater Scales | duration | 14 s | ok | Clarity Feast of Light: • 18.2%\|36.4%\|54.6%\|59.7%\|64.8%\|70% increased Super damage for 14 seconds |  |
| The Path of Burning Steps | value | +12.4 % amplification, weapon, solar | ok | Court OUTLIER DAMAGE BUFFS: The Path of Burning Steps \| 6% 9.2% 12.4% \| ∞: 12.4% | 6 %, 9.2 %, 5 %, 10 %, 15 %, 20 %, 24.9 % |
| The Path of Burning Steps | target | +12.4 % amplification, weapon, solar | ok |  |  |
| Verity's Brow | value | +100 % exoticIntrinsic, grenade | ok | Compendium Exotic Armors: x5 \| 100% increased Grenade Damage, 170% Increased Grapple Melee Damage, and +2.5% Bonus Grenade Energy/s for 4 seconds. | 40 %, 0.5 %, 55 %, 1 %, 70 %, 1.5 %, 85 %, 2 %, 170 %, 2.5 %, 20 %, 60 %, 80 % |
| Verity's Brow | target | +100 % exoticIntrinsic, grenade | ok |  |  |
| Verity's Brow | duration | 4 s | ok | Compendium Exotic Armors: x5 \| 100% increased Grenade Damage, 170% Increased Grapple Melee Damage, and +2.5% Bonus Grenade Energy/s for 4 seconds. |  |
| Wormgod Caress | value | +35 % empowering, weapon | ok | Compendium Exotic Armors: x5 = 400% Melee Damage, and 35% [25%] Weapon Damage for 3 seconds. | 80 %, 160 %, 20 %, 240 %, 25 %, 320 %, 30 %, 400 %, 40 %, 120 %, 200 %, 0 % |
| Wormgod Caress | target | +35 % empowering, weapon | ok |  |  |
| Wormgod Caress | duration | 3 s | ok | Compendium Exotic Armors: x5 = 400% Melee Damage, and 35% [25%] Weapon Damage for 3 seconds. |  |
| Wormhusk Crown | value | +15 % exoticIntrinsic, grenade/super/classAbility, solar | ok | Compendium Exotic Armors: 15% increased Solar Grenade, Melee, Class, and Super Ability Damage. Works on Prismatic for Solar too! | 100 %, 34 %, 50 % |
| Wormhusk Crown | target | +15 % exoticIntrinsic, grenade/super/classAbility, solar | ok |  |  |
| Wormhusk Crown | duration | 10 s | ok | Compendium Exotic Armors: Grants a stack of Burning Souls for 10 seconds, up to a maximum of 3 stacks. |  |
| Dawn Chorus | value | +100 % exoticIntrinsic, keyword | ok | Compendium Exotic Armors: Ignitions deal 100% increased damage. | 40 %, 5 % |
| Dawn Chorus | target | +100 % exoticIntrinsic, keyword | ok |  |  |
| Ager's Scepter: Catalyst | value | +76.32 % weaponPerk | gemessen | 80 % im Text |  |
| Anarchy: Catalyst | value | +15.7 % weaponPerk | gemessen | Aegis Boss Damage sheet (tab Weapons, column visual Value), row grenade-launcher-anarchy-average-per-trap-double-stick-jolting-feedback |  |
| D.A.R.C.I.: Networked Targeting x5 | value | +6.03 % weaponPerk | ok | Catalyst Networked Targeting, D.A.R.C.I. Catalyst: • 2.8%\|6.1%\|9.1%\|12.5%\|15.9% increased damage |  |
| Dead Man's Tale: Catalyst | value | +27 % weaponPerk | ok | Catalyst Dark-Forged Trigger, Dead Man's Tale Catalyst: • 27% [15%] increased damage at x5 Cranial Spike |  |
| Deterministic Chaos: Catalyst | value | +25 % weaponPerk | ok | Catalyst Target Lock, Deterministic Chaos Catalyst: Assuming no missed shots, it provides roughly a 25% [15.85%] Damage Buff on average after firing 100% of the Magazine Capacity. |  |
| Graviton Lance: Catalyst | value | +20 % weaponPerk | ok | Catalyst Vorpal Weapon, Turnabout, Graviton Lance Catalyst: • Primary Weapons: 20% [60%] |  |
| Izanagi's Burden: Catalyst | value | +13.1 % weaponPerk | **Abweichung** | Text: 20, 155, 370 % |  |
| Malfeasance: Vorpal Weapon | value | +19.77 % weaponPerk | ok | Catalyst Vorpal Weapon, Malfeasance Catalyst: • Primary Weapons: 20% [60%] |  |
| One Thousand Voices: catalyst | value | +45.35 % weaponPerk | gemessen | Messung mit und ohne Catalyst |  |
| Outbreak Perfected: Catalyst | value | +15 % weaponPerk | **Abweichung** | Text: 25 % |  |
| Ruinous Effigy: Catalyst | value | +29.27 % weaponPerk | gemessen | 30 % im Text |  |
| Ruinous Effigy: Catalyst | duration | 7 s | ok | Catalyst Deconstruction, Ruinous Effigy Catalyst: Kills, or damaging Champions, Minibosses, or Bosses, with your Transmutation Sphere (inconsistently) grants 30% [15%] increased weapon damage for 7 seconds. |  |
| The Lament: Burning Ambition | value | +11.34 % weaponPerk | gemessen | Messung mit und ohne Catalyst |  |
| Ticuu's Divination: Catalyst | value | +87.1 % weaponPerk | ok | Catalyst Causality Quiver, Ticuu's Divination Catalyst: • PvE: 16%\|31%\|49%\|67.5%\|87%\|87% |  |
| Touch of Malice: Catalyst | value | +25 % weaponPerk | ok | Catalyst Precision Instrument, Touch of Malice Catalyst: 4.17% \| 8.33% \| 12.5% \| 16.67% \| 20.83% \| 25% |  |
| Truth: Reaper's Tithe x4 | value | +40 % weaponPerk | ok | Catalyst Reaper's Tithe, Truth Catalyst: 'Reaper's Tithe' grants 20%\|30%\|40% increased damage for 15 seconds at 2\|3\|4 stacks (1st stack does not exist). Timer only starts after firing. |  |
| Truth: Reaper's Tithe x4 | duration | 15 s | ok | Catalyst Reaper's Tithe, Truth Catalyst: 'Reaper's Tithe' grants 20%\|30%\|40% increased damage for 15 seconds at 2\|3\|4 stacks (1st stack does not exist). Timer only starts after firing. |  |
| Vex Mythoclast: Catalyst | value | +20.35 % weaponPerk | ok | Catalyst Calculated Balance, Vex Mythoclast Catalyst: Landing 15 hits within 3 seconds of each, or scoring a kill, grants 20% increased damage, 20 Stability, and 20% reduced Accuracy Cone Size for 5 seconds. |  |
| Vex Mythoclast: Catalyst | duration | 5 s | ok | Catalyst Calculated Balance, Vex Mythoclast Catalyst: Landing 15 hits within 3 seconds of each, or scoring a kill, grants 20% increased damage, 20 Stability, and 20% reduced Accuracy Cone Size for 5 seconds. |  |
| Whisper of the Worm: Whispered Breathing | value | +47.18 % weaponPerk | gemessen | Messung mit und ohne Catalyst |  |
| Whisper of the Worm: Whispered Breathing | duration | 1.2 s | ok | Catalyst Whisper Catalyst, Whispered Breathing: Aiming Down Sights for 1.2 seconds without shooting grants 'Whispered Breathing' until you leave ADS. |  |
| Wish-Keeper: Catalyst | value | +20 % weaponPerk | ok | Catalyst Enduring Snare Refit, Multi-Threaded Snare Refit, Vorpal Weapon Refit, Hatchling Refit: • Primary Weapons: 20% [60%] |  |
| Twilight Arsenal → weaken | duration | 6 s | ok | Court:  \| 6s |  |
| Nova Warp → weaken | duration | 6 s | ok | Court:  \| 6s |  |
| Lightweight Knife → radiant | duration | 10 s | ok | quote: Precision Hits grant Radiant for 10 seconds. |  |
| Snare Bomb → weaken | duration | 8 s | ok | quote: Snare Bomb deals 33 [10] impact damage, and up to 120 + 24 [40 + ?] explosion damage over ? meters. Impact and explosion weaken and disorient for 8 [2.5] seconds. |  |
| Acrobat's Dodge → radiant | duration | 10 s | ok | quote: Performs an acrobatic leap, that, upon landing, grants the user and their allies within 10 meters Radiant for 10+5 seconds. |  |
