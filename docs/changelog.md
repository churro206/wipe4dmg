# Changelog

## Unveröffentlicht

- **Class Ability in der Rotation (U7 Teil 1):** Vierte Ability-Art `classAbility` mit Casts auf der Energie-Zeitachse (Base Cooldown aus dem neuen Compendium-Reiter „Class Abilities“, kein Stat); Klassen und Subklassen aus dem Manifest (`*.class_abilities`). Marksman's Dodge (42 s) lädt die Waffe sofort nach (`refillsMagazine`) und wird beim Wählen und mit „+“ auf das nächste volle Nachladen gesetzt; Rally Barricade gewährt Reload ×0,9 für 20 s (auch über Hoarfrost-Z); Empowering Rift gewährt +20 % für 15 s ab dem Cast und +260 % Grenade-/Melee-Regeneration; Gambler's Dodge gibt eine volle Melee-Leiste. Oberfläche: Super in einer eigenen Zeile, darunter Grenade, Melee und Class Ability; der Effect-Picker „Class Ability“ entfällt. Gate: Marksman's Dodge spart genau ein Gjallarhorn-Nachladen (2,35 s).

- **Gesamtprobe mit Aegis (Block 5):** `npm run import:totals` liest die Spalte Total der Aegis-Reiter „Sustained“ und „Swap“ nach `src/data/aegis-totals.json` (465 Zeilen mit Base, Perk, Surge, Buff, Debuff, Stat 200). `npm run probe` baut 14 Aegis-Zeilen als Builds nach (10 exotische Heavies, 4 Supers), mit den Aegis-Standardfaktoren als Schalter (Surge 3x, Lumina 1,35, Tractor Cannon 1,3, Weapons 200), und schreibt `docs/meta-probe.md`; Limit Break fehlt im Modell und wird aus Aegis herausgerechnet. Grenze ±15 % um den Median; alle 14 liegen bei −3 % bis +6 %. **Gefunden und behoben:** Truth nahm 20 Raketen von Quantum statt 14 von Aegis (Override nach „Aegis vor Quantum“, Timing mit Argent Ordnance wie bei Whirling Ovation; Total −30 %). Gjallarhorn, Leviathan's Breath und Sleeper liegen nur mit Catalyst richtig, weil Aegis mit Catalyst misst.

- **Alle Buffs, Debuffs, Mods und Artifact-Perks aus Court (Block 2):** `npm run build:buffs` liest `court-buffs.json` und schreibt 22 Schalter nach `src/data/buff-effects.json` (Wert und Dauer aus der Court-Zeile, höchste Stufe; Zeilen mit verschobenen Zellen werden erkannt). Die Prüftabelle `docs/buff-import.md` gibt jeder der 98 Court-Zeilen ein Urteil (importiert, schon vorhanden, Weaken 15 %, Exotic-Rüstung, Waffe oder übersprungen mit Grund); ein Test verlangt, dass keine offen bleibt. Neu: Expanding Abyss, die sechs Weaken-Perks, Radiant Orbs, Heart of the Flame, Prismatic Transfer, Weapons of Light (Ward of Dawn), Remote Shield, Precision Equity, That Fresh Bullet Smell, Void Weapon Channelling, Argent Blade/Ordnance/Quiver, Sniper's Meditation, Targeting Autoloader, Arc Compounding und Banner of War (Clarity; nur der Schwert-Teil, Melee und Bladefury fehlen). **Neue Mechanik:** `MultiplierPart.requiresEffectIds` (der Teil gilt nur, solange einer der Effects aktiv ist); damit hebt Expanding Abyss Weaken auf 25 % (Tethers 35 %, Deadfall 40 %), nur für Void und nicht für das Weaken von Exotic-Rüstung. Übersprungen: Song of Flame (Radiant nur in der Super), Harsh Refraction, Solo Operative, Torch, Sect of Force und Raid-Mods. Feast of Light bleibt bei Star-Eater Scales: Der Buff gilt nur für die eigene Super des Trägers, ein Teammitglied gibt ihn nicht weiter. Icons über den Namen im Manifest (`namedIconRefs`); drei ohne Item nutzen das Surge-Icon, Weapons of Light zeigt ein Monogramm.

