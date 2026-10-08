import React, { useRef } from 'react';
import { Sliders, Volume2, Eye, LayoutGrid, Type, Clock, Smartphone, Monitor, RotateCcw, Check, Sparkles, Download, Upload, ShieldCheck, Compass } from 'lucide-react';
import { tts, VOICE_OPTIONS } from '../services/tts';
import { analytics } from '../services/analytics';
import confetti from 'canvas-confetti';

export default function AccessibilitySettingsView({
  gridSize,
  setGridSize,
  fontFamily,
  setFontFamily,
  textCase,
  setTextCase,
  dwellTime,
  setDwellTime,
  hapticFeedback,
  setHapticFeedback,
  voiceProfile,
  setVoiceProfile,
  highContrast,
  setHighContrast,
  speakOnTap,
  setSpeakOnTap,
  orientationMode = 'auto',
  setOrientationMode = () => {},
  guidedMode = true,
  setGuidedMode = () => {}
}) {
  const gridOptions = [
    { id: '2x2', label: '2 x 2 (4 Celdas)', desc: 'Motricidad inicial o baja visión' },
    { id: '3x3', label: '3 x 3 (9 Celdas)', desc: 'Intermedio' },
    { id: '4x4', label: '4 x 4 (16 Celdas)', desc: 'Estándar Stitch recomendado' },
    { id: '5x5', label: '5 x 5 (25 Celdas)', desc: 'Vocabulario extendido' },
    { id: '6x6', label: '6 x 6 (36 Celdas)', desc: 'Alta densidad para tablet' }
  ];

  const fontOptions = [
    { id: 'atkinson', label: 'Atkinson Hyperlegible Next', desc: 'Diseñada por el Braille Institute para máxima diferenciación' },
    { id: 'dyslexic', label: 'Letra Amigable / Dislexia', desc: 'Bases reforzadas que evitan rotaciones de letras' },
    { id: 'sans', label: 'Material 3 Sans', desc: 'Tipografía moderna limpia y directa' }
  ];

  const voiceProfiles = VOICE_OPTIONS;

  const dwellOptions = [
    { id: 0, label: '0s (Instantáneo)' },
    { id: 0.3, label: '0.3 segundos' },
    { id: 0.6, label: '0.6 segundos' },
    { id: 1.0, label: '1.0 segundo' }
  ];

  const handleTestVoice = (profile) => {
    tts.setProfile(profile);
    tts.playChime('pop');
    tts.speak('Hola, soy tu voz en Danmax. Me encanta comunicarme contigo.');
  };

  const backupFileInputRef = useRef(null);

  const handleExportBackup = () => {
    try {
      const data = analytics.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danmax-perfil-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      tts.playChime('success');
      tts.speak('Copia de seguridad guardada y descargada.');
    } catch (e) {
      alert('Error al exportar el respaldo.');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        analytics.importBackup(parsed);
        tts.playChime('success');
        try {
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.3 } });
        } catch (err) {}
        tts.speak('¡Perfil y fotos restauradas con éxito!');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        alert('El archivo de respaldo no es válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner Stitch */}
      <div className="bg-[#111c2d] text-white p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Sliders className="w-7 h-7 text-[#6cf8bb]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">AJUSTES DE ACCESIBILIDAD Y SISTEMA</h2>
            <p className="text-xs md:text-sm text-[#c3c6d7] font-medium">
              Configuraciones exactas de Stitch: Cuadrículas, voz, tipografía y tacto
            </p>
          </div>
        </div>
      </div>

      {/* 0. MODO GUÍA DE APRENDIZAJE Y MODELADO ASISTIDO (SCAFFOLDING) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-amber-300 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base md:text-lg">
                  Modo Guía de Aprendizaje (Modelado Asistido)
                </h3>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Para Iniciar
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed max-w-2xl">
                Incentiva al niño a construir frases coherentes resaltando paso a paso las tarjetas del vocabulario:
                <strong className="text-slate-900"> 1. Sujeto ("YO") ➔ 2. Deseo ("QUIERO") ➔ 3. Objeto/Comida ("CHOCOLATE") ➔ 4. Hablar ("HABLAR")</strong>.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border-2 border-amber-300 shadow-xs cursor-pointer self-end sm:self-auto shrink-0 hover:bg-amber-50 transition-all">
            <input
              type="checkbox"
              checked={guidedMode}
              onChange={(e) => {
                setGuidedMode(e.target.checked);
                tts.playChime('pop');
              }}
              className="w-5 h-5 accent-amber-500 cursor-pointer"
            />
            <span className="font-black text-sm text-slate-900">
              {guidedMode ? 'Guía Activada' : 'Guía Desactivada'}
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. SÍNTESIS DE VOZ Y PERFILES */}
        <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="font-black text-[#111c2d] text-base flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#004ac6]" />
            <span>Perfiles de Síntesis de Voz (TTS)</span>
          </h3>

          <div className="space-y-2.5">
            {voiceProfiles.map((vp) => (
              <button
                key={vp.id}
                type="button"
                onClick={() => {
                  setVoiceProfile(vp.id);
                  handleTestVoice(vp.id);
                }}
                className={`
                  w-full p-3.5 rounded-2xl border-2 text-left flex items-center justify-between cursor-pointer transition-all duration-75
                  ${voiceProfile === vp.id 
                    ? 'border-[#004ac6] bg-[#dbe1ff] text-[#00174b] ring-2 ring-[#004ac6]' 
                    : 'border-[#c3c6d7] bg-white hover:bg-slate-50'}
                `}
              >
                <div>
                  <span className="font-black text-sm block">{vp.label}</span>
                  <span className="text-xs opacity-75">{vp.desc}</span>
                </div>
                {voiceProfile === vp.id && <Check className="w-5 h-5 text-[#004ac6] flex-shrink-0" />}
              </button>
            ))}
          </div>

          <label className="flex items-center justify-between p-3.5 bg-[#f0f3ff] rounded-2xl border border-[#c3c6d7] cursor-pointer mt-3">
            <div>
              <span className="font-black text-xs md:text-sm text-[#111c2d] block">Hablar al tocar la tarjeta</span>
              <span className="text-[11px] text-[#737686]">Pronuncia el sonido inmediatamente al pulsar</span>
            </div>
            <input
              type="checkbox"
              checked={speakOnTap}
              onChange={(e) => {
                setSpeakOnTap(e.target.checked);
                tts.playChime('pop');
              }}
              className="w-5 h-5 accent-[#004ac6] cursor-pointer"
            />
          </label>
        </div>

        {/* 2. TAMAÑO DE CUADRÍCULA (GRID SIZE) */}
        <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="font-black text-[#111c2d] text-base flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#006c49]" />
            <span>Tamaño de la Cuadrícula (AAC Grid Canvas)</span>
          </h3>

          <div className="space-y-2">
            {gridOptions.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGridSize(g.id);
                  tts.playChime('pop');
                }}
                className={`
                  w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between cursor-pointer transition-all duration-75
                  ${gridSize === g.id 
                    ? 'border-[#006c49] bg-[#d1fae5] text-[#002113] ring-2 ring-[#006c49]' 
                    : 'border-[#c3c6d7] bg-white hover:bg-slate-50'}
                `}
              >
                <div>
                  <span className="font-black text-xs md:text-sm block">{g.label}</span>
                  <span className="text-[11px] opacity-75">{g.desc}</span>
                </div>
                {gridSize === g.id && <Check className="w-5 h-5 text-[#006c49] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* 3. TIPOGRAFÍA Y FORMATO DE TEXTO */}
        <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="font-black text-[#111c2d] text-base flex items-center gap-2">
            <Type className="w-5 h-5 text-[#784b00]" />
            <span>Tipografía Hiperlegible</span>
          </h3>

          <div className="space-y-2">
            {fontOptions.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFontFamily(f.id);
                  tts.playChime('pop');
                }}
                className={`
                  w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between cursor-pointer transition-all duration-75
                  ${fontFamily === f.id 
                    ? 'border-[#784b00] bg-[#ffddb8] text-[#2a1700] ring-2 ring-[#784b00]' 
                    : 'border-[#c3c6d7] bg-white hover:bg-slate-50'}
                `}
              >
                <div>
                  <span className="font-black text-xs md:text-sm block">{f.label}</span>
                  <span className="text-[11px] opacity-75">{f.desc}</span>
                </div>
                {fontFamily === f.id && <Check className="w-5 h-5 text-[#784b00] flex-shrink-0" />}
              </button>
            ))}
          </div>

          {/* MAYÚSCULAS vs Minúsculas */}
          <div className="pt-2">
            <span className="text-xs font-black text-[#737686] block mb-1.5 uppercase">
              Formato de Texto en Rótulos:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTextCase('uppercase');
                  tts.playChime('pop');
                }}
                className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer ${textCase === 'uppercase' ? 'border-[#004ac6] bg-[#dbe1ff] text-[#00174b]' : 'border-[#c3c6d7]'}`}
              >
                MAYÚSCULAS
              </button>
              <button
                type="button"
                onClick={() => {
                  setTextCase('capitalize');
                  tts.playChime('pop');
                }}
                className={`p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer ${textCase === 'capitalize' ? 'border-[#004ac6] bg-[#dbe1ff] text-[#00174b]' : 'border-[#c3c6d7]'}`}
              >
                Minúsculas
              </button>
            </div>
          </div>
        </div>

        {/* 4. TIEMPO DE PULSACIÓN Y RETORNO HÁPTICO */}
        <div className="bg-white border-2 border-[#c3c6d7] rounded-3xl p-5 shadow-xs space-y-4">
          <h3 className="font-black text-[#111c2d] text-base flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#ba1a1a]" />
            <span>Retorno Háptico y Tiempo de Toque</span>
          </h3>

          <div>
            <span className="text-xs font-black text-[#737686] block mb-1.5 uppercase">
              Tiempo de Pulsación Sostenida (Evita toques accidentales):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {dwellOptions.map((dw) => (
                <button
                  key={dw.id}
                  type="button"
                  onClick={() => {
                    setDwellTime(dw.id);
                    tts.playChime('pop');
                  }}
                  className={`
                    p-2.5 rounded-xl border-2 font-black text-xs cursor-pointer transition-all
                    ${dwellTime === dw.id 
                      ? 'border-[#ba1a1a] bg-[#ffdad6] text-[#93000a] ring-2 ring-[#ba1a1a]' 
                      : 'border-[#c3c6d7] bg-white'}
                  `}
                >
                  {dw.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 bg-[#f0f3ff] rounded-2xl border border-[#c3c6d7] cursor-pointer">
            <div>
              <span className="font-black text-xs md:text-sm text-[#111c2d] block">Retorno Háptico (Vibración)</span>
              <span className="text-[11px] text-[#737686]">Vibración táctil física en la tablet o teléfono al pulsar</span>
            </div>
            <input
              type="checkbox"
              checked={hapticFeedback}
              onChange={(e) => {
                setHapticFeedback(e.target.checked);
                tts.hapticEnabled = e.target.checked;
                tts.playChime('pop');
              }}
              className="w-5 h-5 accent-[#004ac6] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-[#f0f3ff] rounded-2xl border border-[#c3c6d7] cursor-pointer">
            <div>
              <span className="font-black text-xs md:text-sm text-[#111c2d] block">Modo Alto Contraste</span>
              <span className="text-[11px] text-[#737686]">Contornos negros reforzados para máxima discriminación</span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => {
                setHighContrast(e.target.checked);
                tts.playChime('pop');
              }}
              className="w-5 h-5 accent-[#004ac6] cursor-pointer"
            />
          </label>
        </div>

        {/* 5. ORIENTACIÓN DE PANTALLA (MODO APP INSTALADA Y WEB) */}
        <div className="md:col-span-2 bg-white border-2 border-[#004ac6] rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e7eeff] text-[#004ac6] rounded-2xl flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-[#111c2d] text-base flex items-center gap-2">
                  <span>Orientación de Pantalla (Modo App Instalada y Web)</span>
                  <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    Vertical y Horizontal
                  </span>
                </h3>
                <p className="text-xs text-[#737686]">
                  Permite usar el comunicador tanto de pie (vertical / teléfono) como apaisado (horizontal / tablet o atril).
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* 1. Auto */}
            <button
              type="button"
              onClick={() => {
                setOrientationMode('auto');
                tts.playChime('pop');
              }}
              className={`
                p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between space-y-2
                ${orientationMode === 'auto'
                  ? 'border-[#004ac6] bg-[#dbe1ff]/40 ring-2 ring-[#004ac6]'
                  : 'border-[#c3c6d7] bg-white hover:bg-slate-50'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <RotateCcw className="w-5 h-5" />
                </span>
                {orientationMode === 'auto' && <Check className="w-5 h-5 text-[#004ac6]" />}
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 block">🔄 Automático</span>
                <span className="text-[11px] text-slate-500 font-medium">Gira con el sensor físico del teléfono o tablet</span>
              </div>
            </button>

            {/* 2. Vertical */}
            <button
              type="button"
              onClick={() => {
                setOrientationMode('portrait');
                tts.playChime('pop');
              }}
              className={`
                p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between space-y-2
                ${orientationMode === 'portrait'
                  ? 'border-[#004ac6] bg-[#dbe1ff]/40 ring-2 ring-[#004ac6]'
                  : 'border-[#c3c6d7] bg-white hover:bg-slate-50'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Smartphone className="w-5 h-5" />
                </span>
                {orientationMode === 'portrait' && <Check className="w-5 h-5 text-[#004ac6]" />}
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 block">📱 Modo Vertical</span>
                <span className="text-[11px] text-slate-500 font-medium">Fijado en formato vertical (ideal teléfonos)</span>
              </div>
            </button>

            {/* 3. Horizontal */}
            <button
              type="button"
              onClick={() => {
                setOrientationMode('landscape');
                tts.playChime('pop');
              }}
              className={`
                p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between space-y-2
                ${orientationMode === 'landscape'
                  ? 'border-[#004ac6] bg-[#dbe1ff]/40 ring-2 ring-[#004ac6]'
                  : 'border-[#c3c6d7] bg-white hover:bg-slate-50'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-violet-50 text-violet-700">
                  <Monitor className="w-5 h-5" />
                </span>
                {orientationMode === 'landscape' && <Check className="w-5 h-5 text-[#004ac6]" />}
              </div>
              <div>
                <span className="font-black text-sm text-slate-900 block">💻 Modo Horizontal</span>
                <span className="text-[11px] text-slate-500 font-medium">Fijado en formato panorámico (ideal tablets y atriles)</span>
              </div>
            </button>
          </div>
        </div>

        {/* 6. RESPALDO Y TRANSFERENCIA DE PERFIL (TELÉFONO ⇄ TABLET) */}
        <div className="md:col-span-2 bg-[#111c2d] text-white rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#6cf8bb]" />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg">COPIA DE SEGURIDAD Y TRANSFERENCIA ENTRE DISPOSITIVOS</h3>
              <p className="text-xs text-[#c3c6d7]">
                Pasa tus fotos reales de familia, productos (como Chocapic) y voces configuradas desde este teléfono a una tablet o viceversa en 1 segundo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Export Button */}
            <button
              onClick={handleExportBackup}
              type="button"
              style={{ boxShadow: '0 4px 0 #003ea8' }}
              className="p-4 bg-[#004ac6] hover:bg-[#003ea8] rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-1 active:shadow-none"
            >
              <Download className="w-5 h-5 text-[#6cf8bb]" />
              <span>DESCARGAR RESPALDO COMPLETO (.JSON)</span>
            </button>

            {/* Import Button */}
            <button
              onClick={() => backupFileInputRef.current?.click()}
              type="button"
              style={{ boxShadow: '0 4px 0 #059669' }}
              className="p-4 bg-[#10b981] hover:bg-[#059669] rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-1 active:shadow-none"
            >
              <Upload className="w-5 h-5 text-white" />
              <span>RESTAURAR RESPALDO EN ESTE EQUIPO</span>
            </button>

            <input
              ref={backupFileInputRef}
              type="file"
              accept=".json,.danmax"
              className="hidden"
              onChange={handleImportBackup}
            />
          </div>
        </div>
      </div>
      <div className="h-16 md:h-24" aria-hidden="true" />
    </div>
  );
}
