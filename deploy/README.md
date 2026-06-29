# Guide de déploiement pas à pas

Domaine : **licenceskayapps.duckdns.org**  
Repo GitHub : **https://github.com/Caeser9/GestionnaireLicencesElectronApps**

---

## Quel serveur utiliser ?

| | Machine locale (196.178.221.197) | VPS Cloud |
|--|----------------------------------|-----------|
| Disponibilité | Dépend de votre box/PC | 24/7 |
| IP | Peut changer | Fixe en général |
| Ports 80/443 | Redirection box requise | Ouverts directement |
| **Recommandé pour production** | Non | **Oui** |

**Conseil :** déployez sur le **VPS cloud**, puis mettez à jour DuckDNS avec l’**IP du VPS**.

---

## Étape 0 — Pointer DuckDNS vers le VPS cloud

1. Notez l’**IP publique du VPS** (fournie par votre hébergeur)
2. Sur [duckdns.org](https://www.duckdns.org), mettez `licenceskayapps` → **IP du VPS**
3. Vérifiez : `ping licenceskayapps.duckdns.org`

---

## Étape 1 — Connexion au VPS cloud

```bash
ssh root@IP_DU_VPS
# ou
ssh ubuntu@IP_DU_VPS
```

(Remplacez par l’IP et l’utilisateur fournis par votre hébergeur : OVH, Hetzner, Contabo, DigitalOcean, etc.)

---

## Étape 2 — Cloner le projet (GitHub)

```bash
sudo apt update && sudo apt install -y git
sudo git clone https://github.com/Caeser9/GestionnaireLicencesElectronApps.git /opt/license-platform
cd /opt/license-platform
```

---

## Étape 3 — Configurer le mot de passe admin

```bash
sudo nano backend/.env.production.example
```

Modifiez :

```env
SEED_ADMIN_EMAIL=votre@email.com
SEED_ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

---

## Étape 4 — Installation automatique

```bash
sudo chmod +x deploy/install.sh
sudo RUN_SEED=1 bash deploy/install.sh
```

---

## Étape 5 — Vérifier

```bash
curl https://licenceskayapps.duckdns.org/health
```

Navigateur : **https://licenceskayapps.duckdns.org**

---

## Déploiement sur machine locale (alternative)

Si vous préférez la machine à **196.178.221.197** :

```bash
ssh utilisateur@196.178.221.197
# Puis mêmes étapes 2 à 5 (clone ou scp)
```

Assurez-vous d’ouvrir/rediriger les ports **80** et **443** sur votre box.

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
