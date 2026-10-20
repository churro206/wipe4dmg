# Abdeckung des Rechners

Generiert mit `npm run coverage` aus den Data Files. Nicht von Hand bearbeiten.

Legende: ✅ Teile = eigene Damage Instances aus dem Compendium, vom Gate gegen Aegis geprüft.
🟡 Paket = gemessener Wert pro Einsatz aus Aegis (ADR 0009). 🔵 Nur Buff = Super ohne eigenen Schaden.
❌ fehlt = noch nicht im Rechner, mit Grund. Super Window: exakt, Schätzung (ein Wert fehlt) oder blockiert nicht.

## Überblick

| Art | ✅ Teile | 🟡 Paket | 🔵 Nur Buff | ❌ fehlt | Gesamt |
| --- | --- | --- | --- | --- | --- |
| Supers | 0 | 25 | 1 | 5 | 31 |
| Grenades | 0 | 26 | 0 | 4 | 30 |
| Melees | 0 | 24 | 0 | 2 | 26 |
| Effects | 17 modelliert | | | | |

## Supers

| Element | Super | Modell | Super Window | Aegis-Zeile oder Grund |
| --- | --- | --- | --- | --- |
| Arc | Arc Staff | 🟡 Paket | Schätzung | `super-arc-staff-grounded-2l1h` |
| Arc | Gathering Storm | 🟡 Paket | Schätzung | `super-gathering-storm` |
| Arc | Storm's Edge | 🟡 Paket | blockiert nicht | `super-storm-s-edge-body` |
| Arc | Fists of Havoc | 🟡 Paket | Schätzung | `super-fists-of-havoc-heavy-attacks` |
| Arc | Thundercrash | 🟡 Paket | Schätzung | `super-thundercrash` |
| Arc | Chaos Reach | 🟡 Paket | exakt | `super-chaos-reach` |
| Arc | Stormtrance | 🟡 Paket | Schätzung | `super-stormtrance` |
| Solar | Blade Barrage | 🟡 Paket | Schätzung | `super-blade-barrage` |
| Solar | Golden Gun: Deadshot | 🟡 Paket | Schätzung | `super-golden-gun-deadshot-radiant-ember-of-ashes` |
| Solar | Golden Gun: Marksman | 🟡 Paket | Schätzung | `super-golden-gun-marksman-radiant` |
| Solar | Burning Maul | 🟡 Paket | exakt | `super-burning-maul-light-attacks-sol-invictus-ember-of-ashes` |
| Solar | Hammer of Sol | 🟡 Paket | exakt | `super-hammer-of-sol` |
| Solar | Hammer of Sol (Sol Invictus Aspect) | ❌ fehlt | – | Aegis misst nur mit Buffs, die noch kein Effect sind |
| Solar | Song of Flame | ❌ fehlt | – | Aegis-Werte nicht normiert (Buffs im Wert) |
| Solar | Daybreak | 🟡 Paket | Schätzung | `super-daybreak-ember-of-ashes` |
| Solar | Well of Radiance | 🔵 Nur Buff | Schätzung | – |
| Void | Spectral Blades | 🟡 Paket | Schätzung | `super-spectral-blades-light-attacks` |
| Void | Shadowshot: Deadfall | 🟡 Paket | Schätzung | `super-shadowshot-deadfall-tether-includes-debuff` |
| Void | Shadowshot: Moebius Quiver | 🟡 Paket | Schätzung | `super-shadowshot-moebius-quiver-includes-debuff` |
| Void | Sentinel Shield | 🟡 Paket | Schätzung | `super-sentinel-shield-light-attacks` |
| Void | Twilight Arsenal | 🟡 Paket | Schätzung | `super-twilight-arsenal-includes-tractor` |
| Void | Ward of Dawn | ❌ fehlt | – | gibt nur einen Buff, der noch kein Effect ist |
| Void | Nova Bomb: Cataclysm | 🟡 Paket | Schätzung | `super-nova-bomb-cataclysm` |
| Void | Nova Bomb: Vortex | 🟡 Paket | Schätzung | `super-nova-bomb-vortex` |
| Void | Nova Warp | 🟡 Paket | Schätzung | `super-nova-warp` |
| Stasis | Silence & Squall | 🟡 Paket | Schätzung | `super-silence-and-squall-whisper-of-fissures-whisper-of-durance` |
| Stasis | Glacial Quake | ❌ fehlt | – | Aegis-Werte nicht normiert (Buffs im Wert) |
| Stasis | Winter's Wrath | 🟡 Paket | Schätzung | `super-winter-s-wrath-light-heavy-cycle-whisper-of-fissures` |
| Strand | Silkstrike | 🟡 Paket | Schätzung | `super-silkstrike-light-attacks` |
| Strand | Bladefury | ❌ fehlt | – | Aegis misst nur mit Buffs, die noch kein Effect sind |
| Strand | Needlestorm | 🟡 Paket | Schätzung | `super-needlestorm` |

