# ADR 0008: Icons aus dem Bungie-Manifest, beim Import heruntergeladen

Status: angenommen · Datum: 2026-10-18

## Kontext

Die Oberfläche ist textlastig. Icons aus dem Spiel machen Effects, Klassen und Subklassen auf einen Blick erkennbar, wie in DIM oder light.gg. Bungie stellt alle Icons über das Destiny-2-Manifest bereit. Das Inhaltsverzeichnis des Manifests braucht einen kostenlosen API-Schlüssel; die Icon-Dateien selbst liegen öffentlich auf bungie.net. Standard-Icons haben 96 × 96 Pixel.

## Entscheidung

- Jedes Effect, jede Weapon, jede Klasse und jede Subklasse bekommt einen `manifestHash` in den Data Files.
- Ein Import-Skript (`npm run import:icons`) liest das Manifest mit dem Schlüssel aus der Umgebungsvariable `BUNGIE_API_KEY`, lädt die Icons und legt sie unter `public/icons/` ab. Die Icons werden committet.
- Der Schlüssel steht nie im Repository und wird nicht im Browser gebraucht. Die App lädt zur Laufzeit nichts von Bungie.
- Fehlt ein Icon, zeigt die Oberfläche ein Kürzel aus dem Kurznamen.
- Die Seite zeigt den Hinweis „Destiny-Inhalte und Icons © Bungie“. Bungies API-Bedingungen erlauben nicht-kommerzielle Fan-Projekte.

## Folgen

- Das Repository wächst um einige hundert KB bis wenige MB Icons.
- Nach einem Patch kann ein Icon wechseln; ein neuer Import holt es.
- Wer das Skript ausführt, braucht einen eigenen Schlüssel.
