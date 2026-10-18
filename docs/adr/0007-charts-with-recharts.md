# ADR 0007: Diagramme mit Recharts

Status: angenommen · Datum: 2026-10-18

## Kontext

Die Oberfläche soll Ergebnisse grafisch zeigen: Damage Curve, DPS je Länge der Damage Phase, Schaden nach Art, Breakdown. Später kommen Zeitleiste (Rotation) und Ranglisten (Optimizer) dazu. Die App nutzt React.

## Entscheidung

- Diagramme entstehen mit **Recharts** (Version 3.10.1, Juli 2026). Recharts beschreibt Diagramme als React-Komponenten und deckt Linien, Balken und Donuts ab.
- Die Engine liefert die Daten für die Diagramme als reine Funktionen (`src/engine/analysis.ts`). Recharts wird nur in `src/ui` verwendet.
- Farben und Gestaltung folgen einer festen Methode: Farben pro Art (nicht pro Rang), geprüft auf Farbsehschwäche für hell und dunkel, dünne Linien, Tooltips und eine Tabellenansicht für jeden Wert.
- Ein Kuchen- oder Donut-Diagramm nur für Anteile, die sich addieren (Schaden nach Art), nie für Buckets, die sich multiplizieren.

## Folgen

- Das Bundle wird größer (etwa 100 kB komprimiert). Für eine App unter Freunden ist das unkritisch.
- Die Engine bleibt frei von Browser- und React-Code. Der Discord Bot (US-13) kann dieselben Daten nutzen und selbst darstellen.
