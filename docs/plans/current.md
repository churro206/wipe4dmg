# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (freigegeben 2026-11-03)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`.

- [x] A1 Aufräumen: `scripts/lib/probeAuto.ts` dient nur `tests/lib/aegisCoverageData.ts`; dorthin verschieben oder umbenennen. Gate: Berichte byte-gleich. (709e41c)
- [x] Q0 (Opus) Entscheidung: ADR 0019; Bauplan (3, 5.2, 5.3, 12, 13) mit Katalog der Regelvorlagen (Treffer, Takt, Katalysator, bedingter Buff, Ramp, Status, N-ter Treffer, Zusatzteil, DoT); `notModelled` (Zitat, Grund) im Item-Schema; Quellenregel in CLAUDE.md. Gate: Freigabe Inhaber. (7107447, a3ff3f5, fc7e91b)
- [ ] Q1 Gerüst per Skript, einmalig: Item-Datei je Exotic mit Quantum-Basiszeile (Treffer `precisionDamage`, sonst `bodyDamage`; `.timing.*`; Katalysator aus `cata`-Zeile, sonst `unknown`; nur `cata`: eingebaut); Aliasdatei (`tesselation`); Bericht zählt Clarity-Sätze mit Zahl ohne `$clarity` oder `notModelled`. Gate: alle lösen auf, Plausibilität je Waffentyp, Fourth Horseman 5 Schuss je Magazin mit Katalysator.
- [ ] A2 Aufräumen: Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.
- [ ] M1 DoT und Status: Le Monarque, Thorn, Osteo Striga, Witherhoard, Jötunn, Two-Tailed Fox, One Thousand Voices, Fighting Lion, Deterministic Chaos, Conditional Finality, Winterbite, Dragon's Breath. Gate: M-Gate.
- [ ] M2 Zusatzteile: Malfeasance, Ex Diris, Cloudstrike, Alethonym, Euphony, Quicksilver Storm, Khvostov 7G-0X, Grand Overture, Slayer's Fang, Vex Mythoclast, Outbreak Perfected. Gate: M-Gate.
- [ ] M3 Ramp und Spielweisen: The Fourth Horseman, The Manticore, Tommy's Matchbook, Coldheart, Ticuu's Divination, Revision Zero, Lord of Wolves, Deathbringer, Dead Man's Tale, Thunderlord, Sunshot. Gate: M-Gate.
- [ ] A3 Aufräumen nach M1–M3. Gate: Berichte gleich.
- [ ] M4 Bedingte Buffs, Katalysatoren: Ace of Spades, Microcosm, Monte Carlo, Sturm, The Last Word, Third Iteration, Xenophage, Sleeper Simulant, Izanagi's Burden, Anarchy, The Chaperone, Barrow-Dyad, Still Hunt. Gate: M-Gate.
- [ ] M5 Hand-Items von `$aegis` auf `$quantum`/`$clarity`: Polaris Lance, Truth, Hierarchy of Needs, Choir of One, Delicate Tomb, Duality, Graviton Spike, Salvation's Grip, The Queenbreaker. Gate: M-Gate je Spielweise.
- [ ] Q-Bilanz (Opus): Waffen mit Item, Sätze ohne Regel nach Häufigkeit, Aegis-Bericht; nächste Blöcke oder Gegenprobe. Stopp zur Freigabe.

## Plan Q (Inhaber 2026-11-03)

Quantum (Zahlen) und Clarity (Mechanik) sind die einzige Quelle, kein neues `$aegis`. Aegis-Prüfstand nur Bericht bis zur Gegenprobe. Gerüst per Skript, Mechanik von Hand nach Vorlage, Zahlen nur als Verweis. Befund: Einzeltreffer Quantum ≈ Aegis ±2 %, Abweichungen sind Mechaniken (Archiv).

**M-Gate:** Regeln nach Vorlage mit `$clarity`-Zitat, Rest in `notModelled`; je Vorlage eine Golden-Waffe (Wert von Hand aus dem Text); Plausibilität; Sätze ohne Regel sinken. Je Block einmal `build:weapons`, `coverage`, Tests, Snapshots `--update`. **Nie `import:weapons`.**

Gestrichen: B6.5, B6.6. In die Gegenprobe verschoben: B6.4, Nachtrag der Exotics ohne Quantum (Archiv). Gelockert: Prüfstand-Schwellen bis zur Gegenprobe nur Bericht.

## Reihenfolge

Q → C (Casts, Energie) → Gegenprobe (Prüfstand als Gate, B6.4, Nachtrag) → B5 (Eichung). Offenes im Archiv. Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

- Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
- 2026-11-03: Quantum und Clarity einzige Quelle, Aegis erst Gegenprobe; Gerüst per Skript, Mechanik von Hand.
