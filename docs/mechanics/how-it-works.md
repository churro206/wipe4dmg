# Wie rechnet der Rechner?

Kategorie: Einstieg · Spielversion: 9.7.0.5 · Zuletzt geprüft: 2026-10-20 · Vertrauen: hoch

Einstiegsseite des Wikis (US-15, ADR 0010). Die Website zeigt nur den Abschnitt „Für Spieler“.

## Für Spieler

### Was der Rechner berechnet

Der Rechner berechnet den **Total Damage** eines Builds in einer **Damage Phase**, also in der Zeit, in der der Boss verwundbar ist. Ein Build besteht aus Waffe, Klasse, Subklasse, Super, Grenade, Melee und Effects wie Radiant, Surges oder Weaken.

Wichtig sind die **Unterschiede zwischen Builds**: Bringt Build A 15 % mehr als Build B, soll das stimmen. Die absoluten Zahlen können vom Spiel abweichen, z. B. weil Bosse unterschiedlich viel Schaden einstecken.

Die erste Waffe ist One Thousand Voices. Weitere Waffen folgen.

### Die Zeitachse

Der Rechner spielt die Damage Phase wie eine Aufnahme ab. Jeder Treffer ist eine **Damage Instance** mit eigenem Zeitpunkt:

- **Shots** im Abstand von 1,733 s. Jeder Beam von One Thousand Voices löst 9 Explosionen aus.
- **Scorch** sammelt sich am Boss. Bei 100 Stacks folgt eine **Ignition**, eine große Solar-Explosion. Danach braucht der Boss kurz, bis er wieder Scorch annimmt.
- **Taken Seeker** des Katalysators fliegen zum Boss und machen Schaden über Zeit.
- **Abilities** treffen zu ihren Einsatzzeiten aus der Rotation. **Während eines Supers schießt die Waffe nicht.**

Jeder Effect hat ein Zeitfenster. Tractor Cannon wirkt zum Beispiel 10 s. Ein Shot bekommt nur die Buffs, die in seinem Moment aktiv sind. Deshalb kommt es auf die Reihenfolge an. Im Reiter „Rotation“ siehst du die Zeitachse.

### Wie Buffs sich stapeln

Buffs gehören zu **Buckets**. Die Regel:

- **Im selben Bucket** zählt meist nur der stärkste Buff. Radiant (+20 %) und Well of Radiance (+25 %) zusammen ergeben +25 %, nicht +45 %.
- **Verschiedene Buckets** werden miteinander **multipliziert**.

Beispiel mit Well of Radiance (Empowering Buff, ×1,25), Weaken (Debuff, ×1,15) und Solar Surge 4x (Surge, ×1,25):

| Rechnung | Ergebnis |
| --- | --- |
| richtig: 1,25 × 1,15 × 1,25 | **×1,80** |
| falsch: +25 % + 15 % + 25 % addiert | ×1,65 |

Im Reiter „Breakdown“ siehst du für jeden Bucket, wie viel er zum Total Damage beiträgt. Mehr dazu steht unter [Damage Stacking](damage-stacking.md).

### Woher die Zahlen kommen

Der Rechner erfindet keine Zahlen. Jeder Wert hat eine Quelle:

| Quelle | Was wir daraus nehmen |
| --- | --- |
| Quantum Damage-ics | Schaden pro Shot, Ablauf der Waffe |
| Aegis | gemessener Schaden von Supers, Grenades und Melees; Faktoren „mit / ohne“ für Perks und Katalysator |
| Destiny Data Compendium | Einzelteile wie Explosionen, Ignitions und Taken Seeker |
| Court (Stacking Guide) | welcher Buff in welchen Bucket gehört |
| eigene Tests im Spiel | allgemeine Mechanics, z. B. wie schnell eine Ignition wieder möglich ist |

**Gates** sind automatische Tests, die unser Modell mit den Messungen vergleichen. Eine Ability darf höchstens 10 % von Aegis abweichen, ein Waffen-Effect höchstens 3 %. Fällt ein Wert durch, suchen wir den Fehler im Modell.

Viele Abilities rechnet der Rechner als **Paket**: ein von Aegis gemessener Gesamtwert pro Einsatz statt einzelner Treffer. Das ist genauer, solange die Einzelteile nicht sicher bekannt sind.

### Grenzen

- **Energie und Cooldowns prüft der Rechner nicht.** Trag nur Einsätze ein, die im Spiel möglich sind.
- **Burn-Schaden** von Scorch fehlt noch. Ignitions sind enthalten.
- **Der Optimizer** probiert nur Subklassen und Effects. Super, Grenade und Melee übernimmt er aus deiner Auswahl.
- **Einige Abilities fehlen**, und einige Pakete sind ohne Ember of Ashes etwas zu hoch. Was genau fehlt, steht in der [Abdeckung](../coverage.md). Was als Nächstes kommt, steht in der [Roadmap](../roadmap.md).

## Für Entwickler

- Simulator mit Damage Instances: ADR 0001. Buckets und Stacking: `src/data/buckets.json`, [Damage Stacking](damage-stacking.md).
- Abilities als Ability Components oder Pakete, Gate gegen Aegis: ADR 0009.
- Zerlegung, Skalen-Regel und Gate für Waffen-Effects: ADR 0011.
- Zahlen in diesem Text sind Beispiele für Spieler. Der Simulator rechnet nur mit den Werten aus `src/data`. Ändert sich ein Wert dort, diesen Text prüfen (Shot-Abstand, Beispiel-Buffs, Toleranzen der Gates).
