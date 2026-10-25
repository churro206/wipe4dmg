# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**UI „Die erste Minute“ (Sonnet)**, Prompt 2 in `docs/plans/cleanup-prompts.md`; dabei `src/ui/App.tsx` in Panels aufteilen, wo der Block es anfasst.

Zuletzt erledigt (2026-10-25): Delta-Lücken. Feast of Light mit Obergrenzen pro Super, Dawn Chorus auf Ignitions, Sol Invictus bei Chaos Reach. Super-Spearman 0,98. Rest in `tests/fixtures/ranking-gate.json`: Gathering Storm und Shards of Galanor (Aegis widerspricht sich zwischen Tabs, Zahlen dort), Super-Top-3 (Stormdancer's Brace fehlt). Offen und ungeprüft: doppelte Ignition bei Daybreak mit Dawn Chorus; Sol Invictus bei Hammer of Sol und Burning Maul (Zeilen nennen auch Roaring Flames x3).

## Reihenfolge

1. UI „Die erste Minute“ (Sonnet): Prompt 2 in `docs/plans/cleanup-prompts.md`; dabei `src/ui/App.tsx` in Panels aufteilen, wo der Block es anfasst.
2. Code-Aufräumen (Sonnet): `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
3. Solar: Roaring Flames x3 und Solar Fulmination (Opus plant), dann Ergo Sum, echte Debuffs am Ziel, fehlende Supers; dazu Stormdancer's Brace (Super-Top-3). Reihenfolge nach dem Rangfolge-Gate. Arbeitsliste: `docs/known-inaccuracies.md`, „Offene Lücken“.
4. Für 2.0 (`docs/product.md`): Legendary Frames aus Aegis, Optimizer mit Abilities, Aspects und Fragments.

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
