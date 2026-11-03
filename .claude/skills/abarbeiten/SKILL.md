---
name: abarbeiten
description: Arbeitet die freigegebene Checkliste in docs/plans/current.md mit Worker und Reviewer ab.
---

Arbeite die offenen Blöcke der Checkliste in docs/plans/current.md der Reihe nach ab. Ist sie nicht freigegeben, stoppe.

1. Starte den Subagent worker mit dem nächsten offenen Block. Steht „(Opus)“ im Block, mit Modell opus. Meldet der Worker „Rest: …“, starte für den Rest einen neuen Worker mit den bisherigen Commits; der Reviewer prüft erst, wenn kein Rest bleibt.
2. Meldet der Worker einen Widerspruch oder eine Frage an den Inhaber: Stoppe und frage den Inhaber.
3. Starte den Subagent reviewer mit allen Commit-Hashes des Blocks.
4. Bei OK: Hake den Block in docs/plans/current.md ab, committe und pushe. Gehe ohne Rückfrage zum nächsten Block. Jeder Block bekommt einen neuen Worker, jede Prüfung einen neuen Reviewer (frischer Kontext); behalte von jedem Block nur Commit, Urteil, Runden und die vier Listen. Stoppe erst bei Frage, Widerspruch, STOPP, einem Gate „Freigabe Inhaber“ oder am Ende der Checkliste.
5. Bei NACHBESSERN: Starte einen neuen Worker (sein Vorgänger trägt zu viel Kontext) mit Block, Commit-Hashes, den Entscheidungen des Inhabers aus diesem Block und der Mängelliste. Höchstens zwei Runden pro Block. Danach stoppe und frage den Inhaber.
6. Bei STOPP: Stoppe sofort und zeige dem Inhaber die Begründung.

Stoppe außerdem vor jedem Merge, vor jedem Streichen eines Planteils und vor jedem Lockern eines Gates.
Unmittelbar vor jedem Stopp (Frage, Tabelle, STOPP), nie während ein Subagent läuft: `npm run notify -- "<Block>: <Grund in wenigen Worten>"`. Subagents rufen `notify` nie auf.
Lies selbst keinen Code. Gib beim Stopp eine Tabelle über alle Blöcke dieses Laufs aus: Block, Commit, Urteil, Runden. Darunter Geeicht / Gelockert / Gestrichen / Unsicher aus den Berichten des Workers.