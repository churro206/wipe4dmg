# wipe4dmg – Anforderungen

Oct 18, 2026 · @Leon

## Produktvision

Die App berechnet den Schaden eines Builds mit der Waffe One Thousand Voices in Destiny 2. Die Zahlen sollen dem Spiel auf wenige Prozent entsprechen.

**Zielgruppe:** Ich und meine Freunde. Alle Nutzer kennen Destiny 2 gut. Alle Nutzer arbeiten vor allem am PC.

**Problem:** Spieler testen Builds heute mühsam am Schießstand oder vertrauen fremden Ranglisten. Die App rechnet einen Build in Sekunden durch und zeigt, woher der Schaden kommt.

**Abgrenzung:** Die App ist kein Inventar-Manager und keine Build-Datenbank. Die App bewertet Builds. Sie verwaltet keine Ausrüstung.

## Rahmenbedingungen

| Thema | Festlegung |
| --- | --- |
| Erste Waffe | One Thousand Voices (schwere Fusionswaffe, Strahl und verzögerte Explosion) |
| Klassen | Titan, Jäger, Warlock |
| Geräte | Vor allem PC, Layout für große Bildschirme |
| Genauigkeit | Absolute Zahlen sollen dem Spiel auf wenige Prozent entsprechen |
| Programmiererfahrung | Grundlagen; Claude erklärt jede Änderung |
| Zeitbudget | Mehr als 10 Stunden pro Woche |
| Spielstand | Keine Sandbox-Änderungen seit 9.7.0; Wartungs-Patches möglich (zuletzt 9.7.0.5); jede Weapon trägt eine gameVersion |
| Technik | TypeScript, Vite, React, Vitest, Zod; Hosting ohne Server |

## User Stories

Die erste Version enthält nur den Manual Mode. Der Breakdown gehört dazu, weil wir absolute Zahlen nur mit ihr prüfen können.

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

## Releaseplan

Das MVP (v0.5) ist das erste Release mit echtem Nutzen. Das Walking Skeleton davor verbindet alle Teile in primitiver Form.

| Release | Inhalt | Gate zum nächsten Release |
| --- | --- | --- |
| v0.1 Walking Skeleton | Waffe ohne Buffs, Total Damage, online per Link | Kette läuft durch |
| v0.5 MVP | Manual Mode, Breakdown, US-01 bis US-04 | Referenzwerte stimmen |
| v1.0 Vollversion | Optimizer, Rotation, Damage Curve, Vergleich, US-05 bis US-09 | Freunde testen v1.0 |
| v1.x Erweiterung | Speichern im Browser, weitere Waffen, US-10, US-11 | – |

Ein Release startet erst, wenn das Gate davor erfüllt ist. Das Gate vor v1.0 verlangt Referenzwerte vom Schießstand.

## Glossary

Code, Tests, Dokumente und Prompts verwenden nur diese englischen Begriffe. Die Begriffe folgen Destiny 2 und der etablierten Community-Sprache. Jeder Begriff hat genau eine Bedeutung.

| Term | Meaning |
| --- | --- |
| Boss DR | Damage resistance of a boss; reduces all incoming damage by a fixed factor |
| Breakdown | Share of each bucket in the total damage of a build |
| Bucket | Group of multipliers with one stacking rule; only the highest value per bucket applies, and buckets multiply with each other |
| Build | Complete selection of subclass, armor, artifact perks and fireteam support for one weapon |
| Damage Curve | Cumulative damage over the damage phase |
| Damage Instance | Single hit with a timestamp and a damage value; the explosion of One Thousand Voices is a separate, delayed damage instance |
| Damage Phase | Time span in seconds in which the simulator sums up damage (community: DPS phase) |
| Data File | JSON file with game data; contains no logic |
| Debuff | Effect on the target that increases the damage it takes, e.g. Tether or Divinity |
| Empowering Buff | Effect on the player that increases the damage dealt, e.g. Well of Radiance or Radiant |
| Engine | Simulator plus optimizer; contains only pure functions |
| Fireteam Support | Empowering buff or debuff that another fireteam member provides |
| Intrinsic | Fixed exotic perk of a weapon, including its catalyst effect |
| Manual Mode | App mode in which the user sets one build and runs the simulator once |
| Multiplier | Factor by which an effect changes damage, e.g. 1.25 |
| Optimizer | App mode that runs the simulator for all builds and ranks the best builds |
| Reload | Refilling the magazine after its last shot; takes the reload time of the weapon |
| Rotation | Sequence of shots, reloads and buff activations in the damage phase |
| Shot | Release of one fully charged round; the time of the shot is time zero for its damage instances |
| Simulator | Part of the engine that computes one build over the damage phase |
| Surge | Armor mod effect that increases weapon damage of one damage type; forms its own bucket |
| Total Damage | Sum of all damage instances in the damage phase |

## Risiken und offene Fragen

Das größte Risiko ist die Forderung nach absoluten Zahlen. Eine stimmige Rangfolge ist deutlich leichter zu erreichen.

| Risiko | Folge | Gegenmaßnahme |
| --- | --- | --- |
| Absolute Zahlen hängen von Boss DR und Level-Differenz ab | Abweichungen gegenüber dem Spiel | Diese Faktoren als eigene Datenwerte führen; erst gegen Schießstand-Dummies prüfen, dann gegen Bosse |
| Strahl und Explosion von One Thousand Voices sind schlecht dokumentiert | Falscher Grundschaden | Beide Damage Instances am Schießstand einzeln messen |
| Animations- und Ladezeiten fehlen in den Quellen | Falsche Rotation | Zeiten framegenau aus Videos ermitteln |
| Großer Gesamtumfang | Projekt bleibt unfertig | Streng nach Releaseplan arbeiten; Should- und Could-Stories erst nach dem MVP |

**Offene Fragen:**

- [ ] Welche Schadenswerte haben Beam, Explosion und Taken Seeker? (Messplan in docs/data-sources.md)
- [ ] Welche Boss-Typen und Damage Phases sollen als Schnellwahl erscheinen?
- [ ] Welcher Fireteam Support ist für die erste Version relevant?
- [ ] Wie messen wir Referenzwerte am Schießstand, damit sie reproduzierbar sind?
