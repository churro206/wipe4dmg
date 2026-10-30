# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**S4 Teil B: Waffen aus Teilen** (ADR 0017, Plan `docs/plans/ground-up-model.md`; Opus für die Takt-Herleitungen). Arbeit nur auf Branch `ground-up-model`, `master` bleibt die laufende Version. Freigegeben vom Inhaber (2026-10-30): A ✔, B `scripts/lib/weaponComponents.ts` → `src/data/weapon-components.json` (Aegis-Ticks ÷ `fullModifiers`), zerlegt nur, wo ein Teil mit dem Build spielt: Hierarchy one ring / 2 rings (Ring, Scorch-Takt je Quelle), Polaris Ember (Perfect Fifth nach N Treffern), danach Lord of Wolves und Dragon's Breath, soweit belegt. Test zuerst: Bench-Szenarien vorher rot. C Barrow-Dyad (6 oder 7 Seeker) nur nach Skill `recherche`, eigener Block. Ziel 24 von 30.

S4 Teil A erledigt (2026-10-30): Ladestufen von Whirling Ovation als wählbare Spielweise (Oberfläche, Link Format 9), `withPlaystyle` in beiden Simulatoren, Override `playstyleParts`. Prüfstand 22 von 30, Verhältnisse 9 von 14. Takt der Stufen hergeleitet (`known-inaccuracies`). S3 abgeschlossen; Teil 3 (Sonderfelder als Datensätze) gestrichen, bei S6 prüfen.

S3 Teil 2 erledigt (2026-10-30): Spielweise mit Schussfolge, Still Hunt mit Cayde's Retribution −0,0 % (nicht wählbar in der Oberfläche).

S3 Teil 1 erledigt (2026-10-30): `DamageInstance.everyNthShot`, Override `nthShotPart`, Truth aus Treffer + Cluster alle 3 Raketen; Prüfstand 18 von 30, Verhältnisse 5 von 14 (Truth Reaper/Trueseeker −3,3 %: Streuung der Aegis-Zeile).

S2 erledigt (2026-10-30): Burn im Kern (`src/engine/core/burn.ts`, Werte in `keywords.json` Ignition `burn`, `tests/burn.test.ts`); Prüfstand läuft auf `simulateCore`, 16 von 30 und Verhältnisse 5 von 14 unverändert (Hierarchy −43/−23 → −42/−19 %). `coreParity` vergleicht ohne Burn. Doppelzählung bei OTV (+0,6…1,3 %) und Rest in `docs/known-inaccuracies.md`. Burn-Takt je Quelle verschoben auf S3/S4 (ohne Scorch-Teil an der Waffe gibt es nichts zu takten).

S1 erledigt (2026-10-30): `src/engine/core/` (`weaponActor`, `context`, `formula`, `simulateCore`), Schüsse entstehen in der Ereignis-Schleife (`RunEvent.handle` hat `schedule`). `tests/coreParity.test.ts`: alter und neuer Kern gleich für Baseline, Abilities, Exotics und alle Szenarien. Alt bleibt unverändert, `buildSimulation` nutzt weiter ihn (Umschalten S6). Laufzeit des Kerns noch nicht im Optimizer gemessen (Obergrenze 306 ms, vor S6 prüfen).

S0 erledigt (2026-10-30): Prüfstand `tests/scenarioBench.test.ts`, 32 Szenarien in `tests/scenarios/`, Basis heutiger Kern 16 von 30 innerhalb ±3 % nach zwei Import-Korrekturen (OTV/Two-Tailed Fox Shot aus Aegis, Ager's Catalyst ×1,80), Verhältnisse 5 von 14 (`tests/__snapshots__/scenario-bench.md`). Übrige Ausfälle = fehlende Systeme, Liste in `docs/known-inaccuracies.md`. Rechenwege je Zeile: `docs/plans/r0-paper-probe.md`.

Papierprobe (2026-10-30): 9 von 13 Waffen nach Ursachen-Recherche innerhalb ±3 %. Fehlende Systeme: Scorch-Burn (Compendium-Formel 2,7 + 0,175 × Stacks, von Aegis bestätigt), Cooldown des Keyword-Auftrags pro Quelle (Lord of Wolves ≤0,46 s), Treffer-Anteil am Boss (Truth-Bomblets). Offen ohne Quelle: Dragon's Breath, Barrow-Dyad, Zusatz bei Ager's Scepter.

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
