# Plan: Schadensmodell von Grund auf (Etappen R0–R6)

Freigegeben vom Inhaber am 2026-10-30. Ein Block pro Sitzung, Commit pro Teil.

## Context

Der Inhaber will die Schadensberechnung von Grund auf nachbauen: nackte Teilwerte aus den Quellen, die bekannte Formel und die Mechaniken aus Clarity und Compendium. Die Engine setzt den Schaden selbst zusammen, Aegis dient nur als Prüfung.

Die Recherche vom 2026-10-30 (nur lokale Snapshots und `docs/sources/sheets/`) ergab:

- **Die Formel ist belegt.** Aegis „Sustained“ ist selbst gerechnet: Base × Shots × Perk × Surge × Buff × Debuff × Stat.
  - Still Hunt: 81 097 gerechnet gegen 81 119 bei Aegis.
  - Gjallarhorn: 56 371 gegen 56 374.
  - Echte Messungen stehen nur in Aegis „Weapons“ und „Abilities“ (Treffer ÷ `fullModifiers`) und in „Testing“ (`docs/sources/sheets/aegis/247390216-testing.tsv`).
- **Nackte Werte pro Schuss stimmen zwischen Aegis und Quantum überein.**
  - Still Hunt 658 zu 659, Gjallarhorn 1892 zu 1876.
  - **Teilwerte** gibt es in Aegis `otherTicks` (191 von 417 Zeilen) und in Quantum „Weapon Specifics“ (`quantum/635034617-weapon-specifics.tsv`, rund 150 Werte, z. B. Dragon's Breath Aufprall 189, Pool-Tick 38, Explosion 1144/1307/1470 je Fuel).
  - Keyword-Schaden steht in `quantum/8932058-elemental-effects.tsv`.
- **Lücken:** 135 von 480 Exotic-Waffen-Einträgen in Clarity enthalten ein „?“, meist Takte und Dauern.
- **Die Engine trägt nicht.** `simulate()` in `src/engine/simulate.ts` legt den Schussplan an, bevor Treffer laufen. Effekt-Fenster (`effectWindows.ts`) und Casts (`abilitySimulation`) entstehen vorab. Treffer können deshalb nicht zurückwirken.
  - Jede Rückkopplung ist ein Sonderfall: `setup`, `holdDraw`, `refillsMagazine`, `hitStacks`, `catalystWindowSeconds`.
  - Waffen sind ein Durchschnitt pro Shot unter Aegis' Annahmen, ohne Teile und ohne Precision.

**Ergebnis:** ein neuer Kern mit Zustand und Rückkopplung sowie Waffen aus nackten Teilen. Import, Buckets, Effect-Schema, Oberfläche und Link-Format bleiben. Die Ablösung geschieht in Etappen, nach dem Muster von ADR 0015 mit Snapshot-Test.

## Grundmodell (wird ADR 0017)

1. **Treffer** = nackter Teilwert (Skala Aegis visual) × Precision-Faktor des Teils × Π Buckets (`buckets.json`, Stacking-Regeln) × Stat-Faktor.
2. **Zustand:**
   - Spieler: Magazin, Reserve, Nachladen, Ladungen und Ressourcen (z. B. Golden-Gun-Ladung, Fuel), Buffs mit Stacks, Energie.
   - Ziel: Debuffs, Keyword-Zähler, Cooldowns.
3. **Ereignisse:** shot, hit (mit precision), cast, reload, keyword. **Regeln** sind Paare aus Auslöser und Wirkung: Buff oder Stack geben, Ladung erhöhen, Magazin füllen, Modus wechseln, Keyword setzen, Schaden machen. Die bisherigen Sonderfelder werden solche Regeln.
4. **Spielweise als Strategie:** eine Prioritätsliste, optimal wie bei Aegis. Beispiele: Golden Gun casten, sobald sie geladen ist; Dodge auf das Nachladen legen; Draw nur halten, wenn der Schaden pro Sekunde steigt.
5. **Eich-Regel:** Was kein Text nennt, kommt aus genau einer Aegis-Zeile (`derived`, mit Zeilen-ID). Alle anderen Zeilen derselben Waffe sind das Gate. Die Skalen-Regel aus ADR 0011 gilt weiter.
6. **Teile nur, wo nötig:** Eine Waffe wird zerlegt, wenn ein Teil mit dem Build zusammenspielt (Keyword, Stacks, Fuel, Precision-Unterschied). Sonst bleibt sie ein Teil.

## Etappen

### R0 – ADR und Papierprobe (Opus)
- `docs/adr/0017-ground-up-model.md` mit dem Grundmodell oben, Schema-Entwurf für Waffen-Teile und Regeln, Liste der zu ersetzenden Sonderfelder.
- Papierprobe in `docs/plans/r0-paper-probe.md`: fünf Waffen aus nackten Teilen und Textregeln gegen ihre Aegis-Weapons-Zeilen.

  | Waffe | Teile |
  | --- | --- |
  | Still Hunt | Golden-Gun-Schüsse ×2/×1,45/×1,9; Nighthawk |
  | Dragon's Breath | Teile je Fuel, Scorch, Ignitions |
  | Gjallarhorn | Rakete + 8 Wolfpack |
  | One Thousand Voices | Explosionen, Scorch, Seeker |
  | Hierarchy of Needs | Ring, Seeker, Ignitions |

- Laufzeit des Optimizers heute messen (`tests/optimizer.test.ts`), als Obergrenze für R1.
- **Abbruchkriterium:** Mindestens 4 von 5 Waffen liegen innerhalb ±3 %. Sonst Befund an den Inhaber, kein Umbau.

### R1 – Kern neben dem alten (Opus entwirft, Sonnet setzt um)
- `src/engine/core/` mit `formula.ts`, `state.ts`, `rules.ts`, `policy.ts` und `run.ts`.
- **Wiederverwenden:**
  - `runEvents` (`src/engine/eventRun.ts`), erweitert um den Spieler-Zustand und um Aktionen, die die Strategie einplant.
  - `bucketFactors` und `activeParts` (`src/engine/effectParts.ts`).
  - der Keyword-Lauf (`src/engine/keywordRun.ts`).
- Ausgabe ist `SimulationResult` wie heute. Ein Adapter macht aus jedem Paket eine Waffe mit einem Teil.
- Casts kommen in R1 noch fertig aus `abilitySimulation`.
- **Gate:** `tests/__snapshots__/mechanics-baseline.json` unverändert für alle Pakete. Alter und neuer Kern laufen im Test parallel. Laufzeit höchstens doppelt so lang wie in R0 gemessen.

### R2 – Waffen aus nackten Teilen (Sonnet)
- `scripts/lib/weaponComponents.ts` schreibt `src/data/weapon-components.json`. Jeder Wert hat `source`.
  - Aegis: `critShot`, `bodyShot` und `otherTicks`, jeweils ÷ `fullModifiers`.
  - Quantum Weapon Specifics als Verhältnis zum Quantum-Shot.
  - Clarity und Compendium für Anzahl, Takt und Precision.
  - Geeichte Werte als `derived` mit Zeilen-ID.
- Wiederverwenden: Regelkette und Overrides aus `scripts/lib/weaponPackages.ts`, `textCheck.ts` für Werte und Dauern.
- `docs/weapon-import.md` bekommt die Spalte „nachgebaut / übernommen“.
- **Gate:** neuer Test `tests/weaponComponentGate.test.ts`, der jede Aegis-Weapons-Zeile mit ihren Annahmen nachstellt, ±3 %. Ausnahmen kommen mit Grund in eine Fixture.

### R3 – Sonderfälle werden Regeln; Piloten Still Hunt und Dragon's Breath (Sonnet)
- Ersetzen:

  | Sonderfeld | Waffe |
  | --- | --- |
  | `setup` | Hierarchy |
  | `holdDraw` | Oathkeeper |
  | `refillsMagazine` | Marksman's Dodge |
  | `hitStacks` | Lucky Pants, Peacekeepers |
  | `catalystWindowSeconds` | Truth |

  Die Bestandstests (`weaponSetup`, `holdDraw`, `hitStacks`, `classAbility`, `catalyst`) bleiben grün.
- Still Hunt: Ladung aus Precision-Treffern (16,67 %), Modus Golden Gun (Cast 1767 ms, 16 s, 3 Schüsse ×2/×2,9/×3,8 auf den Grundschuss), Variante mit Nighthawk (1 Schuss, ×1,376 auf drei Schüsse, geeicht an Aegis Weapons), Munition (Cast füllt das Magazin, +3 Ammo, mit Nighthawk +1; Golden-Gun-Schüsse aus dem Magazin), Stacks von Sniper's Meditation.
- Dragon's Breath: Fuel als Ressource, Nachladen durch Ignitions.
- **Gates:**
  - Still Hunt G1: drei Schüsse gegen Aegis Weapons 19236 und Compendium 5820 visual.
  - Still Hunt G2 und G3: Sustained Base 1432 und 2293, Zeit bis leer 21,985 s und 21,152 s.
  - Dragon's Breath: Weapons und Sustained.
  - Szenarien in `tests/plausibility.test.ts`.

### R4 – Abilities, Energie und Effekt-Fenster in den Kern (Sonnet, Strategie mit Opus)
- Casts plant die Strategie im Lauf. Energie aus Treffern und Casts wird Regel (Logik aus `abilityEnergy.ts`). Fenster entstehen aus dem Zustand statt aus `effectWindows.ts`.
- **Gate:** `abilityGate`, `abilityEnergy`, `rotation`, `superWindow`, `transcendence`.

### R5 – Umschalten (Sonnet)
- `buildSimulation` und `nextCastFor` (`src/engine/buildSimulation.ts`) nutzen den neuen Kern. Der alte Kern fällt weg, ebenso die vorab berechneten Fenster.
- Danach müssen grün sein: Gesamtprobe (`metaProbe*`), Rangfolge-Gate, Plausibilität und UI-Check (Skill `pruefen`, Schritt 4).

### R6 – Aufräumen
- Schema-Felder der Sonderfälle und tote Exporte entfernen. Danach folgt die Coverage-Triage (alter Block B).

## Doku bei jeder Etappe

- `docs/plans/current.md`, `docs/changelog.md`, `docs/roadmap.md` und `docs/mechanics/README.md` (Toleranzen, falls neue).

## Risiken

- **Strategie generisch machen ist der schwerste Teil.** Deshalb in R0 auf Papier, in R4 mit Opus.
- **Laufzeit des Optimizers:** feste Obergrenze in R1.
- **Precision gegen Bosse:** je Teil verschieden und nicht überall belegt. Fehlt ein Wert, gilt der Wert der Aegis-Zeile (geeicht).
- **Gates:** Echte Gates gibt es nur für Waffen mit mindestens zwei Aegis-Zeilen; für die übrigen bleibt der Text-Abgleich.
- **Sustained-Summen** prüfen nur das Zusammensetzen. Messungen gegen Weapons, Abilities und Testing haben Vorrang.

## Verifikation (jede Etappe)

- `npm run test:quiet`, `npx tsc -b`, `npm run lint`.
- `npm run probe` und `npm run sanity`.
- Das Gate der Etappe (oben) mit Tabelle „Quelle | Modell | Abweichung“.
- `mechanics-baseline` nur gewollt geändert, jede Änderung mit Grund im Changelog.
