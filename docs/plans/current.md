# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B3a, Teil 2 – Import schreibt Regeln (Sonnet)

Rest von Schritt 3 in `docs/plans/ground-up-model.md`. Zuerst lesen: Bauplan Abschnitt 6, `src/engine/core/rules.ts` (Host-Schnittstelle), `src/engine/core/simulateCore.ts` (Abschnitt „Rules of the weapon“), `tests/polarisGolden.test.ts` (so sehen Regeln einer Waffe aus). Branch `ground-up-model`, **kein Merge nach `master`** ohne Ansage. `weapon-packages.json` nie direkt lesen (nur `npm run facts`). Gate je Teil: Suite grün, `tests/__snapshots__/scenario-bench.md` und `mechanics-baseline` unverändert (Delta-Paare 1 von 3), `tsc -b`, `lint`. Ein Commit je Teil, in dieser Reihenfolge:

1. **Teile:** `scripts/lib/weaponPackages.ts` schreibt je `DamageInstance` eine Regel `on shot → spawn` (`requiresCatalyst` → Bedingung `hasItem catalyst`; `everyNthShot` → Zähler `nth-<Teil>`, bei = N `resetCounter` und `spawn`; `tickFactors` → je Tick ein `spawn` mit `factor`). Dann fällt die Schleife `hitEvents` in `simulateCore.ts` weg. Treffer des N-ten Teils zählen für `hitStacks` (`history.partHitsMs`, bis B3b): der Host merkt sie.
2. **Spielweisen:** `DamageInstance.playstyle` und `Weapon.playstyleBaseName` → `Weapon.playstyles` (`id`, `label`) und Bedingung `playstyle`; Takt der Spielweise per `modifyStat` (`phaseStart`); `withPlaystyle`, `playstylesOf`, `WeaponSection` und `buildLink` folgen.
3. **Aufbau (Hierarchy):** `Weapon.setup` und `requiresSetup` → Zähler, `setMode`, `phaseStart`-Regeln („Pre-stacked“, „Setup steht“), Bedingung `mode`; Takt des Catalysts ab Aufbau per `modifyStat`. `weaponActor` liest Takt, Reload und Halten aus `StatModifier` (Gleichstand: Schuss genau beim Ablauf baut neu auf).
4. **Catalyst-Fenster:** `WeaponOption.windowSeconds` → `grantBuff`; `buffPartsAt` fließt in `multiplierAt` (Grenze heute einschließlich, `<=`).
5. **Waffe wendet Status an:** `IntrinsicPart.appliesKeyword` → `on hit → applyStatus`. `noReloads` bleibt Eingang des Imports. Jedes entfernte Feld aus `REMAINING` in `tests/ruleTypes.test.ts` streichen.

## Stand

- 2026-10-31: **B3a Teil 1 erledigt** (Details Changelog): Regel-Engine (35 Tests), Status-Container (`status.ts` ersetzt `keywordRun` und `burn`), `Weapon.rules`/`buffs`, Golden Polaris (10,5 s und 30 s, mit und ohne Ember, gleich wie der bisherige Weg). Suite 2099 grün. **Befund:** Bauplan 5.4 zündete bei 4 statt 5 (Dateireihenfolge); Beispiel angepasst, Engine nicht.
- Im Kern-Host noch nicht angeschlossen (Fehlermeldung): `refill` (braucht Generation statt Vorausschau, B3b), `damage`, `addResource`, Bedingung `actor`. Weaken als Status-Definition mit `modifiers` kommt mit dem ersten Nutzer in B3b (Frage an den Inhaber, ob das passt).
- B3.0, B2, B1 erledigt. Bauplan angenommen (ADR 0018), Ansicht: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.
- Offen ohne Quelle: Dragon's Breath (Pool-Takt „?“), Ager's Scepter, Celestial Nighthawk auf Still Hunt.

## Reihenfolge

B3a Teil 2, B3b, Szenarien aus Abilities/Testing vor B5, B4–B6 (`ground-up-model.md`, Aufräum-Block nach B4). Danach `sources-2026-10.md` (Energie-Exotics, Hammer of Sol, Q4–Q7); 2.0 in `docs/product.md`.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018; auf dem Branch bleiben, Merge nur auf Ansage; eng an Bauplan und Plan halten.
- Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Effects von Teammates dürfen eigene Abilities ändern (Sol Invictus → Chaos Reach).
- Energie-Mods abgelehnt (Revert `19cddbb`). Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Größere Blöcke erlaubt, Commit je Teil.

Zurückgestellt: `schema.ts` aufteilen, Rohdaten-Snapshots verschieben, `noUncheckedIndexedAccess`, Bundle lazy-load. Nach einem Patch: Skill `nach-patch`; UI-Check: Skill `pruefen`.
