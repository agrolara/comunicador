import React, { useEffect, useMemo } from 'react';
import PictoCard from '../components/PictoCard';
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
  Car
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
  onNavigateTab,
  onNavigateCategory
}) {
  // 1. Core Vocabulary: 'YO' is always 1st, 'QUIERO' is always 2nd, the rest sort dynamically by user usage!
  const customCore = useMemo(() => 
    customPictograms.filter(p => p.category === 'Vocabulario Núcleo' || p.category === 'Núcleo'),
    [customPictograms]
  );
  const sortedCore = useMemo(() => {
    const allCore = [...CORE_PICTOGRAMS, ...customCore];
    return analytics.sortByUsage(allCore, 2);
  }, [customCore]);

  // Preload core audio in background for instant speech
  useEffect(() => {
    sortedCore.forEach(item => tts.preload(item.text));
  }, [sortedCore]);

  // 2. Definición exhaustiva de TODAS LAS CATEGORÍAS EXISTENTES
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

  // Para cada categoría, calcula de forma independiente los 4 pictogramas más usados por este usuario
  const categoriesWithTop4 = useMemo(() => {
    return ALL_BOARD_CATEGORIES.map(cat => {
      const customMatches = customPictograms.filter(p => 
        p.category === cat.matchCategory || 
        (p.category && p.category.toLowerCase().includes(cat.id.toLowerCase()))
      );
      const allCategoryItems = [...cat.items, ...customMatches];
      // Ordenamiento dinámico individual por frecuencia de uso
      const sorted = analytics.sortByUsage(allCategoryItems, 0);
      const top4 = sorted.slice(0, 4);

      return {
        ...cat,
        top4,
        totalCount: allCategoryItems.length
      };
    });
  }, [ALL_BOARD_CATEGORIES, customPictograms]);

  // Navegación rápida hacia la categoría seleccionada
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
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* 1. Vocabulario Núcleo (Core Vocabulary Stitch) */}
      <section className="bg-white/90 border-2 border-[#d8e3fb] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#004ac6]"></span>
            <h2 className="text-base md:text-lg font-black text-[#111c2d] uppercase tracking-wide">
              Vocabulario Núcleo
            </h2>
          </div>
          <span className="text-[11px] font-black text-[#004ac6] bg-[#dbe1ff] px-3 py-1 rounded-full">
            CLAVE FITZGERALD
          </span>
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
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Espaciador inferior para garantizar 100% de visibilidad en PC y móviles */}
      <div className="h-16 md:h-24" aria-hidden="true" />
    </div>
  );
}
