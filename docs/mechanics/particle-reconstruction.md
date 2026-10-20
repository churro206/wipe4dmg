# Particle Reconstruction

Kategorie: Timing Modifier, Multiplier (Debuff) · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-20 · Vertrauen: mittel

## Kurzfassung

Particle Reconstruction ist ein Artifact Perk (Tablet of Ruin) für Fusion Rifles und Linear Fusion Rifles. Er hat zwei Teile: einen stapelnden Debuff bis 27,6 % und eine Nachladung aus den Reserves. Dadurch muss One Thousand Voices nie nachladen. Aegis setzt den Perk in allen Zeilen für One Thousand Voices voraus.

## Regeln

1. Gilt nur für Fusion Rifles und Linear Fusion Rifles.
2. **Debuff:** Treffer tragen einen stapelnden Debuff auf, der nur den Schaden von (Linear) Fusion Rifles erhöht. 5 Stufen, siehe Werte.
3. **Vorrang:** Ein 30-%-Weaken überschreibt den Debuff. Divinity überschreibt ihn ebenfalls und setzt ihn auf 15 % herab.
4. **Nachladen:** Mehrere direkte Treffer füllen 10 % des Magazins auf, aufgerundet. Bei Fusion Rifles löst in der Regel jeder Bolt im Magazin das aus. Für einige Waffen gelten Sonderregeln.
5. Für One Thousand Voices gilt laut Aegis: keine Reloads, alle 11 Shots hintereinander (Distribution „11“).

## Werte

| Wert | Zahl | Quelle | Spielversion |
| --- | --- | --- | --- |
| Debuff Stufe 1–5 | 5 % / 10,25 % / 15,8 % / 21,6 % / 27,6 % | Compendium „Artifact Perks“ | 9.7.0.x |
| Debuff maximal | etwa 28 %, 10 s | Court | 9.7.0.3 |
| Nachladung | 10 % des Magazins, aufgerundet | Compendium „Artifact Perks“ | 9.7.0.x |
| One Thousand Voices: Shot-Abstand mit dem Perk | 1,733 s; gemessen 1,75 s (1 s 45 Frames) | Aegis (peak Rate); eigene Messung 2026-10-20 | 9.7.0.3 |
| Debuff auf Ignitions | ja, Ignition mit ÷ ohne Perk = 1,27 | eigene Messung 2026-10-20 | 9.7.0.x |
| One Thousand Voices: Zeit bis leer mit dem Perk | 18,33 s | Aegis (TtE) | 9.7.0.3 |
| Divinity überschreibt den Debuff | 15 % | Court; Compendium „Artifact Perks“ (abgerufen 2026-10-20) | 9.7.0.3 |
| Debuff in Aegis-Zeilen von One Thousand Voices | pauschal ×1,30, nicht 27,6 % | Aegis „Weapons“ | 9.7.0.3 |

## Wechselwirkungen

- [Damage Stacking](damage-stacking.md): Der Debuff gehört zum Bucket `debuff`, mit eigenen Vorrangregeln.
- [Scorch und Ignition](scorch-and-ignition.md): Ohne Reloads ändert sich der Zeitablauf und damit eventuell das Ignition-Muster.

## Modell im Simulator

Abgebildet seit v0.5 Schritt 3 (`src/data/effects.json`, Effect `particle-reconstruction`). Particle Reconstruction ist das wichtigste Beispiel für einen Effect mit zwei Teilen:

- Teil 1, Timing Modifier: Reloads entfallen.
- Teil 2, Debuff: Multiplier im Bucket `debuff`. Vereinfachung in v0.5: immer Stufe 5 (27,6 %), weil jeder Effect die ganze Damage Phase aktiv ist. Ein 30-%-Weaken gewinnt über die Regel „highest“, Divinity über `overrides`.

## Offene Fragen

- [ ] Wie schnell erreicht One Thousand Voices die Stufe 5? Keine Quelle sagt, ob ein Stack pro Beam-Tick, Explosion oder Shot kommt (2026-10-20). Die Stufen sind genau 1,05^n − 1. Wahrscheinlich ein Stack pro Treffer, dann ist Stufe 5 nach etwa 0,3 s erreicht; unsere Vereinfachung „immer Stufe 5“ kostet höchstens einige Beam-Ticks. Ingame-Test: Beam-Ticks eines Shots frameweise ablesen, steigen sie um je 5 %?
- [x] Shot-Abstand: Aegis 1,733 s stimmt, gemessen 1,75 s (2026-10-20). Quantum (1,818 s) rundet auf 33 RPM. Das Modell nutzt seit 2026-10-20 1,733 s.
- [x] Nach welcher Zahl von Treffern lädt One Thousand Voices nach? Geklärt mit mittlerem bis hohem Vertrauen (2026-10-20): Alte Regel (Heresy) „50 % des Magazins, abgerundet, +1“ Treffer, bei 4 Schuss also 3 Treffer. Ein Shot hat 19 Treffer, das Magazin bleibt voll. Frühere Notiz: Aegis misst 11 Shots ohne Reload. Die Compendium-Regel (10 % des Magazins pro Auslösung, aufgerundet, also 1 Schuss) passt dazu, wenn ein Shot mit seinen 10 Beam-Ticks mindestens eine Auslösung bringt. Eine weitere Quelle haben wir nicht gefunden (Web-Suche 2026-10-18).

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Artifact Perks“ und „OLD Episodic Artifact Perks“, abgerufen 2026-10-18
- [Court's Everything Spreadsheet, Reiter „Stacking Guide“](https://destiny2.science/court-sheet)
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Weapons“
