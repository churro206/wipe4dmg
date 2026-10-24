# Prüftabelle Exotic-Effekte

Erzeugt von `npm run build:armor` (ADR 0015, U6-1), nicht von Hand bearbeiten.
Quellen: Court's Stacking Guide, Compendium „Exotic Armors“, Clarity. Ein Boss, keine Adds; Stufen zählen mit dem höchsten Wert (optimal gespielt).
Gegenprobe: Court-Wert gegen die Werte aus Compendium und Clarity.

| Art | Zeilen |
| --- | --- |
| Immer aktiv (Regel 6) | 2 |
| Vorher aufgebaut, Option (Regel 3) | 12 |
| Kill-Buff ohne Dauer (Regel 3) | 2 |
| Fenster aus der Rotation (Regel 4) | 15 |
| Auslöser in der Rotation, offen (Regel 4) | 1 |
| Auslöser Class Ability, U7 (Regel 4) | 1 |
| Gilt mit einem Zustand, z. B. Amplified (Regel 5) | 3 |
| Ability nicht im Modell (Regel 6) | 3 |
| Stapel pro Waffentreffer (Regel 7) | 2 |
| Bonus durch Halten (Regel 7) | 1 |
| Wirkt nicht gegen einen Boss (Regel 1) | 6 |
| Eigener Schaden, später (Regel 2) | 1 |
| Lücke (Regel 8) | 0 |
| Lücke, Zustand unklar (Regel 5) | 0 |

## Immer aktiv (Regel 6)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Fortune's Favor | 6 | immer aktiv: +15 % auf weapon | Compendium 20 %, Clarity 15 % |
| Young Ahamkara's Spine | 6 | immer aktiv: +14 % auf grenade, nur Tripmine Grenade | Compendium 14 %, Clarity 14 % |

## Vorher aufgebaut, Option (Regel 3)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Chromatic Fire | 3 | vorher aufgebaut: debuff +15 % für 6 s, nur mit void Super („Precision kill causes a Void AOE which applies Weaken“) | nur Court |
| Doom Fang Pauldron | 3 | vorher aufgebaut: surge +25 % für 11 s („Adds 1x Surge Stack: ~2 Void Kills (average) (up to 4 stacks)“) | nur Court |
| Eternal Warrior | 3 | vorher aufgebaut: surge +25 % für 11 s („Adds 1x Surge stack: ~2 Arc Kills (average) (up to 4 stacks)“) | nur Court |
| Gyrfalcon's Hauberk | 3 | vorher aufgebaut: empowering +35 % für 6 s („Finishing while Invisible provides a damage buff“) | Court = Text (35 %) |
| Hallowfire Heart | 3 | vorher aufgebaut: +150 % auf super (solar) für 20 s („Kills“ … „for 20 seconds“) | Compendium 150 %, Clarity – |
| Hazardous Propulsion | 3 | vorher aufgebaut: empowering +35 % für 10 s („Damaging targets with Exodus Rockets (Class Ability) 6x provides the highest buff“) | nur Court |
| Khepri's Sting | 3 | vorher aufgebaut: debuff +15 % für 15 s („Killing a Weakened energy causes a Weakening Smoke Cloud around enemy death location“) | nur Court |
| Sealed Ahamkara Grasps | 3 | vorher aufgebaut: empowering +35 % für 7 s („Powered Melees and Finisher kills grant Nightmare Fuel which grants a damage buff on freshly drawn weapons“) | Court = Text (35 %) |
| Spirit of Verity | 3 | vorher aufgebaut: +100 % auf grenade für 4 s („Kill“ … „for 4 seconds“) | Compendium 100 %, Clarity – |
| Verity's Brow | 3 | vorher aufgebaut: +100 % auf grenade für 4 s („Kill“ … „for 4 seconds“) | Compendium 100 %, Clarity 100 % |
| Wormgod Caress | 3 | vorher aufgebaut: empowering +35 % für 3 s („Melee, Glaive Melee, or Finisher kill adds a stack of 'Burning Fists' which increases weapon damage Stacks decay over time and drop down a stack; higher stacks decay faster“) | Abweichung: Court 35 %, Text 80 / 20 % |
| Wormhusk Crown | 3 | vorher aufgebaut: +15 % auf grenade, super, classAbility (solar) für 10 s („kills“ … „for 10 seconds“) | Compendium –, Clarity 15 % |

## Kill-Buff ohne Dauer (Regel 3)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Actium War Rig | 3 | Kill-Buff ohne Dauer in Court (1.6% per stack für ~; „Auto Rifle or Machine Gun kills grant a damage bonus to them Stacks up to x10“) | Abweichung: Court 1.6 %, Text 15 / 1.5 % |
| Felwinter's Helm | 3 | Kill-Buff ohne Dauer in Court (30% für ~; „Powered Melee kill or Finisher applies a burst of Void energy“) | nur Court |

