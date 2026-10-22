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
- `docs/roadmap.md`: Woran gearbeitet wird und was erledigt ist; Quelle für die Website (US-15), deshalb englisch. Nach jedem abgeschlossenen Schritt aktualisieren. Den Verlauf vor 2026-10-22 findest du in der Git-Geschichte von `CLAUDE.md`.

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

Vom Build zur Simulation gibt es genau einen Weg: `buildSimulation(build, gameData)` (`src/engine/buildSimulation.ts`). Die Oberfläche, die Tests und der spätere Discord Bot nutzen ihn; `gameData` steht in `src/ui/data.ts`.

## Regeln

- Keine Zahlenwerte im Code. Alle Spielwerte stehen in `src/data`.
- Jeder Wert in einer Data File hat ein `source`-Objekt. Unbekannte Werte sind `null` mit Status `missing`. Rate niemals Werte.
- **Quellen zuerst:** Fehlt ein Wert oder eine Zuordnung, oder widersprechen sich Quellen, zuerst eine Community-Quelle suchen (Clarity, DIM-Daten, weitere Reiter von Aegis und Quantum, Compendium, Court, Manifest) und als Snapshot mit Regel einbinden. **Herleiten ist erlaubt und erwünscht, wenn eine Gegenrechnung gegen eine Quelle es prüft:** Das Modell muss die Messung, aus der etwas abgeleitet wurde, innerhalb der Toleranz wieder ergeben (Gate). Zerlegte Pakete werden immer gegengerechnet, damit nichts doppelt zählt oder fehlt (Ablauf „Zerlegen und Gegenrechnen“ im Skill `recherche`). **Vor jeder gemeldeten Lücke den Skill `recherche` abarbeiten** (`.claude/skills/recherche/SKILL.md`: Quellenkatalog mit Reitern, Ablauf, Budget); eine Lücke nur mit Tabelle der geprüften Quellen melden. Den Inhaber nur fragen, wenn die Gegenrechnung scheitert, Quellen sich widersprechen und keine Regel entscheidet, oder bei Entscheidungen, die ihm zustehen (Umfang, Oberfläche, Prioritäten). Overrides nur mit Zitat aus einem Snapshot.
- **Spielweise:** Gespielt wird optimal wie von einem erfahrenen Spieler. Im Zweifel gelten die Annahmen von Aegis (z. B. Precision, „average“, vorher aufgebaute Buffs). Ein Boss, keine Adds (ADR 0015).
- Jede Änderung an `src/engine` braucht einen Test. Schreibe den Test zuerst.
- Pro Bucket zählt die Stacking-Regel aus `buckets.json`. Buckets multiplizieren sich untereinander.
- Der Simulator arbeitet mit Damage Instances auf einer Zeitachse (ADR 0001).
- `src/engine` nutzt keine Browser-APIs (kein `window`, kein `document`, kein `localStorage`).
  Der spätere Discord Bot führt die Engine in Node.js auf einem Raspberry Pi aus (US-13).
- Baue keine Funktion auf Vorrat. Baue nur, was die aktuelle User Story braucht.
- Nutze zum Suchen und Lesen die eingebauten Werkzeuge Grep, Glob und Read. Baue keine Shell-Pipelines mit sed, awk oder paste. Für Auswertungen schreibst du ein kurzes Skript in `scripts/` und führst es mit `node scripts/<name>.ts` aus (Node führt TypeScript direkt aus, wie die npm-Skripte).

## Arbeitsweise

1. Lies die User Story und die betroffenen Dateien.
2. Schlage einen Plan vor und warte auf Freigabe.
3. Schreibe zuerst die Tests, dann den Code.
4. Prüfe mit dem Skill `pruefen` (Tests, `npm run sanity` mit Spielerblick, bei Oberfläche ein Screenshot). Melde das Ergebnis mit Beleg.
5. Fasse die Änderung in zwei bis drei Sätzen zusammen.

