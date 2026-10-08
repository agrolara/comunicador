import React, { useState, useEffect } from 'react';
import { Volume2, Delete, Trash2, MessageSquarePlus } from 'lucide-react';
import { tts } from '../services/tts';
import { analytics } from '../services/analytics';
import confetti from 'canvas-confetti';
import { STITCH_SEMANTIC_THEMES } from '../data/pictograms';

export default function SentenceBar({
  items,
  onRemoveItem,
  onClear,
  highContrast = false,
  imageOverrides = {},
  textOverrides = {},
  highlightSpeak = false
}) {
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Proactively preload the full sentence in background for 0ms speech latency
  useEffect(() => {
    if (items.length > 0) {
      const fullText = items.map(item => (textOverrides && textOverrides[item.id]) || item.text).join(' ');
      tts.preload(fullText);
    }
  }, [items, textOverrides]);

  const handleSpeakSentence = () => {
    if (items.length === 0) return;
    setIsSpeaking(true);
    tts.playChime('pop');

    const mappedItems = items.map(item => ({
      ...item,
      text: (textOverrides && textOverrides[item.id]) || item.text
    }));

    analytics.recordSentence(mappedItems);

    tts.speakSentence(
      mappedItems,
      (index) => setHighlightedIndex(index),
      () => {
        setIsSpeaking(false);
        setHighlightedIndex(null);
        tts.playChime('success');
        try {
          confetti({
            particleCount: 45,
            spread: 70,
            origin: { y: 0.25 }
          });
        } catch (e) {}
      }
    );
  };

  const handleRemoveLast = () => {
    if (items.length > 0) {
      tts.playChime('pop');
      onRemoveItem(items.length - 1);
    }
  };

  const handleClearAll = () => {
    if (items.length > 0) {
      tts.playChime('pop');
      onClear();
    }
  };

  return (
    <div className={`
      bg-[#ffffff] border-b-2 border-slate-300 px-3 py-2.5 shadow-sm
      flex flex-col md:flex-row items-center gap-2.5 z-20 sticky top-0
      ${highContrast ? 'border-b-4 border-black bg-slate-50' : ''}
    `}>
      {/* Cards Strip (Accumulator Canvas) */}
      <div className="flex-1 w-full min-h-[82px] bg-[#f0f3ff] rounded-2xl border-2 border-[#c3c6d7] p-2 flex items-center gap-2.5 overflow-x-auto shadow-inner">
        {items.length === 0 ? (
          <div className="flex items-center justify-center w-full text-slate-400 gap-2 font-bold text-sm md:text-base py-3">
            <MessageSquarePlus className="w-6 h-6 text-blue-500" />
            <span>Toca pictogramas para construir tu frase...</span>
          </div>
        ) : (
          items.map((item, idx) => {
            const theme = STITCH_SEMANTIC_THEMES[item.type] || STITCH_SEMANTIC_THEMES.noun;
            const isWordActive = highlightedIndex === idx;
            const overrideImg = imageOverrides && (
              imageOverrides[item.id] || 
              (item.arasaacId && imageOverrides[item.arasaacId]) || 
              (item.text && imageOverrides[item.text.toLowerCase()])
            );
            const img = overrideImg || item.imageUrl || (item.arasaacId 
              ? `https://static.arasaac.org/pictograms/${item.arasaacId}/${item.arasaacId}_300.png` 
              : null);

            const itemText = (textOverrides && textOverrides[item.id]) || item.text;

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => {
                  tts.speak(itemText);
                  onRemoveItem(idx);
                }}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                  boxShadow: `0 3px 0 ${theme.shadow}`
                }}
                className={`
                  relative flex-shrink-0 flex flex-col justify-between overflow-hidden rounded-xl border-2 cursor-pointer
                  transition-all duration-75 h-18 w-18 select-none active:translate-y-1 active:shadow-none
                  ${isWordActive ? 'scale-110 ring-4 ring-blue-500 shadow-md !bg-yellow-200' : 'hover:opacity-95'}
                `}
                title="Toca para escuchar o quitar"
              >
                <div
                  style={{ backgroundColor: theme.headerBg }}
                  className="w-full text-[10px] font-black text-center py-0.5 truncate border-b border-black/10 px-0.5"
                >
                  {itemText}
                </div>
                <div className="flex-1 w-full flex items-center justify-center p-1 bg-white/70">
                  {img && <img src={img} alt="" className="w-10 h-10 object-contain" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Control 3D Buttons (Stitch Chicklet Buttons) */}
      <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
        {/* Speak Entire Sentence Button */}
        <button
          onClick={handleSpeakSentence}
          disabled={items.length === 0 || isSpeaking}
          type="button"
          style={{
            boxShadow: items.length > 0 && !isSpeaking ? '0 5px 0 #047857' : 'none'
          }}
          className={`
            relative flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-white text-base md:text-lg transition-all duration-75
            ${items.length > 0 && !isSpeaking 
              ? 'bg-[#10B981] hover:bg-[#059669] active:translate-y-[5px] cursor-pointer' 
              : 'bg-slate-300 cursor-not-allowed opacity-50'}
            ${highlightSpeak && items.length > 0 && !isSpeaking
              ? 'ring-4 ring-amber-400 ring-offset-2 animate-bounce !bg-emerald-500 shadow-xl z-10'
              : ''}
          `}
        >
          {highlightSpeak && items.length > 0 && !isSpeaking && (
            <span className="absolute -top-2.5 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse uppercase tracking-wider">
              ✨ ¡Toca aquí!
            </span>
          )}
          <Volume2 className="w-6 h-6 animate-pulse" />
          <span>HABLAR</span>
        </button>

        {/* Delete Last Button */}
        <button
          onClick={handleRemoveLast}
          disabled={items.length === 0}
          type="button"
          title="Borrar último"
          style={{
            boxShadow: items.length > 0 ? '0 4px 0 #D97706' : 'none'
          }}
          className="p-3.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-2 border-[#F59E0B] rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:translate-y-[4px] active:shadow-none"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Clear All Button */}
        <button
          onClick={handleClearAll}
          disabled={items.length === 0}
          type="button"
          title="Borrar todo"
          style={{
            boxShadow: items.length > 0 ? '0 4px 0 #B91C1C' : 'none'
          }}
          className="p-3.5 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] border-2 border-[#DC2626] rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:translate-y-[4px] active:shadow-none"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
