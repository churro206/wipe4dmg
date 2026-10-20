# ADR 0013: Waffen-Import aus Aegis und Quantum

Status: angenommen · Datum: 2026-10-20

## Kontext

Es gibt etwa 100 exotische Waffen. Jede einzeln zu recherchieren und von Hand anzulegen, dauert zu lange (Truth: eine Stunde Recherche für eine Waffe). Die Community hat gemessen und dokumentiert:

| Quelle | Inhalt | Umfang (2026-10-20) |
| --- | --- | --- |
| Aegis, Reiter „Weapons“ | Gemessener Schaden („Wipe“), Anzahl Shots, „Full Modifiers“, „visual Value“ (Wipe ÷ Shots ÷ Full Modifiers), Annahmen als Text, Patch | 417 Zeilen zu 175 Waffen; Patch 9.7.0 bis 9.7.0.3 |
| Quantum, Reiter Primaries, Specials, Heavies | Body und Precision Damage, Magazin, Reserves + Magazine, rpm, Reload, Time to Empty, Theoretical Total Damage, Hinweise | 410 Zeilen, teils Stand 2024 |

117 Waffen stehen in beiden Quellen. Ein Probelauf mit einer groben Regel: Bei 50 von 80 Exotics stimmen Aegis und Quantum im Grundschaden auf ±3 % überein. Die Abweichungen kommen meist von Waffen mit mehreren Teilen (Gjallarhorn, Eyes of Tomorrow). Bei vielen Primaries fehlt die Time to Empty, weil die Munition praktisch unbegrenzt ist.

ADR 0009 löst dasselbe Problem für Abilities: Import, Regel für die Basiszeile, Pakete, Gate, Lückenliste. ADR 0011, Punkt 5, legt Waffen schon als Paket fest.

## Entscheidung

