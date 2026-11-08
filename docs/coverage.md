# Coverage of the calculator

Generated with `npm run coverage` from the data files. Do not edit by hand.

Legend: ✅ Parts = own Damage Instances from the Compendium, checked against Aegis by the gate.
🟡 Package = measured value per cast from Aegis. 🔵 Buff only = Super without damage of its own.
❌ missing = not in the calculator yet, with reason. Super Window: exact, estimate (a value is missing) or does not block.

## Overview

| Kind | ✅ Parts | 🟡 Package | 🔵 Buff only | ❌ missing | Total |
| --- | --- | --- | --- | --- | --- |
| Supers | 2 | 26 | 1 | 2 | 31 |
| Grenades | 7 | 19 | 0 | 4 | 30 |
| Melees | 12 | 12 | 0 | 2 | 26 |
| Effects | 103 modelled | | | | |

## Aegis measurements

Every row of the Aegis sheets (Weapons, Sustained, Swap) has a verdict: in the model (used or checked against the model), skipped with a reason (another mode, a burst before a weapon swap, a legendary frame) or missing (an item or an assumption the model does not have).

| Sheet | Rows | In the model | Skipped | Missing |
| --- | ---: | ---: | ---: | ---: |
| Weapons | 417 | 134 | 257 | 26 |
| Sustained | 261 | 38 | 132 | 91 |
| Swap | 204 | 47 | 102 | 55 |

## Supers

| Element | Super | Model | Super Window | Aegis row or reason |
| --- | --- | --- | --- | --- |
| Arc | Arc Staff | 🟡 Package | exact | `super-arc-staff-grounded-2l1h` |
| Arc | Gathering Storm | 🟡 Package | exact | `super-gathering-storm` |
| Arc | Storm's Edge | 🟡 Package | estimate | `super-storm-s-edge-body` |
| Arc | Fists of Havoc | 🟡 Package | exact | `super-fists-of-havoc-heavy-attacks` |
| Arc | Thundercrash | ✅ Parts | exact | `super-thundercrash` |
| Arc | Chaos Reach | 🟡 Package | exact | `super-chaos-reach` |
| Arc | Stormtrance | 🟡 Package | exact | `super-stormtrance` |
| Solar | Blade Barrage | 🟡 Package | exact | `super-blade-barrage` |
| Solar | Golden Gun: Deadshot | 🟡 Package | exact | `super-golden-gun-deadshot-radiant-ember-of-ashes` |
| Solar | Golden Gun: Marksman | 🟡 Package | exact | `super-golden-gun-marksman-radiant` |
| Solar | Burning Maul | 🟡 Package | exact | `super-burning-maul-light-attacks-sol-invictus-ember-of-ashes` |
| Solar | Hammer of Sol | 🟡 Package | exact | `super-hammer-of-sol` |
| Solar | Hammer of Sol (Sol Invictus Aspect) | ❌ missing | – | Aegis only measures with buffs that are not an effect yet |
| Solar | Song of Flame | 🟡 Package | exact | `super-song-of-flame-snap-spam` |
| Solar | Daybreak | 🟡 Package | exact | `super-daybreak-ember-of-ashes` |
| Solar | Well of Radiance | 🔵 Buff only | estimate | – |
| Void | Spectral Blades | 🟡 Package | exact | `super-spectral-blades-light-attacks` |
| Void | Shadowshot: Deadfall | ✅ Parts | exact | `super-shadowshot-deadfall-tether-includes-debuff` |
| Void | Shadowshot: Moebius Quiver | 🟡 Package | estimate | `super-shadowshot-moebius-quiver-includes-debuff` |
| Void | Sentinel Shield | 🟡 Package | exact | `super-sentinel-shield-light-attacks` |
| Void | Twilight Arsenal | 🟡 Package | exact | `super-twilight-arsenal-includes-tractor` |
| Void | Ward of Dawn | ❌ missing | – | only gives a buff that is not an effect yet |
| Void | Nova Bomb: Cataclysm | 🟡 Package | exact | `super-nova-bomb-cataclysm` |
| Void | Nova Bomb: Vortex | 🟡 Package | exact | `super-nova-bomb-vortex` |
| Void | Nova Warp | 🟡 Package | exact | `super-nova-warp` |
| Stasis | Silence & Squall | 🟡 Package | exact | `super-silence-and-squall-whisper-of-fissures-whisper-of-durance` |
| Stasis | Glacial Quake | 🟡 Package | exact | `super-glacial-quake-heavy-attacks` |
| Stasis | Winter's Wrath | 🟡 Package | exact | `super-winter-s-wrath-light-heavy-cycle-whisper-of-fissures` |
| Strand | Silkstrike | 🟡 Package | exact | `super-silkstrike-light-attacks` |
| Strand | Bladefury | 🟡 Package | exact | `super-bladefury-hlllhllllhllllh-feast-of-light-x6` |
| Strand | Needlestorm | 🟡 Package | exact | `super-needlestorm` |

