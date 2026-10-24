# Gesamtprobe nach Regel (generiert)

Erzeugt mit `npm run probe` (`tests/metaProbeAuto.test.ts`, Regel in `tests/lib/probeAuto.ts`). Alle Aegis-Zeilen mit exotischer Waffe (Tab Sustained) oder Super (Tab Swap). Bezug ist der Median der handgebauten Zeilen (`docs/meta-probe.md`): 1.000. Grenze ±15 %.

Vollständig abgebildet (geprüft): 23, davon innerhalb der Grenze 20. Abweichungen stehen mit Grund in `tests/fixtures/meta-probe-auto.json` und blockieren nichts. Mit Annahme ohne Schalter (nur berichtet): 104, davon innerhalb der Grenze 33. Nicht vergleichbar (übersprungen): 44.

## Vollständig abgebildet

| Aegis-Zeile | Aegis | Modell | relativ | Grund der Abweichung |
| --- | ---: | ---: | ---: | --- |
| Tractor Cannon | 22,149 | 18,458 | 0.833 | -17 %; cause not examined |
| Telesto | 44,529 | 37,498 | 0.842 | -16 %; cause not examined (Weapons stat 200 of Aegis divided out, special weapon) |
| One Thousand Voices, Ember of Ashes, catalyst, Dawn Chorus, Particle Reconstruction | 120,613 | 105,112 | 0.871 |  |
| Arbalest | 51,161 | 48,836 | 0.955 |  |
| The Colony | 49,096 | 47,133 | 0.960 |  |
| Gathering Storm, Feast of Light x6, Limit Break | 21,772 | 21,203 | 0.974 |  |
| Blade Barrage, Knock 'Em Down, Feast of Light x6, Limit Break | 41,594 | 41,001 | 0.986 |  |
| Merciless | 47,437 | 47,434 | 1.000 |  |
| Blade Barrage, Knock 'Em Down, Shards of Galanor, Limit Break | 43,637 | 43,637 | 1.000 |  |
| Heir Apparent | 58,096 | 58,096 | 1.000 |  |
| Jötunn | 53,870 | 53,869 | 1.000 |  |
| Ice Breaker, Sniper's Meditation | 30,124 | 30,124 | 1.000 |  |
| Service of Luzaku | 110,752 | 110,752 | 1.000 |  |
| Forerunner | 44,651 | 44,652 | 1.000 |  |
| Nova Bomb - Cataclysm, Facet of Courage, Limit Break | 19,260 | 19,261 | 1.000 |  |
| Twilight Arsenal, Facet of Courage, Limit Break | 20,190 | 20,193 | 1.000 |  |
| Golden Gun - Marksman, Feast of Light x6, Radiant, Facet of Courage, Limit Break | 32,463 | 32,941 | 1.015 |  |
| One Thousand Voices, Particle Reconstruction | 63,705 | 66,942 | 1.051 |  |
| One Thousand Voices, Ember of Ashes, Particle Reconstruction | 74,750 | 79,499 | 1.064 |  |
| One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction | 97,543 | 105,112 | 1.078 |  |
| Nova Bomb - Cataclysm, Feast of Light x6, Facet of Courage, Limit Break | 28,890 | 32,744 | 1.133 |  |
| Twilight Arsenal, Feast of Light x6, Facet of Courage, Limit Break | 30,285 | 34,328 | 1.133 |  |
| Needlestorm, Feast of Light x6, Limit Break | 25,251 | 31,787 | 1.259 | +26 %; cause not examined (the same switch fits Blade Barrage, Gathering Storm and Golden Gun within 3 %) |

## Annahme ohne Schalter

