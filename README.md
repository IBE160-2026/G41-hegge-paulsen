# SmartØkt

SmartØkt er et gruppeprosjekt i IBE160 Programmering med KI ved Høgskolen i Molde, høsten 2026.

Prosjektet bygger en enkel treningsapp som gir brukeren et målrettet øktforslag basert på tilgjengelig tid, fokus, energinivå, historikk og progressjon.

## Hva appen gjør nå
- genererer øktforslag etter valg av tid, fokus og energi — enten via menyen eller ved å beskrive økten med egne ord i en enkel regelbasert chat (ingen ekstern AI-API)
- viser øktforslaget på en egen side, separat fra valgsiden
- genererer en ukeplan (flere dager i uken) via meny eller chat, med mulighet for å overstyre fokus/energi/treningsoppsett/treningsnivå for hver dag
- vurderer uken mot Helsedirektoratets aktivitetsråd, inkludert 65+-regelen for balanse- og styrketrening for innloggede brukere med alder i profilen
- lar brukeren registrere/logge inn via Supabase og lagre profil, dersom Supabase er konfigurert
- bruker lokal historikk som fallback-data
- foreslår neste belastning
- viser enkel progresjon og treningsstatus
- kan kjøres lokalt uten eksterne API-nøkler i MVP

## Kort oppsummert MVP-flyt
1. Bruker velger tid, fokus og energinivå — via menyen eller chatten
2. Appen foreslår en økt (eller en ukeplan), vist på en egen side
3. Bruker logger treningen
4. Appen oppdaterer historikk og progresjon
5. Appen anbefaler neste belastning

## Repo-struktur
```text
.
├── README.md
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── src/
│   ├── app/
│   ├── data/
│   └── features/
├── tests/
├── docs/
├── error/
├── _bmad-output/
│   └── planning-artifacts/
├── .github/
└── node_modules/
```

## Kjør lokalt
```bash
cd C:/CodeNChill
npm install
npm run dev
```

Åpne URL-en Vite skriver ut, normalt:
```text
http://localhost:5173/
```

Konto-funksjonene krever prosjektoppsett og lokale miljøvariabler. Se [docs/supabase-setup.md](docs/supabase-setup.md).

## Testing
```bash
npm test
```

## Dokumentasjon
- [docs/README.md](docs/README.md) – struktur og mapper
- [docs/exercise-sources.md](docs/exercise-sources.md) – kilder og kildeverifisering for øvelseskatalogen
- [docs/supabase-setup.md](docs/supabase-setup.md) – Supabase-prosjekt, innlogging og profil-database
- [error/README.md](error/README.md) – dokumentasjon av feil og løsninger
- [_bmad-output/planning-artifacts]( _bmad-output/planning-artifacts ) – planlegging og MVP-artefakter

## Sikkerhet og repo-ryddighet
- ingen ekte hemmeligheter i repoet
- `.env` og lokale hemmeligheter holdes ute av git
- build-artefakter og avhengigheter er ignorert via `.gitignore`

## Status
Prosjektet er i aktiv utvikling. MVP-kjerneflyten fungerer, og flere post-MVP-funksjoner (ukeplan, chat-input, egen forslagsside, 65+-aktivitetsregel) er lagt til. Se [docs/mvp-status.md](docs/mvp-status.md) for detaljert status og neste steg.
