# Roadmap

What the calculator learns next. The exact coverage is listed under [Coverage](coverage.md).

Status: 2026-10-23

## In progress (v1.1)

- ✅ 49 exotic Special and Heavy weapons from Aegis, Quantum, Clarity and the Bungie manifest, among them Truth, Thunderlord, Gjallarhorn, Sleeper Simulant and Whisper of the Worm; weapon picker with search, catalyst as a toggle with a note on limited duration
- ✅ 40 exotic primaries (e.g. Bad Juju, Ace of Spades, Thorn, Le Monarque): unlimited ammo, they fire with reloads through the whole damage phase; pulse bursts count bullet by bullet; weapon picker filters by ammo
- ✅ 131 of 141 exotic weapons, among them swords (The Lament, Black Talon, Ergo Sum: one hit per combo), Merciless, Outbreak Perfected, Witherhoard (a full blight per shot), Choir of One (5 ammo per projectile) and Touch of Malice (last round)
- ✅ 136 of 141: Turncoat, Prometheus Lens, Fafnir, Anarchy and Heartshadow, timing from the Bungie manifest, Quantum and Aegis
- ⏳ 5 exotic weapons still missing: the swords Wolfsbane, Praxic Blade and Worldline Zero, and Barrow-Dyad and The Huckleberry (only measured with their catalyst)
- ✅ Choir of One with catalyst was 5 times too strong; fixed
- ✅ Exotic armor: picker under “Armor” with search and slot filter. A note says what the exotic does in the calculator. Many work through the Rotation, e.g. Star-Eater Scales after the Super cast or Foetracer after an ability hit. Cuirass of the Falling Star and Celestial Nighthawk change their Super. Kill buffs only count with the “Pre-stacked” toggle, since one boss without adds gives no kills.
- ✅ Aspects and fragments from all subclasses, e.g. Spark of Shock (Jolt), Echo of Undermining (Weaken after a Void grenade), Ember of Torches (Radiant after a melee hit); states such as Amplified or Woven Mail for exotics like No Backup Plans
- ✅ Keywords: Ignition, Jolt, Volatile, Unravel and Bolt Charge as their own damage; abilities apply them with their hits
- ✅ Hover cards explain what an item does; keyword damage shows as “Effect” in the color of its element
- ✅ The whole website in English
- ✅ Exotic Class Item (Prismatic): pick two Spirit perks under “Armor”, one per column like in the game (Star-Eater and Verity share a column, so no item has both); it replaces the exotic piece. Perks that change damage work: Eternal Warrior and Foetracer (surge), Star-Eater (+70 % Super), Verity (grenade, with “Pre-stacked”). Perks with damage of their own or only energy follow later.
- ✅ Transcendence (Prismatic): +5 % weapon damage for 20 s, with a window you can move in the Rotation, and the Prismatic grenade of your class (Hailfire Spike, Electrified Snare, Freezing Singularity), which you can only throw while Transcendence lasts. The faster grenade and melee regeneration during Transcendence is not modelled yet.
- ✅ Melee buffs add up with each other (own bucket): Knockout, Offensive Bulwark, Roaring Flames, Spark of Feedback, Banner of War and Facet of Courage. Facet of Courage's +10 % on Light abilities and Roaring Flames' +73 % on grenades and supers share a second bucket that is an assumption, because no source names theirs.
- ✅ Ability energy: every ability starts charged and comes back after its Compendium cooldown, faster with the stat (2.48× at 100). A cast before its energy is back moves later and shows its real time; “+” adds the next possible cast. Exotics, aspects and abilities that give energy work (23 effects): extra charges (e.g. Starfire Protocol, Claws of Ahamkara, Chaos Accelerant), faster regeneration (Eye of Another World, Heart of Inmost Light) and refunds (Starfire while Radiant, Apotheosis Veil on Super cast, Shards of Galanor 50 % against a boss, Young Ahamkara's Spine). Such exotics can now be picked.
- ✅ Class ability in the Rotation, next to grenade and melee, with its Compendium cooldown: Marksman's Dodge reloads the weapon and goes to the next reload (saves one Gjallarhorn reload, 2.35 s, minus the cast time), Rally Barricade (0.9× reload time for 20 s), Empowering Rift (+20 % for 15 s from its cast, faster grenade and melee regeneration), Gambler's Dodge (a full melee bar)
- ✅ Cast times: every grenade, melee and class ability cast keeps you busy (Weighted Knife 1.55 s from the Compendium, all others a 1 s estimate). The weapon does not fire meanwhile, and the next cast starts after it, also after a Super.
- ✅ Class ability icons in the color of the subclass; with Prismatic they follow the element of the chosen Super (Arc without one)
- ✅ Buffs triggered by a class ability cast: Gwisin Vest (Weaken), Mask of Bakris, Trapper's Ambush and Child of the Old Gods; Thruster, Towering Barricade, Healing Rift, Acrobat's Dodge and Phoenix Dive join the rotation
- ✅ Hazardous Propulsion (“Pre-stacked”): +35 % for 10 s on rocket launchers. Lethal Current and the class ability energy of exotics were measured at under 1 % of a typical build and stay out
- ✅ Aspects with damage of their own, at the rate Aegis measures: Storm's Keep (a Bolt Charge discharge of 678 every 1.46 s), Hellion, Weaver's Call, Arc Soul and Ionic Sentry. They hit the whole damage phase; debuffs such as Weaken apply, weapon buffs do not.
- ⏳ Lethal Current (Jolt on the cast), Heart of Inmost Light, energy exotics for class abilities; exotics that refill the magazine
- ✅ Supers take time like in the game: hits spread over shots and light attacks (e.g. Golden Gun ignites with its third shot), the weapon waits only as long as the Super really blocks it (Daybreak about 13 s instead of 24 s, Nova Bomb about 1.8 s instead of 0 s). Timings are rough estimates and marked as such.
- ✅ Aspects and fragments that change an ability, from Aegis measurements: Knock 'Em Down (Blade Barrage), Thread of Evolution (Needlestorm, Threadling), Spark of Magnitude (Pulse), Chaos Accelerant (Axion Bolt, Scatter, Vortex), Echo of Remnants (Vortex), Touch of Winter (Glacier, Shatter)
- ✅ Only aspects and fragments that change damage are offered. Items that only grant a state (e.g. Ascension, On Your Mark) appear when the exotic needs that state, such as No Backup Plans.
- ✅ Ignition in Solar Supers counts once: the Aegis value of Golden Gun and Daybreak already holds the ignitions of its shots, so they are taken out of the package and come back from the Scorch of each hit. Daybreak ignites during the super (x50 Scorch per projectile).
- ✅ Tidier picker: Radiant and Weaken in their own section “Buffs & Debuffs”, one tile per item (e.g. Facet of Dominance), game icons for every aspect and fragment
- ✅ Abilities built from their Compendium parts instead of one measured total, checked against Aegis (±15 %): 21 of 75, among them Thundercrash (impact, explosion, aftershocks over 4 s), Deadfall and most grenades and melees. Other Supers keep the measured Aegis total, which is closer than their parts
- ✅ Jolt and Volatile no longer count twice in Supers that already hold them in the Aegis total (Stormtrance, Gathering Storm, Nova Warp)
- ✅ All buffs, debuffs and artifact perks from Court as switches (22 new): Expanding Abyss (Weaken 25 % for Void), the Weaken perks, Radiant and surge perks, Argent Blade, Quiver and Ordnance, Sniper's Meditation, Targeting Autoloader, Arc Compounding, Weapons of Light, Remote Shield and Banner of War for the fireteam. Every Court row is accounted for in a review table.
- ✅ Seasonal artifacts like in the game: pick one of the seven artifacts (Encrypted Data Disk, Implement of Curiosity, Tablet of Ruin, Slayer Baron Apothecary Satchel, Hunter's Journal, Queensfoil Censer, NPA Repulsion Regulator), then its perks in three rows of one, two and three diamonds. The slots are those of the game (two, three and two), so only combinations the game allows can be built; the optimizer follows the same rule. Every one of the 147 perks is accounted for in a review table. New perks: Limit Break (+15 % Super), Thunderous Retort (+30 % Arc Super, matches Aegis), Shieldcrush, Transference and Fever and Chill
- ✅ Abilities grant their buffs and debuffs at every cast or hit, read from the Compendium texts: Radiant from Acrobat's Dodge and Lightweight Knife (10 s), Weaken from Snare Bomb (8 s), Twilight Arsenal and Nova Warp (6 s, Court). They do not stack with the Radiant or Weaken switch. Every ability line that names a buff or debuff is accounted for in a review table.
- ✅ The donut has a thin outer ring: how much of the total comes from the base damage, from each multiplier (Surge, Empowering Buff, Debuff, …) and from the catalyst. Each damage hit splits its extra damage over its multipliers by their size, so the order does not matter and the slices add up to the total. Damage of its own from aspects (e.g. Hellion) shows its name
- ⏳ Next: ability casts take time (1 s estimate until measured), so two casts never happen at once
- ⏳ Stormtrance and Pocket Singularity: Jolt and Volatile count twice (+14 %, +22 %)
- ⏳ Touch of Thunder: Aegis only measured it together with other buffs
- ✅ Every weapon with a catalyst has the switch; its hover card says what it does here: damage (e.g. One Thousand Voices +45%), magazine and ammo (e.g. Gjallarhorn 1 → 2 rockets, Telesto 4 → 7), refills (Thunderlord, Cloudstrike), or no effect against one boss
- ✅ 47 catalysts are marked “no effect against one boss” (they need kills, several enemies, allies, pickups or shields); Touch of Malice ×1.25, Graviton Lance and Wish-Keeper ×1.2 (Vorpal Weapon)
- ✅ 20 more catalysts: Izanagi's Burden (Honed Edge shots), Ticuu's Divination ×1.87, Dead Man's Tale (hip-fire, ×1.27), Deterministic Chaos ×1.25 (Target Lock), Outbreak Perfected ×1.15, Revision Zero (Fourth Time's The Charm), Hierarchy of Needs (faster draw), The Chaperone (27 slugs instead of 18), Heartshadow (one more heavy); 10 more do nothing against one boss
- ✅ Catalysts with reload speed reload faster, scaled with d2foundry's reload formula per weapon type: Borealis, Coldheart, Le Monarque, Lord of Wolves, Osteo Striga, Symmetry, The Fourth Horseman
- ✅ Overall check against Aegis: 14 builds (10 exotic heavy weapons, 4 Supers) under the same buffs as Aegis land within −3 % to +6 % of Aegis' totals. Truth now fires 14 rockets like Aegis measures, not 20.
- ⏳ 26 catalysts are not in the calculator yet: some speed up the reload only through a perk (e.g. Euphony, Hard Light, Sunshot), the rest need their own model (e.g. Bastion, Final Warning, Vexcalibur)

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