**Vorgehen (2026-10-22, nach den Fehlern bei Cuirass und Nighthawk):**
- **Vertikale Scheiben:** Jeder Schritt endet sichtbar, also Daten, Engine und Oberfläche zusammen, mit einem Szenario im Plausibilitäts-Gate. Keine Schicht wochenlang ohne Oberfläche.
- **Erst aufräumen, dann ändern:** Aufräum-Commits getrennt von Verhaltensänderungen. Aufgeräumt wird nur, wo die Datei ohnehin angefasst wird.
- **Fremdtexte hinter einer Schicht:** Regeln, die Compendium-, Court- oder Clarity-Texte lesen, teilen sich gemeinsame Werkzeuge. Beim nächsten Import-Schritt zusammenführen: `exoticArmor`, `exoticEffects`, `subclassEffects`, `keywordSources`.

**Definition of Done:**
- `npm test`, `npx tsc -b` und lint sind grün, die Vergleichsbasis ist nur gewollt geändert.
- Eine neue Daten-Art oder Mechanik hat ein Szenario in `tests/plausibility.test.ts`, das ohne die Änderung rot war.
- Die Antwort an den Inhaber nennt den Beleg. Ohne Beleg heißt es „ungeprüft“.
- Commit und Push, `docs/roadmap.md` aktualisiert.

Widerspruch ist erwünscht: Sag dem Inhaber offen, wenn er sich verrennt, z. B. wenn ein Wunsch dem Ziel, den Regeln oder einem ADR widerspricht oder der Aufwand den Nutzen übersteigt.

## Aktueller Stand (2026-10-22)

