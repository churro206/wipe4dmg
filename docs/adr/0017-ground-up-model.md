# ADR 0017: Schadensmodell von Grund auf

Status: vorgeschlagen, wartet auf Entscheidung des Inhabers · Datum: 2026-10-30

## Kontext

Plan `docs/plans/ground-up-model.md`. Heute ist eine Waffe ein Durchschnitt pro Shot unter Aegis' Annahmen (ADR 0013). `simulate()` legt Schussplan, Effekt-Fenster und Casts vorab an; Treffer wirken nicht zurück. Jede Rückkopplung ist ein Sonderfeld. Die Papierprobe (`docs/plans/r0-paper-probe.md`) hat das Grundmodell an fünf Waffen geprüft: **3 von 5 innerhalb ±3 %**, Abbruchkriterium (4 von 5) verfehlt. Beide Ausfälle (Hierarchy of Needs „one ring“, Dragon's Breath) hängen am Ignition-Takt.

## Entscheidung (Entwurf)

1. **Treffer** = nackter Teilwert (Skala Aegis visual) × Precision-Faktor des Teils × Π Buckets (`buckets.json`) × Stat-Faktor.
2. **Zustand:** Spieler (Magazin, Reserve, Nachladen, Ladungen und Ressourcen wie Golden-Gun-Ladung oder Fuel, Buffs mit Stacks, Energie) und Ziel (Debuffs, Keyword-Zähler, Cooldowns).
3. **Ereignisse** `shot`, `hit` (mit `precision`), `cast`, `reload`, `keyword`. **Regeln** sind Paare aus Auslöser und Wirkung: Buff oder Stack geben, Ladung erhöhen, Magazin füllen, Modus wechseln, Keyword setzen, Schaden machen.
4. **Spielweise als Strategie:** Prioritätsliste, optimal wie bei Aegis (Golden Gun casten, sobald geladen; Dodge auf das Nachladen; Draw nur halten, wenn der Schaden pro Sekunde steigt).
5. **Eich-Regel:** Was kein Text nennt, kommt aus genau einer Aegis-Zeile (`derived`, mit Zeilen-ID). Die übrigen Zeilen derselben Waffe sind das Gate. ADR 0011 gilt weiter.
6. **Teile nur, wo nötig:** zerlegt wird eine Waffe nur, wenn ein Teil mit dem Build zusammenspielt (Keyword, Stacks, Fuel, Precision-Unterschied).

### Schema-Entwurf

```ts
// src/data/weapon-components.json, je Waffe
interface WeaponComponent {
  id: string;                 // "golden-gun-shot", "wolfpack", "explosion"
  damage: Sourced<number>;    // Skala aegisVisual; Aegis-Tick ÷ fullModifiers oder Verhältnis (ADR 0011)
  precision: Sourced<number>; // Faktor gegen Bosse; fehlt er, geeicht an der Aegis-Zeile
  delivery: "impact" | "splash" | "dot";
  count?: Sourced<number>;    // pro Auslöser, z. B. 8 Wolfpack, 9 Explosionen
  delayMs?: Sourced<number>;
  scaling?: { by: string; factors: Sourced<number[]> }; // z. B. Fuel 1–5, Schuss 1–3
}

interface Rule {
  id: string;
  on: { event: "shot" | "hit" | "cast" | "reload" | "keyword"; filter?: HitFilter };
  if?: Condition[];           // Zustand: Ressource ≥ n, Modus, Buff aktiv
  then: Action[];             // grantBuff, addStacks, addResource, refillMagazine,
                              // setMode, applyKeyword, damage
  cooldownMs?: Sourced<number>;
}
```

### Zu ersetzende Sonderfelder (R3)

| Feld | Ort | Wird Regel |
| --- | --- | --- |
| `setup`, `catalystTimingOnceDeployed` | `schema.ts` (Weapon, Override) | Hierarchy: Treffer → Ladung, Ladung 3 → Modus Ring |
| `holdDraw` (Part) | `effectParts.ts` | Oathkeeper: Strategie hält Draw |
| `refillsMagazine` | Class Ability | Marksman's Dodge: cast → refillMagazine |
| `hitStacks` | Exotic-Effects | Lucky Pants, Peacekeepers: hit → addStacks |
| `catalystWindowSeconds` | Override | Truth: Fenster aus Zustand |
| `scorchStacksPerShot` | Override | Teil mit `count` und Keyword-Regel |

## Offen vor der Annahme

- **Ignition-Takt.** Kein Cooldown erfüllt beide Hierarchy-Zeilen; Dragon's Breath braucht eine Bremse, die keine Quelle nennt (Pool-Takt „?“). Beides ist auch im heutigen Kern nur über Pakete gelöst.
- Entscheidung des Inhabers: Umbau trotzdem (Ignitions geeicht, ohne unabhängiges Gate), Umbau erst nach einer Ingame-Messung des Ignition-Takts (ADR 0011, Punkt 6), oder kein Umbau.

## Folgen bei Annahme

- Etappen R1–R6 laut Plan; Gate R1: `mechanics-baseline` unverändert, Optimizer höchstens 306 ms für `tests/optimizer.test.ts` (R0 gemessen 153 ms).
