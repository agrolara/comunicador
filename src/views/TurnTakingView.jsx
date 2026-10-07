import React, { useState, useEffect } from 'react';
import { Users2, UserCheck, Clock, Play, Pause, RotateCcw, Gamepad2 } from 'lucide-react';
import { PLAY_TURNS_PICTOGRAMS } from '../data/pictograms';
import PictoCard from '../components/PictoCard';
import { tts } from '../services/tts';
import confetti from 'canvas-confetti';

export default function TurnTakingView({ onAddToSentence, cardSize, highContrast }) {
  const [currentTurn, setCurrentTurn] = useState('mine');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      tts.playChime('success');
      const nextPerson = currentTurn === 'mine' ? 'tu compañero' : 'ti';
      tts.speak(`¡Tiempo terminado! Ahora es el turno para ${nextPerson}.`);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.3 } });
      } catch (e) {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentTurn]);

  const handleSelectTurn = (turn) => {
    tts.playChime('pop');
    setCurrentTurn(turn);
    if (turn === 'mine') {
      tts.speak('¡Es mi turno!');
    } else {
      tts.speak('¡Es tu turno!');
    }
  };

  const handleSetDuration = (secs) => {
    tts.playChime('pop');
    setTotalSeconds(secs);
    setTimerSeconds(secs);
    setIsTimerRunning(false);
  };

  const handleToggleTimer = () => {
    tts.playChime('pop');
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      tts.speak(`Comenzando tiempo de ${Math.floor(timerSeconds / 60)} minutos`);
    }
  };

  const handleResetTimer = () => {
    tts.playChime('pop');
    setIsTimerRunning(false);
    setTimerSeconds(totalSeconds);
  };

  const progressPercent = Math.round(((totalSeconds - timerSeconds) / totalSeconds) * 100);

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner */}
      <div className="bg-[#784b00] text-white p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Users2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">JUEGO Y TOMA DE TURNOS</h2>
            <p className="text-xs md:text-sm text-[#ffeedd] font-medium">
              Estructura visual para compartir, esperar y alternar turnos
            </p>
          </div>
        </div>
      </div>

      {/* Main 3D Chicklet Turn Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mi Turno */}
        <button
          onClick={() => handleSelectTurn('mine')}
          type="button"
          style={{
            boxShadow: currentTurn === 'mine' ? '0 5px 0 #003ea8' : '0 4.5px 0 #c3c6d7'
          }}
          className={`
            p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all duration-75 active:translate-y-[5px] active:shadow-none
            ${currentTurn === 'mine' 
              ? 'bg-[#004ac6] border-[#003ea8] text-white shadow-md' 
              : 'bg-white border-[#c3c6d7] text-[#111c2d] hover:border-[#004ac6]'}
          `}
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${currentTurn === 'mine' ? 'bg-white/20' : 'bg-[#e7eeff] text-[#004ac6]'}`}>
            <UserCheck className="w-12 h-12" />
          </div>
          <span className="text-2xl md:text-3xl font-black tracking-wide">¡MI TURNO!</span>
          <span className="text-xs font-bold opacity-90">Ahora me toca a mí jugar</span>
        </button>

        {/* Tu Turno */}
        <button
          onClick={() => handleSelectTurn('theirs')}
          type="button"
          style={{
            boxShadow: currentTurn === 'theirs' ? '0 5px 0 #005236' : '0 4.5px 0 #c3c6d7'
          }}
          className={`
            p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all duration-75 active:translate-y-[5px] active:shadow-none
            ${currentTurn === 'theirs' 
              ? 'bg-[#006c49] border-[#005236] text-white shadow-md' 
              : 'bg-white border-[#c3c6d7] text-[#111c2d] hover:border-[#006c49]'}
          `}
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${currentTurn === 'theirs' ? 'bg-white/20' : 'bg-[#d1fae5] text-[#006c49]'}`}>
            <Users2 className="w-12 h-12" />
          </div>
          <span className="text-2xl md:text-3xl font-black tracking-wide">¡TU TURNO!</span>
          <span className="text-xs font-bold opacity-90">Te toca jugar a ti</span>
        </button>
      </div>

      {/* Visual Countdown Timer */}
      <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs flex flex-col items-center text-center">
        <h3 className="font-black text-[#111c2d] text-base mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#784b00]" />
          <span>Temporizador de Espera Visual</span>
        </h3>

        <div className="text-4xl md:text-5xl font-black text-[#111c2d] tracking-wider my-2">
          {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
        </div>

        <div className="w-full max-w-md bg-[#f0f3ff] rounded-full h-4 overflow-hidden border border-[#c3c6d7] my-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${currentTurn === 'mine' ? 'bg-[#004ac6]' : 'bg-[#006c49]'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Durations */}
        <div className="flex items-center gap-2 my-2 flex-wrap justify-center">
          {[30, 60, 120, 180].map(s => (
            <button
              key={s}
              onClick={() => handleSetDuration(s)}
              type="button"
              className={`
                px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all
                ${totalSeconds === s ? 'bg-[#784b00] text-white' : 'bg-[#f0f3ff] text-[#434655] hover:bg-slate-200'}
              `}
            >
              {s < 60 ? `${s}s` : `${s / 60} min`}
            </button>
          ))}
        </div>

        {/* Timer Action Buttons */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleToggleTimer}
            type="button"
            style={{ boxShadow: '0 4.5px 0 #653e00' }}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#784b00] hover:bg-[#653e00] text-white rounded-2xl font-black text-base cursor-pointer active:translate-y-[4.5px] active:shadow-none transition-all duration-75"
          >
            {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isTimerRunning ? 'Pausar' : 'Iniciar Tiempo'}</span>
          </button>

          <button
            onClick={handleResetTimer}
            type="button"
            className="p-3.5 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#434655] rounded-2xl cursor-pointer transition-all"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Toys & Play Activities */}
      <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs">
        <h3 className="font-black text-[#111c2d] text-base mb-3 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-[#784b00]" />
          <span>Actividades y Juguetes</span>
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {PLAY_TURNS_PICTOGRAMS.map(item => (
            <PictoCard
              key={item.id}
              item={item}
              onSelect={onAddToSentence}
              size={cardSize}
              highContrast={highContrast}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
