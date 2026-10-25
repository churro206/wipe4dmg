# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Rangfolge-Gate bauen (Opus plant, Sonnet setzt um).** Vorschlag in `docs/product.md`, „Rangfolge-Gate“: Zeilen der Gesamtprobe (`tests/metaProbe*.test.ts`) nach Gruppen der Spalte „Prüft“, pro Gruppe Spearman ≥ 0,9, Aegis-Top-3 in unseren Top 5, Delta-Paare ±2 Prozentpunkte, Abdeckung pro Gruppe als Tabelle. Erst messen, dann Schwellen mit dem Inhaber bestätigen. Produktziel lesen: `docs/product.md`.

## Reihenfolge

1. Rangfolge-Gate, siehe oben.
2. UI „Die erste Minute“ (Sonnet): Prompt 2 in `docs/plans/cleanup-prompts.md`; dabei `src/ui/App.tsx` in Panels aufteilen, wo der Block es anfasst.
3. Code-Aufräumen (Sonnet): `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
4. Solar: Roaring Flames x3 und Solar Fulmination (Opus plant), dann Ergo Sum, echte Debuffs am Ziel, fehlende Supers; Reihenfolge nach dem Rangfolge-Gate. Arbeitsliste: `docs/known-inaccuracies.md`, „Offene Lücken“.
5. Für 2.0 (`docs/product.md`): Legendary Frames aus Aegis, Optimizer mit Abilities, Aspects und Fragments.

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
