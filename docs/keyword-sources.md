# Keyword-Quellen: Prüftabelle

Generiert von `npm run build:keywords` (ADR 0015, U4b), nicht von Hand bearbeiten.

Quelle: Compendium-Subklassen-Reiter (`compendium-abilities.json`). Regel pro Satz: „inflict(s)/apply … Keyword“, „grants xN Bolt Charge“, „grant … Rounds to … Weapons“. Ein Boss, keine Adds: Kills feuern in der Damage Phase nie.

| Art | Anzahl |
| --- | --- |
| Ability setzt es mit eigenen Treffern (U5) | 41 |
| Aspect/Fragment setzt es auf genannte Treffer (U6) | 3 |
| Kill-Buff mit Dauer: Option „vorher aufgebaut“ | 4 |
| Kill ohne Dauer: feuert in der Damage Phase nie | 3 |
| Auslöser Class Ability (U7) | 3 |
| Aspect/Fragment mit eigenem Schaden oder geänderter Ability, ohne genannten Treffer (U6 prüft) | 19 |
| Definition im Glossary | 5 |

## Ability setzt es mit eigenen Treffern (U5)

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arc | Grenade Abilities | Touch of Thunder | jolt | – | – | – | „inflict Jolt“ |
| Arc | Grenade Abilities | Touch of Thunder | boltCharge | 5 | – | – | „Grants x5 Bolt Charge“ |
| Arc | Super Abilities | Gathering Storm | jolt | – | – | – | „inflicts jolt“ |
| Arc | Melee Abilities | Chain Lightning | jolt | – | – | – | „inflicting Jolt“ |
| Arc | Super Abilities | Stormtrance | jolt | – | – | – | „inflict jolt“ |
| Solar | Grenade Abilities | Firebolt Grenade | ignition | 20 | – | – | „inflict x20+10 Scorch“ |
| Solar | Grenade Abilities | Fusion Grenade | ignition | 40 | – | – | „inflict x40+20 Scorch“ |
| Solar | Grenade Abilities | Touch of Flame | ignition | 40 | – | – | „inflicts x40+20 Scorch“ |
| Solar | Grenade Abilities | Incendiary Grenade | ignition | 60 | – | – | „inflicts x60+30 Scorch“ |
| Solar | Grenade Abilities | Solar Grenade | ignition | 17 | – | – | „inflicts x17+4.5 [x10+10] Scorch“ |
| Solar | Grenade Abilities | Solar Grenade | ignition | 17 | – | – | „inflicts up to x17+13 Scorch“ |
| Solar | Grenade Abilities | Solar Grenade | ignition | – | – | – | „inflicting scorch“ |
| Solar | Grenade Abilities | Swarm Grenade | ignition | 5 | – | – | „inflicts x5+3 Scorch“ |
| Solar | Grenade Abilities | Swarm Grenade | ignition | 45 | – | – | „inflicts x45+27 Scorch“ |
| Solar | Grenade Abilities | Thermite Grenade | ignition | 10 | – | – | „inflicting x10+10 Scorch“ |
| Solar | Grenade Abilities | Thermite Grenade | ignition | 40 | – | – | „inflicts x40+40 Scorch“ |
| Solar | Grenade Abilities | Tripmine Grenade | ignition | 40 | – | – | „inflicting x40+20 Scorch“ |
| Solar | Melee Abilities | Knife Trick | ignition | 20 | – | – | „inflict x20+10 Scorch“ |
| Solar | Melee Abilities | Knife Trick | ignition | 60 | – | – | „and x60+30 Scorch“ |
| Solar | Super Abilities | Golden Gun: Deadshot | ignition | 40 | – | – | „inflicts x40+10 Scorch“ |
| Solar | Super Abilities | Golden Gun: Marksman | ignition | 40 | – | – | „inflicts x40+10 Scorch“ |
| Solar | Melee Abilities | Hammer Strike | ignition | 40 | – | – | „inflicts x40+20 Scorch“ |
| Solar | Super Abilities | Burning Maul | ignition | 3 | – | – | „apply x3+2 Scorch“ |
| Solar | Class Abilities | Phoenix Dive | ignition | 40 | – | – | „inflicts x40+20 Scorch“ |
| Solar | Melee Abilities | Celestial Fire | ignition | 10 | – | – | „inflict x10+5 Scorch“ |
| Solar | Melee Abilities | Celestial Fire | ignition | 30 | – | – | „inflict x30+15 Scorch“ |
| Solar | Melee Abilities | Incinerator Snap | ignition | 20 | – | – | „apply x20+10 [x10+5] Scorch“ |
| Solar | Melee Abilities | Incinerator Snap | ignition | 100 | – | – | „apply up to x100+50 [x50+25] Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | – | – | – | „inflicts Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 40 | – | – | „inflicting x40+20 Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 10 | – | – | „inflicting x10+5 Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 60 | – | – | „inflicts x60+30 Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 20 | – | – | „inflicting x20+10 [x10+5] Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 60 | – | – | „inflicts x60+30 Scorch“ |
| Solar | Super Abilities | Daybreak | ignition | 50 | – | – | „inflicting x50+0 Scorch“ |
| Solar | Super Abilities | Daybreak | ignition | 60 | – | – | „inflicting x60+30 Scorch“ |
| Void | Grenade Abilities | Handheld Supernova Chaos Accelerant | volatile | – | – | – | „inflict Volatile“ |
| Void | Grenade Abilities | Handheld Supernova Chaos Accelerant | volatile | – | – | – | „inflict Volatile“ |
| Void | Melee Abilities | Pocket Singularity | volatile | – | – | – | „inflicting Volatile“ |
| Void | Super Abilities | Nova Warp | volatile | – | – | – | „inflicting Volatile“ |
| Strand | Melee Abilities | Arcane Needle | unravel | – | – | – | „inflicting unravel“ |

