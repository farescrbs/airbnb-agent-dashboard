/**
 * Response Templates for Airbnb inquiries
 * Generates personalized responses based on inquiry analysis
 */

const config = require('../config.json');

class ResponseGenerator {
  constructor() {
    this.templates = {
      // Clarification needed - they think there's sleeping accommodation
      sleeping_clarification: `Bonjour {{name}},

Merci pour votre intérêt !

Je tiens à préciser un point important : il s'agit **uniquement d'un espace extérieur**, sans possibilité de couchage sur place. C'est un cadre idéal pour {{event_type}} en plein air, mais vos invités devront regagner leur domicile en fin de soirée.

Concernant votre demande :
- **Date** : {{dates}}
- **Nombre de personnes** : {{guest_count}}
- **Capacité** : {{max_capacity}} personnes maximum ✓

Équipements inclus : {{equipment_list}}

Le tarif pour cette configuration est de **{{price}}€**.

Cela correspond toujours à votre projet ?

Bonne journée,
Setty`,

      // Standard positive response
      standard_positive: `Bonjour {{name}},

Merci pour votre message ! Votre {{event_type}} du {{dates}} pour {{guest_count}} personnes est tout à fait envisageable.

✓ Capacité : {{guest_count}}/{{max_capacity}} personnes
✓ Date : disponible à confirmer
✓ Équipements : {{equipment_list}}
✓ Horaires : {{hours}}
✓ Musique : autorisée jusqu'à {{music_end}}

**Tarif** : {{price}}€ pour la journée

Visite possible avant de réserver ? {{visit_allowed}}.

À bientôt,
Setty`,

      // High capacity / special event
      special_event: `Bonjour {{name}},

Félicitations pour vos {{event_type}} ! 🎉

Pour {{guest_count}} personnes le {{dates}}, c'est faisable. Voici les détails :

✓ Capacité : {{guest_count}}/{{max_capacity}} personnes
✓ Horaires : {{hours}} (libre gestion de votre journée)
✓ Configuration : extérieur uniquement, pas de couchage
✓ Équipements : {{equipment_list}}
✓ Musique : jusqu'à {{music_end}}

**Tarif** : {{price}}€

Une visite vous aiderait à vous projeter ? Je suis flexible sur les créneaux.

Cordialement,
Setty`,

      // Visit request response
      visit_response: `Bonjour {{name}},

Avec plaisir pour une visite !

Prochains créneaux disponibles :
- {{slot_1}}
- {{slot_2}}
- {{slot_3}}

À votre convenance,
Setty`,

      // Capacity exceeded
      capacity_exceeded: `Bonjour {{name}},

Merci pour votre intérêt. Malheureusement, votre événement de {{guest_count}} personnes dépasse notre capacité maximale de {{max_capacity}} personnes.

Pour la sécurité et le confort de tous, nous ne pouvons pas déroger à cette limite.

Je vous souhaite de trouver un lieu adapté à votre projet.

Cordialement,
Setty`,

      // Follow-up after no response
      follow_up: `Bonjour {{name}},

Je me permets de relancer suite à mon message précédent concernant votre {{event_type}} du {{dates}}.

Les dates commencent à se remplir, n'hésitez pas si vous souhaitez réserver ou visiter.

À bientôt,
Setty`
    };
  }

  generate(inquiry, templateName = null, enrichment = null) {
    // Auto-select template if not specified
    if (!templateName) {
      templateName = this._selectTemplate(inquiry);
    }

    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // Build context for template variables
    const context = this._buildContext(inquiry, enrichment);

    // Add enrichment data if available
    if (enrichment) {
      context.enrichment = this._formatEnrichment(enrichment);
    }

    // Replace variables
    let response = this._render(template, context);

    // Append enrichment section if relevant
    if (enrichment && context.enrichment) {
      response += '\n\n' + context.enrichment;
    }

    return response;
  }

