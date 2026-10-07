// ARASAAC API Service for Free Official AAC Pictograms

const ARASAAC_SEARCH_URL = 'https://api.arasaac.org/api/pictograms/es/search/';
const ARASAAC_IMAGE_BASE = 'https://static.arasaac.org/pictograms/';

class ArasaacService {
  constructor() {
    this.cache = new Map();
  }

  // Search pictograms by term (e.g., 'agua', 'manzana', 'feliz')
  async searchPictograms(term) {
    if (!term || term.trim() === '') return [];
    const cleanTerm = term.trim().toLowerCase();

    if (this.cache.has(cleanTerm)) {
      return this.cache.get(cleanTerm);
    }

    try {
      const response = await fetch(`${ARASAAC_SEARCH_URL}${encodeURIComponent(cleanTerm)}`);
      if (!response.ok) return [];
      const data = await response.json();
      
      const results = (Array.isArray(data) ? data : []).slice(0, 12).map(item => ({
        id: item._id,
        keyword: item.keywords && item.keywords[0] ? item.keywords[0].keyword : cleanTerm,
        imageUrl: `${ARASAAC_IMAGE_BASE}${item._id}/${item._id}_300.png`,
        categories: item.categories || []
      }));

      this.cache.set(cleanTerm, results);
      return results;
    } catch (error) {
      console.warn('ARASAAC API offline or unreachable:', error);
      return [];
    }
  }

  // Get image URL directly by ARASAAC ID
  getImageUrl(id, resolution = 300) {
    return `${ARASAAC_IMAGE_BASE}${id}/${id}_${resolution}.png`;
  }
}

export const arasaac = new ArasaacService();
export const getArasaacImageUrl = (id, resolution = 300) => arasaac.getImageUrl(id, resolution);
