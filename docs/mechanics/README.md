# Mechanics: Übersicht

Stand: 2026-10-18 · Spielversion: 9.7.0.5 · Phase 2 (Beispiele pro Kategorie ausgearbeitet)

Dieser Ordner sammelt unser Wissen über die Mechanics von Destiny 2. Die Übersicht hier ist der Einstieg: Arbeitsweise, Taxonomie, Katalog und Folgen für die Architektur.

## Arbeitsweise

Der Kreislauf folgt den Bausteinen des Wissensmanagements (Probst, Raub & Romhardt) und dem SECI-Modell (Nonaka & Takeuchi).

1. **Erfassen:** Claude recherchiert in den Quellen unten und schreibt das Ergebnis auf.
2. **Prüfen:** Der Projektinhaber prüft gegen seine Spielerfahrung. Widersprüche zwischen Quellen stehen in der Mechanic-Datei.
3. **Anwenden:** Regeln werden Tests (Specification by Example). Zahlen kommen in die Data Files, nicht in die Mechanic-Datei.
4. **Pflegen:** Nach jedem Patch prüfen wir alle Mechanics, deren Spielversion älter ist.

Regeln:

- **In die Breite früh, in die Tiefe bei Bedarf.** Der Katalog listet alles Relevante. Eine eigene Mechanic-Datei entsteht für ein Beispiel pro Kategorie (Phase 2) und sonst erst, wenn eine User Story sie braucht.
- **Eine Mechanic pro Datei**, Dateiname in kebab-case, z. B. `scorch-and-ignition.md`. Dateien verlinken sich gegenseitig.
- **Erklärung und Referenz getrennt (Diátaxis):** Die Mechanic-Datei erklärt, wie etwas funktioniert. Die Zahlen, mit denen der Simulator rechnet, stehen nur in `src/data`.
- **Begriffe** kommen aus dem Glossary in `docs/requirements.md`.

## Aufbau einer Mechanic-Datei

```markdown
# <Name>

Kategorie: <Taxonomie> · Spielversion: <x.y.z> · Zuletzt geprüft: <Datum> · Vertrauen: hoch | mittel | niedrig

## Kurzfassung
Zwei bis drei Sätze.

## Regeln
Nummerierte Regeln. Jede Regel wird ein Test.

## Werte
| Wert | Zahl | Quelle | Spielversion |

## Wechselwirkungen
Links zu anderen Mechanic-Dateien.

## Modell im Simulator
Wie die Engine die Mechanic abbildet, oder „noch nicht abgebildet".

## Offene Fragen
```

## Taxonomie

Die Kategorien beschreiben, welche Art von Logik der Simulator braucht.

| Kategorie | Bedeutung | Beispiele | Folge für den Simulator |
| --- | --- | --- | --- |
| Multiplier | Ändert den Schaden um einen Faktor | Empowering Buff, Debuff, Surge, Amplification, Weapon Perks | Buckets mit Stacking-Regel |
| Damage over Time | Schaden in Ticks über eine Dauer | Burn, Taken Seeker | Ticks auf der Zeitachse |
| Threshold Trigger | Stacks oder Schaden lösen bei einer Schwelle ein Ereignis aus | Scorch → Ignition, Jolt, Volatile, Unravel, Slow → Freeze | Zähler am Ziel, neue Damage Instances beim Auslösen |
| Timing Modifier | Ändert Shots, Reloads oder Munition statt Schaden | Particle Reconstruction, Auto-Loading, Reload-Perks, Munitionsquellen | Effekte greifen in den Schussplan ein |
| Stacking Resource | Zähler am Spieler, baut sich auf und verfällt | Armor Charge, Bolt Charge, Frost Armor | Zustand am Spieler über die Zeit |
| Target State | Zustand am Ziel, den andere Effekte prüfen | Blind, Blight, Frozen, Suspend | Bedingungen für andere Effekte |

Querschnitt für alle Kategorien: **Dauer, Auffrischen, Cooldown und Bedingungen**, z. B. „nur gegen Nicht-Bosse“, „nur PvE“ oder „nur Fusion Rifles“. Viele Effekte gehören zu mehr als einer Kategorie. Particle Reconstruction ist ein Debuff und zugleich ein Timing Modifier.

## Katalog

Status: **katalogisiert** = nur diese Zeile; **ausgearbeitet** = eigene Datei; **im Simulator** = Engine bildet es ab.
Relevanz bezieht sich auf Boss-Damage-Phasen.

