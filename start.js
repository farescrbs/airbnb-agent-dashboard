#!/usr/bin/env node
/**
 * Airbnb Agent - Launcher
 * Starts the email monitoring with Telegram notifications
 */

const EmailIntegration = require('./integrations/email');
const path = require('path');

// Configuration
const CONFIG = {
  mode: 'manual', // or 'imap' when ready
  inboxPath: path.join(__dirname, 'inbox'),
  processedPath: path.join(__dirname, 'processed'),
  responsesPath: path.join(__dirname, 'responses'),
  telegramNotifications: true,
  telegramChatId: '706516296',
  pollingIntervalMinutes: 5
};

async function main() {
  console.log('🏠 Airbnb Agent - Extérieur Verfeil');
  console.log('=====================================\n');
  
  console.log('Configuration:');
  console.log(`  Mode: ${CONFIG.mode}`);
  console.log(`  Email inbox: ${CONFIG.inboxPath}`);
  console.log(`  Telegram notifications: ${CONFIG.telegramNotifications ? 'ON' : 'OFF'}`);
  console.log(`  Check interval: ${CONFIG.pollingIntervalMinutes} minutes\n`);
  
  const integration = new EmailIntegration(CONFIG);
  
  try {
    await integration.init();
    
    // Send startup notification
    if (CONFIG.telegramNotifications) {
      try {
        await integration.notifier.sendTest();
        console.log('✅ Telegram test notification sent\n');
      } catch (err) {
        console.log('⚠️  Could not send Telegram test:', err.message);
        console.log('   Continuing anyway...\n');
      }
    }
    
    // Start monitoring
    await integration.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n👋 Shutting down...');
      integration.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n\n👋 Shutting down...');
      integration.stop();
      process.exit(0);
    });
    
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

main();
