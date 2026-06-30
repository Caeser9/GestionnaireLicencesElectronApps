#!/bin/bash
# Mise à jour backend sur le VPS — exécuter sur le serveur
set -e
cd /opt/license-platform || { echo "Dossier /opt/license-platform introuvable"; exit 1; }

echo ">>> git pull"
git pull

echo ">>> backend build"
cd backend
npm install
npm run build

echo ">>> vérification du correctif dans dist/"
if grep -rq "normalizeLicenseNumericFields\|optionalPositiveInt" dist/ 2>/dev/null; then
  echo "OK: correctif présent dans dist/"
else
  echo "ATTENTION: correctif absent — vérifiez git pull"
fi

echo ">>> redémarrage PM2"
pm2 restart license-api
pm2 logs license-api --lines 5 --nolog

echo ">>> frontend build"
cd ../frontend
npm install
cp .env.production.example .env.production 2>/dev/null || echo "VITE_API_URL=https://licenceskayapps.duckdns.org/api" > .env.production
npm run build

echo ""
echo "Terminé. Rechargez le dashboard avec Ctrl+Shift+R"
