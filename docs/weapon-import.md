# Waffen-Import: Prüftabelle

Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.

Stand: Aegis 2026-10-20, Quantum 2026-10-20 (Quantum nennt keinen Patch pro Zeile), Manifest 245114.26.10.13.2000-1-bnet.66137.

Umfang: exotische Special- und Heavy-Waffen. **49 Pakete**, 30 Lücken, von Hand modelliert: One Thousand Voices.

## Pakete

Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.

| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ager's Scepter | traceRifle | stasis | keine (1 Shot) | 37,2 | Quantum | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Arbalest | linearFusionRifle | kinetic | keine (1 Shot) | 1.086,1 | Aegis | 22 | 6 | 1,73 s | 24,6 s | – → 56 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Aegis |
| Bastion | fusionRifle | kinetic | keine (4 Shots) | 1.591,5 | Quantum | 21 | 4 | 1,32 s | 37,4 s | 38 → 39 | 0,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Borealis | sniperRifle | void | keine (1 Shot) | 832,4 | Quantum | 20 | 5 | 1,98 s | 19,3 s | 72 → 85 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Buried Bloodline | sidearm | void | keine (1 Shot) | 322,4 | Quantum | 50 | 11 | 1,02 s | 31,1 s | 100 → 109 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Cloudstrike | sniperRifle | arc | average, with lightning strikes (36 Shots) | 664,4 | Quantum | 31 | 7 | 1,68 s | 17,9 s | 140 → 161 | 0,9 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Coldheart | traceRifle | arc | average, no initial trace (202 Shots) | 35,3 | Quantum | 505 | 101 | 1,44 s | 39,1 s | 900 → 907 | 1,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Conditional Finality | shotgun | stasis | average, body, both modes (12 Shots) | 1.422,2 | Quantum | 19 | 2 | 1,06 s | 19,4 s | 165 → 110 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 110 statt 165 rpm |
| D.A.R.C.I. | sniperRifle | arc | average, Target Acquired, with spaced jolt (35 Shots) | 824,8 | Quantum | 31 | 7 | 2,00 s | 18,0 s | 140 → 180 | 0,4 % | Aegis misst nur mit Katalysator: Basis = 874,5 ÷ 1,060 (Quantum mit / ohne Katalysator); Timing nur aus Quantum; abgeleitete Feuerrate 180 statt 140 rpm |
| Dead Messenger | grenadeLauncher | void | keine (1 Shot) | 1.383,7 | Aegis | 20 | 1 | 1,55 s | 29,5 s | 90 → 39 | 0,0 % | ⚠ Timing: Aegis 20 Shots in 29,5 s, Quantum 20 Shots in 32,4 s; Aegis gilt |
| Delicate Tomb | fusionRifle | arc | hipfire (18 Shots) | 890,4 | Quantum | 26 | 6 | 1,32 s | 32,0 s | 56 → 56 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „Hip-fire“; Timing nur aus Quantum |
| Deterministic Chaos | machineGun | void | average, with volatile damage, excludes weaken (48 Shots) | 126,5 | Quantum | 376 | 48 | 3,57 s | 86,3 s | 360 → 367 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „w/o weaken“; Timing nur aus Quantum |
| Dragon's Breath | rocketLauncher | solar | average, loaded, Composite Propellant x5 (8 Shots) | 3.725,5 | Quantum | 11 | 1 | 2,35 s | 23,5 s | 46 → 60.000 | 0,4 % | Timing nur aus Quantum |
| Edge of Action | glaive | void | projectile (1 Shot) | 482,4 | Quantum | 29 | 6 | 1,57 s | 32,5 s | 55 → 64 | 0,1 % | Timing nur aus Quantum |
| Edge of Concurrence | glaive | arc | projectile (1 Shot) | 420,4 | Quantum | 33 | 7 | 1,57 s | 31,0 s | 80 → 78 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Edge of Intent | glaive | solar | projectile (1 Shot) | 553,8 | Quantum | 31 | 5 | 1,57 s | 50,8 s | 45 → 43 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Eriana's Vow | handCannon | solar | Death At First Glance (1 Shot) | 491,2 | Quantum | 35 | 9 | 1,66 s | 25,6 s | 90 → 99 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Euphony | linearFusionRifle | strand | burst, without threadlings (1 Shot) | 1.317,5 | Quantum | 21 | 6 | 1,32 s | 32,2 s | 42 → 42 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Eyes of Tomorrow | rocketLauncher | solar | volley (1 Shot) | 2.703,6 | Quantum | 10 | 1 | 2,35 s | 29,3 s | 72 → 66 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Forerunner | sidearm | kinetic | keine (1 Shot) | 297,9 | Quantum | 70 | 12 | 1,63 s | 27,4 s | 200 → 215 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Gjallarhorn | rocketLauncher | solar | keine (8 Shots) | 1.892,2 | Quantum | 11 | 2 | 2,35 s | 18,2 s | 47 → 93 | 0,9 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 93 statt 47 rpm |
| Heir Apparent | machineGun | solar | keine (1 Shot) | 56,1 | Quantum | 440 | 200 | 3,57 s | 36,3 s | 900 → 903 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Izanagi's Burden | sniperRifle | kinetic | keine (1 Shot) | 658,5 | Quantum | 20 | 4 | 1,98 s | 17,9 s | 90 → 114 | 0,1 % | Timing nur aus Quantum; abgeleitete Feuerrate 114 statt 90 rpm |
| Jötunn | fusionRifle | solar | average, successive shots (10 Shots) | 1.048,3 | Aegis | 24 | 5 | 2,07 s | 31,7 s | – → 49 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Aegis |
| Leviathan's Breath | bow | void | keine (6 Shots) | 2.170,1 | Quantum | 9 | 1 | 0,60 s | 17,4 s | 31 → 38 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Lord of Wolves | shotgun | solar | average, includes ignition/scorch (120 Shots) | 186,1 | Quantum | 189 | 30 | 0,92 s | 22,6 s | 640 → 660 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „ADS“; Timing nur aus Quantum |
| Lorentz Driver | linearFusionRifle | void | keine (1 Shot) | 1.086,1 | Quantum | 21 | 6 | 1,32 s | 23,7 s | 58 → 61 | 0,0 % | Timing nur aus Quantum |
| Microcosm | traceRifle | kinetic | keine (1 Shot) | 82,8 | Aegis | 385 | 120 | 1,12 s | 28,9 s | 900 → 896 | 0,1 % | Timing aus Aegis-Zeile mit Harsh Refraction (laut Text ohne Einfluss auf das Timing); Timing: Aegis und Quantum stimmen überein |
| New Land Beyond | sniperRifle | kinetic | no stacks (20 Shots) | 1.029,0 | Quantum | 40 | 8 | 1,98 s | 72,7 s | 32 → 36 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „The Master 0x“; Timing nur aus Quantum |
| New Malpais | pulseRifle | strand | average, 3 bursts, includes suspend, excludes unravel (3 Shots) | 1.159,9 | Aegis | 27 | 7 | 1,38 s | 24,7 s | – → 67 | 0,0 % | Timing nur aus Aegis |
| Parasite | grenadeLauncher | solar | keine (1 Shot) | 2.133,4 | Quantum | 18 | 1 | 2,08 s | 35,4 s | 120 → 25.500 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Ruinous Effigy | traceRifle | void | keine (1 Shot) | 40,1 | Quantum | 470 | 94 | 1,44 s | 36,8 s | 900 → 907 | 0,4 % | Timing nur aus Quantum |
| Service of Luzaku | machineGun | strand | keine (1 Shot) | 156,7 | Quantum | 300 | 47 | 3,57 s | 70,3 s | 360 → 367 | 0,2 % | Timing nur aus Quantum |
| Slayer's Fang | shotgun | void | average, includes submunitions, Nightsworn ticks include weaken (9 Shots) | 1.205,9 | Quantum | 27 | 10 | 1,41 s | 23,4 s | 70 → 76 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; eingerechnet: weaken |
| Sleeper Simulant | linearFusionRifle | solar | keine (1 Shot) | 2.328,5 | Aegis | 14 | 4 | 2,05 s | 22,3 s | – → 37 | 0,0 % | Override: Aegis und Quantum messen nur mit Katalysator (16 Schuss, kürzere Charge Time). Ohne Katalysator: 14 Schuss und 250 ms längere Charge Time pro Schuss.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Aegis |
| Still Hunt | sniperRifle | solar | keine (1 Shot) | 658,5 | Quantum | 20 | 6 | 1,98 s | 31,8 s | 90 → 44 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 44 statt 90 rpm |
| Telesto | fusionRifle | void | keine (7 Shots) | 1.094,6 | Quantum | 19 | 7 | 1,32 s | 27,5 s | – → 43 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Quantum |
| The Chaperone | shotgun | kinetic | keine (1 Shot) | 748,6 | Quantum | 18 | 6 | 0,43 s | 20,7 s | 70 → 51 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 51 statt 70 rpm |
| The Colony | grenadeLauncher | void | direct impact (1 Shot) | 833,8 | Aegis | 25 | 8 | 2,05 s | 15,2 s | – → 139 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Aegis |
| The Fourth Horseman | shotgun | arc | body, full mag (1 Shot) | 4.197,6 | Quantum | 20 | 4 | 0,43 s | 12,2 s | 300 → 109 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 109 statt 300 rpm |
| The Navigator | traceRifle | strand | keine (1 Shot) | 28,6 | Quantum | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| The Wardcliff Coil | rocketLauncher | arc | average, volley, excludes Bolt Charge (1 Shot) | 2.403,2 | Quantum | 8 | 1 | 2,35 s | 21,4 s | 86 → 85 | 0,1 % | Timing nur aus Quantum |
| Thunderlord | machineGun | arc | average, with lightning strikes, excludes Bolt Charge (127 Shots) | 113,9 | Quantum | 379 | 62 | 3,57 s | 57,6 s | 617 → 627 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Tractor Cannon | shotgun | void | body (6 Shots) | 522,5 | Quantum | 18 | 7 | 1,47 s | 14,2 s | 80 → 91 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Truth | rocketLauncher | void | average, Prototype Truthseeker (9 Shots) | 2.179,3 | Quantum | 20 | 3 | 2,35 s | 17,4 s | 47 → 345 | 0,1 % | Timing nur aus Quantum; abgeleitete Feuerrate 345 statt 47 rpm |
| Vexcalibur | glaive | void | projectile (1 Shot) | 573,2 | Quantum | 33 | 6 | 1,57 s | 28,1 s | 80 → 95 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Whisper of the Worm | sniperRifle | solar | keine (1 Shot) | 849,9 | Quantum | 38 | 38 | 1,98 s | 31,7 s | 72 → 70 | 0,0 % | Aegis misst nur mit Katalysator: Basis = 1.250,9 ÷ 1,472 (Quantum mit / ohne Katalysator); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing nur aus Quantum |
| Winterbite | glaive | stasis | average, projectile, with shatter (18 Shots) | 1.469,0 | Aegis | 17 | 4 | 1,50 s | 24,0 s | 45 → 40 | 0,0 % | ⚠ Timing: Aegis 17 Shots in 24,0 s, Quantum 18 Shots in 23,9 s; Aegis gilt |
| Xenophage | machineGun | solar | keine (1 Shot) | 736,4 | Aegis | 39 | 13 | 2,82 s | 23,6 s | 120 → 120 | 0,1 % | ⚠ Timing: Aegis 39 Shots in 23,6 s, Quantum 29 Shots in 20,1 s; Aegis gilt |

