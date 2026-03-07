# 🤖 Airbnb Agent

Agent automatisé pour répondre aux demandes Airbnb - Domaine Lavalette

## Fonctionnalités

- ✅ Parse automatiquement les emails de demande
- ✅ Détecte dates, nombre de personnes, type d'événement
- ✅ Score de qualification (0-100) + détection des red flags
- ✅ Réponses personnalisées selon le scénario
- ✅ Dashboard de validation (Phase 1)
- ✅ Gestion des visites et tarifs dynamiques

## Installation rapide

```bash
cd projects/airbnb-agent
npm init -y  # si besoin de dépendances plus tard
```

## Configuration

Modifie `config.json` :
- Prix de base : 900€
- Horaires : 10h-00h
- Musique jusqu'à 23h
- Capacité : 40 personnes
- Surcharge groupe +30 pers : +150€

## Utilisation

### Test CLI
```bash
node cli.js "votre message de test" --name=Client
```

### Mode 1 : Email Forwarding (Recommandé pour démarrer)

1. Crée une règle dans ton email pour forwarder les notifications Airbnb vers une adresse dédiée
2. Place les emails dans le dossier `inbox/` en format `.txt`
3. L'agent les traite automatiquement

```bash
node -e "
const EmailIntegration = require('./integrations/email');
const integration = new EmailIntegration({ mode: 'manual' });
integration.init().then(() => integration.start());
"
```

### Mode 2 : Dashboard Web

Ouvre `dashboard/index.html` dans ton navigateur pour voir les demandes en attente et valider les réponses.

### Mode 3 : Webhook (Avancé)

Pour connecter avec Zapier/Make/n8n :
1. Configure un webhook pointant vers ton agent
2. L'agent reçoit les données et génère la réponse
3. Tu valides via le dashboard

## Workflows

### Phase 1 : Validation manuelle (maintenant)
```
Email Airbnb → Agent parse → Dashboard → Tu valides → Envoi
```

### Phase 2 : Full auto (plus tard)
```
Email Airbnb → Agent parse → Si score > 80 → Envoi auto
                        → Si score < 80 → Dashboard
```

## Templates de réponse

L'agent génère automatiquement :
- `standard_positive` : Réponse classique positive
- `special_event` : Pour anniversaires/mariages avec détails
- `sleeping_clarification` : Clarifie "pas de couchage"
- `capacity_exceeded` : Refus poli si >40 pers
- `visit_response` : Proposition de visite

## Tarification

| Configuration | Tarif |
|--------------|-------|
| Base (≤30 pers) | 900€ |
| Groupe +30 pers | 900€ + 150€ = 1050€ |
| Week-end | À définir |

## Événements acceptés

✅ Anniversaire, Baby shower, Cousinade, Retrouvailles
✅ EVG/EVJF, Team building, Séminaire entreprise
⚠️ Mariage : à évaluer au cas par cas

## TODO

- [ ] Connecteur IMAP pour lecture email directe
- [ ] Connecteur SMTP pour envoi réponses
- [ ] API webhook pour intégration Zapier
- [ ] Synchronisation calendrier (disponibilités)
- [ ] Mode full auto avec seuil de confiance

## Structure

```
airbnb-agent/
├── config.json              # Configuration bien + tarifs
├── agent.js                 # Orchestrateur principal
├── cli.js                   # Interface ligne de commande
├── parser/
│   └── inquiry-parser.js    # Extraction infos emails
├── responder/
│   └── response-generator.js # Templates de réponse
├── integrations/
│   └── email.js             # Connexion email
└── dashboard/
    └── index.html           # Interface web validation
```

---

Créé pour Farès | Domaine Lavalette | 40 pers max
