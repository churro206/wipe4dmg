# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B2 – Ehrlicher Prüfstand (Opus plant)

Bauplan `docs/architecture.md` (zuerst lesen), Plan `docs/plans/ground-up-model.md`, ADR 0018. Branch `ground-up-model`, **kein Merge nach `master`** ohne Ansage des Inhabers. Vor B2 klären (Rückfrage an den Inhaber): Burn aus den Gates ausnehmen (siehe unten, „Offen aus B1“).

## Stand

- 2026-10-31: **B1 erledigt:** ein Kern (`simulate` in `simulate.ts` ist der Kern, alter Simulator und Paritätstest entfernt), Optimizer 155 ms, 1843 Tests grün. Burn gilt jetzt in App und Optimizer. Offen aus B1: Ability-Gate und Referenz „aegis-with-ignition“ rechnen ohne Burn-Ticks (Aegis' Pakete enthalten nur Ignitions; mit Burn +3 % / +1,5 %), das ist eine Annahme, keine Messung. Drei Fusion Grenades über Starfire Protocol zünden nicht mehr (Stacks verfallen vor der dritten, Energie-Takt).
- 2026-10-31: Bauplan angenommen (ADR 0018). Messung nur als Prüfung, Items als Dateien (Struktur von Hand, Zahlen per `$`-Verweis), Eichung nur der globalen Parameter θ per Skript, Delta-Paare als Hauptkennzahl. Ansicht: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.
- S0–S4 erledigt (2026-10-30/31): Prüfstand 26 von 30 (davon viele Zeilen geeicht, siehe `known-inaccuracies`, „Prüfstand, geeichte Zeilen“), Verhältnisse 11 von 15; Kern parallel zum alten, `buildSimulation` nutzt noch den alten.
- Offen ohne Quelle (Befund, kein eigener Block): Dragon's Breath (Pool-Takt „?“), Ager's Scepter, Celestial Nighthawk auf Still Hunt. Lord of Wolves trifft (−0,1 / −2,9 %), nicht zerlegt.

## Reihenfolge

1. B1–B6 nach `docs/plans/ground-up-model.md`; Aufräum-Block nach B4.
2. Danach (alte Liste, `docs/plans/sources-2026-10.md`): Energie-Exotics, Hammer of Sol mit Sol Invictus, Q4 Stasis/Strand, Q5 Aspects/Artifact/Bolt Charge, Q6 Waffen und Catalysts, Q7 Set Bonuses. Viele davon gehen in die Kategorie-Blöcke von B6 auf.
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