## Optionen

Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.

| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |
| --- | --- | --- | --- | --- | --- | --- |
| D.A.R.C.I. | ⚠ Networked Targeting x5 | Katalysator | ×1,060 | – | – | keine Dauer im Compendium gefunden |
| Truth | ⚠ Reaper's Tithe x4 | Katalysator | ×1,400 | 15 s | Grants stacks of 'Reaper's Tithe' based on the number of simultaneously killed enemies. Maximum of 4 stacks. (e.g. triple kill ⇒ 3 stacks) | Faktor aus Einzeltreffern; Mittelwert pro Shot wäre ×1,448 (9 gegen 12 Shots) |
| Whisper of the Worm | ⚠ Whispered Breathing | Katalysator | ×1,472 | 1 s | – | – |

## Lücken

| Waffe | Typ | Grund |
| --- | --- | --- |
| Anarchy | grenadeLauncher | keine Aegis-Zeile ohne fremde Annahmen |
| Black Talon | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Choir of One | autoRifle | Skala Aegis gegen Quantum weicht um 4.4 % ab |
| Cull's Shadow | fusionRifle | Skala Aegis gegen Quantum weicht um 25.8 % ab |
| Deathbringer | rocketLauncher | Skala Aegis gegen Quantum weicht um 51.4 % ab |
| Divinity | traceRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Duality | shotgun | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine passende Quantum-Zeile (nur „cata, pellet“, „cata, slug“, „cata, On Black Wings x3“) |
| Ergo Sum | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Ex Diris | grenadeLauncher | kein Timing: Aegis: kein Reload in den Notizen; keine passende Quantum-Zeile (nur „No Enrage“, „Max Enrage“) |
| Fafnir | linearFusionRifle | kein Timing: Aegis: kein Reload in den Notizen; keine Quantum-Zeile |
| Finality's Auger | linearFusionRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; Quantum: ohne Magazin, Munition oder Reload ({"totalDamage":"#VALUE!","totalShots":"???","timeToEmptySeconds":"#NUM!"}) |
| Grand Overture | machineGun | Skala Aegis gegen Quantum weicht um 12.9 % ab |
| Heartshadow | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Heirloom | bow | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Ice Breaker | sniperRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; Quantum: ohne Magazin, Munition oder Reload ({"totalShots":"N/A","reloadSeconds":"N/A"}) |
| Legend of Acrius | shotgun | Skala nicht prüfbar: keine vergleichbaren Werte |
| Merciless | fusionRifle | Skala Aegis gegen Quantum weicht um 80.0 % ab |
| Praxic Blade | sword | kein Timing: keine Quantum-Zeile |
| Prometheus Lens | traceRifle | kein Timing: keine Quantum-Zeile |
| Salvation's Grip | grenadeLauncher | Skala Aegis gegen Quantum weicht um 58.8 % ab |
| Tessellation | fusionRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| The Lament | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| The Prospector | grenadeLauncher | Skala nicht prüfbar: keine vergleichbaren Werte |
| The Queenbreaker | linearFusionRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine passende Quantum-Zeile (nur „Marksman Sights“, „Combat Sights“) |
| Two-Tailed Fox | rocketLauncher | Handmodell nötig: Scorch und Ignitions (wie One Thousand Voices) |
| Wavesplitter | traceRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Whirling Ovation | rocketLauncher | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Witherhoard | grenadeLauncher | kein Timing: keine passende Quantum-Zeile (nur „passive“, „passive“, „passive, ground“, „cata, single blight, boss“, „cata, single blight, floor“, „double blight“, „spamming, single blight“, „spamming, double blight“) |
| Wolfsbane | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
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
| Izanagi's Burden | Honed Edge x4 | gleiche Annahmen wie die Basiszeile |
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
