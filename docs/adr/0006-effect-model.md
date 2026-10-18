# ADR 0006: Effect-Modell der Engine

Status: angenommen · Datum: 2026-10-18

## Kontext

Phase 2 der Wissenssammlung (`docs/mechanics/`) hat gezeigt: Effects sind mehr als Multiplier.

- Particle Reconstruction ist ein Debuff und ändert zugleich den Ablauf (keine Reloads).
- Scorch braucht Stacks am Ziel, eine Schwelle und einen Cooldown.
- Bolt Charge braucht einen Zähler am Spieler.
- Fähigkeiten und Supers sind eigene Damage Sources mit eigenen Buffs (US-14).
- Bei Debuffs gilt nicht immer „der höchste gewinnt“. Divinity überschreibt Particle Reconstruction, obwohl Particle Reconstruction höher ist.

Das heutige Effect-Schema kennt nur einen Multiplier mit Bucket und Dauer. Die App rechnet nur gegen Bosse und nur PvE.

## Entscheidung

1. **Ein Effect besteht aus einem oder mehreren Teilen.** Jeder Teil hat einen Typ:
   - `multiplier`: Bucket, Faktor, gilt für bestimmte Damage Sources, Waffentypen oder Elemente
   - `timing`: ändert den Schussplan, z. B. „keine Reloads“
   - `counter`: fügt einem Zähler am Ziel oder am Spieler Stacks hinzu, z. B. Scorch oder Bolt Charge
   - `threshold`: Bei einem Zählerstand entsteht eine Damage Instance, danach Reset und Cooldown, z. B. die Ignition
2. **Jede Damage Instance kennt ihre Damage Source** (Waffe, Granate, Nahkampf, Super) und ihr Element. Multiplier-Teile filtern danach.
3. **Buckets folgen Courts Kategorien:** `empowering`, `debuff`, `surge`, `amplification`, `weaponPerk`, `exoticIntrinsic`. Der Bucket `artifact` entfällt.
4. **Vorrangregeln** zwischen einzelnen Effects ergänzen die Stacking-Regel des Buckets, z. B. `overrides: ["particle-reconstruction"]` mit einem festen Ergebniswert.
5. **Der Simulator arbeitet ereignisgesteuert** auf der Zeitachse (ADR 0001). Er führt Zustand für das Ziel (Zähler, Cooldowns, aktive Debuffs) und den Spieler (Zähler, aktive Buffs). Ereignisse werden nach Zeit abgearbeitet. Ein Ereignis kann neue Ereignisse erzeugen, z. B. eine Explosion eine Ignition.
6. **Jeder Teil hat ein `source`-Objekt** (ADR 0002).
7. **Schrittweise Einführung:** v0.5 braucht nur `multiplier` und `timing`. `counter` und `threshold` kommen mit der Ignition. Damage Sources für Fähigkeiten kommen mit US-14.

## Folgen

- Das Schema wird umfangreicher. Jeder Teil-Typ bekommt eigene Tests aus den Regeln in `docs/mechanics/`.
- Neue Mechanics lassen sich meist ohne neue Engine-Logik abbilden, nur mit Data Files.
- Mechanics, die in keinen Teil-Typ passen, brauchen eine Erweiterung dieses ADR.
- Die ereignisgesteuerte Simulation ist langsamer als eine Formel. Für den Optimizer mit einigen tausend Builds bleibt das unkritisch (ADR 0001).
