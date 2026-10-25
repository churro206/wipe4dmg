# wipe4dmg

Damage calculator for Destiny 2 builds. It simulates a single boss damage phase on a timeline (weapons, abilities, supers, buffs and debuffs) and shows the Total Damage of a build. The goal is that the **differences between builds** are right; absolute numbers follow the scale of the Aegis spreadsheet.

Live: https://wipe4dmg.pages.dev

Game values come from community sources (Aegis Boss Damage, Quantum Damage-ics, Destiny Data Compendium, Clarity, Court's Stacking Guide, Bungie Manifest). Every value in `src/data` names its source.

## Start

```
npm ci
npm run dev
```

## Checks

```
npm run test:quiet   # all tests
npx tsc -b           # types, including scripts/
npm run lint
npm run sanity       # plausibility gate with a readable table
npm run probe        # whole-build check against Aegis
```

## Data import

Import scripts download the sources into `src/data`; build scripts derive the data files and review tables in `docs/` without downloading. The order after a game patch is in `.claude/skills/nach-patch/SKILL.md`. `import:icons` needs `BUNGIE_API_KEY` in `.env.local`.

## Layout

`src/data` data files and schema, `src/engine` simulator and optimizer (pure functions), `src/ui` React app, `scripts` importers, `tests` Vitest. Decisions are in `docs/adr`, the roadmap in `docs/roadmap.md`.
