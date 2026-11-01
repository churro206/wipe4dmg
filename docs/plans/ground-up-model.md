# Plan: Schadensmodell nach Bauplan (Stufen B1–B6)

Freigegeben vom Inhaber am 2026-10-31 mit dem Bauplan (`docs/architecture.md`, ADR 0018). Arbeit auf dem Branch `ground-up-model`; **kein Merge nach `master`, bis der Inhaber es sagt**. Ein Block pro Sitzung, Commit pro Teil, Tests zuerst. Jede Stufe führt die Invarianten (I1–I12) des Bauplans ein, die bei ihr stehen, mit Test.

## Grundlage: S0–S4 (2026-10-30/31, erledigt)

Prüfstand (`tests/scenarios/`, `tests/scenarioBench.test.ts`, 26 von 30, Verhältnisse 11 von 15), neuer Kern `src/engine/core/` mit Parität zum alten (`coreParity`), Burn von Scorch, Auslöser „jeder N-te Schuss“, Spielweisen (Whirling Ovation, Hierarchy, Cayde's Retribution), Polaris Lance, Truth und Barrow-Dyad aus Teilen. Details im Changelog. Daraus bleibt: Kern, Burn, Spielweise in der Oberfläche, Prüfstand-Format. Was sich als Sonderfeld oder Override angesammelt hat, wird in B3/B4 zu Regeln und Items.

## Arbeitsregeln für alle Stufen

- Kein Block und kein Override für ein einzelnes Item, außer der Inhaber nennt es. Was eine Regel nicht trifft, bleibt Paket und kommt auf eine Liste.
- Pro Abweichung ein Versuch mit Quelle, dann Befund in `docs/known-inaccuracies.md`.
- Ein globaler Parameter ändert sich nur über die Eichung (ab B5); bis dahin höchstens einmal je Block und nur mit Beleg aus mehreren Szenarien.
- Abschlussbericht mit „Geeicht / Gelockert / Gestrichen / Unsicher“; Streichen und Lockern vorher fragen.

## Reihenfolge (Review 2026-11-01, Inhaber)

B3a → B3b → B4 (Format, drei Items) → P (Prüfstand ganzer Builds) → B6 (Breite als Item-Dateien) → C (Casts und Energie) → B5 (Eichung). Kein Merge, bis der Inhaber es sagt.

- Bauplan und Aktionsliste bleiben: jede Aktion bildet eine Mechanik ab, die es im Spiel gibt (`addResource` = Energie für Frage 13), das ist kein Vorrat.
- **Breite vor Eichung:** Die Eichung stellt θ gegen eine feste Regelstrecke (Bauplan Abschnitt 12). Fehlen Mechaniken (Lament 3L und 4L gleich, Heirloom-Ladestufen −36/−59 %, Still Hunt Celestial −92 %), würde θ sie verdecken. Deshalb B6 und C vor B5.
- **Kennzahl über alle Pläne:** Abdeckung je Gruppe (`docs/product.md`, Rangfolge-Gate: Anteil der Aegis-Zeilen im Modell). Sie misst den Fortschritt zu Abnahme 3; Delta-Paare (I11) und Rangfolge messen die Qualität. Jeder Abschluss nennt beide.
- Die Prüfmenge (11 Zeilen, 3 Delta-Paare) ist zu klein für eine Aussage, bis Breite und Stufe P sie füllen.

## Stufen

### B1 – Ein Kern (Sonnet, Aufräum-Block)

- `buildSimulation`, `src/ui/App.tsx`, `optimizer.ts`, `analysis.ts`, `breakdown.ts` rufen `simulateCore`; `simulate()` behält nur Hilfsfunktionen, die der Kern nutzt, oder fällt weg; `coreParity` fällt weg. Doppelte `stacksAt`/`resolveHitStacks` (`simulate.ts`, `core/context.ts`) zusammenlegen.
- Laufzeit des Optimizers messen (`tests/optimizer.test.ts`, Obergrenze 306 ms).
- Gate: `npm run test:quiet`, `npx tsc -b`, `npm run lint`, `probe`, `sanity`; Rangfolge-Gate nicht schlechter; `mechanics-baseline` ändert sich nur, wo der neue Kern gewollt anders rechnet (Burn, Teile), Liste im Commit. UI-Check lokal (`npm run dev` bzw. Preview), weil nicht gemergt wird.
- Invarianten: I2, I8 (Bestand), I12 (Bestand).

### B2 – Ehrlicher Prüfstand (Opus plant, Sonnet setzt um)

- `Source.status` bekommt `fitted` mit Zeilen-ID. Jeder Wert, der heute aus einer Aegis-Zeile stammt und gegen sie geprüft wird, bekommt ihn (Liste in `docs/known-inaccuracies.md`, „Prüfstand, geeichte Zeilen“).
- Szenario-Generator: Szenarien aus allen Aegis-Zeilen (Weapons, Abilities, Testing), deren Annahmen alle einen Schalter haben; Zuordnung aus `probeAuto` und `weaponAssumptions`. Die 32 Szenarien von Hand bleiben als Fixtures, bis der Generator sie abdeckt.
- Festes Los (Hash der Zeilen-ID) in Eichmenge und Prüfmenge; verwiesene Zeilen fallen heraus.
- Kennzahlen: Delta-Paare (Haupt), Rangfolge, Absolut (Info); Snapshot im neuen Format als Basis für alle folgenden Stufen.
- Invarianten: I1 (Status), I10, I11.

### B3 – Regeln im Kern (Opus entwirft das Schema, Sonnet setzt um; zwei Blöcke)

- `Rule { on, if, do }`, Auslöser und etwa zehn Aktionen (`docs/architecture.md`, Abschnitt 6); allgemeiner Status-Container (Scorch, Volatile, Jolt, Weaken als Daten).
- Sonderfelder werden Regeln, Verhalten gleich: `hitStacks`, `setup`, `holdDraw`, `refillsMagazine`, `catalystWindowSeconds`, `scorchStacksPerShot`, `everyNthShot`, `nthShotPart`, `playstyleParts`, `tickFactors`, `noReloads`, `periodicDamage`.
- Golden-Beispiel Polaris Lance (`docs/architecture.md`, Abschnitt 11) als Test.
- Gate: Kennzahlen aus B2 und `mechanics-baseline` unverändert; ein Test listet die erlaubten Typen und findet kein Sonderfeld mehr im Schema.
- Invarianten: I3, I7.

**B3.0 Schema (Opus, erledigt 2026-10-31):** Abschnitt „Rules“ in `src/data/schema.ts`, Bauplan Abschnitt 6 endgültig (Zuordnung Sonderfeld → Regel dort). `tests/ruleTypes.test.ts`: erlaubte Typen (I3), Liste `REMAINING` der Sonderfelder im Laufzeit-Schema (schrumpft je Schritt, am Ende von B3b leer), Polaris aus Abschnitt 5.4 als Regeln. `WeaponOverride` behält seine Felder bis B4 (Eingang des Imports, erzeugt nur noch Regeln). `noReloads` ist reiner Import-Eingang und kein Laufzeit-Feld.

**B3a – Kern und Waffen (Sonnet, ein Block):**

1. Regel-Engine `src/engine/core/rules.ts`: Auslöser zuordnen, Bedingungen, alle Aktionen; Zähler, Modes, Buffs je Besitzer; Modifier aktiv nach Zeit. Ein Unit-Test je Auslöser, Bedingung und Aktion (auch `addResource`, `actor`, `modifyAction`, die noch kein Item nutzt). Neue Ereignisse nur aus `shot`, Aktionen und Policy (I7).
2. Status-Container `src/engine/core/status.ts` aus `keywordRun.ts` und `core/burn.ts`: ein Zustand je `TargetStatusId`; `keywords.json` wird Status-Definition (Auslöser `counter` ohne `counterId`), Weaken als Eintrag mit `modifiers`. Verhalten gleich.
3. Waffen-Seite: `Weapon` bekommt `rules`, `buffs`, `playstyles`; im Schema `Weapon` unter den Abschnitt „Rules“ verschieben (reine Verschiebung). Der Import (`scripts/lib/weaponPackages.ts`) schreibt `on shot → spawn` je Teil, Zähler für jeden N-ten Schuss, `spawn` mit `factor` statt `tickFactors`, Bedingung `playstyle`/`hasItem catalyst`, Hierarchy als Zähler und `setMode` (Pre-stacked und „Setup steht“ als `phaseStart`-Regeln), Catalyst-Fenster als `grantBuff`, `appliesKeyword` der Waffe als `on hit → applyStatus`. Die Waffe liest Takt, Reload und Halten aus `StatModifier`. Felder aus `REMAINING` streichen.
4. Golden-Test Polaris (10,5 s mit und ohne Ember, 30 s). Weicht er vom Kern ab: Befund, nichts anpassen.

Zu beachten: Gleichstände wie heute (Schuss vor Treffern; Hierarchy: Schuss genau beim Ablauf baut neu auf); `stacksAt` zählt heute Schüsse zur Schusszeit und Treffer der N-ten Teile zur Trefferzeit; Grenze des Catalyst-Fensters heute einschließlich (`<=`); Reload-Faktor 0 bucht keinen Reload (wie `noReload`). Ein Treffer gilt als Präzisionstreffer, wenn sein Teil `canPrecision` hat.

**B3a Stand (2026-10-31):** Teil 1 erledigt (Schritte 1, 2, 4 und der Kern-Teil von 3: Regeln und Status im Kern, `Weapon.rules`/`buffs`, Golden Polaris). Teil 2 (Rest von Schritt 3: der Import schreibt die Regeln, die Sonderfelder der Waffe fallen weg) in `docs/plans/current.md`. Vorher Korrekturen K1–K4 (ebenda): Teil 1 wich vom Bauplan ab (Auswertung der Bedingungen, `refill` im Golden-Test, Zeiten von `spawn`, Weaken).

**B3b – Effects und Abilities (Sonnet, ein Block):**

5. `Effect.parts` werden `Modifier`, `Effect` und `Ability` bekommen `rules` und `buffs`: `appliesKeyword` und `Ability.keywordParts` → `on hit → applyStatus`; `hitStacks` → Buff mit `perStack` und `bossFactor`; `holdDraw`/`timing` → `StatModifier`; `counterModifier` → `ActionModifier`; `periodicDamage` → `timer.everyMs` + `damage`; `refillsMagazine` → `on cast → refill` (die Waffe plant den nächsten Schuss neu, Generation statt Vorausschau). Counter-, Threshold- und DoT-Teile fallen weg, die Fixture `one-thousand-voices-hand-model.json` wird in Regeln übersetzt.
6. `REMAINING` leer, Laufzeit des Optimizers (≤ 306 ms), Doku.

### B4 – Item-Dateien (Opus entwirft das Format, Sonnet setzt um)

- Item-Schema, `$`-Verweise mit Resolver im Import (`scripts/lib/items/`), Text-Hash, Status `derived` statt `unverified` mit Notiz; kanonische Skala „Aegis visual“ mit Faktor je Quelle und Kategorie in θ.
- Entscheidung an Zahlen: Waffen-Grundwerte aus Quantum oder per `$aegis`.
- Erste Items als Probe des Formats: Polaris Lance, Truth, Hierarchy of Needs (decken `spawn`, Zähler, Mode ab); ihre Overrides fallen weg. Die übrigen sieben (Still Hunt, Whirling Ovation, Barrow-Dyad, Gjallarhorn, Peacekeepers, Ember of Ashes, Well of Radiance) liegen schon unter 2 % und wandern mit ihrer Kategorie in B6. Nicht migrierte Items rechnen mit den alten Paketen.
- Gate: jedes Item löst auf; Delta-Paare nicht schlechter; Text-Hash-Test.
- Invarianten: I1 (Resolver), I4, I5, I6.

**Plan B4 (Opus, freigegeben 2026-11-01):** zwei Blöcke. B4a (Schritte 1–5: Zahlen-Entscheidung, `derived`, Item-Schema mit Resolver und Text-Hash, kanonische Skala, Polaris) in `docs/plans/current.md`. B4b:

6. **Truth:** Rakete aus Quantum, Cluster `$aegis` (8 Bomblets), Reaper's Tithe als Buff mit Fenster (Faktor aus Clarity, Tithe-Zeile wird frei), Gesamtschüsse 14 als `$aegisSustained`; Takt und Reload ohne Argent Ordnance (Basis gewollt geändert). Munitions-Rückgabe als Regel (Aktion für Reserven) erst in Stufe C, bis dahin `known-inaccuracies.md`.
7. **Hierarchy of Needs:** Setup-Regeln (Zähler, Mode) von Hand, Seeker als Ausdruck (Quantum mit Ring − ohne Ring, ÷ Compendium „releases 3 Seekers“), Catalyst-Takt `$quantum[...cata].rpm`, Spielweisen bleiben.
8. **Abschluss:** Bauplan 5.2 und 13 endgültig (Status rechnet der Import, nicht in der Datei; `$theta` als Verweis erst, wenn ein Item ihn braucht), CLAUDE.md-Regel „Aegis vor Quantum (bis B4)“ durch die Entscheidung ersetzen, Roadmap, Changelog. Kennzahlen: Delta-Paare (vorher 1 von 3), Abdeckung je Gruppe. Gate B4 wie oben, dazu Golden Polaris grün.

### Aufräum-Block nach B4 (Sonnet)

Was B1–B4 hinterlassen: tote Pfade im Import, doppelte Typen, Dateien über 1000 Zeilen, die beim Arbeiten stören.

### P – Prüfstand ganzer Builds (Opus plant, Sonnet setzt um; nach B4)

- Szenarien aus Aegis Sustained und Swap (ganze Builds, kein Item verweist auf sie; sie gehen in die Rangfolge, Bauplan Abschnitt 12) und aus Abilities und Testing (offen aus B2, Bauplan Abschnitt 13).
- Kennzahlen je Gruppe (Spalte „Prüft“ in `docs/product.md`): Abdeckung, Spearman, Delta-Paare.
- Gate: Kennzahlen der Weapons-Zeilen unverändert; Zeilen mit fehlendem Schalter auf der Liste.

### C – Casts und Energie (Opus plant, Sonnet setzt um; nach B6)

- Policy für Casts und Energie im Lauf statt vorab geplanter Casts (Bauplan Abschnitt 7, 13); `addResource` im Host. Trägt die Fragen 3, 6 und 13.
- Gate: Rangfolge der Gruppen Supers und Abilities nicht schlechter; Laufzeit des Optimizers.

### B5 – Eichung als Skript (Opus; zuletzt)

- Erst wenn B6 und C die Abdeckung je Gruppe hochgebracht haben; sonst gleicht θ fehlende Mechaniken aus.
- `npm run calibrate`: kleinste Quadrate über die Eichmenge für θ (Ignition-Cooldown, Burn, Skalen je Quelle und Kategorie) mit Grenzen aus den Quellen; Totzone 2 %; schreibt `src/data/theta.json` (Status `fitted`, Datum) und einen Bericht.
- Gate: Kennzahlen der Prüfmenge nicht schlechter; θ innerhalb der Grenzen oder gemeldet.
- Invarianten: I9.

### B6 ff. – Breite und Migration nach Kategorie (Sonnet, je Block eine Kategorie; nach P, vor B5)

Neue und migrierte Items als Item-Dateien. Zuerst, was heute fehlt oder weit abweicht: Ladestufen (Heirloom), Schwert-Kombos (The Lament), die größten Gruppen aus „Missing switches“ im Prüfstand, fehlende Heavy- und Special-Zeilen. Danach nach Zeilen im Rangfolge-Gate: übrige Exotic-Waffen mit ihren Spielweisen (Kombos, Volleys, Ladestufen), Exotic Armor und Class-Item-Perks, Aspects und Fragments, Artifact-Perks und Buffs (Court), Abilities und Supers (Compendium-Teile), Legendary Frames (2.0). Je Kategorie eine Regel für alle Items; was nicht passt, bleibt Paket mit Grund. Nach der letzten Kategorie fallen `weaponPackages.ts`, `weapon-overrides.json` und die Regelketten weg.

### Später

- Optimizer für Abilities (2.0), auf Stufe C.
- Merge nach `master` nur auf Ansage des Inhabers (2026-11-01: noch nicht).

## Doku und Verifikation je Stufe

- `npm run test:quiet`, `npx tsc -b`, `npm run lint`, `npm run probe`, `npm run sanity`, Kennzahlen des Prüfstands.
- `docs/plans/current.md`, `docs/changelog.md`, `docs/roadmap.md`; `docs/architecture.md`, wenn eine Entscheidung aus Abschnitt 13 fällt.
