# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G41 – G41-hegge-paulsen |
| **Product brief** | `_bmad-output/planning-artifacts/briefs/brief-CodeNChill-2026-09-15/brief.md` med `addendum.md` (commit 06c7b78) |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

**Det som er bra:**

1. Briefen er konkret og godt skrevet, med to tydelige brukere (nybegynneren og den erfarne, travle) og gode brukstilfeller, som «30 minutter helkropp pluss 15 minutter kondisjon» og «23 minutter, jeg er litt sliten i dag».
2. Flere funksjoner har regler som kan testes presist, særlig vektskive-kalkulatoren og den regelbaserte øktanbefalingen. Addendumet om regresjon med R²-terskel (≥ 0,7) og ærlig «for tidlig å si» når dataene er for få, viser god refleksjon om usikkerhet.

**De viktigste endringene:**

1. Rett opp forståelsen av vurderingen. Under Suksesskriterier står det at faget ikke stiller krav utover funksjonalitet og UI-design. Det stemmer ikke. I del 1 teller prosess og KI-styring 30 %, og testing, kodekvalitet, README og ryddighet i repoet teller også. Planlegg ut fra hele sensorveiledningen.
2. Avklar avhengigheten til ekstern øvelsesdatabase (for eksempel ExerciseDB). Slike API-er krever ofte nøkkel og har begrensninger eller kostnad. Planlegg et lokalt utvalg øvelser i repoet som fallback, slik at sensor kan kjøre appen uten deres nøkkel.
3. Skriv ut reglene for øktanbefalingen: hvordan tid, fokus, energinivå, historikk og ukentlig aktivitetsmål faktisk påvirker forslaget, og hvordan neste vekt foreslås. Med fem innganger blir dette fort uoversiktlig hvis reglene ikke er beskrevet.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Middels**

**Sammenlignbart med:** 6) To-do-liste med smarte etiketter (enkel) har samme type CRUD og logging, men SmartØkt har langt mer domenelogikk (øktanbefaling, vektprogresjon og regresjonsprognose) og en ekstern integrasjon. Det plasserer prosjektet på nivå med 2) AI CV- og søknadsassistent (middels), i øvre del av middels.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Middels–høy | Vektskive-kalkulator (enkel og presis), regelbasert øktanbefaling med fem innganger, forslag til neste vekt, ukentlig aktivitetsmål og regresjon med R² og eventuelt logaritmisk tilpasning. |
| Datamodell – antall entiteter og relasjoner mellom dem | Middels | Bruker, øvelse, økt, sett/repetisjoner, kondisjonsøkt, ukemål og eventuelle bufrede øvelsesdata fra API. |
| Brukere, roller og innlogging | Middels | Brukerkonto med innlogging pluss gjestemodus. Én rolle, men innlogging med passordhåndtering må gjøres riktig. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Lav | Anbefalingen er regelbasert, og det er ingen språkmodell i appen. Det er et ryddig valg som gjør appen mer forutsigbar og testbar. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Middels | Ekstern øvelsesdatabase med beskrivelser og video. Krever nøkkel og kan endre seg eller ha begrensninger. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Lav | Ingen sanntid i v1. «PT i lomma» med videoanalyse er riktig nok holdt utenfor. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Lav | Ingen opplasting i v1. |
| Sikkerhet og personvern | Middels | Treningsdata og eventuelt energinivå og form kan oppfattes som helseopplysninger. Beskriv kort hva som lagres, og hold passord og nøkler sikre. |

**Hva vanskelighetsgraden betyr for dere:**

