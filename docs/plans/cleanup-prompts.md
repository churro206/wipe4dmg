# Prompts für wipe4dmg

Reihenfolge: Prompt 1 (Aufräumen), Prompt 2 (UI „Die erste Minute“), Prompt 3 (Produktziel).

# Prompt 1: Aufräum-Block (für Opus in Claude Code)

Kopiere alles unterhalb der Linie in eine neue Sitzung. Starte die Sitzung im Plan-Modus (Shift+Tab, bis „plan mode on“ erscheint).

---

Wir machen einen reinen Aufräum-Block. Ziel: weniger Kontext pro Sitzung, Regeln, die sich selbst durchsetzen, und Code, der wartbar bleibt. Dieser Block ändert kein Spielverhalten und keine Spielwerte.

## Warum

Ein externes Review hat diese Befunde ergeben:

- 203 Commits in 8 Tagen. Pro Commit kommen im Schnitt 857 Zeilen dazu und 78 Zeilen fallen weg. Nur 3 Commits sind Refactorings.
- `docs/plans/current.md` hat ca. 63 KB (ca. 16.000 Tokens). CLAUDE.md verlangt, diese Datei zu Beginn jeder Sitzung zu lesen. Das widerspricht „Sparsam arbeiten“.
- Regeln widersprechen sich:
  - Skill `recherche`: Toleranz Abilities ±10 %, Waffen ±3 %. CLAUDE.md und Plan: Gate ±15 % und Schwelle 2 %.
  - Skill `recherche`: „curl in den Scratchpad“ und „Skript `node scripts/<name>.ts`“. CLAUDE.md: Bash nur für `npm`, `npx tsc -b` und `git`, keine Wegwerf-Skripte.
- Prosa-Regeln wirken nicht zuverlässig. Beispiel: „Nie `node -e` … (Inhaber, wiederholt)“.
- Es gibt keine CI. Der Skill `pruefen` ruft Lint nicht auf, obwohl die Definition of Done Lint verlangt.
- `src/ui/App.tsx` hat 1.172 Zeilen. Die Komponente `App` hat ca. 900 Zeilen und 28 Hooks.
- `src/data/schema.ts` hat 1.591 Zeilen. `scripts/lib/weaponPackages.ts` hat 2.101 Zeilen.
- `src/ui/data.ts` bündelt 22 JSON-Dateien mit ca. 1,6 MB, davon `weapon-packages.json` mit 690 KB.
- Rohdaten-Snapshots (z. B. `clarity.json`, 800 KB) liegen in `src/data` neben den Daten der App.
- Regel-Logik liegt in `tests/lib/aegisCoverage.ts`.
- `MS_PER_SECOND` steht in 5 Dateien.
- `README.md` ist noch die Vite-Vorlage.
- `tsconfig.app.json` setzt `strict` nicht explizit.
- Commit-Betreffzeilen sind oft Absätze (bis 434 Zeichen).

Prüfe jeden Befund selbst, bevor du handelst. Widersprich, wenn ein Befund falsch ist.

## Harte Grenzen für diesen Block

- Keine neuen Funktionen, keine neuen Mechaniken, keine geänderten Spielwerte.
- Die Ergebnisse der Simulation bleiben gleich. Halte vor Phase 1 eine Vergleichsbasis fest:
  - `npm run test:quiet` (Anzahl der Tests),
  - `npm run sanity` (Tabelle des Gates),
  - `npm run probe` (`docs/meta-probe.md`, `docs/meta-probe-auto.md`).
  Vergleiche nach jeder Phase. Ändert sich eine Zahl, stoppe und melde es.
- Ein Commit pro Phase oder Teilschritt. Aufräumen und Verhaltensänderungen nie im selben Commit.
- Nach jeder Phase: `npm run test:quiet`, `npx tsc -b`, `npm run lint`. Alles grün, sonst nicht committen.
- Lösche Wissen nicht. Verschiebe es. Was du aus `current.md` oder CLAUDE.md entfernst, landet im Changelog, in einem ADR, in einem Guide oder in einem Skill.
- Erwartung: Über den ganzen Block fallen mehr Zeilen weg, als dazukommen (ausgenommen CI, Hooks und generierte Dateien).

## Phase 0: Bestandsaufnahme (nur lesen, Plan-Modus)

1. Miss und notiere: Bytes von CLAUDE.md, `docs/plans/current.md`, beiden Skills; die 10 größten Dateien in `src`, `scripts` und `tests` nach Zeilen; Bundle-Größe aus `npm run build` (roh und gzip, wie Vite sie ausgibt).
2. Liste alle Widersprüche zwischen CLAUDE.md, den Skills, `current.md` und den ADRs. Nenne pro Widerspruch die gültige Fassung und den Grund.
3. Schlage den Plan für Phase 1 bis 5 vor. Nenne pro Phase die Dateien und die geschätzte Größe. Warte auf meine Freigabe. Danach arbeite den freigegebenen Teil ohne Zwischenfragen durch.

