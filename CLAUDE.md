# wipe4dmg

## Ziel

Die App berechnet den Total Damage eines Builds in Destiny 2.
Die erste Waffe ist One Thousand Voices. Später folgen fast alle Waffen.
Die Unterschiede zwischen Builds sollen stimmen. Absolute Zahlen müssen nicht mit dem Spiel übereinstimmen.
Die Spielwerte kommen aus frei zugänglichen Community-Quellen, möglichst automatisch übernommen (ADR 0005).
Zielgruppe: der Projektinhaber und seine Freunde, vor allem am PC.
Das Projekt ist privat, nicht kommerziell und nur zum Spaß.

## Dokumente

- `docs/requirements.md`: Produktvision, User Stories, Releaseplan, Glossary, Risiken.
- `docs/adr/`: Architecture Decision Records. Lies alle ADRs vor größeren Änderungen.
- `docs/data-sources.md`: Datenquellen, Messbedingungen und Messprotokoll.
- `docs/mechanics/`: Wissen über Mechanics von Destiny 2. Lies `docs/mechanics/README.md` vor Änderungen an Effects oder am Simulator.
- `docs/guides/abilities.md`: Ablauf zum Anlegen und Aktualisieren von Abilities (ADR 0009). Lies ihn vor Änderungen an `abilities.json`.
- `docs/guides/measurements.md`: Ingame-Tests des Inhabers (Ember, Explosionen, Shot-Abstand, Particle Reconstruction, Radiant auf Golden Gun). Ergebnisse ins Messprotokoll, dann in Data Files und Gates.
- `docs/coverage.md`: Abdeckung (generiert, nicht von Hand bearbeiten). Nach Änderungen an Data Files `npm run coverage` ausführen.
- `docs/roadmap.md`: Woran gearbeitet wird; Quelle für die Website (US-15). Nach jedem abgeschlossenen Schritt aktualisieren.

## Sprache

- Antworte auf Deutsch in kurzen, klaren Sätzen. Erkläre jede Änderung, der Nutzer hat Grundkenntnisse.
- Code, Bezeichner, Kommentare und Data Files sind englisch.
- Verwende nur Begriffe aus dem Glossary (Damage Phase, Damage Instance, Bucket, Build, Rotation ...).
  Ein neuer Begriff kommt zuerst ins Glossary.

## Architektur

```
src/data/      Data Files (JSON) und Zod-Schema (schema.ts). Keine Logik.
src/engine/    Simulator und Optimizer. Nur reine Funktionen, kein React.
src/ui/        React-Oberfläche. Ruft nur die Engine auf. Komponenten in src/ui/components/.
public/icons/  Icons aus dem Bungie-Manifest (ADR 0008), erzeugt von npm run import:icons.
scripts/       Import-Skripte für Community-Quellen (ADR 0005). Reine Funktionen in scripts/lib/, getestet.
tests/         Vitest-Tests für die Engine. Helfer für generierte Dokumente in tests/support/.
```

## Regeln

- Keine Zahlenwerte im Code. Alle Spielwerte stehen in `src/data`.
- Jeder Wert in einer Data File hat ein `source`-Objekt. Unbekannte Werte sind `null` mit Status `missing`. Rate niemals Werte.
- Jede Änderung an `src/engine` braucht einen Test. Schreibe den Test zuerst.
- Pro Bucket zählt die Stacking-Regel aus `buckets.json`. Buckets multiplizieren sich untereinander.
- Der Simulator arbeitet mit Damage Instances auf einer Zeitachse (ADR 0001).
- `src/engine` nutzt keine Browser-APIs (kein `window`, kein `document`, kein `localStorage`).
  Der spätere Discord Bot führt die Engine in Node.js auf einem Raspberry Pi aus (US-13).
- Baue keine Funktion auf Vorrat. Baue nur, was die aktuelle User Story braucht.

## Arbeitsweise

1. Lies die User Story und die betroffenen Dateien.
2. Schlage einen Plan vor und warte auf Freigabe.
3. Schreibe zuerst die Tests, dann den Code.
4. Führe `npm test` aus. Melde das Ergebnis.
5. Fasse die Änderung in zwei bis drei Sätzen zusammen.

Widerspruch ist erwünscht: Sag dem Inhaber offen, wenn er sich verrennt, z. B. wenn ein Wunsch dem Ziel, den Regeln oder einem ADR widerspricht oder der Aufwand den Nutzen übersteigt.

## Aktueller Stand (2026-10-20)

Für die nächste Session. Details: `docs/roadmap.md`, `docs/coverage.md`, `git log`.

- **Release v1.0 in Arbeit.** Offen sind der Rest von US-14 (Fähigkeiten und Supers) und US-15 (Wiki). Danach testen die Freunde v1.0 (Gate).
- **US-14, Entscheidung in ADR 0009:** Abilities bestehen aus Ability Components (Compendium). Fehlen Teile oder fällt die Ability durchs Gate, gilt ein Aegis-Paket. Aegis ist das Gate (±10 % bei Stat 100 und 200).
- **Erledigt:**
  - Importe für Aegis-Abilities, Compendium-Snapshot (mit Zitat-Check) und Manifest-Abilities.
  - Engine: Abilities auf der Zeitachse, Ability Stat linear pro Punkt, Super Window (cast, shots, drain), `includedEffectIds` gegen doppelte Buffs, `grantsEffectIds`, Schaden und Breakdown pro Damage Source.
  - Daten: 25 Supers, 26 Grenades und 24 Melees als Pakete. Lücken stehen mit Grund in `ability-gaps.json`. Klasse, Subklasse, Prismatic und Icons kommen aus dem Manifest.
  - Link-Format 3. Format 2 bleibt lesbar.
  - Fähigkeiten-Panel in der Oberfläche (6b).
