import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Volume2, Plus, Sparkles, Check } from 'lucide-react';
import { ALL_PRESET_PICTOGRAMS, FITZGERALD_COLORS } from '../data/pictograms';
import { getArasaacImageUrl } from '../services/arasaac';
import { tts } from '../services/tts';
import { analytics } from '../services/analytics';

export default function QuickSearch({
  onAddToSentence,
  imageOverrides = {},
  textOverrides = {},
  customPictograms = []
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Dynamic Landscape / Screen Height Detection
  const [isCompactLandscape, setIsCompactLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isLandscape = window.innerWidth > window.innerHeight;
    return window.innerHeight <= 480 || (isLandscape && window.innerHeight <= 560);
  });

  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const landscape = window.innerWidth > window.innerHeight;
      const compact = window.innerHeight <= 480 || (landscape && window.innerHeight <= 560);
      setIsLandscape(landscape);
      setIsCompactLandscape(compact);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Combine presets and custom pictograms
  const allPool = useMemo(() => {
    const combined = [...ALL_PRESET_PICTOGRAMS, ...customPictograms];
    const seen = new Set();
    return combined.filter(item => {
      const key = `${item.id}-${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customPictograms]);

  // Search filter
  const results = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return [];

    const matches = allPool.filter(item => {
      const effectiveText = (textOverrides[item.id] || item.text || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return effectiveText.includes(cleanQ) || cat.includes(cleanQ);
    });

    // Sort matching results by user frequency
    return analytics.sortByUsage(matches, 0).slice(0, 16);
  }, [query, allPool, textOverrides]);

  const handleSelectPicto = (item) => {
    const effectiveText = textOverrides[item.id] || item.text;
    
    // 1. Play tactile and audio chime
    tts.playChime('pop');
    
    // 2. Speak the item
    tts.speak(effectiveText);
    
    // 3. Add to sentence bar if handler provided
    if (onAddToSentence) {
      onAddToSentence(item);
    }
    
    // 4. Record usage in telemetry
    analytics.recordWord(effectiveText, item.category || item.type);

    // Visual feedback
    setAddedId(item.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-2">
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-[#004ac6] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          placeholder="🔍 Buscar pictograma..."
          className="w-full pl-9 pr-8 py-1.5 sm:py-2 bg-[#f0f4fd] hover:bg-[#e7eeff] focus:bg-white border-2 border-[#c3c6d7] focus:border-[#004ac6] rounded-2xl font-bold text-xs sm:text-sm text-[#111c2d] placeholder:text-[#737686] transition-all shadow-2xs outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute right-2.5 p-1 rounded-full text-[#737686] hover:text-[#111c2d] hover:bg-slate-200 cursor-pointer"
            title="Borrar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Results Panel - Dynamic Height & Adaptive Layout */}
      {isOpen && query.trim().length > 0 && (
        <div
          className={`
            bg-white border-2 border-[#004ac6] shadow-2xl z-50 overflow-y-auto
            animate-in fade-in slide-in-from-top-2 duration-150
            ${isLandscape ? 'max-h-[50vh]' : 'max-h-[70vh]'}
            ${isCompactLandscape
              ? 'fixed left-2 right-2 top-13 p-2 rounded-2xl'
              : 'absolute top-full left-0 right-0 mt-2 p-3 rounded-3xl no-scrollbar'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#e2e8f0] px-1">
            <span className="text-[10px] sm:text-[11px] font-black text-[#004ac6] uppercase tracking-wider flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
              <span>Resultados para "{query}" ({results.length})</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] text-[#737686] font-bold hidden sm:inline">
                Toca para hablar y agregar
              </span>
              {isCompactLandscape && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {results.length > 0 ? (
            isCompactLandscape ? (
              /* Compact 2-row horizontally scrollable / compact grid for low-height mobile landscape */
              <div className="grid grid-rows-2 grid-flow-col auto-cols-[140px] sm:auto-cols-[160px] gap-2 overflow-x-auto pb-1 pt-0.5">
                {results.map((item) => {
                  const effectiveText = textOverrides[item.id] || item.text;
                  const imgSrc = imageOverrides[item.id] || item.imageUrl || (item.arasaacId ? getArasaacImageUrl(item.arasaacId) : null);
                  const theme = FITZGERALD_COLORS[item.type] || FITZGERALD_COLORS.noun;
                  const isJustAdded = addedId === item.id;

                  return (
                    <button
                      key={`${item.id}-${item.text}`}
                      type="button"
                      onClick={() => handleSelectPicto(item)}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border
                      }}
                      className={`
                        relative px-2 py-1.5 rounded-xl border-2 text-left flex items-center gap-2 cursor-pointer
                        transition-all duration-75 active:scale-95 shrink-0 select-none
                        ${isJustAdded ? 'ring-2 ring-emerald-400 bg-emerald-50 scale-98' : 'hover:shadow-sm'}
                      `}
                    >
                      {/* Image */}
                      <div className="w-9 h-9 bg-white rounded-lg p-0.5 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={effectiveText}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-base">🏷️</span>
                        )}
                      </div>

                      {/* Labels */}
                      <div className="flex-1 min-w-0 pr-1">
                        <span
                          style={{ color: theme.text }}
                          className="font-black text-[11px] leading-tight uppercase block truncate"
                        >
                          {effectiveText}
                        </span>
                        <span className="text-[8px] font-bold text-[#737686] truncate block opacity-80">
                          {item.category || item.type}
                        </span>
                      </div>

                      {/* Action status icon */}
                      <span className="shrink-0">
                        {isJustAdded ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Standard Responsive Grid for Vertical and Large Screens */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {results.map((item) => {
                  const effectiveText = textOverrides[item.id] || item.text;
                  const imgSrc = imageOverrides[item.id] || item.imageUrl || (item.arasaacId ? getArasaacImageUrl(item.arasaacId) : null);
                  const theme = FITZGERALD_COLORS[item.type] || FITZGERALD_COLORS.noun;
                  const isJustAdded = addedId === item.id;

                  return (
                    <button
                      key={`${item.id}-${item.text}`}
                      type="button"
                      onClick={() => handleSelectPicto(item)}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border
                      }}
                      className={`
                        relative p-2 rounded-2xl border-2 text-center flex flex-col items-center justify-between cursor-pointer transition-all duration-75 active:scale-95 group
                        ${isJustAdded ? 'ring-4 ring-emerald-400 scale-98 bg-emerald-50' : 'hover:shadow-md'}
                      `}
                    >
                      {/* Badge if just added */}
                      {isJustAdded && (
                        <span className="absolute top-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full text-[9px] shadow-sm flex items-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}

                      {/* Image */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl p-1 shadow-2xs flex items-center justify-center overflow-hidden mb-1">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={effectiveText}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xl">🏷️</span>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        style={{ color: theme.text }}
                        className="font-black text-[11px] leading-tight uppercase line-clamp-1 break-words w-full"
                      >
                        {effectiveText}
                      </span>

                      {/* Category pill */}
                      <span className="text-[8px] font-bold text-[#737686] truncate max-w-full mt-0.5 opacity-80">
                        {item.category || item.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-5 text-slate-500">
              <p className="text-xs font-bold">No encontramos pictogramas para "{query}"</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Puedes agregarlo como pictograma personalizado desde la pestaña <strong>Editor</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
