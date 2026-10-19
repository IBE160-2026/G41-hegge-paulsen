# SmartØkt MVP Status

## Status
MVP-kjerneflyten fungerer, og flere post-MVP-funksjoner er allerede lagt til: ukentlig aktivitetsvurdering (med 65+-regel), auto-generert ukeplan, og en regelbasert chat som alternativ til menyen.

## Scope
### In scope
- bruker kan velge tid, fokus og energinivå, enten via meny eller ved å beskrive økten med egne ord til en enkel regelbasert chat
- appen genererer et realistisk øktforslag, vist på en egen side
- bruker kan logge en økt
- appen gir et forslag til neste vekt
- appen viser enkel progresjon over tid og en ukentlig vurdering mot Helsedirektoratets aktivitetsråd (inkludert 65+-regelen for balanse- og styrketrening)
- bruker kan generere en ukeplan (flere dager) via meny eller chat, med mulighet for å overstyre fokus/energi/treningsoppsett/treningsnivå per dag
- lokal fallback-data brukes når ekstern API ikke er tilgjengelig

### Out of scope
- live eksterne API-integrasjoner utover Supabase-kontoer (ingen egen AI/LLM-API — chatten er regelbasert tekstgjenkjenning, ikke en ekte språkmodell)
- avansert videoanalyse
- sosial eller lagbasert trening
- Supabase-synk av ukeplanen (per nå kun lokal lagring per bruker — se deferred-work.md)

## Definition of done for MVP
- appen kan kjøres lokalt uten egne nøkler
- kjerneflyten fungerer uten større feil
- historikk brukes i anbefalingslogikken
- progress view er enkel og forståelig
- README er oppdatert og følger reell prosjektstatus
- tester dekker sentral logikk

## Current focus
Verifisere den siste runden med UI-endringer i en faktisk nettleser (chat-input, ukeplan med per-dag-overstyring, og den nye forslagssiden) — disse er bygget og testet med jsdom/vitest, men ikke sett i en ekte nettleser ennå.

## Next steps
1. Kjør gjennom hele flyten i en nettleser: meny → forslagsside, chat → forslagsside, ukeplan (meny og chat) → forslagsside, og innlogging mens man er på forslagssiden.
2. Vurder om ukeplanen skal synkroniseres til Supabase for innloggede brukere (se deferred-work.md for migreringsspørsmålet dette reiser).
3. Se over `_bmad-output/implementation-artifacts/deferred-work.md` for resterende mindre funn (test-dekning, en racing-tilstand i applySession, m.m.).
4. Vurder om PR-en for `worktree-smartokt-deferred-work` skal åpnes nå som det er en samlet, sammenhengende leveranse.

## Notes
Dette dokumentet er ment som en enkel statusoversikt som skal være sporbar i repoet og som viser at vi jobber mot et realistisk og begrenset MVP.
