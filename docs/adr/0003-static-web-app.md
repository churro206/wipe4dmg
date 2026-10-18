# ADR 0003: Die App ist eine statische Web-App ohne Server

Status: angenommen · Datum: 2026-10-18

## Kontext

Die Zielgruppe ist eine kleine Gruppe von Freunden. Die App braucht keine Konten und keine gemeinsamen Daten.

## Entscheidung

- Technik: TypeScript, Vite, React, Vitest, Zod.
- Hosting: GitHub Pages oder Cloudflare Pages.
- Ein Build wird als URL-Parameter kodiert. Ein Link teilt den kompletten Build.
- Gespeicherte Builds liegen im Browser (localStorage).

## Folgen

- Keine Betriebskosten, kein Login, keine Datenschutzfragen.
- Builds sind nicht zwischen Geräten synchron. Der Link gleicht das aus.
