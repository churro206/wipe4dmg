# wipe4dmg – Anforderungen

Oct 18, 2026 · @Leon

## Produktvision

Die App berechnet den Schaden eines Builds mit der Waffe One Thousand Voices in Destiny 2. Die App soll die Unterschiede zwischen Builds richtig abbilden. Absolute Zahlen müssen nicht mit dem Spiel übereinstimmen.

**Zielgruppe:** Ich und meine Freunde. Alle Nutzer kennen Destiny 2 gut. Alle Nutzer arbeiten vor allem am PC.

**Projektrahmen:** Das Projekt ist privat und nicht kommerziell. Es dient nur dem Spaß für mich und meine Freunde. Die App wird nicht beworben; nur Freunde bekommen den Link.

**Problem:** Spieler testen Builds heute mühsam am Schießstand oder vertrauen fremden Ranglisten. Die App rechnet einen Build in Sekunden durch und zeigt, woher der Schaden kommt.

**Abgrenzung:** Die App ist kein Inventar-Manager und keine Build-Datenbank. Die App bewertet Builds. Sie verwaltet keine Ausrüstung.

## Rahmenbedingungen

| Thema | Festlegung |
| --- | --- |
| Erste Waffe | One Thousand Voices (schwere Fusionswaffe, Strahl und verzögerte Explosion) |
| Klassen | Titan, Jäger, Warlock |
| Geräte | Vor allem PC, Layout für große Bildschirme |
| Genauigkeit | Relative Unterschiede zwischen Builds sollen stimmen; absolute Zahlen folgen den Messbedingungen der Datenquelle |
| Datenquellen | Frei zugängliche Community-Daten, möglichst automatisch übernommen (ADR 0005); eigene Messungen nur als Stichprobe |
| Gegner und Modus | Nur Bosse, nur PvE. Effekte, die nur gegen andere Gegner oder nur in PvP wirken, nehmen wir nicht auf. |
| Schadensquellen | Waffen, Fähigkeiten und Supers des Spielers zählen zum Total Damage. |
| Fireteam Support | Nur Buffs und Debuffs von Mitspielern, nicht ihr eigener Schaden. |
| Laufzeit von Effects | Jeder gewählte Effect ist in seinem Zeitfenster aktiv: Start und Dauer aus der Rotation, Dauer vorbelegt aus den Data Files (US-07). Auslöser und Cooldowns kommen später (ADR 0006, Stufe C). |
| Effekte | Die Grundlage ist die Waffe ohne Effekte. Jeder Effekt ist einzeln schaltbar, damit man seinen Beitrag sieht. Das gilt auch für Effekte, die den Ablauf ändern, z. B. Particle Reconstruction (keine Reloads). |
| Programmiererfahrung | Grundlagen; Claude erklärt jede Änderung |
| Zeitbudget | Mehr als 10 Stunden pro Woche |
| Spielstand | Keine Sandbox-Änderungen seit 9.7.0; Wartungs-Patches möglich (zuletzt 9.7.0.5); jede Weapon trägt eine gameVersion |
| Technik | TypeScript, Vite, React, Vitest, Zod; Hosting ohne Server |

## User Stories

Die erste Version enthält nur den Manual Mode. Der Breakdown gehört dazu, weil wir die Ergebnisse nur mit ihm prüfen können.

| ID | User Story | Priorität |
| --- | --- | --- |
| US-01 | Als Spieler will ich Subklasse, Rüstung, Artefakt-Perks und Fireteam Support einstellen, damit ich einen Build ohne Schießstand bewerte. | Must |
| US-02 | Als Spieler will ich die Damage Phase per Schnellwahl oder frei festlegen, damit ich verschiedene Encounter abbilde. | Must |
| US-03 | Als Spieler will ich den Total Damage in der Damage Phase sehen, damit ich Builds vergleiche. | Must |
| US-04 | Als Spieler will ich den Breakdown nach Buckets sehen, damit ich das Ergebnis nachvollziehe und prüfe. | Must |
| US-05 | Als Spieler will ich einen Build als Link teilen, damit meine Freunde ihn direkt öffnen. | Should |
| US-06 | Als Spieler will ich die Damage Curve sehen, damit ich Burst und Sustain unterscheide. | Should |
| US-07 | Als Spieler will ich die Rotation sehen, damit ich den Build im Spiel richtig ausführe. | Should |
| US-08 | Als Spieler will ich mit dem Optimizer die 15 besten Builds finden, damit ich keine Kombination übersehe. | Should |
| US-09 | Als Spieler will ich zwei Builds nebeneinander vergleichen, damit ich die Differenz sofort sehe. | Should |
| US-10 | Als Spieler will ich Builds im Browser speichern, damit ich sie später wieder öffne. | Could |
| US-11 | Als Spieler will ich weitere exotische Waffen auswählen, damit die App mehr Builds abdeckt. | Could |
| US-12 | Als Spieler will ich mein Inventar über die Bungie-API importieren, damit die App nur verfügbare Ausrüstung nutzt. | Won't (v1) |
| US-13 | Als Spieler will ich Builds über einen Discord Bot berechnen, damit ich sie direkt im Discord meiner Gruppe vergleiche. Der Bot führt die Engine in Node.js auf einem Raspberry Pi aus. | Could |
| US-14 | Als Spieler will ich, dass Fähigkeiten und Supers in den Total Damage eingehen, damit ich ganze Builds vergleiche. Alle Supers sollen abgedeckt sein. | Should |
| US-15 | Als Spieler will ich auf der Website nachlesen, wie der Rechner rechnet, welche Mechanics und Effects es gibt und was schon abgedeckt ist, damit ich den Ergebnissen vertraue und Lücken kenne. | Should |

