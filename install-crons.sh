#!/bin/bash
# Installation des crons HostFlow Agent

echo "🤖 Installation des crons HostFlow Agent..."
echo ""

# Créer le répertoire cron si inexistant
mkdir -p ~/.openclaw/workspace/cron

# Installer le heartbeat
if [ -f "cron/hostflow-heartbeat.json" ]; then
    cp cron/hostflow-heartbeat.json ~/.openclaw/workspace/cron/
    echo "✅ Heartbeat installé (toutes les 4h)"
fi

# Installer le reverse prompting
if [ -f "cron/hostflow-reverse-prompt.json" ]; then
    cp cron/hostflow-reverse-prompt.json ~/.openclaw/workspace/cron/
    echo "✅ Reverse prompting installé (dimanche 20h)"
fi

echo ""
echo "📋 Pour activer les crons, exécute :"
echo "   openclaw cron add --file cron/hostflow-heartbeat.json"
echo "   openclaw cron add --file cron/hostflow-reverse-prompt.json"
echo ""
echo "🚀 HostFlow Agent est maintenant configuré en mode PROACTIF !"
