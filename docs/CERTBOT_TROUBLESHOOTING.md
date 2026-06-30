# Dépannage Certbot / HTTPS — licenceskayapps.duckdns.org

Erreur typique :
```
Timeout during connect (likely firewall problem)
196.178.221.197: Fetching http://licenceskayapps.duckdns.org/.well-known/acme-challenge/...
```

Let's Encrypt doit pouvoir accéder à **http://licenceskayapps.duckdns.org** sur le **port 80** depuis Internet.

---

## Checklist (dans l'ordre)

### 1. DuckDNS pointe vers le BON serveur

Le domaine doit pointer vers la machine **où Nginx tourne actuellement**.

```bash
# Sur votre PC
ping licenceskayapps.duckdns.org
```

Comparez l'IP affichée avec celle du serveur :

```bash
# Sur le VPS
curl -4 ifconfig.me
# ou
hostname -I
```

| Situation | Action |
|-----------|--------|
| IP différente | Mettez à jour DuckDNS avec l'IP du VPS cloud |
| Même IP `196.178.221.197` | Passez à l'étape 2 |

---

### 2. Nginx écoute sur le port 80

```bash
sudo systemctl status nginx
sudo ss -tlnp | grep ':80'
curl -I http://127.0.0.1
curl -I http://licenceskayapps.duckdns.org
```

Si Nginx ne démarre pas :

```bash
sudo nginx -t
sudo journalctl -u nginx -n 30
```

---

### 3. Pare-feu sur le serveur (UFW)

```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

---

### 4. Pare-feu du fournisseur cloud (TRÈS FRÉQUENT)

Si vous utilisez **OVH, Hetzner, Contabo, DigitalOcean, AWS**, etc. :

1. Ouvrez le **panneau de contrôle** du VPS
2. Section **Firewall / Security groups / Réseau**
3. Autorisez **entrant** : TCP **80** et **443** depuis `0.0.0.0/0`

Sans cela, Let's Encrypt ne pourra jamais se connecter, même si UFW est ouvert.

---

### 5. Si le serveur est chez vous (box internet)

Sur votre **box/routeur**, redirigez :

| Port externe | → IP locale du serveur | Port interne |
|--------------|------------------------|--------------|
| 80 | 192.168.x.x | 80 |
| 443 | 192.168.x.x | 443 |

L'IP publique `196.178.221.197` doit être celle de votre box, et le serveur doit être allumé.

---

### 6. Test depuis l'extérieur

Depuis **votre PC** (pas le serveur) :

```bash
curl -v --connect-timeout 10 http://licenceskayapps.duckdns.org
```

Réponse attendue : en-têtes HTTP (200, 301 ou 404 — pas timeout).

Test en ligne : https://www.yougetsignal.com/tools/open-ports/
- IP : `196.178.221.197` (ou IP du VPS)
- Port : `80`

---

## Relancer Certbot (une fois le port 80 accessible)

```bash
sudo certbot --nginx -d licenceskayapps.duckdns.org
```

Ou sans email :

```bash
sudo certbot --nginx -d licenceskayapps.duckdns.org \
  --non-interactive --agree-tos \
  --register-unsafely-without-email
```

---

## Alternative : Certbot en mode standalone

Si Nginx pose problème, arrêtez-le temporairement :

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d licenceskayapps.duckdns.org
sudo systemctl start nginx
```

Puis configurez SSL manuellement dans Nginx ou relancez :

```bash
sudo certbot --nginx -d licenceskayapps.duckdns.org
```

---

## En attendant HTTPS (HTTP seulement)

Le site fonctionne déjà en HTTP si Nginx est OK :

```
http://licenceskayapps.duckdns.org
```

(Les apps Electron en production devront utiliser HTTPS — à activer dès que Certbot réussit.)

---

## Résumé des causes les plus probables

1. **DuckDNS** pointe vers `196.178.221.197` mais l'app tourne sur **un autre VPS** → mettre à jour DuckDNS
2. **Pare-feu cloud** du hébergeur bloque le port 80 → ouvrir 80/443 dans le panel
3. **Box internet** sans redirection de ports → configurer la box
4. **Nginx** arrêté ou mal configuré → `sudo systemctl restart nginx`
