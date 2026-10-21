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
5. **Arten, automatisch zugeordnet** (`npm run build:armor`): `abilityVariant`, `damageBuff`, `weaponSynergy`, `noDamage` (Überleben, Energie, Bewegung), `gap` (Text unklar). Ergebnis: `src/data/exotic-armor.json` (alle Exotics mit Art, Regel und Grund; Lücken und Exotics ohne Schadenswirkung stehen mit drin) und die Prüftabelle `docs/armor-import.md`. Werte für Regel 3 liefert der Compendium-Reiter „Exotic Armors“ (`src/data/compendium-armor.json`), auf den Court verweist; Regeln freigegeben 2026-10-21. Ein Test prüft, dass sie aktuell sind. Der Inhaber gibt die Regeln einmal frei, danach die Prüftabelle pro Import.
6. **Exotics ohne Schadenswirkung** sind nicht wählbar. Die Abdeckung zählt sie mit Grund.
7. **Link-Format 4** hängt den Code des Exotics an. Codes werden nie neu vergeben. Formate 2 und 3 bleiben lesbar.
8. **Optimizer:** Das gewählte Exotic bleibt fest, wie die Abilities (6d bleibt zurückgestellt).
9. **Einzelwerte vom Inhaber** (z. B. von Reddit, das für den Agenten gesperrt ist) sind erlaubt, wenn ein Wert sonst nirgends steht: mit URL und Zitat, Status `unverified`. Nur im Einzelfall, nie als Import.

## Folgen

- Neue Data Files und ein Build-Skript wie bei den Waffen; dazu ein Court-Snapshot (`npm run import:court`).
- Die Kombinationen bleiben auf das beschränkt, was Aegis gemessen hat und was die Filter abbilden. Das ist akzeptiert.
- Effects, deren Bedingung noch fehlt, landen als `gap` in der Prüftabelle statt zu raten.