### Grundlagen

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| [Damage Stacking (Buckets)](damage-stacking.md) | Multiplier | Damage-Buffs fallen in die Kategorien Empowering Buffs, Debuffs, Weapon Surges und Amplification. Die Kategorien multiplizieren sich untereinander. | hoch | Court Stacking Guide | im Simulator (ohne Vorrangregeln) |
| Weapons Stat | Multiplier (Amplification) | Stat 101–200 erhöht den Waffenschaden gegen Bosse; Heavy bei 200: ×1,10. Stat 0–100 wirkt nur gegen normale Gegner. | hoch | Court; Aegis Spalte „200“ | katalogisiert |
| Precision | Multiplier (Bedingung) | Schaden auf kritische Trefferzonen; Werte je Waffe | mittel (One Thousand Voices: keiner) | Quantum; Aegis | katalogisiert |
| Gegnertyp | Bedingung | Manche Effekte wirken nicht gegen Bosse, z. B. Kinetic Intrinsic Buff, Weapons Stat 0–100; wir rechnen nur gegen Bosse | Filter: solche Effekte entfallen | Compendium „Game Mechanics“; Court | katalogisiert |
| Power-Differenz | Multiplier (global) | Schaden hängt von der Power-Differenz zum Gegner ab | niedrig (wirkt auf alle Builds gleich) | Mossy: Outgoing Damage Scaling | katalogisiert |
| Boss-Werte | Bedingung | Boss DR, Lebenspunkte, Mechaniken je Boss | niedrig für relative Vergleiche | Aegis „Bosses“ | katalogisiert |
| Champions | Target State | Barrier, Overload, Unstoppable | keine (nur Bosse) | Compendium „Game Mechanics“ | katalogisiert |

### Multiplier

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| Empowering Buffs | Multiplier | Well of Radiance und Banner Shield 25 %, Empowering Rift 20 %, Radiant 20 %, einige Exotics 35 % | hoch | Court Stacking Guide | katalogisiert |
| Weaken und Powerful Weaken | Multiplier (Debuff) | Weaken 15 %; Tractor Cannon, Felwinter's und Moebius Tether 30 %, Deadfall Tether 35 %; stärkere Weaken überschreiben schwächere | hoch | Court; Compendium „Void“ | katalogisiert |
| Divinity | Multiplier (Debuff) | 15 %, Precision-Käfig; überschreibt Particle Reconstruction | hoch | Court | katalogisiert |
| Weapon Surges | Multiplier (Surge) | 1x bis 4x Stacks pro Element; 4x = 25 %; Armor-Mods brauchen Armor Charge; gleiches Element stapelt nicht, der höchste Wert gilt | hoch | Court | katalogisiert |
| Amplification | Multiplier | Sonstige Buffs, die mit allen anderen Kategorien multiplizieren, z. B. Argent Ordnance 15 %, Elemental Overdrive 22 % | hoch | Court | katalogisiert |
| Weapon Perks | Multiplier u. a. | Schadens-Perks legendärer Waffen; Aegis führt sie in der Spalte „Perk“ | hoch | Compendium „Weapon Perks“; Aegis | katalogisiert |
| Artifact Perks | verschieden | Jede Saison neu; gehören je nach Perk zu verschiedenen Kategorien | hoch | Compendium „Artifact Perks“; Court | katalogisiert |
| Exotic Armor | verschieden | Viele Exotics geben Surges, Empowering Buffs oder Amplification | hoch | Compendium „Exotic Armors“; Court | katalogisiert |

### Solar

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| [Scorch und Burn](scorch-and-ignition.md) | Threshold Trigger, Damage over Time | Stacks am Ziel; Burn-Tick alle 0,56 s, Schaden steigt mit den Stacks; bei 100 Stacks folgt eine Ignition, alle Stacks verfallen | hoch (One Thousand Voices) | Compendium „Solar“ | ausgearbeitet |
| [Ignition](scorch-and-ignition.md) | Threshold Trigger | Solar-Explosion als eigene Damage Instance; mit bestimmten Fragments setzt sie Scorch bei Gegnern in der Nähe (Details offen) | hoch (One Thousand Voices) | Compendium; Quantum; Aegis | ausgearbeitet |
| Ember of Ashes | Multiplier für Stacks | Scorch-Stacks +50 %, aufgerundet; Ausnahmen bei einigen Quellen | hoch (One Thousand Voices) | Compendium „Solar“; Aegis | katalogisiert |
| Dawn Chorus | Amplification | Erhöht Ignition-Schaden | mittel | Compendium; Aegis | katalogisiert |
| Radiant | Multiplier (Empowering Buff) | 20 % Waffenschaden | hoch | Court | katalogisiert |
| Restoration, Cure | – | Heilung, kein Schaden | niedrig | Compendium „Solar“ | katalogisiert |

