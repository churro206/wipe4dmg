# Plan nach der Quellensichtung (2026-10-25)

Grundlage: Archiv `docs/sources/sheets/` (95 Reiter aller 14 Sheets von destiny2.science als TSV, `index.json` mit Lesestatus und Relevanz je Reiter), Abgleich der 177 offenen Coverage-Einträge (`coverage-hits.json`) und Gegenprobe unserer Werte (Skripte `tmp/coverage-hits.ts`, `tmp/source-checks.ts`). Fundstellen als `sheet/gid-Reiter:Zeile`. Status: **Vorschlag, nicht freigegeben.**

## 1. Ausbessern (falsch übernommen; nach Regel „immer korrigieren“)

| # | Befund | Beleg | Wirkung |
|---|---|---|---|
| K1 | **Quantum-Reload enthält Rally Barricade bzw. Lunafaction**, Magazine Extended + Backup Mag. Unser Effekt Rally Barricade multipliziert noch einmal ×0,9; ohne Rally ist der Reload zu kurz. `docs/data-sources.md` sagt „ohne Meta-Annahmen“. | `quantum/0-home:7` | alle Waffen mit Quantum-Timing; Abstände zwischen Waffen und mit/ohne Rally |
| K2 | **Super-Längen** aus Geminis Schätzung weichen bei 11 Supers um >15 % von Flat Gains „Cast Time / Lock“ ab: Daybreak 13 s statt 9,55 s, Arc Staff 9,5 statt 16,8, Spectral Blades 9,5 statt 13,53, Sentinel Shield 9,5 statt 12,95, Winter's Wrath 11,5 statt 15,25, Nova Warp 14,5 statt 25, Nova Bomb 1,8 statt 1,52, Golden Gun Marksman 2,2 statt 3,23 (2,35 nur vorgezündet). | `flatgain/727352169-supers-2-0` | Super-Fenster aller Roaming Supers, Waffenzeit danach |
| K3 | **Stat-Kurve der Energie**: wir rechnen linear bis ×2,48 bei 100 (Gemini). Drei Quellen mit Tabellen, nicht linear: Flat Gain Cooldown Scalar ×2,75, RyTako ×3,115 (Base Regen Units) bzw. ×2,900 (%-Gains), Compendium „+211,5 %“ Grenade-Gains. Unsere Melee- und Super-Gains (`missing`) gibt Flat Gain an: dieselbe Kurve wie bei der Grenade. | `flatgain/1630989835:8-28`, `rytako/1211854080:97-144`, `compendium/1800463143` | jede Ability-Kadenz |
| K4 | **Regen-Multiplikatoren**: Flat Gain gibt sie bei Stat 0 und 100 an und sagt, dass sie mit dem Stat skalieren (Note 1). Unsere Werte entsprechen dem Wert bei 100 (Eye of Another World 0,45; Heart of Inmost Light 4 statt 3,2 bei 0). Doppelt skaliert? | `flatgain/1365845234`, `flatgain/1630989835:37` | Exotics mit Regen |
| K5 | **Cooldowns und Chunk Scalars**: Solar-Grenades 9–10 % unter Flat Gain T0 (genau Faktor 1,1 = Warlock-Grenade-Regen laut RyTako; gilt nur für Warlocks?), Frenzied Blade +12 %, Arcane Needle +16 % (Mehrfachladung?); Chunk Scalar Seismic Strike 0,8→0,9, Hammer Strike 0,8→0,9, Shield Bash 0,7→0,9, Acrobat's Dodge 0,5→0,8. | `flatgain/0-grenades`, `1189196752-melees`, `1350413762`, `rytako/1211854080:99` | Kadenz einzelner Abilities |
| K6 | **Facet of Courage**: +50 % Melee gilt bei uns für jede Melee, laut Aegis nur Light-Melee gegen darkness-debuffed (Bedingung ist schon als Ungenauigkeit notiert). | `endgame/1402770816:7` | Prismatic-Melee-Builds |
| K7 | **Coverage-Einstufung**: die 6 fehlenden Fragments wirken gegen einen Boss ohne Adds nicht (Kill, Finisher, Critical Health, Brick); Rüstungen „nur Energie“ mit Eintrag in `ability-energy.json` stehen als fehlend; Bequest ist ein Legendary-Schwert. | `endgame/1402770816`, `endgame/473850359:10` | Anzeige, Zählung |

## 2. Lücken, die die Quellen konkret schließen

