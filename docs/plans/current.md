# Aktueller Stand

Verschoben aus `CLAUDE.md` (2026-10-23). Nach jedem Block aktualisieren. Für die Website: `docs/roadmap.md`.

## Reihenfolge (Inhaber, 2026-10-23, ersetzt die Listen „Danach“ unten)

Breite vor Genauigkeit, ganze Kategorien pro Block (Regel in `CLAUDE.md`). Modell: Plan mit Opus, Umsetzung nach Muster mit Sonnet.

1. **Abilities aus Compendium-Teilen** (ADR 0009, U9 `build:abilities`) statt Aegis-Pakete zu zerlegen. Aegis bleibt Gate mit ±15 %. Keywords, Ember und Fragments (Whisper of Fissures, Touch of Thunder, Jolt in Stormtrance, Volatile in Pocket Singularity) kommen als eigene Teile dazu und zählen damit nicht doppelt. Opus: Plan und erste Ability als Muster, Sonnet: die restlichen.
   - ✅ **Muster (2026-10-23, Opus):** Regeln R1–R3 in `scripts/lib/abilityComponents.ts`, `npm run build:abilities` schreibt `src/data/ability-components.json` und `docs/ability-import.md` (alle 75 mit Abweichung). Freigeschaltet über `COMPONENT_ABILITY_IDS`: Thundercrash (−12 %), Fusion Grenade (−4 %). Loader (`loadAbilities`, Parameter `abilityComponents`): Teile ersetzen das Paket der Basis, Werte pro Treffer des Super-Timings (`atHits`), Varianten = Basis-Teile × Aegis Variante ÷ Basis (`scaled`). Gate ±15 % (`COMPONENT_TOLERANCE`), simuliert Teile mit `row.includedEffectIds` als Effects. Szenario „Thundercrash from Compendium parts“ im Plausibilitäts-Gate.
   - ✅ **Ohne neue Regel (2026-10-23, Sonnet):** 16 weitere Abilities bestehen das Gate schon mit R1–R3 und sind über `COMPONENT_ABILITY_IDS` freigeschaltet (Deadfall, Solar, Thermite, Tripmine, Axion Bolt, Disorienting Blow, Seismic Strike, Lightweight Knife, Weighted Throwing Knife, Hammer Strike, Incinerator Snap, Phantom Surge, Snare Bomb, Shield Bash, Frenzied Blade, Arcane Needle); 18 von 75 nutzen jetzt Teile. Test prüft: jede freigeschaltete besteht das Gate. Knapp daneben (≤ ±20 %): Arcbolt, Flashbang, Firebolt, Suppressor, Celestial Fire.
   - ✅ **Grenades und Melees, Regeln R4/R5 (2026-10-23, Sonnet):** R4 „every X seconds up to N times“ (erste Zahl von „N+M“), R5 „Gesamtwert ersetzt die Alternativen davor“ („with all/both“, „increased … to“, „maximum of“; Guardians-Sätze zählen nicht), Tests in `tests/abilityComponents.test.ts`. Neu über Teile: Magnetic Grenade (−6 %), Vortex Grenade (+6 %), Celestial Fire (−12 %); 21 von 75. Knapp daneben: Suppressor (−15,x %), Arcbolt (−17 %), Flashbang, Firebolt, Storm Grenade (−16 %), Skip (+17 %); Flux und Incendiary bleiben bei ca. −16 bis −20 %.
   - ✅ **Abschluss (Inhaber, 2026-10-23, Opus):** Supers bleiben Paket. 20 von 22 liegen −93 % bis +986 % daneben, Treffer aus Geminis Schätzungen, das Aegis-Paket ist gemessen. Doppelzählung behoben: Das Gate ließ die Waffe Jolt und Volatile auslösen (Waffe jetzt ohne Schaden); Pocket Singularity zählte nie doppelt (Aegis 1 Tick 979). `superTriggers` rechnet jetzt auch Keywords mit „damage taken“ nach: Stormtrance 13 Jolts, Gathering Storm 1 Jolt, Nova Warp 7 Volatile aus dem Paket. Regel im Gate gilt für alle Keywords (±2,5 %), `KEYWORD_COUNTS_TWICE` entfernt. Block 1 ist fertig.
   - Falls später doch Teile: Baustellen aus `docs/ability-import.md`:
     - Namen „Hit“ für Werte ohne Wort davor; mehrere Werte im Text sind oft Alternativen (geladen/ungeladen, „with all/both“ als Gesamtwert, R3 aus dem Plan noch offen) statt Summanden, z. B. Flux, Incendiary, Skip, Magnetic, Scatter, Ballistic Slam („~1,000“ ist eine Obergrenze).
     - Anzahlen aus Wörtern („Creates 5 Stasis Crystals“, Messer, Projektile) fehlen; Glacier: Aegis entspricht eher 7 Kristallen.
     - Nova Bomb: Vortex ergibt 76,9 Ticks (Intervall falsch gelesen).
     - Supers mit mehreren Treffern: `atHits` verbietet Ticks pro Treffer bei mehreren Treffern; Werte pro Angriff mit der Kombo von Aegis abgleichen.
     - Fragments als Teile: `AbilityComponent.requiresEffectIds` (zählt nur mit Effect) plus Effects Whisper of Fissures (25 pro Shatter, Clarity) und Touch of Thunder. Erst bauen, wenn Glacier/Shatter oder Storm/Pulse drankommen.
