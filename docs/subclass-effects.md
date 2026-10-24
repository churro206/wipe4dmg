# Prüftabelle Subklassen-Effekte

Erzeugt von `npm run build:keywords` (ADR 0015, U6-2), nicht von Hand bearbeiten.
Quellen: Manifest (Aspects, Fragments), Compendium (Subklassen-Reiter), Court's Stacking Guide, Aegis (Abilities, Sustained). Regeln A bis H in `scripts/lib/subclassEffects.ts`.
Ein Boss, keine Adds; Zustände ohne Kill-Auslöser gelten die ganze Phase (optimal gespielt).

| Art | Zeilen |
| --- | --- |
| Immer aktiv | 31 |
| Vorher aufgebaut, Option | 11 |
| Fenster aus der Rotation | 6 |
| Ohne Dauer | 4 |
| Auslöser in der Rotation, offen | 1 |
| Auslöser Class Ability, U7 | 1 |
| Keyword ohne Modell, später | 21 |
| Wirkt nicht gegen einen Boss | 4 |
| Bonus ohne Bucket-Quelle, Recherche in der Inventur | 7 |
| Ändert eine Ability (Aegis-Variante) | 6 |
| Eigener Schaden (Aegis Sustained) | 5 |
| Ohne Compendium-Text | 0 |
| Ohne Schadenswirkung | 88 |

## Immer aktiv

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Ascension | arc, prismatic | E | Zustand amplified, die ganze Phase gehalten („Grants Amplified“) | Text |
| Bastion | void | E | Zustand voidOvershield, die ganze Phase gehalten („Grants allies within 15 metres a 45 HP Void Overshield“, „Generates 11 Void Overshield“) | Text |
| Controlled Demolition | void | C | volatile auf Treffer von void grenade, melee, super, classAbility („inflicts Volatile“) | Text |
| Diamond Lance | prismatic, stasis | E | Zustand frostArmor, die ganze Phase gehalten („bestowing the user and their allies within ? meters x2 Frost Armor“) | Text |
| Echo of Vigilance | void | E | Zustand voidOvershield, die ganze Phase gehalten („Grants Void Overshield“) | Text |
| Electrostatic Mind | arc | E | Zustand amplified, die ganze Phase gehalten („grant Amplified“) | Text |
| Ember of Ashes | solar | B | Scorch-Stapel ×1.5 („Scorch Stacks inflicted are increased by 50%“) | Text |
| Ember of Mercy | solar | E | Zustand restoration, die ganze Phase gehalten („Restoration x1“) | Text |
| Ensnaring Slam | strand | E | Zustand wovenMail, die ganze Phase gehalten („Grants Woven Mail“) | Text |
| Facet of Courage | prismatic | F | Ability-Bonus +10 % im Bucket aspectBonus („10% increased damage“) | Text |
| Facet of Courage | prismatic | F | Melee-Bonus +50 % im Bucket melee („50% [10%] increased damage“) | Text |
| Facet of Dominance | prismatic | C | jolt auf Treffer von arc grenade („inflicts Jolt“) | Text |
| Facet of Purpose | prismatic | E | Zustand restoration, die ganze Phase gehalten („Restoration x1“) | Text |
| Frostpulse | stasis | E | Zustand frostArmor, die ganze Phase gehalten („grants x5 Frost Armor“) | Text |
| Glacial Harvest | stasis | E | Zustand frostArmor, die ganze Phase gehalten („grants x1 Frost Armor“, „grant x3 Frost Armor“) | Text |
| Grim Harvest | stasis | E | Zustand frostArmor, die ganze Phase gehalten („grants x1 Frost Armor“, „grant x3 Frost Armor“) | Text |
| Heat Rises | solar | E | Zustand restoration, die ganze Phase gehalten („grants Restoration“) | Text |
| Into the Fray | strand | E | Zustand wovenMail, die ganze Phase gehalten („granting Woven Mail“, „Grants allies within ? metres Woven Mail“) | Text |
| Lightning Surge | arc, prismatic | E | Zustand amplified, die ganze Phase gehalten („Grants Amplified“) | Text |
| Offensive Bulwark | void | F | Melee-Bonus +160 % im Bucket melee („160% [20%] increased Melee Damage“) | Text |
| Shatterdive | stasis | E | Zustand frostArmor, die ganze Phase gehalten („grants maximum Frost Armor“) | Text |
| Sol Invictus | solar | E | Zustand restoration, die ganze Phase gehalten („grant Sol Invictus for 5 seconds and Restoration“) | Text |
| Soul Siphon | void | E | Zustand voidOvershield, die ganze Phase gehalten („Grants +15 Void Overshield“) | Text |
| Spark of Feedback | arc | F | Melee-Bonus +100 % im Bucket melee („100% [50% \| 15% while Knockout is active] Increased Melee Damage“) | Text |
| Spark of Shock | arc | C | jolt auf Treffer von arc grenade („inflict Jolt“) | Text |
| Tectonic Harvest | stasis | E | Zustand frostArmor, die ganze Phase gehalten („grants x1 Frost Armor“, „grant x3 Frost Armor“) | Text |
| Thread of Warding | strand | E | Zustand wovenMail, die ganze Phase gehalten („Grants Woven Mail“) | Text |
| Touch of Flame | solar | E | Zustand restoration, die ganze Phase gehalten („grant Cure x2 and Restoration“) | Text |
| Unbreakable | prismatic, void | E | Zustand voidOvershield, die ganze Phase gehalten („Generates 10 Void Overshield“) | Text |
| Weavewalk | strand | E | Zustand wovenMail, die ganze Phase gehalten („Grants Woven Mail“) | Text |
| Whisper of Fractures | stasis | E | Zustand frostArmor, die ganze Phase gehalten („Grants x1 Frost Armor“) | Text |

