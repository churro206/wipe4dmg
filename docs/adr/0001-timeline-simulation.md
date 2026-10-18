# ADR 0001: Der Simulator rechnet mit Damage Instances auf einer Zeitachse

Status: angenommen · Datum: 2026-10-18

## Kontext

One Thousand Voices erzeugt pro Schuss mehrere Damage Instances: Strahl, verzögerte Explosion und mit Katalysator Taken Seeker mit 22 Ticks. Buffs laufen nach einer festen Zeit ab. Eine einzelne Formel bildet diese zeitlichen Abhängigkeiten nicht ab.

## Entscheidung

Der Simulator erzeugt alle Damage Instances als Ereignisse mit Zeitpunkt. Der Simulator ordnet die Ereignisse nach Zeit. Für jedes Ereignis berechnet der Simulator die aktiven Effects zu diesem Zeitpunkt. Der Simulator summiert nur Ereignisse innerhalb der Damage Phase.

## Folgen

- Verzögerte Damage Instances und Ticks brauchen keine Sonderlogik.
- Damage Curve und Rotation entstehen direkt aus der Ereignisliste.
- Der Simulator ist langsamer als eine Formel. Für den Optimizer ist das bei wenigen tausend Builds unkritisch.