## Phase 1: Dokumente und Regeln

1. **`docs/plans/current.md` auf höchstens 4 KB kürzen.** Behalte nur:
   - nächster Block (ein Absatz),
   - Reihenfolge der nächsten 3–5 Blöcke (je eine Zeile),
   - „Bekannte Ungenauigkeiten“ (je Punkt höchstens zwei Sätze),
   - Verweis auf „Werkzeuge“.
   Verschiebe die Geschichte erledigter Blöcke in `docs/changelog.md`. Verschiebe die ausführlichen Ungenauigkeiten nach `docs/known-inaccuracies.md`, falls sie nicht in zwei Sätze passen.
2. **CLAUDE.md auf höchstens 4 KB kürzen.** Prüfe jede Zeile mit der Frage: „Macht Claude ohne diese Zeile einen Fehler?“ Wenn nein, streiche sie.
   - Entferne Datums- und „Inhaber“-Vermerke. Die Geschichte steht in Git.
   - Wissen, das nur manchmal gebraucht wird, gehört in einen Skill.
   - Regeln, die ein Hook oder eine Berechtigung durchsetzt (Phase 2), streichst du aus der Prosa.
   - Die Befehlsliste bleibt kurz. Details stehen in `package.json`.
3. **Toleranzen an genau einer Stelle festlegen**, z. B. als Abschnitt in CLAUDE.md oder als Konstanten-Datei, auf die Tests und Skills verweisen. Gleiche ADRs und Skills an.
4. **Skills bereinigen:**
   - `recherche`: Widersprüche zu CLAUDE.md auflösen. Kürze den Quellenkatalog auf die Spalten, die Claude wirklich braucht.
   - `pruefen`: Lint aufnehmen. Gleiche den Ablauf mit der Definition of Done ab.
5. **`README.md` neu schreiben:** Zweck, Start (`npm ci`, `npm run dev`), Tests, Daten-Import, Link zur Seite. Höchstens eine Bildschirmseite.

Commit: `docs: shrink CLAUDE.md and current plan, resolve rule conflicts`

## Phase 2: Regeln durchsetzen statt beschreiben

Lies vorher die aktuelle Dokumentation zu Hooks und Berechtigungen (`/hooks`, code.claude.com/docs). Rate das Format nicht.

1. **`.claude/settings.json` (eingecheckt):** Erlaube die Befehle, die dieses Projekt braucht, z. B. `npm run *`, `npx tsc -b`, `npx eslint *`, `git status`, `git diff *`, `git log *`, `git add *`, `git commit *`, `git push`. Danach braucht die Regel „ein Befehl pro Aufruf, keine Ketten“ keine Prosa mehr. Prüfe, ob die Regel ganz entfallen kann.
2. **`PreToolUse`-Hook für Bash:** Blockiere `node -e` und `node --eval` mit einer klaren Meldung, was stattdessen zu tun ist (`npm run facts`, Grep, Read). Lege das Hook-Skript unter `.claude/hooks/` ab. Teste den Hook mit einem echten Aufruf und zeige die Ausgabe.
3. **GitHub Action** `.github/workflows/ci.yml`: bei Push und Pull Request `npm ci`, `npm run test:quiet`, `npx tsc -b`, `npm run lint`. Node-Version aus `.nvmrc`.
4. Streiche die Prosa-Regeln, die jetzt Hook, Berechtigung oder CI abdecken.

Commit: `chore: enforce shell rules via settings and hook, add CI`

## Phase 3: Code-Struktur (keine Verhaltensänderung)

Arbeite in kleinen Commits. Nach jedem Commit Vergleichsbasis prüfen.