| Aegis-Zeile | Aegis | Modell | relativ | ohne Schalter |
| --- | ---: | ---: | ---: | --- |
| Divinity | 65,637 | 15,095 | 0.230 | held down; includes jolt; Focused Fury; Harsh Refraction |
| Leviathan's Breath | 223,610 | 62,100 | 0.278 | Archer's Tempo; Moebius Quiver; simulated |
| Still Hunt | 116,141 | 32,426 | 0.279 | pre-popped into 6 shot cycle; Incendiary Rifle Rounds; Solar Fulmination; assumes at least 2 orb pickups per mag |
| Still Hunt | 112,939 | 32,426 | 0.287 | pre-popped into 6 shot cycle; assumes at least 2 orb pickups per mag |
| Still Hunt | 112,939 | 32,426 | 0.287 | pre-popped into 6 shot cycle |
| Hammer of Sol | 59,236 | 17,424 | 0.294 | Roaring Flames x3 |
| Heirloom | 144,994 | 49,465 | 0.341 | fully charged |
| Stormtrance | 71,745 | 26,177 | 0.365 | Thunderous Retort |
| Ager's Scepter | 105,202 | 38,614 | 0.367 | Will Given Form; Facet of Command; Harsh Refraction |
| Heirloom | 121,118 | 49,465 | 0.408 | 2 charges |
| Sentinel Shield | 45,727 | 19,122 | 0.418 | aerial lights; Shieldcrush |
| Burning Maul | 49,559 | 22,006 | 0.444 | heavy attacks; Roaring Flames x3 |
| Sentinel Shield | 43,019 | 19,122 | 0.445 | grounded spam; Shieldcrush |
| Still Hunt | 70,538 | 32,426 | 0.460 | pre-popped into 6 shot cycle |
| Euphony | 123,950 | 59,239 | 0.478 | starts at 0 stacks; includes Threadlings; Pack Tactics (simplified underestimate of 3 stack start) |
| Fists of Havoc | 54,355 | 27,883 | 0.513 | heavy attacks; Thunderous Retort |
| Wavesplitter | 80,605 | 41,751 | 0.518 | Supercharged Battery; Detonator Beam; Harsh Refraction |
| Chaos Reach | 79,840 | 41,979 | 0.526 | Thunderous Retort |
| Choir of One | 125,971 | 66,674 | 0.529 | hitscan mode; precision |
| Euphony | 111,914 | 59,239 | 0.529 | starts at 0 stacks; includes Threadlings; Pack Tactics (simplified underestimate of 3 stack start) |
| New Land Beyond | 185,204 | 101,343 | 0.547 | starts at The Master x20; Rally Barricade |
| Salvation's Grip | 83,906 | 46,806 | 0.558 | charged; Hail the Storm |
| Izanagi's Burden | 49,440 | 28,196 | 0.570 | includes rehone time; hone before rally; Sniper's Meditation (assume stacked) |
| Legend of Acrius | 129,383 | 75,473 | 0.583 | body; Trench Barrel |
| New Land Beyond | 172,474 | 101,343 | 0.588 | starts at The Master x0; Rally Barricade; manual reloads until The Grandmaster |
| Thundercrash | 48,635 | 28,687 | 0.590 | Thunderous Retort; Conductive Cosmic Needle x3 |
| Thundercrash | 31,181 | 18,396 | 0.590 | Thunderous Retort; Conductive Cosmic Needle x3 |
| Burning Maul | 89,348 | 55,015 | 0.616 | light attacks; Roaring Flames x3 |
| Needlestorm | 33,601 | 20,926 | 0.623 | Pack Tactics x2 |
| Duality | 63,973 | 40,536 | 0.634 | 3 body pellet shots into On Black Wings x3 slugs |
| Hammer of Sol | 51,242 | 32,583 | 0.636 | max distance |
| Nova Bomb - Cataclysm | 30,171 | 19,261 | 0.638 | Skull of Dire Ahamkara (ownDamage) |
| Heirloom | 77,175 | 49,465 | 0.641 | 1 charge |
| Hammer of Sol | 67,298 | 43,560 | 0.647 | Roaring Flames x3; max distance |
| Whisper of the Worm | 134,672 | 87,478 | 0.650 | Incendiary Rifle Rounds; Solar Fulmination |
| Arc Staff | 84,169 | 56,113 | 0.667 | Shieldcrush |
| Silkstrike | 59,072 | 39,394 | 0.667 | light attack spam; Shieldcrush |
| Spectral Blades | 57,656 | 38,465 | 0.667 | light attack spam; Shieldcrush |
| Cloudstrike | 75,248 | 50,710 | 0.674 | Triple Tap; excludes Bolt Charge |
| Edge of Concurrence | 43,651 | 29,705 | 0.681 | pre-stacked; Lightning Seeker into six shot cycle |
| Bastion | 103,763 | 71,560 | 0.690 | Saint's Fury; includes melee time |
| Truth | 119,636 | 82,636 | 0.691 | Prototype Truthseeker |
| The Lament | 197,074 | 139,647 | 0.709 | 3L1H1R combo; Lucent Blades x3; Combination Argent Blade; Sword Storm Combo; simulated |
| Burning Maul | 76,665 | 55,015 | 0.718 | heavy attacks; Roaring Flames x3 |
| Dragon's Breath | 153,290 | 110,995 | 0.724 | auto-loaded; Composite Propellant x5 |
| Burning Maul | 30,129 | 22,006 | 0.730 | light attacks; Roaring Flames x3 |
| Microcosm | 102,579 | 75,121 | 0.732 | Paracausal Imbuement; Harsh Refraction |
| The Lament | 217,268 | 160,595 | 0.739 | 2L1H combo; Lucent Blades x3; Solar Fulmination |
| Ergo Sum | 108,842 | 81,082 | 0.745 | caster frame; Jagged Edge; 1H2L combo; Lucent Blades x3; Pack Hunter; Transcendent; excludes Transcendence 5% bonus; Solar Fulmination |
| Burning Maul | 30,129 | 23,161 | 0.769 | Roaring Flames x3 |
| Storm's Edge | 43,145 | 33,184 | 0.769 | body; all three casts; Thunderous Retort |
| Dead Messenger | 77,031 | 59,255 | 0.769 | The Fundamentals |
| Finality's Auger | 82,158 | 63,199 | 0.769 | Bait and Switch; Linear Fusion Mode |
| Chaos Reach | 54,572 | 41,979 | 0.769 | Thunderous Retort |
| Merciless | 61,178 | 47,434 | 0.775 | Impetus; two kills |
| Shadowshot: Moebius Quiver | 19,565 | 15,393 | 0.787 | full bow charge; all 3 volleys; assumes no other debuff |
| Stormtrance | 54,444 | 42,876 | 0.788 | Thunderous Retort |
| Shadowshot: Moebius Quiver | 11,791 | 9,301 | 0.789 | full bow charge; both volleys; assumes no other debuff |
| Shadowshot: Moebius Quiver | 19,977 | 15,811 | 0.791 | full bow charge; both volleys; assumes no other debuff |
| The Lament | 176,080 | 139,647 | 0.793 | 3L1H1R combo; Lucent Blades x3; Combination Argent Blade; Sword Storm Combo |
| The Lament | 198,217 | 160,595 | 0.810 | 2L1H combo; Lucent Blades x3; Solar Fulmination |
| Deterministic Chaos | 137,936 | 112,035 | 0.812 | Target Lock |
| Slayer's Fang | 72,295 | 60,620 | 0.839 | Assault Mag; includes submunitions |
| The Lament | 165,335 | 139,647 | 0.845 | 4L1H1R combo; Lucent Blades x3; Combination Argent Blade; Sword Storm Combo |
| Ergo Sum | 93,989 | 81,082 | 0.863 | vortex frame; Tempered Edge; heavy spam; Lucent Blades x3; Pack Hunter; Transcendent; excludes Transcendence 5% bonus |
| Needlestorm | 24,214 | 20,926 | 0.864 | Pack Tactics x2 |
| Daybreak | 32,716 | 28,809 | 0.881 | grounded |
| Tessellation | 134,193 | 120,473 | 0.898 | full grenade uptime; Property: Irreducible; Transcendent but excludes 5%; simulated |
| The Lament | 178,796 | 160,595 | 0.898 | 2L1H1R combo; Lucent Blades x3 |
| Fafnir | 58,657 | 53,594 | 0.914 | includes Quantum Nova windup and splash; 9 ammo consumed |
| Ergo Sum | 88,577 | 81,082 | 0.915 | wave frame; Jagged Edge; heavy spam; Lucent Blades x3; Pack Hunter; Transcendent; excludes Transcendence 5% bonus; boss against wall |
| D.A.R.C.I. | 73,429 | 69,253 | 0.943 | Target Acquired; includes jolt |
| Ergo Sum | 85,958 | 81,082 | 0.943 | lightweight frame; Jagged Edge; 1H2L combo; Lucent Blades x3; Pack Hunter; Transcendent; excludes Transcendence 5% bonus |
| Parasite | 95,708 | 90,445 | 0.945 | Envious Arsenal; x20 first shot |
| Black Talon | 79,745 | 76,566 | 0.960 | 2H2L combo; Lucent Blades x3 |
| Fists of Havoc | 28,991 | 27,883 | 0.962 | light attacks; Shieldcrush |
| Shadowshot: Moebius Quiver | 16,241 | 15,811 | 0.974 | both volleys; assumes no other debuff |
| Ergo Sum | 82,216 | 81,082 | 0.986 | caster frame; Jagged Edge; 1H2L combo; Lucent Blades x3; Pack Hunter; Transcendent; excludes Transcendence 5% bonus; Solar Fulmination |
| Shadowshot: Moebius Quiver | 9,413 | 9,301 | 0.988 | both volleys; assumes no other debuff |
| The Prospector | 84,807 | 84,111 | 0.992 | typical boss model; Kinetic Impacts |
| Shadowshot: Moebius Quiver | 15,469 | 15,393 | 0.995 | all 3 volleys; assumes no other debuff |
| Choir of One | 66,675 | 66,674 | 1.000 | projectile mode; spaced* |
| The Wardcliff Coil | 52,072 | 52,072 | 1.000 | excludes Bolt Charge |
| Heirloom | 49,465 | 49,465 | 1.000 | uncharged |
| Deathbringer | 116,197 | 116,197 | 1.000 | max projectile height |
| Cull's Shadow | 56,307 | 56,307 | 1.000 | with corruption |
| Golden Gun - Marksman | 33,042 | 33,042 | 1.000 | pre-popped |
| Ex Diris | 52,078 | 52,078 | 1.000 | assumes max frenzy |
| Lord of Wolves | 75,292 | 75,292 | 1.000 | Release the Wolves; hip-fire; precision; includes ignition |
| New Malpais | 67,055 | 67,055 | 1.000 | assumes suspend tick every 3 shots |
| Dragon's Breath | 110,995 | 110,995 | 1.000 | auto-loaded; Composite Propellant x5 |
| Winterbite | 53,468 | 53,469 | 1.000 | projectile |
| Salvation's Grip | 46,806 | 46,806 | 1.000 | uncharged |
| The Lament | 160,593 | 160,595 | 1.000 | 2L1H1R combo; Lucent Blades x3 |
| Heartshadow | 103,813 | 104,462 | 1.006 | heavy attacks; Shot in the Dark; Lucent Blades x3 |
| Vexcalibur | 39,270 | 40,497 | 1.031 | projectile |
| Winter's Wrath | 30,297 | 34,474 | 1.138 | light-heavy cycle; Whisper of Fissures |
| The Fourth Horseman | 41,343 | 51,679 | 1.250 | body |
| The Queenbreaker | 74,475 | 97,261 | 1.306 | Rewind Rounds; Marksman Sights |
| Winter's Wrath | 38,618 | 51,445 | 1.332 | light-heavy cycle; Facet of Ruin |
| One Thousand Voices | 74,472 | 105,112 | 1.411 | no ignitions |
| Twilight Arsenal | 8,337 | 18,357 | 2.202 | axe light attack spam |
| Storm's Edge | 14,382 | 33,184 | 2.307 | body; per cast; Thunderous Retort |
| Twilight Arsenal | 2,705 | 18,357 | 6.786 | axe heavy attack |