- **Umbau nach ADR 0015:** U1–U5, U6-1, U6-1b, U6-2 (Aspects/Fragments, Zustände) und U8 (Exotic-Auswahl, Link-Format 4) sind fertig. **Offen:** U6-3 Exotic Class Items und Transcendence, U6-4 Melee-Bucket additiv, U7 Timing (Class Ability in der Rotation, `refillOnCast`, `magazineRefill`), U9 `build:abilities`, Ember of Ashes aus `effects.json` umziehen.
- **Prüftabellen:** `docs/exotic-effects.md`, `docs/subclass-effects.md`, `docs/keyword-sources.md`, `docs/armor-import.md`, `docs/weapon-import.md`.
- **Sprache der Website (2026-10-22):** Alles, was Spieler sehen, ist englisch: Texte in `src/ui`, die Abschnitte „## For players“ in `docs/mechanics/`, `docs/roadmap.md` und die generierte `docs/coverage.md`. Zahlen im Format `en-US`. Antworten an den Inhaber, Pläne, Prüftabellen, ADRs und der Changelog bleiben deutsch.
- **Super-Timing (2026-10-22):** `src/data/super-timings.json` aus Geminis Schätzungen (`docs/sources/gemini-super-timings.csv`, Status `unverified`, vom Inhaber freigegeben). Verifizierte Compendium-Werte haben Vorrang.
- **Nächster Schritt (Reihenfolge des Inhabers):** 1. Aspects und Fragments, die eine Ability ändern, als Varianten aus Aegis-Zeilen (13 Fälle, z. B. Knock 'Em Down), mit Regel-Test über alle. 2. Jeder Catalyst, der den Schaden beeinflusst (auch Magazin, Munition, Reload), mit klaren Tooltips. Danach U6-3, U6-4, U7, U9.
- **Danach:** gezielte Inventur der Lücken (11 Subklassen-Boni ohne Bucket-Quelle, Exotics ohne Wirkung), W1-7 Waffen-Lücken, E1 Dawn Chorus u. a., v1.1 mit Testlauf Waffe × Exotic-Rüstung.
- **Entscheidungen des Inhabers:**
  - Exotics ohne jede Schadenswirkung fallen weg.
  - Ein Boss, keine Adds. Kill-Buffs des Exotics gelten nur mit dem Schalter „Vorher aufgebaut“ beim Exotic. Aspects und Fragments, die nur vorher aufgebaut wirken, gelten, sobald sie gewählt sind.
  - Die Rückwärtskompatibilität von Links hat keine hohe Priorität.
  - Tooltips erklären, was ein Item tut, ohne Quellen.
- **Arbeitsstil:** kleine Schritte, Plan, Freigabe („ok“), Tests zuerst, nach jedem Schritt Commit und Push. Vor Datenarbeit eine Tabelle zur Freigabe zeigen. Der Inhaber achtet auf Tokens.
- **UI-Check:** `node scripts/ui-check.mjs https://wipe4dmg.pages.dev/?b=<link> <out.png> [--dark] [--width 1400] [--click "Text"]`. Cloudflare baut bei jedem Push auf `master`. Links für Builds erzeugst du mit `encodeLink(…, linkRegistry)` in einer kurzen Vitest-Datei.

## Befehle

- `npm run dev`: Entwicklungsserver starten
- `npm test`: Tests ausführen
- `npm run sanity`: Plausibilitäts-Gate mit Tabelle für den Spielerblick (`tests/plausibility.test.ts`)
- `npm run build`: Produktionsversion bauen (`tsc -b` prüft auch `scripts/`)
- `npm run import:bosses`: Bosse und Damage Phases aus der Aegis-Tabelle nach `src/data/bosses.json` übernehmen
- `npm run import:abilities`: Aegis-Reiter „Abilties“ nach `src/data/aegis-abilities.json` übernehmen (Gate und Fallback, ADR 0009)
- `npm run import:compendium`: Texte der Compendium-Subklassen-Reiter nach `src/data/compendium-abilities.json` übernehmen; Tests prüfen damit zitierte Werte (ADR 0009). Außerdem „Exotic Weapons“ und „Weapon Perks“ nach `src/data/compendium-weapons.json` (ADR 0013) und „Exotic Armors“ nach `src/data/compendium-armor.json` (ADR 0014)
- `npm run build:weapons`: Waffen-Pakete aus den Snapshots bauen (ADR 0013), ohne Download: `src/data/weapon-packages.json`, `weapon-gaps.json`, `weapon-codes.json` und die Prüftabelle `docs/weapon-import.md` (ein Test prüft, dass sie aktuell sind). Reihenfolge nach einem Patch: `import:weapons`, `import:compendium`, `import:icons`, `build:weapons`, noch einmal `import:icons` (Icons neuer Pakete)
- `npm run import:weapons`: Aegis-Reiter „Weapons“ und Quantum-Reiter Primaries, Specials, Heavies als Snapshots nach `src/data/aegis-weapons.json` und `quantum-weapons.json` (ADR 0013)
- `npm run build:armor`: Exotic-Rüstung nach festen Regeln einordnen (ADR 0014) und ihre Effects erzeugen (ADR 0015, U6-1), ohne Download: `src/data/exotic-armor.json`, `exotic-armor-effects.json` und die Prüftabellen `docs/armor-import.md`, `docs/exotic-effects.md` (Tests prüfen, dass sie aktuell sind). Vorher `import:court`, `import:compendium`, `import:icons`
- `npm run build:keywords`: Keyword-Quellen per Regel aus den Compendium-Subklassen-Texten finden (ADR 0015, U4b), ohne Download: Prüftabelle `docs/keyword-sources.md`, dazu die Subklassen-Effects (U6-2) `src/data/subclass-effects.json`, `effect-codes.json` und `docs/subclass-effects.md` (Tests prüfen, dass sie aktuell sind)
- `npm run import:court`: Courts Stacking Guide als Snapshot nach `src/data/court-buffs.json` (ADR 0014; Werte von Debuffs, Empowering, Surges, Amplification und die Liste der Exotic Intrinsics)
- `npm run coverage`: `docs/coverage.md` aus den Data Files neu schreiben (ein Test prüft, dass sie aktuell ist)
- `npm run import:icons`: Icons, Ability-Zuordnung (Klasse, Subklasse, Prismatic) samt Aspects und Fragments, exotische Waffen mit Perks und Katalysator (`manifest-weapons.json`), Exotic-Rüstung mit Intrinsic (`manifest-armor.json`) und die Item-Typen der Aegis-Annahmen (`manifest-terms.json`, ADR 0013) aus dem Bungie-Manifest laden; nach `import:weapons` ausführen (braucht `BUNGIE_API_KEY` in `.env.local`, nie committen; lädt die etwa 200 MB große Item-Tabelle)

## Shell-Befehle

- Ein Befehl pro Aufruf. Keine Ketten mit `&&`, `;` oder `|`, wenn ein einzelner Befehl genügt.
- Kein `cd`. Verwende immer Pfade relativ zum Projektordner.
- Kein `sed`, `awk` oder `paste`. Zum Suchen und Lesen nutzt du Grep, Glob und Read.
- Temporäre Dateien legst du in `tmp/` im Projektordner ab. `tmp/` steht in `.gitignore`.
- Externe Daten speicherst du einmal unter `docs/sources/` (zum Beispiel als CSV) und liest sie danach mit Read.
