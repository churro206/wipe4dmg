# wipe4dmg

Berechnet den Total Damage eines Destiny-2-Builds. Die Unterschiede zwischen Builds sollen stimmen, absolute Zahlen nicht. Zahlen kommen automatisch aus Community-Quellen, die Struktur eines Items steht von Hand in seiner Datei (ADR 0005, 0018). Privat, für den Inhaber und seine Freunde.

**Zu Beginn: `docs/plans/current.md`.** Danach nur, was der Block braucht: `docs/architecture.md` (Bauplan, vor Engine, Daten, Import oder Prüfstand), `docs/product.md` (Produktziel, vor neuen Mechaniken), `docs/adr/README.md`, Glossary `docs/requirements.md`, `docs/mechanics/README.md` (Toleranzen), `docs/ui-inspiration.md` (vor der Oberfläche).

## Architektur

```
src/data/      Data Files (JSON) und Zod-Schema (schema.ts). Keine Logik.
src/engine/    Simulator, Optimizer. Reine Funktionen, kein React. Kern nach Bauplan: src/engine/core/.
src/ui/        React. Ruft nur die Engine auf.
scripts/       Import (ADR 0005). Logik in scripts/lib/, getestet.
tests/         Vitest-Tests.
```

Einziger Weg vom Build zur Simulation: `buildSimulation(build, gameData)`.

## Regeln

- Antworte deutsch und kurz (Zusammenfassung zwei bis drei Sätze). Code, Data Files und alles, was Spieler sehen, englisch. Begriffe aus dem Glossary.
- Keine Zahlen im Code. Jeder Wert in einer Data File hat `source`; unbekannt ist `null` mit Status `missing`. Nie raten.
- Nachschlagen: zuerst `npm run facts -- "<Name>"`. Große Snapshots (`aegis-*`, `quantum-weapons`, `clarity`, `compendium-*`, `manifest-*`, `weapon-packages`) nie direkt lesen.
- Lücken nur nach dem Skill `recherche` melden. Herleiten ist erwünscht, wenn ein Gate es gegen eine Messung prüft, aus der es nicht stammt.
- Eine Quelle genügt. **Waffen (ADR 0019):** Zahlen aus Quantum, Mechanik und Zahlen im Text aus Clarity (schweigt Clarity: Compendium), Ladezeit aus dem Manifest; kein neues `$aegis`. Jeder Satz mit Zahl wird Regel nach Vorlage (Bauplan 5.2) oder steht in `notModelled` (Zitat, Grund). Sonst bei Konflikt die vertrauenswürdigere mit Grund. Text ohne Messung: `derived`. Einzelfälle per Override-Datei, bis ihr Item eine Datei hat.
- **Messung ist Prüfung, nicht Eingang (ADR 0018):** Aegis ist bis zur Gegenprobe nur Bericht. Ein bestehender `$aegis`-Verweis (`fitted`) nimmt seine Zeile aus der Prüfung. Annahmen einer Messung gehören ins Szenario; herausrechnen nur in alten Paketen bis zu ihrer Migration.
- **Eichen nur global:** Nur die globalen Parameter θ werden an Messungen angepasst, per Skript über alle Szenarien (Totzone 2 %). Nie ein Item an eine Zeile anpassen; pro Abweichung ein Versuch mit Quelle, dann Befund.
- **Breite vor Genauigkeit (Inhaber):** Falsch Übernommenes (Wert, Dauer, Filter gegen den Text) immer korrigieren. Fehlende Mechaniken und eigene Gates erst ab 2 % Wirkung auf den Total Damage eines Builds mit dem Item (schlechtester Fall über 10, 30, 60 s); darunter Wert aus dem Text als `derived`, Abweichung nach `docs/known-inaccuracies.md`. Ein Block nimmt eine ganze Kategorie nach einer Regel auf; kein Block und kein Override für ein einzelnes Item, außer der Inhaber nennt es.
- Spielweise optimal, im Zweifel wie Aegis. Ein Boss, keine Adds (ADR 0015). Buckets nach `buckets.json`, Zeitachse nach ADR 0001.
- Keine Funktion auf Vorrat. Den Inhaber nur bei Umfang, Oberfläche und Spielweise fragen. Widerspruch ist erwünscht.

## Arbeitsweise

1. Opus schreibt die Checkliste in `docs/plans/current.md`, der Inhaber gibt sie als Ganzes frei, der Skill `abarbeiten` setzt sie um: `npm run blocks` startet je offenem Block eine frische Sonnet-Sitzung und stoppt beim ersten roten Gate; enger Opus-Review nur bei Engine-Änderungen, sonst alle drei Blöcke (Bereich ab dem letzten Review). Exit 0 nur ohne Rest, Widerspruch, Frage und mit Urteil OK; STOPP und das Gate „Freigabe Inhaber“ gehen an den Inhaber. Berichte beginnen mit „Was sich im Spiel ändert“.
2. Tests zuerst; jede Änderung an `src/engine` braucht einen Test. Prüfen mit dem Skill `pruefen`.
3. Vertikale Scheiben (Daten, Engine, Oberfläche). Aufräumen getrennt von Verhaltensänderungen, nach drei Funktions-Blöcken ein Aufräum-Block.
4. Kein neuer Plan, solange der aktuelle nicht fertig oder vom Inhaber gestoppt ist. Ein Plan verlangt keine Funktion ohne Nutzer. Einen solchen Planteil meldet jeder als Widerspruch.

- Online nur im Budget des Skills `recherche`. Commit-Betreff höchstens 72 Zeichen. Merge nur auf Ansage.

## Definition of Done

- `npm run test:quiet`, `npx tsc -b` und `npm run lint` grün (die CI prüft dasselbe). Die Vergleichsbasis ist nur gewollt geändert.
- Neue Daten-Art oder Mechanik: Szenario in `tests/plausibility.test.ts`, ohne die Änderung rot.
- Beleg nennen, sonst „ungeprüft“. Der Abschlussbericht endet mit **Geeicht / Gelockert / Gestrichen / Unsicher** (je Liste oder „keine“). Planteile streichen und Gates lockern nur nach Rückfrage.
- Urteil des Reviewers: OK, wo ein Review läuft (bei Änderungen in `src/engine/`, sonst nach drei Blöcken; es prüft alles seit dem letzten Review). Commit und Push; `docs/roadmap.md`, `docs/plans/current.md` und `docs/changelog.md` aktualisiert.

## Befehle und Shell

- `npm run test:quiet`, `sanity` (Plausibilitäts-Gate), `probe` (Gesamtprobe), `facts -- "<Name>"`, `coverage`, `check:text`, `build`, `dev`, `blocks` (nächsten offenen Block per Skript umsetzen), `notify -- "<Text>"` (Toast an den Inhaber; nur die Hauptsitzung, nur wenn er dran ist und kein Subagent läuft). Import und Build nach einem Patch: Skill `nach-patch`.
- Bash nur für `npm run …`, `npx tsc -b`, `git` und `curl -o` in den Scratchpad (Skill `recherche`). Sonst Grep, Glob, Read, Edit, Write. Ein Befehl pro Aufruf, kein `cd`, kein PowerShell-Tool. Der Hook `.claude/hooks/shell-rules.mjs` setzt das durch (Test `tests/shellRules.test.ts`).
- Kein `node -e`. Ein Skript nur für eine Auswertung über viele Zeilen, angekündigt, als `node tmp/<datei>.ts`.
- Externe Daten einmal nach `docs/sources/`.
