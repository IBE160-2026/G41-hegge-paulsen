# Supabase-oppsett for SmartØkt

Denne appen bruker Supabase Auth for kontoer og `public.profiles` for brukerprofilen. Nettleseren bruker bare Supabase sin offentlige publishable key. Autorisasjon håndheves i databasen med Row Level Security (RLS).

## Opprett prosjekt

1. Opprett et prosjekt i Supabase-organisasjonen som eier prosjektet.
2. Velg region etter prosjektets krav til personvern og datalagring. Regionvalg alene er ikke en personvernvurdering.
3. Åpne Project Settings / API og kopier Project URL og publishable key. Ikke bruk eller eksponer `service_role`-nøkkelen i klienten.
4. Åpne SQL Editor og kjør innholdet i `supabase/migrations/202610110001_create_profiles.sql`.
5. Under Authentication / URL Configuration legg til lokal redirect URL `http://localhost:5173/**`. Legg også til den faktiske produksjonsadressen når appen publiseres.
6. Kontroller e-postbekreftelse under Authentication / Providers / Email. Appen viser beskjed om å bekrefte e-post dersom Supabase ikke starter en innlogget sesjon direkte etter registrering.

## Lokal app

Kopier `.env.example` til `.env.local`, og fyll bare inn disse offentlige klientverdiene:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
```

Start appen på nytt etter at miljøvariablene er endret:

```bash
npm install
npm run dev
```

Åpne URL-en Vite skriver ut, normalt `http://localhost:5173/`.

Uten Supabase-konfigurasjon virker treningsdelen lokalt, men konto-funksjonene er slått av. Ikke legg en `service_role`-nøkkel i `.env.local`, `VITE_*`-variabler, kildekode eller GitHub.

## Profil og tilgang

- Konto opprettes med e-post og passord; Supabase håndterer passord og sesjon.
- Profilen lagrer unikt brukernavn, valgfri alder, valgfri kroppsvekt i kg og utstyrslisten.
- Kroppsvekt er et eget felt og er ikke det samme som belastning i treningsloggen.
- Treningshistorikken er foreløpig fortsatt lokal i nettleseren. Den bruker en egen lagringsnøkkel per innlogget bruker, men synkroniseres ikke til Supabase.
- Eldre anonym treningshistorikk importeres ikke automatisk til en konto, for å unngå å knytte data til feil bruker.
- RLS tillater en innlogget bruker å lese, opprette og endre bare raden der `profiles.id` er brukerens `auth.uid()`.
- Profilraden slettes automatisk når den tilhørende auth-brukeren slettes.
- Alder er foreløpig begrenset til 13–120 år og kroppsvekt til 20–400 kg. Aldersgrense og innsamling av personopplysninger må vurderes og vedtas av prosjektgruppen før produksjonsbruk.

## Før produksjonssetting

- Avklar behandlingsgrunnlag, personvernerklæring, lagringstid og rutine for sletting av konto/data.
- Avklar om aldersfeltet trengs. Ikke bruk alder eller kroppsvekt til medisinsk eller individuell helserådgivning i denne MVP-en.
- Sett produksjonsdomene og redirect allowlist i Supabase.
- Vurder Supabase e-postlevering, rate limits, passordpolicy og kontobekreftelse.
- Kjør `npm run build` og `npm test` før deploy.