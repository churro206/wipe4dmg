# ADR 0011: Zerlegung nur mit Skalen-Regel und Gate

Status: angenommen · Datum: 2026-10-20

## Kontext

Der Inhaber möchte den Schaden so weit wie möglich in Teile zerlegen, damit Builds modular kombinierbar sind. Eine Recherche am 2026-10-20 (Ember of Ashes, Taken Seeker, Particle Reconstruction, Buffs auf Supers) hat drei Fehler in unserem Modell von One Thousand Voices gefunden. Keiner davon lag an fehlendem Wissen, alle am Zusammensetzen:

| Fehler | Ursache | Folge |
| --- | --- | --- |
| Ember of Ashes +9,4 % statt +17 % (Aegis) bzw. +19 % (Quantum) | Selbst abgeleiteter Abstand der Explosionen (66,7 ms, `unverified`). Die ersten Explosionen des nächsten Shots fallen dadurch in den Ignition-Cooldown. | Ember wirkt zu schwach |
| Katalysator ×1,26 statt ×1,37 (Aegis) | Eigene Regel für eine Lücke: Seeker über der Grenze von 5 machen gar keinen Schaden | Katalysator wirkt zu schwach |
| Seeker etwa 26 % zu stark | Schaden pro Shot von Quantum, Seeker-Werte vom Compendium. Das Compendium liegt bei Waffenschaden etwa 1,26-mal über Quantum (Explosion, Beam, Seeker, Witherhoard geprüft); nur die Ignition stimmt 1:1 überein. | gemischte Skalen |

ADR 0009 schützt Abilities schon mit einem Gate gegen Aegis. Für Waffen und ihre Effects fehlt ein solches Gate.

## Entscheidung

1. **Skalen-Regel:** Werte aus verschiedenen Quellen werden nur als Verhältnis kombiniert. Ein Teil aus einer anderen Quelle wird relativ zu einem Bezugswert derselben Quelle angegeben und auf den Bezugswert der Hauptquelle angewendet. Beispiel: Seeker-Aufprall = 84 / 281 einer Compendium-Explosion, angewendet auf die Explosion der Hauptquelle. Eine Übereinstimmung der Skala gilt nur für den geprüften Wert (z. B. Ignition), nicht für die ganze Quelle.
2. **Gate für Waffen-Effects:** Jeder Effect, der eine Waffe verändert, hat einen Test gegen einen gemessenen Faktor, wenn eine Quelle ihn misst (Aegis-Zeilen „mit / ohne“, Quantum-Zeilen). Toleranz ±3 % (enger als bei Abilities, weil Faktoren derselben Waffe verglichen werden und sich Skalenfehler wegkürzen; Aegis und Quantum stimmen bei Ember auf 2 % überein). Fällt ein Effect durch, gilt er als Fehler im Modell, nicht in der Quelle, bis das Gegenteil belegt ist.
3. **Abgeleitete Werte nur mit Gate:** Ein selbst abgeleiteter Wert (Status `unverified` mit „Derived“ in der Notiz) darf nur in die Rechnung, wenn ein Gate ihn abdeckt. Sonst bleibt er `missing`, und das Modell nutzt die einfachste Annahme, die das Gate besteht.
4. **Lückenregeln stehen in der Mechanic-Datei.** Ergänzen wir eine Regel, die keine Quelle nennt (z. B. was mit Seekern über der Grenze passiert), steht sie als Annahme unter „Modell im Simulator“ und hat ein Gate.
5. **Waffen kommen als Paket** (Ergänzung 2026-10-20): Schaden pro Shot, Shots und Timing aus Aegis und Quantum, Perks und Katalysatoren als Faktoren aus deren „mit / ohne“-Zeilen. Eine Waffe wird nur zerlegt, wenn ihr Intrinsic mit Build-Entscheidungen zusammenspielt (z. B. One Thousand Voices mit Scorch und Ember of Ashes); auch dann gilt das Gate gegen die Quellen.
6. **Ingame-Tests nur für allgemeine Mechanics**, die viele Waffen oder Abilities betreffen (z. B. Ignition-Cooldown, Particle Reconstruction, Radiant, Surges). Keine Tests pro Waffe. Ablauf: `docs/guides/measurements.md`.

## Folgen

- Zerlegen bleibt das Ziel. Das Gate sagt, wann eine Zerlegung gut genug ist.
- Neue Tests gegen Aegis für Ember of Ashes, Katalysator und beides. Sie schlagen zunächst fehl und zeigen, wann die Korrekturen stimmen.
- Data Files brauchen für fremde Teile einen Bezugswert (Verhältnis statt Absolutwert). Das Schema ändert sich dafür erst, wenn die erste Korrektur es braucht.
- Ingame-Tests sind eine weitere Messquelle für Gates, wenn keine Community-Quelle misst. Sie folgen dem Messprotokoll in `docs/data-sources.md` und tragen die Spielversion.
