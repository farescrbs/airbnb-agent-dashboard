#!/bin/bash
# Script pour créer le repo GitHub et pousser le code

echo "🚀 Création du dépôt GitHub pour Airbnb Agent"
echo ""

# Option 1: Via GitHub CLI (si connecté)
# gh repo create airbnb-agent-dashboard --public --source=. --push

# Option 2: Manuellement
echo "📋 Instructions pour créer le repo sur GitHub:"
echo ""
echo "1. Va sur https://github.com/new"
echo "2. Nom du repo: airbnb-agent-dashboard"
echo "3. Description: Agent automatisé pour répondre aux demandes Airbnb - Extérieur Verfeil"
echo "4. Choisis Public ou Private"
echo "5. Ne coche PAS 'Initialize with README'"
echo "6. Clique 'Create repository'"
echo ""
echo "7. Puis exécute ces commandes dans le terminal:"
echo ""
echo "cd /Users/farescrbs/.openclaw/workspace/projects/airbnb-agent"
echo "git remote add origin https://github.com/TON_USERNAME/airbnb-agent-dashboard.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "✅ Une fois fait, ton dashboard sera sur GitHub !"
