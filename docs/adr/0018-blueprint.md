# ADR 0018: Bauplan – Messung nur als Prüfung, Items als Dateien, Eichung nur global

Status: angenommen (Inhaber, 2026-10-31) · Bauplan `docs/architecture.md` · Plan `docs/plans/ground-up-model.md` (Stufen B1–B6) · Branch `ground-up-model`, kein Merge ohne Ansage des Inhabers

## Kontext

Rückblick auf das Projekt am 2026-10-31 (Anlass: der Inhaber fand den Fortschritt zu langsam; ein ganzer Block ging in Barrow-Dyad):

- Seit dem Plan nach ADR 0017 sind Kern, Burn und sechs Waffen entstanden, aber nichts davon erreicht die App: Oberfläche und Optimizer rechnen mit dem alten `simulate()`, jede Neuerung steckt in beiden Simulatoren.
- Der Kern von ADR 0017 (Regeln, Status und Teile als Datensätze, Sonderfelder fallen weg) ist nicht gebaut. S3 Teil 3 und `weapon-components.json` wurden gestrichen; stattdessen kamen neue Sonderfelder (`everyNthShot`, `nthShotPart`, `playstyleParts`, `tickFactors`, `setupDeployed` …) und 65 Waffen-Overrides mit Begründung von Hand.
- Der Prüfstand bestätigt teils, was hineingesteckt wurde: Grundwerte der Pakete stammen aus den Aegis-Zeilen, gegen die sie geprüft werden (Whirling Ovation, Truth „jede 3. Rakete“, Barrow-Dyad-Reload). Echte Vorhersagen sind die Verhältnisse mit Faktor aus dem Text.
- Globale Parameter wurden von Hand an einzelnen Zeilen gestellt (Ignition-Cooldown 1,3 → 0,95 → 1,3 s an einem Tag), Gates gelockert, wenn ein Ergebnis nicht passte (Primary ≤ 1 → 1,25 → 1,5 × Gjallarhorn).
- Das Rangfolge-Gate steht auf geprüften Zeilen schon bei Spearman 0,99 / 1,00 / 1,00; schwach ist die Breite (Heavy 48 %, Special 52 % Abdeckung).
- Die Struktur der Items wird aus Text geraten (Regelketten über `scripts/lib/`, `weaponPackages.ts` über 2400 Zeilen); was der Rechner über ein Item glaubt, steht an keiner Stelle.

## Entscheidung

1. **Messung ist Prüfung, nicht Eingang.** Aegis Weapons, Abilities und Testing sind Szenarien. Braucht ein Item eine Zahl, die nur Aegis kennt, verweist es auf die Zeile (`$aegis[<Zeile>]`, Status `fitted`); diese Zeile zählt nicht mehr als Prüfung. Annahmen einer Messung stehen im Szenario, nicht im Modell.
2. **Ein Item ist eine Datei.** Struktur (Takt, Teile, Regeln, Spielweisen) schreibt der Autor von Hand; jede Zahl ist ein `$`-Verweis, den der Import füllt. Ein Text-Hash markiert Items nach einem Patch zum Prüfen. Eine Item-Datei ist Daten; Code für ein einzelnes Item bleibt verboten.
3. **Ein Kern, Regeln als Daten.** Oberfläche, Optimizer und Prüfstand nutzen denselben Kern. Verhalten entsteht nur aus Regeln (Auslöser → Bedingung → Aktion) mit etwa zehn Aktionstypen und einem allgemeinen Status-Container. Neuer Code nur für einen neuen Typ.
4. **Kanonische Skala** „Aegis visual“ (Schaden je Treffer gegen einen generischen Boss ohne Buffs); jede Quelle hat je Kategorie einen Umrechnungsfaktor als globalen Parameter.
5. **Ledger:** Jeder Treffer wird mit allen Faktoren gebucht; alle Ausgaben sind Summen darüber.
6. **Prüfstand automatisch:** Szenarien aus allen Zeilen, deren Annahmen einen Schalter haben; festes Los über die Zeilen-ID in Eichmenge (etwa 70 %) und Prüfmenge (etwa 30 %). Hauptkennzahl: Delta-Paare der Prüfmenge; Rangfolge zweite Kennzahl; Absolutwerte nur Information.
7. **Eichung nur global:** Ein Skript stellt die globalen Parameter θ gegen die Eichmenge (kleinste Quadrate, Totzone 2 %). Ein Item wird nie an eine Zeile angepasst; seine Abweichung ist ein Befund.
8. **Ehrliche Berichte:** Jeder Block endet mit „Geeicht / Gelockert / Gestrichen / Unsicher“. Planteile streichen und Gates lockern nur nach Rückfrage beim Inhaber.

## Verhältnis zu älteren ADRs

- **ADR 0005:** Zahlen kommen weiter automatisch aus Community-Quellen; die Struktur eines Items wird nicht mehr aus Text geraten. Aegis ist Prüfquelle. Ob Waffen-Grundwerte aus Quantum kommen (hält die Aegis-Zeilen als Prüfung frei) oder per `$aegis`-Verweis (aktueller, die Zeile ist dann geeicht), entscheidet B4 an Zahlen; bis dahin gilt „Aegis vor Quantum“.
- **ADR 0011:** Die Skalen-Regel je Fall wird zur kanonischen Skala mit Faktoren in θ; Punkt 5 (Waffen als Paket) gilt nur bis zur Migration ihrer Kategorie. Gates gegen gemessene Faktoren bleiben als Delta-Paare.
- **ADR 0013:** Pakete aus Aegis-Zeilen werden Item-Dateien; die Regelkette der Annahmen bleibt für den Szenario-Generator.
- **ADR 0015, Punkt 11:** „Keine Handmodelle“ gilt weiter für Code; die Struktur in Item-Dateien ist von Hand geschrieben und ersetzt die Regelketten.
- **ADR 0017:** Die fünf Schichten bleiben; Kennzahl und Kalibrieren sind hier genauer gefasst, die Stufen S5–S6 gehen in B1–B6 auf.

## Folgen

- Stufen B1–B6 in `docs/plans/ground-up-model.md`; jede führt ihre Invarianten aus `docs/architecture.md` mit Test ein.
- Die Kennzahl des Prüfstands sinkt zunächst, weil geeichte Zeilen nicht mehr zählen; das ist gewollt.
- Neue Items kosten eine Datei statt einer Regel im Import plus Override; ein Patch ändert Zahlen ohne Handarbeit.
- Risiko: Eine Struktur von Hand kann falsch sein. Abgefangen über Text-Hash, Delta-Paare und Rangfolge.
- Bis zur Migration einer Kategorie rechnen ihre Items mit den alten Paketen weiter.
