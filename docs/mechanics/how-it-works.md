# How does the calculator work?

Kategorie: Einstieg · Spielversion: 9.7.0.5 · Zuletzt geprüft: 2026-10-25 · Vertrauen: hoch

Einstiegsseite des Wikis (US-15, ADR 0010). Die Website zeigt nur den Abschnitt „For players“, deshalb ist er englisch.

## For players

### What the calculator computes

The calculator computes the **Total Damage** of a build in a **Damage Phase**, the time in which the boss is vulnerable. A build consists of weapon, class, subclass, Super, Grenade, Melee, aspects, fragments, exotic armor and effects such as Radiant, Surges or Weaken.

What matters are the **differences between builds**: if build A deals 15% more than build B, that should be right. The absolute numbers can differ from the game, for example because bosses take different amounts of damage.

### The timeline

The calculator plays the Damage Phase like a recording. Every hit is a **Damage Instance** with its own point in time:

- **Shots** follow the firing pattern of the weapon. One Thousand Voices, for example, fires every 1.733 s, and each beam causes 9 explosions.
- **Scorch** builds up on the boss. At 100 stacks an **Ignition** follows, a big Solar explosion. After that the boss needs a moment before it takes Scorch again.
- **Taken Seeker** from the One Thousand Voices catalyst fly to the boss and deal damage over time.
- **Abilities** hit at their cast times from the Rotation. **The weapon does not fire during a Super.**

Every effect has a window. Tractor Cannon, for example, lasts 10 s. A shot only gets the buffs that are active at its moment, so the order matters. The “Rotation” tab shows the timeline.

### How buffs stack

Buffs belong to **buckets**. The rule:

- **Within the same bucket** usually only the strongest buff counts. Radiant (+20%) and Well of Radiance (+25%) together give +25%, not +45%.
- **Different buckets** are **multiplied** with each other.

Example with Well of Radiance (Empowering Buff, ×1.25), Weaken (Debuff, ×1.15) and Surge 3x (Surge, ×1.22):

| Calculation | Result |
| --- | --- |
| right: 1.25 × 1.15 × 1.22 | **×1.75** |
| wrong: +25% + 15% + 22% added | ×1.62 |

The “Breakdown” tab shows how much each bucket contributes to the Total Damage.

### Where the numbers come from

The calculator does not make up numbers. Every value has a source:

| Source | What we take from it |
| --- | --- |
| Aegis | measured damage per shot of weapons and of Supers, Grenades and Melees; weapon firing pattern (“Sustained”); “with / without” factors for perks and catalysts |
| Quantum Damage-ics | weapon firing pattern (magazine, ammo, reload, time to empty), cross-check of the damage |
| Destiny Data Compendium | single parts such as explosions, Ignitions and Taken Seeker; what aspects, fragments and exotic armor do |
| [Clarity](https://www.d2clarity.com) | what perks, catalysts and exotic armor do exactly, with numbers. Feedback on these texts is welcome at Clarity via their [Discord](https://url.d2clarity.com/discord). We do not copy the texts but derive rules from them (e.g. “the catalyst changes the timing”) |
| Bungie manifest | names, types, elements, perks and icons |
| Court (Stacking Guide) | which buff belongs in which bucket |
| own tests in game | general mechanics, e.g. how soon another Ignition is possible |

**Gates** are automatic tests that compare our model with the measurements. An ability built from its parts may differ from Aegis by at most 15%, a weapon effect by at most 3%. If a value fails, we look for the error in the model.

The calculator models many abilities as a **package**: a total value per cast measured by Aegis instead of single hits. That is more accurate as long as the single parts are not known for sure.

### Limits

- **Ability energy is a first model.** Every ability starts charged and comes back after its cooldown; a cast that comes too early moves later. The curve of the ability stats is still a straight-line estimate, and some energy exotics and mods are missing.
- **Burn damage** from Scorch is still missing. Ignitions are included.
- **The optimizer** only tries subclasses and effects. It takes Super, Grenade and Melee from your selection.
- **Some abilities and exotics are missing**, and some packages are slightly too high without Ember of Ashes. What exactly is missing is listed under [Coverage](../coverage.md). What comes next is in the [Roadmap](../roadmap.md).

## Für Entwickler

- Simulator mit Damage Instances: ADR 0001. Buckets und Stacking: `src/data/buckets.json`, [Damage Stacking](damage-stacking.md).
- Abilities als Ability Components oder Pakete, Gate gegen Aegis: ADR 0009.
- Zerlegung, Skalen-Regel und Gate für Waffen-Effects: ADR 0011.
- Zahlen in diesem Text sind Beispiele für Spieler. Der Simulator rechnet nur mit den Werten aus `src/data`. Ändert sich ein Wert dort, diesen Text prüfen (Shot-Abstand, Beispiel-Buffs, Toleranzen der Gates).
