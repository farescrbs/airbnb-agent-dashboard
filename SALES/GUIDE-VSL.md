# 🎬 Guide VSL avec Veo 3 — Airbnb Agent Pro

## Qu'est-ce que Veo 3 ?

**Veo 3** est le modèle de génération vidéo IA de Google (DeepMind) qui crée des vidéos réalistes à partir de texte ou d'images. Disponible via :
- **Vertex AI** (Google Cloud) — API pour développeurs
- **Flow** (interface web) — bientôt accessible grand public
- **YouTube Shorts** — intégration progressive

## 🎯 Script VSL pour Airbnb Agent Pro

### Structure VSL (4-5 minutes)

```
[0:00-0:30] HOOK — Le problème
[0:30-1:30] AGITATION — Combien ça coûte actuellement
[1:30-2:30] SOLUTION — L'agent IA
[2:30-3:30] PREUVE — Démonstration/résultats
[3:30-4:30] OFFRE — Prix + urgence
[4:30-5:00] CTA — Appel à l'action
```

### Script détaillé

---

**[HOOK — 0:00-0:30]**

*Visuel : Toi sur ton téléphone, le soir, l'air fatigué*

> "C'est 22h. Je viens de finir ma journée. Et pourtant... je dois encore répondre à 8 demandes Airbnb.
> 
> 15 minutes par demande. Des mêmes questions. Encore et encore.
> 
> Si vous êtes propriétaire, vous savez exactement de quoi je parle."

---

**[AGITATION — 0:30-1:30]**

*Visuel : Calculatrice, montre, pile de notifications*

> "Faisons les comptes. 20 demandes par semaine. 15 minutes chacune.
> 
> Ça fait 5 heures. Par semaine. 20 heures par mois.
> 
> Et le pire ? Vous perdez des clients. Parce que vous répondez en 4 heures. La concurrence répond en 10 minutes.
> 
> Résultat : 30% de réservations en moins. Juste à cause de la lenteur."

---

**[SOLUTION — 1:30-2:30]**

*Visuel : Dashboard de l'agent, notifications Telegram*

> "J'ai créé Airbnb Agent Pro. Un agent IA qui lit, analyse et répond à vos demandes automatiquement.
> 
> Voici comment ça marche :
> - Une demande arrive
> - L'agent extrait les infos : dates, personnes, événement
> - Il calcule un score de 0 à 100
> - Si c'est un bon lead → réponse auto en 2 secondes
> - Si besoin de validation → notification sur votre téléphone
> 
> Résultat : moins de 5 minutes de réponse. 24h/24."

---

**[PREUVE — 2:30-3:30]**

*Visuel : Screenshots dashboard, graphiques, témoignages*

> "Regardez ces résultats après 30 jours :
> - 10 heures économisées par semaine
> - Taux de conversion : +30%
> - Temps de réponse moyen : 2 minutes 30
> 
> Marie, propriétaire à Toulouse : 'J'ai récupéré mes soirées. Mon taux de conversion est passé de 15% à 42%.'
> 
> Thomas, location événementielle : 'L'agent filtre automatiquement les mauvaises demandes. Je gagne du temps ET de l'argent.'"

---

**[OFFRE — 3:30-4:30]**

*Visuel : Pricing cards, compte à rebours*

> "Normalement, un développement sur mesure coûte 5000€+.
> 
> Aujourd'hui, deux options :
> - Standard : 497€ — Vous installez vous-même
> - Pro : 997€ — Je m'occupe de tout, formation incluse
> 
> Offre de lancement : -50% jusqu'à dimanche minuit.
> 
> Garantie 30 jours : satisfait ou remboursé. Sans question."

---

**[CTA — 4:30-5:00]**

*Visuel : Bouton, lien, QR code*

> "Cliquez sur le lien sous cette vidéo. Choisissez votre package. Et commencez à automatiser dès ce soir.
> 
> Vos 10 heures par semaine vous attendent.
> 
> À tout de suite."

