import React, { useState } from 'react';
import { AlertCircle, Flame, Heart, EarOff, Thermometer, DoorOpen, PauseCircle, Activity } from 'lucide-react';
import PictoCard from '../components/PictoCard';
import { PAIN_URGENCY_PICTOGRAMS } from '../data/pictograms';
import { tts } from '../services/tts';
import { analytics } from '../services/analytics';

export default function PainUrgencyView({
  onAddToSentence,
  cardSize,
  highContrast,
  dwellTime = 0,
  textCase = 'uppercase',
  imageOverrides = {},
  textOverrides = {}
}) {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [painLevel, setPainLevel] = useState('Mucho');

  const bodyParts = [
    { id: 'cabeza', label: 'CABEZA', x: '50%', y: '14%', arasaacId: 2673, speech: 'Me duele la cabeza' },
    { id: 'oido', label: 'OÍDO', x: '35%', y: '18%', arasaacId: 39498, speech: 'Me duele el oído' },
    { id: 'garganta', label: 'GARGANTA', x: '50%', y: '26%', arasaacId: 3332, speech: 'Me duele la garganta' },
    { id: 'pecho', label: 'PECHO', x: '50%', y: '36%', arasaacId: 2367, speech: 'Me duele el pecho' },
    { id: 'estomago', label: 'ESTÓMAGO', x: '50%', y: '48%', arasaacId: 3309, speech: 'Me duele el estómago' },
    { id: 'brazo', label: 'BRAZO', x: '24%', y: '42%', arasaacId: 2367, speech: 'Me duele el brazo' },
    { id: 'pierna', label: 'PIERNA', x: '42%', y: '72%', arasaacId: 2367, speech: 'Me duele la pierna' },
    { id: 'pie', label: 'PIE', x: '42%', y: '90%', arasaacId: 2367, speech: 'Me duele el pie' }
  ];

  const urgentCards = [
    { id: 'u-1', text: 'IR AL BAÑO', arasaacId: 6929, bg: '#FEF3C7', border: '#F59E0B', shadow: '#D97706', textCol: '#92400E' },
    { id: 'u-2', text: 'AYUDA', arasaacId: 12252, bg: '#FEE2E2', border: '#DC2626', shadow: '#B91C1C', textCol: '#991B1B' },
    { id: 'u-3', text: 'PAUSA / CALMA', arasaacId: 36914, bg: '#DBEAFE', border: '#2563EB', shadow: '#1D4ED8', textCol: '#1E40AF' },
    { id: 'u-4', text: 'MUCHO RUIDO', arasaacId: 39498, bg: '#FCE7F3', border: '#DB2777', shadow: '#BE185D', textCol: '#9D174D' },
    { id: 'u-5', text: 'FIEBRE', arasaacId: 32530, bg: '#FEE2E2', border: '#DC2626', shadow: '#B91C1C', textCol: '#991B1B' },
    { id: 'u-6', text: 'ABRAZO', arasaacId: 4550, bg: '#FCE7F3', border: '#DB2777', shadow: '#BE185D', textCol: '#9D174D' },
  ];

  const handleBodyPartClick = (part) => {
    setSelectedBodyPart(part.id);
    const fullMessage = `${part.speech}. ${painLevel === 'Mucho' ? 'Me duele mucho' : 'Me duele un poco'}.`;
    tts.playChime('pop');
    tts.speak(fullMessage);
    analytics.recordWord(part.label, 'Dolor Corporal');
    
    if (onAddToSentence) {
      onAddToSentence({
        id: `body-${part.id}`,
        text: `ME DUELE ${part.label}`,
        type: 'urgency',
        arasaacId: part.arasaacId
      });
    }
  };

  const handleUrgentCard = (card) => {
    tts.playChime('pop');
    tts.speak(card.text);
    analytics.recordWord(card.text, 'Urgencia');
    if (onAddToSentence) {
      onAddToSentence({
        id: `urgent-${Date.now()}`,
        text: card.text,
        type: 'urgency',
        arasaacId: card.arasaacId
      });
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner Stitch */}
      <div className="bg-[#ba1a1a] text-white p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">URGENCIAS Y DOLOR CORPORAL</h2>
            <p className="text-xs md:text-sm text-red-100 font-medium">
              Toca directamente dónde te duele o tu necesidad inmediata
            </p>
          </div>
        </div>

        {/* Nivel de dolor */}
        <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl">
          <span className="text-xs font-bold text-red-100 px-2">INTENSIDAD:</span>
          {['Un poco', 'Mucho'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setPainLevel(lvl);
                tts.speak(lvl);
              }}
              type="button"
              className={`
                px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all
                ${painLevel === lvl ? 'bg-white text-[#ba1a1a] shadow-xs' : 'text-white hover:bg-white/10'}
              `}
            >
              {lvl.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mapa Corporal Interactivo */}
        <div className="lg:col-span-5 bg-white border-2 border-[#ffdad6] rounded-3xl p-5 shadow-xs flex flex-col items-center">
          <h3 className="font-black text-[#111c2d] text-base mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#ba1a1a]" />
            <span>Toca la parte del cuerpo que te duele:</span>
          </h3>

          <div className="relative w-72 h-96 bg-[#fff5f5] rounded-2xl border-2 border-dashed border-[#fecaca] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 200 320" className="w-52 h-84 opacity-40">
              <circle cx="100" cy="45" r="28" fill="#F87171" />
              <rect x="92" y="73" width="16" height="15" fill="#F87171" />
              <path d="M 65 88 L 135 88 L 125 180 L 75 180 Z" fill="#F87171" />
              <path d="M 65 92 L 35 170" stroke="#F87171" strokeWidth="18" strokeLinecap="round" />
              <path d="M 135 92 L 165 170" stroke="#F87171" strokeWidth="18" strokeLinecap="round" />
              <path d="M 82 180 L 80 295" stroke="#F87171" strokeWidth="20" strokeLinecap="round" />
              <path d="M 118 180 L 120 295" stroke="#F87171" strokeWidth="20" strokeLinecap="round" />
            </svg>

            {bodyParts.map((part) => {
              const isSelected = selectedBodyPart === part.id;
              return (
                <button
                  key={part.id}
                  onClick={() => handleBodyPartClick(part)}
                  style={{ left: part.x, top: part.y, transform: 'translate(-50%, -50%)' }}
                  type="button"
                  title={part.label}
                  className={`
                    absolute px-3 py-1.5 rounded-xl text-xs font-black shadow-sm cursor-pointer transition-all active:scale-95
                    ${isSelected 
                      ? 'bg-[#ba1a1a] text-white scale-120 ring-4 ring-red-300 z-10 animate-bounce' 
                      : 'bg-white text-[#991b1b] border-2 border-[#dc2626] hover:scale-110 hover:bg-red-50'}
                  `}
                >
                  {part.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Urgencias Vitales con Pictogramas ARASAAC Reales */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-black text-[#111c2d] text-base uppercase tracking-wider">
            Urgencias y Regulación Rápida:
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {urgentCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleUrgentCard(card)}
                type="button"
                style={{
                  backgroundColor: card.bg,
                  borderColor: card.border,
                  color: card.textCol,
                  boxShadow: `0 4.5px 0 ${card.shadow}`
                }}
                className="picto-card h-36 rounded-2xl border-[2.5px] p-2 flex flex-col justify-between items-center cursor-pointer select-none active:translate-y-[4.5px] active:shadow-none transition-all duration-75"
              >
                <div className="w-full text-center text-xs font-black tracking-wide border-b border-black/10 pb-1">
                  {card.text}
                </div>
                <div className="flex-1 flex items-center justify-center p-1">
                  <img
                    src={`https://static.arasaac.org/pictograms/${card.arasaacId}/${card.arasaacId}_300.png`}
                    alt={card.text}
                    className="w-16 h-16 object-contain pointer-events-none drop-shadow-xs"
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-black text-[#737686] uppercase tracking-wider mb-2">
              Vocabulario de Dolor Adicional
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {PAIN_URGENCY_PICTOGRAMS.map((item) => (
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
        </div>
      </div>
    </div>
  );
}
