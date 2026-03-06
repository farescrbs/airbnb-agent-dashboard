FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache curl

# Copier package.json
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier data
RUN mkdir -p data

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Démarrer l'application
CMD ["node", "start.js"]
