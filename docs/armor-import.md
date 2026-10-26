# Prüftabelle Exotic-Rüstung

Erzeugt von `npm run build:armor` (ADR 0014), nicht von Hand bearbeiten.
Quellen: Manifest, Aegis „Abilties“, Court's Stacking Guide, Compendium „Exotic Armors“, Clarity.

| Art | Anzahl |
| --- | --- |
| Ability-Varianten (Regel 1) | 19 |
| Schadens-Buffs (Regeln 2 bis 4) | 43 |
| Geben einen Effect (Regel 4c) | 3 |
| Waffen-Timing (Regel 5) | 2 |
| Eigener Schaden, kommt später (Regel 5) | 40 |
| Nur Energie, Modell fehlt (Regel 5) | 28 |
| Lücken (Regeln 3 bis 5) | 15 |
| Ohne Schadenswirkung (Regeln 5 und 6) | 25 |

## Ability-Varianten (Regel 1)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Ballidorse Wrathweavers | warlock | gauntlets | 1 | Aegis-Paket: super-winter-s-wrath-light-heavy-cycle-whisper-of-fissures-ballidorse-wrathweavers |
| Briarbinds | warlock | gauntlets | 1 | Aegis-Paket: miscellaneous-child-of-the-old-gods-whole-duration-briarbinds-ticks-includes-weaken |
| Celestial Nighthawk | hunter | helmet | 1 | Aegis-Paket: super-golden-gun-marksman-radiant-celestial-nighthawk |
| Claws of Ahamkara | warlock | gauntlets | 1 | Aegis-Paket: super-song-of-flame-claws-of-ahamkara-necrotic-grip-snap-spam |
| Cuirass of the Falling Star | titan | chest | 1 | Aegis-Paket: super-thundercrash-cuirass-of-the-falling-star |
| Dawn Chorus | warlock | helmet | 1 | Aegis-Paket: super-daybreak-ember-of-ashes-dawn-chorus-spaced, super-daybreak-ember-of-ashes-dawn-chorus, super-song-of-flame-dawn-chorus-saint-s-fists-celestial-fire-spam-ember-of-ashes, super-song-of-flame-dawn-chorus-snap-spam-shieldcrush, super-song-of-flame-dawn-chorus-snap-spam |
| Eunoia | warlock | gauntlets | 1 | Aegis-Paket: miscellaneous-hellion-average-consul-s-pitch-max-range |
| Geomag Stabilizers | warlock | legs | 1 | Aegis-Paket: super-chaos-reach-geomag-stabilizers-sol-invictus, super-chaos-reach-geomag-stabilizers |
| Gifted Conviction | hunter | chest | 1 | Aegis-Paket: miscellaneous-ascension-includes-jolt-gifted-conviction |
| Mataiodoxía | warlock | chest | 1 | Aegis-Paket: super-needlestorm-stylostixis-thread-of-evolution-pack-tactics-x2, super-needlestorm-stylostixis-thread-of-evolution, super-needlestorm-stylostixis |
| Necrotic Grip | warlock | gauntlets | 1 | Aegis-Paket: melee-base-necrotic-grip, super-song-of-flame-claws-of-ahamkara-necrotic-grip-snap-spam, super-song-of-flame-wisp-snap-cycling-feast-of-light-x6-necrotic-grip |
| Orpheus Rig | hunter | legs | 1 | Aegis-Paket: super-shadowshot-moebius-quiver-full-bow-charge-orpheus-rig-includes-debuff, super-shadowshot-moebius-quiver-orpheus-rig-includes-debuff |
| Pyrogale Gauntlets | titan | gauntlets | 1 | Aegis-Paket: super-burning-maul-roaring-flames-x3-sol-invictus-ember-of-ashes-pyrogale-gauntlets |
| Raiden Flux | hunter | chest | 1 | Aegis-Paket: super-arc-staff-raiden-flux-grounded-2l1h |
| Raiju's Harness | hunter | chest | 1 | Aegis-Paket: super-gathering-storm-raiju-s-harness |
| Shards of Galanor | hunter | gauntlets | 1 | Aegis-Paket: super-blade-barrage-knock-em-down-shards-of-galanor |
| Stormdancer's Brace | warlock | chest | 1 | Aegis-Paket: super-stormtrance-ascending-amplitude |
| Sunbracers | warlock | gauntlets | 1 | Aegis-Paket: grenade-solar-average-ember-of-ashes-touch-of-flame-sunbracers |
| Young Ahamkara's Spine | hunter | gauntlets | 1 | Aegis-Paket: grenade-tripmine-average-ember-of-ashes-wish-dragon-teeth-with-ignition |

