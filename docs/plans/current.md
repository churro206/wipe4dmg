# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (freigegeben 2026-11-03)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`. „Wiederherstellen“: von Q1 abgeschaltete Tests (Liste: `known-inaccuracies`, Abschnitt Q1) wieder einschalten.

- [x] A1 `probeAuto` (709e41c). [x] Q0 ADR 0019 (7107447, a3ff3f5, fc7e91b)
- [x] Q1 Gerüst (2626745, 6920e29, b673757, cf8bcb8, d24143c, 96b0139, 5cdc5f7, faeb633; Review OK nach drei Prüfungen): 93 Items (108 von 141), Bericht „Sätze ohne Zitat“. 33 Pakete bleiben (10 ohne Quantum, 21 nur benannte Varianten, 2 N/A): von Hand im M-Block oder Q-Bilanz.
- [x] M1 DoT und Status (6ca5481, 2cb88af, 031376e; Review OK nach drei Prüfungen, Doku-Rest vom Orchestrator): 11 von 12; Jötunn bleibt Paket bis zur Gegenprobe (keine Quantum-Zeile); OTV-Gate gegen Quantums Totals, Aegis nur Bericht; Divinity als Item, Ausnahme weg; Reload-Katalysatoren per `$reload`; Witherhoard in `STRONG_CATALYSTS` und Thorn-Magazin als Näherung (alles Inhaber 2026-11-03).
- [x] M2 Zusatzteile (6414b0f, 46b6861, 341a428, 4a48cdc, cabb8ed, 463aaf2, 348c263, 31d2c6b, 8305f8c, 287a151, c61ea80, ecacfa8; Review OK nach drei Prüfungen): 11 Waffen. Outbreak-Stufen aus dem Compendium, Zählsperre 15 → 12, Quicksilvers Granate vorerst weg (Inhaber 2026-11-04). Reste für die nächste Änderung: Zitat und Notiz in `euphony.json:30-31`, Runde 1 in `docs/changelog.md:19`.
- [ ] M3 Ramp und Spielweisen: The Fourth Horseman, The Manticore, Tommy's Matchbook, Coldheart, Ticuu's Divination, Revision Zero, Lord of Wolves, Deathbringer, Dead Man's Tale, Thunderlord, Sunshot. Gate: M-Gate. Wiederherstellen: Thunderlord.
- [ ] A3 Aufräumen nach M1–M3. Gate: Berichte gleich.
- [ ] M4 Bedingte Buffs, Katalysatoren: Ace of Spades, Microcosm, Monte Carlo, Sturm, The Last Word, Third Iteration, Xenophage, Sleeper Simulant, Izanagi's Burden, Anarchy, The Chaperone, Barrow-Dyad, Still Hunt. Gate: M-Gate. Wiederherstellen: Chaperone, Barrow-Dyad, Izanagi, Xenophage, Sleeper.
- [ ] M5 Hand-Items von `$aegis` auf `$quantum`/`$clarity`: Polaris Lance, Truth, Hierarchy of Needs, Choir of One, Delicate Tomb, Duality, Graviton Spike, Salvation's Grip, The Queenbreaker. Gate: M-Gate je Spielweise.
- [ ] Q-Bilanz (Opus): Waffen mit Item, Sätze ohne Regel nach Häufigkeit, Aegis-Bericht; nächste Blöcke oder Gegenprobe. Stopp zur Freigabe. Wiederherstellen ohne M-Block: Gjallarhorn, Telesto, Wish-Ender, Wish-Keeper, Vigilance Wing, Whisper of the Worm, Ager's Scepter, Leviathan's Breath, Burst-Primaries. Entscheidet über die dann übrigen Pakete (Voraussetzung für A2).
- [ ] A2 Aufräumen (verschoben hinter die Q-Bilanz, Inhaber 2026-11-03: der Paketpfad trägt noch 33 Exotics ohne Item): Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

## Plan Q (Inhaber 2026-11-03)

Quantum und Clarity einzige Quelle (ADR 0019), Prüfstand nur Bericht bis zur Gegenprobe.

**M-Gate:** Regeln nach Vorlage mit `$clarity`-Zitat, Rest in `notModelled`; je Vorlage eine Golden-Waffe; Plausibilität; Sätze ohne Regel sinken. Je Block `build:weapons`, `coverage`, Tests, Snapshots `--update`. **Nie `import:weapons`.**

Gestrichen: B6.5, B6.6. Verschoben in die Gegenprobe: B6.4, Nachtrag der Exotics ohne Quantum.

## Reihenfolge

Q → C (Casts, Energie) → Gegenprobe (Prüfstand als Gate, B6.4, Nachtrag) → B5 (Eichung). Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0. M3 als gemessener Test im neuen Setup, nach dem Limit-Reset am 6. November: frische Sonnet-Sitzung je Block, Skript-Prüfungen gegen Quantum und auf Sätze ohne Regel, enger Opus-Review bei Engine-Änderungen oder alle drei Blöcke, `/usage` vorher und nachher (2026-11-04). Umbau als eigener `chore`-Commit davor.
