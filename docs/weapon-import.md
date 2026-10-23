# Waffen-Import: Prüftabelle

Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.

Stand: Aegis 2026-10-20, Quantum 2026-10-20 (Quantum nennt keinen Patch pro Zeile), Manifest 245114.26.10.13.2000-1-bnet.66137.

Umfang: exotische Special- und Heavy-Waffen. **92 Pakete**, 49 Lücken.

## Pakete

Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.

| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ace of Spades | handCannon | kinetic | keine (1 Shot) | 96,2 | Quantum |  | 13 | 1,64 s | – | 140 → 140 | 0,6 % | Timing nur aus Quantum |
| Ager's Scepter | traceRifle | stasis | keine (1 Shot) | 37,2 | Quantum | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 485 Shots, Magazin 194, Zeit bis leer 12,9 s |
| Arbalest | linearFusionRifle | kinetic | keine (1 Shot) | 1.086,1 | Aegis | 21 | 5 | 1,73 s | 24,2 s | – → 56 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by one (5🠚6)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Aegis; Katalysator-Timing: 22 Shots, Magazin 6, Zeit bis leer 24,6 s |
| Bad Juju | pulseRifle | kinetic | burst (1 Shot) | 31,9 | Quantum |  | 31 | 1,16 s | – | 450 → 450 | 0,1 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.446 = 3 × 482); Paket pro Kugel wie Quantums Magazin; Timing nur aus Quantum |
| Bastion | fusionRifle | kinetic | keine (4 Shots) | 1.591,5 | Quantum | 21 | 4 | 1,32 s | 37,4 s | 38 → 39 | 0,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Borealis | sniperRifle | void | keine (1 Shot) | 832,4 | Quantum | 20 | 5 | 1,98 s | 19,3 s | 72 → 85 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Buried Bloodline | sidearm | void | keine (1 Shot) | 322,4 | Quantum | 50 | 11 | 1,02 s | 31,1 s | 100 → 109 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Centrifuse | autoRifle | arc | keine (1 Shot) | 34,3 | Quantum |  | 45 | 0,50 s | – | 450 → 450 | 1,9 % | Timing nur aus Quantum |
| Cloudstrike | sniperRifle | arc | average, with lightning strikes (36 Shots) | 664,4 | Quantum | 31 | 7 | 1,68 s | 17,9 s | 140 → 161 | 0,9 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 44 Shots, Magazin 10, Zeit bis leer 23,4 s |
| Coldheart | traceRifle | arc | average, no initial trace (202 Shots) | 35,3 | Quantum | 505 | 101 | 1,44 s | 39,1 s | 900 → 907 | 1,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Collective Obligation | pulseRifle | void | burst (1 Shot) | 38,8 | Quantum |  | 36 | 1,16 s | – | 390 → 390 | 0,6 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.755 = 3 × 585); Paket pro Kugel wie Quantums Magazin; Timing nur aus Quantum |
| Conditional Finality | shotgun | stasis | average, body, both modes (12 Shots) | 1.422,2 | Quantum | 19 | 2 | 1,06 s | 19,4 s | 165 → 110 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 110 statt 165 rpm |
| Crimson | handCannon | kinetic | burst (1 Shot) | 40,2 | Quantum |  | 24 | 1,64 s | – | 415 → 415 | 1,2 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.821 = 3 × 607); Paket pro Kugel wie Quantums Magazin; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Cryosthesia 77K | sidearm | stasis | keine (1 Shot) | 87,2 | Quantum |  | 12 | 1,03 s | – | 260 → 260 | 0,7 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| D.A.R.C.I. | sniperRifle | arc | average, Target Acquired, with spaced jolt (35 Shots) | 824,8 | Quantum | 31 | 7 | 2,00 s | 18,0 s | 140 → 180 | 0,4 % | Aegis misst nur mit Katalysator: Basis = 874,5 ÷ 1,060 (Quantum mit / ohne Katalysator); Timing nur aus Quantum; abgeleitete Feuerrate 180 statt 140 rpm |
| Dead Messenger | grenadeLauncher | void | keine (1 Shot) | 1.383,7 | Aegis | 20 | 1 | 1,55 s | 29,5 s | 90 → 39 | 0,0 % | ⚠ Timing: Aegis 20 Shots in 29,5 s, Quantum 20 Shots in 32,4 s; Aegis gilt |
| Delicate Tomb | fusionRifle | arc | hipfire (18 Shots) | 890,4 | Quantum | 26 | 6 | 1,32 s | 32,0 s | 56 → 56 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „Hip-fire“; Timing nur aus Quantum |
| Deterministic Chaos | machineGun | void | average, with volatile damage, excludes weaken (48 Shots) | 126,5 | Quantum | 376 | 48 | 3,57 s | 86,3 s | 360 → 367 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „w/o weaken“; Timing nur aus Quantum |
| Devil's Ruin | sidearm | solar | keine (1 Shot) | 78,5 | Quantum |  | 20 | 1,03 s | – | 300 → 300 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Dragon's Breath | rocketLauncher | solar | average, loaded, Composite Propellant x5 (8 Shots) | 3.725,5 | Quantum | 11 | 1 | 2,35 s | 23,5 s | 46 → 60.000 | 0,4 % | Timing nur aus Quantum |
| Edge of Action | glaive | void | projectile (1 Shot) | 482,4 | Quantum | 29 | 6 | 1,57 s | 32,5 s | 55 → 64 | 0,1 % | Timing nur aus Quantum |
| Edge of Concurrence | glaive | arc | projectile (1 Shot) | 420,4 | Quantum | 33 | 7 | 1,57 s | 31,0 s | 80 → 78 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Edge of Intent | glaive | solar | projectile (1 Shot) | 553,8 | Quantum | 31 | 5 | 1,57 s | 50,8 s | 45 → 43 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Eriana's Vow | handCannon | solar | Death At First Glance (1 Shot) | 491,2 | Quantum | 32 | 6 | 1,66 s | 27,1 s | 90 → 99 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („magazine size by 3 (6🠚9)“); Timing nur aus Quantum; Katalysator-Timing: 35 Shots, Magazin 9, Zeit bis leer 25,6 s |
| Euphony | linearFusionRifle | strand | burst, without threadlings (1 Shot) | 1.317,5 | Quantum | 21 | 6 | 1,32 s | 32,2 s | 42 → 42 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Eyes of Tomorrow | rocketLauncher | solar | volley (1 Shot) | 2.703,6 | Quantum | 10 | 1 | 2,35 s | 29,3 s | 72 → 66 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Forerunner | sidearm | kinetic | keine (1 Shot) | 297,9 | Quantum | 70 | 12 | 1,63 s | 27,4 s | 200 → 215 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Gjallarhorn | rocketLauncher | solar | keine (8 Shots) | 1.892,2 | Quantum | 10 | 1 | 2,35 s | 27,0 s | 47 → 93 | 0,9 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 1 (1🠚2)“); Timing nur aus Quantum; Katalysator-Timing: 11 Shots, Magazin 2, Zeit bis leer 18,2 s |
| Hard Light | autoRifle | void | keine (1 Shot) | 27,6 | Quantum |  | 49 | 1,12 s | – | 600 → 600 | 1,5 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Hawkmoon | handCannon | kinetic | keine (1 Shot) | 96,2 | Quantum |  | 8 | 1,64 s | – | – → 140 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 1 (8🠚9)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 9, Zeit bis leer – |
| Heir Apparent | machineGun | solar | keine (1 Shot) | 56,1 | Quantum | 440 | 200 | 3,57 s | 36,3 s | 900 → 903 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Hierarchy of Needs | bow | solar | average, one ring (6 Shots) | 916,8 | Quantum |  | 1 | 0,60 s | – | 44 → 44 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Izanagi's Burden | sniperRifle | kinetic | keine (1 Shot) | 658,5 | Quantum | 20 | 4 | 1,98 s | 17,9 s | 90 → 114 | 0,1 % | Timing nur aus Quantum; abgeleitete Feuerrate 114 statt 90 rpm |
| Jötunn | fusionRifle | solar | average, successive shots (10 Shots) | 1.048,3 | Aegis | 24 | 5 | 2,07 s | 31,7 s | – → 49 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Aegis |
| Khvostov 7G-0X | autoRifle | kinetic | average, with ricochetting bullets (7 Shots) | 41,4 | Quantum |  | 43 | 1,12 s | – | 600 → 600 | 1,5 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Le Monarque | bow | void | average, with poison (15 Shots) | 394,1 | Quantum |  | 1 | 0,60 s | – | 50 → 50 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Legend of Acrius | shotgun | arc | body (1 Shot) | 1.990,4 | Quantum | 14 | 4 | 0,43 s | 18,8 s | – → 44 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 2 (4🠚6)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: 16 Shots, Magazin 6, Zeit bis leer 21,1 s |
| Leviathan's Breath | bow | void | keine (6 Shots) | 2.170,1 | Quantum | 9 | 1 | 0,60 s | 17,4 s | 31 → 38 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 14 Shots, Magazin 1, Zeit bis leer 18,9 s |
| Lodestar | traceRifle | arc | hipfire (1 Shot) | 24,3 | Quantum |  | 75 | 1,16 s | – | 900 → 900 | 2,7 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Lord of Wolves | shotgun | solar | average, includes ignition/scorch (120 Shots) | 186,1 | Quantum | 189 | 30 | 0,92 s | 22,6 s | 640 → 660 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „ADS“; Timing nur aus Quantum |
| Lorentz Driver | linearFusionRifle | void | keine (1 Shot) | 1.086,1 | Quantum | 21 | 6 | 1,32 s | 23,7 s | 58 → 61 | 0,0 % | Timing nur aus Quantum |
| Lumina | handCannon | kinetic | keine (1 Shot) | 96,2 | Quantum |  | 13 | 1,64 s | – | 140 → 140 | 0,6 % | Timing nur aus Quantum |
| Microcosm | traceRifle | kinetic | keine (1 Shot) | 82,8 | Aegis | 385 | 120 | 1,12 s | 28,9 s | 900 → 896 | 0,1 % | Timing aus Aegis-Zeile mit Harsh Refraction (laut Text ohne Einfluss auf das Timing); Timing: Aegis und Quantum stimmen überein |
| MIDA Multi-Tool | scoutRifle | kinetic | keine (1 Shot) | 73,8 | Quantum |  | 16 | 1,24 s | – | 200 → 200 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Monte Carlo | autoRifle | kinetic | keine (1 Shot) | 27,6 | Quantum |  | 44 | 1,12 s | – | 600 → 600 | 1,5 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Necrochasm | autoRifle | kinetic | keine (1 Shot) | 23,4 | Quantum |  | 50 | 1,16 s | – | 720 → 720 | 1,5 % | Timing nur aus Quantum |
| New Land Beyond | sniperRifle | kinetic | no stacks (20 Shots) | 1.029,0 | Quantum | 40 | 8 | 1,98 s | 72,7 s | 32 → 36 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „The Master 0x“; Timing nur aus Quantum |
| New Malpais | pulseRifle | strand | average, 3 bursts, includes suspend, excludes unravel (3 Shots) | 1.159,9 | Aegis | 27 | 7 | 1,38 s | 24,7 s | – → 67 | 0,0 % | Timing nur aus Aegis |
| No Time to Explain | pulseRifle | kinetic | burst (1 Shot) | 123,1 | Quantum |  | 24 | 1,16 s | – | 340 → 340 | 0,1 % | ⚠ Timing aus der Quantum-Zeile „w/ Time-Slip Portal,cata“ mit Katalysator; Timing nur aus Quantum |
| One Thousand Voices | fusionRifle | solar | average (4 Shots) | 2.180,0 | Quantum | 11 | 4 | 1,25 s | 20,7 s | 33 → 33 | 0,0 % | Override: Der Text nennt Scorch pro Explosion; ein Shot hat 9 Explosionen à x10, also x90 pro Shot.; Scorch: x90 pro Shot („inflicting x10+5 Scorch“, Override); Shot aus Quantum ohne Ignitions („Does not consider Scorch; without ignition“): 23.980 ÷ 11; Ignitions ×1,316 („Solar Effects that are initially applied by One Thousand Voices deal 31.6% increased damage“); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Skala: Shot aus Quantum, keine Prüfung gegen Aegis (Aegis zählt Ignitions mit) |
| Osteo Striga | submachineGun | kinetic | average, with successive poison (136 Shots) | 61,9 | Quantum |  | 29 | 1,19 s | – | 600 → 600 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Parasite | grenadeLauncher | solar | keine (1 Shot) | 2.133,4 | Quantum | 18 | 1 | 2,08 s | 35,4 s | 120 → 25.500 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Polaris Lance | scoutRifle | solar | average, with ignition (15 Shots) | 169,7 | Quantum |  | 14 | 1,24 s | – | 150 → 150 | 0,3 % | Timing nur aus Quantum |
| Quicksilver Storm | autoRifle | kinetic | average, with tracking rockets (14 Shots) | 27,8 | Quantum |  | 51 | 1,10 s | – | 720 → 720 | 1,5 % | Timing nur aus Quantum |
| Rat King | sidearm | kinetic | keine (1 Shot) | 78,5 | Quantum |  | 15 | 1,03 s | – | 300 → 300 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Red Death Reformed | pulseRifle | solar | burst, undamaged (1 Shot) | 41,0 | Quantum |  | 30 | 1,12 s | – | 340 → 340 | 0,1 % | Aegis misst einen Burst aus 3 Kugeln (wipe 1.857 = 3 × 619); Paket pro Kugel wie Quantums Magazin; Timing nur aus Quantum |
| Ruinous Effigy | traceRifle | void | keine (1 Shot) | 40,1 | Quantum | 470 | 94 | 1,44 s | 36,8 s | 900 → 907 | 0,4 % | Timing nur aus Quantum |
| Service of Luzaku | machineGun | strand | keine (1 Shot) | 156,7 | Quantum | 300 | 47 | 3,57 s | 70,3 s | 360 → 367 | 0,2 % | Timing nur aus Quantum |
| Slayer's Fang | shotgun | void | average, includes submunitions, Nightsworn ticks include weaken (9 Shots) | 1.048,6 | Quantum | 27 | 10 | 1,41 s | 23,4 s | 70 → 76 | 0,0 % | herausgerechnet: Weaken ×1,150 (wirkt nur, wenn der Build ihn hat); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Sleeper Simulant | linearFusionRifle | solar | keine (1 Shot) | 2.328,5 | Aegis | 14 | 4 | 2,05 s | 22,3 s | – → 37 | 0,0 % | Override: Aegis und Quantum messen nur mit Katalysator (16 Schuss, kürzere Charge Time). Ohne Katalysator: 14 Schuss und 250 ms längere Charge Time pro Schuss.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Aegis; Katalysator-Timing: 16 Shots, Magazin 4, Zeit bis leer 22,5 s |
| Still Hunt | sniperRifle | solar | keine (1 Shot) | 658,5 | Quantum | 20 | 6 | 1,98 s | 31,8 s | 90 → 44 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 44 statt 90 rpm |
| Sturm | handCannon | kinetic | keine (1 Shot) | 114,5 | Quantum |  | 9 | 1,60 s | – | 120 → 120 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Sunshot | handCannon | solar | keine (1 Shot) | 86,6 | Quantum |  | 12 | 1,64 s | – | 150 → 150 | 0,8 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Sweet Business | autoRifle | kinetic | average, with explosive rounds (150 Shots) | 32,6 | Quantum |  | 150 | 2,00 s | – | 856 → 856 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing aus der Quantum-Zeile „average per mag“; Timing nur aus Quantum |
| Symmetry | scoutRifle | arc | keine (1 Shot) | 61,0 | Quantum |  | 20 | 0,99 s | – | 260 → 260 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Tarrabah | submachineGun | solar | keine (1 Shot) | 33,9 | Quantum |  | 35 | 1,19 s | – | 720 → 720 | 0,4 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Telesto | fusionRifle | void | keine (7 Shots) | 1.094,6 | Quantum | 16 | 4 | 1,32 s | 24,7 s | – → 43 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 3 (4🠚7)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: 19 Shots, Magazin 7, Zeit bis leer 27,5 s |
| The Chaperone | shotgun | kinetic | keine (1 Shot) | 748,6 | Quantum | 18 | 6 | 0,43 s | 20,7 s | 70 → 51 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 51 statt 70 rpm |
| The Colony | grenadeLauncher | void | direct impact (1 Shot) | 833,8 | Aegis | 24 | 7 | 2,05 s | 14,8 s | – → 139 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 1 (7🠚8)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Aegis; Katalysator-Timing: 25 Shots, Magazin 8, Zeit bis leer 15,2 s |
| The Fourth Horseman | shotgun | arc | body, full mag (1 Shot) | 4.197,6 | Quantum | 20 | 4 | 0,43 s | 12,2 s | 300 → 109 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; abgeleitete Feuerrate 109 statt 300 rpm; Katalysator-Timing: 20 Shots, Magazin 5, Zeit bis leer 12,1 s |
| The Jade Rabbit | scoutRifle | kinetic | keine (1 Shot) | 96,6 | Quantum |  | 15 | 1,24 s | – | 150 → 150 | 0,4 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing nur aus Quantum |
| The Last Word | handCannon | kinetic | hipfire (1 Shot) | 175,5 | Quantum |  | 8 | 1,64 s | – | 225 → 225 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| The Manticore | submachineGun | void | average, Hover Mode (104 Shots) | 41,9 | Quantum |  | 42 | 1,19 s | – | 900 → 900 | 2,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „Grounded“; Timing nur aus Quantum |
| The Navigator | traceRifle | strand | keine (1 Shot) | 28,6 | Quantum | 485 | 97 | 1,44 s | 37,8 s | 900 → 906 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| The Wardcliff Coil | rocketLauncher | arc | average, volley, excludes Bolt Charge (1 Shot) | 2.403,2 | Quantum | 8 | 1 | 2,35 s | 21,4 s | 86 → 85 | 0,1 % | Timing nur aus Quantum |
| Third Iteration | scoutRifle | void | precision (1 Shot) | 112,6 | Quantum |  | 16 | 3,41 s | – | 200 → 200 | 0,4 % | Timing aus der Quantum-Zeile „Base“; Timing nur aus Quantum |
| Thorn | handCannon | kinetic | average, with poison (9 Shots) | 135,2 | Quantum |  | 9 | 1,64 s | – | 140 → 140 | 0,4 % | Timing nur aus Quantum |
| Thunderlord | machineGun | arc | average, with lightning strikes, excludes Bolt Charge (127 Shots) | 113,9 | Quantum | 379 | 62 | 3,57 s | 57,6 s | 617 → 627 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum; Katalysator-Timing: 379 Shots, Magazin 379, Zeit bis leer 32,5 s |
| Ticuu's Divination | bow | solar | average, alternating modes, 6 stacks (12 Shots) | 367,3 | Quantum |  | 1 | 0,60 s | – | 51 → 51 | 0,3 % | Timing nur aus Quantum |
| Tractor Cannon | shotgun | void | body (6 Shots) | 522,5 | Quantum | 15 | 4 | 1,47 s | 13,7 s | 80 → 91 | 0,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Quellen-Timing hat schon das Magazin mit Katalysator; ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 3 (4🠚7)“); Timing nur aus Quantum; Katalysator-Timing: 18 Shots, Magazin 7, Zeit bis leer 14,2 s |
| Traveler's Chosen | sidearm | kinetic | keine (1 Shot) | 78,5 | Quantum |  | 15 | 1,03 s | – | – → 300 | 0,6 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing ohne Katalysator aus Clarity zurückgerechnet („Magazine Size by 2 (15🠚17)“); Annahme: das Magazin zählt zur Munition; Timing nur aus Quantum; Katalysator-Timing: ∞ Shots, Magazin 17, Zeit bis leer – |
| Trespasser | sidearm | arc | keine (1 Shot) | 50,6 | Quantum |  | 30 | 1,03 s | – | 491 → 491 | 0,9 % | Aegis misst einen Burst aus 3 Kugeln (wipe 2.289 = 3 × 763); Paket pro Kugel wie Quantums Magazin; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Trinity Ghoul | bow | arc | keine (1 Shot) | 218,7 | Quantum |  | 1 | 0,60 s | – | – → 48 | 0,2 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Quantum |
| Truth | rocketLauncher | void | average, Prototype Truthseeker (9 Shots) | 2.179,3 | Quantum | 20 | 3 | 2,35 s | 17,4 s | 47 → 345 | 0,1 % | Timing nur aus Quantum; abgeleitete Feuerrate 345 statt 47 rpm |
| Two-Tailed Fox | rocketLauncher | void | average (2 Shots) | 2.340,0 | Quantum | 10 | 1 | 2,35 s | 24,1 s | 40 → 183 | 36,4 % | Scorch: x60 pro Shot („inflicts x60+30 Scorch“); Shot aus Quantum ohne Ignitions („Does not consider scorch; does not consider ignitions“): 23.400 ÷ 10; Timing nur aus Quantum; Skala: Shot aus Quantum, keine Prüfung gegen Aegis (Aegis zählt Ignitions mit) |
| Verglas Curve | bow | stasis | keine (1 Shot) | 208,7 | Quantum |  | 1 | 0,60 s | – | 51 → 51 | 0,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Vexcalibur | glaive | void | projectile (1 Shot) | 573,2 | Quantum | 33 | 6 | 1,57 s | 28,1 s | 80 → 95 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Vigilance Wing | pulseRifle | kinetic | burst (1 Shot) | 34,5 | Quantum |  | 50 | 1,16 s | – | 530 → 530 | 1,4 % | Aegis misst einen Burst aus 5 Kugeln (wipe 2.605 = 5 × 521); Paket pro Kugel wie Quantums Magazin; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Whisper of the Worm | sniperRifle | solar | keine (1 Shot) | 849,9 | Quantum | 38 | 38 | 1,98 s | 31,7 s | 72 → 70 | 0,0 % | Aegis misst nur mit Katalysator: Basis = 1.250,9 ÷ 1,472 (Quantum mit / ohne Katalysator); Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing nur aus Quantum |
| Wicked Implement | scoutRifle | stasis | average, with manual shatters (60 Shots) | 93,3 | Quantum |  | 20 | 1,24 s | – | 260 → 260 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing nur aus Quantum |
| Winterbite | glaive | stasis | average, projectile, with shatter (18 Shots) | 1.469,0 | Aegis | 17 | 4 | 1,50 s | 24,0 s | 45 → 40 | 0,0 % | ⚠ Timing: Aegis 17 Shots in 24,0 s, Quantum 18 Shots in 23,9 s; Aegis gilt |
| Xenophage | machineGun | solar | keine (1 Shot) | 736,4 | Aegis | 39 | 13 | 2,82 s | 23,6 s | 120 → 120 | 0,1 % | ⚠ Timing: Aegis 39 Shots in 23,6 s, Quantum 29 Shots in 20,1 s; Aegis gilt |

