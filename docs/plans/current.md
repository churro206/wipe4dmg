# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Delta-Lücken schließen (Opus analysiert, Sonnet setzt um).** Das Rangfolge-Gate steht (`docs/ranking-gate.md`, Abweichungen mit Grund in `tests/fixtures/ranking-gate.json`). Ursachen klären und beheben, größte zuerst: Sol Invictus (Delta 0 statt +46 %), Dawn Chorus (0 statt +24 %), Feast of Light x6 (+70 statt +50 % bei Nova Bomb und Twilight Arsenal, +66 statt +77 % bei Gathering Storm), Shards of Galanor (3,9 Punkte), Super-Top-3 (2 von 3). Jede behobene Abweichung aus der Fixture streichen. Wirkung unter 2 % nach `docs/known-inaccuracies.md`.

## Reihenfolge

1. Delta-Lücken, siehe oben.
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
