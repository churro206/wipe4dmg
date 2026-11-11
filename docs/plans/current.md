# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (Inhaber 2026-11-06; jeden Block einzeln vorschlagen, Skill `abarbeiten`)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`.

- [x] A1, Q0, Q1, M1, M2, S0, V1–V4, P0, A3, W0–W4 (`history-2026-11.md`, `changelog.md`). Euphony auf Aegis (Ausnahme des Inhabers, ADR 0019).
- [ ] W5 Bilanz Waffen (Opus): Teil 1 erledigt (Bilanz in `known-inaccuracies.md`, Test `tests/w5.test.ts`). Folgeblöcke vom Inhaber freigegeben 2026-11-11, je Block eine frische Sitzung.
- [x] W6a–W6d: alle 16 Pakete sind Hand-Items (Einzelheiten und offene Mechaniken über 2 %: `changelog.md`, `known-inaccuracies.md`). W6d: Fafnir (Nova zum Start, Status `strongWeaken`), Turncoat (Unleashed Power per `setMode`); `weapon-overrides.json` ist `[]`.
- [ ] W8 (Inhaber 2026-11-11: vor W7). Teile 1–5 erledigt (`e52fe5a`, `1f3aff2`, `c8f7c0d`, `0320be9`, `b5b288d`, Befunde in `known-inaccuracies.md`). **Teil 6 offen:** Aegis-Zeile gegenprüfen oder Befund für Cloudstrike, Conditional Finality, Khvostov, Lord of Wolves, Salvation's Grip (geladen), Still Hunt (Celestial Nighthawk), Fourth Horseman (full mag), Ticuu's (alternating modes), Two-Tailed Fox; Cull's Shadow (Frontal Blades) und Wavesplitter haben schon einen Befund. `node tmp/w8-list.ts [id]` listet Klasse, Sätze, Zeilen.
- [ ] W7 (Ziel und Gate unten).
- [ ] A2 Aufräumen: Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg (auch die Lock-Tests „until A2“); `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

## Folgeblöcke (freigegeben 2026-11-11)

- W6 (neu 2026-11-11, Recherche): alle 16 Pakete sind Items (W6a–W6d). Vor `$aegis` erst Quantum unter abweichendem Namen suchen (`facts` mit Wortteil). **Entschieden:** Aegis als Ausnahmequelle für W6c/W6d. **Rückfrage Inhaber:** (2) `$aegis` der sechs Items (Heartshadow, Black Talon, Ergo Sum, Heirloom, Lament, Whirling Ovation): nur Aegis hat den Schaden, bleibt laut ADR 0019 bis zur Gegenprobe. A2 wartet auf (1) und (2).
- W7 Gerüst-Sätze: die 37 Items der Klasse „liest Quantum“ (rund 300 offene Sätze) nach Vorlage oder `notModelled`, in Teilen je Vorlage. Gate: offene Sätze mit Zahl dieser Waffen 0, `check:block`.
- W8 Fehlende Mechanik (Opus): 27 Waffen über 2 %, je neuer Typ ein Teil. Gate: Aegis-Zeile je Waffe gegengeprüft oder Befund. Gelernt: Bedingungen eines Ereignisses sehen den Zustand davor (ein `setMode` im selben Schuss wirkt erst beim nächsten); `reload start` kommt vor dem Treffer des letzten Schusses; Super-Energie fehlt (Q3).
- Danach A2, dann Catalysts (eigene Stufe).

**Für W-Blöcke:** Neue Item-Dateien ohne Quantum-Basiszeile schreibt der Autor von Hand; Clarity-Hashes liefert `build:weapons` als „Review“-Zeile. Ein Satz gilt als gedeckt, wenn ein `$clarity`-Zitat oder `notModelled.quote` darin vorkommt. Regeln laufen in Dateireihenfolge. Klasse, Faktoren, Anteil je Regel in `weapon-status.json` (`cause`, `quantum.factors`, `ruleShares`). Engine sendet nur `reload start`, nie `end`. Je Block `build:weapons`, `coverage`, `probe`, Vergleichsbasis mit `--update`, `check:block -- <ID>`. **Nie `import:weapons`.** Prüfstand nur Bericht bis zur Gegenprobe (ADR 0019).

**Offen beim Inhaber:** Probe im Spiel für die Quellenkonflikte (`known-inaccuracies.md`, W0, W1). Ungeklärte Änderungen in `docs/sources/sheets/`: nicht committen.

## Reihenfolge

Waffen (W5–W8, A2) → Catalysts → Supers → Abilities (mit C, Casts und Energie) → Aspects → Fragments → Buffs/Debuffs → Armor → Mods → Stats → Artifacts → Gegenprobe (Prüfstand als Gate, B6.4) → B5 (Eichung). Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
