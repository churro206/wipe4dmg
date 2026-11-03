# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Checkliste (freigegeben 2026-11-02)

Format für den Skill `abarbeiten`: Überschrift „Checkliste (freigegeben <Datum>)“, ein Kästchen pro Block in Reihenfolge, `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`.

**Pause (Inhaber, 2026-11-02):** B6.2 ist committet (349c824), das Review fehlt. Weiter mit `/abarbeiten`: zuerst den Reviewer für 349c824 starten, dann B6.3. Der Worker meldet zu B6.2: Tests nach der Datei geschrieben.

- [x] B6.1 Delicate Tomb als Item-Datei: Hipfire (Grundschuss, 890 pro Schuss) und ADS (745), je 18 Schuss, Muster `salvation-s-grip.json`. Gate: B6-Gate. (f95e747)
- [ ] B6.2 Katalysator-Timing im Item-Verweis: Form für „Zeile mit Katalysator, Wert ohne“ (heute Override `rowHasCatalyst`, `scripts/lib/weaponPackages.ts` ab Zeile 1118), Test in `itemResolve`; damit Duality (Magazin 6 statt 8), Graviton Spike (Sustained wechselt die Modi, ohne Schusszahl) und The Queenbreaker (zweite Nutzerin, Magazin 5) als Item-Datei, `rowHasCatalyst` gestrichen. Gate: B6-Gate.
- [ ] B6.3 Schwerter mit Sustained-Combo wie Black Talon: Ergo Sum, Heartshadow als Item-Datei, Muster `black-talon.json`. Gate: B6-Gate.
- [ ] A1 Aufräumen: `scripts/lib/probeAuto.ts` dient nur noch `tests/lib/aegisCoverageData.ts`; dorthin verschieben oder umbenennen, nur Umbau. Gate: Berichte byte-gleich.
- [ ] B6.4 Bei Items mit `playstyles` zählt ein Ausführungswort ohne Spielweise als fehlender Schalter (`tests/lib/scenarioGen.ts`; Fall: Lament-Zeile „heavy“, +191 %). Gate: Test, Prüfmenge ohne diese Zeilen.
- [ ] B6.5 (Opus) Sichtung der Mechanik-Waffen: Symmetry (Paket ohne Dynamic Charge: Schuss 61 statt 173 bei x10, 302 bei x20; Sustained „INF“; Zyklus aus dem Text), Lodestar (ADS-Zeile 3er-Burst, wipe 2145 = 3 × 715; Schuss × Takt ≈ 1 280/s gegen Sustained ≈ 375/s), Grand Overture, Hawkmoon, Eriana's Vow, D.A.R.C.I., Witherhoard, Cull's Shadow. Je Item Mechanik, Quelle, Wirkung nach der 2-%-Regel; Ergebnis als Blöcke vor B6.6, dann Stopp zur Freigabe.
- [ ] B6.6 Abschluss B6: Snapshot, Kennzahlen je Gruppe, `docs/weapon-import.md`, Roadmap.

## B6, Spielweisen der Exotic-Waffen (freigegeben 2026-11-01)

Befund: Spielweise-Wörter (`isExecution`) gelten bei Weapons als „kein Schalter“, die Zeile rechnet mit einer Spielweise.

**Regel:** Eine Ausführungsart, die Aegis als eigene Zeile misst (Ladestufe, Kombo, Modus, ADS/Hipfire), ist ein Eintrag in `playstyles` des Items, Label = Aegis-Wort; Regeln mit Bedingung `playstyle` tragen den Unterschied. Die erste Spielweise ist der Grundschuss (die optimale). Werte aus Text, Quantum oder `$aegis` der Basiszeile (sie bleibt Prüfung). Lücke unter 2 %: `known-inaccuracies`.

**Erledigt (Item-Datei, Override gestrichen):** The Lament, Heirloom, Whirling Ovation, Choir of One, Salvation's Grip, Black Talon (ca8681a). Muster: `salvation-s-grip.json` (zwei Spielweisen), `the-lament.json` (Takt je Spielweise per `modifyStat rpm` aus `$aegisSustained[…].peakRateSeconds`). Ablauf je Item: Datei schreiben, `npm run build:weapons` (Text-Hash zuerst `00000000`, die Ausgabe nennt den echten), Override streichen, `npm run coverage`, Tests, Snapshots (`mechanicsBaseline`, `scenarioBench`) bewusst `--update`. **Nie `npm run import:weapons`** (lädt aus dem Netz, überschreibt Snapshots).

**B6-Gate:** Delta-Paare (1 von 3) und Spearman Weapons (0,96 über 7 Zeilen) nicht schlechter auf den Zeilen, die vorher und nachher in der Prüfmenge sind (Inhaber 2026-11-02; eine Zeile, die `fitted` wird, fällt nach ADR 0018 heraus), Abdeckung Heavy/Special steigt, jedes Item löst auf, Plausibilität je Spielweise.

Danach: Stapelzähler als Schalter (`Roaring Flames x3`, `Transcendent`), Testing-Reiter, Stasis-Shatter. Aus B4: `pickBaseRow`, `blockingReason`, `options` neben `buffs`.

## Offen aus P

- Weapons und Abilities melden nur (Abilities 0,83, 4 von 8). Schwellen: Inhaber.
- Ability-Wert hängt an der Waffe im Build (Gathering Storm 7 703 / 7 901), Ursache offen.
- Aus B6.2, über 2 %, ohne Block (B6.5 aufnehmen? Inhaber): Duality ohne On Black Wings (Slug +55 %), Graviton Spike ohne Moduswechsel (Overcharge, Temporal Alignment, Lightning Strike; bis etwa +75 %). Queenbreaker: Katalysator-Magazin 11 gegen Clarity „Cannot load the Magazine beyond its base capacity“.
- Review B6.1: `fireRateRpm` steht bei Quantum-Timing `verified` statt `derived` (Generator, älter). Die Notiz auf `magazine` usw. ist behoben.
- Nachbesserung B6.2, offen (Rückfrage): The Queenbreaker, Marksman Sights nimmt den Reload der Combat Sights (Aegis 1883 statt 2283 ms). Ein `modifyStat reload` braucht den Faktor 1883 / 2283, beide Sustained-Zeilen; `resolveExpression` erlaubt nur eine Aegis-Zeile je Ausdruck (`itemResolve.test.ts:272`). Entscheidung: Regel auf mehrere Zeilen lockern (`row` = erste, beide in `fittedRows`), oder Abweichung nach `known-inaccuracies`.
- `tmp/playstyleLink.test.ts` veraltet, löscht der Inhaber (Hook erlaubt kein `rm`).
- Ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk; Argent Ordnance ohne Reload-Teil. Beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung.

## Reihenfolge

B6 → C (Casts, Energie) → B5 (Eichung), Begründung `ground-up-model.md`. Aufräum-Block nach drei Funktions-Blöcken. Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Energie-Mods abgelehnt. Legendary Frames für 2.0. Commit je Teil.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase.
- 2026-11-02: „einfache zuerst“; Mechaniken (Symmetry, Lodestar, Grand Overture …) in eigenem Opus-Block.
