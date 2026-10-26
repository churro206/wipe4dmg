# Abdeckung der Aegis-Zeilen

Generiert von `npm run coverage` (`tests/lib/aegisCoverage.ts`), nicht von Hand bearbeiten. Jede Zeile der Reiter Weapons, Sustained und Swap hat ein Urteil:
**im Modell** (Zeile genutzt oder geprüft, oder das Item steckt mit allen Annahmen im Modell), **übersprungen** (mit Grund) oder **fehlt** (Item oder Annahme nicht im Modell). Legendary Frames sind übersprungen (Inhaber, 2026-10-25).

## Übersicht

| Reiter | Zeilen | im Modell | übersprungen | fehlt |
| --- | ---: | ---: | ---: | ---: |
| Weapons | 417 | 143 | 244 | 30 |
| Sustained | 261 | 38 | 131 | 92 |
| Swap | 204 | 47 | 102 | 55 |

## Was fehlt

Item oder Annahme, mit der Zahl der Zeilen, die sie nennen, und der Wirkung (`tests/lib/missingImpact.ts`). Die Wirkung kommt aus zwei Aegis-Zeilen desselben Items im selben Reiter, die sich nur um den Eintrag unterscheiden (größte Abweichung aller Paare); sie gilt für das Item, ist also eine Obergrenze für einen Build. Schwelle 2 % (`CLAUDE.md`, „Breite vor Genauigkeit“). Das ist die Arbeitsliste für die nächsten Kategorie-Blöcke.

| Eintrag | Zeilen | Urteil | Wirkung | Paare |
| --- | ---: | --- | ---: | ---: |
| Fated Missile x15 | 1 | über Schwelle | +597,6 % | 1 |
| full bow charge | 3 | über Schwelle | +26,5 % | 3 |
| blighted | 3 | über Schwelle | +25,0 % | 3 |
| no ignitions | 1 | über Schwelle | -23,7 % | 1 |
| blight | 1 | über Schwelle | -19,6 % | 1 |
| super: Song of Flame | 8 | Item fehlt |  |  |
| melee: Grapple melee | 5 | Item fehlt |  |  |
| super: Silence and Squall | 4 | Item fehlt |  |  |
| Wolfsbane (no package) | 4 | Item fehlt |  |  |
| Praxic Blade (no package) | 3 | Item fehlt |  |  |
| super: Bladefury | 3 | Item fehlt |  |  |
| own damage: Unravel | 2 | Item fehlt |  |  |
| own damage: Witherhoard | 2 | Item fehlt |  |  |
| Barrow-Dyad (no package) | 1 | Item fehlt |  |  |
| melee: Adaptive glaive | 1 | Item fehlt |  |  |
| melee: Cull's Shadow | 1 | Item fehlt |  |  |
| melee: Flechette Storm | 1 | Item fehlt |  |  |
| melee: Lightning Surge | 1 | Item fehlt |  |  |
| melee: Winterbite | 1 | Item fehlt |  |  |
| own damage: Alethonym | 1 | Item fehlt |  |  |
| own damage: Anarchy | 1 | Item fehlt |  |  |
| own damage: Area denial grenade launcher | 1 | Item fehlt |  |  |
| own damage: Finality's Auger | 1 | Item fehlt |  |  |
| own damage: Jolt | 1 | Item fehlt |  |  |
| own damage: Mantle of Battle Harmony | 1 | Item fehlt |  |  |
| own damage: Sword Storm Combo | 1 | Item fehlt |  |  |
| variant of Arc Soul | 1 | Item fehlt |  |  |
| variant of Hellion | 1 | Item fehlt |  |  |
| variant of Storm's Keep | 1 | Item fehlt |  |  |
| Transcendent | 11 | kein Paar, Wert aus Text |  |  |
| Roaring Flames x3 | 7 | kein Paar, Wert aus Text |  |  |
| Solar Fulmination | 6 | kein Paar, Wert aus Text |  |  |
| Pack Hunter | 5 | kein Paar, Wert aus Text |  |  |
| Burning Ambition | 4 | kein Paar, Wert aus Text |  |  |
| Harsh Refraction | 4 | kein Paar, Wert aus Text |  |  |
| Jagged Edge | 4 | kein Paar, Wert aus Text |  |  |
| Sword Storm Combo | 3 | kein Paar, Wert aus Text |  |  |
| Bull Rider | 2 | kein Paar, Wert aus Text |  |  |
| Cabal | 2 | kein Paar, Wert aus Text |  |  |
| Composite Propellant x5 | 2 | kein Paar, Wert aus Text |  |  |
| Conductive Cosmic Needle x3 | 2 | kein Paar, Wert aus Text |  |  |
| Hail the Storm | 2 | kein Paar, Wert aus Text |  |  |
| Incendiary Rifle Rounds | 2 | kein Paar, Wert aus Text |  |  |
| Pack Tactics (simplified underestimate of 3 stack start) | 2 | kein Paar, Wert aus Text |  |  |
| Pack Tactics x2 | 2 | kein Paar, Wert aus Text |  |  |
| Target Lock | 2 | kein Paar, Wert aus Text |  |  |
| Assault Mag | 1 | kein Paar, Wert aus Text |  |  |
| Facet of Command | 1 | kein Paar, Wert aus Text |  |  |
| Facet of Ruin | 1 | kein Paar, Wert aus Text |  |  |
| Grenades Prepped | 1 | kein Paar, Wert aus Text |  |  |
| Impetus | 1 | kein Paar, Wert aus Text |  |  |
| Kinetic Impacts | 1 | kein Paar, Wert aus Text |  |  |
| Lightning Seeker into six shot cycle | 1 | kein Paar, Wert aus Text |  |  |
| Linear Fusion Mode | 1 | kein Paar, Wert aus Text |  |  |
| Marksman Sights | 1 | kein Paar, Wert aus Text |  |  |
| Moebius Quiver | 1 | kein Paar, Wert aus Text |  |  |
| Overwhelming Power | 1 | kein Paar, Wert aus Text |  |  |
| Paracausal Imbuement | 1 | kein Paar, Wert aus Text |  |  |
| Property: Irreducible | 1 | kein Paar, Wert aus Text |  |  |
| Prototype Truthseeker | 1 | kein Paar, Wert aus Text |  |  |
| Release the Wolves | 1 | kein Paar, Wert aus Text |  |  |
| Saint's Fury | 1 | kein Paar, Wert aus Text |  |  |
| Shot in the Dark | 1 | kein Paar, Wert aus Text |  |  |
| Skull of Dire Ahamkara (ownDamage) | 1 | kein Paar, Wert aus Text |  |  |
| Sniper's Meditation (assume stacked) | 1 | kein Paar, Wert aus Text |  |  |
| Supercharged Battery | 1 | kein Paar, Wert aus Text |  |  |
| Target Acquired | 1 | kein Paar, Wert aus Text |  |  |
| Tempered Edge | 1 | kein Paar, Wert aus Text |  |  |
| Temporal Alignment | 1 | kein Paar, Wert aus Text |  |  |
| Temporal Sprint | 1 | kein Paar, Wert aus Text |  |  |
| The Fundamentals | 1 | kein Paar, Wert aus Text |  |  |
| Transcendent but excludes 5% | 1 | kein Paar, Wert aus Text |  |  |
| Trench Barrel | 1 | kein Paar, Wert aus Text |  |  |
| Whisper of Fissures | 1 | kein Paar, Wert aus Text |  |  |
| assumes no other debuff | 6 | Spielweise oder Notiz |  |  |
| heavy attacks | 6 | Spielweise oder Notiz |  |  |
| excludes Transcendence 5% bonus | 5 | Spielweise oder Notiz |  |  |
| body | 4 | Spielweise oder Notiz |  |  |
| both volleys | 4 | Spielweise oder Notiz |  |  |
| pre-popped into 6 shot cycle | 4 | Spielweise oder Notiz |  |  |
| 1H2L combo | 3 | Spielweise oder Notiz |  |  |
| light attacks | 3 | Spielweise oder Notiz |  |  |
| simulated | 3 | Spielweise oder Notiz |  |  |
| 1 mag | 2 | Spielweise oder Notiz |  |  |
| 2L1H combo | 2 | Spielweise oder Notiz |  |  |
| 2L1H1R combo | 2 | Spielweise oder Notiz |  |  |
| 3L1H1R combo | 2 | Spielweise oder Notiz |  |  |
| all 3 volleys | 2 | Spielweise oder Notiz |  |  |
| auto-loaded | 2 | Spielweise oder Notiz |  |  |
| caster frame | 2 | Spielweise oder Notiz |  |  |
| excludes Bolt Charge | 2 | Spielweise oder Notiz |  |  |
| heavy spam | 2 | Spielweise oder Notiz |  |  |
| includes jolt | 2 | Spielweise oder Notiz |  |  |
| includes Threadlings | 2 | Spielweise oder Notiz |  |  |
| light attack spam | 2 | Spielweise oder Notiz |  |  |
| light-heavy cycle | 2 | Spielweise oder Notiz |  |  |
| max distance | 2 | Spielweise oder Notiz |  |  |
| precision | 2 | Spielweise oder Notiz |  |  |
| projectile | 2 | Spielweise oder Notiz |  |  |
| starts at 0 stacks | 2 | Spielweise oder Notiz |  |  |
| uncharged | 2 | Spielweise oder Notiz |  |  |
| 1 charge | 1 | Spielweise oder Notiz |  |  |
| 2 charges | 1 | Spielweise oder Notiz |  |  |
| 2 rings | 1 | Spielweise oder Notiz |  |  |
| 2H2L combo | 1 | Spielweise oder Notiz |  |  |
| 3 body pellet shots into On Black Wings x3 slugs | 1 | Spielweise oder Notiz |  |  |
| 4L1H1R combo | 1 | Spielweise oder Notiz |  |  |
| 9 ammo consumed | 1 | Spielweise oder Notiz |  |  |
| aerial lights | 1 | Spielweise oder Notiz |  |  |
| all three casts | 1 | Spielweise oder Notiz |  |  |
| assumes max frenzy | 1 | Spielweise oder Notiz |  |  |
| assumes suspend tick every 3 shots | 1 | Spielweise oder Notiz |  |  |
| axe heavy attack | 1 | Spielweise oder Notiz |  |  |
| axe light attack spam | 1 | Spielweise oder Notiz |  |  |
| boss against wall | 1 | Spielweise oder Notiz |  |  |
| charged | 1 | Spielweise oder Notiz |  |  |
| fireteam scaling | 1 | Spielweise oder Notiz |  |  |
| full grenade uptime | 1 | Spielweise oder Notiz |  |  |
| fully charged | 1 | Spielweise oder Notiz |  |  |
| grounded | 1 | Spielweise oder Notiz |  |  |
| grounded spam | 1 | Spielweise oder Notiz |  |  |
| held down | 1 | Spielweise oder Notiz |  |  |
| hip-fire | 1 | Spielweise oder Notiz |  |  |
| hitscan mode | 1 | Spielweise oder Notiz |  |  |
| hone before rally | 1 | Spielweise oder Notiz |  |  |
| includes ignition | 1 | Spielweise oder Notiz |  |  |
| includes melee time | 1 | Spielweise oder Notiz |  |  |
| includes Quantum Nova windup and splash | 1 | Spielweise oder Notiz |  |  |
| includes rehone time | 1 | Spielweise oder Notiz |  |  |
| includes submunitions | 1 | Spielweise oder Notiz |  |  |
| lightweight frame | 1 | Spielweise oder Notiz |  |  |
| manual reloads until The Grandmaster | 1 | Spielweise oder Notiz |  |  |
| marked | 1 | Spielweise oder Notiz |  |  |
| max projectile height | 1 | Spielweise oder Notiz |  |  |
| no chains | 1 | Spielweise oder Notiz |  |  |
| per cast | 1 | Spielweise oder Notiz |  |  |
| pre-stacked | 1 | Spielweise oder Notiz |  |  |
| projectile mode | 1 | Spielweise oder Notiz |  |  |
| shatter ignition | 1 | Spielweise oder Notiz |  |  |
| spaced* | 1 | Spielweise oder Notiz |  |  |
| starts at The Master x0 | 1 | Spielweise oder Notiz |  |  |
| starts at The Master x20 | 1 | Spielweise oder Notiz |  |  |
| two kills | 1 | Spielweise oder Notiz |  |  |
| typical boss model | 1 | Spielweise oder Notiz |  |  |
| up to Rewind end | 1 | Spielweise oder Notiz |  |  |
| vortex frame | 1 | Spielweise oder Notiz |  |  |
| wave frame | 1 | Spielweise oder Notiz |  |  |
| with corruption | 1 | Spielweise oder Notiz |  |  |
| x20 first shot | 1 | Spielweise oder Notiz |  |  |
| assumes at least 2 orb pickups per mag | 2 | unter Schwelle | +0,0 % | 1 |
| pre-popped | 1 | unter Schwelle | +0,0 % | 1 |

## Weapons

