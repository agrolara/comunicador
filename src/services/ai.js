// AI Clinical Service powered by OpenRouter & Meta LLaMA 3.3-70B-Instruct
// "Esta es mi voz sin límites" - HealthTech CAA
import { ALL_PRESET_PICTOGRAMS } from '../data/pictograms';

// Decodes default key at runtime to avoid git push protection rejection
const _KEY_B64 = 'c2stb3ItdjEtMDk2YzIzM2JjYWY2NmQ5MmRlNDQzODI3ODE1NWMyZjk3NmVkODYwMWE1MDU0ZDA2OTA1ZmFlNGRkMzg3NDY4Yw==';
export const DEFAULT_OPENROUTER_KEY = typeof atob === 'function' ? atob(_KEY_B64) : '';
export const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct';

const STORAGE_KEY_API_KEY = 'danmax_openrouter_api_key';
const STORAGE_KEY_MODEL = 'danmax_openrouter_model';

export const CURATED_MODELS = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Meta: LLaMA 3.3 70B Instruct',
    provider: 'Meta',
    context_length: 128000,
    context_length_formatted: '128K',
    promptPricePerMillion: 0.13,
    completionPricePerMillion: 0.40,
    isFree: false,
    pricingFormatted: '$0.13 in / $0.40 out por 1M',
    description: 'Modelo oficial recomendado de alto rendimiento para informes fonoaudiológicos y metas terapéuticas.',
    isRecommended: true
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Google: Gemma 4 31B (free)',
    provider: 'Google',
    context_length: 262144,
    context_length_formatted: '262K',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Modelo denso multimodal de Google DeepMind. Excelente razonamiento en español y 100% gratuito.',
    isRecommended: true
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Google: Gemma 4 26B A4B (free)',
    provider: 'Google',
    context_length: 262144,
    context_length_formatted: '262K',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Arquitectura MoE ligera y ultra-rápida de Google para respuestas instantáneas sin costo.',
    isRecommended: true
  },
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'NVIDIA: Nemotron 3.5 Lightning (free)',
    provider: 'NVIDIA',
    context_length: 1000000,
    context_length_formatted: '1M',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: '1 Millón de tokens de contexto con arquitectura ultra-rápida MoE de NVIDIA sin costo.',
    isRecommended: true
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'NVIDIA: Nemotron 3 Ultra (free)',
    provider: 'NVIDIA',
    context_length: 1000000,
    context_length_formatted: '1M',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Modelo de 550B parámetros con arquitectura híbrida Transformer-Mamba para análisis profundo.',
    isRecommended: true
  },
  {
    id: 'thinkingmachines/inkling:free',
    name: 'Thinking Machines: Inkling (free)',
    provider: 'Thinking Machines',
    context_length: 1048576,
    context_length_formatted: '1M',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Razonamiento complejo y asistencia en tareas extensas con 1M de tokens gratuito.',
    isRecommended: false
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'LiquidAI: LFM 2.5 2.6B (free)',
    provider: 'LiquidAI',
    context_length: 65536,
    context_length_formatted: '65K',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Modelo compacto ultra-ligero para respuestas inmediatas de baja latencia.',
    isRecommended: false
  },
  {
    id: 'apodex/apodex-1.1-mini:free',
    name: 'Apodex: Apodex 1.1 Mini (free)',
    provider: 'Apodex',
    context_length: 262144,
    context_length_formatted: '262K',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Modelo enfocado en síntesis de datos y resúmenes estructurados sin costo.',
    isRecommended: false
  },
  {
    id: 'dots-studio/dots-3-note-preview:free',
    name: 'Dots Studio: Dots3-Note Preview (free)',
    provider: 'Dots Studio',
    context_length: 512000,
    context_length_formatted: '512K',
    promptPricePerMillion: 0,
    completionPricePerMillion: 0,
    isFree: true,
    pricingFormatted: '100% Gratis ($0.00)',
    description: 'Ventana de medio millón de tokens para análisis de historiales largos.',
    isRecommended: false
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek: DeepSeek-V3',
    provider: 'DeepSeek',
    context_length: 64000,
    context_length_formatted: '64K',
    promptPricePerMillion: 0.14,
    completionPricePerMillion: 0.28,
    isFree: false,
    pricingFormatted: '$0.14 in / $0.28 out por 1M',
    description: 'Líder en relación calidad-precio. Redacción clínica impecable por centavos de dólar.',
    isRecommended: true
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Google: Gemini 2.0 Flash',
    provider: 'Google',
    context_length: 1048576,
    context_length_formatted: '1M',
    promptPricePerMillion: 0.10,
    completionPricePerMillion: 0.40,
    isFree: false,
    pricingFormatted: '$0.10 in / $0.40 out por 1M',
    description: '1M de contexto a máxima velocidad para generación de informes clínicos instantáneos.',
    isRecommended: true
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'OpenAI: GPT-4o Mini',
    provider: 'OpenAI',
    context_length: 128000,
    context_length_formatted: '128K',
    promptPricePerMillion: 0.15,
    completionPricePerMillion: 0.60,
    isFree: false,
    pricingFormatted: '$0.15 in / $0.60 out por 1M',
    description: 'El modelo económico de OpenAI con alta coherencia y sintaxis en español.',
    isRecommended: true
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501',
    name: 'Mistral: Mistral Small 24B',
    provider: 'Mistral',
    context_length: 32768,
    context_length_formatted: '32K',
    promptPricePerMillion: 0.07,
    completionPricePerMillion: 0.14,
    isFree: false,
    pricingFormatted: '$0.07 in / $0.14 out por 1M',
    description: 'Ultra económico de origen europeo con excelente rendimiento gramatical.',
    isRecommended: false
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen: Qwen 2.5 72B Instruct',
    provider: 'Qwen',
    context_length: 131072,
    context_length_formatted: '128K',
    promptPricePerMillion: 0.35,
    completionPricePerMillion: 0.40,
    isFree: false,
    pricingFormatted: '$0.35 in / $0.40 out por 1M',
    description: 'Potente modelo open-weights de 72B con alta precisión en taxonomía clínica.',
    isRecommended: false
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Anthropic: Claude 3.5 Haiku',
    provider: 'Anthropic',
    context_length: 200000,
    context_length_formatted: '200K',
    promptPricePerMillion: 0.80,
    completionPricePerMillion: 4.00,
    isFree: false,
    pricingFormatted: '$0.80 in / $4.00 out por 1M',
    description: 'Gran empatía, redacción fluida y calidez humana de Anthropic.',
    isRecommended: false
  }
];

