---
title: Product Brief
status: final
created: 2026-09-15
updated: 2026-09-15
---

# Product Brief: SmartØkt (arbeidsnavn)

## Executive Summary

SmartØkt (arbeidsnavn) er en nettbasert treningsapp på norsk som hjelper både nybegynnere og erfarne trenende med å gjennomføre enkel, effektiv styrke- og kondisjonstrening — i tråd med Helsedirektoratets anbefalinger. Kun halvparten av norske voksne oppfyller disse anbefalingene i dag, ikke fordi viljen mangler, men fordi treningen som tilbys ikke møter folk der de er: nybegynnere kvier seg fordi de er usikre på teknikk og overveldes av komplekse program, mens erfarne, travle brukere har kunnskapen men ikke tiden.

SmartØkt løser dette ved å foreslå komplette økter tilpasset nøyaktig den tiden og formen brukeren har akkurat nå — "30 minutter helkropp pluss 15 minutter kondisjon" eller "23 minutter, jeg er litt sliten i dag" — basert på loggført historikk og hentet fra en ekstern øvelsesdatabase når nye øvelser passer bedre. Appen forteller nøyaktig hvilke vektskiver som skal på stanga, foreslår vekt til neste økt, og viser fremgang gjennom grafer og en statistisk ærlig prognose for fremtidig fremgang.

Prosjektet bygges av to studenter ved Høgskolen i Molde (faget "koding ved bruk av AI") med frist medio desember 2026, der selve applikasjonen — funksjonalitet og UI-design — er det som sensureres.

## Problemet

Kun halvparten av norske voksne oppfyller Helsedirektoratets anbefalinger om fysisk aktivitet, og andelen har knapt endret seg på nesten to tiår. Bak tallet ligger to ulike, men beslektede barrierer:

Nybegynnere lar ofte være å trene fordi de er usikre på hvordan øvelser skal utføres riktig. Når de først søker hjelp, møtes de gjerne av komplekse treningsprogrammer med for mange øvelser — i stedet for å senke terskelen, øker programmene den.

Erfarne trenende, som travle småbarnsforeldre, har ofte kunnskapen, men ikke tiden. Uken har ikke plass til treningsøkter bygget for en annen livssituasjon.

Løsningene folk faller tilbake på i dag er individuelle og usystematiske — manuell logging, faste PT-planer som ikke justerer seg, eller ingenting. Konsekvensen for begge gruppene er sjelden at treningen uteblir helt, men at den blir suboptimal og mindre motiverende enn den kunne vært — feil øvelser, feil belastning, ingen følelse av fremgang.

## Løsningen

SmartØkt er en nettbasert treningsapp på norsk som logger økter og foreslår enkle, effektive treningsøkter tilpasset den enkelte bruker — bygget på Helsedirektoratets anbefalinger for fysisk aktivitet. Appen kombinerer styrketrening (funksjonelle helkroppsøvelser som markløft og knebøy) med kondisjons-/intervalltrening.

For nybegynnere senker appen terskelen: den foreslår øvelser tilpasset nivå fremfor komplekse program, og henter beskrivelser og video av korrekt utførelse fra en ekstern øvelsesdatabase (f.eks. ExerciseDB), slik at usikkerhet om teknikk ikke lenger er en grunn til å la være.

For erfarne, travle brukere foreslår appen økter tilpasset tiden man faktisk har til rådighet, samtidig som den holder oversikt over om ukas anbefalte aktivitetsmengde nås. Appen forteller også nøyaktig hvilke vektskiver som skal legges på stanga, og foreslår vekt til neste økt basert på loggført progresjon.

Motivasjon bygges inn gjennom grafisk fremstilling av fremgang og en prognose for fremtidig fremgang (f.eks. "om X uker kan du trolig ta 100 kg i benkpress") — med en tydelig usikkerhetsindikator fremfor en falskt presis påstand.

*Konkret use case:* Brukeren åpner appen og oppgir at hun i dag vil trene hele kroppen i 30 minutter (styrke) pluss 15 minutter kondisjon. Appen foreslår en komplett økt basert på øvelser brukeren har gjort før, eventuelt supplert med nye øvelser dersom det passer bedre innenfor tidsrammen. Brukeren kan takke ja, takke nei, eller gjøre tilpasninger før hun starter.

