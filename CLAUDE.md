# wipe4dmg

## Ziel

Die App berechnet den Total Damage eines Builds in Destiny 2.
Die erste Waffe ist One Thousand Voices. Später folgen fast alle Waffen.
Die Unterschiede zwischen Builds sollen stimmen. Absolute Zahlen müssen nicht mit dem Spiel übereinstimmen.
Die Spielwerte kommen aus frei zugänglichen Community-Quellen, möglichst automatisch übernommen (ADR 0005).
Zielgruppe: der Projektinhaber und seine Freunde, vor allem am PC.
Das Projekt ist privat, nicht kommerziell und nur zum Spaß.

## Dokumente

- `docs/requirements.md`: Produktvision, User Stories, Releaseplan, Glossary, Risiken.
- `docs/adr/`: Architecture Decision Records. Lies alle ADRs vor größeren Änderungen.
- `docs/data-sources.md`: Datenquellen, Messbedingungen und Messprotokoll.
- `docs/mechanics/`: Wissen über Mechanics von Destiny 2. Lies `docs/mechanics/README.md` vor Änderungen an Effects oder am Simulator.
- `docs/guides/weapons.md`: Ablauf zum Anlegen einer Waffe (ADR 0011, 0012), dazu die Liste der Stellen in der Oberfläche, die noch an One Thousand Voices hängen. Lies ihn vor Änderungen an `src/data/weapons/`.
- `docs/guides/abilities.md`: Ablauf zum Anlegen und Aktualisieren von Abilities (ADR 0009). Lies ihn vor Änderungen an `abilities.json`.
- `docs/guides/measurements.md`: Ingame-Tests des Inhabers (Ember, Explosionen, Shot-Abstand, Particle Reconstruction, Radiant auf Golden Gun). Ergebnisse ins Messprotokoll, dann in Data Files und Gates.
- `docs/coverage.md`: Abdeckung (generiert, nicht von Hand bearbeiten). Nach Änderungen an Data Files `npm run coverage` ausführen.
- `docs/plans/`: Pläne. **Aktuell: `weapons-and-exotic-armor.md` (v1.1, nächste Schritte).** Zurückgestellt: `optimizer-abilities.md`.
- `docs/ui-inspiration.md`: Vorbilder für die Oberfläche (andere Tools, Destiny 2 selbst), Logo. Lies ihn vor Änderungen an der Oberfläche.
- `docs/roadmap.md`: Woran gearbeitet wird; Quelle für die Website (US-15). Nach jedem abgeschlossenen Schritt aktualisieren.

## Sprache

- Antworte auf Deutsch in kurzen, klaren Sätzen. Erkläre jede Änderung, der Nutzer hat Grundkenntnisse.
- Code, Bezeichner, Kommentare und Data Files sind englisch.
- Verwende nur Begriffe aus dem Glossary (Damage Phase, Damage Instance, Bucket, Build, Rotation ...).
  Ein neuer Begriff kommt zuerst ins Glossary.

## Architektur

```
src/data/      Data Files (JSON) und Zod-Schema (schema.ts). Keine Logik.
src/engine/    Simulator und Optimizer. Nur reine Funktionen, kein React.
src/ui/        React-Oberfläche. Ruft nur die Engine auf. Komponenten in src/ui/components/.
public/icons/  Icons aus dem Bungie-Manifest (ADR 0008), erzeugt von npm run import:icons.
scripts/       Import-Skripte für Community-Quellen (ADR 0005). Reine Funktionen in scripts/lib/, getestet.
tests/         Vitest-Tests für die Engine. Helfer für generierte Dokumente in tests/support/.
```

## Regeln

