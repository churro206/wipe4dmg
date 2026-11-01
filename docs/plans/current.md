# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B3a, Korrekturen, dann Teil 2 (Sonnet)

Branch `ground-up-model`, kein Merge ohne Ansage. Jede Abweichung vom Bauplan vorher mit dem Inhaber klären. Gate je Commit: Suite, `tsc -b`, `lint`; `scenario-bench.md` und `mechanics-baseline` unverändert. Test zuerst.

**Korrekturen** (Befund 2026-11-01: Teil 1 wich ohne Not vom Bauplan ab), je ein Commit:

- K1 Alle Regeln eines Ereignisses prüfen ihre Bedingungen gegen den Zustand **vor** dem Ereignis, dann laufen die Aktionen in Dateireihenfolge (nur so passen 5.4 und Abschnitt 11). Bauplan 5.4 und `ruleTypes.test.ts` zurück aufs Original (`< 4` zählt, `= 4` zündet), Hinweis unter 5.4 streichen, Golden-Test auf diese Regeln, Unit-Test „spätere Regel sieht frühere“ umdrehen.
- K2 `refill` im Host: füllt auf, solange kein Reload geplant ist, sonst Fehler bis zur Generation (B3b); Golden-Test mit der `refill`-Regel aus 5.4.
- K3 `spawn` ohne Rückfall auf den Teil: ohne Angabe Verzögerung 0, Anzahl 1, Abstand 0 (Abschnitt 6).
- K4 Weaken als Eintrag in `keywords.json` (Status-ID, Multiplier im Bucket `debuff`, Dauer, Quelle wie der Weaken-Effect); Zustand im Container mit Test; Wirkung auf die Formel mit dem ersten Nutzer in B3b.

**Teil 2** (Rest von Schritt 3; lesen: Bauplan 6, `core/rules.ts`, `core/simulateCore.ts` „Rules of the weapon“, `tests/polarisGolden.test.ts`; `weapon-packages.json` nie direkt lesen), je ein Commit:

1. Teile: `scripts/lib/weaponPackages.ts` schreibt je Teil `on shot → spawn` mit Zeiten in der Aktion (`requiresCatalyst` → `hasItem catalyst`; `everyNthShot` → Zähler; `tickFactors` → je Tick `spawn` mit `factor`). `hitEvents` fällt weg; Treffer des N-ten Teils zählen weiter für `hitStacks` (`partHitsMs`, bis B3b).
2. Spielweisen: `DamageInstance.playstyle`, `playstyleBaseName` → `Weapon.playstyles` und Bedingung `playstyle`; Takt per `modifyStat`.
3. Hierarchy: `setup`, `requiresSetup` → Zähler, `setMode`, `phaseStart` („Pre-stacked“, „Setup steht“), Bedingung `mode`; `weaponActor` liest Takt, Reload, Halten aus `StatModifier`.
4. Catalyst-Fenster: `windowSeconds` → `grantBuff`; `buffPartsAt` in `multiplierAt` (Grenze `<=`).
5. `IntrinsicPart.appliesKeyword` → `on hit → applyStatus`. Entfernte Felder aus `REMAINING` streichen.

## Stand

- 2026-10-31: B3a Teil 1 (Changelog): Regel-Engine, Status-Container, `Weapon.rules`/`buffs`, Golden Polaris. Suite 2099 grün. Planmäßig noch nicht im Host: `damage`, `addResource`, `actor`.
- B3.0, B2, B1 erledigt. Bauplan (ADR 0018), Ansicht: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.
- Offen ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt.

## Reihenfolge

B3a → B3b → B4 (Format, Polaris/Truth/Hierarchy) → Aufräumen → P (Prüfstand: Sustained, Swap, Abilities, Testing) → B6 (Breite als Item-Dateien) → C (Casts und Energie) → B5 (Eichung zuletzt). Begründung und Kennzahl (Abdeckung je Gruppe) in `ground-up-model.md`, „Reihenfolge“ (Review 2026-11-01). Danach `sources-2026-10.md`; 2.0 in `docs/product.md`.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 haben hohen Stellenwert: so eng wie möglich folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken (`addResource`, `modifyAction`, `actor`) sind kein Vorrat; „Vorrat“ heißt Mechaniken, die es im Spiel nicht gibt.
- Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt (`19cddbb`). Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
