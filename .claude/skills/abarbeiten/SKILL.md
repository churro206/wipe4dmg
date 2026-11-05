---
name: abarbeiten
description: Setzt den nächsten offenen Block der freigegebenen Checkliste in docs/plans/current.md per Skript in einer frischen Sonnet-Sitzung um.
---

Ist die Checkliste in docs/plans/current.md nicht freigegeben, stoppe. Lies selbst keinen Code.

1. Starte den nächsten offenen Block: `npm run blocks` (ein Block je Aufruf; `-- --block <ID>` wählt, `-- --dry-run` zeigt nur den Auftrag, `-- --max-turns <N>` begrenzt). Das Skript startet eine frische Sitzung (Sonnet, bei „(Opus)“ Opus), prüft danach `test:quiet`, `tsc -b`, `lint` und stoppt beim ersten roten Gate. Es gibt keine Worker- und Orchestrator-Sitzung mehr.
2. Enger Opus-Review (höchstens 15 Aufrufe, nur lesen) läuft im Skript bei Änderungen in `src/engine/`, sonst nach jedem dritten Block. Vorschläge eines Reviewers sind Hypothesen, bis das Modell sie bestätigt.
3. Meldet der Bericht einen Widerspruch, eine Frage oder „Rest: …“, oder ist ein Gate rot: Stopp und den Inhaber fragen. Höchstens zwei Nachbesserungen je Block, jede mit frischer Sitzung.
4. Bei OK: Block in docs/plans/current.md abhaken, committen, pushen.
5. Der Bericht beginnt mit „Was sich im Spiel ändert“ (je Waffe ein Satz); Hashes, Beleg und die Listen Geeicht / Gelockert / Gestrichen / Unsicher folgen.

Stoppe vor jedem Merge, vor jedem Streichen eines Planteils und vor jedem Lockern eines Gates.
Vor jedem Stopp, nie während eine Sitzung läuft: `npm run notify -- "<Block>: <Grund in wenigen Worten>"`. Sitzungen des Skripts rufen `notify` nie auf.