## Fehlende Schalter

Annahme von Aegis ohne Schalter, mit der Zahl der berichteten Zeilen, die sie enthalten.

- Lucent Blades x3: 14
- Thunderous Retort: 9
- Roaring Flames x3: 7
- assumes no other debuff: 6
- Shieldcrush: 6
- Solar Fulmination: 6
- excludes Transcendence 5% bonus: 5
- Pack Hunter: 5
- Transcendent: 5
- body: 4
- both volleys: 4
- Harsh Refraction: 4
- heavy attacks: 4
- Jagged Edge: 4
- pre-popped into 6 shot cycle: 4
- 1H2L combo: 3
- Combination Argent Blade: 3
- full bow charge: 3
- light attacks: 3
- simulated: 3
- Sword Storm Combo: 3
- 2L1H combo: 2
- 2L1H1R combo: 2
- 3L1H1R combo: 2
- all 3 volleys: 2
- assumes at least 2 orb pickups per mag: 2
- auto-loaded: 2
- caster frame: 2
- Composite Propellant x5: 2
- Conductive Cosmic Needle x3: 2
- excludes Bolt Charge: 2
- heavy spam: 2
- Incendiary Rifle Rounds: 2
- includes jolt: 2
- includes Threadlings: 2
- light attack spam: 2
- light-heavy cycle: 2
- max distance: 2
- Pack Tactics (simplified underestimate of 3 stack start): 2
- Pack Tactics x2: 2
- precision: 2
- projectile: 2
- Rally Barricade: 2
- starts at 0 stacks: 2
- uncharged: 2
- 1 charge: 1
- 2 charges: 1
- 2H2L combo: 1
- 3 body pellet shots into On Black Wings x3 slugs: 1
- 4L1H1R combo: 1
- 9 ammo consumed: 1
- aerial lights: 1
- all three casts: 1
- Archer's Tempo: 1
- Assault Mag: 1
- assumes max frenzy: 1
- assumes suspend tick every 3 shots: 1
- axe heavy attack: 1
- axe light attack spam: 1
- Bait and Switch: 1
- boss against wall: 1
- charged: 1
- Detonator Beam: 1
- Envious Arsenal: 1
- Facet of Command: 1
- Facet of Ruin: 1
- Focused Fury: 1
- full grenade uptime: 1
- fully charged: 1
- grounded: 1
- grounded spam: 1
- Hail the Storm: 1
- held down: 1
- hip-fire: 1
- hitscan mode: 1
- hone before rally: 1
- Impetus: 1
- includes ignition: 1
- includes melee time: 1
- includes Quantum Nova windup and splash: 1
- includes rehone time: 1
- includes submunitions: 1
- Kinetic Impacts: 1
- Lightning Seeker into six shot cycle: 1
- lightweight frame: 1
- Linear Fusion Mode: 1
- manual reloads until The Grandmaster: 1
- Marksman Sights: 1
- max projectile height: 1
- Moebius Quiver: 1
- no ignitions: 1
- Paracausal Imbuement: 1
- per cast: 1
- pre-popped: 1
- pre-stacked: 1
- projectile mode: 1
- Property: Irreducible: 1
- Prototype Truthseeker: 1
- Release the Wolves: 1
- Rewind Rounds: 1
- Saint's Fury: 1
- Shot in the Dark: 1
- Skull of Dire Ahamkara (ownDamage): 1
- Sniper's Meditation (assume stacked): 1
- spaced*: 1
- starts at The Master x0: 1
- starts at The Master x20: 1
- Supercharged Battery: 1
- Target Acquired: 1
- Target Lock: 1
- Tempered Edge: 1
- The Fundamentals: 1
- Transcendent but excludes 5%: 1
- Trench Barrel: 1
- Triple Tap: 1
- two kills: 1
- typical boss model: 1
- vortex frame: 1
- wave frame: 1
- Whisper of Fissures: 1
- Will Given Form: 1
- with corruption: 1
- x20 first shot: 1

