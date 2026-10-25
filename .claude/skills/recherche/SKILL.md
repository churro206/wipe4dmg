---
name: recherche
description: Quellen-Recherche für fehlende Spielwerte, Buckets, Stacking-Regeln, Bedingungen, Timing oder Mechaniken in Destiny 2. Benutzen, bevor eine Lücke gemeldet, ein Wert als missing markiert oder der Inhaber nach Spielwissen gefragt wird; auch mit /recherche <Frage>.
---

# Quellen-Recherche

Ziel: Fehlendes Spielwissen selbst aus Community-Quellen beschaffen. Der Inhaber wird nicht auf die Suche geschickt.
Regeln aus `CLAUDE.md` gelten weiter: niemals raten, jeder Wert mit `source` und Zitat.

**Eine Quelle genügt (Inhaber):** Ein Wert aus einer Quelle im Katalog gilt als bestätigt. Eine zweite Quelle ist ein Plus, keine Pflicht. Bei Konflikt die vertrauenswürdigere oder logisch stimmigere Quelle nehmen (Messung vor Text, Aegis vor Quantum bei Waffen, aktueller vor älter) und den Grund notieren. Zahlen aus Texten (Compendium, Clarity) dürfen ohne Messung genutzt werden, Status `derived`. Mechaniken aus vorhandenen Daten logisch zusammensetzen ist erwünscht. Einzelfälle, die in keine Regel passen, kommen mit Zitat und Herleitung in eine Override-Datei. Gemini-Antworten sind keine Quelle, nur Hinweise (viele widersprachen Clarity).

## Ablauf

1. **Frage festlegen**, ein Satz pro Frage, z. B. „In welchem Bucket liegt der Bonus von Hallowfire Heart?“.
   Art der Frage: Wert · Bucket/Stacking · Bedingung/Dauer · Timing (RPM, Cast, Reload) · Zuordnung (Klasse, Slot, Element).
2. **Snapshots im Projekt zuerst** (kostet keine Abrufe): `npm run facts -- "<Name>"` zeigt alle Snapshots mit dem Namen kompakt. Große Snapshots nie direkt lesen. Danach Grep mit `-C` und Read mit `offset`. Nur für eine Auswertung über viele Einträge ein Skript in `tmp/` nach `CLAUDE.md` (Abschnitt „Befehle und Shell“).
3. **Online nur die Reiter aus dem Katalog, die zur Art der Frage passen.** Sheets per `htmlview/sheet?headers=true&gid=…` (CSV ist bei Court und Compendium gesperrt) mit `curl -o` in den Scratchpad, dann mit Grep gezielt filtern; nie ganze Seiten in den Kontext laden.
4. **Ergebnis mit Zitat**: Quelle, Reiter, genauer Text. Bei Widerspruch: Regel nach ADR 0011 (Verhältnis) oder ADR 0014 (Regelkette) anwenden.
5. **Neue Quelle gefunden?** Als Snapshot mit Import-Skript und Test vorschlagen (Muster: `scripts/import-court.ts`, `scripts/lib/court.ts`). Den Katalog unten ergänzen.
6. **Lücke nur mit Nachweis melden** (Definition of Done): Tabelle „Quelle | Reiter | Ergebnis“ mit jeder Quelle, die zur Art der Frage passt. Fehlt eine passende Quelle in der Tabelle, ist die Recherche nicht fertig.

## Zerlegen und Gegenrechnen

Steht ein Wert nicht direkt in einer Quelle, lässt er sich aber aus mehreren herleiten (z. B. ein Aegis-Paket in Treffer und Keyword-Schaden zerlegen), dann selbst herleiten und prüfen statt fragen:

1. **Zerlegen:** Teile mit Anzahl, Zeitpunkt und Keywords aus den Texten (Compendium, Clarity) und Werten (Aegis, Quantum) bestimmen.
2. **Nachstellen:** Die Messung der Quelle mit ihren Annahmen in der Engine nachstellen (gleiche Anzahl Einsätze, gleiche Buffs wie „Ember of Ashes“, Spielweise optimal wie bei Aegis).
3. **Gegenrechnen:** Modell gegen Messung, Abweichung in Prozent. Toleranz nach der Tabelle „Toleranzen“ in `docs/mechanics/README.md`.
4. **Melden:** Eine Tabelle „Quelle | Modell | Abweichung“ mit der Zerlegung. Nichts darf doppelt zählen oder fehlen.
5. **Nur bei Abweichung über der Toleranz** weiter recherchieren oder den Inhaber fragen.

**Budget:** höchstens 3 Online-Abrufe pro Frage, Snapshots zählen nicht. Danach Stand melden und fragen, ob weitergesucht wird. Mehrere Fragen mit denselben Reitern bündeln.

## Quellenkatalog

