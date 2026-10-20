# ADR 0012: Mehrere Waffen

Status: angenommen · Datum: 2026-10-20

## Kontext

Bisher kennt der Rechner nur One Thousand Voices. Für v1.1 kommen Truth und Thunderlord dazu (Plan `docs/plans/weapons-and-exotic-armor.md`), später fast alle Waffen.
ADR 0011, Punkt 5, legt schon fest, dass Waffen als Paket aus Aegis und Quantum kommen. Offen ist, was sich ändert, wenn es mehr als eine Waffe gibt.

Was schon für mehrere Waffen taugt:

- Eine Data File pro Waffe in `src/data/weapons/` mit Code für den Link (nie wiederverwendet). Der Link (Format 3) enthält den Waffen-Code.
- Effects schränken sich mit `weaponTypes` und `elements` ein; die Engine wendet sie nur auf passende Waffen an.

Was still von One Thousand Voices ausgeht:

- `src/ui/data.ts` lädt genau eine Waffe; die Oberfläche importiert sie direkt.
- Die Gate-Werte (`reference-values.json`, `reference-factors.json`) nennen ihre Waffe nicht.
- Der Katalysator ist ein Schalter im Build. Was er tut, steht in der Waffe (`requiresCatalyst` an Damage Instances und Intrinsic Parts). Andere Perks einer Waffe (z. B. „mit / ohne Reaper's Tithe“ bei Truth in Aegis) gibt es noch nicht.
- Effects wie Ember of Ashes wirken über einen Zähler (Scorch), den nur One Thousand Voices hat.

## Entscheidung

1. **Eine Waffe ist eine Data File** in `src/data/weapons/<id>.json` mit dem bestehenden Schema. Alle Dateien im Ordner werden geladen; ein Test prüft, dass Ids und Codes eindeutig sind.
2. **Hauptquelle pro Waffe:** Jede Waffe nennt die Quelle ihrer Grundwerte (Schaden pro Shot, Timing). Teile aus anderen Quellen kommen als Verhältnis dazu (ADR 0011, Punkt 1).
3. **Gate pro Waffe:** Jede Waffe hat mindestens einen Gate-Wert gegen ihre Quelle, z. B. Total Damage ohne Buffs oder Aegis „visual Value“. Toleranz ±3 % wie bei Waffen-Effects (ADR 0011, Punkt 2). Gate-Werte nennen ihre Waffe (`weaponId`). Eine Waffe kommt erst in den Ordner, wenn ihr Gate besteht.
4. **Optionen einer Waffe stehen in ihrer Data File**, nicht in `effects.json`. Sie gelten nur für diese eine Waffe:
   - Der Katalysator bleibt der Schalter im Build und im Link.
   - Weitere Optionen (Perks wie Reaper's Tithe) kommen erst, wenn eine Waffe sie braucht (W1). Sie sind Faktoren aus den „mit / ohne“-Zeilen der Quelle und haben ein Gate.
5. **Ein Effect wirkt nur, wenn er zur Waffe passt.** Das ergibt sich aus den Daten, nicht aus einer Liste pro Waffe:
   - Multiplier mit `weaponTypes` oder `elements` (z. B. Particle Reconstruction nur auf Fusion Rifles).
   - Zähler-Effects nur, wenn die Waffe den Zähler hat (z. B. Ember of Ashes nur mit Scorch).
   - Die Oberfläche zeigt Effects, die auf die gewählte Waffe und auf keine gewählte Ability wirken, nicht an.
6. **Waffenwechsel:** Der Build behält Klasse, Subklasse, Abilities und Effects. Effects, die nicht mehr wirken, bleiben gewählt und erscheinen wieder, wenn die Waffe zurückwechselt. Der Katalysator geht aus, wenn die neue Waffe keinen hat.
7. **Der Optimizer wechselt die Waffe nicht.** Er sucht Builds für die gewählte Waffe. Waffen vergleicht der Spieler über „Vergleich festhalten“.

## Folgen

- Eine neue Waffe braucht nur eine Data File, Gate-Werte und Icons, keinen Code. Der Ablauf steht in `docs/guides/weapons.md`.
- Neue Mechanics (z. B. Reign Havoc bei Thunderlord) brauchen trotzdem Engine-Arbeit und ein eigenes Gate.
- Gate-Werte bekommen ein Feld `weaponId`. Bestehende Werte gehören zu One Thousand Voices.
- Links bleiben bei Format 3. Ein Link mit unbekanntem Waffen-Code meldet einen Fehler wie bisher.
- Grenzen: Perks sind nur so weit wählbar, wie die Quelle sie misst. Waffen-Stats und Perk-Pools aus dem Manifest kommen erst in v1.x.