- **Jolt und Volatile zählen in Super-Paketen nicht mehr doppelt (Block 1 abgeschlossen):** `superTriggers` rechnet jetzt auch Keywords nach, die durch erlittenen Schaden auslösen (Treffer gleich groß aus dem Wipe, der setzende Treffer zählt nur bei Jolt, Volatile verschwindet nach dem Auslösen). Aus dem Aegis-Paket heraus: Stormtrance 13 Jolts (Total −3,1 %), Nova Warp 7 Volatile (−1,4 %), Gathering Storm 1 Jolt. Im Gate macht die Waffe keinen Schaden mehr; Pocket Singularity zählte nie doppelt (Aegis misst 1 Tick, Volatile kam von der Waffe). Supers bleiben Paket (Entscheidung des Inhabers): Ihre Teile liegen −93 % bis +986 % neben Aegis.

- **Abilities aus Compendium-Teilen (Block 1, Muster):** `npm run build:abilities` zerlegt die Compendium-Texte nach Regeln (R1 Wert pro „damage“, R2 Ticks aus „every X seconds for Y seconds“, R3 Verzögerung aus „X seconds after“; Collision zählt nicht) und schreibt `src/data/ability-components.json` und die Prüftabelle `docs/ability-import.md` für alle 75 Abilities. Eine Ability nutzt Teile, wenn sie freigeschaltet ist und das Gate ±15 % gegen Aegis besteht (Inhaber; vorher ±10 %), sonst bleibt sie Paket. Neu als Teile: Thundercrash (Einschlag, Explosion, 4 Aftershocks im Sekundentakt ab 0,75 s; −12 % gegen Aegis) und Fusion Grenade (738, Ignition aus dem Keyword-Lauf; −4 %). Varianten einer Ability aus Teilen erhalten die Teile der Basis mal Aegis Variante ÷ Basis (Cuirass bleibt ×1,56). Das Gate simuliert Abilities aus Teilen mit den Annahmen der Aegis-Zeile als Effects (z. B. Ember).

- **Reload-Stat der Catalysts:** Neue Quelle d2foundry (Oracle Engine, `weapon_formulas.json`): Reload in Sekunden pro Waffentyp aus dem Reload-Stat, Snapshot `src/data/reload-formulas.json` (`npm run import:reload`). Die Formel trifft Aegis' gemessenen Reload nicht (0,44- bis 1,5-fach), deshalb nur als Faktor auf den gemessenen Reload: Reload(Stat + Catalyst) ÷ Reload(Stat), Stat aus dem Manifest, höchstens 100 (Entscheidung des Inhabers). Neu wirksam: Borealis (×0,90), Coldheart (×0,90), Le Monarque (×0,87), Lord of Wolves (×0,77 mit 15 % kürzerer Animation), Osteo Striga (×0,80, +7 % Schaden), Symmetry (×0,91); The Fourth Horseman lädt zusätzlich schneller (×0,66). Unbekannt bleiben 26 (vorher 32).

- **20 weitere Catalysts:** Faktoren aus Clarity-Texten und Quantum-Zeilen mit „cata“: Izanagi's Burden ×1,131 mit Honed-Edge-Timing, Ticuu's Divination ×1,871, Dead Man's Tale ×1,27 mit 140 rpm, Deterministic Chaos ×1,25, Outbreak Perfected ×1,15; Timing: Revision Zero (Refit Fourth Time's The Charm, Magazin 50), Hierarchy of Needs (61 rpm), The Chaperone (27 Slugs, Magazin 9), Heartshadow (15 Heavies). Trinity Ghoul ohne Catalyst zieht 0,123 s länger (Quantum misst nur mit). Zehn weitere wirken nur mit Kills, Gegnergruppen oder unter 30 % Boss-Leben: keine Wirkung. Neu im Override: `timing.catalystValues`. Unbekannt bleiben 32 (vorher 52), davon etwa 12 nur mit Reload-Stat.

