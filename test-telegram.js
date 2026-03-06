#!/usr/bin/env node
/**
 * Test Telegram notifications for Airbnb Agent
 */

const TelegramNotifier = require('./integrations/telegram');

// Use the bot token from the gateway (Jervis_31bot)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = '706516296'; // Farès's Telegram ID

if (!BOT_TOKEN) {
  console.log('⚠️  TELEGRAM_BOT_TOKEN not set in environment');
  console.log('Using test mode - set the token to send real notifications');
  process.exit(1);
}

const notifier = new TelegramNotifier(BOT_TOKEN, CHAT_ID);

console.log('🤖 Testing Telegram notifications...\n');

notifier.sendTest()
  .then(() => {
    console.log('✅ Test notification sent successfully!');
    console.log('Check your Telegram messages.');
  })
  .catch(err => {
    console.error('❌ Failed to send test notification:', err.message);
    console.log('\nMake sure:');
    console.log('1. The bot token is correct');
    console.log('2. The chat ID is correct');
    console.log('3. You have started a conversation with the bot');
  });