En variant: brukeren oppgir "jeg er litt sliten i dag, men ønsker å trene i 23 minutter" — appen tar hensyn til både redusert tid og oppgitt energinivå, og foreslår en tilpasset, mindre belastende økt innenfor tidsrammen.

## Hva gjør denne annerledes

Styrke- og kondisjonslogging finnes i mange apper (Strong, Hevy, Fitbod m.fl.). Det SmartØkt gjør annerledes:

- Bygget spesifikt rundt norske helsemyndigheters anbefalinger, ikke generiske internasjonale treningsmål
- Senker terskelen for nybegynnere aktivt (øvelsesforslag + videoforklaring), ikke bare et loggverktøy for de som allerede vet hva de gjør
- Øktforslag som respekterer tiden brukeren faktisk har, ikke en fast plan man må strekke seg etter
- Statistisk ærlig fremgangsprognose (viser usikkerhet fremfor skinnsikker prediksjon)

Vi skal være ærlige om moaten: dette er ikke en unik AI-modell eller patenterbar teknologi — fordelen ligger i kombinasjonen (lokalisering + lav terskel + tidsbevisste forslag + ærlig prognose) og i at vi bygger den raskt og fokusert som studentprosjekt.

## Hvem dette tjener

- **Nybegynneren** — usikker på egen kropp og riktig utførelse, vil komme i gang uten å måtte lese seg opp på treningsteori først. Suksess = tør å starte, og fullfører økter uten å google underveis.
- **Den erfarne, travle** (f.eks. småbarnsforelder) — har kunnskapen, mangler tiden. Suksess = får en effektiv økt tilpasset dagens tidsvindu, og ser at ukemålet nås over tid.

## Suksesskriterier

Faget stiller ingen eksterne krav utover at selve applikasjonen vurderes på funksjonalitet og UI-design. Foreslåtte kriterier for prosjektet:

- En bruker kan logge inn, registrere en økt og få et vektforslag uten å måtte forstå hvordan appen fungerer på forhånd
- Øktforslag tar faktisk hensyn til oppgitt tid, ønsket fokus, energinivå og loggført historikk
- Vektskive-kalkulatoren gir korrekt svar for standard skivesett
- Fremgangsgraf og prognose vises med tydelig, forståelig usikkerhetsindikasjon
- UI oppleves ryddig og tillitvekkende nok til å vise frem ved sensurering

## Scope

*Med i første versjon (frist medio desember 2026):*
- Brukerkonto/innlogging (nødvendig for historikk); gjestemodus for å slå opp øvelser uten innlogging
- Treningslogging (styrke + kondisjon/intervall)
- Vektskive-kalkulator
- Regelbasert øktanbefaling (tid til rådighet + ønsket fokus (styrke/kondisjon/begge) + oppgitt energinivå/slitenhet + loggført historikk + ukentlig aktivitetsmål), med mulighet for bruker til å akseptere, avslå eller justere forslaget
- API-integrasjon mot ekstern øvelsesdatabase (beskrivelser + video)
- Fremgangsgrafikk + regresjonsbasert prognose med R²-basert usikkerhetsindikasjon

*Eksplisitt utenfor scope:*
- Video-opptak av bruker + AI-teknikkanalyse ("PT i lomma") — parkert som visjon (se Visjon under). Gruppa vurderer å lage en konseptvideo av denne funksjonaliteten hvis tiden strekker til, som *demonstrasjon*, ikke som fungerende funksjon.

## Visjon

Om appen lykkes, ser vi for oss at "PT i lomma" blir virkelighet: brukeren filmer egne øvelser og får AI-drevet teknikk-tilbakemelding i sanntid, i tillegg til enda smartere, mer persontilpassede øktforslag. Appen kan da bli et reelt supplement til — eller for noen et alternativ til — personlig trener, spesielt for de som i dag ikke har råd eller tid til PT-oppfølging.
