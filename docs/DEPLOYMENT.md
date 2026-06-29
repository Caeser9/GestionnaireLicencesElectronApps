# Guide de déploiement en production

## Prérequis VPS

- Ubuntu 22.04+ ou Debian 12+
- Node.js 20 LTS
- MongoDB 7 (local ou Atlas)
- Nginx
- Certificat SSL (Let's Encrypt)
- Nom de domaine: `licenceskayapps.duckdns.org` (IP: 196.178.221.197)

## 1. Préparation du serveur

```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# PM2
sudo npm install -g pm2
```

## 2. Déploiement de l'application

```bash
# Cloner le projet
git clone <repo-url> /opt/license-platform
cd /opt/license-platform

# Backend
cd backend
cp .env.example .env
# Éditer .env avec les valeurs de production
npm ci
npm run build
npm run generate-keys
npm run seed

# Frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL=https://licenceskayapps.duckdns.org/api
npm ci
npm run build
```

## 3. Configuration .env production

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://localhost:27017/license-platform
JWT_SECRET=<generer-une-cle-aleatoire-de-64-caracteres>
CORS_ORIGIN=https://licenceskayapps.duckdns.org
```

## 4. PM2 — Process Manager

```bash
cd /opt/license-platform/backend
pm2 start dist/index.js --name license-api
pm2 save
pm2 startup
```

## 5. Nginx

```nginx
server {
    listen 80;
    server_name licenceskayapps.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name licenceskayapps.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/licenceskayapps.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/licenceskayapps.duckdns.org/privkey.pem;

    # Frontend (Dashboard)
    location / {
        root /opt/license-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:4000;
    }
}
```

```bash
sudo certbot --nginx -d licenceskayapps.duckdns.org
sudo nginx -t && sudo systemctl reload nginx
```

## 6. MongoDB

Option locale:
```bash
# Utiliser docker-compose ou installer MongoDB nativement
docker compose up -d mongodb
```

Option cloud (recommandé): [MongoDB Atlas](https://www.mongodb.com/atlas) — mettre l'URI dans `MONGODB_URI`.

## 7. Sauvegardes

```bash
# Backup quotidien MongoDB
mongodump --uri="mongodb://localhost:27017/license-platform" --out=/backup/$(date +%Y%m%d)

# Sauvegarder les clés RSA (CRITIQUE)
cp backend/keys/license-private.pem /backup/keys/
```

## 8. Sécurité

- [ ] Changer le mot de passe admin par défaut
- [ ] Générer un JWT_SECRET fort et unique
- [ ] Ne jamais commiter `license-private.pem`
- [ ] Configurer un firewall (ufw): ports 22, 80, 443 uniquement
- [ ] Activer les mises à jour automatiques de sécurité
- [ ] Monitorer les logs PM2: `pm2 logs license-api`

## 9. Mises à jour

```bash
cd /opt/license-platform
git pull
cd backend && npm ci && npm run build && pm2 restart license-api
cd ../frontend && npm ci && npm run build
```