## Optionen

Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.

| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |
| --- | --- | --- | --- | --- | --- | --- |
| Ager's Scepter | ⚠ Catalyst | Katalysator | ×1,763 | – | While at full Super Energy, Hold [Reload] to activate Will Given Form. | Faktor aus Quantum (cata / ohne) |
| D.A.R.C.I. | ⚠ Networked Targeting x5 | Katalysator | ×1,060 | – | – | keine Dauer im Compendium gefunden |
| Devil's Ruin | ⚠ Pyrogenesis | Perk | ×0,269 | – | Charged Laser applies 20 Scorch (30 with Ember of Ashes) for every hit and triggers an Ignition on every kill. | – |
| One Thousand Voices | catalyst | Katalysator | ×1,454 | – | – | – |
| Ruinous Effigy | ⚠ Catalyst | Katalysator | ×1,293 | 7 s | Kills, or damaging Champions, Minibosses, or Bosses, with your Transmutation Sphere (inconsistently) grants 30% [15%] increased weapon damage for 7 seconds. | Faktor aus Quantum (cata / ohne) |
| Truth | ⚠ Reaper's Tithe x4 | Katalysator | ×1,400 | 15 s | Grants stacks of 'Reaper's Tithe' based on the number of simultaneously killed enemies. Maximum of 4 stacks. (e.g. triple kill ⇒ 3 stacks) | Faktor aus Einzeltreffern; Mittelwert pro Shot wäre ×1,448 (9 gegen 12 Shots) |
| Whisper of the Worm | ⚠ Whispered Breathing | Katalysator | ×1,472 | 1 s | – | – |