### Arc

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| [Bolt Charge](bolt-charge.md) | Stacking Resource | Stacks lösen Blitzschläge aus | mittel bis hoch | Aegis „Bolt Charge“; Compendium „Arc“ | ausgearbeitet |
| Jolt | Threshold Trigger | Nach einer Schadensschwelle Kettenblitz an Gegner in der Nähe; 0,8 s Cooldown | mittel | Compendium „Arc“ | katalogisiert |
| Blind | Target State | Gegner handlungsunfähig; mit Arc Compounding +15 % Arc-Schaden | niedrig bis mittel | Compendium; Court | katalogisiert |
| Amplified | Target State (Spieler) | Bewegung und Handling, Voraussetzung für andere Effekte | niedrig | Compendium „Arc“ | katalogisiert |
| Ionic Traces | Stacking Resource | Pickups für Fähigkeitsenergie | niedrig | Compendium „Arc“ | katalogisiert |

### Void

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| Weaken | Multiplier (Debuff) | siehe oben | hoch | Court; Compendium „Void“ | katalogisiert |
| Volatile | Threshold Trigger | Explosion nach einer Schadensschwelle oder beim Tod | mittel | Compendium „Void“ | katalogisiert |
| Suppress | Target State | Fähigkeiten gesperrt; laut Compendium gibt Suppress unter bestimmten Bedingungen kurz +30 Weapons (Quelle des Effekts offen) | niedrig | Compendium „Void“ | katalogisiert |
| Devour, Invisibility, Overshield | Target State (Spieler) | Überleben; Voraussetzung für andere Effekte | niedrig | Compendium „Void“ | katalogisiert |

### Stasis

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| Slow und Freeze | Threshold Trigger, Target State | 100 Slow-Stacks frieren ein; Frozen-Ziele nehmen +10 % Schaden von Special- und Power-Waffen | niedrig (Wirkung auf Bosse offen) | Compendium „Stasis“ | katalogisiert |
| Shatter | Damage Instance | Zusätzlicher Schaden beim Zerbrechen | niedrig | Compendium „Stasis“ | katalogisiert |
| Frost Armor | Stacking Resource | Stacks am Spieler; mit Fr0st-EE5 ein Stasis-Surge | mittel | Compendium; Court | katalogisiert |

### Strand

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| Unravel | Threshold Trigger | Nach einer Schadensschwelle Fäden an Gegner in der Nähe | mittel | Compendium „Strand“ | katalogisiert |
| Suspend | Target State | Bosse lösen sich nach 1 s und nehmen 300 Strand-Schaden | niedrig | Compendium „Strand“ | katalogisiert |
| Sever | Target State | Verringert den Schaden des Gegners | niedrig | Compendium „Strand“ | katalogisiert |
| Woven Mail | Target State (Spieler) | Schadensreduktion; mit The Navigator +25 % (Amplification) | niedrig bis mittel | Compendium; Court | katalogisiert |
| Threadlings, Tangles | Damage Instance | Fähigkeitsschaden | mittel | Compendium „Strand“ | katalogisiert |

### Waffen, Munition und Ablauf

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| [Particle Reconstruction](particle-reconstruction.md) | Timing Modifier, Multiplier (Debuff) | Artifact Perk für Fusion und Linear Fusion: füllt das Magazin aus den Reserves und gibt einen stapelnden Debuff bis etwa 28 %; 30-%-Weaken und Divinity überschreiben ihn | hoch (One Thousand Voices) | Court; Aegis | ausgearbeitet |
| Reload und Auto-Loading | Timing Modifier | Reload-Zeiten, Auto-Loading-Perks, Reload-Mods | hoch | Quantum; Aegis | katalogisiert |
| Munition | Timing Modifier | Reserves, Reserve-Mods, Ammo Finder, Heavy-Ammo-Bricks; begrenzt lange Damage Phases | hoch | Quantum „Reserves“; Compendium „Armor Mods“ | katalogisiert |
| Waffenwechsel (Swap) | Timing Modifier | Rotationen mit Waffenwechsel; Ready-, Fire- und Stow-Zeiten | hoch (für Rotationen) | Aegis „Swap“ | katalogisiert |
| Taken Seeker | Damage over Time | Katalysator von One Thousand Voices: 22 Ticks alle 0,25 s, höchstens 5 pro Ziel | hoch (mit Katalysator) | Clarity via light.gg | katalogisiert |
| Blight | Target State | Taken-Seeker-Ticks machen +100 % Schaden auf Blighted Targets | mittel | Clarity via light.gg; Aegis | katalogisiert |
| Armor Charge | Stacking Resource | Stacks verfallen nach Zeit; Voraussetzung für Surges und Argent-Perks | hoch | Compendium „Armor Mods“ | katalogisiert |

