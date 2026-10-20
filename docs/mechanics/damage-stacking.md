# Damage Stacking

Kategorie: Multiplier · Spielversion: 9.7.0.3 · Zuletzt geprüft: 2026-10-20 · Vertrauen: hoch

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
6. **Amplification, Exotic Intrinsics, Weapon Perks, World & Activity** stapeln mit allem, auch untereinander: „Stacks with all other buffs and itself“ (Court, Damage Buff Categories). Elemental Overdrive „stacks with all other buffs“, obwohl die UI ihn als Surge anzeigt.
7. **Ausnahme Melee:** „Melee-increasing damage modifiers are additive“ (Court). Buffs, die nur den Melee-Schaden erhöhen, addieren sich untereinander. Im Modell gibt es dafür noch keinen Bucket, weil noch kein Melee-Buff angelegt ist.
8. **Weapons Stat** gegen Bosse: Power-Waffen +0,1 % pro Punkt über 100, maximal +10 % bei 200. Primary- und Special-Waffen +0,15 % pro Punkt, maximal +15 %. Court führt ihn unter Amplification.
9. **Nur gegen Bosse:** Effekte, die nicht gegen Bosse wirken, entfallen, z. B. Sect of Force, Kinetic Intrinsic Buff, Weapons Stat 0–100.
10. **Weaken verlängert 30-%-Debuffs:** Die Debuffs von Felwinter's Helm, Fafnir und Tractor Cannon lassen sich durch die meisten Weaken-Quellen verlängern, z. B. durch eine Void Soul. Tether funktioniert anders und lässt sich nicht verlängern. (Court)
11. **Expanding Abyss** (Artifact Perk) hebt Weaken an: 15 → 25 %, 30 → 35 %, 35 → 40 %. Nur Void-Schaden, Divinity bleibt bei 15 %. (Court; noch nicht im Modell)
12. **Buffs auf Supers** (geprüft 2026-10-20):
    - Radiant erhöht Golden Gun (Deadshot, Marksman, mit Celestial Nighthawk) um 20 % (Court; Compendium: „Also affects Golden Gun's Damage“).
    - Well of Radiance wirkt auf Golden Gun nur als Radiant, also 20 % statt 25 %: „When fired inside a Well of Radiance, Golden Gun now counts as Radiant for increased damage“ (Bungie, Update 9.5.0, Dezember 2025).
    - Surges, Elemental Overdrive und Weapons Stat wirken nicht auf Supers. Laut Compendium gelten sie nur für Waffenschaden. Aegis lässt die Spalte Surge bei allen Supers leer.
    - Still Hunt ist kein Super, sondern Waffenschaden („Golden Gun Mode is NOT a Super Ability for any purposes“, Compendium). Er bekommt alle Waffen-Buffs, auch Solar Surge und Weapons Stat.
    - Twilight Arsenal: nur Debuffs und der „Void Surge modifier“ (Compendium). Aegis rechnet trotzdem Facet of Courage und Limit Break ein; Widerspruch.
    - Andere Supers: Keine Quelle wendet Radiant, Well, Rift, Banner Shield oder Weapons of Light an. Das ist abgeleitet, getestet hat es niemand. Laut Bungie 9.7.0 gelten Empowering Buffs grundsätzlich nur für Waffenschaden.
    - Ausnahme außerhalb der Supers: Crackshot (Class Ability) bekommt Radiant +20 % (Compendium, Aegis).
    - Im Modell gelten Radiant und Well bisher nur für Waffen. Golden Gun ist deshalb mit Radiant oder Well 20 % zu niedrig (bekannter Fehler).
13. **Activity Surge und Overcharge** stapeln nicht miteinander. Activity Surges stapeln aber mit Armor Surges. (Aktivitätsabhängig, vorerst nicht im Umfang.)
14. **Superstructure Defender** und ähnliche Raid-Mods zählen nicht als Debuff und stapeln mit Weaken. (Raid-spezifisch, vorerst nicht im Umfang.)

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
| Surge 1x / 2x / 3x / 4x | 10 % / 17 % / 22 % / 25 % | Court (Surge-Mods, Eternal Warrior, Doom Fang Pauldron); Aegis 1,22 für 3x | 9.7.0.3 |
| Argent Ordnance (Amplification) | 15 % | Court | 9.7.0.3 |
| Banner of War (Amplification, Strand Titan Aspect) | offen (Wert im Compendium) | Court (nur Kategorie) | 9.7.0.3 |
| Expanding Abyss: Weaken 15 / 30 / 35 % → | 25 / 35 / 40 % | Court | 9.7.0.3 |
| Well of Radiance: Dauer bei Super-Stat 100 / 200 | 30 s / 40 s | Court | 9.7.0.3 |
| Radiant nach dem Verlassen von Well (mit Ember of Solace) | 8 s (12 s) | Court | 9.7.0.3 |
| Elemental Overdrive (Amplification) | 22 % | Court; Compendium | 9.7.0.3 |
| Weapons Stat 200, Power-Waffe gegen Bosse | 10 % | Compendium „Game Mechanics“; Aegis Spalte „200“ (1,10) | 9.7.0.x |

Stichprobe: Der Projektinhaber hat bei Weapons Stat 130 +2,9 % im Spiel abgelesen. Nach Regel 8 wären es 3 %.

## Wechselwirkungen

- [Particle Reconstruction](particle-reconstruction.md): Debuff mit eigenen Vorrangregeln
- [Scorch und Ignition](scorch-and-ignition.md): Solar-Effekte profitieren von Waffen-Buffs, wenn eine Waffe sie ausgelöst hat
- Armor Charge: Voraussetzung für Armor-Surges

## Modell im Simulator

Abgebildet nach ADR 0006:

- Buckets nach Courts Kategorien in `src/data/buckets.json`: `empowering`, `debuff`, `surge` (Stacking `highest`), `amplification`, `weaponPerk`, `exoticIntrinsic` (Stacking `multiplicative`, laut Court belegt), dazu `abilityStat`.
- Vorrangregeln zwischen einzelnen Effects, z. B. „Divinity überschreibt Particle Reconstruction“.
- Testfall aus Courts Beispiel: 1,25 × 1,22 × 1,25 × 1,33 × 1,35 × 1,25 ≈ 4,28.
- Noch nicht abgebildet: Melee-Buffs (additiv), Expanding Abyss, Verlängerung von Debuffs durch Weaken, Radiant auf Golden Gun und Still Hunt.

## Offene Fragen

- [x] Multiplizieren sich mehrere Amplification-Effekte untereinander? Ja, „and itself“ (Court, geprüft 2026-10-20).
- [x] Wie stapeln mehrere Weapon Perks auf einer Waffe? Multiplikativ, „and itself“ (Court, geprüft 2026-10-20).
- [x] Wie hoch ist ein 1x-Surge? 10 % (Court, geprüft 2026-10-20).

## Quellen

- [Court's Everything Spreadsheet, Reiter „Stacking Guide“](https://destiny2.science/court-sheet), Daten vom 9. Juni 2026, geprüft für 9.7.0.3. Der Kurzlink führt auf das Google Sheet „Destiny 2 Damage Buffs/Debuffs“ (`1i1KUwgVkd8qhwYj481gkV9sZNJQCE-C3Q-dpQutPCi4`, Reiter-gid `2073397587`). CSV-Export gesperrt (401); `htmlview/sheet?gid=…` und gviz funktionieren. Vollständig gelesen am 2026-10-20: etwa 100 Effects, davon 17 im Modell.
- [Destiny Data Compendium](https://destiny2.science/data-compendium), Reiter „Game Mechanics“ und „Artifact Perks“, abgerufen 2026-10-18
- [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage), Reiter „Weapons“