## Grenades

| Element | Grenade | Modell | Aegis-Zeile oder Grund |
| --- | --- | --- | --- |
| Arc | Arcbolt Grenade | 🟡 Paket | `grenade-arcbolt` |
| Arc | Flashbang Grenade | 🟡 Paket | `grenade-flashbang` |
| Arc | Flux Grenade | 🟡 Paket | `grenade-flux-6540-sticker-shock` |
| Arc | Lightning Grenade | 🟡 Paket | `grenade-lightning` |
| Arc | Pulse Grenade | 🟡 Paket | `grenade-pulse` |
| Arc | Skip Grenade | 🟡 Paket | `grenade-skip` |
| Arc | Storm Grenade | 🟡 Paket | `grenade-storm` |
| Solar | Firebolt Grenade | 🟡 Paket | `grenade-firebolt-average-ember-of-ashes-with-ignition` |
| Solar | Fusion Grenade | 🟡 Paket | `grenade-fusion-average-ember-of-ashes-with-ignition` |
| Solar | Healing Grenade | ❌ fehlt | keine Aegis-Messung |
| Solar | Incendiary Grenade | 🟡 Paket | `grenade-incendiary-average-ember-of-ashes-with-ignition` |
| Solar | Solar Grenade | 🟡 Paket | `grenade-solar-ember-of-ashes` |
| Solar | Swarm Grenade | 🟡 Paket | `grenade-swarm-average-with-ignition` |
| Solar | Thermite Grenade | 🟡 Paket | `grenade-thermite-average-ember-of-ashes-with-ignition` |
| Solar | Tripmine Grenade | 🟡 Paket | `grenade-tripmine-average-ember-of-ashes-with-ignition` |
| Void | Axion Bolt | 🟡 Paket | `grenade-axion-bolt` |
| Void | Magnetic Grenade | 🟡 Paket | `grenade-magnetic-average` |
| Void | Scatter Grenade | 🟡 Paket | `grenade-scatter-average` |
| Void | Suppressor Grenade | 🟡 Paket | `grenade-suppressor` |
| Void | Void Spike | 🟡 Paket | `grenade-void-spike-echo-of-remnants` |
| Void | Void Wall | 🟡 Paket | `grenade-void-wall-echo-of-remnants` |
| Void | Vortex Grenade | 🟡 Paket | `grenade-vortex` |
| Stasis | Coldsnap Grenade | ❌ fehlt | keine Aegis-Messung |
| Stasis | Duskfield Grenade | ❌ fehlt | keine Aegis-Messung |
| Stasis | Glacier Grenade | 🟡 Paket | `grenade-glacier-average-whisper-of-fissures` |
| Stasis | Shatter Grenade | 🟡 Paket | `grenade-shatter-average-whisper-of-fissures` |
| Strand | Grapple | ❌ fehlt | keine brauchbaren Daten |
| Strand | Shackle Grenade | 🟡 Paket | `grenade-shackle` |
| Strand | Slicewire | 🟡 Paket | `grenade-slicewire` |
| Strand | Threadling Grenade | 🟡 Paket | `grenade-threadling` |

## Melees

