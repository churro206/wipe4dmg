# Keyword-Quellen: Prüftabelle

Generiert von `npm run build:keywords` (ADR 0015, U4b), nicht von Hand bearbeiten.

Quelle: Compendium-Subklassen-Reiter (`compendium-abilities.json`). Regel pro Satz: „inflict(s)/apply … Keyword“, „grants xN Bolt Charge“, „grant … Rounds to … Weapons“. Ein Boss, keine Adds: Kills feuern in der Damage Phase nie.

| Art | Anzahl |
| --- | --- |
| Ability setzt es mit eigenen Treffern (U5) | 35 |
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
| Solar | Grenade Abilities | Solar Grenade | ignition | – | – | – | „inflicting scorch“ |
| Solar | Grenade Abilities | Swarm Grenade | ignition | 5 | – | – | „inflicts x5+3 Scorch“ |
| Solar | Grenade Abilities | Swarm Grenade | ignition | 45 | – | – | „inflicts x45+27 Scorch“ |
| Solar | Grenade Abilities | Thermite Grenade | ignition | 10 | – | – | „inflicting x10+10 Scorch“ |
| Solar | Grenade Abilities | Thermite Grenade | ignition | 40 | – | – | „inflicts x40+40 Scorch“ |
| Solar | Grenade Abilities | Tripmine Grenade | ignition | 40 | – | – | „inflicting x40+20 Scorch“ |
| Solar | Melee Abilities | Knife Trick | ignition | 20 | – | – | „inflict x20+10 Scorch“ |
| Solar | Super Abilities | Golden Gun: Deadshot | ignition | 40 | – | – | „inflicts x40+10 Scorch“ |
| Solar | Super Abilities | Golden Gun: Marksman | ignition | 40 | – | – | „inflicts x40+10 Scorch“ |
| Solar | Melee Abilities | Hammer Strike | ignition | 40 | – | – | „inflicts x40+20 Scorch“ |
| Solar | Super Abilities | Burning Maul | ignition | 3 | – | – | „apply x3+2 Scorch“ |
| Solar | Class Abilities | Phoenix Dive | ignition | 40 | – | – | „inflicts x40+20 Scorch“ |
| Solar | Melee Abilities | Celestial Fire | ignition | 10 | – | – | „inflict x10+5 Scorch“ |
| Solar | Melee Abilities | Celestial Fire | ignition | 30 | – | – | „inflict x30+15 Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | – | – | – | „inflicts Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 40 | – | – | „inflicting x40+20 Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 10 | – | – | „inflicting x10+5 Scorch“ |
| Solar | Super Abilities | Song of Flame | ignition | 60 | – | – | „inflicts x60+30 Scorch“ |
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
