---
name: abarbeiten
description: Arbeitet die freigegebene Checkliste in docs/plans/current.md mit Worker und Reviewer ab.
---

Arbeite die offenen Blöcke der Checkliste in docs/plans/current.md der Reihe nach ab. Ist sie nicht freigegeben, stoppe.

1. Starte den Subagent worker mit dem nächsten offenen Block. Steht „(Opus)“ im Block, mit Modell opus.
2. Meldet der Worker einen Widerspruch oder eine Frage an den Inhaber: Stoppe und frage den Inhaber.
3. Starte den Subagent reviewer mit allen Commit-Hashes des Blocks.
4. Bei OK: Hake den Block in docs/plans/current.md ab, committe und pushe. Gehe zum nächsten Block.
5. Bei NACHBESSERN: Starte den Worker mit den Mängeln. Höchstens zwei Runden pro Block. Danach stoppe und frage den Inhaber.
6. Bei STOPP: Stoppe sofort und zeige dem Inhaber die Begründung.

Stoppe außerdem vor jedem Merge, vor jedem Streichen eines Planteils und vor jedem Lockern eines Gates.
Lies selbst keinen Code. Gib am Ende eine Tabelle aus: Block, Commit, Urteil, Runden. Darunter Geeicht / Gelockert / Gestrichen / Unsicher aus den Berichten des Workers.