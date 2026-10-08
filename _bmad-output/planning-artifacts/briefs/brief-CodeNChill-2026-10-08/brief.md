---
title: Product Brief
status: final
created: 2026-09-15
updated: 2026-10-08
---

# Product Brief: SmartØkt (versjon 2)

## Executive Summary
SmartØkt er en treningsapp som hjelper brukeren å velge en passende og realistisk treningsøkt ut fra tilgjengelig tid, energinivå, treningsmål og tidligere historikk. Appen skal gjøre det enklere å trene konsekvent, selv når man har lite tid, er sliten eller ikke vet hva man skal gjøre.

Appen skal:
- foreslå en passende økt basert på tid, form og mål
- tilpasse anbefalinger til historikk og tidligere resultater
- foreslå neste vekt basert på progresjon
- vise enkel fremgang over tid
- kunne kjøres lokalt uten egne nøkler eller betalte tjenester i første versjon

---

## Problem
Mange mennesker ønsker å trene regelmessig, men møter ofte barrierer som:
- lite tid
- lav energi eller motivasjon
- usikkerhet om hva de skal gjøre i treningsstudioet
- vanskelig å vurdere om dagens økt er for hard eller for lett
- lite struktur når treningsmål endrer seg over tid

Dette gjør at trening blir sporadisk eller mindre effektiv enn den kunne være. SmartØkt skal redusere disse hindringene ved å gi en enkel, presis og målrettet treningsanbefaling.

---

## Løsning
SmartØkt skal være en mobilvennlig treningsassistent som anbefaler en passende økt ut fra:
- tilgjengelig tid
- energinivå
- fokusområde
- treningshistorikk
- ukentlig aktivitetsmål

Appen skal gi anbefalinger som er:
- realistiske
- tilpasset brukeren
- enkle å forstå
- lette å justere

---

## Brukere
### Primærbruker 1: Nybegynneren
- trener sjelden eller har vært inaktiv
- trenger trygg og enkel veiledning
- vil ha korte og håndgripelige økter
- ønsker å få en stabil treningsvane

### Primærbruker 2: Den erfarne, travle brukeren
- har lite tid
- trenger effektive økter som passer dagens form
- vil ha raske beslutninger uten mye planlegging
- ønsker at trening skal være målrettet og effektiv

---

## Suksesskriterier
SmartØkt er vellykket dersom følgende er oppnådd:

1. Brukeren kan logge inn eller bruke gjestemodus uten å være avhengig av eksterne tjenester.
2. Brukeren kan velge tilgjengelig tid, fokus, energinivå og mål.
3. Appen genererer et nyttig øktforslag som følger tydelige og testbare regler.
4. Brukeren kan godkjenne, avvise eller justere forslaget.
5. Appen kan foreslå neste vekt basert på tidligere trening og progresjon.
6. Appen viser enkel progresjon over tid gjennom graf eller prognose.
7. Appen kan kjøres lokalt uten egne nøkler eller betalte tjenester i utviklingsmiljøet.
8. Koden er strukturert, testbar og dokumentert i README.
9. Appen har lokal fallback når ekstern øvelsesdatabase ikke er tilgjengelig.
10. Tester viser at anbefalingsreglene, beregningene og regresjonselementene fungerer som forventet.

> Dette prosjektet vurderes ikke bare på funksjonalitet og UI. I del 1 av mappen teller også prosess og KI-styring, testing, kodekvalitet, README og ryddighet i repoet.

---

## Scope
### In scope for v1
- innlogging og gjestemodus
- brukermål og profil
- logging av treningsøkter
- vektskive-kalkulator
- øktanbefaling basert på tid, fokus, energi, historikk og mål
- forslag til neste vekt
- enkel progresjonsvisning
- regresjonsanalyse med R²-terskel
- lokal øvelsesdatabase som fallback
- README med instruksjoner for kjøring og testing

### Out of scope for v1
- live API-integrasjon som krever egen nøkkel
- kompleks videoanalyse
- sanntidsfunksjonalitet for flere brukere
- avansert AI-trener
- sosialt eller lagbasert funksjonalitet

---

## Regler for øktanbefaling
Øktanbefalingen skal være regelbasert og transparent, slik at den kan testes og verifiseres.

### Innganger
Systemet tar inn:
- tilgjengelig tid
- fokusområde
- energinivå
- historikk fra tidligere økter
- ukentlig aktivitetsmål

### Utskrift
Systemet returnerer:
- type økt
- antall sett eller repetisjoner
- passende øvelser
- anbefalt belastning
- intensitetsnivå

### Regler
- Hvis tilgjengelig tid er under 20 minutter, velges en kort og målrettet økt.
- Hvis energinivået er lavt, skal anbefalingen være lettere eller kortere.
- Hvis fokuset er styrke, prioriteres styrkeøvelser med tydelig belastning.
- Hvis fokuset er kondisjon, prioriteres intervall, løping, sykling eller annen aerob aktivitet.
- Hvis historikken viser overbelastning eller dårlig form, reduseres belastningen.
- Hvis ukentlig aktivitetsmål er høyt, økes sannsynligheten for en mer krevende økt.
- Hvis ukentlig mål er lavt, velges en lettere eller kortere økt.

