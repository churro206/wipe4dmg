# Messprotokolle für Ingame-Tests

Stand: 2026-10-20 · Spielversion beim Schreiben: 9.7.0.5

Diese Tests prüfen Annahmen, die heute nur durch ein Gate abgesichert sind (ADR 0011). Wir messen nur **Verhältnisse** („mit / ohne“, Anzahl, Abstand), keine absoluten Werte. Deshalb reicht der Schießstand.

## Allgemeine Bedingungen

- **Ort:** Schießstand, statisches Ziel „Carl“. Seit 9.7.0 skaliert er Schaden wie ein Boss.
- **Gleich halten:** Distanz, Zielpunkt, Weapons Stat, Rüstung. Nur das ändern, was der Test vergleicht.
- **Aus:** alle anderen Buffs und Debuffs. Keine Surges, kein Radiant (außer in Test 5), keine zweite Scorch-Quelle.
- **Schadenszahlen** im Spiel einschalten.
- **Aufnahme mit 60 fps,** z. B. mit OBS oder NVIDIA ShadowPlay. Zum Auswerten frameweise vorspulen, z. B. in VLC mit der Taste `E`.
- **Notieren:** Datum, Spielversion (steht beim Start des Spiels), Weapons Stat, Artefakt-Perks, Aspects und Fragments.
- **Ergebnis** kommt in die Tabelle „Messprotokoll“ in `docs/data-sources.md`. Claude übernimmt es danach in Data Files und Gates, mit Status `measured`.

Jeder Test dauert etwa 5 bis 10 Minuten. Test 1 ist der wichtigste.

---

## Test 1: Ignitions pro Magazin mit und ohne Ember of Ashes

**Frage:** Zündet mit Ember of Ashes jeder Shot? Daran hängt unsere Annahme, dass die 9 Explosionen gleichzeitig kommen (`scorch-and-ignition.md`).

**Aufbau:** One Thousand Voices, Solar-Subklasse, Artefakt-Perk **Particle Reconstruction an** (so misst auch Aegis).

**Ablauf:**
1. Ohne Ember of Ashes: Carl zurücksetzen, die ersten 4 Shots so schnell wie möglich abgeben. Aufnehmen.
2. Mit Ember of Ashes: dasselbe.
3. Jeden Lauf zweimal machen.

**Auswerten:**
- Ignitions zählen: große orange Zahl, deutlich größer als die Explosionen (bei der Stichprobe vom 18.10. waren das Explosion 129 und Burn 16).
- Total Damage, das Carl für die 4 Shots anzeigt, notieren.

**Erwartung:**

| | ohne Ember | mit Ember | Verhältnis Total Damage |
| --- | --- | --- | --- |
| Aegis und unser Modell heute | 2 von 4 (Shot 2 und 4) | **4 von 4** | etwa ×1,17 |
| Modell vor dem 20.10. (gestaffelte Explosionen) | 2 von 4 | 3 von 4 | etwa ×1,06 |

---

## Test 2: Kommen die 9 Explosionen gleichzeitig?

**Frage:** Wie Test 1, nur direkt gemessen.

**Aufbau:** wie Test 1, ohne Ember of Ashes.

**Ablauf:** Einen einzelnen Shot auf Carl abgeben und aufnehmen.

**Auswerten:** In der Aufnahme den Frame suchen, in dem die **erste** Explosionszahl erscheint, und den Frame der **letzten**. Abstand in Frames notieren.

**Erwartung:**

| Abstand | Bedeutung |
| --- | --- |
| 0 bis 2 Frames | gleichzeitig: unsere Annahme stimmt |
| etwa 30 Frames (0,5 s) | gestaffelt im Takt der Beam-Ticks: Dann muss der Ignition-Cooldown kürzer als 1,6 s sein, sonst passt Test 1 nicht |

Zusatz, falls einfach möglich: Abstand vom Beginn des Beams bis zur ersten Explosion in Frames (Compendium: 0,7 s = 42 Frames).

---

## Test 3: Abstand zwischen zwei Shots

**Frage:** Liegen zwischen zwei Shots 1,733 s (Aegis) oder 1,818 s (Quantum)? Ändert Particle Reconstruction das?

**Ablauf:**
1. Mit Particle Reconstruction: Abzug gedrückt halten, 5 Shots hintereinander. Aufnehmen.
2. Ohne Particle Reconstruction: dasselbe, nur die ersten 4 Shots (vor dem Reload).

**Auswerten:** Frame notieren, in dem jeder Beam beginnt. Abstand zwischen erstem und letztem Beam-Start durch die Anzahl der Abstände teilen.

**Erwartung:**

| Frames pro Shot | Sekunden | Quelle |
| --- | --- | --- |
| 104 | 1,733 | Aegis |
| 109 | 1,818 | Quantum (gerundete 33 RPM) |

Gleiche Werte mit und ohne Perk heißen: Der Perk ändert die Feuerrate nicht.

---

## Test 4: Wirkt Particle Reconstruction auf Ignitions?

**Frage:** Verstärkt der Debuff von Particle Reconstruction auch Ignitions? Unser Modell sagt ja, keine Quelle bestätigt es.

**Aufbau:** One Thousand Voices, **ohne Ember of Ashes** (dann zündet Shot 2).

**Ablauf:**
1. Mit Particle Reconstruction: 2 Shots. Aufnehmen.
2. Ohne Particle Reconstruction: 2 Shots. Aufnehmen.
3. Beides zweimal.

**Auswerten:**
- Ignition-Zahl in beiden Läufen notieren.
- Prüfwert, ob der Debuff aktiv war: Explosionszahl des zweiten Shots notieren.

**Erwartung:**

| Verhältnis Ignition mit ÷ ohne Perk | Bedeutung |
| --- | --- |
| etwa 1,28 | Der Debuff wirkt auf Ignitions; unser Modell stimmt |
| etwa 1,00 | Er wirkt nicht; Korrektur nötig |

Zum Vergleich sollte das Verhältnis der Explosionszahlen ebenfalls etwa 1,28 sein.

**Nebenbei:** Explosionszahl des ersten Shots gegen die des zweiten Shots (mit Perk). Sind sie gleich, ist der Debuff schon im ersten Shot voll. Das passt zu „ein Stack pro Treffer“.

---

## Test 5 (nur mit Hunter und Golden Gun): Radiant auf Golden Gun

**Frage:** Bringt Radiant +20 % auf Golden Gun? So rechnet der Rechner seit dem 20.10.

**Aufbau:** Hunter Solar, Golden Gun Marksman oder Deadshot. Eine Radiant-Quelle, z. B. das Fragment Ember of Torches (Powered Melee macht Radiant).

**Ablauf:**
1. Ohne Radiant: Golden Gun, ein Treffer auf den Körper (nicht Precision).
2. Mit Radiant: Radiant auslösen, sofort Golden Gun, ein Treffer auf den Körper.
3. Optional mit einem Warlock in der Gruppe: in einem Well of Radiance schießen.

**Erwartung:**

| Verhältnis | Bedeutung |
| --- | --- |
| Radiant ÷ ohne: etwa 1,20 | stimmt |
| Well ÷ ohne: etwa 1,20 (nicht 1,25) | Well zählt bei Golden Gun als Radiant (Bungie 9.5.0) |

---

## Nicht möglich ohne Katalysator

Die Annahmen zu Taken Seeker (Aufprall über der Grenze von 5, Flugzeit, Blight) bleiben nur durch das Gate abgesichert, bis jemand den Katalysator hat. Testplan dafür: `docs/mechanics/taken-seeker.md`.
