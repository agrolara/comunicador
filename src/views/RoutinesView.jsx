import React, { useState } from 'react';
import { DEFAULT_ROUTINES } from '../data/pictograms';
import { CalendarCheck2, CheckCircle2, Circle, RotateCcw, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { tts } from '../services/tts';
import { aiService } from '../services/ai';
import confetti from 'canvas-confetti';

const CUSTOM_ROUTINES_KEY = 'danmax_custom_routines';

export default function RoutinesView() {
  const [routines, setRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ROUTINES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map(r => r.id));
          const defaults = DEFAULT_ROUTINES.filter(d => !customIds.has(d.id));
          return [...parsed, ...defaults];
        }
      }
    } catch (e) {}
    return DEFAULT_ROUTINES;
  });

  const [activeRoutineId, setActiveRoutineId] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ROUTINES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {}
    return 'r-1';
  });

  // Modal AI Routine States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiStepsCount, setAiStepsCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const currentRoutine = routines.find(r => r.id === activeRoutineId) || routines[0] || DEFAULT_ROUTINES[0];

  const handleToggleStep = (stepId) => {
    tts.playChime('pop');

    setRoutines(prev => prev.map(r => {
      if (r.id !== activeRoutineId) return r;
      
      const newItems = r.items.map(item => {
        if (item.id === stepId) {
          const nextDone = !item.done;
          if (nextDone) {
            tts.speak(`¡Muy bien! Terminaste: ${item.text}`);
          }
          return { ...item, done: nextDone };
        }
        return item;
      });

      const allDone = newItems.every(i => i.done);
      if (allDone) {
        setTimeout(() => {
          tts.playChime('success');
          tts.speak(`¡Felicidades! Has completado toda tu ${r.title}. ¡Eres genial!`);
          try {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
          } catch (e) {}
        }, 600);
      }

      return { ...r, items: newItems };
    }));
  };

  const handleResetRoutine = () => {
    tts.playChime('pop');
    setRoutines(prev => prev.map(r => {
      if (r.id !== activeRoutineId) return r;
      return {
        ...r,
        items: r.items.map(i => ({ ...i, done: false }))
      };
    }));
    tts.speak(`Rutina reiniciada`);
  };

  const handleDeleteCurrentRoutine = () => {
    if (!currentRoutine?.isAiGenerated) return;
    if (window.confirm(`¿Seguro que deseas eliminar la rutina "${currentRoutine.title}"?`)) {
      tts.playChime('pop');
      const filtered = routines.filter(r => r.id !== activeRoutineId);
      setRoutines(filtered);
      const customOnly = filtered.filter(r => r.isAiGenerated);
      localStorage.setItem(CUSTOM_ROUTINES_KEY, JSON.stringify(customOnly));
      setActiveRoutineId(filtered[0]?.id || 'r-1');
      tts.speak('Rutina eliminada');
    }
  };

  const handleGenerateAiRoutine = async (e) => {
    if (e) e.preventDefault();
    if (!aiTopic.trim()) {
      setAiError('Por favor escribe de qué se trata la rutina');
      return;
    }

    setIsGenerating(true);
    setAiError('');
    tts.playChime('pop');

    try {
      const generated = await aiService.generateRoutine({
        topic: aiTopic.trim(),
        stepsCount: aiStepsCount
      });

      const updated = [generated, ...routines];
      setRoutines(updated);
      
      // Persist custom routines
      const customOnly = updated.filter(r => r.isAiGenerated);
      localStorage.setItem(CUSTOM_ROUTINES_KEY, JSON.stringify(customOnly));

      setActiveRoutineId(generated.id);
      setShowAiModal(false);
      setAiTopic('');
      tts.speak(`Rutina ${generated.title} creada con éxito`);
      tts.playChime('success');
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
      } catch (e) {}
    } catch (err) {
      console.error('Error generating routine with AI:', err);
      setAiError(err.message || 'No se pudo conectar con el motor de IA. Verifica tu conexión o API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const SUGGESTED_TOPICS = [
    'Visita al Dentista',
    'Paseo a la Plaza',
    'Cumpleaños en el Colegio',
    'Corte de Pelo',
    'Viaje en Auto',
    'Guardar Juguetes'
  ];

  const completedCount = (currentRoutine?.items || []).filter(i => i.done).length;
  const totalItems = currentRoutine?.items?.length || 1;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#004ac6] text-white p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">AGENDA VISUAL Y RUTINAS</h2>
            <p className="text-xs md:text-sm text-[#dbe1ff] font-medium">
              Estructura visual paso a paso para anticipar cada actividad diaria
            </p>
          </div>
        </div>

        {/* Action: Create Routine with AI */}
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
          <span>Crear Rutina con IA</span>
        </button>
      </div>

      {/* Routine Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
        {routines.map(r => (
          <button
            key={r.id}
            onClick={() => {
              setActiveRoutineId(r.id);
              tts.speak(r.title);
            }}
            type="button"
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs md:text-sm cursor-pointer whitespace-nowrap transition-all
              ${activeRoutineId === r.id ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'}
            `}
          >
            {r.isAiGenerated && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>{r.title.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar Material 3 */}
      <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-sm md:text-base text-[#111c2d] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Progreso: {completedCount} de {totalItems} tareas
          </span>
          <div className="flex items-center gap-2">
            <span className="font-black text-[#004ac6] text-lg">{progressPercent}%</span>
            
            <button
              onClick={handleResetRoutine}
              type="button"
              title="Reiniciar rutina"
              className="p-2 bg-[#e7eeff] hover:bg-[#d8e3fb] text-[#004ac6] rounded-xl cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {currentRoutine?.isAiGenerated && (
              <button
                onClick={handleDeleteCurrentRoutine}
                type="button"
                title="Eliminar rutina creada con IA"
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full bg-[#f0f3ff] rounded-full h-4 overflow-hidden border border-[#c3c6d7]">
          <div
            className="bg-[#004ac6] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List with Real ARASAAC Pictograms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {(currentRoutine?.items || []).map((step) => {
          return (
            <div
              key={step.id}
              onClick={() => handleToggleStep(step.id)}
              style={{
                boxShadow: step.done ? '0 1.5px 0 #10b981' : '0 4.5px 0 #c3c6d7'
              }}
              className={`
                picto-card p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 cursor-pointer select-none transition-all duration-75
                ${step.done 
                  ? 'bg-[#d1fae5] border-[#10b981] text-[#065f46] translate-y-1' 
                  : 'bg-white border-[#c3c6d7] text-[#111c2d] hover:border-[#004ac6] active:translate-y-[4.5px] active:shadow-none'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white p-1 border border-black/10 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <img
                    src={`https://static.arasaac.org/pictograms/${step.arasaacId}/${step.arasaacId}_300.png`}
                    alt={step.text}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#737686] block">{step.time}</span>
                  <span className={`text-sm md:text-base font-black ${step.done ? 'line-through opacity-70' : ''}`}>
                    {step.text}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                {step.done ? (
                  <CheckCircle2 className="w-7 h-7 text-[#10b981]" />
                ) : (
                  <Circle className="w-7 h-7 text-[#c3c6d7]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Crear Rutina con IA */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-lg w-full p-5 md:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base md:text-lg">
                    Crear Rutina Visual con IA
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Genera una secuencia paso a paso con pictogramas ARASAAC
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

            <form onSubmit={handleGenerateAiRoutine} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  ¿Qué actividad o rutina deseas estructurar?
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => {
                    setAiTopic(e.target.value);
                    setAiError('');
                  }}
                  placeholder="Ej: Visita al Dentista, Ir a la Plaza, Hora del Baño..."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm focus:border-[#004ac6] focus:outline-none focus:ring-4 focus:ring-blue-50"
                  autoFocus
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Sugerencias rápidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TOPICS.map((top) => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => {
                        setAiTopic(top);
                        setAiError('');
                        tts.playChime('pop');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                    >
                      {top}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of steps */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Cantidad de pasos:
                </label>
                <div className="flex gap-2">
                  {[4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAiStepsCount(num)}
                      className={`flex-1 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                        aiStepsCount === num ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {num} Pasos
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
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !aiTopic.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generando con IA...' : 'Generar Rutina'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
