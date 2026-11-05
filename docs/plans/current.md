# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (freigegeben 2026-11-03; S0, V1–V4 am 2026-11-04)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`. „Wiederherstellen“: von Q1 abgeschaltete Tests (Liste: `known-inaccuracies`, Abschnitt Q1) wieder einschalten.

- [x] A1, Q0, Q1, M1, M2 (Commits, Entscheidungen: `history-2026-11.md`). 33 Pakete bleiben: von Hand im M-Block oder Q-Bilanz. Reste bei der nächsten Änderung dort: Zitat und Notiz in `euphony.json:30-31`, Runde 1 in `docs/changelog.md:19`.

Details zu S0 und V1–V4: `history-2026-11.md`, Abschnitt „Setup und Plan V“. M3 misst das Setup per `/usage` vorher und nachher.

- [x] S0 Setup (`chore`): frische Sonnet-Sitzung je Block per Skript, enger Review, Berichte als Spieler lesbar. Gate: Probelauf mit Mini-Auftrag, `tests/shellRules.test.ts` grün, CLAUDE.md und Skills passen. (955a7a1, cd0e1f7, bd61fdb, 4047294; letzter Review NACHBESSERN, Inhaber 2026-11-05: Randfälle beheben, kein weiterer Review)
- [x] V1 Waffenstatus, Daten: `src/data/weapon-status.json` aus `npm run coverage`. Gate: Test rot bei veralteter Datei; Cloudstrike 0 % gegen Quantum; `$aegis`-Waffe zeigt „no independent check“; Status berechnet. (4cb0b44, 5dd808e; Skript-Prüfung gegen Quantum in V1, Inhaber 2026-11-05)
- [x] V2 Tabelle in der Coverage-Seite, Rangliste 10/30/60 s. Gate: Test Sortierung und Filter, Screenshot, Ampel aus Data File. (fde147f, 6f9996f; Screenshot Hauptsitzung)
- [ ] V3 Zeitachse beim Aufklappen. Gate: Vex zeigt die Kette 25, 20, 16, 13, 11, 9, 8; Screenshot.
- [ ] M3 Ramp und Spielweisen: The Fourth Horseman, The Manticore, Tommy's Matchbook, Coldheart, Ticuu's Divination, Revision Zero, Lord of Wolves, Deathbringer, Dead Man's Tale, Thunderlord, Sunshot. Gate: M-Gate, `/usage` vorher und nachher. Wiederherstellen: Thunderlord.
- [ ] V4 „What changed“ auf der Seite. Gate: Test gegen einen Stand aus git.
- [ ] A3 Aufräumen nach M1–M3. Gate: Berichte gleich.
- [ ] M4 Bedingte Buffs, Katalysatoren: Ace of Spades, Microcosm, Monte Carlo, Sturm, The Last Word, Third Iteration, Xenophage, Sleeper Simulant, Izanagi's Burden, Anarchy, The Chaperone, Barrow-Dyad, Still Hunt. Gate: M-Gate. Wiederherstellen: Chaperone, Barrow-Dyad, Izanagi, Xenophage, Sleeper.
- [ ] M5 Hand-Items von `$aegis` auf `$quantum`/`$clarity`: Polaris Lance, Truth, Hierarchy of Needs, Choir of One, Delicate Tomb, Duality, Graviton Spike, Salvation's Grip, The Queenbreaker. Gate: M-Gate je Spielweise.
- [ ] Q-Bilanz (Opus): Waffen mit Item, Sätze ohne Regel nach Häufigkeit, Aegis-Bericht; nächste Blöcke oder Gegenprobe. Stopp zur Freigabe. Wiederherstellen ohne M-Block: Gjallarhorn, Telesto, Wish-Ender, Wish-Keeper, Vigilance Wing, Whisper of the Worm, Ager's Scepter, Leviathan's Breath, Burst-Primaries. Entscheidet über die dann übrigen Pakete (Voraussetzung für A2).
- [ ] A2 Aufräumen (hinter der Q-Bilanz, Inhaber 2026-11-03): Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

## Plan Q (Inhaber 2026-11-03)

Quantum und Clarity einzige Quelle (ADR 0019), Prüfstand nur Bericht bis zur Gegenprobe.

**M-Gate:** Regeln nach Vorlage mit `$clarity`-Zitat, Rest in `notModelled`; je Vorlage eine Golden-Waffe; Plausibilität; Sätze ohne Regel sinken. Je Block `build:weapons`, `coverage`, Tests, Snapshots `--update`. **Nie `import:weapons`.**

Gestrichen: B6.5, B6.6. Verschoben in die Gegenprobe: B6.4, Nachtrag der Exotics ohne Quantum.

## Reihenfolge

Q → C (Casts, Energie) → Gegenprobe (Prüfstand als Gate, B6.4, Nachtrag) → B5 (Eichung). Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
