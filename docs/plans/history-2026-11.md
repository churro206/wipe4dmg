# Archiv: Plan ab 2026-11

Nur per Grep lesen. Neueste Einträge oben.

## Setup und Plan V (Inhaber 2026-11-04)

Anlass: Das Wochenlimit des Pro-Plans war mit Worker und Reviewer je Block nicht tragbar (M2: Worker 79, 90, 91, 160, 58 Aufrufe; Reviewer 111, 30, 18); die Vorgabe „etwa 40 Aufrufe“ hielt kein Worker ein. Der Inhaber liest keinen Code und braucht den Stand als Spieler lesbar.

**S0 Setup:** Ein Skript startet je offenem Block eine frische Sonnet-Sitzung (`claude -p`, `--max-turns`) und stoppt beim ersten roten Gate. Keine Worker- und Orchestrator-Sitzung mehr. Enger Opus-Review mit fester Aufrufgrenze nur bei Engine-Änderungen, sonst alle drei Blöcke. Vorschläge eines Reviewers sind Hypothesen, bis das Modell sie bestätigt (M2: 969 und 475 aus dem ersten Review waren falsch). Berichte beginnen mit „Was sich im Spiel ändert“, je Waffe ein Satz; Hashes und Listen danach. Anzupassen: `abarbeiten`, `worker`, `reviewer`, CLAUDE.md (Arbeitsweise). M3 misst das Setup per `/usage` vorher und nachher.

**V1 Daten:** `npm run coverage` erzeugt `src/data/weapon-status.json` nach dem Muster von `coverage-catalog.json` (`toMatchFileSnapshot`). Je Waffe: jeder Clarity-Satz mit Zustand (Regel, `notModelled` mit Grund, offen); Schaden über 10, 30 und 60 s, mit und ohne Katalysator; Abweichung zu Quantum und Aegis samt Zeile und Annahmen; Vertrauensstufe (measured, derived, estimated) aus den Quellenangaben; `$aegis`-Werte als „no independent check“; berechneter Status statt „full“ trotz fehlender Teile; Plan-Block per Namenssuche in `current.md`. Dieselben Daten treiben die Skript-Prüfung gegen Quantum und auf Sätze ohne Regel.

**V2 Tabelle:** Coverage-Seite, Reiter Weapons: Spalten Weapon, Status, Schaden, vs Quantum, vs Aegis, Trust, Not in yet; sortierbar und filterbar; Umschalter 10, 30, 60 s (Rangliste: „Würde ich diese Reihenfolge erwarten?“); Ampel für die Abweichung, Grenzen in einer Data File; „Comes in M3“ bei fehlenden Waffen. Oberfläche englisch, `docs/ui-inspiration.md` lesen.

**V3 Zeitachse:** Zeile aufklappen: Clarity-Sätze mit Zustand, Aegis-Annahmen, Zeitachse aus `buildSimulation` im Browser (Schüsse, Reloads, Auffüllungen, Buffs, Schadenskurve), `RotationTimeline` und `DamageCurveChart` wiederverwenden. Erst beim Aufklappen rechnen.

**V4 What changed:** Oben auf der Seite Abweichungen zum vorigen Stand der Datei aus git, etwa „Outbreak 30 s: 5824 → 21266“.

Aegis bleibt in Tabelle und Zeitachse nur Bericht, kein Gate (ADR 0018). Später, nur bei Bedarf: Knopf „Looks wrong“.

## Erledigte Blöcke von Plan Q (Stand 2026-11-04)

