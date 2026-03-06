/**
 * Web Enrichment Module for Airbnb Agent
 * Uses Tavily to fetch contextual information for responses
 */

const { execSync } = require('child_process');
const path = require('path');

class WebEnrichment {
  constructor(options = {}) {
    this.tavilyScript = options.tavilyScript || path.join(__dirname, '../../../skills/tavily-search/scripts/search.mjs');
    this.enabled = options.enabled !== false;
    this.cache = new Map();
    this.cacheTTL = 3600000; // 1 hour
  }

  /**
   * Enrich inquiry with web data
   * @param {Object} inquiry - Parsed inquiry object
   * @returns {Object} Enrichment data
   */
  async enrich(inquiry) {
    if (!this.enabled) return null;

    const enrichment = {
      weather: null,
      localEvents: null,
      seasonalTips: null,
      competitorPricing: null,
      locationReviews: null,
      fetchedAt: new Date().toISOString()
    };

    const { dates, eventType } = inquiry.extracted;
    const location = 'Verfeil, Haute-Garonne, France';

    // Get weather if date is within 14 days
    if (dates.length > 0) {
      const daysUntil = this._calculateDaysUntil(dates[0]);
      if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0) {
        enrichment.weather = await this._getWeather(dates[0], location);
      }
    }

    // Get local events for the date
    if (dates.length > 0) {
      enrichment.localEvents = await this._getLocalEvents(dates[0], location);
    }

    // Get seasonal tips based on event type and month
    if (dates.length > 0) {
      enrichment.seasonalTips = await this._getSeasonalTips(dates[0].month, eventType);
    }

    // Get competitor pricing
    enrichment.competitorPricing = await this._getCompetitorPricing(location, dates[0]);

    // Get location reviews and highlights
    enrichment.locationReviews = await this._getLocationReviews(location);

