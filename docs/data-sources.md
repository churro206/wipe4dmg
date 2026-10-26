# Datenquellen

Stand: 2026-10-20, ergänzt 2026-10-25 · Spielversion: 9.7.0.5

Gespeicherte Rohdaten aller Sheets von destiny2.science: `docs/sources/README.md`.

Die Spielwerte kommen aus frei zugänglichen Community-Quellen (ADR 0005). Eigene Messungen sind nur Stichproben.

## Hauptquellen

Alle Quellen sind über [destiny2.science](https://www.destiny2.science/) verlinkt. Die Google Sheets lassen sich pro Reiter als CSV herunterladen.

| Rolle | Quelle | Stand | Inhalt |
| --- | --- | --- | --- |
| Hauptquelle Waffen-Grundwerte | [Quantum Damage-ics](https://destiny2.science/quantum-damage-ics) | Tabelle bis 9.7.0.1; One Thousand Voices zuletzt 2024/2025 aktualisiert, Katalysator fehlt | Schaden pro Shot, Magazin, Reserves, rpm, Reload Time, Zeit bis leer; ohne Buff-Annahmen, aber laut Startseite mit Reload von Rally Barricade bzw. Lunafaction Boots und mit Extended + Backup Mag (`docs/sources/sheets/quantum/0-home.tsv`, Zeile 7). Gate 2026-10-26: Quantum-Reload = d2foundry bei Stat 100 × 0,9, Aegis-Reload = Quantum-Reload; beide enthalten Rally, Feld `reloadDurationIncluded` (K1) |
| Gegenprüfung, Multiplier | [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage) | Changelog 2026-10-12; One Thousand Voices getestet auf 9.7.0.3 | Grundschaden pro Shot mit Meta-Annahmen, Multiplier, Shots gesamt, Zeit bis leer |
| Damage Phases bekannter Bosse | [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Bosses“ | Changelog 2026-10-12 | 61 Bosse mit Aktivität, Länge der Damage Phase in Sekunden und Beschreibung. Automatischer Import: `npm run import:bosses` → `src/data/bosses.json` (47 mit Zahl, 14 ohne: „?“, „Variable“, „N/A“) |
| Icons | [Bungie Destiny 2 Manifest](https://www.bungie.net/en/Application) (ADR 0008) | Manifest 244213.26.06.29.2000-1, abgerufen 2026-10-18 | Icons für Effects, Waffe, Abilities, Subklassen, Ignition, Taken Seeker. Zuordnung über `manifestRef` in `effects.json` und `src/data/icon-refs.json`; Abilities über ihren Namen. Außerdem Slot, Klasse und Subklasse aller Abilities aus der Item-Tabelle (`plug.plugCategoryIdentifier`, z. B. `hunter.prism.supers`) → `src/data/manifest-abilities.json`. Außerdem 141 exotische Waffen (ADR 0013): Waffentyp (`itemSubType`), Element (`defaultDamageType`), Munition (`equippingBlock.ammoType`), Namen aus den Socket-Kategorien „Intrinsic Traits“ und „Weapon Perks“ mit allen Optionen, Katalysator als Item „<Waffe> Catalyst“ (`traitIds: item.exotic_catalyst`) mit seinen Sandbox-Perks → `src/data/manifest-weapons.json`. Bei neu aufgelegten Waffen gewinnt das Item mit Collectible und den meisten Sockets. Dazu `mods` (Socket-Kategorie „Weapon Mods“, z. B. Bauteile der Praxic Blade) und die Texte von Intrinsic und Katalysator. Außerdem 141 Exotic-Rüstungen mit Klasse, Slot und Intrinsic samt Text → `src/data/manifest-armor.json` (z. B. Lucky Pants: „Illegally Modded Holster“, Hand Cannons) und die Item-Typen aller Namen aus den Aegis-Waffen-Annahmen → `src/data/manifest-terms.json` (z. B. Harsh Refraction: Artifact Perk). Reihenfolge: erst `import:weapons`, dann `import:icons`. Import: `npm run import:icons` → `public/icons/`, `src/data/icons.json` |
| Hauptquelle Ability Components | [Destiny Data Compendium](https://destiny2.science/data-compendium), Subklassen-Reiter (ADR 0009) | abgerufen 2026-10-19; Stand pro Eintrag unterschiedlich | Grundwerte der Teile von Grenades, Melees und Supers, Super-Dauer, Energieverbrauch pro Angriff. Gleiche Skala wie der „visual Value“ von Aegis. Snapshot der Texte: `npm run import:compendium` → `src/data/compendium-abilities.json` (CSV-Export gesperrt, daher htmlview). Jeder zitierte Wert wird per Test gegen den Snapshot geprüft; nach einem Patch zeigt ein neuer Import, welche Zitate nicht mehr stimmen |
| Gate und Fallback Abilities | [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Abilties“ (ADR 0009) | Patch 9.7.0.3 | 242 Zeilen (Super, Grenade, Melee, Miscellaneous): Schaden pro Einsatz ohne Standard-Multiplier („visual Value“, Wipe ÷ Anzahl ÷ Full Modifiers) bei Stat 100 und 200, Annahmen als Text. Automatischer Import: `npm run import:abilities` → `src/data/aegis-abilities.json`; Annahmen, die modellierte Effects sind, landen in `includedEffectIds`. Zeilen mit Full Modifiers 1,00 (nicht normiert) oder abweichend von ×2,30 sind `unverified` |
| Waffen-Import (ADR 0013) | Aegis, Reiter „Weapons“ (gid `2139128689`) und „Sustained“ (gid `1455724279`, → `src/data/aegis-sustained.json`: 179 Waffen-Zeilen mit Shots, Magazin-Folge, Zeit bis leer, Reload/Charge/Swap aus den Notizen, Base; zweite Timing-Quelle); Quantum, Reiter Primaries (`398985410`), Specials (`1681969818`), Heavies (`1406577322`) | abgerufen 2026-10-20; Aegis Patch 9.7.0 bis 9.7.0.3, Quantum teils Stand 2024 | Snapshots: `npm run import:weapons` → `src/data/aegis-weapons.json` (417 Zeilen: Treffer, Annahmen, Wipe, Shots, Full Modifiers, visual Value, Patch) und `src/data/quantum-weapons.json` (410 Zeilen: Waffentyp aus der Abschnittsüberschrift, Variante aus Spalte A, Magazin, Munition, rpm, Reload, Time to Empty, Body/Precision; Text wie „inf“ oder „N/A“ bleibt als Text erhalten). CSV-Export funktioniert bei beiden |
| Gesamtprobe (Block 5) | Aegis, Reiter „Sustained“ (gid `1455724279`) und „Swap“ (gid `544204052`), Spalte Total | abgerufen 2026-10-23 | `npm run import:totals` → `src/data/aegis-totals.json` (465 Zeilen: Base, Perk, Surge, Buff, Debuff, Stat 200, Total); Vergleich mit `npm run probe` → `docs/meta-probe.md` |
| Waffen-Pakete (ADR 0013) | erzeugt aus den Snapshots oben | `npm run build:weapons` | `src/data/weapon-packages.json` (Pakete: Wert pro Shot von Aegis, Timing von Quantum, Optionen), `weapon-gaps.json` (Lücken mit Grund), `weapon-codes.json` (Link-Codes, nie neu vergeben), Prüftabelle `docs/weapon-import.md` |
| Perks, Katalysatoren, Exotic-Rüstung (ADR 0013, Punkt 16) | [Clarity](https://www.d2clarity.com), Live-Clarity-Database (`descriptions/clarity.json` auf GitHub, auch Quelle von DIM) | abgerufen 2026-10-20, Datenversion 2.0625 | Snapshot: `npm run import:weapons` → `src/data/clarity.json` (1719 Einträge: Typ wie „Weapon Catalyst Exotic“, Waffe oder Rüstung, Text mit Zahlen). Bedingungen: unter 150 mögliche Nutzer ohne Partnerschaft; Nennung mit Website und [Discord](https://url.d2clarity.com/discord) im Footer und im Wiki; eigene Änderungen kennzeichnen; Kopie aktuell halten |
| Waffen-Texte (ADR 0013) | [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Exotic Weapons“ und „Weapon Perks“ | abgerufen 2026-10-20 | Snapshot: `npm run import:compendium` → `src/data/compendium-weapons.json` (147 Exotics mit Perk-Namen, 392 Perks und Mods mit Dauer und Bedingung) |
| Exotic-Rüstung (ADR 0014) | [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Exotic Armors“ (gid `1500097863`); daraus mit Manifest, Aegis, Court und Clarity erzeugt | abgerufen 2026-10-21 | Snapshot: `npm run import:compendium` → `src/data/compendium-armor.json` (135 Exotics: Klasse, Text, Intrinsic). Arten per Regel: `npm run build:armor` → `src/data/exotic-armor.json`, Prüftabelle `docs/armor-import.md` |
| Buckets, Stacking, Effects | [Court's Stacking Guide](https://destiny2.science/court-sheet) (Google Sheet „Destiny 2 Damage Buffs/Debuffs“, Reiter-gid `2073397587`) | Daten vom 9. Juni 2026, geprüft für 9.7.0.3; vollständig gelesen 2026-10-20 | Kategorien und Stacking-Regeln, PvE-Werte und Dauer von etwa 100 Effects, davon 17 im Modell. CSV-Export gesperrt (401); `htmlview/sheet?gid=…` und gviz funktionieren. Snapshot (ADR 0014): `npm run import:court` → `src/data/court-buffs.json` (125 Einträge: 98 Tabellenzeilen mit Kategorie, Gruppe, Item-Typ, Bedingung, Auslöser, PvE-Wert und Dauer als Text; 27 Exotic-Rüstungen aus der Liste „Exotic Intrinsics“ ohne Werte, die stehen laut Court im Compendium) |
| Buffs, Debuffs, Stacking | [Destiny Data Compendium](https://destiny2.science/data-compendium) | laufend | Werte für Perks, Mods, Subklassen, Spielmechaniken |
| Einzelwerte vom Inhaber (ADR 0014, Punkt 9) | z. B. Reddit r/DestinyTheGame (für den Agenten gesperrt) | im Einzelfall | Nur Werte, die sonst nirgends stehen (z. B. Zeitwerte von Supers), mit URL und Zitat, Status `unverified`; kein Import |
| Energie (Plan Q3) | [Flat Gain Factors](https://destiny2.science/flat-gain-factors) (Engineeeer, Tests von RyTako) und RyTakos Energie-Sheet | Edge of Fate; archiviert 2026-10-25 | Stat-Kurven, Regen-Multiplikatoren, Base Cooldown und Chunk-Faktor je Ability, Super-Schaden und Cast Time/Lock (`docs/sources/sheets/flatgain/`, `rytako/`); noch nicht importiert |
| Effekte mit Zahlen (Pläne Q4–Q7) | [Aegis: Endgame Analysis](https://destiny2.science/endgame-analysis); [Glaive Compendium](https://destiny2.science/glaive-compendium) (Oni Black Mage) | bis 2026-09 bzw. 9.7.0; archiviert 2026-10-25 | Aspects, Fragments, Artifact, Set Bonuses, Exotic Weapons, Legendary-Frames (2.0); Regen- und Buff-Werte. Bei Konflikt gilt Aegis |
| Munition (2.0) | [MossyMax: Reserves and Mag Database](https://destiny2.science/reserves) | Edge of Fate; archiviert 2026-10-25 | Magazin und Reserves je Roll, Exotic-Reserves mit Reserve-Mods |
| Nur Hinweis | [MossyMax: Outgoing Damage Scaling](https://destiny2.science/damage-scaling) | v1.9.2 (Februar 2025, vor Edge of Fate); geprüft 2026-10-20 | Power-Differenz, Faktoren pro Gegnertyp, Waffen- und Scorch-Werte. Laut Autor veraltet („LOTS OF THIS IS PRETTY OUTDATED“). Für uns kaum nützlich: Power-Differenz wirkt auf alle Builds gleich, gegen Bosse sind die Faktoren nahe 1,0, Waffenwerte liefert Quantum aktueller |

## One Thousand Voices bei Quantum Damage-ics

Abgerufen am 2026-10-18, Reiter mit den Heavy-Waffen. Diese Werte stehen in der Data File.

| Wert | Quantum |
| --- | --- |
| Magazin / Shots gesamt | 4 / 11 (Reserve-Mods wirken nicht) |
| Feuerrate | 33 rpm, also 1818 ms pro Shot |
| Reload Time | 1,25 s |
| Schaden pro Shot | 2180 (ohne Ignition, ohne Scorch) |
| Ignition | 890 („Special Ignition“); mit Ignitions 28 430 statt 23 980 Total Damage, also 5 Ignitions in 11 Shots |
| Time to Empty | 20,7 s = 10 × 1,818 s + 2 Reloads × 1,25 s, gemessen ab dem ersten Shot |

Abweichungen zu Aegis: Feuerrate etwa 5 % langsamer (1818 statt 1733 ms). Schaden mit Ignitions im Schnitt 2585 statt 2459 pro Shot.

## Werte für spätere Damage Instances

Diese Werte sind nicht in der Data File, weil die Data File vorerst nur einen Durchschnittswert pro Shot führt.

| Wert | Quelle |
| --- | --- |
| Explosion 0,75 s nach dem Beam | [destinygamewiki](https://d2.destinygamewiki.com/wiki/Unforeseen_Repercussions), unverified |
| Taken Seeker (Katalysator): 22 Ticks, alle 0,25 s, max. 5 pro Ziel; +100 % Tick-Schaden auf Blighted Targets | Clarity via [light.gg](https://www.light.gg/db/items/2069224589/one-thousand-voices/), verified |
| Stichprobe: Beam-Tick 10, Explosion-Tick 129, Burn-Tick 16 | eigene Messung, siehe Messprotokoll |

## One Thousand Voices bei Aegis

Abgerufen am 2026-10-18. Nur zur Gegenprüfung; alle Zeilen setzen Particle Reconstruction voraus.

| Wert | Aegis |
| --- | --- |
| Grundschaden pro Shot (Durchschnitt) | 2459 |
| mit Ember of Ashes / mit Katalysator / beides | 2885 / 3372 / 3765 |
| Einzelwerte | 639 pro Shot, 50 Impact, 2814 Ignition; Katalysator: 25 pro Seeker-Tick (50 auf Blighted Targets), 192 Missile |
| Shots gesamt | 11 |
| Charge Time | 1000 ms |
| peak Rate / TtE | 1,733 s / 18,33 s |
| Distribution | 11 (keine Reloads) |
| Annahme in allen Zeilen | Particle Reconstruction (Artefakt-Perk) |
| Multiplier (Spalten Surge, Buff, Debuff, 200) | 1,22 / 1,35 / 1,30 / 1,10 |

## Aufbau der Aegis-Tabelle, Reiter „Weapons“

Hinweis (2026-10-20): Der Reiter „Weapons“ hat heute die Spalten crit, body, other, Modifiers, Boss, Wipe, #, Full Modifiers und visual Value (= Wipe ÷ # ÷ Full Modifiers). Die Spalten unten (peak Rate, TtE, Base …) stehen im Reiter „Sustained“. Dort übernimmt Base den visual Value aus „Weapons“. Wipe ist eine Messung über ein Magazin; aus ihr lassen sich Ignitions zurückrechnen (siehe `docs/mechanics/scorch-and-ignition.md`).

Die Bedeutung der Spalten ist aus den Zahlen abgeleitet und an One Thousand Voices, Sleeper Simulant, The Queenbreaker, Euphony und Gjallarhorn nachgerechnet.

| Spalte | Bedeutung |
| --- | --- |
| Name | Waffe, nach „/“ die Annahmen (Perks, Artefakt, Katalysator) |
| # | Shots gesamt (Magazin plus Reserves) |
| Notes | Charge Time und Reload Time, z. B. „750ms charge / 2050ms reload“ |
| Distribution | Shots pro Magazin, z. B. „4-4-4-4“; zwischen zwei Gruppen liegt ein Reload |
| peak Rate | Abstand zwischen zwei Shots im selben Magazin, in Sekunden |
| TtE | Time to Empty: Zeit bis zum letzten Shot, in Sekunden |
| Base | Grundschaden pro Shot ohne Multiplier, Durchschnitt über alle Shots |
| Perk, Surge, Buff, Debuff, 200 | Multiplier; „200“ ist der Weapons-Stat 200 |
| Single | Base × alle Multiplier |
| Total / DPS | Single × # / Total ÷ TtE |

Zeitformel: TtE = Charge Time + (Abstände im Magazin) × peak Rate + (Anzahl Reloads) × Reload Time.
Beispiel Sleeper Simulant: 0,75 + 12 × 1,3 + 3 × 2,05 = 22,5 s.

Folgerungen für One Thousand Voices:

- Zwischen zwei Shots liegen 1,733 s, nicht nur die Charge Time von 1 s. Die Differenz von 0,733 s ist vermutlich die Strahldauer.
- Aegis rechnet mit Particle Reconstruction. Dieser Artefakt-Perk füllt das Magazin aus den Reserves auf. Deshalb gibt es keine Reloads und keine Reload Time.
- Base ist ein Durchschnitt pro Shot inklusive Ignitions. Ohne Ignitions liegt der Wert etwa 24 % niedriger (Zeile „no ignitions“: 2875 statt 3765).
- Die Spalte „Boss“ im Reiter „Visual“ hat die Werte „C“ und „S“. Die Bedeutung ist nicht geklärt.

## Wichtige Erkenntnisse

- **Name:** Die Waffe heißt „One Thousand Voices", Community-Kurzform „1K Voices".
- **Damage Instances:** Ein Shot erzeugt Beam, Explosion und Burn (Scorch-Ticks). Hat das Ziel genug Scorch Stacks, folgt eine Ignition. Mit Katalysator kommen Taken Seeker dazu.
- **Katalysator:** Der Katalysator kam mit Monument of Triumph (9.7.0) ins Spiel. Ein Community-Test zeigt etwa 40 % mehr Total Damage mit Katalysator ([blueberries.gg](https://www.blueberries.gg/weapons/one-thousand-voices-exotic-catalyst/)).
- **Schießstand:** Seit 9.7.0 hat der Schießstand statische Ziele, die Schaden wie ein Boss skalieren ([Patch Notes 9.7.0](https://shatteredvault.com/destiny-2-update-9-7-0/)).
- **Spielstand nicht vollständig eingefroren:** Bungie liefert weiter Wartungs-Patches, zuletzt 9.7.0.5 am 7. Oktober 2026 ([Patch Notes 9.7.0.5](https://shatteredvault.com/destiny-2-update-9-7-0-5/)). Deshalb trägt jede Weapon das Feld `gameVersion`.

## Abilities: Teile gegen Aegis (ADR 0009)

Eine Ability bekommt Teile aus dem Compendium nur, wenn sie das Gate gegen Aegis besteht (±15 % bei Stat 100 und 200, `tests/abilityGate.test.ts`; Ergebnis je Ability in `docs/ability-import.md`; die Tabelle unten ist der Stand von 2026-10-19). Sonst gilt das Paket: der Wert pro Einsatz aus `aegis-abilities.json`, aufgeteilt in einen Anteil, der mit dem Ability Stat skaliert, und einen festen Anteil, sodass beide Aegis-Messpunkte getroffen werden.

| Ability | Teile laut Compendium | Summe | Aegis visual Value | Ergebnis |
| --- | --- | --- | --- | --- |
| Twilight Arsenal | – | – | 9738 | Paket aus der Zeile „includes Tractor“: Aegis hat Tractor Cannon herausgerechnet (Full Modifiers ×2,99 statt ×2,30), deshalb `unverified`, aber normiert. |
| Thundercrash | Impact 180, Explosion 8260, Aftershock 108 pro Sekunde für 4 s | 8872 | 10 136 | −12,5 %: Paket. Impact und Explosion stimmen genau mit den Aegis-Ticks überein (415 = 180 × 2,30, 18 997 = 8260 × 2,30). Die Aegis-Zeilen ergeben aber 16 bis 25 Aftershock-Ticks statt 4; die Anzahl ist nicht belegbar. |

## Prüfwerte

- `src/data/reference-values.json`: Total Damage aus den Quellen. Werte mit `scenario` prüft der Gate-Test automatisch.
- `src/data/reference-multipliers.json`: kombinierte Multiplier aus den Quellen, z. B. die Standard-Annahmen von Aegis (×2,355).
- `src/data/reference-factors.json`: gemessene Faktoren „mit / ohne“ eines Effects an derselben Waffe, z. B. Ember of Ashes ×1,173 laut Aegis. Gate für Waffen-Effects mit ±3 % (ADR 0011, `tests/weaponEffectGate.test.ts`). Stand 2026-10-20 mit Particle Reconstruction: Modell Ember ×1,188, Katalysator ×1,392, Katalysator mit Ember ×1,330; alle drei bestehen.

## Messprotokoll (Stichproben)

Ablauf der geplanten Tests: [Messprotokolle für Ingame-Tests](guides/measurements.md).

| Datum | Spielversion | Bedingungen | Ergebnis |
| --- | --- | --- | --- |
| 2026-10-18 | nicht notiert | Schießstand, Dummy „Carl“; kein Artefakt, keine Aspects und Fragments, kein Surge; Weapons-Stat 130 (+2,9 % Heavy-Schaden PvE); Katalysator-Status nicht notiert | Ein Shot: 1408 Total Damage. Beam-Tick 10, Explosion-Tick 129, Burn-Tick 16. Ein Magazin: 6263 Total Damage, DPS-Anzeige 887. |
| 2026-10-20 | nicht notiert | Test 1 (`docs/guides/measurements.md`): Schießstand, Carl, One Thousand Voices ohne Katalysator, Particle Reconstruction an | Ignitions in 4 Shots: ohne Ember of Ashes 2 von 4, mit Ember 4 von 4. Bestätigt Aegis und das Gate. |
| 2026-10-20 | nicht notiert | Test 2: ein Shot, Aufnahme 60 fps | Explosionen kommen **gestaffelt**, nicht gleichzeitig. Abstand in Frames nicht notiert. |
| 2026-10-20 | nicht notiert | Test 3: Abstand zwischen Beam-Starts | „1:45“ (Einheit unklar: 1,45 s oder 1 s 45 Frames = 1,75 s); mit oder ohne Particle Reconstruction nicht notiert. Rückfrage offen. |
| 2026-10-20 | nicht notiert | Test 4: Ignition mit ÷ ohne Particle Reconstruction, ohne Ember | 1,27. Der Debuff wirkt auf Ignitions (erwartet 1,276). |
| 2026-10-20 | nicht notiert | Test 5: Golden Gun, Körpertreffer mit ÷ ohne Radiant | 1,20. Radiant wirkt auf Golden Gun. |

Die Stichprobe liegt etwa um den Faktor 1,6 unter Aegis. Das ist nach ADR 0005 akzeptiert, weil nur relative Unterschiede zählen.
