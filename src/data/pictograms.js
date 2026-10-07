// Stitch Design System: Clave Fitzgerald Modificada & Full ARASAAC Pictograms Catalog

export const STITCH_SEMANTIC_THEMES = {
  pronoun: {
    bg: '#FEF3C7',
    border: '#F59E0B',
    shadow: '#D97706',
    text: '#92400E',
    headerBg: '#FDE68A'
  },
  verb: {
    bg: '#D1FAE5',
    border: '#10B981',
    shadow: '#059669',
    text: '#065F46',
    headerBg: '#A7F3D0'
  },
  noun: {
    bg: '#FFEDD5',
    border: '#EA580C',
    shadow: '#C2410C',
    text: '#9A3412',
    headerBg: '#FED7AA'
  },
  feeling: {
    bg: '#DBEAFE',
    border: '#2563EB',
    shadow: '#1D4ED8',
    text: '#1E40AF',
    headerBg: '#BFDBFE'
  },
  social: {
    bg: '#FCE7F3',
    border: '#DB2777',
    shadow: '#BE185D',
    text: '#9D174D',
    headerBg: '#FBCFE8'
  },
  urgency: {
    bg: '#FEE2E2',
    border: '#DC2626',
    shadow: '#B91C1C',
    text: '#991B1B',
    headerBg: '#FECACA'
  }
};

export const FITZGERALD_COLORS = STITCH_SEMANTIC_THEMES;

// 1. Vocabulario Núcleo (Core Vocabulary - Prioridad Pedagógica: YO #1, QUIERO #2, COMER #3, IR AL BAÑO #4)
export const CORE_PICTOGRAMS = [
  { id: 'core-12', text: 'YO', category: 'Vocabulario Núcleo', type: 'pronoun', arasaacId: 6632 },
  { id: 'core-1', text: 'QUIERO', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 5441 },
  { id: 'core-13', text: 'COMER', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 6456 },
  { id: 'core-14', text: 'IR AL BAÑO', category: 'Vocabulario Núcleo', type: 'urgency', arasaacId: 6929 },
  { id: 'core-2', text: 'NO QUIERO', category: 'Vocabulario Núcleo', type: 'urgency', arasaacId: 5526 },
  { id: 'core-3', text: 'MÁS', category: 'Vocabulario Núcleo', type: 'social', arasaacId: 3220 },
  { id: 'core-4', text: 'AYUDA', category: 'Vocabulario Núcleo', type: 'urgency', arasaacId: 12252 },
  { id: 'core-5', text: 'TERMINADO', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 28429 },
  { id: 'core-6', text: 'SÍ', category: 'Vocabulario Núcleo', type: 'social', arasaacId: 5584 },
  { id: 'core-7', text: 'NO', category: 'Vocabulario Núcleo', type: 'urgency', arasaacId: 5526 },
  { id: 'core-8', text: 'MIRA', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 6564 },
  { id: 'core-9', text: 'VAMOS', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 8142 },
  { id: 'core-10', text: 'POR FAVOR', category: 'Vocabulario Núcleo', type: 'social', arasaacId: 8195 },
  { id: 'core-11', text: 'GRACIAS', category: 'Vocabulario Núcleo', type: 'social', arasaacId: 8129 },
  { id: 'core-15', text: 'DAME', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 17038 },
  { id: 'core-16', text: 'ME GUSTA', category: 'Vocabulario Núcleo', type: 'feeling', arasaacId: 2418 },
  { id: 'core-17', text: 'NO ME GUSTA', category: 'Vocabulario Núcleo', type: 'urgency', arasaacId: 5544 },
  { id: 'core-18', text: 'ESPERAR', category: 'Vocabulario Núcleo', type: 'social', arasaacId: 8109 },
  { id: 'core-19', text: 'BUSCAR', category: 'Vocabulario Núcleo', type: 'verb', arasaacId: 6946 }
];

