# Waffen-Import: Prüftabelle

Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.

Stand: Aegis 2026-10-20, Quantum 2026-10-20 (Quantum nennt keinen Patch pro Zeile), Manifest 245114.26.10.13.2000-1-bnet.66137.

Umfang: exotische Special- und Heavy-Waffen. **38 Pakete**, 41 Lücken, von Hand modelliert: One Thousand Voices.

## Pakete

Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Quantum. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.

| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ager's Scepter | traceRifle | stasis | keine (1 Shot) | 37,2 | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,1 % | – |
| Arbalest | linearFusionRifle | kinetic | keine (1 Shot) | 1.086,1 | 21 | 6 | 1,32 s | 23,7 s | 58 → 61 | 0,0 % | ⚠ Timing aus der Quantum-Zeile „cata“ mit Katalysator |
| Bastion | fusionRifle | kinetic | keine (4 Shots) | 1.591,5 | 21 | 4 | 1,32 s | 37,4 s | 38 → 39 | 0,3 % | – |
| Borealis | sniperRifle | void | keine (1 Shot) | 832,4 | 20 | 5 | 1,98 s | 19,3 s | 72 → 85 | 0,1 % | – |
| Buried Bloodline | sidearm | void | keine (1 Shot) | 322,4 | 50 | 11 | 1,02 s | 31,1 s | 100 → 109 | 0,1 % | – |
| Cloudstrike | sniperRifle | arc | average, with lightning strikes (36 Shots) | 664,4 | 31 | 7 | 1,68 s | 17,9 s | 140 → 161 | 0,9 % | – |
| Coldheart | traceRifle | arc | average, no initial trace (202 Shots) | 35,3 | 505 | 101 | 1,44 s | 39,1 s | 900 → 907 | 1,0 % | – |
| Dead Messenger | grenadeLauncher | void | keine (1 Shot) | 1.383,7 | 20 | 1 | 1,62 s | 32,4 s | 90 → 704 | 0,1 % | abgeleitete Feuerrate 704 statt 90 rpm |
| Delicate Tomb | fusionRifle | arc | hipfire (18 Shots) | 890,4 | 26 | 6 | 1,32 s | 32,0 s | 56 → 56 | 0,6 % | Timing aus der Quantum-Zeile „Hip-fire“; 2 passende Quantum-Zeilen, die erste gilt („Does not consider Jolt. Fires 16 bolts in a wide line, 2 bolts at a time“) |
| Deterministic Chaos | machineGun | void | average, with volatile damage, excludes weaken (48 Shots) | 126,5 | 376 | 48 | 3,57 s | 86,3 s | 360 → 367 | 0,0 % | Timing aus der Quantum-Zeile „w/o weaken“; 2 passende Quantum-Zeilen, die erste gilt („This assumes 0% weaken uptime“) |
| Edge of Action | glaive | void | projectile (1 Shot) | 482,4 | 29 | 6 | 1,57 s | 32,5 s | 55 → 64 | 0,1 % | – |
| Edge of Concurrence | glaive | arc | projectile (1 Shot) | 420,4 | 33 | 7 | 1,57 s | 31,0 s | 80 → 78 | 0,1 % | – |
| Edge of Intent | glaive | solar | projectile (1 Shot) | 553,8 | 31 | 5 | 1,57 s | 50,8 s | 45 → 43 | 0,0 % | – |
| Eriana's Vow | handCannon | solar | Death At First Glance (1 Shot) | 491,2 | 35 | 9 | 1,66 s | 25,6 s | 90 → 99 | 0,0 % | – |
| Eyes of Tomorrow | rocketLauncher | solar | volley (1 Shot) | 2.703,6 | 10 | 1 | 2,35 s | 29,3 s | 72 → 66 | 0,1 % | – |
| Forerunner | sidearm | kinetic | keine (1 Shot) | 297,9 | 70 | 12 | 1,63 s | 27,4 s | 200 → 215 | 0,0 % | – |
| Gjallarhorn | rocketLauncher | solar | keine (8 Shots) | 1.892,2 | 11 | 2 | 2,35 s | 18,2 s | 47 → 93 | 0,9 % | abgeleitete Feuerrate 93 statt 47 rpm |
| Heir Apparent | machineGun | solar | keine (1 Shot) | 56,1 | 440 | 200 | 3,57 s | 36,3 s | 900 → 903 | 1,1 % | – |
| Legend of Acrius | shotgun | arc | body (1 Shot) | 1.990,4 | 16 | 6 | 0,43 s | 21,1 s | 55 → 44 | 0,0 % | ⚠ Timing aus der Quantum-Zeile „cata“ mit Katalysator |
| Leviathan's Breath | bow | void | keine (6 Shots) | 2.170,1 | 9 | 1 | 0,60 s | 17,4 s | 31 → 38 | 1,3 % | – |
| Lord of Wolves | shotgun | solar | average, includes ignition/scorch (120 Shots) | 186,1 | 189 | 30 | 0,92 s | 22,6 s | 640 → 660 | 2,7 % | Timing aus der Quantum-Zeile „ADS“; 4 passende Quantum-Zeilen, die erste gilt („Assumes all body hits“) |
| Lorentz Driver | linearFusionRifle | void | keine (1 Shot) | 1.086,1 | 21 | 6 | 1,32 s | 23,7 s | 58 → 61 | 0,0 % | 2 passende Quantum-Zeilen, die erste gilt („“) |
| Microcosm | traceRifle | kinetic | keine (1 Shot) | 82,8 | 385 | 120 | 1,44 s | 29,7 s | 900 → 908 | 0,1 % | – |
| New Land Beyond | sniperRifle | kinetic | no stacks (20 Shots) | 1.029,0 | 40 | 8 | 1,98 s | 72,7 s | 32 → 36 | 0,0 % | Timing aus der Quantum-Zeile „The Master 0x“; 2 passende Quantum-Zeilen, die erste gilt („Base damage, The Master 0x, without any stat buffs“) |
| Parasite | grenadeLauncher | solar | keine (1 Shot) | 2.133,4 | 18 | 1 | 2,08 s | 35,4 s | 120 → 25.500 | 0,0 % | abgeleitete Feuerrate 25500 statt 120 rpm |
| Ruinous Effigy | traceRifle | void | keine (1 Shot) | 40,1 | 470 | 94 | 1,44 s | 36,8 s | 900 → 907 | 0,4 % | – |
| Service of Luzaku | machineGun | strand | keine (1 Shot) | 156,7 | 300 | 47 | 3,57 s | 70,3 s | 360 → 367 | 0,2 % | – |
| Sleeper Simulant | linearFusionRifle | solar | keine (1 Shot) | 2.328,5 | 16 | 4 | 1,32 s | 28,3 s | 47 → 37 | 0,0 % | ⚠ Timing aus der Quantum-Zeile „cata“ mit Katalysator |
| Still Hunt | sniperRifle | solar | keine (1 Shot) | 658,5 | 20 | 6 | 1,98 s | 31,8 s | 90 → 44 | 0,1 % | abgeleitete Feuerrate 44 statt 90 rpm |
| The Chaperone | shotgun | kinetic | keine (1 Shot) | 748,6 | 18 | 6 | 0,43 s | 20,7 s | 70 → 51 | 0,1 % | abgeleitete Feuerrate 51 statt 70 rpm |
| The Colony | grenadeLauncher | void | direct impact (1 Shot) | 833,8 | 25 | 8 | 2,08 s | 15,2 s | 140 → 161 | 0,1 % | ⚠ Timing aus der Quantum-Zeile „cata“ mit Katalysator |
| The Fourth Horseman | shotgun | arc | body, full mag (1 Shot) | 4.197,6 | 20 | 4 | 0,43 s | 12,2 s | 300 → 109 | 0,1 % | abgeleitete Feuerrate 109 statt 300 rpm |
| The Navigator | traceRifle | strand | keine (1 Shot) | 28,6 | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,3 % | – |
| The Wardcliff Coil | rocketLauncher | arc | average, volley, excludes Bolt Charge (1 Shot) | 2.403,2 | 8 | 1 | 2,35 s | 21,4 s | 86 → 85 | 0,1 % | – |
| Thunderlord | machineGun | arc | average, with lightning strikes, excludes Bolt Charge (127 Shots) | 113,9 | 379 | 62 | 3,57 s | 57,6 s | 617 → 627 | 0,9 % | – |
| Truth | rocketLauncher | void | average, Prototype Truthseeker (9 Shots) | 2.179,3 | 20 | 3 | 2,35 s | 17,4 s | 47 → 345 | 0,1 % | 2 passende Quantum-Zeilen, die erste gilt („Assumes starting with Prototype Trueseeker, no bomblets hit the boss“); abgeleitete Feuerrate 345 statt 47 rpm |
| Vexcalibur | glaive | void | projectile (1 Shot) | 573,2 | 33 | 6 | 1,57 s | 28,1 s | 80 → 95 | 0,3 % | – |
| Xenophage | machineGun | solar | keine (1 Shot) | 736,4 | 29 | 13 | 3,57 s | 20,1 s | 120 → 130 | 0,1 % | – |

