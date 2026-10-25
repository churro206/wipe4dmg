# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Vorschlag (noch nicht freigegeben): Q1 Quellen-Korrekturen**, Plan in `docs/plans/sources-2026-10.md` (Opus leitet K1 her, Sonnet baut): Quantum-Reload enthält Rally/Lunafaction (doppelt mit unserem Rally-Effekt), Chunk Scalars und Cooldowns gegen Flat Gain, Facet of Courage, Coverage-Einstufungen. Danach Zähler-Block, dann Aufräumen.

Erledigt (2026-10-25): Sichtung aller 14 Sheets von destiny2.science, Archiv `docs/sources/sheets/` (95 Reiter als TSV, `index.json`, `coverage-hits.json`), Ergebnis `docs/sources/sichtung-2026-10-25.md`.

Zuvor erledigt (2026-10-25, Details im Changelog): Coverage-Seite (`src/data/coverage-catalog.json`, `npm run coverage`, dann `npm run import:icons`; Anzeige im Browser ungeprüft) und Delta-Lücken (Rest in `tests/fixtures/ranking-gate.json`; ungeprüft: doppelte Ignition bei Daybreak mit Dawn Chorus, Sol Invictus bei Hammer of Sol und Burning Maul).

## Reihenfolge

Details und Fundstellen: `docs/plans/sources-2026-10.md`.

1. Q1 Quellen-Korrekturen (Opus/Sonnet), siehe oben.
2. Zähler für Jolt, Volatile, Unravel, Bolt Charge in der Ergebniszeile (Opus plant, Sonnet baut).
3. Code-Aufräumen (Sonnet), auch `App.tsx` in Panels: `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
4. Q2 Supers: Längen aus Flat Gain, Song of Flame, Glacial Quake, Bladefury, Hammer of Sol mit Sol Invictus; Stormdancer's Brace (Super-Top-3) (Opus plant).
5. Q3 Energie: Stat-Kurve, Regen-Multiplikatoren, Energie-Exotics und -Mods (Opus plant).
6. Q4 Stasis/Strand (echte Debuffs am Ziel, Shatter, Threadlings, Freeze), dann Q5 Aspects/Artifact/Bolt Charge, Q6 Waffen und Catalysts, Q7 Set Bonuses (Umfang mit dem Inhaber klären). Ergo Sum und der Rest der alten Solar-Liste nach dem Rangfolge-Gate.
7. Für 2.0 (`docs/product.md`): Legendary Frames aus Aegis (Grundwerte auch in Endgame Analysis Archetypes), Optimizer mit Abilities, Aspects und Fragments.

Nach drei Funktions-Blöcken folgt ein Aufräum-Block.

## Entscheidungen des Inhabers

- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
- Eigene Quellen gelten nur für die Dauer aus ihrem Text, ab Beginn der Phase; länger nur, wenn ein modellierter Auslöser sie auffrischt. Buffs von Teammates gelten die ganze Phase.
- Die Rückwärtskompatibilität von Links hat keine hohe Priorität.
- Tooltips erklären, was ein Item tut, ohne Quellen.
- Legendary Frames: bis zu ihrem Block übersprungen, für 2.0 kommen sie hinein (2026-10-25).
- Abstände zählen, absolute Zahlen nicht. Der Optimizer optimiert die gewählte Phasenlänge und hat Priorität (2026-10-25).

## Zurückgestellt (Aufräumen 2026-10-25, geringer Nutzen)

`src/data/schema.ts` und `scripts/lib/weaponPackages.ts` aufteilen; Rohdaten-Snapshots aus `src/data` nach `data/sources/`; `noUncheckedIndexedAccess`; Bundle lazy-load (`weapon-packages.json` 690 KB). Wieder aufnehmen, wenn eine Datei beim Arbeiten stört oder die Ladezeit auffällt.

## Werkzeuge

- Nach einem Patch: Skill `nach-patch`.
- UI-Check: Skill `pruefen`, Schritt 4.