- A1 `probeAuto` (709e41c). Q0 ADR 0019 (7107447, a3ff3f5, fc7e91b).
- Q1 Gerüst (2626745, 6920e29, b673757, cf8bcb8, d24143c, 96b0139, 5cdc5f7, faeb633; Review OK nach drei Prüfungen): 93 Items (108 von 141), Bericht „Sätze ohne Zitat“. 33 Pakete bleiben (10 ohne Quantum, 21 nur benannte Varianten, 2 N/A): von Hand im M-Block oder Q-Bilanz.
- M1 DoT und Status (6ca5481, 2cb88af, 031376e; Review OK nach drei Prüfungen, Doku-Rest vom Orchestrator): 11 von 12; Jötunn bleibt Paket bis zur Gegenprobe (keine Quantum-Zeile); OTV-Gate gegen Quantums Totals, Aegis nur Bericht; Divinity als Item, Ausnahme weg; Reload-Katalysatoren per `$reload`; Witherhoard in `STRONG_CATALYSTS` und Thorn-Magazin als Näherung (alles Inhaber 2026-11-03).
- M2 Zusatzteile (6414b0f, 46b6861, 341a428, 4a48cdc, cabb8ed, 463aaf2, 348c263, 31d2c6b, 8305f8c, 287a151, c61ea80, ecacfa8; Review OK nach drei Prüfungen): Malfeasance, Ex Diris, Cloudstrike, Alethonym, Euphony, Quicksilver Storm, Khvostov 7G-0X, Grand Overture, Slayer's Fang, Vex Mythoclast, Outbreak Perfected. Outbreak-Stufen aus dem Compendium, Zählsperre 15 → 12, Quicksilvers Granate vorerst weg (Inhaber 2026-11-04).

## Plan Q, Hintergrund (Inhaber 2026-11-03)

Anlass: Der Import war zu langsam (51 Overrides, B6 schaffte 2–3 Waffen je Block). Der Inhaber entschied: Quantum und Clarity sind die einzige Quelle der Wahrheit, Aegis dient erst als Gegenprobe. Ein Gerüst entsteht per Skript, die Mechanik schreiben Worker von Hand nach Vorlage. Ein Skript, das Struktur aus Clarity-Text rät, wurde verworfen: Freitext braucht ständig Sonderfälle, wie bei `weaponPackages.ts` und den Overrides.

Befunde (Auswertungen in `tmp/`, nicht versioniert):

- Quantum-Abdeckung: 124 von 141 Exotics haben eine Zeile mit Schaden und Takt (Primary 58/61, Special 37/44, Heavy 29/36), mit `tesselation` 125. Nur `cata`-Zeilen: Sleeper Simulant, Trinity Ghoul, The Prospector.
- Ohne Quantum-Zeile: Black Talon, Ergo Sum, Heartshadow, The Lament, Heirloom, Whirling Ovation (Hand-Items, bleiben); Nachtrag in der Gegenprobe: Cull's Shadow, Fafnir, New Malpais, Prometheus Lens, Turncoat, Verglas Curve, dazu die Lücken Praxic Blade, The Huckleberry, Wolfsbane, Worldline Zero.
- Clarity: Text für alle 141, 493 Einträge, 2231 Sätze, 1490 mit Zahlen. Grobe Muster (Sätze, mehrfach gezählt): Takt 305, Ramp/Stacks 204, Schaden in % 159, braucht Kills 141, Status 103, andere Bedingungen 70.
- Einzeltreffer Quantum ≈ Aegis ÷ Full Modifiers auf ±2 %: Malfeasance 102,1/103 (mit Vorpal), Le Monarque 201,5/202, Thorn 96,4/97, Osteo Striga 42,0/42, Manticore 28,4/29, Ex Diris 615/617, Sunshot 101,2/102, Fourth Horseman 609,8/612 (Körper), Fighting Lion 579/581, Alethonym 101,8/102 (Impact).
- Die Abweichungen sind Mechaniken im Aegis-Mittel, die in Clarity stehen: Slug-Explosionen, Volatile, Poison/Corruption, Moths, Ramp, Impale, Scorch. 103 einteilige Pakete mit Quantum-Zeile: 64 innerhalb 2 %, 39 darüber (Listen M1–M3 in `current.md`).
- Falsch übernommen: Das Fourth-Horseman-Paket teilt ein Magazin mit 5 Schuss (Katalysator) durch 4 (1049 statt etwa 840 je Schuss). Q1 behebt das.
- Overrides (51): Zeilenwahl/Quellenkonflikt 19, Katalysator 13, „wirkt gegen einen Boss nicht“ 9, echte Mechanik 7, Werte von Hand ohne Zeile 3.

## B6, Spielweisen der Exotic-Waffen (2026-11-01 bis 2026-11-03, nach B6.3 durch Plan Q ersetzt)

Checkliste (freigegeben 2026-11-02):

