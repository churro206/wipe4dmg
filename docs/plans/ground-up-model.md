# Plan: Schadensmodell nach Bauplan (Stufen B1–B6)

Freigegeben vom Inhaber am 2026-10-31 mit dem Bauplan (`docs/architecture.md`, ADR 0018). Arbeit auf dem Branch `ground-up-model`; **kein Merge nach `master`, bis der Inhaber es sagt**. Ein Block pro Sitzung, Commit pro Teil, Tests zuerst. Jede Stufe führt die Invarianten (I1–I12) des Bauplans ein, die bei ihr stehen, mit Test.

## Grundlage: S0–S4 (2026-10-30/31, erledigt)

Prüfstand (`tests/scenarios/`, `tests/scenarioBench.test.ts`, 26 von 30, Verhältnisse 11 von 15), neuer Kern `src/engine/core/` mit Parität zum alten (`coreParity`), Burn von Scorch, Auslöser „jeder N-te Schuss“, Spielweisen (Whirling Ovation, Hierarchy, Cayde's Retribution), Polaris Lance, Truth und Barrow-Dyad aus Teilen. Details im Changelog. Daraus bleibt: Kern, Burn, Spielweise in der Oberfläche, Prüfstand-Format. Was sich als Sonderfeld oder Override angesammelt hat, wird in B3/B4 zu Regeln und Items.

## Arbeitsregeln für alle Stufen

- Kein Block und kein Override für ein einzelnes Item, außer der Inhaber nennt es. Was eine Regel nicht trifft, bleibt Paket und kommt auf eine Liste.
- Pro Abweichung ein Versuch mit Quelle, dann Befund in `docs/known-inaccuracies.md`.
- Ein globaler Parameter ändert sich nur über die Eichung (ab B5); bis dahin höchstens einmal je Block und nur mit Beleg aus mehreren Szenarien.
- Abschlussbericht mit „Geeicht / Gelockert / Gestrichen / Unsicher“; Streichen und Lockern vorher fragen.

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

### B3 – Regeln im Kern (Opus entwirft das Schema, Sonnet setzt um; eventuell zwei Blöcke)

- `Rule { on, if, do }`, Auslöser und etwa zehn Aktionen (`docs/architecture.md`, Abschnitt 6); allgemeiner Status-Container (Scorch, Volatile, Jolt, Weaken als Daten).
- Sonderfelder werden Regeln, Verhalten gleich: `hitStacks`, `setup`, `holdDraw`, `refillsMagazine`, `catalystWindowSeconds`, `scorchStacksPerShot`, `everyNthShot`, `nthShotPart`, `playstyleParts`, `tickFactors`, `noReloads`, `periodicDamage`.
- Golden-Beispiel Polaris Lance (`docs/architecture.md`, Abschnitt 11) als Test.
- Gate: Kennzahlen aus B2 und `mechanics-baseline` unverändert; ein Test listet die erlaubten Typen und findet kein Sonderfeld mehr im Schema.
- Invarianten: I3, I7.

### B4 – Item-Dateien (Opus entwirft das Format, Sonnet setzt um)

- Item-Schema, `$`-Verweise mit Resolver im Import (`scripts/lib/items/`), Text-Hash, Status `derived` statt `unverified` mit Notiz; kanonische Skala „Aegis visual“ mit Faktor je Quelle und Kategorie in θ.
- Entscheidung an Zahlen: Waffen-Grundwerte aus Quantum oder per `$aegis`.
- Erste Items: Truth, Still Hunt, Whirling Ovation, Polaris Lance, Hierarchy of Needs, Barrow-Dyad, Gjallarhorn, Peacekeepers, Ember of Ashes, Well of Radiance; ihre Overrides fallen weg. Nicht migrierte Items rechnen mit den alten Paketen.
- Gate: jedes Item löst auf; Delta-Paare nicht schlechter; Text-Hash-Test.
- Invarianten: I1 (Resolver), I4, I5, I6.

### Aufräum-Block nach B4 (Sonnet)

Was B1–B4 hinterlassen: tote Pfade im Import, doppelte Typen, Dateien über 1000 Zeilen, die beim Arbeiten stören.

### B5 – Eichung als Skript (Opus)

- `npm run calibrate`: kleinste Quadrate über die Eichmenge für θ (Ignition-Cooldown, Burn, Skalen je Quelle und Kategorie) mit Grenzen aus den Quellen; Totzone 2 %; schreibt `src/data/theta.json` (Status `fitted`, Datum) und einen Bericht.
- Gate: Kennzahlen der Prüfmenge nicht schlechter; θ innerhalb der Grenzen oder gemeldet.
- Invarianten: I9.

### B6 ff. – Migration nach Kategorie (Sonnet, je Block eine Kategorie)

Reihenfolge nach Zeilen im Rangfolge-Gate: übrige Exotic-Waffen mit ihren Spielweisen (Kombos, Volleys, Ladestufen), Exotic Armor und Class-Item-Perks, Aspects und Fragments, Artifact-Perks und Buffs (Court), Abilities und Supers (Compendium-Teile), Legendary Frames (2.0). Je Kategorie eine Regel für alle Items; was nicht passt, bleibt Paket mit Grund. Nach der letzten Kategorie fallen `weaponPackages.ts`, `weapon-overrides.json` und die Regelketten weg.

### Später

- Policy für Casts und Energie im Lauf (alte S5), mit dem Optimizer für Abilities (2.0).
- Merge nach `master` auf Ansage des Inhabers; Vorschlag: nach B4 oder B5, wenn die Kennzahlen der Prüfmenge stehen.

## Doku und Verifikation je Stufe

- `npm run test:quiet`, `npx tsc -b`, `npm run lint`, `npm run probe`, `npm run sanity`, Kennzahlen des Prüfstands.
- `docs/plans/current.md`, `docs/changelog.md`, `docs/roadmap.md`; `docs/architecture.md`, wenn eine Entscheidung aus Abschnitt 13 fällt.
