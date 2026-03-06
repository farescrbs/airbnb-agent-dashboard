# Airbnb Agent Pro — Package de Vente

## 📁 Structure du Package

```
airbnb-agent-pro/
├── 📄 README.md                    # Documentation principale
├── 📄 FICHE_PRODUIT.md             # Fiche produit complète
├── 🌐 landing-page.html            # Landing page de vente
├── 🐳 docker-compose.yml           # Déploiement one-click
├── 📋 setup-guide.md               # Guide d'installation
├── 🎓 user-manual.md               # Manuel utilisateur
│
├── src/                            # Code source
│   ├── config.json                 # Configuration du bien
│   ├── agent.js                    # Orchestrateur principal
│   ├── parser/
│   │   └── inquiry-parser.js       # Parsing des demandes
│   ├── responder/
│   │   └── response-generator.js   # Génération réponses
│   ├── integrations/
│   │   ├── email.js                # Connexion IMAP
│   │   └── telegram.js             # Notifications
│   ├── dashboard/
│   │   └── index.html              # Interface web
│   ├── cli.js                      # Interface CLI
│   └── start.js                    # Script de démarrage
│
└── assets/                         # Ressources marketing
    ├── demo-video.mp4              # Vidéo de démo (à créer)
    ├── screenshots/
    │   ├── dashboard.png
    │   ├── mobile-notification.png
    │   └── scoring-example.png
    └── logo/
        ├── logo.png
        └── favicon.ico
```

---

## 🚀 Quick Start (pour le client)

### Option 1 : Docker (Recommandé)

```bash
# 1. Cloner le repo
git clone https://github.com/votre-repo/airbnb-agent-pro.git
cd airbnb-agent-pro

# 2. Configurer
cp .env.example .env
# Éditer .env avec vos credentials

# 3. Lancer
docker-compose up -d

# 4. Accéder
open http://localhost:3000
```

### Option 2 : Manuel

```bash
# 1. Prérequis
node --version  # >= 18

# 2. Installer
cd airbnb-agent-pro/src
npm install

# 3. Configurer
cp config.example.json config.json
# Éditer config.json

# 4. Lancer
node start.js
```

---

## ⚙️ Configuration

### 1. Configurer le bien (`config.json`)

```json
{
  "property": {
    "name": "Votre Propriété",
    "type": "outdoor_only",
    "location": "Ville",
    "max_capacity": 40,
    "has_sleeping": false
  },
  "pricing": {
    "base_day_rate": 900,
    "currency": "EUR",
    "large_group_surcharge": 150,
    "large_group_threshold": 30
  },
  "hours": {
    "start": "10:00",
    "end": "00:00"
  },
  "equipment": ["Tables", "Chaises", "BBQ"],
  "policies": {
    "music_allowed": true,
    "music_end_time": "23:00",
    "visits_allowed": true
  },
  "ideal_events": ["anniversaire", "cousinade"],
  "events_to_evaluate": ["mariage"],
  "confidence_threshold": 80,
  "mode": "semi_auto"
}
```

### 2. Configurer l'email (`.env`)

```bash
# Email IMAP
IMAP_HOST=imap.gmail.com
IMAP_USER=votre-email@gmail.com
IMAP_PASSWORD=votre-app-password

# Telegram
TELEGRAM_BOT_TOKEN=votre-token
TELEGRAM_CHAT_ID=votre-chat-id

# JWT Secret
JWT_SECRET=votre-secret-jwt
```

### 3. Créer un bot Telegram

1. Message [@BotFather](https://t.me/botfather)
2. `/newbot` → donner un nom
3. Copier le token
4. Envoyer un message au bot
5. Récupérer votre chat ID : `https://api.telegram.org/bot<TOKEN>/getUpdates`

---

## 📊 Fonctionnalités

### Qualification Intelligente
- Extraction automatique : dates, personnes, événement
- Scoring 0-100 basé sur 15+ critères
- Détection red flags (capacité, événements problématiques)

### Mode Semi-Automatique
- Score ≥ 80% + pas de red flags → Réponse auto
- Score < 80% ou flags → Validation humaine
- Vous gardez le contrôle

### Notifications
- Telegram instantané
- Résumé + score + boutons action
- Récap quotidien

### Dashboard
- Stats temps réel
- Dark mode
- Édition des réponses
- Historique complet

---

## 🎯 Use Cases

### Location Événementielle
- Filtre capacité automatique
- Proposition visite systématique
- Pas de prix en 1er message

### Appartement Meublé
- Qualification dates + durée
- Détection séjours courts
- Réponses instantanées

### Multi-biens
- Config par propriété
- Routing intelligent
- Stats consolidées

---

## 🔧 Personnalisation

### Modifier les templates de réponse

Éditer `src/responder/response-generator.js` :

```javascript
this.templates = {
  standard_positive: `Bonjour {{name}},

Merci pour votre message ! Votre {{event_type}} du {{dates}}...

[Personnalisez ici]

Cordialement,
Votre Nom`
};
```

### Ajuster le scoring

Dans `src/parser/inquiry-parser.js`, modifier les pondérations :

```javascript
// Score de base
let score = 0;

// Information complète (+25)
if (extracted.guestCount && extracted.dates.length > 0) {
  score += 25;
}

// Visite demandée (+15)
if (extracted.visitRequested) {
  score += 15;
}
```

---

## 🐛 Troubleshooting

### L'agent ne détecte pas les emails
- Vérifier les credentials IMAP
- Vérifier que l'email reçoit bien les notifications Airbnb
- Vérifier les logs : `docker-compose logs -f`

### Les notifications Telegram ne marchent pas
- Vérifier le bot token
- Vérifier le chat ID
- S'assurer d'avoir envoyé un message au bot d'abord

### Le dashboard ne s'affiche pas
- Vérifier que le port 3000 est libre
- Vérifier les logs du container

---

## 📞 Support

- Documentation : [lien vers docs]
- Email : support@votre-email.com
- Telegram : @votre_support

---

## 📝 Changelog

### v1.0.0 (2026-03-06)
- Release initiale
- Qualification automatique
- Dashboard web
- Notifications Telegram
- Mode semi-auto

---

**Construit avec ❤️ pour les hôtes qui veulent scaler.**
