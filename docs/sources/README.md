# Quellen: gespeicherte Auszüge und selten genutzte Reiter

Hier liegen einmal gespeicherte externe Daten (Regel in `CLAUDE.md`). Der Quellenkatalog mit den genutzten Reitern steht im Skill `recherche`.

## Gespeicherte Auszüge (Sichtung 2026-10-25, alle Sheets von destiny2.science)

**Maschinenlesbares Archiv: `sheets/`.** `sheets/index.json` listet alle Reiter aller Sheets (Sheet-ID, gid, URL, Lesestatus, Relevanz `now`/`2.0`/`reference`/`none`/`imported`, Themen, Notiz) und verweist auf die Datei je Reiter: `sheets/<sheet>/<gid>-<reiter>.tsv`, Spalte 1 = Zeilennummer der Export-Ansicht (zum Zitieren als `sheet/gid:zeile`), danach die Zellen. Dazu `sheets/clarity-chunk-energy-scalars.md` (Blog), `sheets/clarity-character-stats-1.9.json` (Clarity-Datenbank, Stand 2025-02, vor Edge of Fate) und `sheets/coverage-hits.json` (Treffer je offenem Coverage-Eintrag). Neu bauen: `node tmp/build-source-archive.ts <ordner mit htmlview-Seiten>`. Ergebnis und Plan: `sichtung-2026-10-25.md`, `docs/plans/sources-2026-10.md`.

Die Abschnitte unten beschreiben den Inhalt in Worten; die Dateinamen `*.txt` darin sind durch `sheets/` ersetzt.

- **Flat Gain Factors** (Engineeeer, Tests von RyTako; `17lGgioS4E8l6w3-bJU8frTmzFzxl-3RDv1wm6gP7Dao`), Stand Edge of Fate: `flat-gain-factors-*.txt`. Stat-Kurven 0–200 (Cooldown Scalar, Energy Gained, Damage Increase je Ability, Weapons-Stat), Regen-Multiplikatoren von Exotics/Aspects/Fragments bei Stat 0 und 100, Supers mit Schaden und Cast Time/Lock, Base Cooldowns und Flat Gain Factor je Grenade/Melee/Class Ability, Energie-Werte von Mods und Perks.
- **Quantum Damage-ics**: `quantum-damage-ics-elemental-effects.txt` (Grundschaden der Keywords inkl. Shatter, Threadlings), `-weapon-specifics.txt` (Eigenschaden von Exotics, u. a. Barrow-Dyad, Huckleberry, Quicksilver Storm, Tessellation, Symmetry), `-swords.txt` (Schwert-DPS je Frame und Combo).
- **Aegis Boss Damage**: `aegis-boss-damage-bolt-charge.txt` (Bolt-Charge-Rate je Quelle), `-pack-hunter.txt`.
- **Destiny Data Compendium**: `destiny-data-compendium-armor-mods.txt` (Energie-Mods mit Stufen), `-armor-perks.txt` (Armor Set Bonuses).
- **Aegis Endgame Analysis** (`1JM-0SlxVDAi-C6rGVlLxa-J1WGewEeL8Qvq4htWZHhY`, Stand bis 2026-09): `aegis-endgame-analysis-aspects.txt`, `-fragments.txt`, `-artifact-mods.txt` (Effekte mit Schadenszahlen, Tier).
- **Glaive Compendium** (Oni Black Mage, `1FT-BL6UA6ntNEN7_btqwlfJaPYTAeIFvlhpkvWHTajc`, 9.7.0): `glaive-compendium-grenade-regen-damage.txt` (Regen-Buffs mit Bedingung).

## Weitere Reiter (bisher nicht genutzt)

- Aegis Boss Damage (`1_5wtBjRYHHxuF4oJKDb_iOGZs-wTkzB6RYbnyNLbuz4`): Fireteam (S29) `1193280735`, Graphing (S29) `1791137823`, Historical `277863849`, Scaling (old) `2104454056`, Changelog `1268483240`.
- Court's Stacking Guide (`1i1KUwgVkd8qhwYj481gkV9sZNJQCE-C3Q-dpQutPCi4`): Champ Counters `1367323152`, Banes `1888181920`, Micro-Missiles `640460340`, Combatants (alt) `1541186536`, Marathon `1034561092`.
- Quantum Damage-ics: Equations `575699502` (Erklärung timeToEmpty, Triple Tap, FTTC), Reserves Data `1888513855`, All Weapons `1857452032`.
- Destiny Data Compendium: sechs Reiter „OLD …“ (veraltet).
- Aegis Endgame Analysis: Tier-Listen je Waffentyp, Exotic Weapons, Perks, Origin Traits, Set Bonuses, Subclasses, Encounters.
- MossyMax Reserves and Mag Database (`1l3xBHFa6ZMe86e13segg8f-RB8vLNerYEgNC_Aq3kLc`, Edge of Fate): EoF Full Database `960724298`, Unique `447640132`, Equations `1961999350` (Reserves-Formeln je Frame), Ammo Brick math `268521891`; für Legendary Frames (2.0).
- RyTako (`1lEOY_Z0v5ZZVZJ1SVLJyleMBEG2a7KLq4aLIQA9zk0A`): Energie pro Pickup je Chunk Scalar und Stat.
- Glaive Compendium: Abilities/Buffs/Debuffs `1582544452`, Class Ability Energy `596254078`, Grenade Energy `197208959`.
- Veraltet: Damage Scaling (MossyMax, `1b57Hb8m1L3daFfUckQQqvvN6VOpD03KEssvQLMFpC5I`, Stand 2025-02), D2 Damage Generator (`1rY_iChu08CVnIMfHliZQwup10-GnmPtEu5FG0DNy8VM`, Stand 2024-11). Ohne Belang: Resilience Chart (eingehender Schaden), drei Planer-Vorlagen.
- Clarity-Blog „Chunk Energy Scalars“: erklärt den Flat Gain Factor; Class-Item-Mods (Bomber, Outreach, Distribution) haben einen zweiten Faktor nach dem Cooldown der Class Ability; Ability-gebundene Perks und volle Ladungen (Starfire, Apotheosis Veil) sind ausgenommen.
