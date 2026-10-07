import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Award,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Heart,
  Target,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Plus,
  Minus,
  HelpCircle,
  X
} from 'lucide-react';
import { analytics } from '../services/analytics';
import { tts } from '../services/tts';

export default function TherapistDashboardView() {
  const [stats, setStats] = useState(analytics.getStats());
  const [copiedReport, setCopiedReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(5);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Prompting Hierarchy Level state
  const [promptLevel, setPromptLevel] = useState(() => {
    return localStorage.getItem('danmax_current_prompt_level') || '3';
  });

  // SMART Therapeutic Goals state
  const [smartGoals, setSmartGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('danmax_smart_goals');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 1, text: 'Expresar rechazo funcional ("NO" o "PARAR") antes de desregulación', target: 5, current: 4, completed: false },
      { id: 2, text: 'Combinar 2 palabras en barra de frases (Sujeto + Acción o Acción + Objeto)', target: 10, current: 7, completed: false },
      { id: 3, text: 'Identificar zona anatómica de dolor en tablero corporal', target: 3, current: 3, completed: true },
      { id: 4, text: 'Iniciar saludo o despedida ("HOLA" / "CHAO") en transiciones escolares', target: 5, current: 2, completed: false }
    ];
  });

  useEffect(() => {
    setStats(analytics.getStats());
  }, []);

  const handlePromptLevelChange = (level) => {
    setPromptLevel(level);
    localStorage.setItem('danmax_current_prompt_level', level);
    tts.playChime('pop');
  };

  const handleToggleGoal = (id) => {
    const updated = smartGoals.map(g => {
      if (g.id === id) {
        const nextComp = !g.completed;
        return { ...g, completed: nextComp, current: nextComp ? g.target : Math.max(0, g.target - 1) };
      }
      return g;
    });
    setSmartGoals(updated);
    localStorage.setItem('danmax_smart_goals', JSON.stringify(updated));
    tts.playChime('success');
  };

  const handleIncrementGoal = (id, delta, e) => {
    e.stopPropagation();
    const updated = smartGoals.map(g => {
      if (g.id === id) {
        const newCount = Math.max(0, g.current + delta);
        const isDone = newCount >= g.target;
        return { ...g, current: newCount, completed: isDone };
      }
      return g;
    });
    setSmartGoals(updated);
    localStorage.setItem('danmax_smart_goals', JSON.stringify(updated));
    tts.playChime('pop');
  };

  const handleAddNewGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: Date.now(),
      text: newGoalText.trim(),
      target: Number(newGoalTarget) || 5,
      current: 0,
      completed: false
    };
    const updated = [...smartGoals, newGoal];
    setSmartGoals(updated);
    localStorage.setItem('danmax_smart_goals', JSON.stringify(updated));
    setNewGoalText('');
    setNewGoalTarget(5);
    setIsAddingGoal(false);
    tts.playChime('success');
  };

  const handleDeleteGoal = (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este objetivo?')) {
      const updated = smartGoals.filter(g => g.id !== id);
      setSmartGoals(updated);
      localStorage.setItem('danmax_smart_goals', JSON.stringify(updated));
    }
  };

  const handleExportJSON = () => {
    tts.playChime('pop');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reporte_comunicacion_caa_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    tts.speak('Informe de datos descargado');
  };

  const generateClinicalReportText = () => {
    const dateStr = new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
    const promptNames = {
      '1': 'Nivel 1: Totalmente Espontáneo / Autónomo (Sin apoyo del adulto)',
      '2': 'Nivel 2: Pausa Expectante (10-15s con mirada cálida)',
      '3': 'Nivel 3: Apoyo Visual / Gesto (Señalar pictograma en pantalla)',
      '4': 'Nivel 4: Apoyo Verbal Indirecto ("¿Qué necesitas decirme?")',
      '5': 'Nivel 5: Guía Física Parcial (Mano bajo mano)'
    };

    const pragmaticTotal = (stats.pragmatic?.peticion || 0) + (stats.pragmatic?.rechazo || 0) + (stats.pragmatic?.emocion || 0) + (stats.pragmatic?.social || 0) + (stats.pragmatic?.urgencia || 0) || 1;

    return `INFORME EVOLUTIVO DE COMUNICACIÓN AUMENTATIVA Y ALTERNATIVA (CAA)
Aplicación: "Esta es mi voz sin límites"
Fecha: ${dateStr}
Usuario: Dante
Fundación: Fundación Sin Barreras

1. RESUMEN CUANTITATIVO DE USO:
• Total de palabras expresadas: ${stats.totalWords}
• Total de oraciones estructuradas: ${stats.totalSentences}
• Amplitud de vocabulario activo: ${stats.uniqueWords} palabras distintas
• Longitud Media de Enunciado (LME / MLU): ${stats.mlu} palabras/frase

2. DISTRIBUCIÓN POR FUNCIONES PRAGMÁTICAS:
• Peticiones (Quiero, Comer, Más): ${Math.round(((stats.pragmatic?.peticion || 0) / pragmaticTotal) * 100)}%
• Rechazo y Negación (No, Parar): ${Math.round(((stats.pragmatic?.rechazo || 0) / pragmaticTotal) * 100)}%
• Emociones y Regulación (Feliz, Calma): ${Math.round(((stats.pragmatic?.emocion || 0) / pragmaticTotal) * 100)}%
• Social y Saludos (Hola, Chao, Gracias): ${Math.round(((stats.pragmatic?.social || 0) / pragmaticTotal) * 100)}%
• Dolor y Urgencias Físicas: ${Math.round(((stats.pragmatic?.urgencia || 0) / pragmaticTotal) * 100)}%

3. NIVEL DE ASISTENCIA PREDOMINANTE:
${promptNames[promptLevel] || 'No definido'}

4. PALABRAS DE MAYOR PREVALENCIA:
${stats.topWords.map((w, idx) => `${idx + 1}. ${w.word} (${w.count} veces)`).join('\n')}

5. RECOMENDACIONES CLÍNICAS:
• Continuar modelado asistido (ALS) en mesa y actividades de la vida diaria (AVD).
• Fomentar la desvanescencia de apoyos motores hacia la pausa expectante de 10 segundos.
• Reforzar el uso del tablero de urgencias corporales ante indicadores no verbales de malestar físico.
• Compartir esta ficha con el equipo PIE escolar y fonoaudiológico.`;
  };

  const handleCopyReportText = () => {
    const text = generateClinicalReportText();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedReport(true);
      tts.playChime('success');
      setTimeout(() => setCopiedReport(false), 3000);
    });
  };

  const handleClear = () => {
    if (window.confirm('¿Seguro que deseas reiniciar las métricas de uso registradas?')) {
      analytics.clearHistory();
      setStats(analytics.getStats());
      tts.speak('Métricas reiniciadas');
    }
  };

  const pragmaticTotal = (stats.pragmatic?.peticion || 0) + (stats.pragmatic?.rechazo || 0) + (stats.pragmatic?.emocion || 0) + (stats.pragmatic?.social || 0) + (stats.pragmatic?.urgencia || 0) || 1;

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white p-5 md:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">Panel Clínico y Métricas de Progreso</h2>
            <p className="text-xs md:text-sm text-teal-100 font-medium">
              Evaluación fonoaudiológica, longitud de enunciado (LME), funciones pragmáticas e informes escolares PIE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            onClick={() => setShowExplainerModal(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-300 hover:bg-amber-200 text-amber-950 rounded-2xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-950" />
            <span>¿Cómo funciona este panel?</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-teal-900 rounded-2xl font-black text-xs cursor-pointer shadow-xs hover:bg-teal-50 active:scale-95 transition-all"
          >
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Generar Informe Clínico</span>
          </button>
          <button
            onClick={handleExportJSON}
            type="button"
            title="Exportar archivo JSON"
            className="p-2.5 bg-teal-800/40 hover:bg-teal-800 text-white rounded-2xl cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            type="button"
            title="Reiniciar métricas"
            className="p-2.5 bg-teal-800/40 hover:bg-rose-800/60 text-white rounded-2xl cursor-pointer transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards: Key Communicative Metrics including MLU */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Words */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Palabras Expresadas</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.totalWords}</div>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">Total pulsaciones</span>
        </div>

        {/* Total Sentences */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Frases Formadas</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.totalSentences}</div>
          <span className="text-[10px] text-blue-600 font-bold block mt-1">En la barra superior</span>
        </div>

        {/* Unique Vocabulary */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">Vocabulario Activo</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-800">{stats.uniqueWords}</div>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">Palabras distintas</span>
        </div>

        {/* Clinical Gold Standard: Mean Length of Utterance (LME / MLU) */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-3xl p-4 md:p-5 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider">LME / MLU Clínico</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-900">{stats.mlu}</div>
          <span className="text-[10px] text-indigo-700 font-bold block mt-1">Palabras prom. por frase</span>
        </div>
      </div>

      {/* Row 2: Pragmatic Communicative Functions & Prompting Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pragmatic Functions Breakdown (Clinical SLP) */}
        <div className="lg:col-span-6 bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                <span>Distribución por Funciones Pragmáticas</span>
              </h3>
              <span className="text-[10px] font-black uppercase bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
                Automático en vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              ¿Para qué usa el lenguaje? Clasifica automáticamente cada toque de Dante para asegurar que no solo pida cosas, sino que también rechace, salude y exprese dolor.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Petición */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1">
                <span>1. Petición Instrumental (Quiero, Comer, Más)</span>
                <span className="text-orange-600">
                  {Math.round(((stats.pragmatic?.peticion || 0) / pragmaticTotal) * 100)}% ({stats.pragmatic?.peticion || 0})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((stats.pragmatic?.peticion || 0) / pragmaticTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Rechazo */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1">
                <span>2. Rechazo y Negación Funcional (No, Parar, Basta)</span>
                <span className="text-rose-600">
                  {Math.round(((stats.pragmatic?.rechazo || 0) / pragmaticTotal) * 100)}% ({stats.pragmatic?.rechazo || 0})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((stats.pragmatic?.rechazo || 0) / pragmaticTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Social */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1">
                <span>3. Social y Cortesía (Hola, Chao, Gracias, Por favor)</span>
                <span className="text-pink-600">
                  {Math.round(((stats.pragmatic?.social || 0) / pragmaticTotal) * 100)}% ({stats.pragmatic?.social || 0})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((stats.pragmatic?.social || 0) / pragmaticTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Emoción */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1">
                <span>4. Emociones y Regulación (Feliz, Calma, Triste)</span>
                <span className="text-blue-600">
                  {Math.round(((stats.pragmatic?.emocion || 0) / pragmaticTotal) * 100)}% ({stats.pragmatic?.emocion || 0})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((stats.pragmatic?.emocion || 0) / pragmaticTotal) * 100)}%` }}
                />
              </div>
            </div>

            {/* Dolor y Urgencia */}
            <div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1">
                <span>5. Dolor y Urgencias Físicas (Baño, Duele cabeza)</span>
                <span className="text-red-700">
                  {Math.round(((stats.pragmatic?.urgencia || 0) / pragmaticTotal) * 100)}% ({stats.pragmatic?.urgencia || 0})
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(((stats.pragmatic?.urgencia || 0) / pragmaticTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
            💡 <strong>Tip Clínico:</strong> En fonoaudiología se busca que el niño tenga un lenguaje equilibrado. Si "Petición" es más del 80%, modela más palabras de "Rechazo" (NO) y "Emoción" (ME GUSTA).
          </div>
        </div>

        {/* Prompting Hierarchy Selector (Nivel de Asistencia) */}
        <div className="lg:col-span-6 bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Jerarquía de Apoyos (Nivel Actual de Asistencia)</span>
              </h3>
              <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Selección clínica
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              ¿Cuánta ayuda necesita Dante? Toca el nivel observado hoy. La meta es desvanecer el apoyo hasta alcanzar el Nivel 1 (Totalmente Autónomo).
            </p>
          </div>

          <div className="space-y-2">
            {[
              { id: '1', title: 'Nivel 1: Totalmente Espontáneo / Autónomo', desc: 'Dante toma el dispositivo por iniciativa propia sin que nadie se lo pida ni le señale nada.', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
              { id: '2', title: 'Nivel 2: Pausa Expectante (10-15s)', desc: 'El adulto mira con cariño y espera 10 a 15 segundos en silencio, sin tocar la tablet.', color: 'border-blue-300 bg-blue-50 text-blue-900' },
              { id: '3', title: 'Nivel 3: Apoyo Visual / Gesto', desc: 'El adulto modela o apunta con su dedo hacia el pictograma en la pantalla para orientarlo.', color: 'border-amber-300 bg-amber-50 text-amber-900' },
              { id: '4', title: 'Nivel 4: Apoyo Verbal Indirecto', desc: 'El adulto pregunta de forma abierta: "¿Qué necesitas decirme?" o "¿Qué quieres?".', color: 'border-purple-300 bg-purple-50 text-purple-900' },
              { id: '5', title: 'Nivel 5: Guía Física Parcial', desc: 'Apoyo motor suave mano bajo mano guiando el brazo o dedo hacia la pantalla.', color: 'border-rose-300 bg-rose-50 text-rose-900' }
            ].map((p) => {
              const isSelected = promptLevel === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePromptLevelChange(p.id)}
                  type="button"
                  className={`w-full p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected ? `${p.color} ring-2 ring-indigo-500 font-black` : 'border-slate-100 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{p.title}</span>
                    {isSelected && <span className="text-[10px] font-black uppercase bg-white/80 px-2 py-0.5 rounded-full shadow-2xs">Nivel Guardado</span>}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5 font-medium">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: SMART Goals & Top Words */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SMART Therapeutic Goals */}
        <div className="lg:col-span-7 bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span>Objetivos Terapéuticos SMART Activos</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Metas clínicas consensuadas. Usa [+] o [-] para registrar cada logro observado en Dante.
              </p>
            </div>

            <button
              onClick={() => setIsAddingGoal(!isAddingGoal)}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-black text-xs cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingGoal ? 'Cancelar' : 'Agregar Meta'}</span>
            </button>
          </div>

          {/* Inline Form to Add New Custom Goal */}
          {isAddingGoal && (
            <form onSubmit={handleAddNewGoal} className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
              <span className="text-xs font-black text-emerald-900 block">Nueva Meta SMART para Dante:</span>
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Ej: Pedir turno diciendo MI TURNO en juegos de mesa..."
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <span>Meta de observaciones:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-14 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-center font-black"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {smartGoals.map((goal) => (
              <div
                key={goal.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 select-none ${
                  goal.completed ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-[#f8faff] border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleGoal(goal.id)}
                  title="Marcar como logrado"
                  className="pt-0.5 cursor-pointer"
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500 shrink-0" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-xs font-black leading-snug flex-1 ${goal.completed ? 'line-through opacity-70' : ''}`}>
                      {goal.text}
                    </span>

                    {/* Interactive Count Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleIncrementGoal(goal.id, -1, e)}
                        title="Restar 1 observación"
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600 cursor-pointer active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 min-w-14 text-center">
                        {goal.completed ? '¡Logrado!' : `${goal.current}/${goal.target}`}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleIncrementGoal(goal.id, 1, e)}
                        title="Sumar 1 observación lograda"
                        className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-black text-xs cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteGoal(goal.id, e)}
                        title="Eliminar meta"
                        className="p-1 text-slate-300 hover:text-red-500 rounded-md cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${goal.completed ? 'bg-emerald-500' : 'bg-teal-500'}`}
                      style={{ width: `${Math.min(100, Math.round((goal.current / goal.target) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Communicated Words */}
        <div className="lg:col-span-5 bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-800 text-base">
              Palabras Más Frecuentes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Vocabulario con mayor índice de motivación o necesidad
            </p>
          </div>

          {stats.topWords.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aún no hay suficientes registros de palabras.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {stats.topWords.map((item, idx) => {
                const maxCount = stats.topWords[0]?.count || 1;
                const widthPercent = Math.round((item.count / maxCount) * 100);

                return (
                  <div key={item.word} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700">
                      <span>{idx + 1}. {item.word}</span>
                      <span className="text-teal-700 font-black">{item.count} veces</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Educational Explainer Modal (How it works masterclass) */}
      {showExplainerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-2xl w-full p-5 md:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base md:text-lg">
                  Guía Fonoaudiológica: ¿Cómo Funciona este Panel?
                </h3>
              </div>
              <button
                onClick={() => setShowExplainerModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed pr-1">
              {/* Concept 1: Pragmatic Functions */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-1">
                <h4 className="font-black text-orange-950 text-sm">
                  1. ¿De qué manera funciona la Distribución por Funciones Pragmáticas?
                </h4>
                <p>
                  En lingüística clínica, la <strong>pragmática</strong> es el <em>propósito real</em> con el que usamos las palabras. La mayoría de los niños no verbales comienzan usando el comunicador para pedir comida ("petición instrumental"). Sin embargo, la comunicación real requiere mucho más:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 pt-1 text-orange-900 font-medium">
                  <li><strong>Petición:</strong> Pedir alimentos o juguetes (ej: QUIERO, JUGO).</li>
                  <li><strong>Rechazo:</strong> Decir "NO", "PARAR" o "BASTA" antes de una rabieta o crisis sensorial.</li>
                  <li><strong>Social:</strong> Saludar y agradecer (HOLA, CHAO, GRACIAS).</li>
                  <li><strong>Emoción:</strong> Expresar bienestar o malestar interior (FELIZ, CALMA).</li>
                  <li><strong>Dolor / Urgencia:</strong> Localizar partes del cuerpo que duelen o pedir ir al baño.</li>
                </ul>
                <p className="pt-1 text-orange-950 font-bold">
                  ✓ Cómo opera: La app calcula en tiempo real cada pictograma pulsado y te muestra las barras de porcentaje para que veas si Dante está expandiendo su comunicación hacia el afecto y la autorregulación.
                </p>
              </div>

              {/* Concept 2: SMART Goals */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                <h4 className="font-black text-emerald-950 text-sm">
                  2. ¿Cómo se evalúan los Objetivos Terapéuticos SMART Activos?
                </h4>
                <p>
                  <strong>SMART</strong> significa que las metas son <em>Específicas, Medibles, Alcanzables, Relevantes y con Tiempo definido</em>. En lugar de una meta vaga como "que Dante hable mejor", se define una conducta observable concreta (ej: <em>"Decir NO antes de frustrarse en 5 ocasiones"</em>).
                </p>
                <p className="pt-1 text-emerald-900 font-bold">
                  ✓ Cómo opera: Tú o su fonoaudióloga usan los botones <strong>[+]</strong> y <strong>[-]</strong> para registrar cada vez que observen a Dante cumplir la meta en casa o en sesión. La barra avanza automáticamente hasta alcanzar el 100% (¡Logrado!). Puedes agregar nuevas metas con el botón "Agregar Meta".
                </p>
              </div>

              {/* Concept 3: Prompting Hierarchy */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1">
                <h4 className="font-black text-indigo-950 text-sm">
                  3. ¿Cómo funcionan los Niveles de la Jerarquía de Apoyo?
                </h4>
                <p>
                  Es la escala clínica estándar para medir la <strong>autonomía</strong> de Dante. Al enseñar comunicación aumentativa, nunca forzamos al niño. Se evalúa cuánta ayuda necesita:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 pt-1 text-indigo-900 font-medium">
                  <li><strong>Nivel 5 (Guía Física):</strong> Mano bajo mano guiando el movimiento.</li>
                  <li><strong>Nivel 4 (Apoyo Verbal):</strong> Preguntar "¿Qué necesitas?".</li>
                  <li><strong>Nivel 3 (Apoyo Visual):</strong> El adulto apunta el pictograma con el dedo.</li>
                  <li><strong>Nivel 2 (Pausa Expectante):</strong> Mirada atenta y esperar 10 a 15 segundos sin hablar.</li>
                  <li><strong>Nivel 1 (Espontáneo):</strong> Dante toma la tablet por iniciativa propia.</li>
                </ul>
                <p className="pt-1 text-indigo-950 font-bold">
                  ✓ Cómo opera: Seleccionas el nivel que Dante necesitó hoy. La meta clínica es "desvanecer el apoyo" hacia el Nivel 1. Este dato se exporta automáticamente en el informe para la escuela.
                </p>
              </div>

              {/* Concept 4: MLU / LME */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                <h4 className="font-black text-blue-950 text-sm">
                  4. ¿Qué es el LME / MLU?
                </h4>
                <p>
                  Es la <strong>Longitud Media de Enunciado</strong>. Mide cuántas palabras promedio combina Dante en cada frase (ej: si dice solo "AGUA" su LME es 1.0; si combina "QUIERO AGUA" su LME es 2.0). La app lo calcula automáticamente cada vez que presiona oraciones en la barra.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowExplainerModal(false)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs"
              >
                ¡Entendido, volver al Panel!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Report Generator Modal / Drawer */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 max-w-2xl w-full p-5 md:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base md:text-lg">
                  Informe Clínico Consolidado para Escuela / PIE
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
              {generateClinicalReportText()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={handleCopyReportText}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                {copiedReport ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                <span>{copiedReport ? '¡Informe Copiado al Portapapeles!' : 'Copiar Informe para WhatsApp / Ficha'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
