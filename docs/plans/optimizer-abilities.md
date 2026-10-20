# Plan: Optimizer mit Fähigkeiten (zurückgestellt)

Stand: 2026-10-20 · Status: zurückgestellt auf v1.x (Entscheidung des Inhabers)

Heute probiert der Optimizer (US-08) nur eigene Effects über alle Subklassen. Die Abilities übernimmt er aus der Auswahl, wenn die Subklasse sie erlaubt. Ein Lauf dauert etwa 0,65 s (Warlock, gemessen 2026-10-20).

## Problem: Anzahl der Kombinationen

Abilities pro Subklasse (Super/Grenade/Melee, Stand 2026-10-20):

| | Arc | Solar | Void | Stasis | Strand | Prismatic |
| --- | --- | --- | --- | --- | --- | --- |
| Titan | 2/7/3 | 2/7/2 | 2/7/2 | 0/2/1 | 0/3/1 | 3/5/5 |
| Hunter | 3/7/1 | 3/7/4 | 3/7/2 | 1/2/1 | 1/3/1 | 5/3/4 |
| Warlock | 2/7/1 | 2/7/2 | 3/7/1 | 1/2/1 | 1/3/1 | 4/3/4 |

Alle Kombinationen einzeln zu simulieren wäre bis zu 75-mal langsamer (etwa 30 bis 50 s).

## Idee: Grenade und Melee getrennt wählen

- Grenade und Melee beeinflussen weder die Waffe noch einander. Nur Supers geben Effects (Well, Deadfall, Moebius Quiver) und pausieren die Waffe (Super Window).
- Pro Kombination aus Effects und Super eine Simulation, in der alle passenden Grenades und Melees gleichzeitig laufen. Aus `damageShares` die beste Grenade und die beste Melee nehmen.
- Aufwand etwa Effects × Supers statt Effects × Super × Grenade × Melee; erwartet 2 bis 3 s.
- Ein Test prüft, dass die Abkürzung dasselbe liefert wie das Durchprobieren (eine Subklasse).

**Voraussetzung, die brechen kann:** Die Abkürzung gilt nur, solange Grenade und Melee keine Effects geben und nicht voneinander abhängen. Kommen solche Mechanics dazu (z. B. eine Grenade, die einen Buff gibt, oder Ember, das an Grenade-Kills hängt), braucht der Optimizer einen anderen Weg: Abkürzung nur für unabhängige Abilities, Rechnen im Web Worker, oder Abbrechen von Zweigen, die das aktuelle Top 15 nicht mehr erreichen können.

## Regeln

- Jeder Slot bekommt eine Ability, wenn die Subklasse eine hat.
- Einsatzzeiten: Jede Kandidatin bekommt die Einsätze des Slots aus der Rotation; ist der Slot leer, einen Einsatz bei 0 s.
- Ability Stat bleibt wie eingestellt.
- Ein eigener Effect der Super-Gruppe (z. B. Banner Shield) ersetzt den Super (wie heute).

## Schritte

| Schritt | Inhalt | Tests zuerst |
| --- | --- | --- |
| Engine | `optimize` bekommt Abilities, Stat-Werte und Einsätze pro Slot; jeder Eintrag enthält die gewählten Abilities | Abilities passen zu Klasse und Subklasse; Total Damage gleich `simulate` des ganzen Builds; Abkürzung gleich Durchprobieren; Einsätze übernommen; Super-Gruppe ohne Super |
| Oberfläche | Karten zeigen Ability-Icons; „Übernehmen“ und „Vergleichen“ übernehmen Abilities; Hinweis „neu starten“ achtet auf Stat und Einsätze | Screenshot-Prüfung |
| Doku | Glossary „Optimizer“, Roadmap, Changelog | – |

## Bekannte Grenzen

- Energie und Cooldowns prüft der Rechner nicht: Der Optimizer nimmt immer den stärksten Super.
- 13 Aegis-Pakete enthalten Ember of Ashes und sind ohne Ember zu hoch. Der Optimizer würde sie bevorzugen; die Karte sollte das zeigen, bis die Lücke behoben ist.
- Slots festhalten (z. B. „Super bleibt Well“) erst, wenn eine User Story es verlangt.
