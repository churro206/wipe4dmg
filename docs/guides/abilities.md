# Guide: Abilities anlegen und aktualisieren

Für Agenten und Entwickler. Grundlage ist ADR 0009. Begriffe stehen im Glossary.

## Quellen und ihre Rollen

| Datei | Quelle | Rolle |
| --- | --- | --- |
| `src/data/compendium-abilities.json` | Compendium, Subklassen-Reiter (`npm run import:compendium`) | Liste aller Abilities, Grundwerte der Teile, Super-Dauer, Verbrauch, Pausen |
| `src/data/aegis-abilities.json` | Aegis, Reiter „Abilties“ (`npm run import:abilities`) | Gemessener Wert pro Einsatz bei Stat 100 und 200; Gate und Paket |
| `src/data/ability-stats.json` | Compendium, Game Mechanics | Schaden pro Stat-Punkt über 100 |
| Bungie-Manifest | `npm run import:icons` | Icons, später Klasse, Subklasse und Slot |

Beide Importe sind automatisch. Werte nie abtippen, wenn ein Import sie liefert.

## Ablauf für eine neue Ability

1. **Compendium-Eintrag finden.** In `compendium-abilities.json` den Eintrag suchen (Reiter und Name). Er kommt als `compendium: { tab, entry }` in die Ability. Ohne Eintrag erscheint die Ability nicht in der Abdeckung.
2. **Aegis-Basiszeile wählen** (`aegisRowId`), in dieser Reihenfolge:
   1. Zeile ohne Annahmen.
   2. Zeile, deren Annahmen nur die Ausführung beschreiben, z. B. „light attacks“ oder „grounded 2L1H“. Bei mehreren Ausführungen die stärkste, die ohne besondere Lage geht (Hammer of Sol: ohne „max distance“).
   3. Zeile mit Aspects oder Fragments, die zur Subklasse gehören, z. B. „Whisper of Fissures“.
   4. **Nie** eine Zeile mit Buffs, die wir nicht als Effect modellieren (Feast of Light, Banner of War, Biotic Enhancements). Ihr Wert ist sonst zu hoch.
   5. **Nie** eine Zeile mit Full Modifiers ×1,00, denn dort ist nichts normiert. Andere `unverified`-Zeilen nur mit Begründung in `docs/data-sources.md`.
3. **Teile oder Paket.**
   - Teile, wenn das Compendium alle Teile mit Zahl nennt. Jeder Wert zitiert seine Textstelle in `source.note`, und `hasQuote` muss sie im Snapshot finden.
   - Danach `npm test`. Besteht das Gate (±10 % bei Stat 100 und 200) nicht, gilt das Paket: `"package": true` ohne `components`. Den Befund in `docs/data-sources.md` eintragen (Tabelle „Teile gegen Aegis“).
4. **Eingerechnete Effects.**
   - Bei Paketen übernimmt der Import erkannte Effects automatisch.
   - Sagt die Zeile „includes debuff“ o. ä., ist der Effect von Hand zu ergänzen, z. B. der Tether bei Shadowshot.
   - Bringt die Ability einen Effect mit, kommt er in `grantsEffectIds`.
5. **Super Window (`usage`, nur Supers):**
   - `cast`: Nova Bomb, Blade Barrage, Well. `castMs` ist meist `null` mit Status `missing`.
   - `shots`: Golden Gun, Moebius Quiver. Anzahl, Schussabstand, Base Duration.
   - `drain`: Roaming Supers. Base Duration, Verbrauch pro Angriff als Anteil (0,12 für 12 %), Abstand zwischen Angriffen. Werte aus dem Compendium; passend zur Ausführung der Aegis-Zeile. Ein Kanal ohne Angriffe hat Verbrauch 0.
   - Kein `usage`, wenn selbst die Base Duration fehlt; der Super blockiert dann nicht.
6. **Klasse und Subklasse** in `providers`. Bis zum Manifest-Abgleich (Schritt 5) nur die Element-Subklasse eintragen.
7. **Code** eindeutig und nie wiederverwenden (Build-Links).
8. **Abschluss:**
   - `npm run coverage` ausführen.
   - `npm test`, `npx tsc -b`, `npx eslint .`, `npx prettier --check src scripts tests`.
   - `docs/roadmap.md` aktualisieren.

## Nach einem Patch

1. `npm run import:abilities` und `npm run import:compendium` ausführen.
2. `npm test` ausführen und die Fehler lesen:
   - Ein **Zitat fehlt** im Snapshot: Das Compendium hat den Wert geändert. Den neuen Wert und das neue Zitat übernehmen.
   - Das **Gate schlägt fehl**: Die Teile stimmen nicht mehr. Prüfen, ob das Paket gelten muss.
   - Eine **Aegis-Zeile fehlt**: Aegis hat Annahmen umbenannt. Neue Basiszeile wählen.
3. `npm run coverage` ausführen und die Änderungen in `docs/coverage.md` prüfen.
