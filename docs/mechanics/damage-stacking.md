# Damage Stacking

Kategorie: Multiplier · Spielversion: 9.7.0.3 · Zuletzt geprüft: 2026-10-18 · Vertrauen: hoch

## Kurzfassung

Damage-Buffs gehören zu Kategorien (bei uns: Buckets). Innerhalb einer Kategorie gilt meist nur der stärkste Effekt. Die Kategorien multiplizieren sich untereinander. Courts Beispiel: Sechs Buffs aus sechs Kategorien ergeben zusammen etwa ×4,28.

## Regeln

1. **Kategorien multiplizieren sich.** „Combining different damage buffs is ALWAYS multiplicative.“ (Court)
2. **Empowering Buffs:** Nur der stärkste gilt. Beispiel: Prismatic Transfer „doesn't stack with Radiant or other similar empowering buffs“. (Compendium, Artifact Perks)
3. **Debuffs:** Nur der stärkste gilt. Es gibt aber Vorrangregeln, die nicht dem Wert folgen:
   - Moebius und Deadfall Tether überschreiben alle anderen Weaken.
   - Ein 30-%-Weaken überschreibt Particle Reconstruction.
   - Divinity überschreibt Particle Reconstruction und setzt ihn auf 15 % herab, obwohl Particle Reconstruction bis 27,6 % erreicht.
4. **Weapon Surges:** Pro Element gilt nur der stärkste Surge. Armor-Mods, Exotics und Artifact Perks teilen sich dieses System. Für eine Waffe zählt nur der Surge ihres Elements.
5. **Surge-Stufen:** Surges zählen Stacks von 1x bis 4x. Die Stufe bestimmt den Multiplier, siehe Werte.
6. **Amplification** stapelt mit Empowering Buffs, Debuffs und Surges. Elemental Overdrive „stacks with all other buffs“, obwohl die UI ihn als Surge anzeigt.
7. **Weapons Stat** gegen Bosse: Power-Waffen +0,1 % pro Punkt über 100, maximal +10 % bei 200. Primary- und Special-Waffen +0,15 % pro Punkt, maximal +15 %. Court führt ihn unter Amplification.
8. **Nur gegen Bosse:** Effekte, die nicht gegen Bosse wirken, entfallen, z. B. Sect of Force, Kinetic Intrinsic Buff, Weapons Stat 0–100.
9. **Activity Surge und Overcharge** stapeln nicht miteinander. Activity Surges stapeln aber mit Armor Surges. (Aktivitätsabhängig, vorerst nicht im Umfang.)
10. **Superstructure Defender** und ähnliche Raid-Mods zählen nicht als Debuff und stapeln mit Weaken. (Raid-spezifisch, vorerst nicht im Umfang.)

## Werte

| Wert | Zahl (PvE) | Quelle | Spielversion |
| --- | --- | --- | --- |
| Well of Radiance, Banner Shield (Empowering) | 25 % | Court | 9.7.0.3 |
| Empowering Rift, Radiant (Empowering) | 20 % | Court | 9.7.0.3 |
| Lumina, Gyrfalcon's Hauberk u. a. (Empowering) | 35 % | Court | 9.7.0.3 |
| Weaken (Debuff) | 15 % | Court; Compendium „Void“ | 9.7.0.3 |
| Tractor Cannon, Felwinter's Helm, Moebius Tether (Debuff) | 30 % | Court | 9.7.0.3 |
| Deadfall Tether (Debuff) | 35 % | Court | 9.7.0.3 |
| Divinity (Debuff) | 15 % | Court | 9.7.0.3 |
| Surge 2x / 4x | 17 % / 25 % | Court (Ballidorse „Instant 2x“, 4x-Exotics) | 9.7.0.3 |
| Surge 3x | 22 % (abgeleitet: Fr0st-EE5 und Heavy-Brick-Surge nennen 22 %, Aegis rechnet mit 1,22) | Court; Aegis | 9.7.0.3 |
| Surge 1x | offen | – | – |
| Argent Ordnance (Amplification) | 15 % | Court | 9.7.0.3 |
| Elemental Overdrive (Amplification) | 22 % | Court; Compendium | 9.7.0.3 |
| Weapons Stat 200, Power-Waffe gegen Bosse | 10 % | Compendium „Game Mechanics“; Aegis Spalte „200“ (1,10) | 9.7.0.x |

Stichprobe: Der Projektinhaber hat bei Weapons Stat 130 +2,9 % im Spiel abgelesen. Nach Regel 7 wären es 3 %.

## Wechselwirkungen

- [Particle Reconstruction](particle-reconstruction.md): Debuff mit eigenen Vorrangregeln
- [Scorch und Ignition](scorch-and-ignition.md): Solar-Effekte profitieren von Waffen-Buffs, wenn eine Waffe sie ausgelöst hat
- Armor Charge: Voraussetzung für Armor-Surges

## Modell im Simulator

Noch nicht abgebildet. Vorschlag für den ADR zum Effect-Modell:

- Buckets nach Courts Kategorien: `empowering`, `debuff`, `surge`, `amplification`, `weaponPerk`, `exoticIntrinsic`. Der heutige Bucket `artifact` entfällt, weil Artifact Perks zu verschiedenen Kategorien gehören.
- Stacking-Regel pro Bucket wie heute (`highest`, `multiplicative`, `additive`), dazu Vorrangregeln zwischen einzelnen Effects, z. B. „Divinity überschreibt Particle Reconstruction“.
- Testfall aus Courts Beispiel: 1,25 × 1,22 × 1,25 × 1,33 × 1,35 × 1,25 ≈ 4,28.

## Offene Fragen

- [ ] Multiplizieren sich mehrere Amplification-Effekte untereinander, oder gilt dort auch nur der stärkste?
- [ ] Wie stapeln mehrere Weapon Perks auf einer Waffe?
- [ ] Wie hoch ist ein 1x-Surge?

## Quellen

- [Court's Everything Spreadsheet, Reiter „Stacking Guide“](https://destiny2.science/court-sheet), Daten vom 9. Juni 2026, geprüft für 9.7.0.3
- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Game Mechanics“ und „Artifact Perks“, abgerufen 2026-10-18
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Weapons“
