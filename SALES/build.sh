#!/bin/bash

# Build script pour Airbnb Agent Pro
# Crée le package de distribution prêt à vendre

set -e

VERSION="1.0.0"
BUILD_DIR="build/airbnb-agent-pro-v${VERSION}"

echo "🏗️  Build Airbnb Agent Pro v${VERSION}"

# Nettoyer
rm -rf build
mkdir -p ${BUILD_DIR}

# Copier les fichiers de vente
echo "📄 Copie des fichiers marketing..."
cp SALES/FICHE_PRODUIT.md ${BUILD_DIR}/
cp SALES/README.md ${BUILD_DIR}/
cp SALES/setup-guide.md ${BUILD_DIR}/
cp SALES/user-manual.md ${BUILD_DIR}/
cp SALES/landing-page.html ${BUILD_DIR}/

# Copier les fichiers de déploiement
echo "🐳 Copie des fichiers de déploiement..."
cp SALES/docker-compose.yml ${BUILD_DIR}/
cp SALES/Dockerfile ${BUILD_DIR}/
cp SALES/package.json ${BUILD_DIR}/
cp SALES/deploy.sh ${BUILD_DIR}/

# Créer les dossiers
mkdir -p ${BUILD_DIR}/src
mkdir -p ${BUILD_DIR}/assets/screenshots
mkdir -p ${BUILD_DIR}/data

# Copier le code source
echo "💻 Copie du code source..."
cp -r config.json ${BUILD_DIR}/src/ 2>/dev/null || echo "⚠️  config.json non trouvé, créez-le"
cp -r agent.js ${BUILD_DIR}/src/
cp -r cli.js ${BUILD_DIR}/src/
cp -r start.js ${BUILD_DIR}/src/
cp -r parser ${BUILD_DIR}/src/
cp -r responder ${BUILD_DIR}/src/
cp -r integrations ${BUILD_DIR}/src/
cp -r dashboard ${BUILD_DIR}/src/

# Créer les fichiers d'exemple
echo "📝 Création des fichiers exemple..."

cat > ${BUILD_DIR}/.env.example << 'EOF'
# === CONFIGURATION EMAIL (IMAP) ===
# Gmail: imap.gmail.com | Outlook: outlook.office365.com
IMAP_HOST=imap.gmail.com
IMAP_USER=votre-email@gmail.com
# Pour Gmail: utilisez un App Password (pas votre mot de passe principal)
IMAP_PASSWORD=votre-app-password

# === CONFIGURATION TELEGRAM ===
# Créez un bot avec @BotFather sur Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz
# Récupérez votre chat ID: https://api.telegram.org/bot<TOKEN>/getUpdates
TELEGRAM_CHAT_ID=123456789

# === SECURITE ===
# Générez une clé secrète: openssl rand -base64 32
JWT_SECRET=changez-cette-cle-par-une-tres-longue-chaine-aleatoire

# === OPTIONNEL: BASE DE DONNEES EXTERNE ===
# DB_HOST=localhost
# DB_USER=airbnb
# DB_PASSWORD=password
# DB_NAME=airbnb_agent
EOF

cat > ${BUILD_DIR}/config.example.json << 'EOF'
{
  "property": {
    "name": "Votre Propriété",
    "type": "outdoor_only",
    "location": "Votre Ville",
    "max_capacity": 40,
    "has_sleeping": false
  },
  "pricing": {
    "base_day_rate": 900,
    "currency": "EUR",
    "variable_pricing": true,
    "weekend_surcharge": 100,
    "large_group_surcharge": 150,
    "large_group_threshold": 30
  },
  "hours": {
    "start": "10:00",
    "end": "00:00",
    "flexible": true
  },
  "equipment": [
    "Tables et chaises",
    "BBQ",
    "2 frigos",
    "Plaque à gaz",
    "Évier",
    "Eau",
    "Vaisselle complète"
  ],
  "policies": {
    "music_allowed": true,
    "music_end_time": "23:00",
    "music_restrictions": "Musique autorisée jusqu'à 23h",
    "cleaning_required": true,
    "deposit_required": false,
    "visits_allowed": true
  },
  "ideal_events": [
    "anniversaire",
    "baby_shower",
    "cousinade",
    "retrouvailles",
    "repas_famille",
    "evg",
    "evjf",
    "entreprise",
    "team_building",
    "seminaire"
  ],
  "events_to_evaluate": [
    "mariage"
  ],
  "response_tone": "friendly_professional",
  "auto_respond": true,
  "approval_required": true,
  "confidence_threshold": 80,
  "mode": "semi_auto"
}
EOF

# Créer le CHANGELOG
cat > ${BUILD_DIR}/CHANGELOG.md << 'EOF'
# Changelog

## [1.0.0] - 2026-03-06

### Ajouté
- Qualification automatique des demandes (parsing NLP)
- Scoring intelligent 0-100 basé sur 15+ critères
- Mode semi-automatique avec seuil configurable
- Dashboard web avec stats en temps réel
- Notifications Telegram avec boutons d'action
- Templates de réponse personnalisables
- Détection des red flags (capacité, événements problématiques)
- Support multi-biens
- Déploiement Docker one-click
- Dark mode sur le dashboard
EOF

# Créer le LICENSE
cat > ${BUILD_DIR}/LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Votre Nom

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
EOF

# Créer une archive
echo "📦 Création de l'archive..."
cd build
zip -r "airbnb-agent-pro-v${VERSION}.zip" "airbnb-agent-pro-v${VERSION}"
tar -czf "airbnb-agent-pro-v${VERSION}.tar.gz" "airbnb-agent-pro-v${VERSION}"
cd ..

# Résumé
echo ""
echo "✅ Build terminé !"
echo ""
echo "📁 Fichiers créés :"
echo "  - build/airbnb-agent-pro-v${VERSION}/          (dossier complet)"
echo "  - build/airbnb-agent-pro-v${VERSION}.zip       (archive zip)"
echo "  - build/airbnb-agent-pro-v${VERSION}.tar.gz    (archive tar.gz)"
echo ""
echo "📋 Contenu du package :"
find ${BUILD_DIR} -type f | head -20
echo "  ... ($(find ${BUILD_DIR} -type f | wc -l) fichiers au total)"
echo ""