## Katalysatoren

Was der Katalysator gegen einen Boss tut, entscheiden die Quellen: **Schaden** (Option mit Faktor), **Timing** (Zeile mit Katalysator, gleiche Quelle und Ausführung, sonst Zahlen aus Clarity), **keine** (gemessen ohne Unterschied oder kein Schaden und Timing im Text), **unbekannt** (Clarity nennt Schaden oder Timing, keine Quelle misst es).

| Waffe | Munition | Wirkung | Timing ohne → mit | Text (Anfang) |
| --- | --- | --- | --- | --- |
| Ace of Spades | primary | unbekannt | – | Firefly's explosion damage is increased by 50% while Memento Mori is active. |
| Ager's Scepter | special | Schaden und Timing | Magazin 97 → 194, Shots 485 → 485, Zeit bis leer 37,8 → 12,9 s, rpm 906 → 2.898 | While at full Super Energy, Hold [Reload] to activate Will Given Form. |
| Arbalest | special | Timing | Magazin 5 → 6, Shots 21 → 22, Zeit bis leer 24,2 → 24,6 s, rpm 56 → 56 | Passively grants: |
| Bad Juju | primary | keine | – | String of Curses's maximum duration is increased by 2 seconds (5.5🠚7.5). |
| Bastion | special | unbekannt | – | Dealing Melee Damage refills 20% of the Magazine (rounded up) and grants ? Handling for ? seconds. |
| Borealis | special | unbekannt | – | Passively grants 20 Reload Speed. |
| Buried Bloodline | special | unbekannt | – | While Devour is active, grants the following benefits: |
| Centrifuse | primary | keine | – | While you are Amplified, Overcharge Capacitor will continuously build at a rate of 7% charge per second and no longer pa |
| Cloudstrike | special | Timing | Magazin 7 → 10, Shots 31 → 44, Zeit bis leer 17,9 → 23,4 s, rpm 161 → 155 | Passively grants 25 Handling. |
| Coldheart | special | unbekannt | – | Passively grants 20 Stability and 20 Reload Speed. |
| Collective Obligation | primary | keine | – | – |
| Conditional Finality | special | keine | – | Finishing a reload within 5.3? seconds of a Kill grants Cure x2 to you and Cure x1 to allies within 15 meters. |
| Crimson | primary | unbekannt | – | Passively grants 20 Range. |
| Cryosthesia 77K | primary | unbekannt | – | Shattering a Frozen enemy instantly refills the magazine. |
| D.A.R.C.I. | heavy | Schaden | – | Passively grants 20 Stability. |
| Dead Messenger | special | keine | – | Grants the Turnabout trait: |
| Delicate Tomb | special | unbekannt | – | Picking up Ionic Traces refill 4 ammo from reserves. |
| Deterministic Chaos | heavy | unbekannt | – | Successive Hits within 0.2 seconds of each grant a ramping Damage Buff after scoring 12.5% of the Magazine Capacity as h |
| Devil's Ruin | primary | unbekannt | – | Elemental Pickup Interactions grant 30% [10%] increased damage for a variable duration based on the pickup. Can be activ |
| Dragon's Breath | heavy | keine | – | Doubles the rate of passive Composite Propellant generation (6🠚3 Seconds per stack). |
| Edge of Action | special | keine | – | Kills against Void Debuffed enemies grant a 45 HP Void Overshield for 8 seconds (12 with Echo of Persistence). |
| Edge of Concurrence | special | unbekannt | – | Grants the following after sprinting for 1.5 seconds with the weapon readied: |
| Edge of Intent | special | keine | – | Finishing a reload within 5.3? seconds of a Kill grants Cure x2 to you and Cure x1 to allies within 15 meters. |
| Eriana's Vow | special | Timing | Magazin 6 → 9, Shots 32 → 35, Zeit bis leer 27,1 → 25,6 s, rpm 99 → 99 | Increases the magazine size by 3 (6🠚9). |
| Euphony | special | unbekannt | – | Weapon Hits grant Stacks of Enlightened Action for 2 seconds. Maximum of 12 Stacks. |
| Eyes of Tomorrow | heavy | unbekannt | – | Dealing damage grants a stack of 'Blast Distributor' for 5 seconds, increasing your Grenade Stat by 10 per stack. Maximu |
| Forerunner | special | keine | – | Holding [Reload] within 4 seconds of a kill consumes 4 ammo, refills the magazine, and grants 'The Rock'. |
| Gjallarhorn | heavy | Timing | Magazin 1 → 2, Shots 10 → 11, Zeit bis leer 27,0 → 18,2 s, rpm 93 → 93 | Increases Magazine Size by 1 (1🠚2). |
| Hard Light | primary | unbekannt | – | Grants 25 Stability. |
| Hawkmoon | primary | Timing | Magazin 8 → 9, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 140 → 140 | Increases Magazine Size by 1 (8🠚9). |
| Heir Apparent | heavy | unbekannt | – | Arc Shield gains 75% [25%] Damage Resistance. |
| Hierarchy of Needs | primary | unbekannt | – | Deploying a Guidance Ring or Guidance Seeker Hits grants the following benefits for 5 seconds: |
| Izanagi's Burden | special | unbekannt | – | Increases the damage bonus of Honed Edge x4 by 20%, granting the following values: |
| Jötunn | special | unbekannt | – | Grants the Cornered trait: |
| Khvostov 7G-0X | primary | unbekannt | – | Scoring 25 Hits against enemies within 5 seconds of each spawns an Orb of Power that grants 🡅0.8% Super Energy. |
| Le Monarque | primary | unbekannt | – | Grants 20 Reload Speed and 30 Stability. |
| Legend of Acrius | heavy | Timing | Magazin 4 → 6, Shots 14 → 16, Zeit bis leer 18,8 → 21,1 s, rpm 44 → 44 | Grants 40 Reload Speed, 50 Ammo Generation, and increases Magazine Size by 2 (4🠚6). |
| Leviathan's Breath | heavy | Timing | Magazin 1 → 1, Shots 9 → 14, Zeit bis leer 17,4 → 18,9 s, rpm 38 → 70 | Increases Reserves by 5 (9🠚14) and Ammo Generation by 80. |
| Lodestar | primary | unbekannt | – | While Amplified: |
| Lord of Wolves | special | unbekannt | – | Grants 20 Stability, 60 Reload Speed, and 15% decreased Reload Animation Duration. |
| Lumina | primary | keine | – | Kills create an additional Remnant (1🠚2). |
| Microcosm | heavy | unbekannt | – | Weapon Kills grant an additional 1% Super Energy. |
| MIDA Multi-Tool | primary | unbekannt | – | While within 15 meters of an enemy, grants an Enhanced Radar, 20 Reload Speed, and 15% decreased Reload Animation Durati |
| Monte Carlo | primary | unbekannt | – | Hold [Reload] while at maximum Markov Chain stacks to lock the bayonet. |
| Necrochasm | primary | unbekannt | – | Damaging 3 enemies within 3 seconds of each other grants the following benefits for 10 seconds: |
| New Land Beyond | special | unbekannt | – | While above 20 stacks of The Master, Bullseye Bolster duration is increased by ? seconds and the magazine is refilled on |
| New Malpais | special | unbekannt | – | Embedded projectiles Unravel targets for 8 seconds upon detonation. |
| No Time to Explain | primary | keine | – | Delay between Time-Slip Portal bursts is 47% shorter (1.25/s🠚0.85/s). |
| One Thousand Voices | heavy | Schaden | – | I gain 30 Stability and 20 Ammo Generation. |
| Osteo Striga | primary | unbekannt | – | Grants 30 Reload and 20 Stability. |
| Parasite | heavy | unbekannt | – | Dealing any damage with both of your other weapons refills the magazine from reserves upon readying the weapon. |
| Polaris Lance | primary | keine | – | Precision Kills cause targets to explode, dealing up to 123.89 [95.3] weapon-matching elemental damage in a 4.5-meter ra |
| Quicksilver Storm | primary | unbekannt | – | Converts this weapon's element into Strand damage. |
| Rat King | primary | keine | – | Grants 20 Aim Assist and 20 Recoil Direction. |
| Red Death Reformed | primary | keine | – | Scoring 2 [1] kills grants 'Red Death Charged'. |
| Ruinous Effigy | special | Schaden | – | Kills, or damaging Champions, Minibosses, or Bosses, with your Transmutation Sphere (inconsistently) grants 30% [15%] in |
| Service of Luzaku | heavy | keine | – | Teeming Nests can be harvested into a collectible Tangle after spawning 6 Threadlings. This destroys the nest. |
| Slayer's Fang | special | unbekannt | – | Grants the Stats For All trait: |
| Sleeper Simulant | heavy | Timing | Magazin 4 → 4, Shots 14 → 16, Zeit bis leer 22,3 → 22,5 s, rpm 37 → 44 | Increases Reserves by 2 (14🠚16) and decreases Charge Time by 33% (1024🠚774) without reducing damage. |
| Still Hunt | special | unbekannt | – | Finishing a reload within ? seconds of a Precision Kill grants 'Lucky Shot Ready'. |
| Sturm | primary | unbekannt | – | Grants 40 Handling and 20 Range. |
| Sunshot | primary | unbekannt | – | Grants 30 Range and 20 Stability. |
| Sweet Business | primary | unbekannt | – | Grants 25% increased Flinch Resistance while at maximum Rate of Fire. |
| Symmetry | primary | unbekannt | – | Grants 10 Reload Speed and 10 Handling. |
| Tarrabah | primary | keine | – | Reloading after scoring kills with Tarrabah overfills the magazine from reserves based on the number of Kills scored. |
| Telesto | special | Timing | Magazin 4 → 7, Shots 16 → 19, Zeit bis leer 24,7 → 27,5 s, rpm 43 → 43 | Increases the Magazine Size by 3 (4🠚7) and grants 40 Ammo Generation. |
| The Chaperone | special | unbekannt | – | Scoring 3 Precision Hits within 2 seconds of each refills 1 Ammo into the Magazine from thin air. |
| The Colony | heavy | Timing | Magazin 7 → 8, Shots 24 → 25, Zeit bis leer 14,8 → 15,2 s, rpm 139 → 139 | Increases Magazine Size by 1 (7🠚8) and grants 30 Ammo Generation. |
| The Fourth Horseman | special | Timing | Magazin 4 → 5, Shots 20 → 20, Zeit bis leer 12,2 → 12,1 s, rpm 109 → 105 | Grants 40 Reload Speed and Increases Magazine Size by 1 (4🠚5) |
| The Jade Rabbit | primary | unbekannt | – | Grants 30 Stability. |
| The Last Word | primary | unbekannt | – | Upon readying the weapon after scoring kills with your other Weapons: |
| The Manticore | primary | keine | – | While airborne, any kill or 5 hits against an Elite, Miniboss, or Boss refills 12 ammo and grants a 15HP Void Overshield |
| The Navigator | special | unbekannt | – | Hold [Reload] to activate Grapple Tangle mode. |
| The Wardcliff Coil | heavy | keine | – | Grants some tracking to the rockets I guess? |
| Third Iteration | primary | unbekannt | – | Precision Kills with Amalgamation Rounds trigger an explosion dealing 145 [?] damage in a 5 meter radius, while also app |
| Thorn | primary | keine | – | Passively grants 15 Range, 5 Stability, and 5 Airborne Effectiveness. |
| Thunderlord | heavy | Timing | Magazin 62 → 379, Shots 379 → 379, Zeit bis leer 57,6 → 32,5 s, rpm 627 → 698 | Triggering a Lightning Strike refills 5 ammo from reserves. |
| Ticuu's Divination | primary | unbekannt | – | Triggering Sacred Flame explosions grants one stack of 'Causality Quiver' for 5.5 seconds. Marking enemies with Sacred F |
| Tractor Cannon | heavy | Timing | Magazin 4 → 7, Shots 15 → 18, Zeit bis leer 13,7 → 14,2 s, rpm 91 → 91 | Increases Magazine Size by 3 (4🠚7) and grants 50 Ammo Generation. |
| Traveler's Chosen | primary | Timing | Magazin 15 → 17, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 300 → 300 | Increases Magazine Size by 2 (15🠚17) |
| Trespasser | primary | unbekannt | – | Grants the Tunnel Vision trait: |
| Trinity Ghoul | primary | unbekannt | – | Decreases Draw Time by 15% (756ms🠚633ms). |
| Truth | heavy | Schaden | – | Grants stacks of 'Reaper's Tithe' based on the number of simultaneously killed enemies. Maximum of 4 stacks. (e.g. tripl |
| Verglas Curve | primary | unbekannt | – | Applying Freeze or Slow to a target decreases Draw Time by 35% (567ms🠚368ms) for ? seconds. |
| Vexcalibur | special | unbekannt | – | Grants the Grave Robber trait: |
| Vigilance Wing | primary | unbekannt | – | Grants the Ensemble trait: |
| Whisper of the Worm | heavy | Schaden | – | Grants 30 Reload Speed. |
| Wicked Implement | primary | unbekannt | – | Stasis Shards grant 7 ammo on pickup that can overfill the magazine, up to 100% capacity. |
| Winterbite | heavy | keine | – | Killing Frozen Enemies or Shattering a Stasis Crystal with the weapon grants a Stack of Frost Armor. |
| Xenophage | heavy | unbekannt | – | Weapon Kills grant a Stack of Rampage. Maximum of 3 Stacks. Stacks expire one at a time every 🡅4.5 seconds. |