## Vorher aufgebaut, Option

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Banner of War | strand | F | Melee-Bonus +100 % im Bucket melee, 15 s („100% [Varies] Increased Melee Damage“) | Text |
| Echo of Instability | void | C | vorher aufgebaut: volatile auf void Waffen für 11.25 s („grant Volatile Rounds to Void Weapons“) | Text |
| Facet of Bravery | prismatic | C | vorher aufgebaut: volatile auf void Waffen für 11.25 s („grant Volatile Rounds to Void Weapons“) | Text |
| Facet of Bravery | prismatic | C | vorher aufgebaut: unravel auf strand Waffen für 11.25 s („grant Unraveling Rounds to Strand Weapons“) | Text |
| Knockout | arc, prismatic | F | Melee-Bonus +160 % im Bucket melee, 6 s („160% [20%] increased Charged Melee Damage“) | Text |
| On the Prowl | void | A | vorher aufgebaut: debuff +15 % für 6 s („Killing priority target causes them to burst into a Weakening Smoke Cloud“) | nur Court |
| On Your Mark | solar | E | vorher aufgebaut: Zustand restoration für 3 s („grant Restoration“) | Text |
| Roaring Flames | solar | E | vorher aufgebaut: Zustand roaringFlames für 20 s („grant a stack of Roaring Flame“) | Text |
| Roaring Flames | solar | F | Melee-Bonus +200 % im Bucket melee, 20 s („67% \| 133% \| 200% Increased Melee Damage“) | Text |
| Roaring Flames | solar | F | Ability-Bonus +73 % im Bucket aspectBonus, 20 s („73% [44%] increased Grenade and Super Ability Damage“) | Text |
| Thread of Propagation | strand | C | vorher aufgebaut: unravel auf strand Waffen für 8 s („Grants Unraveling Rounds to Strand Weapons“) | Text |