## Optionen

Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.

| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |
| --- | --- | --- | --- | --- | --- | --- |
| Truth | ⚠ Reaper's Tithe x4 | Katalysator | ×1,400 | 15 s | Grants stacks of Reaper's Tithe based on the amount of simultaneously killed enemies, up to a maximum of 4 stacks. | Faktor aus Einzeltreffern; Mittelwert pro Shot wäre ×1,448 (9 gegen 12 Shots) |

## Lücken

| Waffe | Typ | Grund |
| --- | --- | --- |
| Anarchy | grenadeLauncher | keine Aegis-Zeile ohne fremde Annahmen |
| Black Talon | sword | keine Quantum-Zeile |
| Choir of One | autoRifle | Skala Aegis gegen Quantum weicht um 82.1 % ab |
| Conditional Finality | shotgun | Skala Aegis gegen Quantum weicht um 4.6 % ab |
| Cull's Shadow | fusionRifle | keine Quantum-Zeile |
| D.A.R.C.I. | sniperRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Deathbringer | rocketLauncher | Skala Aegis gegen Quantum weicht um 51.4 % ab |
| Divinity | traceRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Dragon's Breath | rocketLauncher | abgeleiteter Abstand ≤ 0 |
| Duality | shotgun | keine passende Quantum-Zeile (nur „cata, pellet“, „cata, slug“, „cata, On Black Wings x3“) |
| Ergo Sum | sword | keine Quantum-Zeile |
| Euphony | linearFusionRifle | Skala Aegis gegen Quantum weicht um 15.6 % ab |
| Ex Diris | grenadeLauncher | keine passende Quantum-Zeile (nur „No Enrage“, „Max Enrage“) |
| Fafnir | linearFusionRifle | keine Quantum-Zeile |
| Finality's Auger | linearFusionRifle | Quantum ohne Magazin, Munition oder Reload ({"totalDamage":"#VALUE!","totalShots":"???","timeToEmptySeconds":"#NUM!"}) |
| Grand Overture | machineGun | Skala Aegis gegen Quantum weicht um 12.9 % ab |
| Heartshadow | sword | keine Quantum-Zeile |
| Heirloom | bow | keine Quantum-Zeile |
| Ice Breaker | sniperRifle | Quantum ohne Magazin, Munition oder Reload ({"totalShots":"N/A","reloadSeconds":"N/A"}) |
| Izanagi's Burden | sniperRifle | Skala Aegis gegen Quantum weicht um 154.2 % ab |
| Jötunn | fusionRifle | keine Quantum-Zeile |
| Merciless | fusionRifle | Skala Aegis gegen Quantum weicht um 80.0 % ab |
| New Malpais | pulseRifle | keine Quantum-Zeile |
| Praxic Blade | sword | keine Quantum-Zeile |
| Prometheus Lens | traceRifle | keine Quantum-Zeile |
| Salvation's Grip | grenadeLauncher | keine passende Quantum-Zeile (nur „no charge, spamming“, „full charge, spamming“, „full charge, spamming“, „mix“, „full charge, spamming, WoF“, „full charge, spamming, WoF“, „mix, WoF“) |
| Slayer's Fang | shotgun | Skala Aegis gegen Quantum weicht um 3.1 % ab |
| Telesto | fusionRifle | Skala Aegis gegen Quantum weicht um 3.5 % ab |
| Tessellation | fusionRifle | keine Quantum-Zeile |
| The Lament | sword | keine Quantum-Zeile |
| The Prospector | grenadeLauncher | Skala Aegis gegen Quantum weicht um 23.1 % ab |
| The Queenbreaker | linearFusionRifle | keine passende Quantum-Zeile (nur „Marksman Sights“, „Combat Sights“) |
| Tractor Cannon | shotgun | Skala Aegis gegen Quantum weicht um 5.3 % ab |
| Two-Tailed Fox | rocketLauncher | Skala Aegis gegen Quantum weicht um 36.4 % ab |
| Wavesplitter | traceRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Whirling Ovation | rocketLauncher | keine Quantum-Zeile |
| Whisper of the Worm | sniperRifle | Skala Aegis gegen Quantum weicht um 9.1 % ab |
| Winterbite | glaive | Skala Aegis gegen Quantum weicht um 22.7 % ab |
| Witherhoard | grenadeLauncher | keine passende Quantum-Zeile (nur „passive“, „passive“, „passive, ground“, „cata, single blight, boss“, „cata, single blight, floor“, „double blight“, „spamming, single blight“, „spamming, double blight“) |
| Wolfsbane | sword | keine Quantum-Zeile |
| Worldline Zero | sword | keine Aegis-Zeile ohne fremde Annahmen |

