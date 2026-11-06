# Waffen-Import: Prüftabelle

Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.

Stand: Aegis 2026-10-20, Quantum 2026-10-20 (Quantum nennt keinen Patch pro Zeile), Manifest 245114.26.10.13.2000-1-bnet.66137.

Umfang: exotische Special- und Heavy-Waffen. **23 Pakete**, 114 Items, 4 Lücken.

## Pakete

Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.

| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anarchy | grenadeLauncher | arc | average, per trap, double stick, Jolting Feedback (2 Shots) | 2.912,3 | Quantum | 29 | 6 | 2,08 s | 150,0 s | – → 12 | 13.768,3 % | Override: Aegis misst nur mit Katalysator (Jolting Feedback). Quantum ohne ihn: „double-stick“, 84.458 für 29 Granaten = 2912 pro Granate, zwei Fallen kleben, neu schießen, wenn sie auslaufen. Katalysator: Aegis 3368,5 ÷ Quantum 2912 = ×1,157 (Jolt).; Timing aus Zeile heavies-grenade-launcher-anarchy-double-stick (Override); Timing nur aus Quantum; Schaden pro Shot 2.912,3 (Override); Skala weicht um 13768.3 % ab; Aegis gilt (Override) |
| Cerberus+1 | autoRifle | kinetic | point blank (1 Shot) | 92,6 | Quantum |  | 31 | 1,12 s | – | – → 360 | 0,5 % | Override: Aegis misst „point blank“; dazu passt Quantums „normal, close range“ (Precision 93 gegen Aegis 92,6 pro Schuss).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-auto-rifle-cerberus-1-normal-close-range-2 (Override); Timing nur aus Quantum |
| Cull's Shadow | fusionRifle | kinetic | average, with corruption (6 Shots) | 1.095,8 | Aegis | 24 | 6 | 1,98 s | 27,3 s | – → 58 | 0,0 % | Override: Optimal gespielt mit Corruption, wie Aegis Sustained (Base 1096 = Weapons „average, with corruption“ 1095,8).; Timing aus Zeile cull-s-shadow-with-corruption (Override); Timing nur aus Aegis |
| Dead Man's Tale | scoutRifle | kinetic | Vorpal Weapon (1 Shot) | 188,7 | Quantum |  | 14 | 0,33 s | – | 120 → 120 | 19,4 % | Override: Aegis' Mittel enthält Vorpal Weapon und die Cranial-Spike-Stacks (188,7), Quantums „Base“ nicht (158); Aegis gilt. Catalyst aus der Hüfte: +27 % bei x5 Cranial Spike (Clarity), Timing aus Quantums Zeile „cata, x5 Cranial Spike“ (140 rpm, Reload 0,29 s).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-scout-rifle-dead-man-s-tale-base (Override); Timing nur aus Quantum; Skala weicht um 19.4 % ab; Aegis gilt (Override); Katalysator-Timing: ∞ Shots, Magazin 14, Zeit bis leer – |
| Deathbringer | rocketLauncher | void | max height (1 Shot) | 3.900,1 | Quantum | 11 | 1 | 2,35 s | 23,5 s | 46 → 60.000 | 0,0 % | Override: Aegis misst „max height“ (3900); dazu passt Quantums „max distance damage“ (3899), nicht „direct impact“. Der Catalyst lässt den Höchstschaden nur 1 s früher erreichen; gemessen wird schon der Höchstschaden: keine Wirkung.; Timing aus Zeile heavies-rocket-launcher-deathbringer-max-distance-damage (Override); Timing nur aus Quantum |
| Fafnir | linearFusionRifle | void | keine (1 Shot) | 2.528,4 | Quantum | 9 | 3 | 1,77 s | 16,3 s | – → 38 | 0,0 % | Override: Aegis Sustained zählt 18 Treffer (Detonation und Quantum Nova) für 9 Munition, Magazine 3-3-3, 1,6 s zwischen Schüssen, 16,333 s bis leer. Daraus der Reload: (16,333 − 6 × 1,6) ÷ 2 = 3,37 s nach dem letzten Schuss, also 1,77 s nach dessen Intervall. Grundwert 2528 pro Munition (Base = Weapons-Zeile).; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum |
| Finality's Auger | linearFusionRifle | solar | Linear Fusion Mode (1 Shot) | 1.277,8 | Aegis | 21 | 6 | 1,80 s | 23,5 s | 58 → 56 | 0,0 % | Override: Aegis Sustained misst 21 Schuss in Magazinen à 6 mit 1800 ms Reload; Bait and Switch (Katalysator) steckt nicht im Grundwert (Sustained 1278 = Weapons 1277,8) und ändert das Timing nicht.; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing aus Zeile finality-s-auger-bait-and-switch-linear-fusion-mode (Override); Timing nur aus Aegis |
| Ice Breaker | sniperRifle | solar | keine (1 Shot) | 1.223,4 | Aegis | 10 | 10 | 0,00 s | 11,1 s | 49 → 49 | 0,0 % | Override: Aegis Sustained misst 10 Schuss ohne Reload (Ice Breaker hat keine Reserves); Sniper's Meditation (Artifact) steckt nicht im Grundwert (Sustained 1223 = Weapons 1223,4).; Timing aus Zeile ice-breaker-sniper-s-meditation (Override); Timing nur aus Aegis |
| Jötunn | fusionRifle | solar | average, successive shots (10 Shots) | 1.048,3 | Aegis | 24 | 5 | 2,07 s | 31,7 s | – → 50 | 0,0 % | Override: Cornered braucht 2 Gegner in der Nähe, Incandescent Kills; gegen einen Boss ohne Adds keine Wirkung.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; ⚠ Timing mit Katalysator: keine Quelle ohne; der Katalysator ändert laut Clarity Magazin oder Reload, nicht die Munition; Timing nur aus Aegis |
| Lord of Wolves | shotgun | solar | average, includes ignition/scorch (120 Shots) | 186,1 | Quantum | 189 | 30 | 0,92 s | 22,6 s | 640 → 660 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „ADS“; Timing nur aus Quantum; Katalysator-Timing: 189 Shots, Magazin 30, Zeit bis leer 21,3 s |
| New Land Beyond | sniperRifle | kinetic | no stacks (20 Shots) | 1.029,0 | Quantum | 40 | 8 | 1,98 s | 72,7 s | 32 → 36 | 0,0 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „The Master 0x“; Timing nur aus Quantum |
| New Malpais | pulseRifle | strand | average, 3 bursts, includes suspend, excludes unravel (3 Shots) | 1.159,9 | Aegis | 27 | 7 | 1,38 s | 24,7 s | – → 67 | 0,0 % | Timing nur aus Aegis |
| No Time to Explain | pulseRifle | kinetic | burst (1 Shot) | 123,1 | Quantum |  | 24 | 1,16 s | – | 340 → 340 | 0,1 % | ⚠ Timing aus der Quantum-Zeile „w/ Time-Slip Portal,cata“ mit Katalysator; Timing nur aus Quantum |
| Prometheus Lens | traceRifle | solar | average, with ignition (95 Shots) | 36,5 | Quantum | 500 | 100 | 1,44 s | 39,0 s | – → 900 | – | Override: Keine Timing-Zeile. Manifest: Magazin 100. Quantum misst Trace Rifles mit 1000 rpm laut Manifest durchweg mit 900 rpm und Reload 1,44 s; Special-Traces tragen 5 Magazine (Ruinous Effigy 94 → 470, The Navigator 97 → 485, Coldheart 101 → 505, Wavesplitter 100 → 500), also 500 Schuss. Aegis' Wert pro Schuss enthält die Ignitions („average, with ignition“). Catalyst: Stabilität, Handling und Kill-Explosionen, gegen einen Boss ohne Adds keine Wirkung.; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum |
| Revision Zero | pulseRifle | kinetic | burst - heavy 2-burst mode, Vorpal Weapon (1 Shot) | 76,2 | Quantum |  | 26 | 1,16 s | – | 450 → 324 | 17,4 % | Override: Aegis misst den schweren 2er-Burst mit Vorpal Weapon (wipe 2298 = 2 × 1149); pro Kugel 76,2 gegen Quantum 64 ohne Vorpal (×1,15 = 73,6); Aegis gilt. Catalyst: von vier Refits ist Fourth Time's The Charm der einzige, der am Boss wirkt (4 Precision Hits laden 2 Schuss nach); Timing aus Quantums „2-burst, mix, FTTC“ (Magazin 50 statt 26).; Aegis misst einen Burst aus 2 Kugeln (Override); Paket pro Kugel; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-pulse-rifle-revision-zero-2-burst (Override); Timing nur aus Quantum; abgeleitete Feuerrate 324 statt 450 rpm; Skala weicht um 17.4 % ab; Aegis gilt (Override); Katalysator-Timing: ∞ Shots, Magazin 50, Zeit bis leer – |
| Skyburner's Oath | scoutRifle | solar | ADS, Cabal (1 Shot) | 114,3 | Quantum |  | 20 | 1,24 s | – | 150 → 150 | 31,2 % | Override: ADS ohne Ignitions: Aegis 114,3 = Quantum „ADS“ 116 (1,5 %); „Cabal“ ändert diesen Wert also nicht.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-scout-rifle-skyburner-s-oath-ads (Override); Timing nur aus Quantum; Skala weicht um 31.2 % ab; Aegis gilt (Override) |
| SUROS Regime | autoRifle | kinetic | average, Spinning Up (36 Shots) | 26,8 | Quantum |  | 34 | 1,12 s | – | – → 712 | 0,1 % | Override: Optimal gespielt: Spinning Up macht mehr Schaden pro Sekunde (26,8 × 712 rpm) als Dual Speed Receiver (41,3 × 400 rpm); Timing aus Quantums Zeile desselben Modus.; Timing aus Zeile primaries-auto-rifle-suros-regime-spinning-up (Override); Timing nur aus Quantum |
| Sweet Business | autoRifle | kinetic | average, with explosive rounds (150 Shots) | 32,6 | Quantum |  | 150 | 2,00 s | – | 856 → 856 | 1,3 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Intrinsic füllt das Magazin auf (Clarity): ohne Reload; Timing aus der Quantum-Zeile „average per mag“; Timing nur aus Quantum |
| The Manticore | submachineGun | void | average, Hover Mode (104 Shots) | 41,9 | Quantum |  | 42 | 1,19 s | – | 900 → 900 | 2,1 % | Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus der Quantum-Zeile „Grounded“; Timing nur aus Quantum |
| Third Iteration | scoutRifle | void | precision (1 Shot) | 112,6 | Quantum |  | 16 | 3,41 s | – | 200 → 200 | 0,4 % | Override: Die Explosion braucht Precision Kills; gegen einen Boss ohne Adds keine Wirkung.; Timing aus der Quantum-Zeile „Base“; Timing nur aus Quantum |
| Touch of Malice | scoutRifle | kinetic | keine (1 Shot) | 141,5 | Quantum |  | 11 | 1,24 s | – | 260 → 260 | 0,4 % | Override: Optimal gespielt mit der letzten Patrone (Touch of Malice): Aegis nennt sie „2135 final“ bei 920 für eine normale Kugel; pro Shot 2135 ÷ 15,09 (full modifiers) = 141,5. Quantum bestätigt: 142 („always at 1 round“). Katalysator: Precision Instrument erreicht nach 6 Treffern +25 %; die letzte Patrone feuert ohne Reload, die Stacks bleiben (Clarity), also ×1,25.; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile primaries-scout-rifle-touch-of-malice-touch-of-malice-tom (Override); Timing nur aus Quantum; Schaden pro Shot 141,5 (Override) |
| Turncoat | handCannon | void | average (12 Shots) | 127,4 | Quantum |  | 13 | 1,64 s | – | – → 140 | – | Override: Keine Timing-Zeile. Manifest: 140 rpm, Magazin 13. Reload 1,64 s wie bei Quantum für jede Hand Cannon mit 140 rpm (Ace of Spades, Lumina, Thorn, Hawkmoon); Quantum rechnet den Reload pro Waffentyp, unabhängig vom Reload-Stat. Schaden aus Aegis „average“.; Timing aus Override-Werten (Manifest, Quantum); Timing nur aus Quantum |
| Wavesplitter | traceRifle | void | average, power cycling, Detonator Beam (100 Shots) | 39,0 | Quantum | 500 | 100 | 1,44 s | 38,8 s | 900 → 906 | 0,0 % | Override: Aegis misst nur mit Katalysator (Detonator Beam); Quantum „average“ gilt: 39 pro Schuss (Precision).; Katalysator ändert das Timing (Clarity): Aegis „Sustained“ und Quantum-Zeilen mit Katalysator nicht genutzt; Timing aus Zeile specials-trace-rifle-wavesplitter-average (Override); Timing nur aus Quantum; Schaden pro Shot 39,0 (Override) |