2. **Nächster Block: Alle Buffs, Debuffs, Mods und Artifact-Perks** aus Court und Compendium in einem Block, als Schalter (u. a. Feast of Light, Banner of War, Expanding Abyss). Plan Opus, Umsetzung Sonnet.
3. **Energie einfach:** Cooldown aus Compendium und Stat ergibt die Casts pro Damage Phase; Refunds als Prozent aus dem Text (ersetzt U7 mit langem ADR; kurze Notiz in ADR 0015 genügt). Plan Opus, Umsetzung Sonnet.
4. **Restliche Exotics, Aspects, Fragments** in einem Block, `derived` aus dem Text; Facet of Courage, Melee-Bucket (U6-4), Exotics mit eigenem Schaden, Class Items (U6-3). Sonnet.
5. **Gesamtprobe mit Meta-Builds** aus Aegis Sustained und Swap (10 bis 15 Builds im richtigen Verhältnis), danach Feinschliff nur, wo die Probe daneben liegt. Opus.

## Bekannte Ungenauigkeiten

- Super-Timings aus Geminis Schätzungen (`unverified`).
- 26 Catalysts „unbekannt“, Symmetry-Grundwert vermutlich zu niedrig.
- Reload-Faktor aus d2foundry nur relativ (absolut 0,44- bis 1,5-fach gegen Aegis).
- Deadshot liegt bei Aegis 40 % unter dem Compendium (vermutlich Falloff).
- Thundercrash aus Teilen 12 % unter Aegis: Aegis' Aftershock-Summe entspricht etwa 16 Ticks à 108, das Compendium nennt 4 („every second for 4 seconds“).
- 54 von 75 Abilities (alle Supers außer Thundercrash und Deadfall, einige Grenades/Melees) nutzen weiter das Aegis-Paket, weil ihre Teile außerhalb ±15 % liegen. Knapp daneben: Suppressor, Arcbolt, Flashbang, Firebolt, Storm, Skip (15 bis 17 %).
- Keyword-Anteil in Super-Paketen ohne Ticks: nachgerechnet mit gleich großen Treffern (Wipe ÷ Treffer aus Geminis Timings).
- Abilities aus Teilen gegenüber ihren Paket-Varianten: Varianten skalieren alle Teile gleich (Aegis-Verhältnis), auch wenn das Exotic nur einen Teil ändert.

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
  1. ✅ (2026-10-23, über `superTriggers`) Doppelzählung allgemein: Jolt/Volatile aus Paketen (Stormtrance, Pocket Singularity); ein Baustein für alle Keywords, der den Event-Run der Engine nutzt statt `superTriggers` nachzubauen; Regel-Test „jede Ability mit Keyword ergibt allein ihren Aegis-Wert“.
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
