# R0: Papierprobe (2026-10-30)

Fünf Waffen aus nackten Teilen und Textregeln gegen ihre Aegis-Weapons-Zeilen (Plan `ground-up-model.md`, R0). Werte auf Skala Aegis visual (Treffer ÷ `fullModifiers`). Abbruchkriterium: mindestens 4 von 5 Waffen innerhalb ±3 %.

**Ergebnis: 3 von 5. Das Kriterium ist verfehlt.** Beide Ausfälle hängen am Ignition-Takt (Scorch bis Ignition), nicht am Formelweg. Gegenrechnung mit nackten Teilen und Anzahlen aus dem Text stimmt sonst auf ≤3 %.

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