- **Choir of One mit Catalyst war 5-mal zu stark:** Der Catalyst nahm die rohe Aegis-Zeile, die Munition zählt, ohne „5 Munition pro Projektil“. Overrides, die das Timing umrechnen, übernehmen keine rohen Catalyst-Zeilen mehr. Die drei Refits brauchen Kills: keine Wirkung. Regel-Test: kein Catalyst verdoppelt den Schaden in 30 s (Ausnahme Ager's Scepter, Will Given Form kostet die Super). **Heartshadow** wählbar (136 von 141): 14 Heavies ohne Catalyst, gegengerechnet aus Aegis (15 mit Catalyst, 4 Munition pro Heavy) und +6 Munition des Catalysts. Geminis übrige Antworten verworfen (erfundene Reiter und Perks, Schaden in falscher Skala).

- **135 von 141 exotischen Waffen:** Das Manifest liefert jetzt die Stats jeder Waffe (RPM, Magazin, Reload, Charge Time) und die Stat-Änderungen der Catalysts (`manifest-weapons.json`). Overrides dürfen Timing-Werte mit Herleitung angeben (`timing.values`). Neu: Turncoat (Manifest 140 rpm, Magazin 13, Reload 1,64 s wie Quantum bei jeder 140er Hand Cannon), Prometheus Lens (Magazin 100, 900 rpm und 5 Magazine wie Quantums Special-Traces), Fafnir (Reload aus Aegis Sustained zurückgerechnet) und Anarchy (Quantum „double-stick“, Catalyst ×1,157 aus Aegis ÷ Quantum). Erkenntnis: Quantum rechnet den Reload fest pro Waffentyp, unabhängig vom Reload-Stat. Hover-Karte des Catalysts zeigt den ganzen Clarity-Text statt nur der ersten Zeile.

- **131 von 141 exotischen Waffen:** Einzelfälle stehen mit Zitat und Herleitung in `src/data/weapon-overrides.json` (neue Regel des Inhabers: eine Quelle genügt, Aegis vor Quantum). Dazu kamen u. a. die Schwerter (ein Treffer pro Combo, weil Aegis Sustained Munition zählt), Merciless (pro Bolzen statt pro Magazin), Choir of One (5 Munition pro Projektil), Witherhoard (volle Blight pro Schuss), Touch of Malice (letzte Patrone), Queenbreaker und SUROS Regime in der stärkeren Ausführung. The Fourth Horseman zählte bisher ein ganzes Magazin als einen Schuss und war etwa 4-mal zu stark. Neue Regel im Plausibilitäts-Gate: In 30 s liegt jede Special- und Heavy-Waffe beim 0,3- bis 2,5-fachen von Gjallarhorn, jede Primary höchstens beim 1-fachen.

- **Catalysts ohne Wirkung am Boss:** Absätze im Clarity-Text, die Kills, mehrere Gegner, Verbündete, Pickups, Schilde oder erlittenen Schaden brauchen, zählen nicht (`bossParagraphs`). 47 Catalysts haben damit keine Wirkung gegen einen Boss ohne Adds (vorher 20). Touch of Malice ×1,25 (Precision Instrument), Graviton Lance und Wish-Keeper ×1,2 (Vorpal Weapon). Geminis Antworten zu Waffen und Catalysts wurden verworfen: Viele widersprachen Clarity.

- **Catalysts für alle Waffen:** Jede Waffe mit Catalyst hat den Schalter. Was er gegen einen Boss tut, entscheiden die Quellen: Schaden (Option mit Faktor, auch aus Quantum „cata“), Timing (Zeile mit Catalyst aus derselben Quelle und Ausführung, sonst Zahlen aus Clarity wie „4🠚7“), keine Wirkung oder unbekannt. 20 wirken, 20 haben am Boss keine Wirkung, 50 sind noch unbekannt. Gjallarhorn, Telesto, Tractor Cannon, Eriana's Vow, Arbalest, The Colony, Legend of Acrius, Hawkmoon und Traveler's Chosen rechneten bisher immer mit dem Magazin des Catalysts; ohne Catalyst machen sie jetzt weniger Schaden. Thunderlord lädt mit Catalyst nicht mehr nach. Die Hover-Karte des Schalters erklärt die Wirkung; der Hinweis zur begrenzten Dauer erscheint nur noch, wenn der Catalyst an ist. Prüftabelle: Abschnitt „Katalysatoren“ in `docs/weapon-import.md`.

- **Exotische Primaries wählbar:** 40 von 61 (z. B. Bad Juju, Ace of Spades, Thorn, Le Monarque). Primary-Munition ist unbegrenzt: Die Waffe schießt mit Reloads bis zum Ende der Damage Phase. Schaden pro Shot von Aegis, Magazin, RPM und Reload von Quantum. Aegis misst Bursts als einen Shot (z. B. Bad Juju 1446 = 3 × 482); das Paket zählt pro Kugel wie Quantum, außer Quantum zählt den ganzen Schuss (Trinity Ghoul, 3 Pfeile). Namen von Aegis und Quantum werden ohne Groß- und Kleinschreibung verglichen. Regel-Test: eine Runde jeder Primary liegt bei 0,5 bis 2 × Quantum. Filter nach Munition im Waffen-Picker.

- **Auswahl aufgeräumt:** Radiant und Weaken stehen nicht mehr unter Fragments, sondern im eigenen Abschnitt „Buffs & Debuffs“. Ein Item mit zwei Wirkungen (Facet of Dominance: Weaken nach Void-Grenade, Jolt nach Arc-Grenade) hat nur noch eine Kachel. Die sechs Aspects und Fragments, die eine Ability ändern (z. B. Knock 'Em Down), haben ihr Icon aus dem Spiel statt Initialen. Regel-Tests: jedes Item erscheint einmal, unter Fragments stehen nur echte Fragments, jedes Item hat ein Icon.

- **Ignition in Solar-Supers zählt nur einmal:** Golden Gun (Marksman, Deadshot) und Daybreak enthielten die Ignitions schon im Aegis-Wert und bekamen sie im Rechner noch einmal dazu. Der Anteil wird jetzt aus dem Paket genommen (Treffer aus dem Super-Timing, Abklingzeit der Ignition) und kommt über den Scorch jedes Treffers zurück. Daybreak setzt dabei x50 Scorch pro Geschoss statt einmal x60 und zündet etwa 5-mal. Regel-Test: jede Ability mit Ignition ergibt allein den Aegis-Wert (±2,5 %).

- **Nur Aspects und Fragments, die wirken:** 25 Items, die nur einen Zustand geben (z. B. Ascension, On Your Mark, Sol Invictus, Touch of Flame), erscheinen nur noch, wenn das gewählte Exotic diesen Zustand braucht (No Backup Plans, Path of Burning Steps). Ein Regel-Test prüft, dass ohne Exotic jedes angebotene Item den Schaden ändert.

- **Aspects und Fragments, die eine Ability ändern:** Knock 'Em Down (Blade Barrage ×1,37), Thread of Evolution, Spark of Magnitude, Chaos Accelerant, Echo of Remnants und Touch of Winter sind jetzt wählbar. Gewählt rechnet die Ability mit der Aegis-Messung mit diesem Aspect; der Tooltip nennt den Schaden pro Einsatz vorher und nachher.

- **Super-Timing:** Der Schaden einer Super verteilt sich auf ihre Schüsse und Angriffe, und die Waffe pausiert nur so lange, wie die Super sie wirklich blockiert (z. B. Daybreak etwa 13 s statt 24 s, Nova Bomb etwa 1,8 s statt 0 s). Die Ignition der Golden Gun kommt mit dem 3. Schuss statt bei 0 s. Die Zeiten sind grobe Schätzungen (Gemini-Recherche) und im Tooltip als „estimate“ markiert.

- **Website auf Englisch:** alle Labels, Hover-Karten, das Wiki, die Roadmap und die Abdeckung; Zahlen im englischen Format (1,234 und ×1.56).
- **Exotic-Rüstung wählbar:** unter „Rüstung“ mit Suche und Filter nach Slot, nur Exotics der gewählten Klasse. Ein Hinweis sagt, was das Exotic im Rechner tut. Viele wirken über die Rotation, z. B. Star-Eater Scales nach dem Super-Cast oder Foetracer nach einem Ability-Treffer. Kill-Buffs (z. B. Doom Fang, Khepri's Sting) gelten nur mit dem Schalter „Vorher aufgebaut“, weil ein Boss ohne Adds keine Kills liefert. Exotic und Schalter stehen im Build-Link (Format 4).
- **Aspects und Fragments** aus allen Subklassen, per Regel aus Compendium und Court: z. B. Spark of Shock (Jolt), Echo of Undermining (Weaken nach Void-Grenade), Ember of Torches (Radiant nach Melee-Treffer), Zustände wie Amplified oder Woven Mail für Exotics wie No Backup Plans.
- **Keywords:** Ignition, Jolt, Volatile, Unravel und Bolt Charge als eigener Schaden; Abilities setzen sie mit ihren Treffern.
- Versionsanzeige unten auf der Seite.
- **Waffenauswahl:** 49 exotische Special- und Heavy-Waffen wählbar, mit Suche und Filter nach Waffentyp. Ein festgehaltener Vergleich behält seine Waffe, so lassen sich zwei Waffen vergleichen. Effects, die zur Waffe nicht passen, sind ausgeblendet (z. B. Ember of Ashes bei Truth). Der Katalysator erscheint nur bei Waffen mit Katalysator, mit Hinweis, wenn er im Spiel nur begrenzt wirkt.
- Waffen-Pakete im Rechner vorbereitet: Der Katalysator wirkt bei importierten Waffen als Faktor (z. B. Truth ×1,40), schon eingerechnete Buffs zählen nicht doppelt.
- Waffen-Import, Teil 5: Clarity als Quelle für Perks, Katalysatoren und Exotic-Rüstung (genannt im Footer und im Wiki). Katalysatoren werden erkannt; ändert ein Katalysator Munition oder Reload, gilt das Timing ohne Katalysator. Whisper of the Worm, Izanagi's Burden und D.A.R.C.I. sind jetzt Pakete, Thunderlord nutzt das Timing ohne Katalysator. 49 Pakete.
- Waffen-Import, Teil 4: Aegis-Zeilen mit Meta-Builds zählen fürs Timing, wenn deren Annahmen laut Text Munition, Reload und Feuerrate nicht ändern (z. B. Dawn Chorus, Solar Fulmination); Argent Ordnance und Sniper's Meditation ändern sie und bleiben gesperrt. 47 Pakete.
- Waffen-Import, Teil 3: Aegis-Reiter „Sustained“ als zweite Quelle für das Timing; beide Quellen werden verglichen, Abweichungen stehen in der Prüftabelle. 44 Pakete.
- Waffen-Import, Teil 2: 38 exotische Special- und Heavy-Waffen als Pakete (Wert pro Shot von Aegis, Timing von Quantum), darunter Truth und Thunderlord; Truths Katalysator Reaper's Tithe als Option ×1,40 (markiert: 15 s, braucht gleichzeitige Kills). Prüftabelle `docs/weapon-import.md`. Noch nicht wählbar.
- Waffen-Import, Teil 1 (ADR 0013): Snapshots der Waffen-Tabellen von Aegis und Quantum sowie der Compendium-Texte zu Exotic Weapons und Weapon Perks. Aus dem Bungie-Manifest 141 exotische Waffen mit Intrinsic, Perks und Katalysator sowie 141 Exotic-Rüstungen. Jede Annahme einer Aegis-Zeile wird automatisch eingeordnet (Intrinsic, Katalysator, Perk, Mod, Effect, Ausführung, Exotic-Rüstung, Artefakt); Rüstung, die einen Waffentyp nennt (z. B. Lucky Pants bei Hand Cannons), wird erkannt.
- Fundament für mehrere Waffen (ADR 0012): Der Rechner lädt jede Waffen-Datei; jede Waffe braucht einen Abgleich mit ihrer Quelle. Ablauf für neue Waffen in `docs/guides/weapons.md`.

## 1.0.0 – 2026-10-20 (Vollversion)

Für Spieler, kurz gesagt:

- **Fähigkeiten und Supers:** Super, Grenade und Melee mit Stats zählen mit, gemessen von Aegis. Während des Supers pausiert die Waffe.
- **Rotation:** Jeder Buff und jede Ability hat ein Zeitfenster auf der Zeitleiste. Der Rechner zählt nur, was gerade aktiv ist.
- **Vergleich und Link:** Zwei Builds nebeneinander, beide Damage Curves in einem Diagramm. Der Build steckt im Link zum Teilen.
- **Optimizer:** probiert Subklassen und Effects und zeigt die 15 besten Builds.
- **Oberfläche wie im Spiel:** Waffe, Klasse, Subklasse, Fähigkeiten, Fragmente, Rüstung, Stats, Artefakt, Fireteam Support. Ingame-Icons.
- **Wiki:** „Wie rechnet der Rechner?“, Abdeckung und Roadmap.

Einschränkungen: nur One Thousand Voices, noch keine Exotic-Rüstung, Optimizer ohne Fähigkeiten. Energie und Cooldowns prüft der Rechner nicht.

Im Detail:

- Oberfläche wie im Spiel: Encounter, Waffe mit Katalysator, Klasse, Subklasse, Fähigkeiten (mit Class Ability), Fragmente, Rüstung (Platz für Exotic, Mods), Stats als Block (Weapons, Super, Grenade, Melee), Artefakt, Fireteam Support.
- Surges wie im Spiel: Surge 1x (neu, +10 %), 2x und 3x als Rüstungs-Mods, immer passend zum Element der Waffe; das Icon zeigt den Mod dieses Elements. Surge 4x gibt es nur über Exotic-Rüstung und ist entfernt, bis Exotic-Rüstung kommt. Alte Links mit Surge 4x öffnen mit Surge 3x und einem Hinweis.
- Wiki (US-15): Schalter „Rechner | Wiki“ oben rechts. Startseite „Wie rechnet der Rechner?“ (Zeitachse, Buckets mit Beispiel, Quellen und Gates, Grenzen), dazu Abdeckung und Roadmap. Erklärungen zu einzelnen Mechanics folgen.
- Fähigkeiten und Supers (US-14, ADR 0009):
  - Drei Plätze für Super, Grenade und Melee mit Ingame-Icons, passend zu Klasse und Subklasse inklusive Prismatic.
  - Stat-Regler 0 bis 200: Über 100 erhöht jeder Punkt den Schaden (Super +0,45 %, Grenade +0,65 %, Melee +0,3 %, laut Compendium).
  - Werte: 25 Supers, 26 Grenades und 24 Melees als gemessener Wert pro Einsatz von Aegis, automatisch importiert und gegen Aegis geprüft. Lücken mit Grund in `docs/coverage.md`.
  - Während eines Supers feuert die Waffe nicht (Super Window). Es ist exakt bei Hammer of Sol (7,8 s), Burning Maul und Chaos Reach, sonst eine Schätzung.
  - Buffs, die Aegis schon eingerechnet hat (Radiant, Ember of Ashes, Tether), zählen nicht doppelt. Ein Super bringt seinen Effect mit, z. B. Well of Radiance oder den Tether.
  - Ein Build hat ein Super: Der Super-Platz ersetzt eigene Super-Effects. Alte Links übernehmen sie auf den Super-Platz.
- Link-Format 3 mit Fähigkeiten und Stats. Ältere Links funktionieren weiter.
- Recherche zu Ember of Ashes, Katalysator, Particle Reconstruction und Buffs auf Supers: drei Fehler im Modell gefunden und dokumentiert. Neue Regel für zerlegte Werte (ADR 0011): Quellen nur als Verhältnis mischen, jede Zerlegung braucht ein Gate.
- Korrigiert: Ember of Ashes bringt jetzt +19 % statt +9 % (jeder Shot zündet), der Katalysator ×1,39 statt ×1,26. Beide stimmen auf 2 % mit Aegis überein.
- Rotation mit Fähigkeiten: eigene Zeile pro Ability in der Zeitleiste, Super Window schraffiert (gestrichelt, wenn geschätzt), Einsatzzeiten in Sekunden, weitere Einsätze über „+“. Energie und Cooldowns prüft der Rechner nicht.
- Breakdown-Tabelle pro Quelle: Multiplier jedes Buckets für die Waffe und jede Ability, „–“ wo ein Bucket nicht wirkt, Schaden pro Quelle in der Fußzeile.
- Donut „Schaden nach Quelle“: Shots, Ignitions und Taken Seeker der Waffe, dazu Super, Grenade und Melee mit Namen und Icon statt technischer IDs. Feste Farben pro Art, geprüft für hellen und dunklen Modus.
- Ingame-Tests eingearbeitet: Shot-Abstand von One Thousand Voices 1,733 s statt 1,818 s (höhere DPS, gleicher Total Damage), Ignition-Cooldown 1,3 s statt 1,6 s, Explosionen gestaffelt.
- Golden Gun: Radiant und Well of Radiance erhöhen den Schaden um 20 %. Ohne sie war Golden Gun bisher 20 % zu stark, weil Aegis mit Radiant gemessen hat.
- Abdeckung und Roadmap als Dokumente (`docs/coverage.md`, `docs/roadmap.md`, US-15, ADR 0010).
- Tether-Dauern laut Compendium: Deadfall 12 s, Moebius 6 s pro Salve.
- Courts Stacking Guide vollständig abgeglichen: Surge 3x (22 %) und die Stacking-Regeln für Amplification, Weapon Perks und Exotic Intrinsics sind jetzt belegt. MossyMax geprüft, veraltet.
- Neue Oberfläche mit Ingame-Icons (ADR 0008): Effects als Icon-Kacheln mit Hover-Karte (Wirkung, Dauer, Quelle), Klasse und Subklasse als Schaltflächen mit Icons, Kennzahlen immer sichtbar, Ergebnis in Reitern (Übersicht, Rotation, Breakdown, Optimizer), Optimizer-Einträge als Karten mit Icon-Reihe, Fireteam Support einklappbar, Erklärungen als ⓘ.
- Katalysator von One Thousand Voices: Taken Seeker als Damage over Time (Werte aus dem Compendium).
- Link teilen (US-05): Der Build steht kompakt in der Adresse, z. B. `?b=AgEBAcCyBAMKAAAADQEAAAEDALHqAQA` (etwa 30 bis 50 Zeichen), und lässt sich kopieren. Ein festgehaltener Vergleich steht im selben Link.
- Optimizer (US-08): Für die gewählte Klasse probiert er alle Subklassen und erlaubten Kombinationen eigener Effects und zeigt die 15 besten Builds als Balken und Tabelle. Jeder Eintrag lässt sich übernehmen oder als Vergleich festhalten. Effects ohne Nutzen lässt er weg.
- Subklasse wählbar (Arc, Solar, Void, Stasis, Strand, Prismatic); eigene Subklassen-Effects passen zur Subklasse. Kurznamen für Effects in Rangliste und Zeitleiste.
- Klassen und Anbieter: Klasse wählbar; Effects nach eigener Subklasse, Rüstung, Artefakt und Fireteam Support. Well of Radiance, Rift, Banner und Tether gibt es auch von Mitspielern. Pro Build höchstens ein eigenes Super und eine Surge-Stufe.
- Vergleich (US-09): aktueller Build gegen festgehaltenen Build bei gleicher Damage Phase; Kennzahlen mit Differenz und beide Damage Curves in einem Diagramm.
- Rotation (US-07, Stufe B aus ADR 0006): Effects wirken nur in ihrem Zeitfenster. Start und Dauer sind pro Effect einstellbar, die Dauer ist aus Courts Tabelle vorbelegt (Well 30 s, Rift 15 s, Lumina 11 s, Tractor Cannon 10 s, Elemental Overdrive 7 s). Uptime pro Effect und Zeitleiste mit Zeitfenstern, Shots und Ignitions.
- Diagramme mit Recharts (ADR 0007): Schaden nach Art (Donut mit Legende und Werten), Damage Curve (US-06), DPS je Länge der Damage Phase, Beitrag pro Bucket als Balken.

## 0.5.0 – 2026-10-18 (MVP)

Manual Mode für One Thousand Voices (US-01 bis US-04).

- Effects zum Anhaken nach Subklasse, Rüstung, Artefakt und Fireteam Support: Empowering Buffs, Debuffs, Solar Surges, Weapons Stat 200, Elemental Overdrive, Particle Reconstruction, Ember of Ashes.
- Damage Phase als freie Eingabe oder per Boss (47 Bosse aus der Aegis-Tabelle, automatischer Import).
- Ergebnis: Total Damage, DPS, Shots, Ignitions und Breakdown pro Bucket.
- Simulator: Buckets nach Courts Kategorien, Vorrangregeln (Divinity über Particle Reconstruction), Timing-Effekte (keine Reloads), Scorch und Ignition über Zähler und Schwelle.
- Gate-Test gegen die Quellen: Quantum (23 980 ohne, 28 430 mit Ignitions) und Aegis (Multiplier ×2,355).

Einschränkungen: Effects sind die ganze Damage Phase aktiv. Burn-Schaden, Katalysator, Fähigkeiten und Supers fehlen noch.

## 0.1.0 – 2026-10-18 (Walking Skeleton)

- Shot-Zeitachse und Total Damage von One Thousand Voices ohne Buffs, Grundwerte aus Quantum Damage-ics.
- Online unter https://wipe4dmg.pages.dev (Cloudflare Pages).
