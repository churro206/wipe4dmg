# Fähigkeiten und Supers

Kategorie: Schadensquelle (Damage Instances) · Spielversion: 9.7.0.3 · Zuletzt geprüft: 2026-10-19 · Vertrauen: mittel

## Kurzfassung

Granaten, Nahkampf und Supers machen eigenen Schaden. Sie zählen zum Total Damage (US-14). Ihr Schaden hängt vom passenden Stat ab: Bei 200 statt 100 Punkten steigt er etwa um den Faktor 1,45 bis 1,65. Fähigkeiten können selbst Scorch, Jolt und andere Mechanics auslösen. Beispiele hier: Fusion Grenade und Golden Gun.

## Regeln

1. Jede Fähigkeit erzeugt eigene Damage Instances, oft mehrere: Aufprall, Explosion, Ticks.
2. **Stat-Abhängigkeit:** Über 100 Punkten steigt der Schaden linear pro Punkt (Compendium, „Game Mechanics“): Super +0,45 %, Grenade +0,65 %, Melee +0,3 % (multiplikativ). Aegis misst jede Fähigkeit bei Stat 100 und bei Stat 200; das Verhältnis steht in der Spalte „Multi“ und bestätigt die Werte.
3. Fähigkeiten haben Cooldowns und Energie. In einer Damage Phase sind sie meist nur ein- oder zweimal verfügbar, außer es gibt Energie-Quellen.
4. Fähigkeiten profitieren von anderen Buffs als Waffen. Laut Compendium wirken Nahkampf-Buffs zum Beispiel nicht auf Scorch und Ignition. Ob ein Effect auf Fähigkeiten wirkt, muss jeder Effect selbst angeben.
5. **Fusion Grenade:** Explosion plus Scorch; mit Ember of Ashes und Touch of Flame folgt eine Ignition.
6. **Keyword-Schaden skaliert nicht immer mit:** Laut Compendium skalieren Melee-Buffs und der Melee-Stat weder Scorch noch Ignition. Grenade-Buffs (Verity's Brow) und Super-Buffs (Heart of the Flame) wirken dagegen auf Solar-Effekte ihrer Ability. Deshalb ist der Faktor von Stat 100 auf 200 bei Melees mit Ignition kleiner (Celestial Fire ×1,10 statt ×1,30).
7. **Super-Dauer:** Supers mit Dauer verbrauchen Energie pro Sekunde und pro Angriff (Compendium: z. B. Hammer of Sol 21 s, 4,75 % pro Sekunde, 12 % pro Wurf, 1,5 s zwischen zwei Würfen). Während des Supers feuert die Waffe nicht.
8. **Golden Gun:** 6 Schuss (Deadshot) oder 3 Schuss (Marksman) pro Super; Radiant erhöht den Schaden; bestimmte Exotics wie Celestial Nighthawk ändern den Schaden stark.

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Fusion Grenade, Explosion (Aegis-Tick-Spalte, also Grundwert × 2,30) | 1738 | Aegis „Abilities“ | 9.7.0.3 |
| Fusion Grenade, Stat 200 gegenüber 100 | ×1,649 | Aegis „Abilities“, Spalte „Multi“ | 9.7.0.3 |
| Golden Gun Marksman, Stat 200 gegenüber 100 | ×1,450 | Aegis „Abilities“, Spalte „Multi“ | 9.7.0.3 |
| Golden Gun Deadshot, ein Schuss (Grundwert) | 1453 | Compendium „Solar“ | 9.7.0.x |
| Golden Gun Marksman, ein Schuss (Grundwert) | 1574, Precision ×2 | Compendium „Solar“ | 9.7.0.x |
| Super, Stat 200 gegenüber 100 (reine Supers) | ×1,45 | Aegis „Abilities“, Spalte „Multi“; Bungie: bis +45 % Super-Schaden | 9.7.0.3 |
| Grenade, Stat 200 gegenüber 100 (reine Grenades) | ×1,65 | Aegis „Abilities“, Spalte „Multi“ | 9.7.0.3 |
| Melee, Stat 200 gegenüber 100 (reine Melees) | ×1,30 | Aegis „Abilities“, Spalte „Multi“; Bungie: bis +30 % Melee-Schaden | 9.7.0.3 |
| Thundercrash: Impact / Explosion / Aftershock | 180 / 8260 / 108 pro Sekunde für 4 s | Compendium „Arc“ | 9.7.0.x |

**Skalen:** Compendium-Grundwerte und der „visual Value“ von Aegis liegen auf derselben Skala (Thunderclap 703 / 702, Ignition 676 / 675, Phantom Surge 595 / 594). Aegis teilt den gemessenen Schaden durch „Full Modifiers“ (meist ×2,30); die Tick-Spalten von Aegis sind Compendium × 2,30. Laut Reiter „Home“ sind Aegis-Waffen und -Abilities beide „base values“, also gleich skaliert. Ausnahme: Zeilen mit „Full Modifiers“ 1,00 (Song of Flame, Glacial Quake heavy) sind nicht normiert.

## Wechselwirkungen

- [Scorch und Ignition](scorch-and-ignition.md): Viele Solar-Fähigkeiten tragen Scorch auf.
- [Damage Stacking](damage-stacking.md): Welche Buckets auf Fähigkeiten wirken, unterscheidet sich von Waffen.
- [Bolt Charge](bolt-charge.md): Fähigkeitstreffer lösen den Blitz aus.

## Modell im Simulator

Entscheidung in ADR 0009 (`docs/adr/0009-ability-components.md`), Umsetzung läuft:

- Eine Ability besteht aus Ability Components mit Werten aus dem Compendium. Fehlen Teile, gilt ein Paket mit dem Aegis-Gesamtwert pro Einsatz.
- Aegis ist das Gate: jede abbildbare Zeile ohne Buffs, ±10 %.
- Pakete führen ihre eingerechneten Effects mit; die Engine wendet sie nicht doppelt an.
- Die Rotation entscheidet, wann eine Fähigkeit eingesetzt wird. Einfachster Fall: einmal zu Beginn der Damage Phase.
- Effects geben über `damageSources` an, ob sie auf Waffen, Granaten, Nahkampf oder Super wirken.

## Offene Fragen

- [x] Welche Supers? Alle Supers sollen abgedeckt werden (Entscheidung 2026-10-18). Für Granaten und Nahkampf gilt dasselbe, sobald US-14 umgesetzt wird.
- [x] Hauptquelle für Fähigkeiten: Compendium für die Teile, Aegis als Gate und Fallback (ADR 0009, 2026-10-19).
- [x] Stat-Werte zwischen 100 und 200: linear pro Punkt laut Compendium „Game Mechanics“ (2026-10-19), Data File `ability-stats.json`.
- [ ] Wie bilden wir Energie und Cooldowns ab, ohne die ganze Fähigkeiten-Ökonomie zu simulieren?

## Quellen

- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Abilities“
- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Solar“, „Arc“ und „Game Mechanics“, abgerufen 2026-10-19
