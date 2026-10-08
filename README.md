# SmartØkt

SmartØkt er et gruppeprosjekt i IBE160 Programmering med KI ved Høgskolen i Molde, høsten 2026.

Prosjektet bygger en treningsapp som anbefaler en passende økt basert på tilgjengelig tid, energinivå, fokus, historikk og ukentlig mål. Målet er å gjøre det enklere å trene konsekvent og målrettet, selv når brukeren har lite tid eller er sliten.

Dette repoet inneholder prosjektets dokumentasjon, BMAD-planlegging, utviklingshistorikk og senere selve applikasjonen.

## Medlemmer
- Hans M Hegge
- Katrine Mørk Paulsen

---

## Mål med prosjektet
SmartØkt skal i MVP gjøre følgende:
- gi et realistisk øktforslag basert på tid, fokus og energinivå
- lage en enkel historikk for tidligere trening
- foreslå neste vekt basert på tidligere resultater
- vise enkel progresjon over tid
- kunne kjøres lokalt uten egne hemmeligheter eller betalte tjenester

---

## MVP-kjerneflyt
1. Bruker logger inn eller velger gjestemodus
2. Bruker oppgir tid, fokus, energinivå og mål
3. Appen genererer et øktforslag
4. Bruker kan godkjenne, avvise eller justere forslag
5. Bruker logger økten
6. Appen foreslår neste vekt
7. Bruker ser enkel progresjon / trend

Dette er kjerneflyten som skal være fungerende og testbar i første versjon.

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

Merk:
- `src/` inneholder applikasjonslogikken
- `data/` inneholder lokale fallback-data og seed-data
- `tests/` inneholder enhetstester og testdata
- `docs/` inneholder ekstra dokumentasjon
- `_bmad-output/` inneholder BMAD-prosessdokumentasjon, brief og MVP-plan

---

## Første steg for utvikling
Dette repoet er i planleggings- og utviklingsfase. Første fokus er å få en fungerende MVP uten avhengighet av egne API-nøkler.

### Krav
- Node.js / npm eller annen valgt frontend-stack
- Python (hvis prosjektet bruker Python for logikk eller testing)
- Git

### Lokal fallback
Appen skal kunne kjøres uten ekstern nøkkel i første versjon. Derfor skal vi bruke:
- lokal seed-data som fallback
- `.env.example` for konfigurasjon
- tydelig dokumentasjon i README hvis ekstern API senere aktiveres

---

## Oppsett
1. Klon repoet
   ```bash
   git clone <repo-url>
   cd G41-hegge-paulsen
   ```

2. Kopier eksempelkonfigurasjonen
   ```bash
   cp .env.example .env
   ```

3. Installer avhengigheter
   ```bash
   npm install
   ```

4. Start appen lokalt
   ```bash
   npm run dev
   ```

5. Hvis prosjektet senere bruker en annen startkommando, oppdateres den her når implementasjonen er på plass.

---

## Miljøvariabler
Eksempelfilen `.env.example` inneholder konfigurasjon som ikke skal ligge i repoet som ekte hemmeligheter.

Eksempel:
```env
APP_ENV=development
EXERCISE_API_KEY=
EXERCISE_API_BASE_URL=
APP_NAME=SmartØkt
```

Hvis appen ikke trenger ekstern API i MVP, brukes lokal data i stedet.

---

## Datamodell og fallback
For å sikre kjørbarhet uten nøkkel skal appen bruke lokale data som fallback når ekstern API ikke er tilgjengelig.

Det forventes at følgende finnes i lokal data:
- øvelser
- kategorier / fokusområder
- korte beskrivelser
- nivå / vanskelighetsgrad
- relevante muskelgrupper eller treningsmål

Dette sørger for at appen kan kjøres lokalt og testes uten eget API.

---

## Testing
Testene skal dekke kjerne-logikken i appen, spesielt:
- vektskive-kalkulator
- øktanbefaling
- neste-vekt-logikk
- regresjon / prognose
- fallback-håndtering ved manglende data

Kjør tester med:
```bash
npm test
```

Hvis prosjektet senere bruker et annet testoppsett, dokumenteres dette her.

---

## BMAD og prosessdokumentasjon
Dette prosjektet bruker BMAD som planleggings- og prosessstruktur. Viktige dokumenter ligger i:
- `_bmad-output/planning-artifacts/briefs/`
- `_bmad-output/planning-artifacts/mvp/`

Dette gjør at prosessen er sporbar fra plan til kode.

---

## Kodekvalitet og sikkerhet
- Ingen ekte hemmeligheter skal ligge i repoet
- `.env` skal aldri committes
- API-nøkler skal lagres lokalt eller i sikker konfigurasjon utenfor repoet
- byggemapper, avhengigheter og cache-filer skal holdes ute av git

---

## Status
Prosjektet er i aktiv utvikling. Fokus er først på:
1. korrekt bruk av BMAD-dokumentasjon
2. ferdig MVP-kjerneflyt
3. lokal kjørbarhet uten nøkkel
4. testbar logikk
5. god README og ryddig repo

---

## Notat til sensor
Dette repoet er strukturert for å vise en tydelig, dokumentert og iterativ utviklingsprosess. README-et er ment å være et verktøy for å kjøre prosjektet lokalt uten å måtte ha tilgang til gruppens egne hemmeligheter eller unødvendige tjenester.
