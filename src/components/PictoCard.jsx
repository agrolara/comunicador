import React, { useState, useRef } from 'react';
import { STITCH_SEMANTIC_THEMES } from '../data/pictograms';
import { tts } from '../services/tts';
import { analytics } from '../services/analytics';

export default function PictoCard({
  item,
  onSelect,
  isHighlighted = false,
  size = 'md',
  speakOnTap = true,
  highContrast = false,
  dwellTime = 0, // In seconds (0 = instant, 0.5, 1.0)
  textTransform = 'uppercase', // 'uppercase' | 'capitalize'
  imageOverrides = {},
  textOverrides = {}
}) {
  const theme = STITCH_SEMANTIC_THEMES[item.type] || STITCH_SEMANTIC_THEMES.noun;
  const [holdingProgress, setHoldingProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);

  // Size configurations
  const sizeConfig = {
    sm: { card: 'h-24 text-[11px]', img: 'h-12 w-12', labelPy: 'py-0.5' },
    md: { card: 'h-32 text-xs md:text-sm', img: 'h-18 w-18 md:h-20 md:w-20', labelPy: 'py-1' },
    lg: { card: 'h-40 text-sm md:text-base', img: 'h-24 w-24 md:h-28 md:w-28', labelPy: 'py-1.5' },
    xl: { card: 'h-48 text-base md:text-lg', img: 'h-32 w-32 md:h-36 md:w-36', labelPy: 'py-2' }
  }[size] || { card: 'h-32 text-xs md:text-sm', img: 'h-18 w-18 md:h-20 md:w-20', labelPy: 'py-1' };

  // Resolve custom image override if available
  const overrideUrl = imageOverrides && (
    imageOverrides[item.id] || 
    (item.arasaacId && imageOverrides[item.arasaacId]) || 
    (item.text && imageOverrides[item.text.toLowerCase()])
  );

  const imageUrl = overrideUrl || item.imageUrl || (item.arasaacId 
    ? `https://static.arasaac.org/pictograms/${item.arasaacId}/${item.arasaacId}_300.png` 
    : null);

  // Resolve custom text override if available (e.g. FIDEOS instead of PASTA / FIDEOS)
  const rawText = (textOverrides && textOverrides[item.id]) || item.text;

  const triggerActivation = () => {
    tts.playChime('pop');
    
    if (speakOnTap) {
      tts.speak(rawText);
    }
    
    analytics.recordWord(rawText, item.category || item.type);
    
    if (onSelect) {
      onSelect({ ...item, text: rawText });
    }
  };

  // Support Dwell / Hold Time
  const handlePointerDown = (e) => {
    if (dwellTime <= 0) return;
    holdStartRef.current = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - holdStartRef.current) / 1000;
      const progress = Math.min((elapsed / dwellTime) * 100, 100);
      setHoldingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setHoldingProgress(0);
        triggerActivation();
      }
    }, 40);
    
    holdTimerRef.current = interval;
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
      setHoldingProgress(0);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (dwellTime <= 0) {
      triggerActivation();
    }
  };

  const displayText = textTransform === 'capitalize' 
    ? rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase()
    : rawText.toUpperCase();

  return (
    <button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      type="button"
      style={{
        backgroundColor: theme.bg,
        borderColor: highContrast ? '#000000' : theme.border,
        color: highContrast ? '#000000' : theme.text,
        boxShadow: highContrast 
          ? '0 5px 0 #000000' 
          : `0 4.5px 0 ${theme.shadow}`,
        touchAction: 'manipulation'
      }}
      className={`
        picto-card group relative w-full flex flex-col justify-between overflow-hidden
        rounded-2xl border-[2.5px] cursor-pointer select-none transition-all duration-75
        active:translate-y-[4.5px] active:shadow-none
        ${sizeConfig.card}
        ${isHighlighted ? 'scale-105 ring-4 ring-blue-600 !bg-yellow-200 z-10' : ''}
        ${highContrast ? '!border-[3.5px] font-black' : 'font-extrabold'}
      `}
    >
      {/* Visual Dwell Time Progress Overlay */}
      {holdingProgress > 0 && (
        <div 
          className="absolute inset-0 bg-blue-600/30 z-20 transition-all pointer-events-none"
          style={{ height: `${holdingProgress}%` }}
        />
      )}

      {/* 1. Header Strip (Label at TOP - Stitch AAC Requirement) */}
      <div
        style={{
          backgroundColor: highContrast ? '#FFFFFF' : theme.headerBg,
          borderBottomColor: highContrast ? '#000000' : theme.border
        }}
        className={`w-full ${sizeConfig.labelPy} px-1 border-b-[1.5px] text-center tracking-wide font-black truncate shadow-2xs z-10`}
      >
        {displayText}
      </div>

      {/* 2. Center Pictogram (ARASAAC Image or Real Uploaded Photo) */}
      <div className="flex-1 w-full flex items-center justify-center p-1.5 bg-white/75 z-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.text}
            className={`${sizeConfig.img} object-contain pointer-events-none drop-shadow-xs transition-transform duration-75 group-active:scale-95 rounded-lg`}
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-slate-400 font-bold">AAC</div>
        )}
      </div>
    </button>
  );
}