## Schadens-Buffs (Regeln 2 bis 4)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Actium War Rig | titan | chest | 2 | Court Amplification Modifiers: 1.6% per stack für ~ |
| Antaeus Wards | titan | legs | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „50% increased damage“; clarity: „50% increased damage“ |
| Blight Ranger | hunter | helmet | 2 | Court Weapon Surges: 25% für 21s |
| Boots of the Assembler | warlock | legs | 4 | empowering („(Empowering Buff)“); compendium: „35% [15%] increased damage“; clarity: „35% [15%] increased damage“ |
| Cadmus Ridge Lancecap | titan | helmet | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „475% Increased Damage“; clarity: „Diamond Lance damage is increased by 144%“ |
| Chromatic Fire | warlock | chest | 2 | Court Global Debuffs: 15% für 6s |
| Citan's Ramparts | titan | gauntlets | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „60% increased damage“; clarity: „60% increased damage“ |
| Contraverse Hold | warlock | gauntlets | 2 | Court Global Debuffs: 15% für 6s |
| Deimosuffusion | warlock | helmet | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „112.5% increased damage“; clarity: „112.5% increased damage“ |
| Doom Fang Pauldron | titan | gauntlets | 2 | Court Weapon Surges: 10% 17% 22% 25% für 11s |
| Eternal Warrior | titan | helmet | 2 | Court Weapon Surges: 10% 17% 22% 25% für 11s |
| Felwinter's Helm | warlock | helmet | 2 | Court Global Debuffs: 30% für ~; Court Global Debuffs: 15% für 6s |
| Foetracer | hunter | helmet | 2 | Court Weapon Surges: 25% für 16s |
| Fortune's Favor | hunter | legs | 3 | exoticIntrinsic (Court-Liste); compendium: „15% increased damage“; compendium: „20% increased damage“; clarity: „15% increased weapon damage“ |
| Fr0st-EE5 | hunter | legs | 2 | Court Weapon Surges: 22% für ~ |
| Gwisin Vest | hunter | chest | 2 | Court Global Debuffs: 15% für 10s |
| Gyrfalcon's Hauberk | hunter | chest | 2 | Court Empowering Buffs: 35% für 6s |
| Hallowfire Heart | titan | chest | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „6.5% \| 13.6% \| 22% \| 32% \| 43% \| 57% \| 73% \| 93% \| 118% \| 150% Increased Super Damage“ |
| Hazardous Propulsion | titan | chest | 2 | Court Empowering Buffs: 35% at 6x für 10s |
| Heart of Inmost Light | titan | chest | 3 | exoticIntrinsic (Court-Liste); compendium: „35% [20%] Increased Grenade Damage“; clarity: „35% [20%] increased Grenade damage“; Melee-Boni zählen nicht (Melee-Buffs addieren sich, Modell fehlt) |
| Khepri's Sting | hunter | gauntlets | 2 | Court Global Debuffs: 15% für 15s |
| Knucklehead Radar | hunter | helmet | 3 | exoticIntrinsic (Court-Liste); compendium: „1% increased Weapon and Ability Damage“; compendium: „20% Increased Damage“; clarity: „20% increased damage“ |
| Lucky Pants | hunter | legs | 3 | exoticIntrinsic (Court-Liste); compendium: „45% increased Direct Impact damage“; compendium: „30% increased Direct Impact Damage“; clarity: „45% increased Direct Impact damage“; clarity: „30% increased damage“; clarity: „11% increased damage“; clarity: „5% increased damage“ |
| Mantle of Battle Harmony | warlock | chest | 2 | Court Weapon Surges: 25% für 11s; Court Weapon Surges: 25% für 10s |
| Mask of Bakris | hunter | helmet | 2 | Court Amplification Modifiers: 10% 21% 33% für 11s |
| Mechaneer's Tricksleeves | hunter | gauntlets | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „100% [10%] increased Sidearm damage“; clarity: „100% [10%] increased damage“ |
| No Backup Plans | titan | gauntlets | 2 | Court Empowering Buffs: 35% für ~ lasts duration of user buff |
| Oathkeeper | hunter | gauntlets | 3 | exoticIntrinsic (Court-Liste); compendium: „200% increased impact damage“; clarity: „37.5% increased damage“ |
| Peacekeepers | titan | legs | 3 | exoticIntrinsic (Court-Liste); compendium: „5% increased Submachine Gun Impact Damage“; clarity: „5% increased SMG damage“ |
| Peregrine Greaves | titan | legs | 3 | exoticIntrinsic (Court-Liste); compendium: „250% increased impact damage“; compendium: „550% Increased Impact Damage“ |
| Sanguine Alchemy | warlock | chest | 2 | Court Weapon Surges: 25% für ~ |
| Sealed Ahamkara Grasps | hunter | gauntlets | 2 | Court Empowering Buffs: 35% für 7s |
| Second Chance | titan | gauntlets | 2 | Court Global Debuffs: 15% für 10s |
| Spirit of the Eternal Warrior | titan | classPerk | 2 | Court Weapon Surges: 25% für 30s |
| Spirit of the Foetracer | hunter | classPerk | 2 | Court Weapon Surges: 25% für 16s |
| Spirit of the Star-Eater | alle | classPerk | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „18.2% \| 36.4% \| 54.6% \| 59.7% \| 64.8% \| 70% increased Super Damage“; compendium: „50% Increased Super Damage“; compendium: „35% Increased Super Damage“ |
| Spirit of Verity | alle | classPerk | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); compendium: „40% [20%] increased Grenade Damage“; compendium: „55% [40%] increased Grenade Damage“; compendium: „70% [60%] increased Grenade Damage“; compendium: „85% [80%] increased Grenade Damage“; compendium: „100% increased Grenade Damage“ |
| Star-Eater Scales | hunter | legs | 3 | exoticIntrinsic (Court-Liste); compendium: „18.2% \| 36.4% \| 54.6% \| 59.7% \| 64.8% \| 70% increased Super Damage“; clarity: „18.2%\|36.4%\|54.6%\|59.7%\|64.8%\|70% increased Super damage“ |
| Synthoceps | titan | gauntlets | 3 | exoticIntrinsic (Court-Liste); compendium: „50% Increased Super Damage“; clarity: „50% increased Super damage“; Melee-Boni zählen nicht (Melee-Buffs addieren sich, Modell fehlt) |
| The Path of Burning Steps | titan | legs | 2 | Court Amplification Modifiers: 6% 9.2% 12.4% für ∞ |
| Verity's Brow | warlock | helmet | 3 | exoticIntrinsic (Court-Liste); compendium: „40% [20%] increased Grenade Damage“; compendium: „55% [40%] increased Grenade Damage“; compendium: „70% [60%] increased Grenade Damage“; compendium: „85% [80%] increased Grenade Damage“; compendium: „100% increased Grenade Damage“; clarity: „40%\|55%\|70%\|85%\|100% increased Grenade damage“; clarity: „20%\|40%\|60%\|80%\|100% increased Grenade damage“; Melee-Boni zählen nicht (Melee-Buffs addieren sich, Modell fehlt) |
| Wormgod Caress | titan | gauntlets | 2 | Court Empowering Buffs: 1x no bonus 2x 20% 3x 25% 4x 30% 5x 35% für 9.5s 10s 4s 4s 3s |
| Wormhusk Crown | hunter | helmet | 4 | exoticIntrinsic („An effect from Exotics applied directly onto your Weapon or Ability“); clarity: „15% Increased Solar Ability Damage“ |