## Aspect/Fragment setzt es auf genannte Treffer (U6)

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arc | Fragments | Shock | jolt | – | arc: grenade | – | „inflict Jolt“ |
| Void | Aspects | Controlled Demolition | volatile | – | void: grenade, melee, super, classAbility | – | „inflicts Volatile“ |
| Prismatic | Fragments | Dominance | jolt | – | arc: grenade | – | „inflicts Jolt“ |

## Kill-Buff mit Dauer: Option „vorher aufgebaut“

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Void | Fragments | Instability | volatile | – | void: weapon | 11.25 s | „grant Volatile Rounds to Void Weapons“ |
| Strand | Fragments | Propagation | unravel | – | strand: weapon | 8 s | „Grants Unraveling Rounds to Strand Weapons“ |
| Prismatic | Fragments | Bravery | volatile | – | void: weapon | 11.25 s | „grant Volatile Rounds to Void Weapons“ |
| Prismatic | Fragments | Bravery | unravel | – | strand: weapon | 11.25 s | „grant Unraveling Rounds to Strand Weapons“ |

## Kill ohne Dauer: feuert in der Damage Phase nie

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arc | Super Abilities | Arc Staff | boltCharge | 1 | – | – | „grant x1 Bolt Charge“ |
| Arc | Aspect | Tempest Strike | boltCharge | 1 | – | – | „grants x1 Bolt Charge“ |
| Void | Fragments | Cessation | volatile | – | – | – | „inflicting Volatile“ |

## Auslöser Class Ability (U7)

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arc | Aspect | Lethal Current | jolt | – | – | – | „inflicts Jolt“ |
| Arc | Aspect | Storm's Keep | boltCharge | 4 | – | – | „Grants x4 Bolt Charge“ |
| Arc | Aspect | Storm's Keep | boltCharge | 6 | – | – | „grants x6 Bolt Charge“ |

