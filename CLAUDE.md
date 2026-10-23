# wipe4dmg

## Ziel

Die App berechnet den Total Damage eines Builds in Destiny 2. Die Unterschiede zwischen Builds sollen stimmen, absolute Zahlen nicht. Spielwerte kommen aus Community-Quellen, möglichst automatisch (ADR 0005). Privat, für den Inhaber und seine Freunde.

**Stand und nächste Schritte: `docs/plans/current.md`.** Lies `docs/adr/README.md` und nur die ADRs, die der Block betrifft. Weitere Dokumente: `docs/requirements.md` (Glossary), `docs/mechanics/README.md` (vor Änderungen an Effects oder Simulator), `docs/guides/` (Waffen, Abilities, Messungen), `docs/ui-inspiration.md` (vor Änderungen an der Oberfläche), `docs/roadmap.md` (Website, englisch).

## Architektur

```
src/data/      Data Files (JSON) und Zod-Schema (schema.ts). Keine Logik.
src/engine/    Simulator und Optimizer. Reine Funktionen, kein React, keine Browser-APIs.
src/ui/        React-Oberfläche. Ruft nur die Engine auf.
scripts/       Import-Skripte (ADR 0005). Reine Funktionen in scripts/lib/, getestet.
tests/         Vitest-Tests.
```

Vom Build zur Simulation gibt es genau einen Weg: `buildSimulation(build, gameData)`.

## Regeln

- Antworte deutsch, kurz und klar. Code, Data Files und alles, was Spieler sehen, ist englisch. Nur Begriffe aus dem Glossary.
- Keine Zahlenwerte im Code. Jeder Wert in einer Data File hat `source`. Unbekannt ist `null` mit Status `missing`. Nie raten.
- **Spielwerte nachschlagen:** zuerst `npm run facts -- "<Name>"`. Große Snapshots (`aegis-*`, `quantum-weapons`, `clarity`, `compendium-*`, `manifest-*`, `weapon-packages`) nie direkt lesen.
- **Quellen zuerst:** Vor jeder gemeldeten Lücke den Skill `recherche` abarbeiten; eine Lücke nur mit Tabelle der geprüften Quellen melden. Herleiten ist erwünscht, wenn ein Gate es gegen eine Messung prüft.
- **Eine Quelle genügt:** Ein Wert aus Aegis, Quantum, Compendium, Clarity, Court oder Manifest gilt als bestätigt. Bei Konflikt die vertrauenswürdigere Quelle, mit Grund. Bei Waffen Aegis vor Quantum. Texte ohne Messung: Status `derived`.
- **Einzelfälle von Hand:** Override-Datei mit Wert, Quelle, Zitat und Herleitung. Erst bei mehreren gleichen Fällen eine Regel. Fremde Annahmen in Messungen (z. B. Artifact-Perks bei Aegis) mit ihrem Wert herausrechnen.
- **Spielweise:** optimal wie ein erfahrener Spieler, im Zweifel die Annahmen von Aegis. Ein Boss, keine Adds (ADR 0015).
- Pro Bucket die Stacking-Regel aus `buckets.json`, Buckets multiplizieren sich. Damage Instances auf einer Zeitachse (ADR 0001).
- Keine Funktion auf Vorrat.
- Den Inhaber nur fragen bei Umfang, Oberfläche und Annahmen über die Spielweise. Widerspruch ist erwünscht.

## Arbeitsweise

1. User Story und betroffene Dateien lesen.
2. Plan vorschlagen, auf Freigabe warten. Einen freigegebenen Block ohne Zwischenfragen durcharbeiten.
3. Tests zuerst. Jede Änderung an `src/engine` braucht einen Test.
4. Prüfen mit dem Skill `pruefen`.
5. Vertikale Scheiben: Daten, Engine und Oberfläche zusammen. Aufräum-Commits getrennt von Verhaltensänderungen.
6. Zusammenfassung in zwei bis drei Sätzen.

## Sparsam arbeiten (Inhaber, 2026-10-23, Claude Pro)

- Ein Block pro Sitzung. Am Ende `docs/plans/current.md` so pflegen, dass der nächste Block nach `/clear` ohne Chat-Verlauf starten kann; dann `/clear` vorschlagen.
- Modell: Pläne, ADRs und schwierige Herleitungen mit Opus, Umsetzung mit Sonnet. Beim Wechsel einen Satz dazu sagen.
- Kleine Ausgaben: `npm run test:quiet`, `npm run facts`, große Dateien nur ausschnittweise lesen (Grep, dann Read mit `offset`), Changelog nur per Edit ergänzen.
- Online und Browser nur im Budget des Skills `recherche`. Keine Subagents.

## Definition of Done

- `npm test`, `npx tsc -b` und lint grün. Die Vergleichsbasis ist nur gewollt geändert.
- Eine neue Daten-Art oder Mechanik hat ein Szenario in `tests/plausibility.test.ts`, das ohne die Änderung rot war.
- Die Antwort nennt den Beleg, sonst heißt es „ungeprüft“.
- Commit und Push, `docs/roadmap.md` und `docs/plans/current.md` aktualisiert.

## Befehle

- `npm test`, `npm run test:quiet` (nur Ergebnis und Fehler), `npm run sanity` (Plausibilitäts-Gate), `npm run build` (`tsc -b` prüft auch `scripts/`), `npm run dev`
- `npm run facts -- "<Name>"`: Name in allen Snapshots suchen, kompakt
- `npm run coverage`: `docs/coverage.md` neu schreiben (generiert)
- Import (lädt herunter): `import:weapons`, `import:compendium`, `import:court`, `import:abilities`, `import:bosses`, `import:reload`, `import:icons` (braucht `BUNGIE_API_KEY` in `.env.local`, nie committen)
- Build (ohne Download, schreibt Data Files und Prüftabellen): `build:weapons`, `build:armor`, `build:keywords`
- Reihenfolge nach einem Patch: `docs/plans/current.md`, Abschnitt „Werkzeuge“

## Shell-Befehle

- Ein Befehl pro Aufruf, keine Ketten mit `&&`, `;` oder `|`. Kein `cd`, Pfade relativ zum Projektordner.
- Kein `sed`, `awk` oder `paste`. Suchen und Lesen mit Grep, Glob und Read.
- Auswertungen als kurzes Skript, ausgeführt mit `node <datei>.ts`. Temporäres in `tmp/` (in `.gitignore`).
- Externe Daten einmal unter `docs/sources/` speichern.
