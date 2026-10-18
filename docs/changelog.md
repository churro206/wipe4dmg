# Changelog

## Unveröffentlicht (v1.0 in Arbeit)

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