## Nicht genutzte Aegis-Zeilen

| Waffe | Annahmen | Grund |
| --- | --- | --- |
| Ager's Scepter | average, Will Given Form | Katalysator: Will Given Form |
| Ager's Scepter | average, Will Given Form, Harsh Refraction | Katalysator: Will Given Form; Artefakt: Harsh Refraction |
| Anarchy | average, per trap, double stick, Jolting Feedback | Katalysator: Jolting Feedback |
| Black Talon | single projectile | ohne light der Basiszeile |
| Choir of One | hitscan | ohne projectile - spaced (~9m) der Basiszeile |
| Choir of One | projectile - point blank | ohne projectile - spaced (~9m) der Basiszeile |
| Cull's Shadow | average, with corruption | gleiche Annahmen wie die Basiszeile |
| Cull's Shadow | with corruption | gleiche Annahmen wie die Basiszeile |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt | Katalysator: Networked Targeting x5 |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt, first mag | Katalysator: Networked Targeting x5 |
| Delicate Tomb | ADS | ohne hipfire der Basiszeile |
| Deterministic Chaos | average, with volatile damage, excludes weaken, Target Lock, single mag | Katalysator: Target Lock |
| Divinity | average, Penance, excludes debuff, Jolting Feedback, Focused Fury | Katalysator: Jolting Feedback; Katalysator: Focused Fury |
| Duality | hipfire, body | ohne ADS der Basiszeile |
| Edge of Concurrence | Lightning Seeker | ohne projectile der Basiszeile |
| Ergo Sum | lightweight frame, Jagged Edge, 64 impact, heavy | ohne light der Basiszeile |
| Ergo Sum | The Perfect Fifth, caster frame, Pack Hunter, Transcendent, Enduring Blade, 58 impact, 1H2L | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | The Perfect Fifth, caster frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, 1H2L | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | Unplanned Reprieve, wave sword frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, heavy | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | Unplanned Reprieve, lightweight frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, 1H2L | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | Unplanned Reprieve, vortex frame, Pack Hunter, Transcendent, Tempered Edge, 61 impact, heavy | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Eriana's Vow | Illegally Modded Holster, Death At First Glance, 7 shots, pre-stacked using heavy burst | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Eriana's Vow | Illegally Modded Holster, Death At First Glance, full mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Finality's Auger | Ruinscribe Turret Mode, marked, entire turret duration | nicht modelliert: marked |
| Forerunner | The Rock, excludes impact | Katalysator: The Rock |
| Grand Overture |  | ohne Missile Loaded, Volley Ready der Basiszeile |
| Heartshadow | heavy, Shot in the Dark, weaken excluded | ohne light der Basiszeile |
| Heirloom | average, 1/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, 2/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, fully charged, with ignition, catalyst | Katalysator: catalyst |
| Ice Breaker | shatter ignition, includes shatter and frozen bonuses | nicht modelliert: shatter ignition |
| Izanagi's Burden |  | ohne Honed Edge x4 der Basiszeile |
| Lord of Wolves | average, includes ignition/scorch, Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Merciless | Conserve Momentum x0, full mag | ohne Conserve Momentum x15 der Basiszeile |
| Praxic Blade | average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar), Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Praxic Blade | average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar) | gleiche Annahmen wie die Basiszeile |
| Praxic Blade | average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar) | ohne 3L1H der Basiszeile |
| Praxic Blade | average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar), Upper Hand | ohne 3L1H der Basiszeile |
| Prometheus Lens | average, with ignition, Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Ruinous Effigy |  | gleiche Annahmen wie die Basiszeile |
| Salvation's Grip |  | ohne average, charged der Basiszeile |
| Salvation's Grip | average, charged, Hail the Storm | Artefakt: Hail the Storm |
| Still Hunt | Cayde's Retribution, all three shots | gleiche Annahmen wie die Basiszeile |
| Still Hunt | Cayde's Retribution, Celestial Nighthawk | Exotic-Rüstung: Celestial Nighthawk |
| Tessellation | Property: Irreducible, Transcendent, Transcendence bonus included | nicht modelliert: Transcendent |
| The Lament | heavy | ohne average, 2L1H1R der Basiszeile |
| The Lament | average, 2L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 2L1H, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 2L1H, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 3L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 3L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 4L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 4L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Queenbreaker | burst, Combat Sights | ohne Marksman Sights der Basiszeile |
| Truth |  | ohne average, Prototype Truthseeker der Basiszeile |
| Wavesplitter | average, power cycling, Detonator Beam | Katalysator: Detonator Beam |
| Wavesplitter | average, Supercharged Battery, Detonator Beam | Katalysator: Detonator Beam |
| Whirling Ovation | full charge | ohne no charge der Basiszeile |
| Whirling Ovation | 2/3 charge | ohne no charge der Basiszeile |
| Whirling Ovation | 1/3 charge | ohne no charge der Basiszeile |
| Witherhoard | ground pool | ohne direct impact der Basiszeile |
| Wolfsbane | Honed Edge, Jagged Edge, Nano-Assault HLLHLLHLLHLLH, Burning Ambition, includes ignition | fremder Perk: Burning Ambition |
| Wolfsbane | average, Honed Edge, Jagged Edge, light, Burning Ambition, includes ignition | fremder Perk: Burning Ambition |
| Worldline Zero | Temporal Sprint, heavy | nicht modelliert: Temporal Sprint |

