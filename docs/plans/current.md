# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Q2 Rest: fehlende Supers** (Opus leitet her, Sonnet baut): Song of Flame, Glacial Quake, Bladefury, Hammer of Sol mit Sol Invictus, Stormdancer's Brace. Grundwerte aus Aegis Testing (`aegis/247390216:2-29`, Buffs herausrechnen), Länge und Gesamtschaden aus Flat Gain (`flatgain/727352169`, Super 200) als Gate. Danach Flat-Gain-Gesamtschaden als Super-Rangfolge-Gate. Plan in `docs/plans/sources-2026-10.md` (Abschnitte 2 und 5).

Erledigt (2026-10-26, großer Block auf Wunsch des Inhabers, Details im Changelog): Q1 komplett (K1 Reload enthält Rally, K5 Solar-Cooldowns, Warlock ×1,1, Chunk Scalars, K6 Facet of Courage, K7 Coverage) und K2 (Super-Fenster aus Flat Gain). Befunde, die vom Plan abweichen:
- K1: Aegis lädt genauso schnell wie Quantum, beide mit Rally. Statt Rally herauszurechnen, trägt jede Waffe `reloadDurationIncluded`; Builds ohne Rally laden im Modell zu schnell (wie Aegis).
- K5: Frenzied Blade und Arcane Needle sind keine Wertfehler, sondern eingebaute Ladungen (Q3).
- K7: Spark of Volts, Discharge, Momentum und Instinct bleiben „fehlt“ (vorher aufbaubar, Regel des Inhabers).

## Reihenfolge

Details und Fundstellen: `docs/plans/sources-2026-10.md`.

1. Q2 Rest (Opus/Sonnet), siehe oben.
2. Q3 Energie: Stat-Kurve (K3), Regen-Multiplikatoren (K4), eingebaute Ladungen (Frenzied Blade, Arcane Needle), Energie-Exotics und -Mods (Opus plant).
3. Aufräum-Block (Sonnet; nach drei Funktions-Blöcken fällig): `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code, `App.tsx` in Panels. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
4. Zähler für Jolt, Volatile, Unravel, Bolt Charge in der Ergebniszeile (Sonnet).
5. Q4 Stasis/Strand (echte Debuffs am Ziel, Bedingung von Facet of Courage), Q5 Aspects/Artifact/Bolt Charge, Q6 Waffen und Catalysts, Q7 Set Bonuses (Umfang mit dem Inhaber klären).
6. Für 2.0 (`docs/product.md`): Legendary Frames, Optimizer mit Abilities, Aspects und Fragments.

## Entscheidungen des Inhabers

- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
- Eigene Quellen gelten nur für die Dauer aus ihrem Text, ab Beginn der Phase; länger nur, wenn ein modellierter Auslöser sie auffrischt. Buffs von Teammates gelten die ganze Phase.
- Die Rückwärtskompatibilität von Links hat keine hohe Priorität.
- Tooltips erklären, was ein Item tut, ohne Quellen.
- Legendary Frames: bis zu ihrem Block übersprungen, für 2.0 kommen sie hinein (2026-10-25).
- Abstände zählen, absolute Zahlen nicht. Der Optimizer optimiert die gewählte Phasenlänge und hat Priorität (2026-10-25).
- Größere Blöcke sind erlaubt, Commit je Teil (2026-10-26).

## Zurückgestellt (Aufräumen 2026-10-25, geringer Nutzen)

`src/data/schema.ts` und `scripts/lib/weaponPackages.ts` aufteilen; Rohdaten-Snapshots aus `src/data` nach `data/sources/`; `noUncheckedIndexedAccess`; Bundle lazy-load (`weapon-packages.json` 690 KB). Wieder aufnehmen, wenn eine Datei beim Arbeiten stört oder die Ladezeit auffällt.

## Werkzeuge

- Nach einem Patch: Skill `nach-patch`.
- UI-Check: Skill `pruefen`, Schritt 4.
