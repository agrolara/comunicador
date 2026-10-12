import React, { useState } from 'react';
import { SOCIAL_STORIES } from '../data/pictograms';
import { BookOpenText, ChevronLeft, ChevronRight, Volume2, CheckCircle2, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { tts } from '../services/tts';
import { aiService } from '../services/ai';
import confetti from 'canvas-confetti';

const CUSTOM_STORIES_KEY = 'danmax_custom_stories';

export default function SocialStoriesView() {
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_STORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map(s => s.id));
          const defaults = SOCIAL_STORIES.filter(s => !customIds.has(s.id));
          return [...parsed, ...defaults];
        }
      }
    } catch (e) {}
    return SOCIAL_STORIES;
  });

  const [selectedStoryId, setSelectedStoryId] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_STORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {}
    return SOCIAL_STORIES[0].id;
  });

  const [stepIndex, setStepIndex] = useState(0);

  // Modal AI States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiStepsCount, setAiStepsCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const activeStory = stories.find(s => s.id === selectedStoryId) || stories[0] || SOCIAL_STORIES[0];
  const currentStep = activeStory.steps[stepIndex] || activeStory.steps[0];
  const isLastStep = stepIndex === activeStory.steps.length - 1;

  const handleSelectStory = (storyId) => {
    tts.playChime('pop');
    setSelectedStoryId(storyId);
    setStepIndex(0);
    const story = stories.find(s => s.id === storyId);
    if (story) {
      tts.speak(story.title);
    }
  };

  const handleSpeakStep = () => {
    tts.playChime('pop');
    tts.speak(currentStep.text);
  };

  const handleNextStep = () => {
    tts.playChime('pop');
    if (!isLastStep) {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      tts.speak(activeStory.steps[nextIdx].text);
    } else {
      tts.playChime('success');
      tts.speak('¡Excelente! Has terminado esta historia social.');
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      tts.playChime('pop');
      const prevIdx = stepIndex - 1;
      setStepIndex(prevIdx);
      tts.speak(activeStory.steps[prevIdx].text);
    }
  };

  const handleDeleteCurrentStory = () => {
    if (!activeStory?.isAiGenerated) return;
    if (window.confirm(`¿Seguro que deseas eliminar la historia social "${activeStory.title}"?`)) {
      tts.playChime('pop');
      const filtered = stories.filter(s => s.id !== selectedStoryId);
      setStories(filtered);
      const customOnly = filtered.filter(s => s.isAiGenerated);
      localStorage.setItem(CUSTOM_STORIES_KEY, JSON.stringify(customOnly));
      setSelectedStoryId(filtered[0]?.id || SOCIAL_STORIES[0].id);
      setStepIndex(0);
      tts.speak('Historia social eliminada');
    }
  };

  const handleGenerateAiStory = async (e) => {
    if (e) e.preventDefault();
    if (!aiTopic.trim()) {
      setAiError('Por favor escribe el tema de la historia social');
      return;
    }

    setIsGenerating(true);
    setAiError('');
    tts.playChime('pop');

    try {
      const generated = await aiService.generateSocialStory({
        topic: aiTopic.trim(),
        stepsCount: aiStepsCount
      });

      const updated = [generated, ...stories];
      setStories(updated);

      const customOnly = updated.filter(s => s.isAiGenerated);
      localStorage.setItem(CUSTOM_STORIES_KEY, JSON.stringify(customOnly));

      setSelectedStoryId(generated.id);
      setStepIndex(0);
      setShowAiModal(false);
      setAiTopic('');
      tts.speak(`Historia creada: ${generated.title}`);
      tts.playChime('success');
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.4 } });
      } catch (e) {}
    } catch (err) {
      console.error('Error generating social story with AI:', err);
      setAiError(err.message || 'No se pudo generar la historia con IA. Revisa tu conexión.');
    } finally {
      setIsGenerating(false);
    }
  };

  const SUGGESTED_STORIES = [
    'Corte de Pelo',
    'Ir al Supermercado',
    'Sonidos Fuertes',
    'Compartir los Juguetes',
    'Cuando Mamá Va al Trabajo',
    'Visita al Doctor'
  ];

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner */}
      <div className="bg-[#004ac6] text-white p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpenText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">HISTORIAS SOCIALES</h2>
            <p className="text-xs md:text-sm text-[#dbe1ff] font-medium">
              Cuentos guiados con pictogramas ARASAAC para anticipar situaciones cotidianas
            </p>
          </div>
        </div>

        {/* Action: Create Story with AI */}
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
          <span>Crear Historia con IA</span>
        </button>
      </div>

      {/* Story Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
        {stories.map(story => (
          <button
            key={story.id}
            onClick={() => handleSelectStory(story.id)}
            type="button"
            className={`
              flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs md:text-sm cursor-pointer whitespace-nowrap transition-all
              ${selectedStoryId === story.id ? 'bg-[#004ac6] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'}
            `}
          >
            {story.isAiGenerated && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>{story.title.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Main Slide Card */}
      <div className="bg-white border-3 border-[#c3c6d7] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center space-y-6 relative">
        {/* Step indicator & Delete if AI */}
        <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#737686] uppercase tracking-wider">
              Paso {stepIndex + 1} de {activeStory.steps.length}
            </span>
            {activeStory?.isAiGenerated && (
              <button
                onClick={handleDeleteCurrentStory}
                type="button"
                title="Eliminar esta historia creada con IA"
                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-all ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {activeStory.steps.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-full transition-all ${stepIndex === i ? 'w-7 bg-[#004ac6]' : 'w-2.5 bg-[#c3c6d7]'}`}
              />
            ))}
          </div>
        </div>

        {/* Large ARASAAC Image */}
        <div className="w-36 h-36 md:w-44 md:h-44 bg-[#f0f3ff] border-3 border-[#c3c6d7] rounded-3xl p-3 flex items-center justify-center shadow-xs">
          <img
            src={`https://static.arasaac.org/pictograms/${currentStep.arasaacId}/${currentStep.arasaacId}_300.png`}
            alt=""
            className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
          />
        </div>

        {/* Step Narrative Text */}
        <p className="text-xl md:text-2xl font-black text-[#111c2d] leading-relaxed max-w-xl">
          "{currentStep.text}"
        </p>

        {/* Voice Play Button */}
        <button
          onClick={handleSpeakStep}
          type="button"
          style={{ boxShadow: '0 4px 0 #003ea8' }}
          className="flex items-center gap-2 px-6 py-3 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-2xl font-black text-sm cursor-pointer active:translate-y-[4px] active:shadow-none transition-all duration-75"
        >
          <Volume2 className="w-5 h-5" />
          <span>Escuchar de nuevo</span>
        </button>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100">
          <button
            onClick={handlePrevStep}
            disabled={stepIndex === 0}
            type="button"
            className="flex items-center gap-1.5 px-4 py-3 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#434655] rounded-2xl font-black text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Anterior</span>
          </button>

          <button
            onClick={handleNextStep}
            type="button"
            style={{
              boxShadow: isLastStep ? '0 5px 0 #059669' : '0 5px 0 #003ea8'
            }}
            className={`
              flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-white text-base shadow-sm cursor-pointer active:translate-y-[5px] active:shadow-none transition-all duration-75
              ${isLastStep ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#004ac6] hover:bg-[#003ea8]'}
            `}
          >
            <span>{isLastStep ? '¡Terminar!' : 'Siguiente'}</span>
            {isLastStep ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Modal: Crear Historia Social con IA */}
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
                    Crear Historia Social con IA
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Cuentos guiados con método Carol Gray para anticipar situaciones
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

            <form onSubmit={handleGenerateAiStory} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  ¿Sobre qué situación deseas crear la historia social?
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => {
                    setAiTopic(e.target.value);
                    setAiError('');
                  }}
                  placeholder="Ej: Ir a la peluquería, Sonidos fuertes, Compartir juguetes..."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm focus:border-[#004ac6] focus:outline-none focus:ring-4 focus:ring-blue-50"
                  autoFocus
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Sugerencias comunes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_STORIES.map((top) => (
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
                  Cantidad de escenas:
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
                      {num} Escenas
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
                  <span>{isGenerating ? 'Escribiendo historia...' : 'Generar Historia'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
