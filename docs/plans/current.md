# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Block: B3b Effects und Abilities (Sonnet), freigegeben 2026-11-01

Ein Block, je Schritt ein Commit (Inhaber 2026-11-01). Kein Merge. Gate je Commit: Suite, `tsc -b`, `lint`; `scenario-bench.md`, `mechanics-baseline` unverändert (außer Schritt 5). Test zuerst. Lesen: Bauplan 6, `core/*.ts`, `effectParts.ts`.

1. **Modifier:** `Effect.parts` → `Effect.modifiers: Modifier[]` (`parts` heißt im Item-Format Schadensteile). `timing` → `stat reload` (0 = kein Reload, ohne Buchung), `holdDraw` → `stat drawHold`, `counterModifier` → `ActionModifier` (`passiveActionModifiers`, Ausschluss `includedEffectIds` wie heute). Actor liest Stat-Modifier aus Effects und Regeln. Generatoren, `effects.json`, Oberfläche ziehen mit; neu bauen per Skill `nach-patch`.
2. **Effects als Besitzer:** `Effect.rules`/`buffs`, Besitzer mit `activeAt` (Fenster), Regeln feuern nur im Fenster. `hitStacks` → Buff (`perStack` plus `bossFactor` im Bucket, Dauer `refreshMs`) mit `on hit` (weapon, Waffentyp) → `grantBuff`/`addStacks`; `partHitsMs`, `stacksAt` weg. Ändert `on hit` statt Schuss die Baseline: Befund, Rückfrage.
3. **`appliesKeyword`, `periodicDamage`:** `on hit` → `applyStatus`; `timer.everyMs` + `damage` (Host: `damage`, Ticks im Fenster wie `periodicEvents`). `keywordPartsAt` weg.
4. **Abilities:** `on cast` an die Regeln, Treffer mit `part` = Komponente; `keywordParts` → Regeln (Loader). `refillsMagazine` → `on cast → refill`, Waffe plant neu (Generation): Fehler aus K2 und `refillsMs` weg; `nextCastFor` fragt die Regel. Gleichstand wie heute.
5. **Waffenseite:** `requiresCatalyst`, `everyNthShot`, `tickFactors` in einen Import-Typ; `intrinsicParts` weg. Fixture OTV übersetzen (Inhaber 2026-11-01): Detonation ohne Schaden (9×, 66,7 ms, ab 700 ms) → `applyStatus scorch 10`; Ignition aus `keywords.json` statt 890; Seeker-Grenze 5 per Zähler (+1, −1 beim Ablauf per Hilfsteil). Baseline des Handmodells ändert sich gewollt, Liste im Commit.
6. **Abschluss:** `REMAINING` leer, Optimizer ≤ 306 ms, Bauplan, Changelog, Roadmap.

## Stand

- 2026-11-01: B3a fertig (Teil 1, K1–K4, Teil 2 Schritte 1–5; Changelog). Suite 2130 grün.
- B3.0, B2, B1 erledigt. Bauplan (ADR 0018), Ansicht: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.
- Offen ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt.

## Reihenfolge

B3a → B3b → B4 (Format, Polaris/Truth/Hierarchy) → Aufräumen → P (Prüfstand: Sustained, Swap, Abilities, Testing) → B6 (Breite als Item-Dateien) → C (Casts und Energie) → B5 (Eichung zuletzt). Begründung und Kennzahl in `ground-up-model.md`, „Reihenfolge“. Danach `sources-2026-10.md`; 2.0 in `docs/product.md`.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 haben hohen Stellenwert: so eng wie möglich folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken (`addResource`, `modifyAction`, `actor`) sind kein Vorrat; „Vorrat“ heißt Mechaniken, die es im Spiel nicht gibt.
- Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt (`19cddbb`). Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
