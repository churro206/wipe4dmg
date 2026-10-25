# Rangfolge-Gate (generiert)

Erzeugt mit `npm run probe` (`tests/rankingGate.test.ts`). Gruppen nach der Spalte „Prüft“ in `docs/product.md`. Spearman zwischen unserer und der Aegis-Rangfolge; Treffer = Zahl der Aegis-Top-3, die bei uns in den Top 5 stehen; Delta-Paare = zwei Zeilen, die sich um genau eine Annahme unterscheiden (Abstand in Prozentpunkten). Ab 5 Zeilen pro Gruppe. Schwellen: Spearman ≥ 0.9, 3 von 3, Delta ±2. Abweichungen stehen mit Grund in `tests/fixtures/ranking-gate.json` und blockieren nichts; eine neue Abweichung macht den Test rot.

„Geprüft“ sind nur Zeilen, deren Annahmen alle einen Schalter haben; „alle“ enthält auch die Zeilen mit Annahme ohne Schalter.

| Gruppe | Aegis-Zeilen | im Modell | Abdeckung | geprüft | Spearman | Treffer | alle | Spearman | Treffer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Supers | 68 | 51 | 75 % | 18 | 0.98 | 2/3 | 51 | 0.74 | 3/3 |
| Heavy | 95 | 46 | 48 % | 19 | 1.00 | 3/3 | 46 | 0.87 | 2/3 |
| Special | 84 | 44 | 52 % | 6 | 1.00 | 3/3 | 44 | 0.51 | 2/3 |

## Delta-Paare (geprüfte Zeilen)

| Gruppe | Zeile | zusätzliche Annahme | Aegis | Modell | Abstand | Grund der Abweichung |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Supers | Gathering Storm, Feast of Light x6, Limit Break | Feast of Light x6 | 77.3 | 66.5 | -10.8 | Aegis contradicts itself: tab Swap +77.3 % (25038 / 14122), tab Abilities +63.3 % (11767 / 7207), and the text allows at most +70 % (Compendium: 'up to 70% increased Super Damage'). The model gives +66.5 % (Jolt share unscaled), between the tabs and within the text. |
| Supers | Blade Barrage, Knock 'Em Down, Shards of Galanor, Limit Break | Shards of Galanor | 77.0 | 80.9 | 3.9 | Aegis contradicts itself: tab Swap +77.0 % (23150 / 13076), tab Abilities +102.2 % (25864 / 12795); the model gives +80.9 %, 3.9 points above Swap and 21 below Abilities. The cause of the tab difference is not known; the 25 % of Sharp Edges alone cannot explain either. |
| Supers | Blade Barrage, Knock 'Em Down, Feast of Light x6, Limit Break | Feast of Light x6 | 68.7 | 70.0 | 1.3 |  |
| Supers | Nova Bomb - Cataclysm, Feast of Light x6, Facet of Courage, Limit Break | Feast of Light x6 | 50.0 | 50.0 | 0.0 |  |
| Supers | Twilight Arsenal, Feast of Light x6, Facet of Courage, Limit Break | Feast of Light x6 | 50.0 | 50.0 | 0.0 |  |
| Supers | Chaos Reach, Geomag Stabilizers, Sol Invictus, Thunderous Retort | Sol Invictus | 46.3 | 46.3 | -0.0 |  |
| Heavy | One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction | Ember of Ashes | 11.6 | 13.6 | 1.9 |  |
| Heavy | One Thousand Voices, Ember of Ashes, catalyst, Dawn Chorus, Particle Reconstruction | Dawn Chorus | 23.7 | 21.9 | -1.7 |  |
| Heavy | One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction | catalyst | 30.5 | 32.2 | 1.7 |  |
| Heavy | One Thousand Voices, Ember of Ashes, Particle Reconstruction | Ember of Ashes | 17.3 | 18.8 | 1.4 |  |
| Heavy | One Thousand Voices, catalyst, Particle Reconstruction | catalyst | 37.1 | 38.3 | 1.1 |  |
