# Aktueller Stand

Höchstens 4 KB. Nach jedem Block pflegen: Erledigtes in `docs/changelog.md`, Abweichungen und Lücken in `docs/known-inaccuracies.md`. Altes Archiv: `docs/plans/history-2026-10.md` (nur per Grep).

## Nächster Block

**Aufräum-Block** (Sonnet; nach drei Funktions-Blöcken fällig, Reihenfolge Punkt 1).

Erledigt (2026-10-26, Details im Changelog): Q2 Supers; Q3a Stat-Kurven (RyTako); Q3b eingebaute Ladungen; Q3 Teil 4 Energie-Mods (7 Mods × 1–3 Kopien; Kickstarts, Fonts, Armor Charges weggelassen). Befunde:
- Energie-Effects (`changesEnergy`) überspringt der Optimizer (ohne Rotation wirkungslos, sonst Speicherüberlauf). `tests/optimizer.test.ts` braucht schon vorher etwa 50 s.
- Die Mods ändern den Total Damage in den Gate-Szenarien nicht (×1,000), weil die Melee nur früher kommt. Erst mit einem Optimizer für Rotationen (2.0) zählt das.
- Aegis-Zeilen mit Full Modifiers 1,00 sind nutzbar, wenn Swap sie als Basis nimmt (Ausnahme mit Grund in `tests/abilityGate.test.ts`).
- `tests/mechanicsBaseline.test.ts` überschreitet im vollen `test:quiet` die 5 s (Last), allein läuft er in 2 s grün; Snapshot unverändert.
- Zurückgestellt: **Hammer of Sol mit Sol Invictus.** Der Aegis-Import ordnet „Roaring Flames x3“ nicht `roaring-flames-3` zu; Aegis misst nur ×1,06, der Text +73 %. Weg: Regel „X xN“ → Effect `x-n` in Import und `tests/lib/probeAuto.ts`, Re-Import nach `nach-patch`. Alternative: Würfe aus dem Compendium-Drain (≈ ×2).
- Banner of War: „40% Increased Bladefury Damage“ fehlt im Effect (Aegis ×1,04).

## Reihenfolge

Details und Fundstellen: `docs/plans/sources-2026-10.md`.

1. Aufräum-Block (Sonnet): `src/engine/units.ts` statt `MS_PER_SECOND` in 9 Dateien, `strict` explizit in `tsconfig.app.json`, Regel-Logik aus `tests/lib/` nach `scripts/lib/`, toter Code, `App.tsx` in Panels. Vorher Vergleichsbasis (`test:quiet`, `sanity`, `probe`), danach unverändert.
2. Energie-Exotics (Crown of Tempests, Contraverse Hold u. a., `sources-2026-10.md` §2; Opus plant).
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
