# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B6, Breite (Opus plant, Sonnet setzt um)

Noch kein Plan; zuerst vorschlagen und freigeben lassen. Inhalt laut `ground-up-model.md`: fehlende Items kategorieweise als Item-Dateien, dazu der Reiter Testing im Prüfstand (kein Import bisher). Arbeitsliste: Abschnitt „Missing switches by group“ in `tests/__snapshots__/scenario-bench.md`, häufigste zuerst. Aus B4 offen: `pickBaseRow`, `blockingReason` (Paket-Zweig), `options` der Waffe neben `buffs`; `nthShotPart` bleibt (Barrow-Dyad).

## Block P erledigt (2026-11-01)

Ein Prüfstand für Weapons, Sustained, Swap, Abilities (`tests/lib/scenarioBench.ts`, `scenarioGen.ts`, `tests/scenarioBench.test.ts`, `npm run probe`); Rangfolge-Gate und Gesamtprobe gingen darin auf. Einzelheiten: Changelog, Bauplan 12.

Offen aus P:
- Weapons und Abilities melden nur; Schwellen erzwingt der Test für Supers, Heavy, Special. Weapons: Spearman 0,89 über 11 Zeilen, 1 von 3 Paaren. Abilities: 0,83 über 6 Zeilen, 4 von 8 Paaren (größte Lücke: Biotic Enhancements bei Sentinel Shield, Aegis +50 %, Modell 0). Schwellen für beide: Inhaber entscheidet.
- Ability-Wert = Differenz mit und ohne Cast, One Thousand Voices im Build; die Waffe ändert ihn um einige Prozent (Gathering Storm 7 703 mit Xenophage, 7 901 mit OTV). Ursache nicht untersucht.
- Stapelzähler (`Roaring Flames x3`) und Spielweise-Wörter bei Sustained und Swap sind fehlende Schalter (Hammer of Sol, Burning Maul mit Sol Invictus fehlen).
- `scripts/lib/probeAuto.ts` lebt nur noch für die Abdeckungstabelle (`aegisCoverage`): Aufräum-Schritt.

## Stand

- Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8> (Stand vor B4b; Quelle ist `docs/architecture.md`).
- Offen ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt. Argent Ordnance ohne Reload-Teil (Compendium „+?“), wirkt bei Truth unter 15 s.
- Offen beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung; Polaris-Schuss aus Quantum (97) statt Aegis (96,677).

## Reihenfolge

B6 (Breite, mit Testing-Reiter) → C (Casts, Energie) → B5 (Eichung). Begründung in `ground-up-model.md`. Nach drei Funktions-Blöcken ein Aufräum-Block (letzter: nach B4).

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt. Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
- „±15 % zum Median“ der Gesamtprobe ist weggefallen (2026-11-01); der Prüfstand rechnet absolut nur als Information.
