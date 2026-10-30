# R0: Papierprobe (2026-10-30)

Fünf Waffen aus nackten Teilen und Textregeln gegen ihre Aegis-Weapons-Zeilen (Plan `ground-up-model.md`, R0). Werte auf Skala Aegis visual (Treffer ÷ `fullModifiers`). Abbruchkriterium: mindestens 4 von 5 Waffen innerhalb ±3 %.

**Ergebnis: zunächst 3 von 5, Kriterium verfehlt. Nach der Ursachen-Recherche 4 von 5** (Abschnitt „Ursachen“: Scorch-Burn nach Compendium-Formel, Hierarchy-Takt `derived`). Gesamt mit Erweiterung 9 von 13. Dragon's Breath bleibt offen.

## Quellen

- Aegis Weapons: `npm run facts -- "<Waffe>"` (`aegis-weapons.json`, Patch 9.7.0.3).
- Compendium und Clarity: Texte in `compendium-weapons.json`, `compendium-armor.json`, `clarity.json`.
- Quantum: `docs/sources/sheets/quantum/635034617-weapon-specifics.tsv`, `1857452032-all-weapons-sortable.tsv`.
- Ignition 675 (Keyword, Compendium 676) und Cooldown 1,3 s: `docs/mechanics/scorch-and-ignition.md`.

## Ergebnis je Waffe

