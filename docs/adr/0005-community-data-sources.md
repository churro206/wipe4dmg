# ADR 0005: Spielwerte kommen aus frei zugänglichen Community-Quellen

Status: angenommen · Datum: 2026-10-18

## Kontext

Eigene Messungen am Schießstand sind aufwendig. Eine erste Messung von One Thousand Voices hat gezeigt, dass schon eine Waffe viele Einzelwerte braucht (Beam, Explosion, Burn, Ignition, Zeiten). Für fast alle Waffen ist das nicht machbar.

Die Community pflegt öffentliche Tabellen mit Schadenswerten und Multipliern, z. B. die Boss-Damage-Tabelle von Aegis. Diese Tabellen lassen sich als CSV herunterladen.

Das Projekt ist privat, nicht kommerziell und nur für den Projektinhaber und seine Freunde gedacht. Die App muss Builds richtig zueinander einordnen. Absolute Zahlen müssen nicht mit dem Spiel übereinstimmen.

## Entscheidung

- Spielwerte kommen aus frei zugänglichen Community-Quellen. Wir messen nicht selbst, außer für Stichproben.
- Pro Wertart gibt es eine Hauptquelle. Für Waffenschaden ist das die Boss-Damage-Tabelle von Aegis.
- Wir übernehmen die Daten möglichst automatisch. Ein Import-Skript wandelt eine Quelle in Data Files um. Das Skript entsteht, sobald mehr als eine Waffe gebraucht wird.
- Jeder übernommene Wert nennt die Quelle im `source`-Objekt (ADR 0002). Wir fragen die Autoren nicht um Erlaubnis.
- Absolute Zahlen folgen den Messbedingungen der Hauptquelle. Wir rechnen sie nicht auf andere Ziele um.

## Folgen

- Neue Waffen kosten wenig Aufwand, solange die Quelle sie enthält.
- Unsere Ergebnisse sind nur so gut wie die Quelle. Fehler der Quelle übernehmen wir.
- Ändert eine Quelle ihren Aufbau, bricht der Import. Zod und die Tests fangen das ab.
- Eigene Messungen können von der Quelle abweichen. Sie dienen nur zur Plausibilitätsprüfung.
- Der Status `measured` aus ADR 0002 bleibt für Stichproben erhalten.
