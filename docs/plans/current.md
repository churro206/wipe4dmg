# Aktueller Stand

Verschoben aus `CLAUDE.md` (2026-10-23). Nach jedem Block aktualisieren. Für die Website: `docs/roadmap.md`.

## Stand (2026-10-22)

- **Umbau nach ADR 0015:** U1–U5, U6-1, U6-1b, U6-2 (Aspects/Fragments, Zustände) und U8 (Exotic-Auswahl, Link-Format 4) sind fertig. **Offen:** U6-3 Exotic Class Items und Transcendence, U6-4 Melee-Bucket additiv, U7 Timing (Class Ability in der Rotation, `refillOnCast`, `magazineRefill`), U9 `build:abilities`, Ember of Ashes aus `effects.json` umziehen.
- **Prüftabellen:** `docs/exotic-effects.md`, `docs/subclass-effects.md`, `docs/keyword-sources.md`, `docs/armor-import.md`, `docs/weapon-import.md`.
- **Sprache der Website (2026-10-22):** Alles, was Spieler sehen, ist englisch: Texte in `src/ui`, die Abschnitte „## For players“ in `docs/mechanics/`, `docs/roadmap.md` und die generierte `docs/coverage.md`. Zahlen im Format `en-US`. Antworten an den Inhaber, Pläne, Prüftabellen, ADRs und der Changelog bleiben deutsch.
- **Super-Timing (2026-10-22):** `src/data/super-timings.json` aus Geminis Schätzungen (`docs/sources/gemini-super-timings.csv`, Status `unverified`, vom Inhaber freigegeben). Verifizierte Compendium-Werte haben Vorrang.
- **Aspect-Varianten (2026-10-22):** Regel G in `scripts/lib/subclassEffects.ts`, gemeinsamer Baustein `src/engine/abilityVariants.ts`. Regel-Test über alle Aegis-Zeilen in `tests/aspectVariants.test.ts` mit bekannten Lücken (Facet of Courage, Touch of Thunder). Whisper of Fissures steckt in den Grundzeilen von Glacier, Shatter, Silence & Squall und Winter's Wrath (zählt immer mit).
- **Waffen und Catalysts (Inhaber, 2026-10-23, vorgezogen):** ✅ Primaries wählbar (40 von 61, unbegrenzte Munition, Bursts pro Kugel), ✅ Catalyst-Schalter für alle Waffen mit Wirkung aus den Quellen (`catalyst.effect`, Prüftabelle „Katalysatoren“ in `docs/weapon-import.md`). ✅ 131 von 141 Waffen über `weapon-overrides.json` (2026-10-23); ✅ 47 Catalysts „keine Wirkung“ per `bossParagraphs`. Gemini-Antworten verworfen (widersprachen Clarity). ✅ 135 von 141 (2026-10-23): Manifest-Stats in `manifest-weapons.json`, Override `timing.values`; Quantum rechnet Reload fest pro Waffentyp. ✅ Heartshadow (136). **Offen:** 5 Waffen (Schwerter Wolfsbane, Praxic Blade, Worldline Zero (Temporal Sprint ohne Text); Barrow-Dyad (nur mit Catalyst Target Lock), The Huckleberry (Bull Rider ohne Text)); ✅ Reload-Stat der Catalysts als Faktor aus d2foundrys Formel (`reload-formulas.json`, Inhaber 2026-10-23; trifft Aegis absolut nicht, 0,44- bis 1,5-fach). 26 Catalysts „unbekannt“: Reload nur per Perk-Text (Euphony, Edge of Concurrence, Hard Light, Lodestar, Sunshot, Prospector, MIDA), Fighting Lion ohne Reload-Stat. Quantum rechnet Reload fest pro Typ, Aegis misst pro Waffe. Offene Einzelfälle: Symmetry (Grundwert ohne Revolution-Mix zu niedrig?), Final Warning, Bastion, Skyburner's, Tessellation, Refits (Graviton Spike, Slayer's Fang, Vexcalibur).
- **Danach: Aspects und Fragments abschließen (Inhaber, 2026-10-22), in dieser Reihenfolge:**
  1. ✅ **Nutzlose Items ausblenden** (`neededStatuses` in `src/engine/weaponInfo.ts`, Regel-Test im Gate). Roaring Flames' eigener Bonus auf Solar-Abilities fehlt (zu U6-4).
  2. ✅ **Ignition bei Supers** (`superTriggers` in `scripts/lib/keywordSources.ts`, Regel im `tests/abilityGate.test.ts`). Offen: Stormtrance (Jolt) und Pocket Singularity (Volatile) zählen doppelt (bekannte Lücke im Gate); Deadshot liegt bei Aegis 40 % unter dem Compendium (vermutlich Falloff).
  3. **Whisper of Fissures:** steckt in den Grundzeilen von Glacier, Shatter, Shiver Strike, Silence & Squall, Winter's Wrath. Aegis nennt „52 Fissures“ in den Ticks, Compendium: ein Zusatztreffer pro Shatter (25 [9]). Anteil herausnehmen wie bei Ember, das Fragment fügt ihn wieder hinzu. Supers ohne Ticks bleiben bekannte Ungenauigkeit (etwa 5 %).
  4. **Touch of Thunder:** Storm aus dem Aegis-Paar „average + Spark of Magnitude“ und „… + Touch of Thunder“ ableiten und gegenrechnen. Pulse, Flashbang und Lightning bleiben bekannte Lücken.
  5. **Facet of Courage:** +10 % auf Light-Abilities (Arc, Solar, Void) gegen Ziele mit Stasis- oder Strand-Debuff (Compendium, Clarity). **Entscheidung des Inhabers: eigener multiplikativer Bucket als Annahme.** Der Melee-Teil (+50 % des Grundschadens) gehört zu U6-4.
