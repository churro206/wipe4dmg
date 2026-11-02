# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B6, Spielweisen der Exotic-Waffen (freigegeben 2026-11-01; Sonnet)

Befund: Spielweise-Wörter (`isExecution`) gelten bei Weapons als „kein Schalter“, die Zeile rechnet mit einer Spielweise (Heirloom 1/3 −36 %, Lament 4L −21 %).

**Regel:** Eine Ausführungsart, die Aegis als eigene Zeile misst (Ladestufe, Kombo, Modus, ADS/Hipfire), ist ein Eintrag in `playstyles` des Items, Label = Aegis-Wort; Regeln mit Bedingung `playstyle` tragen den Unterschied. Werte aus Text, Quantum oder `$aegis` der Basiszeile (sie bleibt Prüfung). Lücke unter 2 %: `known-inaccuracies`.

Reihenfolge nach Lücke zwischen den Zeilen: The Lament, Heirloom, Whirling Ovation, Choir of One, Salvation's Grip (erledigt), Black Talon, Symmetry, Grand Overture, Graviton Spike, Lodestar, Duality, Delicate Tomb, Witherhoard, Cull's Shadow, Hawkmoon, Eriana's Vow, D.A.R.C.I.; Ergo Sum, Heartshadow prüfen.

1+2. Generator ordnet Wort → Spielweise (erledigt).
3. Item-Dateien in obiger Reihenfolge; ihre Pakete und Overrides fallen weg. Neuer Typ nur mit Test (I3).
4. Snapshot, Kennzahlen je Gruppe, `docs/weapon-import.md`, Changelog, Roadmap.

**Stand 2026-11-01:** Schritt 1+2 (5c94c12): `playstyleNamed` ordnet ein Aegis-Wort dem Label einer Spielweise zu (erste = Grundschuss; zweites Wort = fehlender Schalter). Schritt 3: **The Lament** (9491d81, cc1a06a), **Heirloom** und **Whirling Ovation** (2026-11-02) erledigt; bei Whirling kommt die Ladezeit als Ausdruck aus Compendium (4,85 s, 34 % / 67 %) und dem Sustained-Zyklus, Katalysator `none`. Muster: Verweis `$aegis[row].perShot` je Spielweise (`fitted`, ADR 0018), je Spielweise ein Part und eine Regel `shot-<id>`, Takt per `modifyStat rpm` auf `phaseStart` aus `$aegisSustained[row].peakRateSeconds`, Katalysator als `applyStatus`. Spielweise nur mit Katalysator-Zeile: Zeile ÷ Faktor aus dem Text oder dem Paar (Option a des Inhabers, `derived`, nach `known-inaccuracies`). **Choir of One** (2026-11-02): Projectile/Hitscan mode, Hitscan als Schuss aus 5 Runden. **Salvation's Grip** (2026-11-02): Uncharged/Charged, Takt der geladenen aus der Hail-the-Storm-Zeile, Reload-Unterschied offen (known-inaccuracies). Nächstes Item: **Black Talon**. Offen: Aegis-Zeile „heavy“ der Lament (Ausführungswort ohne Spielweise, +191 %) und gleichartige Wörter; Vorschlag: bei Items mit `playstyles` zählt ein Ausführungswort ohne Spielweise als fehlender Schalter (Generator, `tests/lib/scenarioGen.ts`). Heirloom: Scorch-Explosion bei Kills und 5 % auf Ignitions fehlen (known-inaccuracies). Prüfstand Weapons: Spearman 0,96 über 7 Zeilen (vorher 0,89 über 11, Prüfmenge kleiner), Delta-Paare 1 von 3.

Gate: Delta-Paare und Spearman Weapons nicht schlechter, Abdeckung Heavy/Special steigt, jedes Item löst auf. Offenes am Sitzungsende bleibt in B6.

Danach: Stapelzähler als Schalter (`Roaring Flames x3`, `Transcendent`), Testing-Reiter, Stasis-Shatter (Katalog sagt fälschlich „No damage effect“). Aus B4: `pickBaseRow`, `blockingReason`, `options` neben `buffs`.

## Offen aus P

- Weapons und Abilities melden nur (Weapons Spearman 0,89 über 11 Zeilen, 1 von 3 Paaren; Abilities 0,83, 4 von 8). Schwellen: Inhaber.
- Ability-Wert hängt um einige Prozent an der Waffe im Build (Gathering Storm 7 703 mit Xenophage, 7 901 mit OTV), Ursache offen.
- `scripts/lib/probeAuto.ts` nur noch für `aegisCoverage`: Aufräum-Schritt.

## Stand

- Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8> (Stand vor B4b; Quelle `docs/architecture.md`).
- Ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt; Argent Ordnance ohne Reload-Teil.
- Beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung; Polaris-Schuss Quantum (97) statt Aegis (96,677).

## Reihenfolge

B6 (Breite) → C (Casts, Energie) → B5 (Eichung), Begründung `ground-up-model.md`. Aufräum-Block nach drei Funktions-Blöcken (letzter nach B4).

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt. Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
- „±15 % zum Median“ ist weggefallen; der Prüfstand rechnet absolut nur als Information.
