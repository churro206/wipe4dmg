# Waffen-Import: Prüftabelle

Generiert von `npm run build:weapons` (ADR 0013), nicht von Hand bearbeiten.

Stand: Aegis 2026-10-20, Quantum 2026-10-20 (Quantum nennt keinen Patch pro Zeile), Manifest 245114.26.10.13.2000-1-bnet.66137.

Umfang: exotische Special- und Heavy-Waffen. **0 Pakete**, 137 Items, 4 Lücken.

## Pakete

Pro Shot: „visual Value“ der Aegis-Basiszeile. Shots, Magazin, Reload und Zeit bis leer: Aegis „Sustained“, sonst Quantum (Spalte Timing); stehen beide zur Verfügung, steht der Abgleich in den Hinweisen. Die Feuerrate ist so abgeleitet, dass der Simulator die Zeit bis leer trifft. Skala: kleinste Abweichung Aegis gegen Quantum, über den Einzeltreffer oder den Mittelwert pro Shot.

| Waffe | Typ | Element | Basiszeile (Annahmen) | pro Shot | Timing | Shots | Magazin | Reload | Zeit bis leer | rpm Quantum → abgeleitet | Skala | Hinweise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Items

Waffen aus einer Item-Datei (B4a): Struktur von Hand, Zahlen als Verweise auf die Snapshots. **Prüfen**, wenn ein Text sich seit dem Schreiben der Datei geändert hat.

Sätze mit Zahl ohne `$clarity`- oder `notModelled`-Zitat (ADR 0019): **536**. Die Zahl sinkt je Block.

