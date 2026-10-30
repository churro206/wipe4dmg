# Roadmap

What the calculator learns next. The exact coverage is listed under [Coverage](coverage.md).

Status: 2026-10-25

## Done in v1.1

**Weapons**

- ✅ 136 of 141 exotic weapons from Aegis, Quantum, Clarity and the Bungie manifest: Special and Heavy weapons (e.g. Truth, Thunderlord, Gjallarhorn, Sleeper Simulant), 40 primaries with unlimited ammo, swords (one hit per combo), Merciless, Outbreak Perfected, Witherhoard, Choir of One, Turncoat, Fafnir, Anarchy, Heartshadow. Weapon picker with search and filter by ammo
- ✅ Catalysts as a switch; the hover card says what one does here: damage (e.g. One Thousand Voices +45 %), magazine and ammo (Gjallarhorn 1 → 2 rockets), refills, faster reload (scaled with d2foundry's reload formula), or no effect against one boss (47 catalysts need kills, several enemies, allies, pickups or shields)

**Armor and class items**

- ✅ Exotic armor with search and slot filter; a note says what the exotic does here. Kill buffs only count with “Pre-stacked”, since one boss without adds gives no kills. Cuirass of the Falling Star and Celestial Nighthawk change their Super
- ✅ Exotic Class Item (Prismatic): two Spirit perks, one per column like in the game

**Subclass**

- ✅ Aspects and fragments of all subclasses, with states such as Amplified or Woven Mail; only items that change damage are offered, game icons for each
- ✅ Keywords as their own damage: Ignition, Jolt, Volatile, Unravel and Bolt Charge; abilities apply them with their hits, and Supers that already hold them do not count them twice
- ✅ Melee buffs add up with each other (own bucket); Facet of Courage's +10 % and Roaring Flames' grenade and Super bonus share a second bucket that is an assumption
- ✅ Transcendence (Prismatic): +5 % weapon damage for 20 s and the Prismatic grenade
- ✅ Aspects with damage of their own at the rate Aegis measures: Storm's Keep, Hellion, Weaver's Call, Arc Soul, Ionic Sentry

**Abilities and Supers**

- ✅ Ability energy: every ability starts charged and comes back after its cooldown, faster with the stat; extra charges, faster regeneration and refunds from exotics and aspects (23 effects)
- ✅ Class abilities in the rotation (Marksman's Dodge reload, Rally Barricade, Empowering Rift, Gambler's Dodge and more), buffs triggered by their cast
- ✅ Every cast takes time (Weighted Knife 1.55 s, others a 1 s estimate); the weapon does not fire meanwhile
- ✅ Supers take time like in the game (rough estimates); hits spread over shots and light attacks
- ✅ 21 of 75 abilities built from their Compendium parts and checked against Aegis (±15 %), the rest keep the measured total

**Buffs, artifact, checks**

- ✅ All buffs, debuffs and artifact perks from Court as switches; seasonal artifacts like in the game (seven artifacts, slots two, three and two)
- ✅ Abilities grant their buffs and debuffs (Radiant, Weaken) at every cast or hit
- ✅ Overall check against Aegis: 14 builds within −3 % to +6 % of Aegis' totals; ranking gate against Aegis' Sustained and Swap sheets
- ✅ Coverage of the Aegis sheets: every row is in the model, skipped with a reason or listed as missing
- ✅ Text check: every value, duration and target set next to its description in Clarity, the Compendium and Court
- ✅ Donut with an outer ring per multiplier and catalyst; hover cards explain each item; coverage page by category; the whole website in English
- ✅ Every spreadsheet on destiny2.science read and stored as data for the calculator's sources (95 tabs)

## Done in v1.0: abilities and Supers

- ✅ Ability damage on the timeline, stat 0 to 200, Super Window (the weapon pauses during the Super), no double-counted buffs
- ✅ Automatic cross-check against Aegis and the Compendium after every patch
- ✅ Supers: 25 of 31 with damage (total value measured by Aegis), Well of Radiance as a buff
- ✅ Grenades: 26 of 30, Melees: 24 of 26 (total value measured by Aegis)
- ✅ Icons and class and subclass assignment from the Bungie manifest, including Prismatic
- ✅ Donut “Damage by source”, breakdown table with one column per source, timeline with abilities and hatched Super Window, cast times adjustable
- ✅ Surges 1x to 3x like the armor mods, matching the weapon element
- ✅ Layout like in game: weapon, class, subclass, abilities, aspects, fragments, armor, stats, artifact, Fireteam Support
- ✅ Wiki: “How does the calculator work?”, coverage and roadmap

## Done in 2026-10-26

- ✅ Weapon reloads: both sources already reload with Rally Barricade, so Rally no longer counts twice
- ✅ Ability energy: Solar grenade cooldowns, Warlocks regenerate grenades 10 % faster, chunk energy of Seismic Strike, Hammer Strike and Shield Bash
- ✅ Facet of Courage: +50 % only on Light melees, instead of the +10 %
- ✅ Super lengths measured (Flat Gain) for 22 Supers, e.g. Nova Warp 25 s, Daybreak 9.55 s
- ✅ Coverage: fragments that can never hit a boss, energy exotics, Bequest as a legendary sword
- ✅ New Supers: Song of Flame, Glacial Quake, Bladefury
- ✅ Stormdancer's Brace, Mataiodoxía and Young Ahamkara's Spine as measured by Aegis
- ✅ Ability energy: stat curves instead of a straight line (grenades regenerate 3.1× at stat 100, chunk gains 1.15× instead of 3.1×), regeneration effects grow with the stat, innate charges (Frenzied Blade, Arcane Needle, Lightweight Knife)

- ✅ Timeline shows the cast time of grenades, melees and class abilities as a hatched window, like the Super Window
- ✅ Donut, curves and bars animate on every change; counters for Ignition, Jolt, Volatile, Unravel and Bolt Charge next to the key figures
- ✅ Bows: Leviathan's Breath fires at the right pace (1.93 s, 1.33 s with Archer's Tempo); Hierarchy of Needs builds its Guidance Ring first (switch "Pre-stacked"), its seekers set off Ignitions

