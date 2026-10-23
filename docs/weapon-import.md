# Waffen-Import: Prüftabelle

Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.

Stand: Aegis 2026-10-20, Quantum 2026-10-20 (Quantum nennt keinen Patch pro Zeile), Manifest 245114.26.10.13.2000-1-bnet.66137.

Umfang: exotische Special- und Heavy-Waffen. **136 Pakete**, 5 Lücken.

## Pakete

Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.

| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ace of Spades | handCannon | kinetic | keine (1 Shot) | 96,2 | Quantum |  | 13 | 1,64 s | – | 140 → 140 | 0,6 % | Override: Catalyst verstärkt Firefly, das Precision Kills braucht; gegen einen Boss ohne Adds keine Wirkung.; Timing nur aus Quantum |
| Ager's Scepter | traceRifle | stasis | keine (1 Shot) | 37,2 | Quantum | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 485 Shots, Magazin 194, Zeit bis leer 12,9 s |
| Alethonym | grenadeLauncher | stasis | average (15 Shots) | 872,8 | Quantum |  | 1 | 1,62 s | – | – → 90 | 370,6 % | Override: Quantum hat nur „Passive“ und „Spam“ mit gleichem Timing; „Spam“ ist das schnellste Feuern wie Aegis' „average“. Skala: Aegis zählt Einschlag und Impale-Ticks pro Granate (337 impact, 237 tick), Quantum nur den Einschlag (102); Aegis gilt.; Timing aus Zeile primaries-grenade-launcher-alethonym-spam (Override); Timing nur aus Quantum; Skala weicht um 370.6 % ab; Aegis gilt (Override) |
| Anarchy | grenadeLauncher | arc | average, per trap, double stick, Jolting Feedback (2 Shots) | 2.912,3 | Quantum | 29 | 6 | 2,08 s | 150,0 s | – → 12 | 13.768,3 % | Override: Aegis misst nur mit Katalysator (Jolting Feedback). Quantum ohne ihn: „double-stick“, 84.458 für 29 Granaten = 2912 pro Granate, zwei Fallen kleben, neu schießen, wenn sie auslaufen. Katalysator: Aegis 3368,5 ÷ Quantum 2912 = ×1,157 (Jolt).; Timing aus Zeile heavies-grenade-launcher-anarchy-double-stick (Override); Timing nur aus Quantum; Schaden pro Shot 2.912,3 (Override); Skala weicht um 13768.3 % ab; Aegis gilt (Override) |
| Arbalest | linearFusionRifle | kinetic | keine (1 Shot) | 1.086,1 | Aegis | 21 | 5 | 1,73 s | 24,2 s | – → 56 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by one (5🠚6)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Aegis; Katalysator-Timing: 22 Shots, Magazin 6, Zeit bis leer 24,6 s |
| Bad Juju | pulseRifle | kinetic | burst (1 Shot) | 31,9 | Quantum |  | 31 | 1,16 s | – | 450 → 450 | 0,1 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.446 = 3 × 482); Paket pro Kugel wie Quantums Magazin; Timing nur aus Quantum |
| Bastion | fusionRifle | kinetic | keine (4 Shots) | 1.591,5 | Quantum | 21 | 4 | 1,32 s | 37,4 s | 38 → 39 | 0,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Black Talon | sword | void | light (1 Shot) | 3.141,0 | Aegis | 9 | 9 | 0,00 s | 22,3 s | – → 21 | – | Override: Aegis Sustained zählt Munition (73), der Grundwert gilt pro Combo „2H2L“ (3141): 9 Combos plus ein Heavy in 25,1 s; der letzte Heavy fällt weg. Timing mit Lucent Blades x3 und Argent Blade wie bei Aegis.; Timing aus Zeile black-talon-2h2l-combo-lucent-blades-x3-argent-blade (Override); Timing nur aus Aegis; Schaden pro Shot aus „Base“ der Sustained-Zeile black-talon-2h2l-combo-lucent-blades-x3-argent-blade (Override) |
| Borealis | sniperRifle | void | keine (1 Shot) | 832,4 | Quantum | 20 | 5 | 1,98 s | 19,3 s | 72 → 85 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 20 Shots, Magazin 5, Zeit bis leer 18,7 s |
| Buried Bloodline | sidearm | void | keine (1 Shot) | 322,4 | Quantum | 50 | 11 | 1,02 s | 31,1 s | 100 → 109 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Centrifuse | autoRifle | arc | keine (1 Shot) | 34,3 | Quantum |  | 45 | 0,50 s | – | 450 → 450 | 1,9 % | Timing nur aus Quantum |
| Cerberus+1 | autoRifle | kinetic | point blank (1 Shot) | 92,6 | Quantum |  | 31 | 1,12 s | – | – → 360 | 0,5 % | Override: Aegis misst „point blank“; dazu passt Quantums „normal, close range“ (Precision 93 gegen Aegis 92,6 pro Schuss).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-auto-rifle-cerberus-1-normal-close-range-2 (Override); Timing nur aus Quantum |
| Choir of One | autoRifle | void | projectile - spaced (~9m) (90 Shots) | 692,0 | Aegis | 45 | 5 | 1,02 s | 16,1 s | 225 → 270 | 21,4 % | Override: Aegis misst den Projektil-Modus auf Abstand in zwei Reitern unterschiedlich (Weapons 661,4, Sustained 692); Schaden und Timing aus derselben Sustained-Zeile. Ein Projektil verbraucht 5 Munition (Clarity), Aegis und Quantum zählen Munition: 225 Munition = 45 Projektile, Magazin 25 = 5 (Quantum: 45 × 570 = 25.650 Total Damage). Quantum 570 gegen Aegis 692 pro Projektil; Aegis gilt. Catalyst: man wählt einen von drei Refits (Subsistence, Destabilizing Rounds, Onslaught), alle brauchen Weapon Kills; gegen einen Boss ohne Adds keine Wirkung.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile choir-of-one-projectile-mode-spaced (Override); ⚠ Timing: Aegis 225 Shots in 17,7 s, Quantum 225 Shots in 18,6 s; Aegis gilt; Schaden pro Shot aus „Base“ der Sustained-Zeile choir-of-one-projectile-mode-spaced (Override); Skala weicht um 21.4 % ab; Aegis gilt (Override) |
| Cloudstrike | sniperRifle | arc | average, with lightning strikes (36 Shots) | 664,4 | Quantum | 31 | 7 | 1,68 s | 17,9 s | 140 → 161 | 0,9 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 44 Shots, Magazin 10, Zeit bis leer 23,4 s |
| Coldheart | traceRifle | arc | average, no initial trace (202 Shots) | 35,3 | Quantum | 505 | 101 | 1,44 s | 39,1 s | 900 → 907 | 1,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 505 Shots, Magazin 101, Zeit bis leer 38,5 s |
| Collective Obligation | pulseRifle | void | burst (1 Shot) | 38,8 | Quantum |  | 36 | 1,16 s | – | 390 → 390 | 0,6 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.755 = 3 × 585); Paket pro Kugel wie Quantums Magazin; Timing nur aus Quantum |
| Conditional Finality | shotgun | stasis | average, body, both modes (12 Shots) | 1.422,2 | Quantum | 19 | 2 | 1,06 s | 19,4 s | 165 → 110 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 110 statt 165 rpm |
| Crimson | handCannon | kinetic | burst (1 Shot) | 40,2 | Quantum |  | 24 | 1,64 s | – | 415 → 415 | 1,2 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.821 = 3 × 607); Paket pro Kugel wie Quantums Magazin; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Cryosthesia 77K | sidearm | stasis | keine (1 Shot) | 87,2 | Quantum |  | 12 | 1,03 s | – | 260 → 260 | 0,7 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Cull's Shadow | fusionRifle | kinetic | average, with corruption (6 Shots) | 1.095,8 | Aegis | 24 | 6 | 1,98 s | 27,3 s | – → 56 | 0,0 % | Override: Optimal gespielt mit Corruption, wie Aegis Sustained (Base 1096 = Weapons „average, with corruption“ 1095,8).; Timing aus Zeile cull-s-shadow-with-corruption (Override); Timing nur aus Aegis |
| D.A.R.C.I. | sniperRifle | arc | average, Target Acquired, with spaced jolt (35 Shots) | 824,8 | Quantum | 31 | 7 | 2,00 s | 18,0 s | 140 → 180 | 0,4 % | Aegis misst nur mit Katalysator: Basis = 874,5 ÷ 1,060 (Quantum mit / ohne Katalysator); Timing nur aus Quantum; abgeleitete Feuerrate 180 statt 140 rpm |
| Dead Man's Tale | scoutRifle | kinetic | Vorpal Weapon (1 Shot) | 188,7 | Quantum |  | 14 | 0,33 s | – | 120 → 120 | 19,4 % | Override: Aegis' Mittel enthält Vorpal Weapon und die Cranial-Spike-Stacks (188,7), Quantums „Base“ nicht (158); Aegis gilt. Catalyst aus der Hüfte: +27 % bei x5 Cranial Spike (Clarity), Timing aus Quantums Zeile „cata, x5 Cranial Spike“ (140 rpm, Reload 0,29 s).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-scout-rifle-dead-man-s-tale-base (Override); Timing nur aus Quantum; Skala weicht um 19.4 % ab; Aegis gilt (Override); Katalysator-Timing: ∞ Shots, Magazin 14, Zeit bis leer – |
| Dead Messenger | grenadeLauncher | void | keine (1 Shot) | 1.383,7 | Aegis | 20 | 1 | 1,55 s | 29,5 s | 90 → 39 | 0,0 % | ⚠ Timing: Aegis 20 Shots in 29,5 s, Quantum 20 Shots in 32,4 s; Aegis gilt |
| Deathbringer | rocketLauncher | void | max height (1 Shot) | 3.900,1 | Quantum | 11 | 1 | 2,35 s | 23,5 s | 46 → 60.000 | 0,0 % | Override: Aegis misst „max height“ (3900); dazu passt Quantums „max distance damage“ (3899), nicht „direct impact“. Der Catalyst lässt den Höchstschaden nur 1 s früher erreichen; gemessen wird schon der Höchstschaden: keine Wirkung.; Timing aus Zeile heavies-rocket-launcher-deathbringer-max-distance-damage (Override); Timing nur aus Quantum |
| Delicate Tomb | fusionRifle | arc | hipfire (18 Shots) | 890,4 | Quantum | 26 | 6 | 1,32 s | 32,0 s | 56 → 56 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „Hip-fire“; Timing nur aus Quantum |
| Deterministic Chaos | machineGun | void | average, with volatile damage, excludes weaken (48 Shots) | 126,5 | Quantum | 376 | 48 | 3,57 s | 86,3 s | 360 → 367 | 0,0 % | Override: Catalyst gibt Target Lock; Clarity: ohne Fehlschuss im Mittel etwa +25 % über ein volles Magazin.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „w/o weaken“; Timing nur aus Quantum |
| Devil's Ruin | sidearm | solar | keine (1 Shot) | 78,5 | Quantum |  | 20 | 1,03 s | – | 300 → 300 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Divinity | traceRifle | arc | average, Penance, excludes debuff, Jolting Feedback, Focused Fury (194 Shots) | 15,0 | Quantum | 470 | 194 | 1,44 s | 34,0 s | 900 → 904 | 0,0 % | Override: Aegis misst nur mit beiden Katalysator-Perks (Jolting Feedback, Focused Fury) und Jolt; Quantum „base damage, no buffs“ (mit Penance) gilt: 15 pro Schuss (Precision).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile specials-trace-rifle-divinity-base-damage-no-buffs (Override); Timing nur aus Quantum; Schaden pro Shot 15,0 (Override) |
| Dragon's Breath | rocketLauncher | solar | average, loaded, Composite Propellant x5 (8 Shots) | 3.725,5 | Quantum | 11 | 1 | 2,35 s | 23,5 s | 46 → 60.000 | 0,4 % | Timing nur aus Quantum |
| Duality | shotgun | solar | ADS (1 Shot) | 1.262,2 | Quantum | 15 | 6 | 0,68 s | 12,7 s | – → 74 | 0,1 % | Override: Quantum misst nur mit Katalysator; „cata, slug“ passt zu Aegis' ADS (Precision 1263 gegen 1262). Ohne Katalysator aus Clarity: Magazin 6 statt 8.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing-Zeile specials-shotgun-duality-cata-slug spielt mit Katalysator; ohne ihn aus Clarity zurückgerechnet; Timing nur aus Quantum; Katalysator-Timing: 17 Shots, Magazin 8, Zeit bis leer 14,3 s |
| Edge of Action | glaive | void | projectile (1 Shot) | 482,4 | Quantum | 29 | 6 | 1,57 s | 32,5 s | 55 → 64 | 0,1 % | Timing nur aus Quantum |
| Edge of Concurrence | glaive | arc | projectile (1 Shot) | 420,4 | Quantum | 33 | 7 | 1,57 s | 31,0 s | 80 → 78 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Edge of Intent | glaive | solar | projectile (1 Shot) | 553,8 | Quantum | 31 | 5 | 1,57 s | 50,8 s | 45 → 43 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Ergo Sum | sword | kinetic | Jagged Edge, 64 impact, light (1 Shot) | 3.293,0 | Aegis | 10 | 10 | 0,00 s | 18,4 s | – → 29 | – | Override: Lightweight Frame mit Unplanned Reprieve, 1H2L: Grundwert pro Combo 3293 (Aegis Sustained, ohne den 5 % Transcendence-Bonus: Weapons 3458,1 ÷ 1,05 = 3293), 10 Combos plus ein Heavy in 20,4 s. Pack Hunter gibt nur Handling und Reload neben Verbündeten. Timing mit Lucent Blades x3 und Argent Blade wie bei Aegis.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile ergo-sum-lightweight-frame-unplanned-reprieve-jagged-edge-1h2l-combo-lucent-blades-x3-pack-hunter-transcendent-excludes-transcendence-5-bonus-argent-blade (Override); Timing nur aus Aegis; Schaden pro Shot aus „Base“ der Sustained-Zeile ergo-sum-lightweight-frame-unplanned-reprieve-jagged-edge-1h2l-combo-lucent-blades-x3-pack-hunter-transcendent-excludes-transcendence-5-bonus-argent-blade (Override) |
| Eriana's Vow | handCannon | solar | Death At First Glance (1 Shot) | 491,2 | Quantum | 32 | 6 | 1,66 s | 27,1 s | 90 → 99 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („magazine size by 3 (6🠚9)“); Timing nur aus Quantum; Katalysator-Timing: 35 Shots, Magazin 9, Zeit bis leer 25,6 s |
| Euphony | linearFusionRifle | strand | burst, without threadlings (1 Shot) | 1.317,5 | Quantum | 21 | 6 | 1,32 s | 32,2 s | 42 → 42 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Ex Diris | grenadeLauncher | arc | average, with moth (30 Shots) | 694,9 | Aegis | 35 | 35 | 0,00 s | 22,1 s | – → 92 | 0,0 % | Timing nur aus Aegis |
| Eyes of Tomorrow | rocketLauncher | solar | volley (1 Shot) | 2.703,6 | Quantum | 10 | 1 | 2,35 s | 29,3 s | 72 → 66 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Fafnir | linearFusionRifle | void | keine (1 Shot) | 2.528,4 | Quantum | 9 | 3 | 1,77 s | 16,3 s | – → 38 | 0,0 % | Override: Aegis Sustained zählt 18 Treffer (Detonation und Quantum Nova) für 9 Munition, Magazine 3-3-3, 1,6 s zwischen Schüssen, 16,333 s bis leer. Daraus der Reload: (16,333 − 6 × 1,6) ÷ 2 = 3,37 s nach dem letzten Schuss, also 1,77 s nach dessen Intervall. Grundwert 2528 pro Munition (Base = Weapons-Zeile).; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum |
| Fighting Lion | grenadeLauncher | void | average, with volatile damage (20 Shots) | 612,6 | Quantum |  | 1 | 1,62 s | – | 90 → 90 | 20,5 % | Override: Aegis' Mittel enthält Sekundärschaden und Volatile (388 secondary, 216 volatile), Quantums Einschlag nicht (581); Aegis gilt.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-grenade-launcher-fighting-lion (Override); Timing nur aus Quantum; Skala weicht um 20.5 % ab; Aegis gilt (Override) |
| Final Warning | sidearm | strand | ADS tap fire (1 Shot) | 109,8 | Quantum |  | 20 | 1,12 s | – | 450 → 450 | 0,2 % | Override: Der geladene Burst („ADS charged mark“, 230,5) braucht eine Ladezeit, die keine Quelle misst; Quantums 450 rpm gelten für Tap Fire. Deshalb Tap Fire: Aegis 109,8 = Quantum Precision 110.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-sidearm-final-warning (Override); Timing nur aus Quantum |
| Finality's Auger | linearFusionRifle | solar | Linear Fusion Mode (1 Shot) | 1.277,8 | Aegis | 21 | 6 | 1,80 s | 23,5 s | 58 → 56 | 0,0 % | Override: Aegis Sustained misst 21 Schuss in Magazinen à 6 mit 1800 ms Reload; Bait and Switch (Katalysator) steckt nicht im Grundwert (Sustained 1278 = Weapons 1277,8) und ändert das Timing nicht.; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing aus Zeile finality-s-auger-bait-and-switch-linear-fusion-mode (Override); Timing nur aus Aegis |
| Forerunner | sidearm | kinetic | keine (1 Shot) | 297,9 | Quantum | 70 | 12 | 1,63 s | 27,4 s | 200 → 215 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Gjallarhorn | rocketLauncher | solar | keine (8 Shots) | 1.892,2 | Quantum | 10 | 1 | 2,35 s | 27,0 s | 47 → 93 | 0,9 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 1 (1🠚2)“); Timing nur aus Quantum; Katalysator-Timing: 11 Shots, Magazin 2, Zeit bis leer 18,2 s |
| Grand Overture | machineGun | arc | Missile Loaded, Volley Ready (20 Shots) | 1.059,0 | Aegis | 58 | 58 | 0,00 s | 49,1 s | 100 → 70 | 87,1 % | Override: Optimal gespielt mit Raketen-Salven, wie Aegis Sustained „volleys when available“ (58 Schuss in 49,1 s, Quantum „w/ rockets“ 49 s); Schaden pro Schuss aus derselben Zeile (Mittel aus Kugeln und Raketen).; Timing aus Zeile grand-overture-volleys-when-available (Override); Timing nur aus Aegis; abgeleitete Feuerrate 70 statt 100 rpm; Schaden pro Shot aus „Base“ der Sustained-Zeile grand-overture-volleys-when-available (Override); Skala weicht um 87.1 % ab; Aegis gilt (Override) |
| Graviton Lance | pulseRifle | void | burst, Vorpal Weapon (1 Shot) | 71,0 | Quantum |  | 30 | 1,16 s | – | 300 → 300 | 0,0 % | Override: Aegis misst nur mit Katalysator (Vorpal Weapon); Quantum ohne gilt: 71 pro Kugel (Precision). Der Katalysator gibt Vorpal Weapon, +20 % für Primaries gegen Bosse (Clarity).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-pulse-rifle-graviton-lance (Override); Timing nur aus Quantum; Schaden pro Shot 71,0 (Override) |
| Graviton Spike | handCannon | arc | stasis mode (1 Shot) | 176,6 | Quantum |  | 13 | 1,61 s | – | 150 → 95 | 0,8 % | Override: Aegis misst den Stasis-Modus (176,6); dazu passt Quantums „Stasis mode“ (Precision 178), nicht der Arc-Modus. Stasis macht mehr Schaden pro Sekunde.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-hand-cannon-graviton-spike-stasis-mode (Override); Timing nur aus Quantum; abgeleitete Feuerrate 95 statt 150 rpm |
| Hard Light | autoRifle | void | keine (1 Shot) | 27,6 | Quantum |  | 49 | 1,12 s | – | 600 → 600 | 1,5 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Hawkmoon | handCannon | kinetic | keine (1 Shot) | 96,2 | Quantum |  | 8 | 1,64 s | – | – → 140 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 1 (8🠚9)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 9, Zeit bis leer – |
| Heartshadow | sword | void | heavy, Shot in the Dark, weaken excluded (1 Shot) | 2.754,9 | Quantum | 14 | 14 | 0,00 s | 26,2 s | – → 30 | – | Override: Aegis Sustained misst Heavy-Angriffe mit Catalyst: 63 Munition, 4 pro Heavy (Magazin-Folge 4-4-4), 15 Heavies in 30,24 s = 2,016 s pro Heavy (Peak Rate). Ohne Catalyst 6 Munition weniger (Destinypedia 50 → 56; Gemini 60 → 66, beide +6): 57 Munition = 14 Heavies. Grundwert pro Heavy 2754,9 (Weapons „heavy, Shot in the Dark, weaken excluded“ = Sustained Base 2755); Shot in the Dark ist ein Perk der Waffe. Timing mit Lucent Blades x3 und Argent Blade wie bei Aegis.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum; Katalysator-Timing: 15 Shots, Magazin 15, Zeit bis leer 28,2 s |
| Heir Apparent | machineGun | solar | keine (1 Shot) | 56,1 | Quantum | 440 | 200 | 3,57 s | 36,3 s | 900 → 903 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Heirloom | bow | solar | uncharged (1 Shot) | 855,7 | Aegis | 20 | 20 | 0,00 s | 22,5 s | – → 51 | 0,0 % | Override: Ungeladen wie die Basiszeile (Sustained Base 856 = Weapons 855,7): 20 Pfeile in 22,5 s, Bogen ohne Reload. Timing mit Argent Quiver (Reload Speed) wie bei Aegis.; Timing aus Zeile heirloom-uncharged-argent-quiver (Override); Timing nur aus Aegis |
| Hierarchy of Needs | bow | solar | average, one ring (6 Shots) | 916,8 | Quantum |  | 1 | 0,60 s | – | 44 → 44 | 0,0 % | Override: Catalyst: Guidance Ring und Treffer der Seeker halbieren 5 s lang die Draw Time; bei Dauerfeuer auf einen Boss immer aktiv. Timing aus Quantums „Guidance Ring, cata“ (61 statt 44 rpm).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-bow-hierarchy-of-needs (Override); Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 1, Zeit bis leer – |
| Ice Breaker | sniperRifle | solar | keine (1 Shot) | 1.223,4 | Aegis | 10 | 10 | 0,00 s | 11,1 s | 49 → 49 | 0,0 % | Override: Aegis Sustained misst 10 Schuss ohne Reload (Ice Breaker hat keine Reserves); Sniper's Meditation (Artifact) steckt nicht im Grundwert (Sustained 1223 = Weapons 1223,4).; Timing aus Zeile ice-breaker-sniper-s-meditation (Override); Timing nur aus Aegis |
| Izanagi's Burden | sniperRifle | kinetic | keine (1 Shot) | 658,5 | Quantum | 20 | 4 | 1,98 s | 17,9 s | 90 → 114 | 0,1 % | Override: Catalyst: Honed Edge x4 +20 % (Clarity). Optimal gespielt schießt man damit Honed-Edge-Schüsse: Quantum „cata, 4x Honed Edge“ 14.910 gegen 13.180 normal, je 20 Shots, also ×1,131 pro Shot; Timing aus derselben Zeile (Reload 3,2 s).; Timing aus Zeile specials-sniper-rifle-izanagi-s-burden (Override); Timing nur aus Quantum; abgeleitete Feuerrate 114 statt 90 rpm; Katalysator-Timing: 20 Shots, Magazin 4, Zeit bis leer 22,8 s |
| Jötunn | fusionRifle | solar | average, successive shots (10 Shots) | 1.048,3 | Aegis | 24 | 5 | 2,07 s | 31,7 s | – → 49 | 0,0 % | Override: Cornered braucht 2 Gegner in der Nähe, Incandescent Kills; gegen einen Boss ohne Adds keine Wirkung.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Aegis |
| Khvostov 7G-0X | autoRifle | kinetic | average, with ricochetting bullets (7 Shots) | 41,4 | Quantum |  | 43 | 1,12 s | – | 600 → 600 | 1,5 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Le Monarque | bow | void | average, with poison (15 Shots) | 394,1 | Quantum |  | 1 | 0,60 s | – | 50 → 50 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 1, Zeit bis leer – |
| Legend of Acrius | shotgun | arc | body (1 Shot) | 1.990,4 | Quantum | 14 | 4 | 0,43 s | 18,8 s | – → 44 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 2 (4🠚6)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: 16 Shots, Magazin 6, Zeit bis leer 21,1 s |
| Leviathan's Breath | bow | void | keine (6 Shots) | 2.170,1 | Quantum | 9 | 1 | 0,60 s | 17,4 s | 31 → 38 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 14 Shots, Magazin 1, Zeit bis leer 18,9 s |
| Lodestar | traceRifle | arc | hipfire (1 Shot) | 24,3 | Quantum |  | 75 | 1,16 s | – | 900 → 900 | 2,7 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Lord of Wolves | shotgun | solar | average, includes ignition/scorch (120 Shots) | 186,1 | Quantum | 189 | 30 | 0,92 s | 22,6 s | 640 → 660 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „ADS“; Timing nur aus Quantum; Katalysator-Timing: 189 Shots, Magazin 30, Zeit bis leer 21,3 s |
| Lorentz Driver | linearFusionRifle | void | keine (1 Shot) | 1.086,1 | Quantum | 21 | 6 | 1,32 s | 23,7 s | 58 → 61 | 0,0 % | Timing nur aus Quantum |
| Lumina | handCannon | kinetic | keine (1 Shot) | 96,2 | Quantum |  | 13 | 1,64 s | – | 140 → 140 | 0,6 % | Timing nur aus Quantum |
| Malfeasance | handCannon | kinetic | average, with slugs (5 Shots) | 156,1 | Quantum |  | 20 | 1,64 s | – | 180 → 180 | – | Override: Aegis' Mittel enthält die Slug-Explosionen (280 slug), Quantums Kugel nicht (86); Aegis gilt.; Aegis misst nur mit Katalysator: Basis = 186,9 ÷ 1,198 (Quantum mit / ohne Katalysator); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-hand-cannon-malfeasance (Override); Timing nur aus Quantum |
| Merciless | fusionRifle | solar | Conserve Momentum x15, full mag (1 Shot) | 1.166,0 | Aegis | 19 | 8 | 1,32 s | 12,6 s | 39 → 97 | 1,0 % | Override: Aegis' Weapons-Zeilen messen ein ganzes Magazin als einen Shot („full mag“); Schaden pro Bolzen und Timing aus Sustained (Base 1166, Quantum 1155).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile merciless (Override); ⚠ Timing: Aegis 19 Shots in 12,6 s, Quantum 19 Shots in 13,8 s; Aegis gilt; abgeleitete Feuerrate 97 statt 39 rpm; Schaden pro Shot aus „Base“ der Sustained-Zeile merciless (Override) |
| Microcosm | traceRifle | kinetic | keine (1 Shot) | 82,8 | Aegis | 385 | 120 | 1,12 s | 28,9 s | 900 → 896 | 0,1 % | Override: Der Bonus wirkt nur gegen Ziele unter 30 % Leben; der Rechner führt kein Boss-Leben, Annahme: keine Wirkung.; Timing aus Aegis-Zeile mit Harsh Refraction (laut Text ohne Einfluss auf das Timing); Timing: Aegis und Quantum stimmen überein |
| MIDA Multi-Tool | scoutRifle | kinetic | keine (1 Shot) | 73,8 | Quantum |  | 16 | 1,24 s | – | 200 → 200 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Monte Carlo | autoRifle | kinetic | keine (1 Shot) | 27,6 | Quantum |  | 44 | 1,12 s | – | 600 → 600 | 1,5 % | Override: Der Bajonett-Stich braucht volle Markov-Chain-Stacks, die nur Kills geben; gegen einen Boss ohne Adds keine Wirkung.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Necrochasm | autoRifle | kinetic | keine (1 Shot) | 23,4 | Quantum |  | 50 | 1,16 s | – | 720 → 720 | 1,5 % | Timing nur aus Quantum |
| New Land Beyond | sniperRifle | kinetic | no stacks (20 Shots) | 1.029,0 | Quantum | 40 | 8 | 1,98 s | 72,7 s | 32 → 36 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „The Master 0x“; Timing nur aus Quantum |
| New Malpais | pulseRifle | strand | average, 3 bursts, includes suspend, excludes unravel (3 Shots) | 1.159,9 | Aegis | 27 | 7 | 1,38 s | 24,7 s | – → 67 | 0,0 % | Timing nur aus Aegis |
| No Time to Explain | pulseRifle | kinetic | burst (1 Shot) | 123,1 | Quantum |  | 24 | 1,16 s | – | 340 → 340 | 0,1 % | ⚠ Timing aus der Quantum-Zeile „w/ Time-Slip Portal,cata“ mit Katalysator; Timing nur aus Quantum |
| One Thousand Voices | fusionRifle | solar | average (4 Shots) | 2.180,0 | Quantum | 11 | 4 | 1,25 s | 20,7 s | 33 → 33 | 0,0 % | Override: Der Text nennt Scorch pro Explosion; ein Shot hat 9 Explosionen à x10, also x90 pro Shot.; Scorch: x90 pro Shot („inflicting x10+5 Scorch“, Override); Shot aus Quantum ohne Ignitions („Does not consider Scorch; without ignition“): 23.980 ÷ 11; Ignitions ×1,316 („Solar Effects that are initially applied by One Thousand Voices deal 31.6% increased damage“); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Skala: Shot aus Quantum, keine Prüfung gegen Aegis (Aegis zählt Ignitions mit) |
| Osteo Striga | submachineGun | kinetic | average, with successive poison (136 Shots) | 61,9 | Quantum |  | 29 | 1,19 s | – | 600 → 600 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 29, Zeit bis leer – |
| Outbreak Perfected | pulseRifle | kinetic | average per burst - max nanites (26 Shots) | 80,0 | Quantum |  | 36 | 1,16 s | – | 450 → 450 | 0,0 % | Override: Konflikt ohne klare Einheit: Aegis' Werte pro Burst liegen schon ohne Nanites beim Vierfachen von Quantum (398,1 ÷ 3 = 133 gegen 32 pro Kugel). Quantum nennt seine Annahme klar (4 Nanites alle 12 Schuss) und gilt deshalb: 80 pro Kugel (Precision). Catalyst: Nanites +25 % (Clarity); von 80 sind 48 Nanites (Quantum ohne Nanites 32): 32 + 48 × 1,25 = 92, also ×1,15.; Timing aus Zeile primaries-pulse-rifle-outbreak-perfected-x4-nanites (Override); Timing nur aus Quantum; Schaden pro Shot 80,0 (Override) |
| Parasite | grenadeLauncher | solar | keine (1 Shot) | 2.133,4 | Quantum | 18 | 1 | 2,08 s | 35,4 s | 120 → 25.500 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Polaris Lance | scoutRifle | solar | average, with ignition (15 Shots) | 169,7 | Quantum |  | 14 | 1,24 s | – | 150 → 150 | 0,3 % | Timing nur aus Quantum |
| Prometheus Lens | traceRifle | solar | average, with ignition (95 Shots) | 36,5 | Quantum | 500 | 100 | 1,44 s | 39,0 s | – → 900 | – | Override: Keine Timing-Zeile. Manifest: Magazin 100. Quantum misst Trace Rifles mit 1000 rpm laut Manifest durchweg mit 900 rpm und Reload 1,44 s; Special-Traces tragen 5 Magazine (Ruinous Effigy 94 → 470, The Navigator 97 → 485, Coldheart 101 → 505, Wavesplitter 100 → 500), also 500 Schuss. Aegis' Wert pro Schuss enthält die Ignitions („average, with ignition“). Catalyst: Stabilität, Handling und Kill-Explosionen, gegen einen Boss ohne Adds keine Wirkung.; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum |
| Quicksilver Storm | autoRifle | kinetic | average, with tracking rockets (14 Shots) | 27,8 | Quantum |  | 51 | 1,10 s | – | 720 → 720 | 1,5 % | Timing nur aus Quantum |
| Rat King | sidearm | kinetic | keine (1 Shot) | 78,5 | Quantum |  | 15 | 1,03 s | – | 300 → 300 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Red Death Reformed | pulseRifle | solar | burst, undamaged (1 Shot) | 41,0 | Quantum |  | 30 | 1,12 s | – | 340 → 340 | 0,1 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.857 = 3 × 619); Paket pro Kugel wie Quantums Magazin; Timing nur aus Quantum |
| Revision Zero | pulseRifle | kinetic | burst - heavy 2-burst mode, Vorpal Weapon (1 Shot) | 76,2 | Quantum |  | 26 | 1,16 s | – | 450 → 324 | 17,4 % | Override: Aegis misst den schweren 2er-Burst mit Vorpal Weapon (wipe 2298 = 2 × 1149); pro Kugel 76,2 gegen Quantum 64 ohne Vorpal (×1,15 = 73,6); Aegis gilt. Catalyst: von vier Refits ist Fourth Time's The Charm der einzige, der am Boss wirkt (4 Precision Hits laden 2 Schuss nach); Timing aus Quantums „2-burst, mix, FTTC“ (Magazin 50 statt 26).; Aegis misst einen Burst aus 2 Kugeln (Override); Paket pro Kugel; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-pulse-rifle-revision-zero-2-burst (Override); Timing nur aus Quantum; abgeleitete Feuerrate 324 statt 450 rpm; Skala weicht um 17.4 % ab; Aegis gilt (Override); Katalysator-Timing: ∞ Shots, Magazin 50, Zeit bis leer – |
| Riskrunner | submachineGun | arc | keine (1 Shot) | 27,0 | Quantum |  | 47 | 1,19 s | – | 900 → 900 | 3,4 % | Override: Aegis 27,0 gegen Quantum 28 (3,4 %); Aegis gilt.; Timing aus Zeile primaries-submachine-gun-riskrunner (Override); Timing nur aus Quantum; Skala weicht um 3.4 % ab; Aegis gilt (Override) |
| Ruinous Effigy | traceRifle | void | keine (1 Shot) | 40,1 | Quantum | 470 | 94 | 1,44 s | 36,8 s | 900 → 907 | 0,4 % | Timing nur aus Quantum |
| Salvation's Grip | grenadeLauncher | stasis | keine (1 Shot) | 794,9 | Aegis | 25 | 8 | 2,12 s | 19,3 s | – → 97 | 0,0 % | Override: Ungeladen ist optimal (mehr Schaden pro Sekunde als geladen); Aegis Sustained „uncharged“ (Base 795 = Weapons 794,9).; Timing aus Zeile salvation-s-grip-uncharged (Override); Timing nur aus Aegis |
| Service of Luzaku | machineGun | strand | keine (1 Shot) | 156,7 | Quantum | 300 | 47 | 3,57 s | 70,3 s | 360 → 367 | 0,2 % | Timing nur aus Quantum |
| Skyburner's Oath | scoutRifle | solar | ADS, Cabal (1 Shot) | 114,3 | Quantum |  | 20 | 1,24 s | – | 150 → 150 | 31,2 % | Override: ADS ohne Ignitions: Aegis 114,3 = Quantum „ADS“ 116 (1,5 %); „Cabal“ ändert diesen Wert also nicht.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-scout-rifle-skyburner-s-oath-ads (Override); Timing nur aus Quantum; Skala weicht um 31.2 % ab; Aegis gilt (Override) |
| Slayer's Fang | shotgun | void | average, includes submunitions, Nightsworn ticks include weaken (9 Shots) | 1.048,6 | Quantum | 27 | 10 | 1,41 s | 23,4 s | 70 → 76 | 0,0 % | herausgerechnet: Weaken ×1,150 (wirkt nur, wenn der Build ihn hat); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Sleeper Simulant | linearFusionRifle | solar | keine (1 Shot) | 2.328,5 | Aegis | 14 | 4 | 2,05 s | 22,3 s | – → 37 | 0,0 % | Override: Aegis und Quantum messen nur mit Katalysator (16 Schuss, kürzere Charge Time). Ohne Katalysator: 14 Schuss und 250 ms längere Charge Time pro Schuss.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Aegis; Katalysator-Timing: 16 Shots, Magazin 4, Zeit bis leer 22,5 s |
| Still Hunt | sniperRifle | solar | keine (1 Shot) | 658,5 | Quantum | 20 | 6 | 1,98 s | 31,8 s | 90 → 44 | 0,1 % | Override: Lucky Shot braucht einen Precision Kill; gegen einen Boss ohne Adds keine Wirkung.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 44 statt 90 rpm |
| Sturm | handCannon | kinetic | keine (1 Shot) | 114,5 | Quantum |  | 9 | 1,60 s | – | 120 → 120 | 0,2 % | Override: Handling und Range ändern den Boss-Schaden nicht, Helping Hands braucht Kills.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Sunshot | handCannon | solar | keine (1 Shot) | 86,6 | Quantum |  | 12 | 1,64 s | – | 150 → 150 | 0,8 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| SUROS Regime | autoRifle | kinetic | average, Spinning Up (36 Shots) | 26,8 | Quantum |  | 34 | 1,12 s | – | – → 712 | 0,1 % | Override: Optimal gespielt: Spinning Up macht mehr Schaden pro Sekunde (26,8 × 712 rpm) als Dual Speed Receiver (41,3 × 400 rpm); Timing aus Quantums Zeile desselben Modus.; Timing aus Zeile primaries-auto-rifle-suros-regime-spinning-up (Override); Timing nur aus Quantum |
| Sweet Business | autoRifle | kinetic | average, with explosive rounds (150 Shots) | 32,6 | Quantum |  | 150 | 2,00 s | – | 856 → 856 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing aus der Quantum-Zeile „average per mag“; Timing nur aus Quantum |
| Symmetry | scoutRifle | arc | keine (1 Shot) | 61,0 | Quantum |  | 20 | 0,99 s | – | 260 → 260 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 20, Zeit bis leer – |
| Tarrabah | submachineGun | solar | keine (1 Shot) | 33,9 | Quantum |  | 35 | 1,19 s | – | 720 → 720 | 0,4 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Telesto | fusionRifle | void | keine (7 Shots) | 1.094,6 | Quantum | 16 | 4 | 1,32 s | 24,7 s | – → 43 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 3 (4🠚7)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: 19 Shots, Magazin 7, Zeit bis leer 27,5 s |
| Tessellation | fusionRifle | kinetic | Property: Irreducible (1 Shot) | 2.557,6 | Aegis | 22 | 6 | 4,57 s | 70,8 s | – → 19 | 10,2 % | Override: Schaden aus Weapons „Property: Irreducible“ (2557,6, ohne Transcendent); Timing aus Aegis Sustained (22 Schuss, 4567 ms Reload, volle Granaten-Energie).; Timing aus Zeile tessellation-full-grenade-uptime-property-irreducible-transcendent-but-excludes-5-simulated (Override); Timing nur aus Aegis; Skala weicht um 10.2 % ab; Aegis gilt (Override) |
| The Chaperone | shotgun | kinetic | keine (1 Shot) | 748,6 | Quantum | 18 | 6 | 0,43 s | 20,7 s | 70 → 51 | 0,1 % | Override: Catalyst: 3 Precision Hits laden 1 Schuss aus dem Nichts nach, nicht über das Grundmagazin (Clarity). Mit Slug-Precision: Munition 18 × 1,5 = 27, ein Magazin reicht für 6 + 2 + 1 = 9 Schuss.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile specials-shotgun-the-chaperone (Override); Timing nur aus Quantum; abgeleitete Feuerrate 51 statt 70 rpm; Katalysator-Timing: 27 Shots, Magazin 9, Zeit bis leer 31,2 s |
| The Colony | grenadeLauncher | void | direct impact (1 Shot) | 833,8 | Aegis | 24 | 7 | 2,05 s | 14,8 s | – → 139 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 1 (7🠚8)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Aegis; Katalysator-Timing: 25 Shots, Magazin 8, Zeit bis leer 15,2 s |
| The Fourth Horseman | shotgun | arc | body, full mag (1 Shot) | 1.049,4 | Quantum | 20 | 4 | 0,43 s | 12,2 s | 300 → 109 | 55,2 % | Override: Aegis misst ein ganzes Magazin als einen Shot („full mag“, vier Werte 3085/3578/4102/4655); pro Schuss 4197,6 ÷ 4 = 1049,4. Quantum (612 body) zählt den Anstieg pro Schuss nicht; Aegis gilt.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 109 statt 300 rpm; Schaden pro Shot 1.049,4 (Override); Skala weicht um 55.2 % ab; Aegis gilt (Override); Katalysator-Timing: 20 Shots, Magazin 5, Zeit bis leer 11,7 s |
| The Jade Rabbit | scoutRifle | kinetic | keine (1 Shot) | 96,6 | Quantum |  | 15 | 1,24 s | – | 150 → 150 | 0,4 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing nur aus Quantum |
| The Lament | sword | solar | average, 2L1H1R (6 Shots) | 4.561,0 | Aegis | 13 | 13 | 0,00 s | 37,4 s | – → 19 | – | Override: Aegis Sustained zählt Munition (65), der Grundwert gilt pro Combo „2L1H1R“ (Base 4561 = Weapons „average, 2L1H1R“ 4560,9): 13 Combos in 40,5 s. Timing mit Lucent Blades x3 und Argent Blade (Charge Rate) wie bei Aegis; ihr Schaden steckt nicht im Grundwert.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile the-lament-2l1h1r-combo-lucent-blades-x3-argent-blade (Override); Timing nur aus Aegis; Schaden pro Shot aus „Base“ der Sustained-Zeile the-lament-2l1h1r-combo-lucent-blades-x3-argent-blade (Override) |
| The Last Word | handCannon | kinetic | hipfire (1 Shot) | 175,5 | Quantum |  | 8 | 1,64 s | – | 225 → 225 | 0,2 % | Override: Nachladen und Buffs brauchen Kills; gegen einen Boss ohne Adds keine Wirkung.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| The Manticore | submachineGun | void | average, Hover Mode (104 Shots) | 41,9 | Quantum |  | 42 | 1,19 s | – | 900 → 900 | 2,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „Grounded“; Timing nur aus Quantum |
| The Navigator | traceRifle | strand | keine (1 Shot) | 28,6 | Quantum | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| The Prospector | grenadeLauncher | arc | average, direct impact, standard target model (18 Shots) | 1.035,2 | Aegis | 30 | 6 | 2,08 s | 17,9 s | – → 157 | 0,0 % | Override: Aegis Sustained misst mit derselben Ausführung wie die Basiszeile (Base 1035 = Weapons 1035,2); Quantum hat nur Zeilen mit Katalysator.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile the-prospector-typical-boss-model-arc-compounding-kinetic-impacts (Override); Timing nur aus Aegis |
| The Queenbreaker | linearFusionRifle | arc | burst, Combat Sights (1 Shot) | 1.966,5 | Aegis | 21 | 5 | 2,28 s | 29,3 s | – → 48 | 0,0 % | Override: Optimal gespielt: Combat Sights macht mehr Gesamtschaden (Quantum 41.328 gegen 31.626). Aegis Sustained misst mit Rewind Rounds (Katalysator, Magazin 11); ohne ihn Magazin 5 wie bei Quantum.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing-Zeile the-queenbreaker-rewind-rounds-combat-sights spielt mit Katalysator; ohne ihn Magazin 5 (Override); Timing nur aus Aegis; Katalysator-Timing: 21 Shots, Magazin 11, Zeit bis leer 26,3 s |
| The Wardcliff Coil | rocketLauncher | arc | average, volley, excludes Bolt Charge (1 Shot) | 2.403,2 | Quantum | 8 | 1 | 2,35 s | 21,4 s | 86 → 85 | 0,1 % | Timing nur aus Quantum |
| Third Iteration | scoutRifle | void | precision (1 Shot) | 112,6 | Quantum |  | 16 | 3,41 s | – | 200 → 200 | 0,4 % | Override: Die Explosion braucht Precision Kills; gegen einen Boss ohne Adds keine Wirkung.; Timing aus der Quantum-Zeile „Base“; Timing nur aus Quantum |
| Thorn | handCannon | kinetic | average, with poison (9 Shots) | 135,2 | Quantum |  | 9 | 1,64 s | – | 140 → 140 | 0,4 % | Timing nur aus Quantum |
| Thunderlord | machineGun | arc | average, with lightning strikes, excludes Bolt Charge (127 Shots) | 113,9 | Quantum | 379 | 62 | 3,57 s | 57,6 s | 617 → 627 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 379 Shots, Magazin 379, Zeit bis leer 32,5 s |
| Ticuu's Divination | bow | solar | average, alternating modes, 6 stacks (12 Shots) | 367,3 | Quantum |  | 1 | 0,60 s | – | 51 → 51 | 0,3 % | Override: Catalyst: x6 Causality Quiver +87 % Impact (Clarity); Quantum „cata, x6 Causality Arrows“ 391 gegen 209 Precision = ×1,871, passt zu Clarity.; Timing nur aus Quantum |
| Tommy's Matchbook | autoRifle | solar | average, with ignition (100 Shots) | 57,2 | Quantum |  | 100 | 0,93 s | – | 720 → 720 | 49,9 % | Override: Aegis' Mittel enthält den Ramp-up und die Ignitions (154/91 ramped, 2345 ignition); Aegis gilt.; Timing aus Zeile primaries-auto-rifle-tommy-s-matchbook (Override); Timing nur aus Quantum; Skala weicht um 49.9 % ab; Aegis gilt (Override) |
| Touch of Malice | scoutRifle | kinetic | keine (1 Shot) | 141,5 | Quantum |  | 11 | 1,24 s | – | 260 → 260 | 0,4 % | Override: Optimal gespielt mit der letzten Patrone (Touch of Malice): Aegis nennt sie „2135 final“ bei 920 für eine normale Kugel; pro Shot 2135 ÷ 15,09 (full modifiers) = 141,5. Quantum bestätigt: 142 („always at 1 round“). Katalysator: Precision Instrument erreicht nach 6 Treffern +25 %; die letzte Patrone feuert ohne Reload, die Stacks bleiben (Clarity), also ×1,25.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-scout-rifle-touch-of-malice-touch-of-malice-tom (Override); Timing nur aus Quantum; Schaden pro Shot 141,5 (Override) |
| Tractor Cannon | shotgun | void | body (6 Shots) | 522,5 | Quantum | 15 | 4 | 1,47 s | 13,7 s | 80 → 91 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 3 (4🠚7)“); Timing nur aus Quantum; Katalysator-Timing: 18 Shots, Magazin 7, Zeit bis leer 14,2 s |
| Traveler's Chosen | sidearm | kinetic | keine (1 Shot) | 78,5 | Quantum |  | 15 | 1,03 s | – | – → 300 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 2 (15🠚17)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 17, Zeit bis leer – |
| Trespasser | sidearm | arc | keine (1 Shot) | 50,6 | Quantum |  | 30 | 1,03 s | – | 491 → 491 | 0,9 % | Aegis misst einen Burst aus 3 Kugeln (wipe 2.289 = 3 × 763); Paket pro Kugel wie Quantums Magazin; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Trinity Ghoul | bow | arc | keine (1 Shot) | 218,7 | Quantum |  | 1 | 0,60 s | – | – → 44 | 0,2 % | Override: Quantum misst nur mit Catalyst. Der Catalyst senkt die Draw Time von 756 auf 633 ms (Clarity): ohne ihn 0,123 s mehr pro Pfeil.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-bow-trinity-ghoul-cata (Override); Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 1, Zeit bis leer – |
| Truth | rocketLauncher | void | average, Prototype Truthseeker (9 Shots) | 2.179,3 | Quantum | 20 | 3 | 2,35 s | 17,4 s | 47 → 345 | 0,1 % | Timing nur aus Quantum; abgeleitete Feuerrate 345 statt 47 rpm |
| Turncoat | handCannon | void | average (12 Shots) | 127,4 | Quantum |  | 13 | 1,64 s | – | – → 140 | – | Override: Keine Timing-Zeile. Manifest: 140 rpm, Magazin 13. Reload 1,64 s wie bei Quantum für jede Hand Cannon mit 140 rpm (Ace of Spades, Lumina, Thorn, Hawkmoon); Quantum rechnet den Reload pro Waffentyp, unabhängig vom Reload-Stat. Schaden aus Aegis „average“.; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum |
| Two-Tailed Fox | rocketLauncher | void | average (2 Shots) | 2.340,0 | Quantum | 10 | 1 | 2,35 s | 24,1 s | 40 → 183 | 36,4 % | Scorch: x60 pro Shot („inflicts x60+30 Scorch“); Shot aus Quantum ohne Ignitions („Does not consider scorch; does not consider ignitions“): 23.400 ÷ 10; Timing nur aus Quantum; Skala: Shot aus Quantum, keine Prüfung gegen Aegis (Aegis zählt Ignitions mit) |
| Verglas Curve | bow | stasis | keine (1 Shot) | 208,7 | Quantum |  | 1 | 0,60 s | – | 51 → 51 | 0,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Vex Mythoclast | fusionRifle | solar | keine (1 Shot) | 93,4 | Quantum |  | 25 | 1,12 s | – | 400 → 400 | 17,4 % | Override: Aegis 93,4 gegen Quantum 113 (Quantum ohne Linear-Schüsse, Ursache offen); Aegis gilt.; Timing aus Zeile primaries-fusion-rifle-vex-mythoclast (Override); Timing nur aus Quantum; Skala weicht um 17.4 % ab; Aegis gilt (Override) |
| Vexcalibur | glaive | void | projectile (1 Shot) | 573,2 | Quantum | 33 | 6 | 1,57 s | 28,1 s | 80 → 95 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Vigilance Wing | pulseRifle | kinetic | burst (1 Shot) | 34,5 | Quantum |  | 50 | 1,16 s | – | 530 → 530 | 1,4 % | Aegis misst einen Burst aus 5 Kugeln (wipe 2.605 = 5 × 521); Paket pro Kugel wie Quantums Magazin; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Wavesplitter | traceRifle | void | average, power cycling, Detonator Beam (100 Shots) | 39,0 | Quantum | 500 | 100 | 1,44 s | 38,8 s | 900 → 906 | 0,0 % | Override: Aegis misst nur mit Katalysator (Detonator Beam); Quantum „average“ gilt: 39 pro Schuss (Precision).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile specials-trace-rifle-wavesplitter-average (Override); Timing nur aus Quantum; Schaden pro Shot 39,0 (Override) |
| Whirling Ovation | rocketLauncher | strand | full charge (1 Shot) | 6.344,3 | Aegis | 7 | 7 | 0,00 s | 41,9 s | – → 9 | 0,0 % | Override: Optimal voll geladen (Sustained Base 6344 = Weapons „full charge“ 6344,3): 7 Raketen in 41,9 s. Timing mit Argent Ordnance (Reload Speed) wie bei Aegis.; Timing aus Zeile whirling-ovation-no-anticipation-fully-charged-argent-ordnance (Override); Timing nur aus Aegis |
| Whisper of the Worm | sniperRifle | solar | keine (1 Shot) | 849,9 | Quantum | 38 | 38 | 1,98 s | 31,7 s | 72 → 70 | 0,0 % | Aegis misst nur mit Katalysator: Basis = 1.250,9 ÷ 1,472 (Quantum mit / ohne Katalysator); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing nur aus Quantum |
| Wicked Implement | scoutRifle | stasis | average, with manual shatters (60 Shots) | 93,3 | Quantum |  | 20 | 1,24 s | – | 260 → 260 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Winterbite | glaive | stasis | average, projectile, with shatter (18 Shots) | 1.469,0 | Aegis | 17 | 4 | 1,50 s | 24,0 s | 45 → 40 | 0,0 % | ⚠ Timing: Aegis 17 Shots in 24,0 s, Quantum 18 Shots in 23,9 s; Aegis gilt |
| Wish-Ender | bow | kinetic | keine (1 Shot) | 522,9 | Quantum |  | 1 | 0,60 s | – | 43 → 43 | 64,2 % | Override: Aegis' Mittel 522,9 entspricht Quantums Precision 523; die Skala-Prüfung über den Einzeltreffer passt nicht, weil Aegis Pierce und Seeker mitzählt.; Timing aus Zeile primaries-bow-wish-ender (Override); Timing nur aus Quantum; Skala weicht um 64.2 % ab; Aegis gilt (Override) |
| Wish-Keeper | bow | strand | Vorpal Weapon (1 Shot) | 213,8 | Quantum |  | 1 | 0,60 s | – | 50 → 50 | 0,1 % | Override: Aegis misst mit dem Katalysator Vorpal Weapon (+20 % für Primaries laut Clarity): 256,5 ÷ 1,2 = 213,75; Quantum ohne Katalysator bestätigt 214. Der Katalysator gibt ×1,2.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-bow-wish-keeper (Override); Timing nur aus Quantum; Schaden pro Shot 213,8 (Override) |
| Witherhoard | grenadeLauncher | kinetic | direct impact (1 Shot) | 2.046,1 | Quantum | 20 | 1 | 1,62 s | 90,0 s | – → 19 | 0,6 % | Override: Aegis' „direct impact“ zählt die volle Blight pro Schuss; dazu passt Quantums „passive“ (neu schießen, wenn die Blight ausläuft: 20 × 2046 = 40.920 gegen Quantum 41.180). Mit Katalysator lädt die Waffe weggesteckt nach (Quantum „cata, single blight, boss“, 50 s).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile specials-grenade-launcher-witherhoard-passive (Override); Timing nur aus Quantum; Katalysator-Timing: 20 Shots, Magazin 1, Zeit bis leer 50,0 s |
| Xenophage | machineGun | solar | keine (1 Shot) | 736,4 | Aegis | 39 | 13 | 2,82 s | 23,6 s | 120 → 120 | 0,1 % | Override: Die Rampage-Stacks des Katalysators kommen nur aus Weapon Kills; der Absatz mit dem Bonus nennt das Wort „Kill“ nicht, deshalb hier von Hand: keine Wirkung gegen einen Boss ohne Adds.; ⚠ Timing: Aegis 39 Shots in 23,6 s, Quantum 29 Shots in 20,1 s; Aegis gilt |