## Aspect/Fragment mit eigenem Schaden oder geänderter Ability, ohne genannten Treffer (U6 prüft)

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arc | Fragments | Discharge | boltCharge | 1 | – | – | „grants x1 Bolt Charge“ |
| Arc | Fragments | Instinct | jolt | – | – | – | „inflicting Jolt“ |
| Arc | Fragments | Momentum | boltCharge | 3 | – | – | „grants x3 Bolt Charge“ |
| Arc | Aspect | Tempest Strike | jolt | – | – | – | „inflicting Jolt“ |
| Arc | Aspect | Touch of Thunder | jolt | – | – | – | „inflict jolt“ |
| Arc | Aspect | Touch of Thunder | boltCharge | 5 | – | – | „grant x5 Bolt Charge“ |
| Arc | Aspect | Ionic Sentry | boltCharge | 1 | – | – | „Grants x1 Bolt Charge“ |
| Arc | Aspect | Lightning Surge | jolt | – | – | – | „inflict Jolt“ |
| Solar | Fragments | Char | ignition | 40 | – | – | „inflict x40+20 Scorch“ |
| Solar | Aspects | Crackshot | ignition | 20 | – | – | „inflict x20+10 Scorch“ |
| Solar | Aspects | Consecration | ignition | 40 | – | – | „inflicting x40+20 Scorch“ |
| Solar | Aspects | Roaring Flames | ignition | 30 | – | – | „inflict x30+10 Scorch“ |
| Solar | Aspects | Shieldburst | ignition | 20 | – | – | „inflicts x20+10 Scorch“ |
| Solar | Aspects | Shieldburst | ignition | 50 | – | – | „inflicts x50+25 Scorch“ |
| Solar | Aspects | Shieldburst | ignition | 5 | – | – | „inflicting x5+5 Scorch“ |
| Solar | Aspects | Sol Invictus | ignition | 5 | – | – | „inflict x5+3 Scorch“ |
| Solar | Aspects | Hellion | ignition | 30 | – | – | „inflict x30+10 Scorch“ |
| Void | Aspects | Chaos Accelerant | volatile | – | – | – | „inflicts Volatile“ |
| Prismatic | Aspects | Lightning Surge | jolt | – | – | – | „inflict Jolt“ |

## Definition im Glossary

| Reiter | Abschnitt | Eintrag | Keyword | Stapel | Filter | Dauer | Zitat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Arc | Glossary | Jolted | jolt | – | – | – | „applies Jolt“ |
| Void | Glossary | Volatile | volatile | – | – | – | „applies Volatile“ |
| Void | Glossary | Volatile Rounds | volatile | – | – | – | „inflict Volatile“ |
| Strand | Glossary | Unravel | unravel | – | – | – | „applies Unravel“ |
| Strand | Glossary | Unraveling Rounds | unravel | – | – | – | „inflict Unravel“ |

## Keywords der Abilities (U5)

Stapel pro Einsatz: größte genannte Zahl des Eintrags („with all 9 drones“), „per shot“ mal Shots. Im Aegis-Paket eingerechnet: Aegis nennt den Keyword-Schaden in den Ticks; die Zahl der Auslösungen folgt aus den Stapeln aller Einsätze der Messung (mit Ember-Bonus, wenn Aegis Ember of Ashes annimmt). Beim Laden wird dieser Schaden aus dem Paket herausgerechnet, der Keyword-Lauf fügt ihn wieder hinzu.

