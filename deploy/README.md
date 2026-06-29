# Guide de déploiement pas à pas

Domaine : **licenceskayapps.duckdns.org**  
IP : **196.178.221.197**

---

## Étape 1 — Connexion au serveur

Depuis votre PC Windows (PowerShell ou Git Bash) :

```bash
ssh utilisateur@196.178.221.197
```

Remplacez `utilisateur` par votre compte Linux (`root`, `ubuntu`, `debian`, etc.).

---

## Étape 2 — Transférer le projet sur le serveur

**Option A — Git (recommandé si repo GitHub/GitLab)**

```bash
sudo mkdir -p /opt/license-platform
sudo git clone VOTRE_URL_REPO /opt/license-platform
cd /opt/license-platform
```

**Option B — Copie depuis votre PC (SCP)**

Depuis votre PC, dans le dossier parent du projet :

```bash
scp -r "Gestion Licences" utilisateur@196.178.221.197:/tmp/license-platform
```

Puis sur le serveur :

```bash
sudo mv /tmp/license-platform /opt/license-platform
cd /opt/license-platform
```

---

## Étape 3 — Configurer le mot de passe admin

```bash
sudo nano /opt/license-platform/backend/.env.production.example
```

Modifiez au minimum :

```env
SEED_ADMIN_EMAIL=votre@email.com
SEED_ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

---

## Étape 4 — Lancer l'installation automatique

```bash
cd /opt/license-platform
sudo chmod +x deploy/install.sh
sudo RUN_SEED=1 bash deploy/install.sh
```

Le script installe : Node.js, MongoDB, Nginx, PM2, build l'app, configure HTTPS.

---

## Étape 5 — Vérifier

```bash
curl https://licenceskayapps.duckdns.org/health
```

Ouvrez dans le navigateur : **https://licenceskayapps.duckdns.org**

Connectez-vous avec l'email et le mot de passe définis dans `.env`.

---

## Commandes utiles après déploiement

```bash
# Logs API
pm2 logs license-api

# Redémarrer l'API
pm2 restart license-api

# Statut
pm2 status

# Mettre à jour l'app
cd /opt/license-platform
git pull
cd backend && npm install && npm run build && pm2 restart license-api
cd ../frontend && npm install && npm run build
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Site inaccessible | `sudo ufw status` — ports 80/443 ouverts ? |
| Erreur 502 | `pm2 logs license-api` — MongoDB démarré ? `sudo systemctl status mongod` |
| Certificat SSL | `sudo certbot renew --dry-run` |
| DuckDNS IP changée | Mettre à jour sur duckdns.org ou script cron |
