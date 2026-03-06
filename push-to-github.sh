#!/bin/bash
# Créer le repo GitHub et pousser le code

REPO_NAME="airbnb-agent-dashboard"
USERNAME="farescrbs"

echo "🚀 Création du dépôt GitHub..."
echo ""

# Créer le repo via API
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Agent automatisé pour répondre aux demandes Airbnb - Extérieur Verfeil\",\"private\":false}"

echo ""
echo "📤 Push du code..."
cd /Users/farescrbs/.openclaw/workspace/projects/airbnb-agent
git push -u origin main

echo ""
echo "✅ Repo créé : https://github.com/$USERNAME/$REPO_NAME"
