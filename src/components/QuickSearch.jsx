import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Volume2, Plus, Sparkles, Check, Globe, Layers, Loader2, ArrowRight } from 'lucide-react';
import { ALL_PRESET_PICTOGRAMS, FITZGERALD_COLORS } from '../data/pictograms';
import { arasaac, getArasaacImageUrl, normalizeText, getSingularTerm } from '../services/arasaac.js';
import { tts } from '../services/tts';
import { analytics } from '../services/analytics';

export default function QuickSearch({
  onAddToSentence,
  imageOverrides = {},
  textOverrides = {},
  customPictograms = [],
  sentenceItems = []
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [activeSourceTab, setActiveSourceTab] = useState('all'); // 'all', 'local', 'arasaac'
  
  // ARASAAC Online Results
  const [arasaacResults, setArasaacResults] = useState([]);
  const [isSearchingArasaac, setIsSearchingArasaac] = useState(false);

  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const modalInputRef = useRef(null);

  // Dynamic Landscape / Screen Height Detection
  const [isCompactLandscape, setIsCompactLandscape] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isLand = window.innerWidth > window.innerHeight;
    return isLand && (window.innerHeight <= 540 || (typeof screen !== 'undefined' && screen.height <= 540));
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const isLand = window.innerWidth > window.innerHeight;
      const compact = isLand && (window.innerHeight <= 540 || (typeof screen !== 'undefined' && screen.height <= 540));
      setIsCompactLandscape(compact);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Close when clicking outside modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus modal input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        modalInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Combine presets and custom pictograms
  const allLocalPool = useMemo(() => {
    const combined = [...ALL_PRESET_PICTOGRAMS, ...customPictograms];
    const seen = new Set();
    return combined.filter(item => {
      const key = `${item.id}-${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [customPictograms]);

  // Local Search Filter with Relevance Ranking & Spanish Normalization
  const localResults = useMemo(() => {
    const cleanQ = query.trim();
    if (!cleanQ) return [];

    const normQ = normalizeText(cleanQ);
    const singularQ = getSingularTerm(normQ);

    const scored = [];

    for (const item of allLocalPool) {
      const effectiveText = textOverrides[item.id] || item.text || '';
      const normText = normalizeText(effectiveText);
      const normCat = normalizeText(item.category || '');

      let score = 0;

      // 1. Exact match on word
      if (normText === normQ) {
        score = 100;
      }
      // 2. Singular of query matches word exactly
      else if (normText === singularQ) {
        score = 90;
      }
      // 3. Word starts with query (e.g. 'auto' -> 'automóvil')
      else if (normText.startsWith(normQ)) {
        score = 80;
      }
      // 4. Word singularized matches prefix
      else if (normText.startsWith(singularQ)) {
        score = 75;
      }
      // 5. Word contains query as whole word (e.g., 'ir al baño' contains 'baño')
      else if (new RegExp(`(^|\\s)${normQ}(\\s|$)`).test(normText)) {
        score = 70;
      }
      // 6. Substring match inside word (e.g., 'galleta' inside 'galletas')
      else if (normText.includes(normQ) || (singularQ.length >= 3 && normText.includes(singularQ))) {
        score = 50;
      }
      // 7. Category match (only if query is at least 3 chars)
      else if (normQ.length >= 3 && (normCat === normQ || normCat.startsWith(normQ))) {
        score = 30;
      } else if (normQ.length >= 3 && normCat.includes(normQ)) {
        score = 15;
      }

      if (score > 0) {
        scored.push({ item, score });
      }
    }

    // Sort by relevance score first, then by telemetry usage
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const usageA = analytics.getWordUsage ? analytics.getWordUsage(a.item.text) : 0;
      const usageB = analytics.getWordUsage ? analytics.getWordUsage(b.item.text) : 0;
      return usageB - usageA;
    });

    return scored.slice(0, 24).map(s => s.item);
  }, [query, allLocalPool, textOverrides]);

  // Debounced ARASAAC Online + Offline Catalog Search
  useEffect(() => {
    const cleanQ = query.trim();
    if (cleanQ.length < 2) {
      setArasaacResults([]);
      setIsSearchingArasaac(false);
      return;
    }

    let active = true;
    setIsSearchingArasaac(true);

    const timer = setTimeout(async () => {
      try {
        const results = await arasaac.searchPictograms(cleanQ);
        if (active) {
          // Filter out items that are already in local results by arasaacId or exact word
          const localArasaacIds = new Set(
            localResults.map(l => l.arasaacId).filter(Boolean)
          );
          const localWords = new Set(
            localResults.map(l => normalizeText(textOverrides[l.id] || l.text))
          );

          const distinctArasaac = results.filter(r => 
            !localArasaacIds.has(r.arasaacId) &&
            !localWords.has(normalizeText(r.keyword))
          );
          setArasaacResults(distinctArasaac.slice(0, 20));
        }
      } catch (err) {
        if (active) setArasaacResults([]);
      } finally {
        if (active) setIsSearchingArasaac(false);
      }
    }, 240);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, localResults, textOverrides]);

  // Display results based on active source tab
  const displayResults = useMemo(() => {
    if (activeSourceTab === 'local') return localResults;
    if (activeSourceTab === 'arasaac') return arasaacResults;

    // 'all' tab: Local first, then ARASAAC
    return [...localResults, ...arasaacResults];
  }, [activeSourceTab, localResults, arasaacResults]);

  const handleSelectPicto = (item) => {
    const effectiveText = textOverrides[item.id] || item.text || item.keyword;
    
    // 1. Tactile & audio chime
    tts.playChime('pop');
    
    // 2. Speak the item immediately
    tts.speak(effectiveText);
    
    // 3. Add to persistent sentence bar
    if (onAddToSentence) {
      onAddToSentence(item);
    }
    
    // 4. Record usage in telemetry
    analytics.recordWord(effectiveText, item.category || item.type || 'Buscador');

    // Visual feedback
    setAddedId(item.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  const handleClear = () => {
    setQuery('');
    setArasaacResults([]);
    modalInputRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const totalResultsCount = localResults.length + arasaacResults.length;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-1 sm:mx-2">
      {/* Trigger in Navbar: Search Input on Desktop, Compact button on mobile */}
      <div
        onClick={handleOpenModal}
        className="relative flex items-center cursor-pointer group"
      >
        <Search className="w-4 h-4 absolute left-3 text-[#004ac6] group-hover:scale-110 transition-transform pointer-events-none" />
        <div className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-[#f0f4fd] hover:bg-[#e7eeff] border-2 border-[#c3c6d7] group-hover:border-[#004ac6] rounded-2xl font-bold text-xs sm:text-sm text-[#737686] group-hover:text-[#111c2d] transition-all shadow-2xs truncate select-none">
          {query ? query : '🔍 Buscar pictograma...'}
        </div>
      </div>

      {/* FULL RESPONSIVE SEARCH MODAL / OVERLAY (Mobile, Tablet, Desktop, Landscape & Portrait) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 pt-4 sm:pt-10 md:pt-14">
          <div
            ref={modalRef}
            className={`
              bg-white rounded-3xl shadow-2xl border-2 border-[#004ac6] w-full max-w-2xl flex flex-col overflow-hidden
              animate-in fade-in zoom-in-95 duration-150
              ${isCompactLandscape ? 'max-h-[96vh]' : 'max-h-[88vh]'}
            `}
          >
            {/* Modal Header & Synchronized Search Input */}
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#004ac6]" />
                  <input
                    ref={modalInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Escribe lo que buscas (ej: mamá, galleta, pizza, auto, jugo)..."
                    className="w-full pl-9 sm:pl-10 pr-9 py-2 sm:py-2.5 bg-white border-2 border-[#c3c6d7] focus:border-[#004ac6] rounded-2xl font-black text-xs sm:text-sm text-[#111c2d] focus:outline-none shadow-xs"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={handleClear}
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                      title="Borrar texto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs rounded-xl cursor-pointer transition-all shrink-0"
                  title="Cerrar buscador"
                >
                  ✕ Cerrar
                </button>
              </div>

              {/* Source Filters Bar (Todos, Tableros Locales, Catálogo ARASAAC) */}
              {query.trim().length > 0 && (
                <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveSourceTab('all')}
                      className={`
                        px-2.5 py-1 rounded-xl font-black text-[11px] cursor-pointer transition-all flex items-center gap-1
                        ${activeSourceTab === 'all'
                          ? 'bg-[#004ac6] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}
                      `}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Todos ({totalResultsCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSourceTab('local')}
                      className={`
                        px-2.5 py-1 rounded-xl font-black text-[11px] cursor-pointer transition-all flex items-center gap-1
                        ${activeSourceTab === 'local'
                          ? 'bg-[#004ac6] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}
                      `}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Tablero ({localResults.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSourceTab('arasaac')}
                      className={`
                        px-2.5 py-1 rounded-xl font-black text-[11px] cursor-pointer transition-all flex items-center gap-1
                        ${activeSourceTab === 'arasaac'
                          ? 'bg-[#004ac6] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}
                      `}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Catálogo ARASAAC ({arasaacResults.length})</span>
                    </button>
                  </div>

                  {isSearchingArasaac && (
                    <span className="text-[10px] text-[#004ac6] font-bold flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Buscando en ARASAAC...</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results Grid / Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50">
              {query.trim().length === 0 ? (
                <div className="text-center py-8 px-4 text-slate-400 space-y-2">
                  <Search className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="font-black text-sm text-slate-700">
                    Escribe cualquier palabra para buscar pictograma
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Busca en los tableros del comunicador y en el catálogo oficial de más de 20.000 pictogramas de ARASAAC con soporte completo para modismos en español chileno, tildes y plurales.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-sm mx-auto">
                    {['comer', 'agua', 'galleta', 'pizza', 'auto', 'jugar', 'mamá', 'baño'].map((suggest) => (
                      <button
                        key={suggest}
                        type="button"
                        onClick={() => setQuery(suggest)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        {suggest}
                      </button>
                    ))}
                  </div>
                </div>
              ) : displayResults.length > 0 ? (
                <div className={`
                  grid gap-2.5
                  ${isCompactLandscape 
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5' 
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}
                `}>
                  {displayResults.map((item) => {
                    const effectiveText = textOverrides[item.id] || item.text || item.keyword;
                    const imgSrc = imageOverrides[item.id] || item.imageUrl || (item.arasaacId ? getArasaacImageUrl(item.arasaacId) : null);
                    const theme = FITZGERALD_COLORS[item.type] || FITZGERALD_COLORS.noun;
                    const isJustAdded = addedId === item.id;
                    const isArasaacItem = item.isArasaac || String(item.id).startsWith('arasaac-');

                    return (
                      <button
                        key={`${item.id}-${effectiveText}`}
                        type="button"
                        onClick={() => handleSelectPicto(item)}
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: theme.border
                        }}
                        className={`
                          relative p-2.5 rounded-2xl border-2 text-center flex flex-col items-center justify-between cursor-pointer transition-all duration-75 active:scale-95 group shadow-2xs hover:shadow-md select-none
                          ${isJustAdded ? 'ring-4 ring-emerald-400 scale-98 bg-emerald-50' : 'hover:border-[#004ac6]'}
                        `}
                      >
                        {/* Status Badge (Added / Source) */}
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          {isJustAdded ? (
                            <span className="bg-emerald-600 text-white p-0.5 rounded-full text-[9px] shadow-sm flex items-center animate-bounce">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : isArasaacItem ? (
                            <span className="text-[8px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full" title="Catálogo Oficial ARASAAC">
                              ARASAAC
                            </span>
                          ) : null}
                        </div>

                        {/* Pictogram Image */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl p-1 shadow-2xs flex items-center justify-center overflow-hidden mb-1.5 mt-0.5">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={effectiveText}
                              className="w-full h-full object-contain pointer-events-none"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <span className="text-2xl">🏷️</span>
                          )}
                        </div>

                        {/* Word Label */}
                        <span
                          style={{ color: theme.text }}
                          className="font-black text-xs sm:text-sm leading-tight uppercase line-clamp-1 break-words w-full"
                        >
                          {effectiveText}
                        </span>

                        {/* Category or Type Footer */}
                        <span className="text-[8px] sm:text-[9px] font-bold text-[#737686] truncate max-w-full mt-0.5 opacity-80">
                          {item.category || item.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 px-4 space-y-2 text-slate-500">
                  <p className="font-black text-sm text-slate-700">
                    No encontramos pictogramas para "{query}"
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Intenta buscar otra palabra similar o crea un pictograma personalizado con tu propia foto desde el <strong>Editor</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Sentence Preview Strip inside Search Modal */}
            {sentenceItems && sentenceItems.length > 0 && (
              <div className="bg-indigo-50/90 border-t border-indigo-200 p-2.5 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
                  <span className="text-[10px] sm:text-xs font-black text-indigo-900 shrink-0">
                    Frase en construcción:
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {sentenceItems.map((s, idx) => (
                      <span
                        key={`${s.id}-${idx}`}
                        className="px-2 py-0.5 bg-white border border-indigo-200 rounded-lg text-xs font-black text-indigo-950 shadow-2xs"
                      >
                        {textOverrides[s.id] || s.text || s.keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const fullText = sentenceItems
                      .map(s => textOverrides[s.id] || s.text || s.keyword)
                      .join(' ');
                    tts.speak(fullText);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar</span>
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-bold">
              <span className="flex items-center gap-1 text-[#004ac6]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Toca cualquier pictograma para agregarlo a tu frase</span>
              </span>

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg cursor-pointer text-xs flex items-center gap-1"
              >
                <span>Listo / Tablero</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
