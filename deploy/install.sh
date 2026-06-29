#!/bin/bash
# Installation License Platform sur licenceskayapps.duckdns.org
# Usage: sudo bash deploy/install.sh
# Prérequis: Ubuntu 22.04+ / Debian 12+, accès root

set -e

DOMAIN="licenceskayapps.duckdns.org"
APP_DIR="/opt/license-platform"
NODE_MAJOR=20

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[ERREUR]${NC} $1"; exit 1; }

[[ $EUID -eq 0 ]] || err "Exécutez avec sudo: sudo bash deploy/install.sh"

echo "=========================================="
echo " License Platform — $DOMAIN"
echo "=========================================="

# --- 1. Paquets système ---
log "Mise à jour des paquets..."
apt-get update -qq
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# --- 2. Node.js ---
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d v) -lt $NODE_MAJOR ]]; then
  log "Installation Node.js $NODE_MAJOR..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get install -y nodejs
fi
log "Node $(node -v) / npm $(npm -v)"

# --- 3. PM2 ---
if ! command -v pm2 &>/dev/null; then
  log "Installation PM2..."
  npm install -g pm2
fi

# --- 4. MongoDB ---
if ! command -v mongod &>/dev/null; then
  log "Installation MongoDB..."
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list 2>/dev/null || true
  apt-get update -qq
  apt-get install -y mongodb-org || apt-get install -y mongodb || warn "MongoDB: installez manuellement ou utilisez Atlas"
  systemctl enable mongod 2>/dev/null || true
  systemctl start mongod 2>/dev/null || true
fi
log "MongoDB actif"

# --- 5. Pare-feu ---
log "Configuration pare-feu..."
ufw allow 22/tcp  2>/dev/null || true
ufw allow 80/tcp  2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
echo "y" | ufw enable 2>/dev/null || true

# --- 6. Répertoire application ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")"

if [[ "$SOURCE_DIR" != "$APP_DIR" ]] && [[ -d "$SOURCE_DIR/backend" ]]; then
  log "Copie vers $APP_DIR..."
  mkdir -p "$APP_DIR"
  rsync -a --exclude node_modules --exclude dist --exclude .env "$SOURCE_DIR/" "$APP_DIR/"
elif [[ ! -d "$APP_DIR/backend" ]]; then
  err "Code source introuvable. Clonez d'abord le projet dans $APP_DIR"
fi

cd "$APP_DIR"

# --- 7. Backend .env ---
if [[ ! -f backend/.env ]]; then
  log "Création backend/.env..."
  cp backend/.env.production.example backend/.env
  JWT_SECRET=$(openssl rand -base64 48)
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" backend/.env
  warn "JWT_SECRET généré automatiquement (sauvegardé dans backend/.env)"
  warn "Changez SEED_ADMIN_PASSWORD dans backend/.env avant le seed!"
fi

# --- 8. Frontend .env ---
if [[ ! -f frontend/.env ]]; then
  cp frontend/.env.production.example frontend/.env
fi

# --- 9. Clés RSA ---
if [[ ! -f backend/keys/license-private.pem ]]; then
  log "Génération des clés RSA..."
  cd backend && npm install --silent && npm run generate-keys && cd ..
fi

# --- 10. Build backend ---
log "Build backend..."
cd backend
npm install --silent
npm run build

# Seed (première installation uniquement)
if [[ "${RUN_SEED:-}" == "1" ]] || [[ ! -f /var/lib/license-platform-seeded ]]; then
  warn "Exécution du seed (admin initial)..."
  npm run seed && touch /var/lib/license-platform-seeded
fi
cd ..

# --- 11. Build frontend ---
log "Build frontend..."
cd frontend
npm install --silent
npm run build
cd ..

# --- 12. PM2 ---
log "Démarrage API avec PM2..."
cd backend
pm2 delete license-api 2>/dev/null || true
pm2 start dist/index.js --name license-api
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup
cd ..

# --- 13. Nginx ---
log "Configuration Nginx..."
cp deploy/nginx-licenceskayapps.conf /etc/nginx/sites-available/license-platform
ln -sf /etc/nginx/sites-available/license-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t
systemctl reload nginx
systemctl enable nginx

# --- 14. HTTPS ---
if [[ ! -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
  warn "Configuration HTTPS — entrez votre email pour Let's Encrypt:"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email \
    || certbot --nginx -d "$DOMAIN"
else
  log "Certificat SSL déjà présent"
fi

echo ""
echo "=========================================="
log "Installation terminée!"
echo ""
echo "  Dashboard : https://$DOMAIN"
echo "  API       : https://$DOMAIN/api"
echo "  Health    : https://$DOMAIN/health"
echo ""
warn "Actions restantes:"
echo "  1. Éditez $APP_DIR/backend/.env (mot de passe admin)"
echo "  2. RUN_SEED=1 sudo bash deploy/install.sh  (si seed pas encore fait)"
echo "  3. curl https://$DOMAIN/health"
echo "=========================================="