    return enrichment;
  }

  /**
   * Get weather forecast for a date
   */
  async _getWeather(dateObj, location) {
    const cacheKey = `weather_${dateObj.day}_${dateObj.month}_${location}`;
    if (this._isCached(cacheKey)) return this._getCache(cacheKey);

    try {
      const query = `météo prévisions ${location} ${dateObj.day} ${dateObj.month} 2025`;
      const result = this._tavilySearch(query, 3);
      
      const weather = {
        query,
        forecast: result,
        summary: this._extractWeatherSummary(result)
      };

      this._setCache(cacheKey, weather);
      return weather;
    } catch (e) {
      console.error('Weather fetch failed:', e.message);
      return null;
    }
  }

  /**
   * Get local events that might impact the booking
   */
  async _getLocalEvents(dateObj, location) {
    const cacheKey = `events_${dateObj.day}_${dateObj.month}_${location}`;
    if (this._isCached(cacheKey)) return this._getCache(cacheKey);

    try {
      const query = `événements ${location} ${dateObj.day} ${dateObj.month} 2025 festival concert manifestation`;
      const result = this._tavilySearch(query, 3);

      const events = {
        query,
        events: result,
        hasImpact: this._checkEventImpact(result)
      };

      this._setCache(cacheKey, events);
      return events;
    } catch (e) {
      console.error('Events fetch failed:', e.message);
      return null;
    }
  }

  /**
   * Get seasonal tips for the event
   */
  async _getSeasonalTips(month, eventType) {
    const cacheKey = `tips_${month}_${eventType || 'general'}`;
    if (this._isCached(cacheKey)) return this._getCache(cacheKey);

    try {
      const monthNames = {
        'janvier': 'janvier', 'février': 'février', 'mars': 'mars', 'avril': 'avril',
        'mai': 'mai', 'juin': 'juin', 'juillet': 'juillet', 'août': 'août',
        'septembre': 'septembre', 'octobre': 'octobre', 'novembre': 'novembre', 'décembre': 'décembre'
      };

      const monthName = monthNames[month.toLowerCase()] || month;
      const eventContext = eventType ? `pour ${eventType}` : '';
      
      const query = `conseils organisation événement extérieur ${monthName} ${eventContext} météo température`;
      const result = this._tavilySearch(query, 3);

      const tips = {
        query,
        tips: result,
        summary: this._extractSeasonalSummary(result, monthName)
      };

      this._setCache(cacheKey, tips);
      return tips;
    } catch (e) {
      console.error('Seasonal tips fetch failed:', e.message);
      return null;
    }
  }

  /**
   * Execute Tavily search
   */
  _tavilySearch(query, count = 5) {
    try {
      const cmd = `node "${this.tavilyScript}" "${query}" -n ${count}`;
      const output = execSync(cmd, { 
        encoding: 'utf8',
        timeout: 30000,
        env: { ...process.env, TAVILY_API_KEY: process.env.TAVILY_API_KEY }
      });
      return output;
    } catch (e) {
      console.error('Tavily search error:', e.message);
      return null;
    }
  }

  /**
   * Extract weather summary from Tavily results
   */
  _extractWeatherSummary(result) {
    if (!result) return null;
    
    // Look for temperature and conditions in result
    const tempMatch = result.match(/(\d+)°C?/g);
    const conditionMatch = result.match(/(ensoleillé|nuageux|pluvieux|orageux|dégagé|couvert)/gi);
    
    return {
      temperatures: tempMatch ? tempMatch.slice(0, 3) : null,
      conditions: conditionMatch ? [...new Set(conditionMatch)] : null
    };
  }

  /**
   * Check if local events might impact the booking
   */
  _checkEventImpact(result) {
    if (!result) return false;
    
    const impactKeywords = /(festival|concert|manifestation|fermeture|route|travaux|grève)/gi;
    return impactKeywords.test(result);
  }

  /**
   * Extract seasonal summary
   */
  _extractSeasonalSummary(result, month) {
    if (!result) return null;

    // Extract temperature mentions
    const tempMatch = result.match(/(\d+)°C?/g);
    
    // Extract practical advice sentences (cleaner patterns)
    const advicePatterns = [
      /prévoir[^.]*\./gi,
      /penser[^.]*\./gi,
      /recommandé[^.]*\./gi,
      /conseillé[^.]*\./gi,
      /important[^.]*\./gi,
      /n'oubliez[^.]*\./gi,
      /pensez[^.]*\./gi
    ];
    
    let keyAdvice = [];
    for (const pattern of advicePatterns) {
      const matches = result.match(pattern);
      if (matches) {
        keyAdvice.push(...matches);
      }
    }
    
    // Clean up and limit
    keyAdvice = keyAdvice
      .map(a => a.trim())
      .filter(a => a.length > 15 && a.length < 150)
      .slice(0, 2);

    return {
      month,
      temperatureInfo: tempMatch ? `${tempMatch[0]} en moyenne` : null,
      keyAdvice: keyAdvice.length > 0 ? keyAdvice : null
    };
  }

  /**
   * Calculate days until event
   */
  _calculateDaysUntil(dateObj) {
    const today = new Date();
    const eventDate = new Date();
    
    const months = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
      'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };

    const month = months[dateObj.month.toLowerCase()];
    if (month === undefined) return null;

    let year = today.getFullYear();
    if (month < today.getMonth()) year += 1;

    eventDate.setFullYear(year, month, dateObj.day);
    const diffTime = eventDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get competitor pricing in the area
   */
  async _getCompetitorPricing(location, dateObj) {
    const cacheKey = `pricing_${location}`;
    if (this._isCached(cacheKey)) return this._getCache(cacheKey);

    try {
      const query = `location salle extérieur événement ${location} prix tarif journée`;
      const result = this._tavilySearch(query, 5);

      const pricing = {
        query,
        results: result,
        priceRange: this._extractPriceRange(result),
        positioning: this._analyzePositioning(result)
      };

      this._setCache(cacheKey, pricing);
      return pricing;
    } catch (e) {
      console.error('Competitor pricing fetch failed:', e.message);
      return null;
    }
  }

  /**
   * Get location reviews and highlights from Google Maps, etc.
   */
  async _getLocationReviews(location) {
    const cacheKey = `reviews_${location}`;
    if (this._isCached(cacheKey)) return this._getCache(cacheKey);

    try {
      // Search for reviews and highlights
      const query = `${location} avis Google Maps extérieur événement`;
      const result = this._tavilySearch(query, 5);

      // Search for nearby attractions
      const attractionsQuery = `que faire ${location} Toulouse alentours attractions`;
      const attractionsResult = this._tavilySearch(attractionsQuery, 3);

      const reviews = {
        query,
        results: result,
        highlights: this._extractHighlights(result),
        nearbyAttractions: this._extractAttractions(attractionsResult),
        sentiment: this._analyzeSentiment(result)
      };

      this._setCache(cacheKey, reviews);
      return reviews;
    } catch (e) {
      console.error('Location reviews fetch failed:', e.message);
      return null;
    }
  }

  /**
   * Extract price range from search results
   */
  _extractPriceRange(result) {
    if (!result) return null;

    // Look for price patterns
    const priceMatches = result.match(/(\d{2,4})\s*€/g);
    if (!priceMatches) return null;

    const prices = priceMatches
      .map(p => parseInt(p.replace(/[^0-9]/g, '')))
      .filter(p => p >= 200 && p <= 5000); // Reasonable range for venues

    if (prices.length === 0) return null;

    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return { min, max, avg, sample: prices.length };
  }

  /**
   * Analyze positioning vs competitors
   */
  _analyzePositioning(result) {
    if (!result) return null;

    const lowerMatch = result.match(/(moins cher|abordable|économique|petit budget)/gi);
    const premiumMatch = result.match(/(luxe|prestige|haut de gamme|premium)/gi);
    const midMatch = result.match(/(qualité|rapport qualité|correct|standard)/gi);

    let positioning = 'mid';
    if (lowerMatch && lowerMatch.length > 2) positioning = 'budget';
    if (premiumMatch && premiumMatch.length > 2) positioning = 'premium';

    return {
      level: positioning,
      indicators: {
        budget: lowerMatch ? lowerMatch.length : 0,
        premium: premiumMatch ? premiumMatch.length : 0,
        mid: midMatch ? midMatch.length : 0
      }
    };
  }

  /**
   * Extract highlights from reviews
   */
  _extractHighlights(result) {
    if (!result) return [];

    const positivePatterns = [
      /(magnifique|superbe|excellent|parfait|génial|top|recommande)[^.]*\./gi,
      /(belle|beau|agréable|spacieux|lumineux|calme)[^.]*\./gi,
      /(accueil|hôte|propriétaire)[^.]*(sympa|gentil|disponible|aimable)[^.]*\./gi
    ];

    let highlights = [];
    for (const pattern of positivePatterns) {
      const matches = result.match(pattern);
      if (matches) {
        highlights.push(...matches.slice(0, 2));
      }
    }

    return highlights
      .map(h => h.trim().replace(/\*\*/g, ''))
      .filter(h => h.length > 10 && h.length < 120)
      .slice(0, 3);
  }

  /**
   * Extract nearby attractions
   */
  _extractAttractions(result) {
    if (!result) return [];

    // Look for attraction mentions
    const attractionPattern = /(château|musée|parc|jardin|lac|montagne|randonnée|visite|touristique)[^.]*\./gi;
    const matches = result.match(attractionPattern);

    if (!matches) return [];

    return matches
      .map(m => m.trim())
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 3);
  }

  /**
   * Analyze sentiment from reviews
   */
  _analyzeSentiment(result) {
    if (!result) return null;

    const positiveWords = /(excellent|parfait|génial|super|magnifique|adore|recommande|5 étoiles)/gi;
    const negativeWords = /(déçu|mauvais|problème|évitez|déconseille|nul|horrible)/gi;

    const positive = (result.match(positiveWords) || []).length;
    const negative = (result.match(negativeWords) || []).length;

    let sentiment = 'neutral';
    if (positive > negative + 2) sentiment = 'positive';
    if (negative > positive) sentiment = 'negative';

    return {
      overall: sentiment,
      positive,
      negative,
      score: positive - negative
    };
  }

  // Cache helpers
  _isCached(key) {
    if (!this.cache.has(key)) return false;
    const { timestamp } = this.cache.get(key);
    return Date.now() - timestamp < this.cacheTTL;
  }

  _getCache(key) {
    return this.cache.get(key).data;
  }

  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

module.exports = WebEnrichment;