## Optionen

Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.

| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |
| --- | --- | --- | --- | --- | --- | --- |
| Ager's Scepter | ⚠ Catalyst | Katalysator | ×1,763 | – | While at full Super Energy, Hold [Reload] to activate Will Given Form. | Faktor aus Quantum (cata / ohne) |
| Anarchy | Catalyst | Katalysator | ×1,157 | – | – | Faktor aus dem Text (Override) |
| D.A.R.C.I. | ⚠ Networked Targeting x5 | Katalysator | ×1,060 | – | – | keine Dauer im Compendium gefunden |
| Dead Man's Tale | Catalyst | Katalysator | ×1,270 | – | – | Faktor aus dem Text (Override) |
| Deterministic Chaos | Catalyst | Katalysator | ×1,250 | – | – | Faktor aus dem Text (Override) |
| Devil's Ruin | ⚠ Pyrogenesis | Perk | ×0,269 | – | Charged Laser applies 20 Scorch (30 with Ember of Ashes) for every hit and triggers an Ignition on every kill. | – |
| Graviton Lance | Catalyst | Katalysator | ×1,200 | – | – | Faktor aus dem Text (Override) |
| Izanagi's Burden | Catalyst | Katalysator | ×1,131 | – | – | Faktor aus dem Text (Override) |
| Malfeasance | Vorpal Weapon | Katalysator | ×1,198 | – | – | – |
| One Thousand Voices | catalyst | Katalysator | ×1,454 | – | – | – |
| Outbreak Perfected | Catalyst | Katalysator | ×1,150 | – | – | Faktor aus dem Text (Override) |
| Ruinous Effigy | ⚠ Catalyst | Katalysator | ×1,293 | 7 s | Kills, or damaging Champions, Minibosses, or Bosses, with your Transmutation Sphere (inconsistently) grants 30% [15%] increased weapon damage for 7 seconds. | Faktor aus Quantum (cata / ohne) |
| The Lament | ⚠ Burning Ambition | Katalysator | ×1,113 | – | Direct Hits against Scorched Enemies apply additional Scorch on a 0.5 second cooldown: | – |
| Ticuu's Divination | Catalyst | Katalysator | ×1,871 | – | – | Faktor aus dem Text (Override) |
| Touch of Malice | Catalyst | Katalysator | ×1,250 | – | – | Faktor aus dem Text (Override) |
| Truth | ⚠ Reaper's Tithe x4 | Katalysator | ×1,400 | 15 s | Grants stacks of 'Reaper's Tithe' based on the number of simultaneously killed enemies. Maximum of 4 stacks. (e.g. triple kill ⇒ 3 stacks) | Faktor aus Einzeltreffern; Mittelwert pro Shot wäre ×1,448 (9 gegen 12 Shots) |
| Vex Mythoclast | ⚠ Temporal Unlimiter | Perk | ×12,503 | – | Kills in Auto Rifle mode grant 'Overcharge' stacks. Maximum of 6 Stacks. | – |
| Vex Mythoclast | ⚠ Catalyst | Katalysator | ×1,204 | 5 s | Landing 15 hits within 3 seconds of each, or scoring a kill, grants 20% increased damage, 20 Stability, and 20% reduced Accuracy Cone Size for 5 seconds. | Faktor aus Quantum (cata / ohne) |
| Whisper of the Worm | ⚠ Whispered Breathing | Katalysator | ×1,472 | 1 s | – | – |
| Wish-Keeper | Catalyst | Katalysator | ×1,200 | – | – | Faktor aus dem Text (Override) |