## Übersprungen

- Duality, Ice Breaker loadout swap exploit, 80% consistency, simulated: factors differ from the standard of Aegis
- Hierarchy of Needs, Guidance Ring x2, Moebius Quiver, Argent Quiver, fireteam scaling, simulated: no total (INF)
- Hierarchy of Needs, Guidance Ring, Moebius Quiver, Argent Quiver, simulated: no total (INF)
- The Chaperone, The Roadborn, Triple Tap, Kinetic Synthesis: no total (INF)
- Two-Tailed Fox, Ember of Ashes, Dawn Chorus, Argent Ordnance: factors differ from the standard of Aegis
- Hierarchy of Needs, Guidance Ring x2, Argent Quiver, fireteam scaling: no total (INF)
- New Land Beyond, starts at The Master x20, sprint cancelling, Kinetic Synthesis, Sniper's Meditation: no total (INF)
- Two-Tailed Fox, Ember of Ashes, Argent Ordnance: factors differ from the standard of Aegis
- Ticuu's Divination, alternating modes, Causality Arrows x6, Guidance Ring x2, assumes one ignition every other shot: no total (INF)
- Conditional Finality, body, average across both shots: factors differ from the standard of Aegis
- Symmetry, Dynamic Charge x10 into 10 Revolution x10 shots cycle, Well of Radiance caster, Storm's Keep, Flashover: no total (INF)
- Hierarchy of Needs, Guidance Ring, Argent Quiver: no total (INF)
- Touch of Malice, final round, blighted, Precision Instrument: no total (INF)
- Whirling Ovation, no Anticipation, fully charged, Argent Ordnance: factors differ from the standard of Aegis
- Final Warning, 15 shot half charge auto into tap fire burst, catalyst: no total (INF)
- Skyburner's Oath, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Dawn Chorus: no total (INF)
- Outbreak Perfected, starts at max nanites, Rewind Rounds, Appended Mag, approximate: no total (INF)
- Revision Zero, 4 burst cycle into 6 Hunter's Trace shots, Extended Mag, Fourth Time's the Charm, Vorpal Weapon: no total (INF)
- Touch of Malice, blight into 15 shot cycle: no total (INF)
- Revision Zero, 2 burst cycle into 6 Hunter's Trace shots, Extended Mag, Fourth Time's the Charm, Vorpal Weapon: no total (INF)
- Vex Mythoclast, Calculated Balance, Particle Reconstruction: no total (INF)
- Outbreak Perfected, starts at 0 nanites, Rewind Rounds, Appended Mag: no total (INF)
- Polaris Lance, Ember of Ashes, Dawn Chorus: no total (INF)
- Tarrabah, Ravenous Beast: no total (INF)
- Hawkmoon, successive mags, Paracausal Shot x7: no total (INF)
- Tommy's Matchbook, Ember of Ashes: no total (INF)
- Rat King, Rat Pack x5: no total (INF)
- Lodestar, ADS, Harsh Refraction: no total (INF)
- Osteo Striga: no total (INF)
- Polaris Lance, Ember of Ashes: no total (INF)
- Graviton Spike, alternating modes with 3 shot cycles, Temporal Alignment: no total (INF)
- Cerberus+1, precision, point blank: no total (INF)
- Third Iteration, 16 marked shots: no total (INF)
- Riskrunner, Arc Conductor, simulated: no total (INF)
- Third Iteration, Amalgamation Round into 15 marked shots: no total (INF)
- Polaris Lance: no total (INF)
- Skyburner's Oath, hipfire, with ignitions, Ember of Ashes, Burning Ambition: no total (INF)
- Fighting Lion: no total (INF)
- Lodestar, hip-fire, Harsh Refraction: no total (INF)
- Sweet Business: no total (INF)
- Malfeasance, successive mags, Vorpal Weapon: no total (INF)
- Quicksilver Storm, 42 shot burst into 3 grenade cycle: no total (INF)
- The Last Word, hip-fire, successive mags: no total (INF)
- MIDA Multi-Tool, High-Power Ammo: no total (INF)