## Fenster aus der Rotation (Regel 4)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Blight Ranger | 4 | ab Ende von Arc Staff: surge +25 % für 21 s („Instant 4x Surge Stacks: Arc Staff Super deactivation“) | Abweichung: Court 25 %, Text 400 % |
| Contraverse Hold | 4 | ab Treffer einer void Grenade: debuff +15 % für 6 s („Charged Grenade applies Weaken“) | nur Court |
| Eternal Warrior | 4 | ab Ende von Fists of Havoc: surge +25 % (arc) für 30 s („On Fists of Havoc End: Grants x4 Arc Weapon Surge for 30“) | Court x4 = 25 % |
| Felwinter's Helm | 4 | ab Treffer von jeder Melee: debuff +15 % für 6 s („Powered Melee hit applies Weaken“) | nur Court |
| Foetracer | 4 | ab Treffer jeder Ability, Element der Ability, nicht auffrischbar: surge +25 % für 16 s („Instant 4x Surge Stacks: Elemental Ability Damage hit on "Powerful Combatants" or Guardians“) | nur Court |
| Gwisin Vest | 4 | ab Cast einer Class Ability: debuff +15 % für 10 s („Exiting Invisibility near an enemy causes a Weaking Smoke Cloud around you“) | nur Court |
| Mantle of Battle Harmony | 4 | bis zum Super-Cast (Super geladen), passend zum Super: surge +25 % für 11 s („Instant 4x Surge Stacks: Matching Weapon Damage kill while matching Super is Charged“) | nur Court |
| Mantle of Battle Harmony | 4 | ab Ende von jedem Super: surge +25 % für 10 s („Instant 4x Surge Stacks On Super end: Grants Arc, Solar, Void, Stasis, and Strand Weapon Surges“) | nur Court |
| Mask of Bakris | 4 | ab Cast einer Class Ability: amplification +10 % für 11 s („Light Shift (Class Ability activation) activation grants a stack Stacks up to x3“) | Court = Text (10 %) |
| Sanguine Alchemy | 4 | ab Cast von Well of Radiance, solange Well steht, passend zum Super: surge +25 % für 30 s („Instant 4x Surge Stacks: While in any Rift or Well of Radiance“) | Abweichung: Court 25 %, Text 10 % |
| Second Chance | 4 | ab Treffer von Shield Throw: debuff +15 % für 10 s („Shield Throw hit applies Weaken“) | nur Court |
| Spirit of the Eternal Warrior | 4 | ab Ende von jedem Super: surge +25 % für 30 s („Instant 4x Surge Stacks: On Super end: Grants Weapon damage buff matching Super Element“) | nur Court |
| Spirit of the Foetracer | 4 | ab Treffer jeder Ability, Element der Ability, nicht auffrischbar: surge +25 % für 16 s („Instant 4x Surge Stacks: Matching Elemental Ability Damage hit on "Powerful Combatants" and Guardians“) | nur Court |
| Spirit of the Star-Eater | 4 | ab jedem Super-Cast: +70 % auf super für 14 s („On Super Cast“ … „for 14 seconds“) | Compendium 70 %, Clarity – |
| Star-Eater Scales | 4 | ab jedem Super-Cast: +70 % auf super für 14 s („On Super Cast“ … „for 14 seconds“) | Compendium 70 %, Clarity 70 % |

## Auslöser in der Rotation, offen (Regel 4)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Stormdancer's Brace | 4 | Stapel aus Treffern in der Ability („Hits and Kills“); das Paket nennt keine Trefferzahl, keine Gegenprobe möglich | Compendium –, Clarity 200 % |

## Auslöser Class Ability, U7 (Regel 4)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Heart of Inmost Light | 4 | Auslöser Class Ability („On Grenade or Class Ability Usage“), U7 | Compendium 35 %, Clarity 35 % |

## Gilt mit einem Zustand, z. B. Amplified (Regel 5)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Fr0st-EE5 | 5 | surge +22 % (stasis), Zustand frostArmor gibt das Exotic selbst („Stasis Surge Stacks: While any stacks of Frost Armor are active“) | nur Court |
| No Backup Plans | 5 | empowering +35 % auf shotgun, braucht amplified oder frostArmor oder wovenMail oder voidOvershield oder restoration („While having an active passive Elemental Buff: provides a damage buff to Shotguns only“) | Court = Text (35 %) |
| The Path of Burning Steps | 5 | amplification +12.4 % (solar), braucht roaringFlames („Roaring Flame stacks grant increased Solar Weapon damage Stacks up to x3“) | Court = Text (12.4 %) |

## Ability nicht im Modell (Regel 6)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Cadmus Ridge Lancecap | 6 | Bonus nur für „Diamond Lance“, nicht im Modell | Compendium 475 %, Clarity 144 % |
| Eunoia | 6 | Bonus nur für „Hellion Projectiles“, nicht im Modell | Compendium 20 %, Clarity 20 % |
| Peregrine Greaves | 6 | Bonus nur für „Shoulder Charge Abilities“, nicht im Modell | Compendium 550 %, Clarity – |

## Stapel pro Waffentreffer (Regel 7)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Lucky Pants | 7 | +45 % pro Stapel, höchstens 10, auf handCannon; Boss nimmt 33 % weniger Schaden von gebufften Schüssen; Fenster 6 s ab Beginn | Compendium 45 %, Clarity 45 % |
| Peacekeepers | 7 | +5 % pro Stapel, höchstens 20, auf submachineGun; Boss nimmt 33 % weniger Schaden von gebufften Schüssen; Lücke über 1 s beendet die Serie | Compendium 5 %, Clarity 5 % |

## Bonus durch Halten (Regel 7)

| Exotic | Regel | Grund | Gegenprobe |
| --- | --- | --- | --- |
| Oathkeeper | 7 | +37.5 % je 0.5 s Halten, höchstens +200 % auf Primary-Bögen; die Engine hält nur, wenn der Schaden pro Sekunde steigt (Gewinn erst ab Schusszyklus über etwa 1,3 s) | Compendium 200 %, Clarity 37.5 % |

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