| Waffe | Datei | Sätze ohne Regel | Prüfen |
| --- | --- | ---: | --- |
| Ace of Spades | `src/data/items/weapons/ace-of-spades.json` | 0 | – |
| Ager's Scepter | `src/data/items/weapons/ager-s-scepter.json` | 7 | – |
| Alethonym | `src/data/items/weapons/alethonym.json` | 0 | – |
| Anarchy | `src/data/items/weapons/anarchy.json` | 0 | – |
| Arbalest | `src/data/items/weapons/arbalest.json` | 1 | – |
| Bad Juju | `src/data/items/weapons/bad-juju.json` | 8 | – |
| Barrow-Dyad | `src/data/items/weapons/barrow-dyad.json` | 0 | – |
| Bastion | `src/data/items/weapons/bastion.json` | 6 | – |
| Black Talon | `src/data/items/weapons/black-talon.json` | 4 | – |
| Borealis | `src/data/items/weapons/borealis.json` | 6 | – |
| Buried Bloodline | `src/data/items/weapons/buried-bloodline.json` | 5 | – |
| Centrifuse | `src/data/items/weapons/centrifuse.json` | 9 | – |
| Cerberus+1 | `src/data/items/weapons/cerberus-1.json` | 0 | – |
| Choir of One | `src/data/items/weapons/choir-of-one.json` | 8 | – |
| Cloudstrike | `src/data/items/weapons/cloudstrike.json` | 0 | – |
| Coldheart | `src/data/items/weapons/coldheart.json` | 0 | – |
| Collective Obligation | `src/data/items/weapons/collective-obligation.json` | 5 | – |
| Conditional Finality | `src/data/items/weapons/conditional-finality.json` | 0 | – |
| Crimson | `src/data/items/weapons/crimson.json` | 7 | – |
| Cryosthesia 77K | `src/data/items/weapons/cryosthesia-77k.json` | 2 | – |
| Cull's Shadow | `src/data/items/weapons/cull-s-shadow.json` | 0 | – |
| D.A.R.C.I. | `src/data/items/weapons/d-a-r-c-i.json` | 12 | – |
| Dead Man's Tale | `src/data/items/weapons/dead-man-s-tale.json` | 0 | – |
| Dead Messenger | `src/data/items/weapons/dead-messenger.json` | 3 | – |
| Deathbringer | `src/data/items/weapons/deathbringer.json` | 0 | – |
| Delicate Tomb | `src/data/items/weapons/delicate-tomb.json` | 0 | – |
| Deterministic Chaos | `src/data/items/weapons/deterministic-chaos.json` | 0 | – |
| Devil's Ruin | `src/data/items/weapons/devil-s-ruin.json` | 8 | – |
| Divinity | `src/data/items/weapons/divinity.json` | 0 | – |
| Dragon's Breath | `src/data/items/weapons/dragon-s-breath.json` | 0 | – |
| Duality | `src/data/items/weapons/duality.json` | 0 | – |
| Edge of Action | `src/data/items/weapons/edge-of-action.json` | 10 | – |
| Edge of Concurrence | `src/data/items/weapons/edge-of-concurrence.json` | 10 | – |
| Edge of Intent | `src/data/items/weapons/edge-of-intent.json` | 9 | – |
| Ergo Sum | `src/data/items/weapons/ergo-sum.json` | 4 | – |
| Eriana's Vow | `src/data/items/weapons/eriana-s-vow.json` | 5 | – |
| Euphony | `src/data/items/weapons/euphony.json` | 0 | – |
| Ex Diris | `src/data/items/weapons/ex-diris.json` | 0 | – |
| Eyes of Tomorrow | `src/data/items/weapons/eyes-of-tomorrow.json` | 7 | – |
| Fafnir | `src/data/items/weapons/fafnir.json` | 0 | – |
| Fighting Lion | `src/data/items/weapons/fighting-lion.json` | 0 | – |
| Final Warning | `src/data/items/weapons/final-warning.json` | 9 | – |
| Finality's Auger | `src/data/items/weapons/finality-s-auger.json` | 0 | – |
| Forerunner | `src/data/items/weapons/forerunner.json` | 5 | – |
| Gjallarhorn | `src/data/items/weapons/gjallarhorn.json` | 8 | – |
| Grand Overture | `src/data/items/weapons/grand-overture.json` | 0 | – |
| Graviton Lance | `src/data/items/weapons/graviton-lance.json` | 9 | – |
| Graviton Spike | `src/data/items/weapons/graviton-spike.json` | 0 | – |
| Hard Light | `src/data/items/weapons/hard-light.json` | 3 | – |
| Hawkmoon | `src/data/items/weapons/hawkmoon.json` | 0 | – |
| Heartshadow | `src/data/items/weapons/heartshadow.json` | 0 | – |
| Heir Apparent | `src/data/items/weapons/heir-apparent.json` | 8 | – |
| Heirloom | `src/data/items/weapons/heirloom.json` | 11 | – |
| Hierarchy of Needs | `src/data/items/weapons/hierarchy-of-needs.json` | 12 | – |
| Ice Breaker | `src/data/items/weapons/ice-breaker.json` | 0 | – |
| Izanagi's Burden | `src/data/items/weapons/izanagi-s-burden.json` | 0 | – |
| Jötunn | `src/data/items/weapons/j-tunn.json` | 0 | – |
| Khvostov 7G-0X | `src/data/items/weapons/khvostov-7g-0x.json` | 0 | – |
| Le Monarque | `src/data/items/weapons/le-monarque.json` | 0 | – |
| Legend of Acrius | `src/data/items/weapons/legend-of-acrius.json` | 0 | – |
| Leviathan's Breath | `src/data/items/weapons/leviathan-s-breath.json` | 2 | – |
| Lodestar | `src/data/items/weapons/lodestar.json` | 12 | – |
| Lord of Wolves | `src/data/items/weapons/lord-of-wolves.json` | 0 | – |
| Lorentz Driver | `src/data/items/weapons/lorentz-driver.json` | 9 | – |
| Lumina | `src/data/items/weapons/lumina.json` | 7 | – |
| Malfeasance | `src/data/items/weapons/malfeasance.json` | 0 | – |
| Merciless | `src/data/items/weapons/merciless.json` | 8 | – |
| Microcosm | `src/data/items/weapons/microcosm.json` | 0 | – |
| MIDA Multi-Tool | `src/data/items/weapons/mida-multi-tool.json` | 11 | – |
| Monte Carlo | `src/data/items/weapons/monte-carlo.json` | 0 | – |
| Necrochasm | `src/data/items/weapons/necrochasm.json` | 10 | – |
| New Land Beyond | `src/data/items/weapons/new-land-beyond.json` | 0 | – |
| New Malpais | `src/data/items/weapons/new-malpais.json` | 0 | – |
| No Time to Explain | `src/data/items/weapons/no-time-to-explain.json` | 0 | – |
| One Thousand Voices | `src/data/items/weapons/one-thousand-voices.json` | 0 | – |
| Osteo Striga | `src/data/items/weapons/osteo-striga.json` | 0 | – |
| Outbreak Perfected | `src/data/items/weapons/outbreak-perfected.json` | 0 | – |
| Parasite | `src/data/items/weapons/parasite.json` | 6 | – |
| Polaris Lance | `src/data/items/weapons/polaris-lance.json` | 0 | – |
| Prometheus Lens | `src/data/items/weapons/prometheus-lens.json` | 0 | – |
| Quicksilver Storm | `src/data/items/weapons/quicksilver-storm.json` | 0 | – |
| Rat King | `src/data/items/weapons/rat-king.json` | 8 | – |
| Red Death Reformed | `src/data/items/weapons/red-death-reformed.json` | 12 | – |
| Revision Zero | `src/data/items/weapons/revision-zero.json` | 0 | – |
| Riskrunner | `src/data/items/weapons/riskrunner.json` | 9 | – |
| Ruinous Effigy | `src/data/items/weapons/ruinous-effigy.json` | 11 | – |
| Salvation's Grip | `src/data/items/weapons/salvation-s-grip.json` | 0 | – |
| Service of Luzaku | `src/data/items/weapons/service-of-luzaku.json` | 13 | – |
| Skyburner's Oath | `src/data/items/weapons/skyburner-s-oath.json` | 0 | – |
| Slayer's Fang | `src/data/items/weapons/slayer-s-fang.json` | 0 | – |
| Sleeper Simulant | `src/data/items/weapons/sleeper-simulant.json` | 0 | – |
| Still Hunt | `src/data/items/weapons/still-hunt.json` | 0 | – |
| Sturm | `src/data/items/weapons/sturm.json` | 0 | – |
| Sunshot | `src/data/items/weapons/sunshot.json` | 0 | – |
| SUROS Regime | `src/data/items/weapons/suros-regime.json` | 0 | – |
| Sweet Business | `src/data/items/weapons/sweet-business.json` | 5 | – |
| Symmetry | `src/data/items/weapons/symmetry.json` | 15 | – |
| Tarrabah | `src/data/items/weapons/tarrabah.json` | 18 | – |
| Telesto | `src/data/items/weapons/telesto.json` | 5 | – |
| Tessellation | `src/data/items/weapons/tessellation.json` | 12 | – |
| The Chaperone | `src/data/items/weapons/the-chaperone.json` | 0 | – |
| The Colony | `src/data/items/weapons/the-colony.json` | 7 | – |
| The Fourth Horseman | `src/data/items/weapons/the-fourth-horseman.json` | 0 | – |
| The Jade Rabbit | `src/data/items/weapons/the-jade-rabbit.json` | 7 | – |
| The Lament | `src/data/items/weapons/the-lament.json` | 0 | – |
| The Last Word | `src/data/items/weapons/the-last-word.json` | 0 | – |
| The Manticore | `src/data/items/weapons/the-manticore.json` | 0 | – |
| The Navigator | `src/data/items/weapons/the-navigator.json` | 7 | – |
| The Prospector | `src/data/items/weapons/the-prospector.json` | 5 | – |
| The Queenbreaker | `src/data/items/weapons/the-queenbreaker.json` | 0 | – |
| The Wardcliff Coil | `src/data/items/weapons/the-wardcliff-coil.json` | 3 | – |
| Third Iteration | `src/data/items/weapons/third-iteration.json` | 0 | – |
| Thorn | `src/data/items/weapons/thorn.json` | 0 | – |
| Thunderlord | `src/data/items/weapons/thunderlord.json` | 0 | – |
| Ticuu's Divination | `src/data/items/weapons/ticuu-s-divination.json` | 0 | – |
| Tommy's Matchbook | `src/data/items/weapons/tommy-s-matchbook.json` | 0 | – |
| Touch of Malice | `src/data/items/weapons/touch-of-malice.json` | 0 | – |
| Tractor Cannon | `src/data/items/weapons/tractor-cannon.json` | 2 | – |
| Traveler's Chosen | `src/data/items/weapons/traveler-s-chosen.json` | 9 | – |
| Trespasser | `src/data/items/weapons/trespasser.json` | 5 | – |
| Trinity Ghoul | `src/data/items/weapons/trinity-ghoul.json` | 0 | – |
| Truth | `src/data/items/weapons/truth.json` | 0 | – |
| Turncoat | `src/data/items/weapons/turncoat.json` | 0 | – |
| Two-Tailed Fox | `src/data/items/weapons/two-tailed-fox.json` | 0 | – |
| Verglas Curve | `src/data/items/weapons/verglas-curve.json` | 4 | – |
| Vex Mythoclast | `src/data/items/weapons/vex-mythoclast.json` | 0 | – |
| Vexcalibur | `src/data/items/weapons/vexcalibur.json` | 26 | – |
| Vigilance Wing | `src/data/items/weapons/vigilance-wing.json` | 7 | – |
| Wavesplitter | `src/data/items/weapons/wavesplitter.json` | 0 | – |
| Whirling Ovation | `src/data/items/weapons/whirling-ovation.json` | 15 | – |
| Whisper of the Worm | `src/data/items/weapons/whisper-of-the-worm.json` | 0 | – |
| Wicked Implement | `src/data/items/weapons/wicked-implement.json` | 8 | – |
| Winterbite | `src/data/items/weapons/winterbite.json` | 0 | – |
| Wish-Ender | `src/data/items/weapons/wish-ender.json` | 8 | – |
| Wish-Keeper | `src/data/items/weapons/wish-keeper.json` | 49 | – |
| Witherhoard | `src/data/items/weapons/witherhoard.json` | 0 | – |
| Xenophage | `src/data/items/weapons/xenophage.json` | 0 | – |

