# License Platform

Plateforme SaaS professionnelle de gestion des licences pour applications desktop Electron.

## Architecture

```
├── backend/          # API REST Node.js + Express + TypeScript + MongoDB
├── frontend/         # Dashboard React + TypeScript + Tailwind CSS
├── docs/             # Documentation technique
└── docker-compose.yml
```

## Prérequis

- Node.js 20+
- MongoDB 7+ (ou Docker)
- npm ou pnpm

## Démarrage rapide

### 1. MongoDB

```bash
docker compose up -d mongodb
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run generate-keys
npm run seed
npm run dev
```

L'API démarre sur `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Le dashboard est accessible sur `http://localhost:5173`

### Identifiants par défaut

- **Email:** admin@example.com
- **Mot de passe:** Admin123!ChangeMe

> Changez ces identifiants en production !

## Fonctionnalités

### Dashboard d'administration
- Authentification JWT avec rôles (Super Admin, Admin, Support)
- Gestion des clients, produits, modules, types de licence
- Création et gestion des licences (suspendre, réactiver, transférer)
- Validation des demandes d'activation
- Gestion des versions d'applications
- Tableau de bord statistiques
- Journal d'audit complet

### API Client (Electron)
- Activation de licence (première installation)
- Vérification périodique de validité
- Récupération des modules autorisés
- Transfert de licence vers un nouveau poste
- Vérification des mises à jour
- Signatures RSA des réponses pour fonctionnement offline

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API REST](docs/API.md)
- [Déploiement](docs/DEPLOYMENT.md)
- [Intégration Electron](docs/ELECTRON_INTEGRATION.md)

## Production

- **Dashboard :** https://licenceskayapps.duckdns.org
- **API :** https://licenceskayapps.duckdns.org/api
- **Serveur :** 196.178.221.197

Voir [docs/DUCKDNS.md](docs/DUCKDNS.md) pour le déploiement complet.

## Licence

Propriétaire — Usage interne uniquement.