## Fenster aus der Rotation

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Child of the Old Gods | void | A | ab Cast einer Class Ability: debuff +15 % für 5 s („Void Soul tether drain damage applies Weaken“) | nur Court |
| Echo of Undermining | void | A | ab Treffer einer void Grenade: debuff +15 % für 5 s („Void Grenade damage applies Weaken“) | nur Court |
| Ember of Torches | solar | D | Radiant ab Melee-Treffer für 8 s („Powered Melee Hits grant Radiant for 8“) | Text |
| Facet of Dawn | prismatic | D | Radiant ab Melee-Treffer für 5 s („Powered Melee Hits grant Radiant for 5“) | Text |
| Facet of Dominance | prismatic | A | ab Treffer einer void Grenade: debuff +15 % für 5 s („Void Grenade damage applies Weaken“) | nur Court |
| Trapper's Ambush | void | A | ab Cast einer Class Ability: debuff +15 % für 10 s („While Vanishing Step is equipped: Quickfall Smoke Cloud damage applies Weaken“) | Abweichung: Court 15 %, Text 50 % |

## Ohne Dauer

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Flow State | arc | E | Zustand amplified nur durch Kills, ohne Dauer („grants Amplified“) | Text |
| Knockout | arc, prismatic | E | Zustand amplified nur durch Kills, ohne Dauer („grants Amplified“) | Text |
| Offensive Bulwark | void | E | Zustand voidOvershield nur durch Kills, ohne Dauer („generate 10 HP Void Overshield“) | Text |
| Spark of Volts | arc | E | Zustand amplified nur durch Kills, ohne Dauer („grant Amplified“) | Text |

## Auslöser in der Rotation, offen

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Stylish Executioner | prismatic, void | A | Auslöser unklar („Melee while Stylish Executioner-triggered Invisibility applies Weaken“) | Abweichung: Court 15 %, Text 300 % |

## Auslöser Class Ability, U7

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Lethal Current | arc | C | jolt: Auslöser Class Ability, U7 („inflicts Jolt“) | Text |

## Keyword ohne Modell, später

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Chaos Accelerant | void | C | volatile: eigener Schaden oder geänderte Ability, später („inflicts Volatile“) | Text |
| Consecration | prismatic, solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflicting x40+20 Scorch“) | Text |
| Crackshot | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflict x20+10 Scorch“) | Text |
| Echo of Cessation | void | C | volatile: Kill ohne Dauer, feuert nie („inflicting Volatile“) | Text |
| Ember of Char | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflict x40+20 Scorch“) | Text |
| Lightning Surge | arc, prismatic | C | jolt: eigener Schaden oder geänderte Ability, später („inflict Jolt“) | Text |
| Roaring Flames | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflict x30+10 Scorch“) | Text |
| Shieldburst | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflicts x20+10 Scorch“) | Text |
| Shieldburst | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflicts x50+25 Scorch“) | Text |
| Shieldburst | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflicting x5+5 Scorch“) | Text |
| Sol Invictus | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflict x5+3 Scorch“) | Text |
| Spark of Discharge | arc | C | boltCharge: eigener Schaden oder geänderte Ability, später („grants x1 Bolt Charge“) | Text |
| Spark of Instinct | arc | C | jolt: eigener Schaden oder geänderte Ability, später („inflicting Jolt“) | Text |
| Spark of Momentum | arc | C | boltCharge: eigener Schaden oder geänderte Ability, später („grants x3 Bolt Charge“) | Text |
| Tempest Strike | arc | C | boltCharge: Kill ohne Dauer, feuert nie („grants x1 Bolt Charge“) | Text |
| Tempest Strike | arc | C | jolt: eigener Schaden oder geänderte Ability, später („inflicting Jolt“) | Text |
| Touch of Flame | solar | C | ignition: eigener Schaden oder geänderte Ability, später („inflicts x40+20 Scorch“) | Text |
| Touch of Thunder | arc | C | jolt: eigener Schaden oder geänderte Ability, später („inflict Jolt“) | Text |
| Touch of Thunder | arc | C | boltCharge: eigener Schaden oder geänderte Ability, später („Grants x5 Bolt Charge“) | Text |
| Touch of Thunder | arc | C | jolt: eigener Schaden oder geänderte Ability, später („inflict jolt“) | Text |
| Touch of Thunder | arc | C | boltCharge: eigener Schaden oder geänderte Ability, später („grant x5 Bolt Charge“) | Text |