## Optionen

Eine Option gilt im Rechner die ganze Damage Phase. **Markiert (⚠)** sind Optionen mit begrenzter Dauer, mit Bedingung oder ohne gefundene Dauer.

| Waffe | Option | Art | Faktor | Dauer | Bedingung | Hinweise |
| --- | --- | --- | --- | --- | --- | --- |

## Katalysatoren

Was der Katalysator gegen einen Boss tut, entscheiden die Quellen: **Schaden** (Option mit Faktor), **Timing** (Zeile mit Katalysator, gleiche Quelle und Ausführung, sonst Zahlen aus Clarity), **keine** (gemessen ohne Unterschied oder kein Schaden und Timing im Text), **unbekannt** (Clarity nennt Schaden oder Timing, keine Quelle misst es).

| Waffe | Munition | Wirkung | Timing ohne → mit | Text (Anfang) |
| --- | --- | --- | --- | --- |

## Lücken

| Waffe | Typ | Grund |
| --- | --- | --- |
| Praxic Blade | sword | kein Timing: keine Quantum-Zeile |
| The Huckleberry | submachineGun | keine Aegis-Zeile ohne fremde Annahmen |
| Wolfsbane | sword | kein Timing: Aegis: nur Zeilen mit fremden Annahmen; keine Quantum-Zeile |
| Worldline Zero | sword | keine Aegis-Zeile ohne fremde Annahmen |

