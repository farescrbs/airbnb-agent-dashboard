/**
 * Email Integration Module for Airbnb Agent
 * Handles receiving inquiries and sending responses
 * 
 * Supports:
 * - IMAP polling (for standard email)
 * - Webhook (for services like Zapier, n8n, Make)
 * - Manual forwarding (quick start)
 */

const AirbnbAgent = require('../agent');
const TelegramNotifier = require('./telegram');
const fs = require('fs').promises;
const path = require('path');

class EmailIntegration {
  constructor(options = {}) {
    this.agent = new AirbnbAgent({
      requireApproval: true,
      autoRespond: false
    });
    
    // Initialize Telegram notifier
    this.notifier = new TelegramNotifier(
      options.telegramBotToken,
      options.telegramChatId
    );
    
    this.options = {
      mode: options.mode || 'manual', // 'manual', 'imap', 'webhook'
      inboxPath: options.inboxPath || './inbox',
      processedPath: options.processedPath || './processed',
      responsesPath: options.responsesPath || './responses',
      telegramNotifications: options.telegramNotifications !== false,
      ...options
    };
    
    this.isRunning = false;
    this.pollingInterval = null;
    this.stats = {
      received: 0,
      approved: 0,
      pending: 0,
      potentialRevenue: 0
    };
  }

  /**
   * Initialize directories and start listening
   */
  async init() {
    // Ensure directories exist
    await this._ensureDirs();
    console.log('📧 Email Integration initialized');
    console.log(`   Mode: ${this.options.mode}`);
    console.log(`   Inbox: ${this.options.inboxPath}`);
    return this;
  }

  /**
   * Start listening for new emails
   */
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting email listener...');
    
    switch (this.options.mode) {
      case 'manual':
        console.log('   Manual mode: Place .txt or .eml files in inbox/ folder');
        this.pollingInterval = setInterval(() => this._checkInbox(), 5000);
        break;
        
      case 'imap':
        console.log('   IMAP mode: Configure credentials in config');
        // TODO: Implement IMAP polling
        break;
        
      case 'webhook':
        console.log('   Webhook mode: Endpoint ready at /webhook/airbnb-inquiry');
        // TODO: Implement webhook server
        break;
    }
  }

  /**
   * Stop listening
   */
  stop() {
    this.isRunning = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    console.log('⏹️ Email listener stopped');
  }

  /**
   * Process a single email (used by all modes)
   */
  async processEmail(emailContent, metadata = {}) {
    console.log('\n📨 Processing new inquiry...');
    
    const result = this.agent.processInquiry(
      emailContent, 
      metadata.subject || 'Demande d\'information'
    );
    
    // Save to responses folder for dashboard
    const responseFile = path.join(
      this.options.responsesPath, 
      `${result.id}.json`
    );
    
    await fs.writeFile(
      responseFile,
      JSON.stringify(result, null, 2),
      'utf8'
    );
    
    console.log(`   ID: ${result.id}`);
    console.log(`   Client: ${result.inquiry.extracted.name || 'Unknown'}`);
    console.log(`   Score: ${result.inquiry.qualification.score}/100`);
    console.log(`   Action: ${result.action}`);
    console.log(`   Saved to: ${responseFile}`);
    
    // Notify user (could be webhook, Telegram, etc.)
    await this._notifyNewInquiry(result);
    
    return result;
  }

  /**
   * Approve and send a response
   */
  async approveAndSend(id, modifications = {}) {
    const result = this.agent.approve(id, modifications);
    
    if (!result) {
      throw new Error(`Inquiry ${id} not found`);
    }
    
    console.log(`\n✅ Approved: ${id}`);
    console.log('   Response ready to send:');
    console.log('   ' + '-'.repeat(50));
    console.log(result.response);
    console.log('   ' + '-'.repeat(50));
    
    // TODO: Actually send via email API or Airbnb reply
    
    // Mark as sent
    result.sentAt = new Date().toISOString();
    await this._archiveResponse(result);
    
    // Notify via Telegram
    if (this.options.telegramNotifications) {
      try {
        await this.notifier.notifyApproval(result);
      } catch (err) {
        console.error('Failed to send approval notification:', err.message);
      }
    }
    
    return result;
  }

  /**
   * Get all pending inquiries
   */
  async getPending() {
    const files = await fs.readdir(this.options.responsesPath);
    const pending = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(
          path.join(this.options.responsesPath, file),
          'utf8'
        );
        const inquiry = JSON.parse(content);
        if (inquiry.action === 'await_approval') {
          pending.push(inquiry);
        }
      }
    }
    
    return pending.sort((a, b) => 
      new Date(b.inquiry.extracted.receivedAt || 0) - 
      new Date(a.inquiry.extracted.receivedAt || 0)
    );
  }

  // Private methods
  
  async _ensureDirs() {
    const dirs = [
      this.options.inboxPath,
      this.options.processedPath,
      this.options.responsesPath
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (e) {
        // Directory already exists
      }
    }
  }

  async _checkInbox() {
    try {
      const files = await fs.readdir(this.options.inboxPath);
      
      for (const file of files) {
        const filePath = path.join(this.options.inboxPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        
        // Process
        await this.processEmail(content, { subject: file });
        
        // Move to processed
        const processedPath = path.join(this.options.processedPath, file);
        await fs.rename(filePath, processedPath);
      }
    } catch (e) {
      console.error('Error checking inbox:', e.message);
    }
  }

  async _notifyNewInquiry(result) {
    // Console notification
    console.log('\n🔔 NEW INQUIRY NEEDS APPROVAL');
    console.log(`   Dashboard: http://localhost:3000/dashboard/#${result.id}`);
    
    // Telegram notification
    if (this.options.telegramNotifications) {
      try {
        await this.notifier.notifyNewInquiry(result.inquiry || result, result.response);
        console.log('   Telegram notification sent ✓');
      } catch (err) {
        console.error('   Failed to send Telegram notification:', err.message);
      }
    }
  }

  async _archiveResponse(result) {
    const archivePath = path.join(
      this.options.responsesPath,
      'sent',
      `${result.id}.json`
    );
    
    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    await fs.writeFile(archivePath, JSON.stringify(result, null, 2));
  }
}

module.exports = EmailIntegration;
