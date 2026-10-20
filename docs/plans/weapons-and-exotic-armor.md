# Plan: Weitere Waffen und Exotic-Rüstung (v1.1)

Stand: 2026-10-20 · Status: freigegeben in groben Zügen, jeder Schritt braucht seinen eigenen Plan und eine Freigabe

## Ziel

Spieler vergleichen **Waffen in Kombination mit Exotic-Rüstung**. Das Feedback des Inhabers zu v1.0 (2026-10-20): Bedienung passt, Vergleiche wirken plausibel, es fehlen vor allem **Truth** (Rocket Launcher) und **Dawn Chorus** (Warlock-Helm). Spannend wird der Rechner erst mit Waffe × Exotic-Rüstung.

## Stand vor diesem Plan

- v1.0 ist inhaltlich fertig und online (Cloudflare Pages baut jeden Push auf `master`, ADR 0003).
- Oberfläche wie im Spiel (U1 bis U3): Waffe mit Katalysator, Klasse, Subklasse, Fähigkeiten mit Class Ability, Fragmente, Rüstung (Platz „Exotic: folgt“, Mods), Stats, Artefakt, Fireteam Support. Eigene Effects haben einen Slot (`EffectProvider.slot`).
- Surges: Stufen 1x bis 3x ohne Element (Annahme: passende Mods), Icon nach Element der Waffe. Surge 4x nur über Exotics, kommt mit Exotic-Rüstung zurück.
- Engine kann schon: Magazin, Reload, Munition gesamt (`totalShots`), Zähler mit Schwelle und Cooldown, Schaden über Zeit, Effects nur für bestimmte Elemente.
- Quellen: Truth und Thunderlord stehen in Aegis und Quantum (Aegis: Truth mit/ohne Reaper's Tithe, mit Prototype Truthseeker und Argent Ordnance; Thunderlord „with lightning strikes, excludes Bolt Charge“).

## Schritte

| Schritt | Inhalt | Freigabe vorher |
| --- | --- | --- |
| ✅ **7** | v1.0 formal abschließen: `package.json` 1.0.0, Tag `v1.0.0`, Changelog mit Zusammenfassung für Spieler, Releaseplan. Klein. | Plan |
| ✅ **W0 Fundament** | ADR 0012 „Mehrere Waffen“ und `docs/guides/weapons.md`. Alle Data Files in `src/data/weapons/` geladen (`loadWeapons`, Ids und Codes eindeutig); Gate-Werte mit `weaponId`, jede Waffe braucht ein Gate; `effectAppliesToWeapon`; Engine mit erfundener Testwaffe geprüft. Link-Format 3 enthält die Waffe schon, kein Format 4 nötig. Waffenauswahl und Oberfläche wandern nach W1 (Liste im Leitfaden). | Plan + ADR |
| **W1 Waffen-Import** | ADR 0013: Snapshots von Aegis und Quantum, Arten der Annahmen (Test gegen unbekannte), Pakete, Optionen mit Dauer-Markierung, Gate automatisch, Prüftabelle `docs/weapon-import.md`, Waffenauswahl mit Suche, Oberfläche ohne One-Thousand-Voices-Annahmen (Liste in `docs/guides/weapons.md`). Prüffälle: Truth (Handtabelle vom 2026-10-20 als Erwartung) und Thunderlord. | Regeln (ADR 0013) freigegeben; Prüftabelle pro Import |
| **E0 Exotic-Rüstung, Fundament** | Slot „Exotic“ in der Rüstung, höchstens eine pro Build, nach Klasse; ein Exotic ist ein Bündel aus Effects; Bedingungen (z. B. Mantle: Surge 4x im Element des Supers). Schema, Tests, Link. | Plan + ADR |
| **E1 erste Exotics** | Dawn Chorus (Wunsch des Inhabers); dazu Kandidaten mit großer Wirkung auf Schaden: Mantle of Battle Harmony (Surge 4x), Celestial Nighthawk (Golden Gun), Cuirass of the Falling Star (Thundercrash). Jedes Exotic vorher recherchieren (Compendium, Court, Aegis). | Datentabelle pro Exotic |
| ~~W2 Thunderlord~~ | Entfällt: Reign Havoc und Blitze stecken im Aegis-Paket (ADR 0013). | – |
| **v1.1** | Changelog, Testlauf mit den Freunden: Waffe × Exotic-Rüstung vergleichen. | – |

Reihenfolge W1 vor E0: Der Waffen-Import liefert auf einen Schlag viele Waffen für den Vergleich Waffe × Exotic-Rüstung. Für Exotic-Rüstung gilt dasselbe Prinzip (Import statt Handarbeit): Courts Stacking Guide für Buffs, Aegis-Zeilen „with X“ für Abilities.

## Risiken und offene Fragen

- **Aegis-Pakete mit eingerechneten Exotics:** Manche Ability-Zeilen messen mit Exotics (z. B. Burning Maul mit Sol Invictus). Exotics, die Abilities verstärken, müssen wie Radiant herausgerechnet werden können (ADR 0009, Punkt 5).
- **Dawn Chorus:** Wirkung im aktuellen Spiel vor E1 recherchieren. Ohne belegte Werte kein Effect (Regel: niemals raten).
- **Optimizer:** Exotic-Rüstung vervielfacht die Kombinationen. Siehe `docs/plans/optimizer-abilities.md`, Abschnitt „Voraussetzung, die brechen kann“.
- **Bedingte Effects:** Exotics hängen oft an Bedingungen (Element des Supers, Treffer mit Abilities). Die Engine kennt bisher nur Zeitfenster und Elemente der Waffe.
- **Waffen-Mechanics pro Waffe** nur aus Quellen, keine Ingame-Tests pro Waffe (ADR 0011, Regel 6).

## Zurückgestellt (nicht in diesem Plan)

- Optimizer mit Fähigkeiten (`docs/plans/optimizer-abilities.md`)
- Abschnitte „Für Spieler“ in den übrigen Mechanic-Dateien; schlanke Abdeckung für Spieler im Wiki
- Lücke: 13 Aegis-Pakete enthalten Ember of Ashes
