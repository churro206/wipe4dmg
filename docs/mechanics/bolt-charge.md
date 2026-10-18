# Bolt Charge

Kategorie: Stacking Resource · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-18 · Vertrauen: mittel

## Kurzfassung

Bolt Charge ist eine Arc-Ressource am Spieler. Waffentreffer und Fähigkeiten bauen Stacks auf. Bei 10 Stacks entlädt der nächste passende Treffer einen Blitzschlag als eigene Damage Instance. Wie viel das bringt, hängt stark davon ab, wie schnell eine Waffe Stacks erzeugt. Aegis hat dafür einen eigenen Reiter.

## Regeln

1. Stacks entstehen aus einer Zahl von Waffen-Damage-Instances innerhalb von 5 s. Die nötige Zahl hängt vom Magazin ab: 15 % des Magazins, abgerundet, plus 1. Ausnahmen: Swords und Grenade Launcher brauchen 2, Sniper mit 3 Schuss Magazin 1.
2. Pro gleichzeitiger Damage Instance gibt es höchstens 1 Stack.
3. Ein Waffenwechsel setzt den Zähler zurück.
4. Bei 10 Stacks: 0,5 s nach einem Fähigkeitstreffer oder ungeladenem Nahkampftreffer entlädt sich ein Arc-Blitz.
5. Weitere Quellen für Stacks: Ionic Traces (je 1 Stack), Ammo Bricks mit bestimmten Effekten (3 Stacks), Fähigkeiten.
6. Jeder Stack gibt 2,5 % Nahkampf-Energie.

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Stacks bis zur Entladung | 10 | Compendium „Arc“ | 9.7.0.x |
| Zeitfenster für Treffer | 5 s | Compendium „Arc“ | 9.7.0.x |
| Zeit pro Stack, je Quelle | z. B. Thunderlord 0,170 s, Ergo Sum 0,198 s, Dragon's Breath 0,515 s | Aegis „Bolt Charge“ | 9.7.0.3 |
| Bolt-Charge-DPS, je Quelle | z. B. Thunderlord 33 275, Dragon's Breath 10 960 | Aegis „Bolt Charge“ | 9.7.0.3 |

## Wechselwirkungen

- [Damage Stacking](damage-stacking.md): Welche Buffs auf den Blitz wirken, ist offen.
- Jolt, Amplified, Ionic Traces: weitere Arc-Mechanics, die Bolt Charge erzeugen oder verstärken.

## Modell im Simulator

Noch nicht abgebildet. Vorschlag: Zähler am Spieler, der pro Waffen-Damage-Instance wächst. Bei 10 Stacks und einem auslösenden Treffer entsteht eine Damage Instance „boltCharge“. Bolt Charge ist das Beispiel für eine Stacking Resource. Die Engine braucht dafür Zustand am Spieler, nicht am Ziel.

## Offene Fragen

- [ ] Wie hoch ist der Schaden eines Blitzes? Aegis führt nur die DPS je Quelle.
- [ ] Welche Buckets wirken auf den Blitz?
- [ ] Was bedeutet „Flashover“ in Aegis' Tabelle?

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Arc“, abgerufen 2026-10-18
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Bolt Charge“
