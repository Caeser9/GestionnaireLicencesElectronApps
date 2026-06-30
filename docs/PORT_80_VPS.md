# Port 80 déjà utilisé sur le VPS

## 1. Identifier quel programme utilise le port 80

```bash
sudo ss -tlnp | grep ':80'
# ou
sudo lsof -i :80
```

Exemples de résultats :

| Processus | Signification |
|-----------|---------------|
| `nginx` | Normal — Nginx doit écouter sur 80 |
| `apache2` | Apache occupe le port → conflit avec Nginx |
| `docker-proxy` | Un conteneur Docker utilise le port 80 |
| `node` / autre app | Votre app écoute directement sur 80 |

---

## 2. Solutions selon le cas

### Cas A — C'est déjà Nginx (souvent le bon cas)

Si vous voyez `nginx` sur le port 80, **c'est normal**. Le problème Certbot n'est pas un conflit de port, mais l'accès **depuis Internet** (pare-feu cloud ou DuckDNS).

Vérifiez :

```bash
sudo nginx -t
sudo systemctl status nginx
curl -I http://127.0.0.1
```

Puis ouvrez le port 80 dans le **pare-feu de l'hébergeur** (panel OVH/Hetzner/Contabo).

---

### Cas B — Apache utilise le port 80

**Option 1 — Désactiver Apache** (si vous n'en avez pas besoin) :

```bash
sudo systemctl stop apache2
sudo systemctl disable apache2
sudo systemctl restart nginx
```

**Option 2 — Garder Apache** : ne pas installer Nginx, configurer Apache comme reverse proxy (voir fin du document).

---

### Cas C — Un conteneur Docker

```bash
docker ps
# Arrêter le conteneur qui mappe le port 80
docker stop NOM_DU_CONTENEUR
sudo systemctl restart nginx
```

---

### Cas D — Une autre application Node / PM2 sur le port 80

L'API License Platform doit écouter sur **4000**, pas 80. Seul Nginx doit être sur 80.

```bash
pm2 list
sudo ss -tlnp | grep ':80'
```

Si une app Node est sur 80, changez son port et laissez Nginx en frontal :

```bash
pm2 restart NOM_APP   # après avoir changé PORT dans .env
```

Vérifiez `backend/.env` :

```env
PORT=4000
```

---

## 3. Configurer Nginx pour License Platform

Une fois le port 80 libéré pour Nginx (ou si Nginx l'a déjà) :

```bash
sudo cp /opt/license-platform/deploy/nginx-licenceskayapps.conf \
  /etc/nginx/sites-available/license-platform

sudo ln -sf /etc/nginx/sites-available/license-platform \
  /etc/nginx/sites-enabled/license-platform

# Désactiver le site par défaut s'il entre en conflit
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Relancer Certbot

**Si Nginx écoute sur 80 :**

```bash
sudo certbot --nginx -d licenceskayapps.duckdns.org
```

**Si le port 80 est bloqué par un autre service que vous ne pouvez pas arrêter :**

Mode standalone (libère le port 80 temporairement) :

```bash
sudo systemctl stop nginx
# Arrêtez aussi apache ou docker si nécessaire
sudo certbot certonly --standalone -d licenceskayapps.duckdns.org
sudo systemctl start nginx
sudo certbot install --cert-name licenceskayapps.duckdns.org
```

---

## 5. Vérification finale

```bash
sudo ss -tlnp | grep -E ':80|:443|:4000'
```

Résultat attendu :

| Port | Service |
|------|---------|
| 80 | nginx |
| 443 | nginx (après SSL) |
| 4000 | node (license-api via PM2) |

Test externe (depuis votre PC) :

```bash
curl -I http://licenceskayapps.duckdns.org
```

---

## Résumé

- **Nginx sur 80** → correct, le vrai blocage est souvent le **pare-feu cloud**
- **Apache / Docker / autre sur 80** → arrêter ou déplacer, puis Nginx + Certbot
