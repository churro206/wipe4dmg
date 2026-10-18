# Taken Seeker (Katalysator von One Thousand Voices)

Kategorie: Damage over Time · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-18 · Vertrauen: niedrig

## Kurzfassung

Mit dem Katalysator „Fall From Grace“ setzt jede Detonation von One Thousand Voices einen Taken Seeker frei. Er trifft ein Ziel mit einem Aufprall und macht danach 22 Ticks Schaden. Ein Ziel trägt höchstens etwa 5 Seeker gleichzeitig.

## Regeln

1. Jede Detonation setzt einen Seeker frei, also 9 pro Shot.
2. Ein Seeker macht einen Aufprall-Schaden und danach 22 Ticks im Abstand von 0,25 s. Die Gesamtdauer beträgt 5,65 s.
3. Ein Ziel trägt höchstens etwa 5 Seeker gleichzeitig.
4. Blighted Targets (Direkttreffer von Witherhoard) nehmen +100 % Tick-Schaden.

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Aufprall | 84 | Compendium „Exotic Weapons“ | 9.7.0.x |
| Tick | 13 | Compendium „Exotic Weapons“ | 9.7.0.x |
| Ticks / Abstand / Gesamtdauer | 22 / 0,25 s / 5,65 s | Clarity via light.gg; Compendium | 9.7.0.x |
| Höchstens aktiv pro Ziel | ~5 | Compendium „Exotic Weapons“ | 9.7.0.x |
| Aegis (eigene Skala) | 25 pro Tick, 192 pro Missile; 3372 statt 2459 pro Shot | Aegis „Visual“ und „Weapons“ | 9.7.0.3 |

Skala: Die Ignition stimmt zwischen Compendium und Quantum 1:1 überein (676 × 1,316 = 890). Deshalb übernehmen wir die Werte des Compendiums ohne Umrechnung.

## Modell im Simulator

Seit v1.0 Schritt 1: `damageOverTime`-Teil in `intrinsicParts` von One Thousand Voices, nur mit Katalysator aktiv.

- Freisetzung zu denselben Zeiten wie die Scorch-Anwendungen (9 pro Shot, ab 0,7 s).
- Aufprall bei der Freisetzung (Flugzeit nicht abgebildet), erster Tick 0,15 s danach.
- Sind schon 5 Seeker aktiv, macht ein neuer Seeker keinen Schaden.
- Waffen-Buffs wirken auf Aufprall und Ticks.

## Offene Fragen

- [ ] **Abweichung:** Unser Modell ergibt mit Katalysator ×1,26 Total Damage (volle Munition, mit und ohne Particle Reconstruction). Aegis zeigt ×1,371, blueberries.gg etwa ×1,4. Wahrscheinlichster Grund ist die Grenze von 5 Seekern: Unser Modell lässt überzählige Seeker ganz weg (nur 20 von 99 Seekern machen Schaden). Würden überzählige Seeker wenigstens ihren Aufprall machen, ergäbe sich etwa ×1,49.
- [ ] Wie lange fliegt ein Seeker bis zum Ziel?
- [ ] Aegis misst 192 pro Missile und 25 pro Tick in seiner Skala (÷ 3,16 = 61 und 7,9). Das passt nicht zum Verhältnis 84 zu 13 im Compendium.
- [ ] Blight (+100 % Tick-Schaden) ist noch nicht abgebildet. Dafür bräuchte ein Effect einen Filter auf die Damage Instance.

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Exotic Weapons“, abgerufen 2026-10-18
- [Clarity via light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/)
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage)
- [blueberries.gg](https://www.blueberries.gg/weapons/one-thousand-voices-exotic-catalyst/)
