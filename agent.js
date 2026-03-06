/**
 * Main Airbnb Agent Orchestrator
 * Coordinates parsing, qualification, and response generation
 */

const InquiryParser = require('./parser/inquiry-parser');
const ResponseGenerator = require('./responder/response-generator');
const WebEnrichment = require('./enrichment/web-enrichment');
const config = require('./config.json');

class AirbnbAgent {
  constructor(options = {}) {
    this.parser = new InquiryParser();
    this.responder = new ResponseGenerator();
    this.enrichment = new WebEnrichment({
      enabled: options.webEnrichment ?? config.web_enrichment ?? true
    });
    this.requireApproval = options.requireApproval ?? config.approval_required;
    this.autoRespond = options.autoRespond ?? config.auto_respond;
    
    // Pending queue for manual approval
    this.pendingQueue = [];
  }

  /**
   * Process a new inquiry
   * @param {string} emailBody - Raw email content
   * @param {string} emailSubject - Email subject line
   * @returns {Object} Processing result with response and status
   */
  async processInquiry(emailBody, emailSubject = '') {
    // Step 1: Parse the inquiry
    const inquiry = this.parser.parse(emailBody, emailSubject);
    
    // Step 2: Enrich with web data (weather, events, tips)
    let enrichment = null;
    try {
      enrichment = await this.enrichment.enrich(inquiry);
    } catch (e) {
      console.error('Enrichment failed:', e.message);
    }
    
    // Step 3: Generate response with enrichment
    const response = this.responder.generate(inquiry, null, enrichment);

    // Step 4: Determine action
    const result = {
      inquiry,
      response,
      enrichment,
      action: null,
      reason: null,
      id: this._generateId()
    };

    // Auto-approval logic (Option A: Semi-auto)
    const threshold = config.confidence_threshold || 80;
    const qual = inquiry.qualification;
    
    // Auto-send only for HOT leads: high score + no red flags + no manual review required
    if (this.autoRespond && qual.tier === 'hot' && 
        qual.score >= threshold &&
        qual.redFlags.length === 0 &&
        !qual.requiresManualReview &&
        !qual.needsClarification) {
      result.action = 'auto_send';
      result.reason = `TIER: ${qual.tier.toUpperCase()} | Score: ${qual.score}/100 | ${qual.positiveSignals.join(', ')}`;
    } else if (this.requireApproval) {
      result.action = 'await_approval';
      result.reason = this._getApprovalReason(inquiry);
      this.pendingQueue.push(result);
    } else {
      result.action = 'send';
      result.reason = 'Auto-send enabled';
    }

    return result;
  }

  /**
   * Approve a pending response
   * @param {string} id - The inquiry ID
   * @param {Object} modifications - Optional modifications to the response
   * @returns {Object} The approved response
   */
  approve(id, modifications = {}) {
    const item = this.pendingQueue.find(p => p.id === id);
    if (!item) {
      throw new Error(`Inquiry ${id} not found in pending queue`);
    }

    if (modifications.response) {
      item.response = modifications.response;
    }

    item.action = 'approved';
    item.approvedAt = new Date().toISOString();

    // Remove from queue
    this.pendingQueue = this.pendingQueue.filter(p => p.id !== id);

    return item;
  }

  /**
   * Reject a pending inquiry
   * @param {string} id - The inquiry ID
   * @param {string} reason - Why it's rejected
   */
  reject(id, reason = '') {
    const item = this.pendingQueue.find(p => p.id === id);
    if (!item) {
      throw new Error(`Inquiry ${id} not found in pending queue`);
    }

    item.action = 'rejected';
    item.rejectionReason = reason;

    this.pendingQueue = this.pendingQueue.filter(p => p.id !== id);

    return item;
  }

  /**
   * Get all pending approvals
   */
  getPending() {
    return this.pendingQueue;
  }

  /**
   * Get statistics on processed inquiries
   */
  getStats() {
    return {
      pending: this.pendingQueue.length,
      config: {
        autoRespond: this.autoRespond,
        requireApproval: this.requireApproval
      }
    };
  }

  _generateId() {
    return `inq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  _getApprovalReason(inquiry) {
    const reasons = [];
    const qual = inquiry.qualification;
    
    // Tier info
    if (qual.tier) {
      reasons.push(`Tier: ${qual.tier.toUpperCase()}`);
    }
    
    // Score if below threshold
    if (qual.score < (config.confidence_threshold || 80)) {
      reasons.push(`Score: ${qual.score}/100 (seuil: ${config.confidence_threshold || 80})`);
    }
    
    // Red flags
    if (qual.redFlags.length > 0) {
      reasons.push(...qual.redFlags);
    }

    // Special flags
    if (qual.requiresManualReview) {
      reasons.push('⚠️ Événement à évaluer manuellement');
    }

    if (qual.needsClarification) {
      reasons.push('Besoin de clarification');
    }
    
    // Positive signals (for context)
    if (qual.positiveSignals.length > 0) {
      reasons.push(`✓ ${qual.positiveSignals.join(', ')}`);
    }

    return reasons.join(' | ') || 'Approbation requise par configuration';
  }
}

module.exports = AirbnbAgent;
