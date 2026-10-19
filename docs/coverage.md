# Abdeckung des Rechners

Generiert mit `npm run coverage` aus den Data Files. Nicht von Hand bearbeiten.

Legende: ✅ Teile = eigene Damage Instances aus dem Compendium, vom Gate gegen Aegis geprüft.
🟡 Paket = gemessener Wert pro Einsatz aus Aegis (ADR 0009). 🔵 Nur Buff = Super ohne eigenen Schaden.
❌ fehlt = noch nicht im Rechner, mit Grund. Super Window: exakt, Schätzung (ein Wert fehlt) oder blockiert nicht.

## Überblick

| Art | ✅ Teile | 🟡 Paket | 🔵 Nur Buff | ❌ fehlt | Gesamt |
| --- | --- | --- | --- | --- | --- |
| Supers | 0 | 25 | 1 | 5 | 31 |
| Grenades | 0 | 0 | 0 | 30 | 30 |
| Melees | 0 | 0 | 0 | 26 | 26 |
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
| Arc | Arcbolt Grenade | ❌ fehlt | noch nicht angelegt |
| Arc | Flashbang Grenade | ❌ fehlt | noch nicht angelegt |
| Arc | Flux Grenade | ❌ fehlt | noch nicht angelegt |
| Arc | Lightning Grenade | ❌ fehlt | noch nicht angelegt |
| Arc | Pulse Grenade | ❌ fehlt | noch nicht angelegt |
| Arc | Skip Grenade | ❌ fehlt | noch nicht angelegt |
| Arc | Storm Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Firebolt Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Fusion Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Healing Grenade | ❌ fehlt | keine Aegis-Messung |
| Solar | Incendiary Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Solar Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Swarm Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Thermite Grenade | ❌ fehlt | noch nicht angelegt |
| Solar | Tripmine Grenade | ❌ fehlt | noch nicht angelegt |
| Void | Axion Bolt | ❌ fehlt | noch nicht angelegt |
| Void | Magnetic Grenade | ❌ fehlt | noch nicht angelegt |
| Void | Scatter Grenade | ❌ fehlt | noch nicht angelegt |
| Void | Suppressor Grenade | ❌ fehlt | noch nicht angelegt |
| Void | Void Spike | ❌ fehlt | noch nicht angelegt |
| Void | Void Wall | ❌ fehlt | noch nicht angelegt |
| Void | Vortex Grenade | ❌ fehlt | noch nicht angelegt |
| Stasis | Coldsnap Grenade | ❌ fehlt | keine Aegis-Messung |
| Stasis | Duskfield Grenade | ❌ fehlt | keine Aegis-Messung |
| Stasis | Glacier Grenade | ❌ fehlt | noch nicht angelegt |
| Stasis | Shatter Grenade | ❌ fehlt | noch nicht angelegt |
| Strand | Grapple | ❌ fehlt | noch nicht angelegt |
| Strand | Shackle Grenade | ❌ fehlt | noch nicht angelegt |
| Strand | Slicewire | ❌ fehlt | noch nicht angelegt |
| Strand | Threadling Grenade | ❌ fehlt | noch nicht angelegt |

## Melees

| Element | Melee | Modell | Aegis-Zeile oder Grund |
| --- | --- | --- | --- |
| Arc | Combination Blow | ❌ fehlt | keine Aegis-Messung |
| Arc | Disorienting Blow | ❌ fehlt | noch nicht angelegt |
| Arc | Ballistic Slam | ❌ fehlt | noch nicht angelegt |
| Arc | Seismic Strike | ❌ fehlt | noch nicht angelegt |
| Arc | Thunderclap | ❌ fehlt | noch nicht angelegt |
| Arc | Ball Lightning | ❌ fehlt | noch nicht angelegt |
| Arc | Chain Lightning | ❌ fehlt | keine Aegis-Messung |
| Solar | Knife Trick | ❌ fehlt | noch nicht angelegt |
| Solar | Lightweight Knife | ❌ fehlt | noch nicht angelegt |
| Solar | Proximity Explosive Knife | ❌ fehlt | noch nicht angelegt |
| Solar | Weighted Throwing Knife | ❌ fehlt | noch nicht angelegt |
| Solar | Hammer Strike | ❌ fehlt | noch nicht angelegt |
| Solar | Throwing Hammer | ❌ fehlt | noch nicht angelegt |
| Solar | Celestial Fire | ❌ fehlt | noch nicht angelegt |
| Solar | Incinerator Snap | ❌ fehlt | noch nicht angelegt |
| Void | Phantom Surge | ❌ fehlt | noch nicht angelegt |
| Void | Snare Bomb | ❌ fehlt | Aegis-Werte nicht normiert (Buffs im Wert) |
| Void | Shield Bash | ❌ fehlt | noch nicht angelegt |
| Void | Shield Throw | ❌ fehlt | noch nicht angelegt |
| Void | Pocket Singularity | ❌ fehlt | noch nicht angelegt |
| Stasis | Withering Blade | ❌ fehlt | noch nicht angelegt |
| Stasis | Shiver Strike | ❌ fehlt | noch nicht angelegt |
| Stasis | Penumbral Blast | ❌ fehlt | noch nicht angelegt |
| Strand | Threaded Spike | ❌ fehlt | noch nicht angelegt |
| Strand | Frenzied Blade | ❌ fehlt | noch nicht angelegt |
| Strand | Arcane Needle | ❌ fehlt | noch nicht angelegt |

## Effects

| Effect | Bucket | Wirkung | Wirkt auf | Dauer |
| --- | --- | --- | --- | --- |
| Well of Radiance (standing inside) | empowering | empowering +25 % | weapon | 30 s |
| Empowering Rift | empowering | empowering +20 % | weapon | 15 s |
| Radiant | empowering | empowering +20 % | weapon | ganze Phase oder Rotation |
| Banner Shield (Weapons of Light) | empowering | empowering +25 % | weapon | ganze Phase oder Rotation |
| Lumina (Blessing of the Sky) | empowering | empowering +35 % | weapon | 11 s |
| Weaken | debuff | debuff +15 % | weapon, grenade, melee, super | ganze Phase oder Rotation |
| Divinity | debuff | debuff +15 % | weapon, grenade, melee, super | ganze Phase oder Rotation |
| Tractor Cannon | debuff | debuff +30 % | weapon, grenade, melee, super | 10 s |
| Moebius Tether | debuff | debuff +30 % | weapon, grenade, melee, super | 6 s |
| Deadfall Tether | debuff | debuff +35 % | weapon, grenade, melee, super | 12 s |
| Solar Surge 2x | surge | surge +17 % | weapon | ganze Phase oder Rotation |
| Solar Surge 3x | surge | surge +22 % | weapon | ganze Phase oder Rotation |
| Solar Surge 4x | surge | surge +25 % | weapon | ganze Phase oder Rotation |
| Weapons stat 200 (power weapons against bosses) | amplification | amplification +10 % | weapon | ganze Phase oder Rotation |
| Elemental Overdrive (solar pickup) | amplification | amplification +22 % | weapon | 7 s |
| Particle Reconstruction | –, debuff | Timing: noReload; debuff +27.6 % | weapon | ganze Phase oder Rotation |
| Ember of Ashes | – | scorch ×1.5 | weapon | ganze Phase oder Rotation |