| Gruppe | Einträge | Werte und Fundstelle |
|---|---|---|
| Supers (fehlen) | Song of Flame, Glacial Quake, Bladefury, Hammer of Sol mit Sol Invictus | Treffer: `aegis/247390216:2-29` (Song of Flame Snap 176+676, Wisp 910+998, skaliert mit Grenade-/Melee-Stat; Glacial Quake Kristall 646, Punch 681; Bladefury Light 568; Hammer of Sol 435); Gesamt und Dauer: `flatgain/727352169` (36 048 / 12,53 s; 36 621 / 15,72 s; 37 892 / 11,1 s; 36 192 / 12,77 s) |
| Supers (angenähert) | 20 Supers „Länge geschätzt“ | Länge und Gesamt-Schaden bei Super 200: `flatgain/727352169` → zugleich Rangfolge-Gate für Supers |
| Waffen | Worldline Zero; Wolfsbane, Praxic Blade, Barrow-Dyad | Worldline Zero: `quantum/1670178164:61-67` (Light 393, Heavy 1345, Tesseract 3408). Die anderen drei misst Aegis (Changelog `aegis/1268483240:34,49,80`); Grund „fremde Annahmen“ neu prüfen und herausrechnen. Huckleberry: nur Kill-Perk + Kinetic Tremors 163 (`quantum/635034617:113`) |
| Catalysts | Tessellation, Divinity, Quicksilver Storm, Euphony, Bastion, New Land Beyond, Final Warning, Parasite | `quantum/635034617` (Irreducible 2437; Penance 886, 10 Schüsse, 3 s; QSS Grenade 684, Rocket 84), `aegis/247390216:74-80,151-152`, Quantum All Weapons (NLB Master-Stapel, Final Warning mit Catalyst) |
| Keywords Stasis/Strand | Shatter, Threadling, Freeze, Unravel, Volatile Rounds | `quantum/8932058` (Crystal Shatter 158, +23 Fissures, Forced 361, Natural 396, Threadlings 234, Unravel 39/Projektil, Scorch 22 DPS); Thread of Evolution +33 % gegen Bosse (`glaive/613763943:29`); Freeze +120 % Melee (`glaive/1582544452:131`) |
| Aspects | Tempest Strike, Consecration, Crackshot, Lethal Current, Shieldburst, Gunpowder Gamble, Stylish Executioner, Flow State; angenähert: Lightning Surge, Touch of Flame, Chaos Accelerant | `endgame/1426359048` (739; 2×526; 3×354; 195; 550 + 3×141; +50 % / 9×80; +300 %; Regen 80 %/180 %), `flatgain/1365845234:5` |
| Energie-Exotics | Crown of Tempests, Contraverse Hold, Sunbracers, Hallowfire Heart, Caliban's Hand, Khepri's Sting, Shinobu's Vow, Lucky Raspberry, Apotheosis Veil, Osmiomancy, Getaway Artist, Starfire (Werte), Heart of Inmost Light (Class) | Regen: `flatgain/1365845234`, `glaive/613763943`; Chunks: `glaive/197208959`, `glaive/596254078`. Kill-, Gegnerzahl- oder Critical-Health-Auslöser (Nezarec's Sin, Vesper, Gyrfalcon's, Mask of the Quiet One, The Stag, Fallen Sunstar) wirken gegen einen Boss ohne Adds nicht → leftOut |
| Energie-Mods | Bolstering Detonation, Impact Induction, Momentum Transfer, Focusing Strike, Bomber, Outreach, Distribution, Kickstarts, Font-Mods | `compendium/1934379638` (12/17/20 %, 7 s CD), Class Mod Scalers `rytako/1211854080:101` (0,4/0,6/1,0), Blog `clarity-chunk-energy-scalars.md` |
| Artifact | Flashover, Heavy Ordnance Regeneration, Lightning Strikes Twice, Hail The Storm, Kinetic Impacts, Volatile Flow/Marksman, Unraveling Orbs | `endgame/67326797` (+50 % Bolt Charge; +85 % Regen 10 s; +130 %; +12,5/25 % Shatter; 372; 9/10 s; 14 s) |
| Bolt Charge | Raten je Quelle für Storm's Keep, Thunderlord, Le Monarque, Ergo Sum | `aegis/402419508` |