## Lücken

| Waffe | Typ | Grund |
| --- | --- | --- |
| Alethonym | grenadeLauncher | kein Timing: keine passende Quantum-Zeile (nur „Passive“, „Spam“) |
| Anarchy | grenadeLauncher | keine Aegis-Zeile ohne fremde Annahmen |
| Barrow-Dyad | submachineGun | keine Aegis-Zeile ohne fremde Annahmen |
| Black Talon | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Cerberus+1 | autoRifle | kein Timing: keine passende Quantum-Zeile (nur „normal, close range“, „normal, close range“, „normal, far range“, „normal, far range“, „cata, close range“, „cata, close range“, „cata, far range“, „cata, far range“) |
| Choir of One | autoRifle | Skala Aegis gegen Quantum weicht um 4.4 % ab |
| Cull's Shadow | fusionRifle | Skala Aegis gegen Quantum weicht um 25.8 % ab |
| Dead Man's Tale | scoutRifle | Skala Aegis gegen Quantum weicht um 19.4 % ab |
| Deathbringer | rocketLauncher | Skala Aegis gegen Quantum weicht um 51.4 % ab |
| Divinity | traceRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Duality | shotgun | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine passende Quantum-Zeile (nur „cata, pellet“, „cata, slug“, „cata, On Black Wings x3“) |
| Ergo Sum | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Ex Diris | grenadeLauncher | kein Timing: Aegis: kein Reload in den Notizen; keine passende Quantum-Zeile (nur „No Enrage“, „Max Enrage“) |
| Fafnir | linearFusionRifle | kein Timing: Aegis: kein Reload in den Notizen; keine Quantum-Zeile |
| Fighting Lion | grenadeLauncher | Skala Aegis gegen Quantum weicht um 20.5 % ab |
| Final Warning | sidearm | Skala Aegis gegen Quantum weicht um 4.6 % ab |
| Finality's Auger | linearFusionRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; Quantum: ohne Magazin, Munition oder Reload ({"totalDamage":"#VALUE!","totalShots":"???","timeToEmptySeconds":"#NUM!"}) |
| Grand Overture | machineGun | Skala Aegis gegen Quantum weicht um 12.9 % ab |
| Graviton Lance | pulseRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Graviton Spike | handCannon | Skala Aegis gegen Quantum weicht um 87.9 % ab |
| Heartshadow | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Heirloom | bow | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Ice Breaker | sniperRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; Quantum: ohne Magazin, Munition oder Reload ({"totalShots":"N/A","reloadSeconds":"N/A"}) |
| Malfeasance | handCannon | Skala nicht prüfbar: keine vergleichbaren Werte |
| Merciless | fusionRifle | Skala Aegis gegen Quantum weicht um 80.0 % ab |
| Outbreak Perfected | pulseRifle | Skala Aegis gegen Quantum weicht um 299.4 % ab |
| Praxic Blade | sword | kein Timing: keine Quantum-Zeile |
| Prometheus Lens | traceRifle | kein Timing: keine Quantum-Zeile |
| Revision Zero | pulseRifle | Skala Aegis gegen Quantum weicht um 130.7 % ab |
| Riskrunner | submachineGun | Skala Aegis gegen Quantum weicht um 3.4 % ab |
| Salvation's Grip | grenadeLauncher | Skala Aegis gegen Quantum weicht um 58.8 % ab |
| Skyburner's Oath | scoutRifle | keine Aegis-Zeile ohne fremde Annahmen |
| SUROS Regime | autoRifle | kein Timing: keine passende Quantum-Zeile (nur „Spinning Up“, „Dual Speed Receiver“) |
| Tessellation | fusionRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| The Huckleberry | submachineGun | keine Aegis-Zeile ohne fremde Annahmen |
| The Lament | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| The Prospector | grenadeLauncher | Skala Aegis gegen Quantum weicht um 23.1 % ab |
| The Queenbreaker | linearFusionRifle | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine passende Quantum-Zeile (nur „Marksman Sights“, „Combat Sights“) |
| Tommy's Matchbook | autoRifle | Skala Aegis gegen Quantum weicht um 49.9 % ab |
| Touch of Malice | scoutRifle | Skala Aegis gegen Quantum weicht um 57.1 % ab |
| Turncoat | handCannon | kein Timing: keine Quantum-Zeile |
| Vex Mythoclast | fusionRifle | Skala Aegis gegen Quantum weicht um 17.4 % ab |
| Wavesplitter | traceRifle | keine Aegis-Zeile ohne fremde Annahmen |
| Whirling Ovation | rocketLauncher | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Wish-Ender | bow | Skala Aegis gegen Quantum weicht um 64.2 % ab |
| Wish-Keeper | bow | keine Aegis-Zeile ohne fremde Annahmen |
| Witherhoard | grenadeLauncher | kein Timing: keine passende Quantum-Zeile (nur „passive“, „passive“, „passive, ground“, „cata, single blight, boss“, „cata, single blight, floor“, „double blight“, „spamming, single blight“, „spamming, double blight“) |
| Wolfsbane | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Worldline Zero | sword | keine Aegis-Zeile ohne fremde Annahmen |

