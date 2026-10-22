# ADR 0016: Prüfen mit Spielwissen und vertikale Scheiben

Status: angenommen · Datum: 2026-10-22

## Kontext

Nach U8 hat der Inhaber live drei Fehler gefunden, die die Tests nicht gefangen haben:
- Cuirass ändert Thundercrash nicht.
- Celestial Nighthawk ändert die Golden Gun nicht.
- Neue Aspects und Fragments waren ausgeblendet.

Dazu wurde „funktioniert“ ohne Beleg gemeldet.

Ursachen:
1. Die Tests prüften Bausteine mit erfundenen Daten, nicht die Zusagen über das Ganze.
2. Oberfläche und Tests haben Builds auf verschiedenen Wegen zusammengesetzt.
3. Der Umbau lief Schicht für Schicht (U6 Daten, Oberfläche erst in U8), deshalb war wochenlang nichts sichtbar.
4. Geprüft wurde nur „Tests grün“, nicht „ergeben die Zahlen im Spiel Sinn“.

Eine Messung (knip, Schichtregel) zeigt: Der Kern ist sauber. Schwach sind die Ränder, also die Text-Regeln und das Zusammensetzen in der Oberfläche.

## Entscheidung

1. **Ein Weg vom Build zur Simulation:** `buildSimulation(build, gameData)` in der Engine. Oberfläche, Tests, Optimizer und Discord Bot nutzen nur ihn.
2. **Plausibilitäts-Gate:** `tests/plausibility.test.ts` enthält Szenarien, die ein erfahrener Spieler kennt, auf dem Weg aus Punkt 1. Eine neue Daten-Art oder Mechanik bekommt ein Szenario, das ohne die Änderung rot ist. `npm run sanity` zeigt die Tabelle für den Spielerblick. Cloudflare veröffentlicht nur, wenn alle Tests grün sind (ADR 0003). Damit schützt das Gate auch die Live-Seite.
3. **Beleg vor Behauptung:** Skill `pruefen`. „Fertig“ steht nur mit Beleg (Tests, Gate-Tabelle, bei Oberfläche ein Screenshot), sonst „ungeprüft“.
4. **Vertikale Scheiben:** Jeder Schritt endet sichtbar, also Daten, Engine und Oberfläche zusammen.
5. **Erst aufräumen, dann ändern** („Tidy First?“, Kent Beck): Aufräumen in eigenen Commits und nur dort, wo die Datei ohnehin angefasst wird.
6. **Fremdtexte hinter einer Schicht** (Anti-Corruption Layer, Evans): Die Regel-Bibliotheken für Compendium-, Court- und Clarity-Texte bekommen gemeinsame Werkzeuge. Das geschieht beim nächsten Import-Schritt.
7. **Definition of Done** in `CLAUDE.md`.

## Folgen

- Fehler wie „Exotic ohne Wirkung“ fallen im Gate auf, bevor sie live gehen.
- Etwas mehr Testcode, aber weniger Rückfragen und Nacharbeit.
- Fremde Skill-Sammlungen werden nicht installiert. Ihre Beschreibungen kosten in jeder Session Tokens, es ist Code von Dritten, und der Kern von „verification-before-completion“ (obra/superpowers) steckt schon in `pruefen`.
