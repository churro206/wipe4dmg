# Rangfolge-Gate (generiert)

Erzeugt mit `npm run probe` (`tests/rankingGate.test.ts`). Gruppen nach der Spalte „Prüft“ in `docs/product.md`. Spearman zwischen unserer und der Aegis-Rangfolge; Treffer = Zahl der Aegis-Top-3, die bei uns in den Top 5 stehen; Delta-Paare = zwei Zeilen, die sich um genau eine Annahme unterscheiden (Abstand in Prozentpunkten). Ab 5 Zeilen pro Gruppe. Schwellen: Spearman ≥ 0.9, 3 von 3, Delta ±2. Abweichungen stehen mit Grund in `tests/fixtures/ranking-gate.json` und blockieren nichts; eine neue Abweichung macht den Test rot.

„Geprüft“ sind nur Zeilen, deren Annahmen alle einen Schalter haben; „alle“ enthält auch die Zeilen mit Annahme ohne Schalter.

| Gruppe | Aegis-Zeilen | im Modell | Abdeckung | geprüft | Spearman | Treffer | alle | Spearman | Treffer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Supers | 68 | 51 | 75 % | 18 | 0.97 | 2/3 | 51 | 0.74 | 3/3 |
| Heavy | 95 | 46 | 48 % | 19 | 0.99 | 3/3 | 46 | 0.87 | 2/3 |
| Special | 84 | 44 | 52 % | 6 | 1.00 | 3/3 | 44 | 0.51 | 2/3 |

## Delta-Paare (geprüfte Zeilen)

| Gruppe | Zeile | zusätzliche Annahme | Aegis | Modell | Abstand | Grund der Abweichung |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Supers | Chaos Reach, Geomag Stabilizers, Sol Invictus, Thunderous Retort | Sol Invictus | 46.3 | 0.0 | -46.3 | Delta 0 instead of +46 %: the effect of Sol Invictus has no damage in the model; cause not examined yet (block Delta-Lücken) |
| Supers | Gathering Storm, Feast of Light x6, Limit Break | Feast of Light x6 | 77.3 | 66.5 | -10.8 | +66.5 % instead of +77.3 %: Feast of Light x6 differs per super; cause not examined yet (block Delta-Lücken) |
| Supers | Blade Barrage, Knock 'Em Down, Shards of Galanor, Limit Break | Shards of Galanor | 77.0 | 80.9 | 3.9 | 3.9 points off; cause not examined yet (block Delta-Lücken) |
| Supers | Blade Barrage, Knock 'Em Down, Feast of Light x6, Limit Break | Feast of Light x6 | 68.7 | 70.0 | 1.3 |  |
| Supers | Nova Bomb - Cataclysm, Feast of Light x6, Facet of Courage, Limit Break | Feast of Light x6 | 50.0 | 50.0 | 0.0 |  |
| Supers | Twilight Arsenal, Feast of Light x6, Facet of Courage, Limit Break | Feast of Light x6 | 50.0 | 50.0 | 0.0 |  |
| Heavy | One Thousand Voices, Ember of Ashes, catalyst, Dawn Chorus, Particle Reconstruction | Dawn Chorus | 23.7 | 0.0 | -23.7 | Delta 0 instead of +24 %: Dawn Chorus has no damage in the model; cause not examined yet (block Delta-Lücken) |
| Heavy | One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction | Ember of Ashes | 11.6 | 13.6 | 1.9 |  |
| Heavy | One Thousand Voices, Ember of Ashes, catalyst, Particle Reconstruction | catalyst | 30.5 | 32.2 | 1.7 |  |
| Heavy | One Thousand Voices, Ember of Ashes, Particle Reconstruction | Ember of Ashes | 17.3 | 18.8 | 1.4 |  |
| Heavy | One Thousand Voices, catalyst, Particle Reconstruction | catalyst | 37.1 | 38.3 | 1.1 |  |
