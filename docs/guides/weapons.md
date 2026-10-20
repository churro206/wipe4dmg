# Guide: Waffen anlegen und aktualisieren

Für Agenten und Entwickler. Grundlage sind ADR 0011 (Punkte 5 und 6) und ADR 0012. Begriffe stehen im Glossary.

## Quellen und ihre Rollen

| Quelle | Was sie liefert | Rolle |
| --- | --- | --- |
| Quantum Damage-ics (Heavies-Reiter) | Schaden pro Shot, Magazin, Munition, „Theoretical Total Damage“, oft mit und ohne Keyword-Schaden | Hauptquelle für Grundwerte, Gate |
| Aegis Boss Damage (Reiter „Weapons“) | Gemessener Total Damage („Wipe“) und „visual Value“ in festen Szenarien, oft „mit / ohne“ Perk oder Katalysator | Gate, Faktoren für Perks und Katalysator |
| Destiny Data Compendium | Teile (Explosion, Ticks, Seeker) und Zeiten als Freitext | Nur als Verhältnis zur Hauptquelle (Source Scale, ADR 0011) |
| Bungie-Manifest | Name, Hash, Element, Waffentyp, Icon | Stammdaten, Icon (`npm run import:icons`) |

Keine Ingame-Tests pro Waffe (ADR 0011, Punkt 6).

## Ablauf für eine neue Waffe

1. **Tabelle zur Freigabe.** Vor der Datenarbeit dem Inhaber eine Tabelle zeigen: jeder Wert, seine Quelle, Status und Gate.
2. **Data File** `src/data/weapons/<id>.json` mit dem Schema `Weapon` anlegen:
   - `code` eindeutig und nie wiederverwenden (Build-Links). Ein Test prüft Ids und Codes.
   - `manifestHash`, `weaponType`, `element` und `ammo` aus dem Manifest.
   - `gameVersion`: Patch, auf den sich die Quelle bezieht.
   - Grundwerte (`damageInstances`, `fireRateRpm`, `magazine`, `totalShots`, `reloadTimeMs`, `chargeTimeMs`) aus **einer** Hauptquelle. Jeder Wert hat ein `source`-Objekt; Unbekanntes ist `null` mit Status `missing`.
3. **Paket oder Teile** (ADR 0011, Punkt 5):
   - Standard ist das Paket: ein Schaden pro Shot, wie die Quelle ihn misst.
   - Teile (`intrinsicParts`) nur, wenn das Intrinsic mit Build-Entscheidungen zusammenspielt (One Thousand Voices: Scorch und Ember of Ashes). Teile aus einer anderen Quelle tragen `sourceScale`.
4. **Katalysator und Perks** (ADR 0012, Punkt 4):
   - Katalysator: Teile oder Damage Instances mit `requiresCatalyst: true`.
   - Perks stehen in der Data File der Waffe. Ihr Wert ist ein Faktor aus den „mit / ohne“-Zeilen der Quelle. Das Schema dafür entsteht mit der ersten Waffe, die einen Perk braucht.
5. **Gate** (ADR 0012, Punkt 3), Toleranz ±3 %:
   - Mindestens ein Eintrag in `reference-values.json` mit `weaponId` und `scenario` (z. B. Total Damage ohne Effects).
   - Für jeden Katalysator und Perk mit „mit / ohne“-Zeilen ein Eintrag in `reference-factors.json`.
   - Fällt das Gate durch, gilt der Fehler im Modell, nicht in der Quelle (ADR 0011, Punkt 2). Die Waffe kommt erst in den Ordner, wenn ihr Gate besteht.
6. **Mechanic-Datei:** Neue Mechanics (z. B. Reign Havoc) in `docs/mechanics/` beschreiben, mit Abschnitt „Modell im Simulator“ und den Annahmen.
7. **Abschluss:**
   - `npm run import:icons` (braucht `BUNGIE_API_KEY`): Das Icon `weapon:<id>` kommt aus `manifestHash`. Ein Katalysator braucht einen Eintrag `catalyst:<id>` in `icon-refs.json`.
   - `npm run coverage`.
   - `npm test`, `npx tsc -b`, `npx eslint .`, `npx prettier --check src scripts tests`.
   - `docs/roadmap.md` und `docs/changelog.md` aktualisieren.

## Effects und Waffen

Ob ein Effect auf eine Waffe wirkt, ergibt sich aus seinen Parts (`effectAppliesToWeapon` in `src/engine/effectParts.ts`): Multiplier nach Element und Waffentyp, Timing nach Waffentyp, Zähler-Effects nur, wenn die Waffe den Zähler hat. Wirkt ein Effect nur auf bestimmte Waffen, gehört die Einschränkung in seine Parts (`weaponTypes`, `elements`), nicht in die Waffe.

## Noch an One Thousand Voices gebunden (für W1)

Die Engine ist frei von Annahmen über One Thousand Voices (Test mit einer erfundenen Waffe in `tests/support/testWeapon.ts`). In der Oberfläche fehlt noch:

- Waffenauswahl; die Komponenten importieren `weapon` direkt aus `src/ui/data.ts`.
- Katalysator-Kachel nur zeigen, wenn die Waffe einen Katalysator hat.
- Kennzahl „Ignitions“ (auch im Vergleich, `compareResults`) und Ignitions in der Zeitleiste nur bei Waffen mit Ignition.
- Namen und Farben im Donut kommen aus einer festen Liste (`DAMAGE_KINDS` in `src/ui/Charts.tsx`); neue Damage Instances brauchen Name und Farbe.
- Hinweistext „Ignitions und Taken Seeker sind enthalten“ in `App.tsx`.
- Effects ausblenden, die weder auf die Waffe noch auf eine gewählte Ability wirken (ADR 0012, Punkt 5).

## Nach einem Patch

1. Quantum und Aegis auf geänderte Werte der Waffe prüfen; `gameVersion` und `retrieved` anpassen.
2. `npm test`: Ein fehlschlagendes Gate zeigt, welche Waffe oder welcher Faktor sich geändert hat.
