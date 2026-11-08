# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (Inhaber 2026-11-06; jeden Block einzeln vorschlagen, Skill `abarbeiten`)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`. „Wiederherstellen“: von Q1 abgeschaltete Tests (Liste: `known-inaccuracies`, Abschnitt Q1) wieder einschalten. Alte Namen: M3 = W2, M4 = W3, M5 = W4, Q-Bilanz = W5.

- [x] A1, Q0, Q1, M1, M2, S0, V1–V3 (`history-2026-11.md`; zu V4 dort „Setup und Plan V“), P0 (c8f26aa), Arbeitsweise (453538e). 33 Pakete bleiben: im W-Block oder W5. Euphony auf Aegis (Ausnahme des Inhabers, ADR 0019).

- [x] W0 Abweichungen erklären: Ursachenklasse je Waffe, Spalte „Why off“, Kreisprüfung als „reads Quantum“, `-cata`-Zeilen geprüft, Rangliste (bead4ee).
- [x] W1 Falsch Übernommenes korrigieren, je Ursachenklasse eine Sitzung: (1) Regel zu stark: Befund, keine falsche Zahl. (2) Zählung und Grundschaden: Trinity Ghoul, Legend of Acrius. (3) Zeile oder Variante: einzelne Schwerthiebe nicht mehr gegen das Kombo-Modell, Deterministic Chaos gegen „w/ weaken“, Rest als Befund (`known-inaccuracies`, W1 Klasse 1–3). Falsche Zeile 10 → 9.
- [x] W2 Ramp und Spielweisen: Fourth Horseman, Manticore, Matchbook, Coldheart, Ticuu's, Revision Zero, Lord of Wolves, Deathbringer, Dead Man's Tale, Thunderlord, Sunshot; fünf neue Item-Dateien (Manticore, Deathbringer, Revision Zero, Dead Man's Tale, Lord of Wolves), Thunderlord-Test wieder an, Golden-Tests „W2“ in `plausibility.test.ts` (61c1fc8). Zeit des Primärs bei gehaltenem Reload (Revision Zero) als Faktor auf die Sniper-Treffer, weil die Engine keine Waffensperre kennt.
- [x] V4 „What changed“ auf der Seite: `npm run coverage` schreibt `weapon-changes.json` gegen den neuesten abweichenden Stand in git; Test gegen 61c1fc8. CI mit `fetch-depth: 0`. (9a01240)
- [x] A3 Aufräumen nach M1, M2, W1, W2: nur veraltete Blocknamen (M3/M4/Q-Bilanz) in Kommentaren; kein toter Code in den neuen Dateien gefunden. Gate: Berichte gleich. (siehe Commit)
- [x] W3 Bedingte Perks, 13 Waffen in sechs Teilen (Tests `tests/w3.test.ts`, Kill-Buffs nur `pre-stacked`): Ace, Microcosm, Monte Carlo, Sturm, Last Word, Xenophage, Sleeper, Chaperone; Izanagi (Honed Edge x4); Still Hunt (Cayde's Retribution Standard); Third Iteration (Modus `mark`); Anarchy („double-stick“, Jolt); Barrow-Dyad (6 Seekers à 587 ab Reload-Beginn, Target Lock 25 %, High-Impact Reserves 18,85 %; Peacekeepers ×1,33; Aegis +17 % als Befund; Gate Primary einzeln bis 1,7×, Inhaber 2026-11-08). Lehren: Regeln im selben Schuss sehen einen `resetCounter` der Vorgängerregel nicht (Reset als letzte Regel mit eigenem `spawn`); die Engine sendet nur `reload start`, nie `end` (Last Word `fan-fire-reset` feuert nie), und `start` kommt vor den Regeln des letzten Schusses (Zähler mit dem letzten Schuss zurücksetzen, Spawns mit `delayMs`).
- [ ] W4 Hand-Items von `$aegis` auf `$quantum`/`$clarity`: Polaris Lance, Truth, Hierarchy of Needs, Choir of One, Delicate Tomb, Duality, Graviton Spike, Salvation's Grip, The Queenbreaker. Gate: M-Gate je Spielweise.
- [ ] W5 Bilanz Waffen (Opus): Rest nach Ursachenklasse, Sätze ohne Regel, Aegis-Bericht, übrige Pakete (Voraussetzung für A2). Stopp zur Freigabe. Wiederherstellen ohne eigenen Block: Gjallarhorn, Telesto, Wish-Ender, Wish-Keeper, Vigilance Wing, Whisper of the Worm, Ager's Scepter, Leviathan's Breath, Burst-Primaries.
- [ ] A2 Aufräumen: Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

**Für W3–W4:** Neue Item-Dateien ohne Quantum-Basiszeile schreibt der Autor von Hand (das Gerüst überspringt sie); die Clarity-Hashes liefert `build:weapons` als „Review“-Zeile. Ein Satz gilt als gedeckt, wenn ein `$clarity`-Zitat oder `notModelled.quote` (auch `source.quote`) darin vorkommt. Regeln laufen in Dateireihenfolge, der Treffer eines Schusses nimmt die Buffs, die seine Regeln im selben Schuss geben. Offene Befunde aus W2 (Reload-Stat, Ember of Ashes auf Catalyst-Scorch, Quantum ohne Ramp) stehen in `known-inaccuracies.md`. Klasse, Faktoren und Anteil je Regel stehen in `weapon-status.json` (`cause`, `quantum.factors`, `ruleShares`), Tooltip „Why off“. Ein Item mit Klasse „Zeile“: zuerst `quantumCheck` auf die passende Zeile, dann erst die Regel. Klasse Quellenkonflikt: Liste in `known-inaccuracies.md`, Abschnitt W0. Heartshadow und The Lament nehmen ihren Schaden noch aus Aegis (`$aegis`): Heartshadow auf Clarity (4 × 507 je Orb) in W5.

**Offen beim Inhaber:** Probe im Spiel für die Quellenkonflikte (`known-inaccuracies.md`, W0; dazu Thorn stapelt Corruption, Alethonym Aegis-Zählung, Legend of Acrius 2325 gegen 1990, W1). Ungeklärte Änderungen in `docs/sources/sheets/` (dort schrieb etwas mit): nicht committen.

## M-Gate

Regeln nach Vorlage mit `$clarity`-Zitat, Rest in `notModelled`; je Vorlage eine Golden-Waffe; Plausibilität; Sätze ohne Regel sinken. Je Block `build:weapons`, `coverage`, Tests, Snapshots `--update`, danach `check:block -- <ID>`. **Nie `import:weapons`.** Prüfstand nur Bericht bis zur Gegenprobe (ADR 0019).

## Reihenfolge

Waffen (W0–W5, A2) → Catalysts → Supers → Abilities (mit C, Casts und Energie) → Aspects → Fragments → Buffs/Debuffs → Armor → Mods → Stats → Artifacts → Gegenprobe (Prüfstand als Gate, B6.4, Nachtrag der Exotics ohne Quantum) → B5 (Eichung). Blöcke für alles nach den Waffen erst, wenn die Waffen fertig sind. Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