## Geben einen Effect (Regel 4c)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Hoarfrost-Z | titan | chest | 4 | gibt rally-barricade („Grants Rally Barricade“) |
| Promethium Spur | warlock | legs | 4 | gibt radiant („grant 7 seconds (10 with Ember of Solace) of Radiant“) |
| Rain of Fire | warlock | legs | 4 | gibt radiant („grant Radiant“) |

## Waffen-Timing (Regel 5)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Lunafaction Boots | warlock | legs | 5 | Reload ×0.9 (compendium: „0.9x Reload Duration Multiplier“) |
| Speedloader Slacks | hunter | legs | 5 | Reload ×0.89 (compendium: „- \| 0.925x \| 0.915x \| 0.91x \| 0.89x Reload Duration Multiplier“) |

## Eigener Schaden, kommt später (Regel 5)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Abeyant Leap | titan | legs | 5 | eigener Schaden („detonat“), Damage Instances von Exotics kommen später |
| ACD/0 Feedback Fence | titan | gauntlets | 5 | eigener Schaden („Jolt“), Damage Instances von Exotics kommen später |
| Arbor Warden | titan | chest | 5 | eigener Schaden („Bolt Charge“), Damage Instances von Exotics kommen später |
| Ashen Wake | titan | gauntlets | 5 | eigener Schaden („detonat“), Damage Instances von Exotics kommen später |
| Balance of Power | hunter | legs | 5 | eigener Schaden („Threadling“), Damage Instances von Exotics kommen später |
| Blastwave Striders | titan | legs | 5 | eigener Schaden („dealing 623“), Damage Instances von Exotics kommen später |
| Caliban's Hand | hunter | gauntlets | 5 | eigener Schaden („Scorch“), Damage Instances von Exotics kommen später |
| Crown of Tempests | warlock | helmet | 5 | eigener Schaden („Jolt“), Damage Instances von Exotics kommen später |
| Dunemarchers | titan | legs | 5 | eigener Schaden („deals 220“), Damage Instances von Exotics kommen später |
| Khepri's Horn | titan | helmet | 5 | eigener Schaden („deals 480“), Damage Instances von Exotics kommen später |
| Loreley Splendor Helm | titan | helmet | 5 | eigener Schaden („Sunspot“), Damage Instances von Exotics kommen später |
| Lucky Raspberry | hunter | chest | 5 | eigener Schaden („Jolt“), Damage Instances von Exotics kommen später |
| Mask of Fealty | hunter | helmet | 5 | eigener Schaden („Projectile“), Damage Instances von Exotics kommen später |
| Melas Panoplia | titan | gauntlets | 5 | eigener Schaden („explosion“), Damage Instances von Exotics kommen später |
| Mk. 44 Stand Asides | titan | legs | 5 | eigener Schaden („Bolt Charge“), Damage Instances von Exotics kommen später |
| Moirai | hunter | chest | 5 | eigener Schaden („detonat“), Damage Instances von Exotics kommen später |
| Mothkeeper's Wraps | hunter | gauntlets | 5 | eigener Schaden („detonat“), Damage Instances von Exotics kommen später |
| Nothing Manacles | warlock | gauntlets | 5 | eigener Schaden („explosion“), Damage Instances von Exotics kommen später |
| Phoenix Cradle | titan | legs | 5 | eigener Schaden („Sunspot“), Damage Instances von Exotics kommen später |
| Praxic Vestment | titan | chest | 5 | eigener Schaden („Deals up to 168“), Damage Instances von Exotics kommen später |
| Renewal Grasps | hunter | gauntlets | 5 | eigener Schaden („deal 50“), Damage Instances von Exotics kommen später |
| Rime-coat Raiment | warlock | chest | 5 | eigener Schaden („Projectile“), Damage Instances von Exotics kommen später |
| Severance Enclosure | titan | chest | 5 | eigener Schaden („Explosion“), Damage Instances von Exotics kommen später |
| Shinobu's Vow | hunter | gauntlets | 5 | eigener Schaden („Bolt Charge“), Damage Instances von Exotics kommen später |
| Skull of Dire Ahamkara | warlock | helmet | 5 | eigener Schaden („deals up to 2269“), Damage Instances von Exotics kommen später |
| Solipsism | warlock | classItem | 5 | eigener Schaden („Threadling“), Damage Instances von Exotics kommen später |
| Spirit of Caliban | hunter | classPerk | 5 | eigener Schaden („Ignit“), Damage Instances von Exotics kommen später |
| Spirit of Contact | titan | classPerk | 5 | eigener Schaden („deals 181“), Damage Instances von Exotics kommen später |
| Spirit of Osmiomancy | warlock | classPerk | 5 | eigener Schaden („Threadling“), Damage Instances von Exotics kommen später |
| Spirit of Renewal | hunter | classPerk | 5 | eigener Schaden („deal 50“), Damage Instances von Exotics kommen später |
| Spirit of Severance | titan | classPerk | 5 | eigener Schaden („Explosion“), Damage Instances von Exotics kommen später |
| Spirit of the Abeyant | titan | classPerk | 5 | eigener Schaden („detonat“), Damage Instances von Exotics kommen später |
| Spirit of the Horn | titan | classPerk | 5 | eigener Schaden („deal 480“), Damage Instances von Exotics kommen später |
| Spirit of the Necrotic | warlock | classPerk | 5 | eigener Schaden („dealing 32“), Damage Instances von Exotics kommen später |
| Spirit of the Swarm | warlock | classPerk | 5 | eigener Schaden („Threadling“), Damage Instances von Exotics kommen später |
| Spirit of Vesper | warlock | classPerk | 5 | eigener Schaden („deals 360“), Damage Instances von Exotics kommen später |
| Stoicism | titan | classItem | 5 | eigener Schaden („explosion“), Damage Instances von Exotics kommen später |
| Swarmers | warlock | legs | 5 | eigener Schaden („Threadling“), Damage Instances von Exotics kommen später |
| The Bombardiers | hunter | legs | 5 | eigener Schaden („explodes“), Damage Instances von Exotics kommen später |
| Vesper of Radius | warlock | chest | 5 | eigener Schaden („deals 360“), Damage Instances von Exotics kommen später |