- **Quellen-Abgleich (2026-10-20):**
  - Courts Stacking Guide vollständig gelesen (etwa 100 Effects, 17 im Modell). Surge 1x bis 4x = 10/17/22/25 %. Amplification, Weapon Perks und Exotic Intrinsics stapeln auch untereinander; diese Buckets und `solar-surge-3x` sind jetzt `verified`.
  - Neu und noch nicht im Modell: Melee-Buffs addieren sich, Expanding Abyss, Radiant auf Golden Gun und Still Hunt (Liste in `docs/mechanics/damage-stacking.md` und `docs/roadmap.md`).
  - MossyMax ist veraltet (v1.9.2, Februar 2025), nur als Hinweis. Gemini schlug keine neue Quelle vor.
- **Recherche Wissenslücken (2026-10-20), ADR 0011:** Drei Fehler im Modell von One Thousand Voices, alle beim Zusammensetzen:
  - Ember of Ashes +9,4 % statt +17 %: selbst abgeleiteter Abstand der Explosionen (`intervalMs` 66,7) ließ Ignitions in den Cooldown fallen. **Korrigiert** (Explosionen gleichzeitig, ×1,188).
  - Katalysator ×1,26 statt ×1,37: Seeker über der Grenze von 5 müssen ihren Aufprall machen; Seeker-Werte sind in Compendium-Skala (etwa 1,26 × Quantum). **Korrigiert** (×1,392, neues Feld `sourceScale`).
  - Golden Gun: Das Aegis-Paket enthält Radiant, ein Build ohne Radiant war 20 % zu hoch. **Korrigiert:** eingerechnete Multiplier werden herausgerechnet (ADR 0009, Punkt 5), Radiant und Well wirken auf Golden Gun (Feld `abilityIds`).
  - Neue Regel (ADR 0011): Quellen nur als Verhältnis mischen, abgeleitete Werte nur mit Gate.
- **Erkenntnis:** Compendium-Teile haben das Gate bisher nicht bestanden (Thundercrash −12,5 %, Anzahl der Aftershocks unklar). Deshalb sind fast alle Abilities Pakete.
- **Nächste Schritte (Masterplan):**
  - **Korrekturen nach ADR 0011:** erledigt (Gate `tests/weaponEffectGate.test.ts`, Ember, Katalysator, Golden Gun). Ingame-Tests stehen in `docs/guides/measurements.md` (Inhaber hat keinen Katalysator).
  - **6c, Ergebnis:**
    - Donut nach Damage Source; heute zeigt er noch „hammer-of-sol.package“.
    - Breakdown-Tabelle pro Damage Source.
    - Zeitleiste mit Ability-Zeilen und schraffiertem Super Window; Einsatzzeit einstellbar, weitere Casts über „+“.
  - **6d, Optimizer:** probiert auch Super, Grenade und Melee.
  - **6e, Wiki-Reiter (ADR 0010):**
    - Abdeckung und Roadmap.
    - „Wie rechnet der Rechner?“ (`docs/mechanics/how-it-works.md`, neu).
    - Abschnitte „Für Spieler“ in `docs/mechanics`.
  - **7, Abschluss v1.0:** Changelog, Releaseplan, Testlauf mit den Freunden.
  - **v1.x:** Feast of Light und Banner of War als Effects (macht Bladefury nutzbar), Well-Mechanik (Waffenschaden zählt als Super-Schaden, Dauer mit Super-Stat), Line 'Em Up, fehlende Zeitwerte der Supers.
- **Arbeitsstil des Inhabers:**
  - Kleine Schritte: Plan, Freigabe („ok“), Tests zuerst.
  - Nach jedem Schritt: Commit und Push.
  - Vor Datenarbeit eine Tabelle zur Freigabe zeigen.
- **UI-Check:** `npx vite preview --port 4173` plus Headless Chrome über das DevTools-Protokoll. Die Fallstricke stehen im Memory „UI check with headless Chrome“. Die Prüfskripte lagen im Scratchpad und sind nicht im Repo.

## Befehle

- `npm run dev`: Entwicklungsserver starten
- `npm test`: Tests ausführen
- `npm run build`: Produktionsversion bauen
- `npm run import:bosses`: Bosse und Damage Phases aus der Aegis-Tabelle nach `src/data/bosses.json` übernehmen
- `npm run import:abilities`: Aegis-Reiter „Abilties“ nach `src/data/aegis-abilities.json` übernehmen (Gate und Fallback, ADR 0009)
- `npm run import:compendium`: Texte der Compendium-Subklassen-Reiter nach `src/data/compendium-abilities.json` übernehmen; Tests prüfen damit zitierte Werte (ADR 0009)
- `npm run coverage`: `docs/coverage.md` aus den Data Files neu schreiben (ein Test prüft, dass sie aktuell ist)
- `npm run import:icons`: Icons und Ability-Zuordnung (Klasse, Subklasse, Prismatic) aus dem Bungie-Manifest laden (braucht `BUNGIE_API_KEY` in `.env.local`, nie committen; lädt die etwa 200 MB große Item-Tabelle)
