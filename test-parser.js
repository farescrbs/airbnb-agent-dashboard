/**
 * Test suite for the enhanced inquiry parser
 * Run with: node test-parser.js
 */

const InquiryParser = require('./parser/inquiry-parser');
const ResponseGenerator = require('./responder/response-generator');

const parser = new InquiryParser();
const responder = new ResponseGenerator();

// Test cases
const testCases = [
  {
    name: "HOT - Demande idéale",
    subject: "Demande d'information",
    body: `Bonjour,

Je souhaite organiser un anniversaire pour mon père le 15 juin.
Nous serons environ 25 personnes adultes.

L'événement serait un repas familial de midi jusqu'au soir.

Est-il possible de venir visiter le lieu la semaine prochaine ?

Cordialement,
Marie
· Responsable de l'événement`,
    expectedTier: 'hot'
  },
  {
    name: "HOT - Cousinade complète",
    subject: "Demande d'information",
    body: `Bonjour Setty,

On organise une cousinade pour la famille Martin. On sera entre 30 et 35 personnes le week-end du 12-13 juillet.

On cherche un espace extérieur pour faire un grand barbecue et profiter de la journée ensemble. On aimerait visiter avant de réserver si possible.

Merci !
Thomas
· Responsable de l'événement`,
    expectedTier: 'hot'
  },
  {
    name: "WARM - Message court mais complet",
    subject: "Demande d'information",
    body: `Bonjour,

C'est pour un anniversaire, on sera 20 personnes le 5 août. Possible ?

Merci,
Lucas`,
    expectedTier: 'warm'
  },
  {
    name: "COLD - EVG 15 personnes (manuel obligatoire)",
    subject: "Demande d'information",
    body: `Bonjour,

On organise un EVG pour un ami. On sera 15 personnes le 20 septembre pour une journée entre gars.

C'est possible chez vous ?

Cordialement,
Kevin`,
    expectedTier: 'cold'
  },
  {
    name: "COLD - Question couchage",
    subject: "Demande d'information",
    body: `Bonjour,

Je cherche un lieu pour un anniversaire avec possibilité de dormir sur place pour les invités qui viennent de loin.

On sera 20 personnes en octobre.

C'est possible ?

Amandine`,
    expectedTier: 'cold'
  },
  {
    name: "REJECT - Capacité dépassée",
    subject: "Demande d'information",
    body: `Bonjour,

On organise un séminaire entreprise pour 60 personnes. On a besoin d'un grand espace extérieur avec tables pour tout le monde.

Date : 15 juillet

Pouvez-vous nous faire un devis ?

Cordialement,
Sophie Dupont
DRH - TechCorp`,
    expectedTier: 'reject'
  },
  {
    name: "REJECT - Demande non conforme",
    subject: "Demande d'information",
    body: `Bonjour,

On cherche un lieu pour faire un feu d'artifice pour un anniversaire. On sera une cinquantaine de personnes.

C'est possible chez vous ? On aimerait aussi installer une petite piscine gonflable.

Merci,
Jean`,
    expectedTier: 'reject'
  },
  {
    name: "HOT - Baby shower avec visite",
    subject: "Demande d'information",
    body: `Bonjour Setty,

J'organise un baby shower pour ma sœur. On sera environ 20 personnes, principalement des amies et la famille proche.

La date visée est le 8 septembre. On aimerait faire un brunch dans la journée avec des jeux en extérieur.

Est-ce possible de venir visiter le lieu ? Je suis disponible ce week-end ou en soirée en semaine.

Bien cordialement,
Émilie`,
    expectedTier: 'hot'
  },
  {
    name: "WARM - Price shopping mais intéressé",
    subject: "Demande d'information",
    body: `Bonjour,

Je compare plusieurs lieux pour un anniversaire. Vous êtes combien par rapport à d'autres options ?

On est 30 personnes le 15 juillet.

Merci de me faire un devis.

Pierre`,
    expectedTier: 'warm'
  }
];

console.log('🧪 Test du Parser Airbnb Agent\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const test of testCases) {
  console.log(`\n📧 ${test.name}`);
  console.log('-'.repeat(60));
  
  const result = parser.parse(test.body, test.subject);
  const qual = result.qualification;
  
  console.log(`   Tier: ${qual.tier?.toUpperCase()} ${qual.tier === test.expectedTier ? '✅' : '❌ (attendu: ' + test.expectedTier + ')'}`);
  console.log(`   Score: ${qual.score}/100`);
  console.log(`   Auto-send: ${qual.tier === 'hot' && !qual.requiresManualReview ? 'OUI' : 'NON'}`);
  
  if (qual.positiveSignals.length > 0) {
    console.log(`   ✓ Positifs: ${qual.positiveSignals.join(', ')}`);
  }
  
  if (qual.redFlags.length > 0) {
    console.log(`   ⚠️ Red flags: ${qual.redFlags.join(', ')}`);
  }
  
  if (qual.requiresManualReview) {
    console.log(`   📝 Manuel obligatoire`);
  }
  
  // Generate preview of response
  try {
    const response = responder.generate(result);
    console.log(`\n   📝 Aperçu réponse:`);
    console.log(`      ${response.split('\n')[0]}...`);
  } catch (e) {
    console.log(`   ⚠️ Erreur génération: ${e.message}`);
  }
  
  if (qual.tier === test.expectedTier) {
    passed++;
  } else {
    failed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Résultats: ${passed}/${testCases.length} tests passés`);
if (failed > 0) {
  console.log(`   ❌ ${failed} échecs`);
} else {
  console.log('   ✅ Tous les tests passent !');
}