| Quelle | Zugriff | Reiter (gid) | Beantwortet | Snapshot |
| --- | --- | --- | --- | --- |
| Aegis Boss Damage | Sheet `1_5wtBjRYHHxuF4oJKDb_iOGZs-wTkzB6RYbnyNLbuz4`, CSV geht | Weapons `2139128689`, Abilties `1439633538`, Sustained `1455724279`, Swap `544204052`, Bosses `1346678363`, Testing `247390216` | gemessener Schaden, Pakete mit Annahmen (auch Exotics), Timing, Damage Phases | `aegis-weapons.json`, `aegis-abilities.json`, `aegis-sustained.json`, `bosses.json` |
| Court's Stacking Guide | Sheet `1i1KUwgVkd8qhwYj481gkV9sZNJQCE-C3Q-dpQutPCi4`, nur htmlview | Stacking Guide `2073397587`, Catalysts `1305623430` | Bucket, Stacking-Regel, PvE-Wert und Dauer von Buffs/Debuffs/Surges; Definition der Kategorien | `court-buffs.json` (`categories`, `entries`) |
| Destiny Data Compendium | Sheet `1WaxvbLx7UoSZaBqdFr1u32F2uWVLo-CJunJB4nlGUE4`, nur htmlview | Arc `618967225`, Solar `1186062409`, Void `1907852650`, Stasis `1088259962`, Strand `1870531554`, Prismatic `1918152785`, Exotic Armors `1500097863`, Exotic Weapons `441434520`, Weapon Perks `1662574278`, Armor Perks `1287885342`, Armor Mods `1934379638`, Artifact Perks `473308249`, Exotic Class `20898389`, Class Abilities `527596209`, Game Mechanics `1800463143` | Grundwerte, Dauer, Energie, Texte mit Zahlen, allgemeine Regeln (z. B. Melee-Buffs additiv, Stat-Skalierung) | `compendium-abilities.json`, `compendium-weapons.json`, `compendium-armor.json` |
| Quantum Damage-ics | Sheet `1x12Ar1-kHH2AzHY8Clkv-PIMxxDSZrIX3e4xiJuQ-uI`, CSV geht | Primaries `398985410`, Specials `1681969818`, Heavies `1406577322` | Waffen: Schaden pro Shot, Magazin, Reserves, RPM, Reload, Time to Empty | `quantum-weapons.json` |
| Clarity | `https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/live/descriptions/clarity.json` | – | Perk-, Katalysator- und Exotic-Texte mit Zahlen, teils Bucket („are Empowering Buffs“) | `clarity.json` |
| d2foundry Oracle Engine | `https://raw.githubusercontent.com/d2foundry/oracle_engine/master/build_resources/weapon_formulas.json` | – | Reload-Formel pro Waffentyp (Sekunden aus Reload-Stat), Handling, Range; trifft Aegis absolut nicht, nur als Faktor | `reload-formulas.json` |
| Bungie Manifest | API, braucht `BUNGIE_API_KEY` (`npm run import:icons`) | – | Struktur: Klasse, Slot, Element, Waffentyp, Perk-Namen; keine Spielzahlen | `manifest-*.json`, `icons.json` |
| Bungie Patch Notes, This Week in Destiny | bungie.net, Suche über Google `site:bungie.net` | – | Änderungen mit Zahlen (RPM, Dauer, Schaden) | – |
| Destiny Wiki (Fandom), d2.destinygamewiki, Destinypedia | Web | – | Patch-Historie, Beschreibungen; nur Hinweis, Status `unverified` | – |
| light.gg | Web | – | Perk-Texte (Clarity), Stats | – |
| Einzelwerte vom Inhaber (ADR 0014, Punkt 9) | Inhaber schlägt nach, z. B. Reddit | – | Werte, die sonst nirgends stehen; nur im Einzelfall | – |

**Nicht nutzen:** Reddit (für den Agenten gesperrt, nicht umgehen: keine Mirrors oder Archive), MossyMax (veraltet, nur Hinweis).

**Bekannte Fundorte nach Frageart:**
- Bucket/Stacking: Court Stacking Guide (Zeile, sonst Kategorie-Definition), dann Clarity-Text, dann Compendium Game Mechanics.
- Wert eines Exotics: Aegis-Paket mit dem Exotic in den Annahmen, dann Compendium Exotic Armors, dann Clarity.
- Timing von Supers (Cast, Schussabstand): Compendium Subklassen-Reiter, Aegis Abilties/Testing; bisher ohne Treffer (Stand 2026-10-21, `docs/mechanics/abilities-and-supers.md`).
- Waffen-Timing: Quantum, dann Aegis Sustained.
- Eigener Schaden von Aspects, Fragments und Turrets: Aegis Sustained, Typ `tick` (Base pro Treffer, „peak Rate“ = Sekunden zwischen Treffern, in `aegis-totals.json` als `rateSeconds`).