## Nicht genutzte Aegis-Zeilen

| Waffe | Annahmen | Grund |
| --- | --- | --- |
| Ager's Scepter | average, Will Given Form | Katalysator: Will Given Form |
| Ager's Scepter | average, Will Given Form, Harsh Refraction | Katalysator: Will Given Form; Artefakt: Harsh Refraction |
| Anarchy | average, per trap, double stick, Jolting Feedback | Katalysator: Jolting Feedback |
| Barrow-Dyad | average, Taken Ambition, with Blighted Seekers, Peacekeepers, Target Lock | Exotic-Rüstung: Peacekeepers |
| Black Talon | light | the item file uses another row |
| Choir of One | hitscan | the item file uses another row |
| Choir of One | projectile - point blank | the item file uses another row |
| Cull's Shadow | average, with corruption | the item file uses another row |
| Cull's Shadow | with corruption | the item file uses another row |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt | Katalysator: Networked Targeting x5 |
| D.A.R.C.I. | average, Target Acquired, Networked Targeting x5, with spaced jolt, first mag | Katalysator: Networked Targeting x5 |
| Delicate Tomb | ADS | the item file uses another row |
| Deterministic Chaos | average, with volatile damage, excludes weaken, Target Lock, single mag | Katalysator: Target Lock |
| Devil's Ruin | Pyrogenesis, Collective Action | Katalysator: Collective Action |
| Devil's Ruin | Pyrogenesis | the item file uses another row |
| Divinity | average, Penance, excludes debuff, Jolting Feedback, Focused Fury | Katalysator: Jolting Feedback; Katalysator: Focused Fury |
| Duality | hipfire, body | the item file uses another row |
| Edge of Concurrence | Lightning Seeker | the item file uses another row |
| Ergo Sum | lightweight frame, Jagged Edge, 64 impact, heavy | the item file uses another row |
| Ergo Sum | The Perfect Fifth, caster frame, Pack Hunter, Transcendent, Enduring Blade, 58 impact, 1H2L | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | The Perfect Fifth, caster frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, 1H2L | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | Unplanned Reprieve, wave sword frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, heavy | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | Unplanned Reprieve, lightweight frame, Pack Hunter, Transcendent, Jagged Edge, 62 impact, 1H2L | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Ergo Sum | Unplanned Reprieve, vortex frame, Pack Hunter, Transcendent, Tempered Edge, 61 impact, heavy | fremder Perk: Pack Hunter; nicht modelliert: Transcendent |
| Eriana's Vow | Illegally Modded Holster, Death At First Glance, 7 shots, pre-stacked using heavy burst | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Eriana's Vow | Illegally Modded Holster, Death At First Glance, full mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Final Warning | ADS tap fire | nicht modelliert: ADS tap fire |
| Finality's Auger | Ruinscribe Turret Mode, marked, entire turret duration | nicht modelliert: marked |
| Forerunner | The Rock, excludes impact | Katalysator: The Rock |
| Grand Overture |  | the item file uses another row |
| Graviton Lance | burst, Vorpal Weapon | Katalysator: Vorpal Weapon |
| Graviton Spike | arc mode | the item file uses another row |
| Graviton Spike | average, overcharging both modes, typical boss model, Temporal Alignment | the item file uses another row |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Hawkmoon | Illegally Modded Holster, Paracausal Shot, full mag, pre-stacked using heavy burst | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Heartshadow | light | the item file uses another row |
| Heirloom | average, 1/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, 2/3 charge, with ignition, catalyst | Katalysator: catalyst |
| Heirloom | average, fully charged, with ignition, catalyst | Katalysator: catalyst |
| Hierarchy of Needs | average, 2 rings, fireteam scaling | nicht modelliert: 2 rings; nicht modelliert: fireteam scaling |
| Ice Breaker | shatter ignition, includes shatter and frozen bonuses | nicht modelliert: shatter ignition |
| Izanagi's Burden | Honed Edge x4 | the item file uses another row |
| Lodestar | ADS, burst | the item file uses another row |
| Lord of Wolves | average, includes ignition/scorch, Ember of Ashes | the item file uses another row |
| Malfeasance | average, with slugs, Vorpal Weapon | Katalysator: Vorpal Weapon |
| Malfeasance | Illegally Modded Holster, 17 shots, with slugs, blighted, Vorpal Weapon | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: blighted; Katalysator: Vorpal Weapon |
| Malfeasance | Illegally Modded Holster, 17 shots, with slugs, Vorpal Weapon | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); Katalysator: Vorpal Weapon |
| Merciless | Conserve Momentum x0, full mag | the item file uses another row |
| One Thousand Voices | average, Ember of Ashes | the item file uses another row |
| One Thousand Voices | average, catalyst | Katalysator: catalyst |
| One Thousand Voices | average, Ember of Ashes, catalyst | Katalysator: catalyst |
| One Thousand Voices | average, blighted, catalyst | nicht modelliert: blighted; Katalysator: catalyst |
| One Thousand Voices | average, Ember of Ashes, blighted, catalyst | nicht modelliert: blighted; Katalysator: catalyst |
| Osteo Striga | average, with successive poison, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Outbreak Perfected | average per burst - no nanites, Appended Mag, up to Rewind end | nicht modelliert: up to Rewind end |
| Polaris Lance | average, with ignitions, Ember of Ashes | the item file uses another row |
| Praxic Blade | average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar), Ember of Ashes | gleiche Annahmen wie die Basiszeile |
| Praxic Blade | average, 3L1H, Offensive Form, Forceful Blade III, Impact Core (solar) | gleiche Annahmen wie die Basiszeile |
| Praxic Blade | average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar) | ohne 3L1H der Basiszeile |
| Praxic Blade | average, double hit throw, Offensive Form, Forceful Blade III, Gyro Core (solar), Upper Hand | ohne 3L1H der Basiszeile |
| Prometheus Lens | average, with ignition, Ember of Ashes | the item file uses another row |
| Quicksilver Storm | Grenades Prepped | nicht modelliert: Grenades Prepped |
| Revision Zero | Hunter's Trace, Vorpal Weapon, includes shockwave | the item file uses another row |
| Revision Zero | burst - light 4-burst mode, Vorpal Weapon | the item file uses another row |
| Riskrunner | Arc Conductor, no chains | nicht modelliert: no chains |
| Riskrunner | average, Arc Conductor, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Ruinous Effigy |  | the item file uses another row |
| Salvation's Grip |  | the item file uses another row |
| Salvation's Grip | average, charged, Hail the Storm | Artefakt: Hail the Storm |
| Skyburner's Oath | ADS, Cabal | nicht modelliert: Cabal |
| Skyburner's Oath | average, hipfire, with ignitions, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Skyburner's Oath | average, hipfire, with ignitions, Ember of Ashes, Burning Ambition, Cabal | fremder Perk: Burning Ambition; nicht modelliert: Cabal |
| Still Hunt | Cayde's Retribution, all three shots | the item file uses another row |
| Still Hunt | Cayde's Retribution, Celestial Nighthawk | Exotic-Rüstung: Celestial Nighthawk |
| SUROS Regime | average, Spinning Up | the item file uses another row |
| Symmetry | Arc Seeker Mode, Dynamic Charge x10 | the item file uses another row |
| Symmetry | Arc Seeker Mode, Dynamic Charge x20 | the item file uses another row |
| Tarrabah | Ravenous Beast | the item file uses another row |
| Tarrabah | average, Ravenous Beast, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| Tessellation | Property: Irreducible, Transcendent, Transcendence bonus included | nicht modelliert: Transcendent |
| Tessellation | Property: Irreducible | the item file uses another row |
| The Huckleberry | average, Bull Rider | nicht modelliert: Bull Rider |
| The Huckleberry | average, Bull Rider, Peacekeepers | nicht modelliert: Bull Rider; Exotic-Rüstung: Peacekeepers |
| The Jade Rabbit | Fated Missile x15 | nicht modelliert: Fated Missile x15 |
| The Lament | heavy | the item file uses another row |
| The Lament | average, 2L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 2L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 2L1H, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 2L1H, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 3L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 3L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Lament | average, 4L1H1R, Burning Ambition | Katalysator: Burning Ambition |
| The Lament | average, 4L1H1R, Burning Ambition, Ember of Ashes | Katalysator: Burning Ambition |
| The Last Word | Illegally Modded Holster, hipfire, 1 mag, Envious Assassin | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: 1 mag; Katalysator: Envious Assassin |
| The Last Word | Illegally Modded Holster, hipfire, 1 mag | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants); nicht modelliert: 1 mag |
| The Manticore | average, Hover Mode, Peacekeepers | Exotic-Rüstung: Peacekeepers |
| The Queenbreaker | burst, Combat Sights | the item file uses another row |
| Third Iteration | Amalgamation Round | the item file uses another row |
| Thorn | Illegally Modded Holster, with poison, Soul Devourer, 14 shots | Exotic-Rüstung: Illegally Modded Holster (Lucky Pants) |
| Touch of Malice | blight | nicht modelliert: blight |
| Truth |  | the item file uses another row |
| Turncoat | Overwhelming Power | nicht modelliert: Overwhelming Power |
| Vex Mythoclast | Temporal Unlimiter | the item file uses another row |
| Wavesplitter | average, power cycling, Detonator Beam | Katalysator: Detonator Beam |
| Wavesplitter | average, Supercharged Battery, Detonator Beam | Katalysator: Detonator Beam |
| Whirling Ovation | no charge | the item file uses another row |
| Whirling Ovation | 2/3 charge | the item file uses another row |
| Whirling Ovation | 1/3 charge | the item file uses another row |
| Whisper of the Worm | Whispered Breathing | Katalysator: Whispered Breathing |
| Witherhoard | ground pool | the item file uses another row |
| Wolfsbane | Honed Edge, Jagged Edge, Nano-Assault HLLHLLHLLHLLH, Burning Ambition, includes ignition | gleiche Annahmen wie die Basiszeile |
| Wolfsbane | average, Honed Edge, Jagged Edge, light, Burning Ambition, includes ignition | ohne Nano-Assault HLLHLLHLLHLLH der Basiszeile |
| Worldline Zero | Temporal Sprint, heavy | nicht modelliert: Temporal Sprint |

