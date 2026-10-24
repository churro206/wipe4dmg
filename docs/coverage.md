# Coverage of the calculator

Generated with `npm run coverage` from the data files. Do not edit by hand.

Legend: ✅ Parts = own Damage Instances from the Compendium, checked against Aegis by the gate.
🟡 Package = measured value per cast from Aegis. 🔵 Buff only = Super without damage of its own.
❌ missing = not in the calculator yet, with reason. Super Window: exact, estimate (a value is missing) or does not block.

## Overview

| Kind | ✅ Parts | 🟡 Package | 🔵 Buff only | ❌ missing | Total |
| --- | --- | --- | --- | --- | --- |
| Supers | 0 | 25 | 1 | 5 | 31 |
| Grenades | 0 | 26 | 0 | 4 | 30 |
| Melees | 0 | 24 | 0 | 2 | 26 |
| Effects | 18 modelled | | | | |

## Supers

| Element | Super | Model | Super Window | Aegis row or reason |
| --- | --- | --- | --- | --- |
| Arc | Arc Staff | 🟡 Package | estimate | `super-arc-staff-grounded-2l1h` |
| Arc | Gathering Storm | 🟡 Package | estimate | `super-gathering-storm` |
| Arc | Storm's Edge | 🟡 Package | does not block | `super-storm-s-edge-body` |
| Arc | Fists of Havoc | 🟡 Package | estimate | `super-fists-of-havoc-heavy-attacks` |
| Arc | Thundercrash | 🟡 Package | estimate | `super-thundercrash` |
| Arc | Chaos Reach | 🟡 Package | exact | `super-chaos-reach` |
| Arc | Stormtrance | 🟡 Package | estimate | `super-stormtrance` |
| Solar | Blade Barrage | 🟡 Package | estimate | `super-blade-barrage` |
| Solar | Golden Gun: Deadshot | 🟡 Package | estimate | `super-golden-gun-deadshot-radiant-ember-of-ashes` |
| Solar | Golden Gun: Marksman | 🟡 Package | estimate | `super-golden-gun-marksman-radiant` |
| Solar | Burning Maul | 🟡 Package | exact | `super-burning-maul-light-attacks-sol-invictus-ember-of-ashes` |
| Solar | Hammer of Sol | 🟡 Package | exact | `super-hammer-of-sol` |
| Solar | Hammer of Sol (Sol Invictus Aspect) | ❌ missing | – | Aegis only measures with buffs that are not an effect yet |
| Solar | Song of Flame | ❌ missing | – | Aegis values not normalised (buffs in the value) |
| Solar | Daybreak | 🟡 Package | estimate | `super-daybreak-ember-of-ashes` |
| Solar | Well of Radiance | 🔵 Buff only | estimate | – |
| Void | Spectral Blades | 🟡 Package | estimate | `super-spectral-blades-light-attacks` |
| Void | Shadowshot: Deadfall | 🟡 Package | estimate | `super-shadowshot-deadfall-tether-includes-debuff` |
| Void | Shadowshot: Moebius Quiver | 🟡 Package | estimate | `super-shadowshot-moebius-quiver-includes-debuff` |
| Void | Sentinel Shield | 🟡 Package | estimate | `super-sentinel-shield-light-attacks` |
| Void | Twilight Arsenal | 🟡 Package | estimate | `super-twilight-arsenal-includes-tractor` |
| Void | Ward of Dawn | ❌ missing | – | only gives a buff that is not an effect yet |
| Void | Nova Bomb: Cataclysm | 🟡 Package | estimate | `super-nova-bomb-cataclysm` |
| Void | Nova Bomb: Vortex | 🟡 Package | estimate | `super-nova-bomb-vortex` |
| Void | Nova Warp | 🟡 Package | estimate | `super-nova-warp` |
| Stasis | Silence & Squall | 🟡 Package | estimate | `super-silence-and-squall-whisper-of-fissures-whisper-of-durance` |
| Stasis | Glacial Quake | ❌ missing | – | Aegis values not normalised (buffs in the value) |
| Stasis | Winter's Wrath | 🟡 Package | estimate | `super-winter-s-wrath-light-heavy-cycle-whisper-of-fissures` |
| Strand | Silkstrike | 🟡 Package | estimate | `super-silkstrike-light-attacks` |
| Strand | Bladefury | ❌ missing | – | Aegis only measures with buffs that are not an effect yet |
| Strand | Needlestorm | 🟡 Package | estimate | `super-needlestorm` |

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
| Solar | Fusion Grenade | 🟡 Package | `grenade-fusion-average-ember-of-ashes-with-ignition` |
| Solar | Healing Grenade | ❌ missing | no Aegis measurement |
| Solar | Incendiary Grenade | 🟡 Package | `grenade-incendiary-average-ember-of-ashes-with-ignition` |
| Solar | Solar Grenade | 🟡 Package | `grenade-solar-ember-of-ashes` |
| Solar | Swarm Grenade | 🟡 Package | `grenade-swarm-average-with-ignition` |
| Solar | Thermite Grenade | 🟡 Package | `grenade-thermite-average-ember-of-ashes-with-ignition` |
| Solar | Tripmine Grenade | 🟡 Package | `grenade-tripmine-average-ember-of-ashes-with-ignition` |
| Void | Axion Bolt | 🟡 Package | `grenade-axion-bolt` |
| Void | Magnetic Grenade | 🟡 Package | `grenade-magnetic-average` |
| Void | Scatter Grenade | 🟡 Package | `grenade-scatter-average` |
| Void | Suppressor Grenade | 🟡 Package | `grenade-suppressor` |
| Void | Void Spike | 🟡 Package | `grenade-void-spike-echo-of-remnants` |
| Void | Void Wall | 🟡 Package | `grenade-void-wall-echo-of-remnants` |
| Void | Vortex Grenade | 🟡 Package | `grenade-vortex` |
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
| Arc | Disorienting Blow | 🟡 Package | `melee-disorienting-blow` |
| Arc | Ballistic Slam | 🟡 Package | `melee-ballistic-slam-average-max-typical-catapult-lift-height` |
| Arc | Seismic Strike | 🟡 Package | `melee-seismic-strike` |
| Arc | Thunderclap | 🟡 Package | `melee-thunderclap-fully-charged` |
| Arc | Ball Lightning | 🟡 Package | `melee-ball-lightning` |
| Arc | Chain Lightning | ❌ missing | no Aegis measurement |
| Solar | Knife Trick | 🟡 Package | `melee-knife-trick-average-precision-ember-of-ashes-with-ignition` |
| Solar | Lightweight Knife | 🟡 Package | `melee-lightweight-knife-precision` |
| Solar | Proximity Explosive Knife | 🟡 Package | `melee-proximity-explosive-knife-precision` |
| Solar | Weighted Throwing Knife | 🟡 Package | `melee-weighted-throwing-knife-precision` |
| Solar | Hammer Strike | 🟡 Package | `melee-hammer-strike-ember-of-ashes` |
| Solar | Throwing Hammer | 🟡 Package | `melee-throwing-hammer` |
| Solar | Celestial Fire | 🟡 Package | `melee-celestial-fire-average-ember-of-ashes-with-ignition` |
| Solar | Incinerator Snap | 🟡 Package | `melee-incinerator-snap-ember-of-ashes` |
| Void | Phantom Surge | 🟡 Package | `melee-phantom-surge` |
| Void | Snare Bomb | 🟡 Package | `melee-snare-bomb-ticks-include-weaken` |
| Void | Shield Bash | 🟡 Package | `melee-shield-bash` |
| Void | Shield Throw | 🟡 Package | `melee-shield-throw` |
| Void | Pocket Singularity | 🟡 Package | `melee-pocket-singularity` |
| Stasis | Withering Blade | 🟡 Package | `melee-withering-blade-average-facet-of-ruin` |
| Stasis | Shiver Strike | 🟡 Package | `melee-shiver-strike-whisper-of-fissures-with-auto-shatter` |
| Stasis | Penumbral Blast | 🟡 Package | `melee-penumbral-blast-average-facet-of-ruin` |
| Strand | Threaded Spike | 🟡 Package | `melee-threaded-spike-double-tick` |
| Strand | Frenzied Blade | 🟡 Package | `melee-frenzied-blade` |
| Strand | Arcane Needle | 🟡 Package | `melee-arcane-needle` |

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