---

## 🛠️ Comment créer avec Veo 3

### Option 1 : Vertex AI (API)

```bash
# Nécessite un compte Google Cloud
# Prix : ~$0.05/seconde de vidéo

curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-003:predict \
  -d '{
    "instances": [{
      "prompt": "Professional businessman sitting at desk, modern office, explaining something with hand gestures, warm lighting, 4k quality"
    }],
    "parameters": {
      "aspectRatio": "16:9",
      "durationSeconds": 8
    }
  }'
```

### Option 2 : Alternatives accessibles maintenant

| Outil | Prix | Qualité | Audio |
|-------|------|---------|-------|
| **HeyGen** | $29/mois | ⭐⭐⭐⭐⭐ | ✅ Voix IA |
| **Synthesia** | $22/mois | ⭐⭐⭐⭐⭐ | ✅ Voix IA |
| **D-ID** | $5.9/mois | ⭐⭐⭐⭐ | ✅ Voix IA |
| **Runway Gen-3** | $15/mois | ⭐⭐⭐⭐⭐ | ❌ |
| **Pika Labs** | Gratuit | ⭐⭐⭐⭐ | ❌ |

### Option recommandée : HeyGen

**Pourquoi HeyGen pour ta VSL :**
- Avatar IA réaliste (toi ou personnage)
- Voix IA naturelle (français disponible)
- Script → Vidéo en 10 min
- 100+ templates VSL

**Étapes :**
1. Crée compte sur [heygen.com](https://heygen.com)
2. Choisis template "Sales Video" ou "Product Demo"
3. Upload ta photo ou choisis avatar
4. Colle le script ci-dessus
5. Génère la vidéo
6. Télécharge et upload sur Vimeo/YouTube

---

## 📝 Prompts pour générer les visuels

### Scène 1 : Hook (problème)
```
"Young professional man sitting on couch at night, looking exhausted at phone screen with notifications, dim living room lighting, cinematic shot, 4k, realistic"
```

### Scène 2 : Dashboard
```
"Modern web dashboard interface on laptop screen, showing analytics charts and notification cards, clean UI design, purple and pink gradient accents, professional office background, shallow depth of field"
```

### Scène 3 : Résultats
```
"Split screen showing before/after: left side stressed person with calculator, right side relaxed person on beach with phone showing success metrics, bright optimistic lighting"
```

---

## 🎬 Montage final

**Outils de montage :**
- **CapCut** (gratuit, simple)
- **Descript** (édition texte)
- **Final Cut Pro** (pro)

**Éléments à ajouter :**
- [ ] Musique de fond (Epidemic Sound)
- [ ] Sous-titres (80% regardent sans son)
- [ ] Zoom sur les chiffres clés
- [ ] Transitions fluides
- [ ] Logo/branding

---

## 📤 Hébergement VSL

| Plateforme | Avantage | Prix |
|------------|----------|------|
| **Vimeo** | Pro, pas de pubs | 7€/mois |
| **YouTube** | Gratuit, SEO | Gratuit |
| **Wistia** | Analytics pro | 19€/mois |
| **Bunny.net** | Rapide, pas cher | 1€/mois |

**Recommandation :** Vimeo Pro pour l'aspect pro + pas de distractions.

---

## 🚀 Prochaines étapes

1. **Écris le script** (adapte avec ta voix/ton)
2. **Choisis l'outil** (HeyGen recommandé)
3. **Génère la vidéo** (10-15 min de travail)
4. **Upload sur Vimeo**
5. **Intègre dans la landing page** (remplace le placeholder)
6. **Test A/B** (VSL vs pas de VSL)

---

**Ressources :**
- [HeyGen](https://heygen.com)
- [Vimeo](https://vimeo.com)
- [CapCut](https://capcut.com)

Besoin d'aide pour un script personnalisé ou la génération ?
