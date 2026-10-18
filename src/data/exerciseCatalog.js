const baseExerciseData = [
  {
    id: 'squat',
    name: { no: 'Knebøy', en: 'Squat' },
    category: 'strength',
    focus: 'styrke',
    difficulty: 'medium',
    description: {
      no: 'Klassisk helkroppsøvelse som styrker ben, gluteus og core.',
      en: 'Classic full-body movement that strengthens the legs, glutes, and core.'
    },
    instructions: {
      no: 'Stå med føttene i skulderbredde. Senk hoften bakover og ned, hold ryggen stabil, og press deg opp igjen.',
      en: 'Stand with feet shoulder-width apart. Sit your hips back and down, keep your back stable, and drive back up.'
    },
    muscles: ['Ben', 'Gluteus', 'Core'],
    videoUrl: 'https://www.youtube.com/results?search_query=Kneb%C3%B8y+Squat+utf%C3%B8relse',
    animation: 'squat'
  },
  {
    id: 'bench-press',
    name: { no: 'Benkpress', en: 'Bench Press' },
    category: 'strength',
    focus: 'styrke',
    difficulty: 'medium',
    description: {
      no: 'Styrker bryst, skuldre og triceps med kontrollert press.',
      en: 'Builds chest, shoulders, and triceps with a controlled pressing motion.'
    },
    instructions: {
      no: 'Legg deg på benken, plasser hendene i riktig bredde og senk stangen kontrollert mot brystet før du presser opp.',
      en: 'Lie on the bench, place your hands at a comfortable width, lower the bar under control to your chest, then press upward.'
    },
    muscles: ['Bryst', 'Skuldre', 'Triceps'],
    videoUrl: 'https://www.youtube.com/results?search_query=Benkpress+Bench+Press+utf%C3%B8relse',
    animation: 'bench-press'
  },
  {
    id: 'deadlift',
    name: { no: 'Markløft', en: 'Deadlift' },
    category: 'strength',
    focus: 'styrke',
    difficulty: 'hard',
    description: {
      no: 'Kraftfull øvelse for bakside, gluteus og hamstrings.',
      en: 'Heavy full-body lift that strengthens the posterior chain, glutes, and hamstrings.'
    },
    instructions: {
      no: 'Hold stangen tett på lårene, rett rygg og bryst opp. Høyne vekten ved å strekkes gjennom hofter og knær uten å runde ryggen.',
      en: 'Keep the bar close to your shins, chest up, and back flat. Lift by extending the hips and knees without rounding the spine.'
    },
    muscles: ['Bakside', 'Gluteus', 'Hamstrings'],
    videoUrl: 'https://www.youtube.com/results?search_query=Markl%C3%B8ft+Deadlift+utf%C3%B8relse',
    animation: 'deadlift'
  },
  {
    id: 'push-up',
    name: { no: 'Armheving', en: 'Push-up' },
    category: 'bodyweight',
    focus: 'styrke',
    difficulty: 'medium',
    description: {
      no: 'Kroppsvektøvelse for bryst, skuldre og triceps.',
      en: 'Bodyweight exercise for the chest, shoulders, and triceps.'
    },
    instructions: {
      no: 'Plasser hender under skuldrene, hold kroppen i en rett linje og senk brystet mot gulvet før du presser deg opp.',
      en: 'Place your hands under your shoulders, keep your body in a straight line, and lower your chest toward the floor before pushing back up.'
    },
    muscles: ['Bryst', 'Skuldre', 'Triceps'],
    videoUrl: 'https://www.youtube.com/results?search_query=Armheving+Push+up+utf%C3%B8relse',
    animation: 'push-up'
  },
  {
    id: 'air-squat',
    name: { no: 'Mini-knebøy med støtte', en: 'Supported Mini Squat' },
    category: 'bodyweight',
    focus: 'styrke',
    difficulty: 'easy',
    description: {
      no: 'Grunnleggende knebøybevegelse med støtte fra en stabil stol.',
      en: 'Foundational squat movement using a stable chair for support.'
    },
    instructions: {
      no: 'Stå bak en stabil stol med hendene lett på ryggen. Bøy knærne rolig så langt det kjennes komfortabelt, hold ryggen rett og knærne pekende fram. Reis deg kontrollert.',
      en: 'Stand behind a stable chair with your hands resting lightly on its back. Slowly bend your knees as far as comfortable, keep your back straight and knees facing forward, then return to standing with control.'
    },
    muscles: ['Ben', 'Gluteus', 'Core'],
    videoUrl: 'https://www.youtube.com/results?search_query=Air+Squat+Kneb%C3%B8y+uten+vekt+utf%C3%B8relse',
    animation: 'air-squat'
  },
  {
    id: 'rowing',
    name: { no: 'Roing', en: 'Rowing' },
    category: 'conditioning',
    focus: 'kondisjon',
    difficulty: 'medium',
    description: {
      no: 'Kondisjonsøvelse som trener rygg, armer og utholdenhet.',
      en: 'Conditioning exercise that trains the back, arms, and endurance.'
    },
    instructions: {
      no: 'Ta tak i håndtakene, skyv med bena og dra håndtakene mot magen i en jevn, kontinuerlig rytme.',
      en: 'Grab the handles, drive with the legs, and pull the handle toward the torso in a smooth continuous rhythm.'
    },
    muscles: ['Rygg', 'Armer', 'Skuldre'],
    videoUrl: 'https://www.youtube.com/results?search_query=Roing+Rowing+utf%C3%B8relse',
    animation: 'rowing'
  },
  {
    id: 'cycling',
    name: { no: 'Sykling', en: 'Cycling' },
    category: 'conditioning',
    focus: 'kondisjon',
    difficulty: 'easy',
    description: {
      no: 'Lett til middels kondisjonsøvelse som bygger utholdenhet.',
      en: 'Easy to moderate conditioning drill that builds endurance.'
    },
    instructions: {
      no: 'Hold en jevn kadens og velg et tempo du kan opprettholde uten å presse for hardt i starten.',
      en: 'Maintain a steady cadence and choose a pace you can sustain without overexerting yourself early on.'
    },
    muscles: ['Ben', 'Gluteus', 'Legger'],
    videoUrl: 'https://www.youtube.com/results?search_query=Sykling+Cycling+utf%C3%B8relse',
    animation: 'cycling'
  },
  {
    id: 'burpee',
    name: { no: 'Burpee', en: 'Burpee' },
    category: 'bodyweight',
    focus: 'kondisjon',
    difficulty: 'hard',
    description: {
      no: 'Kraftig kroppsvektøvelse som kombinerer styrke og kondisjon.',
      en: 'High-intensity bodyweight movement combining strength and conditioning.'
    },
    instructions: {
      no: 'Start i stående stilling, senk deg ned i en dukkert, legg deg i planke, gjør en armheving og hop tilbake opp.',
      en: 'Start standing, drop into a squat thrust, move into a plank, perform a push-up, then jump back up.'
    },
    muscles: ['Bryst', 'Core', 'Ben'],
    videoUrl: 'https://www.youtube.com/results?search_query=Burpee+utf%C3%B8relse',
    animation: 'burpee'
  },
  {
    id: 'mountain-climbers',
    name: { no: 'Bergklatrere', en: 'Mountain Climbers' },
    category: 'bodyweight',
    focus: 'kondisjon',
    difficulty: 'medium',
    description: {
      no: 'Høy-intensitets kroppsvektøvelse som aktiverer core og kondisjon.',
      en: 'High-intensity bodyweight drill that activates the core and conditioning system.'
    },
    instructions: {
      no: 'Start i planke, skift fotene raskt inn mot brystet som i et løp, og hold kroppen stabil.',
      en: 'Start in a plank, drive alternating knees toward the chest in a fast rhythm while keeping the body stable.'
    },
    muscles: ['Core', 'Skuldre', 'Ben'],
    videoUrl: 'https://www.youtube.com/results?search_query=Mountain+Climbers+Bergklatrere+utf%C3%B8relse',
    animation: 'mountain-climbers'
  },
  {
    id: 'lunges',
    name: { no: 'Lunges', en: 'Lunges' },
    category: 'strength',
    focus: 'styrke',
    difficulty: 'medium',
    description: {
      no: 'Balanset og benstyrke med fokus på underkropp og stabilitet.',
      en: 'Balance and leg-strength movement focusing on the lower body and stability.'
    },
    instructions: {
      no: 'Ta ett langt steg fram, senk deg ned til begge knær er bøyd, og press tilbake til startposisjon.',
      en: 'Step forward into a long stride, lower until both knees are bent, and press back to the starting position.'
    },
    muscles: ['Ben', 'Gluteus', 'Core'],
    videoUrl: 'https://www.youtube.com/results?search_query=Lunges+utf%C3%B8relse',
    animation: 'lunges'
  },
  {
    id: 'pull-up',
    name: { no: 'Pull-up', en: 'Pull-up' },
    category: 'strength',
    focus: 'styrke',
    difficulty: 'hard',
    description: {
      no: 'Øvelse for rygg, biceps og overkroppsstyrke.',
      en: 'Exercise for the back, biceps, and upper-body strength.'
    },
    instructions: {
      no: 'Grip stangen med håndflaten bort fra deg, dra kroppen opp til kjeven går over stangen, og senk kontrollert ned.',
      en: 'Grip the bar with palms facing away from you, pull your body up until the chin clears the bar, and lower under control.'
    },
    muscles: ['Rygg', 'Biceps', 'Skuldre'],
    videoUrl: 'https://www.youtube.com/results?search_query=Pull-up+utf%C3%B8relse',
    animation: 'pull-up'
  },
  {
    id: 'mobility-flow',
    name: { no: 'Mobilitetsflow', en: 'Mobility Flow' },
    category: 'mobility',
    focus: 'generell',
    difficulty: 'easy',
    description: {
      no: 'Kort mobilitetsøkt for å aktivere og løsne opp kroppen.',
      en: 'Short mobility sequence to activate and open up the body.'
    },
    instructions: {
      no: 'Beveg leddene i en kontrollert, rolig rytme: hofte, skuldre, rygg og ankler.',
      en: 'Move through the joints in a controlled, calm rhythm: hips, shoulders, spine, and ankles.'
    },
    muscles: ['Hofte', 'Skuldre', 'Rygg'],
    videoUrl: 'https://www.youtube.com/results?search_query=Mobility+Flow+Movements+utf%C3%B8relse',
    animation: 'mobility-flow'
  }
];