## Next

- Damage model from general systems (ADR 0017, stages S0–S6 on branch `ground-up-model`): formula, status system (Scorch with burn, Volatile, Jolt, Slow), effect rules, weapon state and play policy; Aegis rows as scenarios on a test bench with one score. Paper probe: 9 of 13 weapons within ±3 %. S0 test bench done (today's core: 16 of 30 scenarios after two import fixes, ratios 5 of 14). Next: S1 core
- Coverage triage: sort every missing item into left out (no effect against a boss), a value from the text (under 2 %) or its own block

- Hammer of Sol with Sol Invictus
- Energy exotics (e.g. Crown of Tempests, Contraverse Hold)
- Stasis and Strand on the boss: Freeze, Shatter, Threadlings, Unravel, Sever and Suspend with measured damage; then the Verglas Curve catalyst (faster draw after Slow)
- More aspects (Tempest Strike, Consecration, Crackshot, Shieldburst), artifact perks (Flashover, Heavy Ordnance Regeneration, Hail The Storm, Solar Fulmination) and catalysts (Tessellation, Divinity, Quicksilver Storm)
- Worldline Zero, Wolfsbane, Praxic Blade and Barrow-Dyad
- Armor set bonuses (e.g. TM Custom, Sage Protector, Legacy's Oath)
- Banner of War's melee and Bladefury bonus; Ward of Dawn as a Super; Well of Radiance: the caster's weapon damage counts as Super damage, the duration grows with the Super stat
- Exotics that refill the magazine; 26 catalysts still without a model (e.g. Bastion, Final Warning, Vexcalibur, reload only through a perk)
- Healing, Coldsnap and Duskfield Grenade, Grapple, Combination Blow and Chain Lightning: no measurement yet
- 13 Aegis packages include Ember of Ashes (e.g. Fusion Grenade, Hammer Strike): without Ember in the build they are too high

## Goal for v2.0

- Ranking check: our ranking of weapons, Supers and abilities matches Aegis' Sustained and Swap sheets
- Optimizer with abilities: also tries Super, Grenade, Melee, aspects and fragments. Until then it keeps the chosen abilities.
- Legendary weapons (rocket launchers, linear fusions and more) with their perks
- Every category complete: no exotic, Super or ability left out

## Later

- Save builds in the browser
- Discord bot
