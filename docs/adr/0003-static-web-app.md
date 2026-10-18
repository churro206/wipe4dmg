# ADR 0003: Die App ist eine statische Web-App ohne Server

Status: angenommen · Datum: 2026-10-18 · Geändert: 2026-10-18 (Hosting festgelegt)

## Kontext

Die Zielgruppe ist eine kleine Gruppe von Freunden. Die App braucht keine Konten und keine gemeinsamen Daten.
Das Repository soll privat bleiben. GitHub Pages veröffentlicht private Repositories nur mit einem kostenpflichtigen Konto.

## Entscheidung

- Technik: TypeScript, Vite, React, Vitest, Zod.
- Hosting: Cloudflare Pages mit Git-Verknüpfung zum privaten GitHub-Repository.
- Cloudflare baut bei jedem Push auf `master` mit `npx vitest run && npm run build`. Ein fehlgeschlagener Test verhindert die Veröffentlichung.
- Ein Build wird als URL-Parameter kodiert. Ein Link teilt den kompletten Build. Format: `src/engine/buildLink.ts` (Version `v=1`), ein Vergleichs-Build steht unter `vs=`.
- Gespeicherte Builds liegen im Browser (localStorage).

## Folgen

- Keine Betriebskosten, kein Login, keine Datenschutzfragen.
- Builds sind nicht zwischen Geräten synchron. Der Link gleicht das aus.
- Der Quellcode bleibt privat. Das gebaute JavaScript und die enthaltenen Spielwerte sind im Browser lesbar.
