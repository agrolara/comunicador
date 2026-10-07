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

  return (
    <div className={`min-h-screen flex flex-col bg-[#f9f9ff] text-[#111c2d] ${getFontFamilyClass()} ${highContrast ? 'high-contrast' : ''}`}>
      {/* Top App Bar & Bottom Navigation Material 3 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        highContrast={highContrast}
      />

      {/* Persistent Sentence Bar (always accessible across communication tabs) */}
      {['main', 'categories', 'pain', 'turns'].includes(activeTab) && (
        <SentenceBar
          items={sentenceItems}
          onRemoveItem={handleRemoveSentenceItem}
          onClear={handleClearSentence}
          highContrast={highContrast}
          imageOverrides={imageOverrides}
          textOverrides={textOverrides}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
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
            onNavigateTab={setActiveTab}
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
          />
        )}

        {activeTab === 'guide' && (
          <ModelingGuideView />
        )}
      </main>
    </div>
  );
}