Nicht schließbar mit diesen Quellen: Rüstungen mit eigenem Schaden ohne Zahl (Mask of Fealty, Balance of Power, The Bombardiers, Mataiodoxía, die meisten Spirits), Catalysts ohne Messung (Hard Light, Lodestar, Sunshot, MIDA, Verglas, Buried Bloodline, Fighting Lion, Edge of Concurrence, Eyes of Tomorrow, Finality's Auger), Healing/Coldsnap/Duskfield Grenade (nur Cooldowns), Combination Blow, Chain Lightning, Grapple (nur alte Werte aus Damage Scaling).

## 3. Ergänzen (neue Mechaniken oder Kategorien)

- **Set Bonuses (Armor 3.0)**, fehlen ganz. Gegen einen Boss wirksam: TM Custom High Noon +7 % (Tex-Waffen doppelt), Sage Protector Blade Focus +10 % Sword und Combat Meditation, Legacy's Oath 570 bei Super-Cast, Atheon's Memory Orbs, Techeun's Regen, Apostate's Blade 28 + Scorch je Melee. `endgame/1665223292`, `compendium/1287885342`. **Umfang: Inhaber fragen** (neue Oberfläche).
- **Heat Weapons** +15 % Impact gegen Elite+ (Bosse), Dynamic Heat ×1,15 dazu: `compendium/1800463143`. Betrifft Heirloom und Legendary (2.0).
- **Reserve-Mods** (Exotic-Reserves mit 0–3 Mods): `mossy/447640132`. Nur wenn die Munition in 60 s ausgeht; per 2-%-Regel prüfen.
- **Klassen-Faktor** Warlock ×1,1 Grenade-Regen (`rytako/1211854080:99`), zusammen mit K5.
- **Für 2.0**: Legendary-Frames mit Grundwerten und Boss-DPS (`endgame/1301036036`), Perks und Origin Traits mit Werten, MossyMax-Datenbank (Reserves je Roll), Fireteam-Rotationen als Referenz für Spielweise und Rangfolge (`aegis/1193280735`).

## 4. Widersprüche (Regel: vertrauenswürdigere Quelle mit Grund)

Elemental Overdrive 22 % (Aegis) gegen 10 % (Glaive), Cauterized Darkness 75 % gegen 30 %: Aegis (aktueller, Testing). Stat-Kurve (K3): im Energie-Block herleiten und gegen Aegis-Cooldowns gaten.

## 5. Blockfolge (Vorschlag)

1. **Q1 Quellen-Korrekturen** (Opus leitet K1 her, Sonnet baut): Quantum-Reload ohne Rally/Lunafaction zurückrechnen (Rally = +100 Reload Speed und ×0,9; d2foundry-Formel liegt schon vor), Magazine prüfen; K5 Scalars und Cooldowns; K6; K7 Einstufungen; `data-sources.md`. Gate: Gesamtprobe gegen Aegis unverändert ±, Rangfolge-Gate.
2. **Zähler-Block** wie geplant (Sonnet).
3. **Aufräum-Block** wie geplant (Sonnet).
4. **Q2 Supers** (Opus plant): Längen aus Flat Gain (K2), fehlende Supers aus Aegis Testing + Flat Gain, Flat-Gain-Gesamtschaden als Super-Rangfolge-Gate.
5. **Q3 Energie** (Opus plant): K3, K4, Klassen-Faktor, Energie-Exotics und Energie-Mods mit Chunk- und Class-Mod-Scalars.
6. **Q4 Stasis/Strand** (bisher „echte Debuffs am Ziel“): Freeze, Shatter, Threadlings, Unravel, Sever, Suspend mit Quantum-Grundschaden; danach Facet of Courage und Conductive Cosmic Crystal/Needle als Bedingung.
7. **Q5 Aspects, Artifact, Bolt Charge** (Sonnet nach Regel je Kategorie): Werte aus Endgame Analysis und Aegis Bolt Charge.
8. **Q6 Waffen und Catalysts**: Worldline Zero, Wolfsbane, Praxic Blade, Barrow-Dyad, Catalysts aus Weapon Specifics.
9. **Q7 Set Bonuses** nach Freigabe des Umfangs.

Danach Solar (Roaring Flames x3 und Solar Fulmination sind bereits modelliert, Rest der alten Reihenfolge 3) und 2.0.

## 6. Schätzung

Schließbar nach Q2–Q6: etwa 60–75 der 145 fehlenden Einträge; etwa 10 werden zu „leftOut“ (kein Effekt gegen einen Boss ohne Adds). Coverage nach Anzahl dann etwa 85–88 % (vorher 75 %), mit Set Bonuses als neuer Kategorie. Größerer Gewinn: K1–K4 betreffen fast jeden Build.
