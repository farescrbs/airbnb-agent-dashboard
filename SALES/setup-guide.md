# Guide d'Installation — Airbnb Agent Pro

## 📋 Prérequis

### Matériel
- Un serveur VPS (à partir de 5€/mois) OU un ordinateur local allumé 24/7
- 1GB RAM minimum, 2GB recommandé
- 10GB d'espace disque

### Logiciels
- Docker + Docker Compose (recommandé)
- OU Node.js 18+ (installation manuelle)

### Comptes nécessaires
- Une adresse email dédiée (Gmail, Outlook, etc.)
- Un compte Telegram
- (Optionnel) Un nom de domaine

---

## 🚀 Installation Rapide (Docker)

### Étape 1 : Télécharger le package

```bash
# Via git
git clone https://github.com/votre-repo/airbnb-agent-pro.git
cd airbnb-agent-pro

# Ou téléchargez et décompressez l'archive
unzip airbnb-agent-pro.zip
cd airbnb-agent-pro
```

### Étape 2 : Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env  # ou utilisez votre éditeur préféré
```

Remplissez les valeurs :

```bash
# === EMAIL (IMAP) ===
IMAP_HOST=imap.gmail.com          # ou imap.outlook.com
IMAP_USER=votre-email@gmail.com
IMAP_PASSWORD=votre-mot-de-passe-app

# === TELEGRAM ===
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz
TELEGRAM_CHAT_ID=123456789

# === SECURITE ===
JWT_SECRET=votre-secret-tres-long-et-aleatoire
```

> **Note Gmail** : Vous devez créer un "App Password" dans les paramètres de sécurité de votre compte Google.

### Étape 3 : Configurer votre bien

```bash
cp config.example.json config.json
nano config.json
```

Personnalisez selon votre propriété :

```json
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
    "large_group_surcharge": 150,
    "large_group_threshold": 30
  },
  "hours": {
    "start": "10:00",
    "end": "00:00"
  },
  "equipment": [
    "Tables et chaises",
    "BBQ",
    "2 frigos",
    "Plaque à gaz"
  ],
  "policies": {
    "music_allowed": true,
    "music_end_time": "23:00",
    "visits_allowed": true
  },
  "ideal_events": [
    "anniversaire",
    "cousinade",
    "retrouvailles"
  ],
  "events_to_evaluate": [
    "mariage"
  ],
  "confidence_threshold": 80,
  "mode": "semi_auto"
}
```

### Étape 4 : Créer votre bot Telegram

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Donnez un nom à votre bot (ex: "Mon Agent Airbnb")
4. Donnez un username (doit finir par 'bot', ex: "mon_agent_airbnb_bot")
5. **Copiez le token** (ex: `123456789:ABCdef...`)
6. Envoyez un message à votre nouveau bot
7. Récupérez votre chat ID :
   ```
   https://api.telegram.org/bot<VOTRE_TOKEN>/getUpdates
   ```
   Cherchez `"chat":{"id":123456789`

### Étape 5 : Lancer l'agent

```bash
./deploy.sh
```

Ou manuellement :

```bash
docker-compose up -d
```

### Étape 6 : Vérifier l'installation

```bash
# Vérifier que le service tourne
docker-compose ps

# Voir les logs
docker-compose logs -f

# Tester l'API
curl http://localhost:3000/api/health
```

Accédez au dashboard : **http://localhost:3000**

Login par défaut : `admin` / `admin`

---

## 🔧 Installation Manuelle (sans Docker)

### Prérequis

```bash
# Vérifier Node.js
node --version  # Doit être >= 18

# Installer si nécessaire (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Installation

```bash
# 1. Extraire le package
cd airbnb-agent-pro/src

# 2. Installer les dépendances
npm install

# 3. Configurer
cp config.example.json config.json
# Éditer config.json

cp .env.example .env
# Éditer .env

# 4. Lancer
npm start

# Ou en mode développement
npm run dev
```

---

## 🌐 Exposition sur Internet (optionnel)

### Avec Nginx (recommandé)

```nginx
server {
    listen 80;
    server_name agent.votredomaine.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Avec Cloudflare Tunnel (gratuit)

```bash
# Installer cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Se connecter
cloudflared tunnel login

# Créer un tunnel
cloudflared tunnel create airbnb-agent

# Configurer et démarrer
cloudflared tunnel route dns airbnb-agent agent.votredomaine.com
cloudflared tunnel run airbnb-agent
```

---

## ✅ Checklist Post-Installation

- [ ] Changer le mot de passe admin par défaut
- [ ] Configurer l'email IMAP et tester la connexion
- [ ] Créer le bot Telegram et récupérer le token
- [ ] Envoyer un message test au bot
- [ ] Configurer le bien dans config.json
- [ ] Tester le parsing avec un email de démo
- [ ] Vérifier que les notifications Telegram arrivent
- [ ] Tester l'envoi d'une réponse depuis le dashboard
- [ ] (Optionnel) Configurer un nom de domaine
- [ ] (Optionnel) Activer HTTPS avec Let's Encrypt

---

## 🐛 Dépannage

### "Cannot connect to IMAP"
- Vérifiez vos credentials
- Pour Gmail : utilisez un "App Password", pas votre mot de passe principal
- Vérifiez que l'IMAP est activé dans les paramètres de l'email

### "Telegram bot not responding"
- Vérifiez le token
- Assurez-vous d'avoir envoyé un message au bot avant de récupérer le chat ID
- Vérifiez que le chat ID est correct (peut être négatif pour les groupes)

### "Port 3000 already in use"
```bash
# Trouver le processus
sudo lsof -i :3000

# Tuer le processus
sudo kill -9 <PID>

# Ou changer le port dans docker-compose.yml
```

### Les emails ne sont pas détectés
- Vérifiez que l'email reçoit bien les notifications Airbnb
- Certains fournisseurs déplacent les emails dans des dossiers spéciaux
- Vérifiez les logs : `docker-compose logs -f`

---

## 📞 Support

En cas de problème :
1. Consultez les logs : `docker-compose logs -f`
2. Vérifiez la documentation
3. Contactez le support
