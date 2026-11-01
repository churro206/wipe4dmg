# Produktziel

Stand 2026-10-25, Interview mit dem Inhaber. Neue Mechaniken nur, wenn sie eine Top-Frage betreffen oder das Rangfolge-Gate verbessern.

## Zielgruppe

Inhaber und erfahrene Freunde: kennen Aegis und Buckets, wollen Zahlen, kein Onboarding. Anlass: vor einem Raid oder Dungeon den Build festlegen, sonst Theorycrafting.

## Genauigkeit

Abstände zählen, absolute Zahlen nicht: unter gleichen Annahmen stimmen Rangfolge und Verhältnisse mit Aegis. Ein Spieler, ein generischer Boss, Phase 10/30/60 s wählbar, Buffs von Teammates als Schalter.

## Top-20-Fragen

Priorität: Optimizer zuerst (braucht alle Kategorien vollständig).

| # | Frage | Prüft |
| ---: | --- | --- |
| 1 | Bester Build für meine Klasse bei Phase N s? | Gate alle |
| 2 | Bester Build mit Exotic X fest (Waffe oder Armor)? | Gate alle |
| 3 | Bester Build für Super Y? | Supers |
| 4 | Bester Build unter Well/Weaken/Radiant vom Team? | Gate alle |
| 5 | Bester Build mit dem aktuellen Artifact? | Gate alle |
| 6 | Welcher Super bei 10, 30, 60 s? | Supers |
| 7 | Beste Heavy zu meinem Build? | Heavy |
| 8 | Beste Special zu meiner Heavy? | Special |
| 9 | Legendary oder Exotic Rocket hier? | Heavy |
| 10 | Welche Perks auf Legendary Frame X? | Heavy, Special |
| 11 | Bestes Exotic Armor zu Waffe und Subclass? | Gate alle |
| 12 | Welche zwei Perks auf dem Exotic Class Item? | Gate alle |
| 13 | Welche Grenade und Melee in dieser Rotation? | Abilities |
| 14 | Was bringt Aspect oder Fragment X (%)? | Delta |
| 15 | Was bringt Artifact-Perk X? | Delta |
| 16 | Was bringt der Catalyst? | Delta |
| 17 | Was bringen Surge x3 statt x2, Super-Stat 200 statt 100? | Delta |
| 18 | Woher kommt der Schaden (Super, Abilities, Waffen)? | Gate alle |
| 19 | Wie viel verliere ich ohne Buff X vom Team? | Delta |
| 20 | Lohnt „Vorher aufgebaut“ beim Exotic? | Delta |

## Nicht-Ziele

PvP, Adds und Clear; Armor-Stats- und Tuning-Optimizer (Stats gibt der Spieler vor); konkrete Bosse und Encounter; ganzes Fireteam als Summe; Swap-Option im Optimizer (er optimiert die gewählte Phasenlänge); absolute Zahlen.

## Abnahme 2.0

1. Rangfolge-Gate grün.
2. Der Optimizer probiert auch Super, Grenade, Melee, Aspects, Fragments und Legendary-Waffen.
3. Alle Kategorien vollständig: Exotics, Legendary Frames, Supers, Abilities ohne `missing`; jede Aegis-Zeile in Sustained und Swap ist im Modell oder mit Grund aus den Nicht-Zielen übersprungen.

## Rangfolge-Gate (Vorschlag)

Baut auf dem Prüfstand auf (`tests/scenarioBench.test.ts`, Stand in `tests/__snapshots__/scenario-bench.md`, Bauplan 12): ganze Builds aus den Aegis-Reitern Sustained und Swap, Szenarien aus Weapons und Abilities. Die geprüften Aegis-Zeilen (nicht `fitted`, Weapons und Abilities mit Los) in Gruppen (Weapons, Supers, Heavy, Special, Abilities; Spalte „Prüft“); pro Gruppe ab 5 Zeilen. Die Schwellen erzwingt der Test für Supers, Heavy und Special; Weapons und Abilities melden, bis der Inhaber ihre Zahlen bestätigt hat:

- Spearman zwischen unserer und der Aegis-Rangfolge ≥ 0,9;
- die Top 3 nach Aegis stehen bei uns in den Top 5;
- Delta-Paare (zwei Aegis-Zeilen, die sich nur um ein Item unterscheiden): unser Delta liegt höchstens 2 Prozentpunkte neben dem von Aegis.

Dazu ein Abdeckungsziel pro Gruppe: Anteil der Aegis-Zeilen mit einem Szenario, das der Kern rechnet (alle Annahmen haben einen Schalter). Er zeigt, wie weit Abnahme 3 ist; die Liste der fehlenden Schalter je Gruppe steht im Snapshot.
