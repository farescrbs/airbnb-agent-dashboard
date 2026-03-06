#!/usr/bin/env node
/**
 * CLI for testing Airbnb Agent
 * Usage: node cli.js "message text" [--name ClientName] [--no-enrich]
 */

const AirbnbAgent = require('./agent');

const args = process.argv.slice(2);
const messageArg = args.find(a => !a.startsWith('--'));
const nameArg = args.find(a => a.startsWith('--name='));
const name = nameArg ? nameArg.split('=')[1] : 'Test Client';
const noEnrich = args.includes('--no-enrich');

if (!messageArg) {
  console.log(`
🤖 Airbnb Agent CLI

Usage: node cli.js "votre message ici" [--name=ClientName] [--no-enrich]

Exemples:
  node cli.js "Bonjour, je cherche un lieu pour mon anniversaire le 15 juin, nous serons 30 personnes"
  node cli.js "Est-ce qu'on peut dormir sur place ? Nous serions 20 personnes pour un mariage" --name=Marie
  node cli.js "Anniversaire 20 personnes 15 mars" --no-enrich
`);
  process.exit(0);
}

// Simulate email format
const emailBody = `${name} · Responsable de la réservation

${messageArg}`;

const agent = new AirbnbAgent({
  requireApproval: true,
  autoRespond: false,
  webEnrichment: !noEnrich
});

async function main() {
  const result = await agent.processInquiry(emailBody, 'Demande d\'information envoyée');

  console.log('\n' + '='.repeat(60));
  console.log('📨 INQUIRY ANALYSIS');
  console.log('='.repeat(60));
  console.log(`ID: ${result.id}`);
  console.log(`Client: ${result.inquiry.extracted.name || name}`);
  console.log(`Dates: ${JSON.stringify(result.inquiry.extracted.dates)}`);
  console.log(`Guests: ${result.inquiry.extracted.guestCount || '?'}`);
  console.log(`Event: ${result.inquiry.extracted.eventType || '?'}`);
  console.log(`Questions: ${result.inquiry.extracted.questions.join(', ') || 'none'}`);
  console.log(`Visit requested: ${result.inquiry.extracted.visitRequested}`);

  console.log('\n' + '-'.repeat(60));
  console.log('📊 QUALIFICATION');
  console.log('-'.repeat(60));
  console.log(`Score: ${result.inquiry.qualification.score}/100`);
  console.log(`Fits capacity: ${result.inquiry.qualification.fitsCapacity}`);
  console.log(`Red flags: ${result.inquiry.qualification.redFlags.join(', ') || 'none'}`);

  // Show enrichment if available
  if (result.enrichment) {
    console.log('\n' + '-'.repeat(60));
    console.log('🌐 WEB ENRICHMENT');
    console.log('-'.repeat(60));
    if (result.enrichment.weather) {
      console.log(`☁️  Weather: ${result.enrichment.weather.summary ? 'Fetched' : 'N/A'}`);
    }
    if (result.enrichment.localEvents) {
      console.log(`📍 Local events: ${result.enrichment.localEvents.hasImpact ? '⚠️ Potential impact' : 'No impact'}`);
    }
    if (result.enrichment.seasonalTips) {
      console.log(`💡 Seasonal tips: ${result.enrichment.seasonalTips.summary ? 'Fetched' : 'N/A'}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('💬 GENERATED RESPONSE');
  console.log('='.repeat(60));
  console.log(result.response);

  console.log('\n' + '-'.repeat(60));
  console.log(`🎯 ACTION: ${result.action}`);
  console.log(`   Reason: ${result.reason}`);
  console.log('-'.repeat(60));
  console.log(`\nPending queue: ${agent.getPending().length} item(s)`);
}

main().catch(console.error);
