# ADR 0002: Data Files enthalten Quelle und Status für jeden Wert

Status: angenommen · Datum: 2026-10-18

## Kontext

Viele Werte sind nur in Community-Quellen dokumentiert. Einige Quellen sind alt. Einige Werte fehlen ganz. Das Ziel „absolute Zahlen" verlangt, dass wir jede Zahl nachvollziehen können.

## Entscheidung

- Jeder Zahlenwert in einer Data File hat ein Objekt `source` mit Name, URL, Datum und Status.
- Der Status ist `verified`, `unverified`, `measured` oder `missing`.
- Ein unbekannter Wert ist `null` mit Status `missing`. Wir raten keine Werte.
- Zod prüft jede Data File beim Laden gegen `src/data/schema.ts`.
- Jede Weapon enthält das Feld `gameVersion`.

## Folgen

- Die App kann unsichere Ergebnisse kennzeichnen.
- Der Simulator lehnt Builds mit fehlenden Pflichtwerten ab, statt falsche Zahlen zu liefern.
- Eigene Messungen ersetzen Community-Werte schrittweise.
