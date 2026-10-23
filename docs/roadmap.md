# Roadmap

What the calculator learns next. The exact coverage is listed under [Coverage](coverage.md).

Status: 2026-10-23

## In progress (v1.1)

- ✅ 49 exotic Special and Heavy weapons from Aegis, Quantum, Clarity and the Bungie manifest, among them Truth, Thunderlord, Gjallarhorn, Sleeper Simulant and Whisper of the Worm; weapon picker with search, catalyst as a toggle with a note on limited duration
- ✅ 40 exotic primaries (e.g. Bad Juju, Ace of Spades, Thorn, Le Monarque): unlimited ammo, they fire with reloads through the whole damage phase; pulse bursts count bullet by bullet; weapon picker filters by ammo
- ✅ 131 of 141 exotic weapons, among them swords (The Lament, Black Talon, Ergo Sum: one hit per combo), Merciless, Outbreak Perfected, Witherhoard (a full blight per shot), Choir of One (5 ammo per projectile) and Touch of Malice (last round)
- ⏳ 10 exotic weapons still missing (e.g. Anarchy, Heartshadow, Wolfsbane, Praxic Blade, Turncoat): no source measures their timing
- ✅ Exotic armor: picker under “Armor” with search and slot filter. A note says what the exotic does in the calculator. Many work through the Rotation, e.g. Star-Eater Scales after the Super cast or Foetracer after an ability hit. Cuirass of the Falling Star and Celestial Nighthawk change their Super. Kill buffs only count with the “Pre-stacked” toggle, since one boss without adds gives no kills.
- ✅ Aspects and fragments from all subclasses, e.g. Spark of Shock (Jolt), Echo of Undermining (Weaken after a Void grenade), Ember of Torches (Radiant after a melee hit); states such as Amplified or Woven Mail for exotics like No Backup Plans
- ✅ Keywords: Ignition, Jolt, Volatile, Unravel and Bolt Charge as their own damage; abilities apply them with their hits
- ✅ Hover cards explain what an item does; keyword damage shows as “Effect” in the color of its element
- ✅ The whole website in English
- ⏳ Exotic class items with two perks (Prismatic) and Transcendence
- ⏳ Melee buffs add up with each other (own bucket)
- ⏳ Class ability in the Rotation; exotics that refill abilities or the magazine
- ✅ Supers take time like in the game: hits spread over shots and light attacks (e.g. Golden Gun ignites with its third shot), the weapon waits only as long as the Super really blocks it (Daybreak about 13 s instead of 24 s, Nova Bomb about 1.8 s instead of 0 s). Timings are rough estimates and marked as such.
- ✅ Aspects and fragments that change an ability, from Aegis measurements: Knock 'Em Down (Blade Barrage), Thread of Evolution (Needlestorm, Threadling), Spark of Magnitude (Pulse), Chaos Accelerant (Axion Bolt, Scatter, Vortex), Echo of Remnants (Vortex), Touch of Winter (Glacier, Shatter)
- ✅ Only aspects and fragments that change damage are offered. Items that only grant a state (e.g. Ascension, On Your Mark) appear when the exotic needs that state, such as No Backup Plans.
- ✅ Ignition in Solar Supers counts once: the Aegis value of Golden Gun and Daybreak already holds the ignitions of its shots, so they are taken out of the package and come back from the Scorch of each hit. Daybreak ignites during the super (x50 Scorch per projectile).
- ✅ Tidier picker: Radiant and Weaken in their own section “Buffs & Debuffs”, one tile per item (e.g. Facet of Dominance), game icons for every aspect and fragment
- ⏳ Stormtrance and Pocket Singularity: Jolt and Volatile count twice (+14 %, +22 %)
- ⏳ Facet of Courage and Touch of Thunder: Aegis only measured them together with other buffs
- ✅ Every weapon with a catalyst has the switch; its hover card says what it does here: damage (e.g. One Thousand Voices +45%), magazine and ammo (e.g. Gjallarhorn 1 → 2 rockets, Telesto 4 → 7), refills (Thunderlord, Cloudstrike), or no effect against one boss
- ✅ 47 catalysts are marked “no effect against one boss” (they need kills, several enemies, allies, pickups or shields); Touch of Malice ×1.25, Graviton Lance and Wish-Keeper ×1.2 (Vorpal Weapon)
- ⏳ About 50 catalysts are not in the calculator yet, e.g. Izanagi's Burden, Deterministic Chaos, reload speed stats

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

## Next

- Song of Flame, Glacial Quake, Bladefury and Hammer of Sol with Sol Invictus: Aegis only measured them with buffs in the value
- Ward of Dawn: Weapons of Light as an effect
- Healing, Coldsnap and Duskfield Grenade, Grapple, Combination Blow and Chain Lightning: no Aegis measurement
- Feast of Light and Banner of War as effects
- Well of Radiance: the caster's weapon damage counts as Super damage, the duration grows with the Super stat
- Missing timings: shot interval of Golden Gun and Moebius Quiver, travel time of Thundercrash
- 13 Aegis packages include Ember of Ashes (e.g. Fusion Grenade, Hammer Strike): without Ember in the build they are too high
- Expanding Abyss: raises Weaken to 25%, Tractor Cannon and Moebius to 35%, Deadfall to 40%

## Later (v1.x)

- Optimizer with abilities: also tries Super, Grenade and Melee. Until then it keeps the chosen abilities.
- Save builds in the browser
- More exotic weapons
- Discord bot
