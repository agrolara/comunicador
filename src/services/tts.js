// Text-to-Speech & Neural Audio Synthesizer with Fluent Sentence Support & Zero-Latency Preload

export const VOICE_OPTIONS = [
  { id: 'catalina', label: 'Catalina (Chilena cálida / Muy natural)', neuralVoice: 'es-CL-CatalinaNeural', pitch: '+0Hz', rate: '+0%', desc: 'Voz humana chilena, dulce y de pronunciación impecable' },
  { id: 'lorenzo', label: 'Lorenzo (Chileno amigable / Juvenil)', neuralVoice: 'es-CL-LorenzoNeural', pitch: '+0Hz', rate: '+0%', desc: 'Voz masculina chilena amigable y clara' },
  { id: 'infantil', label: 'Paloma (Infantil dulce / Expresiva)', neuralVoice: 'es-US-PalomaNeural', pitch: '+12Hz', rate: '-4%', desc: 'Tono infantil, alegre y entusiasta, ideal para niños' },
  { id: 'dalia', label: 'Dalia (Femenina neutra / Clara)', neuralVoice: 'es-MX-DaliaNeural', pitch: '+0Hz', rate: '+0%', desc: 'Español latino neutro, articulado y profesional' },
  { id: 'jorge', label: 'Jorge (Masculina serena / Tranquilizadora)', neuralVoice: 'es-MX-JorgeNeural', pitch: '-4Hz', rate: '-4%', desc: 'Voz masculina calma y reconfortante' },
  { id: 'alonso', label: 'Alonso (Masculina joven / Dinámica)', neuralVoice: 'es-US-AlonsoNeural', pitch: '+0Hz', rate: '+0%', desc: 'Voz masculina joven y enérgica' },
  { id: 'local', label: 'Voz Local del Dispositivo (Offline)', neuralVoice: null, desc: 'Síntesis estándar del navegador para cuando no hay conexión' }
];

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voiceProfile = 'catalina'; // Default to ultra-realistic Chilean voice
    this.audioCtx = null;
    this.hapticEnabled = true;
    this.currentAudio = null;
    this.audioCache = new Map(); // url -> Audio instance
    this.highlightInterval = null;
  }

  setHapticEnabled(enabled) {
    this.hapticEnabled = Boolean(enabled);
  }

  triggerHaptic(duration = 40) {
    if (!this.hapticEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch (e) {}
  }

  playChime(type = 'pop') {
    this.triggerHaptic(type === 'success' ? [40, 60, 80] : 35);
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'pop') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  }

  setProfile(profile) {
    if (profile === 'femenina') profile = 'catalina';
    if (profile === 'masculina') profile = 'jorge';
    if (this.voiceProfile !== profile) {
      this.voiceProfile = profile;
      this.audioCache.clear();
    }
  }

  getProfileConfig() {
    return VOICE_OPTIONS.find(v => v.id === this.voiceProfile) || VOICE_OPTIONS[0];
  }

  getAudioUrl(text) {
    const config = this.getProfileConfig();
    if (!config.neuralVoice) return null;
    return `/api/tts?text=${encodeURIComponent(text.trim())}&voice=${encodeURIComponent(config.neuralVoice)}&rate=${encodeURIComponent(config.rate || '+0%')}&pitch=${encodeURIComponent(config.pitch || '+0Hz')}`;
  }

  // Pre-load audio ahead of time into browser cache (0ms latency on press)
  preload(text) {
    if (!text || typeof window === 'undefined') return;
    const url = this.getAudioUrl(text);
    if (!url || this.audioCache.has(url)) return;

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = url;
      this.audioCache.set(url, audio);
    } catch (e) {}
  }

  // Speak single word or text immediately
  speak(text, onEnd = null) {
    if (!text) return;
    this.stop();

    const config = this.getProfileConfig();

    if (config.neuralVoice) {
      const url = this.getAudioUrl(text);
      let audio = this.audioCache.get(url);

      if (!audio) {
        audio = new Audio(url);
        this.audioCache.set(url, audio);
      }

      this.currentAudio = audio;
      audio.currentTime = 0;

      audio.onended = () => {
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        this.speakLocal(text, onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakLocal(text, onEnd);
        });
      }
    } else {
      this.speakLocal(text, onEnd);
    }
  }

  // Speak sentence as ONE continuous, fluent human phrase with synchronous card highlights
  speakSentence(items, onHighlight = null, onComplete = null) {
    if (!items || items.length === 0) return;
    this.stop();

    // 1. Join items into a single, cohesive spoken sentence
    const fullText = items.map(item => item.text).join(' ');
    const totalItems = items.length;

    const config = this.getProfileConfig();

    if (config.neuralVoice) {
      const url = this.getAudioUrl(fullText);
      let audio = this.audioCache.get(url);

      if (!audio) {
        audio = new Audio(url);
        this.audioCache.set(url, audio);
      }

      this.currentAudio = audio;
      audio.currentTime = 0;

      // Synchronize visual card highlight smoothly across audio duration
      const updateHighlight = () => {
        if (!audio || !audio.duration || audio.duration === 0) return;
        const fraction = audio.currentTime / audio.duration;
        const activeIdx = Math.min(Math.floor(fraction * totalItems), totalItems - 1);
        if (onHighlight) onHighlight(activeIdx);
      };

      audio.ontimeupdate = updateHighlight;

      audio.onplay = () => {
        if (onHighlight) onHighlight(0);
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (onHighlight) onHighlight(null);
        if (onComplete) onComplete();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        // Fallback to local
        this.speakSentenceLocal(items, onHighlight, onComplete);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakSentenceLocal(items, onHighlight, onComplete);
        });
      }
    } else {
      this.speakSentenceLocal(items, onHighlight, onComplete);
    }
  }

  getLocalVoiceConfig() {
    const profile = this.voiceProfile;
    switch (profile) {
      case 'catalina':
        return {
          lang: 'es-CL',
          pitch: 1.05,
          rate: 0.95,
          preferredNames: ['Catalina', 'Chile', 'Francisca', 'Sabina', 'Helena', 'Monica', 'Laura', 'Female']
        };
      case 'lorenzo':
        return {
          lang: 'es-CL',
          pitch: 0.92,
          rate: 0.95,
          preferredNames: ['Lorenzo', 'Chile', 'Pablo', 'Diego', 'Jorge', 'Raul', 'Male']
        };
      case 'infantil': // Paloma
        return {
          lang: 'es-US',
          pitch: 1.45,
          rate: 1.05,
          preferredNames: ['Paloma', 'Zira', 'Paulina', 'Child', 'Google']
        };
      case 'dalia':
        return {
          lang: 'es-MX',
          pitch: 1.0,
          rate: 0.95,
          preferredNames: ['Dalia', 'Paulina', 'Mexico', 'Hilda', 'Sabina']
        };
      case 'jorge':
        return {
          lang: 'es-MX',
          pitch: 0.72,
          rate: 0.88,
          preferredNames: ['Jorge', 'Raul', 'Carlos', 'Pablo', 'David']
        };
      case 'alonso':
        return {
          lang: 'es-US',
          pitch: 1.05,
          rate: 1.05,
          preferredNames: ['Alonso', 'Diego', 'Miguel', 'David']
        };
      default:
        return {
          lang: 'es-CL',
          pitch: 1.0,
          rate: 0.95,
          preferredNames: []
        };
    }
  }

  resolveLocalVoice(voices, config) {
    if (!voices || voices.length === 0) return null;
    const esVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
    const candidatePool = esVoices.length > 0 ? esVoices : voices;

    for (const name of config.preferredNames) {
      const match = candidatePool.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match;
    }

    return candidatePool[0];
  }

  // Fallback sentence speaker using Web Speech API
  speakSentenceLocal(items, onHighlight = null, onComplete = null) {
    if (!this.synth || !items || items.length === 0) return;
    this.synth.cancel();

    const fullText = items.map(item => item.text).join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    const localConfig = this.getLocalVoiceConfig();
    utterance.lang = localConfig.lang;
    utterance.rate = localConfig.rate;
    utterance.pitch = localConfig.pitch;

    const voices = this.synth.getVoices();
    const matched = this.resolveLocalVoice(voices, localConfig);
    if (matched) utterance.voice = matched;

    // Rough visual sync
    let currentIndex = 0;
    const intervalMs = Math.max(350, Math.floor(2500 / items.length));
    if (onHighlight) onHighlight(0);

    const timer = setInterval(() => {
      currentIndex++;
      if (currentIndex < items.length) {
        if (onHighlight) onHighlight(currentIndex);
      } else {
        clearInterval(timer);
      }
    }, intervalMs);

    utterance.onend = () => {
      clearInterval(timer);
      if (onHighlight) onHighlight(null);
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      clearInterval(timer);
      if (onHighlight) onHighlight(null);
      if (onComplete) onComplete();
    };

    this.synth.speak(utterance);
  }

  // Fallback to device offline speech synthesis
  speakLocal(text, onEnd = null) {
    if (!this.synth || !text) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const localConfig = this.getLocalVoiceConfig();
    utterance.lang = localConfig.lang;
    utterance.rate = localConfig.rate;
    utterance.pitch = localConfig.pitch;

    const voices = this.synth.getVoices();
    const matched = this.resolveLocalVoice(voices, localConfig);
    if (matched) utterance.voice = matched;

    if (onEnd) utterance.onend = onEnd;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.ontimeupdate = null;
        this.currentAudio = null;
      } catch (e) {}
    }
    if (this.highlightInterval) {
      clearInterval(this.highlightInterval);
      this.highlightInterval = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }
}

export const tts = new TTSService();