| Ability | Keyword | Stapel pro Einsatz | Im Paket eingerechnet | Zitat |
| --- | --- | --- | --- | --- |
| gathering-storm | jolt | – | 1 × 228 (1 hits x16576 damage every 0 ms, cooldown 800 ms -> 1 trigger(s) of 228 (miscellaneous-jolt) in Aegis row super-gathering-storm) | „inflicts jolt“ |
| stormtrance | jolt | – | 13 × 228 (39 hits x769 damage every 340 ms, cooldown 800 ms -> 13 trigger(s) of 228 (miscellaneous-jolt) in Aegis row super-stormtrance) | „inflict jolt“ |
| golden-gun-deadshot | ignition | 240 | 1 × 1553 (6 hits x50 stacks every 400 ms, cooldown 1300 ms -> 1 trigger(s) of 1553 (miscellaneous-ignition) in Aegis row super-golden-gun-deadshot-radiant-ember-of-ashes) | „inflicts x40+10 Scorch“ |
| golden-gun-marksman | ignition | 120 | 1 × 1553 (3 hits x40 stacks every 400 ms, cooldown 1300 ms -> 1 trigger(s) of 1553 (miscellaneous-ignition) in Aegis row super-golden-gun-marksman-radiant) | „inflicts x40+10 Scorch“ |
| burning-maul | ignition | 3 | – | „apply x3+2 Scorch“ |
| daybreak | ignition | 750 | 5 × 1553 (15 hits x50 stacks every 800 ms, cooldown 1300 ms -> 5 trigger(s) of 1553 (miscellaneous-ignition) in Aegis row super-daybreak-ember-of-ashes) | „inflicting x50+0 Scorch“ |
| nova-warp | volatile | – | 7 × 216 (20 hits x1950 damage every 700 ms, cooldown 1000 ms -> 7 trigger(s) of 216 (miscellaneous-volatile) in Aegis row super-nova-warp) | „inflicting Volatile“ |
| firebolt-grenade | ignition | 20 | 1 × 1592 (4 uses x30 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row grenade-firebolt-average-ember-of-ashes-with-ignition) | „inflict x20+10 Scorch“ |
| fusion-grenade | ignition | 40 | 1 × 1592 (2 uses x60 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row grenade-fusion-average-ember-of-ashes-with-ignition) | „inflict x40+20 Scorch“ |
| incendiary-grenade | ignition | 60 | 1 × 1592 (2 uses x90 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row grenade-incendiary-average-ember-of-ashes-with-ignition) | „inflicts x60+30 Scorch“ |
| solar-grenade | ignition | 17 | – | „inflicts x17+4.5 [x10+10] Scorch“ |
| swarm-grenade | ignition | 45 | 1 × 1592 (3 uses x45 stacks -> 1 trigger(s) in Aegis row grenade-swarm-average-with-ignition) | „inflicts x45+27 Scorch“ |
| thermite-grenade | ignition | 40 | 10 × 1592 (20 uses x80 stacks (with Ember of Ashes) -> 10 trigger(s) in Aegis row grenade-thermite-average-ember-of-ashes-with-ignition) | „inflicts x40+40 Scorch“ |
| tripmine-grenade | ignition | 40 | 1 × 1592 (2 uses x60 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row grenade-tripmine-average-ember-of-ashes-with-ignition) | „inflicting x40+20 Scorch“ |
| knife-trick | ignition | 60 | 1 × 1553 (2 uses x90 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row melee-knife-trick-average-precision-ember-of-ashes-with-ignition) | „and x60+30 Scorch“ |
| hammer-strike | ignition | 40 | – | „inflicts x40+20 Scorch“ |
| celestial-fire | ignition | 30 | 1 × 1553 (3 uses x45 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row melee-celestial-fire-average-ember-of-ashes-with-ignition) | „inflict x30+15 Scorch“ |
| incinerator-snap | ignition | 100 | 1 × 1553 (1 uses x150 stacks (with Ember of Ashes) -> 1 trigger(s) in Aegis row melee-incinerator-snap-ember-of-ashes) | „apply up to x100+50 [x50+25] Scorch“ |
| pocket-singularity | volatile | – | – | „inflicting Volatile“ |

### Lücken

| Ability | Keyword | Grund |
| --- | --- | --- |
| arcane-needle | unravel | Dauer des Keywords hängt an der Quelle und fehlt im Text |
