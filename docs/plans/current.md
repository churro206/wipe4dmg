# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen in `docs/known-inaccuracies.md`. Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Block: B4a Format, freigegeben 2026-11-01 (Schritte 1–3 fertig; 4–5 mit Sonnet)

Je Schritt ein Commit, Test zuerst. Gate je Commit: Suite, `tsc -b`, `lint`; `scenario-bench.md`, `mechanics-baseline` nur gewollt geändert (Liste im Commit). Lesen: Bauplan 5, 6, 12, 13; `scripts/lib/partRules.ts`, `timingFromQuantum`/`timingFromAegis` in `weaponPackages.ts`.

1. **ERLEDIGT (81560da):** Quantum gegen Aegis, Kriterium verfehlt (Schaden 63 %, Takt 17 %, Reload 12 % innerhalb 2 %). Item-Grundwerte per `$aegis` (`fitted`); `$quantum` nur für Felder mit Stichprobe (Polaris-Schuss, Schritt 5, offen beim Inhaber ob das bleibt). Ergebnis in Bauplan 13.
2. **ERLEDIGT (aedfcee):** Status `derived` in `Source`, Generator und `superWindow.ts`; Test `tests/derivedStatus.test.ts`. Suite 2128 grün.
3. **ERLEDIGT:** Item-Schema (`schema.ts`, „Items“), `scripts/lib/items/refs.ts` (Grammatik oben in der Datei), `weaponItem.ts` (`resolveWeaponItem` → `{ weapon, review }`), `scripts/lib/hash.ts`; Test `tests/itemResolve.test.ts`. Manifest-Stat als `.stat("<Stat>")`. Teile der Datei sind Einzeltreffer (`parts`: Name, Schaden, `precision`, `delivery`), Identität und Intrinsics aus dem Manifest, Code aus `weapon-codes.json`. Für Schritt 5 offen: Loader für `src/data/items/weapons/*.json` (Dateiname = `id`), `review` in `docs/weapon-import.md` und der Konsole von `build:weapons`; `ItemSources` aus den Snapshots laden; verschachtelte Objekte prüft `Weapon` nicht strikt (Tippfehler in Regeln fallen still weg, im Test nachsehen).
4. **Kanonische Skala (I6):** `DamageInstance.scale` als Feld statt Raten aus dem Quellnamen; `src/data/theta.json` mit einem Faktor je Skala und Damage Source, der Kern multipliziert, `aegisVisual` = 1. Startwert 1 (Median aus Schritt 1 in der Notiz), Basis unverändert; Eichung in B5. Test mit Faktor ≠ 1.
5. **Polaris Lance als Item:** `build-weapons` ersetzt das Paket durch das Item (`code` stabil); kein Reload über `on hit precision → refill 1` statt `noReloads`; Override weg; `tests/itemFiles.test.ts` (jedes Item löst auf, kein Override zu einem Item). Gewollt: Schuss aus Quantum (+0,3 %); Perfect Fifth bleibt `$aegis`.

Danach B4b (Truth, Hierarchy, Abschluss): Schritte 6–8 in `ground-up-model.md`, Abschnitt B4.

## Stand

- 2026-11-01: B3a, B3b fertig, Suite 2126 grün. B4 geplant (Opus). Bauplan: <https://claude.ai/artifact/2pmKihDrFaJvRdtDwJzBR8>.
- Offen ohne Quelle: Dragon's Breath, Ager's Scepter, Celestial Nighthawk auf Still Hunt. Offen beim Inhaber: Nullschaden-Treffer in der Aufschlüsselung.

## Reihenfolge

B4a → B4b → Aufräumen → P (Prüfstand) → B6 (Breite) → C (Casts, Energie) → B5 (Eichung). Begründung in `ground-up-model.md`.

## Entscheidungen des Inhabers

- Bauplan und ADR 0018 eng folgen. Merge nur auf Ansage (2026-11-01: noch nicht).
- Aktionen für bekannte Mechaniken sind kein Vorrat. Exotics ohne Schadenswirkung fallen weg. Ein Boss, keine Adds. Kill-Buffs nur mit „Vorher aufgebaut“.
- Eigene Quellen nur für die Dauer aus ihrem Text; Buffs von Teammates die ganze Phase; Teammates dürfen eigene Abilities ändern.
- Energie-Mods abgelehnt. Links ohne Rückwärtskompatibilität. Legendary Frames für 2.0. Commit je Teil.