## Items

Waffen aus einer Item-Datei (B4a): Struktur von Hand, Zahlen als Verweise auf die Snapshots. **Prüfen**, wenn ein Text sich seit dem Schreiben der Datei geändert hat.

Sätze mit Zahl ohne `$clarity`- oder `notModelled`-Zitat (ADR 0019): **820**. Die Zahl sinkt je Block.

| Waffe | Datei | Sätze ohne Regel | Prüfen |
| --- | --- | ---: | --- |
| Ace of Spades | `src/data/items/weapons/ace-of-spades.json` | 7 | – |
| Ager's Scepter | `src/data/items/weapons/ager-s-scepter.json` | 7 | – |
| Alethonym | `src/data/items/weapons/alethonym.json` | 0 | – |
| Arbalest | `src/data/items/weapons/arbalest.json` | 2 | – |
| Bad Juju | `src/data/items/weapons/bad-juju.json` | 8 | – |
| Barrow-Dyad | `src/data/items/weapons/barrow-dyad.json` | 65 | – |
| Bastion | `src/data/items/weapons/bastion.json` | 6 | – |
| Black Talon | `src/data/items/weapons/black-talon.json` | 4 | – |
| Borealis | `src/data/items/weapons/borealis.json` | 6 | – |
| Buried Bloodline | `src/data/items/weapons/buried-bloodline.json` | 5 | – |
| Centrifuse | `src/data/items/weapons/centrifuse.json` | 9 | – |
| Choir of One | `src/data/items/weapons/choir-of-one.json` | 15 | – |
| Cloudstrike | `src/data/items/weapons/cloudstrike.json` | 0 | – |
| Coldheart | `src/data/items/weapons/coldheart.json` | 12 | – |
| Collective Obligation | `src/data/items/weapons/collective-obligation.json` | 5 | – |
| Conditional Finality | `src/data/items/weapons/conditional-finality.json` | 0 | – |
| Crimson | `src/data/items/weapons/crimson.json` | 7 | – |
| Cryosthesia 77K | `src/data/items/weapons/cryosthesia-77k.json` | 2 | – |
| D.A.R.C.I. | `src/data/items/weapons/d-a-r-c-i.json` | 12 | – |
| Dead Messenger | `src/data/items/weapons/dead-messenger.json` | 3 | – |
| Delicate Tomb | `src/data/items/weapons/delicate-tomb.json` | 6 | – |
| Deterministic Chaos | `src/data/items/weapons/deterministic-chaos.json` | 0 | – |
| Devil's Ruin | `src/data/items/weapons/devil-s-ruin.json` | 8 | – |
| Divinity | `src/data/items/weapons/divinity.json` | 0 | – |
| Dragon's Breath | `src/data/items/weapons/dragon-s-breath.json` | 0 | – |
| Duality | `src/data/items/weapons/duality.json` | 3 | – |
| Edge of Action | `src/data/items/weapons/edge-of-action.json` | 10 | – |
| Edge of Concurrence | `src/data/items/weapons/edge-of-concurrence.json` | 10 | – |
| Edge of Intent | `src/data/items/weapons/edge-of-intent.json` | 9 | – |
| Ergo Sum | `src/data/items/weapons/ergo-sum.json` | 4 | – |
| Eriana's Vow | `src/data/items/weapons/eriana-s-vow.json` | 6 | – |
| Euphony | `src/data/items/weapons/euphony.json` | 0 | – |
| Ex Diris | `src/data/items/weapons/ex-diris.json` | 0 | – |
| Eyes of Tomorrow | `src/data/items/weapons/eyes-of-tomorrow.json` | 7 | – |
| Fighting Lion | `src/data/items/weapons/fighting-lion.json` | 0 | – |
| Final Warning | `src/data/items/weapons/final-warning.json` | 9 | – |
| Forerunner | `src/data/items/weapons/forerunner.json` | 5 | – |
| Gjallarhorn | `src/data/items/weapons/gjallarhorn.json` | 9 | – |
| Grand Overture | `src/data/items/weapons/grand-overture.json` | 0 | – |
| Graviton Lance | `src/data/items/weapons/graviton-lance.json` | 9 | – |
| Graviton Spike | `src/data/items/weapons/graviton-spike.json` | 1 | – |
| Hard Light | `src/data/items/weapons/hard-light.json` | 3 | – |
| Hawkmoon | `src/data/items/weapons/hawkmoon.json` | 10 | – |
| Heartshadow | `src/data/items/weapons/heartshadow.json` | 0 | – |
| Heir Apparent | `src/data/items/weapons/heir-apparent.json` | 8 | – |
| Heirloom | `src/data/items/weapons/heirloom.json` | 11 | – |
| Hierarchy of Needs | `src/data/items/weapons/hierarchy-of-needs.json` | 19 | – |
| Izanagi's Burden | `src/data/items/weapons/izanagi-s-burden.json` | 13 | – |
| Khvostov 7G-0X | `src/data/items/weapons/khvostov-7g-0x.json` | 0 | – |
| Le Monarque | `src/data/items/weapons/le-monarque.json` | 0 | – |
| Legend of Acrius | `src/data/items/weapons/legend-of-acrius.json` | 0 | – |
| Leviathan's Breath | `src/data/items/weapons/leviathan-s-breath.json` | 2 | – |
| Lodestar | `src/data/items/weapons/lodestar.json` | 12 | – |
| Lorentz Driver | `src/data/items/weapons/lorentz-driver.json` | 9 | – |
| Lumina | `src/data/items/weapons/lumina.json` | 7 | – |
| Malfeasance | `src/data/items/weapons/malfeasance.json` | 0 | – |
| Merciless | `src/data/items/weapons/merciless.json` | 8 | – |
| Microcosm | `src/data/items/weapons/microcosm.json` | 5 | – |
| MIDA Multi-Tool | `src/data/items/weapons/mida-multi-tool.json` | 11 | – |
| Monte Carlo | `src/data/items/weapons/monte-carlo.json` | 10 | – |
| Necrochasm | `src/data/items/weapons/necrochasm.json` | 10 | – |
| One Thousand Voices | `src/data/items/weapons/one-thousand-voices.json` | 0 | – |
| Osteo Striga | `src/data/items/weapons/osteo-striga.json` | 0 | – |
| Outbreak Perfected | `src/data/items/weapons/outbreak-perfected.json` | 0 | – |
| Parasite | `src/data/items/weapons/parasite.json` | 6 | – |
| Polaris Lance | `src/data/items/weapons/polaris-lance.json` | 3 | – |
| Quicksilver Storm | `src/data/items/weapons/quicksilver-storm.json` | 0 | – |
| Rat King | `src/data/items/weapons/rat-king.json` | 8 | – |
| Red Death Reformed | `src/data/items/weapons/red-death-reformed.json` | 12 | – |
| Riskrunner | `src/data/items/weapons/riskrunner.json` | 9 | – |
| Ruinous Effigy | `src/data/items/weapons/ruinous-effigy.json` | 11 | – |
| Salvation's Grip | `src/data/items/weapons/salvation-s-grip.json` | 1 | – |
| Service of Luzaku | `src/data/items/weapons/service-of-luzaku.json` | 13 | – |
| Slayer's Fang | `src/data/items/weapons/slayer-s-fang.json` | 0 | – |
| Sleeper Simulant | `src/data/items/weapons/sleeper-simulant.json` | 3 | – |
| Still Hunt | `src/data/items/weapons/still-hunt.json` | 10 | – |
| Sturm | `src/data/items/weapons/sturm.json` | 13 | – |
| Sunshot | `src/data/items/weapons/sunshot.json` | 8 | – |
| Symmetry | `src/data/items/weapons/symmetry.json` | 15 | – |
| Tarrabah | `src/data/items/weapons/tarrabah.json` | 18 | – |
| Telesto | `src/data/items/weapons/telesto.json` | 6 | – |
| Tessellation | `src/data/items/weapons/tessellation.json` | 12 | – |
| The Chaperone | `src/data/items/weapons/the-chaperone.json` | 11 | – |
| The Colony | `src/data/items/weapons/the-colony.json` | 7 | – |
| The Fourth Horseman | `src/data/items/weapons/the-fourth-horseman.json` | 6 | – |
| The Jade Rabbit | `src/data/items/weapons/the-jade-rabbit.json` | 7 | – |
| The Lament | `src/data/items/weapons/the-lament.json` | 0 | – |
| The Last Word | `src/data/items/weapons/the-last-word.json` | 14 | – |
| The Navigator | `src/data/items/weapons/the-navigator.json` | 7 | – |
| The Prospector | `src/data/items/weapons/the-prospector.json` | 5 | – |
| The Queenbreaker | `src/data/items/weapons/the-queenbreaker.json` | 4 | – |
| The Wardcliff Coil | `src/data/items/weapons/the-wardcliff-coil.json` | 3 | – |
| Thorn | `src/data/items/weapons/thorn.json` | 0 | – |
| Thunderlord | `src/data/items/weapons/thunderlord.json` | 7 | – |
| Ticuu's Divination | `src/data/items/weapons/ticuu-s-divination.json` | 10 | – |
| Tommy's Matchbook | `src/data/items/weapons/tommy-s-matchbook.json` | 9 | – |
| Tractor Cannon | `src/data/items/weapons/tractor-cannon.json` | 3 | – |
| Traveler's Chosen | `src/data/items/weapons/traveler-s-chosen.json` | 10 | – |
| Trespasser | `src/data/items/weapons/trespasser.json` | 5 | – |
| Trinity Ghoul | `src/data/items/weapons/trinity-ghoul.json` | 0 | – |
| Truth | `src/data/items/weapons/truth.json` | 5 | – |
| Two-Tailed Fox | `src/data/items/weapons/two-tailed-fox.json` | 0 | – |
| Verglas Curve | `src/data/items/weapons/verglas-curve.json` | 4 | – |
| Vex Mythoclast | `src/data/items/weapons/vex-mythoclast.json` | 0 | – |
| Vexcalibur | `src/data/items/weapons/vexcalibur.json` | 26 | – |
| Vigilance Wing | `src/data/items/weapons/vigilance-wing.json` | 9 | – |
| Whirling Ovation | `src/data/items/weapons/whirling-ovation.json` | 15 | – |
| Whisper of the Worm | `src/data/items/weapons/whisper-of-the-worm.json` | 24 | – |
| Wicked Implement | `src/data/items/weapons/wicked-implement.json` | 8 | – |
| Winterbite | `src/data/items/weapons/winterbite.json` | 0 | – |
| Wish-Ender | `src/data/items/weapons/wish-ender.json` | 9 | – |
| Wish-Keeper | `src/data/items/weapons/wish-keeper.json` | 49 | – |
| Witherhoard | `src/data/items/weapons/witherhoard.json` | 0 | – |
| Xenophage | `src/data/items/weapons/xenophage.json` | 6 | – |

