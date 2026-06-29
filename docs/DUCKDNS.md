# Déploiement — licenceskayapps.duckdns.org

| Paramètre | Valeur |
|-----------|--------|
| Domaine | **licenceskayapps.duckdns.org** |
| IP publique | **196.178.221.197** |
| Dashboard | https://licenceskayapps.duckdns.org |
| API admin | https://licenceskayapps.duckdns.org/api |
| API Electron | https://licenceskayapps.duckdns.org/api/v1/client |

## 1. DuckDNS

1. Connectez-vous sur [duckdns.org](https://www.duckdns.org)
2. Vérifiez que `licenceskayapps` pointe vers **196.178.221.197**
3. Test : `ping licenceskayapps.duckdns.org`

### Mise à jour automatique de l'IP (si IP dynamique)

```bash
mkdir -p ~/duckdns
echo 'echo url="https://www.duckdns.org/update?domains=licenceskayapps&token=VOTRE-TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -' > ~/duckdns/duck.sh
chmod 700 ~/duckdns/duck.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh") | crontab -
```

## 2. Pare-feu

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Si le serveur est derrière une box : rediriger les ports 80 et 443 vers la machine.

## 3. Variables d'environnement

Copiez les exemples production :

```bash
cp backend/.env.production.example backend/.env
cp frontend/.env.production.example frontend/.env
```

Éditez `backend/.env` : définissez `JWT_SECRET` et le mot de passe admin.

Build frontend :

```bash
cd frontend && npm run build
```

## 4. Nginx

Utilisez le fichier `deploy/nginx-licenceskayapps.conf` fourni dans le projet, ou :

```bash
sudo cp deploy/nginx-licenceskayapps.conf /etc/nginx/sites-available/license-platform
sudo ln -sf /etc/nginx/sites-available/license-platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 5. HTTPS

```bash
sudo certbot --nginx -d licenceskayapps.duckdns.org
```

## 6. Démarrage API

```bash
cd backend
npm run build
pm2 start dist/index.js --name license-api
pm2 save
```

## 7. Vérification

```bash
curl https://licenceskayapps.duckdns.org/health
```

Réponse attendue : `{"status":"ok","timestamp":"..."}`