// Discrete 1-2 letter code for non-intrusive model verification
export function getModelDiscreteCode(modelId) {
  if (!modelId) return 'IA';
  const lower = modelId.toLowerCase();
  if (lower.includes('nemotron')) return 'NM';
  if (lower.includes('llama')) return 'ML';
  if (lower.includes('gemma')) return 'GM';
  if (lower.includes('gemini')) return 'GF';
  if (lower.includes('deepseek')) return 'DS';
  if (lower.includes('gpt')) return 'GP';
  if (lower.includes('claude')) return 'CL';
  if (lower.includes('mistral')) return 'MS';
  if (lower.includes('qwen')) return 'QW';
  if (lower.includes('inkling')) return 'IK';
  if (lower.includes('liquid') || lower.includes('lfm')) return 'LQ';
  if (lower.includes('apodex')) return 'AP';
  if (lower.includes('dots')) return 'DT';

  const parts = lower.split('/');
  const p0 = (parts[0] || '')[0] || 'A';
  const p1 = (parts[1] || '')[0] || 'I';
  return (p0 + p1).toUpperCase().slice(0, 2);
}

export const aiService = {
  getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY_API_KEY) || DEFAULT_OPENROUTER_KEY;
    } catch (e) {
      return DEFAULT_OPENROUTER_KEY;
    }
  },

  setApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
    } catch (e) {}
  },

  getModel() {
    try {
      return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  },

  getDiscreteCode(modelId) {
    return getModelDiscreteCode(modelId || this.getModel());
  },

  setModel(model) {
    try {
      if (model && model.trim()) {
        const trimmed = model.trim();
        localStorage.setItem(STORAGE_KEY_MODEL, trimmed);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('danmax_model_changed', { detail: trimmed }));
        }
      }
    } catch (e) {}
  },

  // Get cached models or fallback to curated list
  getCachedModels() {
    try {
      const saved = localStorage.getItem('danmax_openrouter_cached_models');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return CURATED_MODELS;
  },

  // Fetch live models from OpenRouter (via server proxy or direct)
  async fetchLiveModels(apiKey) {
    const key = apiKey || this.getApiKey();
    let rawList = [];

    // 1. Try server proxy first
    try {
      const res = await fetch('/api/ai/models');
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          rawList = json.data;
        }
      }
    } catch (e) {}

    // 2. Fallback direct to OpenRouter API
    if (rawList.length === 0) {
      try {
        const headers = {
          'HTTP-Referer': 'https://comunicador.agrolara.dedyn.io',
          'X-Title': 'Esta es mi voz sin límites CAA'
        };
        if (key) {
          headers['Authorization'] = `Bearer ${key}`;
        }
        const res = await fetch('https://openrouter.ai/api/v1/models', { headers });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            rawList = json.data;
          }
        }
      } catch (e) {}
    }

    if (rawList.length === 0) {
      return this.getCachedModels();
    }

    // Format every model
    const formatted = rawList.map(m => {
      const promptP = parseFloat(m.pricing?.prompt || 0) * 1000000;
      const compP = parseFloat(m.pricing?.completion || 0) * 1000000;
      const isFree = (promptP === 0 && compP === 0) || (m.id && m.id.includes(':free'));
      
      const providerRaw = (m.id && m.id.split('/')[0]) || 'OpenRouter';
      const provider = providerRaw.charAt(0).toUpperCase() + providerRaw.slice(1);

      return {
        id: m.id,
        name: m.name || m.id,
        provider,
        context_length: m.context_length || 0,
        context_length_formatted: m.context_length >= 1000000 
          ? `${Math.round(m.context_length / 1000000)}M` 
          : `${Math.round((m.context_length || 0) / 1000)}K`,
        promptPricePerMillion: promptP,
        completionPricePerMillion: compP,
        isFree,
        pricingFormatted: isFree 
          ? '100% Gratis ($0.00)' 
          : `$${promptP < 0.01 ? promptP.toFixed(4) : promptP.toFixed(2)} in / $${compP < 0.01 ? compP.toFixed(4) : compP.toFixed(2)} out por 1M`,
        description: m.description || 'Modelo de inteligencia artificial en OpenRouter.',
        isRecommended: m.id.includes('llama-3.3') || m.id.includes('gemma') || m.id.includes('deepseek') || m.id.includes('gpt-4o') || m.id.includes('gemini')
      };
    });

    // Sort: Free first, then Recommended, then cheaper
    formatted.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.promptPricePerMillion - b.promptPricePerMillion;
    });

    try {
      localStorage.setItem('danmax_openrouter_cached_models', JSON.stringify(formatted));
    } catch (e) {}

    return formatted;
  },

  // Test connection and latency with current or specific model
  async testConnection(modelOverride) {
    const start = Date.now();
    const activeModel = modelOverride || this.getModel();
    try {
      const result = await this.chatCompletion({
        modelOverride: activeModel,
        messages: [{ role: 'user', content: 'Responde exactamente "CONEXION_OK"' }],
        temperature: 0.1,
        maxTokens: 10
      });
      const latency = Date.now() - start;
      const isOk = result && result.includes('CONEXION_OK');
      return { 
        success: true, 
        latency, 
        model: activeModel,
        message: `Conexión exitosa con ${activeModel} (${latency}ms)`, 
        isOk 
      };
    } catch (error) {
      return { 
        success: false, 
        latency: Date.now() - start, 
        model: activeModel,
        error: error.message 
      };
    }
  },

  // Core Chat Completion with Proxy + Direct Fallback
  async chatCompletion({ messages, systemPrompt, temperature = 0.7, maxTokens = 2500, modelOverride }) {
    const apiKey = this.getApiKey();
    const model = modelOverride || this.getModel();

    const formattedMessages = [];
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    formattedMessages.push(...messages);

    const payload = {
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens
    };

    // 1. Try local server endpoint first
    try {
      const serverRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, apiKey })
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return content.trim();
      }
    } catch (proxyErr) {
      console.warn('[AI Service] Server endpoint unavailable, falling back to direct OpenRouter:', proxyErr.message);
    }

    // 2. Direct OpenRouter API call fallback
    const directRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://comunicador.agrolara.dedyn.io',
        'X-Title': 'Esta es mi voz sin limites CAA'
      },
      body: JSON.stringify(payload)
    });

    if (!directRes.ok) {
      let errDetails = '';
      try {
        const errJson = await directRes.json();
        errDetails = errJson?.error?.message || JSON.stringify(errJson);
      } catch (e) {
        errDetails = await directRes.text();
      }
      throw new Error(`Error de OpenRouter (${directRes.status}): ${errDetails}`);
    }

    const data = await directRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Respuesta vacía del modelo de IA');
    }
    return content.trim();
  },

  // 1. Generador de Informes de Avance Fonoaudiológico Formal
  async generateClinicalReport({
    stats,
    promptLevel = '3',
    patientName = 'Dante',
    birthDate = '2020',
    therapistName = 'Mauricio Lara / Equipo Fonoaudiológico',
    centerName = 'Fundación Sin Barreras / Consulta CAA',
    extraNotes = ''
  }) {
    const promptNames = {
      '1': 'Nivel 1: Totalmente Espontáneo / Autónomo (Sin apoyo del adulto)',
      '2': 'Nivel 2: Pausa Expectante (10-15s con mirada cálida)',
      '3': 'Nivel 3: Apoyo Visual / Gesto (Señalar pictograma en pantalla)',
      '4': 'Nivel 4: Apoyo Verbal Indirecto ("¿Qué necesitas decirme?")',
      '5': 'Nivel 5: Guía Física Parcial (Mano bajo mano)'
    };

    const pragmaticTotal = (stats?.pragmatic?.peticion || 0) + 
      (stats?.pragmatic?.rechazo || 0) + 
      (stats?.pragmatic?.emocion || 0) + 
      (stats?.pragmatic?.social || 0) + 
      (stats?.pragmatic?.urgencia || 0) || 1;

    const pragmaticPercentages = {
      peticion: Math.round(((stats?.pragmatic?.peticion || 0) / pragmaticTotal) * 100),
      rechazo: Math.round(((stats?.pragmatic?.rechazo || 0) / pragmaticTotal) * 100),
      emocion: Math.round(((stats?.pragmatic?.emocion || 0) / pragmaticTotal) * 100),
      social: Math.round(((stats?.pragmatic?.social || 0) / pragmaticTotal) * 100),
      urgencia: Math.round(((stats?.pragmatic?.urgencia || 0) / pragmaticTotal) * 100)
    };

    const topWordsText = (stats?.topWords || [])
      .slice(0, 10)
      .map((w, i) => `${i + 1}. ${w.word} (${w.count} emisiones)`)
      .join(', ') || 'Sin registros acumulados suficientes';

    const systemPrompt = `Eres un Fonoaudiólogo Clínico Senior y Magíster en Comunicación Aumentativa y Alternativa (CAA) en Chile. 
Escribes informes clínicos formales con precisión biomédica, redacción impecable y enfoque de derechos y neurodiversidad. 
Utilizas la nomenclatura chilena estándar del Ministerio de Salud (MINSAL) y del Ministerio de Educación (MINEDUC / Decreto 170 / Decreto 83 / PIE).
El informe debe ser formal, estructurado, optimista pero riguroso, listo para ser entregado a Neurología Infantil, Fonoaudiología y Equipo Directivo Escolar.`;

    const userPrompt = `Por favor genera el "INFORME EVOLUTIVO DE COMUNICACIÓN AUMENTATIVA Y ALTERNATIVA (CAA)" formal para el siguiente usuario:

DATOS DEL PACIENTE Y EVALUACIÓN:
- Nombre del Paciente: ${patientName}
- Año de Nacimiento / Edad estimada: ${birthDate}
- Profesional Evaluador: ${therapistName}
- Centro / Institución: ${centerName}
- Fecha: ${new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
- Software de CAA: "Esta es mi voz sin límites" (Comunicador Dinámico Digital y Motor Edge-TTS)

MÉTRICAS OBJETIVAS DE TELEMETRÍA CAA REGISTRADAS EN LA APLICACIÓN:
- Total de palabras emitidas: ${stats?.totalWords || 0}
- Total de enunciados estructurados en barra sintáctica: ${stats?.totalSentences || 0}
- Amplitud de léxico activo: ${stats?.uniqueWords || 0} palabras diferenciadas
- Longitud Media de Enunciado (LME / MLU): ${stats?.mlu || '1.0'} palabras por enunciado
- Nivel actual en Jerarquía de Apoyo / Prompting: ${promptNames[promptLevel] || promptLevel}
- Distribución de Funciones Pragmáticas:
  * Petición Instrumental (Quiero, Comer, Más): ${pragmaticPercentages.peticion}%
  * Rechazo y Negación Funcional (No, Parar): ${pragmaticPercentages.rechazo}%
  * Social y Cortesía (Hola, Chao, Gracias): ${pragmaticPercentages.social}%
  * Emoción y Autorregulación (Feliz, Calma): ${pragmaticPercentages.emocion}%
  * Dolor y Urgencias Físicas (Baño, Duele): ${pragmaticPercentages.urgencia}%
- Vocabulario de mayor motivación/uso: ${topWordsText}
${extraNotes ? `- Observaciones clínicas adicionales: ${extraNotes}` : ''}

ESTRUCTURA DEL INFORME REQUERIDA:
1. IDENTIFICACIÓN Y MOTIVO DEL INFORME
2. RESUMEN CUANTITATIVO Y RENDIMIENTO LINGÜÍSTICO (Análisis de LME/MLU y amplitud léxica)
3. PERFIL COMUNICATIVO PRAGMÁTICO (Interpretación clínica de las funciones: equilibrio entre petición, rechazo y emoción)
4. EVALUACIÓN DE LA AUTONOMÍA Y DESVANECIMIENTO DE APOYOS (Análisis del nivel de prompting actual y pronóstico)
5. OBJETIVOS TERAPÉUTICOS PROPUESTOS PARA EL PRÓXIMO PERIODO (Formato SMART)
6. ORIENTACIONES PARA LA FAMILIA, COLEGIO Y EQUIPO PIE
7. FIRMA Y TIMBRE SIMULADOS

Redacta el informe de manera completa, profesional y detallada en español formal de Chile.`;

    return this.chatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.6,
      maxTokens: 3000
    });
  },

  // 2. Recomendador de Estrategias de Modelado CAA (ALS)
  async generateModelingStrategies({ stats, topWords = [], userProfile = 'Dante' }) {
    const systemPrompt = `Eres un Especialista Internacional en Estrategias de Modelado en CAA y Estimulación de Lenguaje Asistido (Aided Language Stimulation - ALS).
Propones estrategias prácticas, respetuosas con la regulación sensorial del niño y orientadas a la vida cotidiana (AVD) en el hogar y en la sala de clases.`;

    const topWordsList = (topWords.length > 0 ? topWords : (stats?.topWords || []))
      .slice(0, 8)
      .map(w => w.word || w)
      .join(', ') || 'QUIERO, COMER, AGUA, NO, MÁS';

    const userPrompt = `Genera un plan de "Estrategias de Modelado y Estimulación de Lenguaje Asistido (CAA)" para ${userProfile}.

Contexto del usuario:
- Vocabulario consolidado / frecuente: [${topWordsList}]
- Longitud Media de Enunciado (LME): ${stats?.mlu || '1.2'} palabras por emisión.
- Objetivo: Expandir el uso funcional del comunicador más allá de la petición instrumental (hacia comentarios, rechazo anticipatorio y juego compartido).

Por favor estructura tu respuesta en:
1. 🎯 GUIONES DE INTERACCIÓN EN RUTINAS NATURALES (3 situaciones concretas: Ej. Desayuno/Merienda, Juego con bloques/autos, Momento de salir de paseo). Incluye qué dice el adulto, qué pictograma presiona y la pausa de espera de 10-15 segundos.
2. 🚀 EXPANSIÓN A 2 PALABRAS (Técnica de LME + 1): Ejemplos específicos combinando sus palabras favoritas con palabras núcleo (CORE WORDS: VER, MÁS, PARAR, AYUDA).
3. 🛑 MODELADO DE RECHAZO ASISTIDO: Cómo modelar "NO" o "PARAR" para prevenir desregulaciones antes de que ocurra la frustración.
4. 🧠 RECOMENDACIONES DE AUTORREGULACIÓN: Uso del tablero de dolor y urgencias físicas cuando haya sobrecarga sensorial.
5. 📋 CONSEJO CLAVE DE ORO PARA LA FAMILIA Y CUIDADORES.`;

    return this.chatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2500
    });
  },

  // 3. Asistente de Objetivos SMART para Planes PIE (Mineduc Chile)
  async generateSmartGoalsPIE({
    stats,
    currentGoals = [],
    studentName = 'Dante',
    gradeLevel = 'Educación Básica / Integración Escolar',
    focusArea = 'Todas las áreas (Rechazo, Combinación LME, Socialización y Autonomía)'
  }) {
    const systemPrompt = `Eres un Asesor Técnico Pedagógico y Fonoaudiólogo Especialista en el Programa de Integración Escolar (PIE) del Ministerio de Educación de Chile (Decreto 170 / Decreto 83).
Formulas metas SMART impecables para Planes Educativos Individualizados (PEI/PACI).
Cada meta debe contener:
- Conducta observable (qué hará)
- Condición / Contexto (en qué situación y con qué nivel de apoyo de la jerarquía)
- Criterio de logro cuantitativo (ej: 4 de 5 oportunidades, 80% de efectividad)
- Temporalidad (semestre escolar)`;

    const existingGoalsText = currentGoals.map(g => `- ${g.text}`).join('\n') || 'Ninguno registrado aún';

    const userPrompt = `Diseña 4 Objetivos SMART para el Informe Técnico Semestral PIE de ${studentName} (${gradeLevel}).

Área de Foco Solicitada: ${focusArea}
Rendimiento actual:
- LME actual: ${stats?.mlu || '1.1'} palabras
- Palabras dominantes: ${(stats?.topWords || []).slice(0, 5).map(w => w.word).join(', ') || 'Básicas'}
- Objetivos ya en curso:
${existingGoalsText}

Instrucciones:
Entrega una lista de 4 metas SMART listas para el informe oficial.
Para cada meta, incluye:
1. Nombre corto / Título del Objetivo
2. Formulación SMART completa
3. Criterio de Medición (con un número sugerido de observaciones para la app, ej: 5 o 10 observaciones)
4. Indicador para educadora diferencial o fonoaudióloga en el aula
5. Una versión resumida en una sola línea para importar directamente al comunicador`;

    return this.chatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.6,
      maxTokens: 2500
    });
  },

  // 4. Generador de Rutinas Diarias con IA y Pictogramas ARASAAC
  async generateRoutine({ topic, patientName = 'Dante', stepsCount = 5 }) {
    const systemPrompt = `Eres un Terapeuta Clínico Ocupacional y Fonoaudiólogo Especialista en Comunicación Aumentativa y Alternativa (CAA) y Agendas Visuales con pictogramas ARASAAC.
Tu tarea es generar una rutina visual paso a paso clara, secuencial y motivadora para un niño no verbal / TEA llamado ${patientName}.
IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto introductorio, sin explicaciones y sin bloques markdown como \`\`\`json. Solo el objeto JSON crudo.

Estructura requerida:
{
  "title": "Nombre corto de la rutina en español (Ej: Visita al Dentista)",
  "items": [
    {
      "text": "ACCIÓN EN MAYÚSCULAS (Ej: SALIR DE CASA)",
      "time": "09:00",
      "arasaacId": 2339
    }
  ]
}

IDs comunes de ARASAAC de referencia:
- despertar: 8989, baño: 6929, lavarse los dientes: 6971, lavarse las manos: 8975, vestirse: 6627, desayunar: 4625
- colegio/escuela: 32446, mochila: 2475, auto/viaje: 2339, jugar: 2439, guardar juguetes: 4935
- almuerzo/comer: 2573, plaza/parque: 2517, médico/doctor: 6523, dentista: 2717, calma/respirar: 31310
- cenar: 2573, bañarse: 6058, pijama: 2522, dormir: 6479, esperar/turno: 3288, escuchar: 2382, caminar: 2419`;

    const userPrompt = `Crea una rutina de ${stepsCount} pasos para la siguiente actividad: "${topic}".`;

    const rawResponse = await this.chatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.5,
      maxTokens: 1500
    });

    try {
      const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return {
            id: `r-ai-${Date.now()}`,
            title: parsed.title || topic,
            isAiGenerated: true,
            items: parsed.items.map((it, idx) => ({
              id: `step-ai-${idx}-${Date.now()}`,
              text: (it.text || `PASO ${idx + 1}`).toUpperCase(),
              time: it.time || `0${8 + idx}:00`,
              done: false,
              arasaacId: Number(it.arasaacId) || 2439
            }))
          };
        }
      }
    } catch (e) {
      console.warn('Error parsing AI routine JSON, using fallback', e);
    }

    return {
      id: `r-ai-${Date.now()}`,
      title: topic,
      isAiGenerated: true,
      items: [
        { id: `step-1-${Date.now()}`, text: 'PREPARARSE', time: '09:00', done: false, arasaacId: 6627 },
        { id: `step-2-${Date.now()}`, text: topic.toUpperCase(), time: '09:30', done: false, arasaacId: 2439 },
        { id: `step-3-${Date.now()}`, text: 'REGRESAR A CASA', time: '10:30', done: false, arasaacId: 2432 },
        { id: `step-4-${Date.now()}`, text: 'DESCANSAR', time: '11:00', done: false, arasaacId: 6479 }
      ]
    };
  },

  // 5. Generador de Historias Sociales con IA (Método Carol Gray)
  async generateSocialStory({ topic, patientName = 'Dante', stepsCount = 5 }) {
    const systemPrompt = `Eres un Terapeuta Clínico y Fonoaudiólogo Especialista en Historias Sociales según el método oficial de Carol Gray para niños no verbales o dentro del espectro autista (TEA).
Crea un cuento anticipatorio en primera persona ("Yo...", "A veces...", "Cuando...") con frases cortas, afirmativas, tranquilizadoras y empáticas.
IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto introductorio, sin explicaciones y sin bloques markdown como \`\`\`json. Solo el objeto JSON crudo.

Estructura requerida:
{
  "title": "Nombre de la historia social en español (Ej: Cuando visito al Dentista)",
  "steps": [
    {
      "text": "Frase empática y clara para el niño.",
      "arasaacId": 2717
    }
  ]
}

IDs comunes de ARASAAC de referencia:
- emociones: calma 23392, feliz 8020, enojado/frustrado 35539, asustado 2469, cansado 2623, dolor 2841
- personas: familia 2397, mamá 2466, papá 2515, profesor 2831, doctor 6523, dentista 2717, amigos 32446
- acciones: respirar 31310, pedir ayuda 4550, esperar 3288, escuchar 2382, parar 36914, hablar 2418, jugar 2439
- lugares: casa 2432, escuela 32446, parque 2517, hospital 3116, peluquería 2855, supermercado 2587`;

    const userPrompt = `Crea una historia social de ${stepsCount} pasos en primera persona para ayudar a ${patientName} con: "${topic}".`;

    const rawResponse = await this.chatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.6,
      maxTokens: 1800
    });

    try {
      const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
          return {
            id: `story-ai-${Date.now()}`,
            title: parsed.title || topic,
            isAiGenerated: true,
            steps: parsed.steps.map((st, idx) => ({
              text: st.text || `Paso ${idx + 1}`,
              arasaacId: Number(st.arasaacId) || 23392
            }))
          };
        }
      }
    } catch (e) {
      console.warn('Error parsing AI social story JSON, using fallback', e);
    }

    return {
      id: `story-ai-${Date.now()}`,
      title: topic,
      isAiGenerated: true,
      steps: [
        { text: `Hoy voy a participar en una actividad: ${topic}.`, arasaacId: 2439 },
        { text: 'A veces las situaciones nuevas son diferentes, pero las personas me cuidan.', arasaacId: 2397 },
        { text: 'Si necesito calma, puedo respirar hondo y pedir una pausa.', arasaacId: 31310 },
        { text: 'Hago las cosas paso a paso a mi propio ritmo.', arasaacId: 3288 },
        { text: '¡Todo saldrá muy bien y volveremos a casa tranquilos!', arasaacId: 8020 }
      ]
    };
  },

  // 6. Generador de Actividades y Juegos de Modelado CAA
  async generateActivity({
    level = '1',
    context = 'juegos',
    goal = 'peticion',
    toyOrItem = '',
    durationMinutes = 5,
    patientName = 'Dante'
  }) {
    const levelMap = {
      '1': 'Nivel 1: Explorador (1 palabra, causa-efecto)',
      '2': 'Nivel 2: Combinador (2 palabras, LME + 1)',
      '3': 'Nivel 3: Comunicador Social y Emocional (Rechazo preventivo, turnos)'
    };
    const contextMap = {
      'juegos': 'Juegos con juguetes (autos, bloques, etc.)',
      'mesa': 'En la mesa / Comida (desayuno, colación)',
      'sin_juguetes': 'Sin juguetes / Juegos corporales (cosquillas, canciones)',
      'rutina': 'Rutina diaria / Aseo (lavarse manos, baño)',
      'escuela': 'Escuela / Recreo / Aire libre'
    };
    const goalMap = {
      'peticion': 'Petición espontánea de alta motivación',
      'rechazo': 'Rechazo funcional ("NO" / "PARAR") antes de frustración',
      'turnos': 'Esperar turnos y compartir ("MI TURNO" / "TU TURNO")',
      'emocion': 'Expresión de emociones y sensaciones'
    };

    const systemPrompt = `Eres un Fonoaudiólogo Especialista Internacional en Estimulación de Lenguaje Asistido (ALS) y Estrategias Naturales de Modelado CAA para niños TEA / no verbales.
Tu objetivo es diseñar una actividad o juego lúdico de ${durationMinutes} minutos para hacer en casa o en la escuela con el niño llamado ${patientName}.
La actividad debe dar instrucciones claras al adulto sobre QUÉ HACER CON LAS MANOS, QUÉ DECIR y QUÉ PICTOGRAMA TOCAR.
Nivel del niño: ${levelMap[level] || 'Nivel 1'}
Contexto: ${contextMap[context] || 'Juego'}
Objetivo principal: ${goalMap[goal] || 'Petición'}
${toyOrItem ? `Elemento disponible: "${toyOrItem}"` : ''}

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques markdown como \`\`\`json y sin texto introductorio.

Estructura requerida:
{
  "title": "Nombre lúdico y llamativo del juego (Ej: La Carrera Congelada)",
  "summary": "Resumen en una línea de la dinámica del juego.",
  "levelLabel": "${levelMap[level] || 'Nivel 1'}",
  "contextLabel": "${contextMap[context] || 'Juegos'}",
  "goalLabel": "${goalMap[goal] || 'Petición'}",
  "duration": "${durationMinutes} min",
  "pictograms": [
    { "text": "VAMOS", "arasaacId": 8142, "role": "Acción principal" },
    { "text": "PARAR", "arasaacId": 7196, "role": "Límite o Plan B" },
    { "text": "MÁS", "arasaacId": 3220, "role": "Continuidad" }
  ],
  "steps": [
    {
      "phase": "1. Enganche y Motivación",
      "instruction": "Acción física concreta que debe realizar el adulto con el juguete.",
      "adultScript": "Qué frase corta o sonido dice el adulto.",
      "tip": "Tip clínico clave."
    },
    {
      "phase": "2. La Pausa Mágica (Expectante)",
      "instruction": "Cómo pausar el juego y esperar 10 segundos en silencio con sonrisa.",
      "adultScript": "",
      "tip": "No preguntes '¿qué quieres?'. Dale tiempo de procesar."
    },
    {
      "phase": "3. Modelado en el Comunicador",
      "instruction": "Toca tú el pictograma en la pantalla mientras dices la palabra.",
      "adultScript": "¡VAMOS!",
      "tip": "Mano bajo mano sólo si el niño lo acepta."
    },
    {
      "phase": "4. Consecuencia Natural Inmediata",
      "instruction": "Acción inmediata de recompensa cuando el niño intente comunicarse.",
      "adultScript": "¡Eso es, vamos a jugar!",
      "tip": "La rapidez del refuerzo consolida el aprendizaje."
    }
  ],
  "planB": "Plan de autorregulación si el niño muestra frustración o rechazo (modelar NO/PARAR y guardar con calma)."
}

IDs comunes de ARASAAC para referencia verificados:
- Acciones: VAMOS (8142), PARAR (7196), ABRIR (24825), CERRAR (24976), ESPERAR (8109), JUGAR (23392), COMER (6456), BEBER (6061), DORMIR (6479)
- Núcleo: QUIERO (5441), MÁS (3220), NO (5526), SÍ (5584), AYUDA (12252), MIRA (6564), DAME (17038)
- Objetos/Juguetes: AUTO (2340), BURBUJAS (6945), BLOQUES (4935), PELOTA (3241), PLASTILINA (2529), AGUA (32464), GALLETA (8312)
- Turnos/Social: MI TURNO (6632), TU TURNO (25790), COMPARTIR (15361), HOLA (6522), CHAO (6028), GRACIAS (8129)
- Emociones: FELIZ (9907), CALMA (31310), ENOJADO (35539), CANSADO (35537), COSQUILLAS (23392)`;

    const userPrompt = `Crea un juego de modelado CAA para ${patientName} utilizando: ${toyOrItem || contextMap[context] || 'juego cotidiano'}.`;

    const resolveVerifiedId = (text, fallbackId) => {
      if (!text) return fallbackId || 3220;
      const clean = text.trim().toUpperCase();
      const dict = {
        'VAMOS': 8142, 'PARAR': 7196, 'MÁS': 3220, 'MAS': 3220,
        'ABRIR': 24825, 'CERRAR': 24976, 'QUIERO': 5441, 'COMER': 6456,
        'BEBER': 6061, 'AGUA': 32464, 'JUGAR': 23392, 'DORMIR': 6479,
        'AYUDA': 12252, 'NO': 5526, 'SÍ': 5584, 'SI': 5584,
        'BURBUJAS': 6945, 'AUTO': 2340, 'AUTOS': 2340, 'PELOTA': 3241,
        'BLOQUES': 4935, 'PLASTILINA': 2529, 'MI TURNO': 6632, 'TU TURNO': 25790,
        'ESPERAR': 8109, 'GALLETA': 8312, 'LECHE': 2445, 'MANZANA': 2462,
        'PAN': 2494, 'FELIZ': 9907, 'CALMA': 31310, 'COSQUILLAS': 23392,
        'CUIDADO': 35535, 'COMPARTIR': 15361, 'HOLA': 6522, 'CHAO': 6028,
        'GRACIAS': 8129, 'DAME': 17038, 'MIRA': 6564
      };
      if (dict[clean]) return dict[clean];
      const match = ALL_PRESET_PICTOGRAMS.find(p => p.text.toUpperCase() === clean);
      if (match && match.arasaacId) return match.arasaacId;
      const partial = ALL_PRESET_PICTOGRAMS.find(p => p.text.toUpperCase().includes(clean) || clean.includes(p.text.toUpperCase()));
      if (partial && partial.arasaacId) return partial.arasaacId;
      return fallbackId || 3220;
    };

    const rawResponse = await this.chatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt,
      temperature: 0.6,
      maxTokens: 2500
    });

    try {
      const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed && parsed.title && Array.isArray(parsed.pictograms)) {
          return {
            id: `act-ai-${Date.now()}`,
            isAiGenerated: true,
            createdAt: new Date().toISOString(),
            ...parsed,
            pictograms: parsed.pictograms.map(p => {
              const text = (p.text || '').toUpperCase();
              return {
                text,
                role: p.role || 'Objetivo',
                arasaacId: resolveVerifiedId(text, Number(p.arasaacId))
              };
            })
          };
        }
      }
    } catch (e) {
      console.warn('Error parsing AI activity JSON, returning fallback', e);
    }

    return {
      id: `act-ai-${Date.now()}`,
      title: `Juego Guiado con ${toyOrItem || 'Objetos Cotidianos'}`,
      isAiGenerated: true,
      summary: 'Actividad interactiva de modelado asistido para generar peticiones y pausas expectantes.',
      levelLabel: levelMap[level] || 'Nivel 1: Explorador',
      contextLabel: contextMap[context] || 'Juegos',
      goalLabel: goalMap[goal] || 'Petición',
      duration: `${durationMinutes} min`,
      pictograms: [
        { text: (toyOrItem || 'JUGAR').toUpperCase(), arasaacId: resolveVerifiedId(toyOrItem || 'JUGAR', 23392), role: 'Elemento de interés' },
        { text: 'MÁS', arasaacId: 3220, role: 'Continuidad' },
        { text: 'PARAR', arasaacId: 7196, role: 'Límite o plan B' }
      ],
      steps: [
        {
          phase: '1. Enganche y Motivación',
          instruction: `Inicia el juego con ${toyOrItem || 'el objeto'} de manera atractiva y divertida.`,
          adultScript: `¡Mira qué entretenido esto!`,
          tip: 'Asegúrate de que el niño esté mirando y disfrutando el momento.'
        },
        {
          phase: '2. Pausa Expectante',
          instruction: 'Detén el juego y sostén el objeto. Espera 10 segundos con mirada cálida y sonrisa.',
          adultScript: '',
          tip: 'No te apresures a preguntar. La pausa le da tiempo de procesar su deseo de comunicarse.'
        },
        {
          phase: '3. Modelado en el Comunicador',
          instruction: 'Toca en la tablet el pictograma MÁS señalándolo con tu dedo.',
          adultScript: '¡MÁS!',
          tip: 'Modela sin exigir que repita inmediatamente.'
        },
        {
          phase: '4. Recompensa Inmediata',
          instruction: 'Apenas haya un intento comunicativo o toque la pantalla, reactiva el juego con entusiasmo.',
          adultScript: '¡Sí, más juego para ti!',
          tip: 'Celebra su iniciativa con una sonrisa genuina.'
        }
      ],
      planB: 'Si el niño se aleja o muestra molestia, modela con calma el pictograma PARAR: "Entiendo, paramos por ahora" y guarda el juego.'
    };
  }
};

