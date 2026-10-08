// Local Analytics and Progress Tracking for Therapist and Parents

const STORAGE_KEY = 'danmax_caa_analytics';

class AnalyticsService {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      history: [],
      wordCounts: {},
      sentencesCount: 0,
      sessionsCount: 1,
      lastActive: Date.now()
    };
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error(e);
    }
  }

  recordWord(word, category = 'General') {
    if (!word) return;
    const cleanWord = word.trim().toUpperCase();
    const now = Date.now();
    this.data.history.unshift({
      type: 'word',
      text: cleanWord,
      category,
      timestamp: now
    });

    // Keep history at last 200 items to conserve storage
    if (this.data.history.length > 200) {
      this.data.history = this.data.history.slice(0, 200);
    }

    this.data.wordCounts[cleanWord] = (this.data.wordCounts[cleanWord] || 0) + 1;
    this.data.lastActive = now;
    this.saveData();
  }

  recordSentence(sentenceItems) {
    if (!sentenceItems || sentenceItems.length === 0) return;
    const sentenceText = sentenceItems.map(i => i.text).join(' ');
    const now = Date.now();
    this.data.sentencesCount += 1;
    this.data.history.unshift({
      type: 'sentence',
      text: sentenceText,
      items: sentenceItems.map(i => i.text),
      timestamp: now
    });

    sentenceItems.forEach(item => {
      const w = item.text.trim().toUpperCase();
      this.data.wordCounts[w] = (this.data.wordCounts[w] || 0) + 1;
    });

    this.data.lastActive = now;
    this.saveData();
  }

  getWordCount(word) {
    if (!word) return 0;
    const clean = word.trim().toUpperCase();
    return this.data.wordCounts[clean] || 0;
  }

  // Sort an array of items by frequency of usage
  // anchorCount: keeps the first N items in fixed positions (e.g. YO and QUIERO)
  sortByUsage(items, anchorCount = 0) {
    if (!items || items.length === 0) return [];
    if (anchorCount <= 0) {
      return [...items].sort((a, b) => {
        const countA = this.getWordCount(a.text);
        const countB = this.getWordCount(b.text);
        if (countB !== countA) return countB - countA;
        return 0;
      });
    }

    const anchored = items.slice(0, anchorCount);
    const rest = items.slice(anchorCount);

    const sortedRest = [...rest].sort((a, b) => {
      const countA = this.getWordCount(a.text);
      const countB = this.getWordCount(b.text);
      if (countB !== countA) return countB - countA;
      return 0;
    });

    return [...anchored, ...sortedRest];
  }

  getStats() {
    const totalWords = Object.values(this.data.wordCounts).reduce((a, b) => a + b, 0);
    const sortedWords = Object.entries(this.data.wordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));

    // Calculate Mean Length of Utterance (LME / MLU)
    const sentenceEntries = this.data.history.filter(h => h.type === 'sentence' && Array.isArray(h.items));
    let totalItemsInSentences = 0;
    sentenceEntries.forEach(s => {
      totalItemsInSentences += s.items.length;
    });
    const mlu = sentenceEntries.length > 0 
      ? (totalItemsInSentences / sentenceEntries.length).toFixed(1)
      : (this.data.sentencesCount > 0 ? '1.5' : '1.0');

    // Categorize words into Communicative / Pragmatic Functions
    const pragmatic = {
      peticion: 0,   // QUIERO, DAME, COMER, BEBER, MÁS
      rechazo: 0,    // NO, BASTA, PARAR, ESPERAR
      emocion: 0,    // FELIZ, TRISTE, ENOJADO, MIEDO, ME GUSTA
      social: 0,     // HOLA, CHAO, GRACIAS, POR FAVOR, SÍ
      urgencia: 0    // BAÑO, AYUDA, DOLOR, CABEZA, FIEBRE
    };

    Object.entries(this.data.wordCounts).forEach(([w, count]) => {
      const upper = w.toUpperCase();
      if (/QUIERO|DAME|COMER|BEBER|MÁS|JUGAR|PONER|DORMIR|AGUA|LECHE|MANZANA|PAN/.test(upper)) {
        pragmatic.peticion += count;
      } else if (/NO|PARAR|BASTA|ESPERAR|QUITAR/.test(upper)) {
        pragmatic.rechazo += count;
      } else if (/FELIZ|TRISTE|ENOJADO|CALMA|MIEDO|ME GUSTA|GUSTA/.test(upper)) {
        pragmatic.emocion += count;
      } else if (/HOLA|CHAO|ADIÓS|GRACIAS|POR FAVOR|SÍ|BIEN/.test(upper)) {
        pragmatic.social += count;
      } else if (/BAÑO|AYUDA|DUELE|DOLOR|CABEZA|FIEBRE|RUIDO/.test(upper)) {
        pragmatic.urgencia += count;
      } else {
        pragmatic.peticion += count; // Default fallback to request/referential
      }
    });

    return {
      totalWords,
      totalSentences: this.data.sentencesCount,
      uniqueWords: Object.keys(this.data.wordCounts).length,
      mlu,
      pragmatic,
      topWords: sortedWords.slice(0, 10),
      recentActivity: this.data.history.slice(0, 20)
    };
  }

  clearHistory() {
    this.data = {
      history: [],
      wordCounts: {},
      sentencesCount: 0,
      sessionsCount: 1,
      lastActive: Date.now()
    };
    this.saveData();
  }

  // Export Complete Backup Profile JSON (for transferring phone -> tablet)
  exportBackup() {
    const backup = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      appName: 'Esta es mi voz sin límites',
      customPictograms: [],
      imageOverrides: {},
      textOverrides: {},
      settings: {},
      analytics: this.data
    };

    try {
      const custom = localStorage.getItem('danmax_custom_pictograms');
      if (custom) backup.customPictograms = JSON.parse(custom);
    } catch (e) {}

    try {
      const overrides = localStorage.getItem('danmax_image_overrides');
      if (overrides) backup.imageOverrides = JSON.parse(overrides);
    } catch (e) {}

    try {
      const textOver = localStorage.getItem('danmax_text_overrides');
      if (textOver) backup.textOverrides = JSON.parse(textOver);
    } catch (e) {}

    try {
      const core = localStorage.getItem('danmax_configured_core');
      if (core) backup.configuredCore = JSON.parse(core);
    } catch (e) {}

    backup.settings = {
      gridSize: localStorage.getItem('danmax_grid_size') || '4x4',
      fontFamily: localStorage.getItem('danmax_font_family') || 'atkinson',
      textCase: localStorage.getItem('danmax_text_case') || 'uppercase',
      dwellTime: localStorage.getItem('danmax_dwell_time') || '0',
      hapticFeedback: localStorage.getItem('danmax_haptic_feedback') !== 'false',
      voiceProfile: localStorage.getItem('danmax_voice_profile') || 'catalina',
      highContrast: localStorage.getItem('danmax_high_contrast') === 'true',
      cardSize: localStorage.getItem('danmax_card_size') || 'md',
      speakOnTap: localStorage.getItem('danmax_speak_on_tap') !== 'false',
      guidedMode: localStorage.getItem('danmax_guided_mode') !== 'false'
    };

    return backup;
  }

  // Import and Restore Backup Profile JSON
  importBackup(backupObject) {
    if (!backupObject || typeof backupObject !== 'object') {
      throw new Error('Archivo de respaldo no válido.');
    }

    if (backupObject.customPictograms) {
      localStorage.setItem('danmax_custom_pictograms', JSON.stringify(backupObject.customPictograms));
    }

    if (backupObject.imageOverrides) {
      localStorage.setItem('danmax_image_overrides', JSON.stringify(backupObject.imageOverrides));
    }

    if (backupObject.textOverrides) {
      localStorage.setItem('danmax_text_overrides', JSON.stringify(backupObject.textOverrides));
    }

    if (backupObject.configuredCore) {
      localStorage.setItem('danmax_configured_core', JSON.stringify(backupObject.configuredCore));
    }

    if (backupObject.settings) {
      const s = backupObject.settings;
      if (s.gridSize) localStorage.setItem('danmax_grid_size', s.gridSize);
      if (s.fontFamily) localStorage.setItem('danmax_font_family', s.fontFamily);
      if (s.textCase) localStorage.setItem('danmax_text_case', s.textCase);
      if (s.dwellTime) localStorage.setItem('danmax_dwell_time', s.dwellTime);
      if (s.hapticFeedback !== undefined) localStorage.setItem('danmax_haptic_feedback', String(s.hapticFeedback));
      if (s.voiceProfile) localStorage.setItem('danmax_voice_profile', s.voiceProfile);
      if (s.highContrast !== undefined) localStorage.setItem('danmax_high_contrast', String(s.highContrast));
      if (s.cardSize) localStorage.setItem('danmax_card_size', s.cardSize);
      if (s.speakOnTap !== undefined) localStorage.setItem('danmax_speak_on_tap', String(s.speakOnTap));
      if (s.guidedMode !== undefined) localStorage.setItem('danmax_guided_mode', String(s.guidedMode));
    }

    if (backupObject.analytics) {
      this.data = backupObject.analytics;
      this.saveData();
    }

    return true;
  }
}

export const analytics = new AnalyticsService();