## Auffällige Annahmen

Ähnliche Schreibweise (Stufe 1) und ohne Beleg eingeordnet (Stufe 5). Bitte prüfen.

| Waffe | Annahme | Einordnung |
| --- | --- | --- |
| Ergo Sum | Transcendent | nicht modelliert, ohne Beleg |
| Finality's Auger | marked | nicht modelliert, ohne Beleg |
| Ice Breaker | shatter ignition | nicht modelliert, ohne Beleg |
| Tessellation | Transcendent | nicht modelliert, ohne Beleg |
| Truth | Prototype Truthseeker | Intrinsic „Prototype Trueseeker“ (ähnliche Schreibweise) |
| Worldline Zero | Temporal Sprint | nicht modelliert, ohne Beleg |

## Kandidaten für neue Effects

Annahmen, die wir noch nicht abbilden, nach Zahl der Waffen.

| Annahme | Art | Waffen |
| --- | --- | --- |
| Transcendent | nicht modelliert | Ergo Sum, Tessellation |
| Burning Ambition | fremder Perk | Wolfsbane |
| Celestial Nighthawk | Exotic-Rüstung | Still Hunt |
| Hail the Storm | Artefakt | Salvation's Grip |
| Harsh Refraction | Artefakt | Ager's Scepter |
| Illegally Modded Holster | Exotic-Rüstung | Eriana's Vow |
| marked | nicht modelliert | Finality's Auger |
| Pack Hunter | fremder Perk | Ergo Sum |
| shatter ignition | nicht modelliert | Ice Breaker |
| Temporal Sprint | nicht modelliert | Worldline Zero |

