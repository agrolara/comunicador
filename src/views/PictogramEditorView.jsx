import React, { useState, useRef } from 'react';
import {
  PlusCircle,
  Search,
  FolderOpen,
  Sparkles,
  Trash2,
  Check,
  FolderTree,
  Replace,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { arasaac } from '../services/arasaac';
import { STITCH_SEMANTIC_THEMES, ALL_PRESET_PICTOGRAMS } from '../data/pictograms';
import { tts } from '../services/tts';
import { optimizeImage } from '../services/imageOptimizer';
import confetti from 'canvas-confetti';

export default function PictogramEditorView({
  customPictograms,
  onAddCustomPictogram,
  onDeleteCustomPictogram,
  imageOverrides = {},
  onSetImageOverride,
  onRemoveImageOverride,
  textOverrides = {},
  onSetTextOverride,
  onRemoveTextOverride
}) {
  const [activeMode, setActiveMode] = useState('create'); // 'create' | 'replace'

  // Creation Form State
  const [wordText, setWordText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Comida y Bebida');
  const [selectedType, setSelectedType] = useState('noun');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Replace Existing Mode State
  const [replaceTargetId, setReplaceTargetId] = useState('');
  const [replaceCustomText, setReplaceCustomText] = useState('');
  const [replaceDataUrl, setReplaceDataUrl] = useState('');
  const [isProcessingReplaceImage, setIsProcessingReplaceImage] = useState(false);
  const [replaceFilterQuery, setReplaceFilterQuery] = useState('');
  const [replaceFilterCategory, setReplaceFilterCategory] = useState('all');

  // File picker refs
  const galleryInputRef = useRef(null);
  const replaceGalleryInputRef = useRef(null);

  const availableCategories = [
    'Vocabulario Núcleo',
    'Comida y Bebida',
    'Emociones y Sentir',
    'Urgencias y Dolor',
    'Juegos y Turnos',
    'Ropa y Vestimenta',
    'Higiene y Aseo',
    'Animales y Naturaleza',
    'Escuela y Aprendizaje',
    'Transporte y Vehículos',
    'Acciones',
    'Personas',
    'Lugares',
    'Social'
  ];

  const types = [
    { id: 'noun', label: 'Cosa / Alimento / Objeto', color: 'bg-[#ffedd5] text-[#9a3412] border-[#ea580c]' },
    { id: 'verb', label: 'Acción / Verbo', color: 'bg-[#d1fae5] text-[#065f46] border-[#10b981]' },
    { id: 'feeling', label: 'Emoción / Sentir', color: 'bg-[#dbeafe] text-[#1e40af] border-[#2563eb]' },
    { id: 'pronoun', label: 'Persona / Sujeto', color: 'bg-[#fef3c7] text-[#92400e] border-[#f59e0b]' },
    { id: 'social', label: 'Social / Cortesía', color: 'bg-[#fce7f3] text-[#9d174d] border-[#db2777]' },
    { id: 'urgency', label: 'Urgencia / Dolor', color: 'bg-[#fee2e2] text-[#991b1b] border-[#dc2626]' },
  ];

  const standardPictos = ALL_PRESET_PICTOGRAMS;

  // Handle Real Photo Upload / Camera Capture with Canvas Compression
  const handleFileUpload = async (e, isReplace = false) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (isReplace) {
      setIsProcessingReplaceImage(true);
    } else {
      setIsProcessingImage(true);
    }

    try {
      // Downscale and compress to max 512x512 JPEG (~35KB) to fit comfortably in localStorage
      const optimizedBase64 = await optimizeImage(file, 512, 512, 0.82);

      if (isReplace) {
        setReplaceDataUrl(optimizedBase64);
      } else {
        setImageDataUrl(optimizedBase64);
      }
      tts.playChime('pop');
    } catch (err) {
      alert('Hubo un problema al procesar la foto. Por favor intenta con otra imagen.');
      console.error(err);
    } finally {
      if (isReplace) {
        setIsProcessingReplaceImage(false);
      } else {
        setIsProcessingImage(false);
      }
      // Reset input value so user can pick the same file again if desired
      e.target.value = '';
    }
  };

  // Search in ARASAAC
  const handleSearchArasaac = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    const res = await arasaac.searchPictograms(searchTerm);
    setSearchResults(res);
    setIsSearching(false);
  };

  const handleSelectArasaac = (item) => {
    tts.playChime('pop');
    setImageDataUrl(item.imageUrl);
    if (!wordText) {
      setWordText(item.keyword.toUpperCase());
    }
  };

  // Save New Custom Pictogram (e.g. Chocapic)
  const handleSaveNew = (e) => {
    e.preventDefault();
    if (!wordText.trim() || !imageDataUrl) {
      alert('Por favor escribe el nombre y selecciona o toma una foto.');
      return;
    }

    tts.playChime('success');
    const newPicto = {
      id: `custom-${Date.now()}`,
      text: wordText.trim().toUpperCase(),
      category: selectedCategory,
      type: selectedType,
      imageUrl: imageDataUrl,
      icon: 'Sparkles'
    };

    onAddCustomPictogram(newPicto);
    tts.speak(`¡Pictograma ${wordText} guardado con éxito!`);

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.3 } });
    } catch (err) {}

    // Reset Form
    setWordText('');
    setImageDataUrl('');
    setSearchTerm('');
    setSearchResults([]);
  };

  // Save Overrides (Custom Text/Pronunciation and/or Real Photo)
  const handleSaveOverride = () => {
    if (!replaceTargetId) {
      alert('Selecciona un pictograma para personalizar.');
      return;
    }

    const targetPicto = standardPictos.find(p => p.id === replaceTargetId);
    let updatedSomething = false;

    // 1. Text / Pronunciation override
    if (replaceCustomText && replaceCustomText.trim()) {
      const cleanNewText = replaceCustomText.trim().toUpperCase();
      if (onSetTextOverride) {
        onSetTextOverride(replaceTargetId, cleanNewText);
        updatedSomething = true;
      }
    }

    // 2. Real photo override
    if (replaceDataUrl) {
      if (onSetImageOverride) {
        onSetImageOverride(replaceTargetId, replaceDataUrl);
        updatedSomething = true;
      }
    }

    if (updatedSomething) {
      tts.playChime('success');
      const spokenName = replaceCustomText ? replaceCustomText.trim() : (targetPicto?.text || 'pictograma');
      tts.speak(`Guardado: ${spokenName}`);

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.3 } });
      } catch (err) {}

      // Keep target selected so user can see their changes live, just reset temp file dataUrl
      setReplaceDataUrl('');
    } else {
      alert('Edita el texto o sube una foto antes de guardar.');
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Banner */}
      <div className="bg-[#004ac6] text-white p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <PlusCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">EDITOR DE PICTOGRAMAS</h2>
            <p className="text-xs md:text-sm text-[#dbe1ff] font-medium">
              Agrega productos reales (ej: Chocapic), fotos familiares o busca en ARASAAC
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveMode('create')}
            type="button"
            className={`
              px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all
              ${activeMode === 'create' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-white hover:bg-white/10'}
            `}
          >
            CREAR NUEVO
          </button>
          <button
            onClick={() => setActiveMode('replace')}
            type="button"
            className={`
              px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all
              ${activeMode === 'replace' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-white hover:bg-white/10'}
            `}
          >
            FOTO REAL EN EXISTENTE
          </button>
        </div>
      </div>

      {activeMode === 'create' ? (
        /* MODE 1: CREATE NEW CUSTOM PICTOGRAM (ej: Chocapic) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-black text-[#111c2d] text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>1. Datos del Nuevo Pictograma:</span>
            </h3>

            {/* Word Name */}
            <div>
              <label className="text-xs font-black text-[#737686] block mb-1 uppercase tracking-wider">
                Nombre del Pictograma / Palabra a pronunciar:
              </label>
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder="Ej: CHOCAPIC, MI OSO, PAPITAS..."
                className="w-full px-4 py-3 bg-[#f0f3ff] border-2 border-[#c3c6d7] rounded-2xl font-black text-base text-[#111c2d] focus:outline-none focus:border-[#004ac6]"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-xs font-black text-[#737686] block mb-1 uppercase tracking-wider">
                Categoría donde se guardará:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#f0f3ff] border-2 border-[#c3c6d7] rounded-2xl font-black text-sm text-[#111c2d] focus:outline-none focus:border-[#004ac6]"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Clave Fitzgerald Type */}
            <div>
              <label className="text-xs font-black text-[#737686] block mb-1 uppercase tracking-wider">
                Clasificación Semántica (Color de Borde):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`
                      px-3 py-2 rounded-xl border-2 font-black text-xs text-left cursor-pointer transition-all duration-75
                      ${t.color} ${selectedType === t.id ? 'ring-3 ring-[#004ac6] scale-102 shadow-xs' : 'opacity-80 hover:opacity-100'}
                    `}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload Options: CAMERA or FILES */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="text-xs font-black text-[#737686] block uppercase tracking-wider">
                2. Elegir Imagen o Tomar Foto Real:
              </label>

              {/* Hidden Input for File Gallery */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, false)}
              />

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isProcessingImage}
                style={{ boxShadow: '0 4px 0 #003ea8' }}
                className="w-full flex items-center justify-center gap-2.5 p-4 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-2xl font-black text-sm cursor-pointer active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                <FolderOpen className="w-5 h-5 text-amber-300" />
                <span>Elegir Foto de mis Archivos / Galería</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center font-medium">
                💡 Tip: Toma la foto con la cámara de tu teléfono y luego súbela presionando este botón.
              </p>

              {/* Compression loading indicator */}
              {isProcessingImage && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizando foto para el tablero...</span>
                </div>
              )}

              {/* Clear Photo */}
              {imageDataUrl && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-800">✓ Foto cargada y optimizada</span>
                  <button
                    type="button"
                    onClick={() => setImageDataUrl('')}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Quitar Foto
                  </button>
                </div>
              )}

              {/* Or Search ARASAAC */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  O buscar en el catálogo oficial de ARASAAC:
                </span>
                <form onSubmit={handleSearchArasaac} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#737686]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar en ARASAAC (ej: galleta, auto)..."
                      className="w-full pl-9 pr-3 py-2 bg-[#f0f3ff] border border-[#c3c6d7] rounded-xl font-bold text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#e7eeff] hover:bg-[#d8e3fb] text-[#004ac6] font-black text-xs rounded-xl cursor-pointer"
                  >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectArasaac(item)}
                        className="p-1.5 rounded-lg border bg-white flex flex-col items-center gap-1 hover:border-blue-500 cursor-pointer"
                      >
                        <img src={item.imageUrl} alt="" className="w-8 h-8 object-contain" />
                        <span className="text-[9px] font-bold truncate w-full text-center">{item.keyword}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveNew}
              type="button"
              style={{ boxShadow: '0 5px 0 #059669' }}
              className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl font-black text-base cursor-pointer shadow-md active:translate-y-[5px] active:shadow-none transition-all mt-4"
            >
              ¡GUARDAR PICTOGRAMA EN EL TABLERO!
            </button>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs flex flex-col items-center text-center">
              <span className="text-xs font-black text-[#737686] mb-3 uppercase tracking-wider">
                Vista Previa del Botón Tacto 3D:
              </span>

              {/* Exact Chicklet Card */}
              <div
                style={{
                  backgroundColor: STITCH_SEMANTIC_THEMES[selectedType].bg,
                  borderColor: STITCH_SEMANTIC_THEMES[selectedType].border,
                  color: STITCH_SEMANTIC_THEMES[selectedType].text,
                  boxShadow: `0 4.5px 0 ${STITCH_SEMANTIC_THEMES[selectedType].shadow}`
                }}
                className="w-36 h-36 rounded-2xl border-[2.5px] overflow-hidden flex flex-col justify-between"
              >
                <div
                  style={{ backgroundColor: STITCH_SEMANTIC_THEMES[selectedType].headerBg }}
                  className="w-full py-1 text-center font-black text-xs border-b border-black/10 truncate px-1"
                >
                  {wordText || 'NOMBRE'}
                </div>

                <div className="flex-1 w-full flex items-center justify-center p-2 bg-white/70">
                  {imageDataUrl ? (
                    <img src={imageDataUrl} alt="" className="w-20 h-20 object-contain rounded-lg shadow-2xs" />
                  ) : (
                    <div className="text-xs font-bold text-slate-300">FOTO AQUÍ</div>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#737686] mt-4">
                Categoría: <strong>{selectedCategory}</strong>
              </span>
            </div>

            {/* Existing Custom Items List */}
            <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs">
              <h4 className="font-black text-sm text-[#111c2d] mb-2 uppercase">
                Tus Pictogramas Creados ({customPictograms.length}):
              </h4>
              {customPictograms.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Aún no has creado pictogramas personalizados.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customPictograms.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-[#f0f3ff] rounded-xl">
                      <div className="flex items-center gap-2">
                        <img src={item.imageUrl} alt="" className="w-8 h-8 object-contain rounded-md" />
                        <div>
                          <span className="font-black text-xs text-[#111c2d] block">{item.text}</span>
                          <span className="text-[10px] text-slate-400">{item.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteCustomPictogram(item.id)}
                        type="button"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: REPLACE EXISTING PICTOGRAM WITH REAL PHOTO (VISUAL GRID & SEARCH) */
        <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-4 md:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-[#111c2d] text-base md:text-lg flex items-center gap-2">
                <Replace className="w-5 h-5 text-[#004ac6]" />
                <span>Reemplazar Pictogramas Existentes por Fotos Reales</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Toca cualquier pictograma (ej: <strong>PAPAS FRITAS</strong>, <strong>AGUA</strong>, <strong>MAMÁ</strong>) y sustitúyelo por una foto de tu producto favorito o familiar.
              </p>
            </div>
            {Object.keys(imageOverrides).length > 0 && (
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                {Object.keys(imageOverrides).length} con foto real
              </span>
            )}
          </div>

          {/* Search bar and Category Filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#737686]" />
                <input
                  type="text"
                  value={replaceFilterQuery}
                  onChange={(e) => setReplaceFilterQuery(e.target.value)}
                  placeholder="Buscar pictograma a personalizar (ej: papas fritas, galleta, leche)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f0f3ff] border-2 border-[#c3c6d7] rounded-2xl font-black text-sm text-[#111c2d] focus:outline-none focus:border-[#004ac6]"
                />
                {replaceFilterQuery && (
                  <button
                    onClick={() => setReplaceFilterQuery('')}
                    type="button"
                    className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Category Filter Selector */}
              <select
                value={replaceFilterCategory}
                onChange={(e) => setReplaceFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-[#f0f3ff] border-2 border-[#c3c6d7] rounded-2xl font-black text-xs text-[#111c2d]"
              >
                <option value="all">Todas las Categorías</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Grid of Pictograms */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#737686] px-1">
                <span>1. TOCA UN PICTOGRAMA DE LA LISTA:</span>
                <span>
                  {standardPictos.filter(p => {
                    const matchQ = !replaceFilterQuery.trim() || p.text.toLowerCase().includes(replaceFilterQuery.toLowerCase());
                    const matchC = replaceFilterCategory === 'all' || p.category === replaceFilterCategory;
                    return matchQ && matchC;
                  }).length} encontrados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto p-2 bg-[#f8faff] rounded-2xl border-2 border-[#d8e3fb]">
                {standardPictos
                  .filter(p => {
                    const matchQ = !replaceFilterQuery.trim() || 
                      p.text.toLowerCase().includes(replaceFilterQuery.toLowerCase()) ||
                      (textOverrides[p.id] && textOverrides[p.id].toLowerCase().includes(replaceFilterQuery.toLowerCase()));
                    const matchC = replaceFilterCategory === 'all' || p.category === replaceFilterCategory;
                    return matchQ && matchC;
                  })
                  .map((p) => {
                    const isSelected = replaceTargetId === p.id;
                    const hasPhoto = !!imageOverrides[p.id];
                    const hasCustomText = !!textOverrides[p.id];
                    const displayText = textOverrides[p.id] || p.text;
                    const pictoImg = imageOverrides[p.id] || `https://static.arasaac.org/pictograms/${p.arasaacId}/${p.arasaacId}_300.png`;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setReplaceTargetId(p.id);
                          setReplaceCustomText(textOverrides[p.id] || p.text);
                          setReplaceDataUrl('');
                          tts.playChime('pop');
                        }}
                        style={{
                          boxShadow: isSelected ? '0 3px 0 #003ea8' : '0 2px 0 #e2e8f0'
                        }}
                        className={`
                          p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all duration-75 relative
                          ${isSelected 
                            ? 'bg-[#dbe1ff] border-[#004ac6] text-[#00174b] scale-[1.02]' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-[#111c2d]'}
                        `}
                      >
                        {hasPhoto && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-emerald-600 text-white font-black text-[8px] rounded-md shadow-xs">
                            FOTO
                          </span>
                        )}
                        {hasCustomText && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-indigo-600 text-white font-black text-[8px] rounded-md shadow-xs">
                            TEXTO
                          </span>
                        )}

                        <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center border border-black/5 shadow-2xs">
                          <img
                            src={pictoImg}
                            alt={displayText}
                            className="w-full h-full object-contain rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://static.arasaac.org/pictograms/${p.arasaacId}/${p.arasaacId}_300.png`;
                            }}
                          />
                        </div>

                        <span className="font-black text-xs leading-tight line-clamp-2 w-full">
                          {displayText}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 truncate w-full">
                          {p.category}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Selected Pictogram Actions & Photo / Text Customization Panel */}
            <div className="lg:col-span-5 bg-[#f0f3ff] border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs space-y-4">
              <span className="text-xs font-black text-[#737686] block uppercase tracking-wider">
                2. Personalizar Texto / Voz y Foto Real:
              </span>

              {replaceTargetId ? (
                (() => {
                  const targetPicto = standardPictos.find(p => p.id === replaceTargetId);
                  const isPhotoOverridden = !!imageOverrides[replaceTargetId];
                  const isTextOverridden = !!textOverrides[replaceTargetId];
                  const currentDisplay = textOverrides[replaceTargetId] || targetPicto?.text;
                  const currentImg = imageOverrides[replaceTargetId] || `https://static.arasaac.org/pictograms/${targetPicto?.arasaacId}/${targetPicto?.arasaacId}_300.png`;

                  return (
                    <div className="space-y-4">
                      {/* Pictogram Info Card */}
                      <div className="p-3.5 bg-white rounded-2xl border-2 border-[#c3c6d7] flex items-center gap-3">
                        <img
                          src={currentImg}
                          alt=""
                          className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1 bg-white"
                        />
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase text-[#004ac6] bg-[#dbe1ff] px-2 py-0.5 rounded-full inline-block mb-1">
                            {targetPicto?.category}
                          </span>
                          <h4 className="font-black text-base text-[#111c2d] leading-tight">
                            {currentDisplay}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {isPhotoOverridden && (
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                ✓ Foto Real
                              </span>
                            )}
                            {isTextOverridden && (
                              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                ✓ Nombre Personalizado
                              </span>
                            )}
                            {!isPhotoOverridden && !isTextOverridden && (
                              <span className="text-[11px] text-slate-500 font-medium">
                                Predeterminado ARASAAC
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section A: Text & Pronunciation Customization */}
                      <div className="bg-white p-3.5 rounded-2xl border-2 border-[#c3c6d7] space-y-2">
                        <label className="text-[11px] font-black text-[#737686] block uppercase tracking-wider">
                          A. Nombre y Pronunciación (Voz):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replaceCustomText}
                            onChange={(e) => setReplaceCustomText(e.target.value)}
                            placeholder="Ej: FIDEOS, TALLARINES..."
                            className="flex-1 px-3 py-2 bg-[#f0f3ff] border border-[#c3c6d7] rounded-xl font-black text-sm text-[#111c2d] uppercase focus:outline-none focus:border-[#004ac6]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              tts.playChime('pop');
                              tts.speak(replaceCustomText || targetPicto?.text);
                            }}
                            className="px-3 py-2 bg-[#dbe1ff] hover:bg-[#c9d5ff] text-[#004ac6] font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                            title="Escuchar cómo sonará"
                          >
                            🔊 Probar
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Cambia el texto para que la voz lea la palabra exacta que usa tu hijo (ej: sin barras "/", o adaptado a tu país).
                        </p>
                        {isTextOverridden && (
                          <button
                            type="button"
                            onClick={() => {
                              onRemoveTextOverride(replaceTargetId);
                              setReplaceCustomText(targetPicto?.text || '');
                              tts.playChime('pop');
                            }}
                            className="text-[11px] font-bold text-red-600 hover:underline block pt-1 cursor-pointer"
                          >
                            Restablecer nombre original ({targetPicto?.text})
                          </button>
                        )}
                      </div>

                      {/* Section B: Photo Customization */}
                      <div className="bg-white p-3.5 rounded-2xl border-2 border-[#c3c6d7] space-y-2">
                        <label className="text-[11px] font-black text-[#737686] block uppercase tracking-wider">
                          B. Reemplazar por Foto Real:
                        </label>

                        {/* Hidden Input for File Gallery */}
                        <input
                          ref={replaceGalleryInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, true)}
                        />

                        <button
                          type="button"
                          onClick={() => replaceGalleryInputRef.current?.click()}
                          disabled={isProcessingReplaceImage}
                          style={{ boxShadow: '0 4px 0 #003ea8' }}
                          className="w-full flex items-center justify-center gap-2 p-3 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-2xl font-black text-xs md:text-sm cursor-pointer active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                        >
                          <FolderOpen className="w-4 h-4 text-amber-300" />
                          <span>Elegir Foto de Galería o Archivos</span>
                        </button>

                        {/* Compression loading indicator */}
                        {isProcessingReplaceImage && (
                          <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Optimizando foto...</span>
                          </div>
                        )}

                        {/* Preview of New Photo */}
                        {replaceDataUrl && (
                          <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-xl border-2 border-emerald-300">
                            <img
                              src={replaceDataUrl}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg border border-emerald-400 shadow-xs"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-black text-emerald-800 block">
                                ¡Nueva foto cargada!
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold">
                                Presiona Guardar para aplicar
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setReplaceDataUrl('')}
                              className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {isPhotoOverridden && (
                          <button
                            onClick={() => {
                              onRemoveImageOverride(replaceTargetId);
                              tts.playChime('pop');
                            }}
                            type="button"
                            className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                          >
                            Restablecer imagen original de ARASAAC
                          </button>
                        )}
                      </div>

                      {/* Unified Save Button */}
                      <button
                        onClick={handleSaveOverride}
                        disabled={!replaceTargetId || isProcessingReplaceImage}
                        type="button"
                        style={{ boxShadow: '0 5px 0 #059669' }}
                        className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl font-black text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:shadow-none transition-all"
                      >
                        ¡GUARDAR CAMBIOS EN ESTE PICTOGRAMA!
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="py-12 px-4 text-center space-y-2 bg-white rounded-2xl border-2 border-dashed border-[#c3c6d7]">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-black text-slate-500">
                    Ningún pictograma seleccionado
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Toca cualquier elemento de la lista izquierda (como Papas Fritas o Jugo) para cambiarle el texto o la foto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
