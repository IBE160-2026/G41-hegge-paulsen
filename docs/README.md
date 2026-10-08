# SmartØkt project structure

Denne prosjektstrukturen er laget for å være enklere å lese i GitHub og lettere å utvide senere.

## Hovedstruktur

```text
SmartØkt/
├── README.md
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── src/
│   ├── app/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── styles.css
│   │   └── ui.js
│   ├── data/
│   │   ├── exerciseCatalog.js
│   │   └── sampleHistory.js
│   └── features/
│       ├── recommendationEngine.js
│       ├── weightProgression.js
│       └── trainingLog.js
├── tests/
│   └── recommendation-engine.test.js
├── docs/
│   ├── README.md
│   └── mvp-status.md
├── error/
│   └── README.md
├── _bmad-output/
│   └── planning-artifacts/
└── node_modules/
```

## Navnerutine

- `src/features/` brukes for app-logikk og beslutningstaking
- `src/data/` inneholder lokale datamodeller og eksempeldata
- `src/app/` inneholder UI og app-state
- `tests/` brukes kun til verifisering
- `docs/` brukes til prosjekt- og statusdokumentasjon
- `error/` brukes for feil- og problemhistorikk

## Gode prinsipper

- bruk konkrete navn som beskriver hva filen gjør
- unngå generiske navn som `data.js` eller `logic.js`
- hold UI, logikk og data adskilt i egne mapper
- bruk engelsk eller konsistent norsk-tilpasset naming i samme prosjekt
