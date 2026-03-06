# Manuel Utilisateur — Airbnb Agent Pro

## 🎯 Vue d'ensemble

Airbnb Agent Pro est votre assistant virtuel qui :
1. **Surveille** votre boîte email pour les nouvelles demandes Airbnb
2. **Analyse** chaque demande (dates, personnes, événement)
3. **Score** la qualité du lead (0-100)
4. **Génère** une réponse personnalisée
5. **Vous notifie** pour validation ou envoi auto

---

## 📱 Notifications Telegram

### Nouvelle demande reçue

Quand une demande arrive, vous recevez :

```
🏠 Nouvelle demande Airbnb

Client: Marie
Événement: Anniversaire
Personnes: 25
Score: ✅ 85/100

✓ Demande complète
✓ Taille de groupe optimale

📱 Voir le dashboard
```

### Actions disponibles

Depuis Telegram, vous pouvez :
- **Valider** → La réponse est envoyée
- **Modifier** → Vous éditez puis envoyez
- **Rejeter** → La demande est archivée

### Commandes Telegram

Envoyez ces commandes à votre bot :

- `/start` — Message de bienvenue + statut
- `/stats` — Statistiques du jour
- `/test` — Envoyer une notification test
- `/help` — Liste des commandes

---

## 📊 Dashboard Web

### Accès

URL : `http://localhost:3000` (ou votre domaine)

Login : `admin` / `admin` (changez-le !)

### Vue d'ensemble

Le dashboard affiche :

| Stat | Description |
|------|-------------|
| **En attente** | Demandes nécessitant votre validation |
| **Traités** | Demandes approuvées ou rejetées |
| **Conversion** | % de demandes approuvées |
| **Revenu moyen** | Prix moyen des réservations |

### Liste des demandes

Chaque carte affiche :
- **Bordure verte** (score ≥ 70) → Lead chaud
- **Bordure orange** (score 40-69) → À évaluer
- **Bordure rouge** (score < 40) → Probablement non

Cliquez sur une carte pour voir les détails.

### Détail d'une demande

Dans la modale, vous voyez :
- Les infos extraites (dates, personnes, événement)
- Le score et les critères
- Les red flags éventuels
- La réponse proposée par l'agent

**Actions :**
- ✅ **Approuver** → Envoie la réponse
- ❌ **Refuser** → Archive la demande
- ✏️ **Modifier** → Éditez la réponse avant envoi

### Filtres

En haut de la liste :
- **Tous** — Toutes les demandes
- **En attente** — À traiter
- **Approuvés** — Réponses envoyées
- **Refusés** — Demandes rejetées

Barre de recherche : filtre par nom ou événement.

---

## ⚙️ Configuration

### Modifier les paramètres du bien

Éditez `config.json` :

```json
{
  "property": {
    "max_capacity": 40,        // Capacité maximale
    "has_sleeping": false      // Pas de couchage
  },
  "pricing": {
    "base_day_rate": 900,      // Prix de base
    "large_group_surcharge": 150  // Supplément groupe large
  },
  "hours": {
    "start": "10:00",          // Heure d'ouverture
    "end": "00:00"             // Heure de fermeture
  }
}
```

Redémarrez après modification :
```bash
docker-compose restart
```

### Ajuster le seuil d'auto-envoi

Dans `config.json` :

```json
{
  "confidence_threshold": 80,  // Score minimum pour auto-envoi
  "mode": "semi_auto"          // ou "manual" pour tout valider
}
```

- **80** = Conservateur (seuls les excellents leads passent auto)
- **60** = Équilibré
- **40** = Aggressif (plus d'auto, plus de risques)

### Personnaliser les réponses

Éditez `src/responder/response-generator.js` :

```javascript
this.templates = {
  standard_positive: `Bonjour {{name}},

Merci pour votre message !

[MODIFIEZ CE TEXTE]

Cordialement,
Votre Nom`
};
```

Variables disponibles :
- `{{name}}` — Prénom du client
- `{{event_type}}` — Type d'événement
- `{{dates}}` — Dates demandées
- `{{guest_count}}` — Nombre de personnes
- `{{price}}` — Prix calculé
- `{{max_capacity}}` — Capacité max
- `{{equipment_list}}` — Liste des équipements
- `{{hours}}` — Horaires
- `{{music_end}}` — Limite musique

---

## 📈 Statistiques & Analytics

### Métriques suivies

Le dashboard calcule automatiquement :

- **Volume** : demandes reçues par jour/semaine/mois
- **Qualité** : répartition des scores
- **Conversion** : % de demandes → réservations
- **Temps de réponse** : moyenne et médiane
- **Revenus** : estimés et réalisés

### Export des données

Les données sont stockées dans `data/inquiries.db` (SQLite).

Pour exporter :
```bash
# Se connecter au container
docker-compose exec airbnb-agent sh

# Exporter en CSV
sqlite3 data/inquiries.db ".mode csv" ".headers on" "SELECT * FROM inquiries" > /tmp/export.csv
cat /tmp/export.csv
```

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Changez le mot de passe admin**
   - Dashboard → Paramètres → Sécurité

2. **Utilisez HTTPS** en production
   - Let's Encrypt gratuit avec Certbot
   - Ou Cloudflare Tunnel

3. **Protégez votre .env**
   ```bash
   chmod 600 .env
   ```

4. **JWT Secret** : générez une chaîne aléatoire longue
   ```bash
   openssl rand -base64 32
   ```

### Mots de passe App

**Gmail** : Utilisez un "App Password", pas votre mot de passe principal
1. Paramètres Google → Sécurité → Validation en 2 étapes
2. Mots de passe d'application → Générer

**Outlook** : Même principe avec les mots de passe d'application

---

## 🐛 Résolution de problèmes

### L'agent ne répond plus

```bash
# Vérifier l'état
docker-compose ps

# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart
```

### Je ne reçois plus les notifications Telegram

1. Vérifiez que le bot est en ligne
2. Envoyez `/start` au bot
3. Vérifiez le chat ID dans `.env`
4. Redémarrez : `docker-compose restart`

### Les réponses sont envoyées sans ma validation

Vérifiez votre configuration :
```json
{
  "mode": "semi_auto",        // "manual" pour tout valider
  "confidence_threshold": 80   // Augmentez pour plus de contrôle
}
```

### Je veux désactiver l'auto-envoi

```json
{
  "auto_respond": false,
  "mode": "manual"
}
```

Toutes les demandes attendront votre validation.

---

## 💡 Conseils d'utilisation

### Pour maximiser vos conversions

1. **Répondez vite** — Même une validation rapide bat la concurrence
2. **Proposez la visite** — Le scoring favorise les demandes de visite
3. **Soyez flexible** — Les dates flexibles augmentent le score
4. **Suivez les stats** — Identifiez les patterns de conversion

### Pour affiner l'agent

Au début, utilisez le mode **manuel** pendant 1-2 semaines :
- Validez/rejetez les demandes
- Notez quand l'agent se trompe
- Ajustez les templates et le scoring
- Passez en **semi_auto** quand vous êtes confiant

---

## 📞 Support

Documentation complète : [lien]
Email : support@votre-email.com
Telegram : @votre_support

---

**Version** : 1.0.0  
**Dernière mise à jour** : Mars 2026