## Wirkt nicht gegen einen Boss

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Bastion | void | F | wirkt nicht gegen einen Boss („Enhanced Barricade takes 20% increased damage from Guardians“) | Text |
| Threaded Specter | prismatic, strand | F | wirkt nicht gegen einen Boss („Allies and Caster deal 150% increased Ability and Weapon Damage towards it“) | Text |
| Whisper of Rending | stasis | F | wirkt nicht gegen einen Boss („Primary Ammo Weapons deal 100% increased damage against Stasis Crystals and 50% increased damage against Frozen Enemies“) | Text |
| Whisper of Rending | stasis | F | wirkt nicht gegen einen Boss („Primary Ammo Weapons deal 100% increased damage against Stasis Crystals and 50% increased damage against Frozen Enemies“) | Text |

## Bonus ohne Bucket-Quelle, Recherche in der Inventur

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Banner of War | strand | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Grants 100% [Varies] Increased Melee Damage, 40% Increased Bladefury Damage, and 20% Increased Sword Damage“) | Text 40 % |
| Banner of War | strand | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Grants 100% [Varies] Increased Melee Damage, 40% Increased Bladefury Damage, and 20% Increased Sword Damage“) | Text 20 % |
| Chaos Accelerant | void | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Axion Bolt: Adds 2 additional seekers [2 -> 4], seekers travel faster, deal 25% increased damage, and retriggers after a second of landing“) | Text 25 % |
| Crackshot | solar | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Radiant grants 20% Increased Crackshot Damage against Combatants“) | Text 20 % |
| Gunpowder Gamble | prismatic, solar | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Replaces Grenade with an Ignition-on-a-Stick that causes an ignition that deals 50% increased damage upon being shot or after 3 seconds“) | Text 50 % |
| Shieldburst | solar | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Shieldburst grants increased explosion damage, up to 50% increased damage once fully charged“) | Text 50 % |
| Touch of Thunder | arc | F | Bonus ohne Quelle für den Bucket oder Änderung einer Ability, Recherche in der Inventur („Deals up to 25% increased damage as it lingers“) | Text 25 % |

## Ändert eine Ability (Aegis-Variante)

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Knock 'Em Down | solar | G | ändert blade-barrage (Aegis-Zeilen `super-blade-barrage-knock-em-down`) | Aegis |
| Thread of Evolution | strand | G | ändert needlestorm, threadling-grenade (Aegis-Zeilen `super-needlestorm-thread-of-evolution`, `grenade-threadling-thread-of-evolution`) | Aegis |
| Spark of Magnitude | arc | G | ändert pulse-grenade (Aegis-Zeilen `grenade-pulse-spark-of-magnitude`) | Aegis |
| Chaos Accelerant | void | G | ändert axion-bolt-grenade, scatter-grenade, vortex-grenade (Aegis-Zeilen `grenade-axion-bolt-chaos-accelerant`, `grenade-scatter-average-chaos-accelerant`, `grenade-vortex-echo-of-remnants-chaos-accelerant`) | Aegis |
| Echo of Remnants | void | G | ändert vortex-grenade (Aegis-Zeilen `grenade-vortex-echo-of-remnants-chaos-accelerant`, `grenade-vortex-echo-of-remnants`) | Aegis |
| Touch of Winter | stasis | G | ändert glacier-grenade, shatter-grenade (Aegis-Zeilen `grenade-glacier-average-whisper-of-fissures-touch-of-winter`, `grenade-shatter-average-touch-of-winter-whisper-of-fissures`) | Aegis |

