# Energie-Import

Generiert von `npm run build:energy` (`scripts/lib/energy.ts`). Nicht von Hand ändern.

Cooldowns: 88 von 88 Abilities.
Compendium-Zeilen zu Energie: 220, übernommen 22, übersprungen 198, offen 0.

| Quelle | Reiter | Item | Zeile | Urteil | Ziel oder Grund |
| --- | --- | --- | --- | --- | --- |
| armor | warlock | Apotheosis Veil | Grants 66% Fixed Bonus Grenade and Melee Ability Energy per second for 8 seconds. | skipped | Trigger am Ende der Super fehlt; übernommen ist der Cast |
| armor | hunter | Balance of Power | 0.5x Class Ability Regeneration Speed for 19 seconds upon Class Ability usage. | skipped | Class Ability nicht modelliert |
| armor | warlock | Ballidorse Wrathweavers | Grants 2% Super Energy per ally that receives Frost Armor through Frostpulse. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | hunter | Blight Ranger | Deactivation refunds up to 75% of unspent Super Energy at 100% Super Energy, down to 50% of unspent Super Energy at 0% Super Energy. | skipped | verlängert die laufende Super, keine neue |
| armor | titan | An Insurmountable Skullfort | Grants 100% Melee Ability Energy and begins Health Regeneration. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | titan | An Insurmountable Skullfort | 50% Melee Ability Energy on Powered Melee Hit. | imported | an-insurmountable-skullfort-hit |
| armor | titan | An Insurmountable Skullfort | 15% Melee Ability Energy on Non-Glaive Melee Hit while Knockout is active. | skipped | nur der höchste Wert (Powered Melee Hit) zählt, „up to once per melee“ |
| armor | titan | An Insurmountable Skullfort | 5% Melee Ability Energy on Basic/Glaive Melee Hit. | skipped | nur der höchste Wert (Powered Melee Hit) zählt, „up to once per melee“ |
| armor | titan | Antaeus Wards | Drains 2% Class Ability Energy per 1 damage reflected. | skipped | Verbrauch, kein Gewinn |
| armor | hunter | Caliban's Hand | 625%? Additional Base Melee Recharge Rate while Proximity Knife remains unexploded. | skipped | Proximity Knife und Scorch-Ticks pro Melee nicht modelliert |
| armor | hunter | Caliban's Hand | Scorch grants 7% [?%] Melee Ability Energy per tick. | skipped | Proximity Knife und Scorch-Ticks pro Melee nicht modelliert |
| armor | titan | Arbor Warden | Overwrites Barricade Cooldown to pre-EoF versions, resulting in ~1.45x Class Ability Regeneration Speed. | skipped | Class Ability nicht modelliert |
| armor | hunter | Celestial Nighthawk | Refunds 33% Super Energy | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | titan | Armamentarium | Passively grants a copy of Firepower and an extra Grenade Ability Charge. | imported | armamentarium-charge |
| armor | titan | Armamentarium | Weapon Kills grant 10% Grenade Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | Claws of Ahamkara | Grants an extra Melee Ability Charge. | imported | claws-of-ahamkara-charge |
| armor | warlock | Contraverse Hold | Chaotic Exchange grants Additional Base Grenade Regeneration Rate. | skipped | Chaotic Exchange (Charged Grenade halten) nicht modelliert |
| armor | warlock | Contraverse Hold | Axion: 5000% [4000%] Additional Base Grenade Regeneration Rate. | skipped | Chaotic Exchange (Charged Grenade halten) nicht modelliert |
| armor | warlock | Contraverse Hold | Scatter: 3700% [2700%] Additional Base Grenade Regeneration Rate. | skipped | Chaotic Exchange (Charged Grenade halten) nicht modelliert |
| armor | warlock | Contraverse Hold | Vortex: 3400% [2400%] Additional Base Grenade Regeneration Rate. | skipped | Chaotic Exchange (Charged Grenade halten) nicht modelliert |
| armor | warlock | Contraverse Hold | HHSN: 2500%? [2000%] Additional Base Grenade Regeneration Rate. | skipped | Chaotic Exchange (Charged Grenade halten) nicht modelliert |
| armor | warlock | Crown of Tempests | 168% \| 335% \| 503% Additional Base Grenade, Melee, and Super Regeneration Rate. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Dawn Chorus | Each enemy damaged by an ignition grants 40% Melee Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | hunter | Fr0st-EE5 | 2x Grenade and Melee Regeneration Speed \| 100% Additional Base Grenade/Melee Regeneration Rate | skipped | Bedingung außerhalb des Boss-Kampfs (Sprint, Gruppe, Aufheben) |
| armor | hunter | Fr0st-EE5 | 100% [200%] Additional Base Class Ability Regeneration Rate. | skipped | Class Ability nicht modelliert |
| armor | titan | Crest of Alpha Lupi | Super Abilities generate an extra Orb of Power that grants 7.14% Super Energy. | skipped | Orbs entstehen nur aus Kills |
| armor | titan | Crest of Alpha Lupi | Ward of Dawn generates a total of 4 Orbs, each granting 3.57% Super Energy, for a total of 14.3% Super Energy. | skipped | Orbs entstehen nur aus Kills |
| armor | hunter | Graviton Forfeit | x1 = 166.6% Additional Base Grenade and Melee, and 67% Class Ability Regeneration Rate. | skipped | Unsichtbarkeit nicht modelliert |
| armor | hunter | Graviton Forfeit | x2 = 333.3% Additional Base Grenade and Melee, and 134% Class Ability Regeneration Rate. | skipped | Unsichtbarkeit nicht modelliert |
| armor | hunter | Graviton Forfeit | x3 = 500% Additional Base Grenade and Melee, and 200% Class Ability Regeneration Rate. | skipped | Unsichtbarkeit nicht modelliert |
| armor | titan | Doom Fang Pauldron | Grants 20% [10%] Super Energy. Can only trigger once per Melee Activation. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | titan | Doom Fang Pauldron | Sentinel Shield's Shield Throw Hits grant 10% Super Energy, extending Super Duration. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | warlock | Eye of Another World | Passively grants 45% Additional Base Grenade, Melee, and Class Regeneration Rate, and +15 Airborne Effectiveness. | imported | eye-of-another-world-regen |
| armor | warlock | Fallen Sunstar | Ionic Traces move 66% faster and grant increased Ability Energy. | skipped | Ionic Traces ohne Wert |
| armor | warlock | Fallen Sunstar | Allies within 15 metres receive 10% Grenade, Melee, and Class Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | hunter | Gyrfalcon's Hauberk | 500% Additional Base Class Ability Regeneration Rate until Class Ability Usage. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | titan | Hallowfire Heart | Up to 250% Additional Base Grenade and Class Ability Regeneration Rate. | skipped | Werte unter dem Maximum fehlen („?%“), Bedingung Super geladen |
| armor | titan | Hallowfire Heart | ?% \| ?% \| ?% \| ?% \| ?% \| ?% \| ?% \| ?% \| ?% \| 250% Additional Base Grenade/Class Regeneration Rate. | skipped | Werte unter dem Maximum fehlen („?%“), Bedingung Super geladen |
| armor | warlock | Geomag Stabilizers | +4% Chaos Reach Super Ability Energy. | skipped | verlängert die laufende Super, keine neue |
| armor | warlock | Geomag Stabilizers | Chaos Reach grants 10% Super Ability Energy on hit. | skipped | verlängert die laufende Super, keine neue |
| armor | hunter | Khepri's Sting | Grants 30% Void Melee Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | Getaway Artist | Arc Soul Hits grant 5% Grenade Energy up to once per burst. | skipped | Arc Soul nicht modelliert |
| armor | titan | Heart of Inmost Light | x1 = 400% [100%] \| x2 = 800% [200%] Additional Base Grenade and Melee Regeneration Rate. | imported | heart-of-inmost-light-melee |
| armor | titan | Heart of Inmost Light | x1 = 25% \| x2 = 50% Additional Base Class Ability Regeneration Rate. | skipped | Class Ability nicht modelliert |
| armor | hunter | Lucky Raspberry | Grants 15% Arcbolt Grenade Ability Energy. | imported | lucky-raspberry-jolt |
| armor | hunter | Lucky Raspberry | Grants 7.5% Arcbolt Grenade Ability Energy. | skipped | Chain-Schaden braucht ein zweites Ziel |
| armor | hunter | Mask of Bakris | Weapon Kills grant 60% Class Ability Energy while active. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | titan | Khepri's Horn | Solar Kills grant 15% Class Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | hunter | Mask of Fealty | Grants 7.5% Fixed Melee Ability Energy. | imported | mask-of-fealty-hit |
| armor | warlock | Nezarec's Sin | 300% Additional Base Grenade and Melee Regeneration Rate. | skipped | Auslöser ist ein Kill |
| armor | warlock | Nezarec's Sin | 200% Additional Base Class and Super Regeneration Rate. | skipped | Auslöser ist ein Kill |
| armor | warlock | Nothing Manacles | Grants an extra Scatter Grenade Ability Charge. | imported | nothing-manacles-charge |
| armor | hunter | Moirai | Catching a Threaded Spike that doesn't hit a Tangle refunds an additional 25% Melee Ability Energy, unaffected by Melee Stat. | skipped | Ability oder Item nicht im Modell |
| armor | titan | Mask of the Quiet One | Grants 5% Grenade, Melee, and Class Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | titan | Melas Panoplia | Initially activating Forge Master grants 11.7% Fixed Melee Energy for 8 seconds. | skipped | Forge Master nicht modelliert |
| armor | warlock | Osmiomancy Gloves | Grants an extra Coldsnap Grenade Ability Charge. | skipped | Ability oder Item nicht im Modell |
| armor | warlock | Phoenix Protocol | While inside your Well of Radiance, while under 50% Super Energy, and if your Super Ability is Well of Radiance: | skipped | Auslöser ist ein Kill |
| armor | warlock | Phoenix Protocol | Grants 10% Super Energy per kill. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | Phoenix Protocol | Amount of Super Energy gained is decreased by 1.5% for each successive kill, down to a minimum of 4% Super Energy per kill. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | hunter | Omnioculus | Grants an extra Smoke Bomb Melee Ability Charge. | skipped | Ability oder Item nicht im Modell |
| armor | hunter | Omnioculus | Grants 50% Melee Ability Energy per ally made invisible, up to 200% with 4 allies. | skipped | Ability oder Item nicht im Modell |
| armor | hunter | Ophidia Spathe | Grants an extra Melee Charge to Solar Melee Abilities. | imported | ophidia-spathe-charge |
| armor | hunter | Orpheus Rig | Grants 10% Grenade, Melee, and Class Ability Energy. | skipped | Treffer auf mehrere Gegner (Tethers) nicht modelliert |
| armor | hunter | Orpheus Rig | Refunds X% Super Energy, up to a maximum of 50% Super Energy. | skipped | Treffer auf mehrere Gegner (Tethers) nicht modelliert |
| armor | hunter | Raiju's Harness | Refunds up to a maximum of 50% Super Energy. | skipped | Werte fehlen („?%“) |
| armor | titan | Peregrine Greaves | Champions, Tormentors, and Minibosses instead take 550% Increased Impact Damage and grant 100% Fixed Melee Ability Energy on hit. | skipped | Champions, Tormentors und Minibosses, nicht Bosse |
| armor | warlock | Secant Filaments | Kills grant 10% Class Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | hunter | Radiant Dance Machines | Grants an additional Class Ability Charge, up to a maximum of 2 additional Class Ability Charges. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | Skull of Dire Ahamkara | Nova Bomb Kills refund 5?% Super Energy, up to 50% Super Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | titan | Point-Contact Cannon Brace | Thunderclap and Lightning Strike Kills refund up to 50% Melee Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | Speaker's Sight | Spawns an Orb of Power that grants 2.5% Super Energy on the ally's position. | skipped | Orbs entstehen nur aus Kills |
| armor | warlock | Starfire Protocol | Grants an extra Fusion Grenade Ability Charge. | imported | starfire-protocol-charge |
| armor | warlock | Starfire Protocol | Passively grants 20% Additional Base Fusion Grenade Regeneration Rate | imported | starfire-protocol-regen |
| armor | warlock | Starfire Protocol | 5% Fusion Grenade Ability Energy per Weapon Hit up to once every 0.4 seconds. | imported | starfire-protocol-weapon-hit |
| armor | warlock | Starfire Protocol | 15% Fusion Grenade Ability Energy on Weapon Kill. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | Starfire Protocol | Grants 100% Class Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | hunter | Shards of Galanor | Solar Melee Ability Kills grant 2.5% to 5% Blade Barrage Super Energy, depending on Enemy Rank. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | hunter | Shards of Galanor | Blade Barrage Hits and Kills refund up to 50% Super Energy. Refund is unaffected by Super Stat. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | warlock | The Stag | Dearly Departed grants 50% [25%] Class Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | hunter | Shinobu's Vow | Grants an extra Skip Grenade Charge. | imported | shinobus-vow-charge |
| armor | hunter | Shinobu's Vow | Skip Grenades hits grant 4.2% [1.4%] Grenade Ability Energy and x1 Bolt Charge. | imported | shinobus-vow-skip-hit |
| armor | hunter | Shinobu's Vow | Grants ~40% Grenade Ability Energy. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Stormdancer's Brace | Refunds up to 30% Stormdancer Super Energy based on the amount of Enemy Kills. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| armor | hunter | The Sixth Coyote | Grants an extra Class Ability Charge. | skipped | Class Ability nicht modelliert |
| armor | titan | Second Chance | Grants an additional Shield Throw Melee Ability Charge. | imported | second-chance-charge |
| armor | titan | Second Chance | Grants 11.25% Shield Throw Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | warlock | Sunbracers | Sunbracers grants 20,000% Additional Base "Solar Grenade" Grenade Regeneration Rate. | skipped | Auslöser ist ein Kill |
| armor | hunter | Speedloader Slacks | Scoring direct hits within 3 seconds of each while Tight Fit is active progresses a Counter System that grants 20% Class Ability Energy upon reaching 100%. | skipped | Class Ability nicht modelliert |
| armor | hunter | Star-Eater Scales | Orbs of Power grant an additional 2% Super Energy. | skipped | Orbs entstehen nur aus Kills |
| armor | warlock | Verity's Brow | x1 \| 40% [20%] increased Grenade Damage, ?% Increased Grapple Melee Damage, and +0.5% Bonus Grenade Energy/s for 8 seconds. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Verity's Brow | x2 \| 55% [40%] increased Grenade Damage, ?% Increased Grapple Melee Damage, and +1% Bonus Grenade Energy/s for 7 seconds. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Verity's Brow | x3 \| 70% [60%] increased Grenade Damage, ?% Increased Grapple Melee Damage, and +1.5% Bonus Grenade Energy/s for 6 seconds. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Verity's Brow | x4 \| 85% [80%] increased Grenade Damage, ?% Increased Grapple Melee Damage, and +2% Bonus Grenade Energy/s for 5 seconds. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Verity's Brow | x5 \| 100% increased Grenade Damage, 170% Increased Grapple Melee Damage, and +2.5% Bonus Grenade Energy/s for 4 seconds. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | warlock | Verity's Brow | Feel The Flame grants 10x Grenade Regeneration Speed. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| armor | titan | Ursa Furiosa | Converts guarded damage into Super Energy after Super ends, up to 50% Super Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| armor | titan | Ursa Furiosa | Unbreakable grants up to 60% Grenade Ability Energy once it ends. | skipped | Unbreakable nicht modelliert |
| armor | titan | Ursa Furiosa | Scales from 15% Grenade Energy, up to 60% Grenade Energy after maxing out Unbreakable. | skipped | Unbreakable nicht modelliert |
| armor | warlock | Vesper of Radius | Grants Additional Base Class Ability Regeneration Rate, scaling with enemy amount. | skipped | Class Ability nicht modelliert |
| armor | titan | Wishful Ignorance | Grants an additional Frenzied Blade Melee Ability Charge. | imported | wishful-ignorance-charge |
| armor | titan | Wishful Ignorance | Banner of War's Pulses grant 5% Frenzied Blade Melee Ability Energy per ally within 10 meters. | skipped | Bedingung außerhalb des Boss-Kampfs (Sprint, Gruppe, Aufheben) |
| armor | hunter | Young Ahamkara's Spine | Grenade and Melee Ability Hits grant 30% [7%] Tripmine Grenade Ability Energy. | imported | young-ahamkaras-spine-hit |
| armor | hunter | Young Ahamkara's Spine | Crackshot Hits each grant 10% [?%] Tripmine Grenade Ability Energy. | skipped | Crackshot nicht modelliert |
| armor | warlock | Winter's Guile | 400% increased Melee Damage, 0.8x Melee Duration, and 38.4x👀 Melee Regeneration Speed for 10 seconds. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| abilities | Arc, Glossary | Bolt Charge | Gaining a Bolt Charge stack grants 2.5% Melee Ability Energy per Bolt Charge stack obtained, generally granting 25% Melee Ability Energy over the 10 stacks need | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| abilities | Arc, Glossary | Bolt Charge | Acquiring over x10 stacks through abilities will still grant the corresponding Ability Gains (For example, being at x9 and acquiring x4 will still grant 10% Mel | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| abilities | Arc, Glossary | Ionic Trace | Grants 11.25% Grenade, and Melee Ability Energy, and 13.5% Class Ability Energy on pickup. Allies do not receive Ionic Traces created by the user. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| abilities | Arc, Fragments | Amplitude | Scoring 2 kills within 4 seconds of each creates an Orb of Power that grants 2.5% Super Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Arc, Fragments | Focus | 150% [75%] Additional Base Class Ability Regeneration Rate. | skipped | Class Ability nicht modelliert |
| abilities | Arc, Fragments | Recharge | 400% [200%] Additional Base Grenade and Melee Ability Regeneration Rate. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| abilities | Arc, Grenade Abilities | Touch of Thunder | Grants an additional Grenade Ability Charge. | skipped | Ability oder Item nicht im Modell |
| abilities | Arc, Super Abilities | Arc Staff | Aerial and Grounded Light Attack \| Drains 2.5% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Super Abilities | Arc Staff | Grounded Heavy Attack \| Drains 8% Super Energy | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Super Abilities | Arc Staff | Airborne Heavy Attack \| Drains 8%? Super Energy | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Aspect | Flow State | 200% Additional Base Class Ability Regeneration Rate, +50 Reload Speed, and 0.8x Reload Duration Multiplier. | skipped | Class Ability nicht modelliert |
| abilities | Arc, Melee Abilities | Ballistic Slam | Grants 3% Super Energy and x3 Bolt Charge per enemy hit. | imported | ballistic-slam-super |
| abilities | Arc, Melee Abilities | Seismic Strike | Requires sprinting for 1.25 seconds. Drains 15% Melee Ability Energy if no enemy is hit. Unable to use during slide if user shoots. | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Super Abilities | Fists of Havoc | Light Attack \| Drains 6% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Super Abilities | Fists of Havoc | Heavy Attack \| Drains 12% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Aspect | Touch of Thunder | Lightning: Grants an additional Grenade Charge, lightning strikes after the first inflict jolt, and hits grant x5 Bolt Charge up to once per lightning bolt. | skipped | Ability oder Item nicht im Modell |
| abilities | Arc, Super Abilities | Chaos Reach | Partially refunds Super Energy on early deactivation, up to a maximum of 30% Super Energy if immediately cancelled. | skipped | verlängert die laufende Super, keine neue |
| abilities | Arc, Super Abilities | Stormtrance | Performs an Ionic Blink, consuming 6.25% Super Energy and teleporting up to 7 meters away towards the currently input movement direction. | skipped | Verbrauch, kein Gewinn |
| abilities | Arc, Aspect | Arc Soul | Grants Additional Base Class Ability Regeneration Rate while within 15? metres of allies. | skipped | Class Ability nicht modelliert |
| abilities | Solar, Glossary | Firesprite | Grants 11.25% Grenade Ability Energy on Pickup. Allies do not receive Firesprites created by the user. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| abilities | Solar, Fragments | Benevolence | 300% Additional Base Grenade, Melee, and Class Ability Regeneration Rate for 7 [4] seconds. | skipped | Heilen von Verbündeten nicht modelliert |
| abilities | Solar, Fragments | Singeing | 400% Additional Base Class Ability Regeneration Rate for 3 seconds upon inflicting Scorch to enemies. | skipped | Class Ability nicht modelliert |
| abilities | Solar, Fragments | Wonder | Killing 2 enemies within ? seconds of each with Ignitions creates an Orb of Power that grants 2.5% Super Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Solar, Super Abilities | Golden Gun: Deadshot | Initially refunds ~80% Super Energy per kill, decreasing by ~10% per kill, down to a minimum of ~12% Super Energy per kill. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Solar, Super Abilities | Golden Gun: Marksman | Non-Boss Combatants = 3.57% Super Energy \| Boss Combatants = 2.85% Super Energy \| Boss + Star-Eater Scales = 2.5% Super Energy | skipped | Orbs entstehen nur aus Kills |
| abilities | Solar, Melee Abilities | Hammer Strike | Requires sprinting for 1.25 seconds. Drains 15% Melee Ability Energy if no enemy is hit. Unable to use during slide if user shoots. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Melee Abilities | Throwing Hammer | Hammer is able to be picked up again from the ground, granting 121.5% Melee Ability Energy. | skipped | Bedingung außerhalb des Boss-Kampfs (Sprint, Gruppe, Aufheben) |
| abilities | Solar, Super Abilities | Burning Maul | Light Attack \| Drains 4% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Burning Maul | Heavy Attack \| Drains 8% Super Energy | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Hammer of Sol | Light Attack \| Drains 12% Super Energy | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Hammer of Sol | Light Attacks drain 7.5% Super Energy and the delay between Hammer Throws is reduced to 1 second. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Hammer of Sol | Light Attacks drain 8.2% Super Energy and the delay between Hammer Throws is reduced to 1 second. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Hammer of Sol (Sol Invictus Aspect) | Light Attack \| Drains 9% Super Energy | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Hammer of Sol (Sol Invictus Aspect) | Light Attacks drain 5.5% Super Energy and the delay between Hammer Throws is reduced to 1 second. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Aspects | Consecration | Only consumes 50% Melee Ability Energy if the slam is not activated. Unable to use during slide if user shoots. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Aspects | Shieldburst | Dealing damage grants additional progress, at a rate of ~100 damage per 1 second charged. | skipped | Stapel oder Zähler, Aufbau nicht modelliert |
| abilities | Solar, Aspects | Sol Invictus | Sol Invictus grant 100% Additional Base Grenade and Melee Regeneration Rate, and 40% Decreased Passive Super Drain. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Song of Flame | Allies within 15 metres are granted 30% [?%] Damage Resist, Scorching Rounds, and 15% Fixed Bonus Grenade, Melee, and Class Ability Energy per second. | skipped | verlängert die laufende Super, keine neue |
| abilities | Solar, Super Abilities | Song of Flame | Grenade Ability: Drains 4.8% Super Energy, and has a 2 second cooldown between usages. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Song of Flame | Melee Ability: Drains 2.4% Super Energy, and has a 1.75 second cooldown between usages. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Song of Flame | Class Ability: Drains 6% Super Energy, and has a 2.85 second cooldown between usages. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Daybreak | Light Attack \| Drains 6.5% Super Energy to launch a Daybreak Projectile. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Daybreak | Allows the usage of an enhanced Icarus Dash without cooldown that drains 4.2% Super Energy per usage. | skipped | Verbrauch, kein Gewinn |
| abilities | Solar, Super Abilities | Well of Radiance | Creates 3 Orbs of Power, each granting 3.6% Super Energy. | skipped | Orbs entstehen nur aus Kills |
| abilities | Solar, Aspects | Icarus Dash | Gains an additional charge, and recharges both charges simultaneously, but increases cooldown to 5 seconds. | skipped | Class Ability nicht modelliert |
| abilities | Void, Glossary | Void Breach | Grants 11.25% Class Ability Energy on Pickup. Allies do not receive Void Breaches created by the user. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| abilities | Void, Fragments | Harvest | Killing Weakened Enemies creates an Orb of Power that grants 2.5% Super Energy and a Void Breach. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Void, Fragments | Provision | 3% Melee Energy: Scatter, Spike, Voidwall, Vortex | skipped | Grenade halten nicht modelliert |
| abilities | Void, Fragments | Provision | 8% Melee Energy: Axion, Handheld Supernova, Magnetic, Suppressor | skipped | Grenade halten nicht modelliert |
| abilities | Void, Grenade Abilities | Handheld Supernova Chaos Accelerant | Passively grants 1.154x Grenade Regeneration Speed. | skipped | Handheld Supernova nicht modelliert |
| abilities | Void, Melee Abilities | Phantom Surge | Scoring a kill grants an additional +45 Void Overshield and refunds 60% Melee Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Void, Super Abilities | Spectral Blades | Allows unlimited Trapper's Ambush usage, at the cost of 15%? Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Melee Abilities | Shield Bash | Requires sprinting for 1.25 seconds. Drains 15% Melee Ability Energy if no enemy is hit. Unable to use during slide if user shoots. | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Super Abilities | Sentinel Shield | Light Attack \| Drains 4.5% Super Energy per Attack. The Final Hit in the combo drains 2% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Super Abilities | Ward of Dawn | Grants 1 Grenade Ability Charge and creates 3 Orbs of Power that each grant 2.3% Super Energy on Super Cast. | skipped | Orbs entstehen nur aus Kills |
| abilities | Void, Aspects | Offensive Bulwark | Kills grant 9% Grenade and 9% Melee Ability Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Void, Aspects | Unbreakable | Generates 10 Void Overshield HP/s that lasts 5+2.5 seconds while draining 7.5% Grenade Energy/s. | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Aspects | Unbreakable | Guarding against any damage spawns an Orb of Power that grants 2.5% Super Energy to allies. | skipped | Orbs entstehen nur aus Kills |
| abilities | Void, Aspects | Unbreakable | Releasing [Grenade] or running out of Grenade Energy releases a frontal blast, consuming 50% Grenade Energy and dealing damage up to 11 meters away. | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Super Abilities | Nova Warp | Drains 5% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Super Abilities | Nova Warp | Performs a Dark Blink, draining 3.5% Super Energy to rapidly accelerate towards the currently input direction and release 4 Weakening Seekers, one in each cardi | skipped | Verbrauch, kein Gewinn |
| abilities | Void, Aspects | Chaos Accelerant | Grants an extra Grenade Ability Charge. | imported | chaos-accelerant-charge |
| abilities | Void, Aspects | Chaos Accelerant | Magnetic, Spike, Suppressor, and Voidwall: Releases a short-range Void Blast that inflicts Volatile. Passively grants 1.15x Grenade Regeneration Speed. | imported | chaos-accelerant-regen |
| abilities | Void, Aspects | Child of the Old Gods | Healing Rift: Grants 4% Grenade and Melee Energy every 1.4 seconds. | skipped | Healing Rift nicht modelliert |
| abilities | Stasis, Glossary | Stasis Shard | Small Stasis Shards grant 10% Melee Energy, and Large Stasis Shards grant 50% Melee Energy. | skipped | Stasis Shards nicht modelliert |
| abilities | Stasis, Fragments | Bonds | Killing Frozen Enemies creates an Orb of Power that grants 2.5% Super Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Stasis, Fragments | Hunger | Stasis Shards grant 60% increased Melee Energy. | skipped | Stasis Shards nicht modelliert |
| abilities | Stasis, Fragments | Shards | Grants 500% [150%] Additional Base Grenade Regeneration Rate for 6 seconds, up to a maximum of 11 seconds. | skipped | Stasis Crystals nicht modelliert |
| abilities | Stasis, Fragments | Torment | Grants 7% Grenade Ability Energy. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| abilities | Stasis, Fragments | Torment | Increased to 12% Grenade Ability Energy while Frost Armor is active. | skipped | Schaden nehmen gehört nicht zur Spielweise |
| abilities | Stasis, Aspect | Touch of Winter | Shatter Grenades release 9 additional Shrapnel and refund ~30% Grenade Ability Energy upon directly hitting a Frozen Enemy. | skipped | Bosse lassen sich nicht einfrieren |
| abilities | Stasis, Aspect | Winter's Shroud | Grants 300% [150%] Additional Base Class Ability Regeneration Rate for 3 seconds. | skipped | Class Ability nicht modelliert |
| abilities | Stasis, Melee Abilities | Shiver Strike | Failing to score a hit will refund 80% [40%] Melee Ability Energy. | skipped | nur wenn kein Treffer |
| abilities | Stasis, Super Abilities | Glacial Quake | Scoring a kill through any means while Glacial Quake is active spawn an Orbs of Power, each granting 7.15% Ability Energy up to 7 times per Super Cast. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Stasis, Super Abilities | Glacial Quake | Light Attack \| Drains 7.45% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Stasis, Super Abilities | Glacial Quake | Heavy Attack \| Drains 7.45% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Stasis, Super Abilities | Glacial Quake | Howl of The Storm (Glacial Howl) \| Drains 15% Super Energy (Up to x5 per Cast). | skipped | Verbrauch, kein Gewinn |
| abilities | Stasis, Aspect | Howl of the Storm | Grants an additional Melee Ability Charge. | skipped | Ability oder Item nicht im Modell |
| abilities | Stasis, Super Abilities | Winter's Wrath | Light Attack \| Drains 4.5% Super Energy per twin-shards. | skipped | Verbrauch, kein Gewinn |
| abilities | Stasis, Aspect | Frostpulse | Grants 11% Class Ability Energy upon freezing an enemy. | skipped | Class Ability nicht modelliert |
| abilities | Strand, Fragments | Wisdom | Killing Suspended Enemies creates an Orb of Power that grants 2.5% Super Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Strand, Grenade Abilities | Grapple | Cancelling a Grapple within 1 second of activation refunds 50% Grenade Energy. | skipped | Ability oder Item nicht im Modell |
| abilities | Strand, Grenade Abilities | Grapple | Ashes to Assets grants 50% less Super Energy when a Grapple Melee is used with a Grapple Tangle. | skipped | Ability oder Item nicht im Modell |
| abilities | Strand, Super Abilities | Silkstrike | Drains 4% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Super Abilities | Silkstrike | Drains 9% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Super Abilities | Silkstrike | Drains 4.5% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Super Abilities | Silkstrike | Allows the repeated usage of Ensnaring Slam while the Aspect is equipped at the cost of 4.5% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Aspect | Threaded Specter | Passively applies 0.6x Class Ability Regeneration Speed while equipped. | skipped | Class Ability nicht modelliert |
| abilities | Strand, Aspect | Widow's Silk | Grants an additional Grenade Ability Charge. | skipped | Ability oder Item nicht im Modell |
| abilities | Strand, Melee Abilities | Frenzied Blade | 0 Charges = 1.15x Regeneration Speed \| 1 Charge = 1.55x Regeneration Speed \| 2 Charges = 1.95x Regeneration Speed. | skipped | eingebaute Ladungen der Ability nicht modelliert |
| abilities | Strand, Melee Abilities | Frenzied Blade | On Prismatic: Penalized with an additional 0.7x Regeneration Speed | skipped | eingebaute Ladungen der Ability nicht modelliert |
| abilities | Strand, Super Abilities | Bladefury | Drains 3% Super Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Super Abilities | Bladefury | Drains 10.5% Super Energy. Incurs a 3 second cooldown after usage. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Aspect | Flechette Storm | [Melee Ability] leaps into the air, draining 50% Melee Energy, knocking enemies within ? metres back, and dealing 135 [66] damage. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Aspect | Flechette Storm | [Melee Ability] drains 50% Melee Energy to launch a cluster of 4 Unraveling Projectiles, each dealing 171 [25.2] damage to enemies within ? metres. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Aspect | Into The Fray | 300% [200%] Additional Base Melee Regeneration Rate. | skipped | Woven Mail als Bedingung nicht modelliert |
| abilities | Strand, Melee Abilities | Arcane Needle | 0 Charges = 1.16x Regeneration Speed \| 1 Charge = 1.64x Regeneration Speed \| 2 Charges = 2.6x Regeneration Speed | skipped | eingebaute Ladungen der Ability nicht modelliert |
| abilities | Strand, Melee Abilities | Arcane Needle | On Prismatic: Penalized with an additional 0.7x Regeneration Speed | skipped | eingebaute Ladungen der Ability nicht modelliert |
| abilities | Strand, Aspect | Weaver's Call | Threadling damage instances grant 10% Class Ability Energy. | skipped | Class Ability nicht modelliert |
| abilities | Strand, Aspect | Weavewalk | [Air Move] grants Weavewalk and instantly consumes 20% Melee Ability Energy. | skipped | Verbrauch, kein Gewinn |
| abilities | Strand, Aspect | Weavewalk | Drains 25% Melee Ability Energy per second. | skipped | Verbrauch, kein Gewinn |
| abilities | Prismatic, Glossary | Transcendence | Grants 5% Increased Weapon Damage, an additional 10% Grenade and Melee Regeneration Speed, and 20% [5%] Damage Resist for 20 seconds. | skipped | Transcendence nicht modelliert |
| abilities | Prismatic, Glossary | Transcendence | Dealing Grenade Ability Damage while Transcendent increases the Melee Regeneration Speed to 35% Fixed Melee Ability Energy per second for 2 seconds. | skipped | Transcendence nicht modelliert |
| abilities | Prismatic, Glossary | Transcendence | Dealing Melee Ability Damage while Transcendent increases the Prismatic Grenade Regeneration Speed to 35% Prismatic Grenade Ability Energy per second for 2 seco | skipped | Transcendence nicht modelliert |
| abilities | Prismatic, Fragments | Balance | Killing 3 enemies within 3 seconds of each with Light Damage grants 10% Melee Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Prismatic, Fragments | Balance | Killing 3 enemies within 3 seconds of each with Dark Damage grants 10% Grenade Energy. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Prismatic, Fragments | Generosity | Kills while Transcendent progress a counter that spawns Orbs of Power that grant 7.15% Super Energy for allies at specific thresholds. | skipped | Kills: ein Boss, keine Adds (ADR 0015) |
| abilities | Prismatic, Fragments | Hope | Grants Additional Base Class Ability Regeneration Rate based on the amount of active Elemental Buffs. | skipped | Class Ability nicht modelliert |
| abilities | Prismatic, Aspects | Winter's Shroud | Grants 300% [150%] Additional Base Class Ability Regeneration Rate for 3 seconds. | skipped | Class Ability nicht modelliert |
| abilities | Prismatic, Aspects | Threaded Specter | Passively applies 0.6x Class Ability Regeneration Speed while equipped unless Acrobat's Dodge is equipped. | skipped | Class Ability nicht modelliert |
| abilities | Prismatic, Aspects | Consecration | Only consumes 50% Melee Ability Energy if the slam is not activated. Unable to use during slide if user shoots. | skipped | Verbrauch, kein Gewinn |
| abilities | Prismatic, Aspects | Unbreakable | Generates 10 Void Overshield HP/s that lasts 5+2.5 seconds while draining 7.5% Grenade Energy/s. | skipped | Verbrauch, kein Gewinn |
| abilities | Prismatic, Aspects | Unbreakable | Releasing [Grenade] or running out of Grenade Energy releases a frontal blast, consuming 50% Grenade Energy and dealing damage up to 11 meters away. | skipped | Verbrauch, kein Gewinn |
| abilities | Prismatic, Aspects | Weaver's Call | Threadling damage instances grant 10% Class Ability Energy. | skipped | Class Ability nicht modelliert |
| abilities | Class Abilities,  | Gambler's Dodge | Performs a deft tumble that grants 1% [0.35%] Melee Ability Energy per Melee Stat, up to 100% [35%] Melee Ability Energy at 100 Melee Stat. | imported | gamblers-dodge-melee |
| abilities | Class Abilities,  | Empowering Rift | Rift grants 20% [15%] increased damage, 260% [104%] Additional Base Grenade and Melee, and 230% [92%] Additional Base Class Regeneration Rate in a 5 meter radiu | imported | empowering-rift-regen |