- Keine Zahlenwerte im Code. Alle Spielwerte stehen in `src/data`.
- Jeder Wert in einer Data File hat ein `source`-Objekt. Unbekannte Werte sind `null` mit Status `missing`. Rate niemals Werte.
- **Quellen zuerst:** Fehlt ein Wert oder eine Zuordnung, oder widersprechen sich Quellen, zuerst eine Community-Quelle suchen (Clarity, DIM-Daten, weitere Reiter von Aegis und Quantum, Compendium, Court, Manifest) und als Snapshot mit Regel einbinden. Mechaniken nicht selbst herleiten. **Vor jeder gemeldeten Lücke den Skill `recherche` abarbeiten** (`.claude/skills/recherche/SKILL.md`: Quellenkatalog mit Reitern, Ablauf, Budget); eine Lücke nur mit Tabelle der geprüften Quellen melden. Den Inhaber nur fragen, wenn Quellen sich widersprechen und keine Regel entscheidet, oder bei Entscheidungen, die ihm zustehen (Umfang, Oberfläche, Prioritäten). Overrides nur mit Zitat aus einem Snapshot.
- Jede Änderung an `src/engine` braucht einen Test. Schreibe den Test zuerst.
- Pro Bucket zählt die Stacking-Regel aus `buckets.json`. Buckets multiplizieren sich untereinander.
- Der Simulator arbeitet mit Damage Instances auf einer Zeitachse (ADR 0001).
- `src/engine` nutzt keine Browser-APIs (kein `window`, kein `document`, kein `localStorage`).
  Der spätere Discord Bot führt die Engine in Node.js auf einem Raspberry Pi aus (US-13).
- Baue keine Funktion auf Vorrat. Baue nur, was die aktuelle User Story braucht.

## Arbeitsweise

1. Lies die User Story und die betroffenen Dateien.
2. Schlage einen Plan vor und warte auf Freigabe.
3. Schreibe zuerst die Tests, dann den Code.
4. Führe `npm test` aus. Melde das Ergebnis.
5. Fasse die Änderung in zwei bis drei Sätzen zusammen.

Widerspruch ist erwünscht: Sag dem Inhaber offen, wenn er sich verrennt, z. B. wenn ein Wunsch dem Ziel, den Regeln oder einem ADR widerspricht oder der Aufwand den Nutzen übersteigt.

## Aktueller Stand (2026-10-21)

