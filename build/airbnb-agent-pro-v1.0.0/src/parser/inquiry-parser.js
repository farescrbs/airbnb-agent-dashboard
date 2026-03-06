/**
 * Enhanced Email Parser for Airbnb inquiries
 * Extracts key information and scores leads with multi-factor qualification
 */

class InquiryParser {
  constructor() {
    this.patterns = {
      // Extract dates like "27-28 juin", "5-6 août", "12 septembre"
      dates: /(\d{1,2})[-–—]?(?:\s*(\d{1,2})?)?\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/gi,
      
      // Extract guest counts
      guests: /(\d+)\s*(personnes?|invités?|adultes?|enfants?|pers\.?)/gi,
      
      // Extract event types
      events: /(mariage|anniversaire|cousinade|retrouvailles|baby.?shower|fête|baptême|repas|événement|evg|evjf|départ|retraite|séminaire|team.?building)/gi,
      
      // Extract names (Airbnb format)
      name: /^(\w+)\s*·\s*Responsable/i,
      
      // Extract inquiry vs booking
      inquiry: /Demande d'information/i,
      booking: /Demande de réservation/i,
      
      // Detect urgency keywords
      urgency: /(urgent|vite|rapidement|dépêcher|prochainement|cette semaine|la semaine prochaine|dans 2 semaines|asap)/i,
      
      // Detect flexible dates
      flexibleDates: /(flexible|souples|plusieurs dates|peut être reporté|décaler)/i,
      
      // Detect problematic requests
      badFit: /(feu d'artifice|bougies|lanternes|pétards|feu de camp|piscine|tente de reception|traiteur obligatoire|catering obligatoire)/i,
      
      // Detect price shopping
      priceShopping: /(moins cher|comparaison|autre proposition|plusieurs devis|prix concurrent)/i,
      
      // Detect short messages (lack of detail)
      shortMessage: /^.{0,100}$/s
    };
    
    // Month mapping for urgency calculation
    this.months = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
      'juillet': 6, 'août': 8, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
  }

  parse(emailBody, emailSubject = '') {
    const result = {
      raw: emailBody,
      extracted: {
        name: null,
        dates: [],
        guestCount: null,
        eventType: null,
        isInquiry: false,
        isBookingRequest: false,
        questions: [],
        visitRequested: false,
        messageLength: emailBody.length,
        hasUrgency: false,
        hasFlexibleDates: false,
        hasBadFit: false,
        hasPriceShopping: false,
        isShortMessage: false
      },
      qualification: {
        score: 0, // 0-100
        tier: null, // 'hot', 'warm', 'cold', 'reject'
        fitsCapacity: null,
        fitsDates: null,
        eventSuitable: null,
        needsClarification: false,
        requiresManualReview: false,
        redFlags: [],
        positiveSignals: [],
        daysUntilEvent: null
      }
    };

    // Detect inquiry type
    result.extracted.isInquiry = this.patterns.inquiry.test(emailSubject) || 
                                  this.patterns.inquiry.test(emailBody);
    result.extracted.isBookingRequest = this.patterns.booking.test(emailSubject);

    // Extract name
    const nameMatch = emailBody.match(this.patterns.name);
    if (nameMatch) {
      result.extracted.name = nameMatch[1];
    }

    // Extract dates
    const dateMatches = [...emailBody.matchAll(this.patterns.dates)];
    result.extracted.dates = dateMatches.map(m => ({
      day: parseInt(m[1]),
      endDay: m[2] ? parseInt(m[2]) : null,
      month: m[3].toLowerCase()
    }));

    // Extract guest count (take the highest number found)
    const guestMatches = [...emailBody.matchAll(this.patterns.guests)];
    if (guestMatches.length > 0) {
      const counts = guestMatches.map(m => parseInt(m[1]));
      result.extracted.guestCount = Math.max(...counts);
    }

    // Extract event type
    const eventMatches = [...emailBody.matchAll(this.patterns.events)];
    if (eventMatches.length > 0) {
      const rawEvent = eventMatches[0][1].toLowerCase();
      result.extracted.eventType = this._normalizeEventType(rawEvent);
    }

    // Detect various signals
    result.extracted.hasUrgency = this.patterns.urgency.test(emailBody);
    result.extracted.hasFlexibleDates = this.patterns.flexibleDates.test(emailBody);
    result.extracted.hasBadFit = this.patterns.badFit.test(emailBody);
    result.extracted.hasPriceShopping = this.patterns.priceShopping.test(emailBody);
    result.extracted.isShortMessage = this.patterns.shortMessage.test(emailBody);

    // Detect common questions
    result.extracted.questions = this._detectQuestions(emailBody);
    result.extracted.visitRequested = /visite|visiter|voir le lieu|rendez-vous/i.test(emailBody);

    // Calculate days until event
    result.qualification.daysUntilEvent = this._calculateDaysUntilEvent(result.extracted.dates);

    // Run qualification
    this._qualify(result);

    return result;
  }

  _normalizeEventType(raw) {
    const mapping = {
      'mariage': 'wedding',
      'anniversaire': 'birthday',
      'cousinade': 'family_gathering',
      'retrouvailles': 'reunion',
      'babyshower': 'baby_shower',
      'baby shower': 'baby_shower',
      'fête': 'party',
      'baptême': 'baptism',
      'repas': 'dinner',
      'evg': 'evg',
      'evjf': 'evjf',
      'départ': 'farewell',
      'retraite': 'retirement',
      'séminaire': 'seminar',
      'seminaire': 'seminar',
      'team building': 'team_building',
      'team-building': 'team_building'
    };
    return mapping[raw] || raw;
  }

  _detectQuestions(text) {
    const questions = [];
    const checks = [
      { pattern: /couchage|dormir|chambre|logement|nuitée/i, question: 'sleeping' },
      { pattern: /capacité|accueillir|place|places/i, question: 'capacity' },
      { pattern: /horaire|quelle heure|jusqu'à|commence|fini/i, question: 'hours' },
      { pattern: /équipement|frigo|bbq|barbecue|table|chaise|cuisine/i, question: 'equipment' },
      { pattern: /musique|bruit|sono|dj|sonorisation/i, question: 'music' },
      { pattern: /prix|tarif|devis|combien|coût|budget/i, question: 'pricing' },
      { pattern: /visite|visiter|voir|déplacement|rendez-vous/i, question: 'visit' },
      { pattern: /annulation|remboursement|conditions/i, question: 'cancellation' }
    ];

    for (const check of checks) {
      if (check.pattern.test(text)) {
        questions.push(check.question);
      }
    }

    return questions;
  }

  _calculateDaysUntilEvent(dates) {
    if (dates.length === 0) return null;
    
    const today = new Date();
    const eventDate = new Date();
    const d = dates[0];
    
    // Estimate current year, adjust if month passed
    let year = today.getFullYear();
    const month = this.months[d.month];
    
    if (month < today.getMonth()) {
      year += 1;
    }
    
    eventDate.setFullYear(year, month, d.day);
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  _qualify(result) {
    const config = require('../config.json');
    const { extracted, qualification } = result;
    
    // Start with base score
    let score = 0;
    const redFlags = [];
    const positiveSignals = [];

    // === POSITIVE SIGNALS ===
    
    // 1. Complete information (+25)
    if (extracted.guestCount && extracted.dates.length > 0 && extracted.eventType) {
      score += 25;
      positiveSignals.push('Demande complète (date, personnes, événement)');
    } else if (extracted.dates.length > 0 && extracted.eventType) {
      // Partial: date + event type but missing guest count (+15)
      score += 15;
      positiveSignals.push('Demande partielle (date et événement)');
    }
    
    // 2. Visit requested (+15) - shows serious intent
    if (extracted.visitRequested) {
      score += 15;
      positiveSignals.push('Visite demandée (intention sérieuse)');
    }
    
    // 3. Detailed message (+10)
    if (extracted.messageLength > 300) {
      score += 10;
      positiveSignals.push('Message détaillé');
    }
    
    // 4. Ideal event type (+10)
    const idealEvents = ['birthday', 'family_gathering', 'reunion', 'baby_shower', 'dinner'];
    if (idealEvents.includes(extracted.eventType)) {
      score += 10;
      positiveSignals.push('Type d\'événement idéal');
    }
    
    // 5. Reasonable advance notice (+10 for 2 weeks to 3 months)
    if (qualification.daysUntilEvent !== null) {
      if (qualification.daysUntilEvent >= 14 && qualification.daysUntilEvent <= 90) {
        score += 10;
        positiveSignals.push('Délai raisonnable (2 semaines - 3 mois)');
      } else if (qualification.daysUntilEvent > 90) {
        score += 5;
        positiveSignals.push('Réservation anticipée');
      }
    }
    
    // 6. Flexible dates (+5)
    if (extracted.hasFlexibleDates) {
      score += 5;
      positiveSignals.push('Dates flexibles');
    }

    // === CAPACITY CHECK ===
    if (extracted.guestCount) {
      if (extracted.guestCount <= config.property.max_capacity) {
        score += 15;
        qualification.fitsCapacity = true;
        
        // Bonus for sweet spot (20-35 people)
        if (extracted.guestCount >= 20 && extracted.guestCount <= 35) {
          score += 5;
          positiveSignals.push('Taille de groupe optimale (20-35 pers)');
        }
      } else {
        score -= 50; // Major penalty
        qualification.fitsCapacity = false;
        redFlags.push(`CAPACITÉ DÉPASSÉE: ${extracted.guestCount} > ${config.property.max_capacity}`);
      }
    } else {
      qualification.needsClarification = true;
      redFlags.push('Nombre de personnes non précisé');
    }
    
    // === NEGATIVE SIGNALS / RED FLAGS ===
    
    // 1. Capacity confusion (sleeping questions) - mild penalty
    if (extracted.questions.includes('sleeping')) {
      score -= 5;
      redFlags.push('Question sur couchage');
    }
    
    // 2. Bad fit events/requests
    if (extracted.hasBadFit) {
      score -= 30;
      redFlags.push('Demande non conforme (feu, piscine, etc.)');
    }
    
    // 3. Price shopping - mild penalty
    if (extracted.hasPriceShopping) {
      score -= 5;
      redFlags.push('Comparaison de prix');
    }
    
    // 4. Too short message (mild penalty)
    if (extracted.isShortMessage) {
      score -= 5;
      redFlags.push('Message court (détails manquants)');
      qualification.needsClarification = true;
    }
    
    // 5. Urgency without details
    if (extracted.hasUrgency && extracted.messageLength < 200) {
      score -= 10;
      redFlags.push('Urgence sans détails suffisants');
    }
    
    // 6. Very last minute (< 1 week)
    if (qualification.daysUntilEvent !== null && qualification.daysUntilEvent < 7) {
      score -= 10;
      redFlags.push('Délai très court (< 1 semaine)');
    }

    // === SPECIAL HANDLING ===
    
    // Events requiring manual review (never auto-send) but don't reject
    const manualReviewEvents = ['wedding', 'evg', 'evjf'];
    if (manualReviewEvents.includes(extracted.eventType)) {
      qualification.requiresManualReview = true;
      redFlags.push(`Événement à évaluer: ${extracted.eventType}`);
      // Don't penalize score heavily, just flag for review
    }
    
    // If in evaluate list, mild penalty
    if (config.events_to_evaluate.includes(extracted.eventType)) {
      score -= 10;
    }

    // === FINAL SCORE ===
    qualification.score = Math.max(0, Math.min(100, score));
    qualification.redFlags = redFlags;
    qualification.positiveSignals = positiveSignals;
    
    // Determine tier (adjusted thresholds for realistic scoring)
    if (qualification.score >= 75 && redFlags.length === 0 && !qualification.requiresManualReview) {
      qualification.tier = 'hot';
    } else if (qualification.score >= 50) {
      qualification.tier = 'warm';
    } else if (qualification.score >= 25) {
      qualification.tier = 'cold';
    } else {
      qualification.tier = 'reject';
    }
  }
}

module.exports = InquiryParser;
