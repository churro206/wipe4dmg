# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: P, Prüfstand ganzer Builds (Sonnet setzt um)

Freigegeben 2026-11-01. Heute zwei Prüfstände: Szenarien (`tests/lib/scenarioBench.ts`, nur Weapons, mit Los und `fitted`) und Rangfolge-Gate/Gesamtprobe (`rankingGate.test.ts`, `metaProbe*.test.ts`, `tests/lib/probe.ts`, `scripts/lib/probeAuto.ts`; Sustained/Swap, ohne Los und `fitted`, `removed` rechnet Limit Break heraus). P legt sie zusammen.

Entscheidungen:
- `Scenario.tab`: `weapons | sustained | swap | abilities`. Messwert: Weapons Wipe ÷ Full Modifiers; Sustained/Swap `total` mit Aegis-Standardfaktoren als Schalter im Build (wie `probe.ts`: Surge x3, Lumina, Tractor Cannon, Stat 200); Abilities `perUseStat100`/`200`, Differenz mit und ohne Cast, Burn nicht gezählt (Filter aufs Ledger, Bauplan 13). Alles über `buildSimulation`.
- Kein Herausrechnen: Limit Break ist Schalter (`effects.json`, `limit-break`).
- Sustained/Swap ohne Los, alle nicht verwiesenen in die Prüfmenge (Bauplan 12). Abilities mit Los wie Weapons.
- `fitted`: `$aegisSustained` (Truth), Ability-Zeilen mit Paket (`fittedRows.abilityRows`). Je Gruppe als Info: Anteil mit verwiesenem Grundwert (Swap-Supers teilen Grundwerte mit Abilities-Zeilen). Hauptkennzahl bleiben Delta-Paare.
- Testing-Reiter nicht in P, sondern B6 (kein Import). Alte Tests fallen nach Schritt 4 weg; „±15 % zum Median“ wird Information (Inhaber, 2026-11-01).

Schritte (je ein Commit, Tests zuerst):
1. Schema und `modelTotal` für vier Reiter; je eine Fixture Sustained, Swap, Abilities gegen heutige Werte der Gesamtprobe. Weapons-Kennzahlen unverändert.
2. Generator Sustained/Swap: Zuordnung aus `probeAuto` in `tests/lib/scenarioGen.ts`; 14 Einträge aus `tests/fixtures/meta-probe.json` werden Fixtures in `tests/scenarios/`, Limit Break als Schalter.
3. Generator Abilities: nicht `fitted`, alle Annahmen mit Schalter; Stat 200 eigenes Szenario mit Zusatzannahme „stat 200“ (Delta-Paar, Frage 17).
4. Kennzahlen je Gruppe (Weapons, Supers, Heavy, Special, Abilities): Abdeckung, Spearman, Top 3 in 5, Delta-Paare; Schwellen und Abweichungen aus `tests/fixtures/ranking-gate.json`; fehlende Schalter je Gruppe. Dann `rankingGate.test.ts`, `metaProbe*.test.ts`, `tests/lib/probe.ts`, `docs/ranking-gate.md`, `docs/meta-probe*.md` und ihre Fixtures streichen; `npm run probe` anpassen.
5. Abschluss: Bauplan 12 und 13, Rangfolge-Gate in `product.md`, Roadmap, Changelog.

Gate: Weapons-Kennzahlen gleich; Änderungen der Gruppenzahlen mit Liste im Commit. `abilityGate.test.ts` bleibt (Rückweg der Pakete, keine Prüfung).

## Aufräumen nach B4 erledigt (2026-11-01)

Offen für B6: `pickBaseRow`, `blockingReason` (Paket-Zweig) und `options` der Waffe neben `buffs`. `nthShotPart` bleibt (Barrow-Dyad).

## Stand

- Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8> (Stand vor B4b; Quelle ist `docs/architecture.md`). Kennzahlen B4: Delta-Paare 1 von 3, Spearman 0,89 (11 Zeilen), Abdeckung Supers 94 %, Heavy 48 %, Special 52 %.
- Offen ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt. Argent Ordnance ohne Reload-Teil (Compendium „+?“), wirkt bei Truth unter 15 s.
- Offen beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung; Polaris-Schuss aus Quantum (97) statt Aegis (96,677).

## Reihenfolge

P (Prüfstand) → B6 (Breite, mit Testing-Reiter) → C (Casts, Energie) → B5 (Eichung). Begründung in `ground-up-model.md`.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt. Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
