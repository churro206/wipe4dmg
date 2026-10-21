# Vorbilder für die Oberfläche

Stand: 2026-10-21. Woran sich die Oberfläche orientiert. Grundsatz: **Destiny 2 selbst ist das erste Vorbild.**
Spieler kennen die Menüs des Spiels, deshalb folgen Reihenfolge, Begriffe und Icons dem Spiel (siehe U3, `src/ui/effectSections.ts`).

## Andere Tools

Gute Destiny-Rechner für Builds gibt es nicht (Stand der Suche: Oktober 2026; nur SEO-Seiten mit unbelegten Werten).
Die Community rechnet mit Tabellen (Aegis, Court, Quantum). Vorbilder kommen deshalb aus anderen Spielen.

| Vorbild | Spiel | Was wir übernehmen | Stand |
| --- | --- | --- | --- |
| [gcsim](https://github.com/genshinsim/gcsim) | Genshin Impact | Simulator auf einer Zeitachse, Ergebnis in Reitern, jede Damage Instance einzeln | Reiter ✅ |
| Raidbots / SimulationCraft | World of Warcraft | „Top Gear“: Rangliste mit Abstand zum aktuellen Build, Schaden pro Fähigkeit | Optimizer ✅, Donut ✅ |
| Warcraft Logs | World of Warcraft | Zeitleiste mit Laufzeiten der Buffs, Schaden über die Zeit | Rotation ✅ |
| Path of Building | Path of Exile | Build als Link, Kennzahlen bleiben sichtbar, Vergleich mit Differenz | ✅ |
| DIM, Loadout Optimizer | Destiny 2 | Icon-Kacheln, Filter, Hover-Karten | ✅ |

## Ideen aus Destiny 2

| Idee | Vorbild im Spiel | Wann |
| --- | --- | --- |
| Hover-Karte wie die Item-Ansicht: farbiger Kopf (Exotic gold, Legendary lila), Element-Icon, Perk-Text | Item-Inspektion | U5 |
| Element-Farben als Akzent (Solar, Arc, Void, Stasis, Strand) nach Waffe oder Subklasse | Subklassen und Waffen | U5 |
| Menü-Optik: dunkle, leicht durchsichtige Flächen, dünne helle Rahmen, Überschriften in Großbuchstaben mit Sperrung | Director, Inventar | U5 |
| Subklassen-Bildschirm: Super als Raute in der Mitte, Grenade, Melee und Class Ability daneben, Aspects und Fragments als Slot-Reihen | Subklassen-Menü | mit E0 |
| Charakter-Bildschirm: Waffe links, Rüstung mit Exotic rechts | Charakter-Menü | mit E0 |

## Logo

Schädel aus dem Todesbildschirm des Spiels („Your Light Fades Away“), vom Inhaber geliefert (2026-10-21).
Er ist kein Icon im Bungie-Manifest (gesucht in allen Tabellen, Modifiern, Triumphs und Stat-Icons), deshalb liegt er als Datei vor:
`public/logo.png` (96 px) ist der weiße Schädel auf durchsichtigem Grund (Schwarz herausgerechnet, sonst unverändert).
Im hellen Modus wird er per CSS umgekehrt (schwarzer Schädel, Wahl des Inhabers). `public/favicon-32.png` hat einen dunklen Umriss, damit er in hellen und dunklen Browser-Tabs sichtbar ist. `public/apple-touch-icon.png` (180 px) füllen iPhones schwarz.
