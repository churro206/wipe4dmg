# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Entscheidung des Inhabers zum Umbau** (Plan `docs/plans/ground-up-model.md`). R0 ist erledigt (2026-10-30): Papierprobe `docs/plans/r0-paper-probe.md` ergibt 3 von 5 Waffen innerhalb ±3 %, das Abbruchkriterium ist verfehlt. Beide Ausfälle (Hierarchy „one ring“, Dragon's Breath) hängen am Ignition-Takt. ADR 0017 steht als Vorschlag. Optionen: (a) Umbau mit an Aegis geeichten Ignitions, (b) erst den Ignition-Takt ingame messen (`docs/guides/measurements.md`), (c) kein Umbau, weiter mit Coverage-Triage. Danach R1 (Opus entwirft) oder die Triage.

Erledigt (2026-10-26, Details im Changelog): Block A Oberfläche, Casts lückenlos, Ladezeit und Bogen-Takt; Bögen (Leviathan's Breath 1,93/1,33 s, Hierarchy aus Pfeil + Seekern + Ignitions mit `Weapon.setup` und Schalter „Pre-stacked“; Ignition-Cooldown nach Recherche bei 1,3 s, Beleg Daybreak mit Dawn Chorus); Q2 Supers; Q3 Energie; Aufräum-Block. Die Energie-Mods (Momentum Transfer u. a.) hat der Inhaber abgelehnt (Revert, Historie `19cddbb`); nicht wieder aufnehmen ohne Rückfrage. Befunde:
- Aegis-Zeilen mit Full Modifiers 1,00 sind nutzbar, wenn Swap sie als Basis nimmt (Ausnahme mit Grund in `tests/abilityGate.test.ts`).
- Verglas Curve Catalyst wartet auf Slow am Ziel (Q4).
- Zurückgestellt: **Hammer of Sol mit Sol Invictus.** Der Aegis-Import ordnet „Roaring Flames x3“ nicht `roaring-flames-3` zu; Aegis misst nur ×1,06, der Text +73 %. Weg: Regel „X xN“ → Effect `x-n` in Import und `tests/lib/probeAuto.ts`, Re-Import nach `nach-patch`. Alternative: Würfe aus dem Compendium-Drain (≈ ×2).
- Banner of War: „40% Increased Bladefury Damage“ fehlt im Effect (Aegis ×1,04).

## Reihenfolge

Details und Fundstellen: `docs/plans/sources-2026-10.md`.

1. Umbau R0–R6 (`docs/plans/ground-up-model.md`), darin Still Hunt (R3); danach Coverage-Triage.
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
