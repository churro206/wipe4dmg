# Plan: Schadensmodell von Grund auf (Stufen S0–S6)

Freigegeben vom Inhaber am 2026-10-30, neu geschnitten am selben Tag nach der Papierprobe (`docs/plans/r0-paper-probe.md`): nach **Systemen**, nicht nach Waffen. Arbeit auf dem Branch `ground-up-model`; `master` bleibt die laufende Version. Ein Block pro Sitzung, Commit pro Teil, Tests zuerst.

## Context

- **Die Formel ist belegt.** Aegis „Sustained“ ist selbst gerechnet (Base × Shots × Bucket-Faktoren). Echte Messungen stehen nur in Aegis „Weapons“, „Abilities“ und „Testing“.
- **Teile und Faktoren aus Texten tragen.** In 13 nachgerechneten Waffen treffen Faktoren aus dem Text 9 von 9 auf ≤0,2 %. Die Summe der Aegis-Ticks mit Anzahlen aus dem Text trifft den Wipe.
- **Die Abweichungen sind allgemeine Systeme**, keine Sonderfälle einer Waffe:
  - Burn fehlt (Formel 2,7 + 0,175 × Stacks, von Aegis bestätigt): Polaris Lance, Lord of Wolves, One Thousand Voices, Hierarchy of Needs.
  - Cooldown des Keyword-Auftrags pro Quelle: Lord of Wolves (≤0,46 s), vermutlich Dragon's Breath.
  - Treffer-Anteil eines Teils am Boss: Truth-Bomblets (Quantum 0 % bzw. 100 %), Barrow-Dyad-Seeker.
  - Annahmen der Messung (Takt, „one ring“) gehören ins Szenario, nicht ins Modell.
- **Die Engine trägt nicht.** `simulate()` plant Schüsse, Fenster und Casts vorab. Jede Rückkopplung ist ein Sonderfeld (`setup`, `holdDraw`, `refillsMagazine`, `hitStacks`, `catalystWindowSeconds`, `scorchStacksPerShot`).

## Grundmodell (ADR 0017)

Fünf Schichten, jede rein und für sich testbar, darüber eine deterministische Ereignis-Schleife:

1. **Formel:** Damage Instance → Zahl. Grundwert × Precision × Π Buckets (`buckets.json`) × Stat-Faktor. Ohne Zustand.
2. **Status-System** an Ziel und Spieler: Stacks, Dauer, Verfall, Ticks, Schwelle, Cooldown nach Auslösung, Cooldown pro Quelle. Scorch/Burn/Ignition, Volatile, Jolt, Slow, Weaken sind Datensätze.
3. **Effekt-System:** Auslöser → Bedingung → Aktion. Perks, Exotics, Aspects sind Datensätze. Neuer Code nur für einen neuen Aktionstyp, nie für ein Item.
4. **Akteur-Zustand:** Magazin, Reserve, Reload, Charge, Modi, Ressourcen (Fuel, Golden-Gun-Ladung). Eine allgemeine Zustandsmaschine pro Waffe.
5. **Strategie:** Prioritätsliste, optimal wie bei Aegis.

**Daten in zwei Klassen:** Spielwerte (Compendium, Clarity, Manifest, Quantum, mit `source`) und **Szenarien** (eine Aegis-Zeile = Build, Spielweise, Takt, Dauer, gemessenes Ergebnis, Zeilen-ID).

**Kalibrieren auf zwei Ebenen, nie pro Waffe:**
- Globale Parameter (Ignition-Cooldown, Burn, Cooldown pro Quelle, Treffer-Anteil je Teil-Art) gegen **alle** Szenarien zugleich. Ein Ausreißer ist ein Befund, kein neuer Parameter.
- Item-Werte aus dem Text; fehlt einer, an genau einer Zeile geeicht (`derived`, Zeilen-ID), die übrigen Zeilen prüfen. ADR 0011 gilt weiter.

**Kennzahl:** Anteil der Szenarien innerhalb ±3 %, je System. Vorrang haben Verhältnisse zwischen Zeilen derselben Waffe (mit/ohne Perk), weil das Produkt Unterschiede braucht, keine absoluten Zahlen.

## Stufen

