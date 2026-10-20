# Changelog

## Unveröffentlicht (v1.0 in Arbeit)

- Wiki (US-15): Schalter „Rechner | Wiki“ oben rechts. Startseite „Wie rechnet der Rechner?“ (Zeitachse, Buckets mit Beispiel, Quellen und Gates, Grenzen), dazu Abdeckung und Roadmap. Erklärungen zu einzelnen Mechanics folgen.
- Fähigkeiten und Supers (US-14, ADR 0009):
  - Drei Plätze für Super, Grenade und Melee mit Ingame-Icons, passend zu Klasse und Subklasse inklusive Prismatic.
  - Stat-Regler 0 bis 200: Über 100 erhöht jeder Punkt den Schaden (Super +0,45 %, Grenade +0,65 %, Melee +0,3 %, laut Compendium).
  - Werte: 25 Supers, 26 Grenades und 24 Melees als gemessener Wert pro Einsatz von Aegis, automatisch importiert und gegen Aegis geprüft. Lücken mit Grund in `docs/coverage.md`.
  - Während eines Supers feuert die Waffe nicht (Super Window). Es ist exakt bei Hammer of Sol (7,8 s), Burning Maul und Chaos Reach, sonst eine Schätzung.
  - Buffs, die Aegis schon eingerechnet hat (Radiant, Ember of Ashes, Tether), zählen nicht doppelt. Ein Super bringt seinen Effect mit, z. B. Well of Radiance oder den Tether.
  - Ein Build hat ein Super: Der Super-Platz ersetzt eigene Super-Effects. Alte Links übernehmen sie auf den Super-Platz.
- Link-Format 3 mit Fähigkeiten und Stats. Ältere Links funktionieren weiter.
- Recherche zu Ember of Ashes, Katalysator, Particle Reconstruction und Buffs auf Supers: drei Fehler im Modell gefunden und dokumentiert. Neue Regel für zerlegte Werte (ADR 0011): Quellen nur als Verhältnis mischen, jede Zerlegung braucht ein Gate.
- Korrigiert: Ember of Ashes bringt jetzt +19 % statt +9 % (jeder Shot zündet), der Katalysator ×1,39 statt ×1,26. Beide stimmen auf 2 % mit Aegis überein.
- Rotation mit Fähigkeiten: eigene Zeile pro Ability in der Zeitleiste, Super Window schraffiert (gestrichelt, wenn geschätzt), Einsatzzeiten in Sekunden, weitere Einsätze über „+“. Energie und Cooldowns prüft der Rechner nicht.
- Breakdown-Tabelle pro Quelle: Multiplier jedes Buckets für die Waffe und jede Ability, „–“ wo ein Bucket nicht wirkt, Schaden pro Quelle in der Fußzeile.
- Donut „Schaden nach Quelle“: Shots, Ignitions und Taken Seeker der Waffe, dazu Super, Grenade und Melee mit Namen und Icon statt technischer IDs. Feste Farben pro Art, geprüft für hellen und dunklen Modus.
- Ingame-Tests eingearbeitet: Shot-Abstand von One Thousand Voices 1,733 s statt 1,818 s (höhere DPS, gleicher Total Damage), Ignition-Cooldown 1,3 s statt 1,6 s, Explosionen gestaffelt.
- Golden Gun: Radiant und Well of Radiance erhöhen den Schaden um 20 %. Ohne sie war Golden Gun bisher 20 % zu stark, weil Aegis mit Radiant gemessen hat.
- Abdeckung und Roadmap als Dokumente (`docs/coverage.md`, `docs/roadmap.md`, US-15, ADR 0010).
- Tether-Dauern laut Compendium: Deadfall 12 s, Moebius 6 s pro Salve.
- Courts Stacking Guide vollständig abgeglichen: Surge 3x (22 %) und die Stacking-Regeln für Amplification, Weapon Perks und Exotic Intrinsics sind jetzt belegt. MossyMax geprüft, veraltet.