## Eigener Schaden (Aegis Sustained)

| Aspect/Fragment | Subklassen | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- | --- |
| Arc Soul | arc | H | 163 alle 1.833 s die ganze Phase (Aegis-Zeile `sustained-arc-soul-facet-of-courage`) | Aegis |
| Hellion | prismatic, solar | H | 466 alle 1.317 s die ganze Phase (Aegis-Zeile `sustained-hellion-ember-of-ashes`) | Aegis |
| Ionic Sentry | arc | H | 181 alle 1 s die ganze Phase (Aegis-Zeile `sustained-ionic-sentry-spark-of-frequency-excludes-bolt-charge`) | Aegis |
| Storm's Keep | arc | H | 678 alle 1.46 s die ganze Phase (Aegis-Zeile `sustained-storm-s-keep-max-practical-bolt-charge-rate`) | Aegis |
| Weaver's Call | prismatic, strand | H | 1120 alle 2.15 s die ganze Phase (Aegis-Zeile `sustained-weaver-s-call-maximum-practical-rate-thread-of-evolution`) | Aegis |

## Ohne Schadenswirkung

Bleak Watcher (prismatic, stasis), Cryoclasm (stasis), Drengr's Lash (prismatic, strand), Echo of Dilation (void), Echo of Domineering (void), Echo of Exchange (void), Echo of Expulsion (void), Echo of Harvest (void), Echo of Leeching (void), Echo of Obscurity (void), Echo of Persistence (void), Echo of Provision (void), Echo of Reprisal (void), Echo of Starvation (void), Ember of Beams (solar), Ember of Benevolence (solar), Ember of Blistering (solar), Ember of Combustion (solar), Ember of Empyrean (solar), Ember of Eruption (solar), Ember of Resolve (solar), Ember of Searing (solar), Ember of Singeing (solar), Ember of Solace (solar), Ember of Tempering (solar), Ember of Wonder (solar), Facet of Awakening (prismatic), Facet of Balance (prismatic), Facet of Blessing (prismatic), Facet of Command (prismatic), Facet of Defiance (prismatic), Facet of Devotion (prismatic), Facet of Generosity (prismatic), Facet of Grace (prismatic), Facet of Honor (prismatic), Facet of Hope (prismatic), Facet of Justice (prismatic), Facet of Mending (prismatic), Facet of Protection (prismatic), Facet of Ruin (prismatic), Facet of Sacrifice (prismatic), Facet of Solitude (prismatic), Feed the Void (prismatic, void), Flechette Storm (strand), Howl of the Storm (stasis), Icarus Dash (solar), Iceflare Bolts (stasis), Juggernaut (arc), Mindspun Invocation (strand), Spark of Amplitude (arc), Spark of Beacons (arc), Spark of Brilliance (arc), Spark of Focus (arc), Spark of Frequency (arc), Spark of Haste (arc), Spark of Ions (arc), Spark of Recharge (arc), Spark of Resistance (arc), The Wanderer (strand), Thread of Ascent (strand), Thread of Binding (strand), Thread of Continuity (strand), Thread of Finality (strand), Thread of Fury (strand), Thread of Generation (strand), Thread of Isolation (strand), Thread of Mind (strand), Thread of Rebirth (strand), Thread of Transmutation (strand), Thread of Wisdom (strand), Vanishing Step (void), Whirling Maelstrom (strand), Whisper of Bonds (stasis), Whisper of Chains (stasis), Whisper of Chill (stasis), Whisper of Conduction (stasis), Whisper of Durance (stasis), Whisper of Fissures (stasis), Whisper of Hedrons (stasis), Whisper of Hunger (stasis), Whisper of Impetus (stasis), Whisper of Refraction (stasis), Whisper of Reversal (stasis), Whisper of Rime (stasis), Whisper of Shards (stasis), Whisper of Torment (stasis), Widow's Silk (strand), Winter's Shroud (prismatic, stasis)
