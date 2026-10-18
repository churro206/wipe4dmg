# Datenquellen

Stand: 2026-10-18 · Spielversion: 9.7.0.5

Die Spielwerte kommen aus frei zugänglichen Community-Quellen (ADR 0005). Eigene Messungen sind nur Stichproben.

## Hauptquellen

Alle Quellen sind über [destiny2.science](https://www.destiny2.science/) verlinkt. Die Google Sheets lassen sich pro Reiter als CSV herunterladen.

| Rolle | Quelle | Stand | Inhalt |
| --- | --- | --- | --- |
| Hauptquelle Waffen-Grundwerte | [Quantum Damage-ics](https://destiny2.science/quantum-damage-ics) | Tabelle bis 9.7.0.1; One Thousand Voices zuletzt 2024/2025 aktualisiert, Katalysator fehlt | Schaden pro Shot, Magazin, Reserves, rpm, Reload Time, Zeit bis leer; ohne Meta-Annahmen |
| Gegenprüfung, Multiplier | [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage) | Changelog 2026-10-12; One Thousand Voices getestet auf 9.7.0.3 | Grundschaden pro Shot mit Meta-Annahmen, Multiplier, Shots gesamt, Zeit bis leer |
| Damage Phases bekannter Bosse | [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Bosses“ | Changelog 2026-10-12 | 61 Bosse mit Aktivität, Länge der Damage Phase in Sekunden und Beschreibung. Automatischer Import: `npm run import:bosses` → `src/data/bosses.json` (47 mit Zahl, 14 ohne: „?“, „Variable“, „N/A“) |
| Buffs, Debuffs, Stacking | [Destiny Data Compendium](https://destiny2.science/data-compendium) | noch nicht geprüft | Werte für Perks, Mods, Subklassen, Spielmechaniken |

## One Thousand Voices bei Quantum Damage-ics

Abgerufen am 2026-10-18, Reiter mit den Heavy-Waffen. Diese Werte stehen in der Data File.

| Wert | Quantum |
| --- | --- |
| Magazin / Shots gesamt | 4 / 11 (Reserve-Mods wirken nicht) |
| Feuerrate | 33 rpm, also 1818 ms pro Shot |
| Reload Time | 1,25 s |
| Schaden pro Shot | 2180 (ohne Ignition, ohne Scorch) |
| Ignition | 890 („Special Ignition“); mit Ignitions 28 430 statt 23 980 Total Damage, also 5 Ignitions in 11 Shots |
| Time to Empty | 20,7 s = 10 × 1,818 s + 2 Reloads × 1,25 s, gemessen ab dem ersten Shot |

Abweichungen zu Aegis: Feuerrate etwa 5 % langsamer (1818 statt 1733 ms). Schaden mit Ignitions im Schnitt 2585 statt 2459 pro Shot.

## Werte für spätere Damage Instances

Diese Werte sind nicht in der Data File, weil die Data File vorerst nur einen Durchschnittswert pro Shot führt.

| Wert | Quelle |
| --- | --- |
| Explosion 0,75 s nach dem Beam | [destinygamewiki](https://d2.destinygamewiki.com/wiki/Unforeseen_Repercussions), unverified |
| Taken Seeker (Katalysator): 22 Ticks, alle 0,25 s, max. 5 pro Ziel; +100 % Tick-Schaden auf Blighted Targets | Clarity via [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/), verified |
| Stichprobe: Beam-Tick 10, Explosion-Tick 129, Burn-Tick 16 | eigene Messung, siehe Messprotokoll |

## One Thousand Voices bei Aegis

Abgerufen am 2026-10-18. Nur zur Gegenprüfung; alle Zeilen setzen Particle Reconstruction voraus.

| Wert | Aegis |
| --- | --- |
| Grundschaden pro Shot (Durchschnitt) | 2459 |
| mit Ember of Ashes / mit Katalysator / beides | 2885 / 3372 / 3765 |
| Einzelwerte | 639 pro Shot, 50 Impact, 2814 Ignition; Katalysator: 25 pro Seeker-Tick (50 auf Blighted Targets), 192 Missile |
| Shots gesamt | 11 |
| Charge Time | 1000 ms |
| peak Rate / TtE | 1,733 s / 18,33 s |
| Distribution | 11 (keine Reloads) |
| Annahme in allen Zeilen | Particle Reconstruction (Artefakt-Perk) |
| Multiplier (Spalten Surge, Buff, Debuff, 200) | 1,22 / 1,35 / 1,30 / 1,10 |

## Aufbau der Aegis-Tabelle, Reiter „Weapons“

Die Bedeutung der Spalten ist aus den Zahlen abgeleitet und an One Thousand Voices, Sleeper Simulant, The Queenbreaker, Euphony und Gjallarhorn nachgerechnet.

| Spalte | Bedeutung |
| --- | --- |
| Name | Waffe, nach „/“ die Annahmen (Perks, Artefakt, Katalysator) |
| # | Shots gesamt (Magazin plus Reserves) |
| Notes | Charge Time und Reload Time, z. B. „750ms charge / 2050ms reload“ |
| Distribution | Shots pro Magazin, z. B. „4-4-4-4“; zwischen zwei Gruppen liegt ein Reload |
| peak Rate | Abstand zwischen zwei Shots im selben Magazin, in Sekunden |
| TtE | Time to Empty: Zeit bis zum letzten Shot, in Sekunden |
| Base | Grundschaden pro Shot ohne Multiplier, Durchschnitt über alle Shots |
| Perk, Surge, Buff, Debuff, 200 | Multiplier; „200“ ist der Weapons-Stat 200 |
| Single | Base × alle Multiplier |
| Total / DPS | Single × # / Total ÷ TtE |

Zeitformel: TtE = Charge Time + (Abstände im Magazin) × peak Rate + (Anzahl Reloads) × Reload Time.
Beispiel Sleeper Simulant: 0,75 + 12 × 1,3 + 3 × 2,05 = 22,5 s.

Folgerungen für One Thousand Voices:

- Zwischen zwei Shots liegen 1,733 s, nicht nur die Charge Time von 1 s. Die Differenz von 0,733 s ist vermutlich die Strahldauer.
- Aegis rechnet mit Particle Reconstruction. Dieser Artefakt-Perk füllt das Magazin aus den Reserves auf. Deshalb gibt es keine Reloads und keine Reload Time.
- Base ist ein Durchschnitt pro Shot inklusive Ignitions. Ohne Ignitions liegt der Wert etwa 24 % niedriger (Zeile „no ignitions“: 2875 statt 3765).
- Die Spalte „Boss“ im Reiter „Visual“ hat die Werte „C“ und „S“. Die Bedeutung ist nicht geklärt.

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
