# SmartØkt

SmartØkt er et gruppeprosjekt i IBE160 Programmering med KI ved Høgskolen i Molde, høsten 2026.

Målet med prosjektet er å lage en treningsapp som gir brukeren et realistisk og målrettet øktforslag basert på tid, energinivå, fokusområde, historikk og ukentlig mål. Appen skal gjøre det enklere å trene konsekvent uten å måtte planlegge mye manuelt.

Dette repoet inneholder prosjektets dokumentasjon, BMAD-planlegging, MVP-dokumentasjon og senere selve applikasjonen.

## Medlemmer
- Hans M Hegge
- Katrine Mørk Paulsen

---

## Hva vi bygger
SmartØkt skal i første versjon kunne:
- gi et brukbart øktforslag basert på tid, fokus og energinivå
- ta hensyn til tidligere trening og historikk
- foreslå neste vekt for videre progresjon
- vise enkel fremgang over tid
- kunne kjøres lokalt uten egne API-nøkler i MVP

## MVP-kjerneflyt
1. Bruker logger inn eller velger gjestemodus
2. Bruker oppgir tilgjengelig tid, fokus, energinivå og mål
3. Appen genererer et øktforslag
4. Bruker kan godkjenne, avvise eller justere forslaget
5. Bruker logger økten
6. Appen foreslår neste vekt
7. Bruker ser enkel progresjon

Dette er den viktige kjernen vi fokuserer på først.

---

## Repo-struktur
```text
.
├── README.md
├── .gitignore
├── .env.example
├── _bmad-output/
│   ├── planning-artifacts/
│   │   ├── briefs/
│   │   ├── mvp/
│   │   └── ...
├── src/
├── data/
├── tests/
├── docs/
├── app/
└── .github/
```

## Krav
- Git
- Node.js / npm eller valgt frontend-stack
- Python om prosjektet bruker det til logikk eller testing

---

## Lokal oppstart
1. Klon repoet
   ```bash
   git clone <repo-url>
   cd G41-hegge-paulsen
   ```

2. Kopier eksempelkonfigurasjon
   ```bash
   cp .env.example .env
   ```

3. Installer avhengigheter
   ```bash
   npm install
   ```

4. Start appen
   ```bash
   npm run dev
   ```

> Hvis prosjektet senere bruker en annen startkommando, oppdateres dette her når implementasjonen er på plass.

---

## Miljøvariabler
Eksempelfilen `.env.example` brukes for konfigurasjon som ikke skal ligge i repoet som ekte hemmeligheter.

Eksempel:
```env
APP_ENV=development
EXERCISE_API_KEY=
EXERCISE_API_BASE_URL=
APP_NAME=SmartØkt
```

Hvis appen ikke trenger ekstern API i MVP, brukes lokal data som fallback.

---

## Fallback-data
Appen skal kunne kjøres uten egen nøkkel eller betalt tjeneste i første versjon.

 Derfor skal vi bruke lokale øvelsesdata som fallback når ekstern API ikke er tilgjengelig. Dette er viktig for både kjørbarhet og testing.

Forventet data:
- øvelsesnavn
- kategori / fokusområde
- beskrivelse
- nivå / vanskelighetsgrad
- relevante muskelgrupper eller mål

---

## Testing
Testene skal dekke den viktigste logikken, spesielt:
- vektskive-kalkulator
- øktanbefaling
- neste-vekt-forslag
- regresjon / prognose
- handling når det er for lite data
- fallback ved manglende API

Kjør tester med:
```bash
npm test
```

---

## BMAD og prosess
Dette prosjektet bruker BMAD som planleggings- og utviklingsstruktur. Viktige dokumenter ligger i:
- `_bmad-output/planning-artifacts/briefs/`
- `_bmad-output/planning-artifacts/mvp/`

Dette gjør prosessen sporbar fra plan til implementasjon.

---

## Sikkerhet og repo-ryddighet
- Ingen ekte hemmeligheter skal ligge i repoet
- `.env` skal aldri committe
- API-nøkler skal lagres lokalt eller utenfor repoet
- byggemapper og cache-filer skal holdes ute av git

---

## Status
Prosjektet er i aktiv utvikling. Fokuset er nå på:
1. MVP-kjerneflyten
2. lokal fallback-data
3. README og kjørbarhet
4. testbar logikk
5. ryddig repo og prosessdokumentasjon

---

## Kort notat til sensor
Dette repoet er strukturert for å vise en tydelig og dokumentert utviklingsprosess. README-et er ment å være et enkelt inngangspunkt for andre som skal kunne forstå prosjektet og kjøre det lokalt uten egne hemmeligheter eller ekstra infrastruktur.