- [x] B6.1 Delicate Tomb als Item-Datei: Hipfire (Grundschuss, 890 pro Schuss) und ADS (745), je 18 Schuss, Muster `salvation-s-grip.json`. Gate: B6-Gate. (f95e747)
- [x] B6.2 Katalysator-Timing im Item-Verweis: Form für „Zeile mit Katalysator, Wert ohne“, Test in `itemResolve`; damit Duality, Graviton Spike und The Queenbreaker als Item-Datei, `rowHasCatalyst` gestrichen. Gate: B6-Gate. (349c824, 985d12d, 6b4a779)
- [x] B6.3 Schwerter mit Sustained-Combo wie Black Talon: Ergo Sum, Heartshadow als Item-Datei. Gate: B6-Gate. (4d115d9, 6188268, 97dc934)
- B6.4 (Ausführungswort ohne Spielweise als fehlender Schalter, `tests/lib/scenarioGen.ts`, Lament-Zeile „heavy“, +191 %): verschoben in die Gegenprobe.
- B6.5 (Sichtung Mechanik-Waffen: Symmetry, Lodestar, Grand Overture, Hawkmoon, Eriana's Vow, D.A.R.C.I., Witherhoard, Cull's Shadow) und B6.6 (Abschluss B6): gestrichen (Inhaber 2026-11-03), gehen in den Mechanik-Blöcken und der Bilanz von Plan Q auf.

Befund: Spielweise-Wörter (`isExecution`) gelten bei Weapons als „kein Schalter“, die Zeile rechnet mit einer Spielweise.

**Regel:** Eine Ausführungsart, die Aegis als eigene Zeile misst (Ladestufe, Kombo, Modus, ADS/Hipfire), ist ein Eintrag in `playstyles` des Items, Label = Aegis-Wort; Regeln mit Bedingung `playstyle` tragen den Unterschied. Die erste Spielweise ist der Grundschuss (die optimale). Lücke unter 2 %: `known-inaccuracies`.

**Erledigt (Item-Datei, Override gestrichen):** The Lament, Heirloom, Whirling Ovation, Choir of One, Salvation's Grip, Black Talon (ca8681a), dazu B6.1–B6.3. Muster: `salvation-s-grip.json` (zwei Spielweisen), `the-lament.json` (Takt je Spielweise per `modifyStat rpm`).

**B6-Gate:** Delta-Paare (1 von 3) und Spearman Weapons (0,96 über 7 Zeilen) nicht schlechter auf den Zeilen, die vorher und nachher in der Prüfmenge sind (Inhaber 2026-11-02), Abdeckung Heavy/Special steigt (Inhaber 2026-11-03: entfällt bei reinen Herkunftsänderungen), jedes Item löst auf, Plausibilität je Spielweise.

Danach war geplant: Stapelzähler als Schalter (`Roaring Flames x3`, `Transcendent`), Testing-Reiter, Stasis-Shatter; aus B4 `pickBaseRow`, `blockingReason`, `options` neben `buffs`.

Offen aus P und B6 (Stand 2026-11-03):

- Abilities 0,83 (4 von 8), Schwellen: Inhaber. Ability-Wert hängt an der Waffe im Build (Gathering Storm 7 703 / 7 901), Ursache offen.
- Entscheidungen des Inhabers, die aus `current.md` gekürzt wurden: Aktionen für bekannte Mechaniken sind kein Vorrat; Exotics ohne Schadenswirkung fallen weg; eigene Quellen nur für die Dauer aus ihrem Text, Buffs von Teammates die ganze Phase.

- Aus B6.2, über 2 %: Duality ohne On Black Wings (Slug +55 %), Graviton Spike ohne Moduswechsel (bis etwa +75 %). Geht in die Mechanik-Blöcke von Plan Q.
- Review B6.1: `fireRateRpm` steht bei Quantum-Timing `verified` statt `derived` (Generator, älter).
- Queenbreaker, Marksman-Reload (317 ms je Reload zu lang, 0 % bei 10/30/60 s): Abweichung, in `known-inaccuracies`.
- Queenbreaker: Katalysator-Magazin 11 gegen Clarity „Cannot load the Magazine beyond its base capacity“ (in M5 prüfen).
- `tmp/playstyleLink.test.ts` veraltet, löscht der Inhaber (Hook erlaubt kein `rm`).
- Ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk; Argent Ordnance ohne Reload-Teil. Beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung.
