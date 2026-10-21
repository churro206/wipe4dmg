# ADR 0014: Exotic-Rüstung

Status: angenommen · Datum: 2026-10-21

## Kontext

Erst mit Waffe × Exotic-Rüstung wird der Rechner spannend (Feedback des Inhabers zu v1.0). Das Manifest kennt 141 Exotic-Rüstungen. Von Hand gepflegt, wachsen die Kombinationen mit Waffen (49 Pakete), Abilities und Effects schneller, als wir sie pflegen können. Deshalb gilt dasselbe Prinzip wie beim Waffen-Import (ADR 0013): Snapshots, feste Regeln, Prüftabelle.

| Quelle | Inhalt | Umfang (2026-10-21) |
| --- | --- | --- |
| Manifest (`manifest-armor.json`) | Klasse, Slot, Name und Text des Intrinsic, Icon | 141 Exotics |
| Clarity (`clarity.json`, Typ „Armor Trait Exotic“) | Text mit Zahlen, z. B. Cuirass „Thundercrash deals 55% increased damage“ | 138 Einträge |
| Aegis, Reiter „Abilties“ (`aegis-abilities.json`) | Gemessene Pakete mit dem Exotic in den Annahmen, z. B. „Thundercrash, Cuirass of the Falling Star“ | 17 Exotics in den Annahmen |
| Court's Stacking Guide (`court-buffs.json`) | Bucket, Wert und Dauer von Buffs, auch von Exotics; Liste der Exotic Intrinsics ohne Werte | 125 Einträge |
| Compendium, Reiter „Exotic Armors“ (`compendium-armor.json`) | Text mit Werten pro Exotic, Klasse, Intrinsic | 135 Exotics |

## Entscheidung

1. **Ein Build hat höchstens eine Exotic-Rüstung**, nur eine der eigenen Klasse. Sie ist ein eigenes Feld im Build (`exoticArmorId`), kein Effect. Der Anbieter `armor` bekommt den Slot `exotic`.
2. **Ein Exotic ist ein Bündel:**
   - **Effects** (Multiplier- oder Timing-Teile), die nur mit diesem Exotic wählbar sind und mit ihm wirken.
   - **Ability-Varianten:** Ein Aegis-Paket, dessen Annahmen das Exotic nennen, ersetzt das Paket derselben Ability ohne das Exotic, solange das Exotic gewählt ist. Ohne das Exotic ist es nicht wählbar. Eingerechnete Effects behandelt der Loader wie bisher (ADR 0009, Punkt 5).