### S0 – Prüfstand (Sonnet)
- Szenario-Format `tests/scenarios/*.json` und Läufer `tests/scenarioBench.test.ts`; Ausgabe Tabelle „Szenario | Quelle | Modell | Abweichung“ und Kennzahl.
- Erste Szenarien: die Zeilen der 13 Waffen aus der Papierprobe.
- Kennzahl des **heutigen** Kerns als Basis festhalten. Laufzeit Optimizer: 153 ms (`tests/optimizer.test.ts`), Obergrenze für den neuen Kern 306 ms.
- Gate: Prüfstand läuft in der CI, Basis eingefroren.
- **Erledigt (2026-10-30):** 32 Szenarien, 30 gezählt (Salvation's Grip: Streuung). Basis heutiger Kern 12 von 30, nach zwei Import-Korrekturen 16 von 30 (OTV und Two-Tailed Fox Shot aus Aegis, Ager's Catalyst ×1,80), Verhältnisse 5 von 14; Tabelle `tests/__snapshots__/scenario-bench.md`. Takt folgt dem Build (Catalyst an/aus); ein eigenes Feld kommt erst, wenn eine Zeile einen Takt verlangt, den der Build nicht ausdrückt. Barrow-Dyad hat kein Paket und zählt als Fehlschlag.

### S1 – Kern (Opus entwirft, Sonnet setzt um)
- `src/engine/core/`: Ereignis-Schleife, Formel, Akteur-Zustand, Ausgabe `SimulationResult`. Wiederverwenden: `runEvents`, `bucketFactors`, `activeParts`.
- Adapter: jedes heutige Paket wird eine Waffe mit einem Teil.
- Gate: `mechanics-baseline` unverändert; alter und neuer Kern parallel im Test.

### S2 – Status-System (Sonnet, Parameter mit Opus)
- Scorch-Familie komplett mit Burn, Verfall, Cooldown pro Quelle. Danach Volatile, Jolt, Slow, Weaken.
- Alle Solar-Szenarien zugleich; globale Parameter anpassen und mit Zitat in `keywords.json`.
- Gate: Kennzahl Solar besser als Basis; `scorch`-, `abilityGate`-Tests grün.

### S3 – Effekt-System (Sonnet)
- Sonderfelder werden Datensätze: `setup` (Hierarchy), `holdDraw` (Oathkeeper), `refillsMagazine` (Marksman's Dodge), `hitStacks` (Lucky Pants, Peacekeepers), `catalystWindowSeconds` (Truth), `scorchStacksPerShot` (OTV).
- Gate: Bestandstests (`weaponSetup`, `holdDraw`, `hitStacks`, `classAbility`, `catalyst`) grün.

### S4 – Waffen aus Teilen (Sonnet)
- `scripts/lib/weaponComponents.ts` → `src/data/weapon-components.json`: Aegis-Ticks ÷ `fullModifiers`, Quantum Weapon Specifics als Verhältnis, Anzahl und Takt aus Texten, Treffer-Anteil je Teil.
- Zerlegt wird nur, wo ein Teil mit dem Build spielt. Weitere Szenarien aus allen Aegis-Weapons-Zeilen mit `otherTicks`.
- Gate: Kennzahl gesamt besser als Basis.

### S5 – Strategie und Casts (Opus für die Strategie)
- Casts und Energie plant die Strategie im Lauf (Logik aus `abilityEnergy.ts`). Fenster aus dem Zustand statt `effectWindows.ts`.
- Gate: `abilityGate`, `abilityEnergy`, `rotation`, `superWindow`, `transcendence`.

### S6 – Umschalten und Aufräumen (Sonnet)
- `buildSimulation` und `nextCastFor` nutzen den neuen Kern, wenn Kennzahl und Snapshot stimmen. Alter Kern, Sonderfelder und tote Exporte fallen weg.
- Gate: Gesamtprobe, Rangfolge-Gate, Plausibilität, UI-Check (Skill `pruefen`, Schritt 4). Danach Merge nach `master` und Coverage-Triage.

## Risiken

- **Szenarien aus Freitext** der Aegis-Annahmen sind Handarbeit. Klein anfangen (13 Waffen), Zuordnung erst automatisieren, wenn Muster sichtbar sind.
- **Strategie generisch** ist der schwerste Teil (S5, Opus).
- **Messstreuung** („average“, Salvation's Grip): solche Szenarien zählen nicht zur Kennzahl, Grund im Szenario.
- **Offen ohne Quelle:** Dragon's Breath (Pool-Takt „?“), Barrow-Dyad (Seeker-Zahl), Zusatz bei Ager's Scepter.

## Doku und Verifikation je Stufe

- `npm run test:quiet`, `npx tsc -b`, `npm run lint`, `npm run probe`, `npm run sanity`, Kennzahl des Prüfstands.
- `docs/plans/current.md`, `docs/changelog.md`, `docs/roadmap.md`, `docs/mechanics/README.md` (Toleranzen).
