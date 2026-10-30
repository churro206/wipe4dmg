# Gesamtprobe mit Aegis (generiert)

Erzeugt mit `npm run probe` aus `tests/fixtures/meta-probe.json` und `src/data/aegis-totals.json` (`npm run import:totals`). Quotient = unser Total ÷ Aegis-Total (ohne die herausgerechneten Faktoren); relativ = Quotient ÷ Median. Grenze ±15 %. Die Zeilen nach Regel stehen in `docs/meta-probe-auto.md`.

Median: 1.000

| Aegis-Zeile | Aegis | Modell | Quotient | relativ | herausgerechnet |
| --- | ---: | ---: | ---: | ---: | --- |
| Leviathan's Breath, Archer's Tempo | 71,555 | 71,555 | 1.000 | 1.000 |  |
| Truth, Prototype Truthseeker, Argent Ordnance | 85,454 | 82,636 | 0.967 | 0.967 |  |
| Gjallarhorn, Argent Ordnance | 56,374 | 56,374 | 1.000 | 1.000 |  |
| Sleeper Simulant | 87,747 | 87,747 | 1.000 | 1.000 |  |
| Thunderlord, assumes only one reload post-nerf | 101,659 | 101,659 | 1.000 | 1.000 |  |
| Grand Overture, volleys when available | 144,658 | 144,662 | 1.000 | 1.000 |  |
| Whisper of the Worm, Whispered Breathing, Sniper's Meditation | 128,747 | 128,750 | 1.000 | 1.000 |  |
| One Thousand Voices, catalyst, Particle Reconstruction | 87,367 | 86,366 | 0.989 | 0.989 |  |
| Xenophage | 67,645 | 67,645 | 1.000 | 1.000 |  |
| The Queenbreaker, Rewind Rounds, Combat Sights | 97,261 | 97,261 | 1.000 | 1.000 |  |
| Blade Barrage, Knock 'Em Down, Limit Break | 24,649 | 24,118 | 0.978 | 0.978 | Limit Break is not modelled |
| Nova Bomb - Vortex, Limit Break | 17,330 | 17,330 | 1.000 | 1.000 | Limit Break is not modelled |
| Gathering Storm, Limit Break | 12,280 | 12,866 | 1.048 | 1.048 | Limit Break is not modelled |
| Golden Gun - Marksman, Celestial Nighthawk, Radiant, Facet of Courage, Limit Break | 33,042 | 33,042 | 1.000 | 1.000 | Limit Break (part of Buff 1.518 = Radiant 1.2 × Facet 1.1 × Limit Break 1.15) is not modelled |

## Übersprungen

- Swap: bursts (Izanagi's Burden, Still Hunt, Parasite): One burst before the swap; our simulation fires the weapon for the whole phase.
- Sustained: legendary weapons: The app has only exotic weapons.
