import React, { useState } from 'react';
import PictoCard from '../components/PictoCard';
import { normalizeText } from '../services/arasaac';
import {
  FOOD_PICTOGRAMS,
  ACTIONS_PICTOGRAMS,
  EMOTIONS_PICTOGRAMS,
  PLAY_TURNS_PICTOGRAMS,
  PAIN_URGENCY_PICTOGRAMS,
  PEOPLE_PICTOGRAMS,
  PLACES_PICTOGRAMS,
  CLOTHES_PICTOGRAMS,
  HYGIENE_PICTOGRAMS,
  ANIMALS_NATURE_PICTOGRAMS,
  SCHOOL_PICTOGRAMS,
  VEHICLES_PICTOGRAMS,
  SOCIAL_PICTOGRAMS,
  CORE_PICTOGRAMS
} from '../data/pictograms';
import {
  Utensils,
  Smile,
  Gamepad2,
  AlertCircle,
  HeartHandshake,
  Search,
  Activity,
  Users,
  MapPin,
  MessageCircle,
  Shirt,
  Sparkles,
  Sprout,
  GraduationCap,
  Car
} from 'lucide-react';
import { analytics } from '../services/analytics';

export default function CategoriesView({
  onAddToSentence,
  cardSize = 'md',
  gridSize = '4x4',
  highContrast = false,
  dwellTime = 0,
  textCase = 'uppercase',
  imageOverrides = {},
  textOverrides = {},
  customPictograms = [],
  selectedCategory: externalCategory = 'all',
  onSelectCategory = null
}) {
  const [internalCategory, setInternalCategory] = useState(externalCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = onSelectCategory ? externalCategory : internalCategory;
  const handleSelectCat = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      setInternalCategory(catId);
    }
  };

  const categories = [
    { id: 'all', label: 'TODOS', icon: HeartHandshake, bg: 'bg-[#dbe1ff]', text: 'text-[#004ac6]', matchCategory: null, items: [] },
    { id: 'core', label: 'VOCABULARIO NÚCLEO', icon: Sparkles, bg: 'bg-[#e0e7ff]', text: 'text-[#3730a3]', matchCategory: 'Vocabulario Núcleo', items: CORE_PICTOGRAMS },
    { id: 'food', label: 'COMIDA Y BEBIDA', icon: Utensils, bg: 'bg-[#ffeedd]', text: 'text-[#9a3412]', matchCategory: 'Comida y Bebida', items: FOOD_PICTOGRAMS },
    { id: 'actions', label: 'ACCIONES', icon: Activity, bg: 'bg-[#d1fae5]', text: 'text-[#065f46]', matchCategory: 'Acciones', items: ACTIONS_PICTOGRAMS },
    { id: 'emotions', label: 'EMOCIONES', icon: Smile, bg: 'bg-[#d8e3fb]', text: 'text-[#1e40af]', matchCategory: 'Emociones', items: EMOTIONS_PICTOGRAMS },
    { id: 'school', label: 'ESCUELA Y APRENDIZAJE', icon: GraduationCap, bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]', matchCategory: 'Escuela y Aprendizaje', items: SCHOOL_PICTOGRAMS },
    { id: 'vehicles', label: 'TRANSPORTE Y VEHÍCULOS', icon: Car, bg: 'bg-[#e0e7ff]', text: 'text-[#3730a3]', matchCategory: 'Transporte y Vehículos', items: VEHICLES_PICTOGRAMS },
    { id: 'pain', label: 'DOLOR Y URGENCIAS', icon: AlertCircle, bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', matchCategory: 'Dolor y Urgencias', items: PAIN_URGENCY_PICTOGRAMS },
    { id: 'clothes', label: 'ROPA Y VESTIMENTA', icon: Shirt, bg: 'bg-[#fce7f3]', text: 'text-[#9d174d]', matchCategory: 'Ropa y Vestimenta', items: CLOTHES_PICTOGRAMS },
    { id: 'hygiene', label: 'HIGIENE Y ASEO', icon: Sparkles, bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]', matchCategory: 'Higiene y Aseo', items: HYGIENE_PICTOGRAMS },
    { id: 'animals', label: 'ANIMALES Y NATURALEZA', icon: Sprout, bg: 'bg-[#dcfce7]', text: 'text-[#15803d]', matchCategory: 'Animales y Naturaleza', items: ANIMALS_NATURE_PICTOGRAMS },
    { id: 'people', label: 'PERSONAS', icon: Users, bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', matchCategory: 'Personas', items: PEOPLE_PICTOGRAMS },
    { id: 'play', label: 'JUGUETES Y OBJETOS', icon: Gamepad2, bg: 'bg-[#fed7aa]', text: 'text-[#9a3412]', matchCategory: 'Juguetes y Objetos', items: PLAY_TURNS_PICTOGRAMS },
    { id: 'places', label: 'LUGARES', icon: MapPin, bg: 'bg-[#e0e7ff]', text: 'text-[#3730a3]', matchCategory: 'Lugares', items: PLACES_PICTOGRAMS },
    { id: 'social', label: 'SOCIAL', icon: MessageCircle, bg: 'bg-[#fce7f3]', text: 'text-[#9d174d]', matchCategory: 'Social', items: SOCIAL_PICTOGRAMS },
  ];

  const allPresetItems = [
    ...CORE_PICTOGRAMS,
    ...FOOD_PICTOGRAMS,
    ...ACTIONS_PICTOGRAMS,
    ...EMOTIONS_PICTOGRAMS,
    ...SCHOOL_PICTOGRAMS,
    ...VEHICLES_PICTOGRAMS,
    ...PAIN_URGENCY_PICTOGRAMS,
    ...PEOPLE_PICTOGRAMS,
    ...PLAY_TURNS_PICTOGRAMS,
    ...PLACES_PICTOGRAMS,
    ...CLOTHES_PICTOGRAMS,
    ...HYGIENE_PICTOGRAMS,
    ...ANIMALS_NATURE_PICTOGRAMS,
    ...SOCIAL_PICTOGRAMS
  ];

  // Merge presets and custom pictograms
  const allItems = [...allPresetItems, ...customPictograms];

  let displayItems = [];
  if (currentCategory === 'all') {
    displayItems = allItems;
  } else {
    const foundCat = categories.find(c => c.id === currentCategory);
    if (foundCat) {
      // Find preset items + custom pictograms belonging to this category
      const customMatches = customPictograms.filter(p => p.category === foundCat.matchCategory);
      displayItems = [...foundCat.items, ...customMatches];
    } else {
      displayItems = allItems;
    }
  }

  // Filter if search query exists
  if (searchQuery.trim() !== '') {
    const normQ = normalizeText(searchQuery);
    displayItems = allItems.filter(item => {
      const effectiveText = textOverrides[item.id] || item.text;
      const normText = normalizeText(effectiveText);
      const normCat = normalizeText(item.category || '');
      return normText.includes(normQ) || normCat.includes(normQ);
    });
  }

  // Dynamically sort items so most frequently used pictograms appear first
  displayItems = analytics.sortByUsage(displayItems, 0);

  // Map Grid Size to CSS Grid columns
  const getGridCols = () => {
    switch (gridSize) {
      case '2x2':
        return 'grid-cols-2';
      case '3x3':
        return 'grid-cols-2 sm:grid-cols-3';
      case '4x4':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case '5x5':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5';
      case '6x6':
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-5 pb-36 sm:pb-40 md:pb-48">
      {/* Search and Material 3 Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#737686]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en el catálogo..."
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#c3c6d7] rounded-2xl font-bold text-sm text-[#111c2d] focus:outline-none focus:border-[#004ac6] shadow-xs"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = currentCategory === cat.id && searchQuery === '';

            return (
              <button
                key={cat.id}
                onClick={() => {
                  handleSelectCat(cat.id);
                  setSearchQuery('');
                }}
                type="button"
                className={`
                  flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-black text-xs md:text-sm cursor-pointer whitespace-nowrap transition-all duration-75
                  ${isSelected 
                    ? `border-2 border-[#004ac6] shadow-sm scale-102 ${cat.bg} ${cat.text}` 
                    : 'bg-white border-2 border-[#c3c6d7] text-[#434655] hover:bg-slate-50'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Pictograms */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black text-[#737686] uppercase tracking-wider">
            Mostrando {displayItems.length} tarjetas {searchQuery ? `para "${searchQuery}"` : ''}
          </span>
          <span className="text-xs font-bold text-[#004ac6] bg-[#dbe1ff] px-2.5 py-0.5 rounded-full">
            Cuadrícula: {gridSize}
          </span>
        </div>

        <div className={`grid ${getGridCols()} gap-2.5 md:gap-3.5`}>
          {displayItems.map((item) => (
            <PictoCard
              key={`${item.id}-${item.text}`}
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

        {displayItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-[#c3c6d7]">
            <p className="text-base font-bold text-slate-500">No se encontraron pictogramas</p>
            <p className="text-xs text-slate-400 mt-1">Intenta con otra palabra o agrégala desde el Editor</p>
          </div>
        )}
      </div>
    </div>
  );
}
