# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**S1 Kern** des Umbaus (ADR 0017, Plan `docs/plans/ground-up-model.md`; Opus entwirft, Sonnet setzt um). Arbeit nur auf Branch `ground-up-model`, `master` bleibt die laufende Version (Inhaber, 2026-10-30). Inhalt S1: `src/engine/core/` mit Ereignis-Schleife, Formel, Akteur-Zustand, Ausgabe `SimulationResult`; Adapter für die heutigen Pakete; alter und neuer Kern parallel im Test, `mechanics-baseline` unverändert. Der neue Kern muss `shotLimit` kennen (Prüfstand). Ziel des Umbaus: die Nachrechnung in Code, 24 von 30 Szenarien; welche Stufe welche Szenarien grün macht, steht im Plan unter „Ziel“.

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
