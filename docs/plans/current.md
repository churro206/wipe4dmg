# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Q3 Energie** (Opus plant, Sonnet baut): siehe Reihenfolge 1.

Erledigt (2026-10-26, Q2 Rest, Details im Changelog Q2a–Q2d): Glacial Quake, Bladefury und Song of Flame als Supers; Exotics über ihr Intrinsic (Stormdancer's Brace ×2,23 statt ×3, Mataiodoxía, Young Ahamkara's Spine). Befunde:
- Aegis-Zeilen mit Full Modifiers 1,00 sind nutzbar, wenn Swap sie als Basis nimmt (Ausnahme mit Grund in `tests/abilityGate.test.ts`).
- Flat Gain taugt nicht als Super-Rangfolge-Gate: Flat Gain / Aegis streut von ×0,6 bis ×5 (Exotics und Buffs uneinheitlich drin). Es bleibt das Aegis-Rangfolge-Gate.
- Zurückgestellt: **Hammer of Sol mit Sol Invictus.** Der Aegis-Import ordnet „Roaring Flames x3“ nicht `roaring-flames-3` zu (er liest nur `effects.json` und lädt online neu); Aegis misst Roaring x3 an Hammer of Sol nur ×1,06, der Text sagt +73 %. Weg: Regel „X xN“ → Effect `x-n` in Import und `tests/lib/probeAuto.ts`, Re-Import nach Skill `nach-patch`. Alternative: Würfe aus dem Compendium-Drain (5,5 % statt 12 %, 1 s statt 1,5 s, ≈ ×2).
- Banner of War: „40% Increased Bladefury Damage“ fehlt im Effect; Aegis deutet nur auf ×1,04.

## Reihenfolge

Details und Fundstellen: `docs/plans/sources-2026-10.md`.

1. Q3 Energie: Stat-Kurve (K3), Regen-Multiplikatoren (K4), eingebaute Ladungen (Frenzied Blade, Arcane Needle), Energie-Exotics und -Mods (Opus plant).
2. Aufräum-Block (Sonnet; nach drei Funktions-Blöcken fällig): `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code, `App.tsx` in Panels. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
3. Zähler für Jolt, Volatile, Unravel, Bolt Charge in der Ergebniszeile (Sonnet).
4. Hammer of Sol mit Sol Invictus (siehe oben).
5. Q4 Stasis/Strand (echte Debuffs am Ziel, Bedingung von Facet of Courage), Q5 Aspects/Artifact/Bolt Charge, Q6 Waffen und Catalysts, Q7 Set Bonuses (Umfang mit dem Inhaber klären).
6. Für 2.0 (`docs/product.md`): Legendary Frames, Optimizer mit Abilities, Aspects und Fragments.

## Entscheidungen des Inhabers

- Exotics ohne jede Schadenswirkung fallen weg.
- Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
- Eigene Quellen gelten nur für die Dauer aus ihrem Text, ab Beginn der Phase; länger nur, wenn ein modellierter Auslöser sie auffrischt. Buffs von Teammates gelten die ganze Phase.
- Effects von Teammates dürfen eigene Abilities ändern, auch klassenübergreifend (Sol Invictus → Chaos Reach, Schalter unter Fireteam Support; 2026-10-26).
- Die Rückwärtskompatibilität von Links hat keine hohe Priorität.
- Tooltips erklären, was ein Item tut, ohne Quellen.
- Legendary Frames: bis zu ihrem Block übersprungen, für 2.0 kommen sie hinein (2026-10-25).
- Abstände zählen, absolute Zahlen nicht. Der Optimizer optimiert die gewählte Phasenlänge und hat Priorität (2026-10-25).
- Größere Blöcke sind erlaubt, Commit je Teil (2026-10-26).

## Zurückgestellt (Aufräumen 2026-10-25, geringer Nutzen)

`src/data/schema.ts` und `scripts/lib/weaponPackages.ts` aufteilen; Rohdaten-Snapshots aus `src/data` nach `data/sources/`; `noUncheckedIndexedAccess`; Bundle lazy-load (`weapon-packages.json` 690 KB). Wieder aufnehmen, wenn eine Datei beim Arbeiten stört oder die Ladezeit auffällt.

## Werkzeuge

- Nach einem Patch: Skill `nach-patch`.
- UI-Check: Skill `pruefen`, Schritt 4.
