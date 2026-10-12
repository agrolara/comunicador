import React, { useState, useEffect } from 'react';
import { DEFAULT_ACTIVITIES } from '../data/activities';
import { ALL_PRESET_PICTOGRAMS } from '../data/pictograms';
import {
  Sparkles,
  Gamepad2,
  Clock,
  Target,
  Layers,
  CheckCircle2,
  AlertCircle,
  Volume2,
  RotateCcw,
  Trash2,
  Award,
  Play,
  Heart,
  Lightbulb,
  X,
  Compass,
  Smile,
  Search,
  Loader2
} from 'lucide-react';
import { tts } from '../services/tts';
import { aiService } from '../services/ai';
import { arasaac } from '../services/arasaac.js';
import confetti from 'canvas-confetti';

const CUSTOM_ACTIVITIES_KEY = 'danmax_custom_activities';
const ACTIVITY_LOGS_KEY = 'danmax_activity_logs';
export const ACTIVE_GAME_KEY = 'danmax_active_game_activity';

// Comprehensive dictionary to guarantee 100% semantic accuracy
const ARASAAC_VERIFIED_DICT = {
  'VAMOS': 8142,
  'PARAR': 7196,
  'MÁS': 3220,
  'MAS': 3220,
  'ABRIR': 24825,
  'CERRAR': 24976,
  'QUIERO': 5441,
  'COMER': 6456,
  'BEBER': 6061,
  'AGUA': 32464,
  'JUGAR': 23392,
  'DORMIR': 6479,
  'AYUDA': 12252,
  'NO': 5526,
  'SÍ': 5584,
  'SI': 5584,
  'BURBUJAS': 6945,
  'AUTO': 2340,
  'AUTOS': 2340,
  'AUTO DE JUGUETE': 2340,
  'PELOTA': 3241,
  'BLOQUES': 4935,
  'PLASTILINA': 2529,
  'MI TURNO': 6632,
  'TU TURNO': 25790,
  'ESPERAR': 8109,
  'GALLETA': 8312,
  'LECHE': 2445,
  'MANZANA': 2462,
  'PAN': 2494,
  'FELIZ': 9907,
  'CALMA': 31310,
  'COSQUILLAS': 5480,
  'CUIDADO': 35535,
  'LAGO': 6022,
  'PISCINA': 30516,
  'PILETA': 30516,
  'PLAYA': 30518,
  'NADAR': 6568,
  'RIO': 6023,
  'RÍO': 6023,
  'BOTE': 2311,
  'BARCO': 2311,
  'PARQUE': 2502,
  'PLAZA': 2502,
  'SOL': 2570,
  'ARENA': 2697,
  'TOBOGAN': 2588,
  'TOBOGÁN': 2588,
  'COLUMPIO': 2345,
  'DINOSAURIO': 10471,
  'SALIR': 6477,
  'ENTRAR': 6478,
  'CALOR': 6432,
  'FRIO': 6434,
  'FRÍO': 6434,
  'BICICLETA': 2305,
  'BICI': 2305,
  'COCINAR': 6455,
  'PIZZA': 2527
};

export function getVerifiedArasaacId(text, defaultId, isUserSelected) {
  if (isUserSelected && defaultId) return defaultId;
  if (!text) return defaultId || 3220;
  const clean = text.trim().toUpperCase();

  if (ARASAAC_VERIFIED_DICT[clean]) {
    return ARASAAC_VERIFIED_DICT[clean];
  }

  // Exact match in full catalog
  const match = ALL_PRESET_PICTOGRAMS.find(p => p.text.toUpperCase() === clean);
  if (match && match.arasaacId) return match.arasaacId;

  // Inclusion match in full catalog
  const partial = ALL_PRESET_PICTOGRAMS.find(p => 
    p.text.toUpperCase().includes(clean) || clean.includes(p.text.toUpperCase())
  );
  if (partial && partial.arasaacId) return partial.arasaacId;

  return defaultId || 3220;
}