| Element | Melee | Modell | Aegis-Zeile oder Grund |
| --- | --- | --- | --- |
| Arc | Combination Blow | ❌ fehlt | keine Aegis-Messung |
| Arc | Disorienting Blow | 🟡 Paket | `melee-disorienting-blow` |
| Arc | Ballistic Slam | 🟡 Paket | `melee-ballistic-slam-average-max-typical-catapult-lift-height` |
| Arc | Seismic Strike | 🟡 Paket | `melee-seismic-strike` |
| Arc | Thunderclap | 🟡 Paket | `melee-thunderclap-fully-charged` |
| Arc | Ball Lightning | 🟡 Paket | `melee-ball-lightning` |
| Arc | Chain Lightning | ❌ fehlt | keine Aegis-Messung |
| Solar | Knife Trick | 🟡 Paket | `melee-knife-trick-average-precision-ember-of-ashes-with-ignition` |
| Solar | Lightweight Knife | 🟡 Paket | `melee-lightweight-knife-precision` |
| Solar | Proximity Explosive Knife | 🟡 Paket | `melee-proximity-explosive-knife-precision` |
| Solar | Weighted Throwing Knife | 🟡 Paket | `melee-weighted-throwing-knife-precision` |
| Solar | Hammer Strike | 🟡 Paket | `melee-hammer-strike-ember-of-ashes` |
| Solar | Throwing Hammer | 🟡 Paket | `melee-throwing-hammer` |
| Solar | Celestial Fire | 🟡 Paket | `melee-celestial-fire-average-ember-of-ashes-with-ignition` |
| Solar | Incinerator Snap | 🟡 Paket | `melee-incinerator-snap-ember-of-ashes` |
| Void | Phantom Surge | 🟡 Paket | `melee-phantom-surge` |
| Void | Snare Bomb | 🟡 Paket | `melee-snare-bomb-ticks-include-weaken` |
| Void | Shield Bash | 🟡 Paket | `melee-shield-bash` |
| Void | Shield Throw | 🟡 Paket | `melee-shield-throw` |
| Void | Pocket Singularity | 🟡 Paket | `melee-pocket-singularity` |
| Stasis | Withering Blade | 🟡 Paket | `melee-withering-blade-average-facet-of-ruin` |
| Stasis | Shiver Strike | 🟡 Paket | `melee-shiver-strike-whisper-of-fissures-with-auto-shatter` |
| Stasis | Penumbral Blast | 🟡 Paket | `melee-penumbral-blast-average-facet-of-ruin` |
| Strand | Threaded Spike | 🟡 Paket | `melee-threaded-spike-double-tick` |
| Strand | Frenzied Blade | 🟡 Paket | `melee-frenzied-blade` |
| Strand | Arcane Needle | 🟡 Paket | `melee-arcane-needle` |

## Effects

| Effect | Bucket | Wirkung | Wirkt auf | Dauer |
| --- | --- | --- | --- | --- |
| Well of Radiance (standing inside) | empowering | empowering +25 %; empowering +20 % | weapon; super (nur golden-gun-deadshot, golden-gun-marksman) | 30 s |
| Empowering Rift | empowering | empowering +20 % | weapon | 15 s |
| Radiant | empowering | empowering +20 %; empowering +20 % | weapon; super (nur golden-gun-deadshot, golden-gun-marksman) | ganze Phase oder Rotation |
| Banner Shield (Weapons of Light) | empowering | empowering +25 % | weapon | ganze Phase oder Rotation |
| Lumina (Blessing of the Sky) | empowering | empowering +35 % | weapon | 11 s |
| Weaken | debuff | debuff +15 % | weapon, grenade, melee, super | ganze Phase oder Rotation |
| Divinity | debuff | debuff +15 % | weapon, grenade, melee, super | ganze Phase oder Rotation |
| Tractor Cannon | debuff | debuff +30 % | weapon, grenade, melee, super | 10 s |
| Moebius Tether | debuff | debuff +30 % | weapon, grenade, melee, super | 6 s |
| Deadfall Tether | debuff | debuff +35 % | weapon, grenade, melee, super | 12 s |
| Surge 1x | surge | surge +10 % | weapon | ganze Phase oder Rotation |
| Surge 2x | surge | surge +17 % | weapon | ganze Phase oder Rotation |
| Surge 3x | surge | surge +22 % | weapon | ganze Phase oder Rotation |
| Weapons stat 200 (power weapons against bosses) | amplification | amplification +10 % | weapon | ganze Phase oder Rotation |
| Elemental Overdrive (solar pickup) | amplification | amplification +22 % | weapon | 7 s |
| Particle Reconstruction | –, debuff | Timing: noReload; debuff +27.6 % | weapon | ganze Phase oder Rotation |
| Ember of Ashes | – | scorch ×1.5 | weapon | ganze Phase oder Rotation |
