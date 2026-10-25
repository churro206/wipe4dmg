---
name: pruefen
description: Beleg vor jeder Aussage „fertig“, „funktioniert“ oder „behoben“ in wipe4dmg. Benutzen nach jedem Schritt, vor jedem Commit mit Verhaltensänderung und bevor dem Inhaber ein Ergebnis gemeldet wird; auch mit /pruefen.
---

# Prüfen: Beleg vor Behauptung

Grüne Tests allein reichen nicht. Prüfe wie ein erfahrener Destiny-2-Spieler: Ergeben die Zahlen im Spiel Sinn?

## Ablauf (günstigster Beleg zuerst)

1. `npm run test:quiet`, `npx tsc -b` und `npm run lint`. Lies die Ausgabe: Anzahl der Tests, 0 Fehler, Exit-Code 0.
2. `npm run sanity`: Tabelle des Plausibilitäts-Gates (`tests/plausibility.test.ts`). Lies jede Zeile mit Spielwissen. Fällt dir etwas auf, z. B. ein Exotic ohne Wirkung, ein Buff mit falschem Wert oder eine unmögliche Dauer, ist der Schritt nicht fertig.
3. Neue Daten-Art oder neue Mechanik: Ein neues Szenario im Gate, das ein Spieler kennt. Mache die Gegenprobe: Das Szenario muss ohne die Änderung rot sein (alte Datei kurz mit `git checkout <commit> -- <datei>` holen und danach zurück).
4. Nur wenn sich die Oberfläche geändert hat: ein Screenshot gegen `https://wipe4dmg.pages.dev` nach dem Push. Cloudflare baut bei jedem Push auf `master`; warte, bis das neue Bundle live ist.
   - `node scripts/ui-check.mjs https://wipe4dmg.pages.dev/?b=<link> <out.png> [--dark] [--width 1400] [--click "Text"]`
   - Links für Builds mit `encodeLink(…, linkRegistry)` in einer kurzen Vitest-Datei erzeugen.

## Melden

- Schreibe „fertig“ nur mit Beleg, z. B. „940 Tests grün, Gate: Cuirass ×1,56“.
- Ohne Beleg schreibst du „ungeprüft“ und sagst, was fehlt.
- Melde Abweichungen offen, auch wenn sie unbequem sind.

Idee nach „verification-before-completion“ (obra/superpowers), gekürzt auf dieses Projekt.
