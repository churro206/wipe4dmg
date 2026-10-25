# Guide: Waffen anlegen und aktualisieren

Für Agenten und Entwickler. Grundlage: ADR 0013 (Import), ADR 0012 (mehrere Waffen), ADR 0011 (Zerlegung nur mit Gate), ADR 0015 Punkt 11 (keine Handmodelle mehr). Begriffe im Glossary.

## Der Weg

Jede Waffe kommt aus dem Import. Fehlt einer Waffe etwas, wird eine Regel im Import ergänzt oder ein Override angelegt, nie eine Data File von Hand.

1. `npm run import:weapons`: Snapshots von Aegis (Weapons, Sustained), Quantum (Primaries, Specials, Heavies) und Clarity nach `src/data`.
2. `npm run import:icons` (braucht `BUNGIE_API_KEY`): Manifest-Daten der Waffen, Rüstung und Begriffe; danach Icons.
3. `npm run build:weapons`: Pakete nach `src/data/weapon-packages.json`, Lücken mit Grund nach `weapon-gaps.json`, Link-Codes in `weapon-codes.json` (nie neu vergeben), Prüftabelle `docs/weapon-import.md`.

Reihenfolge nach einem Patch: Skill `nach-patch`.

## Quellen und ihre Rollen

| Quelle | Rolle |
| --- | --- |
| Aegis (Weapons, Sustained) | Wert pro Shot (visual Value), Annahmen der Zeile, zweite Timing-Quelle; bei Konflikt vor Quantum |
| Quantum Damage-ics | Timing (rpm, Magazin, Reserves, Reload, Time to Empty). Achtung: Reload und Magazin mit Rally/Lunafaction und Extended + Backup Mag (Plan K1) |
| Clarity, Compendium | Texte von Intrinsic, Perks und Catalyst; Zitate für Overrides |
| Bungie-Manifest | Name, Hash, Element, Waffentyp, Munition, Sockets, Catalyst-Item |

Keine Ingame-Tests pro Waffe (ADR 0011, Punkt 6).

## Wenn eine Waffe fehlt oder falsch ist

- **Annahme ohne Art:** Jede Annahme einer Aegis-Zeile braucht eine Art (Perk, Catalyst, Effect, Spielweise …). Eine neue Art ist eine Regel im Import mit Test.
- **Override** (`src/data/weapon-overrides.json`): nur, wenn keine Regel hilft. Mit Begründung und wörtlichem Zitat aus einem Snapshot; ein Test prüft das Zitat.
- **Lücke:** Fällt das Gate durch oder fehlt eine brauchbare Zeile, steht die Waffe mit Grund in `weapon-gaps.json` und auf der Coverage-Seite.
- **Gate:** Paket, Timing und Optionen gegen die Quelle mit ±3 % (Toleranzen: `docs/mechanics/README.md`); gemessene „mit / ohne“-Faktoren von Perks und Catalysts in `reference-factors.json`. Freigabe pro Waffe entfällt, die Prüftabelle ersetzt sie (ADR 0013, Punkt 11).
- **Neue Mechanik** (z. B. Reign Havoc): in `docs/mechanics/` mit Abschnitt „Modell im Simulator“ beschreiben.
- **Keywords:** Waffen mit Scorch (One Thousand Voices, Two-Tailed Fox) nehmen den Shot ohne Ignitions und setzen Scorch per `appliesKeyword`; Ignitions entstehen im Keyword-Lauf. Das frühere Handmodell von One Thousand Voices liegt nur noch als Testdatei in `tests/fixtures/`.

## Effects und Waffen

Ob ein Effect auf eine Waffe wirkt, ergibt sich aus seinen Parts (`effectAppliesToWeapon` in `src/engine/effectParts.ts`): Multiplier nach Element und Waffentyp, Timing nach Waffentyp, Zähler-Effects nur, wenn die Waffe den Zähler hat. Wirkt ein Effect nur auf bestimmte Waffen, gehört die Einschränkung in seine Parts (`weaponTypes`, `elements`), nicht in die Waffe.

## Oberfläche

- `src/ui/data.ts` lädt die Pakete; `WeaponPicker` mit Suche und Filter nach Waffentyp und Munition. Ein Vergleich behält seine eigene Waffe.
- `src/engine/weaponInfo.ts`: Catalyst-Kachel nur bei `hasCatalyst`, Kennzahl „Ignitions“ nur bei `hasIgnition`, Effects nur bei `effectRelevantTo`.
- Pakete haben eine Damage Instance „shot“ („Shots“ im Donut); neue Arten brauchen Name und Farbe in `DAMAGE_KINDS` (`src/ui/Charts.tsx`).
- Nach `build:weapons` noch einmal `npm run import:icons`, damit neue Pakete Waffen- und Catalyst-Icon bekommen.

## Abschluss

`npm run coverage`, `npm run test:quiet`, `npx tsc -b`, `npm run lint`; `docs/roadmap.md` und `docs/changelog.md` aktualisieren.
