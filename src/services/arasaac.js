import { OFFLINE_ARASAAC_CATALOG as offlineCatalog } from '../data/arasaac_catalog.js';

const ARASAAC_SEARCH_URL = 'https://api.arasaac.org/api/pictograms/es/search/';
const ARASAAC_IMAGE_BASE = 'https://static.arasaac.org/pictograms/';

/**
 * Remove accents/diacritics and normalize text for reliable Spanish search
 * e.g., 'MAMÁ' -> 'mama', 'CAMIÓN' -> 'camion', 'plátano' -> 'platano'
 */
export function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const INVARIANT_WORDS = new Set([
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes',
  'cumpleanos', 'paraguas', 'tres', 'pais', 'mes', 'bus', 'tos', 'gas'
]);

/**
 * Robust Spanish singularization for plural search queries
 * e.g. 'galletas' -> 'galleta', 'camiones' -> 'camion', 'lapices' -> 'lapiz'
 */
export function getSingularTerm(term) {
  if (!term || term.length <= 3) return term;
  const norm = normalizeText(term);
  if (INVARIANT_WORDS.has(norm)) return norm;

  // Words ending in 'ces' -> 'z' (e.g. lapices -> lapiz, peces -> pez, luces -> luz)
  if (norm.endsWith('ces') && norm.length >= 4) {
    return norm.slice(0, -3) + 'z';
  }

  // Words ending in 'es' after consonant (e.g. camiones -> camion, flores -> flor, colores -> color)
  if (norm.endsWith('es') && norm.length > 4) {
    const withoutEs = norm.slice(0, -2);
    // Don't strip if ends with vowel + es like 'pies' -> 'pie'
    const lastChar = withoutEs.slice(-1);
    if (!['a', 'e', 'i', 'o', 'u'].includes(lastChar)) {
      return withoutEs;
    }
  }

  // Standard plurals ending in 's' after vowel
  if (norm.endsWith('s')) {
    return norm.slice(0, -1);
  }

  return norm;
}

/**
 * Find the keyword that best matches what the user actually searched for,
 * preventing Iberian Spanish overrides (e.g., picking 'auto' instead of 'coche')
 */
function findBestKeyword(keywords, query) {
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return query;
  }

  const normQ = normalizeText(query);
  const singularQ = getSingularTerm(normQ);

  // 1. Exact match
  const exact = keywords.find(k => normalizeText(k.keyword) === normQ);
  if (exact) return exact.keyword;

  // 2. Singular match
  const singularMatch = keywords.find(k => normalizeText(k.keyword) === singularQ);
  if (singularMatch) return singularMatch.keyword;

  // 3. Keyword starts with query
  const starts = keywords.find(k => normalizeText(k.keyword).startsWith(normQ));
  if (starts) return starts.keyword;

  // 4. Keyword contains query
  const contains = keywords.find(k => normalizeText(k.keyword).includes(normQ));
  if (contains) return contains.keyword;

  // 5. Fallback to first keyword
  return keywords[0].keyword;
}

class ArasaacService {
  constructor() {
    this.cache = new Map();
  }

  // Get offline dictionary matches instantly
  getOfflineMatches(query) {
    if (!query || !query.trim()) return [];
    const normQ = normalizeText(query);
    const singularQ = getSingularTerm(normQ);
    const results = [];

    for (const [word, id] of Object.entries(offlineCatalog)) {
      const normWord = normalizeText(word);
      let matchScore = 0;

      if (normWord === normQ) {
        matchScore = 100;
      } else if (normWord === singularQ) {
        matchScore = 90;
      } else if (normWord.startsWith(normQ)) {
        matchScore = 80;
      } else if (normWord.includes(normQ)) {
        matchScore = 60;
      }

      if (matchScore > 0) {
        results.push({
          id: `arasaac-${id}`,
          arasaacId: id,
          keyword: word,
          text: word.toUpperCase(),
          imageUrl: `${ARASAAC_IMAGE_BASE}${id}/${id}_300.png`,
          category: 'Catálogo ARASAAC',
          type: 'noun',
          isArasaac: true,
          score: matchScore
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Search pictograms by term (online with offline fallback)
  async searchPictograms(term) {
    if (!term || term.trim() === '') return [];
    const cleanTerm = term.trim().toLowerCase();
    const normalizedTerm = normalizeText(cleanTerm);
    const singularTerm = getSingularTerm(normalizedTerm);

    if (this.cache.has(normalizedTerm)) {
      return this.cache.get(normalizedTerm);
    }

    const offlineMatches = this.getOfflineMatches(cleanTerm);

    const fetchTerm = async (query) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      try {
        const response = await fetch(`${ARASAAC_SEARCH_URL}${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        clearTimeout(timeoutId);
        return [];
      }
    };

    try {
      // 1. Try original term online
      let data = await fetchTerm(cleanTerm);

      // 2. If no results and term had accents, try normalized term
      if ((!data || data.length === 0) && cleanTerm !== normalizedTerm) {
        data = await fetchTerm(normalizedTerm);
      }

      // 3. If still empty, try singular term
      if ((!data || data.length === 0) && singularTerm !== normalizedTerm) {
        data = await fetchTerm(singularTerm);
      }

      const onlineResults = (Array.isArray(data) ? data : []).map(item => {
        const bestKeyword = findBestKeyword(item.keywords, cleanTerm);
        return {
          id: `arasaac-${item._id}`,
          arasaacId: item._id,
          keyword: bestKeyword,
          text: bestKeyword.toUpperCase(),
          imageUrl: `${ARASAAC_IMAGE_BASE}${item._id}/${item._id}_300.png`,
          categories: item.categories || [],
          category: 'Catálogo Oficial ARASAAC',
          type: (item.keywords && item.keywords[0]?.type === 3) ? 'verb' : 'noun',
          isArasaac: true
        };
      });

      // Merge online and offline results, deduplicating by arasaacId and normalized keyword
      const seenIds = new Set();
      const seenWords = new Set();
      const combined = [];

      for (const item of onlineResults) {
        const wordKey = normalizeText(item.keyword);
        if (!seenIds.has(item.arasaacId) && !seenWords.has(wordKey)) {
          seenIds.add(item.arasaacId);
          seenWords.add(wordKey);
          combined.push(item);
        }
      }

      for (const item of offlineMatches) {
        const wordKey = normalizeText(item.keyword);
        if (!seenIds.has(item.arasaacId) && !seenWords.has(wordKey)) {
          seenIds.add(item.arasaacId);
          seenWords.add(wordKey);
          combined.push(item);
        }
      }

      const finalResults = combined.slice(0, 24);
      this.cache.set(normalizedTerm, finalResults);
      return finalResults;
    } catch (error) {
      console.warn('ARASAAC API offline, using local dictionary:', error);
      return offlineMatches;
    }
  }

  // Get image URL directly by ARASAAC ID
  getImageUrl(id, resolution = 300) {
    return `${ARASAAC_IMAGE_BASE}${id}/${id}_${resolution}.png`;
  }
}

export const arasaac = new ArasaacService();
export const getArasaacImageUrl = (id, resolution = 300) => arasaac.getImageUrl(id, resolution);
