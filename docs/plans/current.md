# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Produktziel schärfen (Opus).** Interview mit dem Inhaber (AskUserQuestion): Wer nutzt die Seite, welche 20 Fragen stellen diese Leute, welche Genauigkeit braucht jede Frage (reicht die Rangfolge?), Nicht-Ziele, wann ist 2.0 fertig. Ergebnis: `docs/product.md` (höchstens 3 KB) und ein Vorschlag für ein Rangfolge-Gate (Rangfolge unserer Builds gegen Aegis Sustained/Swap, z. B. Spearman ≥ 0,9). Vorlage: Prompt 3 in `docs/plans/cleanup-prompts.md`.

## Reihenfolge

1. Produktziel (Opus), siehe oben.
2. UI „Die erste Minute“ (Sonnet): Prompt 2 in `docs/plans/cleanup-prompts.md`; dabei `src/ui/App.tsx` in Panels aufteilen, wo der Block es anfasst.
3. Code-Aufräumen (Sonnet): `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
4. Solar: Roaring Flames x3 und Solar Fulmination (Opus plant), dann Ergo Sum, echte Debuffs am Ziel, fehlende Supers; Reihenfolge nach dem Rangfolge-Gate. Arbeitsliste: `docs/known-inaccuracies.md`, „Offene Lücken“.

Nach drei Funktions-Blöcken folgt ein Aufräum-Block.

## Entscheidungen des Inhabers

- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
- Eigene Quellen gelten nur für die Dauer aus ihrem Text, ab Beginn der Phase; länger nur, wenn ein modellierter Auslöser sie auffrischt. Buffs von Teammates gelten die ganze Phase.
- Die Rückwärtskompatibilität von Links hat keine hohe Priorität.
- Tooltips erklären, was ein Item tut, ohne Quellen.
- Legendary Frames in Aegis sind übersprungen.

## Zurückgestellt (Aufräumen 2026-10-25, geringer Nutzen)

`src/data/schema.ts` und `scripts/lib/weaponPackages.ts` aufteilen; Rohdaten-Snapshots aus `src/data` nach `data/sources/`; `noUncheckedIndexedAccess`; Bundle lazy-load (`weapon-packages.json` 690 KB). Wieder aufnehmen, wenn eine Datei beim Arbeiten stört oder die Ladezeit auffällt.

## Werkzeuge

- Nach einem Patch: Skill `nach-patch`.
- UI-Check: Skill `pruefen`, Schritt 4.