## Nur Energie, Modell fehlt (Regel 5)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| An Insurmountable Skullfort | titan | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Apotheosis Veil | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Astrocyte Verse | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Crest of Alpha Lupi | titan | chest | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Eye of Another World | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Fallen Sunstar | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Getaway Artist | warlock | gauntlets | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Graviton Forfeit | hunter | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Icefall Mantle | titan | gauntlets | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Mask of the Quiet One | titan | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Nezarec's Sin | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Omnioculus | hunter | chest | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Osmiomancy Gloves | warlock | gauntlets | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Phoenix Protocol | warlock | chest | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Radiant Dance Machines | hunter | legs | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Secant Filaments | warlock | legs | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Speaker's Sight | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of Alpha Lupi | titan | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of Apotheosis | warlock | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of Galanor | hunter | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of Harmony | warlock | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of Starfire | warlock | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of the Bear | titan | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Spirit of the Filaments | warlock | classPerk | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Starfire Protocol | warlock | chest | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Stronghold | titan | gauntlets | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| The Stag | warlock | helmet | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |
| Ursa Furiosa | titan | gauntlets | 5 | nur Energie; die Rotation legt die Casts fest, Modell fehlt |

## Lücken (Regeln 3 bis 5)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Armamentarium | titan | chest | 5 | Timing ohne Faktor („On Grenade Ability Usage: Refills Magazine / Dissipates 100% Heat“), bei Grenade-Einsatz; Modell fehlt |
| Athrys's Embrace | hunter | gauntlets | 3 | nur Melee-Boni (compendium: „300% [100%] increased Weighted Throwing Knife damage“; clarity: „300% [100%] Increased Damage“); Melee-Buffs addieren sich, Modell fehlt |
| Cenotaph Mask | warlock | helmet | 5 | Timing ohne Faktor („Trace Rifles refill 4% of their Magazine every 0.7 seconds“), Modell fehlt |
| Liar's Handshake | hunter | gauntlets | 3 | nur Melee-Boni (compendium: „400% increased Melee Damage“; clarity: „400% additional base Melee damage“); Melee-Buffs addieren sich, Modell fehlt |
| Ophidia Spathe | hunter | chest | 4 | nur Melee-Boni (compendium: „67% \| 133% \| 200% Increased Throwing Knife Damage“); Melee-Buffs addieren sich, Modell fehlt |
| Ophidian Aspect | warlock | gauntlets | 5 | Timing ohne Faktor („Passively grants +35 Handling, +35 Reload Speed, and +10 Airborne Effectiveness“), Reload Speed ohne Faktor; Umrechnung in Zeit ohne Quelle |
| Point-Contact Cannon Brace | titan | gauntlets | 4 | nur Melee-Boni (compendium: „Lightning Damage is increased by 100%“); Melee-Buffs addieren sich, Modell fehlt |
| Relativism | hunter | classItem | 5 | Timing ohne Faktor („Using your class ability temporarily increases this benefit and reloads your equipped weapon from reserves“), per Class Ability; Class Abilities sind nicht in der Rotation |
| Spirit of the Dragon | hunter | classPerk | 5 | Timing ohne Faktor („On Class Ability Usage: Reloads all weapons and picks up Ammo Bricks within 15 meters“), per Class Ability; Class Abilities sind nicht in der Rotation |
| Spirit of the Liar | hunter | classPerk | 4 | nur Melee-Boni (compendium: „400% increased Basic and Arc Melee Damage“); Melee-Buffs addieren sich, Modell fehlt |
| The Dragon's Shadow | hunter | chest | 5 | Timing ohne Faktor („On Class Ability Usage: Reloads all weapons and picks up Ammo Bricks within 15 meters“), per Class Ability; Class Abilities sind nicht in der Rotation |
| Transversive Steps | warlock | legs | 5 | Timing ohne Faktor („Upon sprinting for 1.5 seconds: Refills 100% of Magazine/Dissipates 100% Heat of Readied Weapon“), Modell fehlt |
| Triton Vice | hunter | gauntlets | 3 | nur Melee-Boni (compendium: „200% Increased Glaive Melee Damage“; clarity: „200% increased Glaive Melee Damage“); Melee-Buffs addieren sich, Modell fehlt |
| Winter's Guile | warlock | gauntlets | 3 | nur Melee-Boni (compendium: „400% increased Melee Damage“; clarity: „67.5% \| 122% \| 166% \| 202% \| 228% \| 249% \| 265% \| 278% \| 289% \| 300% Additional Base Melee Damage“; clarity: „400% Additional Base Melee Damage“); Melee-Buffs addieren sich, Modell fehlt |
| Wishful Ignorance | titan | gauntlets | 3 | nur Melee-Boni (compendium: „25% \| 60% \| 120% Increased Flechette Storm and Frenzied Blade damage“; clarity: „25%\|60%\|120% increased Frenzied Blade and Flechette Storm damage“); Melee-Buffs addieren sich, Modell fehlt |

