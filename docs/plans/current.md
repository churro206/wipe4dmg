# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## B6, Spielweisen der Exotic-Waffen (freigegeben 2026-11-01)

Befund: Spielweise-Wörter (`isExecution`) gelten bei Weapons als „kein Schalter“, die Zeile rechnet mit einer Spielweise.

**Regel:** Eine Ausführungsart, die Aegis als eigene Zeile misst (Ladestufe, Kombo, Modus, ADS/Hipfire), ist ein Eintrag in `playstyles` des Items, Label = Aegis-Wort; Regeln mit Bedingung `playstyle` tragen den Unterschied. Die erste Spielweise ist der Grundschuss (die optimale). Werte aus Text, Quantum oder `$aegis` der Basiszeile (sie bleibt Prüfung). Lücke unter 2 %: `known-inaccuracies`.

**Erledigt (Item-Datei, Override gestrichen):** The Lament, Heirloom, Whirling Ovation, Choir of One, Salvation's Grip, Black Talon (ca8681a, ohne Spielweise: Combo = 2 × „single projectile“ + 2 × „light“). Muster: `src/data/items/weapons/salvation-s-grip.json` (zwei Spielweisen), `the-lament.json` (Takt je Spielweise per `modifyStat rpm` aus `$aegisSustained[…].peakRateSeconds`). Ablauf je Item: Datei schreiben, `npm run build:weapons` (Text-Hash zuerst `00000000`, die Ausgabe nennt den echten), Override streichen, `npm run coverage`, Tests, Snapshots (`mechanicsBaseline`, `scenarioBench`) bewusst `--update`. **Nie `npm run import:weapons`** (lädt aus dem Netz, überschreibt Snapshots).

**Sichtung 2026-11-02, noch offen (13):**
- **Delicate Tomb:** einfach. Hipfire 890 / ADS 745 pro Schuss, je 18 Schuss, Paket ohne Override.
- **Duality, Graviton Spike:** brauchen eine neue Form im Item-Verweis für Timing „Quantum-Zeile mit Katalysator, Wert ohne“ (heute nur Override `rowHasCatalyst`, `scripts/lib/weaponPackages.ts` ab Zeile 1118; Duality Magazin 6 statt 8). Graviton: Sustained wechselt die Modi, ohne Schusszahl.
- **Symmetry:** Paket ohne Dynamic Charge (Schuss 61 statt 173 bei x10, 302 bei x20), Aegis-Sustained „INF“; Zyklus aus dem Text herleiten (Opus).
- **Lodestar:** ADS-Zeile ist ein 3er-Burst (wipe 2145 = 3 × 715); Schuss × Takt (≈1 280/s) passt nicht zu Sustained (≈375/s). Erst klären.
- **Grand Overture** (Raketen-Salven, Missiles Loaded), **Hawkmoon, Eriana's Vow** (Full-mag, Paracausal, DAFG, Vorpal), **D.A.R.C.I.** (Target Acquired, Networked Targeting, Jolt), **Witherhoard, Cull's Shadow**: mehrere Mechaniken je Item, nicht gesichtet bzw. keine reine Spielweise-Umstellung.
- **Ergo Sum, Heartshadow** prüfen (Override mit Sustained-Combo wie Black Talon).

Vorschlag: Block 1 Delicate Tomb, dann Infrastruktur (Katalysator-Timing im Verweis, mit Test) mit Duality und Graviton Spike; Block 2 (Opus) die Mechaniken. Offen: Aegis-Zeile „heavy“ der Lament (+191 %): bei Items mit `playstyles` zählt ein Ausführungswort ohne Spielweise als fehlender Schalter (`tests/lib/scenarioGen.ts`).

Gate: Delta-Paare (1 von 3) und Spearman Weapons (0,96 über 7 Zeilen) nicht schlechter, Abdeckung Heavy/Special steigt, jedes Item löst auf. Danach Schritt 4: Snapshot, Kennzahlen je Gruppe, `docs/weapon-import.md`, Changelog, Roadmap.

Danach: Stapelzähler als Schalter (`Roaring Flames x3`, `Transcendent`), Testing-Reiter, Stasis-Shatter. Aus B4: `pickBaseRow`, `blockingReason`, `options` neben `buffs`.

## Offen aus P

- Weapons und Abilities melden nur (Abilities 0,83, 4 von 8). Schwellen: Inhaber.
- Ability-Wert hängt an der Waffe im Build (Gathering Storm 7 703 / 7 901), Ursache offen.
- `probeAuto.ts` nur noch für `aegisCoverage`: Aufräumen. `tmp/playstyleLink.test.ts` veraltet, löschen.
- Ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk; Argent Ordnance ohne Reload-Teil. Beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung.

## Reihenfolge

B6 → C (Casts, Energie) → B5 (Eichung), Begründung `ground-up-model.md`. Aufräum-Block nach drei Funktions-Blöcken. Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Energie-Mods abgelehnt. Legendary Frames für 2.0. Commit je Teil.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase.
- 2026-11-02: „einfache zuerst“; Mechaniken (Symmetry, Lodestar, Grand Overture …) in eigenem Opus-Block.