### Andere Schadensquellen

| Mechanic | Kategorie | Kurzbeschreibung | Relevanz | Quelle | Status |
| --- | --- | --- | --- | --- | --- |
| [Fähigkeiten und Supers](abilities-and-supers.md) | Damage Instance | Granaten, Nahkampf und Supers machen eigenen Schaden; zählen zum Total Damage | hoch | Aegis „Abilities“; Compendium | ausgearbeitet |
| Mehrere Spieler | Multiplier, Damage Instance | Nur Buffs und Debuffs von Mitspielern (Fireteam Support), nicht ihr Schaden; Skalierung mehrerer gleicher Quellen | mittel | Aegis „Scaling“ | katalogisiert |

## Folgen für die Architektur

Diese Punkte sind die wichtigsten Ergebnisse aus Phase 1 und 2. Die Entscheidung steht in ADR 0006 (`docs/adr/0006-effect-model.md`).

1. **Effects sind mehr als Multiplier.** Das heutige Effect-Schema kennt nur `multiplier`. Gebraucht werden mindestens Multiplier, Timing Modifier, Damage over Time und Threshold Trigger.
2. **Ein Effect kann mehrere Teile haben.** Particle Reconstruction ist ein Debuff und ein Timing Modifier.
3. **Die Buckets müssen zu Courts Kategorien passen.** `buckets.json` führt `artifact` als eigenen Bucket. Laut Court gehören Artifact Perks je nach Perk zu Debuff, Surge oder Amplification. Die Regeln innerhalb der Kategorien sind teils komplizierter als „der höchste gilt“: Ein 30-%-Weaken überschreibt Particle Reconstruction, Surges zählen Stacks.
4. **Der Simulator braucht Zustand über die Zeit:** Stacks am Ziel (Scorch), Ressourcen am Spieler (Armor Charge, Bolt Charge) und Laufzeiten von Effekten.
5. **Effekte haben Bedingungen,** z. B. Waffentyp oder Element. Gegnertyp und Modus sind fest (Boss, PvE); Effekte ohne Wirkung auf Bosse filtern wir beim Import heraus.
6. **Quellen nutzen verschiedene Einheiten.** Ignition: Compendium nennt Grundwerte, Quantum 890, Aegis 2814. Innerhalb einer Simulation darf deshalb pro Wertart nur eine Quelle rechnen.
7. **Fähigkeiten und Supers sind eigene Schadensquellen** neben der Waffe. Der Simulator braucht dafür eigene Damage Instances mit Cooldowns und Energie für Fähigkeiten und Super.

## Offene Fragen an den Projektinhaber

Beantwortet am 2026-10-18, festgehalten in `docs/requirements.md` (Rahmenbedingungen):

- [x] Nur Bosse. Effekte, die nicht gegen Bosse wirken, nehmen wir nicht auf.
- [x] Fähigkeiten und Supers zählen zum Total Damage.
- [x] Fireteam Support umfasst nur Buffs und Debuffs von Mitspielern, nicht ihren Schaden.
- [x] Nur PvE. PvP-Werte der Quellen ignorieren wir.

## Quellen

| Quelle | Inhalt | Stand | Zugriff |
| --- | --- | --- | --- |
| [Destiny Data Compendium](https://destiny2.science/data-compendium) | Keywords pro Element, Game Mechanics, Perks, Mods, Exotics, Artifact | laufend gepflegt | CSV-Export gesperrt; Abruf über die gviz-Schnittstelle (`/gviz/tq?tqx=out:csv&gid=<gid>`) |
| [Court's Everything Spreadsheet](https://destiny2.science/court-sheet), Reiter „Stacking Guide“ | Damage-Buffs nach Kategorien mit PvE-Werten, Dauer, Stacking-Hinweisen | 9.7.0.3 (Daten vom 9. Juni 2026) | gviz-Schnittstelle |
| [Aegis: Destiny 2 Boss Damage](https://destiny2.science/boss-damage) | Waffen, Fähigkeiten, Scaling, Swap, Bolt Charge, Bosse | Changelog 2026-10-12 | CSV-Export |
| [Quantum Damage-ics](https://destiny2.science/quantum-damage-ics) | Waffen-Grundwerte, Reserves, Effektwerte | bis 9.7.0.1 | CSV-Export |
| [Mossy: Outgoing Damage Scaling](https://destiny2.science/damage-scaling) | Power-Differenz und Schadensskalierung | nicht geprüft | – |
| Clarity (über [light.gg](https://www.light.gg/) und DIM) | Genaue Perk-Beschreibungen | laufend | Webseite |
| Bungie-Patchnotes | Maßgeblich für Änderungen pro Version | laufend | Webseite |