export const exerciseSources = {
  'nhs-strength-exercises': {
    title: 'NHS: Strength exercises',
    organization: 'National Health Service (NHS)',
    url: 'https://www.nhs.uk/live-well/exercise/strength-exercises/',
    accessed: '2026-10-08',
    supports: ['mini-squats', 'wall-push-up'],
    notes: 'Supports the listed NHS exercise instructions only; it does not verify other variations or the app\'s training prescriptions.'
  },
  'mayo-strength-training': {
    title: 'Mayo Clinic: Strength training: Get stronger, leaner, healthier',
    organization: 'Mayo Clinic Staff',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/strength-training/art-20046670',
    accessed: '2026-10-08',
    supports: [],
    notes: 'General background on strength training, equipment options, gradual progression, and safety; not a source for specific exercise technique.'
  },
  'ace-exercise-library': {
    title: 'ACE: Exercise Library',
    organization: 'American Council on Exercise (ACE)',
    url: 'https://www.acefitness.org/resources/everyone/exercise-library/',
    accessed: '2026-10-08',
    supports: [],
    notes: 'Exercise-library index with movement instructions and equipment/difficulty metadata; individual entries still need to be matched and reviewed.'
  },
  'exrx-exercise-directory': {
    title: 'ExRx.net: Exercise Directory',
    organization: 'ExRx.net',
    url: 'https://exrx.net/Lists/Directory',
    accessed: '2026-10-08',
    supports: [],
    notes: 'Exercise reference directory; specific exercise pages must be matched and reviewed before supporting catalog instructions.'
  }
};