## Katalysatoren

Was der Katalysator gegen einen Boss tut, entscheiden die Quellen: **Schaden** (Option mit Faktor), **Timing** (Zeile mit Katalysator, gleiche Quelle und Ausführung, sonst Zahlen aus Clarity), **keine** (gemessen ohne Unterschied oder kein Schaden und Timing im Text), **unbekannt** (Clarity nennt Schaden oder Timing, keine Quelle misst es).

| Waffe | Munition | Wirkung | Timing ohne → mit | Text (Anfang) |
| --- | --- | --- | --- | --- |
| Ace of Spades | primary | keine | – | Firefly's explosion damage is increased by 50% while Memento Mori is active. |
| Ager's Scepter | special | Schaden und Timing | Magazin 97 → 194, Shots 485 → 485, Zeit bis leer 37,8 → 12,9 s, rpm 906 → 2.898 | While at full Super Energy, Hold [Reload] to activate Will Given Form. |
| Alethonym | primary | keine | – | Grants the One For All trait: |
| Anarchy | heavy | Schaden | – | Scoring 3 hits within 3 seconds of each causes the next damage instance to apply Jolt. |
| Arbalest | special | Timing | Magazin 5 → 6, Shots 21 → 22, Zeit bis leer 24,2 → 24,6 s, rpm 56 → 56 | Passively grants: |
| Bad Juju | primary | keine | – | String of Curses's maximum duration is increased by 2 seconds (5.5🠚7.5). |
| Bastion | special | unbekannt | – | Dealing Melee Damage refills 20% of the Magazine (rounded up) and grants ? Handling for ? seconds. |
| Black Talon | heavy | keine | – | Due to an unresolved bug, this catalyst does not function. |
| Borealis | special | Timing | Magazin 5 → 5, Shots 20 → 20, Zeit bis leer 19,3 → 18,7 s, rpm 85 → 85 | Passively grants 20 Reload Speed. |
| Buried Bloodline | special | unbekannt | – | While Devour is active, grants the following benefits: |
| Centrifuse | primary | keine | – | While you are Amplified, Overcharge Capacitor will continuously build at a rate of 7% charge per second and no longer pa |
| Cerberus+1 | primary | keine | – | Holding [Reload] within 7 seconds of scoring a kill grants the following benefits for 7 seconds: |
| Choir of One | special | keine | – | Grants the Subsistence trait: |
| Cloudstrike | special | Timing | Magazin 7 → 10, Shots 31 → 44, Zeit bis leer 17,9 → 23,4 s, rpm 161 → 155 | Passively grants 25 Handling. |
| Coldheart | special | Timing | Magazin 101 → 101, Shots 505 → 505, Zeit bis leer 39,1 → 38,5 s, rpm 907 → 907 | Passively grants 20 Stability and 20 Reload Speed. |
| Collective Obligation | primary | keine | – | – |
| Conditional Finality | special | keine | – | Finishing a reload within 5.3? seconds of a Kill grants Cure x2 to you and Cure x1 to allies within 15 meters. |
| Crimson | primary | keine | – | Passively grants 20 Range. |
| Cryosthesia 77K | primary | keine | – | Shattering a Frozen enemy instantly refills the magazine. |
| D.A.R.C.I. | heavy | Schaden | – | Passively grants 20 Stability. |
| Dead Man's Tale | primary | Schaden und Timing | Magazin 14 → 14, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 120 → 140 | While not Aiming Down Sights: |
| Dead Messenger | special | keine | – | Grants the Turnabout trait: |
| Deathbringer | heavy | keine | – | The initial Orb Damage is increased by 63%, allowing maximum damage to be reached 1 second sooner. |
| Delicate Tomb | special | keine | – | Picking up Ionic Traces refill 4 ammo from reserves. |
| Deterministic Chaos | heavy | Schaden | – | Successive Hits within 0.2 seconds of each grant a ramping Damage Buff after scoring 12.5% of the Magazine Capacity as h |
| Devil's Ruin | primary | keine | – | Elemental Pickup Interactions grant 30% [10%] increased damage for a variable duration based on the pickup. Can be activ |
| Divinity | special | unbekannt | – | Scoring 18 hits within 3 seconds of each causes the next hit to apply Jolt. Being Amplified decreases the number of hits |
| Dragon's Breath | heavy | keine | – | Doubles the rate of passive Composite Propellant generation (6🠚3 Seconds per stack). |
| Duality | special | Timing | Magazin 6 → 8, Shots 15 → 17, Zeit bis leer 12,7 → 14,3 s, rpm 74 → 74 | Grants 20 Range and increases Magazine Size by 2 (6🠚8) |
| Edge of Action | special | keine | – | Kills against Void Debuffed enemies grant a 45 HP Void Overshield for 8 seconds (12 with Echo of Persistence). |
| Edge of Concurrence | special | unbekannt | – | Grants the following after sprinting for 1.5 seconds with the weapon readied: |
| Edge of Intent | special | keine | – | Finishing a reload within 5.3? seconds of a Kill grants Cure x2 to you and Cure x1 to allies within 15 meters. |
| Ergo Sum | special | unbekannt | – | Generates 3 [1] ammo from thin air upon dealing damage with your Prismatic grenade. |
| Eriana's Vow | special | Timing | Magazin 6 → 9, Shots 32 → 35, Zeit bis leer 27,1 → 25,6 s, rpm 99 → 99 | Increases the magazine size by 3 (6🠚9). |
| Euphony | special | unbekannt | – | Weapon Hits grant Stacks of Enlightened Action for 2 seconds. Maximum of 12 Stacks. |
| Ex Diris | special | keine | – | Weapon Kills grant Amplified for 15 seconds. |
| Eyes of Tomorrow | heavy | unbekannt | – | Dealing damage grants a stack of 'Blast Distributor' for 5 seconds, increasing your Grenade Stat by 10 per stack. Maximu |
| Fafnir | heavy | keine | – | Grants 35% Flinch Resistance after 1 second of Aiming Down Sights (ADS) without firing. Remains active until you're no l |
| Fighting Lion | primary | unbekannt | – | Grants 30 Reload Speed. |
| Final Warning | primary | unbekannt | – | Grants 10% increased damage to marked targets. Minibosses and Bosses only receive 5% more damage. |
| Finality's Auger | heavy | unbekannt | – | Grants the Bait and Switch trait: |
| Forerunner | special | keine | – | Holding [Reload] within 4 seconds of a kill consumes 4 ammo, refills the magazine, and grants 'The Rock'. |
| Gjallarhorn | heavy | Timing | Magazin 1 → 2, Shots 10 → 11, Zeit bis leer 27,0 → 18,2 s, rpm 93 → 93 | Increases Magazine Size by 1 (1🠚2). |
| Grand Overture | heavy | keine | – | Grants 20 Handling and 20 Stability. |
| Graviton Lance | primary | Schaden | – | Grants 20 Range. |
| Graviton Spike | primary | unbekannt | – | Grants 20% increased damage for 16 seconds upon activating both Arc and Stasis Overcharge one after another. |
| Hard Light | primary | unbekannt | – | Grants 25 Stability. |
| Hawkmoon | primary | Timing | Magazin 8 → 9, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 140 → 140 | Increases Magazine Size by 1 (8🠚9). |
| Heartshadow | heavy | Timing | Magazin 14 → 15, Shots 14 → 15, Zeit bis leer 26,2 → 28,2 s, rpm 30 → 30 | Increases reserves by 6 (57🠚63). |
| Heir Apparent | heavy | keine | – | Arc Shield gains 75% [25%] Damage Resistance. |
| Heirloom | special | keine | – | Scorch and Ignitions that originate from this weapon deal 5% increased damage. |
| Hierarchy of Needs | primary | Timing | Magazin 1 → 1, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 44 → 61 | Deploying a Guidance Ring or Guidance Seeker Hits grants the following benefits for 5 seconds: |
| Izanagi's Burden | special | Schaden und Timing | Magazin 4 → 4, Shots 20 → 20, Zeit bis leer 17,9 → 22,8 s, rpm 114 → 114 | Increases the damage bonus of Honed Edge x4 by 20%, granting the following values: |
| Jötunn | special | keine | – | Grants the Cornered trait: |
| Khvostov 7G-0X | primary | keine | – | Scoring 25 Hits against enemies within 5 seconds of each spawns an Orb of Power that grants 🡅0.8% Super Energy. |
| Le Monarque | primary | Timing | Magazin 1 → 1, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 50 → 50 | Grants 20 Reload Speed and 30 Stability. |
| Legend of Acrius | heavy | Timing | Magazin 4 → 6, Shots 14 → 16, Zeit bis leer 18,8 → 21,1 s, rpm 44 → 44 | Grants 40 Reload Speed, 50 Ammo Generation, and increases Magazine Size by 2 (4🠚6). |
| Leviathan's Breath | heavy | Timing | Magazin 1 → 1, Shots 9 → 14, Zeit bis leer 17,4 → 18,9 s, rpm 38 → 70 | Increases Reserves by 5 (9🠚14) and Ammo Generation by 80. |
| Lodestar | primary | unbekannt | – | While Amplified: |
| Lord of Wolves | special | Timing | Magazin 30 → 30, Shots 189 → 189, Zeit bis leer 22,6 → 21,3 s, rpm 660 → 660 | Grants 20 Stability, 60 Reload Speed, and 15% decreased Reload Animation Duration. |
| Lumina | primary | keine | – | Kills create an additional Remnant (1🠚2). |
| Malfeasance | primary | Schaden | – | Grants 20 Range. |
| Merciless | special | keine | – | Grants 40 Range and 40 Stability. |
| Microcosm | heavy | keine | – | Weapon Kills grant an additional 1% Super Energy. |
| MIDA Multi-Tool | primary | unbekannt | – | While within 15 meters of an enemy, grants an Enhanced Radar, 20 Reload Speed, and 15% decreased Reload Animation Durati |
| Monte Carlo | primary | keine | – | Hold [Reload] while at maximum Markov Chain stacks to lock the bayonet. |
| Necrochasm | primary | keine | – | Damaging 3 enemies within 3 seconds of each other grants the following benefits for 10 seconds: |
| New Land Beyond | special | unbekannt | – | While above 20 stacks of The Master, Bullseye Bolster duration is increased by ? seconds and the magazine is refilled on |
| New Malpais | special | unbekannt | – | Embedded projectiles Unravel targets for 8 seconds upon detonation. |
| No Time to Explain | primary | keine | – | Delay between Time-Slip Portal bursts is 47% shorter (1.25/s🠚0.85/s). |
| One Thousand Voices | heavy | Schaden | – | I gain 30 Stability and 20 Ammo Generation. |
| Osteo Striga | primary | Timing | Magazin 29 → 29, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 600 → 600 | Grants 30 Reload and 20 Stability. |
| Outbreak Perfected | primary | Schaden | – | Nanite Damage is increased by 25%. |
| Parasite | heavy | unbekannt | – | Dealing any damage with both of your other weapons refills the magazine from reserves upon readying the weapon. |
| Polaris Lance | primary | keine | – | Precision Kills cause targets to explode, dealing up to 123.89 [95.3] weapon-matching elemental damage in a 4.5-meter ra |
| Prometheus Lens | special | keine | – | Grants 20 Stability and 20 Handling. |
| Quicksilver Storm | primary | unbekannt | – | Converts this weapon's element into Strand damage. |
| Rat King | primary | keine | – | Grants 20 Aim Assist and 20 Recoil Direction. |
| Red Death Reformed | primary | keine | – | Scoring 2 [1] kills grants 'Red Death Charged'. |
| Revision Zero | primary | Timing | Magazin 26 → 50, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 324 → 324 | Grants the Under Pressure trait: |
| Riskrunner | primary | keine | – | Grants 30 Range. |
| Ruinous Effigy | special | Schaden | – | Kills, or damaging Champions, Minibosses, or Bosses, with your Transmutation Sphere (inconsistently) grants 30% [15%] in |
| Salvation's Grip | heavy | keine | – | Killing Frozen Enemies or Shattering a Stasis Crystal with the weapon grants a Stack of Frost Armor. |
| Service of Luzaku | heavy | keine | – | Teeming Nests can be harvested into a collectible Tangle after spawning 6 Threadlings. This destroys the nest. |
| Skyburner's Oath | primary | unbekannt | – | Grants 20 Reload Speed. |
| Slayer's Fang | special | unbekannt | – | Grants the Stats For All trait: |
| Sleeper Simulant | heavy | Timing | Magazin 4 → 4, Shots 14 → 16, Zeit bis leer 22,3 → 22,5 s, rpm 37 → 44 | Increases Reserves by 2 (14🠚16) and decreases Charge Time by 33% (1024🠚774) without reducing damage. |
| Still Hunt | special | keine | – | Finishing a reload within ? seconds of a Precision Kill grants 'Lucky Shot Ready'. |
| Sturm | primary | keine | – | Grants 40 Handling and 20 Range. |
| Sunshot | primary | unbekannt | – | Grants 30 Range and 20 Stability. |
| SUROS Regime | primary | keine | – | Grants 50 Recoil Direction and doubles the healing chance (25%🠚50%). |
| Sweet Business | primary | keine | – | Grants 25% increased Flinch Resistance while at maximum Rate of Fire. |
| Symmetry | primary | Timing | Magazin 20 → 20, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 260 → 260 | Grants 10 Reload Speed and 10 Handling. |
| Tarrabah | primary | keine | – | Reloading after scoring kills with Tarrabah overfills the magazine from reserves based on the number of Kills scored. |
| Telesto | special | Timing | Magazin 4 → 7, Shots 16 → 19, Zeit bis leer 24,7 → 27,5 s, rpm 43 → 43 | Increases the Magazine Size by 3 (4🠚7) and grants 40 Ammo Generation. |
| Tessellation | special | unbekannt | – | Your explosive [projectile \| shape \| language] inherents subclass debuffs based on its element. |
| The Chaperone | special | Timing | Magazin 6 → 9, Shots 18 → 27, Zeit bis leer 20,7 → 31,2 s, rpm 51 → 51 | Scoring 3 Precision Hits within 2 seconds of each refills 1 Ammo into the Magazine from thin air. |
| The Colony | heavy | Timing | Magazin 7 → 8, Shots 24 → 25, Zeit bis leer 14,8 → 15,2 s, rpm 139 → 139 | Increases Magazine Size by 1 (7🠚8) and grants 30 Ammo Generation. |
| The Fourth Horseman | special | Timing | Magazin 4 → 5, Shots 20 → 20, Zeit bis leer 12,2 → 11,7 s, rpm 109 → 105 | Grants 40 Reload Speed and Increases Magazine Size by 1 (4🠚5) |
| The Jade Rabbit | primary | unbekannt | – | Grants 30 Stability. |
| The Lament | heavy | Schaden | – | Direct Hits against Scorched Enemies apply 20 additional Scorch (30 with Ember of Ashes) on a 0.5 second cooldown |
| The Last Word | primary | keine | – | Upon readying the weapon after scoring kills with your other Weapons: |
| The Manticore | primary | keine | – | While airborne, any kill or 5 hits against an Elite, Miniboss, or Boss refills 12 ammo and grants a 15HP Void Overshield |
| The Navigator | special | keine | – | Hold [Reload] to activate Grapple Tangle mode. |
| The Prospector | heavy | unbekannt | – | Grants 40 Blast Radius and 50 Reload Speed. |
| The Queenbreaker | heavy | Timing | Magazin 5 → 11, Shots 21 → 21, Zeit bis leer 29,3 → 26,3 s, rpm 48 → 48 | Grants the Rewind Rounds trait: |
| The Wardcliff Coil | heavy | keine | – | Grants some tracking to the rockets I guess? |
| Third Iteration | primary | keine | – | Precision Kills with Amalgamation Rounds trigger an explosion dealing 145 [?] damage in a 5 meter radius, while also app |
| Thorn | primary | keine | – | Passively grants 15 Range, 5 Stability, and 5 Airborne Effectiveness. |
| Thunderlord | heavy | Timing | Magazin 62 → 379, Shots 379 → 379, Zeit bis leer 57,6 → 32,5 s, rpm 627 → 698 | Triggering a Lightning Strike refills 5 ammo from reserves. |
| Ticuu's Divination | primary | Schaden | – | Triggering Sacred Flame explosions grants one stack of 'Causality Quiver' for 5.5 seconds. Marking enemies with Sacred F |
| Tommy's Matchbook | primary | keine | – | While Ignition Trigger is active, kills grant 60 HP (Cure x1) and every 5th shot applies 15 [10] Scorch. Ember of Ashes  |
| Touch of Malice | primary | Schaden | – | Direct Weapon Hits grant a stack of Precision Instrument for 1.25 seconds. Maximum of 6 stacks. Reloading the weapon or  |
| Tractor Cannon | heavy | Timing | Magazin 4 → 7, Shots 15 → 18, Zeit bis leer 13,7 → 14,2 s, rpm 91 → 91 | Increases Magazine Size by 3 (4🠚7) and grants 50 Ammo Generation. |
| Traveler's Chosen | primary | Timing | Magazin 15 → 17, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 300 → 300 | Increases Magazine Size by 2 (15🠚17) |
| Trespasser | primary | keine | – | Grants the Tunnel Vision trait: |
| Trinity Ghoul | primary | Timing | Magazin 1 → 1, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 44 → 48 | Decreases Draw Time by 15% (756ms🠚633ms). |
| Truth | heavy | Schaden | – | Grants stacks of 'Reaper's Tithe' based on the number of simultaneously killed enemies. Maximum of 4 stacks. (e.g. tripl |
| Turncoat | primary | keine | – | Upon exiting Void Empowerment, gain a Void Overshield for 10 seconds (15 with Echo of Persistence). |
| Verglas Curve | primary | unbekannt | – | Applying Freeze or Slow to a target decreases Draw Time by 35% (567ms🠚368ms) for ? seconds. |
| Vex Mythoclast | primary | Schaden | – | Landing 15 hits within 3 seconds of each, or scoring a kill, grants 20% increased damage, 20 Stability, and 20% reduced  |
| Vexcalibur | special | unbekannt | – | Grants the Grave Robber trait: |
| Vigilance Wing | primary | keine | – | Grants the Ensemble trait: |
| Wavesplitter | special | keine | – | Grants 10 Range and 30 Ammo Generation. |
| Whirling Ovation | heavy | keine | – | Fully charged rockets overpenetrate through Minor and Elite combatants, leaving a Solar Grenade behind at each combatant |
| Whisper of the Worm | heavy | Schaden | – | Grants 30 Reload Speed. |
| Wicked Implement | primary | keine | – | Stasis Shards grant 7 ammo on pickup that can overfill the magazine, up to 100% capacity. |
| Winterbite | heavy | keine | – | Killing Frozen Enemies or Shattering a Stasis Crystal with the weapon grants a Stack of Frost Armor. |
| Wish-Ender | primary | keine | – | Scoring Weapon Hits against 3 Separate Enemies within 3 seconds of each grants 35% increased damage for 10 seconds. Does |
| Wish-Keeper | primary | Schaden | – | Increases Snareweaver Trap duration by 10 seconds (15🠚25). |
| Witherhoard | special | Timing | Magazin 1 → 1, Shots 20 → 20, Zeit bis leer 90,0 → 50,0 s, rpm 19 → 59 | Grants 40 Handling. |
| Xenophage | heavy | keine | – | Weapon Kills grant a Stack of Rampage. Maximum of 3 Stacks. Stacks expire one at a time every 🡅4.5 seconds. |

