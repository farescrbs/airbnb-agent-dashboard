/**
 * Telegram Notifications for Airbnb Agent
 * Sends notifications to Farès when new inquiries arrive
 */

const https = require('https');

class TelegramNotifier {
  constructor(botToken, chatId) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID || '706516296';
    this.apiBase = 'api.telegram.org';
  }

  /**
   * Send notification for new inquiry
   */
  async notifyNewInquiry(inquiry, response) {
    const { extracted, qualification } = inquiry;
    
    const scoreEmoji = qualification.score >= 70 ? '✅' : 
                       qualification.score >= 40 ? '⚠️' : '❌';
    
    const eventLabels = {
      'wedding': 'Mariage',
      'birthday': 'Anniversaire',
      'family_gathering': 'Cousinade',
      'reunion': 'Retrouvailles',
      'baby_shower': 'Baby shower',
      'party': 'Fête',
      'partnership': 'Pro partenariat'
    };

    const eventName = eventLabels[extracted.eventType] || extracted.eventType || 'Événement';
    
    let message = `🏠 *Nouvelle demande Airbnb*\n\n`;
    message += `*Client:* ${extracted.name || 'Inconnu'}\n`;
    message += `*Événement:* ${eventName}\n`;
    message += `*Personnes:* ${extracted.guestCount || '?'}\n`;
    message += `*Score:* ${scoreEmoji} ${qualification.score}/100\n\n`;
    
    if (qualification.redFlags.length > 0) {
      message += `⚠️ *Points d'attention:*\n`;
      qualification.redFlags.forEach(flag => {
        message += `• ${flag}\n`;
      });
      message += `\n`;
    }
    
    if (extracted.visitRequested) {
      message += `📍 *Demande de visite*\n\n`;
    }
    
    message += `[📱 Voir le dashboard](http://localhost:3000/dashboard/#${inquiry.id})`;
    
    return this.sendMessage(message, { parse_mode: 'Markdown' });
  }

  /**
   * Send approval confirmation
   */
  async notifyApproval(inquiry) {
    const message = `✅ *Réponse approuvée et envoyée*\n\n` +
                    `Client: ${inquiry.extracted.name}\n` +
                    `Date: ${new Date().toLocaleString('fr-FR')}`;
    
    return this.sendMessage(message, { parse_mode: 'Markdown' });
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(stats) {
    const message = `📊 *Récap du jour*\n\n` +
                    `• Demandes reçues: ${stats.received}\n` +
                    `• Réponses approuvées: ${stats.approved}\n` +
                    `• En attente: ${stats.pending}\n` +
                    `• Revenus potentiels: ${stats.potentialRevenue}€`;
    
    return this.sendMessage(message, { parse_mode: 'Markdown' });
  }

  /**
   * Send test notification
   */
  async sendTest() {
    const message = `🤖 *Airbnb Agent est en ligne !*\n\n` +
                    `Je surveille la boîte jiroualex9@gmail.com\n` +
                    `Tu recevras une notification à chaque nouvelle demande.\n\n` +
                    `Configuration actuelle:\n` +
                    `• Prix base: 900€\n` +
                    `• Capacité max: 40 pers\n` +
                    `• Horaires: 10h-00h\n` +
                    `• Visites: proposées systématiquement`;
    
    return this.sendMessage(message, { parse_mode: 'Markdown' });
  }

  /**
   * Send message via Telegram API
   */
  sendMessage(text, options = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        chat_id: this.chatId,
        text: text,
        ...options
      });

      const reqOptions = {
        hostname: this.apiBase,
        port: 443,
        path: `/bot${this.botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(reqOptions, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (result.ok) {
              resolve(result);
            } else {
              reject(new Error(result.description));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = TelegramNotifier;
