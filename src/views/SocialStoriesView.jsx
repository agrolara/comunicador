import React, { useState } from 'react';
import { SOCIAL_STORIES } from '../data/pictograms';
import { BookOpenText, ChevronLeft, ChevronRight, Volume2, CheckCircle2 } from 'lucide-react';
import { tts } from '../services/tts';
import confetti from 'canvas-confetti';

export default function SocialStoriesView() {
  const [selectedStoryId, setSelectedStoryId] = useState(SOCIAL_STORIES[0].id);
  const [stepIndex, setStepIndex] = useState(0);

  const activeStory = SOCIAL_STORIES.find(s => s.id === selectedStoryId) || SOCIAL_STORIES[0];
  const currentStep = activeStory.steps[stepIndex] || activeStory.steps[0];
  const isLastStep = stepIndex === activeStory.steps.length - 1;

  const handleSelectStory = (storyId) => {
    tts.playChime('pop');
    setSelectedStoryId(storyId);
    setStepIndex(0);
    const story = SOCIAL_STORIES.find(s => s.id === storyId);
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

  return (
    <div className="p-3 md:p-6 max-w-4xl mx-auto space-y-6 pb-36 sm:pb-40 md:pb-48">
      {/* Banner Stitch */}
      <div className="bg-[#004ac6] text-white p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpenText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black">HISTORIAS SOCIALES</h2>
            <p className="text-xs md:text-sm text-[#dbe1ff] font-medium">
              Cuentos guiados con pictogramas ARASAAC para anticipar situaciones
            </p>
          </div>
        </div>

        {/* Story Selector */}
        <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl flex-wrap justify-center">
          {SOCIAL_STORIES.map(story => (
            <button
              key={story.id}
              onClick={() => handleSelectStory(story.id)}
              type="button"
              className={`
                px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-all
                ${selectedStoryId === story.id ? 'bg-white text-[#004ac6] shadow-xs' : 'text-white hover:bg-white/10'}
              `}
            >
              {story.title.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white border-3 border-[#c3c6d7] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
          <span className="text-xs font-black text-[#737686] uppercase tracking-wider">
            Paso {stepIndex + 1} de {activeStory.steps.length}
          </span>
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

        {/* Step Narrative Text in Atkinson Hyperlegible */}
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
    </div>
  );
}
