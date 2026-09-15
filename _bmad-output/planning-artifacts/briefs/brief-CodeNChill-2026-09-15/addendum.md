---
title: Addendum - Product Brief (SmartØkt, arbeidsnavn)
related_brief: brief.md
updated: 2026-09-15
---

# Addendum

Utfyllende innhold som er for teknisk detaljert for selve briefen, men relevant for PRD/arkitektur senere.

## Fremgangsprognose - statistisk metode

Bruker ønsker at prognosen ("hvor lang tid til X kg i Y løft") ikke bare bygger på enkel lineær fremskriving, men på en regresjonsanalyse med tilhørende R² som mål på treffsikkerhet.

Forslag til tilnærming (til vurdering i PRD/arkitektur, ikke bestemt):

- Kjør lineær regresjon på loggført progresjon (vekt/rep over tid) for gitt øvelse.
- Beregn R². Foreslått terskel: **R² ≥ 0,7** anses som "god nok" til å vise en konkret prognose. Under det er individuell treningsdata typisk for støyete til at en lineær modell er pålitelig (variasjon fra søvn, ernæring, form, avbrekk).
- Hvis R² < 0,7: vurder alternative funksjonsformer før man gir opp. Styrkeprogresjon følger ofte avtakende avkastning (raske "nybegynner-gains" flater etterhvert ut), så en logaritmisk eller potens-tilpasning (diminishing-returns-kurve) kan passe bedre enn lineær for brukere med lengre historikk.
- Hvis ingen modell gir akseptabel R² (f.eks. < 0,5) eller det er for få datapunkter: ikke vis en falsk-presis prognose. Vis heller en kvalitativ tilbakemelding ("for tidlig å si", "trenger flere loggførte økter") — en selvsikker feilaktig prognose skader tilliten til appen mer enn å innrømme usikkerhet.
