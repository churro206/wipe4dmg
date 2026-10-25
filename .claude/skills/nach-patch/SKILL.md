---
name: nach-patch
description: Reihenfolge der Import- und Build-Befehle in wipe4dmg nach einem Destiny-2-Patch oder einem neuen Stand von Aegis, Court, Compendium oder Clarity. Benutzen, bevor Snapshots neu geladen oder Data Files neu gebaut werden; auch mit /nach-patch.
---

# Nach einem Patch

Import-Befehle laden herunter, Build-Befehle schreiben Data Files und Prüftabellen ohne Download. `import:icons` braucht `BUNGIE_API_KEY` in `.env.local` (nie committen).

## Reihenfolge

1. Waffen: `import:weapons`, `import:compendium`, `import:icons`, `build:weapons`, noch einmal `import:icons` (Icons neuer Pakete).
2. Rüstung: `import:court`, `import:compendium`, `import:icons`, dann `build:armor`.
3. Nach `import:compendium`: `build:energy`, `build:grants`, `build:artifacts` (danach `import:icons` für neue Artifacts).
4. Nach `import:court`: `build:buffs`, `build:grants`.
5. Übrige: `build:keywords`, `build:abilities` nach Bedarf; `import:bosses`, `import:reload` bei neuem Stand der Quelle.
6. Zum Schluss: `import:totals`, `npm run probe` (Gesamtprobe gegen Aegis), `build:uptime`, `check:text`, `npm run coverage`.

## Hinweise

- `tests/uiIcons.test.ts` ist rot, wenn die UI für etwas kein Icon hat. Varianten erben das Icon ihrer Ability, Einzelfälle ohne Manifest-Item kommen von Hand in `icon-refs.json`.
- `import:icons` muss manchmal zweimal laufen, weil der erste Lauf `icons.json` nicht neu schreibt.
- Danach prüfen mit dem Skill `pruefen`. Geänderte Zahlen in `docs/meta-probe*.md` nennen und begründen.
