import React, { useEffect } from 'react';
import PictoCard from '../components/PictoCard';
import { CORE_PICTOGRAMS, FOOD_PICTOGRAMS, EMOTIONS_PICTOGRAMS, PAIN_URGENCY_PICTOGRAMS, PLAY_TURNS_PICTOGRAMS } from '../data/pictograms';
import { Utensils, Smile, AlertCircle, Gamepad2, ChevronRight } from 'lucide-react';
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
  onNavigateTab
}) {
  // 1. Core Vocabulary: 'YO' is always 1st, 'QUIERO' is always 2nd, the rest sort dynamically by usage!
  const customCore = customPictograms.filter(p => p.category === 'Vocabulario Núcleo' || p.category === 'Núcleo');
  const allCore = [...CORE_PICTOGRAMS, ...customCore];
  const sortedCore = analytics.sortByUsage(allCore, 2);

  // 2. Quick folders: dynamically prioritize the top 4 most frequently used items (including custom ones)
  const customFood = customPictograms.filter(p => p.category === 'Comida y Bebida' || p.category === 'Comida');
  const allFood = [...FOOD_PICTOGRAMS, ...customFood];
  const quickFood = analytics.sortByUsage(allFood, 0).slice(0, 4);

  const customEmotions = customPictograms.filter(p => p.category === 'Emociones y Sentir' || p.category === 'Emociones');
  const allEmotions = [...EMOTIONS_PICTOGRAMS, ...customEmotions];
  const quickEmotions = analytics.sortByUsage(allEmotions, 0).slice(0, 4);

  const customPain = customPictograms.filter(p => p.category === 'Urgencias y Dolor' || p.category === 'Dolor y Urgencias');
  const allPain = [...PAIN_URGENCY_PICTOGRAMS, ...customPain];
  const quickPain = analytics.sortByUsage(allPain, 0).slice(0, 4);

  const customPlay = customPictograms.filter(p => p.category === 'Juegos y Turnos' || p.category === 'Juegos' || p.category === 'Juguetes y Objetos');
  const allPlay = [...PLAY_TURNS_PICTOGRAMS, ...customPlay];
  const quickPlay = analytics.sortByUsage(allPlay, 0).slice(0, 4);

  // Preload core vocabulary audio into browser memory for 0ms response on press
  useEffect(() => {
    sortedCore.forEach(item => tts.preload(item.text));
    quickFood.forEach(item => tts.preload(item.text));
  }, []);

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
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* 1. Core Vocabulary (Vocabulario Núcleo Stitch) */}
      <section className="bg-white/80 border-2 border-[#d8e3fb] rounded-3xl p-4 shadow-xs">
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

      {/* 2. Carpetas Rápidas (Quick Folders) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Comida y Bebida */}
        <div className="bg-[#fff8f3] border-2 border-[#fed7aa] rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#9a3412] font-black text-sm md:text-base">
              <Utensils className="w-5 h-5 text-[#ea580c]" />
              <span>COMIDA Y BEBIDA</span>
            </div>
            <button
              onClick={() => onNavigateTab('categories')}
              type="button"
              className="flex items-center gap-1 text-xs font-black text-[#9a3412] bg-[#fed7aa] hover:bg-[#fdba74] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              <span>Ver más</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickFood.map((item) => (
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
        </div>

        {/* Emociones y Sentir */}
        <div className="bg-[#f3f8fe] border-2 border-[#bfdbfe] rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#1e40af] font-black text-sm md:text-base">
              <Smile className="w-5 h-5 text-[#2563eb]" />
              <span>EMOCIONES Y SENTIR</span>
            </div>
            <button
              onClick={() => onNavigateTab('categories')}
              type="button"
              className="flex items-center gap-1 text-xs font-black text-[#1e40af] bg-[#bfdbfe] hover:bg-[#93c5fd] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              <span>Ver más</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickEmotions.map((item) => (
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
        </div>

        {/* Urgencias y Dolor Corporal */}
        <div className="bg-[#fef4f4] border-2 border-[#fecaca] rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#991b1b] font-black text-sm md:text-base">
              <AlertCircle className="w-5 h-5 text-[#dc2626]" />
              <span>URGENCIAS Y DOLOR</span>
            </div>
            <button
              onClick={() => onNavigateTab('pain')}
              type="button"
              className="flex items-center gap-1 text-xs font-black text-[#991b1b] bg-[#fecaca] hover:bg-[#fca5a5] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              <span>Mapa corporal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickPain.map((item) => (
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
        </div>

        {/* Juego y Turnos */}
        <div className="bg-[#fdfaf3] border-2 border-[#fde68a] rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#92400e] font-black text-sm md:text-base">
              <Gamepad2 className="w-5 h-5 text-[#f59e0b]" />
              <span>JUEGO Y TURNOS</span>
            </div>
            <button
              onClick={() => onNavigateTab('turns')}
              type="button"
              className="flex items-center gap-1 text-xs font-black text-[#92400e] bg-[#fde68a] hover:bg-[#fcd34d] px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              <span>Temporizador</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickPlay.map((item) => (
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
        </div>
      </section>
    </div>
  );
}
