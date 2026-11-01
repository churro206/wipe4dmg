# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Block: B3b Effects und Abilities (Sonnet), freigegeben 2026-11-01

Ein Block, je Schritt ein Commit (Inhaber 2026-11-01). Kein Merge. Gate je Commit: Suite, `tsc -b`, `lint`; `scenario-bench.md`, `mechanics-baseline` unverändert (außer Schritt 5). Test zuerst. Lesen: Bauplan 6, `core/*.ts`, `effectParts.ts`.

1. **Modifier (erledigt 2026-11-01; `passiveActionModifiers` ungenutzt, siehe Changelog):** `Effect.parts` → `Effect.modifiers: Modifier[]` (`parts` heißt im Item-Format Schadensteile). `timing` → `stat reload` (0 = kein Reload, ohne Buchung), `holdDraw` → `stat drawHold`, `counterModifier` → `ActionModifier` (`passiveActionModifiers`, Ausschluss `includedEffectIds` wie heute). Actor liest Stat-Modifier aus Effects und Regeln. Generatoren, `effects.json`, Oberfläche ziehen mit; neu bauen per Skill `nach-patch`.
2. **Effects als Besitzer (erledigt 2026-11-01, Baseline unverändert, siehe Changelog):** `Effect.rules`/`buffs`, Besitzer mit `activeAt` (Fenster); `hitStacks` → Buff mit `on hit`-Regeln; `partHitsMs`, `stacksAt` weg.
3. **`appliesKeyword`, `periodicDamage` (erledigt 2026-11-01, Baseline unverändert, siehe Changelog):** `on hit` → `applyStatus`; `timer.everyMs` + `damage`. `keywordPartsAt` im Container bleibt für Ability-Teile bis Schritt 4.
4. **Abilities (erledigt 2026-11-01, Baseline unverändert, siehe Changelog):** `Ability.rules`, Treffer mit `part`, `on cast`; `keywordParts` und `refillsMagazine` weg; Waffe plant per Generation neu (`actor.refill`).
5. **Waffenseite (erledigt 2026-11-01, Baseline des Handmodells gewollt geändert, siehe Changelog):** `ImportPart` (`partRules.ts`) trägt `requiresCatalyst`, `everyNthShot`, `tickFactors`; `intrinsicParts` weg; Fixture OTV als Regeln (Detonation, Scorch, Ignition aus `keywords.json`, Seeker-Grenze per Zähler).
6. **Abschluss (erledigt 2026-11-01, siehe Changelog):** `REMAINING` leer, Optimizer 24 ms (Grenze 306), Bauplan-Tabelle und Roadmap nachgezogen. Offen: Entscheidung des Inhabers zu Nullschaden-Treffern (Detonation, Seeker-Ende) in der Aufschlüsselung.

## Stand

- 2026-11-01: B3a fertig (Teil 1, K1–K4, Teil 2 Schritte 1–5; Changelog). B3b fertig (Schritte 1–6). Suite 2126 grün. Nächster Block: B4 (Format, Polaris/Truth/Hierarchy), Plan mit Opus.
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