## Lücken

| Waffe | Typ | Grund |
| --- | --- | --- |
| Barrow-Dyad | submachineGun | keine Aegis-Zeile ohne fremde Annahmen |
| Praxic Blade | sword | kein Timing: keine Quantum-Zeile |
| The Huckleberry | submachineGun | keine Aegis-Zeile ohne fremde Annahmen |
| Wolfsbane | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Worldline Zero | sword | keine Aegis-Zeile ohne fremde Annahmen |

## Nicht genutzte Aegis-Zeilen

| Waffe | Annahmen | Grund |
| --- | --- | --- |
| Ager's Scepter | average, Will Given Form | Katalysator: Will Given Form |
| Ager's Scepter | average, Will Given Form, Harsh Refraction | Katalysator: Will Given Form; Artefakt: Harsh Refraction |
| Barrow-Dyad | average, Taken Ambition, with Blighted Seekers, Peacekeepers, Target Lock | Exotic-Rüstung: Peacekeepers; fremder Perk: Target Lock |
| Barrow-Dyad | average, Taken Ambition, with Blighted Seekers, Target Lock | fremder Perk: Target Lock |
| Black Talon | single projectile | ohne light der Basiszeile |
| Choir of One | hitscan | ohne projectile - spaced (~9m) der Basiszeile |
| Choir of One | projectile - point blank | ohne projectile - spaced (~9m) der Basiszeile |
| Cull's Shadow |  | ohne average, with corruption der Basiszeile |
| Cull's Shadow | with corruption | ohne average der Basiszeile |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt, first mag | Katalysator: Networked Targeting x5 |
| Delicate Tomb | ADS | ohne hipfire der Basiszeile |
| Deterministic Chaos | average, with volatile damage, excludes weaken, Target Lock, single mag | Katalysator: Target Lock |
| Devil's Ruin | Pyrogenesis, Collective Action | Katalysator-Zeile mit kleinerem Wert (×0,350): anderer Modus |
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
| Final Warning | ADS charged mark | ohne ADS tap fire der Basiszeile |
| Finality's Auger | Ruinscribe Turret Mode, marked, entire turret duration | nicht modelliert: marked |
| Forerunner | The Rock, excludes impact | Katalysator: The Rock |
| Grand Overture |  | ohne Missile Loaded, Volley Ready der Basiszeile |
| Graviton Spike | arc mode | ohne stasis mode der Basiszeile |
| Graviton Spike | average, overcharging both modes, typical boss model, Temporal Alignment | nicht modelliert: Temporal Alignment |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag, pre-stacked using heavy burst | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Heartshadow | light | ohne heavy, Shot in the Dark, weaken excluded der Basiszeile |
| Heirloom | average, 1/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, 2/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, fully charged, with ignition, catalyst | Katalysator: catalyst |
| Hierarchy of Needs | average, 2 rings, fireteam scaling | nicht modelliert: 2 rings; nicht modelliert: fireteam scaling |
| Ice Breaker | shatter ignition, includes shatter and frozen bonuses | nicht modelliert: shatter ignition |
| Izanagi's Burden | Honed Edge x4 | gleiche Annahmen wie die Basiszeile |
| Lodestar | ADS, burst | ohne hipfire der Basiszeile |
| Lord of Wolves | average, includes ignition/scorch, Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Malfeasance | Illegally Modded Holster, 17 shots, with slugs, blighted, Vorpal Weapon | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: blighted; Katalysator: Vorpal Weapon |
| Malfeasance | Illegally Modded Holster, 17 shots, with slugs, Vorpal Weapon | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); Katalysator: Vorpal Weapon |
| Merciless | Conserve Momentum x0, full mag | ohne Conserve Momentum x15 der Basiszeile |
| One Thousand Voices | average, Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| One Thousand Voices | average, Ember of Ashes, catalyst | Katalysator: catalyst |
| One Thousand Voices | average, blighted, catalyst | nicht modelliert: blighted; Katalysator: catalyst |
| One Thousand Voices | average, Ember of Ashes, blighted, catalyst | nicht modelliert: blighted; Katalysator: catalyst |
| Osteo Striga | average, with successive poison, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Outbreak Perfected | average per burst - no nanites, Appended Mag, up to Rewind end | nicht modelliert: up to Rewind end |
| Polaris Lance | average, with ignitions, Ember of Ashes | ohne with ignition der Basiszeile |
| Praxic Blade | average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar), Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Praxic Blade | average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar) | gleiche Annahmen wie die Basiszeile |
| Praxic Blade | average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar) | ohne 3L1H der Basiszeile |
| Praxic Blade | average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar), Upper Hand | ohne 3L1H der Basiszeile |
| Prometheus Lens | average, with ignition, Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Quicksilver Storm | Grenades Prepped | nicht modelliert: Grenades Prepped |
| Revision Zero | Hunter's Trace, Vorpal Weapon, includes shockwave | ohne burst - heavy 2-burst mode der Basiszeile |
| Revision Zero | burst - light 4-burst mode, Vorpal Weapon | ohne burst - heavy 2-burst mode der Basiszeile |
| Riskrunner | Arc Conductor, no chains | nicht modelliert: no chains |
| Riskrunner | average, Arc Conductor, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Ruinous Effigy |  | gleiche Annahmen wie die Basiszeile |
| Salvation's Grip | average, charged | gleiche Annahmen wie die Basiszeile |
| Salvation's Grip | average, charged, Hail the Storm | Artefakt: Hail the Storm |
| Skyburner's Oath | average, hipfire, with ignitions, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Skyburner's Oath | average, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Still Hunt | Cayde's Retribution, all three shots | gleiche Annahmen wie die Basiszeile |
| Still Hunt | Cayde's Retribution, Celestial Nighthawk | Exotic-Rüstung: Celestial Nighthawk |
| SUROS Regime | average, Dual Speed Receiver | ohne Spinning Up der Basiszeile |
| Symmetry | Arc Seeker Mode, Dynamic Charge x10 | gleiche Annahmen wie die Basiszeile |
| Symmetry | Arc Seeker Mode, Dynamic Charge x20 | gleiche Annahmen wie die Basiszeile |
| Tarrabah | Ravenous Beast | gleiche Annahmen wie die Basiszeile |
| Tarrabah | average, Ravenous Beast, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Tessellation | Property: Irreducible, Transcendent, Transcendence bonus included | nicht modelliert: Transcendent |
| Tessellation |  | ohne Property: Irreducible der Basiszeile |
| The Huckleberry | average, Bull Rider | nicht modelliert: Bull Rider |
| The Huckleberry | average, Bull Rider, Peacekeepers | nicht modelliert: Bull Rider; Exotic-Rüstung: Peacekeepers |
| The Jade Rabbit | Fated Missile x15 | nicht modelliert: Fated Missile x15 |
| The Lament | heavy | ohne average, 2L1H1R der Basiszeile |
| The Lament | average, 2L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 2L1H, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 2L1H, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 3L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 3L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 4L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 4L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Last Word | Illegally Modded Holster, hipfire, 1 mag, Envious Assassin | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: 1 mag; Katalysator: Envious Assassin |
| The Last Word | Illegally Modded Holster, hipfire, 1 mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: 1 mag |
| The Manticore | average, Hover Mode, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| The Queenbreaker | Marksman Sights | ohne burst, Combat Sights der Basiszeile |
| Third Iteration | Amalgamation Round | ohne precision der Basiszeile |
| Thorn | Illegally Modded Holster, with poison, Soul Devourer, 14 shots | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Touch of Malice | blight | nicht modelliert: blight |
| Truth |  | ohne average, Prototype Truthseeker der Basiszeile |
| Turncoat | Overwhelming Power | nicht modelliert: Overwhelming Power |
| Wavesplitter | average, Supercharged Battery, Detonator Beam | Katalysator: Detonator Beam |
| Whirling Ovation | no charge | ohne full charge der Basiszeile |
| Whirling Ovation | 2/3 charge | ohne full charge der Basiszeile |
| Whirling Ovation | 1/3 charge | ohne full charge der Basiszeile |
| Witherhoard | ground pool | ohne direct impact der Basiszeile |
| Wolfsbane | Honed Edge, Jagged Edge, Nano-Assault HLLHLLHLLHLLH, Burning Ambition, includes ignition | fremder Perk: Burning Ambition |
| Wolfsbane | average, Honed Edge, Jagged Edge, light, Burning Ambition, includes ignition | fremder Perk: Burning Ambition |
| Worldline Zero | Temporal Sprint, heavy | nicht modelliert: Temporal Sprint |

