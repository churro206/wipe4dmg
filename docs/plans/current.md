# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B3 – Regeln im Kern (Opus entwirft das Schema, Sonnet setzt um; eventuell zwei Blöcke)

Bauplan `docs/architecture.md` (zuerst lesen, Abschnitt 6), Plan `docs/plans/ground-up-model.md`, ADR 0018. Branch `ground-up-model`, **kein Merge nach `master`** ohne Ansage des Inhabers. Vor B3 klären (Rückfrage an den Inhaber): Szenarien aus Aegis Abilities/Testing mit Burn-Schalter jetzt (Rest von B2) oder nach B3.

## Stand

- 2026-10-31: **B2 erledigt** (Details Changelog): `fitted` mit `row`, Generator (151 erzeugt, 32 von Hand), Los FNV-1a, Snapshot `tests/__snapshots__/scenario-bench.md`: **Delta-Paare der Prüfmenge 1 von 3**, Spearman 0,89 über 11 Zeilen. Offen aus B2: Szenarien aus Abilities und Testing (Burn-Schalter „ohne Burn“), Overrides mit anderem Quellnamen als `fitted` markieren (Truth-Einzelrakete); Abweichungen erzeugter Zeilen in `known-inaccuracies`.
- B1 erledigt: ein Kern, Burn in App und Optimizer. Bauplan angenommen (ADR 0018), Ansicht: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.
- Offen ohne Quelle: Dragon's Breath (Pool-Takt „?“), Ager's Scepter, Celestial Nighthawk auf Still Hunt.

## Reihenfolge

1. B3–B6 nach `docs/plans/ground-up-model.md`; Aufräum-Block nach B4.
2. Danach (`docs/plans/sources-2026-10.md`): Energie-Exotics, Hammer of Sol mit Sol Invictus, Q4–Q7; vieles geht in B6 auf.
3. Für 2.0 (`docs/product.md`): Legendary Frames, Optimizer mit Abilities, Aspects und Fragments.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 (2026-10-31); auf dem Branch bleiben, Merge nur auf Ansage.
- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit „Vorher aufgebaut“. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald gewählt.
- Eigene Quellen gelten nur für die Dauer aus ihrem Text ab Beginn der Phase; länger nur mit modelliertem Auslöser. Buffs von Teammates gelten die ganze Phase.
- Effects von Teammates dürfen eigene Abilities ändern, auch klassenübergreifend (Sol Invictus → Chaos Reach).
- Energie-Mods abgelehnt (Revert, Historie `19cddbb`); nicht wieder aufnehmen ohne Rückfrage.
- Rückwärtskompatibilität von Links hat keine hohe Priorität. Tooltips erklären, was ein Item tut, ohne Quellen.
- Legendary Frames kommen für 2.0. Abstände zählen, absolute Zahlen nicht; der Optimizer optimiert die gewählte Phasenlänge und hat Priorität.
- Größere Blöcke sind erlaubt, Commit je Teil.

## Zurückgestellt (geringer Nutzen)

`src/data/schema.ts` aufteilen; Rohdaten-Snapshots nach `data/sources/`; `noUncheckedIndexedAccess`; Bundle lazy-load (`weapon-packages.json` 690 KB). Wieder aufnehmen, wenn es beim Arbeiten stört.

## Werkzeuge

- Nach einem Patch: Skill `nach-patch`. UI-Check: Skill `pruefen`, Schritt 4.
