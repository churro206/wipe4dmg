---
name: abarbeiten
description: Setzt den nächsten offenen Block der freigegebenen Checkliste in docs/plans/current.md per Skript in einer frischen Sonnet-Sitzung um.
---

Ist die Checkliste in docs/plans/current.md nicht freigegeben, stoppe. Lies selbst keinen Code.

1. Starte den nächsten offenen Block: `npm run blocks` (ein Block je Aufruf; `-- --block <ID>` wählt, `-- --dry-run` zeigt nur den Auftrag, `-- --max-turns <N>` begrenzt, `-- --fix <Datei>` übergibt bei Nachbesserungen die Mängelliste). Ein Block dauert länger als das Bash-Zeitlimit von 600 s: immer mit `run_in_background` starten und auf das Ende warten, nicht pollen. Das Skript startet eine frische Sitzung (Sonnet, bei „(Opus)“ Opus), prüft danach `test:quiet`, `tsc -b`, `lint` und stoppt beim ersten roten Gate. Es gibt keine Worker- und Orchestrator-Sitzung mehr.
2. Enger Opus-Review (höchstens 15 Aufrufe, nur lesen) läuft im Skript, wenn seit dem letzten Review `src/engine/` geändert wurde oder drei Blöcke ohne Review vergangen sind; geprüft wird alles seit dem letzten Review. Vorschläge eines Reviewers sind Hypothesen, bis das Modell sie bestätigt.
3. Das Skript endet mit Exit 0 nur, wenn ein neuer Commit entstand, der Bericht weder Rest, Widerspruch noch Frage nennt, alle Gates grün sind und ein laufender Review mit „Urteil: OK“ endet. Sonst ist es rot (Exit 1, Grund in „NOT DONE“): Lies den Bericht. Bei NACHBESSERN: Mängelliste in eine Datei in tmp/, `npm run blocks -- --block <ID> --fix <Datei>`, höchstens zwei Nachbesserungen je Block, jede mit frischer Sitzung. Bei Widerspruch, Frage, „Rest: …“, STOPP (der Plan ist falsch), rotem Gate oder dem Gate „Freigabe Inhaber“ (Q-Bilanz): Stopp und den Inhaber fragen.
4. Bei Exit 0: Block in docs/plans/current.md abhaken, committen, pushen.
5. Der Bericht beginnt mit „Was sich im Spiel ändert“ (je Waffe ein Satz); Hashes, Beleg und die Listen Geeicht / Gelockert / Gestrichen / Unsicher folgen.

Stoppe vor jedem Merge, vor jedem Streichen eines Planteils und vor jedem Lockern eines Gates.
Vor jedem Stopp, nie während eine Sitzung läuft: `npm run notify -- "<Block>: <Grund in wenigen Worten>"`. Sitzungen des Skripts rufen `notify` nie auf.