## Auffällige Annahmen

Ähnliche Schreibweise (Stufe 1) und ohne Beleg eingeordnet (Stufe 5). Bitte prüfen.

| Waffe | Annahme | Einordnung |
| --- | --- | --- |
| Ergo Sum | Transcendent | nicht modelliert, ohne Beleg |
| Final Warning | ADS tap fire | nicht modelliert, ohne Beleg |
| Finality's Auger | marked | nicht modelliert, ohne Beleg |
| Graviton Spike | Temporal Alignment | nicht modelliert, ohne Beleg |
| Hierarchy of Needs | 2 rings | nicht modelliert, ohne Beleg |
| Hierarchy of Needs | fireteam scaling | nicht modelliert, ohne Beleg |
| Ice Breaker | shatter ignition | nicht modelliert, ohne Beleg |
| Malfeasance | blighted | nicht modelliert, ohne Beleg |
| One Thousand Voices | blighted | nicht modelliert, ohne Beleg |
| Outbreak Perfected | up to Rewind end | nicht modelliert, ohne Beleg |
| Quicksilver Storm | Grenades Prepped | nicht modelliert, ohne Beleg |
| Riskrunner | no chains | nicht modelliert, ohne Beleg |
| Skyburner's Oath | Cabal | nicht modelliert, ohne Beleg |
| Tessellation | Transcendent | nicht modelliert, ohne Beleg |
| The Huckleberry | Bull Rider | nicht modelliert, ohne Beleg |
| The Jade Rabbit | Fated Missile x15 | nicht modelliert, ohne Beleg |
| The Last Word | 1 mag | nicht modelliert, ohne Beleg |
| Third Iteration | Amalgamation Round | Perk „Amalgamation Rounds“ (ähnliche Schreibweise) |
| Touch of Malice | blight | nicht modelliert, ohne Beleg |
| Truth | Prototype Truthseeker | Intrinsic „Prototype Trueseeker“ (ähnliche Schreibweise) |
| Turncoat | Overwhelming Power | nicht modelliert, ohne Beleg |
| Worldline Zero | Temporal Sprint | nicht modelliert, ohne Beleg |