## Nicht genutzte Aegis-Zeilen

| Waffe | Annahmen | Grund |
| --- | --- | --- |
| Ager's Scepter | average, Will Given Form | Katalysator: Will Given Form |
| Ager's Scepter | average, Will Given Form, Harsh Refraction | Katalysator: Will Given Form; Artefakt: Harsh Refraction |
| Anarchy | average, per trap, double stick, Jolting Feedback | Katalysator: Jolting Feedback |
| Barrow-Dyad | average, Taken Ambition, with Blighted Seekers, Peacekeepers, Target Lock | Exotic-Rüstung: Peacekeepers; fremder Perk: Target Lock |
| Barrow-Dyad | average, Taken Ambition, with Blighted Seekers, Target Lock | fremder Perk: Target Lock |
| Black Talon | single projectile | ohne light der Basiszeile |
| Choir of One | hitscan | ohne projectile - spaced (~9m) der Basiszeile |
| Choir of One | projectile - point blank | ohne projectile - spaced (~9m) der Basiszeile |
| Cull's Shadow | average, with corruption | gleiche Annahmen wie die Basiszeile |
| Cull's Shadow | with corruption | gleiche Annahmen wie die Basiszeile |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt, first mag | Katalysator: Networked Targeting x5 |
| Delicate Tomb | ADS | ohne hipfire der Basiszeile |
| Deterministic Chaos | average, with volatile damage, excludes weaken, Target Lock, single mag | Katalysator: Target Lock |
| Devil's Ruin | Pyrogenesis, Collective Action | Katalysator-Zeile mit kleinerem Wert (×0,350): anderer Modus |
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
| Final Warning | ADS tap fire | nicht modelliert: ADS tap fire |
| Finality's Auger | Ruinscribe Turret Mode, marked, entire turret duration | nicht modelliert: marked |
| Forerunner | The Rock, excludes impact | Katalysator: The Rock |
| Grand Overture |  | ohne Missile Loaded, Volley Ready der Basiszeile |
| Graviton Lance | burst, Vorpal Weapon | Katalysator: Vorpal Weapon |
| Graviton Spike | arc mode | ohne stasis mode der Basiszeile |
| Graviton Spike | average, overcharging both modes, typical boss model, Temporal Alignment | nicht modelliert: Temporal Alignment |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag, pre-stacked using heavy burst | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Heartshadow | heavy, Shot in the Dark, weaken excluded | ohne light der Basiszeile |
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
| Salvation's Grip |  | ohne average, charged der Basiszeile |
| Salvation's Grip | average, charged, Hail the Storm | Artefakt: Hail the Storm |
| Skyburner's Oath | ADS, Cabal | nicht modelliert: Cabal |
| Skyburner's Oath | average, hipfire, with ignitions, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Skyburner's Oath | average, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Still Hunt | Cayde's Retribution, all three shots | gleiche Annahmen wie die Basiszeile |
| Still Hunt | Cayde's Retribution, Celestial Nighthawk | Exotic-Rüstung: Celestial Nighthawk |
| SUROS Regime | average, Spinning Up | ohne Dual Speed Receiver der Basiszeile |
| Symmetry | Arc Seeker Mode, Dynamic Charge x10 | gleiche Annahmen wie die Basiszeile |
| Symmetry | Arc Seeker Mode, Dynamic Charge x20 | gleiche Annahmen wie die Basiszeile |
| Tarrabah | Ravenous Beast | gleiche Annahmen wie die Basiszeile |
| Tarrabah | average, Ravenous Beast, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Tessellation | Property: Irreducible, Transcendent, Transcendence bonus included | nicht modelliert: Transcendent |
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
| The Queenbreaker | burst, Combat Sights | ohne Marksman Sights der Basiszeile |
| Third Iteration | Amalgamation Round | ohne precision der Basiszeile |
| Thorn | Illegally Modded Holster, with poison, Soul Devourer, 14 shots | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Touch of Malice | blight | nicht modelliert: blight |
| Truth |  | ohne average, Prototype Truthseeker der Basiszeile |
| Turncoat | Overwhelming Power | nicht modelliert: Overwhelming Power |
| Wavesplitter | average, power cycling, Detonator Beam | Katalysator: Detonator Beam |
| Wavesplitter | average, Supercharged Battery, Detonator Beam | Katalysator: Detonator Beam |
| Whirling Ovation | full charge | ohne no charge der Basiszeile |
| Whirling Ovation | 2/3 charge | ohne no charge der Basiszeile |
| Whirling Ovation | 1/3 charge | ohne no charge der Basiszeile |
| Wish-Keeper | Vorpal Weapon | fremder Perk: Vorpal Weapon |
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