## Optionen

Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.

| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |
| --- | --- | --- | --- | --- | --- | --- |
| Anarchy | Catalyst | Katalysator | ×1,157 | – | – | Faktor aus dem Text (Override) |
| Dead Man's Tale | Catalyst | Katalysator | ×1,270 | – | – | Faktor aus dem Text (Override) |
| Touch of Malice | Catalyst | Katalysator | ×1,250 | – | – | Faktor aus dem Text (Override) |

## Katalysatoren

Was der Katalysator gegen einen Boss tut, entscheiden die Quellen: **Schaden** (Option mit Faktor), **Timing** (Zeile mit Katalysator, gleiche Quelle und Ausführung, sonst Zahlen aus Clarity), **keine** (gemessen ohne Unterschied oder kein Schaden und Timing im Text), **unbekannt** (Clarity nennt Schaden oder Timing, keine Quelle misst es).

| Waffe | Munition | Wirkung | Timing ohne → mit | Text (Anfang) |
| --- | --- | --- | --- | --- |
| Anarchy | heavy | Schaden | – | Scoring 3 hits within 3 seconds of each causes the next damage instance to apply Jolt. |
| Cerberus+1 | primary | keine | – | Holding [Reload] within 7 seconds of scoring a kill grants the following benefits for 7 seconds: |
| Dead Man's Tale | primary | Schaden und Timing | Magazin 14 → 14, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 120 → 140 | While not Aiming Down Sights: |
| Deathbringer | heavy | keine | – | The initial Orb Damage is increased by 63%, allowing maximum damage to be reached 1 second sooner. |
| Fafnir | heavy | keine | – | Grants 35% Flinch Resistance after 1 second of Aiming Down Sights (ADS) without firing. Remains active until you're no l |
| Finality's Auger | heavy | unbekannt | – | Grants the Bait and Switch trait: |
| Jötunn | special | keine | – | Grants the Cornered trait: |
| Lord of Wolves | special | Timing | Magazin 30 → 30, Shots 189 → 189, Zeit bis leer 22,6 → 21,3 s, rpm 660 → 660 | Grants 20 Stability, 60 Reload Speed, and 15% decreased Reload Animation Duration. |
| New Land Beyond | special | unbekannt | – | While above 20 stacks of The Master, Bullseye Bolster duration is increased by ? seconds and the magazine is refilled on |
| New Malpais | special | unbekannt | – | Embedded projectiles Unravel targets for 8 seconds upon detonation. |
| No Time to Explain | primary | keine | – | Delay between Time-Slip Portal bursts is 47% shorter (1.25/s🠚0.85/s). |
| Prometheus Lens | special | keine | – | Grants 20 Stability and 20 Handling. |
| Revision Zero | primary | Timing | Magazin 26 → 50, Shots ∞ → ∞, Zeit bis leer – → – s, rpm 324 → 324 | Grants the Under Pressure trait: |
| Skyburner's Oath | primary | unbekannt | – | Grants 20 Reload Speed. |
| SUROS Regime | primary | keine | – | Grants 50 Recoil Direction and doubles the healing chance (25%🠚50%). |
| Sweet Business | primary | keine | – | Grants 25% increased Flinch Resistance while at maximum Rate of Fire. |
| The Manticore | primary | keine | – | While airborne, any kill or 5 hits against an Elite, Miniboss, or Boss refills 12 ammo and grants a 15HP Void Overshield |
| Third Iteration | primary | keine | – | Precision Kills with Amalgamation Rounds trigger an explosion dealing 145 [?] damage in a 5 meter radius, while also app |
| Touch of Malice | primary | Schaden | – | Direct Weapon Hits grant a stack of Precision Instrument for 1.25 seconds. Maximum of 6 stacks. Reloading the weapon or  |
| Turncoat | primary | keine | – | Upon exiting Void Empowerment, gain a Void Overshield for 10 seconds (15 with Echo of Persistence). |
| Wavesplitter | special | keine | – | Grants 10 Range and 30 Ammo Generation. |

