# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Aufräum-Block** (überfällig: sechs Funktions-Blöcke seit 2026-10-25; Sonnet). Arbeit auf Branch `ground-up-model`. Kandidaten: Override-Felder für Teile (`nthShotPart`, `playstyleParts`, `setup`) und ihr Import in `weaponPackages.ts` (über 2400 Zeilen); doppelte `stacksAt`/`resolveHitStacks` in `simulate.ts` und `core/context.ts` erst mit S6; `current.md`-Archiv kürzen. Danach S5 (Strategie und Casts, Opus plant). Offen ohne Quelle: Dragon's Breath (Pool-Takt „?“), Ager's Scepter, Celestial Nighthawk (Eich-Zeilen). Lord of Wolves trifft schon (−0,1 / −2,9 %), nicht zerlegt.

S4 Teil C erledigt (2026-10-31): Barrow-Dyad wählbar. Die −9 % der Papierprobe kamen vom fehlenden Target Lock (×1,25 auf Kugeln), nicht von der Seeker-Zahl: −0,7 %. „<Perk> Refit“ zählt als Perk der Waffe. Seeker-Treffer zählen im Kern für `hitStacks`, Peacekeepers hält über den Reload (×1,33, Aegis ×1,32). Prüfstand 26 von 30, parts 3 von 3; Peacekeepers-Zeile −4,6 % (Prüfstand zählt nur das erste Magazin). Plausibilitätsregel Primary ≤ 1,5 × Gjallarhorn (Barrow ×1,38, Aegis belegt).

S4 Teil B erledigt (2026-10-30): Polaris Lance aus Teilen (Perfect Fifth alle 5 Schüsse mit x40 Scorch, kein Reload), Hierarchy „Through two rings“ als Spielweise, `setupDeployed` für den Prüfstand. Prüfstand 25 von 30, Scorch 10 von 10, Verhältnisse 11 von 15. Ohne eigene `weapon-components.json` (Werte stimmten schon, Overrides reichen). Oberfläche (Hierarchy-Auswahl „One ring / Through two rings“) ungeprüft: nur nach Merge auf `master` live.

S4 Teil A erledigt (2026-10-30): Ladestufen von Whirling Ovation als wählbare Spielweise (Oberfläche, Link Format 9), `withPlaystyle` in beiden Simulatoren, Override `playstyleParts`. Prüfstand 22 von 30, Verhältnisse 9 von 14. Takt der Stufen hergeleitet (`known-inaccuracies`). S3 abgeschlossen; Teil 3 (Sonderfelder als Datensätze) gestrichen, bei S6 prüfen.

S0–S3 erledigt (2026-10-30): Prüfstand, Kern (`src/engine/core/`, `coreParity`: alter und neuer Kern gleich; `buildSimulation` nutzt bis S6 den alten), Burn, `everyNthShot`, Spielweise mit Schussfolge; Details im Changelog. Laufzeit des Kerns im Optimizer vor S6 messen (Obergrenze 306 ms). Rechenwege der Papierprobe: `docs/plans/r0-paper-probe.md`.

Ältere Blöcke bis 2026-10-26: im Changelog. Die Energie-Mods (Momentum Transfer u. a.) hat der Inhaber abgelehnt (Revert, Historie `19cddbb`); nicht wieder aufnehmen ohne Rückfrage. Befunde:
- Aegis-Zeilen mit Full Modifiers 1,00 sind nutzbar, wenn Swap sie als Basis nimmt (Ausnahme mit Grund in `tests/abilityGate.test.ts`).
- Verglas Curve Catalyst wartet auf Slow am Ziel (Q4).
- Zurückgestellt: **Hammer of Sol mit Sol Invictus.** Der Aegis-Import ordnet „Roaring Flames x3“ nicht `roaring-flames-3` zu; Aegis misst nur ×1,06, der Text +73 %. Weg: Regel „X xN“ → Effect `x-n` in Import und `tests/lib/probeAuto.ts`, Re-Import nach `nach-patch`. Alternative: Würfe aus dem Compendium-Drain (≈ ×2).
- Banner of War: „40% Increased Bladefury Damage“ fehlt im Effect (Aegis ×1,04).

## Reihenfolge

Details und Fundstellen: `docs/plans/sources-2026-10.md`.

1. Umbau S0–S6 (`docs/plans/ground-up-model.md`) auf `ground-up-model`, Merge nach S6; danach Coverage-Triage.
2. Energie-Exotics (Crown of Tempests, Contraverse Hold u. a., `sources-2026-10.md` §2; Opus plant).
3. Hammer of Sol mit Sol Invictus (siehe oben).
4. Q4 Stasis/Strand (echte Debuffs am Ziel, Bedingung von Facet of Courage), Q5 Aspects/Artifact/Bolt Charge, Q6 Waffen und Catalysts, Q7 Set Bonuses (Umfang mit dem Inhaber klären).
5. Für 2.0 (`docs/product.md`): Legendary Frames, Optimizer mit Abilities, Aspects und Fragments.

## Entscheidungen des Inhabers

- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
- Eigene Quellen gelten nur für die Dauer aus ihrem Text, ab Beginn der Phase; länger nur, wenn ein modellierter Auslöser sie auffrischt. Buffs von Teammates gelten die ganze Phase.
- Effects von Teammates dürfen eigene Abilities ändern, auch klassenübergreifend (Sol Invictus → Chaos Reach, Schalter unter Fireteam Support; 2026-10-26).
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