## Grenades

| Element | Grenade | Model | Aegis row or reason |
| --- | --- | --- | --- |
| Arc | Arcbolt Grenade | 🟡 Package | `grenade-arcbolt` |
| Arc | Flashbang Grenade | 🟡 Package | `grenade-flashbang` |
| Arc | Flux Grenade | 🟡 Package | `grenade-flux-6540-sticker-shock` |
| Arc | Lightning Grenade | 🟡 Package | `grenade-lightning` |
| Arc | Pulse Grenade | 🟡 Package | `grenade-pulse` |
| Arc | Skip Grenade | 🟡 Package | `grenade-skip` |
| Arc | Storm Grenade | 🟡 Package | `grenade-storm` |
| Solar | Firebolt Grenade | 🟡 Package | `grenade-firebolt-average-ember-of-ashes-with-ignition` |
| Solar | Fusion Grenade | ✅ Parts | `grenade-fusion-average-ember-of-ashes-with-ignition` |
| Solar | Healing Grenade | ❌ missing | no Aegis measurement |
| Solar | Incendiary Grenade | 🟡 Package | `grenade-incendiary-average-ember-of-ashes-with-ignition` |
| Solar | Solar Grenade | ✅ Parts | `grenade-solar-ember-of-ashes` |
| Solar | Swarm Grenade | 🟡 Package | `grenade-swarm-average-with-ignition` |
| Solar | Thermite Grenade | ✅ Parts | `grenade-thermite-average-ember-of-ashes-with-ignition` |
| Solar | Tripmine Grenade | ✅ Parts | `grenade-tripmine-average-ember-of-ashes-with-ignition` |
| Void | Axion Bolt | ✅ Parts | `grenade-axion-bolt` |
| Void | Magnetic Grenade | ✅ Parts | `grenade-magnetic-average` |
| Void | Scatter Grenade | 🟡 Package | `grenade-scatter-average` |
| Void | Suppressor Grenade | 🟡 Package | `grenade-suppressor` |
| Void | Void Spike | 🟡 Package | `grenade-void-spike-echo-of-remnants` |
| Void | Void Wall | 🟡 Package | `grenade-void-wall-echo-of-remnants` |
| Void | Vortex Grenade | ✅ Parts | `grenade-vortex` |
| Stasis | Coldsnap Grenade | ❌ missing | no Aegis measurement |
| Stasis | Duskfield Grenade | ❌ missing | no Aegis measurement |
| Stasis | Glacier Grenade | 🟡 Package | `grenade-glacier-average-whisper-of-fissures` |
| Stasis | Shatter Grenade | 🟡 Package | `grenade-shatter-average-whisper-of-fissures` |
| Strand | Grapple | ❌ missing | no usable data |
| Strand | Shackle Grenade | 🟡 Package | `grenade-shackle` |
| Strand | Slicewire | 🟡 Package | `grenade-slicewire` |
| Strand | Threadling Grenade | 🟡 Package | `grenade-threadling` |

## Melees

| Element | Melee | Model | Aegis row or reason |
| --- | --- | --- | --- |
| Arc | Combination Blow | ❌ missing | no Aegis measurement |
| Arc | Disorienting Blow | ✅ Parts | `melee-disorienting-blow` |
| Arc | Ballistic Slam | 🟡 Package | `melee-ballistic-slam-average-max-typical-catapult-lift-height` |
| Arc | Seismic Strike | ✅ Parts | `melee-seismic-strike` |
| Arc | Thunderclap | 🟡 Package | `melee-thunderclap-fully-charged` |
| Arc | Ball Lightning | 🟡 Package | `melee-ball-lightning` |
| Arc | Chain Lightning | ❌ missing | no Aegis measurement |
| Solar | Knife Trick | 🟡 Package | `melee-knife-trick-average-precision-ember-of-ashes-with-ignition` |
| Solar | Lightweight Knife | ✅ Parts | `melee-lightweight-knife-precision` |
| Solar | Proximity Explosive Knife | 🟡 Package | `melee-proximity-explosive-knife-precision` |
| Solar | Weighted Throwing Knife | ✅ Parts | `melee-weighted-throwing-knife-precision` |
| Solar | Hammer Strike | ✅ Parts | `melee-hammer-strike-ember-of-ashes` |
| Solar | Throwing Hammer | 🟡 Package | `melee-throwing-hammer` |
| Solar | Celestial Fire | ✅ Parts | `melee-celestial-fire-average-ember-of-ashes-with-ignition` |
| Solar | Incinerator Snap | ✅ Parts | `melee-incinerator-snap-ember-of-ashes` |
| Void | Phantom Surge | ✅ Parts | `melee-phantom-surge` |
| Void | Snare Bomb | ✅ Parts | `melee-snare-bomb-ticks-include-weaken` |
| Void | Shield Bash | ✅ Parts | `melee-shield-bash` |
| Void | Shield Throw | 🟡 Package | `melee-shield-throw` |
| Void | Pocket Singularity | 🟡 Package | `melee-pocket-singularity` |
| Stasis | Withering Blade | 🟡 Package | `melee-withering-blade-average-facet-of-ruin` |
| Stasis | Shiver Strike | 🟡 Package | `melee-shiver-strike-whisper-of-fissures-with-auto-shatter` |
| Stasis | Penumbral Blast | 🟡 Package | `melee-penumbral-blast-average-facet-of-ruin` |
| Strand | Threaded Spike | 🟡 Package | `melee-threaded-spike-double-tick` |
| Strand | Frenzied Blade | ✅ Parts | `melee-frenzied-blade` |
| Strand | Arcane Needle | ✅ Parts | `melee-arcane-needle` |