## Auffällige Annahmen

Ähnliche Schreibweise (Stufe 1) und ohne Beleg eingeordnet (Stufe 5). Bitte prüfen.

| Waffe | Annahme | Einordnung |
| --- | --- | --- |
| The Huckleberry | Bull Rider | nicht modelliert, ohne Beleg |
| Worldline Zero | Temporal Sprint | nicht modelliert, ohne Beleg |

## Kandidaten für neue Effects

Annahmen, die wir noch nicht abbilden, nach Zahl der Waffen.

| Annahme | Art | Waffen |
| --- | --- | --- |
| Bull Rider | nicht modelliert | The Huckleberry |
| Peacekeepers | Exotic-Rüstung | The Huckleberry |
| Temporal Sprint | nicht modelliert | Worldline Zero |

## Wechselwirkungen

Exotic-Rüstung, deren Intrinsic den Waffentyp nennt, und Abilities, die Intrinsic oder Katalysator der Waffe nennen (ADR 0013, Punkt 4). Kandidaten für E1, noch nicht im Rechner.

| Waffe | Exotic-Rüstung | Abilities |
| --- | --- | --- |
| Ace of Spades | Boots of the Assembler, Lucky Pants | – |
| Ager's Scepter | Cenotaph Mask | super |
| Anarchy | – | grenade |
| Arbalest | Rain of Fire | – |
| Bad Juju | – | super |
| Barrow-Dyad | Peacekeepers | – |
| Bastion | Rain of Fire | melee |
| Black Talon | Stronghold | – |
| Buried Bloodline | Mechaneer's Tricksleeves | – |
| Centrifuse | Actium War Rig | – |
| Cerberus+1 | Actium War Rig | – |
| Choir of One | Actium War Rig | – |
| Coldheart | Cenotaph Mask | – |
| Conditional Finality | No Backup Plans | – |
| Crimson | Boots of the Assembler, Lucky Pants | – |
| Cryosthesia 77K | Mechaneer's Tricksleeves | – |
| Cull's Shadow | Rain of Fire | melee |
| Dead Messenger | – | grenade, super |
| Deathbringer | Hazardous Propulsion | – |
| Delicate Tomb | Rain of Fire | – |
| Deterministic Chaos | Actium War Rig | – |
| Devil's Ruin | Mechaneer's Tricksleeves | – |
| Divinity | Cenotaph Mask | – |
| Dragon's Breath | Hazardous Propulsion | – |
| Duality | No Backup Plans | – |
| Edge of Action | Triton Vice | melee |
| Edge of Concurrence | Triton Vice | melee |
| Edge of Intent | Triton Vice | melee |
| Ergo Sum | Stronghold | classAbility, grenade, melee |
| Eriana's Vow | Boots of the Assembler, Lucky Pants | – |
| Euphony | Rain of Fire | – |
| Eyes of Tomorrow | Hazardous Propulsion | grenade |
| Fafnir | Rain of Fire | – |
| Fighting Lion | – | grenade |
| Final Warning | Mechaneer's Tricksleeves | – |
| Finality's Auger | Rain of Fire | – |
| Forerunner | Mechaneer's Tricksleeves | grenade |
| Gjallarhorn | Hazardous Propulsion | – |
| Grand Overture | Actium War Rig | – |
| Graviton Lance | – | super |
| Graviton Spike | Boots of the Assembler, Lucky Pants | – |
| Hard Light | Actium War Rig | – |
| Hawkmoon | Boots of the Assembler, Lucky Pants | – |
| Heartshadow | Stronghold | – |
| Heir Apparent | Actium War Rig | – |
| Heirloom | Oathkeeper | – |
| Hierarchy of Needs | Oathkeeper | – |
| Jötunn | Rain of Fire | – |
| Khvostov 7G-0X | Actium War Rig | – |
| Le Monarque | Oathkeeper | – |
| Legend of Acrius | No Backup Plans | – |
| Leviathan's Breath | Oathkeeper | – |
| Lodestar | Cenotaph Mask | – |
| Lord of Wolves | No Backup Plans | – |
| Lorentz Driver | Rain of Fire | – |
| Lumina | Boots of the Assembler, Lucky Pants | – |
| Malfeasance | Boots of the Assembler, Lucky Pants | super |
| Merciless | Rain of Fire | – |
| Microcosm | Cenotaph Mask | super |
| Monte Carlo | Actium War Rig | melee |
| Necrochasm | Actium War Rig | – |
| One Thousand Voices | Rain of Fire | – |
| Osteo Striga | Peacekeepers | – |
| Praxic Blade | Stronghold | – |
| Prometheus Lens | Cenotaph Mask | – |
| Quicksilver Storm | Actium War Rig | grenade |
| Rat King | Mechaneer's Tricksleeves | – |
| Riskrunner | Peacekeepers | – |
| Ruinous Effigy | Cenotaph Mask | – |
| Service of Luzaku | Actium War Rig | – |
| Slayer's Fang | No Backup Plans | – |
| Sleeper Simulant | Rain of Fire | – |
| Still Hunt | – | super |
| Sturm | Boots of the Assembler, Lucky Pants | – |
| Sunshot | Boots of the Assembler, Lucky Pants | – |
| SUROS Regime | Actium War Rig | – |
| Sweet Business | Actium War Rig | – |
| Tarrabah | Peacekeepers | – |
| Telesto | Rain of Fire | – |
| Tessellation | Rain of Fire | grenade |
| The Chaperone | No Backup Plans | – |
| The Colony | – | grenade |
| The Fourth Horseman | No Backup Plans | – |
| The Huckleberry | Peacekeepers | – |
| The Lament | Stronghold | – |
| The Last Word | Boots of the Assembler, Lucky Pants | – |
| The Manticore | Peacekeepers | – |
| The Navigator | Cenotaph Mask | – |
| The Prospector | – | grenade |
| The Queenbreaker | Rain of Fire | – |
| The Wardcliff Coil | Hazardous Propulsion | – |
| Thorn | Boots of the Assembler, Lucky Pants | – |
| Thunderlord | Actium War Rig | – |
| Ticuu's Divination | Oathkeeper | – |
| Tommy's Matchbook | Actium War Rig | – |
| Tractor Cannon | No Backup Plans | – |
| Traveler's Chosen | Mechaneer's Tricksleeves | classAbility, grenade, melee |
| Trespasser | Mechaneer's Tricksleeves | – |
| Trinity Ghoul | Oathkeeper | – |
| Truth | Hazardous Propulsion | – |
| Turncoat | Boots of the Assembler, Lucky Pants | – |
| Two-Tailed Fox | Hazardous Propulsion | – |
| Verglas Curve | Oathkeeper | – |
| Vex Mythoclast | Rain of Fire | – |
| Vexcalibur | Triton Vice | – |
| Wavesplitter | Cenotaph Mask | – |
| Whirling Ovation | Hazardous Propulsion | – |
| Winterbite | Triton Vice | – |
| Wish-Ender | Oathkeeper | – |
| Wish-Keeper | Oathkeeper | – |
| Wolfsbane | Stronghold | – |
| Worldline Zero | Stronghold | – |
| Xenophage | Actium War Rig | – |