1. **`src/ui/App.tsx` aufteilen.** Ziel: `App` unter 200 Zeilen. Ziehe zusammenhängende Teile in eigene Komponenten und Hooks, z. B. Build-Editor, Rotation, Ergebnisse, Vergleich. Zustand bleibt in `buildState.ts`, falls er dort hingehört.
2. **`src/data/schema.ts` nach Fachgebiet aufteilen** (z. B. Waffen, Effects, Abilities, Rüstung, Build). `schema.ts` bleibt als Sammel-Export, damit keine Imports brechen.
3. **`scripts/lib/weaponPackages.ts` aufteilen.** Ziel: keine Datei über ca. 600 Zeilen.
4. **Gemeinsame Einheiten:** eine Datei, z. B. `src/engine/units.ts`, mit `MS_PER_SECOND` und `MS_PER_MINUTE`. Ersetze die Kopien.
5. **Regel-Logik aus `tests/lib/` nach `scripts/lib/`** verschieben, wo sie fachliche Regeln enthält. Test-Hilfen bleiben in `tests/support/`.
6. **Rohdaten von App-Daten trennen.** Prüfe zuerst, welche JSON-Dateien die App wirklich lädt (`src/ui/data.ts`) und welche nur Skripte und Tests lesen. Verschiebe reine Snapshots (z. B. `clarity.json`, `compendium-*`, `quantum-weapons.json`, `aegis-*` ohne App-Nutzung) nach `data/sources/` außerhalb von `src`. Passe Skripte, Tests, `npm run facts` und CLAUDE.md an. Ist der Umzug zu groß für diese Sitzung, schreibe nur den Plan dafür.
7. **TypeScript:** Setze `"strict": true` explizit. Probiere `noUncheckedIndexedAccess`. Bleibt es unter ca. 30 Fehlern, behebe sie. Sonst lass die Option aus und notiere die Zahl.
8. Toten Code löschen: Exporte ohne Nutzer, ungenutzte Skripte in `package.json`, verwaiste Dokumente in `docs/`.

Commits je Schritt, z. B. `refactor(ui): split App into panels`.

## Phase 4: Bundle

1. Miss das Bundle (`npm run build`).
2. Lade große Daten erst bei Bedarf (`import()`), z. B. `weapon-packages.json`, oder entferne beim Build Felder, die die App nicht braucht (Zitate, Quellen-Text). Behalte `source` dort, wo die UI es zeigt.
3. Miss erneut. Nenne vorher und nachher.
4. Diese Phase ändert das Ladeverhalten. Prüfe die Oberfläche mit Schritt 4 aus `pruefen` (Screenshot nach dem Deploy).

Commit: `perf: lazy-load large data files`

## Phase 5: Konventionen und Abschluss

