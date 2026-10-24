# Effekte durch Abilities

Generiert mit `npm run build:grants` aus `compendium-abilities.json` (Regel in `scripts/lib/abilityGrants.ts`). Jede Zeile eines Ability-Texts, die einen Buff oder Debuff nennt, mit Urteil.

| Ability | Urteil | Effect | Auslöser | Dauer | Zeile |
| --- | --- | --- | --- | --- | --- |
| Arc Staff | Zustand ohne eigenen Schaden |  |  |  | Kills grant x1 Bolt Charge. |
| Arc Staff | Zustand ohne eigenen Schaden |  |  |  | Deals 1,264 [?] damage and inflicts blind over 7 meters away |
| Arc Staff | Zustand ohne eigenen Schaden |  |  |  | Deals 2,950 [?] damage and inflicts blind in a ~45° angle up to 8 meters away. |
| Arc Staff | Zustand ohne eigenen Schaden |  |  |  | Fully blocks and reflects all attacks in a 180?° Angle, granting x1 Bolt Charge per attack reflected. |
| Fists of Havoc | Zustand ohne eigenen Schaden |  |  |  | Slams downwards, dealing 1619 [?] damage and inflicting blind in a 11 metre radius. Super Cast also slams, without the aftershocks |
| Golden Gun: Deadshot | Bedingung, nicht gewährt |  |  |  | Radiant's damage bonus affects its damage output. |
| Golden Gun: Marksman | Bedingung, nicht gewährt |  |  |  | Radiant's damage bonus affects its damage output. |
| Well of Radiance | eigener Effect der Ability belegt das Bucket schon (grantsEffectIds) |  |  |  | Projects an aura that buffs the caster and allies within 6 metres. Leaving the aura grants Radiant for 8+4 seconds. |
| Well of Radiance | Zustand ohne eigenen Schaden |  |  |  | Removes any active Restoration effect. |
| Spectral Blades | Zustand ohne eigenen Schaden |  |  |  | Damage Resistance: 90% [59?% Invisible \| 58% Visible] |
| Spectral Blades | Zustand ohne eigenen Schaden |  |  |  | Base Duration: 23.5 seconds or 4.25% Super Drain per second. Drains 50% faster if not invisible. |
| Spectral Blades | Zustand ohne eigenen Schaden |  |  |  | Deals 1,107 [?] damage and removes Void Invisibility. |
| Spectral Blades | nur Heavy Attack, Aegis spielt Light Attacks |  |  |  | [Heavy Attack] performs an uppercut, dealing 1,620 [?] damage and applying Weaken and granting Invisibility. |
| Shadowshot: Deadfall | eigener Effect der Ability belegt das Bucket schon (grantsEffectIds) |  |  |  | Deals 2,583 [?] Damage on impact, inflicting Deadfall Weaken and Suppression to enemies within ? meters. Counts as a Construct with ? HP. |
| Shadowshot: Deadfall | eigener Effect der Ability belegt das Bucket schon (grantsEffectIds) |  |  |  | Enemies within 12.5 meters of the anchor are tethered. Tethered enemies are inflicted with Deadfall Weaken, Suppression, and Mark for 30 [10] seconds. |
| Shadowshot: Deadfall | eigener Effect der Ability belegt das Bucket schon (grantsEffectIds) |  |  |  | Deadfall Weaken UNIQUELY increases damage taken by 35%. |
| Shadowshot: Moebius Quiver | eigener Effect der Ability belegt das Bucket schon (grantsEffectIds) |  |  |  | Deals 1,076 [?] Damage and inflicts Suppression, Volatile, and Weaken on impact. Counts as a Construct with ? HP. |
| Shadowshot: Moebius Quiver | eigener Effect der Ability belegt das Bucket schon (grantsEffectIds) |  |  |  | Enemies within 7 meters of the anchor are tethered. Deals 20% increased damage to tethered enemies. Tethered enemies are inflicted with Weaken and Suppression. |
| Sentinel Shield | Zustand ohne eigenen Schaden |  |  |  | Allies standing within 5m behind the barrier are granted 25% Increased Damage, a 45 HP Void Overshield, +50 Handling, and +50 Reload Speed. |
| Sentinel Shield | Zustand ohne eigenen Schaden |  |  |  | Allied Guardian's Void Overshield begins regenerating at a rate of 9HP/s after not receiving damage for 3 seconds. |
| Twilight Arsenal | Effect pro Cast/Treffer | weaken | hit | 6 s | Axes deal up to 1,250 [?] damage over ? meters on impact, pulling enemies inwards, and explode after 0.6 seconds, dealing up to 1,750 [?] damage and weakening over ? meters. |
| Twilight Arsenal | Effect pro Cast/Treffer | weaken | cast | 6 s | Light Attack swings deal 581 [175] damage and weaken, consuming 1 Ammo. |
| Twilight Arsenal | Effect pro Cast/Treffer | weaken | hit | 6 s | Heavy Attacks throws the axe as an explosive projectile, consuming all ammo, dealing 1,337 [?] damage on impact, and up to 830 [250] damage over ? meters with its explosion, weakening damaged enemies. |
| Nova Warp | Effect pro Cast/Treffer | weaken | cast | 6 s | Performs a Dark Blink, draining 3.5% Super Energy to rapidly accelerate towards the currently input direction and release 4 Weakening Seekers, one in each cardinal direction. |
| Nova Warp | Effect pro Cast/Treffer | weaken | hit | 6 s | Weakening Seekers target enemies within 8 meters, dealing 193 [?] Damage and inflicting Weaken on impact. |
| Flashbang Grenade | Zustand ohne eigenen Schaden |  |  |  | Explosion deals up to 684 [120] damage, down to 0% damage over a 7.5 meter radius, and inflicts blind to enemies within 10 meters for up to 5 [3] seconds. |
| Flashbang Grenade | Zustand ohne eigenen Schaden |  |  |  | The user is immune to self-blind. |
| Suppressor Grenade | Zustand ohne eigenen Schaden |  |  |  | Explosion deals up to 863 [150] damage and inflicts Suppression for 10 [5] seconds over 9 meters on detonation. |
| Suppressor Grenade | Zustand ohne eigenen Schaden |  |  |  | The user is immune to self-suppression. |
| Disorienting Blow | Zustand ohne eigenen Schaden |  |  |  | Inflicts Blind for 8.5 seconds to enemies within 9.6 meters on hit. |
| Disorienting Blow | Zustand ohne eigenen Schaden |  |  |  | Grants Amplified and x2 Bolt Charge on hit. |
| Ballistic Slam | Zustand ohne eigenen Schaden |  |  |  | Grants 3% Super Energy and x3 Bolt Charge per enemy hit. |
| Seismic Strike | Zustand ohne eigenen Schaden |  |  |  | Hitting an enemy deals 1,073 [110] impact damage, as well as dealing 391 [40] radial damage and inflicting Blind for 8 [1.6] seconds to enemies within 6 meters. |
| Seismic Strike | Zustand ohne eigenen Schaden |  |  |  | While Amplified: |
| Seismic Strike | Zustand ohne eigenen Schaden |  |  |  | Blind Radius is increased to 10 metres, and the Blind Duration is increased to 10 [3] seconds. |
| Ball Lightning | Zustand ohne eigenen Schaden |  |  |  | While Amplified: |
| Lightweight Knife | Effect pro Cast/Treffer | radiant | hit | 10 s | Precision Hits grant Radiant for 10 seconds. |
| Throwing Hammer | Zustand ohne eigenen Schaden |  |  |  | Picking up the hammer after scoring a hit grants Cure x1. |
| Phantom Surge | Zustand ohne eigenen Schaden |  |  |  | Grants +10 Void Overshield per enemy hit. |
| Phantom Surge | Zustand ohne eigenen Schaden |  |  |  | Scoring a kill grants an additional +45 Void Overshield and refunds 60% Melee Ability Energy. |
| Snare Bomb | Zustand ohne eigenen Schaden |  |  |  | Smoke Bombs grant Invisibility to allies within 6 meters of its impact for 5+2 seconds. |
| Snare Bomb | Effect pro Cast/Treffer | weaken | hit | 8 s | Snare Bomb deals 33 [10] impact damage, and up to 120 + 24 [40 + ?] explosion damage over ? meters. Impact and explosion weaken and disorient for 8 [2.5] seconds. |
| Snare Bomb | Zustand ohne eigenen Schaden |  |  |  | Lasts for 5 [2] seconds on detonation, dealing DoT every 0.6 seconds and disorienting enemies. |
| Shield Bash | Zustand ohne eigenen Schaden |  |  |  | Inflicts Suppression to enemies within 2 meters of the struck target. |
| Shield Bash | Zustand ohne eigenen Schaden |  |  |  | Scoring a kill with Shield Bash grants 45 HP Void Overshield for 10+5 seconds. |
| Shield Throw | Zustand ohne eigenen Schaden |  |  |  | Shield deals 400 [70] impact damage on hit, and grants 15 HP Void Overshield per hit. |
| Threaded Spike | Zustand ohne eigenen Schaden |  |  |  | Strand Subclass Exclusive: Catching the Threaded Spike grants Woven Mail for 2 seconds for each kill it scores, up to a maximum of 10 seconds. |
| Healing Rift | Zustand ohne eigenen Schaden |  |  |  | While at Full Health \| Healing Rift generates 3 Overshield HP per second, up to 15 Overshield HP. Having Void Overshield prevents this from happening. |
| Healing Rift | Zustand ohne eigenen Schaden |  |  |  | Overshield can stack with other overshields, such as Turnabout's OS and Class Stat OS. Overshield layers are determined by "First In, First Out". |
| Acrobat's Dodge | Effect pro Cast/Treffer | radiant | cast | 10 s | Performs an acrobatic leap, that, upon landing, grants the user and their allies within 10 meters Radiant for 10+5 seconds. |
| Phoenix Dive | Zustand ohne eigenen Schaden |  |  |  | Dive that applies Cure x2 to the user and their allies within 9 meters. |
| Phoenix Dive | Zustand ohne eigenen Schaden |  |  |  | Applies Restoration x2 for 3+1.5 seconds upon diving. |