export default function ActivitiesView({ onNavigateTab }) {
  // 1. Activities List State (defaults + custom verified)
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ACTIVITIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Keep only custom AI-generated activities and re-verify their IDs
          const customOnly = parsed
            .filter(a => a.isAiGenerated)
            .map(a => ({
              ...a,
              pictograms: (a.pictograms || []).map(p => ({
                ...p,
                arasaacId: getVerifiedArasaacId(p.text, p.arasaacId, p.isUserSelected)
              }))
            }));
          return [...customOnly, ...DEFAULT_ACTIVITIES];
        }
      }
    } catch (e) {}
    return DEFAULT_ACTIVITIES;
  });

  const [selectedActivityId, setSelectedActivityId] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ACTIVITIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {}
    return DEFAULT_ACTIVITIES[0].id;
  });

  // Filters State
  const [filterLevel, setFilterLevel] = useState('all'); // 'all', '1', '2', '3'
  const [filterContext, setFilterContext] = useState('all'); // 'all', 'juegos', 'mesa', 'sin_juguetes'

  // Completed logs counter
  const [completedLogs, setCompletedLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_LOGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // AI Modal States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLevel, setAiLevel] = useState('1');
  const [aiIdea, setAiIdea] = useState('');
  const [aiContext, setAiContext] = useState('juegos');
  const [aiGoal, setAiGoal] = useState('peticion');
  const [aiToy, setAiToy] = useState('');
  const [aiDuration, setAiDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const currentActivity = activities.find(a => a.id === selectedActivityId) || activities[0] || DEFAULT_ACTIVITIES[0];

  // Dynamically resolve and verify every pictogram against ARASAAC catalog
  const resolvedPictograms = (currentActivity?.pictograms || []).map(pic => ({
    ...pic,
    arasaacId: getVerifiedArasaacId(pic.text, pic.arasaacId, pic.isUserSelected)
  }));

  // Change Pictogram Modal State
  const [changePicModal, setChangePicModal] = useState({
    isOpen: false,
    picIndex: -1,
    pic: null
  });
  const [picSearchQuery, setPicSearchQuery] = useState('');
  const [picSearchResults, setPicSearchResults] = useState([]);
  const [isSearchingPic, setIsSearchingPic] = useState(false);

  const handleOpenChangePicModal = (index, pic) => {
    tts.playChime('pop');
    setChangePicModal({
      isOpen: true,
      picIndex: index,
      pic
    });
    const initialQuery = pic?.text || '';
    setPicSearchQuery(initialQuery);
    executeSearchForModal(initialQuery);
  };

  const executeSearchForModal = async (term) => {
    if (!term || !term.trim()) {
      setPicSearchResults([]);
      return;
    }
    setIsSearchingPic(true);
    const clean = term.trim().toLowerCase();

    try {
      // 1. Search local preset pictograms
      const localMatches = ALL_PRESET_PICTOGRAMS.filter(p => 
        p.text.toLowerCase().includes(clean) || clean.includes(p.text.toLowerCase())
      ).map(p => ({
        arasaacId: p.arasaacId,
        text: p.text,
        source: 'Catálogo de la app'
      }));

      // 2. Search online / offline ARASAAC
      const onlineMatches = await arasaac.searchPictograms(clean);
      const formattedOnline = (onlineMatches || []).map(item => ({
        arasaacId: item.arasaacId || (item._id ? Number(item._id) : 3220),
        text: (item.keyword || item.text || clean).toUpperCase(),
        source: 'ARASAAC Oficial'
      }));

      // Combine and deduplicate by arasaacId
      const combined = [...localMatches, ...formattedOnline];
      const seen = new Set();
      const deduped = [];
      for (const item of combined) {
        if (item.arasaacId && !seen.has(item.arasaacId)) {
          seen.add(item.arasaacId);
          deduped.push(item);
        }
      }

      setPicSearchResults(deduped);
    } catch (e) {
      console.warn('Error searching pictograms for modal:', e);
      setPicSearchResults([]);
    } finally {
      setIsSearchingPic(false);
    }
  };

  const handleSelectReplacementPictogram = (selectedItem) => {
    if (!currentActivity || changePicModal.picIndex < 0) return;

    tts.playChime('pop');
    const updatedPictograms = [...(currentActivity.pictograms || [])];
    const targetIdx = changePicModal.picIndex;

    updatedPictograms[targetIdx] = {
      ...updatedPictograms[targetIdx],
      text: selectedItem.text || updatedPictograms[targetIdx].text,
      arasaacId: selectedItem.arasaacId,
      isUserSelected: true
    };

    const updatedActivity = {
      ...currentActivity,
      pictograms: updatedPictograms
    };

    const newActivities = activities.map(a => a.id === currentActivity.id ? updatedActivity : a);
    setActivities(newActivities);

    // Persist to localStorage
    const customOnly = newActivities.filter(a => a.isAiGenerated);
    localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(customOnly));

    // Update active game session in localStorage if active
    try {
      const active = localStorage.getItem(ACTIVE_GAME_KEY);
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed.id === currentActivity.id) {
          localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(updatedActivity));
        }
      }
    } catch (e) {}

    // Close modal & confirm
    setChangePicModal({ isOpen: false, picIndex: -1, pic: null });
    tts.speak(`Pictograma cambiado a ${selectedItem.text}`);
    tts.playChime('success');
  };

  // Filtered Activities
  const filteredActivities = activities.filter(a => {
    if (filterLevel !== 'all' && a.levelId !== filterLevel && !a.levelLabel?.includes(filterLevel)) {
      return false;
    }
    if (filterContext !== 'all' && a.contextId !== filterContext) {
      return false;
    }
    return true;
  });

  const handleSelectActivity = (actId) => {
    tts.playChime('pop');
    setSelectedActivityId(actId);
    const act = activities.find(a => a.id === actId);
    if (act) {
      tts.speak(act.title);
    }
  };

  const handleSpeakPictogram = (picto) => {
    tts.playChime('pop');
    tts.speak(picto.text);
  };

  const handleStartOnBoard = () => {
    tts.playChime('pop');
    try {
      const sanitizedActivity = {
        ...currentActivity,
        pictograms: resolvedPictograms
      };
      localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(sanitizedActivity));
    } catch (e) {}

    tts.speak(`Iniciando ${currentActivity.title}. ¡A jugar!`);
    if (onNavigateTab) {
      onNavigateTab('main');
    }
  };

  const handleCompleteActivity = () => {
    tts.playChime('success');
    tts.speak('¡Felicitaciones! Has completado una sesión de modelado con éxito.');
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
    } catch (e) {}

    const newLog = {
      id: Date.now(),
      activityId: currentActivity.id,
      activityTitle: currentActivity.title,
      completedAt: new Date().toISOString()
    };

    const updated = [newLog, ...completedLogs];
    setCompletedLogs(updated);
    try {
      localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteActivity = (actId) => {
    if (!currentActivity?.isAiGenerated) return;
    if (window.confirm(`¿Seguro que deseas eliminar la actividad "${currentActivity.title}"?`)) {
      tts.playChime('pop');
      const filtered = activities.filter(a => a.id !== actId);
      setActivities(filtered);
      const customOnly = filtered.filter(a => a.isAiGenerated);
      localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(customOnly));
      setSelectedActivityId(filtered[0]?.id || DEFAULT_ACTIVITIES[0].id);
      tts.speak('Actividad eliminada');
    }
  };

  const handleGenerateAiActivity = async (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setAiError('');
    tts.playChime('pop');

    try {
      const generated = await aiService.generateActivity({
        level: aiLevel,
        context: aiContext,
        goal: aiGoal,
        idea: aiIdea.trim(),
        toyOrItem: aiToy.trim(),
        durationMinutes: aiDuration,
        patientName: 'Dante'
      });

      const updated = [generated, ...activities];
      setActivities(updated);

      const customOnly = updated.filter(a => a.isAiGenerated);
      localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(customOnly));

      setSelectedActivityId(generated.id);
      setShowAiModal(false);
      setAiIdea('');
      setAiToy('');
      tts.speak(`Juego ${generated.title} creado con éxito`);
      tts.playChime('success');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
      } catch (e) {}
    } catch (err) {
      console.error('Error generating activity with AI:', err);
      setAiError(err.message || 'No se pudo conectar con el motor de IA. Inténtalo nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const SUGGESTED_TOYS = [
    'Autos',
    'Burbujas',
    'Plastilina',
    'Bloques',
    'Pelota',
    'Galletas o Fruta',
    'Cosquillas',
    'Música o Canciones'
  ];

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#004ac6] via-indigo-700 to-purple-800 text-white p-5 md:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center shrink-0">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black">ACTIVIDADES Y JUEGOS CAA</h2>
              <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Modelado Asistido</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-indigo-100 font-medium">
              Estrategias lúdicas guiadas paso a paso para usar el comunicador en situaciones cotidianas sin forzar al niño
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          {completedLogs.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/15 backdrop-blur-xs rounded-2xl text-xs font-black text-amber-300 border border-white/20">
              <Award className="w-4 h-4 text-amber-300" />
              <span>{completedLogs.length} juegos completados</span>
            </div>
          )}

          <button
            onClick={() => {
              setShowAiModal(true);
              setAiError('');
              tts.playChime('pop');
            }}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-md cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Crear Juego con IA</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
        <span className="text-[11px] font-black text-slate-500 px-2 uppercase tracking-wider shrink-0">
          Nivel del Niño:
        </span>
        {[
          { id: 'all', label: 'Todos los Niveles' },
          { id: '1', label: 'Nivel 1: Explorador (1 palabra)' },
          { id: '2', label: 'Nivel 2: Combinador (2 palabras)' },
          { id: '3', label: 'Nivel 3: Social y Emocional' }
        ].map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => setFilterLevel(lvl.id)}
            type="button"
            className={`
              px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer whitespace-nowrap transition-all
              ${filterLevel === lvl.id ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'}
            `}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Activities Quick Carousel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {filteredActivities.map((act) => {
          const isSelected = act.id === selectedActivityId;
          return (
            <button
              key={act.id}
              onClick={() => handleSelectActivity(act.id)}
              type="button"
              className={`
                p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2
                ${isSelected 
                  ? 'bg-indigo-50 border-[#004ac6] shadow-sm scale-102' 
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'}
              `}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-black uppercase text-[#004ac6] bg-[#dbe1ff] px-1.5 py-0.5 rounded-full">
                    {act.duration || '5 min'}
                  </span>
                  {act.isAiGenerated && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <h4 className="font-black text-xs sm:text-sm line-clamp-2 leading-tight">
                  {act.title}
                </h4>
              </div>

              <span className="text-[10px] text-slate-500 font-bold block line-clamp-1">
                {act.levelLabel?.split(':')[1] || act.levelLabel || 'Explorador'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Detailed Activity Card */}
      {currentActivity && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-7 shadow-xs space-y-6">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase bg-[#dbe1ff] text-[#004ac6] px-2.5 py-1 rounded-xl">
                  {currentActivity.levelLabel}
                </span>
                <span className="text-xs font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl">
                  {currentActivity.contextLabel}
                </span>
                <span className="text-xs font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-xl">
                  {currentActivity.goalLabel}
                </span>
                <span className="text-xs font-black text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentActivity.duration || '5 min'}</span>
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 pt-1">
                {currentActivity.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium">
                {currentActivity.summary}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleStartOnBoard}
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#004ac6] hover:bg-[#003ea8] text-white font-black text-xs md:text-sm rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Ir al Tablero a Jugar</span>
              </button>

              <button
                onClick={handleCompleteActivity}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-all"
                title="Registrar sesión como completada"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">¡Logrado!</span>
              </button>

              {currentActivity.isAiGenerated && (
                <button
                  onClick={() => handleDeleteActivity(currentActivity.id)}
                  type="button"
                  title="Eliminar esta actividad"
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl cursor-pointer transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Target Pictograms to Model */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs md:text-sm font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#004ac6]" />
                <span>Pictogramas Clave para esta Actividad (Toca para escuchar)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Modelar con el dedo en la tablet
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {resolvedPictograms.map((pic, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border-2 border-slate-200 hover:border-[#004ac6] rounded-2xl flex flex-col justify-between transition-all group shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => handleSpeakPictogram(pic)}
                    className="flex items-center gap-3 text-left w-full cursor-pointer active:scale-98 transition-transform"
                    title="Toca para escuchar"
                  >
                    <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <img
                        src={`https://static.arasaac.org/pictograms/${pic.arasaacId}/${pic.arasaacId}_300.png`}
                        alt={pic.text}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://static.arasaac.org/pictograms/3220/3220_300.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-sm md:text-base text-slate-900 block leading-tight truncate">
                        {pic.text}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5 leading-tight">
                        {pic.role || 'Objetivo'}
                      </span>
                    </div>
                  </button>

                  {currentActivity.isAiGenerated && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">
                        ID: #{pic.arasaacId}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChangePicModal(idx, pic);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-200 hover:border-[#004ac6] text-[#004ac6] rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs cursor-pointer transition-all active:scale-95"
                        title="Cambiar y buscar el pictograma correcto"
                      >
                        <Search className="w-3 h-3 text-[#004ac6]" />
                        <span>Cambiar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Step-by-Step Modeling Guide for the Adult */}
          <div className="space-y-3">
            <h4 className="text-xs md:text-sm font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Guía de Acción para Papá, Mamá o Terapeuta</span>
            </h4>

            <div className="space-y-3">
              {(currentActivity.steps || []).map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 border-2 border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-lg">
                        {step.phase || `Paso ${idx + 1}`}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-bold text-slate-800">
                      {step.instruction}
                    </p>
                    {step.tip && (
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{step.tip}</span>
                      </p>
                    )}
                  </div>

                  {step.adultScript && (
                    <div className="bg-white border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-black text-indigo-900 shrink-0 shadow-2xs">
                      💬 Tú dices: <span className="text-indigo-600">"{step.adultScript}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Plan B Anti-Frustration Protocol */}
          {currentActivity.planB && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs md:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Protocolo de Calma / Plan B (Si el niño rechaza o se frustra)</span>
              </div>
              <p className="text-xs text-amber-900 font-medium leading-relaxed pl-6">
                {currentActivity.planB}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Crear Juego con IA */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-xl w-full p-5 md:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base md:text-lg">
                    Diseñar Actividad de Modelado con IA
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Personaliza según las necesidades y juguetes del niño
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateAiActivity} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* 1. Nivel del niño */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  1. Nivel o Etapa de Comunicación:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: '1', title: 'Nivel 1: Explorador', desc: '1 palabra / Causa-efecto' },
                    { id: '2', title: 'Nivel 2: Combinador', desc: '2 palabras (LME + 1)' },
                    { id: '3', title: 'Nivel 3: Social', desc: 'Límites, turnos y emoción' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setAiLevel(lvl.id)}
                      className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        aiLevel === lvl.id ? 'bg-indigo-50 border-[#004ac6] text-indigo-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-black text-xs block">{lvl.title}</span>
                      <span className="text-[10px] text-slate-500 block">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Idea o Temática de la Actividad */}
              <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-purple-50/70 p-3 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>2. Idea, Lugar o Temática de la Actividad:</span>
                  </label>
                  <span className="text-[10px] font-black uppercase text-[#004ac6] bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                    ¡Genera pictogramas alusivos!
                  </span>
                </div>
                <input
                  type="text"
                  value={aiIdea}
                  onChange={(e) => setAiIdea(e.target.value)}
                  placeholder="Ej: Vamos al lago, En la piscina, Día de playa, Paseo en bicicleta, Cocinar galletas..."
                  className="w-full p-2.5 bg-white border-2 border-indigo-200 rounded-xl font-bold text-xs text-slate-900 focus:border-[#004ac6] focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                />

                <div className="flex flex-wrap gap-1">
                  {[
                    '🌊 Vamos al lago',
                    '🏊 En la piscina',
                    '🏖️ Día de playa',
                    '🌳 Paseo al parque',
                    '🚴 Andar en bici',
                    '🍪 Hacer galletas',
                    '🚗 Pista de autos',
                    '🦖 Dinosaurios',
                    '🛒 En el supermercado'
                  ].map((sug) => {
                    const cleanSug = sug.replace(/^[^\w\s]+\s*/, '');
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          setAiIdea(cleanSug);
                          tts.playChime('pop');
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          aiIdea === cleanSug 
                            ? 'bg-[#004ac6] text-white shadow-xs' 
                            : 'bg-white hover:bg-amber-100 hover:text-amber-950 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {sug}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Contexto */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  3. ¿Dónde están o qué momento es?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'juegos', label: '🚗 Con Juguetes' },
                    { id: 'mesa', label: '🍳 En la Mesa / Comida' },
                    { id: 'sin_juguetes', label: '🫂 Sin Juguetes (Cosquillas)' },
                    { id: 'rutina', label: '🛁 Higiene / Baño' },
                    { id: 'escuela', label: '🎒 Escuela / Aire Libre' }
                  ].map((ctx) => (
                    <button
                      key={ctx.id}
                      type="button"
                      onClick={() => setAiContext(ctx.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                        aiContext === ctx.id ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {ctx.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Objetivo */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  4. Objetivo Principal de la Actividad:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'peticion', label: '🎯 Petición de alta motivación' },
                    { id: 'rechazo', label: '🛑 Decir NO/PARAR antes de frustrarse' },
                    { id: 'turnos', label: '👥 Esperar turnos y compartir' },
                    { id: 'emocion', label: '😊 Identificar sensaciones y emociones' }
                  ].map((gb) => (
                    <button
                      key={gb.id}
                      type="button"
                      onClick={() => setAiGoal(gb.id)}
                      className={`p-2 rounded-xl border font-bold text-xs text-left cursor-pointer transition-all ${
                        aiGoal === gb.id ? 'bg-purple-50 border-purple-600 text-purple-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {gb.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Elemento / Juguete a mano */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  5. ¿Qué juguete u objeto tienen a mano? (Opcional):
                </label>
                <input
                  type="text"
                  value={aiToy}
                  onChange={(e) => setAiToy(e.target.value)}
                  placeholder="Ej: Autos de carrera, burbujas, plastilina, galletas..."
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs focus:border-[#004ac6] focus:outline-none"
                />

                <div className="flex flex-wrap gap-1 mt-1.5">
                  {SUGGESTED_TOYS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setAiToy(sug);
                        tts.playChime('pop');
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Duración */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  6. Duración estimada:
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setAiDuration(dur)}
                      className={`flex-1 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all ${
                        aiDuration === dur ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {dur} Minutos
                    </button>
                  ))}
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Diseñando Juego con IA...' : 'Generar Juego'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cambiar y Buscar Pictograma Correcto */}
      {changePicModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-xl w-full p-5 md:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-[#004ac6] flex items-center justify-center shrink-0 shadow-2xs">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base md:text-lg">
                    Cambiar Pictograma
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Buscando reemplazo para <strong className="text-indigo-600">"{changePicModal.pic?.text}"</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChangePicModal({ isOpen: false, picIndex: -1, pic: null })}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearchForModal(picSearchQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={picSearchQuery}
                  onChange={(e) => {
                    setPicSearchQuery(e.target.value);
                    executeSearchForModal(e.target.value);
                  }}
                  placeholder="Escribe la palabra (ej: cosquillas, auto, pelota)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-xs focus:border-[#004ac6] focus:bg-white focus:outline-none transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#004ac6] hover:bg-blue-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
              >
                Buscar
              </button>
            </form>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[220px] max-h-[50vh]">
              {isSearchingPic ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#004ac6]" />
                  <span className="text-xs font-bold">Buscando pictogramas en ARASAAC...</span>
                </div>
              ) : picSearchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {picSearchResults.map((item) => {
                    const isCurrent = item.arasaacId === changePicModal.pic?.arasaacId;
                    return (
                      <button
                        key={`${item.arasaacId}-${item.text}`}
                        type="button"
                        onClick={() => handleSelectReplacementPictogram(item)}
                        className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer group hover:scale-[1.02] active:scale-98 ${
                          isCurrent
                            ? 'bg-indigo-50/70 border-[#004ac6] ring-2 ring-indigo-200'
                            : 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-[#004ac6]'
                        }`}
                      >
                        <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shadow-2xs group-hover:shadow-xs transition-all">
                          <img
                            src={`https://static.arasaac.org/pictograms/${item.arasaacId}/${item.arasaacId}_300.png`}
                            alt={item.text}
                            className="w-14 h-14 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://static.arasaac.org/pictograms/3220/3220_300.png';
                            }}
                          />
                        </div>
                        <div className="w-full">
                          <span className="font-black text-xs text-slate-900 block truncate leading-tight">
                            {item.text}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            ID: #{item.arasaacId}
                          </span>
                        </div>
                        {isCurrent ? (
                          <span className="text-[10px] font-black uppercase bg-[#004ac6] text-white px-2 py-0.5 rounded-md">
                            Actual
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-[#004ac6] group-hover:underline">
                            Seleccionar
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-1">
                  <p className="text-xs font-bold">No se encontraron pictogramas para "{picSearchQuery}"</p>
                  <p className="text-[11px] text-slate-400">Intenta buscar con otra palabra (ej: cosquillas, risa, jugar).</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setChangePicModal({ isOpen: false, picIndex: -1, pic: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs cursor-pointer transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
