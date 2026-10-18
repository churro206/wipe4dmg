# Datenlage One Thousand Voices

Stand: 2026-10-18 · Spielversion: 9.7.0.5

## Ergebnis

Die Struktur der Waffe ist gut dokumentiert. Die Schadenswerte fehlen fast vollständig.
Wir müssen Beam, Explosion und Taken Seeker selbst messen.

## Bekannte Werte

| Wert | Wert in Data File | Status | Quelle |
| --- | --- | --- | --- |
| Magazine | 4 | verified | [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/) |
| Charge Time | 1000 (Annahme: ms) | unverified | [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/) |
| Reload Time | 2,47 s | unverified (2022) | [gamersdecide.com](https://www.gamersdecide.com/articles/destiny-2-best-gambit-weapons) |
| Explosion Delay | 0,75 s | unverified | [destinygamewiki](https://d2.destinygamewiki.com/wiki/Unforeseen_Repercussions) |
| Taken Seeker | 22 Ticks, alle 0,25 s, max. 5 pro Ziel | verified | Clarity via [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/) |
| Katalysator | +30 Stability, +20 Ammo Generation | verified | Clarity via [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/) |
| Blight-Bonus | +100 % Tick-Schaden auf Blighted Targets (Witherhoard) | verified | Clarity via [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/) |
| Reserves | fehlt | missing | – |
| Schaden Beam, Explosion, Seeker | fehlt | missing | – |

## Wichtige Erkenntnisse

- **Name:** Die Waffe heißt „One Thousand Voices", Community-Kurzform „1K Voices".
- **Katalysator:** Der Katalysator kam mit Monument of Triumph (9.7.0) ins Spiel. Er ist Teil des Buffs, den die Community der Waffe zuschreibt. Ein Community-Test zeigt etwa 40 % mehr Total Damage mit Katalysator ([blueberries.gg](https://www.blueberries.gg/weapons/one-thousand-voices-exotic-catalyst/)).
- **Schießstand:** Seit 9.7.0 hat der Schießstand statische Ziele, die Schaden wie ein Boss skalieren. Die Ziele haben eine DPS-Anzeige und ein rotes (base) und gelbes (precision) Ziel ([Patch Notes 9.7.0](https://shatteredvault.com/destiny-2-update-9-7-0/)). Diese Ziele sind unsere wichtigste Messquelle.
- **Spielstand nicht vollständig eingefroren:** Bungie liefert weiter Wartungs-Patches. Patch 9.7.0.5 vom 7. Oktober 2026 betraf nur Exploits ([Patch Notes 9.7.0.5](https://shatteredvault.com/destiny-2-update-9-7-0-5/)). Deshalb trägt jede Weapon das Feld `gameVersion`.

## Messplan am Schießstand

Miss jeden Wert dreimal. Notiere Spielversion und Datum.

1. **Beam:** Ein Schuss ohne Buffs auf das rote Ziel. Notiere jede einzelne Schadenszahl des Strahls.
2. **Explosion:** Gleicher Schuss. Notiere die Schadenszahl der Explosion getrennt.
3. **Precision:** Wiederhole Schritt 1 und 2 auf dem gelben Ziel.
4. **Taken Seeker:** Mit Katalysator. Notiere die Schadenszahl eines Ticks.
5. **Reserves:** Lies die maximale Reserve ohne Mods ab.
6. **Zeiten:** Nimm ein Video mit 60 FPS auf. Miss Charge Time, Zeit bis zur Explosion und Reload Time framegenau.
7. **Magazine Dump:** Leere ein Magazin ohne Buffs. Notiere den Wert der DPS-Anzeige als ersten Referenzwert.