**Neu am 2026-10-21 (zuerst lesen):**
- **Jetzt: Umbau nach ADR 0015 „Einheitliches Mechanik-Modell“ (angenommen).** Plan: ✅ U1 Vergleichsbasis `tests/mechanicsBaseline.test.ts` (Datei `tests/__snapshots__/mechanics-baseline.json`: alle Waffen mit und ohne Buffs und Katalysator, alle Abilities bei Stat 100 und 200, Exotics auf One Thousand Voices; gewollte Änderungen mit `npx vitest -u` und Begründung im Commit; keine Heat-Waffe im Import) → ✅ U2 Merkmale der Damage Instance (`delivery` optional in Waffen- und Ability-Daten, Damage Sources `classAbility` und `keyword`, `weaponType`/`keywordId` am Treffer; Skala per Regel aus dem Quellennamen, `src/engine/damageScale.ts`, noch ohne Umrechnung) → ✅ U3 Ereignis-Lauf (`src/engine/eventRun.ts`: Ereignisse mit Zeit und Gruppe, gemeinsamer Ziel-Zustand mit Zählern und aktiven DoT-Quellen; Waffen-Treffer, Schwelle, DoT und Ability-Treffer sind Ereignisse; Spieler-Zustand folgt mit Bolt Charge) → U4 Keywords: ✅ U4a-1 `keywords.json` (Ignition, Jolt, Volatile, Unravel, Bolt Charge; Mechanik mit Compendium-Zitat, Schaden aus der Aegis-Zeile, `loadKeywords`), ✅ U4a-2 Teil `appliesKeyword` und `src/engine/keywordRun.ts` (Jolt, Volatile, Unravel über aufgenommenen Schaden; Regeln in ADR 0015), ✅ U4a-3 Ignition über Scorch-Stapel (gemeinsamer Zähler mit der Waffe, erbt Boni der Quelle ohne Melee) und Bolt Charge (Spieler-Stapel, Entladung durch Ability-Treffer, Volatile, Unravel), ✅ U4a-4 One Thousand Voices und Two-Tailed Fox als Pakete (Scorch per Regel aus dem Compendium, Shot aus Quantum ohne Ignitions, kein Handmodell mehr; altes Modell als Fixture `tests/fixtures/one-thousand-voices-hand-model.json`), offen U4b Keyword-Quellen per Regel aus Texten → U5 eingebackene Keywords aus Ability-Paketen herausrechnen → U6 Exotic-Effekte erzeugen (Ziel aus Zitat, Court-Stufen, Bedingungen, Ability-Varianten), Exotic Class Items mit zwei Perks (nur Prismatic), Melee-Bucket additiv → U7 Timing (`refillOnCast`, Class Ability in der Rotation, `magazineRefill`; weggelassen: Reload Speed ohne Faktor, Magazin nach Sprint) → U8 Link-Format 4 und Auswahl „Exotic“ in der Oberfläche → U9 `build:abilities`. Dazu ADR 0015, Punkt 11 „Keine Handmodelle“: One Thousand Voices und Two-Tailed Fox werden in U4 Pakete mit dem Keyword Scorch, die Gate-Referenzen kommen aus Aegis-Zeilen (offen: Ignition-Cooldown 1,3 s laut Ingame-Test, 1,6 s laut Compendium), `effects.json` wird in U6 erzeugt.
- **Exotic-Rüstung (ADR 0014):** `npm run import:court` (Court-Snapshot mit Kategorien), Compendium-Reiter „Exotic Armors“, `npm run build:armor` ordnet 141 Exotics per Regeln ein (Prüftabelle `docs/armor-import.md`): 15 Ability-Varianten, 42 Schadens-Buffs, 2 Effect-Geber, 2 Waffen-Timing, 31 eigener Schaden (später), 21 nur Energie (Lücke), 14 Lücken (7 Melee, 7 Timing), 14 ohne Wirkung. Engine: `Build.exoticArmorId`, `src/engine/exoticArmor.ts`, Ability-Varianten (`variantOf`, `exoticArmorId`), Timing `reloadDuration` (nur stärkster Faktor), Bedingung `weaponMatchesSuperElement`. Weapons of Light: `banner-shield` umbenannt, ganze Phase aktiv (Annahme: wird aufgefrischt).
- **Entscheidungen des Inhabers:** Exotics, die Schaden in keiner Weise beeinflussen, fallen weg; Energie-Exotics als Lücke; eigene Damage Instances von Exotics später; Reddit-Einzelwerte vom Inhaber erlaubt (ADR 0014, Punkt 9). Super-Zeitwerte (Golden Gun, Cast) weiter ohne Quelle. Ein Boss, keine Adds: Kill-Auslöser feuern in der Damage Phase nie; Kill-Buffs mit Dauer als Option „vorher aufgebaut“ (ADR 0015). **Arbeitsweise in der Shell:** Dateien nur mit Edit/Write ändern, mit Grep/Read suchen; Bash nur für npm, git und einfaches grep (die Lese-Sperre fragt sonst bei `node -e` und `sed -i` nach).
- **Arbeitsweise:** Skill `recherche` (`.claude/skills/recherche/SKILL.md`, Quellenkatalog) vor jeder Lücke; große Umbauten vorher per Recherche absichern. Oberfläche U4 erledigt (Logo, Instrument Sans, `docs/ui-inspiration.md`).

**Stand bis 2026-10-20:**

Für die nächste Session. Details: `docs/roadmap.md`, `docs/coverage.md`, `git log`.

