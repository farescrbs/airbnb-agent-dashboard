#!/bin/bash

# Airbnb Agent Pro — Script de déploiement
# Usage: ./deploy.sh [environment]

set -e

ENV=${1:-production}
echo "🚀 Déploiement Airbnb Agent Pro — Environnement: $ENV"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier les prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# Vérifier le fichier .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé, création à partir de .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Veuillez éditer le fichier .env avec vos credentials${NC}"
        exit 1
    else
        echo -e "${RED}❌ Fichier .env.example non trouvé${NC}"
        exit 1
    fi
fi

# Vérifier la configuration
if [ ! -f config.json ]; then
    echo -e "${YELLOW}⚠️  config.json non trouvé, création à partir de config.example.json...${NC}"
    if [ -f config.example.json ]; then
        cp config.example.json config.json
        echo -e "${YELLOW}📝 Veuillez éditer le fichier config.json avec vos paramètres${NC}"
        exit 1
    else
        echo -e "${RED}❌ config.example.json non trouvé${NC}"
        exit 1
    fi
fi

# Créer les dossiers nécessaires
echo -e "${YELLOW}📁 Création des dossiers...${NC}"
mkdir -p data logs

# Build et démarrage
echo -e "${YELLOW}🔨 Build de l'image Docker...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚀 Démarrage des services...${NC}"
docker-compose up -d

# Attendre que le service soit prêt
echo -e "${YELLOW}⏳ Attente du démarrage...${NC}"
sleep 5

# Vérifier la santé
echo -e "${YELLOW}🏥 Vérification de la santé...${NC}"
if curl -f http://localhost:3000/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Service en ligne !${NC}"
else
    echo -e "${YELLOW}⚠️  Le service démarre encore...${NC}"
    sleep 5
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        echo -e "${GREEN}✅ Service en ligne !${NC}"
    else
        echo -e "${RED}❌ Le service ne répond pas. Vérifiez les logs:${NC}"
        echo "docker-compose logs -f"
        exit 1
    fi
fi

# Afficher les infos
echo ""
echo -e "${GREEN}🎉 Déploiement réussi !${NC}"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔑 Login par défaut: admin / admin"
echo ""
echo "📋 Commandes utiles:"
echo "  Voir les logs:     docker-compose logs -f"
echo "  Redémarrer:        docker-compose restart"
echo "  Arrêter:           docker-compose down"
echo "  Mettre à jour:     docker-compose pull && docker-compose up -d"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de:${NC}"
echo "  1. Changer le mot de passe admin par défaut"
echo "  2. Configurer votre bot Telegram"
echo "  3. Tester la connexion IMAP"
echo ""
