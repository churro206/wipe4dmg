# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block: B3a Teil 2 (Sonnet)

Branch `ground-up-model`, kein Merge ohne Ansage. Jede Abweichung vom Bauplan vorher mit dem Inhaber klären. Gate je Commit: Suite, `tsc -b`, `lint`; `scenario-bench.md` und `mechanics-baseline` unverändert. Test zuerst.

Korrekturen K1–K4 erledigt (2026-11-01, Changelog): Bedingungen sehen den Zustand vor dem Ereignis, `refill` im Host (Fehler bei geplantem Reload bis B3b), `spawn` ohne Rückfall, Weaken als Status in `keywords.json`. Teil 2 darf nun auf `refill`, `spawn`-Zeiten und `modifiersOnTarget` bauen.

**Teil 2** (Rest von Schritt 3; lesen: Bauplan 6, `core/rules.ts`, `core/simulateCore.ts` „Rules of the weapon“, `tests/polarisGolden.test.ts`; `weapon-packages.json` nie direkt lesen), je ein Commit:

1. ~~Teile~~ erledigt (2026-11-01, Changelog): `partRules.ts`, `hitEvents` weg. Übergang: `requiresSetup` prüft der `spawn` (bis Schritt 3), `partHitsMs` bis B3b.
2. ~~Spielweisen~~ erledigt (2026-11-01, Changelog): `Weapon.playstyles`, Bedingung `playstyle`, Takt per `modifyStat` auf `phaseStart`; `withPlaystyle` weg. `requiresSetup` auf den Ring-Treffern bleibt bis Schritt 3.
3. Hierarchy: `setup`, `requiresSetup` → Zähler, `setMode`, `phaseStart` („Pre-stacked“, „Setup steht“), Bedingung `mode`; `weaponActor` liest Takt, Reload, Halten aus `StatModifier`.
4. Catalyst-Fenster: `windowSeconds` → `grantBuff`; `buffPartsAt` in `multiplierAt` (Grenze `<=`).
5. `IntrinsicPart.appliesKeyword` → `on hit → applyStatus`. Entfernte Felder aus `REMAINING` streichen.

## Stand

- 2026-11-01: B3a Teil 1 plus K1–K4 (Changelog): Regel-Engine, Status-Container, `Weapon.rules`/`buffs`, Golden Polaris nach Bauplan. Suite 2120 grün (nach Teil 2, Schritt 2). Planmäßig noch nicht im Host: `damage`, `addResource`, `actor`; `refill` bei geplantem Reload und die Wirkung von Weaken auf die Formel kommen mit B3b.
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