| Zeile | Urteil | Detail |
| --- | --- | --- |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Balanced heat weapon - 450RPM primary | übersprungen | legendary frame (owner 2026-10-25) |
| Centrifuse | im Modell | base row of the package |
| Cerberus+1, point blank | im Modell | base row of the package |
| Choir of One, hitscan | übersprungen | ohne projectile - spaced (~9m) der Basiszeile |
| Choir of One, projectile - point blank | übersprungen | ohne projectile - spaced (~9m) der Basiszeile |
| Choir of One, projectile - spaced (~9m) | im Modell | base row of the package |
| Hard Light | im Modell | base row of the package |
| High-impact frame | übersprungen | legendary frame (owner 2026-10-25) |
| Khvostov 7G-0X, average, with ricochetting bullets | im Modell | base row of the package |
| Monte Carlo | im Modell | base row of the package |
| Necrochasm | im Modell | base row of the package |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Quicksilver Storm, Grenades Prepped | fehlt | nicht modelliert: Grenades Prepped |
| Quicksilver Storm, average, with tracking rockets | im Modell | base row of the package |
| Rapid-fire frame | übersprungen | legendary frame (owner 2026-10-25) |
| Support frame | übersprungen | legendary frame (owner 2026-10-25) |
| SUROS Regime, average, Dual Speed Receiver | übersprungen | ohne Spinning Up der Basiszeile |
| SUROS Regime, average, Spinning Up | im Modell | base row of the package |
| Sweet Business, average, with explosive rounds | im Modell | base row of the package |
| Tommy's Matchbook, average, with ignition | im Modell | base row of the package |
| Heirloom, uncharged | im Modell | base row of the package |
| Heirloom, average, 1/3 charge, with ignition, catalyst | übersprungen | Katalysator: catalyst |
| Heirloom, average, 2/3 charge, with ignition, catalyst | übersprungen | Katalysator: catalyst |
| Heirloom, average, fully charged, with ignition, catalyst | übersprungen | Katalysator: catalyst |
| Hierarchy of Needs, average, 2 rings, fireteam scaling | fehlt | nicht modelliert: 2 rings; nicht modelliert: fireteam scaling |
| Hierarchy of Needs, average, one ring | im Modell | base row of the package |
| High-impact frame, Spring-Auger Bolts | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, Heavy Bolts | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, Explosive Bolts | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, Serrated Bolts, with retrieval | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, Charged Bolts | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact longbow frame | übersprungen | legendary frame (owner 2026-10-25) |
| Le Monarque, average, with poison | im Modell | base row of the package |
| Leviathan's Breath | im Modell | base row of the package |
| Lightweight frame | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Ticuu's Divination, average, alternating modes, 6 stacks | im Modell | base row of the package |
| Trinity Ghoul | im Modell | base row of the package |
| Verglas Curve | im Modell | base row of the package |
| Wish-Ender | im Modell | base row of the package |
| Wish-Keeper, Vorpal Weapon | im Modell | base row of the package |
| Adaptive frame, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Bastion | im Modell | base row of the package |
| Cull's Shadow | übersprungen | ohne average, with corruption der Basiszeile |
| Cull's Shadow, average, with corruption | im Modell | base row of the package |
| Cull's Shadow, with corruption | übersprungen | ohne average der Basiszeile |
| Delicate Tomb, hipfire | im Modell | base row of the package |
| Delicate Tomb, ADS | übersprungen | ohne hipfire der Basiszeile |
| High-impact frame, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Jötunn, average, successive shots | im Modell | base row of the package |
| Merciless, Conserve Momentum x15, full mag | im Modell | base row of the package |
| Merciless, Conserve Momentum x0, full mag | übersprungen | ohne Conserve Momentum x15 der Basiszeile |
| One Thousand Voices, average | im Modell | base row of the package |
| One Thousand Voices, average, Ember of Ashes | übersprungen | gleiche Annahmen wie die Basiszeile |
| One Thousand Voices, average, catalyst | im Modell | option "catalyst" |
| One Thousand Voices, average, Ember of Ashes, catalyst | übersprungen | Katalysator: catalyst |
| One Thousand Voices, average, blighted, catalyst | fehlt | nicht modelliert: blighted; Katalysator: catalyst |
| One Thousand Voices, average, Ember of Ashes, blighted, catalyst | fehlt | nicht modelliert: blighted; Katalysator: catalyst |
| Precision frame, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Telesto | im Modell | base row of the package |
| Tessellation, Property: Irreducible, Transcendent, Transcendence bonus included | fehlt | nicht modelliert: Transcendent |
| Tessellation, Property: Irreducible | im Modell | base row of the package |
| Tessellation | übersprungen | ohne Property: Irreducible der Basiszeile |
| Vex Mythoclast | im Modell | base row of the package |
| Vex Mythoclast, Temporal Unlimiter | im Modell | option "Temporal Unlimiter" |
| Adaptive frame, projectile | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, projectile | übersprungen | legendary frame (owner 2026-10-25) |
| Edge of Action, projectile | im Modell | base row of the package |
| Edge of Concurrence, Lightning Seeker | übersprungen | ohne projectile der Basiszeile |
| Edge of Concurrence, projectile | im Modell | base row of the package |
| Edge of Intent, projectile | im Modell | base row of the package |
| Rapid-fire frame, projectile | übersprungen | legendary frame (owner 2026-10-25) |
| Vexcalibur, projectile | im Modell | base row of the package |
| Winterbite, average, projectile, with shatter | im Modell | base row of the package |
| Adaptive frame, Sticky Grenades, Explosive Light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Sticky Grenades, Explosive Light, Overwhelming Power | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Spike Grenades | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Spike Grenades, Explosive Light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Sticky Grenades | übersprungen | legendary frame (owner 2026-10-25) |
| Alethonym, average | im Modell | base row of the package |
| Anarchy, average, per trap, double stick, Jolting Feedback | im Modell | base row of the package |
| Area denial frame | übersprungen | legendary frame (owner 2026-10-25) |
| Compressed wave frame | übersprungen | legendary frame (owner 2026-10-25) |
| Dead Messenger | im Modell | base row of the package |
| Double fire frame, Hard Launch | übersprungen | legendary frame (owner 2026-10-25) |
| Double fire frame, Hard Launch, Spike Grenades | übersprungen | legendary frame (owner 2026-10-25) |
| Ex Diris, average, with moth | im Modell | base row of the package |
| Fighting Lion, average, with volatile damage | im Modell | base row of the package |
| Lightweight frame, Confined Launch, Implosion Rounds | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Confined Launch, Spike Grenades | übersprungen | legendary frame (owner 2026-10-25) |
| Micro-missile frame, Hard Launch, Implosion Rounds | übersprungen | legendary frame (owner 2026-10-25) |
| Micro-missile frame, Hard Launch, Spike Grenades | übersprungen | legendary frame (owner 2026-10-25) |
| Parasite | im Modell | base row of the package |
| Rapid-fire frame | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame, Spike Grenades | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame, Sticky Grenades, Explosive Light | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame, Sticky Grenades, Explosive Light, Overwhelming Power | übersprungen | legendary frame (owner 2026-10-25) |
| Salvation's Grip | im Modell | base row of the package |
| Salvation's Grip, average, charged | übersprungen | gleiche Annahmen wie die Basiszeile |
| Salvation's Grip, average, charged, Hail the Storm | übersprungen | Artefakt: Hail the Storm |
| The Colony, direct impact | im Modell | base row of the package |
| The Prospector, average, direct impact, standard target model | im Modell | base row of the package |
| Wave frame | übersprungen | legendary frame (owner 2026-10-25) |
| Witherhoard, direct impact | im Modell | base row of the package |
| Witherhoard, ground pool | übersprungen | ohne direct impact der Basiszeile |
| Ace of Spades | im Modell | base row of the package |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Crimson, burst | im Modell | base row of the package |
| Dynamic heat weapon - 180RPM primary | übersprungen | legendary frame (owner 2026-10-25) |
| Dynamic heat weapon - 180RPM special | übersprungen | legendary frame (owner 2026-10-25) |
| Dynamic heat weapon - 180RPM special, Illegally Modded Holster, 18 shots, e. Precision Instrument, e. Accelerated Assault | übersprungen | legendary frame (owner 2026-10-25) |
| Dynamic heat weapon - 180RPM special, Illegally Modded Holster, 15 shots, e. Precision Instrument, pre-stacked using Crimson, e. Accelerated Assault | übersprungen | legendary frame (owner 2026-10-25) |
| Eriana's Vow, Death At First Glance | im Modell | base row of the package |
| Eriana's Vow, Illegally Modded Holster, Death At First Glance, 7 shots, pre-stacked using heavy burst | übersprungen | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Eriana's Vow, Illegally Modded Holster, Death At First Glance, full mag | übersprungen | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Graviton Spike, stasis mode | im Modell | base row of the package |
| Graviton Spike, arc mode | übersprungen | ohne stasis mode der Basiszeile |
| Graviton Spike, average, overcharging both modes, typical boss model, Temporal Alignment | fehlt | nicht modelliert: Temporal Alignment |
| Hawkmoon | im Modell | base row of the package |
| Hawkmoon, Illegally Modded Holster, Paracausal Shot, full mag | übersprungen | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Hawkmoon, Illegally Modded Holster, Paracausal Shot, full mag, pre-stacked using heavy burst | übersprungen | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Heavy burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Heavy burst frame, Illegally Modded Holster, 13 bursts, e. Precision Instrument | übersprungen | legendary frame (owner 2026-10-25) |
| Heavy burst frame, Illegally Modded Holster, 13 bursts | übersprungen | legendary frame (owner 2026-10-25) |
| Lumina | im Modell | base row of the package |
| Malfeasance, average, with slugs, Vorpal Weapon | im Modell | option "Vorpal Weapon" |
| Malfeasance, Illegally Modded Holster, 17 shots, with slugs, blighted, Vorpal Weapon | fehlt | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: blighted; Katalysator: Vorpal Weapon |
| Malfeasance, Illegally Modded Holster, 17 shots, with slugs, Vorpal Weapon | übersprungen | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); Katalysator: Vorpal Weapon |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, Illegally Modded Holster, 17 shots | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, Illegally Modded Holster, 17 shots, e. Precision Instrument | übersprungen | legendary frame (owner 2026-10-25) |
| Spread shot frame | übersprungen | legendary frame (owner 2026-10-25) |
| Spread shot frame, Illegally Modded Holster, 14 shots, Cascade Point start | übersprungen | legendary frame (owner 2026-10-25) |
| Spread shot frame, Illegally Modded Holster, 10 shots | übersprungen | legendary frame (owner 2026-10-25) |
| Sturm | im Modell | base row of the package |
| Sunshot | im Modell | base row of the package |
| The Last Word, hipfire | im Modell | base row of the package |
| The Last Word, Illegally Modded Holster, hipfire, 1 mag, Envious Assassin | fehlt | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: 1 mag; Katalysator: Envious Assassin |
| The Last Word, Illegally Modded Holster, hipfire, 1 mag | fehlt | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: 1 mag |
| Thorn, average, with poison | im Modell | base row of the package |
| Thorn, Illegally Modded Holster, with poison, Soul Devourer, 14 shots | übersprungen | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Turncoat, average | im Modell | base row of the package |
| Turncoat, Overwhelming Power | fehlt | nicht modelliert: Overwhelming Power |
| Adaptive burst frame, burst, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Arbalest | im Modell | base row of the package |
| Euphony, burst, without threadlings | im Modell | base row of the package |
| Fafnir | im Modell | base row of the package |
| Finality's Auger, Linear Fusion Mode | im Modell | base row of the package |
| Finality's Auger, Ruinscribe Turret Mode, marked, entire turret duration | fehlt | nicht modelliert: marked |
| Lorentz Driver | im Modell | base row of the package |
| Precision frame, Charge MW, Accelerated Coils | übersprungen | legendary frame (owner 2026-10-25) |
| Sleeper Simulant | im Modell | base row of the package |
| The Queenbreaker, Marksman Sights | übersprungen | ohne burst, Combat Sights der Basiszeile |
| The Queenbreaker, burst, Combat Sights | im Modell | base row of the package |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Balanced heat weapon - 900RPM power | übersprungen | legendary frame (owner 2026-10-25) |
| Deterministic Chaos, average, with volatile damage, excludes weaken | im Modell | base row of the package |
| Deterministic Chaos, average, with volatile damage, excludes weaken, Target Lock, single mag | übersprungen | Katalysator: Target Lock |
| Grand Overture, Missile Loaded, Volley Ready | im Modell | base row of the package |
| Grand Overture | übersprungen | ohne Missile Loaded, Volley Ready der Basiszeile |
| Heir Apparent | im Modell | base row of the package |
| High-impact frame | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame | übersprungen | legendary frame (owner 2026-10-25) |
| Service of Luzaku | im Modell | base row of the package |
| Thunderlord, average, with lightning strikes, excludes Bolt Charge | im Modell | base row of the package |
| Xenophage | im Modell | base row of the package |
| Adaptive frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Bad Juju, burst | im Modell | base row of the package |
| Balanced heat weapon - 540RPM primary, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Collective Obligation, burst | im Modell | base row of the package |
| Dynamic heat weapon - 540RPM primary, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Graviton Lance, burst, Vorpal Weapon | im Modell | base row of the package |
| Heavy burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Micro-missile frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| New Malpais, average, 3 bursts, includes suspend, excludes unravel | im Modell | base row of the package |
| No Time to Explain, burst | im Modell | base row of the package |
| Outbreak Perfected, average per burst - max nanites | im Modell | base row of the package |
| Outbreak Perfected, average per burst - no nanites, Appended Mag, up to Rewind end | fehlt | nicht modelliert: up to Rewind end |
| Rapid-fire frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Red Death Reformed, burst, undamaged | im Modell | base row of the package |
| Revision Zero, Hunter's Trace, Vorpal Weapon, includes shockwave | übersprungen | ohne burst - heavy 2-burst mode der Basiszeile |
| Revision Zero, burst - heavy 2-burst mode, Vorpal Weapon | im Modell | base row of the package |
| Revision Zero, burst - light 4-burst mode, Vorpal Weapon | übersprungen | ohne burst - heavy 2-burst mode der Basiszeile |
| Vigilance Wing, burst | im Modell | base row of the package |
| Aggressive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Impact Casing | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Impact Casing, Cluster Bomb, standard boss model | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Impact Casing, Pack Hunter | übersprungen | legendary frame (owner 2026-10-25) |
| Deathbringer, max height | im Modell | base row of the package |
| Dragon's Breath, average, loaded, Composite Propellant x5 | im Modell | base row of the package |
| Eyes of Tomorrow, volley | im Modell | base row of the package |
| Gjallarhorn | im Modell | base row of the package |
| High-impact frame, Impact Casing | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, Impact Casing, Cluster Bomb, standard boss model | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame, Impact Casing, Pack Hunter | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, Impact Casing | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, Impact Casing, Cluster Bomb, standard boss model | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, Impact Casing, Pack Hunter | übersprungen | legendary frame (owner 2026-10-25) |
| The Wardcliff Coil, average, volley, excludes Bolt Charge | im Modell | base row of the package |
| Truth | übersprungen | ohne average, Prototype Truthseeker der Basiszeile |
| Truth, average, Prototype Truthseeker | im Modell | base row of the package |
| Truth, average, Prototype Truthseeker, Reaper's Tithe x4 | im Modell | option "Reaper's Tithe x4" |
| Two-Tailed Fox, average | im Modell | base row of the package |
| Whirling Ovation, no charge | übersprungen | ohne full charge der Basiszeile |
| Whirling Ovation, full charge | im Modell | base row of the package |
| Whirling Ovation, 2/3 charge | übersprungen | ohne full charge der Basiszeile |
| Whirling Ovation, 1/3 charge | übersprungen | ohne full charge der Basiszeile |
| Aggressive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Balanced heat weapon - 260RPM primary | übersprungen | legendary frame (owner 2026-10-25) |
| Dead Man's Tale, Vorpal Weapon | im Modell | base row of the package |
| High-impact frame | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame | übersprungen | legendary frame (owner 2026-10-25) |
| MIDA Multi-Tool | im Modell | base row of the package |
| Polaris Lance, average, with ignitions, Ember of Ashes | übersprungen | ohne with ignition der Basiszeile |
| Polaris Lance, average, with ignition | im Modell | base row of the package |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame | übersprungen | legendary frame (owner 2026-10-25) |
| Skyburner's Oath, ADS, Cabal | im Modell | base row of the package |
| Skyburner's Oath, average, hipfire, with ignitions, Burning Ambition, Cabal | fehlt | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Skyburner's Oath, average, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Cabal | fehlt | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Symmetry, Arc Seeker Mode, Dynamic Charge x10 | übersprungen | gleiche Annahmen wie die Basiszeile |
| Symmetry, Arc Seeker Mode, Dynamic Charge x20 | übersprungen | gleiche Annahmen wie die Basiszeile |
| Symmetry | im Modell | base row of the package |
| The Jade Rabbit | im Modell | base row of the package |
| The Jade Rabbit, Fated Missile x15 | fehlt | nicht modelliert: Fated Missile x15 |
| Third Iteration, precision | im Modell | base row of the package |
| Third Iteration, Amalgamation Round | übersprungen | ohne precision der Basiszeile |
| Touch of Malice | im Modell | base row of the package |
| Touch of Malice, blight | fehlt | nicht modelliert: blight |
| Wicked Implement, average, with manual shatters | im Modell | base row of the package |
| Aggressive frame, body | übersprungen | legendary frame (owner 2026-10-25) |
| Conditional Finality, average, body, both modes | im Modell | base row of the package |
| Duality, hipfire, body | übersprungen | ohne ADS der Basiszeile |
| Duality, ADS | im Modell | base row of the package |
| Heavy burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Legend of Acrius, body | im Modell | base row of the package |
| Lightweight frame | übersprungen | legendary frame (owner 2026-10-25) |
| Lord of Wolves, average, includes ignition/scorch | im Modell | base row of the package |
| Lord of Wolves, average, includes ignition/scorch, Ember of Ashes | übersprungen | gleiche Annahmen wie die Basiszeile |
| Pinpoint slug frame | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, body | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame, body | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire slug frame | übersprungen | legendary frame (owner 2026-10-25) |
| Slayer's Fang, average, includes submunitions, Nightsworn ticks include weaken | im Modell | base row of the package |
| The Chaperone | im Modell | base row of the package |
| The Fourth Horseman, body, full mag | im Modell | base row of the package |
| Tractor Cannon, body | im Modell | base row of the package |
| Adaptive burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Buried Bloodline | im Modell | base row of the package |
| Cryosthesia 77K | im Modell | base row of the package |
| Devil's Ruin | im Modell | base row of the package |
| Devil's Ruin, Pyrogenesis, Collective Action | übersprungen | Katalysator-Zeile mit kleinerem Wert (×0,350): anderer Modus |
| Devil's Ruin, Pyrogenesis | im Modell | option "Pyrogenesis" |
| Dynamic heat weapon - 360RPM primary | übersprungen | legendary frame (owner 2026-10-25) |
| Final Warning, ADS charged mark | übersprungen | ohne ADS tap fire der Basiszeile |
| Final Warning, ADS tap fire | im Modell | base row of the package |
| Forerunner, The Rock, excludes impact | übersprungen | Katalysator: The Rock |
| Forerunner | im Modell | base row of the package |
| Heavy burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame | übersprungen | legendary frame (owner 2026-10-25) |
| Micro-missile frame | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire frame | übersprungen | legendary frame (owner 2026-10-25) |
| Rat King | im Modell | base row of the package |
| Traveler's Chosen | im Modell | base row of the package |
| Trespasser | im Modell | base row of the package |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, average, Peacekeepers, e. Rewind Rounds, e. Target Lock, 47 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, average, Peacekeepers, 47 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive burst frame, burst | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive burst frame, average, Peacekeepers, 64 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, average, Peacekeepers, 39 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, average, Peacekeepers, e. Rewind Rounds, e. Target Lock, 35 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Balanced heat weapon - 900RPM primary | übersprungen | legendary frame (owner 2026-10-25) |
| Balanced heat weapon - 900RPM primary, average, Peacekeepers, e. Target Lock, e. Accelerated Assault, Cooling Efficiency MW | übersprungen | legendary frame (owner 2026-10-25) |
| Barrow-Dyad, average, Taken Ambition, with Blighted Seekers, Peacekeepers, Target Lock | fehlt | Exotic-Rüstung: Peacekeepers; fremder Perk: Target Lock |
| Barrow-Dyad, average, Taken Ambition, with Blighted Seekers, Target Lock | fehlt | fremder Perk: Target Lock |
| Lightweight frame | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, average, Peacekeepers, 47 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Osteo Striga, average, with successive poison, Peacekeepers | übersprungen | Exotic-Rüstung: Peacekeepers |
| Osteo Striga, average, with successive poison | im Modell | base row of the package |
| Precision frame | übersprungen | legendary frame (owner 2026-10-25) |
| Precision frame, average, Peacekeepers, 39 mag | übersprungen | legendary frame (owner 2026-10-25) |
| Riskrunner | im Modell | base row of the package |
| Riskrunner, Arc Conductor, no chains | fehlt | nicht modelliert: no chains |
| Riskrunner, average, Arc Conductor, Peacekeepers | übersprungen | Exotic-Rüstung: Peacekeepers |
| Tarrabah | im Modell | base row of the package |
| Tarrabah, Ravenous Beast | übersprungen | gleiche Annahmen wie die Basiszeile |
| Tarrabah, average, Ravenous Beast, Peacekeepers | übersprungen | Exotic-Rüstung: Peacekeepers |
| The Huckleberry, average, Bull Rider | fehlt | nicht modelliert: Bull Rider |
| The Huckleberry, average, Bull Rider, Peacekeepers | fehlt | nicht modelliert: Bull Rider; Exotic-Rüstung: Peacekeepers |
| The Manticore, average, Hover Mode | im Modell | base row of the package |
| The Manticore, average, Hover Mode, Peacekeepers | übersprungen | Exotic-Rüstung: Peacekeepers |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Borealis | im Modell | base row of the package |
| Cloudstrike, average, with lightning strikes | im Modell | base row of the package |
| D.A.R.C.I., average, Target Acquired, Networked Targeting x5, with spaced jolt | im Modell | option "Networked Targeting x5" |
| D.A.R.C.I., average, Target Acquired, Networked Targeting x5, with spaced jolt, first mag | übersprungen | Katalysator: Networked Targeting x5 |
| Disruption weapon | übersprungen | legendary frame (owner 2026-10-25) |
| Dynamic heat weapon - 140RPM special | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact frame | übersprungen | legendary frame (owner 2026-10-25) |
| Ice Breaker, shatter ignition, includes shatter and frozen bonuses | fehlt | nicht modelliert: shatter ignition |
| Ice Breaker | im Modell | base row of the package |
| Izanagi's Burden | im Modell | base row of the package |
| Izanagi's Burden, Honed Edge x4 | übersprungen | gleiche Annahmen wie die Basiszeile |
| New Land Beyond, no stacks | im Modell | base row of the package |
| Rapid-fire frame | übersprungen | legendary frame (owner 2026-10-25) |
| Still Hunt, Cayde's Retribution, all three shots | übersprungen | gleiche Annahmen wie die Basiszeile |
| Still Hunt, Cayde's Retribution, Celestial Nighthawk | übersprungen | Exotic-Rüstung: Celestial Nighthawk |
| Still Hunt | im Modell | base row of the package |
| Whisper of the Worm, Whispered Breathing | im Modell | option "Whispered Breathing" |
| Adaptive frame, Jagged Edge, 70 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Jagged Edge, 70 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Jagged Edge, Enhanced Impact, 74 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Jagged Edge, Enhanced Impact, 74 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Enduring Blade, Enhanced Impact, 68 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Enduring Blade, Enhanced Impact, 68 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Enduring Blade, 64 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame, Enduring Blade, 64 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame - Bequest, Jagged Edge, 80 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive frame - Bequest, Jagged Edge, 80 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Jagged Edge, 80 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Jagged Edge, 80 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Jagged Edge, Enhanced Impact, 83 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Jagged Edge, Enhanced Impact, 83 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Enduring Blade, Enhanced Impact, 78 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Enduring Blade, Enhanced Impact, 78 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Enduring Blade, 74 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive frame, Enduring Blade, 74 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Black Talon, light | im Modell | base row of the package |
| Black Talon, single projectile | übersprungen | ohne light der Basiszeile |
| Caster frame, Jagged Edge, 68 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Jagged Edge, 68 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Jagged Edge, Enhanced Impact, 72 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Jagged Edge, Enhanced Impact, 72 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Enduring Blade, Enhanced Impact, 66 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Enduring Blade, Enhanced Impact, 66 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Enduring Blade, 62 impact, light | übersprungen | legendary frame (owner 2026-10-25) |
| Caster frame, Enduring Blade, 62 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Ergo Sum, Jagged Edge, 64 impact, light | im Modell | base row of the package |
| Ergo Sum, lightweight frame, Jagged Edge, 64 impact, heavy | übersprungen | ohne light der Basiszeile |
| Ergo Sum, The Perfect Fifth, caster frame, Pack Hunter, Transcendent, Enduring Blade, 58 impact, 1H2L | fehlt | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum, The Perfect Fifth, caster frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, 1H2L | fehlt | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum, Unplanned Reprieve, wave sword frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, heavy | fehlt | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum, Unplanned Reprieve, lightweight frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, 1H2L | fehlt | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum, Unplanned Reprieve, vortex frame, Pack Hunter, Transcendent, Tempered Edge, 61 impact, heavy | fehlt | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Heartshadow, light | übersprungen | ohne heavy, Shot in the Dark, weaken excluded der Basiszeile |
| Heartshadow, heavy, Shot in the Dark, weaken excluded | im Modell | base row of the package |
| Lightweight frame, Jagged Edge, 70 impact, heavy, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Jagged Edge, 70 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Jagged Edge, 70 impact, light, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Jagged Edge, Enhanced Impact, 74 impact, heavy, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Jagged Edge, Enhanced Impact, 74 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Jagged Edge, Enhanced Impact, 74 impact, light, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Enduring Blade, Enhanced Impact, 68 impact, heavy, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Enduring Blade, Enhanced Impact, 68 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Enduring Blade, Enhanced Impact, 68 impact, light, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Enduring Blade, 64 impact, heavy, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Enduring Blade, 64 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight frame, Enduring Blade, 64 impact, light, aerial | übersprungen | legendary frame (owner 2026-10-25) |
| Praxic Blade, 3L1H, Offensive Form, Forceful Blade III | im Modell | base row of the package |
| Praxic Blade, average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar), Ember of Ashes | übersprungen | gleiche Annahmen wie die Basiszeile |
| Praxic Blade, average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar) | übersprungen | gleiche Annahmen wie die Basiszeile |
| Praxic Blade, average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar) | übersprungen | ohne 3L1H der Basiszeile |
| Praxic Blade, average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar), Upper Hand | übersprungen | ohne 3L1H der Basiszeile |
| The Lament, heavy | übersprungen | ohne average, 2L1H1R der Basiszeile |
| The Lament, average, 2L1H1R | im Modell | base row of the package |
| The Lament, average, 2L1H1R, Burning Ambition | im Modell | option "Burning Ambition" |
| The Lament, average, 2L1H1R, Burning Ambition, Ember of Ashes | übersprungen | Katalysator: Burning Ambition |
| The Lament, average, 2L1H, Burning Ambition | übersprungen | Katalysator: Burning Ambition |
| The Lament, average, 2L1H, Burning Ambition, Ember of Ashes | übersprungen | Katalysator: Burning Ambition |
| The Lament, average, 3L1H1R, Burning Ambition | übersprungen | Katalysator: Burning Ambition |
| The Lament, average, 3L1H1R, Burning Ambition, Ember of Ashes | übersprungen | Katalysator: Burning Ambition |
| The Lament, average, 4L1H1R, Burning Ambition | übersprungen | Katalysator: Burning Ambition |
| The Lament, average, 4L1H1R, Burning Ambition, Ember of Ashes | übersprungen | Katalysator: Burning Ambition |
| Vortex frame, Jagged Edge, 68 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Vortex frame, Jagged Edge, Enhanced Impact, 72 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Vortex frame, Enduring Blade, Enhanced Impact, 66 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Vortex frame, Enduring Blade, 62 impact, heavy | übersprungen | legendary frame (owner 2026-10-25) |
| Wave sword frame, Jagged Edge, 70 impact, heavy slash | übersprungen | legendary frame (owner 2026-10-25) |
| Wave sword frame, Jagged Edge, Enhanced Impact, 74 impact, heavy slash | übersprungen | legendary frame (owner 2026-10-25) |
| Wave sword frame, Enduring Blade, Enhanced Impact, 68 impact, heavy slash | übersprungen | legendary frame (owner 2026-10-25) |
| Wave sword frame, Enduring Blade, 64 impact, heavy slash | übersprungen | legendary frame (owner 2026-10-25) |
| Wolfsbane, Honed Edge, Jagged Edge, Nano-Assault HLLHLLHLLHLLH | im Modell | base row of the package |
| Wolfsbane, Honed Edge, Jagged Edge, Nano-Assault HLLHLLHLLHLLH, Burning Ambition, includes ignition | fehlt | fremder Perk: Burning Ambition |
| Wolfsbane, average, Honed Edge, Jagged Edge, light, Burning Ambition, includes ignition | fehlt | fremder Perk: Burning Ambition |
| Worldline Zero, Temporal Sprint, heavy | fehlt | nicht modelliert: Temporal Sprint |
| Adaptive frame | übersprungen | legendary frame (owner 2026-10-25) |
| Ager's Scepter | im Modell | base row of the package |
| Ager's Scepter, average, Will Given Form | übersprungen | Katalysator: Will Given Form |
| Ager's Scepter, average, Will Given Form, Harsh Refraction | übersprungen | Katalysator: Will Given Form; Artefakt: Harsh Refraction |
| Coldheart, average, no initial trace | im Modell | base row of the package |
| Divinity, average, Penance, excludes debuff, Jolting Feedback, Focused Fury | im Modell | base row of the package |
| Lodestar, ADS, burst | übersprungen | ohne hipfire der Basiszeile |
| Lodestar, hipfire | im Modell | base row of the package |
| Microcosm | im Modell | base row of the package |
| Prometheus Lens, average, with ignition, Ember of Ashes | übersprungen | gleiche Annahmen wie die Basiszeile |
| Prometheus Lens, average, with ignition | im Modell | base row of the package |
| Ruinous Effigy | im Modell | base row of the package |
| Ruinous Effigy | übersprungen | gleiche Annahmen wie die Basiszeile |
| The Navigator | im Modell | base row of the package |
| Wavesplitter, average, power cycling, Detonator Beam | im Modell | base row of the package |
| Wavesplitter, average, Supercharged Battery, Detonator Beam | übersprungen | Katalysator: Detonator Beam |

