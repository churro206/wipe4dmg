# Quellen: gespeicherte externe Daten

Hier liegen einmal gespeicherte externe Daten (Regel in `CLAUDE.md`). Welche Quelle wofür gilt: `docs/data-sources.md`; Abrufwege und Budget: Skill `recherche`. Was aus der Sichtung folgt (Korrekturen, Lücken, Blöcke): `docs/plans/sources-2026-10.md`.

## Einzeldateien

| Datei | Inhalt | Genutzt von |
| --- | --- | --- |
| `compendium-game-mechanics-energy.txt` | Compendium, Game Mechanics, Armor Stats (Energie) | `src/data/ability-energy.json`, `scripts/lib/energy.ts` |
| `compendium-game-mechanics-weapons.txt` | Compendium, Game Mechanics, Weapons-Stat | `src/data/weapon-stats.json` |
| `gemini-super-timings.csv` | Super-Timings, Schätzung von Gemini (`unverified`); wird durch Flat Gain ersetzt (Plan K2) | `src/data/super-timings.json` |

## Archiv aller Sheets von destiny2.science: `sheets/`

Stand 2026-10-25, 95 Reiter aus 12 Sheets.

- `sheets/index.json`: jedes Sheet mit ID, Autor, Stand, und jeder Reiter mit gid, URL, Datei, Zeilen, Lesestatus (`full`, `text-rows`, `partial`, `search`, `headers`, `none`), Relevanz (`now`, `2.0`, `reference`, `none`, `imported`), Themen und Notiz. Auch nicht geladene Reiter stehen dort mit Grund.
- `sheets/<sheet>/<gid>-<reiter>.tsv`: Spalte 1 ist die Zeilennummer der Export-Ansicht, danach die Zellen. Zitieren als `sheet/gid:zeile`, z. B. `quantum/0-home:7`. Zellnotizen sind nicht enthalten (fehlen im Export).
- `sheets/coverage-hits.json`: Fundstellen je offenem Eintrag der Coverage-Seite (Stand 2026-10-25).
- `sheets/clarity-chunk-energy-scalars.md`: Clarity-Blog zu Chunk Energy Scalars und Class Mod Scalars.
- `sheets/clarity-character-stats-1.9.json`: Clarity-Datenbank „Character Stats“, Stand 2025-02 (vor Edge of Fate; Stats veraltet, Chunk Scalars zur Gegenprobe).

Erzeugt mit Einmal-Skripten aus `htmlview`-Seiten (`tmp/build-source-archive.ts`, `tmp/coverage-hits.ts`; nicht versioniert). Bereits importierte Reiter (Aegis Weapons/Abilties/Sustained/Swap/Bosses, Compendium Subklassen/Exotics/Perks/Artifact/Class, Court Stacking Guide/Catalysts, Quantum Primaries/Specials/Heavies) liegen als Snapshot in `src/data` und nicht im Archiv.

## Was die Sheets liefern

| Sheet (Schlüssel) | Wofür | Wichtigste Reiter |
| --- | --- | --- |
| Aegis Boss Damage (`aegis`) | Messungen | **Testing**: Treffer je Super (z. B. Song of Flame Snap 176+676, Wisp 910+998 mit Grenade-Stat skalierend; Glacial Quake Kristall 646, Punch 681; Bladefury 568); **Bolt Charge**: Rate je Quelle; **Changelog**: Wolfsbane, Praxic Blade, Heirloom, Barrow-Dyad in Weapons/Sustained; **Fireteam**: Rotationen mit Loadout (Spielweise). Versteckte Reiter (FAQ, Equipment, Super, Rotations) nicht öffentlich |
| Destiny Data Compendium (`compendium`) | Texte mit Zahlen | **Game Mechanics**: Chunk Scalars (×0,5, Melee ×0,6, Supers ohne), Stat-Boni über 100, Bosse = Combatant Tier 6, Heat Weapons +15 % Impact; **Armor Mods**: Energie-Mods mit Stufen, Font-Mods; **Armor Perks**: Set Bonuses |
| Court (`court`) | Buckets, Stacking | Nur importierte Reiter nützlich; Banes und Micro-Missiles sind Bilder |
| Quantum Damage-ics (`quantum`) | Waffen-Grundwerte | **Home**: Annahmen Rally/Lunafaction-Reload, Extended + Backup Mag; **Elemental Effects**: Keyword-Grundschaden (Shatter 158/361/396, Threadlings 234, Unravel 39); **Weapon Specifics**: Eigenschaden von Exotics und Catalysts; **Swords**: Worldline Zero, Lament, Ergo Sum; **TODO**: was Quantum noch nicht gemessen hat |
| Endgame Analysis (`endgame`, Aegis) | Effekte mit Zahlen, Tiers | **Aspects**, **Fragments**, **Artifact Mods**, **Set Bonuses**, **Exotic Weapons**; für 2.0 **Archetypes** (Legendary-Frame-Grundwerte, Boss-DPS), **Perks**, **Origin Traits** |
| Flat Gain Factors (`flatgain`, Engineeeer/RyTako) | Energie | Stat-Kurven 0–200, Regen-Multiplikatoren bei Stat 0 und 100, Base Cooldown und Chunk-Faktor je Ability, Super-Schaden und Cast Time/Lock, Energie je Mod/Perk |
| Glaive Compendium (`glaive`) | Regen, Buffs | Regen-Raten und Grenade-Boni mit Bedingung, Chunk-Energie je Exotic, Freeze +120 % Melee, Melee-Buffs additiv, Exotic-Rüstung mit Werten |
| RyTako (`rytako`) | Energie | Passive/Active Scalers, Stat-Tabellen, Class Mod Scalers 0,4/0,6/1,0, Warlock ×1,1 Grenade-Regen |
| MossyMax Reserves (`mossy`) | Munition | **Unique**: Exotic-Reserves mit 0–3 Reserve-Mods; Datenbanken je Legendary-Roll (2.0) |
| Damage Scaling (`scaling`), Damage Generator (`dmggen`) | veraltet | Stand 2025-02 bzw. 2024-11; höchstens Verhältnis-Gegenprobe |
| Resilience Chart (`resilience`) | ohne Belang | eingehender Schaden |

Widersprüche: Elemental Overdrive 22 % (Aegis) gegen 10 % (Glaive), Cauterized Darkness 75 % gegen 30 %: Aegis gilt (aktueller, gemessen). Stat-Kurve der Energie: drei Lesarten (Flat Gain, RyTako, Compendium), Herleitung im Energie-Block.

Nicht gelesen: die MossyMax-Datenbanken (je über 2000 Zeilen, 2.0), 20 Reiter von Damage Scaling, Resilience Chart, Compendium „OLD …“. Nur über Kopfzeilen und Suche: 18 Legendary-Waffenreiter von Endgame Analysis, Endgame-Changelog ab Zeile 300. Planer-Vorlagen auf destiny2.science enthalten keine Daten.