  _formatEnrichment(enrichment) {
    const sections = [];

    // Weather section
    if (enrichment.weather && enrichment.weather.summary) {
      const { temperatures, conditions } = enrichment.weather.summary;
      if (temperatures || conditions) {
        let weatherText = '🌤️ **Météo prévue** :';
        if (conditions && conditions.length > 0) {
          weatherText += ` Conditions ${conditions.join(', ')}`;
        }
        if (temperatures && temperatures.length > 0) {
          weatherText += ` (autour de ${temperatures[0]})`;
        }
        sections.push(weatherText);
      }
    }

    // Local events warning
    if (enrichment.localEvents && enrichment.localEvents.hasImpact) {
      sections.push('⚠️ **Note** : Des événements locaux sont prévus ce jour (festival, concert, etc.). Prévoyez un peu de marge pour l\'accès.');
    }

    // Seasonal tips - cleaned up
    if (enrichment.seasonalTips && enrichment.seasonalTips.summary) {
      const { keyAdvice } = enrichment.seasonalTips.summary;
      if (keyAdvice && keyAdvice.length > 0) {
        // Clean up the advice text
        let advice = keyAdvice[0];
        // Remove URLs and markdown
        advice = advice.replace(/https?:\/\/\S+/g, '');
        advice = advice.replace(/\*\*/g, '');
        advice = advice.replace(/\(relevance:[^)]+\)/gi, '');
        advice = advice.trim();
        if (advice.length > 10) {
          sections.push(`💡 **Conseil** : ${advice}`);
        }
      }
    }

    return sections.length > 0 ? sections.join('\n\n') : '';
  }

  _selectTemplate(inquiry) {
    const { extracted, qualification } = inquiry;

    // Priority checks
    if (!qualification.fitsCapacity && extracted.guestCount > config.property.max_capacity) {
      return 'capacity_exceeded';
    }

    if (extracted.questions.includes('sleeping') || extracted.questions.includes('visit')) {
      return 'sleeping_clarification';
    }

    if (extracted.visitRequested) {
      return 'visit_response';
    }

    if (['wedding', 'birthday', 'family_gathering'].includes(extracted.eventType)) {
      return 'special_event';
    }

    return 'standard_positive';
  }

  _buildContext(inquiry, enrichment = null) {
    const { extracted } = inquiry;
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    // Format dates
    let dateStr = 'date à confirmer';
    if (extracted.dates.length > 0) {
      const d = extracted.dates[0];
      dateStr = `${d.day}`;
      if (d.endDay) {
        dateStr += `-${d.endDay}`;
      }
      dateStr += ` ${d.month}`;
    }

    // Format event type
    const eventLabels = {
      'wedding': 'mariage',
      'birthday': 'anniversaire',
      'family_gathering': 'cousinade',
      'reunion': 'retrouvailles',
      'baby_shower': 'baby shower',
      'party': 'fête',
      'baptism': 'baptême',
      'evg': 'EVG',
      'evjf': 'EVJF',
      'entreprise': 'événement d\'entreprise',
      'team_building': 'team building',
      'seminaire': 'séminaire'
    };

    // Calculate price with new rules
    let price = config.pricing.base_day_rate;
    let priceBreakdown = [`Base: ${config.pricing.base_day_rate}€`];
    
    if (extracted.guestCount > config.pricing.large_group_threshold) {
      price += config.pricing.large_group_surcharge;
      priceBreakdown.push(`Groupe +${config.pricing.large_group_threshold} pers: +${config.pricing.large_group_surcharge}€`);
    }

    // Check if weekend (simplified - would need actual date check)
    // For now, we'll let the user add weekend surcharge manually if needed

    return {
      name: extracted.name || 'Madame, Monsieur',
      event_type: eventLabels[extracted.eventType] || 'événement',
      dates: dateStr,
      guest_count: extracted.guestCount || '?',
      max_capacity: config.property.max_capacity,
      equipment_list: config.equipment.join(', '),
      price: price,
      price_breakdown: priceBreakdown.join('\n'),
      hours: `${config.hours.start} à ${config.hours.end}`,
      music_end: config.policies.music_end_time,
      visit_allowed: config.policies.visits_allowed ? 'Oui, sur rendez-vous' : 'Non',
      visit_slots: 'sur rendez-vous',
      slot_1: 'ce dimanche après-midi',
      slot_2: 'lundi ou mardi soir',
      slot_3: 'mercredi matin'
    };
  }

  _render(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    });
  }
}

module.exports = ResponseGenerator;
