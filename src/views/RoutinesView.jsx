import React, { useState } from 'react';
import { DEFAULT_ROUTINES } from '../data/pictograms';
import { CalendarCheck2, CheckCircle2, Circle, RotateCcw, Sparkles } from 'lucide-react';
import { tts } from '../services/tts';
import confetti from 'canvas-confetti';

export default function RoutinesView() {
  const [routines, setRoutines] = useState(DEFAULT_ROUTINES);
  const [activeRoutineId, setActiveRoutineId] = useState('r-1');

  const currentRoutine = routines.find(r => r.id === activeRoutineId) || routines[0];

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

  const completedCount = currentRoutine.items.filter(i => i.done).length;
  const progressPercent = Math.round((completedCount / currentRoutine.items.length) * 100);

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner Stitch */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#004ac6] text-white p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <CalendarCheck2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">AGENDA VISUAL Y RUTINAS</h2>
            <p className="text-xs md:text-sm text-[#dbe1ff] font-medium">
              Estructura visual paso a paso para anticipar cada actividad
            </p>
          </div>
        </div>

        {/* Routine selector */}
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl w-full sm:w-auto justify-center">
          {routines.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRoutineId(r.id);
                tts.speak(r.title);
              }}
              type="button"
              className={`
                px-4 py-2 rounded-xl font-black text-xs md:text-sm cursor-pointer transition-all
                ${activeRoutineId === r.id ? 'bg-white text-[#004ac6] shadow-sm' : 'text-white hover:bg-white/10'}
              `}
            >
              {r.title.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar Material 3 */}
      <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-sm md:text-base text-[#111c2d] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Progreso: {completedCount} de {currentRoutine.items.length} tareas
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
        {currentRoutine.items.map((step) => {
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
    </div>
  );
}
