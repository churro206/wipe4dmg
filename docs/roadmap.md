# Roadmap

Was der Rechner als Nächstes lernt. Die genaue Abdeckung steht in der [Abdeckung](coverage.md).

Stand: 2026-10-20

## In Arbeit (v1.1)

- ✅ Fundament für mehrere Waffen: jede Waffe als eigene Datei mit eigenem Abgleich gegen die Quellen
- Weitere Waffen automatisch aus Aegis und Quantum: zuerst exotische Special- und Heavy-Waffen (Truth, Thunderlord und bis zu 80 weitere), Waffenauswahl mit Suche. Perks, Mods und Katalysatoren als Schalter; Buffs mit kurzer Dauer sind markiert.
- Exotic-Rüstung: Dawn Chorus und weitere Exotics mit großer Wirkung auf den Schaden (z. B. Mantle of Battle Harmony mit Surge 4x)
- Plan: [Waffen und Exotic-Rüstung](plans/weapons-and-exotic-armor.md)

## Fertig in v1.0: Fähigkeiten und Supers

- ✅ Rechenkern für Fähigkeiten: Schaden auf der Zeitachse, Stat 0 bis 200, Super Window (die Waffe pausiert während des Supers), keine doppelt gezählten Buffs
- ✅ Automatischer Abgleich mit Aegis und dem Compendium nach jedem Patch
- ✅ Supers: 25 von 31 mit Schaden (gemessener Gesamtwert von Aegis), Well of Radiance als Buff
- ⏳ Super Window genauer: Bei vielen Supers fehlt in den Quellen der Abstand zwischen Angriffen oder Schüssen; dann gilt die Base Duration als Obergrenze
- ✅ Grenades: 26 von 30, Melees: 24 von 26 (gemessener Gesamtwert von Aegis)
- ✅ Icons und Zuordnung zu Klasse und Subklasse aus dem Bungie-Manifest, inklusive Prismatic
- ✅ Oberfläche: Plätze für Super, Grenade und Melee mit Icons, Stat-Regler 0 bis 200, Hover-Karte mit Herkunft des Werts
- ⏳ Korrekturen aus der Recherche vom 2026-10-20: ✅ Ember of Ashes (jetzt +19 % wie Quantum, vorher +9 %); ✅ Katalysator (jetzt ×1,39 wie Aegis und blueberries.gg, vorher ×1,26); ✅ Golden Gun: Radiant und Well wirken (+20 %), ohne sie ist Golden Gun nicht mehr zu stark
- ✅ Oberfläche: Donut „Schaden nach Quelle“ mit Waffenteilen und je einem Stück pro Ability (Name und Icon)
- ✅ Oberfläche: Breakdown-Tabelle mit einer Spalte pro Quelle (Waffe und jede Ability) und dem Schaden pro Quelle
- ✅ Oberfläche: Zeitleiste mit Fähigkeiten und schraffiertem Super Window, Einsatzzeiten einstellbar, weitere Einsätze über „+“
- ✅ Surges: Stufen 1x bis 3x wie die Rüstungs-Mods, passend zum Element der Waffe (Icon nach Element). Surge 4x kommt mit Exotic-Rüstung.
- ✅ Oberfläche wie im Spiel: Waffe mit Katalysator oben, dann Klasse, Subklasse, Fähigkeiten mit Class Ability, Fragmente, Rüstung (Exotic folgt, Mods), Stats als Block, Artefakt, Fireteam Support
- ✅ Wiki: „Wie rechnet der Rechner?“, Abdeckung und Roadmap. Erklärungen zu einzelnen Mechanics folgen.

## Danach

- Song of Flame, Glacial Quake, Bladefury und Hammer of Sol mit Sol Invictus: fehlen noch, weil Aegis sie nur mit Buffs im Wert gemessen hat
- Ward of Dawn: Weapons of Light als Effect
- Healing, Coldsnap und Duskfield Grenade, Grapple, Combination Blow und Chain Lightning: keine Aegis-Messung
- Feast of Light und Banner of War als Effects
- Well of Radiance: Der Waffenschaden des Casters zählt als Super-Schaden, die Dauer wächst mit dem Super-Stat
- Golden Gun Marksman: Line 'Em Up bei Precision Hits
- Fehlende Zeitwerte: Schussabstand von Golden Gun und Moebius Quiver, Flugzeit von Thundercrash
- 13 Aegis-Pakete enthalten Ember of Ashes (z. B. Fusion Grenade, Hammer Strike): ohne Ember im Build sind sie zu hoch, weil Ember sich nicht als Faktor herausrechnen lässt
- Expanding Abyss: hebt Weaken auf 25 %, Tractor Cannon und Moebius auf 35 %, Deadfall auf 40 %
- Melee-Buffs: addieren sich untereinander (laut Court), brauchen eigenen Bucket
- Import von Courts Stacking Guide mit Snapshot und Zitat-Check, wie beim Compendium

## Später (v1.x)

- Optimizer mit Fähigkeiten: probiert auch Super, Grenade und Melee ([Plan](plans/optimizer-abilities.md)). Bis dahin übernimmt er die gewählten Abilities.
- Builds im Browser speichern
- Weitere exotische Waffen; dafür Archetype, Waffen-Stats und Perk-Pools aus dem Bungie-Manifest
- Discord Bot