## Sustained

| Zeile | Urteil | Detail |
| --- | --- | --- |
| High-impact bow, Heavy Bolts, Envious Arsenal + High Ground + e. Accelerated Assault (A Good Shout), Guidance Ring x3, Moebius Quiver | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive rocket launcher, Lasting Impression + Reaper's Tithe x4 + Forge's Kin x3 (Bellowing Giant), Pack Hunter, Argent Ordnance, Sentinel flicker (no buff), Turncoat transfer, simulated | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive rocket launcher, Cluster Bomb + Elemental Honing x5 + Timelost Magazine (Hezen Vengeance), Pack Hunter, Argent Ordnance, assumes normal clusters, Shoot to Loot, Turncoat transfer | übersprungen | legendary frame (owner 2026-10-25) |
| Leviathan's Breath, Archer's Tempo, Moebius Quiver, Argent Quiver, simulated | fehlt | no switch for: Moebius Quiver; simulated |
| Duality, Ice Breaker loadout swap exploit, 80% consistency, simulated | übersprungen | factors differ from the standard of Aegis |
| Aggressive rocket launcher, Cluster Bomb + Elemental Honing x5 + Timelost Magazine (Hezen Vengeance), Pack Hunter, Argent Ordnance, assumes normal clusters, Shoot to Loot | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact bow, Heavy Bolts, Envious Arsenal + High Ground + e. Accelerated Assault (A Good Shout), Moebius Quiver | übersprungen | legendary frame (owner 2026-10-25) |
| Hierarchy of Needs, Guidance Ring x2, Moebius Quiver, Argent Quiver, fireteam scaling, simulated | übersprungen | no total (INF) |
| Aggressive rocket launcher, Supercharged Magazine + Gear Shift x5 (Heretic), Pack Hunter, Argent Ordnance, Light Shift x4* | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact bow, Heavy Bolts, Envious Arsenal + High Ground + e. Accelerated Assault (A Good Shout), Guidance Ring x3 | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive rocket launcher, Slideshot + e. Surrounded (Crux Termination IV), Pack Hunter, Argent Ordnance | übersprungen | legendary frame (owner 2026-10-25) |
| Grapple melee, One-Two Punch, Biotic Enhancements, Combination Blow x3, Facet of Courage, Arc Compounding, Conductive Cosmic Crystal | fehlt | melee not in the model |
| Truth, Prototype Truthseeker, Reaper's Tithe x4, Argent Ordnance | fehlt | no switch for: Prototype Truthseeker |
| Aggressive sword, 1H1L combo, Jagged Edge + e. Impact, Rampage x3 + e. Redirection x30 + e. Forge's Kin x3 (Stryker's Sure-Hand), Argent Blade, simulated | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive rocket launcher, Timelost Magazine, Envious Arsenal + Elemental Honing x5 (Hezen Vengeance), Pack Hunter, Argent Ordnance | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive rocket launcher, Cluster Bomb + Elemental Honing x5 + Timelost Magazine (Hezen Vengeance), Pack Hunter, Argent Ordnance, assumes normal clusters | übersprungen | legendary frame (owner 2026-10-25) |
| Flux grenade, Death Throes x5, Feel the Flame, Sticker Shock | im Modell | grenade in the model, value not probed |
| Still Hunt, pre-popped into 6 shot cycle, Celestial Nighthawk, Sniper's Meditation, Incendiary Rifle Rounds, Solar Fulmination, assumes at least 2 orb pickups per mag | fehlt | no switch for: pre-popped into 6 shot cycle; Incendiary Rifle Rounds; Solar Fulmination; assumes at least 2 orb pickups per mag |
| Praxic Blade, throw spam with double hits, Lucent Blades x3, Offensive Form, Forceful Blade III, Gyro Core (solar), Upper Hand, Argent Blade, simulated | fehlt | weapon without package: kein Timing: keine Quantum-Zeile |
| Throwing Hammer, One-Two Punch, Biotic Enhancements, Roaring Flames x3, includes <101 Weapons rapid-fire shotgun | im Modell | melee in the model, value not probed |
| Hierarchy of Needs, Guidance Ring, Moebius Quiver, Argent Quiver, simulated | übersprungen | no total (INF) |
| Aggressive sniper, Extended Mag, Triple Tap + e. Redirection x30 + e. Accelerated Assault (Something Something), Networked Targeting x5, Sniper's Meditation, Kinetic Synthesis reloads | übersprungen | legendary frame (owner 2026-10-25) |
| Still Hunt, pre-popped into 6 shot cycle, Celestial Nighthawk, Sniper's Meditation, assumes at least 2 orb pickups per mag | fehlt | no switch for: pre-popped into 6 shot cycle; assumes at least 2 orb pickups per mag |
| Aggressive sword, 1H1L combo, Jagged Edge + e. Impact, e. Redirection x30 + e. Forge's Kin x3 (Stryker's Sure-Hand), Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive rocket launcher, Supercharged Magazine + Gear Shift x5 (Heretic), Pack Hunter, Argent Ordnance | übersprungen | legendary frame (owner 2026-10-25) |
| Ergo Sum, caster frame, The Perfect Fifth, Jagged Edge, 1H2L combo, Lucent Blades x3, Pack Hunter, Transcendent, excludes Transcendence 5% bonus, Argent Blade, Dawn Chorus, Solar Fulmination | fehlt | no switch for: caster frame; Jagged Edge; 1H2L combo; Transcendent; excludes Transcendence 5% bonus; Solar Fulmination |
| Pinpoint slug shotgun, Assault Mag, e. Redirection x30 + Elemental Honing x5 (Unvoiced), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Wolfsbane, swapping after HLLHLLHLLHLLH, Honed Edge + Jagged Edge, Burning Ambition, 10 lights to regenerate, Outbreak Perfected max nanites, Argent Blade, Solar Fulmination, simulated | fehlt | weapon without package: kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Izanagi's Burden, includes rehone time, hone before rally, Sniper's Meditation (assume stacked) | fehlt | no switch for: includes rehone time; hone before rally; Sniper's Meditation (assume stacked) |
| One Thousand Voices, Ember of Ashes, catalyst, Dawn Chorus, Particle Reconstruction | im Modell | gate: probe entry by rule |
| Adaptive sniper, Appended Mag, Vorpal Weapon + e. Redirection x30 (Embraced Identity), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Disruption sniper, Aggregate Charge x3 + e. Accelerated Assault (Refurbished A499), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Dynamic sniper, Ionized Heatsink, Dynamic Heat Limiter, Vorpal + Bait and Switch + e. Imperial Allegiance x3 (Conspiracy Honed), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire sniper, Tactical Mag, e. Fourth Time's the Charm + Redirection x30 + Frame of Reference x5 (Lance Ephemeral), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Truth, Prototype Truthseeker, Argent Ordnance | im Modell | gate: hand-made probe entry |
| High-impact bow, Heavy Bolts, Envious Arsenal + High Ground + e. Accelerated Assault (A Good Shout) | übersprungen | legendary frame (owner 2026-10-25) |
| Legend of Acrius, body, Trench Barrel, Arc Compounding | fehlt | no switch for: body; Trench Barrel |
| Aggressive sword, 1H1L combo, Jagged Edge + e. Impact, e. Collective Action + Elemental Honing x5 (Hero of Ages), Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight sword, 1H2L combo, Jagged Edge + e. Impact, e. Burning Ambition + Chaos Reshaped x2 (Terciopelo-4bl), Pack Hunter, Argent Blade, Solar Fulmination, Dawn Chorus | übersprungen | legendary frame (owner 2026-10-25) |
| Wolfsbane, swapping after HLLHLLHLLHLLH, Honed Edge + Jagged Edge, Burning Ambition, 10 lights to regenerate, Argent Blade, Solar Fulmination, Dawn Chorus | fehlt | weapon without package: kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Fusion grenade, Death Throes x5, Touch of Flame, Ember of Ashes, Feel the Flame, Sticker Shock | im Modell | grenade in the model, value not probed |
| Still Hunt, pre-popped into 6 shot cycle, Celestial Nighthawk, Sniper's Meditation | fehlt | no switch for: pre-popped into 6 shot cycle |
| Merciless, Impetus, two kills | fehlt | no switch for: Impetus; two kills |
| Bequest, 1H1L combo, Jagged Edge, e. Jolting Feedback + e. Surrounded, Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary weapon (owner 2026-10-25) |
| Wave frame sword, heavy spam, Jagged Edge + e. Impact, Relentless Strikes + e. Surrounded + Tenacity x20 (Synanceia), Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Storm grenade, Empowered Grenade x2, Touch of Thunder, Spark of Magnitude, Feel the Flame | im Modell | grenade in the model, value not probed |
| Disruption sniper, Aggregate Charge x3 + e. Accelerated Assault (Refurbished A499), Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Bequest, 1H1L combo, Jagged Edge, e. Jolting Feedback + Elemental Honing x5, Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary weapon (owner 2026-10-25) |
| Wave frame sword, heavy spam, Jagged Edge + e. Impact, Relentless Strikes + e. Elemental Honing x5 + Tenacity x20 (Synanceia), Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Dynamic sniper, Ionized Heatsink, Dynamic Heat Limiter, Vorpal + Bait and Switch + e. Imperial Allegiance x3 (Conspiracy Honed), Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight sword, 1H2L combo, Jagged Edge + e. Impact, e. Burning Ambition + Chaos Reshaped x2 (Terciopelo-4bl), Pack Hunter, Argent Blade, Solar Fulmination | übersprungen | legendary frame (owner 2026-10-25) |
| The Lament, 2L1H combo, Lucent Blades x3, Burning Ambition, Argent Blade, Dawn Chorus, Solar Fulmination | fehlt | no switch for: 2L1H combo; Solar Fulmination |
| Aggressive shotgun, body, Assault Mag, Timelost Magazine, e. Aggregate Charge x3 + Trench Barrel (Found Verdict), melee damage excluded, Arc Compounding | übersprungen | legendary frame (owner 2026-10-25) |
| Winterbite, melee, 2L1H cancel combo, Combination Blow x3, Triton Vice, excludes shatter damage, No Bell, simulated | fehlt | melee not in the model |
| Ergo Sum, caster frame, The Perfect Fifth, Jagged Edge, 1H2L combo, Lucent Blades x3, Pack Hunter, Transcendent, excludes Transcendence 5% bonus, Argent Blade, Solar Fulmination | fehlt | no switch for: caster frame; Jagged Edge; 1H2L combo; Transcendent; excludes Transcendence 5% bonus; Solar Fulmination |
| Precision linear fusion rifle, Enhanced Battery, Charge MW, e. Mega Kill Clip + Sword Logic x4 + Heretical Behavior (Eyes Unveiled) | übersprungen | legendary frame (owner 2026-10-25) |
| Wolfsbane, swapping after HLLHLLHLLHLLH, Honed Edge + Jagged Edge, Burning Ambition, 10 lights to regenerate, Argent Blade, Solar Fulmination | fehlt | weapon without package: kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Solar grenade, Sunbracers, Touch of Flame, Ember of Ashes, repeated activations | im Modell | grenade in the model, value not probed |
| One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction | im Modell | gate: probe entry by rule |
| Caster sword, 1H2L combo, Jagged Edge + e. Impact, Relentless Strikes + e. Surrounded (Ill Omen), Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Compressed wave grenade launcher, Envious Arsenal + Elemental Honing x5 (Love and Death), impact included, Kinetic Impacts | übersprungen | legendary frame (owner 2026-10-25) |
| The Lament, 3L1H1R combo, Lucent Blades x3, Burning Ambition, Combination Argent Blade, Sword Storm Combo, Dawn Chorus, simulated | fehlt | no switch for: 3L1H1R combo; Sword Storm Combo; simulated |
| Lightweight sword, 1H2L combo, Jagged Edge + e. Impact, Vorpal Weapon + Whirlwind Blade (Sullen Claw), Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Ergo Sum, vortex frame, Unplanned Reprieve, Tempered Edge, heavy spam, Lucent Blades x3, Pack Hunter, Transcendent, excludes Transcendence 5% bonus, Argent Blade | fehlt | no switch for: vortex frame; Tempered Edge; heavy spam; Transcendent; excludes Transcendence 5% bonus |
| Ergo Sum, wave frame, Unplanned Reprieve, Jagged Edge, heavy spam, Lucent Blades x3, Pack Hunter, Transcendent, excludes Transcendence 5% bonus, Argent Blade, boss against wall | fehlt | no switch for: wave frame; Jagged Edge; heavy spam; Transcendent; excludes Transcendence 5% bonus; boss against wall |
| High-impact bow, Heavy Bolts, e. Aggregate Charge x3 (Submersion), Guidance Ring x3, Argent Quiver | übersprungen | legendary frame (owner 2026-10-25) |
| Grapple melee, One-Two Punch, Banner of War, Biotic Enhancements | fehlt | melee not in the model |
| Adaptive sword, 1H1L combo*, Jagged Edge + e. Impact, Relentless Strikes + Elemental Honing x5 (Abide the Return), Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Deathbringer, max projectile height, Argent Ordnance | fehlt | no switch for: max projectile height |
| Caster sword, 1H2L combo, Jagged Edge + e. Impact, Relentless Strikes + Elemental Honing x5 (Night Terror), Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Throwing Hammer, Biotic Enhancements, Roaring Flames x3, max range | im Modell | melee in the model, value not probed |
| The Chaperone, The Roadborn, Triple Tap, Kinetic Synthesis | übersprungen | no total (INF) |
| The Fourth Horseman, body, Arc Compounding | fehlt | no switch for: body |
| The Lament, 2L1H combo, Lucent Blades x3, Burning Ambition, Argent Blade, Solar Fulmination | fehlt | no switch for: 2L1H combo; Solar Fulmination |
| Duality, 3 body pellet shots into On Black Wings x3 slugs | fehlt | no switch for: 3 body pellet shots into On Black Wings x3 slugs |
| Aggressive sniper, Extended Mag, Triple Tap + Elemental Honing x5 + e. Accelerated Assault (Something Something), Networked Targeting x5, Sniper's Meditation, Kinetic Synthesis reloads | übersprungen | legendary frame (owner 2026-10-25) |
| Ergo Sum, lightweight frame, Unplanned Reprieve, Jagged Edge, 1H2L combo, Lucent Blades x3, Pack Hunter, Transcendent, excludes Transcendence 5% bonus, Argent Blade | fehlt | no switch for: lightweight frame; Jagged Edge; 1H2L combo; Transcendent; excludes Transcendence 5% bonus |
| Rapid-fire shotgun, body, Elemental Honing x5 + Forge's Kin x3 (Threat Level), Kinetic Synthesis reloads | übersprungen | legendary frame (owner 2026-10-25) |
| Precision linear fusion rifle, Enhanced Battery, Charge MW, e. Mega Kill Clip + Elemental Honing x5 + Heretical Behavior (Eyes Unveiled) | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive grenade launcher, Spike Grenades, Envious Arsenal + e. Bait and Switch (Bitter/Sweet), Arc Compounding, Kinetic Impacts | übersprungen | legendary frame (owner 2026-10-25) |
| Wolfsbane, swapping after HLLHLLHLLHLLH, Honed Edge + Jagged Edge, 10 lights to regenerate, Argent Blade | fehlt | weapon without package: kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Two-Tailed Fox, Ember of Ashes, Dawn Chorus, Argent Ordnance | übersprungen | factors differ from the standard of Aegis |
| Rapid-fire sniper, Tactical Mag, Timelost Magazine, e. Fourth Time's the Charm + Elemental Honing x5 (Praedyth's Revenge), Networked Targeting x5, Sniper's Meditation, Kinetic Synthesis reloads | übersprungen | legendary frame (owner 2026-10-25) |
| One Thousand Voices, catalyst, Particle Reconstruction | im Modell | gate: hand-made probe entry |
| The Prospector, typical boss model, Arc Compounding, Kinetic Impacts | fehlt | no switch for: typical boss model; Kinetic Impacts |
| Vortex sword, heavy spam, Jagged Edge + e. Impact, Frenzy + e. Surrounded (Falling Guillotine), Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive sniper, Appended Mag, e. Rewind Rounds + Elemental Honing x5 (Tranquility), Networked Targeting x5, Sniper's Meditation, Kinetic Synthesis reloads | übersprungen | legendary frame (owner 2026-10-25) |
| Throwing Hammer, One-Two Punch, Forgemaster, Perfect Recall, Roaring Flames x3, close range recall, includes <101 Weapons rapid-fire shotgun | im Modell | melee in the model, value not probed |
| The Lament, 3L1H1R combo, Lucent Blades x3, Burning Ambition, Combination Argent Blade, Sword Storm Combo | fehlt | no switch for: 3L1H1R combo; Sword Storm Combo |
| Whisper of the Worm, Whispered Breathing, Sniper's Meditation, Incendiary Rifle Rounds, Solar Fulmination | fehlt | no switch for: Incendiary Rifle Rounds; Solar Fulmination |
| Rapid-fire grenade launcher, Spike Grenades, Envious Arsenal + Elemental Honing x5 (VS Chill Inhibitor), Kinetic Impacts | übersprungen | legendary frame (owner 2026-10-25) |
| Micro-missile grenade launcher, Spike Grenades, Slideshot + Elemental Honing x5 (Gizmo Weft), Energy Acceleration, simulated | übersprungen | legendary frame (owner 2026-10-25) |
| Euphony, starts at 0 stacks, Thread of Evolution, includes Threadlings, Pack Tactics (simplified underestimate of 3 stack start) | fehlt | no switch for: starts at 0 stacks; includes Threadlings; Pack Tactics (simplified underestimate of 3 stack start) |
| Vortex sword, heavy spam, Jagged Edge + e. Impact, Frenzy + Elemental Honing x5 (Falling Guillotine), Lucent Blades x3, Pack Hunter, Argent Blade | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive sniper, Appended Mag, e. Fourth Time's the Charm + Elemental Honing x5 + e. Accelerated Assault (Adored), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive grenade launcher, Spike Grenades, Envious Arsenal + Elemental Honing x5 (Edge Transit), Kinetic Impacts | übersprungen | legendary frame (owner 2026-10-25) |
| The Lament, 2L1H1R combo, Lucent Blades x3, Burning Ambition, Argent Blade | fehlt | no switch for: 2L1H1R combo |
| The Lament, 4L1H1R combo, Lucent Blades x3, Burning Ambition, Combination Argent Blade, Sword Storm Combo | fehlt | no switch for: 4L1H1R combo; Sword Storm Combo |
| Hierarchy of Needs, Guidance Ring x2, Argent Quiver, fireteam scaling | übersprungen | no total (INF) |
| New Land Beyond, starts at The Master x20, sprint cancelling, Kinetic Synthesis, Sniper's Meditation | übersprungen | no total (INF) |
| Whisper of the Worm, Whispered Breathing, Sniper's Meditation | im Modell | gate: hand-made probe entry |
| Merciless | im Modell | gate: probe entry by rule |
| Compressed wave grenade launcher, Envious Arsenal + Elemental Honing x5 (Love and Death), Kinetic Impacts | übersprungen | legendary frame (owner 2026-10-25) |
| Choir of One, projectile mode, spaced* | fehlt | no switch for: projectile mode; spaced* |
| Lightweight shotgun, body, Assault Mag, Elemental Honing x5 (Starscape Null), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Precision linear fusion rifle, Enhanced Battery + e. Backup Mag, Charge MW, e. Fourth Time's the Charm + Elemental Honing x5 + Heretical Behavior (Eyes Unveiled), Particle Reconstruction | übersprungen | legendary frame (owner 2026-10-25) |
| Lord of Wolves, Release the Wolves, hip-fire, precision, includes ignition | fehlt | no switch for: Release the Wolves; hip-fire; precision; includes ignition |
| High-impact sniper, sprint cancelling, Elemental Honing x5 + e. Accelerated Assault (The Helmsman), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Leviathan's Breath, Archer's Tempo | im Modell | gate: hand-made probe entry |
| Pulse grenade, Empowered Grenade x2, Touch of Thunder, Spark of Magnitude, Feel the Flame | im Modell | grenade in the model, value not probed |
| Euphony, starts at 0 stacks, includes Threadlings, Pack Tactics (simplified underestimate of 3 stack start) | fehlt | no switch for: starts at 0 stacks; includes Threadlings; Pack Tactics (simplified underestimate of 3 stack start) |
| One Thousand Voices, Ember of Ashes, Particle Reconstruction | im Modell | gate: probe entry by rule |
| One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction, no ignitions | fehlt | no switch for: no ignitions |
| Praxic Blade, 3L1H combo, Offensive Form, Forceful Blade III, Impact Core (solar), Kinetic Synthesis, Combination Argent Blade, Sword Storm Combo | fehlt | weapon without package: kein Timing: keine Quantum-Zeile |
| Rapid-fire sniper, Tactical Mag, e. Fourth Time's the Charm + Elemental Honing x5 (Omniscient Eye), Networked Targeting x5, Sniper's Meditation, Incendiary Rifle Rounds, Solar Fulmination | übersprungen | legendary frame (owner 2026-10-25) |
| Cull's Shadow, corrupted melees, Combination Blow x3, Biotic Enhancements | fehlt | melee not in the model |
| Bastion, Saint's Fury, includes melee time | fehlt | no switch for: Saint's Fury; includes melee time |
| High-impact bow, Heavy Bolts, e. Aggregate Charge x3 (Submersion), Argent Quiver | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive burst linear fusion rifle, Accelerated Coils, Charge MW, e. Rewind Rounds + Chaos Reshaped x2 (Briar's Contempt), Particle Reconstruction | übersprungen | legendary frame (owner 2026-10-25) |
| The Lament, 2L1H1R combo, Lucent Blades x3, Argent Blade | fehlt | no switch for: 2L1H1R combo |
| New Land Beyond, starts at The Master x20, Rally Barricade, Sniper's Meditation | fehlt | no switch for: starts at The Master x20 |
| Two-Tailed Fox, Ember of Ashes, Argent Ordnance | übersprungen | factors differ from the standard of Aegis |
| Sleeper Simulant | im Modell | gate: hand-made probe entry |
| Parasite, Envious Arsenal, x20 first shot | fehlt | no switch for: x20 first shot |
| Ager's Scepter, Will Given Form, Facet of Command, Harsh Refraction | fehlt | no switch for: Facet of Command; Harsh Refraction |
| Adaptive glaive, melee, 2L1H cancel combo, Combination Blow x3, Banner of War, Triton Vice, Close to Melee (Unexpected Resurgence), simulated | fehlt | melee not in the model |
| Ticuu's Divination, alternating modes, Causality Arrows x6, Guidance Ring x2, assumes one ignition every other shot | übersprungen | no total (INF) |
| Rapid-fire sniper, Tactical Mag, e. Fourth Time's the Charm + Elemental Honing x5 (Omniscient Eye), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| The Queenbreaker, Rewind Rounds, Combat Sights | im Modell | gate: hand-made probe entry |
| Still Hunt, pre-popped into 6 shot cycle, Sniper's Meditation | fehlt | no switch for: pre-popped into 6 shot cycle |
| Fafnir, includes Quantum Nova windup and splash, 9 ammo consumed | fehlt | no switch for: includes Quantum Nova windup and splash; 9 ammo consumed |
| D.A.R.C.I., Networked Targeting x5, Target Acquired, includes jolt, Sniper's Meditation | fehlt | no switch for: Target Acquired; includes jolt |
| New Land Beyond, starts at The Master x0, Rally Barricade, manual reloads until The Grandmaster, Sniper's Meditation | fehlt | no switch for: starts at The Master x0; manual reloads until The Grandmaster |
| Microcosm, Paracausal Imbuement, Harsh Refraction | fehlt | no switch for: Paracausal Imbuement; Harsh Refraction |
| Slayer's Fang, Assault Mag, includes submunitions | fehlt | no switch for: Assault Mag; includes submunitions |
| Finality's Auger, Bait and Switch, Linear Fusion Mode | fehlt | no switch for: Linear Fusion Mode |
| One Thousand Voices, Particle Reconstruction | im Modell | gate: probe entry by rule |
| Cloudstrike, Triple Tap, excludes Bolt Charge, Sniper's Meditation | fehlt | no switch for: excludes Bolt Charge |
| Heartshadow, heavy attacks, Shot in the Dark, Lucent Blades x3, Argent Blade | fehlt | no switch for: heavy attacks; Shot in the Dark |
| Lightweight grenade launcher, Spike Grenades, Trickle Charge + Reaper's Tithe x4 (Salvager's Salvo) | übersprungen | legendary frame (owner 2026-10-25) |
| Praxic Blade, 3L1H combo, Offensive Form, Forceful Blade III, Kinetic Synthesis, Combination Argent Blade, Sword Storm Combo | fehlt | weapon without package: kein Timing: keine Quantum-Zeile |
| Precision shotgun, body, no Backup Mag, Assault Mag, Reconstruction + Trench Barrel (Prophet of Doom), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Precision shotgun, body, no Backup Mag, Assault Mag, Reconstruction + Gear Shift x5 (Prophet of Doom), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Gjallarhorn, Argent Ordnance | im Modell | gate: hand-made probe entry |
| Heavy burst shotgun, Appended Mag, e. High-Impact Reserves + Bait and Switch (Pure Recollection), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Lightweight shotgun, body, Assault Mag, Reconstruction + Trench Barrel (Starscape Null), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| The Colony | im Modell | gate: probe entry by rule |
| Pinpoint slug shotgun, Assault Mag, e. Fourth Time's the Charm + Elemental Honing x5 (Unvoiced), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire slug shotgun, Rapid Hit + e. Precision Instrument (Trachinus), reload cancelling | übersprungen | legendary frame (owner 2026-10-25) |
| Black Talon, 2H2L combo, Lucent Blades x3, Argent Blade | fehlt | no switch for: 2H2L combo |
| New Malpais, assumes suspend tick every 3 shots | fehlt | no switch for: assumes suspend tick every 3 shots |
| Ice Breaker, Sniper's Meditation | im Modell | gate: probe entry by rule |
| Conditional Finality, body, average across both shots | übersprungen | factors differ from the standard of Aegis |
| The Queenbreaker, Rewind Rounds, Marksman Sights | fehlt | no switch for: Marksman Sights |
| Dead Messenger, The Fundamentals | fehlt | no switch for: The Fundamentals |
| Dragon's Breath, auto-loaded, Composite Propellant x5, Dawn Chorus, Argent Ordnance | fehlt | no switch for: auto-loaded; Composite Propellant x5 |
| Symmetry, Dynamic Charge x10 into 10 Revolution x10 shots cycle, Well of Radiance caster, Storm's Keep, Flashover | übersprungen | no total (INF) |
| Hierarchy of Needs, Guidance Ring, Argent Quiver | übersprungen | no total (INF) |
| Adaptive fusion rifle, Accelerated Coils, Charge MW, Trickle Charge + Gear Shift x5 + Accelerated Assault (Main Ingredient) | übersprungen | legendary frame (owner 2026-10-25) |
| Rapid-fire fusion rifle, Accelerated Coils, Charge MW, Reconstruction + e. Aggregate Charge (Cartesian Coordinate), Particle Reconstruction | übersprungen | legendary frame (owner 2026-10-25) |
| High-impact fusion rifle, Enhanced Battery, Charge MW, Envious Assassin + Controlled Burst (The Eremite) | übersprungen | legendary frame (owner 2026-10-25) |
| Thunderlord, assumes only one reload post-nerf | im Modell | gate: hand-made probe entry |
| Grand Overture, volleys when available | im Modell | gate: hand-made probe entry |
| Micro-missile pulse rifle, Appended Mag, Trickle Charge + Elemental Honing x5, Accelerated Assault (Psi Aeterna IV), Energy Acceleration | übersprungen | legendary frame (owner 2026-10-25) |
| Heavy burst shotgun, Appended Mag, Fourth Time's the Charm + e. Aggregate Charge x3 (Arcane Embrace) | übersprungen | legendary frame (owner 2026-10-25) |
| Xenophage | im Modell | gate: hand-made probe entry |
| Rapid-fire shotgun, body, Cast No Shadows, Trench Barrel (Perfect Paradox), melee reloads, melee damage excluded | übersprungen | legendary frame (owner 2026-10-25) |
| Heirloom, 1 charge, catalyst, Argent Quiver | fehlt | no switch for: 1 charge |
| Touch of Malice, final round, blighted, Precision Instrument | übersprungen | no total (INF) |
| Aggressive fusion rifle, Accelerated Coils, Charge MW, e. Rewind Rounds + Gear Shift x5 (Tempered Dynamo) | übersprungen | legendary frame (owner 2026-10-25) |
| Precision bow, Archer's Gambit (Hush), Guidance Ring x3 | übersprungen | legendary frame (owner 2026-10-25) |
| Heirloom, 2 charges, catalyst, Argent Quiver | fehlt | no switch for: 2 charges |
| Wavesplitter, Supercharged Battery, Detonator Beam, Harsh Refraction | fehlt | no switch for: Supercharged Battery; Harsh Refraction |
| Aggressive sniper, Appended Mag, Triple Tap + Fourth Time's the Charm (Keen Thistle), Networked Targeting x5, Sniper's Meditation | übersprungen | legendary frame (owner 2026-10-25) |
| Precision fusion rifle, Enhanced Battery, Charge MW, e. Overflow + e. Aggregate Charge (Accelerando-42), Particle Reconstruction | übersprungen | legendary frame (owner 2026-10-25) |
| Ex Diris, Corrupted Nucleosynthesis, assumes max frenzy | fehlt | no switch for: assumes max frenzy |
| Whirling Ovation, no Anticipation, fully charged, Argent Ordnance | übersprungen | factors differ from the standard of Aegis |
| Heirloom, fully charged, catalyst, Argent Quiver | fehlt | no switch for: fully charged |
| Rapid-fire glaive, no Backup Mag, projectile, Chaos Reshaped x2 + Mega Kill Clip (Greasy Luck) | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive fusion rifle, Accelerated Coils, Charge MW, e. Rewind Rounds + Controlled Burst (Techeun Force) | übersprungen | legendary frame (owner 2026-10-25) |
| Aggressive machine gun, Appended Mag, e. Fourth Time's the Charm + e. Target Lock + e. Fail-Deadly (Temporal Clause) | übersprungen | legendary frame (owner 2026-10-25) |
| Heirloom, uncharged, Argent Quiver | fehlt | no switch for: uncharged |
| Winterbite, projectile | fehlt | no switch for: projectile |
| Salvation's Grip, uncharged | fehlt | no switch for: uncharged |
| Final Warning, 15 shot half charge auto into tap fire burst, catalyst | übersprungen | no total (INF) |
| Arbalest | im Modell | gate: probe entry by rule |
| The Wardcliff Coil, excludes Bolt Charge, Argent Ordnance | fehlt | no switch for: excludes Bolt Charge |
| Cull's Shadow, with corruption | fehlt | no switch for: with corruption |
| Salvation's Grip, charged, Hail the Storm | fehlt | no switch for: charged; Hail the Storm |
| Rapid-fire machine gun, no Backup Mag, Tactical Mag, e. Fourth Time's the Charm + e. Target Lock (Retrofit Escapade) | übersprungen | legendary frame (owner 2026-10-25) |
| Trace rifle, e. Fourth Time's the Charm + e. Target Lock (Acasia's Dejection), Cenotaph Mask, Harsh Refraction | übersprungen | legendary frame (owner 2026-10-25) |
| Divinity, held down, includes jolt, Focused Fury, Harsh Refraction | fehlt | no switch for: held down; includes jolt; Harsh Refraction |
| Skyburner's Oath, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Dawn Chorus | übersprungen | no total (INF) |
| Barrow-Dyad, Target Lock, Taken Ambition | fehlt | weapon without package: keine Aegis-Zeile ohne fremde Annahmen |
| Outbreak Perfected, starts at max nanites, Rewind Rounds, Appended Mag, approximate | übersprungen | no total (INF) |
| Choir of One, hitscan mode, precision | fehlt | no switch for: hitscan mode; precision |
| Tessellation, full grenade uptime, Property: Irreducible, Transcendent but excludes 5%, simulated | fehlt | no switch for: full grenade uptime; Property: Irreducible; Transcendent but excludes 5%; simulated |
| Dragon's Breath, auto-loaded, Composite Propellant x5, Argent Ordnance | fehlt | no switch for: auto-loaded; Composite Propellant x5 |
| Adaptive machine gun, Appended Mag, e. Fourth Time's the Charm + e. Target Lock (Hammerhead) | übersprungen | legendary frame (owner 2026-10-25) |
| Micro-missile grenade launcher, Implosion Rounds, Reconstruction + Elemental Honing x5 (Theodolite), Energy Acceleration | übersprungen | legendary frame (owner 2026-10-25) |
| Forerunner | im Modell | gate: probe entry by rule |
| High-impact machine gun, Tactical Mag, Fourth Time's the Charm + e. Target Lock (Archon's Thunder) | übersprungen | legendary frame (owner 2026-10-25) |
| Revision Zero, 4 burst cycle into 6 Hunter's Trace shots, Extended Mag, Fourth Time's the Charm, Vorpal Weapon | übersprungen | no total (INF) |
| Aggressive glaive, no Backup Mag, projectile, e. Redirection x30 (The Heron) | übersprungen | legendary frame (owner 2026-10-25) |
| Double fire grenade launcher, Spike Grenades, Elemental Honing x5 (Wilderflight) | übersprungen | legendary frame (owner 2026-10-25) |
| Jötunn | im Modell | gate: probe entry by rule |
| Touch of Malice, blight into 15 shot cycle | übersprungen | no total (INF) |
| Vexcalibur, projectile | fehlt | no switch for: projectile |
| Telesto | im Modell | gate: probe entry by rule |
| Revision Zero, 2 burst cycle into 6 Hunter's Trace shots, Extended Mag, Fourth Time's the Charm, Vorpal Weapon | übersprungen | no total (INF) |
| Vex Mythoclast, Calculated Balance, Particle Reconstruction | übersprungen | no total (INF) |
| Edge of Concurrence, pre-stacked, Lightning Seeker into six shot cycle | fehlt | no switch for: pre-stacked; Lightning Seeker into six shot cycle |
| Wave grenade launcher, e. Redirection x30 + Bait and Switch (Forbearance), simulated | übersprungen | legendary frame (owner 2026-10-25) |
| Adaptive glaive, no Backup Mag, projectile, Chaos Reshaped x2 (Refusal of the Call) | übersprungen | legendary frame (owner 2026-10-25) |
| Deterministic Chaos, Target Lock | im Modell | gate: probe entry by rule |
| Service of Luzaku | im Modell | gate: probe entry by rule |
| Micro-missile sidearm, precision, High-Explosive Ordnance, Trickle Charge + Gear Shift x5 (Indebted Kindness), Energy Acceleration | übersprungen | legendary frame (owner 2026-10-25) |
| Outbreak Perfected, starts at 0 nanites, Rewind Rounds, Appended Mag | übersprungen | no total (INF) |
| Polaris Lance, Ember of Ashes, Dawn Chorus | übersprungen | no total (INF) |
| Tractor Cannon | im Modell | gate: probe entry by rule |
| Heir Apparent | im Modell | gate: probe entry by rule |
| Anarchy, two traps, catalyst | fehlt | own damage not in the model |
| Tarrabah, Ravenous Beast | übersprungen | no total (INF) |
| Alethonym | fehlt | own damage not in the model |
| Hawkmoon, successive mags, Paracausal Shot x7 | übersprungen | no total (INF) |
| Tommy's Matchbook, Ember of Ashes | übersprungen | no total (INF) |
| Rat King, Rat Pack x5 | übersprungen | no total (INF) |
| Lodestar, ADS, Harsh Refraction | übersprungen | no total (INF) |
| Finality's Auger, assumes pre-loaded turret, painted target, Bait and Switch, Ruinscribe Turret Mode | fehlt | own damage not in the model |
| Osteo Striga | übersprungen | no total (INF) |
| Polaris Lance, Ember of Ashes | übersprungen | no total (INF) |
| Graviton Spike, alternating modes with 3 shot cycles, Temporal Alignment | übersprungen | no total (INF) |
| Cerberus+1, precision, point blank | übersprungen | no total (INF) |
| Third Iteration, 16 marked shots | übersprungen | no total (INF) |
| Riskrunner, Arc Conductor, simulated | übersprungen | no total (INF) |
| Third Iteration, Amalgamation Round into 15 marked shots | übersprungen | no total (INF) |
| Polaris Lance | übersprungen | no total (INF) |
| Skyburner's Oath, hipfire, with ignitions, Ember of Ashes, Burning Ambition | übersprungen | no total (INF) |
| Fighting Lion | übersprungen | no total (INF) |
| Lodestar, hip-fire, Harsh Refraction | übersprungen | no total (INF) |
| Sweet Business | übersprungen | no total (INF) |
| Malfeasance, successive mags, Vorpal Weapon | übersprungen | no total (INF) |
| Storm's Keep, max practical Bolt Charge rate, Flashover | fehlt | variant of an item with own damage |
| Hellion, Consul's Pitch, spaced range, Ember of Ashes | fehlt | variant of an item with own damage |
| Quicksilver Storm, 42 shot burst into 3 grenade cycle | übersprungen | no total (INF) |
| The Last Word, hip-fire, successive mags | übersprungen | no total (INF) |
| Weaver's Call, maximum practical rate, Thread of Evolution | im Modell | own damage (rule H) |
| MIDA Multi-Tool, High-Power Ammo | übersprungen | no total (INF) |
| Area denial grenade launcher, Elemental Honing x5 (Festival Flight) | fehlt | own damage not in the model |
| Storm's Keep, max practical Bolt Charge rate | im Modell | own damage (rule H) |
| Hellion, Ember of Ashes | im Modell | own damage (rule H) |
| Witherhoard, ground | fehlt | own damage not in the model |
| Witherhoard, direct impact | fehlt | own damage not in the model |
| Arc Soul, Amplified, Facet of Courage | fehlt | variant of an item with own damage |
| Ionic Sentry, Spark of Frequency, excludes Bolt Charge | im Modell | own damage (rule H) |
| Sword Storm Combo, every 3 combos, Argent Blade | fehlt | own damage not in the model |
| Arc Soul, Facet of Courage | im Modell | own damage (rule H) |
| Jolt | fehlt | own damage not in the model |
| Mantle of Battle Harmony, Harmonic Munitions, max rate | fehlt | own damage not in the model |
| Unravel, typical rate, Improved Unraveling | fehlt | own damage not in the model |
| Unravel, typical rate | fehlt | own damage not in the model |

