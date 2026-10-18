# Particle Reconstruction

Kategorie: Timing Modifier, Multiplier (Debuff) · Spielversion: 9.7.0.x · Zuletzt geprüft: 2026-10-18 · Vertrauen: mittel

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
| One Thousand Voices: Shot-Abstand mit dem Perk | 1,733 s | Aegis (peak Rate) | 9.7.0.3 |
| One Thousand Voices: Zeit bis leer mit dem Perk | 18,33 s | Aegis (TtE) | 9.7.0.3 |

## Wechselwirkungen

- [Damage Stacking](damage-stacking.md): Der Debuff gehört zum Bucket `debuff`, mit eigenen Vorrangregeln.
- [Scorch und Ignition](scorch-and-ignition.md): Ohne Reloads ändert sich der Zeitablauf und damit eventuell das Ignition-Muster.

## Modell im Simulator

Noch nicht abgebildet. Particle Reconstruction ist das wichtigste Beispiel für einen Effect mit zwei Teilen:

- Teil 1, Timing Modifier: Reloads entfallen.
- Teil 2, Debuff: Multiplier im Bucket `debuff`, wächst mit den Treffern bis Stufe 5; wird von stärkeren Debuffs überschrieben.

## Offene Fragen

- [ ] Wie schnell erreicht One Thousand Voices die Stufe 5? Bringt jeder Beam-Tick einen Stack oder jeder Shot?
- [ ] Ist der Shot-Abstand mit dem Perk wirklich kürzer (Aegis 1,733 s), oder messen Aegis und Quantum (1,818 s) nur verschieden?
- [ ] Nach welcher Zahl von Treffern lädt One Thousand Voices nach? Aegis misst 11 Shots ohne Reload. Die Compendium-Regel (10 % des Magazins pro Auslösung, aufgerundet, also 1 Schuss) passt dazu, wenn ein Shot mit seinen 10 Beam-Ticks mindestens eine Auslösung bringt. Eine weitere Quelle haben wir nicht gefunden (Web-Suche 2026-10-18).

## Quellen

- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Artifact Perks“ und „OLD Episodic Artifact Perks“, abgerufen 2026-10-18
- [Court's Everything Spreadsheet, Reiter „Stacking Guide“](https://destiny2.science/court-sheet)
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Weapons“