## Kandidaten für neue Effects

Annahmen, die wir noch nicht abbilden, nach Zahl der Waffen.

| Annahme | Art | Waffen |
| --- | --- | --- |
| Peacekeepers | Exotic-Rüstung | Barrow-Dyad, Osteo Striga, Riskrunner, Tarrabah, The Huckleberry, The Manticore |
| Illegally Modded Holster | Exotic-Rüstung | Eriana's Vow, Hawkmoon, Malfeasance, The Last Word, Thorn |
| blighted | nicht modelliert | Malfeasance, One Thousand Voices |
| Burning Ambition | fremder Perk | Skyburner's Oath, Wolfsbane |
| Transcendent | nicht modelliert | Ergo Sum, Tessellation |
| 1 mag | nicht modelliert | The Last Word |
| 2 rings | nicht modelliert | Hierarchy of Needs |
| ADS tap fire | nicht modelliert | Final Warning |
| blight | nicht modelliert | Touch of Malice |
| Bull Rider | nicht modelliert | The Huckleberry |
| Cabal | nicht modelliert | Skyburner's Oath |
| Celestial Nighthawk | Exotic-Rüstung | Still Hunt |
| Fated Missile | nicht modelliert | The Jade Rabbit |
| fireteam scaling | nicht modelliert | Hierarchy of Needs |
| Grenades Prepped | nicht modelliert | Quicksilver Storm |
| Hail the Storm | Artefakt | Salvation's Grip |
| Harsh Refraction | Artefakt | Ager's Scepter |
| marked | nicht modelliert | Finality's Auger |
| no chains | nicht modelliert | Riskrunner |
| Overwhelming Power | nicht modelliert | Turncoat |
| Pack Hunter | fremder Perk | Ergo Sum |
| shatter ignition | nicht modelliert | Ice Breaker |
| Target Lock | fremder Perk | Barrow-Dyad |
| Temporal Alignment | nicht modelliert | Graviton Spike |
| Temporal Sprint | nicht modelliert | Worldline Zero |
| up to Rewind end | nicht modelliert | Outbreak Perfected |
| Vorpal Weapon | fremder Perk | Wish-Keeper |