## Swap

| Zeile | Urteil | Detail |
| --- | --- | --- |
| Still Hunt, Cayde's Retribution, Celestial Nighthawk, pre-popped | übersprungen | burst before the swap; the simulation fires the whole phase |
| Golden Gun - Marksman, Celestial Nighthawk, Radiant, Facet of Courage, Limit Break, pre-popped | fehlt | no switch for: pre-popped |
| Izanagi's Burden, excludes re-hone time, Kinetic Rupture, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Heirloom, pre-fully charged, Moebius Quiver, no ignition | übersprungen | burst before the swap; the simulation fires the whole phase |
| Izanagi's Burden, excludes re-hone time, Kinetic Rupture | übersprungen | burst before the swap; the simulation fires the whole phase |
| Whirling Ovation, pre-charged | übersprungen | burst before the swap; the simulation fires the whole phase |
| High-impact bow, Heavy Bolts, High Ground x3 (A Good Shout), Moebius Quiver, Guidance Ring x3 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Thundercrash, Cuirass of the Falling Star, Facet of Courage, Thunderous Retort, Conductive Cosmic Needle x3 | fehlt | no switch for: Conductive Cosmic Needle x3 |
| Blade Barrage, Knock 'Em Down, Shards of Galanor, Limit Break | im Modell | gate: probe entry by rule |
| Parasite, Worm's Hunger x20 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Heirloom, pre-fully charged, no ignition | übersprungen | burst before the swap; the simulation fires the whole phase |
| Blade Barrage, Knock 'Em Down, Feast of Light x6, Limit Break | im Modell | gate: probe entry by rule |
| Hellion, Ember of Ashes, Consul's Pitch, max range | im Modell | own damage of an aspect or fragment (rule H) |
| Golden Gun - Marksman, Celestial Nighthawk, Radiant, Facet of Courage, Limit Break | im Modell | gate: hand-made probe entry |
| Izanagi's Burden, excludes re-hone time | übersprungen | burst before the swap; the simulation fires the whole phase |
| Dragon's Breath, Composite Propellant x5, Ember of Ashes, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Needlestorm, Stylostixis, Thread of Evolution, Pack Tactics x2 | fehlt | no switch for: Pack Tactics x2 |
| Nova Bomb - Cataclysm, Feast of Light x6, Facet of Courage, Limit Break | im Modell | gate: probe entry by rule |
| Exodus Rockets, one volley, Thruster, Turncoat transfer | übersprungen | burst before the swap; the simulation fires the whole phase |
| High-impact bow, Heavy Bolts, High Ground x3 (A Good Shout), Moebius Quiver | übersprungen | burst before the swap; the simulation fires the whole phase |
| Needlestorm, Feast of Light x6, Limit Break | im Modell | gate: probe entry by rule |
| Pinpoint slug shotgun, Redirection + e. Recombination x8 (Heritage), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Anarchy, two traps, Jolting Feedback | übersprungen | burst before the swap; the simulation fires the whole phase |
| Thundercrash, Facet of Courage, Thunderous Retort, Conductive Cosmic Needle x3 | fehlt | no switch for: Conductive Cosmic Needle x3 |
| Truth, Prototype Truthseeker, Reaper's Tithe x4, Argent Ordnance, 3 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Gathering Storm, Feast of Light x6, Limit Break | im Modell | gate: probe entry by rule |
| Hellion, Ember of Ashes | im Modell | own damage of an aspect or fragment (rule H) |
| Whirling Maelstrom, Untold Greed x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Song of Flame, Warlord's Fury, One-Two Punch, Celestial Fire spam, Ember of Ashes, Shieldcrush | fehlt | super not in the model |
| Needlestorm, Thread of Evolution, Pack Tactics x2 | fehlt | no switch for: Pack Tactics x2 |
| Silence and Squall, Whisper of Fissures, Whisper of Durance, Feast of Light x6, Limit Break | fehlt | super not in the model |
| Finality's Auger, assumes pre-loaded turret, painted target, Bait and Switch, Ruinscribe Turret Mode | übersprungen | burst before the swap; the simulation fires the whole phase |
| Nova Bomb - Vortex, Limit Break | im Modell | gate: hand-made probe entry |
| Blade Barrage, Knock 'Em Down, Limit Break | im Modell | gate: hand-made probe entry |
| Aggressive rocket launcher, e. Cluster Bomb + e. Elemental Honing x5 + Timelost Magazine (Hezen Vengeance), Pack Hunter, 2 shots, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Grand Overture, Missiles Loaded x20 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Nova Bomb - Cataclysm, Facet of Courage, Limit Break | im Modell | gate: probe entry by rule |
| Legend of Acrius, body, Arc Compounding | übersprungen | burst before the swap; the simulation fires the whole phase |
| Glacial Quake, heavy attacks, Feast of Light x6, Hail the Storm | fehlt | no switch for: heavy attacks; Hail the Storm |
| Song of Flame, Warlord's Fury, Celestial Fire spam, Ember of Ashes, Shieldcrush | fehlt | super not in the model |
| Izanagi's Burden, includes re-hone time, Kinetic Rupture, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Nova Bomb - Cataclysm, Skull of Dire Ahamkara, Facet of Courage, Limit Break | fehlt | no switch for: Skull of Dire Ahamkara (ownDamage) |
| Golden Gun - Marksman, Feast of Light x6, Radiant, Facet of Courage, Limit Break | im Modell | gate: probe entry by rule |
| Ice Breaker, shatter ignition | übersprungen | burst before the swap; the simulation fires the whole phase |
| Aggressive sniper rifle, e. Redirection + e. Forge's Kin x3 (Tatara Gaze), Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Burning Maul, Pyrogale Gauntlets, Roaring Flames x3, Sol Invictus, Limit Break | fehlt | no switch for: Roaring Flames x3 |
| Silence and Squall, Feast of Light x6, Facet of Ruin, Limit Break | fehlt | super not in the model |
| Adaptive rocket launcher, e. Overflow + e. Reaper's Tithe + e. Forge's Kin x3 (Bellowing Giant), Pack Hunter, 3 shots, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| New Malpais, 6 bursts, only explosive damage, one suspend burst, pre-readied | übersprungen | burst before the swap; the simulation fires the whole phase |
| Aggressive rocket launcher, Elemental Honing x5 + Timelost Magazine (Hezen Vengeance), Pack Hunter, 2 shots, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Pinpoint slug shotgun, Redirection + Aggregate Charge x3 (Heritage), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Still Hunt, Cayde's Retribution, Celestial Nighthawk, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Glacial Quake, heavy attacks, Biotic Enhancements, Limit Break | fehlt | no switch for: heavy attacks |
| Silence and Squall, Whisper of Fissures, Whisper of Durance, Limit Break | fehlt | super not in the model |
| Gjallarhorn, 1 shot, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Aggressive shotgun, body, Aggregate Charge x3 + Elemental Honing x5 (Found Verdict), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Grapple melee, One-Two Punch, Biotic Enhancements, Combination Blow x3, Facet of Courage, Arc Compounding, Conductive Cosmic Crystal | fehlt | melee not in the model |
| Adaptive grenade launcher, Sticky Grenades, e. Cascade Point + e. Explosive Light (Edge Transit), 7 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Twilight Arsenal, Feast of Light x6, Facet of Courage, Limit Break | im Modell | gate: probe entry by rule |
| Flux grenade, Death Throes x5, Sticker Shock | im Modell | grenade in the model, value not probed |
| High-impact bow, Heavy Bolts, High Ground x3 (A Good Shout) | übersprungen | burst before the swap; the simulation fires the whole phase |
| Heirloom, uncharged, Moebius Quiver | übersprungen | burst before the swap; the simulation fires the whole phase |
| New Land Beyond, The Master x20, Kinetic Holster, Sniper's Meditation x5, no catalyst | übersprungen | burst before the swap; the simulation fires the whole phase |
| Witherhoard, direct impact | übersprungen | burst before the swap; the simulation fires the whole phase |
| Song of Flame, Warlord's Fury, Saint's Fists, Celestial Fire spam, Ember of Ashes, Shieldcrush | fehlt | super not in the model |
| Rapid-fire grenade launcher, Spike Grenades, e. Cascade Point + e. Surrounded (VS Chill Inhibitor), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Rapid-fire grenade launcher, Spike Grenades, e. Cascade Point + e. Explosive Light (VS Chill Inhibitor), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Shadowshot: Moebius Quiver, Feast of Light x6, full bow charge, both volleys, assumes no other debuff, Limit Break | fehlt | no switch for: full bow charge; both volleys; assumes no other debuff |
| Rapid-fire sniper, e. Kinetic Tremors + Elemental Honing x5 (Praedyth's Revenge), 2 shots, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Hammer of Sol, Roaring Flames x3, Sunfire Furnace x10, Ember of Ashes, max distance, Limit Break | fehlt | no switch for: Roaring Flames x3; max distance |
| The Fourth Horseman, full mag, body, Arc Compounding | übersprungen | burst before the swap; the simulation fires the whole phase |
| Area denial grenade launcher, Elemental Honing x5 (Festival Flight), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Still Hunt, Cayde's Retribution, pre-popped | übersprungen | burst before the swap; the simulation fires the whole phase |
| Gathering Storm, Limit Break | im Modell | gate: hand-made probe entry |
| Thermite grenade, Roaring Flames x3, Empowered Grenade x2, Ember of Ashes | im Modell | grenade in the model, value not probed |
| Silence and Squall, Facet of Ruin, Limit Break | fehlt | super not in the model |
| Rapid-fire grenade launcher, Spike Grenades, e. Cascade Point + e. Aggregate Charge x3 (VS Chill Inhibitor), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Merciless, pre-stacked, Impetus, full mag | übersprungen | burst before the swap; the simulation fires the whole phase |
| Burning Maul, light attacks, Roaring Flames x3, Sol Invictus, Ember of Ashes, Sunfire Furnace x10, Limit Break | fehlt | no switch for: light attacks; Roaring Flames x3 |
| Pinpoint slug shotgun, Assault Mag, e. Redirection x30 + e. Cascade Point (Heritage), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Wolfsbane, pre-activated, HLLHLLHLLHLLH, Honed Edge + Jagged Edge, Burning Ambition, Argent Blade, Solar Fulmination, Dawn Chorus | übersprungen | burst before the swap; the simulation fires the whole phase |
| Parasite | übersprungen | burst before the swap; the simulation fires the whole phase |
| Fusion grenade, Death Throes x5, Touch of Flame, Ember of Ashes, Sticker Shock | im Modell | grenade in the model, value not probed |
| Aggressive shotgun, body, Elemental Honing x5 (A Sudden Death), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Aggressive sniper rifle, Elemental Honing x5 (Something Something), Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Storm grenade, Touch of Thunder, Spark of Magnitude, Empowered Grenade x2 | im Modell | grenade in the model, value not probed |
| Aggressive shotgun, body, Assault Mag, e. Cascade Point + e. Bait and Switch (Felwinter's Lie), 6 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Duality, precision | übersprungen | burst before the swap; the simulation fires the whole phase |
| The Prospector, full mag, Arc Compounding | übersprungen | burst before the swap; the simulation fires the whole phase |
| Rapid-fire shotgun, body, e. Cascade Point + e. Elemental Honing x5 + e. Forge's Kin x3 (Threat Level), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Conditional Finality, body, average across both shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Shadowshot: Moebius Quiver, Feast of Light x6, both volleys, assumes no other debuff, Limit Break | fehlt | no switch for: both volleys; assumes no other debuff |
| Izanagi's Burden, includes re-hone time, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Wolfsbane, pre-activated, HLLHLLHLLHLLH, Honed Edge + Jagged Edge, Burning Ambition, Argent Blade, Solar Fulmination | übersprungen | burst before the swap; the simulation fires the whole phase |
| Chaos Reach, Geomag Stabilizers, Sol Invictus, Thunderous Retort | im Modell | gate: probe entry by rule |
| Micro-missile grenade launcher, Spike Grenades, Recombination x10 (The Mountaintop), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Bequest, heavy attack, Jagged Edge, e. Redirection + Rampage x3 + e. Forge's Kin x3 (Stryker's Sure-Hand) | übersprungen | burst before the swap; the simulation fires the whole phase |
| Throwing Hammer, Roaring Flames x3, Biotic Enhancements | im Modell | melee in the model, value not probed |
| Burning Maul, heavy attacks, Roaring Flames x3, Sol Invictus, Ember of Ashes, Sunfire Furnace x10, Limit Break | fehlt | no switch for: heavy attacks; Roaring Flames x3 |
| Hammer of Sol, Feast of Light x6, Facet of Courage, max distance, Limit Break | fehlt | no switch for: max distance |
| Twilight Arsenal, Facet of Courage, Limit Break | im Modell | gate: probe entry by rule |
| Chaos Reach, Geomag Stabilizers, Thunderous Retort | im Modell | gate: probe entry by rule |
| Dynamic sniper, Vorpal Weapon + Bait and Switch + e. Imperial Allegiance x3 (Conspiracy Honed), 4 shots, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Tessellation, Property: Irreducible, excludes re-proc time, Transcendent but excludes 5% | übersprungen | burst before the swap; the simulation fires the whole phase |
| Shatter grenade, Touch of Winter, Whisper of Fissures | im Modell | grenade in the model, value not probed |
| Dynamic hand cannon - 180RPM special, 18 shot burst, e. Precision Instrument (Uncivil Discourse), Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Whirling Ovation, max Anticipation, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Dynamic hand cannon - 180RPM special, primed with 2 Crimson bursts, 15 shot burst, e. Precision Instrument (Uncivil Discourse), Accelerated Assault, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Solar grenade, four grenades, melee kill included, Sunbracers, Touch of Flame, Ember of Ashes | im Modell | grenade in the model, value not probed |
| Slayer's Fang, includes submunitions, Cascade Point, 6 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Exodus Rockets, one volley, Thruster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Lightweight shotgun, body, All-Star (Reckless Endangerment), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Adaptive grenade launcher, Spike Grenades, Cascade Point (Edge Transit), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Ice Breaker | übersprungen | burst before the swap; the simulation fires the whole phase |
| Song of Flame, Dawn Chorus, Saint's Fists, Celestial Fire spam, Ember of Ashes, Shieldcrush | fehlt | super not in the model |
| Gjallarhorn, 2 shots, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Hammer of Sol, Roaring Flames x3, Sol Invictus, Ember of Ashes, Biotic Enhancements, Limit Break | fehlt | no switch for: Roaring Flames x3 |
| Storm's Edge, body, Feast of Light x6, Facet of Courage, all three casts, Thunderous Retort | fehlt | no switch for: body; all three casts |
| Shadowshot: Moebius Quiver, Orpheus Rig, full bow charge, all 3 volleys, assumes no other debuff, Limit Break | fehlt | no switch for: full bow charge; all 3 volleys; assumes no other debuff |
| Sentinel Shield, Biotic Enhancements, aerial lights, Shieldcrush | fehlt | no switch for: aerial lights |
| Rapid-fire grenade launcher, Spike Grenades, Elemental Honing x5 (VS Chill Inhibitor), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Void wall, Echo of Remnants | im Modell | grenade in the model, value not probed |
| Storm's Edge, body, Feast of Light x6, Facet of Courage, per cast, Thunderous Retort | fehlt | no switch for: body; per cast |
| Eriana's Vow, primed with 3 heavy burst HC bursts, 7 shots, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Pinpoint slug shotgun, Aggregate Charge x3 (Heritage), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Stormtrance, Ascending Amplitude, Facet of Courage, Thunderous Retort | im Modell | gate: probe entry by rule |
| Heirloom, uncharged | übersprungen | burst before the swap; the simulation fires the whole phase |
| Double fire grenade launcher, Spike Grenades, Elemental Honing x5 (Wilderflight), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Flechette Storm, 11 volleys, Banner of War, Wish-Dragon's Talons, Insatiable | fehlt | melee not in the model |
| Silkstrike, light attack spam, Feast of Light x6, Shieldcrush | fehlt | no switch for: light attack spam |
| Adaptive grenade launcher, Spike Grenades, Elemental Honing x5 (Edge Transit), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Fists of Havoc, heavy attacks, Biotic Enhancements, Thunderous Retort | fehlt | no switch for: heavy attacks |
| Grapple melee, Banner of War, Biotic Enhancements, One-Two Punch | fehlt | melee not in the model |
| Choir of One, projectile mode, spaced, one mag, no reload | übersprungen | burst before the swap; the simulation fires the whole phase |
| Arc Staff, Raiden Flux, Shieldcrush | im Modell | gate: probe entry by rule |
| Pulse grenade, Touch of Thunder, Spark of Magnitude, Empowered Grenade x2 | im Modell | grenade in the model, value not probed |
| The Last Word, hipfire, Envious Assassin, 23 shots, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Flux grenade, Sticker Shock | im Modell | grenade in the model, value not probed |
| Micro-missile grenade launcher, Spike Grenades, Elemental Honing x5 (Theodolite), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Still Hunt, Cayde's Retribution, Sniper's Meditation x5 | übersprungen | burst before the swap; the simulation fires the whole phase |
| Witherhoard, ground | übersprungen | burst before the swap; the simulation fires the whole phase |
| Spectral Blades, light attack spam, Feast of Light x6, Shieldcrush | fehlt | no switch for: light attack spam |
| Shadowshot: Moebius Quiver, Orpheus Rig, all 3 volleys, assumes no other debuff, Limit Break | fehlt | no switch for: all 3 volleys; assumes no other debuff |
| Bladefury, HLLLHLLLLHLLLH, Banner of War, Biotic Enhancements, Thread of Continuity, Limit Break | fehlt | super not in the model |
| Spread shot hand cannon, e. Cascade Point + Vorpal Weapon (Aureus Neutralizer), 14 shot burst, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Bladefury, HLLLHLLLLHLLLLH, Feast of Light x6, Limit Break | fehlt | super not in the model |
| Burning Maul, heavy attacks, Roaring Flames x3, Sol Invictus, Ember of Ashes, Biotic Enhancements, Limit Break | fehlt | no switch for: heavy attacks; Roaring Flames x3 |
| Rapid-fire shotgun, body, Elemental Honing x5 (Threat Level), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Eriana's Vow, 1 mag, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Solar grenade, Touch of Flame, Ember of Ashes | im Modell | grenade in the model, value not probed |
| Bequest, heavy attack, Jagged Edge, Elemental Honing x5 (Bequest), Pack Hunter | übersprungen | burst before the swap; the simulation fires the whole phase |
| Stormtrance, Feast of Light x6, Facet of Courage, Thunderous Retort | im Modell | gate: probe entry by rule |
| Daybreak, Dawn Chorus, Ember of Ashes, grounded, Limit Break | fehlt | no switch for: grounded |
| Bladefury, HLLLLL, Banner of War, Biotic Enhancements, Thread of Continuity, Limit Break | fehlt | super not in the model |
| Song of Flame, snap spam, Dawn Chorus, Shieldcrush | fehlt | super not in the model |
| Fusion grenade, Touch of Flame, Ember of Ashes, Sticker Shock | im Modell | grenade in the model, value not probed |
| Hawkmoon, primed with 3 heavy burst HC bursts, 9 shots, Paracausal Shot, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Sentinel Shield, Biotic Enhancements, grounded spam, Shieldcrush | fehlt | no switch for: grounded spam |
| Ex Diris | übersprungen | burst before the swap; the simulation fires the whole phase |
| Cloudstrike, 3 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Ergo Sum, caster frame, heavy attack, The Perfect Fifth, Ember of Ashes, Pack Hunter | übersprungen | burst before the swap; the simulation fires the whole phase |
| Rapid-fire slug shotgun, e. Precision Instrument (Trachinus), 8 shots | übersprungen | burst before the swap; the simulation fires the whole phase |
| Thermite grenade, Ember of Ashes | im Modell | grenade in the model, value not probed |
| Magnetic grenade, Chaos Accelerant | im Modell | grenade in the model, value not probed |
| Lightning Surge, Biotic Enhancements, Facet of Courage | fehlt | melee not in the model |
| Hailfire Spike, Facet of Courage, Facet of Ruin | im Modell | grenade in the model, value not probed |
| Choir of One, projectile mode, spaced, one mag, reload | übersprungen | burst before the swap; the simulation fires the whole phase |
| Shadowshot: Moebius Quiver, full bow charge, both volleys, assumes no other debuff, Limit Break | fehlt | no switch for: full bow charge; both volleys; assumes no other debuff |
| Malfeasance, 17 shot burst, blighted, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Caster sword, heavy attack, Jagged Edge, Elemental Honing x5 (Night Terror), Pack Hunter | übersprungen | burst before the swap; the simulation fires the whole phase |
| Hawkmoon, 9 shots, Paracausal Shot, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Winter's Wrath, Feast of Light x6, light-heavy cycle, Facet of Ruin, Limit Break | fehlt | no switch for: light-heavy cycle; Facet of Ruin |
| Heavy burst hand cannon, e. Precision Instrument (Agape), 13 bursts, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Crackshot, average, includes ignition and Radiant | übersprungen | burst before the swap; the simulation fires the whole phase |
| Grapple melee, One-Two Punch | fehlt | melee not in the model |
| Whirling Ovation, no Anticipation, Argent Ordnance | übersprungen | burst before the swap; the simulation fires the whole phase |
| Burning Maul, light attacks, Roaring Flames x3, Sol Invictus, Ember of Ashes, Biotic Enhancements, Limit Break | fehlt | no switch for: light attacks; Roaring Flames x3 |
| Shadowshot: Moebius Quiver, both volleys, assumes no other debuff, Limit Break | fehlt | no switch for: both volleys; assumes no other debuff |
| Pulse grenade, Facet of Courage | im Modell | grenade in the model, value not probed |
| Malfeasance, 17 shot burst, Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Song of Flame, Feast of Light x6 + Necrotic Grip, wisp/snap cycling, Facet of Courage, Shieldcrush | fehlt | super not in the model |
| Tessellation, Property: Irreducible, includes re-proc time, Transcendent but excludes 5% | übersprungen | burst before the swap; the simulation fires the whole phase |
| Fists of Havoc, light attacks, Biotic Enhancements, Shieldcrush | fehlt | no switch for: light attacks |
| Rapid-fire fusion rifle, Charge MW, Accelerated Coils, Aggregate Charge x3 (Cartesian Coordinate), 1 shot | übersprungen | burst before the swap; the simulation fires the whole phase |
| Vex Mythoclast, Temporal Unlimiter | übersprungen | burst before the swap; the simulation fires the whole phase |
| Tractor Cannon | übersprungen | burst before the swap; the simulation fires the whole phase |
| Scatter grenade, Chaos Accelerant | im Modell | grenade in the model, value not probed |
| Winter's Wrath, Ballidorse Wrathweavers, light-heavy cycle, Whisper of Fissures, Limit Break | fehlt | no switch for: light-heavy cycle; Whisper of Fissures |
| Song of Flame, snap spam, Shieldcrush | fehlt | super not in the model |
| Song of Flame, Claws of Ahamkara + Necrotic Grip, snap spam, Facet of Courage, Shieldcrush | fehlt | super not in the model |
| Precision hand cannon, 17 shot burst, e. Precision Instrument (Sightline Survey), Illegally Modded Holster | übersprungen | burst before the swap; the simulation fires the whole phase |
| Tripmine grenade, Young Ahamkara's Spine, Ember of Ashes | im Modell | grenade in the model, value not probed |
| Solar grenade, Ember of Ashes | im Modell | grenade in the model, value not probed |
| Electrified Snare, Facet of Courage | im Modell | grenade in the model, value not probed |
| Vortex grenade, Facet of Courage | im Modell | grenade in the model, value not probed |
| Adaptive SMG, e. Rewind Rounds + e. Target Lock (Antedate), Peacekeepers | übersprungen | burst before the swap; the simulation fires the whole phase |
| Threadling grenade, Thread of Evolution | im Modell | grenade in the model, value not probed |
| Freezing Singularity, Facet of Courage, Facet of Ruin | im Modell | grenade in the model, value not probed |
| Twilight Arsenal, axe heavy attack | fehlt | no switch for: axe heavy attack |
| Storm grenade, Facet of Courage | im Modell | grenade in the model, value not probed |
| Incinerator Snap, Ember of Ashes | im Modell | melee in the model, value not probed |
| Threadling grenade | im Modell | grenade in the model, value not probed |
| Twilight Arsenal, axe light attack spam | fehlt | no switch for: axe light attack spam |
| Arcane Needle | im Modell | melee in the model, value not probed |
