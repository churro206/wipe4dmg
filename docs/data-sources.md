# Datenquellen

Stand: 2026-10-18 · Spielversion: 9.7.0.5

Die Spielwerte kommen aus frei zugänglichen Community-Quellen (ADR 0005). Eigene Messungen sind nur Stichproben.

## Hauptquellen

Alle Quellen sind über [destiny2.science](https://www.destiny2.science/) verlinkt. Die Google Sheets lassen sich pro Reiter als CSV herunterladen.

| Wertart | Quelle | Stand | Inhalt |
| --- | --- | --- | --- |
| Waffenschaden, Shots, Zeiten | [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage) | Changelog 2026-10-12; One Thousand Voices getestet auf 9.7.0.3 | Reiter „Weapons“: Grundschaden pro Shot, Multiplier, Shots gesamt, Zeit bis leer |
| Buffs, Debuffs, Stacking | [Destiny Data Compendium](https://destiny2.science/data-compendium) | noch nicht geprüft | Werte für Perks, Mods, Subklassen, Spielmechaniken |
| Weitere Waffen (Reserve) | [Quantum Damage-ics](https://destiny2.science/quantum-damage-ics) | 9.7.0.1 | Normierte Schadenswerte vieler Waffen |

## One Thousand Voices bei Aegis

Abgerufen am 2026-10-18. Die Werte sind noch nicht in der Data File.

| Wert | Aegis |
| --- | --- |
| Grundschaden pro Shot (Durchschnitt) | 2459 |
| mit Ember of Ashes / mit Katalysator / beides | 2885 / 3372 / 3765 |
| Einzelwerte | 639 pro Shot, 50 Impact, 2814 Ignition; Katalysator: 25 pro Seeker-Tick (50 auf Blighted Targets), 192 Missile |
| Shots gesamt | 11 |
| Charge Time | 1000 ms |
| peak Rate / TtE | 1,733 / 18,33 s |
| Multiplier (Spalten Surge, Buff, Debuff, 200) | 1,22 / 1,35 / 1,30 / 1,10 |

**Offen:** Die genaue Bedeutung von „Base“, „peak Rate“, „TtE“ und „Distribution“ ist noch nicht geklärt. Die Tabelle verlinkt dazu ein Erklärvideo („How does this spreadsheet work?“).

## Wichtige Erkenntnisse

- **Name:** Die Waffe heißt „One Thousand Voices", Community-Kurzform „1K Voices".
- **Damage Instances:** Ein Shot erzeugt Beam, Explosion und Burn (Scorch-Ticks). Hat das Ziel genug Scorch Stacks, folgt eine Ignition. Mit Katalysator kommen Taken Seeker dazu.
- **Katalysator:** Der Katalysator kam mit Monument of Triumph (9.7.0) ins Spiel. Ein Community-Test zeigt etwa 40 % mehr Total Damage mit Katalysator ([blueberries.gg](https://www.blueberries.gg/weapons/one-thousand-voices-exotic-catalyst/)).
- **Schießstand:** Seit 9.7.0 hat der Schießstand statische Ziele, die Schaden wie ein Boss skalieren ([Patch Notes 9.7.0](https://shatteredvault.com/destiny-2-update-9-7-0/)).
- **Spielstand nicht vollständig eingefroren:** Bungie liefert weiter Wartungs-Patches, zuletzt 9.7.0.5 am 7. Oktober 2026 ([Patch Notes 9.7.0.5](https://shatteredvault.com/destiny-2-update-9-7-0-5/)). Deshalb trägt jede Weapon das Feld `gameVersion`.

## Messprotokoll (Stichproben)

| Datum | Spielversion | Bedingungen | Ergebnis |
| --- | --- | --- | --- |
| 2026-10-18 | nicht notiert | Schießstand, Dummy „Carl“; kein Artefakt, keine Aspects und Fragments, kein Surge; Weapons-Stat 130 (+2,9 % Heavy-Schaden PvE); Katalysator-Status nicht notiert | Ein Shot: 1408 Total Damage. Beam-Tick 10, Explosion-Tick 129, Burn-Tick 16. Ein Magazin: 6263 Total Damage, DPS-Anzeige 887. |

Die Stichprobe liegt etwa um den Faktor 1,6 unter Aegis. Das ist nach ADR 0005 akzeptiert, weil nur relative Unterschiede zählen.
