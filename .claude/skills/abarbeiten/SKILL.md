---
name: abarbeiten
description: Schlägt den nächsten offenen Block aus docs/plans/current.md vor und setzt ihn nach Freigabe in der Hauptsitzung um, ohne Subagents, bis zum Abschluss mit Bericht und /clear.
---

Ein Block pro Sitzung, in der Hauptsitzung. Keine Subagents, kein Review (außer der Inhaber sagt es an).

1. **Vorschlagen:** Lies `docs/plans/current.md`. Nenne den nächsten offenen Block in zwei bis drei Sätzen (Umfang, Gate, Modell: Sonnet, bei „(Opus)“ Opus) und warte auf die Freigabe. Nennt der Inhaber den Block schon im Auftrag, ist er freigegeben.
2. **Umsetzen:** Ein freigegebener Block läuft ohne Zwischenfragen. Test zuerst, dann der kleinste Code, der ihn grün macht; nichts, was der Block nicht verlangt.
3. **Kontext klein halten**, ohne Obergrenze für Aufrufe oder Items: Ein freigegebener Block läuft bis zum Ende.
   - Erst Grep, dann Read mit offset/limit. Große Dateien in Teilen, vom Bauplan den genannten Abschnitt. Nach Edit nicht zur Kontrolle lesen.
   - Während der Arbeit nur den eigenen Test (`npm run test:quiet -- tests/<datei>`). Ganze Suite, `coverage`, Snapshots vor dem Commit; `build:weapons`, sobald ein Test geänderte Items braucht.
   - `git diff` und `git show` zuerst mit `--stat`. JSON-Items mit Edit, nicht per Write neu.
4. **Prüfen** nach dem Skill `pruefen`: `npm run test:quiet`, `npx tsc -b`, `npm run lint`; bei W1–W4 danach `npm run check:block -- <ID>`. Ändert der Block die Oberfläche, prüfe im Browser (nur dort zeigen sich Layout-Fehler).
5. **Stoppen und fragen:** bei Widerspruch zwischen Block, Code und `CLAUDE.md`, vor jedem Streichen eines Planteils, Lockern eines Gates und Merge, und beim Gate „Freigabe Inhaber“. Mit Empfehlung.
6. **Abschluss:** Block abhaken (`- [x] … (<Commit>)`), `current.md` (höchstens 4 KB) so pflegen, dass der nächste Block ohne Chat-Verlauf starten kann, `docs/changelog.md` und `docs/roadmap.md` nachziehen. Nur die Dateien des Blocks stagen, committen, pushen.
7. **Bericht**, höchstens 15 Zeilen: zuerst „Was sich im Spiel ändert“ (je Waffe ein Satz in Spielersprache), dann Commit, Beleg (Gate-Zahlen vorher → nachher), offene Punkte, **Geeicht / Gelockert / Gestrichen / Unsicher**. Zuletzt `/clear` vorschlagen und das Modell für den nächsten Block nennen. Vor dem Ende: `npm run notify -- "<Block>: <Ergebnis in wenigen Worten>"`.