## Lücken

| Waffe | Typ | Grund |
| --- | --- | --- |
| Praxic Blade | sword | kein Timing: keine Quantum-Zeile |
| The Huckleberry | submachineGun | keine Aegis-Zeile ohne fremde Annahmen |
| Wolfsbane | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Worldline Zero | sword | keine Aegis-Zeile ohne fremde Annahmen |

## Nicht genutzte Aegis-Zeilen

| Waffe | Annahmen | Grund |
| --- | --- | --- |
| Ager's Scepter | average, Will Given Form | Katalysator: Will Given Form |
| Ager's Scepter | average, Will Given Form, Harsh Refraction | Katalysator: Will Given Form; Artefakt: Harsh Refraction |
| Barrow-Dyad | average, Taken Ambition, with Blighted Seekers, Peacekeepers, Target Lock | Exotic-Rüstung: Peacekeepers |
| Black Talon | light | the item file uses another row |
| Choir of One | hitscan | the item file uses another row |
| Choir of One | projectile - point blank | the item file uses another row |
| Cull's Shadow |  | ohne average, with corruption der Basiszeile |
| Cull's Shadow | with corruption | ohne average der Basiszeile |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt | Katalysator: Networked Targeting x5 |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt, first mag | Katalysator: Networked Targeting x5 |
| Delicate Tomb | ADS | the item file uses another row |
| Deterministic Chaos | average, with volatile damage, excludes weaken, Target Lock, single mag | Katalysator: Target Lock |
| Devil's Ruin | Pyrogenesis, Collective Action | Katalysator: Collective Action |
| Devil's Ruin | Pyrogenesis | the item file uses another row |
| Divinity | average, Penance, excludes debuff, Jolting Feedback, Focused Fury | Katalysator: Jolting Feedback; Katalysator: Focused Fury |
| Duality | hipfire, body | the item file uses another row |
| Edge of Concurrence | Lightning Seeker | the item file uses another row |
| Ergo Sum | lightweight frame, Jagged Edge, 64 impact, heavy | the item file uses another row |
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
| Grand Overture |  | the item file uses another row |
| Graviton Lance | burst, Vorpal Weapon | Katalysator: Vorpal Weapon |
| Graviton Spike | arc mode | the item file uses another row |
| Graviton Spike | average, overcharging both modes, typical boss model, Temporal Alignment | the item file uses another row |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag, pre-stacked using heavy burst | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Heartshadow | light | the item file uses another row |
| Heirloom | average, 1/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, 2/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, fully charged, with ignition, catalyst | Katalysator: catalyst |
| Hierarchy of Needs | average, 2 rings, fireteam scaling | nicht modelliert: 2 rings; nicht modelliert: fireteam scaling |
| Ice Breaker | shatter ignition, includes shatter and frozen bonuses | nicht modelliert: shatter ignition |
| Izanagi's Burden | Honed Edge x4 | the item file uses another row |
| Lodestar | ADS, burst | the item file uses another row |
| Lord of Wolves | average, includes ignition/scorch, Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Malfeasance | average, with slugs, Vorpal Weapon | Katalysator: Vorpal Weapon |
| Malfeasance | Illegally Modded Holster, 17 shots, with slugs, blighted, Vorpal Weapon | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: blighted; Katalysator: Vorpal Weapon |
| Malfeasance | Illegally Modded Holster, 17 shots, with slugs, Vorpal Weapon | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); Katalysator: Vorpal Weapon |
| Merciless | Conserve Momentum x0, full mag | the item file uses another row |
| One Thousand Voices | average, Ember of Ashes | the item file uses another row |
| One Thousand Voices | average, catalyst | Katalysator: catalyst |
| One Thousand Voices | average, Ember of Ashes, catalyst | Katalysator: catalyst |
| One Thousand Voices | average, blighted, catalyst | nicht modelliert: blighted; Katalysator: catalyst |
| One Thousand Voices | average, Ember of Ashes, blighted, catalyst | nicht modelliert: blighted; Katalysator: catalyst |
| Osteo Striga | average, with successive poison, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Outbreak Perfected | average per burst - no nanites, Appended Mag, up to Rewind end | nicht modelliert: up to Rewind end |
| Polaris Lance | average, with ignitions, Ember of Ashes | the item file uses another row |
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
| Ruinous Effigy |  | the item file uses another row |
| Salvation's Grip | average, charged | the item file uses another row |
| Salvation's Grip | average, charged, Hail the Storm | Artefakt: Hail the Storm |
| Skyburner's Oath | average, hipfire, with ignitions, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Skyburner's Oath | average, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Still Hunt | Cayde's Retribution, all three shots | the item file uses another row |
| Still Hunt | Cayde's Retribution, Celestial Nighthawk | Exotic-Rüstung: Celestial Nighthawk |
| SUROS Regime | average, Dual Speed Receiver | ohne Spinning Up der Basiszeile |
| Symmetry | Arc Seeker Mode, Dynamic Charge x10 | the item file uses another row |
| Symmetry | Arc Seeker Mode, Dynamic Charge x20 | the item file uses another row |
| Tarrabah | Ravenous Beast | the item file uses another row |
| Tarrabah | average, Ravenous Beast, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Tessellation | Property: Irreducible, Transcendent, Transcendence bonus included | nicht modelliert: Transcendent |
| Tessellation | Property: Irreducible | the item file uses another row |
| The Huckleberry | average, Bull Rider | nicht modelliert: Bull Rider |
| The Huckleberry | average, Bull Rider, Peacekeepers | nicht modelliert: Bull Rider; Exotic-Rüstung: Peacekeepers |
| The Jade Rabbit | Fated Missile x15 | nicht modelliert: Fated Missile x15 |
| The Lament | heavy | the item file uses another row |
| The Lament | average, 2L1H1R, Burning Ambition | Katalysator: Burning Ambition |
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
| The Queenbreaker | Marksman Sights | the item file uses another row |
| Third Iteration | Amalgamation Round | ohne precision der Basiszeile |
| Thorn | Illegally Modded Holster, with poison, Soul Devourer, 14 shots | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Touch of Malice | blight | nicht modelliert: blight |
| Truth |  | the item file uses another row |
| Turncoat | Overwhelming Power | nicht modelliert: Overwhelming Power |
| Vex Mythoclast | Temporal Unlimiter | the item file uses another row |
| Wavesplitter | average, Supercharged Battery, Detonator Beam | Katalysator: Detonator Beam |
| Whirling Ovation | no charge | the item file uses another row |
| Whirling Ovation | 2/3 charge | the item file uses another row |
| Whirling Ovation | 1/3 charge | the item file uses another row |
| Whisper of the Worm | Whispered Breathing | Katalysator: Whispered Breathing |
| Witherhoard | ground pool | the item file uses another row |
| Wolfsbane | Honed Edge, Jagged Edge, Nano-Assault HLLHLLHLLHLLH, Burning Ambition, includes ignition | gleiche Annahmen wie die Basiszeile |
| Wolfsbane | average, Honed Edge, Jagged Edge, light, Burning Ambition, includes ignition | ohne Nano-Assault HLLHLLHLLHLLH der Basiszeile |
| Worldline Zero | Temporal Sprint, heavy | nicht modelliert: Temporal Sprint |

