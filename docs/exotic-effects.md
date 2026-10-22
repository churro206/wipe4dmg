# Prüftabelle Exotic-Effekte

Erzeugt von `npm run build:armor` (ADR 0015, U6-1), nicht von Hand bearbeiten.
Quellen: Court's Stacking Guide, Compendium „Exotic Armors“, Clarity. Ein Boss, keine Adds; Stufen zählen mit dem höchsten Wert (optimal gespielt).
Gegenprobe: Court-Wert gegen die Werte aus Compendium und Clarity.

| Art | Zeilen |
| --- | --- |
| Immer aktiv (Regel 6) | 2 |
| Vorher aufgebaut, Option (Regel 3) | 9 |
| Kill-Buff ohne Dauer (Regel 3) | 2 |
| Auslöser in der Rotation, U6-1b (Regel 4) | 12 |
| Auslöser Class Ability, U7 (Regel 4) | 3 |
| Braucht einen anderen Buff, U6-2 (Regel 5) | 3 |
| Ability nicht im Modell (Regel 6) | 3 |
| Stapel pro Waffentreffer, später (Regel 7) | 3 |
| Wirkt nicht gegen einen Boss (Regel 1) | 6 |
| Eigener Schaden, später (Regel 2) | 1 |
| Lücke (Regel 8) | 0 |

## Immer aktiv (Regel 6)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Fortune's Favor | 6 | immer aktiv: +15 % auf weapon | Compendium 20 %, Clarity 15 % |
| Young Ahamkara's Spine | 6 | immer aktiv: +14 % auf grenade, nur Tripmine Grenade | Compendium 14 %, Clarity 14 % |

## Vorher aufgebaut, Option (Regel 3)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Doom Fang Pauldron | 3 | vorher aufgebaut: surge +25 % für 11 s („Adds 1x Surge Stack: ~2 Void Kills (average) (up to 4 stacks)“) | nur Court |
| Eternal Warrior | 3 | vorher aufgebaut: surge +25 % für 11 s („Adds 1x Surge stack: ~2 Arc Kills (average) (up to 4 stacks)“) | nur Court |
| Gyrfalcon's Hauberk | 3 | vorher aufgebaut: empowering +35 % für 6 s („Finishing while Invisible provides a damage buff“) | Court = Text (35 %) |
| Hallowfire Heart | 3 | vorher aufgebaut: +150 % auf super (solar) für 20 s („Kills“ … „for 20 seconds“) | Compendium 150 %, Clarity – |
| Khepri's Sting | 3 | vorher aufgebaut: debuff +15 % für 15 s („Killing a Weakened energy causes a Weakening Smoke Cloud around enemy death location“) | nur Court |
| Sealed Ahamkara Grasps | 3 | vorher aufgebaut: empowering +35 % für 7 s („Powered Melees and Finisher kills grant Nightmare Fuel which grants a damage buff on freshly drawn weapons“) | Court = Text (35 %) |
| Verity's Brow | 3 | vorher aufgebaut: +100 % auf grenade für 8 s („Kill“ … „for 8 seconds“) | Compendium 100 %, Clarity 100 % |
| Wormgod Caress | 3 | vorher aufgebaut: empowering +35 % für 3 s („Melee, Glaive Melee, or Finisher kill adds a stack of 'Burning Fists' which increases weapon damage Stacks decay over time and drop down a stack; higher stacks decay faster“) | Abweichung: Court 35 %, Text 80 / 20 % |
| Wormhusk Crown | 3 | vorher aufgebaut: +15 % auf grenade, super, classAbility (solar) für 10 s („kills“ … „for 10 seconds“) | Compendium –, Clarity 15 % |

## Kill-Buff ohne Dauer (Regel 3)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Actium War Rig | 3 | Kill-Buff ohne Dauer in Court (1.6% per stack für ~; „Auto Rifle or Machine Gun kills grant a damage bonus to them Stacks up to x10“) | Abweichung: Court 1.6 %, Text 15 / 1.5 % |
| Felwinter's Helm | 3 | Kill-Buff ohne Dauer in Court (30% für ~; „Powered Melee kill or Finisher applies a burst of Void energy“) | nur Court |