## Ohne Schadenswirkung (Regeln 5 und 6)

| Exotic | Klasse | Slot | Regel | Grund |
| --- | --- | --- | --- | --- |
| Aeon Safe | titan | gauntlets | 6 | kein Schadenswort im Text |
| Aeon Soul | warlock | gauntlets | 6 | kein Schadenswort im Text |
| Aeon Swift | hunter | gauntlets | 6 | kein Schadenswort im Text |
| Assassin's Cowl | hunter | helmet | 6 | kein Schadenswort im Text |
| Cyrtarachne's Facade | hunter | helmet | 6 | kein Schadenswort im Text |
| Gemini Jester | hunter | legs | 6 | kein Schadenswort im Text |
| Helm of Saint-14 | titan | helmet | 5 | verlängert banner-shield („Weapons of Light from Ward of Dawn can now persist“); das Modell hält auffrischbare Buffs ohnehin die ganze Damage Phase aktiv |
| Karnstein Armlets | warlock | gauntlets | 6 | kein Schadenswort im Text |
| Lion Rampant | titan | legs | 6 | kein Schadenswort im Text |
| One-Eyed Mask | titan | helmet | 6 | kein Schadenswort im Text |
| Precious Scars | titan | helmet | 6 | kein Schadenswort im Text |
| Spirit of Hoarfrost | titan | classPerk | 6 | kein Schadenswort im Text |
| Spirit of Scars | titan | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Armamentarium | titan | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Assassin | alle | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Claw | warlock | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Coyote | hunter | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Cyrtarachne | hunter | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Gyrfalcon | hunter | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Ophidian | alle | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Stag | warlock | classPerk | 6 | kein Schadenswort im Text |
| Spirit of the Wormhusk | hunter | classPerk | 6 | kein Schadenswort im Text |
| St0mp-EE5 | hunter | legs | 6 | kein Schadenswort im Text |
| The Sixth Coyote | hunter | chest | 6 | kein Schadenswort im Text |
| Wings of Sacred Dawn | warlock | chest | 5 | betrifft nur verstaute Waffen („Tome of Dawn: Solar Weapon Kills grant Restoration x1 for ? seconds and refill stowed weapons“); das Modell rechnet mit einer Waffe |
