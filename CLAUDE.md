# wipe4dmg

Berechnet den Total Damage eines Destiny-2-Builds. Die Unterschiede zwischen Builds sollen stimmen, absolute Zahlen nicht. Spielwerte kommen automatisch aus Community-Quellen (ADR 0005). Privat, für den Inhaber und seine Freunde.

**Zu Beginn: `docs/plans/current.md`.** Danach nur, was der Block braucht: `docs/product.md` (Produktziel, vor neuen Mechaniken), `docs/adr/README.md`, Glossary `docs/requirements.md`, `docs/mechanics/README.md` (vor Effects oder Simulator, mit Toleranzen), `docs/ui-inspiration.md` (vor der Oberfläche).

## Architektur

```
src/data/      Data Files (JSON) und Zod-Schema (schema.ts). Keine Logik.
src/engine/    Simulator, Optimizer. Reine Funktionen, kein React.
src/ui/        React. Ruft nur die Engine auf.
scripts/       Import (ADR 0005). Logik in scripts/lib/, getestet.
tests/         Vitest-Tests.
```

Einziger Weg vom Build zur Simulation: `buildSimulation(build, gameData)`.

## Regeln

- Antworte deutsch und kurz (Zusammenfassung zwei bis drei Sätze). Code, Data Files und alles, was Spieler sehen, englisch. Begriffe aus dem Glossary.
- Keine Zahlen im Code. Jeder Wert in einer Data File hat `source`; unbekannt ist `null` mit Status `missing`. Nie raten.
- Nachschlagen: zuerst `npm run facts -- "<Name>"`. Große Snapshots (`aegis-*`, `quantum-weapons`, `clarity`, `compendium-*`, `manifest-*`, `weapon-packages`) nie direkt lesen.
- Lücken nur nach dem Skill `recherche` melden. Herleiten ist erwünscht, wenn ein Gate es gegen eine Messung prüft.
- Eine Quelle genügt. Bei Konflikt die vertrauenswürdigere mit Grund, bei Waffen Aegis vor Quantum. Text ohne Messung: `derived`. Einzelfälle per Override-Datei (Wert, Quelle, Zitat, Herleitung). Fremde Annahmen in Messungen herausrechnen.
- **Breite vor Genauigkeit (Inhaber):** Falsch Übernommenes (Wert, Dauer, Filter gegen den Text) immer korrigieren. Fehlende Mechaniken und eigene Gates erst ab 2 % Wirkung auf den Total Damage eines Builds mit dem Item (schlechtester Fall über 10, 30, 60 s); darunter Wert aus dem Text als `derived`, Abweichung nach `docs/known-inaccuracies.md`. Ein Block nimmt eine ganze Kategorie nach einer Regel auf.
- Spielweise optimal, im Zweifel wie Aegis. Ein Boss, keine Adds (ADR 0015). Buckets nach `buckets.json`, Zeitachse nach ADR 0001.
- Keine Funktion auf Vorrat. Den Inhaber nur bei Umfang, Oberfläche und Spielweise fragen. Widerspruch ist erwünscht.

## Arbeitsweise

1. Plan vorschlagen, auf Freigabe warten; einen freigegebenen Block ohne Zwischenfragen durcharbeiten.
2. Tests zuerst; jede Änderung an `src/engine` braucht einen Test. Prüfen mit dem Skill `pruefen`.
3. Vertikale Scheiben (Daten, Engine, Oberfläche). Aufräumen getrennt von Verhaltensänderungen.
4. Ein Block pro Sitzung. Am Ende `docs/plans/current.md` pflegen (höchstens 4 KB), dann `/clear` vorschlagen. Nach drei Funktions-Blöcken ein Aufräum-Block.

- Modell: Pläne und schwierige Herleitungen mit Opus, Umsetzung mit Sonnet. Jede Antwort, die einen Schritt vorschlägt oder abschließt, nennt das Modell für den nächsten.
- Online nur im Budget des Skills `recherche`. Keine Subagents. Commit-Betreff höchstens 72 Zeichen.

## Definition of Done

- `npm run test:quiet`, `npx tsc -b` und `npm run lint` grün (die CI prüft dasselbe). Die Vergleichsbasis ist nur gewollt geändert.
- Neue Daten-Art oder Mechanik: Szenario in `tests/plausibility.test.ts`, ohne die Änderung rot.
- Beleg nennen, sonst „ungeprüft“.
- Commit und Push; `docs/roadmap.md`, `docs/plans/current.md` und `docs/changelog.md` aktualisiert.

## Befehle und Shell

- `npm run test:quiet`, `sanity` (Plausibilitäts-Gate), `probe` (Gesamtprobe), `facts -- "<Name>"`, `coverage`, `check:text`, `build`, `dev`. Import und Build nach einem Patch: Skill `nach-patch`.
- Bash nur für `npm run …`, `npx tsc -b`, `git` und `curl -o` in den Scratchpad (Skill `recherche`). Sonst Grep, Glob, Read, Edit, Write. Ein Befehl pro Aufruf, kein `cd`.
- Kein `node -e` (Hook). Ein Skript nur für eine Auswertung über viele Zeilen, angekündigt, als `node tmp/<datei>.ts`.
- Externe Daten einmal nach `docs/sources/`.