## Auslöser in der Rotation, U6-1b (Regel 4)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Blight Ranger | 4 | Auslöser in der Rotation („Instant 4x Surge Stacks: Arc Staff Super deactivation“), U6-1b | Abweichung: Court 25 %, Text 400 % |
| Chromatic Fire | 4 | Auslöser in der Rotation („Precision kill causes a Void AOE which applies Weaken“; Debuff hängt vom Element des Supers ab), U6-1b | nur Court |
| Contraverse Hold | 4 | Auslöser in der Rotation („Charged Grenade applies Weaken“), U6-1b | nur Court |
| Felwinter's Helm | 4 | Auslöser in der Rotation („Powered Melee hit applies Weaken“), U6-1b | nur Court |
| Foetracer | 4 | Auslöser in der Rotation („Instant 4x Surge Stacks: Elemental Ability Damage hit on "Powerful Combatants" or Guardians“), U6-1b | nur Court |
| Heart of Inmost Light | 4 | Auslöser in der Rotation („Super Ability Cast“), U6-1b | Compendium 35 %, Clarity 35 % |
| Mantle of Battle Harmony | 4 | Auslöser in der Rotation („Instant 4x Surge Stacks: Matching Weapon Damage kill while matching Super is Charged“), U6-1b | nur Court |
| Mantle of Battle Harmony | 4 | Auslöser in der Rotation („Instant 4x Surge Stacks On Super end: Grants Arc, Solar, Void, Stasis, and Strand Weapon Surges“), U6-1b | nur Court |
| Sanguine Alchemy | 4 | Auslöser in der Rotation („Instant 4x Surge Stacks: While in any Rift or Well of Radiance“), U6-1b | Abweichung: Court 25 %, Text 10 % |
| Second Chance | 4 | Auslöser in der Rotation („Shield Throw hit applies Weaken“), U6-1b | nur Court |
| Star-Eater Scales | 4 | Auslöser in der Rotation („On Super Cast“), U6-1b | Compendium 70 %, Clarity 70 % |
| Stormdancer's Brace | 4 | Auslöser in der Rotation („Hits and Kills“), U6-1b | Compendium –, Clarity 200 % |

## Auslöser Class Ability, U7 (Regel 4)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Gwisin Vest | 4 | Auslöser Class Ability („Exiting Invisibility near an enemy causes a Weaking Smoke Cloud around you“), U7 | nur Court |
| Hazardous Propulsion | 4 | Auslöser Class Ability („Damaging targets with Exodus Rockets (Class Ability) 6x provides the highest buff“), U7 | nur Court |
| Mask of Bakris | 4 | Auslöser Class Ability („Light Shift (Class Ability activation) activation grants a stack Stacks up to x3“), U7 | Abweichung: Court 33 %, Text 10 % |

## Braucht einen anderen Buff, U6-2 (Regel 5)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Fr0st-EE5 | 5 | braucht einen anderen Buff („Stasis Surge Stacks: While any stacks of Frost Armor are active“), U6-2 | nur Court |
| No Backup Plans | 5 | braucht einen anderen Buff („While having an active passive Elemental Buff: provides a damage buff to Shotguns only“), U6-2 | Court = Text (35 %) |
| The Path of Burning Steps | 5 | braucht einen anderen Buff („Roaring Flame stacks grant increased Solar Weapon damage Stacks up to x3“), U6-2 | Court = Text (12.4 %) |

## Ability nicht im Modell (Regel 6)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Cadmus Ridge Lancecap | 6 | Bonus nur für „Diamond Lance“, nicht im Modell | Compendium 475 %, Clarity 144 % |
| Eunoia | 6 | Bonus nur für „Hellion Projectiles“, nicht im Modell | Compendium 20 %, Clarity 20 % |
| Peregrine Greaves | 6 | Bonus nur für „Shoulder Charge Abilities“, nicht im Modell | Compendium 550 %, Clarity – |

## Stapel pro Waffentreffer, später (Regel 7)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Lucky Pants | 7 | Stapel pro Waffentreffer („Hits against Combatants grant stacks“), eigenes Modell später | Compendium 45 %, Clarity 45 % |
| Oathkeeper | 7 | Stapel pro Waffentreffer („increased damage every 0.5 seconds“), eigenes Modell später | Compendium 200 %, Clarity 37.5 % |
| Peacekeepers | 7 | Stapel pro Waffentreffer („Hit against a Combatant: Grants a stack“), eigenes Modell später | Compendium 5 %, Clarity 5 % |

## Wirkt nicht gegen einen Boss (Regel 1)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Antaeus Wards | 1 | wirkt nicht gegen einen Boss („Reflected Projectiles deal“) | Compendium 50 %, Clarity 50 % |
| Boots of the Assembler | 1 | wirkt nicht gegen einen Boss („Noble Seekers“) | Compendium 35 %, Clarity 35 % |
| Citan's Ramparts | 1 | wirkt nicht gegen einen Boss („damage towards“) | Compendium 60 %, Clarity 60 % |
| Knucklehead Radar | 1 | wirkt nicht gegen einen Boss („below 30% Health“) | Compendium 20 %, Clarity 20 % |
| Mechaneer's Tricksleeves | 1 | wirkt nicht gegen einen Boss („at Critical Health“) | Compendium 100 %, Clarity 100 % |
| Synthoceps | 1 | wirkt nicht gegen einen Boss („within 15 metres of 3 enemies“) | Compendium 50 %, Clarity 50 % |

## Eigener Schaden, später (Regel 2)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Deimosuffusion | 2 | eigener Schaden („are dealt increasingly“), später | Compendium 112.5 %, Clarity 112.5 % |