- Neue Oberfläche mit Ingame-Icons (ADR 0008): Effects als Icon-Kacheln mit Hover-Karte (Wirkung, Dauer, Quelle), Klasse und Subklasse als Schaltflächen mit Icons, Kennzahlen immer sichtbar, Ergebnis in Reitern (Übersicht, Rotation, Breakdown, Optimizer), Optimizer-Einträge als Karten mit Icon-Reihe, Fireteam Support einklappbar, Erklärungen als ⓘ.

- Katalysator von One Thousand Voices: Taken Seeker als Damage over Time (Werte aus dem Compendium). Offene Abweichung zu Aegis: Modell ×1,26, Aegis ×1,371.
- Link teilen (US-05): Der Build steht kompakt in der Adresse, z. B. `?b=AgEBAcCyBAMKAAAADQEAAAEDALHqAQA` (etwa 30 bis 50 Zeichen), und lässt sich kopieren. Ein festgehaltener Vergleich steht im selben Link.
- Optimizer (US-08): Für die gewählte Klasse probiert er alle Subklassen und erlaubten Kombinationen eigener Effects und zeigt die 15 besten Builds als Balken und Tabelle. Jeder Eintrag lässt sich übernehmen oder als Vergleich festhalten. Effects ohne Nutzen lässt er weg.
- Subklasse wählbar (Arc, Solar, Void, Stasis, Strand, Prismatic); eigene Subklassen-Effects passen zur Subklasse. Kurznamen für Effects in Rangliste und Zeitleiste.
- Klassen und Anbieter: Klasse wählbar; Effects nach eigener Subklasse, Rüstung, Artefakt und Fireteam Support. Well of Radiance, Rift, Banner und Tether gibt es auch von Mitspielern. Pro Build höchstens ein eigenes Super und eine Surge-Stufe.
- Vergleich (US-09): aktueller Build gegen festgehaltenen Build bei gleicher Damage Phase; Kennzahlen mit Differenz und beide Damage Curves in einem Diagramm.
- Rotation (US-07, Stufe B aus ADR 0006): Effects wirken nur in ihrem Zeitfenster. Start und Dauer sind pro Effect einstellbar, die Dauer ist aus Courts Tabelle vorbelegt (Well 30 s, Rift 15 s, Lumina 11 s, Tractor Cannon 10 s, Elemental Overdrive 7 s). Uptime pro Effect und Zeitleiste mit Zeitfenstern, Shots und Ignitions.
- Diagramme mit Recharts (ADR 0007): Schaden nach Art (Donut mit Legende und Werten), Damage Curve (US-06), DPS je Länge der Damage Phase, Beitrag pro Bucket als Balken.

## 0.5.0 – 2026-10-18 (MVP)

Manual Mode für One Thousand Voices (US-01 bis US-04).

- Effects zum Anhaken nach Subklasse, Rüstung, Artefakt und Fireteam Support: Empowering Buffs, Debuffs, Solar Surges, Weapons Stat 200, Elemental Overdrive, Particle Reconstruction, Ember of Ashes.
- Damage Phase als freie Eingabe oder per Boss (47 Bosse aus der Aegis-Tabelle, automatischer Import).
- Ergebnis: Total Damage, DPS, Shots, Ignitions und Breakdown pro Bucket.
- Simulator: Buckets nach Courts Kategorien, Vorrangregeln (Divinity über Particle Reconstruction), Timing-Effekte (keine Reloads), Scorch und Ignition über Zähler und Schwelle.
- Gate-Test gegen die Quellen: Quantum (23 980 ohne, 28 430 mit Ignitions) und Aegis (Multiplier ×2,355).

Einschränkungen: Effects sind die ganze Damage Phase aktiv. Burn-Schaden, Katalysator, Fähigkeiten und Supers fehlen noch.

## 0.1.0 – 2026-10-18 (Walking Skeleton)

- Shot-Zeitachse und Total Damage von One Thousand Voices ohne Buffs, Grundwerte aus Quantum Damage-ics.
- Online unter https://wipe4dmg.pages.dev (Cloudflare Pages).
