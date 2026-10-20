# Scorch und Ignition

Kategorie: Threshold Trigger, Damage over Time · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-18 · Vertrauen: mittel

## Kurzfassung

Scorch sind Stacks am Ziel. Ein gescorchtes Ziel nimmt Burn-Schaden in Ticks. Bei 100 Stacks folgt eine Ignition: eine Solar-Explosion als eigene Damage Instance. Danach sind alle Stacks weg, und für 1,6 s lässt sich kein neuer Scorch auftragen. One Thousand Voices erzeugt Scorch über seine Explosionen.

## Regeln

1. Scorch-Stacks addieren sich am Ziel.
2. **Burn:** Nach 0,5 s auf einem gescorchten Ziel kommt ein Tick, danach alle 0,56 s. Der zweite Tick kommt mit 0,93 s Abstand. Der Tick-Schaden steigt mit der Zahl der Stacks.
3. Burn-Schaden ist nicht tödlich.
4. **Ignition:** Erreicht ein Ziel 100 Stacks, folgt eine Ignition. Alle Stacks verfallen.
5. **Cooldown:** Nach einer Ignition lässt sich 1,6 s lang kein Scorch auftragen.
6. **Ember of Ashes:** Scorch-Stacks +50 %, aufgerundet (x10 → x15). Einige Quellen sind ausgenommen.
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
- Ergebnis ohne Effects: 5 Ignitions in 11 Shots, 28 430 Total Damage, genau wie Quantum. Mit Ember of Ashes: 8 Ignitions, 31 100 (+9,4 %).

## Offene Fragen

- [ ] Die Formel im Compendium (2,7 + 0,175 × Stacks) passt nicht zu seiner eigenen Tabelle. Bei x30 ergäbe sie 7,95 statt 5. Mit 0,075 statt 0,175 passt die Tabelle.
- [ ] Verfallen Scorch-Stacks mit der Zeit? Unbestätigt: Laut einem Build-Beitrag (devtrackers.gg) halten Stacks etwa 4 s und verlieren dann 10 Stacks pro Sekunde. Ein Reddit-Test (Oktober 2026) meldet, dass die Dauer von der Schwierigkeit abhängt (Normal 14 Ticks, Master 9 Ticks), vermutlich ein Bug. MossyMax (Reiter „Scorch Damage“, Stand vor Edge of Fate, laut Autor veraltet): Der erste Tick kommt nach 1,133 s (34 Frames), danach alle 0,567 s (17 Frames); Stacks bleiben 6 Ticks lang auf dem Höchstwert und sinken dann um etwa 5,7 Stacks pro Tick. Für One Thousand Voices spielt der Verfall kaum eine Rolle, weil alle 1,8 s neue Stacks kommen.
- [ ] Die Stichprobe ergab Burn-Ticks von 16. Das passt nicht zur Skala des Compendiums: Explosion 129 im Spiel gegenüber 281 im Compendium, also Faktor 0,46.
- [ ] Schaden pro Shot ohne Ignition: Compendium 10 × 22 + 9 × 281 = 2749, Quantum 2180, Aegis etwa 2054 (2459 minus 5/11 × 890 für Ignitions). Die Quellen treffen verschiedene Annahmen: Ziel, Power-Differenz, ob alle 9 Explosionen treffen. Quantum und Aegis liegen etwa 6 % auseinander. Weil nur relative Unterschiede zählen, rechnen wir mit einer Hauptquelle (Quantum) und vergleichen Faktoren statt absoluter Zahlen.

- [ ] Aegis zeigt mit Ember of Ashes etwa +17 % pro Shot, unser Modell +9,4 %. Mögliche Gründe: Ember erhöht auch den Burn-Schaden, den wir noch nicht abbilden; Aegis rechnet mit Particle Reconstruction und 1,733 s Shot-Abstand.
- [ ] Wirkt der Debuff von Particle Reconstruction auch auf Ignitions? Unser Modell sagt ja, weil die Ignition als Fusion-Rifle-Schaden zählt. Unbestätigt.

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Solar“ und „Exotic Weapons“, abgerufen 2026-10-18
- [Quantum Damage-ics](https://destiny2.science/quantum-damage-ics), Heavy-Waffen und „Special Ignition“
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Weapons“ und „Visual“
