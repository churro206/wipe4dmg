# ADR 0009: Abilities aus Ability Components, Aegis-Pakete als Fallback und Gate

Status: angenommen · Datum: 2026-10-19

## Kontext

US-14 verlangt, dass Grenades, Melees und Supers in den Total Damage eingehen, alle Supers abgedeckt.
Eine Ability ist kein einzelner Wert:

- Sie besteht aus Teilen: Impact, Explosion, Ticks, oft Keyword-Schaden wie Ignition oder Jolt.
- Aspects, Fragments und Exotics ändern Anzahl oder Stärke der Teile, z. B. Knock Em Down bei Blade Barrage.
- Die Ausführung zählt: Light- oder Heavy-Angriffe, geladen oder ungeladen, Abstand.
- Buffs und der Ability Stat wirken nicht auf alle Teile gleich. Laut Compendium skalieren Melee-Buffs und der Melee-Stat keine Ignition.

Zwei Community-Quellen beschreiben Abilities:

| Quelle | Was sie liefert | Grenze |
| --- | --- | --- |
| Aegis, Reiter „Abilties“ | Gemessener Schaden pro Einsatz in festen Szenarien (Paketen), geteilt durch die Standard-Multiplier des Tests („Full Modifiers“, meist ×2,30), bei Stat 100 und 200. Laut Reiter „Home“ „base values for every ability damage source“, also dieselbe Skala wie die Waffen-Grundwerte. | Nur getestete Kombinationen. Manche Pakete enthalten Buffs (Radiant, Banner of War, Feast of Light). Teile nur als Freitext. |
| Compendium, Subklassen-Reiter | Teile mit Grundwerten, Super-Dauer, Energieverbrauch pro Angriff, Pausen zwischen Angriffen | Freitext, einzelne Werte fehlen („?“), Stand pro Eintrag unterschiedlich |

Stichproben zeigen dieselbe Skala: Thunderclap 703 / 702, Ignition 676 / 675, Phantom Surge 595 / 594 (Compendium / Aegis visual Value). Die Tick-Spalten von Aegis entsprechen Compendium × 2,30 (Thundercrash: 18 997 = 8260 × 2,30).
Der Faktor von Stat 100 auf 200 ist bei reinen Abilities fest (Super ×1,45, Grenade ×1,65, Melee ×1,30), bei Abilities mit Keyword-Schaden kleiner (Celestial Fire mit Ignition ×1,10).

Geprüft und verworfen:

- **Nur Pakete:** gemessen und einfach, aber Aspects und Exotics sind nicht einzeln schaltbar, und eingerechnete Buffs können doppelt zählen.
- **Faktoren aus Paketen ableiten und frei kombinieren:** setzt voraus, dass sich Faktoren unabhängig multiplizieren. Das stimmt oft nicht.
- **Alles in Teile zerlegen, ohne Rückfallebene:** Für einige Abilities fehlen Werte. Wir müssten raten.

## Entscheidung

1. Eine **Ability** besteht aus **Ability Components**. Jede Component erzeugt Damage Instances auf der Zeitachse (ADR 0001) mit der Damage Source der Ability (`super`, `grenade`, `melee`).
2. **Teile, wo belegt:** Component-Werte kommen aus dem Compendium. Jeder Wert zitiert seine Textstelle. Ein Snapshot des Compendium-Texts erkennt Änderungen nach Patches.
3. **Paket als Fallback:** Fehlen Teile oder besteht die Ability das Gate nicht, hat sie genau eine Component mit dem Aegis-Gesamtwert pro Einsatz. Bei Supers mit Dauer wird der Wert gleichmäßig über das Super Window verteilt.
4. **Aegis ist das Gate:** Ein Test simuliert jede Aegis-Zeile, die sich abbilden lässt, ohne Buffs bei Stat 100 und 200. Das Ergebnis muss innerhalb von ±10 % des visual Value liegen.
5. **Keine doppelte Zählung:**
   - Components sind ungebufft, Buffs kommen nur über Effects.
   - Ein Paket führt `includedEffectIds` für die Buffs, die Aegis eingerechnet hat. Die Engine wendet diese Effects auf das Paket nicht noch einmal an.
6. **Keyword-Schaden einer Ability** (z. B. Ignition einer Fusion Grenade) ist eine Component dieser Ability und trägt deren Damage Source. Ob er mit dem Ability Stat skaliert, steht pro Component (`scalesWithAbilityStat`).
7. **Ability Stat:** Jeder Wert von 0 bis 200. Laut Compendium („Game Mechanics“) steigt der Schaden linear pro Punkt über 100: Super +0,45 %, Grenade +0,65 %, Melee +0,3 %. Die Werte stehen in `ability-stats.json`, der Multiplier im Bucket `abilityStat`; er wirkt nur auf Components mit `scalesWithAbilityStat`. Bei 200 entspricht das dem Median der Aegis-Messungen (×1,447 / ×1,649 / ×1,300).
8. **Super Window:** Ein Super mit Dauer blockiert in dieser Zeit die Shots der Waffe, wenn `blocksWeapon` gesetzt ist.
9. Aspects und Exotics, die Abilities verändern, sind Effects. Ein Build hat höchstens eine Exotic-Rüstung (Exclusive Group `exotic-armor`).

## Folgen

- Dasselbe Muster wie bei One Thousand Voices: Einzelwerte aus einer Quelle, Gegenprüfung gegen Aegis.
- Engine und Oberfläche behandeln Teile und Pakete gleich. Eine Ability kann später vom Paket zu Teilen wechseln, ohne dass sich das Modell ändert.
- Neue Data Files: `abilities.json` (Abilities), `aegis-abilities.json` (Aegis-Import, Gate), `compendium-abilities.json` (Snapshot).
- Der Fallback auf Pakete beschränkt die Kombinationen auf die von Aegis getesteten. Das ist akzeptiert, weil Aegis die sinnvollen Kombinationen testet.
- Grenzen:
  - Energie und Cooldowns (ADR 0006, Stufe C) fehlen. Die Rotation legt die Casts fest.
  - Cast-Animationen ohne Quelle blockieren die Waffe nicht.
  - Woraus sich die ×2,30 von Aegis zusammensetzen, ist nicht dokumentiert. Wir übernehmen den Quotienten.