1. **Import:** `npm run import:weapons` legt Snapshots der Aegis- und Quantum-Zeilen in `src/data` ab und erzeugt daraus die Pakete in einer Data File (`src/data/weapon-packages.json`). Name, Element, Waffentyp, Munitionsart, Seltenheit und Perk-Namen kommen aus dem Bungie-Manifest.
2. **Umfang zuerst:** exotische Special- und Heavy-Waffen, die in beiden Quellen und im Manifest stehen. Primaries und legendäre Frames folgen später.
3. **Jede Annahme hat eine Art.** Der Import zerlegt die Annahmen jeder Aegis-Zeile (z. B. „average - Prototype Truthseeker, Reaper's Tithe x4“) und ordnet jede in `src/data/aegis-weapon-tokens.json` genau einer Art zu: Ausführung („average“, „heavy“), eigenes Intrinsic (laut Manifest), Katalysator, Waffen-Mod, Perk, modellierter Effect oder noch nicht modelliert. Was das Manifest nicht beantwortet, ordnet der Inhaber einmal zu. **Ein Test schlägt fehl, wenn eine Annahme keine Art hat.** So fällt jede neue Annahme nach einem Aegis-Update auf.
4. **Basiszeile bei Aegis**, in dieser Reihenfolge:
   1. Erlaubt sind Zeilen mit Annahmen der Arten Ausführung, eigenes Intrinsic und modellierter Effect. Das Intrinsic einer Exotic gehört damit immer zum Paket.
   2. Davon die Zeile mit den meisten Shots, denn sie liegt dem Dauerfeuer am nächsten (Truth: 9 Raketen mit Prototype Trueseeker statt 1 ohne).
   3. Modellierte Effects in der Zeile landen in `includedEffectIds` wie bei Abilities (ADR 0009, Punkt 5).
5. **Paket:** Eine Damage Instance pro Shot mit dem „visual Value“ der Basiszeile. Darin stecken Intrinsics, die Aegis mitgemessen hat (Cluster-Bomben, Reign Havoc, Blitze), als Durchschnitt.
6. **Timing von Quantum:** Magazin, Reserves + Magazine und Reload. Den Abstand zwischen zwei Shots berechnet der Import so, dass der Simulator die Time to Empty von Quantum trifft: Abstand = (Time to Empty − Reloads × Reload) ÷ (Shots − 1). Ohne Time to Empty gilt der Abstand aus der rpm. Ein Abstand ≤ 0 ist eine Lücke.
7. **Optionen statt Wegwerfen:** Unterscheidet sich eine Zeile von der Basiszeile nur durch Annahmen der Arten Katalysator, Waffen-Mod oder Perk, wird sie eine wählbare Option der Waffe mit Faktor (z. B. Reaper's Tithe x4, Composite Propellant x5, Spike Grenades). Der Katalysator ist der Schalter im Build (ADR 0012, Punkt 4). Nennt die Zeile Einzeltreffer (Spalten crit, body, other), gilt deren Verhältnis, sonst das Verhältnis der „visual Values“ bei gleicher Zahl an Shots. Andere Fälle sind eine Lücke für die Option, nicht für die Waffe.
   **Dauer und Bedingung jeder Option:** Eine Option gilt im Rechner die ganze Damage Phase. Der Import sucht deshalb Dauer und Bedingung im Compendium (z. B. Reaper's Tithe: 15 s, braucht 2 bis 4 gleichzeitige Kills). Jede Option mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer wird in der Prüftabelle und in der Hover-Karte markiert („gilt hier dauerhaft, im Spiel 15 s nach dem Feuern“). Sie ist ein Kandidat für einen Effect mit Zeitfenster.
8. **Nichts verschwindet still:** Zeilen, die weder Basiszeile noch Option sind (meist wegen einer Annahme „noch nicht modelliert“, z. B. Bolt Charge), stehen mit Grund in der Prüftabelle und in der Abdeckung. Die Prüftabelle zählt außerdem, wie oft jede nicht modellierte Annahme vorkommt; die häufigsten sind die nächsten Kandidaten für Effects.
9. **Gate automatisch pro Waffe:**
   - Skala: Grundschaden von Aegis (Einzeltreffer ÷ Full Modifiers) gegen Quantum (Body oder Precision Damage), ±3 % (ADR 0011, Punkt 1).
   - Timing: Der Simulator erreicht mit dem Paket die Time to Empty von Quantum, ±3 %.
   - Optionen: Faktor gegen die Quelle, ±3 % (ADR 0011, Punkt 2).
   Fällt eine Waffe durch, kommt sie mit Grund in `src/data/weapon-gaps.json` und erscheint in der Abdeckung. Ein Override mit Begründung (`weapon-overrides.json`) kann eine Regel für eine Waffe ersetzen, z. B. die Basiszeile.
10. **Prüftabelle statt Freigabe pro Waffe:** Der Import schreibt `docs/weapon-import.md` mit Waffe, Basiszeile, Werten, Gate und Auffälligkeiten (z. B. Quantum älter als Aegis, abgeleiteter Abstand weit weg von der rpm, Optionen mit begrenzter Dauer oder Bedingung). Der Inhaber gibt die Regeln einmal frei und danach die Prüftabelle pro Import.
11. **Handmodell bleibt möglich:** Waffen, deren Intrinsic mit Build-Entscheidungen zusammenspielt (One Thousand Voices mit Scorch und Ember of Ashes), bleiben als eigene Data File in `src/data/weapons/` (ADR 0012). Sie gehen dem Import vor.
12. **Codes:** Jede Waffe behält ihren Link-Code für immer. Der Import liest vergebene Codes aus `src/data/weapon-codes.json` und vergibt neue fortlaufend. Codes verschwundener Waffen werden nie neu vergeben.

## Folgen

- Eine neue Waffe kostet keine Recherche, solange sie die Regeln besteht. Nach einem Patch zeigt ein neuer Import, was sich geändert hat.
- Pakete sind Durchschnitte unter den Annahmen von Aegis (oft Precision-Treffer, feste Ausführung). Für Unterschiede zwischen Builds reicht das. Effects, die mit dem Intrinsic zusammenspielen, wirken auf Pakete nur als Multiplier.
- Thunderlord braucht keine eigene Engine-Arbeit für Reign Havoc; Truths Cluster-Bomben stecken im Durchschnitt. Schritt W2 im Plan entfällt.
- Ergänzt ADR 0012: Importierte Waffen stehen gesammelt in `weapon-packages.json` statt in je einer Datei. Ihr Gate ergibt sich aus den Snapshots statt aus `reference-values.json`.
- Die Oberfläche braucht für die Waffenauswahl eine Suche oder einen Filter nach Waffentyp.
- Grenzen: Perks und Mods der Waffe sind nur so weit wählbar, wie Aegis sie misst; jede Option ist ein fester Faktor, kein Zeitfenster. Waffen ohne Aegis-Zeile fehlen. Quantum ist bei manchen Waffen älter als der aktuelle Patch; die Prüftabelle zeigt das.