const sourceReviewStatus = Object.fromEntries(
  Object.keys(exerciseSources).map((sourceId) => [sourceId, 'needs-review'])
);
sourceReviewStatus['nhs-strength-exercises'] = 'reviewed';

function withSourceStatus(exercise) {
  const sourceIds = exercise.sourceIds || [];
  const sourceStatus = sourceIds.some((sourceId) => sourceReviewStatus[sourceId] === 'reviewed')
    ? 'reviewed'
    : 'needs-review';

  return { ...exercise, sourceIds, sourceStatus };
}

// A `category` set here overrides the one in baseExerciseData for that exercise's own
// catalog entry, but createVariant() reads straight from baseExerciseData, so a variant
// without its own `category` override still inherits the unoverridden base value.
const exerciseAttributes = {
  squat: { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'squat', level: 'beginner', category: 'bodyweight' },
  'bench-press': { equipment: ['barbell'], trainingModes: ['gym'], movementPattern: 'horizontal-push', level: 'intermediate' },
  deadlift: { equipment: ['barbell'], trainingModes: ['gym'], movementPattern: 'hinge', level: 'advanced' },
  'push-up': { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'horizontal-push', level: 'intermediate' },
  'air-squat': { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'squat', level: 'beginner' },
  rowing: { equipment: ['rowing-machine'], trainingModes: ['gym'], movementPattern: 'conditioning', level: 'intermediate' },
  cycling: { equipment: ['stationary-bike'], trainingModes: ['gym'], movementPattern: 'conditioning', level: 'beginner' },
  burpee: { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'conditioning', level: 'advanced' },
  'mountain-climbers': { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'conditioning', level: 'intermediate' },
  lunges: { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'single-leg', level: 'intermediate', category: 'bodyweight' },
  'pull-up': { equipment: ['pull-up-bar'], trainingModes: ['gym'], movementPattern: 'vertical-pull', level: 'advanced' },
  'mobility-flow': { equipment: ['bodyweight'], trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'mobility', level: 'beginner' }
};