- _Middels:_ Et godt balansert valg. Pass på at kjerneflyten blir ferdig og stabil før dere legger til mer. For SmartØkt er kjerneflyten: logg inn → oppgi tid og fokus → få et øktforslag → logg økten → få vektforslag til neste gang. Få den stabil før prognose med R² og API-videoer.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | Risiko | Seks funksjonsområder i v1 (innlogging/gjestemodus, logging, kalkulator, øktanbefaling, API-integrasjon, graf og prognose) er i overkant av det vi anbefaler. Git-loggen viser bare briefen så langt. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | OK | Funksjonene er tydelig listet, og addendumet gir god input til PRD og arkitektur. Reglene for øktanbefalingen må utdypes. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | Webapp med innlogging, database, grafer og enkel regresjon er godt dokumentert. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | Risiko | Kalkulatoren og lineær regresjon kan kontrolleres for hånd eller i regneark. Om øktforslagene er «gode» treningsfaglig er vanskeligere. Skriv reglene ut slik at dere kan sjekke at koden følger dem. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | OK | Vektskive-kalkulatoren, R²-terskler og tidsrammen for økter gir gode testtilfeller med fasit. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Risiko | Avhengig av øvelses-API-et. Med lokale øvelsesdata som fallback og en testbruker med historikk er dette løst. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Risiko | Briefen sier ikke om API-et er gratis eller krever nøkkel. Avklar dette før arkitekturen. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart med justert omfang.** Se forslagene under.

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Start med et lokalt øvelsesbibliotek (for eksempel 20–30 øvelser med beskrivelse og lenke) i stedet for live API-integrasjon i første iterasjon. Legg API-et til som et senere trinn når kjerneflyten virker.
2. Start prognosen med lineær regresjon og R²-terskelen fra addendumet. Logaritmisk tilpasning og gjestemodus kan flyttes til et senere trinn hvis tiden blir knapp.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Tydelig: en norsk treningsapp som foreslår økter tilpasset tid og form, med vektforslag og prognose. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Godt begrunnet med Helsedirektoratets anbefalinger og to ulike barrierer for to brukergrupper. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | OK | Konkrete brukstilfeller med akseptere, avslå eller justere forslaget. |
| What Makes This Different – er vurderingen ærlig og realistisk? | OK | Ærlig om konkurrentene (Strong, Hevy, Fitbod) og om at fordelen ligger i kombinasjonen. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | OK | To tydelige brukere med egne suksessmål. Velg gjerne hvem som er primær når dere designer. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Juster | Kalkulatoren og innlogging/registrering er testbare. «Tar faktisk hensyn til …» og «ryddig og tillitvekkende» må gjøres konkrete. Fjern også påstanden om at bare funksjonalitet og UI vurderes. |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | Juster | Tydelig liste, men mange funksjoner. Prioriter dem, og avklar hva som skjer når øvelses-API-et ikke er tilgjengelig. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | «PT i lomma» er tydelig parkert. En konseptvideo er greit, men bruk ikke tid på den før v1 er ferdig og testet. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | Briefen er presis nok, men gruppen bør være klar over at prosessen teller mest. Lagre prompts og KI-økter, og oppdater planleggingsdokumentene underveis. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Juster | Mye reell funksjonalitet, men risiko for at noe blir halvferdig. Prioriter kjerneflyten. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | OK | Kalkulator, regresjon og anbefalingsregler egner seg godt for automatiske tester. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | OK | To tydelige brukere og konkrete brukstilfeller. Tenk mobilvisning, siden appen trolig brukes i treningsstudio. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | OK | Ingen teknologivalg i briefen. Hold regelmotoren for øktforslag og prognoseberegningen i egne, testbare moduler. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Juster | Planlegg lokale øvelsesdata, `.env.example` for API-nøkkel og en testbruker med nok historikk til at prognosen vises. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Det ligger en løs fil `readme.m` i roten ved siden av `README.md`. Rydd den bort, og planlegg hvor seed-data og nøkler (utenfor repoet) skal ligge. |

## 3. Neste steg for gruppen

1. Oppdater suksesskriteriene: fjern påstanden om at bare funksjonalitet og UI vurderes, og gjør kriteriene om øktforslag og brukervennlighet konkrete og testbare.
2. Skriv reglene for øktanbefaling og vektforslag, med 2–3 eksempler på inndata og forventet forslag.
3. Avklar øvelses-API-et (nøkkel, kostnad, begrensninger) og planlegg lokal fallback. Gå deretter videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
