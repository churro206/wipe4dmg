# Scorch und Ignition

Kategorie: Threshold Trigger, Damage over Time · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-20 · Vertrauen: mittel

## Kurzfassung

Scorch sind Stacks am Ziel. Ein gescorchtes Ziel nimmt Burn-Schaden in Ticks. Bei 100 Stacks folgt eine Ignition: eine Solar-Explosion als eigene Damage Instance. Danach sind alle Stacks weg, und für 1,6 s lässt sich kein neuer Scorch auftragen. One Thousand Voices erzeugt Scorch über seine Explosionen.

## Regeln

1. Scorch-Stacks addieren sich am Ziel.
2. **Burn:** Nach 0,5 s auf einem gescorchten Ziel kommt ein Tick, danach alle 0,56 s. Der zweite Tick kommt mit 0,93 s Abstand. Der Tick-Schaden steigt mit der Zahl der Stacks.
3. Burn-Schaden ist nicht tödlich.
4. **Ignition:** Erreicht ein Ziel 100 Stacks, folgt eine Ignition. Alle Stacks verfallen.
5. **Cooldown:** Nach einer Ignition lässt sich 1,6 s lang kein Scorch auftragen.
6. **Ember of Ashes:** Scorch-Stacks +50 %, aufgerundet (x10 → x15). Einige Quellen sind ausgenommen (Caliban's Hand, Tommy's Matchbook, Skyburner's Oath). Ember ändert weder Burn- noch Ignition-Schaden noch die Schwelle. Bei One Thousand Voices bestätigt Bungie x10 + 5 pro Explosion (Lightfall, Februar 2023).
7. **Herkunft zählt:** Trägt eine Waffe den Scorch auf, zählen Burn und Ignition als Waffenschaden. Sie profitieren dann von Waffen-Buffs wie Damage Perks, Weapons Stat und Radiant. Hinweis aus einem YouTube-Kommentar (unbestätigt): Die Ignition von One Thousand Voices allein macht 2499 Schaden, mit einer zweiten Scorch-Quelle wie Helion nur 1351. Das passt zu dieser Regel und zum Bonus von 31,6 %.
8. **One Thousand Voices:** Solar-Effekte, die die Waffe auslöst, machen 31,6 % mehr Schaden.
9. Ignition-Buffs wie Dawn Chorus erhöhen den Ignition-Schaden.

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Schwelle für Ignition | 100 Stacks | Compendium „Solar“ | 9.7.0.x |
| Cooldown nach Ignition | 1,6 s | Compendium „Solar“ | 9.7.0.x |
| Burn: erster Tick / Abstand / zweiter Abstand | 0,5 s / 0,56 s / 0,93 s | Compendium „Solar“ | 9.7.0.x |
| Burn-Tick bei x1 / x30 / x50 / x60 / x80 | 3 / 5 / 6,5 / 7,21 / 8,64 | Compendium „Solar“ (Grundwerte) | 9.7.0.x |
| Ignition-Grundschaden | 676 | Compendium „Solar“ | 9.7.0.x |
| Ignition bei One Thousand Voices | 890 | Quantum; Aegis 2814 ÷ 3,16 = 890,5; Compendium 676 × 1,316 = 890 | 9.7.0.x |
| One Thousand Voices: Scorch pro Explosion | x10 (x15 mit Ember of Ashes) | Compendium „Exotic Weapons“ | 9.7.0.x |
| One Thousand Voices: Explosionen pro Shot | 9 | Compendium „Exotic Weapons“ | 9.7.0.x |
| One Thousand Voices: Explosion nach Markierung | 0,7 s | Compendium „Exotic Weapons“ | 9.7.0.x |
| One Thousand Voices: Beam | 10 Ticks in 0,6 s | Compendium „Exotic Weapons“ | 9.7.0.x |
| Verfall von Scorch | hält 2,3 s, danach −1 Stack alle 0,04 s (−25/s) | Compendium „Solar“ (abgerufen 2026-10-20) | 9.7.0.x |
| Ignitions in 4 Shots ohne / mit Ember of Ashes | 2 / 4 | Aegis „Weapons“, aus Wipe 31 106 / 36 499 zurückgerechnet (Rest ohne Ignitions fast gleich) | 9.7.0.3 |
| Ignitions in 11 Shots mit Ember of Ashes | 11 | Quantum „Heavies“ (33 770 = 23 980 + 11 × 890) | bis 9.7.0.1 |

## Plausibilitätsprüfung mit One Thousand Voices

Ohne Ember of Ashes bringt ein Shot 9 × 10 = 90 Stacks.

- Shot 1: 90 Stacks, keine Ignition.
- Shot 2: Die erste Explosion bringt 100 Stacks, also eine Ignition. Die übrigen 8 Explosionen fallen in den Cooldown von 1,6 s und bringen keine Stacks.
- Shot 3 kommt 1,818 s nach Shot 2. Seine Explosionen liegen nach dem Cooldown, er beginnt also wieder bei 0.
- Ergebnis: Jeder zweite Shot löst eine Ignition aus, also 5 Ignitions in 11 Shots. **Das passt genau zu Quantum** (28 430 statt 23 980 Total Damage = 5 × 890).

Mit Ember of Ashes bringt ein Shot 135 Stacks. Dann löst jeder Shot eine Ignition aus, also 11 statt 5. Aegis zeigt mit Ember of Ashes einen ähnlich großen Zuwachs (2885 statt 2459 pro Shot).

## Wechselwirkungen

- [Damage Stacking](damage-stacking.md): Waffen-Buffs wirken auf Burn und Ignition, wenn eine Waffe den Scorch aufgetragen hat.
- [Particle Reconstruction](particle-reconstruction.md): ändert den Shot-Abstand und damit das Ignition-Muster.

## Modell im Simulator

Abgebildet seit v0.5 Schritt 4:

- One Thousand Voices hat in `intrinsicParts` einen `counter`-Teil (9 Anwendungen à x10 Scorch, ab 0,7 s nach dem Shot) und einen `threshold`-Teil (bei 100 eine Ignition mit 890 Schaden, danach 1,6 s Cooldown).
- Ember of Ashes ist ein Effect mit einem `counterModifier`-Teil (×1,5, aufgerundet).
- Ignitions sind Waffenschaden: Waffen-Buffs wirken auf sie.
- Nicht abgebildet: Burn-Schaden und der Verfall von Stacks.
- Ergebnis ohne Effects: 5 Ignitions in 11 Shots, 28 430 Total Damage, genau wie Quantum. Mit Ember of Ashes: 11 Ignitions, ×1,188, genau wie Quantum; Aegis ×1,173 (Gate `tests/weaponEffectGate.test.ts`, ±3 %).
- **Korrigiert (2026-10-20, ADR 0011):** Bis dahin verteilte das Modell die 9 Explosionen mit 66,7 ms Abstand (selbst abgeleitet: 0,6 s Beam ÷ 9). Dann zündete erst die 7. Explosion, der Cooldown reichte in die ersten 3 bis 4 Explosionen des nächsten Shots, und nur 8 von 11 Shots zündeten (+9,4 %). Jetzt explodieren alle 9 gleichzeitig (`intervalMs` 0), die einfachste Annahme, die das Gate besteht. Jeder Abstand bis etwa 33 ms ergäbe dasselbe. Gestaffelte Explosionen mit kürzerem Cooldown würden auch passen, siehe offene Fragen.

## Offene Fragen

- [ ] Die Formel im Compendium (2,7 + 0,175 × Stacks) passt nicht zu seiner eigenen Tabelle. Bei x30 ergäbe sie 7,95 statt 5. Mit 0,075 statt 0,175 passt die Tabelle.
- [x] Verfallen Scorch-Stacks mit der Zeit? Ja, laut Compendium (2026-10-20): „Scorch lasts for 2.3 seconds, then decreases by x1 stacks every 0.04 seconds (-25/s)“. Ältere Angaben, nur noch zur Einordnung: Laut einem Build-Beitrag (devtrackers.gg) halten Stacks etwa 4 s und verlieren dann 10 Stacks pro Sekunde. Ein Reddit-Test (Oktober 2026) meldet, dass die Dauer von der Schwierigkeit abhängt (Normal 14 Ticks, Master 9 Ticks), vermutlich ein Bug. MossyMax (Reiter „Scorch Damage“, Stand vor Edge of Fate, laut Autor veraltet): Der erste Tick kommt nach 1,133 s (34 Frames), danach alle 0,567 s (17 Frames); Stacks bleiben 6 Ticks lang auf dem Höchstwert und sinken dann um etwa 5,7 Stacks pro Tick. Für One Thousand Voices spielt der Verfall kaum eine Rolle, weil alle 1,8 s neue Stacks kommen.
- [ ] Die Stichprobe ergab Burn-Ticks von 16. Das passt nicht zur Skala des Compendiums: Explosion 129 im Spiel gegenüber 281 im Compendium, also Faktor 0,46.
- [ ] Schaden pro Shot ohne Ignition: Compendium 10 × 22 + 9 × 281 = 2749, Quantum 2180, Aegis etwa 2054 (2459 minus 5/11 × 890 für Ignitions). Die Quellen treffen verschiedene Annahmen: Ziel, Power-Differenz, ob alle 9 Explosionen treffen. Quantum und Aegis liegen etwa 6 % auseinander. Weil nur relative Unterschiede zählen, rechnen wir mit einer Hauptquelle (Quantum) und vergleichen Faktoren statt absoluter Zahlen.

- [x] Aegis zeigt mit Ember of Ashes etwa +17 % pro Shot, unser Modell damals +9,4 %. Geklärt und korrigiert (2026-10-20): Ember erhöht nur die Stacks; mit Ember zündet jeder Shot. Die Ursache liegt im Abstand der Explosionen in unserem Modell, siehe „Modell im Simulator“. Burn und Particle Reconstruction erklären die Differenz nicht: Der Rest ohne Ignitions ist bei Aegis mit und ohne Ember fast gleich.
- [ ] Wirkt der Debuff von Particle Reconstruction auch auf Ignitions? Wahrscheinlich ja: Laut Compendium zählen Solar-Effekte einer Waffe „as Weapon Damage, benefitting from Weapon Buffs“. Für diesen Perk hat es niemand bestätigt. Aegis hilft hier nicht, weil es pauschal mit Debuff ×1,30 rechnet. Ingame-Test: Ignition-Zahl mit und ohne Perk vergleichen, erwartet etwa ×1,276.
- [ ] Kommen die 9 Explosionen gleichzeitig oder nacheinander? Das Compendium sagt nur „detonate after 0.7 seconds“. Die Messungen von Aegis und Quantum passen nur zu (fast) gleichzeitigen Explosionen oder einem kürzeren Cooldown. Ingame-Test: ein Magazin mit Ember, Ignitions zählen (erwartet 4 von 4); Explosionen frameweise ansehen.

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Solar“ und „Exotic Weapons“, abgerufen 2026-10-18 und 2026-10-20
- [Bungie auf X zu One Thousand Voices](https://x.com/DestinyTheGame/status/1630262651006910465), Februar 2023: „Each explosion now applies 10 + 5 (with Ember of Ashes) scorch stacks.“
- [Quantum Damage-ics](https://destiny2.science/quantum-damage-ics), Heavy-Waffen und „Special Ignition“
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Weapons“ und „Visual“