### Eksempel
Eksempel 1:
- Tid: 30 minutter
- Fokus: styrke
- Energi: middels
- Historikk: 3 økter siste uke
- Ukemål: 2–3 økter

Resultat:
- 30-minutters styrkeøkt
- 5 øvelser
- 3 sett per øvelse
- moderat belastning

Eksempel 2:
- Tid: 15 minutter
- Fokus: generell helse
- Energi: lav
- Historikk: 2 dager uten trening
- Ukemål: 1 økt i uka

Resultat:
- kort aktiviserings- og mobilitetsøkt
- lav belastning

Eksempel 3:
- Tid: 45 minutter
- Fokus: kondisjon
- Energi: høy
- Historikk: god form siste uke
- Ukemål: 4 økter

Resultat:
- intervall- eller kondisjonsøkt
- moderat til høy intensitet

---

## Regler for neste vekt
Appen skal foreslå neste treningsvekt basert på tidligere treningsdata.

### Logikk
- Hent historikk fra tidligere økter
- Se på belastning, sett, repetisjoner og progresjon
- Hvis økten var gjennomførbar og brukeren rapporterte god form, økes belastningen litt
- Hvis økten var for hard eller form var dårlig, beholdes eller reduseres belastningen
- Hvis det er få datapunkter, gis et konservativt forslag

Hvis det ikke finnes nok data, skal appen vise tydelig at forslaget er usikkert:
- “For lite data til å gi et pålitelig forslag”
eller
- “Anbefalt startnivå: X”

---

## Regresjon og prognose
For å gjøre appen mer nyttig skal den kunne vise enkel progresjon over tid og en enkel prognose for fremtidig utvikling.

### Regler
- Bruk lineær regresjon i v1
- Beregn R²-verdi
- Hvis R² < 0,7, vis at det er for tidlig å si noe sikkert
- Hvis R² ≥ 0,7, vis en forsiktig prognose
- Appen skal være ærlig om usikkerhet

---

## Ekstern øvelsesdatabase og fallback
Appen kan bruke en ekstern øvelsesdatabase, men den skal ikke være kritisk for kjørbarhet i første versjon.

### Krav
- lokal fallback-data skal være tilgjengelig
- hver øvelse skal ha navn, kategori, beskrivelse og fokusområde
- hvis ekstern API er utilgjengelig, brukes lokal data
- appen viser tydelig at den kjører i fallback-modus

### Teknisk løsning
- lokal seed-data i repoet
- API-nøkkel via miljøvariabler
- eksempelfil `.env.example`
- dokumentasjon i README

---

## Teknologivalg og arkitektur
Appen skal bygges med en enkel og godt dokumentert teknologi-stack.

### Kjerneprinsipper
- regelmotor for øktanbefaling i egen modul
- regresjon og prognose i egne funksjoner
- enkel og mobilvennlig UI
- tydelig skille mellom data og logikk

---

## Testing
Testing skal være en integrert del av utviklingen.

### Testbare områder
- vektskive-kalkulator
- anbefalinger basert på tid og form
- neste-vekt-forslag
- regresjonsberegning
- R²-terskel
- fallback ved manglende data
- fallback ved manglende API

### Minimumskrav
- enhetstester for beregninger
- tester for regelbasert anbefaling
- tester for usikkerhet når data mangler
- tester for lokal fallback
- verifisering av README og kjørbarhet

---

## README og kjørbarhet
README skal være nok til at andre kan klone repoet, installere avhengigheter og kjøre appen uten gruppens egne hemmeligheter.

### Innhold
- installasjonsinstruksjoner
- kjøring lokalt
- hvordan API-nøkkel settes
- hvordan fallback-data brukes
- hvordan tester kjøres
- hvordan appen brukes uten login

### Kjørbarhet
Appen skal kunne kjøres:
- lokalt
- uten egne nøkler
- uten betalte tjenester
- uten egen infrastruktur

---

## Risiko og avklaringer
### Risiko 1: Ekstern API-avhengighet
Hvis API-et krever nøkkel eller har begrensninger, må lokal fallback være på plass.

### Risiko 2: For stort omfang
Det er mange gode funksjoner. Gruppen må prioritere kjerneflyten:
- logg inn
- velg tid og fokus
- få øktforslag
- logg økten
- få neste vekt

### Risiko 3: KI-styring
Prosessen må være sporbar og dokumentert.

### Risiko 4: Treningslogikk må være tydelig
For å kvalitetssikre appen må anbefalingsreglene være eksplisitte og testbare.

---

## Konklusjon
SmartØkt er en realistisk og gjennomførbar treningsapp med tydelig verdi for brukeren. Prosjektet passer godt til et semesterprosjekt, så lenge gruppen fokuserer på kjerneflyten, klare regler og robust testing.

Det viktigste er at appen blir:
- brukbar
- testbar
- dokumentert
- kjøbar uten egne nøkler
- tydelig i sin anbefalingslogikk

Dette gjør at prosjektet er realistisk både for utvikling og vurdering i del 1 av mappen.
