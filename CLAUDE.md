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
tests/         Vitest-Tests für die Engine.
```

## Regeln

- Keine Zahlenwerte im Code. Alle Spielwerte stehen in `src/data`.
- Jeder Wert in einer Data File hat ein `source`-Objekt. Unbekannte Werte sind `null` mit Status `missing`. Rate niemals Werte.
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

## Befehle

- `npm run dev`: Entwicklungsserver starten
- `npm test`: Tests ausführen
- `npm run build`: Produktionsversion bauen
- `npm run import:bosses`: Bosse und Damage Phases aus der Aegis-Tabelle nach `src/data/bosses.json` übernehmen
- `npm run import:abilities`: Aegis-Reiter „Abilties“ nach `src/data/aegis-abilities.json` übernehmen (Gate und Fallback, ADR 0009)
- `npm run import:compendium`: Texte der Compendium-Subklassen-Reiter nach `src/data/compendium-abilities.json` übernehmen; Tests prüfen damit zitierte Werte (ADR 0009)
- `npm run import:icons`: Icons aus dem Bungie-Manifest laden (braucht `BUNGIE_API_KEY` in `.env.local`, nie committen)