## Auffällige Annahmen

Ähnliche Schreibweise (Stufe 1) und ohne Beleg eingeordnet (Stufe 5). Bitte prüfen.

| Waffe | Annahme | Einordnung |
| --- | --- | --- |
| Finality's Auger | marked | nicht modelliert, ohne Beleg |
| Ice Breaker | shatter ignition | nicht modelliert, ohne Beleg |
| Skyburner's Oath | Cabal | nicht modelliert, ohne Beleg |
| The Huckleberry | Bull Rider | nicht modelliert, ohne Beleg |
| Third Iteration | Amalgamation Round | Perk „Amalgamation Rounds“ (ähnliche Schreibweise) |
| Touch of Malice | blight | nicht modelliert, ohne Beleg |
| Turncoat | Overwhelming Power | nicht modelliert, ohne Beleg |
| Worldline Zero | Temporal Sprint | nicht modelliert, ohne Beleg |

## Kandidaten für neue Effects

Annahmen, die wir noch nicht abbilden, nach Zahl der Waffen.

| Annahme | Art | Waffen |
| --- | --- | --- |
| Peacekeepers | Exotic-Rüstung | The Huckleberry, The Manticore |
| blight | nicht modelliert | Touch of Malice |
| Bull Rider | nicht modelliert | The Huckleberry |
| Burning Ambition | fremder Perk | Skyburner's Oath |
| Cabal | nicht modelliert | Skyburner's Oath |
| marked | nicht modelliert | Finality's Auger |
| Overwhelming Power | nicht modelliert | Turncoat |
| shatter ignition | nicht modelliert | Ice Breaker |
| Temporal Sprint | nicht modelliert | Worldline Zero |

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
