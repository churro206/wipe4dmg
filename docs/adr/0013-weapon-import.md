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

1. **Import:** `npm run import:weapons` legt Snapshots der Aegis- und Quantum-Zeilen in `src/data` ab und erzeugt daraus die Pakete in einer Data File (`src/data/weapon-packages.json`). Name, Element, Waffentyp, Munitionsart, Seltenheit und Perk-Namen kommen aus dem Bungie-Manifest (`npm run import:icons`, nach `import:weapons`, weil es die Aegis-Annahmen im ganzen Manifest nachschlägt).
2. **Umfang zuerst:** exotische Special- und Heavy-Waffen, die in beiden Quellen und im Manifest stehen. Primaries und legendäre Frames folgen später.
3. **Jede Annahme hat eine Art, automatisch** (Änderung 2026-10-20: keine Handzuordnung; Wunsch des Inhabers: möglichst viel automatisch). Der Import zerlegt die Annahmen jeder Aegis-Zeile (z. B. „average - Prototype Truthseeker, Reaper's Tithe x4“; Stapel wie „x4“ zählen nicht zum Namen) und ordnet jede über eine Regelkette zu; die erste Stufe mit Treffer gilt:
   1. **Sockets der Waffe im Manifest:** Intrinsic, Perk (alle Sockets außer Kosmetik und Mods, also auch Bauteile wie bei Praxic Blade), Waffen-Mod, Katalysator (Perks des Items „<Waffe> Catalyst“ oder das Wort „catalyst“). Eine ähnliche Schreibweise (höchstens 2 Zeichen Unterschied, z. B. Aegis „Truthseeker“, Manifest „Trueseeker“) zählt und wird markiert.
   2. **Modellierte Effects** nach Namen; „includes <Effect>“ bedeutet: im Wert eingerechnet.
   3. **Ausführung** über eine kleine, getestete Liste von Mustern: Zahlen, Ladestufen, Schlagfolgen (3L1H), „with …“, „includes …“, „excludes …“, Modi.
   4. **Ganzes Manifest nach Namen:** Der Item-Typ entscheidet. Exotic-Rüstung oder ihr Intrinsic (z. B. „Illegally Modded Holster“ von Lucky Pants), Artifact Perk, Waffen-Mod, Perk einer anderen Waffe.
   5. **Sonst „nicht modelliert, ohne Beleg“.** Das ist die sichere Seite: Die Zeile wird nicht genutzt.

   Die Prüftabelle zeigt jede Annahme mit Art und Stufe; Annahmen der Stufen 1 mit ähnlicher Schreibweise und 5 sind hervorgehoben. Ein Test prüft, dass die Prüftabelle aktuell ist, so zeigt der Diff jede neue Annahme nach einem Aegis-Update.
4. **Wechselwirkungen zwischen Waffen, Rüstung und Abilities:** Der Manifest-Import liest auch die exotische Rüstung mit dem Text ihres Intrinsics. Nennt der Text einen Waffentyp (Lucky Pants: Hand Cannons; Probelauf: 12 Exotics), steht die Rüstung als Kandidat bei jeder Waffe dieses Typs in der Prüftabelle. Umgekehrt stehen Waffen, deren Intrinsic oder Katalysator Abilities nennt (Grenade, Melee, Super, Class Ability), als Kandidat bei der Ability-Art. Aegis-Zeilen mit Exotic-Rüstung werden Kandidaten für E1 (Exotic-Rüstung), nicht Basiszeile.
5. **Basiszeile bei Aegis**, in dieser Reihenfolge:
   1. Erlaubt sind Zeilen mit Annahmen der Arten Ausführung, eigenes Intrinsic, eigener Perk oder Mod (bei Exotics meist fest eingebaut) und modellierter Effect. Das Eigene einer Exotic gehört damit zum Paket.
   2. Davon die Zeile mit den wenigsten Perks und Mods (so wird eine Zeile mit zusätzlichem Perk zur Option), dann die mit den meisten Shots, denn sie liegt dem Dauerfeuer am nächsten (Truth: 9 Raketen mit Prototype Trueseeker statt 1 ohne).
   3. Modellierte Effects in der Zeile landen in `includedEffectIds` wie bei Abilities (ADR 0009, Punkt 5).
6. **Paket:** Eine Damage Instance pro Shot mit dem „visual Value“ der Basiszeile. Darin stecken Intrinsics, die Aegis mitgemessen hat (Cluster-Bomben, Reign Havoc, Blitze), als Durchschnitt.
7. **Timing aus zwei Quellen** (Ergänzung 2026-10-20: jeder Wert möglichst aus zwei Quellen; stimmen sie überein, ist er belegt, sonst gilt die aktuellere und die Abweichung ist markiert):
   - **Aegis, Reiter „Sustained“** (gleicher Autor und Patch wie der Schaden, daher zuerst): Shots, Magazin-Folge („3-3-3-3-2“), Zeit bis leer, Reload, Charge und Swap in ms aus den Notizen. Nur Zeilen, deren Annahmen das Paket erlaubt (Punkt 5); Aegis rechnet oft mit Meta-Builds, z. B. Parasite mit Envious Arsenal.
   - **Quantum**: Magazin, Reserves + Magazine und Reload aus der Zeile ohne Variante, sonst aus einer Variante, die nur die Ausführung beschreibt (z. B. „direct impact“, „ADS“), sonst aus einer Katalysator-Zeile mit Warnung.
   - Den Abstand zwischen zwei Shots berechnet der Import so, dass der Simulator die Zeit bis leer der Quelle trifft. Quantum: Abstand = (Zeit bis leer − Reloads × Reload) ÷ (Shots − 1). Aegis lädt direkt nach dem letzten Schuss nach: Abstand = (Zeit bis leer − Reloads × Reload) ÷ (Shots − Magazine), und der Simulator bekommt Reload − Abstand, weil er den Abstand vor jedem Reload mitzählt. Ohne Zeit bis leer gilt der Abstand aus der rpm. Ein Abstand ≤ 0 bei mehr als einem Schuss pro Magazin ist eine Lücke; bei Magazin 1 spielt der Abstand keine Rolle (Parasite: 17 Reloads × 2,08 s = 35,4 s).
   - Weitere Stimmen folgen: Magazin und rpm aus den Waffen-Stats des Manifests; Widersprüche, die keine Regel löst, erklärt ein Override mit Begründung und wörtlichem Zitat aus einem Snapshot (`weapon-overrides.json`, ein Test prüft das Zitat).
8. **Optionen statt Wegwerfen:** Unterscheidet sich eine Zeile von der Basiszeile nur durch Annahmen der Arten Katalysator, Waffen-Mod oder Perk, wird sie eine wählbare Option der Waffe mit Faktor (z. B. Reaper's Tithe x4, Composite Propellant x5, Spike Grenades). Der Katalysator ist der Schalter im Build (ADR 0012, Punkt 4). Nennt die Zeile Einzeltreffer (Spalten crit, body, other), gilt deren Verhältnis, sonst das Verhältnis der „visual Values“ bei gleicher Zahl an Shots. Andere Fälle sind eine Lücke für die Option, nicht für die Waffe.
   **Dauer und Bedingung jeder Option:** Eine Option gilt im Rechner die ganze Damage Phase. Der Import sucht deshalb Dauer und Bedingung im Compendium (z. B. Reaper's Tithe: 15 s, braucht 2 bis 4 gleichzeitige Kills). Jede Option mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer wird in der Prüftabelle und in der Hover-Karte markiert („gilt hier dauerhaft, im Spiel 15 s nach dem Feuern“). Sie ist ein Kandidat für einen Effect mit Zeitfenster.
9. **Nichts verschwindet still:** Zeilen, die weder Basiszeile noch Option sind (meist wegen einer Annahme „noch nicht modelliert“, z. B. Bolt Charge), stehen mit Grund in der Prüftabelle und in der Abdeckung. Die Prüftabelle zählt außerdem, wie oft jede nicht modellierte Annahme vorkommt; die häufigsten sind die nächsten Kandidaten für Effects.
10. **Gate automatisch pro Waffe:**
   - Skala, ±3 % (ADR 0011, Punkt 1), auf einem von zwei Wegen (Ergänzung 2026-10-20 nach dem ersten Lauf): Einzeltreffer von Aegis (÷ Full Modifiers) gegen Body oder Precision Damage von Quantum, oder der Mittelwert pro Shot (Aegis „visual Value“ gegen Quantum Theoretical Total Damage ÷ Shots oder gegen „Base“ im Aegis-Reiter „Sustained“; der letzte Vergleich hilft, wo Quantum fehlt, ist aber derselbe Autor). Der erste Weg scheitert an Waffen mit mehreren Teilen (Gjallarhorn), der zweite an unterschiedlichen Annahmen (Truth: Quantum ohne Cluster-Bomben).
   - Timing: Der Simulator erreicht mit dem Paket die Zeit bis leer der gewählten Quelle, ±3 % (Test).
   - Optionen: Faktor gegen die Quelle, ±3 % (ADR 0011, Punkt 2).
   Fällt eine Waffe durch, kommt sie mit Grund in `src/data/weapon-gaps.json` und erscheint in der Abdeckung. Ein Override mit Begründung (`weapon-overrides.json`) kann eine Regel für eine Waffe ersetzen, z. B. die Basiszeile.
11. **Prüftabelle statt Freigabe pro Waffe:** Der Import schreibt `docs/weapon-import.md` mit Waffe, Basiszeile, Werten, Gate und Auffälligkeiten (z. B. Quantum älter als Aegis, abgeleiteter Abstand weit weg von der rpm, Optionen mit begrenzter Dauer oder Bedingung). Der Inhaber gibt die Regeln einmal frei und danach die Prüftabelle pro Import.
12. **Handmodell bleibt möglich:** Waffen, deren Intrinsic mit Build-Entscheidungen zusammenspielt (One Thousand Voices mit Scorch und Ember of Ashes), bleiben als eigene Data File in `src/data/weapons/` (ADR 0012). Sie gehen dem Import vor.
13. **Codes:** Jede Waffe behält ihren Link-Code für immer. Der Import liest vergebene Codes aus `src/data/weapon-codes.json` und vergibt neue fortlaufend. Codes verschwundener Waffen werden nie neu vergeben.

14. **Eine Wahrheit pro Feld** (Ergänzung 2026-10-20). Das Manifest kommt von Bungie und ist die Wahrheit für Struktur und Identität. Seine Stats sind aber Anzeigewerte, nicht die echten (Probe: alle Rocket Launcher zeigen 15 RPM statt etwa 47, Truth Magazin 1 statt 3, Thunderlord 450 statt 617 RPM, Xenophage Magazin 20 statt 13; der Inhaber bestätigt 13). Für Zahlen gelten deshalb die Messungen der Community.

    | Feld | Hauptquelle | Gegenprobe |
    | --- | --- | --- |
    | Name, Typ, Element, Munition, Perks, Katalysator, Exotic-Rüstung, Texte | Manifest | – |
    | Schaden pro Shot, Optionen | Aegis „Weapons“ | Quantum, Aegis „Sustained“ (Base) |
    | Shots, Magazin, Reload, Zeit bis leer | Aegis „Sustained“, sonst Quantum | die andere Quelle; Manifest-Anzeige nur als Hinweis |
    | Mechaniken mit Zahlen (0,2x, +40 %) | Compendium | Aegis „mit / ohne“ |
    | Dauer und Bedingung von Optionen | Compendium | Manifest-Text |

15. **Timing trotz fremder Annahmen:** Eine Aegis-„Sustained“-Zeile taugt fürs Timing, auch wenn sie fremde Annahmen enthält (meist Meta-Builds), solange keine davon das Timing ändert. Das entscheidet der Text der Annahme: Compendium (Weapon Perks), Manifest (Item-Beschreibung, Intrinsic der Exotic-Rüstung) oder unser Effect (nur Multiplier, keine Timing-Parts). Nennt der Text Munition, Reload, Magazin, Reserven, Feuerrate, Charge oder Swap, oder gibt es keinen Text, taugt die Zeile nicht. Die Prüftabelle nennt die Annahmen, die so zugelassen wurden.

## Folgen

- Eine neue Waffe kostet keine Recherche, solange sie die Regeln besteht. Nach einem Patch zeigt ein neuer Import, was sich geändert hat.
- Pakete sind Durchschnitte unter den Annahmen von Aegis (oft Precision-Treffer, feste Ausführung). Für Unterschiede zwischen Builds reicht das. Effects, die mit dem Intrinsic zusammenspielen, wirken auf Pakete nur als Multiplier.
- Thunderlord braucht keine eigene Engine-Arbeit für Reign Havoc; Truths Cluster-Bomben stecken im Durchschnitt. Schritt W2 im Plan entfällt.
- Ergänzt ADR 0012: Importierte Waffen stehen gesammelt in `weapon-packages.json` statt in je einer Datei. Ihr Gate ergibt sich aus den Snapshots statt aus `reference-values.json`.
- Die Oberfläche braucht für die Waffenauswahl eine Suche oder einen Filter nach Waffentyp.
- Grenzen: Perks und Mods der Waffe sind nur so weit wählbar, wie Aegis sie misst; jede Option ist ein fester Faktor, kein Zeitfenster. Waffen ohne Aegis-Zeile fehlen. Quantum ist bei manchen Waffen älter als der aktuelle Patch; die Prüftabelle zeigt das.