## Releaseplan

Das MVP (v0.5) ist das erste Release mit echtem Nutzen. Das Walking Skeleton davor verbindet alle Teile in primitiver Form.

| Release | Inhalt | Gate zum nächsten Release | Stand |
| --- | --- | --- | --- |
| v0.1 Walking Skeleton | Waffe ohne Buffs, Total Damage, online per Link | Kette läuft durch | abgeschlossen 2026-10-18 |
| v0.5 MVP | Manual Mode, Breakdown, US-01 bis US-04 | Ergebnisse stimmen mit den Werten der Datenquelle überein (`tests/gate.test.ts`) | abgeschlossen 2026-10-18 |
| v1.0 Vollversion | Optimizer, Rotation, Damage Curve, Vergleich, Fähigkeiten und Supers, Wiki mit Abdeckung und „Wie rechnet der Rechner?“, US-05 bis US-09, US-14, US-15 | Freunde testen v1.0 (teilweise erfüllt: Inhaber hat getestet, Freunde testen parallel zu v1.1) | abgeschlossen 2026-10-20 (Optimizer mit Fähigkeiten auf v1.x verschoben) |
| v1.1 Waffen × Exotic-Rüstung | Waffenauswahl, Truth, Thunderlord, Exotic-Rüstung (Dawn Chorus u. a.), Plan in `docs/plans/weapons-and-exotic-armor.md` | Freunde vergleichen Waffe × Exotic-Rüstung | in Arbeit |
| v1.x Erweiterung | Optimizer mit Fähigkeiten, Speichern im Browser, weitere Waffen nach v1.1, Discord Bot, US-10, US-11, US-13 | – | offen |

Ein Release startet erst, wenn das Gate davor erfüllt ist. Das Gate vor v1.0 vergleicht unsere Ergebnisse mit den Gesamtwerten der Datenquelle, z. B. Total Damage pro Magazin.

## Glossary

Code, Tests, Dokumente und Prompts verwenden nur diese englischen Begriffe. Die Begriffe folgen Destiny 2 und der etablierten Community-Sprache. Jeder Begriff hat genau eine Bedeutung.

