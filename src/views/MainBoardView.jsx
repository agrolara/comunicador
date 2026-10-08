import React, { useState, useEffect, useMemo } from 'react';
import PictoCard from '../components/PictoCard';
import CoreVocabularyConfigModal from '../components/CoreVocabularyConfigModal';
import {
  CORE_PICTOGRAMS,
  FOOD_PICTOGRAMS,
  ACTIONS_PICTOGRAMS,
  EMOTIONS_PICTOGRAMS,
  PAIN_URGENCY_PICTOGRAMS,
  PLAY_TURNS_PICTOGRAMS,
  PEOPLE_PICTOGRAMS,
  PLACES_PICTOGRAMS,
  CLOTHES_PICTOGRAMS,
  HYGIENE_PICTOGRAMS,
  ANIMALS_NATURE_PICTOGRAMS,
  SOCIAL_PICTOGRAMS,
  SCHOOL_PICTOGRAMS,
  VEHICLES_PICTOGRAMS
} from '../data/pictograms';
import {
  Utensils,
  Smile,
  AlertCircle,
  Gamepad2,
  ChevronRight,
  Activity,
  Users,
  MapPin,
  Shirt,
  Sparkles,
  Sprout,
  MessageCircle,
  GraduationCap,
  Car,
  Settings2,
  Compass,
  CheckCircle2,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { tts } from '../services/tts';
import { analytics } from '../services/analytics';

export default function MainBoardView({
  onAddToSentence,
  cardSize = 'md',
  gridSize = '4x4',
  highContrast = false,
  dwellTime = 0,
  textCase = 'uppercase',
  imageOverrides = {},
  textOverrides = {},
  customPictograms = [],
  sentenceItems = [],
  guidedMode = true,
  onToggleGuidedMode,
  onNavigateTab,
  onNavigateCategory
}) {
  // 1. Configured Core Vocabulary by Parent/Therapist (persisted in localStorage)
  const [configuredCore, setConfiguredCore] = useState(() => {
    try {
      const saved = localStorage.getItem('danmax_configured_core');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Custom User Pictograms tagged as Core
  const customCore = useMemo(() => 
    customPictograms.filter(p => p.category === 'Vocabulario Núcleo' || p.category === 'Núcleo'),
    [customPictograms]
  );

  // Active Core List: if tutor configured one, use that curation; otherwise fallback to default + usage sorting
  const sortedCore = useMemo(() => {
    if (configuredCore && configuredCore.length > 0) {
      return configuredCore;
    }
    const allCore = [...CORE_PICTOGRAMS, ...customCore];
    return analytics.sortByUsage(allCore, 2);
  }, [configuredCore, customCore]);

  // Preload core audio in background for instant speech
  useEffect(() => {
    sortedCore.forEach(item => {
      const txt = (textOverrides && textOverrides[item.id]) || item.text;
      tts.preload(txt);
    });
  }, [sortedCore, textOverrides]);

  // Save new configured core
  const handleSaveConfiguredCore = (newCoreList) => {
    setConfiguredCore(newCoreList);
    try {
      localStorage.setItem('danmax_configured_core', JSON.stringify(newCoreList));
    } catch (e) {}
  };

  // 2. Comprehensive catalog of all pictograms across all categories for modal configuration
  const ALL_BOARD_CATEGORIES = useMemo(() => [
    {
      id: 'food',
      label: 'COMIDA Y BEBIDA',
      icon: Utensils,
      color: { border: '#fed7aa', bg: '#fff8f3', text: '#9a3412', btnBg: '#fed7aa', btnHover: '#fdba74' },
      items: FOOD_PICTOGRAMS,
      matchCategory: 'Comida y Bebida'
    },
    {
      id: 'actions',
      label: 'ACCIONES Y VERBOS',
      icon: Activity,
      color: { border: '#a7f3d0', bg: '#f0fdf4', text: '#065f46', btnBg: '#a7f3d0', btnHover: '#6ee7b7' },
      items: ACTIONS_PICTOGRAMS,
      matchCategory: 'Acciones'
    },
    {
      id: 'emotions',
      label: 'EMOCIONES Y SENTIR',
      icon: Smile,
      color: { border: '#bfdbfe', bg: '#f3f8fe', text: '#1e40af', btnBg: '#bfdbfe', btnHover: '#93c5fd' },
      items: EMOTIONS_PICTOGRAMS,
      matchCategory: 'Emociones'
    },
    {
      id: 'pain',
      label: 'URGENCIAS Y DOLOR',
      icon: AlertCircle,
      color: { border: '#fecaca', bg: '#fef4f4', text: '#991b1b', btnBg: '#fecaca', btnHover: '#fca5a5' },
      items: PAIN_URGENCY_PICTOGRAMS,
      matchCategory: 'Dolor y Urgencias'
    },
    {
      id: 'play',
      label: 'JUGUETES Y OBJETOS',
      icon: Gamepad2,
      color: { border: '#fde68a', bg: '#fdfaf3', text: '#92400e', btnBg: '#fde68a', btnHover: '#fcd34d' },
      items: PLAY_TURNS_PICTOGRAMS,
      matchCategory: 'Juguetes y Objetos'
    },
    {
      id: 'people',
      label: 'PERSONAS Y FAMILIA',
      icon: Users,
      color: { border: '#fef3c7', bg: '#fffbeb', text: '#92400e', btnBg: '#fef3c7', btnHover: '#fde68a' },
      items: PEOPLE_PICTOGRAMS,
      matchCategory: 'Personas'
    },
    {
      id: 'places',
      label: 'LUGARES Y ENTORNO',
      icon: MapPin,
      color: { border: '#e0e7ff', bg: '#eef2ff', text: '#3730a3', btnBg: '#e0e7ff', btnHover: '#c7d2fe' },
      items: PLACES_PICTOGRAMS,
      matchCategory: 'Lugares'
    },
    {
      id: 'clothes',
      label: 'ROPA Y VESTIMENTA',
      icon: Shirt,
      color: { border: '#fbcfe8', bg: '#fdf2f8', text: '#9d174d', btnBg: '#fbcfe8', btnHover: '#f472b6' },
      items: CLOTHES_PICTOGRAMS,
      matchCategory: 'Ropa y Vestimenta'
    },
    {
      id: 'hygiene',
      label: 'HIGIENE Y ASEO',
      icon: Sparkles,
      color: { border: '#bae6fd', bg: '#f0f9ff', text: '#0369a1', btnBg: '#bae6fd', btnHover: '#7dd3fc' },
      items: HYGIENE_PICTOGRAMS,
      matchCategory: 'Higiene y Aseo'
    },
    {
      id: 'animals',
      label: 'ANIMALES Y NATURALEZA',
      icon: Sprout,
      color: { border: '#bbf7d0', bg: '#f0fdf4', text: '#15803d', btnBg: '#bbf7d0', btnHover: '#86efac' },
      items: ANIMALS_NATURE_PICTOGRAMS,
      matchCategory: 'Animales y Naturaleza'
    },
    {
      id: 'social',
      label: 'SOCIAL Y CORTESÍA',
      icon: MessageCircle,
      color: { border: '#fbcfe8', bg: '#fff1f2', text: '#9d174d', btnBg: '#fbcfe8', btnHover: '#f472b6' },
      items: SOCIAL_PICTOGRAMS,
      matchCategory: 'Social'
    },
    {
      id: 'school',
      label: 'ESCUELA Y APRENDIZAJE',
      icon: GraduationCap,
      color: { border: '#fef08a', bg: '#fefce8', text: '#854d0e', btnBg: '#fef08a', btnHover: '#fde047' },
      items: SCHOOL_PICTOGRAMS,
      matchCategory: 'Escuela y Aprendizaje'
    },
    {
      id: 'vehicles',
      label: 'TRANSPORTE Y VEHÍCULOS',
      icon: Car,
      color: { border: '#e0e7ff', bg: '#f5f3ff', text: '#3730a3', btnBg: '#e0e7ff', btnHover: '#c7d2fe' },
      items: VEHICLES_PICTOGRAMS,
      matchCategory: 'Transporte y Vehículos'
    }
  ], []);

  // Combined pool for the core configurator modal
  const allAvailablePictograms = useMemo(() => {
    const list = [
      ...CORE_PICTOGRAMS,
      ...FOOD_PICTOGRAMS,
      ...ACTIONS_PICTOGRAMS,
      ...EMOTIONS_PICTOGRAMS,
      ...PAIN_URGENCY_PICTOGRAMS,
      ...PLAY_TURNS_PICTOGRAMS,
      ...PEOPLE_PICTOGRAMS,
      ...PLACES_PICTOGRAMS,
      ...CLOTHES_PICTOGRAMS,
      ...HYGIENE_PICTOGRAMS,
      ...ANIMALS_NATURE_PICTOGRAMS,
      ...SOCIAL_PICTOGRAMS,
      ...SCHOOL_PICTOGRAMS,
      ...VEHICLES_PICTOGRAMS,
      ...customPictograms
    ];
    const seen = new Set();
    return list.filter(item => {
      const key = `${item.id || item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customPictograms]);

  // Categories with top 4 most used pictograms
  const categoriesWithTop4 = useMemo(() => {
    return ALL_BOARD_CATEGORIES.map(cat => {
      const customMatches = customPictograms.filter(p => 
        p.category === cat.matchCategory || 
        (p.category && p.category.toLowerCase().includes(cat.id.toLowerCase()))
      );
      const allCategoryItems = [...cat.items, ...customMatches];
      const sorted = analytics.sortByUsage(allCategoryItems, 0);
      const top4 = sorted.slice(0, 4);

      return {
        ...cat,
        top4,
        totalCount: allCategoryItems.length
      };
    });
  }, [ALL_BOARD_CATEGORIES, customPictograms]);

  // 3. Guided Learning Mode Step Logic (Scaffolding: YO -> QUIERO -> OBJETO/COMIDA -> HABLAR)
  const guidedStepInfo = useMemo(() => {
    if (!guidedMode) return null;

    const count = sentenceItems.length;
    if (count === 0) {
      return {
        step: 1,
        stepTotal: 4,
        badge: 'PASO 1 DE 4',
        title: '¿Quién habla?',
        instruction: 'Toca el pictograma "YO"',
        targetType: 'starter',
        color: 'from-amber-500 to-yellow-500'
      };
    }

    const firstItem = sentenceItems[0];
    const firstText = ((textOverrides && textOverrides[firstItem.id]) || firstItem.text || '').toUpperCase().trim();
    const lastItem = sentenceItems[count - 1];
    const lastText = ((textOverrides && textOverrides[lastItem.id]) || lastItem.text || '').toUpperCase().trim();

    // Step 2: "YO" is picked -> Prompt for "QUIERO" or desire/action verb
    if (count === 1 && (firstText === 'YO' || firstItem.type === 'pronoun')) {
      return {
        step: 2,
        stepTotal: 4,
        badge: 'PASO 2 DE 4',
        title: '¿Qué necesitas o deseas?',
        instruction: 'Toca "QUIERO" o una acción (Comer, Jugar, Ir al baño)',
        targetType: 'desire',
        color: 'from-blue-600 to-indigo-600'
      };
    }

    // Step 3: Desire or verb chosen -> Prompt for desired noun / snack / toy
    const isDesireOrVerb = [
      'QUIERO', 'NO QUIERO', 'DAME', 'COMER', 'BEBER', 'JUGAR', 'IR AL BAÑO', 'AYUDA', 'VER'
    ].includes(lastText) || lastItem.type === 'verb' || lastItem.category === 'Acciones';

    if (isDesireOrVerb && count < 3) {
      return {
        step: 3,
        stepTotal: 4,
        badge: 'PASO 3 DE 4',
        title: '¿Qué deseas exactamente?',
        instruction: 'Elige tu pictograma (ej. Chocolate, Agua, Galleta, Tablet)',
        targetType: 'object',
        color: 'from-emerald-500 to-teal-600'
      };
    }

    // Step 4: Sentence is complete!
    return {
      step: 4,
      stepTotal: 4,
      badge: '¡FRASE LISTA! 🎉',
      title: '¡Muy bien!',
      instruction: 'Toca el botón verde "HABLAR" arriba para que todos te escuchen',
      targetType: 'speak',
      color: 'from-purple-600 to-pink-600'
    };
  }, [guidedMode, sentenceItems, textOverrides]);

  // Check if a specific card should be highlighted in Guided Mode
  const isCardGuidedTarget = (item) => {
    if (!guidedMode || !guidedStepInfo) return false;
    const itemText = ((textOverrides && textOverrides[item.id]) || item.text || '').toUpperCase().trim();

    if (guidedStepInfo.targetType === 'starter') {
      return itemText === 'YO' || item.type === 'pronoun';
    }

    if (guidedStepInfo.targetType === 'desire') {
      return itemText === 'QUIERO' || 
             itemText === 'COMER' || 
             itemText === 'BEBER' || 
             itemText === 'JUGAR' || 
             itemText === 'IR AL BAÑO' || 
             itemText === 'AYUDA' || 
             itemText === 'DAME';
    }

    if (guidedStepInfo.targetType === 'object') {
      // Highlight high-interest snacks, foods, toys and objects
      const highInterest = [
        'CHOCOLATE', 'AGUA', 'GALLETA', 'PAN', 'TABLET', 'PELOTA',
        'MANZANA', 'LECHE', 'JUGUETE', 'MÁS', 'DORMIR', 'PAPAS FRITAS', 'JUICE', 'JUGO'
      ];
      return highInterest.includes(itemText) || 
             item.type === 'noun' || 
             item.category === 'Comida y Bebida' || 
             item.category === 'Juguetes y Objetos';
    }

    return false;
  };

  const handleOpenCategory = (categoryId) => {
    if (onNavigateCategory) {
      onNavigateCategory(categoryId);
    } else if (onNavigateTab) {
      onNavigateTab('categories');
    }
  };

  // Map Grid Size to CSS Grid columns for Core Vocabulary
  const getCoreGridCols = () => {
    switch (gridSize) {
      case '2x2':
        return 'grid-cols-2';
      case '3x3':
        return 'grid-cols-2 sm:grid-cols-3';
      case '4x4':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6';
      case '5x5':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6';
      case '6x6':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6';
      default:
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6';
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-5 pb-36 sm:pb-40 md:pb-48">
      {/* 0. Guided Learning Mode Banner (Modelado Asistido / Scaffolding) */}
      <section className={`
        rounded-3xl border-2 p-3 sm:p-4 shadow-sm transition-all
        ${guidedMode 
          ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-300' 
          : 'bg-slate-50 border-slate-200'}
      `}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
              ${guidedMode ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-300 text-slate-600'}
            `}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Modo Guía de Aprendizaje</span>
                  {guidedMode && (
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Activo
                    </span>
                  )}
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {guidedMode 
                  ? 'Resalta de forma predictiva los pictogramas para estructurar frases con sentido (Yo ➔ Quiero ➔ Chocolate ➔ Hablar).'
                  : 'Modo exploración libre activo. Activa la guía para acompañar paso a paso al niño.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Toggle Guided Mode Button */}
            <button
              onClick={() => onToggleGuidedMode ? onToggleGuidedMode(!guidedMode) : null}
              type="button"
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs cursor-pointer transition-all shadow-xs
                ${guidedMode 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'}
              `}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{guidedMode ? 'Guía Activada' : 'Activar Guía'}</span>
            </button>

            {/* Configure Core Vocabulary Modal Trigger */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl font-black text-xs bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer transition-all shadow-xs"
              title="Personalizar pictogramas del Vocabulario Núcleo"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Configurar Núcleo</span>
              <span className="sm:hidden">Núcleo</span>
            </button>
          </div>
        </div>

        {/* Active Step Indicator Pill when Guided Mode is ON */}
        {guidedMode && guidedStepInfo && (
          <div className="mt-3 pt-3 border-t border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/70 rounded-2xl p-2.5 px-3.5 border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-500 text-white font-black text-[11px] px-2.5 py-1 rounded-xl shadow-2xs shrink-0 tracking-wide">
                {guidedStepInfo.badge}
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-amber-950">
                {guidedStepInfo.instruction}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-800 shrink-0">
              <span className={`px-2 py-0.5 rounded-lg ${guidedStepInfo.step === 1 ? 'bg-amber-300 font-black' : 'bg-amber-100'}`}>1. Yo</span>
              <span>➔</span>
              <span className={`px-2 py-0.5 rounded-lg ${guidedStepInfo.step === 2 ? 'bg-amber-300 font-black' : 'bg-amber-100'}`}>2. Quiero</span>
              <span>➔</span>
              <span className={`px-2 py-0.5 rounded-lg ${guidedStepInfo.step === 3 ? 'bg-amber-300 font-black' : 'bg-amber-100'}`}>3. Objeto</span>
              <span>➔</span>
              <span className={`px-2 py-0.5 rounded-lg ${guidedStepInfo.step === 4 ? 'bg-emerald-300 font-black text-emerald-950' : 'bg-amber-100'}`}>4. Hablar</span>
            </div>
          </div>
        )}
      </section>

      {/* 1. Vocabulario Núcleo (Core Vocabulary Stitch) */}
      <section className="bg-white/90 border-2 border-[#d8e3fb] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#004ac6]"></span>
            <h2 className="text-base md:text-lg font-black text-[#111c2d] uppercase tracking-wide">
              Vocabulario Núcleo
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              ({sortedCore.length} tarjetas)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              type="button"
              className="text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-indigo-200"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Personalizar Vocabulario Núcleo</span>
            </button>
            <span className="text-[11px] font-black text-[#004ac6] bg-[#dbe1ff] px-3 py-1 rounded-full hidden sm:inline">
              CLAVE FITZGERALD
            </span>
          </div>
        </div>

        <div className={`grid ${getCoreGridCols()} gap-2.5 md:gap-3.5`}>
          {sortedCore.map((item) => (
            <PictoCard
              key={item.id}
              item={item}
              onSelect={onAddToSentence}
              size={cardSize}
              highContrast={highContrast}
              dwellTime={dwellTime}
              textTransform={textCase}
              imageOverrides={imageOverrides}
              textOverrides={textOverrides}
              isHighlighted={guidedMode && isCardGuidedTarget(item)}
            />
          ))}
        </div>
      </section>

      {/* 2. Encabezado de Categorías de Pictogramas */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#111c2d] tracking-tight flex items-center gap-2">
            <span>CATEGORÍAS DE PICTOGRAMAS</span>
            <span className="text-xs font-bold text-[#004ac6] bg-[#dbe1ff] px-2.5 py-0.5 rounded-full">
              Top 4 más usados por usuario
            </span>
          </h3>
          <p className="text-xs text-[#737686] font-medium">
            Se adaptan automáticamente a las preferencias de comunicación individuales.
          </p>
        </div>
        <button
          onClick={() => handleOpenCategory('all')}
          type="button"
          className="text-xs font-black text-[#004ac6] bg-[#e7eeff] hover:bg-[#d8e3fb] px-3 py-1.5 rounded-xl transition-all cursor-pointer hidden sm:flex items-center gap-1"
        >
          <span>Ver catálogo completo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Todas las categorías existentes con sus 4 pictogramas más usados */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {categoriesWithTop4.map((category) => {
          const Icon = category.icon;
          const { border, bg, text, btnBg } = category.color;

          return (
            <div
              key={category.id}
              style={{ backgroundColor: bg, borderColor: border }}
              className="border-2 rounded-3xl p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div style={{ color: text }} className="flex items-center gap-2 font-black text-sm md:text-base">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="uppercase tracking-tight">{category.label}</span>
                </div>
                <button
                  onClick={() => handleOpenCategory(category.id)}
                  type="button"
                  style={{ backgroundColor: btnBg, color: text }}
                  className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-2xs hover:brightness-95"
                  title={`Ver todos los ${category.totalCount} pictogramas en ${category.label}`}
                >
                  <span>Ver todos ({category.totalCount})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Top 4 Pictograms Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {category.top4.map((item) => (
                  <PictoCard
                    key={`${category.id}-${item.id}-${item.text}`}
                    item={item}
                    onSelect={onAddToSentence}
                    size={cardSize}
                    highContrast={highContrast}
                    dwellTime={dwellTime}
                    textTransform={textCase}
                    imageOverrides={imageOverrides}
                    textOverrides={textOverrides}
                    isHighlighted={guidedMode && isCardGuidedTarget(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Core Vocabulary Configurator Modal */}
      <CoreVocabularyConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentCore={sortedCore}
        onSaveCore={handleSaveConfiguredCore}
        allAvailablePictograms={allAvailablePictograms}
        imageOverrides={imageOverrides}
        textOverrides={textOverrides}
      />

      {/* Espaciador inferior para garantizar 100% de visibilidad en PC y móviles */}
      <div className="h-16 md:h-24" aria-hidden="true" />
    </div>
  );
}