1. Ergänze in CLAUDE.md eine Commit-Regel: Betreff höchstens 72 Zeichen, Präfix (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`), Details im Body.
2. Füge eine Regel für Konsolidierung hinzu: Nach je drei Funktions-Blöcken folgt ein Aufräum-Block.
3. Aktualisiere `docs/plans/current.md` (höchstens 4 KB) so, dass der nächste Block nach `/clear` starten kann.

## Abschlussbericht

Melde eine Tabelle „Messgröße | vorher | nachher“:

- Bytes CLAUDE.md, `current.md`, Skills,
- größte Datei in `src`, `scripts`, `tests` (Zeilen),
- Bundle roh und gzip,
- Anzahl Tests, Ergebnis `tsc`, Ergebnis Lint,
- Zeilen hinzugefügt und gelöscht über den ganzen Block (`git diff --shortstat <start>..HEAD`),
- Vergleichsbasis: unverändert ja/nein.

Nenne offene Punkte und das empfohlene Modell für den nächsten Schritt.

## Sitzungen und Budget

Dieser Block ist zu groß für eine Sitzung mit Claude Pro. Teile ihn so:

- Sitzung 1 (Opus): Phase 0, 1 und 2.
- Sitzung 2 (Sonnet, nach Plan aus Phase 0): Phase 3.
- Sitzung 3 (Sonnet): Phase 4 und 5.

Pflege am Ende jeder Sitzung `current.md`. Schlage dann `/clear` vor.

---

# Prompt 2: UI-Block „Die erste Minute“ (nach dem Aufräumen, Sonnet)

Kopiere alles unterhalb der Linie in eine neue Sitzung.

---

Wir machen einen UI-Block. Ziel: Ein neuer Nutzer versteht in der ersten Minute, was die Seite kann und was ein Ergebnis bedeutet. Keine neuen Mechaniken, keine geänderten Spielwerte.

Ein externer Test auf https://wipe4dmg.pages.dev hat diese Befunde ergeben. Prüfe jeden Befund selbst, bevor du handelst.

## Befunde und Aufgaben

1. **Leerer Start.** Die Seite zeigt beim ersten Aufruf nur „Enter a Damage Phase or pick a boss.“ und kein Ergebnis.
   - Setze einen Standard für die Damage Phase (z. B. 30 s), damit sofort ein Ergebnis erscheint.
   - Ein geteilter Link überschreibt den Standard wie bisher.

2. **Ungeordnete Boss-Liste.** Die 47 Bosse stehen ohne Sortierung und ohne Gruppen im Auswahlfeld.
   - Gruppiere die Bosse nach Raid und Dungeon (`<optgroup>`), innerhalb der Gruppe in der Reihenfolge der Encounter.
   - Hole die Zuordnung aus den Daten (`bosses.json`, Aegis-Reiter Bosses). Fehlt sie dort, ergänze sie im Import mit Quelle.

3. **Boss geht im Link verloren.** Nach dem Öffnen eines geteilten Links zeigt die Boss-Auswahl „– custom –“, obwohl ein Boss gewählt war. Die Damage Phase stimmt.
   - Schreibe zuerst einen Test in `tests/buildLink.test.ts`, der den Fehler zeigt.
   - Speichere den Boss im Link oder leite ihn aus der Dauer ab. Erhöhe die Version des Link-Formats nur, wenn nötig. Alte Links müssen weiter funktionieren.

4. **Absolute Zahlen verwirren.** Die Seite zeigt z. B. 28.423 Total Damage für 30 s. Im Spiel sehen Spieler Millionen. Unser Ziel sind relative Unterschiede.
   - Zeige die Änderung in Prozent gegenüber einer Basis groß an. Basis ist der gemerkte Vergleich, sonst derselbe Build ohne Buffs, Exotic und Abilities. Lege die Basis im Plan fest und frage mich, falls unklar.
   - Zeige Total Damage und DPS kleiner, mit einem Info-Hinweis: Werte relativ, Skala nach Aegis.

5. **Optimizer-Ergebnisse nicht lesbar.** Jede Zeile besteht nur aus Icons. Beim Hovern erscheint kein Tooltip. Die Bilder haben keinen Alt-Text.
   - Gib jedem Icon in der ganzen App einen Alt-Text und einen Tooltip mit dem Namen. Nutze die bestehenden Hover-Karten, wo es sie gibt.
   - Zeige pro Optimizer-Zeile die Namen als kurzen Text, mindestens die Teile, die sich vom aktuellen Build unterscheiden.
   - Ergänze `tests/uiIcons.test.ts` oder einen neuen Test: Jedes Icon hat einen Namen.

6. **Handy: Ergebnis weit unten.** Bei 375 px Breite steht das Formular oben und das Ergebnis weit darunter.
   - Halte eine schmale Ergebniszeile (Total, DPS, Prozent-Änderung) oben fest (`position: sticky`), solange das Ergebnis nicht sichtbar ist.

7. **Vollständigkeit prüfen.** Bei Warlock Solar bietet die Super-Auswahl nur Daybreak und Well of Radiance. Song of Flame fehlt.
   - Prüfe, warum Song of Flame fehlt (Daten, Filter oder bewusst übersprungen).
   - Fehlt die Super wegen fehlender Daten, trage sie in „Bekannte Ungenauigkeiten“ ein. Baue sie in diesem Block nicht nach.
   - Prüfe auf dieselbe Weise alle Klassen und Subklassen: Liste jede Super, Grenade, Melee und Class Ability aus dem Manifest, die in der Auswahl fehlt, mit Grund.

## Regeln für diesen Block

- Ein Commit pro Punkt. Betreff höchstens 72 Zeichen.
- Nach jedem Punkt: `npm run test:quiet`, `npx tsc -b`, `npm run lint`.
- Die Vergleichsbasis (`npm run sanity`, `npm run probe`) bleibt unverändert.
- Prüfe jede sichtbare Änderung mit Schritt 4 aus `pruefen` (Screenshot nach dem Deploy), auch bei 375 px Breite.

## Abschluss

Melde pro Punkt: erledigt mit Beleg, oder offen mit Grund. Pflege `docs/plans/current.md` und schlage `/clear` vor.

---

# Prompt 3: Produktziel schärfen (nach dem UI-Block, Opus)

Kopiere alles unterhalb der Linie in eine neue Sitzung.

---

Ich will das Produktziel von wipe4dmg schärfen, bevor wir neue Mechaniken bauen. Interviewe mich mit dem Werkzeug AskUserQuestion. Stelle keine offensichtlichen Fragen. Frage nach den schwierigen Punkten:

- Wer nutzt die Seite, und welche Fragen stellen diese Leute konkret? Ziel: eine Liste der 20 häufigsten Fragen, z. B. „Welche Heavy für Boss X mit Super Y?“.
- Welche Genauigkeit braucht jede Frage? Reicht die richtige Rangfolge?
- Was ist ausdrücklich nicht Ziel (Nicht-Ziele)?
- Wann ist Version 2.0 fertig?

Schreibe danach `docs/product.md` (höchstens 3 KB) mit: Zielgruppe, Top-20-Fragen, Nicht-Ziele, Abnahmekriterien.

Schlage dann ein **Rangfolge-Gate** vor: Für jede Top-Frage vergleicht ein Test die Rangfolge unserer Builds mit der Rangfolge aus Aegis Sustained und Swap (z. B. Rangkorrelation nach Spearman ≥ 0,9). Dieses Gate wird das wichtigste Abnahmekriterium. Neue Mechaniken baust du nur noch, wenn sie eine Top-Frage betreffen oder das Rangfolge-Gate verbessern.
