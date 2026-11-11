# Aktueller Stand

Höchstens 4 KB. Nach jedem Block: `docs/changelog.md`, `docs/known-inaccuracies.md`. Archiv per Grep: `docs/plans/history-2026-11.md`, `history-2026-10.md`.

## Checkliste (Inhaber 2026-11-06; jeden Block einzeln vorschlagen, Skill `abarbeiten`)

Format: `- [ ] <Block>: <Ziel>. Gate: <Prüfung>.`, „(Opus)“ für Herleitungen; erledigt `- [x] … (<Commit>)`.

- [x] A1, Q0, Q1, M1, M2, S0, V1–V4, P0, A3, W0–W4 (`history-2026-11.md`, `changelog.md`). Euphony auf Aegis (Ausnahme des Inhabers, ADR 0019).
- [ ] W5 Bilanz Waffen (Opus). Teil 1 erledigt (siehe Commit): Bilanz in `known-inaccuracies.md` („W5 Bilanz Waffen“), Magazin-Catalysts (7 Waffen, Clarity a🠚b, Munition bleibt wie bei Fourth Horseman), Wish-Ender und Vigilance Wing Catalyst `none`, fünf Sustained-Proben und Burst-Primaries wieder an (Test `tests/w5.test.ts`). Folgeblöcke W6–W8 vom Inhaber freigegeben 2026-11-11, je Block eine frische Sitzung.
- [ ] W6, W7, W8 (Ziel und Gate unten).
- [ ] A2 Aufräumen: Aegis-Paketpfad in `weaponPackages.ts`, `weapon-overrides.json`, `WeaponOverride` samt Tests weg; `pickBaseRow` nur für Szenarien. Gate: tsc, lint, Tests, Bericht gleich bis auf Entferntes.

## Folgeblöcke (freigegeben 2026-11-11)

- W6 Pakete und Aegis-Items: 16 Pakete als Items (5 mit Quantum-Variante: Cull's Shadow, Finality's Auger, Ice Breaker, Jötunn, Prometheus Lens; 11 ohne Quantum aus Clarity/Compendium), `$aegis` raus bei Heartshadow (4 × 507 je Orb), Black Talon, Ergo Sum, Heirloom, The Lament, Whirling Ovation. Voraussetzung für A2. Widerspruch: die Reihenfolge legt „Exotics ohne Quantum“ in die Gegenprobe, A2 entfernt aber ihren Paketpfad. Gate: `check:block -- W6`, keine Waffe mehr als Paket.
- W7 Gerüst-Sätze: die 37 Items der Klasse „liest Quantum“ (rund 300 offene Sätze) nach Vorlage oder `notModelled`, in Teilen je Vorlage. Gate: offene Sätze mit Zahl dieser Waffen 0, `check:block`.
- W8 Fehlende Mechanik (Opus): 27 Waffen über 2 %, je neuer Typ ein Teil (Ladung aus Treffern: Hawkmoon, Whisper; Super-Verbrauch: Ager's Scepter; Zielzustand; Moduswechsel: Graviton Spike). Gate: Aegis-Zeile je Waffe gegengeprüft oder Befund.
- Danach A2, dann Catalysts (eigene Stufe).

**Für W-Blöcke:** Neue Item-Dateien ohne Quantum-Basiszeile schreibt der Autor von Hand; Clarity-Hashes liefert `build:weapons` als „Review“-Zeile. Ein Satz gilt als gedeckt, wenn ein `$clarity`-Zitat oder `notModelled.quote` darin vorkommt. Regeln laufen in Dateireihenfolge. Klasse, Faktoren, Anteil je Regel in `weapon-status.json` (`cause`, `quantum.factors`, `ruleShares`). Engine sendet nur `reload start`, nie `end`. Je Block `build:weapons`, `coverage`, `probe`, Vergleichsbasis mit `--update`, `check:block -- <ID>`. **Nie `import:weapons`.** Prüfstand nur Bericht bis zur Gegenprobe (ADR 0019).

**Offen beim Inhaber:** Probe im Spiel für die Quellenkonflikte (`known-inaccuracies.md`, W0, W1). Ungeklärte Änderungen in `docs/sources/sheets/`: nicht committen.

## Reihenfolge

Waffen (W5–W8, A2) → Catalysts → Supers → Abilities (mit C, Casts und Energie) → Aspects → Fragments → Buffs/Debuffs → Armor → Mods → Stats → Artifacts → Gegenprobe (Prüfstand als Gate, B6.4) → B5 (Eichung). Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.

## Entscheidungen des Inhabers

Bauplan eng folgen, Abweichungen per ADR. Merge nur auf Ansage. Ein Boss, keine Adds. Kill-Buffs nur „Vorher aufgebaut“. Commit je Teil. Energie-Mods abgelehnt, Legendary Frames 2.0.
