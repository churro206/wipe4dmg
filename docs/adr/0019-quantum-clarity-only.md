# ADR 0019: Waffen aus Quantum und Clarity, Mechanik nach Regelvorlagen

Status: vorgeschlagen (Q0, 2026-11-03), wartet auf Freigabe des Inhabers · Bauplan `docs/architecture.md` (Abschnitte 3, 5.2 mit den Regelvorlagen, 5.3, 12, 13) · Plan Q in `docs/plans/current.md`, Hintergrund `docs/plans/history-2026-11.md`

## Kontext

- B6 schaffte zwei bis drei Waffen je Block; 51 Overrides und `weaponPackages.ts` raten Struktur aus Aegis-Zeilen und Freitext.
- Befund 2026-11-03: Einzeltreffer aus Quantum liegen auf ±2 % bei Aegis ÷ Full Modifiers (Malfeasance, Le Monarque, Thorn, Osteo Striga, Manticore, Ex Diris, Sunshot, Fourth Horseman, Fighting Lion, Alethonym). Was darüber liegt, sind Mechaniken im Aegis-Mittel, die in Clarity stehen (Explosionen, Status, Ramp, DoT).
- Quantum hat Schaden und Takt für 124 von 141 Exotics, Clarity Text für alle 141 (1490 Sätze mit Zahlen).
- B4 hatte je Feld entschieden: Schaden aus Quantum nur mit Stichprobe, sonst `$aegis` (Bauplan 13). Damit stammen Zahlen aus den Zeilen, die prüfen sollen.

## Entscheidung (Inhaber 2026-11-03)

1. **Einzige Quelle für Waffen-Items:** Zahlen aus Quantum (`$quantum`, Schaden und Takt), Mechanik und Zahlen im Text aus Clarity (`$clarity`), wo Clarity schweigt aus dem Compendium (`$compendium`), Ladezeit aus dem Manifest. Kein neuer `$aegis`- oder `$aegisSustained`-Verweis. Bestehende bleiben, bis ihr Item migriert ist (M5) oder in der Gegenprobe einen Nachtrag bekommt (Waffen ohne Quantum-Zeile).
2. **Aegis ist bis zur Gegenprobe nur Bericht.** Der Prüfstand rechnet weiter und schreibt seine Kennzahlen, ist aber kein Gate. In der Gegenprobe wird er wieder Gate (Delta-Paare, Rangfolge), dann folgt die Eichung (B5).
3. **Gerüst per Skript, einmalig (Q1):** je Exotic mit Quantum-Zeile eine Item-Datei mit Basiszeile (Treffer, Takt, Katalysator). Danach gehört die Datei dem Autor; das Skript läuft nicht wieder.
4. **Mechanik von Hand nach Vorlage (M1–M5):** Der Autor setzt jeden Satz mit Wirkung auf den Schaden gegen einen Boss als Regel nach einer Vorlage aus dem Katalog (Bauplan 5.2) um; jede Zahl ist ein Verweis mit Zitat. Ein Skript, das Struktur aus dem Text rät, ist verworfen (Freitext braucht ständig Sonderfälle).
5. **`notModelled`:** Jeder Satz mit Zahl, den keine Regel trägt, steht im Item mit Zitat und Grund. Das Zitat muss in einem Text des Items stehen (sonst Fehler beim Import). Der Bericht zählt Sätze mit Zahl, die weder ein `$clarity`-Zitat noch ein `notModelled`-Zitat enthalten; diese Zahl sinkt je Block.
6. **Neue Typen statt Sonderfelder:** Passt ein Satz mit über 2 % Wirkung in keine Vorlage, kommt er in `notModelled` mit Grund „needs …“ und in die Q-Bilanz; ein neuer Auslöser-, Aktions- oder Status-Typ ist ein eigener Block (I3).

## Verhältnis zu älteren ADRs

- **ADR 0018:** Bleibt. Punkt 1 wird enger: Was nur Aegis kennt, kommt nicht mehr als `$aegis` ins Item, sondern aus dem Text (`derived`) oder in `notModelled`. Punkt 6 (Prüfstand als Kennzahl) ruht bis zur Gegenprobe.
- **ADR 0013:** Pakete aus Aegis-Zeilen enden mit Q1 und A2 (`weapon-overrides.json`, Aegis-Paketpfad); `pickBaseRow` bleibt nur für Szenarien.
- **ADR 0005:** Eine Hauptquelle je Wertart gilt weiter: Quantum für Waffenzahlen, Clarity für Waffenmechanik.
- **Bauplan 13 (B4, „je Feld die Quelle mit Stichprobe“):** abgelöst.

## Folgen

- Neue Waffen kosten ein Gerüst (Skript) und eine Mechanik-Runde je Kategorie statt einer Regelkette plus Override.
- Der Prüfstand sinkt vorübergehend nicht mehr als Gate; Fehler in der Mechanik fallen erst in der Gegenprobe auf. Gegenmittel bis dahin: Golden-Waffe je Vorlage (Wert von Hand aus dem Text) und Plausibilität je Waffentyp.
- Quantum-Zeilen mit eigener Mechanik im Wert (Wish-Ender, Euphony, Leviathan's Breath) brauchen die Basiszeile ohne Zusatz oder eine Differenz als Teil (Vorlage Zusatzteil).
- 16 Exotics ohne Quantum-Zeile (mit Alias `tesselation`): sechs Hand-Items bleiben mit ihren Verweisen, die übrigen zehn kommen in der Gegenprobe.
