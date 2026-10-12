// Pre-built clinical CAA modeling activities
// Designed for parents, educators (PIE), and speech-language pathologists (SLP)
// Verified ARASAAC IDs matching the app catalog:
// VAMOS: 8142, PARAR: 7196, MÁS: 3220, ABRIR: 24825, BURBUJAS: 6945, QUIERO: 5441, COMER: 6456

export const DEFAULT_ACTIVITIES = [
  {
    id: 'act-1',
    title: 'La Carrera Congelada',
    summary: 'Juego dinámico con autos o pelotas para estimular la petición espontánea y la pausa expectante.',
    levelId: '1',
    levelLabel: 'Nivel 1: Explorador (1 palabra)',
    contextId: 'juegos',
    contextLabel: 'Juegos con Juguetes',
    goalId: 'peticion',
    goalLabel: 'Petición y Causa-Efecto',
    duration: '5 min',
    pictograms: [
      { text: 'VAMOS', arasaacId: 8142, role: 'Acción principal de avance' },
      { text: 'PARAR', arasaacId: 7196, role: 'Freno y límite' },
      { text: 'MÁS', arasaacId: 3220, role: 'Continuar la emoción' }
    ],
    steps: [
      {
        phase: '1. Enganche y Motivación',
        instruction: 'Haz rodar un auto hacia el niño con un sonido exagerado y alegre ("¡Brummm!").',
        adultScript: '¡Mira qué rápido va el auto rojo!',
        tip: 'Capta su sonrisa y mirada compartida antes de frenar el auto.'
      },
      {
        phase: '2. La Pausa Mágica (Expectante)',
        instruction: 'Toma el auto con tu mano y "congélalo". Espera 10 segundos con mirada atenta y sonrisa cálida sin hablar.',
        adultScript: '',
        tip: 'No preguntes "¿qué quieres?". La pausa expectante le da tiempo a su mente de iniciar la comunicación.'
      },
      {
        phase: '3. Modelado en el Comunicador',
        instruction: 'Si el niño mira el auto o a ti, toca tú en el comunicador la palabra VAMOS o MÁS señalando la pantalla.',
        adultScript: '¡VAMOS!',
        tip: 'Modela sin tomarle la mano a la fuerza. Tu ejemplo es el mejor maestro.'
      },
      {
        phase: '4. Recompensa Inmediata',
        instruction: 'Apenas intente tocar la pantalla o mire el pictograma, lanza el auto a toda velocidad.',
        adultScript: '¡Sí! ¡Vaaamos a correr!',
        tip: 'La consecuencia natural inmediata consolida que comunicar tiene poder real.'
      }
    ],
    planB: 'Si el niño empuja el auto o se molesta, modela con voz suave el pictograma PARAR: "Entiendo, paramos con el auto, está bien" y guarda el juguete sin frustración.'
  },
  {
    id: 'act-2',
    title: 'El Secreto de las Burbujas Atrapadas',
    summary: 'Aprovecha el imán visual de las burbujas para enseñar a pedir "ABRIR" y "MÁS".',
    levelId: '1',
    levelLabel: 'Nivel 1: Explorador (1 palabra)',
    contextId: 'juegos',
    contextLabel: 'Juegos con Juguetes',
    goalId: 'peticion',
    goalLabel: 'Petición con Elemento Deseado',
    duration: '5 min',
    pictograms: [
      { text: 'ABRIR', arasaacId: 24825, role: 'Desbloquear el juego' },
      { text: 'BURBUJAS', arasaacId: 6945, role: 'Objeto de deseo' },
      { text: 'MÁS', arasaacId: 3220, role: 'Pedir otra ronda' }
    ],
    steps: [
      {
        phase: '1. Enganche Sensorial',
        instruction: 'Sopla una ronda de burbujas en el aire. Deja que el niño las mire y las reviente con sus manos.',
        adultScript: '¡Mira cuántas burbujas vuelan!',
        tip: 'El estímulo visual genera motivación intrínseca inmediata.'
      },
      {
        phase: '2. Frasco Cerrado (Barrer la barrera)',
        instruction: 'Cierra bien la tapa del frasco y déjalo a la vista sobre la mesa pero fuera de su alcance.',
        adultScript: '',
        tip: 'Crear una necesidad natural de ayuda motiva el uso del comunicador.'
      },
      {
        phase: '3. Modelado de "ABRIR"',
        instruction: 'Haz el gesto de intentar abrir con dificultad y toca en la tablet el botón ABRIR.',
        adultScript: '¡Necesito ABRIR!',
        tip: 'Espera su reacción. Si toca la pantalla, abre de inmediato.'
      },
      {
        phase: '4. Nueva Ronda con "MÁS"',
        instruction: 'Sopla más burbujas y cuando se acaben, modela MÁS para otra tanda.',
        adultScript: '¡MÁS burbujas para ti!',
        tip: 'Repetir la secuencia 3 veces refuerza el circuito de aprendizaje.'
      }
    ],
    planB: 'Si el niño se pone nervioso porque no puede abrir el frasco, no lo dejes frustrarte: modela AYUDA y abre de inmediato diciéndole: "Te ayudo a abrir".'
  },
  {
    id: 'act-3',
    title: 'El Monstruo de las Cosquillas',
    summary: 'Juego de contacto afectivo sin juguetes para enseñar a regular con "PARAR" y "MÁS".',
    levelId: '1',
    levelLabel: 'Nivel 1: Explorador (1 palabra)',
    contextId: 'sin_juguetes',
    contextLabel: 'Sin Juguetes / Juegos Corporales',
    goalId: 'rechazo',
    goalLabel: 'Control de Límites y Rechazo',
    duration: '5 min',
    pictograms: [
      { text: 'COSQUILLAS', arasaacId: 23392, role: 'Juego motor' },
      { text: 'PARAR', arasaacId: 7196, role: 'Frenar inmediatamente' },
      { text: 'MÁS', arasaacId: 3220, role: 'Pedir otra vez' }
    ],
    steps: [
      {
        phase: '1. Anticipación Divertida',
        instruction: 'Mueve tus dedos en el aire diciendo "¡Vienen las cosquillas, vienen las cosquillas!" y dale un abrazo suave.',
        adultScript: '¡Vienen las cosquillas!',
        tip: 'La risa compartida relaja el sistema nervioso.'
      },
      {
        phase: '2. Freno Inmediato para Modelar',
        instruction: 'Detén tus manos por completo y di "¡Paró!". Coloca tus manos sobre tus piernas.',
        adultScript: '',
        tip: 'El contraste entre el movimiento y la quietud capta su atención total.'
      },
      {
        phase: '3. Enseñar el Poder de "PARAR"',
        instruction: 'Haz cosquillas breves y tú mismo modela en la tablet el botón PARAR frenando al segundo.',
        adultScript: '¡PARAR! Cuando dices parar, yo paro.',
        tip: 'Saber que la palabra PARAR tiene poder real le da seguridad emocional.'
      },
      {
        phase: '4. Ronda de Elección',
        instruction: 'Deja la tablet entre ambos. Espera a que elija entre MÁS o PARAR.',
        adultScript: '¿Qué quieres ahora?',
        tip: 'Respeta 100% su decisión, incluso si decide parar.'
      }
    ],
    planB: 'Si el niño se sobreexcita o muestra signos de sobrecarga sensorial, frena de inmediato sin exigir pantalla, dale un abrazo firme y profundo y respira con calma.'
  },
  {
    id: 'act-4',
    title: 'La Elección del Snack / Merienda',
    summary: 'Combinar dos palabras en la mesa ("QUIERO" + "COMER" o nombre del alimento).',
    levelId: '2',
    levelLabel: 'Nivel 2: Combinador (2 palabras)',
    contextId: 'mesa',
    contextLabel: 'En la Mesa / Comida',
    goalId: 'peticion',
    goalLabel: 'Expansión de Frases (LME + 1)',
    duration: '10 min',
    pictograms: [
      { text: 'QUIERO', arasaacId: 5441, role: 'Petición núcleo' },
      { text: 'COMER', arasaacId: 6456, role: 'Acción específica' },
      { text: 'MÁS', arasaacId: 3220, role: 'Expansión de porción' }
    ],
    steps: [
      {
        phase: '1. Porciones Pequeñas (Estrategia Clave)',
        instruction: 'En lugar de servir todo el plato, ten a mano pequeños trozos de su fruta o galleta favorita.',
        adultScript: '¡Qué rico snack tenemos hoy!',
        tip: 'Servir porciones pequeñas genera múltiples oportunidades de comunicación en una sola comida.'
      },
      {
        phase: '2. Tira de Frases (Modelado LME + 1)',
        instruction: 'Toca en la barra superior del comunicador [QUIERO] y luego [COMER].',
        adultScript: '¡QUIERO COMER!',
        tip: 'Si el niño solo suele decir COMER, modelarle QUIERO COMER le enseña a expandir su enunciado.'
      },
      {
        phase: '3. Pausa y Entrega',
        instruction: 'Espera a que el niño presione los botones o haga el intento y entrégale su bocado con alegría.',
        adultScript: '¡Muy bien pedido, aquí tienes!',
        tip: 'Nunca uses la comida como castigo. Si no quiere usar la tablet, aliméntalo igual con cariño.'
      }
    ],
    planB: 'Si el niño empuja el plato, modela NO o PARAR y retira la comida con tranquilidad diciendo: "Entendido, no quieres más ahora".'
  },
  {
    id: 'act-5',
    title: 'La Torre Gigante por Turnos',
    summary: 'Construcción con bloques o vasos para practicar la espera y juego compartido.',
    levelId: '3',
    levelLabel: 'Nivel 3: Social y Emocional',
    contextId: 'juegos',
    contextLabel: 'Juegos con Juguetes',
    goalId: 'turnos',
    goalLabel: 'Turnos y Habilidades Sociales',
    duration: '10 min',
    pictograms: [
      { text: 'MI TURNO', arasaacId: 6632, role: 'Reclamar participación' },
      { text: 'TU TURNO', arasaacId: 25790, role: 'Ceder el paso' },
      { text: 'ESPERAR', arasaacId: 8109, role: 'Pausa compartida' }
    ],
    steps: [
      {
        phase: '1. Inicio de la Construcción',
        instruction: 'Pon un bloque en la mesa. Toca en la tablet [MI TURNO] y di con voz alegre: "Mi turno".',
        adultScript: '¡MI TURNO!',
        tip: 'Exagera el gesto señalándote el pecho con respeto.'
      },
      {
        phase: '2. Ceder el Turno',
        instruction: 'Acerca un bloque hacia el niño, toca [TU TURNO] y míralo con expectación.',
        adultScript: '¡Ahora es TU TURNO!',
        tip: 'Aplaude cuando coloque su bloque encima de la torre.'
      },
      {
        phase: '3. El Clímax de la Torre',
        instruction: 'Cuando la torre esté alta, modela [ESPERAR] con cara de asombro antes de que se caiga.',
        adultScript: '¡Vamos a ESPERAR!',
        tip: 'La caída de la torre genera risas compartidas y oportunidad de decir MÁS.'
      }
    ],
    planB: 'Si el niño derriba la torre antes de tiempo, sonríe y di: "¡Se cayó! ¿La armamos de nuevo?" y modela MÁS o VAMOS.'
  }
];
