# ADR 0010: Wiki und Abdeckung aus einer Quelle

Status: angenommen · Datum: 2026-10-19

## Kontext

US-15: Spieler sollen auf der Website nachlesen, wie der Rechner rechnet, welche Mechanics und Effects es gibt und was schon abgedeckt ist. Agenten und Entwickler brauchen dieselben Inhalte mit technischen Details: Regeln, Modell, Quellen, offene Fragen.
Zwei getrennt gepflegte Texte würden auseinanderlaufen. Die Abdeckung ändert sich mit jedem Import und jeder neuen Ability.

## Entscheidung

1. **Was sich aus Daten ergibt, wird berechnet, nicht geschrieben.**
   - Die Abdeckung der Abilities (`src/engine/coverage.ts`) vergleicht den Compendium-Snapshot mit `abilities.json` und `aegis-abilities.json`.
   - Effect- und Ability-Kataloge kommen aus `effects.json` und `abilities.json`.
2. **Agenten-Ansicht:** `docs/coverage.md` wird aus denselben Funktionen erzeugt (`npm run coverage`). Ein Test vergleicht die Datei mit dem erzeugten Inhalt (Vitest `toMatchFileSnapshot`) und schlägt fehl, wenn sie veraltet ist.
3. **Erklärungen gibt es genau einmal**, in `docs/mechanics/*.md`. Jede Datei bekommt einen Abschnitt „Für Spieler“. Die Website zeigt nur diesen Abschnitt, Agenten lesen die ganze Datei. Die Einstiegsseite ist `docs/mechanics/how-it-works.md`.
4. **Woran gearbeitet wird** steht in `docs/roadmap.md`, von Hand gepflegt und nach jedem abgeschlossenen Schritt aktualisiert. Die Website zeigt die Datei auf der Seite „Abdeckung“.
5. **Rendering:** Die Website rendert Markdown mit einer kleinen Bibliothek, festgelegt bei der Umsetzung in der Oberfläche (Schritt 6). Die Inhalte werden beim Build eingebunden; zur Laufzeit lädt die App nichts nach (ADR 0003).
6. Der Ablauf zum Anlegen von Abilities steht für Agenten in `docs/guides/abilities.md` und erscheint nicht auf der Website.

## Folgen

- Die Abdeckung kann nicht vom Stand der Daten abweichen.
- Wer eine Data File ändert, führt `npm run coverage` aus; sonst schlägt der Test fehl.
- Neue Mechanic-Dateien brauchen einen Abschnitt „Für Spieler“, wenn sie auf der Website erscheinen sollen.
- Die Website wächst um einen Reiter „Wiki“ und eine Markdown-Bibliothek.