## Wechselwirkungen

Exotic-Rüstung, deren Intrinsic den Waffentyp nennt, und Abilities, die Intrinsic oder Katalysator der Waffe nennen (ADR 0013, Punkt 4). Kandidaten für E1, noch nicht im Rechner.

| Waffe | Exotic-Rüstung | Abilities |
| --- | --- | --- |
| Ager's Scepter | Cenotaph Mask | super |
| Anarchy | – | grenade |
| Arbalest | Rain of Fire | – |
| Bastion | Rain of Fire | melee |
| Black Talon | Stronghold | – |
| Buried Bloodline | Mechaneer's Tricksleeves | – |
| Choir of One | Actium War Rig | – |
| Coldheart | Cenotaph Mask | – |
| Conditional Finality | No Backup Plans | – |
| Cull's Shadow | Rain of Fire | melee |
| Dead Messenger | – | grenade, super |
| Deathbringer | Hazardous Propulsion | – |
| Delicate Tomb | Rain of Fire | – |
| Deterministic Chaos | Actium War Rig | – |
| Divinity | Cenotaph Mask | – |
| Dragon's Breath | Hazardous Propulsion | – |
| Duality | No Backup Plans | – |
| Edge of Action | Triton Vice | melee |
| Edge of Concurrence | Triton Vice | melee |
| Edge of Intent | Triton Vice | melee |
| Ergo Sum | Stronghold | classAbility, grenade, melee |
| Eriana's Vow | Boots of the Assembler, Lucky Pants | – |
| Euphony | Rain of Fire | – |
| Eyes of Tomorrow | Hazardous Propulsion | grenade |
| Fafnir | Rain of Fire | – |
| Finality's Auger | Rain of Fire | – |
| Forerunner | Mechaneer's Tricksleeves | grenade |
| Gjallarhorn | Hazardous Propulsion | – |
| Grand Overture | Actium War Rig | – |
| Heartshadow | Stronghold | – |
| Heir Apparent | Actium War Rig | – |
| Heirloom | Oathkeeper | – |
| Jötunn | Rain of Fire | – |
| Legend of Acrius | No Backup Plans | – |
| Leviathan's Breath | Oathkeeper | – |
| Lord of Wolves | No Backup Plans | – |
| Lorentz Driver | Rain of Fire | – |
| Merciless | Rain of Fire | – |
| Microcosm | Cenotaph Mask | super |
| Praxic Blade | Stronghold | – |
| Prometheus Lens | Cenotaph Mask | – |
| Ruinous Effigy | Cenotaph Mask | – |
| Service of Luzaku | Actium War Rig | – |
| Slayer's Fang | No Backup Plans | – |
| Sleeper Simulant | Rain of Fire | – |
| Still Hunt | – | super |
| Telesto | Rain of Fire | – |
| Tessellation | Rain of Fire | grenade |
| The Chaperone | No Backup Plans | – |
| The Colony | – | grenade |
| The Fourth Horseman | No Backup Plans | – |
| The Lament | Stronghold | – |
| The Navigator | Cenotaph Mask | – |
| The Prospector | – | grenade |
| The Queenbreaker | Rain of Fire | – |
| The Wardcliff Coil | Hazardous Propulsion | – |
| Thunderlord | Actium War Rig | – |
| Tractor Cannon | No Backup Plans | – |
| Truth | Hazardous Propulsion | – |
| Two-Tailed Fox | Hazardous Propulsion | – |
| Vexcalibur | Triton Vice | – |
| Wavesplitter | Cenotaph Mask | – |
| Whirling Ovation | Hazardous Propulsion | – |
| Winterbite | Triton Vice | – |
| Wolfsbane | Stronghold | – |
| Worldline Zero | Stronghold | – |
| Xenophage | Actium War Rig | – |
