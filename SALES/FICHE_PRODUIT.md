# 🏠 Airbnb Agent Pro — Fiche Produit

> **Automatisez la qualification de vos demandes Airbnb. Gagnez 10h/semaine. Convertissez plus.**

---

## Le Problème

En tant qu'hôte Airbnb, vous perdez du temps et de l'argent :

- **40% des demandes** sont des mauvais fits (trop de monde, événements inadaptés)
- **Réponse moyenne : 3-6h** → les prospects passent à la concurrence
- **Même questions, même réponses**, répétées en boucle
- **Pas de visibilité** sur vos performances de conversion

---

## La Solution

**Airbnb Agent Pro** = Un agent IA qui lit, qualifie et répond à vos demandes automatiquement.

### Ce qu'il fait

| Étape | Action | Résultat |
|-------|--------|----------|
| **1. Capture** | Connexion IMAP à votre email | Détection instantanée des nouvelles demandes |
| **2. Analyse** | Parsing intelligent (dates, pers, événement) | Extraction complète en 2 secondes |
| **3. Scoring** | Algorithme propriétaire 0-100 | Identification des leads HOT vs perte de temps |
| **4. Réponse** | Templates personnalisés | Message adapté au contexte, jamais robotique |
| **5. Validation** | Dashboard + notifications mobile | Vous gardez le contrôle final |

---

## Fonctionnalités Clés

### 🧠 Qualification Intelligente
- **Parsing NLP** : extrait dates, nombre de personnes, type d'événement
- **Scoring multi-facteur** : capacité, délai, détails fournis, intention d'achat
- **Détection red flags** : capacité dépassée, demandes non conformes, price shoppers

### ⚡ Mode Semi-Automatique
- **Score ≥ 80% + pas de red flags** → Réponse envoyée auto
- **Score < 80% ou flags** → Validation humaine requise
- **Vous gardez le contrôle** sur les cas limites

### 📱 Notifications Mobile
- Alertes Telegram instantanées
- Résumé client + score + boutons Valider/Rejeter/Modifier
- Récap quotidien des performances

### 📊 Dashboard Analytics
- Stats en temps réel (en attente, traités, conversion)
- Graphique d'activité
- Historique complet des demandes
- Dark mode inclus

### 🔧 Personnalisable
- Templates de réponse éditables
- Configuration tarifs, capacité, équipements
- Règles de scoring ajustables
- Multi-biens supporté

---

## Spécifications Techniques

| Aspect | Détail |
|--------|--------|
| **Stack** | Node.js + Express + SQLite |
| **Frontend** | HTML5 + Tailwind CSS (pas de dépendance complexe) |
| **Real-time** | WebSocket natif |
| **Auth** | JWT sécurisé |
| **Email** | IMAP (Gmail, Outlook, etc.) |
| **Notifications** | Telegram Bot API |
| **Deploy** | Docker + Docker Compose |

### Prérequis
- Serveur VPS (à partir de 5€/mois) ou hébergement local
- Node.js 18+ ou Docker
- Adresse email dédiée pour les demandes
- Bot Telegram (création gratuite)

---

## Cas d'Usage

### Location Événementielle (extérieur)
- Capacité 40 pers max
- Filtre automatique des demandes trop grosses
- Proposition de visite systématique
- Pas de prix affiché en 1er message

### Appartement Meublé
- Qualification dates + durée
- Détection séjours trop courts
- Réponses instantanées = meilleur taux de conversion

### Multi-biens
- Configuration par propriété
- Routing intelligent selon le bien concerné
- Stats consolidées ou par propriété

---

## ROI : Le Calcul

| Sans Agent | Avec Agent |
|------------|------------|
| 15 min / demande (lecture + réponse) | 30 sec / demande (validation si besoin) |
| 20 demandes/semaine = **5h** | 20 demandes/semaine = **10 min** |
| Réponse moyenne : 4h | Réponse moyenne : **< 5 min** |
| Taux conversion : ~15% | Taux conversion : **+30%** (réactivité) |

**Gain de temps : 10h/semaine minimum**

---

## Ce qui est Inclus

### Package Standard (€XXX)
- ✅ Code source complet
- ✅ Dashboard web
- ✅ Intégration Telegram
- ✅ Documentation setup
- ✅ 1 mois de support

### Package Pro (€XXX)
- Tout le Standard +
- ✅ Setup personnalisé sur votre VPS
- ✅ Configuration sur mesure
- ✅ Templates de réponse custom
- ✅ 3 mois de support + mises à jour
- ✅ Formation 1h en visio

---

## Témoignages (à compléter)

> *"Avant, je passais mes soirées à répondre aux demandes. Maintenant je valide juste les cas limites depuis mon téléphone."*
> — **Hôte Airbnb, 3 biens**

> *"Le scoring est bluffant. Il détecte vraiment les mauvais fits avant que je perde du temps."*
> — **Propriétaire, location événementielle**

---

## FAQ

**Q : Est-ce que ça fonctionne avec le site officiel Airbnb ?**
R : L'agent se connecte à votre email (IMAP) où vous recevez les notifications Airbnb. Pas besoin d'API officielle.

**Q : Puis-je modifier les réponses générées ?**
R : Oui, le dashboard permet d'éditer chaque réponse avant envoi. Vous gardez le contrôle total.

**Q : Et si l'agent se trompe ?**
R : Mode semi-auto par défaut : seuls les scores ≥ 80% sans red flags sont envoyés auto. Le reste attend votre validation.

**Q : C'est compliqué à installer ?**
R : Docker Compose = 1 commande. Ou je m'en charge avec le package Pro.

**Q : Ça marche pour d'autres plateformes (Booking, Abritel) ?**
R : Oui, tant que vous recevez des emails de notification, l'agent peut parser et répondre.

---

## Prochaines Étapes

1. **Démo** : Je vous montre l'agent en action sur une demande test
2. **Audit** : On analyse votre volume de demandes actuel
3. **Setup** : Installation et configuration sur votre infrastructure
4. **Formation** : 1h pour maîtriser le dashboard et les règles

---

**Intéressé ? Parlons de votre projet.**

📧 contact@exemple.com
💬 Telegram : @votre_contact

---

*Airbnb Agent Pro — Construit avec ❤️ pour les hôtes qui veulent scaler sans y passer leur vie.*
