import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SentenceBar from './components/SentenceBar';

// Views
import MainBoardView from './views/MainBoardView';
import CategoriesView from './views/CategoriesView';
import PainUrgencyView from './views/PainUrgencyView';
import RoutinesView from './views/RoutinesView';
import TurnTakingView from './views/TurnTakingView';
import SocialStoriesView from './views/SocialStoriesView';
import PictogramEditorView from './views/PictogramEditorView';
import TherapistDashboardView from './views/TherapistDashboardView';
import AccessibilitySettingsView from './views/AccessibilitySettingsView';
import ModelingGuideView from './views/ModelingGuideView';
import AdminDashboardView from './views/AdminDashboardView';
import ErrorBoundary from './components/ErrorBoundary';

import { tts } from './services/tts';

const CUSTOM_PICTOS_KEY = 'danmax_custom_pictograms';
const IMAGE_OVERRIDES_KEY = 'danmax_image_overrides';
const TEXT_OVERRIDES_KEY = 'danmax_text_overrides';

export default function App() {
  const [activeTab, setActiveTab] = useState('main');
  const [sentenceItems, setSentenceItems] = useState([]);

  // Accessibility States (Google Stitch Specification)
  const [gridSize, setGridSize] = useState(() => localStorage.getItem('danmax_grid_size') || '4x4');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('danmax_font_family') || 'atkinson');
  const [textCase, setTextCase] = useState(() => localStorage.getItem('danmax_text_case') || 'uppercase');
  const [dwellTime, setDwellTime] = useState(() => {
    const saved = localStorage.getItem('danmax_dwell_time');
    return saved !== null ? parseFloat(saved) : 0;
  });
  const [hapticFeedback, setHapticFeedback] = useState(() => {
    return localStorage.getItem('danmax_haptic_feedback') !== 'false';
  });
  const [voiceProfile, setVoiceProfile] = useState(() => localStorage.getItem('danmax_voice_profile') || 'catalina');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('danmax_high_contrast') === 'true');
  const [cardSize, setCardSize] = useState(() => localStorage.getItem('danmax_card_size') || 'md');
  const [speakOnTap, setSpeakOnTap] = useState(() => localStorage.getItem('danmax_speak_on_tap') !== 'false');
  const [orientationMode, setOrientationMode] = useState(() => localStorage.getItem('danmax_orientation_mode') || 'auto');
  const [guidedMode, setGuidedMode] = useState(() => localStorage.getItem('danmax_guided_mode') !== 'false');

  useEffect(() => {
    try {
      localStorage.setItem('danmax_guided_mode', guidedMode.toString());
    } catch (e) {}
  }, [guidedMode]);

  // Custom User Pictograms from localStorage (e.g. Chocapic)
  const [customPictograms, setCustomPictograms] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PICTOS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Replaced Real Photos for existing pictograms
  const [imageOverrides, setImageOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem(IMAGE_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Custom text / label overrides for existing pictograms (e.g. FIDEOS instead of PASTA / FIDEOS)
  const [textOverrides, setTextOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem(TEXT_OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sync settings with services and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('danmax_grid_size', gridSize);
      localStorage.setItem('danmax_font_family', fontFamily);
      localStorage.setItem('danmax_text_case', textCase);
      localStorage.setItem('danmax_dwell_time', dwellTime.toString());
      localStorage.setItem('danmax_haptic_feedback', hapticFeedback.toString());
      localStorage.setItem('danmax_voice_profile', voiceProfile);
      localStorage.setItem('danmax_high_contrast', highContrast.toString());
      localStorage.setItem('danmax_card_size', cardSize);
      localStorage.setItem('danmax_speak_on_tap', speakOnTap.toString());
    } catch (e) {}

    tts.setProfile(voiceProfile);
    tts.setHapticEnabled(hapticFeedback);
  }, [gridSize, fontFamily, textCase, dwellTime, hapticFeedback, voiceProfile, highContrast, cardSize, speakOnTap]);

  // Sync and manage PWA orientation (auto, portrait, landscape)
  useEffect(() => {
    try {
      localStorage.setItem('danmax_orientation_mode', orientationMode);
      if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
        if (orientationMode === 'portrait') {
          window.screen.orientation.lock('portrait').catch(() => {});
        } else if (orientationMode === 'landscape') {
          window.screen.orientation.lock('landscape').catch(() => {});
        } else if (orientationMode === 'auto') {
          window.screen.orientation.unlock().catch(() => {});
        }
      }
    } catch (e) {}
  }, [orientationMode]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PICTOS_KEY, JSON.stringify(customPictograms));
    } catch (e) {}
  }, [customPictograms]);

  useEffect(() => {
    try {
      localStorage.setItem(IMAGE_OVERRIDES_KEY, JSON.stringify(imageOverrides));
    } catch (e) {}
  }, [imageOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem(TEXT_OVERRIDES_KEY, JSON.stringify(textOverrides));
    } catch (e) {}
  }, [textOverrides]);

  // Sentence Bar Handlers
  const handleAddToSentence = (item) => {
    setSentenceItems(prev => [...prev, item]);
  };

  const handleRemoveSentenceItem = (index) => {
    setSentenceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearSentence = () => {
    setSentenceItems([]);
  };

  // Custom Pictograms Handlers (e.g. Chocapic)
  const handleAddCustomPictogram = (newPicto) => {
    setCustomPictograms(prev => [newPicto, ...prev]);
  };

  const handleDeleteCustomPictogram = (id) => {
    setCustomPictograms(prev => prev.filter(p => p.id !== id));
  };

  // Image Override Handlers (replace generic picto with real photo)
  const handleSetImageOverride = (id, base64Url) => {
    setImageOverrides(prev => ({
      ...prev,
      [id]: base64Url
    }));
  };

  const handleRemoveImageOverride = (id) => {
    setImageOverrides(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Text Override Handlers (customize name / pronunciation of any pictogram)
  const handleSetTextOverride = (id, newText) => {
    if (!newText || !newText.trim()) return;
    setTextOverrides(prev => ({
      ...prev,
      [id]: newText.trim().toUpperCase()
    }));
  };

  const handleRemoveTextOverride = (id) => {
    setTextOverrides(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Font family class resolver
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'dyslexic':
        return 'font-dyslexic';
      case 'sans':
        return 'font-sans';
      default:
        return 'font-atkinson';
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleNavigateToCategory = (catId = 'all') => {
    setSelectedCategory(catId);
    setActiveTab('categories');
  };

  const isSentenceReadyToSpeak = useMemo(() => {
    if (!guidedMode || sentenceItems.length < 2) return false;
    const lastItem = sentenceItems[sentenceItems.length - 1];
    const lastText = ((textOverrides && textOverrides[lastItem.id]) || lastItem.text || '').toUpperCase().trim();
    const nonTerminalVerbs = ['YO', 'QUIERO', 'NO QUIERO', 'DAME'];
    return !nonTerminalVerbs.includes(lastText);
  }, [guidedMode, sentenceItems, textOverrides]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#f9f9ff] text-[#111c2d] ${getFontFamilyClass()} ${highContrast ? 'high-contrast' : ''} ${orientationMode === 'portrait' ? 'orientation-portrait' : orientationMode === 'landscape' ? 'orientation-landscape' : ''}`}>
      {/* Top App Bar con Buscador Rápido y Bottom Navigation Material 3 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        highContrast={highContrast}
        onAddToSentence={handleAddToSentence}
        imageOverrides={imageOverrides}
        textOverrides={textOverrides}
        customPictograms={customPictograms}
        sentenceItems={sentenceItems}
        orientationMode={orientationMode}
        onOrientationModeChange={setOrientationMode}
      />

      {/* Persistent Sentence Bar (accesible siempre que haya frase o en pestañas de comunicación) */}
      {(sentenceItems.length > 0 || ['main', 'categories', 'pain', 'turns'].includes(activeTab)) && (
        <SentenceBar
          items={sentenceItems}
          onRemoveItem={handleRemoveSentenceItem}
          onClear={handleClearSentence}
          highContrast={highContrast}
          imageOverrides={imageOverrides}
          textOverrides={textOverrides}
          highlightSpeak={isSentenceReadyToSpeak}
        />
      )}

      {/* Main Content Area con espacio inferior generoso para que nada quede oculto tras la barra de navegación */}
      <main className="flex-1 pb-36 sm:pb-40 md:pb-48">
        <ErrorBoundary key={activeTab} onNavigateHome={() => setActiveTab('main')}>
          {activeTab === 'main' && (
          <MainBoardView
            onAddToSentence={handleAddToSentence}
            cardSize={cardSize}
            gridSize={gridSize}
            highContrast={highContrast}
            dwellTime={dwellTime}
            textCase={textCase}
            imageOverrides={imageOverrides}
            textOverrides={textOverrides}
            customPictograms={customPictograms}
            sentenceItems={sentenceItems}
            guidedMode={guidedMode}
            onToggleGuidedMode={setGuidedMode}
            onNavigateTab={setActiveTab}
            onNavigateCategory={handleNavigateToCategory}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            onAddToSentence={handleAddToSentence}
            cardSize={cardSize}
            gridSize={gridSize}
            highContrast={highContrast}
            dwellTime={dwellTime}
            textCase={textCase}
            imageOverrides={imageOverrides}
            textOverrides={textOverrides}
            customPictograms={customPictograms}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {activeTab === 'pain' && (
          <PainUrgencyView
            onAddToSentence={handleAddToSentence}
            cardSize={cardSize}
            highContrast={highContrast}
            dwellTime={dwellTime}
            textCase={textCase}
            imageOverrides={imageOverrides}
            textOverrides={textOverrides}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesView />
        )}

        {activeTab === 'turns' && (
          <TurnTakingView
            onAddToSentence={handleAddToSentence}
            cardSize={cardSize}
            highContrast={highContrast}
          />
        )}

        {activeTab === 'stories' && (
          <SocialStoriesView />
        )}

        {activeTab === 'editor' && (
          <PictogramEditorView
            customPictograms={customPictograms}
            onAddCustomPictogram={handleAddCustomPictogram}
            onDeleteCustomPictogram={handleDeleteCustomPictogram}
            imageOverrides={imageOverrides}
            onSetImageOverride={handleSetImageOverride}
            onRemoveImageOverride={handleRemoveImageOverride}
            textOverrides={textOverrides}
            onSetTextOverride={handleSetTextOverride}
            onRemoveTextOverride={handleRemoveTextOverride}
          />
        )}

        {activeTab === 'therapist' && (
          <TherapistDashboardView />
        )}

        {activeTab === 'settings' && (
          <AccessibilitySettingsView
            gridSize={gridSize}
            setGridSize={setGridSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            textCase={textCase}
            setTextCase={setTextCase}
            dwellTime={dwellTime}
            setDwellTime={setDwellTime}
            hapticFeedback={hapticFeedback}
            setHapticFeedback={setHapticFeedback}
            voiceProfile={voiceProfile}
            setVoiceProfile={setVoiceProfile}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
            speakOnTap={speakOnTap}
            setSpeakOnTap={setSpeakOnTap}
            orientationMode={orientationMode}
            setOrientationMode={setOrientationMode}
            guidedMode={guidedMode}
            setGuidedMode={setGuidedMode}
          />
        )}

        {activeTab === 'guide' && (
          <ModelingGuideView />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView />
        )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