## Effects

| Effect | Bucket | Effect value | Applies to | Duration |
| --- | --- | --- | --- | --- |
| Well of Radiance (standing inside) | empowering | empowering +25%; empowering +20% | weapon; super (only golden-gun-deadshot, golden-gun-marksman) | 30 s |
| Empowering Rift | empowering | empowering +20% | weapon | 15 s |
| Radiant | empowering | empowering +20%; empowering +20% | weapon; super (only golden-gun-deadshot, golden-gun-marksman) | whole phase or Rotation |
| Weapons of Light (Banner Shield, Ward of Dawn) | empowering | empowering +25% | weapon | whole phase or Rotation |
| Lumina (Blessing of the Sky) | empowering | empowering +35% | weapon | 11 s |
| Weaken | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | whole phase or Rotation |
| Divinity | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | whole phase or Rotation |
| Tractor Cannon | debuff | debuff +30% | weapon, grenade, melee, super, classAbility, keyword | 10 s |
| Moebius Tether | debuff | debuff +30% | weapon, grenade, melee, super, classAbility, keyword | 6 s |
| Deadfall Tether | debuff | debuff +35% | weapon, grenade, melee, super, classAbility, keyword | 12 s |
| Surge 1x | surge | surge +10% | weapon | whole phase or Rotation |
| Surge 2x | surge | surge +17% | weapon | whole phase or Rotation |
| Surge 3x | surge | surge +22% | weapon | whole phase or Rotation |
| Elemental Overdrive (solar pickup) | amplification | amplification +22% | weapon | 7 s |
| Particle Reconstruction | –, debuff | Timing: noReload; debuff +27.6% | weapon | whole phase or Rotation |
| Ember of Ashes | – | scorch ×1.5 | weapon | whole phase or Rotation |
| Transcendence | transcendence | transcendence +5% | weapon | 20 s |
| Rally Barricade | – | Timing: reloadDuration | weapon | 20 s |
| Limit Break | amplification | amplification +15% | super | whole phase or Rotation |
| Thunderous Retort | amplification | amplification +30% | super | whole phase or Rotation |
| Shieldcrush | melee, amplification | melee +50%; amplification +25% | melee; grenade | whole phase or Rotation |
| Transference | amplification, melee | amplification +10%; melee +10% | grenade; melee | whole phase or Rotation |
| Fever and Chill | empowering | empowering +20% | weapon | whole phase or Rotation |
| Expanding Abyss | debuff | debuff +25%; debuff +35%; debuff +40% | weapon, grenade, melee, super, classAbility, keyword | whole phase or Rotation |
| Debilitating Wave | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 6 s |
| Maligned Harvest | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 6 s |
| Singularity Blade | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 6 s |
| Supernova | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 8 s |
| Void Infestation | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 6 s |
| Weakened Clear | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 20 s |
| Radiant Orbs | empowering | empowering +20%; empowering +20% | weapon; super (only golden-gun-deadshot, golden-gun-marksman) | 10 s |
| Heart of the Flame | empowering | empowering +20%; empowering +20% | weapon; super (only golden-gun-deadshot, golden-gun-marksman) | 10 s |
| Prismatic Transfer | empowering | empowering +20% | weapon | 10 s |
| Weapons of Light (Ward of Dawn) | empowering | empowering +25% | weapon | 15 s |
| Precision Equity | surge | surge +17% | weapon | 11 s |
| That Fresh Bullet Smell | surge | surge +17% | weapon | 11 s |
| Void Weapon Channelling | surge | surge +25% | weapon | 11 s |
| Argent Blade | amplification | amplification +15% | weapon | 5 s |
| Argent Ordnance | amplification | amplification +15% | weapon | 4.5 s |
| Argent Quiver | amplification | amplification +35% | weapon | whole phase or Rotation |
| Sniper's Meditation | amplification | amplification +15% | weapon | 7 s |
| Targeting Autoloader | amplification | amplification +20% | weapon | 15 s |
| Arc Compounding | amplification | amplification +15% | weapon, grenade, melee, super, classAbility, keyword | whole phase or Rotation |
| Remote Shield (Edge of Action) | amplification | amplification +5% | weapon | 10 s |
| Banner of War (Strand Titan) | amplification | amplification +10% | weapon | whole phase or Rotation |
| Ascension |  |  |  | whole phase or Rotation |
| Banner of War | melee | melee +100% | melee | 15 s |
| Bastion |  |  |  | whole phase or Rotation |
| Child of the Old Gods | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 5 s |
| Controlled Demolition | – | Applies a keyword | weapon | whole phase or Rotation |
| Diamond Lance |  |  |  | whole phase or Rotation |
| Echo of Instability | – | Applies a keyword | weapon | 11.25 s |
| Echo of Undermining | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 5 s |
| Echo of Vigilance |  |  |  | whole phase or Rotation |
| Electrostatic Mind |  |  |  | whole phase or Rotation |
| Ember of Mercy |  |  |  | whole phase or Rotation |
| Ember of Torches (Radiant) | empowering | empowering +20%; empowering +20% | weapon; super (only golden-gun-deadshot, golden-gun-marksman) | 8 s |
| Ensnaring Slam |  |  |  | whole phase or Rotation |
| Facet of Bravery | – | Applies a keyword | weapon | 11.25 s |
| Facet of Bravery | – | Applies a keyword | weapon | 11.25 s |
| Facet of Courage | aspectBonus | aspectBonus +10% | grenade, super | whole phase or Rotation |
| Facet of Courage | melee | melee +50% | melee | whole phase or Rotation |
| Facet of Dawn (Radiant) | empowering | empowering +20%; empowering +20% | weapon; super (only golden-gun-deadshot, golden-gun-marksman) | 5 s |
| Facet of Dominance | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 5 s |
| Facet of Dominance | – | Applies a keyword | weapon | whole phase or Rotation |
| Facet of Purpose |  |  |  | whole phase or Rotation |
| Frostpulse |  |  |  | whole phase or Rotation |
| Glacial Harvest |  |  |  | whole phase or Rotation |
| Grim Harvest |  |  |  | whole phase or Rotation |
| Heat Rises |  |  |  | whole phase or Rotation |
| Into the Fray |  |  |  | whole phase or Rotation |
| Knockout | melee | melee +160% | melee | 6 s |
| Lightning Surge |  |  |  | whole phase or Rotation |
| Offensive Bulwark | melee | melee +160% | melee | whole phase or Rotation |
| On the Prowl | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 6 s |
| On Your Mark |  |  |  | 3 s |
| Roaring Flames |  |  |  | 20 s |
| Roaring Flames | melee | melee +200% | melee | 20 s |
| Roaring Flames | aspectBonus | aspectBonus +73% | grenade, super | 20 s |
| Shatterdive |  |  |  | whole phase or Rotation |
| Sol Invictus |  |  |  | whole phase or Rotation |
| Soul Siphon |  |  |  | whole phase or Rotation |
| Spark of Feedback | melee | melee +100% | melee | 5 s |
| Spark of Shock | – | Applies a keyword | weapon | whole phase or Rotation |
| Tectonic Harvest |  |  |  | whole phase or Rotation |
| Thread of Propagation | – | Applies a keyword | weapon | 8 s |
| Thread of Warding |  |  |  | whole phase or Rotation |
| Touch of Flame |  |  |  | whole phase or Rotation |
| Trapper's Ambush | debuff | debuff +15% | weapon, grenade, melee, super, classAbility, keyword | 10 s |
| Unbreakable |  |  |  | whole phase or Rotation |
| Weavewalk |  |  |  | whole phase or Rotation |
| Whisper of Fractures |  |  |  | whole phase or Rotation |
| Knock 'Em Down |  |  |  | whole phase or Rotation |
| Thread of Evolution |  |  |  | whole phase or Rotation |
| Spark of Magnitude |  |  |  | whole phase or Rotation |
| Chaos Accelerant |  |  |  | whole phase or Rotation |
| Echo of Remnants |  |  |  | whole phase or Rotation |
| Touch of Winter |  |  |  | whole phase or Rotation |
| Arc Soul | – | Own damage: arc-soul | own damage | 15 s |
| Hellion | – | Own damage: hellion | own damage | 20 s |
| Ionic Sentry | – | Own damage: ionic-sentry | own damage | 15 s |
| Storm's Keep | – | Own damage: storms-keep | own damage | whole phase or Rotation |
| Weaver's Call | – | Own damage: weavers-call | own damage | whole phase or Rotation |
