# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (Inhaber 2026-11-06; jeden Block einzeln vorschlagen, Skill `abarbeiten`)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`.

- [x] A1, Q0, Q1, M1, M2, S0, V1–V4, P0, A3, W0–W4 (`history-2026-11.md`, `changelog.md`). Euphony auf Aegis (Ausnahme des Inhabers, ADR 0019).
- [ ] W5 Bilanz Waffen (Opus): Teil 1 erledigt (Bilanz in `known-inaccuracies.md`, Test `tests/w5.test.ts`). Folgeblöcke vom Inhaber freigegeben 2026-11-11, je Block eine frische Sitzung.
- [x] W6a Fünf Primaries: Cerberus+1 (Zeile „far range“), Skyburner's Oath (Scorch-Regeln, +4,1 % gegen Quantum erklärt), SUROS Regime, Sweet Business, Touch of Malice (ohne Reload; Charged with Blight offen, über 2 %, Ladezeit unbekannt). `check:block` kennt W6a–W6d. Overrides der vier Waffen weg; `describeCatalyst` zeigt für Items keine „+25% weapon damage“-Zeile mehr (A2).
- [x] W6b Fünf mit Lücke: New Land Beyond (20 Stacks vorab, +70 % gegen Quantum 0x erklärt), Wavesplitter, No Time to Explain (Portal als Anteil je Schuss, Aegis zählte Salven als Schüsse, 30 s −39 %), Finality's Auger (Reserven 21 `derived`; Turret Mode und Bait and Switch offen, über 2 %, W8/Catalysts), Ice Breaker. `check:block -- W6b` grün; Overrides der drei Waffen weg.
- [ ] W6c Ausnahme Aegis (Inhaber 2026-11-11: fehlt Quantum und Compendium etwas, nimmt das Item es aus Aegis; Zeile wird `fitted`, das ist zirkulär und steht in ADR 0019 und `known-inaccuracies.md`): zuerst ADR-Zusatz und CLAUDE.md-Satz (freigegeben 2026-11-11), dann (Opus) Jötunn, Cull's Shadow, New Malpais, Prometheus Lens mit Takt aus Aegis Sustained bzw. Manifest, Schaden aus Aegis-Treffer ÷ Full Modifiers oder Compendium. Kein `$reload` nötig.
- [ ] W6d (Opus): Fafnir (Quantum Nova mit 9 Munition, Aegis-Zeile enthält Windup und Splash) und Turncoat (Power Surge, Unleashed Power); Gate: Plausibilität, `check:block -- W6d`.
- [ ] W7, W8 (Ziel und Gate unten).
- [ ] A2 Aufräumen: Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

## Folgeblöcke (freigegeben 2026-11-11)

- W6 (neu 2026-11-11, Recherche): 10 von 16 Paketen werden Items (W6a, W6b). **Entschieden:** Aegis als Ausnahmequelle für W6c/W6d. **Rückfrage Inhaber:** (2) `$aegis` der sechs Items (Heartshadow, Black Talon, Ergo Sum, Heirloom, Lament, Whirling Ovation): nur Aegis hat den Schaden, bleibt laut ADR 0019 bis zur Gegenprobe. A2 wartet auf (1) und (2).
- W7 Gerüst-Sätze: die 37 Items der Klasse „liest Quantum“ (rund 300 offene Sätze) nach Vorlage oder `notModelled`, in Teilen je Vorlage. Gate: offene Sätze mit Zahl dieser Waffen 0, `check:block`.
- W8 Fehlende Mechanik (Opus): 27 Waffen über 2 %, je neuer Typ ein Teil (Ladung aus Treffern: Hawkmoon, Whisper; Super-Verbrauch: Ager's Scepter; Zielzustand; Moduswechsel: Graviton Spike). Gate: Aegis-Zeile je Waffe gegengeprüft oder Befund.
- Danach A2, dann Catalysts (eigene Stufe).

**Für W-Blöcke:** Neue Item-Dateien ohne Quantum-Basiszeile schreibt der Autor von Hand; Clarity-Hashes liefert `build:weapons` als „Review“-Zeile. Ein Satz gilt als gedeckt, wenn ein `$clarity`-Zitat oder `notModelled.quote` darin vorkommt. Regeln laufen in Dateireihenfolge. Klasse, Faktoren, Anteil je Regel in `weapon-status.json` (`cause`, `quantum.factors`, `ruleShares`). Engine sendet nur `reload start`, nie `end`. Je Block `build:weapons`, `coverage`, `probe`, Vergleichsbasis mit `--update`, `check:block -- <ID>`. **Nie `import:weapons`.** Prüfstand nur Bericht bis zur Gegenprobe (ADR 0019).

**Offen beim Inhaber:** Probe im Spiel für die Quellenkonflikte (`known-inaccuracies.md`, W0, W1). Ungeklärte Änderungen in `docs/sources/sheets/`: nicht committen.

## Reihenfolge

Waffen (W5–W8, A2) → Catalysts → Supers → Abilities (mit C, Casts und Energie) → Aspects → Fragments → Buffs/Debuffs → Armor → Mods → Stats → Artifacts → Gegenprobe (Prüfstand als Gate, B6.4) → B5 (Eichung). Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