- **Danach (Plan freigegeben 2026-10-22, Datei `~/.claude/plans/immutable-crunching-barto.md`):**
  1. Doppelzählung allgemein: Jolt/Volatile aus Paketen (Stormtrance, Pocket Singularity); ein Baustein für alle Keywords, der den Event-Run der Engine nutzt statt `superTriggers` nachzubauen; Regel-Test „jede Ability mit Keyword ergibt allein ihren Aegis-Wert“.
  2. Catalysts (Magazin, Munition, Reload aus Quantum-Zeilen mit Catalyst), klare Tooltips, Regel-Test, Hinweis-Bug.
  3. U7 Energie und Timing, **vorher ein ADR** (Casts bleiben einstellbar, Energie liefert den frühesten Zeitpunkt).
  4. U6-4 Melee-Bucket additiv. 5. Aufräum-Commit: gemeinsames Werkzeug der vier Text-Regel-Bibliotheken, dann Exotics mit eigenem Schaden. 6. Waffen-Lücken. 7. U6-3. 8. Keywords ohne Modell, Boni ohne Bucket-Quelle.
- **Danach:** gezielte Inventur der Lücken (11 Subklassen-Boni ohne Bucket-Quelle, Exotics ohne Wirkung), W1-7 Waffen-Lücken, E1 Dawn Chorus u. a., v1.1 mit Testlauf Waffe × Exotic-Rüstung.

## Entscheidungen des Inhabers

- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
- Die Rückwärtskompatibilität von Links hat keine hohe Priorität.
- Tooltips erklären, was ein Item tut, ohne Quellen.

## Werkzeuge

- **UI-Check:** `node scripts/ui-check.mjs https://wipe4dmg.pages.dev/?b=<link> <out.png> [--dark] [--width 1400] [--click "Text"]`. Cloudflare baut bei jedem Push auf `master`. Links für Builds erzeugst du mit `encodeLink(…, linkRegistry)` in einer kurzen Vitest-Datei.
- **Reihenfolge nach einem Patch:** `import:weapons`, `import:compendium`, `import:icons`, `build:weapons`, noch einmal `import:icons` (Icons neuer Pakete). Für Rüstung vorher `import:court`, `import:compendium`, `import:icons`, dann `build:armor`.