## Wechselwirkungen

Exotic-Rüstung, deren Intrinsic den Waffentyp nennt, und Abilities, die Intrinsic oder Katalysator der Waffe nennen (ADR 0013, Punkt 4). Kandidaten für E1, noch nicht im Rechner.

| Waffe | Exotic-Rüstung | Abilities |
| --- | --- | --- |
| Ace of Spades | Boots of the Assembler, Lucky Pants | – |
| Ager's Scepter | Cenotaph Mask | super |
| Anarchy | – | grenade |
| Arbalest | Rain of Fire | – |
| Bad Juju | – | super |
| Barrow-Dyad | Peacekeepers | – |
| Bastion | Rain of Fire | melee |
| Black Talon | Stronghold | – |
| Buried Bloodline | Mechaneer's Tricksleeves | – |
| Centrifuse | Actium War Rig | – |
| Cerberus+1 | Actium War Rig | – |
| Choir of One | Actium War Rig | – |
| Coldheart | Cenotaph Mask | – |
| Conditional Finality | No Backup Plans | – |
| Crimson | Boots of the Assembler, Lucky Pants | – |
| Cryosthesia 77K | Mechaneer's Tricksleeves | – |
| Cull's Shadow | Rain of Fire | melee |
| Dead Messenger | – | grenade, super |
| Deathbringer | Hazardous Propulsion | – |
| Delicate Tomb | Rain of Fire | – |
| Deterministic Chaos | Actium War Rig | – |
| Devil's Ruin | Mechaneer's Tricksleeves | – |
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
| Fighting Lion | – | grenade |
| Final Warning | Mechaneer's Tricksleeves | – |
| Finality's Auger | Rain of Fire | – |
| Forerunner | Mechaneer's Tricksleeves | grenade |
| Gjallarhorn | Hazardous Propulsion | – |
| Grand Overture | Actium War Rig | – |
| Graviton Lance | – | super |
| Graviton Spike | Boots of the Assembler, Lucky Pants | – |
| Hard Light | Actium War Rig | – |
| Hawkmoon | Boots of the Assembler, Lucky Pants | – |
| Heartshadow | Stronghold | – |
| Heir Apparent | Actium War Rig | – |
| Heirloom | Oathkeeper | – |
| Hierarchy of Needs | Oathkeeper | – |
| Jötunn | Rain of Fire | – |
| Khvostov 7G-0X | Actium War Rig | – |
| Le Monarque | Oathkeeper | – |
| Legend of Acrius | No Backup Plans | – |
| Leviathan's Breath | Oathkeeper | – |
| Lodestar | Cenotaph Mask | – |
| Lord of Wolves | No Backup Plans | – |
| Lorentz Driver | Rain of Fire | – |
| Lumina | Boots of the Assembler, Lucky Pants | – |
| Malfeasance | Boots of the Assembler, Lucky Pants | super |
| Merciless | Rain of Fire | – |
| Microcosm | Cenotaph Mask | super |
| Monte Carlo | Actium War Rig | melee |
| Necrochasm | Actium War Rig | – |
| One Thousand Voices | Rain of Fire | – |
| Osteo Striga | Peacekeepers | – |
| Praxic Blade | Stronghold | – |
| Prometheus Lens | Cenotaph Mask | – |
| Quicksilver Storm | Actium War Rig | grenade |
| Rat King | Mechaneer's Tricksleeves | – |
| Riskrunner | Peacekeepers | – |
| Ruinous Effigy | Cenotaph Mask | – |
| Service of Luzaku | Actium War Rig | – |
| Slayer's Fang | No Backup Plans | – |
| Sleeper Simulant | Rain of Fire | – |
| Still Hunt | – | super |
| Sturm | Boots of the Assembler, Lucky Pants | – |
| Sunshot | Boots of the Assembler, Lucky Pants | – |
| SUROS Regime | Actium War Rig | – |
| Sweet Business | Actium War Rig | – |
| Tarrabah | Peacekeepers | – |
| Telesto | Rain of Fire | – |
| Tessellation | Rain of Fire | grenade |
| The Chaperone | No Backup Plans | – |
| The Colony | – | grenade |
| The Fourth Horseman | No Backup Plans | – |
| The Huckleberry | Peacekeepers | – |
| The Lament | Stronghold | – |
| The Last Word | Boots of the Assembler, Lucky Pants | – |
| The Manticore | Peacekeepers | – |
| The Navigator | Cenotaph Mask | – |
| The Prospector | – | grenade |
| The Queenbreaker | Rain of Fire | – |
| The Wardcliff Coil | Hazardous Propulsion | – |
| Thorn | Boots of the Assembler, Lucky Pants | – |
| Thunderlord | Actium War Rig | – |
| Ticuu's Divination | Oathkeeper | – |
| Tommy's Matchbook | Actium War Rig | – |
| Tractor Cannon | No Backup Plans | – |
| Traveler's Chosen | Mechaneer's Tricksleeves | classAbility, grenade, melee |
| Trespasser | Mechaneer's Tricksleeves | – |
| Trinity Ghoul | Oathkeeper | – |
| Truth | Hazardous Propulsion | – |
| Turncoat | Boots of the Assembler, Lucky Pants | – |
| Two-Tailed Fox | Hazardous Propulsion | – |
| Verglas Curve | Oathkeeper | – |
| Vex Mythoclast | Rain of Fire | – |
| Vexcalibur | Triton Vice | – |
| Wavesplitter | Cenotaph Mask | – |
| Whirling Ovation | Hazardous Propulsion | – |
| Winterbite | Triton Vice | – |
| Wish-Ender | Oathkeeper | – |
| Wish-Keeper | Oathkeeper | – |
| Wolfsbane | Stronghold | – |
| Worldline Zero | Stronghold | – |
| Xenophage | Actium War Rig | – |
