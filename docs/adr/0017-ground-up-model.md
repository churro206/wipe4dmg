# ADR 0017: Schadensmodell aus allgemeinen Systemen mit Prüfstand

Status: angenommen (Inhaber, 2026-10-30) · Umsetzung auf Branch `ground-up-model`, Plan `docs/plans/ground-up-model.md` · Präzisiert durch ADR 0018 und den Bauplan `docs/architecture.md` (2026-10-31): Messung nur als Prüfung, Items als Dateien, Eichung nur global, Delta-Paare als Kennzahl; S5–S6 gehen in die Stufen B1–B6 auf.

## Kontext

Heute ist eine Waffe ein Durchschnitt pro Shot unter Aegis' Annahmen (ADR 0013). `simulate()` legt Schussplan, Effekt-Fenster und Casts vorab an; Treffer wirken nicht zurück. Jede Rückkopplung ist ein Sonderfeld. Die Papierprobe (`docs/plans/r0-paper-probe.md`, 13 Waffen) zeigt:

- Faktoren aus Texten treffen Aegis auf ≤0,2 % (9 von 9), Teile mit Anzahlen aus dem Text treffen den Wipe.
- Fast jede Abweichung ist ein **fehlendes allgemeines System**: Burn, Cooldown des Keyword-Auftrags pro Quelle, Treffer-Anteil am Boss. Dazu kommen Annahmen der Messung (Takt), die bisher im Modell stecken.
- Nach Klärung der Ursachen passen 9 von 13 Waffen auf ±3 %.

## Entscheidung

1. **Fünf Schichten**, rein und einzeln testbar, über einer deterministischen Ereignis-Schleife:
   1. Formel: Grundwert × Precision × Π Buckets (`buckets.json`) × Stat-Faktor.
   2. Status-System an Ziel und Spieler: Stacks, Dauer, Verfall, Ticks, Schwelle, Cooldown, Cooldown pro Quelle. Keywords und Debuffs sind Datensätze.
   3. Effekt-System: Auslöser (`shot`, `hit` mit `precision`, `cast`, `reload`, `status`) → Bedingung (Zustand) → Aktion (`grantBuff`, `addStacks`, `addResource`, `refillMagazine`, `setMode`, `applyStatus`, `damage`).
   4. Akteur-Zustand: Magazin, Reserve, Reload, Charge, Modi, Ressourcen.
   5. Strategie: Prioritätsliste, optimal wie bei Aegis.
2. **Neuer Code nur für neue Aktions- oder Status-Typen**, nie für ein einzelnes Item. Sonderfelder (`setup`, `holdDraw`, `refillsMagazine`, `hitStacks`, `catalystWindowSeconds`, `scorchStacksPerShot`) werden Datensätze und fallen danach weg.
3. **Spielwerte und Messungen getrennt.** Messungen sind Szenarien (`tests/scenarios/`): Build, Spielweise, Takt, Dauer, Ergebnis, Aegis-Zeilen-ID. Annahmen einer Messung stehen nur im Szenario.
4. **Kalibrieren nie pro Waffe:**
   - Globale Parameter (z. B. Ignition-Cooldown, Burn-Formel, Cooldown pro Quelle, Treffer-Anteil je Teil-Art) werden gegen alle Szenarien zugleich angepasst. Ein Ausreißer ist ein Befund.
   - Item-Werte kommen aus dem Text. Fehlt einer, wird er an genau einer Zeile geeicht (`derived`, Zeilen-ID), die übrigen prüfen. ADR 0011 gilt weiter.
5. **Kennzahl:** Anteil der Szenarien innerhalb ±3 %, je System; Verhältnisse zwischen Zeilen derselben Waffe zählen vor Absolutwerten. Der neue Kern löst den alten erst ab, wenn seine Kennzahl besser ist und `mechanics-baseline` nur begründet abweicht.
6. **Teile nur, wo nötig:** zerlegt wird eine Waffe, wenn ein Teil mit dem Build spielt (Keyword, Stacks, Ressource, Precision-Unterschied).

### Schema-Entwurf

```ts
interface WeaponComponent {
  id: string;                 // "golden-gun-shot", "wolfpack", "explosion"
  damage: Sourced<number>;    // Skala aegisVisual
  precision: Sourced<number>;
  delivery: "impact" | "splash" | "dot";
  count?: Sourced<number>;    // pro Auslöser
  hitShare?: Sourced<number>; // Anteil, der einen Boss trifft (global je Teil-Art)
  delayMs?: Sourced<number>;
  scaling?: { by: string; factors: Sourced<number[]> }; // Fuel, Ladestufe, Schuss 1–3
}

interface Status {            // keywords.json
  id: string;                 // "scorch", "volatile", "jolt", "slow"
  maxStacks?: number; durationMs: Sourced<number>; decay?: { afterMs: number; perSecond: number };
  tick?: { firstMs: number; everyMs: number; damage: Formula };
  threshold?: { stacks: number; then: Action[]; cooldownMs: Sourced<number> };
  perSourceCooldownMs?: Sourced<number>;
}

interface Rule {
  id: string;
  on: { event: "shot" | "hit" | "cast" | "reload" | "status"; filter?: HitFilter };
  if?: Condition[];
  then: Action[];
  cooldownMs?: Sourced<number>;
}
```

## Folgen

- Stufen S0–S6 laut Plan, beginnend mit dem Prüfstand und der Kennzahl des heutigen Kerns.
- Neue Mechaniken werden meist ein Datensatz; neue Waffen ein Satz Teile und Regeln aus dem Text.
- Offen ohne Quelle: Dragon's Breath (Pool-Takt), Barrow-Dyad (Seeker-Zahl), Zusatz bei Ager's Scepter. Sie bleiben Szenarien mit Befund.
