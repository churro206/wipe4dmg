# Taken Seeker (Katalysator von One Thousand Voices)

Kategorie: Damage over Time · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-20 · Vertrauen: mittel

## Kurzfassung

Mit dem Katalysator „Fall From Grace“ setzt jede Detonation von One Thousand Voices einen Taken Seeker frei. Er trifft ein Ziel mit einem Aufprall und macht danach 22 Ticks Schaden. Ein Ziel trägt höchstens etwa 5 Seeker gleichzeitig.

## Regeln

1. Jede Detonation setzt einen Seeker frei, also 9 pro Shot.
2. Ein Seeker macht einen Aufprall-Schaden und danach 22 Ticks im Abstand von 0,25 s. Die Gesamtdauer beträgt 5,65 s.
3. Ein Ziel trägt höchstens etwa 5 Seeker gleichzeitig („up to ~5 seekers at once“, Compendium; Clarity: „up to 5 seekers“). Was mit weiteren Seekern passiert, nennt keine Quelle. Aus den Aegis-Messungen rekonstruiert: Jeder Seeker macht seinen Aufprall, die Grenze gilt nur für die Ticks.
4. Blighted Targets (Direkttreffer von Witherhoard) nehmen +100 % Tick-Schaden. Aegis misst damit aber nur +1 bis 2 % pro Shot; ungeklärt.
5. Kein Cooldown und keine Flugzeit bekannt (keine Quelle).

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Aufprall | 84 | Compendium „Exotic Weapons“ | 9.7.0.x |
| Tick | 13 | Compendium „Exotic Weapons“ | 9.7.0.x |
| Ticks / Abstand / Gesamtdauer | 22 / 0,25 s / 5,65 s | Clarity via light.gg; Compendium | 9.7.0.x |
| Höchstens aktiv pro Ziel | ~5 | Compendium „Exotic Weapons“ | 9.7.0.x |
| Aegis (eigene Skala) | 25 pro Tick, 192 pro Missile; 3372 statt 2459 pro Shot | Aegis „Visual“ und „Weapons“ | 9.7.0.3 |

Skala (korrigiert 2026-10-20, ADR 0011): Nur die Ignition stimmt zwischen Compendium und Quantum 1:1 überein (676 × 1,316 = 890). Waffenschaden liegt im Compendium etwa 1,26-mal über Quantum (Shot 2749 gegen 2180). Aegis visual Value entspricht Compendium × 2,27 bei Explosion (639 / 281), Beam (50 / 22), Seeker-Aufprall (192 / 84) und Witherhoard. Die Seeker-Werte des Compendiums sind deshalb nur als Verhältnis zur Explosion verwendbar (Aufprall 84 / 281, Tick 13 / 281). Aegis-Tick 25 entspricht in Compendium-Skala etwa 11 statt 13; kleiner Widerspruch.

Aegis „Weapons“ (Wipe ÷ Shots ÷ 3,1625): ohne Katalysator 31 106 / 4 = 2459, mit Katalysator 85 319 / 8 = 3372 (×1,371), mit Ember und Katalysator ×1,305 gegenüber Ember allein. blueberries.gg (2026-07-06): „24-26k“ ohne, „34-36k“ mit Katalysator, etwa ×1,4.

Rekonstruktion des Aegis-Tests (8 Shots im Abstand von 1,733 s, Aegis-Werte 192 / 25):

| Regel für Seeker über der Grenze | Faktor |
| --- | --- |
| machen gar keinen Schaden (unser Modell) | ×1,18 |
| Aufprall immer, höchstens 5 mit Ticks | ×1,355 |
| wie oben, ein neuer ersetzt den ältesten | ×1,364 |
| keine Grenze | ×1,86 |
| **Aegis gemessen** | **×1,371** (mit Ember ×1,305) |

## Modell im Simulator

Seit v1.0 Schritt 1: `damageOverTime`-Teil in `intrinsicParts` von One Thousand Voices, nur mit Katalysator aktiv.

- Freisetzung zu denselben Zeiten wie die Scorch-Anwendungen (9 pro Shot, ab 0,7 s).
- Aufprall bei der Freisetzung (Flugzeit nicht abgebildet), erster Tick 0,15 s danach.
- **Annahme (ADR 0011, Regel 4):** Sind schon 5 Seeker aktiv, macht ein neuer Seeker nur seinen Aufprall, keine Ticks. Er ersetzt keinen alten Seeker. Keine Quelle nennt das; die Regel ist aus den Aegis-Messungen rekonstruiert.
- **Skala:** Aufprall und Ticks stehen in Compendium-Skala (84 / 13). `sourceScale` 0,793 = Quantum-Shot 2180 ÷ Compendium-Shot 2749 rechnet sie auf die Skala von Quantum um.
- **Gate** (`tests/weaponEffectGate.test.ts`, ±3 %): Katalysator ×1,392 gegen Aegis ×1,371 (+1,5 %), mit Ember ×1,330 gegen ×1,305 (+1,9 %). Nur beide Korrekturen zusammen treffen die Messung: die Regel allein ergäbe ×1,494, die Skala allein weniger als heute.
- Bis 2026-10-20 machte ein Seeker über der Grenze gar keinen Schaden, und die Werte waren nicht umgerechnet (×1,26).
- Waffen-Buffs wirken auf Aufprall und Ticks.

## Offene Fragen

- [x] **Abweichung ×1,26 gegen ×1,371:** erklärt (2026-10-20), siehe Werte und „Modell im Simulator“. Die Regel „Aufprall immer“ ist aus Messungen rekonstruiert, nicht zitiert. Ingame-Test: ein einzelner Shot, 6 s warten, Aufprall-Zahlen (erwartet 9) und parallele Tick-Zahlen (erwartet 5) zählen.
- [ ] Wie lange fliegt ein Seeker bis zum Ziel? Keine Quelle (2026-10-20). Ingame-Test: Frames von der Explosionszahl bis zur Aufprall-Zahl.
- [x] Aegis 192 / 25 gegen Compendium 84 / 13: Der Aufprall passt mit Faktor 2,27 wie alle Waffenwerte. Der Tick weicht ab (Aegis entspricht etwa 11 statt 13).
- [ ] Blight (+100 % Tick-Schaden) ist noch nicht abgebildet. Dafür bräuchte ein Effect einen Filter auf die Damage Instance. Aegis misst mit Blight nur +1,7 % bzw. +0,9 % pro Shot, nach unserer Regel wären etwa +30 % zu erwarten. Mögliche Gründe: Blight nur kurz aktiv (9,5 s), Bonus nur für Seeker auf schon geblighteten Zielen, Streuung. Erst klären, dann bauen.

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Exotic Weapons“, abgerufen 2026-10-18
- [Clarity via light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/)
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage)
- [blueberries.gg](https://www.blueberries.gg/weapons/one-thousand-voices-exotic-catalyst/), 2026-07-06
- [Live Clarity Database](https://database-clarity.github.io/Live-Clarity-Database/descriptions/clarity.json), One Thousand Voices (Hash 82994288), abgerufen 2026-10-20