const exerciseLevelRank = { beginner: 1, intermediate: 2, advanced: 3 };

function createVariant(baseId, variant) {
  const baseExercise = baseExerciseData.find((exercise) => exercise.id === baseId);

  return {
    ...baseExercise,
    ...variant,
    description: variant.description,
    instructions: variant.instructions,
    videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${variant.name.en} exercise form`)}`
  };
}

const exerciseVariants = [
  createVariant('squat', {
    id: 'barbell-squat', name: { no: 'Knebøy med stang', en: 'Barbell Back Squat' }, equipment: ['barbell'],
    trainingModes: ['gym'], movementPattern: 'squat', level: 'intermediate',
    description: { no: 'Knebøyvariant med vektstang for styrke i ben og hofte.', en: 'Barbell squat variation for leg and hip strength.' },
    instructions: { no: 'Plasser stangen stødig på øvre rygg. Bøy hofte og knær kontrollert, og press gjennom hele foten opp igjen.', en: 'Rest the bar securely on your upper back. Bend at the hips and knees with control, then drive through the whole foot to stand.' }
  }),
  createVariant('squat', {
    id: 'dumbbell-goblet-squat', name: { no: 'Goblet-knebøy med manual', en: 'Dumbbell Goblet Squat' }, equipment: ['dumbbell'],
    trainingModes: ['home-dumbbell', 'gym'], movementPattern: 'squat', level: 'beginner',
    description: { no: 'Knebøy med én manual holdt foran kroppen.', en: 'Squat holding one dumbbell in front of the body.' },
    instructions: { no: 'Hold manualen tett mot brystet. Senk deg mellom knærne med stabil overkropp, og reis deg kontrollert.', en: 'Hold the dumbbell close to your chest. Lower between your knees with a steady torso, then stand with control.' }
  }),
  createVariant('squat', {
    id: 'kettlebell-goblet-squat', name: { no: 'Goblet-knebøy med kettlebell', en: 'Kettlebell Goblet Squat' }, equipment: ['kettlebell'],
    trainingModes: ['home-kettlebell', 'gym'], movementPattern: 'squat', level: 'beginner',
    description: { no: 'Knebøy med kettlebell holdt foran brystet.', en: 'Squat holding a kettlebell in front of the chest.' },
    instructions: { no: 'Hold kettlebellen ved håndtakene foran brystet. Senk hoften kontrollert og reis deg uten at knærne faller innover.', en: 'Hold the kettlebell by its handles at your chest. Lower your hips with control and stand without letting your knees collapse inward.' }
  }),
  createVariant('squat', {
    id: 'leg-press', name: { no: 'Benpress i maskin', en: 'Machine Leg Press' }, equipment: ['machine'],
    trainingModes: ['gym'], movementPattern: 'squat', level: 'beginner',
    description: { no: 'Benpress i maskin med støtte for rygg og overkropp.', en: 'Machine-based leg press with back and torso support.' },
    instructions: { no: 'Plasser føttene omtrent i skulderbredde. Senk vekten så langt du kan holde korsryggen mot støtten, og press opp uten å låse knærne.', en: 'Place feet about shoulder-width apart. Lower only as far as you can keep your lower back against the pad, then press without locking your knees.' }
  }),
  createVariant('bench-press', {
    id: 'dumbbell-floor-press', name: { no: 'Gulvpress med manualer', en: 'Dumbbell Floor Press' }, equipment: ['dumbbell'],
    trainingModes: ['home-dumbbell', 'gym'], movementPattern: 'horizontal-push', level: 'beginner',
    description: { no: 'Brystpress med manualer fra gulvet.', en: 'Dumbbell chest press performed from the floor.' },
    instructions: { no: 'Ligg på ryggen med bøyde knær og manualene over brystet. Senk albuene rolig til gulvet og press opp igjen.', en: 'Lie on your back with knees bent and dumbbells above your chest. Lower your elbows gently to the floor and press back up.' }
  }),
  createVariant('push-up', {
    id: 'wall-push-up', name: { no: 'Armheving mot vegg', en: 'Wall Push-up' }, equipment: ['bodyweight'], sourceIds: ['nhs-strength-exercises'],
    trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'horizontal-push', level: 'beginner',
    description: { no: 'En lettere armhevingsvariant med hendene mot veggen.', en: 'An easier push-up variation performed against a wall.' },
    instructions: { no: 'Stå med hendene flatt mot veggen i brysthøyde. Hold ryggen rett, bøy albuene kontrollert og før brystet mot veggen. Press deg rolig tilbake til start.', en: 'Stand with your hands flat against the wall at chest height. Keep your back straight, bend your elbows under control, bring your chest toward the wall, then slowly press back.' }
  }),
  createVariant('deadlift', {
    id: 'dumbbell-romanian-deadlift', name: { no: 'Rumensk markløft med manualer', en: 'Dumbbell Romanian Deadlift' }, equipment: ['dumbbell'],
    trainingModes: ['home-dumbbell', 'gym'], movementPattern: 'hinge', level: 'intermediate',
    description: { no: 'Hoftebevegelse med manualer for bakside lår og hofte.', en: 'Dumbbell hip-hinge exercise for the hamstrings and hips.' },
    instructions: { no: 'Hold manualene foran lårene. Skyv hoften bakover med lett bøyde knær og rett rygg, og reis deg ved å føre hoften fram.', en: 'Hold dumbbells in front of your thighs. Push your hips back with softly bent knees and a neutral back, then stand by driving your hips forward.' }
  }),
  createVariant('deadlift', {
    id: 'kettlebell-deadlift', name: { no: 'Markløft med kettlebell', en: 'Kettlebell Deadlift' }, equipment: ['kettlebell'],
    trainingModes: ['home-kettlebell', 'gym'], movementPattern: 'hinge', level: 'beginner',
    description: { no: 'En grunnleggende hoftebevegelse med kettlebell mellom føttene.', en: 'A foundational hip hinge with a kettlebell between the feet.' },
    instructions: { no: 'Stå med kettlebellen mellom føttene. Skyv hoften bak, grip håndtaket og press føttene i gulvet mens du reiser deg.', en: 'Stand with the kettlebell between your feet. Hinge back, grip the handle, and push the floor away as you stand.' }
  }),
  createVariant('rowing', {
    id: 'dumbbell-row', name: { no: 'Enarms roing med manual', en: 'Single-arm Dumbbell Row' }, equipment: ['dumbbell'],
    trainingModes: ['home-dumbbell', 'gym'], movementPattern: 'horizontal-pull', level: 'beginner', category: 'strength', focus: 'styrke',
    muscles: ['Rygg', 'Biceps'],
    description: { no: 'Enarms trekkøvelse for rygg og armer.', en: 'Single-arm pulling exercise for the back and arms.' },
    instructions: { no: 'Støtt én hånd på en benk eller stol. Trekk manualen mot hoften uten å rotere overkroppen, og senk rolig.', en: 'Support one hand on a bench or chair. Pull the dumbbell toward your hip without rotating your torso, then lower slowly.' }
  }),
  createVariant('rowing', {
    id: 'seated-cable-row', name: { no: 'Sittende kabelroing', en: 'Seated Cable Row' }, equipment: ['cable-machine'],
    trainingModes: ['gym'], movementPattern: 'horizontal-pull', level: 'intermediate', category: 'strength', focus: 'styrke',
    muscles: ['Rygg', 'Biceps'],
    description: { no: 'Sittende trekkøvelse i kabelapparat.', en: 'Seated pulling exercise using a cable machine.' },
    instructions: { no: 'Sitt stabilt med strak rygg. Trekk håndtaket mot nedre ribbein med albuene tett inntil kroppen, og før det kontrollert tilbake.', en: 'Sit tall with a steady torso. Pull the handle toward your lower ribs with elbows close, then return it under control.' }
  }),
  createVariant('pull-up', {
    id: 'lat-pulldown', name: { no: 'Nedtrekk i apparat', en: 'Lat Pulldown' }, equipment: ['machine'],
    trainingModes: ['gym'], movementPattern: 'vertical-pull', level: 'beginner',
    muscles: ['Rygg', 'Biceps'],
    description: { no: 'Vertikalt trekk i apparat med justerbar belastning.', en: 'Vertical pulling exercise with adjustable machine resistance.' },
    instructions: { no: 'Grip stangen litt bredere enn skuldrene. Trekk den mot øvre bryst uten å lene deg langt bak, og strekk armene kontrollert opp.', en: 'Grip the bar slightly wider than shoulder-width. Pull toward your upper chest without leaning far back, then extend your arms with control.' }
  }),
  createVariant('lunges', {
    id: 'step-up', name: { no: 'Oppsteg på lav kasse', en: 'Low Box Step-up' }, equipment: ['bodyweight'], category: 'bodyweight',
    trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'single-leg', level: 'beginner',
    description: { no: 'Kontrollert oppsteg på et stabilt, lavt trinn.', en: 'Controlled step-up onto a stable, low platform.' },
    instructions: { no: 'Sett hele foten på et lavt, stabilt trinn. Press gjennom foten for å komme opp, og gå rolig ned igjen.', en: 'Place your whole foot on a low, stable step. Press through that foot to rise, then step down slowly.' }
  }),
  createVariant('push-up', {
    id: 'plank', name: { no: 'Planke på knær eller tær', en: 'Knee or Full Plank' }, equipment: ['bodyweight'],
    trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'core', level: 'beginner',
    muscles: ['Core', 'Skuldre'],
    description: { no: 'Isometrisk kjernestabilitet med valgfri støtte på knær.', en: 'Isometric core stability with the option to support on the knees.' },
    instructions: { no: 'Støtt deg på underarmene og knærne eller tærne. Hold kroppen i en rett linje og pust rolig uten å synke i hoften.', en: 'Support yourself on your forearms and knees or toes. Keep your body in a straight line and breathe steadily without letting your hips sag.' }
  }),
  createVariant('rowing', {
    id: 'kettlebell-row', name: { no: 'Enarms roing med kettlebell', en: 'Single-arm Kettlebell Row' }, equipment: ['kettlebell'],
    trainingModes: ['home-kettlebell', 'gym'], movementPattern: 'horizontal-pull', level: 'beginner', category: 'strength', focus: 'styrke',
    muscles: ['Rygg', 'Biceps'],
    description: { no: 'Enarms roing med kettlebell for rygg og armer.', en: 'Single-arm kettlebell row for the back and arms.' },
    instructions: { no: 'Støtt én hånd på en benk eller stol. Trekk kettlebellen mot hoften med kontroll, og senk den rolig.', en: 'Support one hand on a bench or chair. Row the kettlebell toward your hip with control, then lower it slowly.' }
  }),
  createVariant('cycling', {
    id: 'march-in-place', name: { no: 'Marsj på stedet', en: 'March in Place' }, equipment: ['bodyweight'],
    trainingModes: ['home-bodyweight', 'home-dumbbell', 'home-kettlebell', 'gym'], movementPattern: 'conditioning', level: 'beginner',
    description: { no: 'Skånsom kondisjonsaktivitet uten treningsutstyr.', en: 'Low-impact conditioning without exercise equipment.' },
    instructions: { no: 'Marsjer rolig på stedet og løft knærne i et behagelig tempo. Hold overkroppen oppreist og øk tempoet gradvis ved behov.', en: 'March in place at a comfortable pace, lifting your knees. Stay upright and gradually increase the pace if appropriate.' }
  })
];

const baseExercisesWithAttributes = baseExerciseData.map((exercise) => ({
  ...exercise,
  ...exerciseAttributes[exercise.id],
  ...(exercise.id === 'air-squat' ? { sourceIds: ['nhs-strength-exercises'] } : {})
}));

export const exerciseData = [...baseExercisesWithAttributes, ...exerciseVariants].map(withSourceStatus);
