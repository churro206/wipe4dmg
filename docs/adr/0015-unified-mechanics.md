# ADR 0015: Einheitliches Mechanik-Modell

Status: angenommen · Datum: 2026-10-21

## Kontext

Für Multiplier-Buffs trägt das Modell aus ADR 0006 gut (Buckets, Stacking, Filter nach Damage Source, Element, Waffentyp und Ability). Für die nächsten Mechaniken reicht es nicht. Der Inhaber will Keywords der Subklassen (Scorch/Ignition, Jolt, Bolt Charge, Volatile Rounds), die Effekte von Exotic-Rüstung, Auslöser wie „Magazin auffüllen bei Grenade-Einsatz“ und eigenen Schaden. Eine Bestandsaufnahme im Code zeigt:

| Problem | Heute | Folge |
| --- | --- | --- |
| Drei getrennte Mechanik-Systeme | `Effect.parts` (multiplier, timing, counterModifier), `Weapon.intrinsicParts` (counter, threshold, damageOverTime), `AbilityComponent` (fester Schaden) | Scorch/Ignition kann nur eine Waffe auslösen, kein Exotic, Aspect oder Fragment. |
| Keyword-Schaden in Ability-Paketen eingebacken | z. B. „1592 ignition“ als Component einer Grenade | Mit einer echten Ignition-Mechanik würde er doppelt zählen. |
| Ziel-Zustand nur pro Waffe | `thresholdDamageInstances` zählt nur Treffer der Waffe | Jolt und Volatile lösen durch Schaden **jeder** Quelle aus. Bolt Charge braucht Waffen- und Ability-Treffer. |
| Keine Auslöser | Effects sind Zeitfenster (ADR 0006, Stufe C fehlt) | Ereignisse wie „bei Cast“ oder „bei 10 Stapeln“ lassen sich nicht abbilden. |
| Damage Source zu grob | weapon, grenade, melee, super | Keyword-Schaden und Class Abilities fehlen, ebenso die Art des Treffers. |

Eine Recherche (Skill `recherche`, 2026-10-21) hat den Umbau gegen die Quellen geprüft:
1. **Exotic Class Items** haben zwei wählbare Spirit-Perks, 18 im Compendium-Reiter „Exotic Class“: „Exotic Class Items will only apply their perks while the Prismatic subclass is equipped!“
2. **Keyword-Schaden fällt in eigene Kategorien** (Compendium, Glossary der Subklassen):
   - Volatile „dealing up to 145 [80] Void Ability Damage“
   - Bolt Charge „Does not count as Ability Damage, only as Generic Arc Damage“
   - Ignition „can be increased through certain damage increases if the initial Scorch source had a damage increase“ und „Melee Damage Buffs do not scale Ignition nor Scorch“
3. **Art des Treffers:** Direct (Impact) gegenüber Indirect (Splash), z. B. bei Aktivitäts-Modifiern und Lucky Pants („Direct Impact damage“).
4. **Skala:** Die Ignition pro Treffer liegt in Aegis „Weapons“ bei 2345 ÷ 3,31 = 708, in Aegis „Abilties“ bei 1553 ÷ 2,30 = 675 und im Compendium bei 676. Waffen und Abilities haben also dieselbe Größenordnung, mit etwa 5 % Abweichung. Quantum führt bei One Thousand Voices eine „Special Ignition“ von 890, das ist eine andere Ignition.
5. **Werte der Keywords sind vorhanden:**
   - Mechanik im Compendium: Jolt bei 115 Schaden, 0,8 s Cooldown, 10 s. Volatile bei 190 Schaden, 1 s Cooldown, 10 s. Bolt Charge: (15 % des Magazins, abgerundet) + 1 Treffer pro Stapel, Entladung bei 10 Stapeln. Ignition bei 100 Scorch, 1,6 s Cooldown.
   - Schaden pro Auslösung in Aegis *miscellaneous*: Ignition 675,2, Jolt 99,1, Volatile 93,9, Bolt Charge 677,8.

## Entscheidung

1. **Ein Teil-Modell für alle Quellen.** Effects, Waffen, Abilities, Exotics und Exotic-Perks nutzen dieselben Teil-Typen: `multiplier`, `timing`, `counter`, `threshold`, `damageOverTime`, `appliesKeyword` und `damage` (fester Schaden pro Auslöser). Die `intrinsicParts` einer Waffe sind dauerhaft aktive Effects dieser Waffe. Das Format der Waffen-Dateien bleibt lesbar, der Loader wandelt es um.
2. **Ein Ereignis-Lauf über alle Damage Sources** (setzt ADR 0006, Punkt 5 um):
   - Ziel-Zustand: Debuffs, Keyword-Zähler, Cooldowns und aufgenommener Schaden (für Jolt und Volatile).
   - Spieler-Zustand: aktive Buffs, Stapel und Bolt Charge.
   - Jede Damage Instance läuft durch denselben Zustand, egal ob von Waffe, Ability oder Keyword.
3. **Auslöser** (`trigger`): `shot`, `weaponHit`, `abilityHit`, `cast` (pro Art, inklusive `classAbility`) und `threshold`. Für Buffs bleiben Zeitfenster der Standard, mit der Annahme „wird aufgefrischt“ (ADR 0014).
4. **Merkmale einer Damage Instance:**
   - `damageSource`: weapon, grenade, melee, super, classAbility, keyword
   - `keywordId` bei Keyword-Schaden
   - `element`
   - `delivery`: impact, splash, dot
   - `abilityId` und `weaponType`
   - Precision ist als optionales Feld vorgesehen und wird noch nicht genutzt.