// 2. Comida y Bebida (Extenso vocabulario infantil verificado)
export const FOOD_PICTOGRAMS = [
  { id: 'food-1', text: 'AGUA', category: 'Comida y Bebida', type: 'noun', arasaacId: 32464 },
  { id: 'food-2', text: 'LECHE', category: 'Comida y Bebida', type: 'noun', arasaacId: 2445 },
  { id: 'food-3', text: 'JUGO', category: 'Comida y Bebida', type: 'noun', arasaacId: 11461 },
  { id: 'food-4', text: 'CEREAL', category: 'Comida y Bebida', type: 'noun', arasaacId: 34749 },
  { id: 'food-5', text: 'PAN', category: 'Comida y Bebida', type: 'noun', arasaacId: 2494 },
  { id: 'food-6', text: 'GALLETA', category: 'Comida y Bebida', type: 'noun', arasaacId: 8312 },
  { id: 'food-7', text: 'MANZANA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2462 },
  { id: 'food-8', text: 'PLÁTANO', category: 'Comida y Bebida', type: 'noun', arasaacId: 2530 },
  { id: 'food-9', text: 'FRUTILLA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2400 },
  { id: 'food-10', text: 'NARANJA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2888 },
  { id: 'food-11', text: 'UVA', category: 'Comida y Bebida', type: 'noun', arasaacId: 3247 },
  { id: 'food-12', text: 'SANDÍA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2557 },
  { id: 'food-13', text: 'YOGURT', category: 'Comida y Bebida', type: 'noun', arasaacId: 2618 },
  { id: 'food-14', text: 'NUGGETS', category: 'Comida y Bebida', type: 'noun', arasaacId: 31378 },
  { id: 'food-15', text: 'PAPAS FRITAS', category: 'Comida y Bebida', type: 'noun', arasaacId: 2505 },
  { id: 'food-16', text: 'PIZZA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2527 },
  { id: 'food-17', text: 'HAMBURGUESA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2419 },
  { id: 'food-18', text: 'ARROZ', category: 'Comida y Bebida', type: 'noun', arasaacId: 6911 },
  { id: 'food-19', text: 'FIDEOS', category: 'Comida y Bebida', type: 'noun', arasaacId: 8584 },
  { id: 'food-20', text: 'POLLO', category: 'Comida y Bebida', type: 'noun', arasaacId: 4952 },
  { id: 'food-21', text: 'CARNE', category: 'Comida y Bebida', type: 'noun', arasaacId: 2316 },
  { id: 'food-22', text: 'PESCADO', category: 'Comida y Bebida', type: 'noun', arasaacId: 2519 },
  { id: 'food-23', text: 'HUEVO', category: 'Comida y Bebida', type: 'noun', arasaacId: 2427 },
  { id: 'food-24', text: 'QUESO', category: 'Comida y Bebida', type: 'noun', arasaacId: 2541 },
  { id: 'food-25', text: 'SOPA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2573 },
  { id: 'food-26', text: 'HELADO', category: 'Comida y Bebida', type: 'noun', arasaacId: 35209 },
  { id: 'food-27', text: 'CHOCOLATE', category: 'Comida y Bebida', type: 'noun', arasaacId: 25940 },
  { id: 'food-28', text: 'ZANAHORIA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2619 },
  { id: 'food-29', text: 'ENSALADA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2377 },
  { id: 'food-30', text: 'TOMATE', category: 'Comida y Bebida', type: 'noun', arasaacId: 2594 },
  { id: 'food-31', text: 'PERA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2561 },
  { id: 'food-32', text: 'PURÉ DE PAPAS', category: 'Comida y Bebida', type: 'noun', arasaacId: 2539 },
  { id: 'food-33', text: 'TORTA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2502 },
  { id: 'food-34', text: 'DULCE', category: 'Comida y Bebida', type: 'noun', arasaacId: 2686 },
  { id: 'food-35', text: 'SALCHICHA', category: 'Comida y Bebida', type: 'noun', arasaacId: 6647 },
  { id: 'food-36', text: 'MANTEQUILLA', category: 'Comida y Bebida', type: 'noun', arasaacId: 2461 }
];

// 3. Acciones y Verbos
export const ACTIONS_PICTOGRAMS = [
  { id: 'act-1', text: 'COMER', category: 'Acciones', type: 'verb', arasaacId: 6456 },
  { id: 'act-2', text: 'BEBER', category: 'Acciones', type: 'verb', arasaacId: 6061 },
  { id: 'act-3', text: 'JUGAR', category: 'Acciones', type: 'verb', arasaacId: 23392 },
  { id: 'act-4', text: 'DORMIR', category: 'Acciones', type: 'verb', arasaacId: 6479 },
  { id: 'act-5', text: 'CAMINAR', category: 'Acciones', type: 'verb', arasaacId: 6044 },
  { id: 'act-6', text: 'CORRER', category: 'Acciones', type: 'verb', arasaacId: 6465 },
  { id: 'act-7', text: 'SALTAR', category: 'Acciones', type: 'verb', arasaacId: 39052 },
  { id: 'act-8', text: 'PINTAR', category: 'Acciones', type: 'verb', arasaacId: 2348 },
  { id: 'act-9', text: 'DIBUJAR', category: 'Acciones', type: 'verb', arasaacId: 8088 },
  { id: 'act-10', text: 'ESCUCHAR', category: 'Acciones', type: 'verb', arasaacId: 6572 },
  { id: 'act-11', text: 'CANTAR', category: 'Acciones', type: 'verb', arasaacId: 6960 },
  { id: 'act-12', text: 'BAILAR', category: 'Acciones', type: 'verb', arasaacId: 35747 },
  { id: 'act-13', text: 'LEER', category: 'Acciones', type: 'verb', arasaacId: 7141 },
  { id: 'act-14', text: 'ORDENAR', category: 'Acciones', type: 'verb', arasaacId: 2872 },
  { id: 'act-15', text: 'PARAR', category: 'Acciones', type: 'urgency', arasaacId: 7196 },
  { id: 'act-16', text: 'ESPERAR', category: 'Acciones', type: 'social', arasaacId: 36914 },
  { id: 'act-17', text: 'LAVARSE MANOS', category: 'Acciones', type: 'verb', arasaacId: 8975 },
  { id: 'act-18', text: 'ABRIR', category: 'Acciones', type: 'verb', arasaacId: 24825 },
  { id: 'act-19', text: 'CERRAR', category: 'Acciones', type: 'verb', arasaacId: 24976 },
  { id: 'act-20', text: 'SUBIR', category: 'Acciones', type: 'verb', arasaacId: 24725 },
  { id: 'act-21', text: 'BAJAR', category: 'Acciones', type: 'verb', arasaacId: 24723 },
  { id: 'act-22', text: 'AYUDAR', category: 'Acciones', type: 'verb', arasaacId: 12252 },
  { id: 'act-23', text: 'ABRAZAR', category: 'Acciones', type: 'verb', arasaacId: 6023 },
  { id: 'act-24', text: 'COMPARTIR', category: 'Acciones', type: 'social', arasaacId: 15361 },
  { id: 'act-25', text: 'LIMPIAR', category: 'Acciones', type: 'verb', arasaacId: 3351 },
  { id: 'act-26', text: 'DESCANSAR', category: 'Acciones', type: 'verb', arasaacId: 3299 },
  { id: 'act-27', text: 'GUARDAR', category: 'Acciones', type: 'verb', arasaacId: 5514 }
];

// 4. Emociones y Sentimientos
export const EMOTIONS_PICTOGRAMS = [
  { id: 'emo-1', text: 'FELIZ', category: 'Emociones', type: 'feeling', arasaacId: 9907 },
  { id: 'emo-2', text: 'TRISTE', category: 'Emociones', type: 'feeling', arasaacId: 35545 },
  { id: 'emo-3', text: 'ENOJADO', category: 'Emociones', type: 'feeling', arasaacId: 35539 },
  { id: 'emo-4', text: 'CANSADO', category: 'Emociones', type: 'feeling', arasaacId: 35537 },
  { id: 'emo-5', text: 'ASUSTADO', category: 'Emociones', type: 'feeling', arasaacId: 35535 },
  { id: 'emo-6', text: 'TRANQUILO', category: 'Emociones', type: 'feeling', arasaacId: 31310 },
  { id: 'emo-7', text: 'ABURRIDO', category: 'Emociones', type: 'feeling', arasaacId: 35531 },
  { id: 'emo-8', text: 'SORPRENDIDO', category: 'Emociones', type: 'feeling', arasaacId: 35529 },
  { id: 'emo-9', text: 'NERVIOSO', category: 'Emociones', type: 'feeling', arasaacId: 30391 },
  { id: 'emo-10', text: 'PREOCUPADO', category: 'Emociones', type: 'feeling', arasaacId: 26985 },
  { id: 'emo-11', text: 'CARIÑOSO', category: 'Emociones', type: 'feeling', arasaacId: 8020 },
  { id: 'emo-12', text: 'CON SUEÑO', category: 'Emociones', type: 'feeling', arasaacId: 6479 }
];

// 5. Dolor, Salud y Urgencias
export const PAIN_URGENCY_PICTOGRAMS = [
  { id: 'pain-1', text: 'ME DUELE', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 2367 },
  { id: 'pain-2', text: 'IR AL BAÑO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 6929 },
  { id: 'pain-3', text: 'CABEZA', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 2673 },
  { id: 'pain-4', text: 'ESTÓMAGO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 3309 },
  { id: 'pain-5', text: 'GARGANTA', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 3332 },
  { id: 'pain-6', text: 'DIENTE', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 10267 },
  { id: 'pain-7', text: 'OÍDO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 39498 },
  { id: 'pain-8', text: 'FIEBRE', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 32530 },
  { id: 'pain-9', text: 'VÓMITO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 7303 },
  { id: 'pain-10', text: 'TOS', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 35585 },
  { id: 'pain-11', text: 'HERIDA', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 5484 },
  { id: 'pain-12', text: 'MEDICINA', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 8163 },
  { id: 'pain-13', text: 'TENGO FRÍO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 4652 },
  { id: 'pain-14', text: 'TENGO CALOR', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 35561 },
  { id: 'pain-15', text: 'OJO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 6573 },
  { id: 'pain-16', text: 'MANO', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 2928 },
  { id: 'pain-17', text: 'PIE', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 25327 },
  { id: 'pain-18', text: 'ESPALDA', category: 'Dolor y Urgencias', type: 'urgency', arasaacId: 2748 }
];

// 6. Personas y Familia
export const PEOPLE_PICTOGRAMS = [
  { id: 'peo-1', text: 'MAMÁ', category: 'Personas', type: 'pronoun', arasaacId: 2458 },
  { id: 'peo-2', text: 'PAPÁ', category: 'Personas', type: 'pronoun', arasaacId: 31146 },
  { id: 'peo-3', text: 'HERMANO', category: 'Personas', type: 'pronoun', arasaacId: 2423 },
  { id: 'peo-4', text: 'HERMANA', category: 'Personas', type: 'pronoun', arasaacId: 2422 },
  { id: 'peo-5', text: 'ABUELA', category: 'Personas', type: 'pronoun', arasaacId: 23710 },
  { id: 'peo-6', text: 'ABUELO', category: 'Personas', type: 'pronoun', arasaacId: 23718 },
  { id: 'peo-7', text: 'TÍA', category: 'Personas', type: 'pronoun', arasaacId: 30271 },
  { id: 'peo-8', text: 'TÍO', category: 'Personas', type: 'pronoun', arasaacId: 30255 },
  { id: 'peo-9', text: 'PROFESOR/A', category: 'Personas', type: 'pronoun', arasaacId: 6556 },
  { id: 'peo-10', text: 'DOCTOR/A', category: 'Personas', type: 'pronoun', arasaacId: 6561 },
  { id: 'peo-11', text: 'AMIGO', category: 'Personas', type: 'pronoun', arasaacId: 25790 },
  { id: 'peo-12', text: 'AMIGA', category: 'Personas', type: 'pronoun', arasaacId: 8486 },
  { id: 'peo-13', text: 'BEBÉ', category: 'Personas', type: 'pronoun', arasaacId: 6060 },
  { id: 'peo-14', text: 'YO', category: 'Personas', type: 'pronoun', arasaacId: 6632 }
];

// 7. Juguetes y Objetos
export const PLAY_TURNS_PICTOGRAMS = [
  { id: 'play-1', text: 'TABLET', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 9165 },
  { id: 'play-2', text: 'TELEVISIÓN', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 25498 },
  { id: 'play-3', text: 'TELÉFONO', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 26479 },
  { id: 'play-4', text: 'PELOTA', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 3241 },
  { id: 'play-5', text: 'BLOQUES', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 4935 },
  { id: 'play-6', text: 'AUTO DE JUGUETE', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 2340 },
  { id: 'play-7', text: 'DINOSAURIO', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 2738 },
  { id: 'play-8', text: 'MUÑECA', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 26238 },
  { id: 'play-9', text: 'PUZZLE', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 2540 },
  { id: 'play-10', text: 'BICICLETA', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 6935 },
  { id: 'play-11', text: 'MOCHILA', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 2475 },
  { id: 'play-12', text: 'CUENTO', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 25191 },
  { id: 'play-13', text: 'BURBUJAS', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 6945 },
  { id: 'play-14', text: 'PLASTILINA', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 2529 },
  { id: 'play-15', text: 'TREN', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 21399 },
  { id: 'play-16', text: 'PELUCHE', category: 'Juguetes y Objetos', type: 'noun', arasaacId: 4945 },
  { id: 'play-17', text: 'MI TURNO', category: 'Juguetes y Objetos', type: 'pronoun', arasaacId: 6632 },
  { id: 'play-18', text: 'TU TURNO', category: 'Juguetes y Objetos', type: 'social', arasaacId: 25790 }
];

// 8. Lugares y Entorno
export const PLACES_PICTOGRAMS = [
  { id: 'pla-1', text: 'CASA', category: 'Lugares', type: 'noun', arasaacId: 6964 },
  { id: 'pla-2', text: 'COLEGIO', category: 'Lugares', type: 'noun', arasaacId: 3082 },
  { id: 'pla-3', text: 'PLAZA', category: 'Lugares', type: 'noun', arasaacId: 6184 },
  { id: 'pla-4', text: 'SUPERMERCADO', category: 'Lugares', type: 'noun', arasaacId: 3389 },
  { id: 'pla-5', text: 'PISCINA', category: 'Lugares', type: 'noun', arasaacId: 30516 },
  { id: 'pla-6', text: 'PLAYA', category: 'Lugares', type: 'noun', arasaacId: 30518 },
  { id: 'pla-7', text: 'HOSPITAL', category: 'Lugares', type: 'noun', arasaacId: 3116 },
  { id: 'pla-8', text: 'AUTO', category: 'Lugares', type: 'noun', arasaacId: 2339 },
  { id: 'pla-9', text: 'COCINA', category: 'Lugares', type: 'noun', arasaacId: 10752 },
  { id: 'pla-10', text: 'DORMITORIO', category: 'Lugares', type: 'noun', arasaacId: 5988 },
  { id: 'pla-11', text: 'FARMACIA', category: 'Lugares', type: 'noun', arasaacId: 3313 },
  { id: 'pla-12', text: 'BAÑO', category: 'Lugares', type: 'noun', arasaacId: 6929 }
];

// 9. Ropa y Vestimenta (Nueva Categoría ARASAAC)
export const CLOTHES_PICTOGRAMS = [
  { id: 'clo-1', text: 'POLERA', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2309 },
  { id: 'clo-2', text: 'PANTALÓN', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2565 },
  { id: 'clo-3', text: 'ZAPATOS', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 32923 },
  { id: 'clo-4', text: 'ZAPATILLAS', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 8333 },
  { id: 'clo-5', text: 'CALCETINES', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 8339 },
  { id: 'clo-6', text: 'POLERÓN', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 4872 },
  { id: 'clo-7', text: 'PIJAMA', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2522 },
  { id: 'clo-8', text: 'GORRO', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 39395 },
  { id: 'clo-9', text: 'SHORT', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 13638 },
  { id: 'clo-10', text: 'ROPA INTERIOR', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 25680 },
  { id: 'clo-11', text: 'VESTIDO', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2613 },
  { id: 'clo-12', text: 'BUFANDA', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2290 },
  { id: 'clo-13', text: 'GUANTES', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2415 },
  { id: 'clo-14', text: 'BOTAS', category: 'Ropa y Vestimenta', type: 'noun', arasaacId: 2287 }
];

// 10. Higiene y Autocuidado (IDs ARASAAC Exactos y Verificados)
export const HYGIENE_PICTOGRAMS = [
  { id: 'hyg-1', text: 'LAVARSE LAS MANOS', category: 'Higiene y Aseo', type: 'verb', arasaacId: 8975 },
  { id: 'hyg-2', text: 'CEPILLARSE LOS DIENTES', category: 'Higiene y Aseo', type: 'verb', arasaacId: 6971 },
  { id: 'hyg-3', text: 'CEPILLO DE DIENTES', category: 'Higiene y Aseo', type: 'noun', arasaacId: 2694 },
  { id: 'hyg-4', text: 'JABÓN', category: 'Higiene y Aseo', type: 'noun', arasaacId: 8094 },
  { id: 'hyg-5', text: 'TOALLA', category: 'Higiene y Aseo', type: 'noun', arasaacId: 2593 },
  { id: 'hyg-6', text: 'SECARSE LAS MANOS', category: 'Higiene y Aseo', type: 'verb', arasaacId: 2566 },
  { id: 'hyg-7', text: 'DUCHA', category: 'Higiene y Aseo', type: 'noun', arasaacId: 2370 },
  { id: 'hyg-8', text: 'BAÑARSE', category: 'Higiene y Aseo', type: 'verb', arasaacId: 6058 },
  { id: 'hyg-9', text: 'PEINARSE', category: 'Higiene y Aseo', type: 'verb', arasaacId: 26947 },
  { id: 'hyg-10', text: 'PEINE', category: 'Higiene y Aseo', type: 'noun', arasaacId: 2852 },
  { id: 'hyg-11', text: 'CHAMPÚ', category: 'Higiene y Aseo', type: 'noun', arasaacId: 2699 },
  { id: 'hyg-12', text: 'PAPEL HIGIÉNICO', category: 'Higiene y Aseo', type: 'noun', arasaacId: 2862 },
  { id: 'hyg-13', text: 'SONARSE LA NARIZ', category: 'Higiene y Aseo', type: 'verb', arasaacId: 7256 },
  { id: 'hyg-14', text: 'CORTARSE LAS UÑAS', category: 'Higiene y Aseo', type: 'verb', arasaacId: 10152 }
];

// 11. Animales y Naturaleza (Nueva Categoría ARASAAC - Homenaje Agrónomo)
export const ANIMALS_NATURE_PICTOGRAMS = [
  { id: 'ani-1', text: 'PERRO', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 7202 },
  { id: 'ani-2', text: 'GATO', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 7114 },
  { id: 'ani-3', text: 'PÁJARO', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2490 },
  { id: 'ani-4', text: 'CABALLO', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2294 },
  { id: 'ani-5', text: 'VACA', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2609 },
  { id: 'ani-6', text: 'PLANTA', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 3143 },
  { id: 'ani-7', text: 'FLOR', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 7104 },
  { id: 'ani-8', text: 'ÁRBOL', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 3057 },
  { id: 'ani-9', text: 'SOL', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 7252 },
  { id: 'ani-10', text: 'LLUVIA', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 7148 },
  { id: 'ani-11', text: 'MARIPOSA', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2465 },
  { id: 'ani-12', text: 'PEZ', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2520 },
  { id: 'ani-13', text: 'CONEJO', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2351 },
  { id: 'ani-14', text: 'LEÓN', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2449 },
  { id: 'ani-15', text: 'ELEFANTE', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2372 },
  { id: 'ani-16', text: 'PATO', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2563 },
  { id: 'ani-17', text: 'LUNA', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2933 },
  { id: 'ani-18', text: 'ESTRELLA', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2752 },
  { id: 'ani-19', text: 'NUBE', category: 'Animales y Naturaleza', type: 'noun', arasaacId: 2883 }
];

// 12. Social y Expresiones
export const SOCIAL_PICTOGRAMS = [
  { id: 'soc-1', text: 'HOLA', category: 'Social', type: 'social', arasaacId: 6522 },
  { id: 'soc-2', text: 'CHAO', category: 'Social', type: 'social', arasaacId: 6028 },
  { id: 'soc-3', text: 'POR FAVOR', category: 'Social', type: 'social', arasaacId: 8195 },
  { id: 'soc-4', text: 'GRACIAS', category: 'Social', type: 'social', arasaacId: 8129 },
  { id: 'soc-5', text: 'SÍ', category: 'Social', type: 'social', arasaacId: 5584 },
  { id: 'soc-6', text: 'NO', category: 'Social', type: 'urgency', arasaacId: 5526 },
  { id: 'soc-7', text: 'MÁS', category: 'Social', type: 'social', arasaacId: 3220 },
  { id: 'soc-8', text: 'OTRA VEZ', category: 'Social', type: 'social', arasaacId: 37162 },
  { id: 'soc-9', text: 'PERDÓN', category: 'Social', type: 'social', arasaacId: 11625 },
  { id: 'soc-10', text: 'TE QUIERO', category: 'Social', type: 'feeling', arasaacId: 8020 },
  { id: 'soc-11', text: 'ESTÁ BIEN', category: 'Social', type: 'social', arasaacId: 5397 },
  { id: 'soc-12', text: 'ABRAZO', category: 'Social', type: 'social', arasaacId: 4550 }
];

// 13. Escuela y Aprendizaje
export const SCHOOL_PICTOGRAMS = [
  { id: 'sch-1', text: 'LÁPIZ', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2440 },
  { id: 'sch-2', text: 'CUADERNO', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2359 },
  { id: 'sch-3', text: 'TIJERAS', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2591 },
  { id: 'sch-4', text: 'PEGAMENTO', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2510 },
  { id: 'sch-5', text: 'REGLA', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2815 },
  { id: 'sch-6', text: 'PIZARRA', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2526 },
  { id: 'sch-7', text: 'COLORES', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 5968 },
  { id: 'sch-8', text: 'MOCHILA', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2475 },
  { id: 'sch-9', text: 'PINTURA', category: 'Escuela y Aprendizaje', type: 'noun', arasaacId: 2348 }
];

// 14. Transporte y Vehículos
export const VEHICLES_PICTOGRAMS = [
  { id: 'veh-1', text: 'AUTO', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2339 },
  { id: 'veh-2', text: 'AUTOBÚS', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2262 },
  { id: 'veh-3', text: 'AVIÓN', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2264 },
  { id: 'veh-4', text: 'TREN', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 21399 },
  { id: 'veh-5', text: 'BICICLETA', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 6935 },
  { id: 'veh-6', text: 'BARCO', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2273 },
  { id: 'veh-7', text: 'CAMIÓN', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2306 },
  { id: 'veh-8', text: 'AMBULANCIA', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2251 },
  { id: 'veh-9', text: 'POLICÍA', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2824 },
  { id: 'veh-10', text: 'BOMBEROS', category: 'Transporte y Vehículos', type: 'noun', arasaacId: 2664 }
];

// Catálogo Consolidado Completo
export const ALL_PRESET_PICTOGRAMS = [
  ...CORE_PICTOGRAMS,
  ...FOOD_PICTOGRAMS,
  ...ACTIONS_PICTOGRAMS,
  ...EMOTIONS_PICTOGRAMS,
  ...PAIN_URGENCY_PICTOGRAMS,
  ...PEOPLE_PICTOGRAMS,
  ...PLAY_TURNS_PICTOGRAMS,
  ...PLACES_PICTOGRAMS,
  ...CLOTHES_PICTOGRAMS,
  ...HYGIENE_PICTOGRAMS,
  ...ANIMALS_NATURE_PICTOGRAMS,
  ...SOCIAL_PICTOGRAMS,
  ...SCHOOL_PICTOGRAMS,
  ...VEHICLES_PICTOGRAMS
];

// 13. Rutinas Diarias
export const DEFAULT_ROUTINES = [
  {
    id: 'r-1',
    title: 'Rutina de Mañana',
    items: [
      { id: 'rm-1', text: 'DESPERTAR', time: '07:30', done: false, arasaacId: 8989 },
      { id: 'rm-2', text: 'IR AL BAÑO', time: '07:40', done: false, arasaacId: 6929 },
      { id: 'rm-3', text: 'LAVARSE LOS DIENTES', time: '07:50', done: false, arasaacId: 6971 },
      { id: 'rm-4', text: 'VESTIRSE', time: '08:00', done: false, arasaacId: 6627 },
      { id: 'rm-5', text: 'DESAYUNAR', time: '08:15', done: false, arasaacId: 4625 },
      { id: 'rm-6', text: 'IR AL COLEGIO', time: '08:45', done: false, arasaacId: 32446 }
    ]
  },
  {
    id: 'r-2',
    title: 'Rutina de Noche',
    items: [
      { id: 'rn-1', text: 'GUARDAR JUGUETES', time: '19:30', done: false, arasaacId: 4935 },
      { id: 'rn-2', text: 'BAÑARSE', time: '19:50', done: false, arasaacId: 6058 },
      { id: 'rn-3', text: 'PONERSE PIJAMA', time: '20:10', done: false, arasaacId: 6627 },
      { id: 'rn-4', text: 'CENAR', time: '20:25', done: false, arasaacId: 2573 },
      { id: 'rn-5', text: 'LAVARSE LOS DIENTES', time: '20:50', done: false, arasaacId: 6971 },
      { id: 'rn-6', text: 'DORMIR', time: '21:00', done: false, arasaacId: 6479 }
    ]
  }
];

// 14. Historias Sociales
export const SOCIAL_STORIES = [
  {
    id: 'story-1',
    title: 'Cuando me siento frustrado',
    steps: [
      { text: 'A veces las cosas son difíciles y me puedo sentir enojado o frustrado.', arasaacId: 35539 },
      { text: 'Está bien sentirme así. Es normal sentirse frustrado.', arasaacId: 9907 },
      { text: 'Paso 1: Paro lo que estoy haciendo y pongo mis manos sobre mi pecho.', arasaacId: 36914 },
      { text: 'Paso 2: Respiro profundo tres veces como oliendo una flor.', arasaacId: 31310 },
      { text: 'Paso 3: Puedo pedir un abrazo o decir "Necesito una pausa".', arasaacId: 4550 },
      { text: 'Cuando me calmo, mi cuerpo se siente tranquilo y listo para jugar.', arasaacId: 23392 }
    ]
  },
  {
    id: 'story-2',
    title: 'Visita al Doctor',
    steps: [
      { text: 'Hoy voy al consultorio a ver al doctor para cuidar mi salud.', arasaacId: 6523 },
      { text: 'El doctor es una persona amable que cuida mi cuerpo.', arasaacId: 6561 },
      { text: 'Me sentaré en una camilla junto a mamá o papá.', arasaacId: 6632 },
      { text: 'El doctor escuchará mi corazón con un estetoscopio.', arasaacId: 2367 },
      { text: 'Abriré mi boca grande para que mire mi garganta.', arasaacId: 3332 },
      { text: '¡Todo terminará rápido y regresaremos a casa felices!', arasaacId: 8020 }
    ]
  }
];
