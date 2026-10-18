# Fähigkeiten und Supers

Kategorie: Schadensquelle (Damage Instances) · Spielversion: 9.7.0.3 · Zuletzt geprüft: 2026-10-18 · Vertrauen: mittel

## Kurzfassung

Granaten, Nahkampf und Supers machen eigenen Schaden. Sie zählen zum Total Damage (US-14). Ihr Schaden hängt vom passenden Stat ab: Bei 200 statt 100 Punkten steigt er etwa um den Faktor 1,45 bis 1,65. Fähigkeiten können selbst Scorch, Jolt und andere Mechanics auslösen. Beispiele hier: Fusion Grenade und Golden Gun.

## Regeln

1. Jede Fähigkeit erzeugt eigene Damage Instances, oft mehrere: Aufprall, Explosion, Ticks.
2. **Stat-Abhängigkeit:** Aegis misst jede Fähigkeit bei Stat 100 und bei Stat 200. Das Verhältnis steht in der Spalte „Multi“.
3. Fähigkeiten haben Cooldowns und Energie. In einer Damage Phase sind sie meist nur ein- oder zweimal verfügbar, außer es gibt Energie-Quellen.
4. Fähigkeiten profitieren von anderen Buffs als Waffen. Laut Compendium wirken Nahkampf-Buffs zum Beispiel nicht auf Scorch und Ignition. Ob ein Effect auf Fähigkeiten wirkt, muss jeder Effect selbst angeben.
5. **Fusion Grenade:** Explosion plus Scorch; mit Ember of Ashes und Touch of Flame folgt eine Ignition.
6. **Golden Gun:** 6 Schuss (Deadshot) oder 3 Schuss (Marksman) pro Super; Radiant erhöht den Schaden; bestimmte Exotics wie Celestial Nighthawk ändern den Schaden stark.

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Fusion Grenade, Explosion (Aegis-Skala) | 1738 | Aegis „Abilities“ | 9.7.0.3 |
| Fusion Grenade, Stat 200 gegenüber 100 | ×1,649 | Aegis „Abilities“, Spalte „Multi“ | 9.7.0.3 |
| Golden Gun Marksman, Stat 200 gegenüber 100 | ×1,450 | Aegis „Abilities“, Spalte „Multi“ | 9.7.0.3 |
| Golden Gun Deadshot, ein Schuss (Grundwert) | 1453 | Compendium „Solar“ | 9.7.0.x |
| Golden Gun Marksman, ein Schuss (Grundwert) | 1574, Precision ×2 | Compendium „Solar“ | 9.7.0.x |

Aegis und Compendium nutzen verschiedene Skalen. Innerhalb einer Simulation darf pro Wertart nur eine Quelle rechnen.

## Wechselwirkungen

- [Scorch und Ignition](scorch-and-ignition.md): Viele Solar-Fähigkeiten tragen Scorch auf.
- [Damage Stacking](damage-stacking.md): Welche Buckets auf Fähigkeiten wirken, unterscheidet sich von Waffen.
- [Bolt Charge](bolt-charge.md): Fähigkeitstreffer lösen den Blitz aus.

## Modell im Simulator

Noch nicht abgebildet. Fähigkeiten sind eine zweite Art von Schadensquelle neben der Waffe:

- Eigene Data Files für Fähigkeiten, analog zu Weapons.
- Die Rotation entscheidet, wann eine Fähigkeit eingesetzt wird. Einfachster Fall: einmal zu Beginn der Damage Phase.
- Effects brauchen ein Feld, für welche Schadensquellen sie gelten: Waffen, Granaten, Nahkampf, Super.

## Offene Fragen

- [ ] Welche Fähigkeiten und Supers sind für Boss-Damage-Phasen wichtig? (Prüfung durch den Projektinhaber)
- [ ] Hauptquelle für Fähigkeiten: Aegis (misst gegen Bosse, Stat 100 und 200) oder Compendium (Grundwerte)?
- [ ] Wie bilden wir Energie und Cooldowns ab, ohne die ganze Fähigkeiten-Ökonomie zu simulieren?

## Quellen

- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Abilities“
- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Solar“ und „Game Mechanics“, abgerufen 2026-10-18