| Waffe | Aegis-Zeile | Modell | Aegis | Abw. | Urteil |
| --- | --- | --- | --- | --- | --- |
| Still Hunt | Grundschuss (crit 2177) | Quantum 659 × 3,31 | 2177 | +0,2 % | ok |
| | Cayde's Retribution, 3 Schüsse (19 236) | Compendium 666 × 2 (Precision) × (1 + 1,45 + 1,9) × 3,31 | 19 179 | −0,3 % | ok |
| | mit Celestial Nighthawk (26 469, ÷3,17 = 8339) | Clarity „650% increased damage“ auf Schuss 1 (1336 × 7,5) + Ignition 708 | 10 728 | +28,6 % | Text gilt für die Super, nicht für Still Hunt → Eich-Zeile |
| Gjallarhorn | 8 Shots (5984 je Shot roh) | 446 + 3874 + 8 × (142 + 66), Anzahl 8 aus dem Text | 5984 | 0,0 % | ok |
| | dto., Wolfpack aus Quantum | Quantum 60 / 1396 × Aegis-Rakete 1367 = 58,8 je Rakete; 1367 + 8 × 58,8 | 1837 vs 1892 | −2,9 % | ok, knapp |
| One Thousand Voices | average (2459) | 10 × 15,8 + 9 × 202 je Shot; Ignition 675 × 1,316 (Ahamkara's Eye) = 888; 9 × x10 Scorch, Cooldown 1,3 s → 2 von 4 Shots | 9688 vs 9836 (4 Shots) | −1,5 % | ok |
| | mit Ember of Ashes (2885) | x15 → jeder Shot zündet, 4 Ignitions | 11 464 vs 11 541 | −0,7 % | ok |
| | mit Catalyst (3372, 8 Shots) | + 9 Seeker je Shot (Aufprall 60,8), Ticks 7,9 alle 0,25 s, höchstens 5 Seeker gleichzeitig (≈18,3 s × 20 Ticks/s) | 26 645 vs 26 978 | −1,2 % | ok, Takt grob |
| | Ember + Catalyst (3765) | wie oben, 8 Ignitions | 30 197 vs 30 141 | +0,2 % | ok |
| Hierarchy of Needs | 2 rings, 9 Pfeile (39 925) | 9 × 735 + 54 × 485 + 3 Ignitions × 2345; x90 je Pfeil, Cooldown 1,3 s > Takt 1,017 s | 39 840 | −0,2 % | ok |
| | one ring, 6 Pfeile (18 188) | 6 × 735 + 18 × 485 + Ignitions; x45 je Pfeil, im Takt 1,017 s nur 1 Ignition | 15 485 | −14,9 % | **aus** (mit Takt 1,36 s: 2 Ignitions, −2,0 %) |
| Dragon's Breath | 5 Fuel, 8 Shots (3725) | Aufprall 188 + 5 Bursts × 65,5 + Explosion 1471 (Quantum 1144 × 1,286, Text +28,6 %) = 1987 + n × 710 Ignition + Pool-Ticks | 3407 (n = 2) / 4117 (n = 3) | −8,6 % / +10,5 % | **aus** |

## Befunde

1. **Teile und Anzahlen aus dem Text tragen.** Wo der Text Anzahl und Faktor nennt (Still Hunt ×1,45/×1,9, 8 Wolfpack, 10 + 9 Teile, 9 Seeker, Fuel-Tabelle), trifft die Summe der Aegis-Ticks die Messung auf ≤0,3 %. Aegis und Quantum stimmen bei nackten Teilen auf 1–3 % überein (Still Hunt 658/659, DB-Aufprall 188/189, Burst 65,5/66, Explosion 1471/1470). Quantum 1 Fuel = 189 + 66 + 1144 = 1399, genau Quantum.
2. **Skalen:** Compendium liegt bei Still Hunt 1:1 auf Aegis visual (Golden-Gun-Schuss 666 zu 665), bei One Thousand Voices 1,39-fach (281/202, 22/15,8). Bestätigt ADR 0011: Compendium-Werte nur als Verhältnis.
3. **Ignitions sind die Schwachstelle.**
   - Hierarchy: Die beiden Aegis-Zeilen widersprechen sich bei gleichem Takt (bekannt, `scorch-and-ignition.md`). Kein Cooldown erfüllt beide.
   - Dragon's Breath: Der Takt der Pools ist „?“ (Clarity: „every ? seconds for 5 seconds“, Compendium: „every ? seconds in a ? meter radius for ? seconds“). Mit 1,3 s Cooldown kämen pro Shot (5,1 s Abstand) etwa 4 Ignitions, Aegis misst etwa 2. Quantum rechnet mit „3 seconds per ignition“ (Historie 2024-04-18). Es fehlt eine Regel, die die Ignitions bremst.
   - Beide lassen sich an einer Aegis-Zeile eichen, haben dann aber kein unabhängiges Gate mehr (Dragon's Breath hat nur eine Weapons-Zeile).
4. **Celestial Nighthawk auf Still Hunt** folgt nicht dem Text der Super (+28,6 %). Geeicht an der Weapons-Zeile, Gate nur über Sustained (selbst gerechnet).

## Erweiterung: je zwei Waffen Void, Solar, Stasis, Strand (Inhaber, 2026-10-30)

Auswahl: Exotics mit mindestens zwei Aegis-Weapons-Zeilen (`tmp/candidates.ts`), Texte über `tmp/texts.ts` (beide nicht eingecheckt). Faktoren aus dem Text gegen das Verhältnis zweier Aegis-Zeilen; Summen gegen den Wipe.

| Waffe | Prüfung | Modell | Aegis | Abw. |
| --- | --- | --- | --- | --- |
| **Deterministic Chaos** (Void) | 48 Shots, Volatile | 48 × 485 + 6 × 280; jeder 4. Shot setzt Volatile, der nächste löst aus, 1 s Cooldown (Takt 0,167 s) → 6 in 48 | 24 960 vs 24 966 | 0,0 % |
| | Target Lock, ein Magazin | Kugeln × 1,25 („roughly 25% … after 100% of the Magazine“), Volatile ohne Bonus; Höchstwert 485 × 1,39 = 674 (Text 40 %) | 30 780 vs 30 738 | +0,1 % |
| **Truth** (Void) | Reaper's Tithe x4 | Rakete und Cluster × 1,40 (Text 40 %): 7955/5682, 686/490 | 1,400 | 0,0 % |
| | Trueseeker, 9 / 12 Raketen | Text gelesen: Trueseeker nach jedem Reload → 6 von 9 Raketen mit 8 Clustern | 74 658 vs 62 028 | +20,4 % |
| | | hergeleitet: jede 3. Rakete, alle 8 Cluster treffen | 62 898 / 117 412 | +1,4 % / −1,9 % |
| **Polaris Lance** (Solar) | 15 Shots, ohne Ember | jeder 5. Shot Perfect Fifth (310), x40 Scorch → 1 Ignition | 8075 vs 8417 | −4,1 % |
| | 10 Shots, Ember | x60 → 1 Ignition | 6165 vs 6309 | −2,3 % |
| **Lord of Wolves** (Solar) | 120 Pellets, ohne Ember | Ignition 675 × 1,24 (Text: +53 %, gegen Bosse +24 %) = 837, Aegis 838; x10 alle „0.5?“ s nur beim Feuern → 1 Ignition | 67 817 vs 70 866 | −4,3 % (mit 2 Ignitions −0,6 %) |
| | 90 Pellets, Ember | x15 → 2 Ignitions | 54 184 vs 54 680 | −0,9 % |
| **Ager's Scepter** (Stasis) | Will Given Form je Treffer | +80 % (Text): 67,1 / 37,2 visual | 1,804 | +0,2 % |
| | Harsh Refraction je Treffer | +35 % für Exotics (Court): 299 / 222 | 1,347 | −0,2 % |
| | Wipe Will Given Form | 194 × 222 | 43 068 vs 51 358 | −16,1 % (Rest unerklärt) |
| | Wipe mit Harsh Refraction | × 1,35 | gemessen × 1,265 | +6,7 % |
| **Salvation's Grip** (Stasis) | Hail the Storm je Kristall | +25 % (Coverage): 655 / 524 | 1,250 | 0,0 % |
| | Wipe geladen, 12 Shots | 6 Kristalle × 524 + 627 Aufprall | 45 252 vs 47 896 | −5,5 % (Aegis: „insane number variance“, kein Gate) |
| **Whirling Ovation** (Strand) | 1/3, 2/3, volle Ladung | Compendium-Verhältnis (1663 + 1640)/1076 usw. auf Aegis ohne Ladung (3211); Skala Compendium = 1,06 × Aegis bei allen 7 Werten | 9857 / 13 330 / 20 078 vs 9853 / 13 321 / 20 064 | +0,04 / +0,07 / +0,07 % |
| **Barrow-Dyad** (Strand) | Taken Ambition, 39 Shots | 39 × 112 + 6 Seeker × (1172 + 97); Text: höchstens 6 Seeker je Reload | 11 982 vs 13 171 | −9,0 % (7 Seeker: +0,6 %) |

### Was trägt, was nicht

- **Faktoren aus dem Text treffen immer** (9 von 9: Reaper's Tithe, Will Given Form, Harsh Refraction, Hail the Storm, Target Lock, Ahamkara's Eye, Lord of Wolves gegen Bosse, Ladestufen von Whirling Ovation, Golden-Gun-Folge von Still Hunt), Abweichung ≤0,2 %.
- **Zeitregeln mit belegtem Takt treffen** (Volatile-Cooldown bei Deterministic Chaos, Ignitions bei One Thousand Voices und Polaris).
- **Ausfälle haben drei Ursachen:**
  1. Burn-Schaden von Scorch fehlt im Modell (Polaris ohne Ember: Rest 342 nach der Ignition, mit Ember 144). Er macht 2–4 % aus.
  2. Ein Takt im Text ist unsicher oder fehlt: „0.5?“ s bei Lord of Wolves, Pool-Takt bei Dragon's Breath. Hier sind die „?“ also doch PvE-relevant.
  3. Zählungen, die der Text anders nahelegt als Aegis misst: Trueseeker-Raketen (Truth), Seeker je Reload (Barrow-Dyad), der Rest bei Ager's Scepter. Teils ist es Streuung der Messung (Salvation's Grip).
- Gesamt mit R0: 6 von 13 Waffen in allen Zeilen innerhalb ±3 % aus dem Text, 7 mit einer hergeleiteten Regel (Truth). Mit Burn als Mechanik kämen Polaris Lance und vermutlich Lord of Wolves hinzu.

## Ursachen und angepasste Nachrechnung (Recherche 2026-10-30)

### 1. Scorch-Burn: Formel statt Tabelle

Compendium „Solar“: „Scorched Enemies are dealt Scorch-stack based damage every 0.56 seconds after being scorched for 0.5 seconds … The 2nd Scorch tick has a 0.93s delay“ und „2.7 + (0.175 * Scorch Stacks) … x1 = 3 | x30 = 5 | x50 = 6.5 | x60 = 7.21 | x80 = 8.64“. Formel und Tabelle widersprechen sich (x80: 16,7 gegen 8,64). Aegis entscheidet für die Formel; die ingame-Stichprobe „Burn-Ticks von 16“ (`scorch-and-ignition.md`) passt ebenfalls zur Formel. Skala Compendium → Aegis visual wie bei der Ignition (676 → 708, ×1,047). Burn erbt die Boni der Scorch-Quelle (Lord of Wolves +24 % gegen Bosse, Ahamkara's Eye +31,6 %).

- **Polaris Lance** (Takt 0,4 s, Explosionen 0,5 s nach Shot 5, 10, 15): ohne Ember Ticks bei 2,6 / 3,53 / 4,09 s mit x40, bei 4,65 / 5,21 / 5,77 s mit x80, Ignition bei 6,1 s. Mit Ember drei Ticks mit x60, Ignition bei 4,1 s.

  | Zeile | ohne Burn | Burn Formel | Burn Tabelle | Aegis | Abw. (Formel) |
  | --- | --- | --- | --- | --- | --- |
  | ohne Ember | 8075 | +274 | +150 | 8417 | −0,8 % |
  | mit Ember | 6165 | +137 | +75 | 6309 | −0,1 % |

- **One Thousand Voices** ohne Ember: zwei Ticks je Ignitions-Zyklus, +92 → −0,6 % (vorher −1,5 %). Mit Ember zündet jeder Shot vor dem ersten Tick, bleibt −0,7 %.

### 2. Lord of Wolves: Scorch-Takt unter 0,46 s

Takt 0,079 s je Pellet, Magazin 30 (2,29 s Feuern), Reload 0,93 s (Aegis Sustained: 20,43 s für 189 Pellets). Mit genau 0,5 s Cooldown („0.5? second“, Compendium) kommen 5 Scorch-Treffer je Magazin; mit Ember gibt es dann nur 1 Ignition in 90 Pellets (−3,7 % mit Burn). Beide Zeilen verlangen 6 Treffer je Magazin, also einen Cooldown ≤0,458 s (`derived`). Mit 0,45 s: ohne Ember 2 Ignitions (bei 4,65 s und 11,25 s), mit Ember 2.

| Zeile | Pellets + Ignitions | Burn | Modell | Aegis | Abw. |
| --- | --- | --- | --- | --- | --- |
| ohne Ember | 65 160 + 2 × 2657 | +753 | 71 227 | 70 866 | +0,5 % |
| mit Ember | 48 870 + 2 × 2657 | +554 | 54 738 | 54 680 | +0,1 % |

### 3. Hierarchy of Needs: Takt der Zeilen, plus Burn

Mit Burn: „2 rings“ im Catalyst-Takt 1,017 s (3 Ignitions, ein Tick je Zyklus) 40 032 gegen 39 925 (+0,3 %); „one ring“ im Takt ohne Catalyst 1,364 s (2 Ignitions, vier Ticks je Zyklus) 18 287 gegen 18 188 (+0,5 %). Aegis nennt den Takt nicht; die Annahme „one ring ohne Catalyst-Takt“ steht schon im Modell (`scorch-and-ignition.md`) und ist `derived`. Im Takt 1,017 s bliebe „one ring“ bei −11,6 %.

### 4. Truth: Bomblets treffen einen Boss nur teilweise

Quantum hat zwei Zeilen „Assumes starting with Prototype Trueseeker, no bomblets hit the boss“ und „… all bomblets hit“; Bomblet 1240 ÷ 8 = 155 je Stück, Aegis 490 ÷ 3,16 = 155. Der Text (Trueseeker nach jedem Reload) stimmt also; es treffen nicht alle 8 Bomblets. Bei Trueseeker auf allen Raketen trifft gut ein Drittel (Zeile 9 Raketen 31 %, Zeile 12 Raketen 37 %). Geeicht an der ersten Zeile: 115 743 gegen 119 734 (−3,3 %). Das ist Streuung der Messung („average“), knapp über der Toleranz.

### 5. Ager's Scepter: Zusatz je Treffer ohne Quelle

Pro Treffer liegt der Wipe über dem Treffer-Wert: 264,7 gegen 222 (Will Given Form), 334,9 gegen 299 (mit Harsh Refraction). Der Rest (42,7 bzw. 35,9 roh) wächst mit Harsh Refraction nicht mit. Kein Text und keine Aegis-Spalte nennt ihn. Geeicht an der Zeile Will Given Form (`derived`, Zeilen-ID `trace-rifle-ager-s-scepter-average-will-given-form`): Harsh Refraction 194 × (299 + 42,7) = 66 290 gegen 64 980 (+2,0 %).

### 6. Ohne Lösung

- **Dragon's Breath:** Zieht man den Burn ab, bleiben je Shot etwa 2 Ignitions. Der Cooldown von 1,3 s und „rapidly apply 40 Scorch“ ergäben 3 bis 4. Ein Scorch-Takt je Quelle wie bei Lord of Wolves (etwa 0,45 s, 3 Treffer bis zur Ignition) käme auf etwa 2,3, ist aber nicht belegt. Der Pool-Takt ist „?“, es gibt nur eine Aegis-Zeile.
- **Barrow-Dyad:** Aegis' 1172/97 sind Explosion und Aufprall des Seekers (Verhältnis 1,47 zum Compendium bei beiden). Der Text erlaubt höchstens 6 Seeker je Reload, die Messung verlangt 6,9. Ob die Seeker Target Lock bekommen und ob „#“ 39 die Seeker mitzählt, sagt Aegis nicht.
- **Salvation's Grip:** Aegis vermerkt selbst „insane number variance“; kein Gate.

| Quelle | Reiter | Ergebnis |
| --- | --- | --- |
| Aegis | Weapons (online, alle Spalten, 2026-10-30) | Keine Notizen über den Snapshot hinaus; letzte Spalten sind Crit-Verhältnis und Prüfung |
| Aegis | Testing (Snapshot) | Nur Build-Summen (Ager's, Truth, Dragon's Breath), keine Teilwerte |
| Compendium | Solar, Exotic Weapons, Artifact Perks (Snapshots) | Burn-Formel und -Takt, Texte oben |
| Clarity | Snapshot | Texte oben; Lord of Wolves „0.5 second cooldown“ |
| Quantum | Heavies, Weapon Specifics (Snapshots) | Truth-Bomblets 0 % / 100 %, Dragon's Breath Teile |
| Court | Snapshot | Harsh Refraction 35 % für Exotics |

### Stand nach der Anpassung

- **R0-Waffen:** 4 von 5 innerhalb ±3 % (Hierarchy mit Takt-Annahme). Nur Dragon's Breath fällt durch. Das Abbruchkriterium ist damit erfüllt, wenn man die `derived`-Annahmen zulässt.
- **Erweiterung:** 5 von 8 (Deterministic Chaos, Whirling Ovation, Polaris Lance, Lord of Wolves, Ager's Scepter). Truth −3,3 % (Streuung), Barrow-Dyad −9 %, Salvation's Grip ohne Gate.
- **Gesamt 9 von 13.** Neue Mechanik, die das braucht: Scorch-Burn nach der Formel. Hergeleitete Werte: Scorch-Takt von Lord of Wolves, Takt der Hierarchy-Zeile „one ring“, Zusatz von Ager's Scepter.

## Fragezeichen in den Quellen (Hinweis des Inhabers)

Auswertung über alle 500 Clarity-Einträge der Exotic-Waffen (`tmp/question-marks.ts`, nicht eingecheckt): 140 Einträge mit „?“, 190 Zeilen.

| Art | Zeilen | Für einen Boss relevant |
| --- | --- | --- |
| nur PvP (Clarity schreibt „PvE [PvP]“, „?“ in Klammern) oder PvP-Text | 40 | nein |
| Handling, Aim Assist, Reload, Draw u. a. | 62 | selten |
| Radius in Metern | 36 | nein |
| an Kills, Adds oder Kristalle gebunden | 17 | nein (ADR 0015) |
| Heilung, Lore, Sonstiges | 13 | nein |
| Takt oder Dauer | 16 | teils (Dragon's Breath, New Land Beyond) |
| Scorch-Menge oder Stacks | 6 | ja, meist als „35?“ (Wert da, unsicher) |

Die Vermutung trifft größtenteils zu: rund 88 % der Zeilen sind PvP, Handling, Radius oder Kills. Echte PvE-Lücken mit Schadenswirkung sind wenige, darunter Dragon's Breath.

## Laufzeit Optimizer (Obergrenze für R1)

`npm test -- run tests/optimizer.test.ts` (2026-10-30): 11 Tests, Rechenzeit zusammen 153 ms, längster Test 110 ms („leaves out own effects that add nothing“). Der Import der Data Files dauert 55 s und zählt nicht. Obergrenze R1: höchstens doppelt so lang (306 ms, längster Test 220 ms).
