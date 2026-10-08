# SmartØkt

SmartØkt er et gruppeprosjekt i IBE160 Programmering med KI ved Høgskolen i Molde, høsten 2026.

Prosjektet bygger en enkel treningsapp som gir brukeren et målrettet øktforslag basert på tilgjengelig tid, fokus, energinivå, historikk og progressjon.

## Hva appen gjør nå
- genererer øktforslag etter valg av tid, fokus og energi
- bruker lokal historikk som fallback-data
- foreslår neste belastning
- viser enkel progresjon og treningsstatus
- kan kjøres lokalt uten eksterne API-nøkler i MVP

## Kort oppsummert MVP-flyt
1. Bruker velger tid, fokus og energinivå
2. Appen foreslår en økt
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
python -m http.server 8000
```

Deretter åpner du:
```text
http://localhost:8000/
```

## Testing
```bash
npm test
```

## Dokumentasjon
- [docs/README.md](docs/README.md) – struktur og mapper
- [error/README.md](error/README.md) – dokumentasjon av feil og løsninger
- [_bmad-output/planning-artifacts]( _bmad-output/planning-artifacts ) – planlegging og MVP-artefakter

## Sikkerhet og repo-ryddighet
- ingen ekte hemmeligheter i repoet
- `.env` og lokale hemmeligheter holdes ute av git
- build-artefakter og avhengigheter er ignorert via `.gitignore`

## Status
Prosjektet er i aktiv utvikling, og fokuset er nå på å gjøre MVP-flyten tydelig, brukbar og godt dokumentert.
