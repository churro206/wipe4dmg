# Architecture Decision Records

Eine Zeile pro ADR. Lies vor einem Block nur die ADRs, die er betrifft.

| ADR                                              | Thema                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| [0001](0001-timeline-simulation.md)              | Simulator rechnet mit Damage Instances auf einer Zeitachse                                              |
| [0002](0002-data-files-with-sources.md)          | Jeder Wert in einer Data File hat `source` mit Status (`verified`, `unverified`, `measured`, `missing`) |
| [0003](0003-static-web-app.md)                   | Statische Web-App ohne Server (Vite, React, Cloudflare Pages)                                           |
| [0004](0004-english-domain-terms.md)             | Code und Data Files englisch, Begriffe aus dem Glossary                                                 |
| [0005](0005-community-data-sources.md)           | Spielwerte aus frei zugänglichen Community-Quellen, eine Hauptquelle pro Wertart                        |
| [0006](0006-effect-model.md)                     | Effect-Modell: Effects aus Teilen (`multiplier`, `timing`, …)                                           |
| [0007](0007-charts-with-recharts.md)             | Diagramme mit Recharts, Daten aus `src/engine/analysis.ts`                                              |
| [0008](0008-icons-from-bungie-manifest.md)       | Icons aus dem Bungie-Manifest, beim Import geladen                                                      |
| [0009](0009-ability-components.md)               | Abilities aus Ability Components, Aegis-Pakete als Fallback und Gate                                    |
| [0010](0010-wiki-and-coverage.md)                | Wiki und Abdeckung aus den Daten berechnet                                                              |
| [0011](0011-decomposition-guards.md)             | Zerlegung nur als Verhältnis (Skalen-Regel) und mit Gate (Waffen ±3 %)                                  |
| [0012](0012-multiple-weapons.md)                 | Mehrere Waffen, eine Data File pro Waffe, Hauptquelle pro Waffe                                         |
| [0013](0013-weapon-import.md)                    | Waffen-Import aus Aegis, Quantum und Manifest als Pakete                                                |
| [0014](0014-exotic-armor.md)                     | Exotic-Rüstung: ein Exotic pro Build, Einordnung nach Regelkette                                        |
| [0015](0015-unified-mechanics.md)                | Einheitliches Mechanik-Modell: ein Teil-Modell und ein Ereignis-Lauf für alle Quellen                   |
| [0016](0016-verification-and-vertical-slices.md) | Prüfen mit Spielwissen (`buildSimulation`, Plausibilitäts-Gate), vertikale Scheiben                     |
