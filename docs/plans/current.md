# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (Inhaber 2026-11-06; jeden Block einzeln vorschlagen, Skill `abarbeiten`)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`. „Wiederherstellen“: von Q1 abgeschaltete Tests (Liste: `known-inaccuracies`, Abschnitt Q1) wieder einschalten. Alte Namen: M3 = W2, M4 = W3, M5 = W4, Q-Bilanz = W5.

- [x] A1, Q0, Q1, M1, M2, S0, V1–V3 (`history-2026-11.md`; zu V4 dort „Setup und Plan V“), P0 (c8f26aa), Arbeitsweise (453538e). 33 Pakete bleiben: im W-Block oder W5. Reste bei der nächsten Änderung dort: Zitat und Notiz in `euphony.json:30-31`.

- [ ] W0 Abweichungen erklären (Opus): Ursachenklasse je Waffe, Spalte „Why off“, Kreisprüfung als „reads Quantum“ statt grün, `-cata`-Zeilen geprüft, Rangliste für W1 (alles: `ground-up-model.md`, „Plan W“). Spielschaden unverändert. Gate: Test je Tabellenzeile, jede Waffe genau eine Klasse, P0-Stichproben, Browser.
- [ ] W1 Falsch Übernommenes korrigieren: Trinity Ghoul, Thorn, Le Monarque, Heartshadow, The Lament, Grand Overture, Witherhoard, Malfeasance, Alethonym (die Liste legt W0 fest), je Ursachenklasse eine Sitzung. Gate: M-Gate, Abweichung der Klasse sinkt.
- [ ] W2 Ramp und Spielweisen: The Fourth Horseman, The Manticore, Tommy's Matchbook, Coldheart, Ticuu's Divination, Revision Zero, Lord of Wolves, Deathbringer, Dead Man's Tale, Thunderlord, Sunshot. Gate: M-Gate, `/usage` vorher und nachher. Wiederherstellen: Thunderlord.
- [ ] V4 „What changed“ auf der Seite. Gate: Test gegen einen Stand aus git.
- [ ] A3 Aufräumen nach M1, M2, W1, W2. Gate: Berichte gleich.
- [ ] W3 Bedingte Perks, Catalyst-Sätze in `notModelled` mit Verweis auf die Catalyst-Stufe: Ace of Spades, Microcosm, Monte Carlo, Sturm, The Last Word, Third Iteration, Xenophage, Sleeper Simulant, Izanagi's Burden, Anarchy, The Chaperone, Barrow-Dyad, Still Hunt. Gate: M-Gate. Wiederherstellen: Chaperone, Barrow-Dyad, Izanagi, Xenophage, Sleeper.
- [ ] W4 Hand-Items von `$aegis` auf `$quantum`/`$clarity`: Polaris Lance, Truth, Hierarchy of Needs, Choir of One, Delicate Tomb, Duality, Graviton Spike, Salvation's Grip, The Queenbreaker. Gate: M-Gate je Spielweise.
- [ ] W5 Bilanz Waffen (Opus): Rest nach Ursachenklasse, Sätze ohne Regel, Aegis-Bericht, übrige Pakete (Voraussetzung für A2). Stopp zur Freigabe. Wiederherstellen ohne eigenen Block: Gjallarhorn, Telesto, Wish-Ender, Wish-Keeper, Vigilance Wing, Whisper of the Worm, Ager's Scepter, Leviathan's Breath, Burst-Primaries.
- [ ] A2 Aufräumen: Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

**Offen beim Inhaber:** Probe Euphony : Arbalest im Spiel. Ungeklärte Änderungen in `docs/sources/sheets/` (dort schrieb etwas mit): nicht committen.

## M-Gate

Regeln nach Vorlage mit `$clarity`-Zitat, Rest in `notModelled`; je Vorlage eine Golden-Waffe; Plausibilität; Sätze ohne Regel sinken. Je Block `build:weapons`, `coverage`, Tests, Snapshots `--update`, danach `check:block -- <ID>`. **Nie `import:weapons`.** Prüfstand nur Bericht bis zur Gegenprobe (ADR 0019).

## Reihenfolge

Waffen (W0–W5, A2) → Catalysts → Supers → Abilities (mit C, Casts und Energie) → Aspects → Fragments → Buffs/Debuffs → Armor → Mods → Stats → Artifacts → Gegenprobe (Prüfstand als Gate, B6.4, Nachtrag der Exotics ohne Quantum) → B5 (Eichung). Blöcke für alles nach den Waffen erst, wenn die Waffen fertig sind. Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