| Term | Meaning |
| --- | --- |
| Ability | Grenade, melee or super of a subclass; creates its own damage instances through its ability components |
| Ability Component | Part of an ability that creates damage instances, e.g. impact, explosion or ignition; an ability without verified parts has one component with the total per use from Aegis |
| Ability Stat | Super, grenade or melee stat; at 200 instead of 100 it increases the damage of the matching ability components |
| Amplification | Bucket of damage buffs outside empowering buffs, debuffs and surges, e.g. Weapons stat or Argent Ordnance (community term from the Court stacking guide) |
| Boss DR | Damage resistance of a boss; reduces all incoming damage by a fixed factor |
| Breakdown | Per bucket: its multiplier and the total damage without that bucket |
| Bucket | Group of multipliers with one stacking rule, e.g. only the highest value applies; buckets multiply with each other |
| Build | Complete selection of subclass, armor, artifact perks and fireteam support for one weapon |
| Burn | Damage over time that scorch deals to a target; each tick is a damage instance |
| Coverage | Which abilities, effects and mechanics the calculator models and how: own components, package, effect only or missing (docs/coverage.md, wiki page) |
| Damage Curve | Cumulative damage over the damage phase |
| Damage Instance | Single hit with a timestamp and a damage value; the explosion of One Thousand Voices is a separate, delayed damage instance |
| Damage over Time | Mechanic category: an effect deals damage in ticks over a duration, e.g. burn or Taken Seeker |
| Damage Phase | Time span in seconds in which the simulator sums up damage (community: DPS phase) |
| Damage Source | What creates a damage instance: weapon, grenade, melee or super |
| Data File | JSON file with game data; contains no logic |
| Debuff | Effect on the target that increases the damage it takes, e.g. Tether or Divinity |
| DPS | Damage per second: total damage divided by the damage phase in seconds (Aegis instead divides by the time until the ammo is empty) |
| Effect | Anything a build can switch on or off that changes damage or timing, e.g. a buff, debuff, surge, perk or artifact perk |
| Empowering Buff | Effect on the player that increases the damage dealt, e.g. Well of Radiance or Radiant |
| Engine | Simulator plus optimizer; contains only pure functions |
| Exclusive Group | Effects of which a build can provide at most one itself, e.g. one surge level or one super |
| Fireteam Support | Empowering buff or debuff that another fireteam member provides |
| Gate | Automated check that compares a computed result with a measured total from a source, e.g. an Aegis row within ±10 %; a decomposed model counts only after it passes (ADR 0009, ADR 0011) |
| Guardian Class | Titan, Hunter or Warlock; decides which subclass effects a build can provide itself |
| Ignition | Solar explosion when a target reaches enough scorch stacks; a separate damage instance |
| Intrinsic | Fixed exotic perk of a weapon, including its catalyst effect |
| Manual Mode | App mode in which the user sets one build and runs the simulator once |
| Mechanic | Game rule that changes damage or timing; documented in docs/mechanics |
| Multiplier | Factor by which an effect changes damage, e.g. 1.25 |
| Optimizer | App mode that runs the simulator for all allowed combinations of own effects (class, subclass, exclusive groups) and ranks the best builds; fireteam support and effect windows stay fixed |
| Reload | Refilling the magazine after its last shot; takes the reload time of the weapon |
| Provider | Way a build gets an effect: own subclass, armor, artifact, or fireteam support from a teammate |
| Rotation | Sequence of shots, reloads and effect windows (start and duration of each effect) in the damage phase |
| Scorch | Solar effect on a target that stacks, deals burn damage and causes an ignition at enough stacks |
| Shot | Release of one fully charged round; the time of the shot is time zero for its damage instances |
| Simulator | Part of the engine that computes one build over the damage phase |
| Slot | Place where the game shows an own effect: super, class ability, aspect, fragment (subclass), mod, stat (armor), artifact; effects from teammates have none |
| Source Scale | Absolute damage level of one source; sources differ (Compendium weapon values are about 1.26 × Quantum), so values from different sources are combined only as ratios (ADR 0011) |
| Stacking Resource | Mechanic category: a counter on the player that builds up and decays, e.g. Bolt Charge or Armor Charge |
| Subclass | Ability set of a class with one element (Arc, Solar, Void, Stasis, Strand) or Prismatic; decides which own subclass effects a build can provide |
| Super Window | Time in which a super with a duration is active; the weapon does not fire in it |
| Surge | Effect that increases weapon damage of one damage type; armor mods (1x to 3x, on the legs), exotics (4x) and artifact perks share it; forms its own bucket. Modelled as the level matching the weapon element |
| Target State | Mechanic category: a state on the target that other effects check, e.g. Blind or Blight |
| Threshold Trigger | Mechanic category: stacks or damage on a target trigger an event at a threshold, e.g. scorch to ignition or Jolt |
| Timing Modifier | Mechanic category: an effect changes shots, reloads or ammo instead of damage, e.g. Particle Reconstruction |
| Total Damage | Sum of all damage instances of the player (weapons, abilities, supers) in the damage phase |
| Uptime | Share of the damage phase in which an effect is active; set by its start and duration in the rotation |

## Risiken und offene Fragen

Das größte Risiko ist die Abhängigkeit von Community-Daten. Wir messen nicht selbst und übernehmen Fehler und Lücken der Quellen.

| Risiko | Folge | Gegenmaßnahme |
| --- | --- | --- |
| Eine Community-Tabelle ändert ihren Aufbau | Der automatische Import liefert falsche oder keine Werte | Zod prüft jede importierte Data File; Tests schlagen fehl, statt falsche Zahlen zu veröffentlichen |
| Eine Community-Tabelle wird nicht mehr gepflegt | Werte veralten nach Sandbox-Änderungen | Jede Weapon trägt eine gameVersion; Quelle und Abrufdatum stehen im `source`-Objekt |
| Quellen messen unter verschiedenen Bedingungen | Werte aus verschiedenen Quellen sind nicht vergleichbar | Pro Wertart eine Hauptquelle; Messbedingungen in docs/data-sources.md festhalten |
| Großer Gesamtumfang | Projekt bleibt unfertig | Streng nach Releaseplan arbeiten; Should- und Could-Stories erst nach dem MVP |

**Offene Fragen:**

- [x] Was bedeuten die Spalten der Aegis-Tabelle? (geklärt in docs/data-sources.md)
- [x] Schnellwahl der Damage Phase: freie Eingabe plus die Damage Phases bekannter Bosse (Quelle: Aegis, Reiter „Bosses“, 61 Bosse). Keine festen Schritte wie 10, 20, 30 s.
- [ ] Welcher Fireteam Support ist für die erste Version relevant?
