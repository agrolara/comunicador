import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Check,
  Sparkles,
  RotateCcw,
  BookOpen,
  Utensils,
  Smile,
  Activity,
  Gamepad2,
  Users,
  Shirt,
  MapPin
} from 'lucide-react';
import { getArasaacImageUrl } from '../services/arasaac';
import { CORE_PICTOGRAMS, FITZGERALD_COLORS } from '../data/pictograms';
import { tts } from '../services/tts';

export default function CoreVocabularyConfigModal({
  isOpen,
  onClose,
  currentCore,
  onSaveCore,
  allAvailablePictograms = [],
  imageOverrides = {},
  textOverrides = {}
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'presets'
  const [coreList, setCoreList] = useState(() => [...currentCore]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const coreIdSet = useMemo(() => {
    return new Set(coreList.map(item => `${item.id || item.text}`));
  }, [coreList]);

  // Handle reorder
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...coreList];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setCoreList(updated);
    tts.playChime('pop');
  };

  const handleMoveDown = (index) => {
    if (index >= coreList.length - 1) return;
    const updated = [...coreList];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setCoreList(updated);
    tts.playChime('pop');
  };

  const handleRemove = (index) => {
    const updated = coreList.filter((_, i) => i !== index);
    setCoreList(updated);
    tts.playChime('pop');
  };

  const handleAddPicto = (picto) => {
    if (coreIdSet.has(`${picto.id || picto.text}`)) {
      // Already in, remove it
      setCoreList(coreList.filter(item => `${item.id || item.text}` !== `${picto.id || picto.text}`));
    } else {
      setCoreList([...coreList, picto]);
    }
    tts.playChime('pop');
  };

  // Presets
  const handleLoadPreset = (presetType) => {
    tts.playChime('pop');
    if (presetType === 'default') {
      setCoreList([...CORE_PICTOGRAMS]);
    } else if (presetType === 'early_learner') {
      // Ideal para iniciar: Sujeto + Deseo + Cosas cotidianas de alta motivación
      const starterTexts = [
        'YO', 'QUIERO', 'CHOCOLATE', 'AGUA', 'GALLETA', 'PAN',
        'JUGAR', 'TABLET', 'PELOTA', 'COMER', 'BEBER', 'IR AL BAÑO',
        'MÁS', 'AYUDA', 'TERMINADO', 'SÍ', 'NO', 'MAMÁ'
      ];
      const matched = starterTexts.map(text => {
        const found = allAvailablePictograms.find(p => p.text.toUpperCase() === text);
        return found || { id: `preset-${text}`, text, category: 'Vocabulario Núcleo', type: 'noun' };
      });
      setCoreList(matched);
    } else if (presetType === 'extended') {
      // 24 Tarjetas con emociones y frases sociales
      const extTexts = [
        'YO', 'QUIERO', 'COMER', 'BEBER', 'IR AL BAÑO', 'NO QUIERO',
        'MÁS', 'AYUDA', 'TERMINADO', 'SÍ', 'NO', 'MIRA',
        'VAMOS', 'POR FAVOR', 'GRACIAS', 'DAME', 'ME GUSTA', 'ESPERAR',
        'CHOCOLATE', 'AGUA', 'TABLET', 'PELOTA', 'FELIZ', 'ABRAZO'
      ];
      const matched = extTexts.map(text => {
        const found = allAvailablePictograms.find(p => p.text.toUpperCase() === text);
        return found || { id: `preset-${text}`, text, category: 'Vocabulario Núcleo', type: 'noun' };
      });
      setCoreList(matched);
    }
  };

  const handleSave = () => {
    onSaveCore(coreList);
    tts.playChime('success');
    onClose();
  };

  // Filtered available pictograms for the "Add" tab
  const filteredAvailable = useMemo(() => {
    let pool = allAvailablePictograms;

    if (selectedCategoryFilter !== 'all') {
      pool = pool.filter(p => p.category && p.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      pool = pool.filter(p => {
        const effectiveText = (textOverrides[p.id] || p.text || '').toLowerCase();
        return effectiveText.includes(q) || (p.category && p.category.toLowerCase().includes(q));
      });
    }

    return pool;
  }, [allAvailablePictograms, selectedCategoryFilter, searchQuery, textOverrides]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-indigo-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                Configurar Vocabulario Núcleo
              </h3>
              <p className="text-xs text-indigo-200">
                Personaliza los pictogramas esenciales más utilizados por el niño ({coreList.length} tarjetas activas)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            type="button"
            className={`pb-3 px-3 font-black text-xs sm:text-sm border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tarjetas Actuales ({coreList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            type="button"
            className={`pb-3 px-3 font-black text-xs sm:text-sm border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar más Pictogramas</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            type="button"
            className={`pb-3 px-3 font-black text-xs sm:text-sm border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Preajustes Rápidos</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
          {/* TAB 1: LIST / REORDER / REMOVE */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
                <span>
                  💡 <strong>Consejo clínico:</strong> Se recomienda mantener "YO" y "QUIERO" en las primeras posiciones para modelar frases de deseo ("Yo quiero..."). Puedes mover cualquier tarjeta arriba o abajo con las flechas.
                </span>
                <span className="font-black bg-amber-200 px-2 py-0.5 rounded-full shrink-0">
                  {coreList.length} seleccionadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {coreList.map((item, index) => {
                  const effectiveText = textOverrides[item.id] || item.text;
                  const imgSrc = imageOverrides[item.id] || item.imageUrl || (item.arasaacId ? getArasaacImageUrl(item.arasaacId) : null);
                  const theme = FITZGERALD_COLORS[item.type] || FITZGERALD_COLORS.noun;

                  return (
                    <div
                      key={`${item.id || item.text}-${index}`}
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                      className="p-2.5 rounded-2xl border-2 flex items-center justify-between gap-2 shadow-2xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-black text-slate-400 w-5 text-center">
                          #{index + 1}
                        </span>
                        <div className="w-10 h-10 bg-white rounded-xl p-0.5 border border-black/10 shrink-0 flex items-center justify-center overflow-hidden">
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span>🏷️</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span style={{ color: theme.text }} className="font-black text-xs block truncate uppercase">
                            {effectiveText}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold block truncate">
                            {item.category || item.type}
                          </span>
                        </div>
                      </div>

                      {/* Reorder and Delete Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded-lg bg-white/70 hover:bg-white text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Mover arriba"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === coreList.length - 1}
                          className="p-1 rounded-lg bg-white/70 hover:bg-white text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Mover abajo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer"
                          title="Quitar del núcleo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {coreList.length === 0 && (
                <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl">
                  <p className="text-sm font-bold text-slate-500">No hay tarjetas en el vocabulario núcleo</p>
                  <p className="text-xs text-slate-400 mt-1">Carga un preajuste o agrega pictogramas desde la siguiente pestaña</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD FROM ALL CATALOG */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              {/* Search and Category Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar para agregar (ej. chocolate, agua, tablet, abrazo)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl text-xs sm:text-sm font-bold outline-none"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar shrink-0">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'comida', label: 'Comida' },
                    { id: 'juguetes', label: 'Juegos' },
                    { id: 'acciones', label: 'Acciones' },
                    { id: 'emociones', label: 'Emociones' },
                    { id: 'personas', label: 'Personas' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer whitespace-nowrap transition-all ${
                        selectedCategoryFilter === filter.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Available Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {filteredAvailable.map((item) => {
                  const effectiveText = textOverrides[item.id] || item.text;
                  const imgSrc = imageOverrides[item.id] || item.imageUrl || (item.arasaacId ? getArasaacImageUrl(item.arasaacId) : null);
                  const theme = FITZGERALD_COLORS[item.type] || FITZGERALD_COLORS.noun;
                  const isAdded = coreIdSet.has(`${item.id || item.text}`);

                  return (
                    <div
                      key={`avail-${item.id}-${item.text}`}
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                      className={`p-2 rounded-2xl border-2 flex flex-col justify-between items-center text-center relative transition-all ${
                        isAdded ? 'ring-2 ring-emerald-500 scale-98 bg-emerald-50' : 'hover:shadow-xs'
                      }`}
                    >
                      {/* Image */}
                      <div className="w-12 h-12 bg-white rounded-xl p-1 border border-black/10 flex items-center justify-center overflow-hidden mb-1">
                        {imgSrc ? (
                          <img src={imgSrc} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span>🏷️</span>
                        )}
                      </div>

                      {/* Label */}
                      <span style={{ color: theme.text }} className="font-black text-[11px] uppercase line-clamp-1 w-full">
                        {effectiveText}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold block truncate max-w-full">
                        {item.category || item.type}
                      </span>

                      {/* Add / Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleAddPicto(item)}
                        className={`w-full mt-2 py-1 px-2 rounded-xl font-black text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1 ${
                          isAdded
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>En Núcleo</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Añadir</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {filteredAvailable.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs font-bold">No se encontraron pictogramas para esa búsqueda</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Selecciona una configuración base prediseñada por fonoaudiólogos para adaptar el tablero a la etapa comunicativa del niño:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Preset 1 */}
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      Recomendado Inicial
                    </span>
                    <h4 className="font-black text-sm text-emerald-950 mt-1">Inicio Temprano (18 tarjetas)</h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Especial para modelar <strong>"Yo quiero [Comida / Juguete]"</strong>. Incluye chocolate, tablet, agua, galleta, jugar y baño.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('early_learner')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Cargar este Preset
                  </button>
                </div>

                {/* Preset 2 */}
                <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
                      Etapa Intermedia
                    </span>
                    <h4 className="font-black text-sm text-indigo-950 mt-1">Extendido (24 tarjetas)</h4>
                    <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                      Añade expresiones sociales (por favor, gracias, esperar, más) y estados emocionales para mayor autonomía.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('extended')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Cargar este Preset
                  </button>
                </div>

                {/* Preset 3 */}
                <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                      Clásico CAA
                    </span>
                    <h4 className="font-black text-sm text-slate-900 mt-1">Estándar Original</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      Restaura la distribución original de 19 tarjetas de ARASAAC con Clave Fitzgerald completa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('default')}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Restablecer Estándar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-500">
            Total en Núcleo: <strong className="text-indigo-600">{coreList.length}</strong> tarjetas
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Vocabulario Núcleo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