5. **Keywords als Daten** (`keywords.json`): Jedes Keyword hat seine Mechanik mit Zitat, seinen Schaden mit Quelle und seine Damage-Kategorie. Volatile zählt als Void Ability Damage, Bolt Charge als generischer Arc-Schaden. Die Ignition erbt die Boni ihrer Scorch-Quelle ohne Melee-Buffs.
6. **Bedingungen über Zustand:** `effectActive` (z. B. Amplified, Radiant), `targetHas` (z. B. Volatile, Jolt), `weaponMatchesSuperElement` und `subclass` (z. B. Prismatic für Exotic Class Items).
7. **Skala:** Jeder Schadenswert trägt seine Skala (`aegisVisual`, `quantum`, `compendium`). Die Engine rechnet auf Aegis visual um. Die Brücke ist die Ignition mit ihrer belegten Abweichung. Es gilt weiter ADR 0011: Quellen nur als Verhältnis mischen, abgeleitete Werte nur mit Gate.
8. **Exotic Class Items** sind ein Exotic mit zwei Perk-Plätzen, links und rechts. Die Perks sind eigene Einträge mit eigener Einordnung (ADR 0014) und wirken nur mit Prismatic.
9. **Einordnung und Laufzeit getrennt:** `exotic-armor.json` bleibt die Prüfliste. Die erzeugten Effects stehen in `exotic-armor-effects.json`.
10. **Migration in kleinen Schritten.** Ein Snapshot-Test hält vorher die Total Damage aller Waffen-Pakete und Gate-Builds fest. Nach jedem Schritt bleiben alle Gates grün: One Thousand Voices, die Waffen-Pakete und die Aegis-Abilities mit ±10 %. Abweichungen sind nur dort erlaubt, wo der Schritt sie beabsichtigt, und werden begründet.

11. **Keine Handmodelle.** Am Ende des Umbaus kommen Waffen, Effects, Abilities und Gate-Referenzen aus Importen mit Regeln. Von Hand bleiben nur Regeln (`buckets.json`) und Overrides mit Zitat. Ingame-Messungen gelten nur für allgemeine Mechaniken (ADR 0011).
    - U4: One Thousand Voices und Two-Tailed Fox werden Pakete aus dem Import, Scorch kommt als Keyword dazu. `weapons/one-thousand-voices.json` und `sourceScale` entfallen. Die Gate-Referenzen entstehen aus Aegis-Zeilen mit Annahmen, z. B. „mit Ember“ ÷ „ohne“. Dabei ist ein Widerspruch zu klären: Ignition-Cooldown laut Ingame-Test 1,3 s, laut Compendium 1,6 s.
    - U6: `effects.json` wird aus dem Court-Snapshot und dem Compendium erzeugt, mit der Regelkette wie bei den Exotics.
    - U9 (nach U5): `build:abilities` erzeugt `abilities.json` aus dem Aegis-Snapshot und dem Manifest.

## Regeln aus der Umsetzung (U4a)

- Ein Keyword zählt den Schaden aller Treffer, nur nicht den seiner eigenen Treffer. So kann Jolt sich nicht selbst auslösen.
- Volatile und andere Keywords, die beim Auslösen entfernt werden: Während des Cooldowns lassen sie sich nicht neu setzen (Compendium: „1 second cooldown before Volatile can be reapplied“).
- Global Debuffs (Court) wirken auf jeden Schaden. Ihre Teile nennen deshalb auch `classAbility` und `keyword`. Auf Keyword-Schaden wirken Teile für `keyword`. Bei einem Ability-Keyword (Volatile, „Void Ability Damage“) wirken zusätzlich Teile, die für Grenade, Melee und Super zugleich gelten.
- Annahmen bei Unravel, beide als `unverified` markiert: Der setzende Treffer zählt mit, wie bei Jolt, denn das Compendium sagt dazu nichts. Aegis misst nur ein Projektil („single projectile“, 39,1). Wie viele der drei Fäden einen einzelnen Boss treffen, ist offen; gezählt wird eines.

## Bewusst später

- Mehrere Waffen und Swaps: Bolt Charge setzt beim Swap zurück, Rotationen aus Heavy und Special.
- Precision und Weakspot als Merkmal eines Treffers.
- Energie und Cooldowns.
- Unravel/Threadlings, Freeze/Shatter, Suspend.
- Eigener Schaden ohne Keyword, z. B. The Bombardiers.
- Heat-Waffen (Vent statt Magazin). Geprüft in U1: Keines der 49 Waffen-Pakete ist eine Heat-Waffe. Nur 13 allgemeine Aegis-Zeilen (z. B. „Balanced heat weapon - 450RPM primary“) kommen vor, und sie werden nicht als Paket gebaut. Ein Timing-Modell für Heat-Waffen ist erst nötig, wenn eine Heat-Waffe dazukommt.

## Folgen

- `simulate.ts` wird ein Ereignis-Lauf. Ergebnisse dürfen sich nur an begründeten Stellen ändern, das sichert der Snapshot-Test.
- Neue Mechaniken lassen sich meist als Daten nachpflegen: ein Teil-Typ, ein Auslöser, ein Keyword-Eintrag.
- Ability-Pakete mit eingebackenen Keywords bekommen eine Normierung, damit nichts doppelt zählt, wie schon `normalisedEffectIds` (ADR 0009, Punkt 5).