- **v1.0.0 veröffentlicht (Tag `v1.0.0`, Versionsanzeige im Footer aus `package.json` über `__APP_VERSION__`).**
- **Weiter geht es mit `docs/plans/weapons-and-exotic-armor.md`:** ✅ 7 (v1.0 formal) → ✅ W0 Waffen-Fundament → W1 Waffen-Import (ADR 0013; ✅ W1-1 Snapshots, ✅ W1-2 Manifest, ✅ W1-3 Arten der Annahmen automatisch (`scripts/lib/weaponAssumptions.ts`, Regelkette und Wechselwirkungen Rüstung ↔ Waffe ↔ Ability), ✅ W1-4 Pakete und Prüftabelle (38 Pakete, 41 Lücken; `scripts/lib/weaponPackages.ts`), ✅ W1-4b Aegis „Sustained“ als zweite Timing-Quelle (44 Pakete, 35 Lücken), ✅ W1-4c eine Wahrheit pro Feld (Manifest nur Struktur, Zahlen von der Community; Manifest-Stats sind Anzeigewerte) und Timing trotz fremder Annahmen per Text (`timingImpact`; 47 Pakete, 32 Lücken), ✅ W1-4d Clarity als Quelle (Katalysator, Timing-Regeln, White Nail, Honed Edge, Basis aus Katalysator-Zeile) und Overrides mit Zitat (Sleeper, Two-Tailed Fox; 49 Pakete, 30 Lücken), ✅ W1-5 Katalysator-Optionen im Simulator (Bucket aus den Daten), eingerechnete Multiplier-Effects herausgerechnet (Slayer's Fang: Weaken), übrige eingerechnete Effects zählen nicht doppelt; Link-Format 4 zurückgestellt, bis es wählbare Perk-Optionen gibt; ✅ W1-6 Waffenauswahl (`WeaponPicker`, `weaponInfo.ts`, 49 Waffen wählbar), weiter mit W1-7: Lücken tiefer durchsuchen (zuerst Quantum-Reiter „Swords“), dann Abschluss W1) → E0 Exotic-Rüstung → E1 Dawn Chorus u. a. (Court-Import) → v1.1. W2 entfällt. Feedback des Inhabers zu v1.0: Bedienung passt; spannend wird Waffe × Exotic-Rüstung.

- **Gate v1.0 teilweise erfüllt:** Inhaber hat getestet, die Freunde testen parallel zu v1.1.
- **US-14, Entscheidung in ADR 0009:** Abilities bestehen aus Ability Components (Compendium). Fehlen Teile oder fällt die Ability durchs Gate, gilt ein Aegis-Paket. Aegis ist das Gate (±10 % bei Stat 100 und 200).
- **Erledigt:**
  - Importe für Aegis-Abilities, Compendium-Snapshot (mit Zitat-Check) und Manifest-Abilities.
  - Engine: Abilities auf der Zeitachse, Ability Stat linear pro Punkt, Super Window (cast, shots, drain), `includedEffectIds` gegen doppelte Buffs, `grantsEffectIds`, Schaden und Breakdown pro Damage Source.
  - Daten: 25 Supers, 26 Grenades und 24 Melees als Pakete. Lücken stehen mit Grund in `ability-gaps.json`. Klasse, Subklasse, Prismatic und Icons kommen aus dem Manifest.
  - Link-Format 3. Format 2 bleibt lesbar.
  - Fähigkeiten-Panel in der Oberfläche (6b).
- **Quellen-Abgleich (2026-10-20):**
  - Courts Stacking Guide vollständig gelesen (etwa 100 Effects, 17 im Modell). Surge 1x bis 4x = 10/17/22/25 %. Amplification, Weapon Perks und Exotic Intrinsics stapeln auch untereinander; diese Buckets und `surge-3x` sind jetzt `verified`.
  - Neu und noch nicht im Modell: Melee-Buffs addieren sich, Expanding Abyss, Radiant auf Golden Gun und Still Hunt (Liste in `docs/mechanics/damage-stacking.md` und `docs/roadmap.md`).
  - MossyMax ist veraltet (v1.9.2, Februar 2025), nur als Hinweis. Gemini schlug keine neue Quelle vor.
- **Recherche Wissenslücken (2026-10-20), ADR 0011:** Drei Fehler im Modell von One Thousand Voices, alle beim Zusammensetzen:
  - Ember of Ashes +9,4 % statt +17 %: selbst abgeleiteter Abstand der Explosionen (`intervalMs` 66,7) ließ Ignitions in den Cooldown fallen. **Korrigiert** (Explosionen gleichzeitig, ×1,188).
  - Katalysator ×1,26 statt ×1,37: Seeker über der Grenze von 5 müssen ihren Aufprall machen; Seeker-Werte sind in Compendium-Skala (etwa 1,26 × Quantum). **Korrigiert** (×1,392, neues Feld `sourceScale`).
  - Golden Gun: Das Aegis-Paket enthält Radiant, ein Build ohne Radiant war 20 % zu hoch. **Korrigiert:** eingerechnete Multiplier werden herausgerechnet (ADR 0009, Punkt 5), Radiant und Well wirken auf Golden Gun (Feld `abilityIds`).
  - Neue Regel (ADR 0011): Quellen nur als Verhältnis mischen, abgeleitete Werte nur mit Gate.
- **Erkenntnis:** Compendium-Teile haben das Gate bisher nicht bestanden (Thundercrash −12,5 %, Anzahl der Aftershocks unklar). Deshalb sind fast alle Abilities Pakete.
- **Nächste Schritte (Masterplan):**
  - **Korrekturen nach ADR 0011:** erledigt (Gate `tests/weaponEffectGate.test.ts`, Ember, Katalysator, Golden Gun). Ingame-Tests vom 2026-10-20 eingearbeitet (Cooldown 1,3 s, Shot-Abstand 1,733 s, Explosionen gestaffelt). Regel (ADR 0011, 5 und 6): Waffen als Paket, Ingame-Tests nur für allgemeine Mechanics. Der Inhaber hat keinen Katalysator.
  - **6c, Ergebnis:**
    - ✅ Donut nach Damage Source (`damageShares`, 6c-1).
    - ✅ Breakdown-Tabelle pro Damage Source (6c-2).
    - ✅ Zeitleiste mit Ability-Zeilen und schraffiertem Super Window; Einsatzzeit einstellbar, weitere Casts über „+“ (6c-3). Damit ist 6c fertig.
  - **6d, Optimizer mit Fähigkeiten:** auf v1.x verschoben (Inhaber, 2026-10-20). Plan in `docs/plans/optimizer-abilities.md`. Bis dahin übernimmt der Optimizer die gewählten Abilities.
  - **6e, Wiki (ADR 0010):** 6e-1 erledigt: Schalter „Rechner | Wiki“ im Header, Markdown mit `marked`, Seiten aus `src/ui/wikiText.ts` (Abschnitt „Für Spieler“, Links ins Wiki). 6e-2 erledigt: `docs/mechanics/how-it-works.md` mit Abdeckung und Roadmap. Zurückgestellt (Inhaber): Abschnitte „Für Spieler“ in den übrigen Mechanics, schlanke Abdeckung für Spieler.
  - **U, Oberfläche wie im Spiel (vor dem Release, Inhaber 2026-10-20):**
    - ✅ U1 Surges: `surge-1x` bis `surge-3x` ohne Element (Annahme: passende Mods), Icon nach Element der Waffe (`elementIconKey`), 4x entfernt (nur über Exotic-Rüstung); alter Code 13 liest sich als 3x (`formerCodes`).
    - ✅ U2: jeder eigene Effect hat einen Slot wie im Spiel (`EffectProvider.slot`: Super, Class Ability, Aspect, Fragment, Mod, Stat, Artefakt); Fireteam ohne Slot. Links unverändert.
    - ✅ U3 (`src/ui/effectSections.ts`, `StatSliders`): Reihenfolge Encounter → Waffe (+ Katalysator) → Klasse → Subklasse → Super, Class Ability, Grenade, Melee → Aspects → Fragments → Rüstung (Exotic folgt, Mods) → Stats als Block → Artefakt → Fireteam Support. Nächster Schritt: 7 (v1.0 an die Freunde).
  - **7, Abschluss v1.0:** Changelog, Releaseplan, Testlauf mit den Freunden.
  - **Danach weitere Waffen:** ✅ W0 Fundament (ADR 0012, `loadWeapons`, Gate pro Waffe, `effectAppliesToWeapon`; kein Link-Format 4 nötig), dann Truth mit Waffenauswahl (W1), dann Thunderlord (Reign Havoc, Blitze; Bolt Charge zunächst ohne, wie Aegis).
  - **v1.x:** Feast of Light und Banner of War als Effects (macht Bladefury nutzbar), Well-Mechanik (Waffenschaden zählt als Super-Schaden, Dauer mit Super-Stat), Line 'Em Up, fehlende Zeitwerte der Supers.
- **Arbeitsstil des Inhabers:**
  - Kleine Schritte: Plan, Freigabe („ok“), Tests zuerst.
  - Nach jedem Schritt: Commit und Push.
  - Vor Datenarbeit eine Tabelle zur Freigabe zeigen. Bei Importen (ADR 0009, ADR 0013): Regeln einmal freigeben, danach die Prüftabelle pro Import.
- **UI-Check:** `npm run build`, `npx vite preview --port 4173`, dann `node scripts/ui-check.mjs <url> <out.png> [--dark|--light] [--width 1400] [--click "Wiki"]`. Link-Parameter für Builds ist `?b=`.

## Befehle

- `npm run dev`: Entwicklungsserver starten
- `npm test`: Tests ausführen
- `npm run build`: Produktionsversion bauen
- `npm run import:bosses`: Bosse und Damage Phases aus der Aegis-Tabelle nach `src/data/bosses.json` übernehmen
- `npm run import:abilities`: Aegis-Reiter „Abilties“ nach `src/data/aegis-abilities.json` übernehmen (Gate und Fallback, ADR 0009)
- `npm run import:compendium`: Texte der Compendium-Subklassen-Reiter nach `src/data/compendium-abilities.json` übernehmen; Tests prüfen damit zitierte Werte (ADR 0009). Außerdem „Exotic Weapons“ und „Weapon Perks“ nach `src/data/compendium-weapons.json` (ADR 0013) und „Exotic Armors“ nach `src/data/compendium-armor.json` (ADR 0014)
- `npm run build:weapons`: Waffen-Pakete aus den Snapshots bauen (ADR 0013), ohne Download: `src/data/weapon-packages.json`, `weapon-gaps.json`, `weapon-codes.json` und die Prüftabelle `docs/weapon-import.md` (ein Test prüft, dass sie aktuell sind). Reihenfolge nach einem Patch: `import:weapons`, `import:compendium`, `import:icons`, `build:weapons`, noch einmal `import:icons` (Icons neuer Pakete)
- `npm run import:weapons`: Aegis-Reiter „Weapons“ und Quantum-Reiter Primaries, Specials, Heavies als Snapshots nach `src/data/aegis-weapons.json` und `quantum-weapons.json` (ADR 0013)
- `npm run build:armor`: Exotic-Rüstung nach festen Regeln einordnen (ADR 0014), ohne Download: `src/data/exotic-armor.json` und Prüftabelle `docs/armor-import.md` (ein Test prüft, dass sie aktuell sind). Vorher `import:court`, `import:compendium`, `import:icons`
- `npm run build:keywords`: Keyword-Quellen per Regel aus den Compendium-Subklassen-Texten finden (ADR 0015, U4b), ohne Download: Prüftabelle `docs/keyword-sources.md` (ein Test prüft, dass sie aktuell ist)
- `npm run import:court`: Courts Stacking Guide als Snapshot nach `src/data/court-buffs.json` (ADR 0014; Werte von Debuffs, Empowering, Surges, Amplification und die Liste der Exotic Intrinsics)
- `npm run coverage`: `docs/coverage.md` aus den Data Files neu schreiben (ein Test prüft, dass sie aktuell ist)
- `npm run import:icons`: Icons, Ability-Zuordnung (Klasse, Subklasse, Prismatic) exotische Waffen mit Perks und Katalysator (`manifest-weapons.json`), Exotic-Rüstung mit Intrinsic (`manifest-armor.json`) und die Item-Typen der Aegis-Annahmen (`manifest-terms.json`, ADR 0013) aus dem Bungie-Manifest laden; nach `import:weapons` ausführen (braucht `BUNGIE_API_KEY` in `.env.local`, nie committen; lädt die etwa 200 MB große Item-Tabelle)
