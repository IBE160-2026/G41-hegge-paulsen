export const exerciseData = [
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
    videoUrl: 'https://www.youtube.com/results?search_query=Kneb%C3%B8y+Squat+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Benkpress+Bench+Press+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Markl%C3%B8ft+Deadlift+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Armheving+Push+up+utf%C3%B8relse'
  },
  {
    id: 'air-squat',
    name: { no: 'Knebøy uten vekt', en: 'Air Squat' },
    category: 'bodyweight',
    focus: 'styrke',
    difficulty: 'easy',
    description: {
      no: 'Enkel kroppsvektøvelse for ben, gluteus og stabilitet.',
      en: 'Simple bodyweight movement for legs, glutes, and stability.'
    },
    instructions: {
      no: 'Bøy i knær og hofter, hold brystet opp, og kom tilbake til startposisjon med kontroll.',
      en: 'Bend at the knees and hips, keep the chest up, and return to standing with control.'
    },
    videoUrl: 'https://www.youtube.com/results?search_query=Air+Squat+Kneb%C3%B8y+uten+vekt+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Roing+Rowing+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Sykling+Cycling+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Burpee+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Mountain+Climbers+Bergklatrere+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Lunges+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Pull-up+utf%C3%B8relse'
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
    videoUrl: 'https://www.youtube.com/results?search_query=Mobility+Flow+Movements+utf%C3%B8relse'
  }
];
