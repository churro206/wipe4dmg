# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: Aufräumen nach B4 (Sonnet, noch nicht geplant)

Laut `ground-up-model.md`: was B1–B4 hinterlassen haben (tote Pfade im Import, doppelte Typen, Dateien über 1000 Zeilen, die beim Arbeiten stören). Kandidaten aus B4:

- `weaponPackages.ts` (über 2500 Zeilen): Item-Zweig und Bericht (`pickBaseRow`, `catalystBuffs`, `blockingReason`) in `scripts/lib/items/` ziehen; Override-Felder, die kein Override mehr nutzt (`setup`, `nthShotPart`, `catalystWindowSeconds`?), mit ihrem Code streichen. Vorher per Grep prüfen, wer sie noch nutzt.
- Zirkulärer Import `weaponPackages.ts` ↔ `items/weaponItem.ts` (über `refs.ts` → `timingFromQuantum`): Timing-Funktionen in eine eigene Datei.
- `options` der Waffe (Paket-Optionen) neben `buffs` und `catalystBuffs`: nach B6 eine Form.

Danach P (Prüfstand ganzer Builds, Opus plant).

## B4 erledigt (2026-11-01)

B4a (Schritte 1–5) und B4b (6 Truth, 7 Hierarchy of Needs, 8 Abschluss) fertig, je Schritt ein Commit. Details im Changelog. Kennzahlen: Delta-Paare 1 von 3, Spearman 0,89 (11 Zeilen), Abdeckung Supers 94 %, Heavy 48 %, Special 52 %.

## Stand

- Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8> (Stand vor B4b; Quelle ist `docs/architecture.md`).
- Offen ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt. Argent Ordnance ohne Reload-Teil (Compendium „+?“), wirkt bei Truth unter 15 s.
- Offen beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung; Polaris-Schuss aus Quantum (97) statt Aegis (96,677) – so umgesetzt, gleiche Regel jetzt bei Truth und Hierarchy.

## Reihenfolge

Aufräumen → P (Prüfstand) → B6 (Breite) → C (Casts, Energie) → B5 (Eichung). Begründung in `ground-up-model.md`.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt. Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