3. **Synergien entstehen aus Filtern, nie aus Paar-Listen.** Ein Effect des Exotics wirkt über die vorhandenen Filter (Damage Source, Element, Waffentyp, Ability) und über Bedingungen. Bedingungen kommen einzeln hinzu, sobald ein Exotic sie braucht, z. B. `weaponMatchesSuperElement` für Mantle of Battle Harmony. Kommt eine Waffe hinzu, wirken passende Exotics ohne Pflege.
4. **Regelkette für Werte:** 1. Aegis-Paket (gemessen), 2. Court (Bucket und Wert), 3. Clarity-Text (Zahl per Regel). Widersprechen sich Quellen, entscheidet ein Verhältnis-Check (ADR 0011, z. B. Paket mit ÷ Paket ohne Cuirass gegen +55 % aus Clarity). Erst ohne Entscheidung wird der Inhaber gefragt. Overrides nur mit Zitat.
5. **Arten, automatisch zugeordnet** (`npm run build:armor`): `abilityVariant`, `damageBuff`, `weaponSynergy`, `noDamage` (Überleben, Energie, Bewegung), `gap` (Text unklar). Ergebnis: `src/data/exotic-armor.json` (alle Exotics mit Art, Regel und Grund; Lücken und Exotics ohne Schadenswirkung stehen mit drin) und die Prüftabelle `docs/armor-import.md`. Werte für Regel 3 liefert der Compendium-Reiter „Exotic Armors“ (`src/data/compendium-armor.json`), auf den Court verweist; Regeln freigegeben 2026-10-21. Ein Test prüft, dass sie aktuell sind.
   - Regeln: 1 Aegis-Paket → `abilityVariant`; 2 Court-Zeile mit Wert → `damageBuff` im Bucket von Courts Kategorie; 3 Courts Liste „Exotic Intrinsics“ → `exoticIntrinsic` mit dem Bonus aus Compendium oder Clarity; 4 sonst ein Bonus im Text → Bucket aus dem Text (4a, z. B. Wormgod „Weapon damage increases are Empowering Buffs“), sonst nach Courts Definition der Exotic Intrinsics (4b: „An effect from Exotics applied directly onto your Weapon or Ability“, Quelle „Most Exotic Armor“, steht im Snapshot unter `categories`); 5 Schaden ohne klaren Bonus → `gap`; 6 kein Schadenswort → `noDamage`.
   - **Melee-Boni zählen in den Regeln 3 und 4 nicht:** Melee-Buffs addieren sich untereinander (Compendium „Game Mechanics“: „Increase Damage to Melee is Additive to other Melee Damage Buffs“), das Modell kennt das noch nicht. Hat ein Exotic nur Melee-Boni, ist es eine Lücke. Die Mechanik kommt nach E1.
   - Eigene Damage Instances von Exotics (z. B. Blitze von Dunemarchers) kommen später; bis dahin sind sie Lücken nach Regel 5 (Inhaber, 2026-10-21).
   - Kein Bonus sind Angaben zu Damage Resist, Reduction, Falloff, Range und Distance.
   - **Ergänzung 2026-10-21 (Inhaber):** Weg fällt nur, was den verursachten Schaden in keiner Weise beeinflusst. Regel 4c: Gibt der Text einen modellierten Effect („grant Radiant“) → `grantsEffect`. Regel 5 ohne Schadens-Bonus, in dieser Reihenfolge: verlängert einen Effect, den das Modell ohnehin ganz aktiv hält → `noDamage` (z. B. Helm of Saint-14); zitierter „Reload Duration Multiplier“ → `weaponTiming` (stärkster Wert bei Stufen); eigener Schaden → `ownDamage` (kommt später); anderes Timing (Magazin, Munition, Refill) → `gap`; nur Energie → `energyOnly` (Lücke, weil die Rotation die Casts festlegt); sonst Schadenswort → `gap`. Regel 6: nichts davon → `noDamage`.
   - **Annahme auffrischbare Buffs (Inhaber):** Der Spieler hält einen auffrischbaren Buff ganz aktiv, z. B. Weapons of Light der Titan-Kuppel. Exotics, die nur dessen Dauer verlängern, ändern im Modell nichts. Der Inhaber gibt die Regeln einmal frei, danach die Prüftabelle pro Import.
6. **Exotics ohne Schadenswirkung** sind nicht wählbar. Die Abdeckung zählt sie mit Grund.
7. **Link-Format 4** hängt den Code des Exotics an. Codes werden nie neu vergeben. Formate 2 und 3 bleiben lesbar.
8. **Optimizer:** Das gewählte Exotic bleibt fest, wie die Abilities (6d bleibt zurückgestellt).
9. **Einzelwerte vom Inhaber** (z. B. von Reddit, das für den Agenten gesperrt ist) sind erlaubt, wenn ein Wert sonst nirgends steht: mit URL und Zitat, Status `unverified`. Nur im Einzelfall, nie als Import.

## Folgen

- Neue Data Files und ein Build-Skript wie bei den Waffen; dazu ein Court-Snapshot (`npm run import:court`).
- Die Kombinationen bleiben auf das beschränkt, was Aegis gemessen hat und was die Filter abbilden. Das ist akzeptiert.
- Effects, deren Bedingung noch fehlt, landen als `gap` in der Prüftabelle statt zu raten.
