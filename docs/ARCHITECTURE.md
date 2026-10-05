# Architecture de la plateforme

## Vue d'ensemble

La plateforme suit une architecture **monorepo** avec séparation claire entre le frontend (Dashboard), le backend (API REST) et la base de données MongoDB.

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│  Dashboard      │◄──────────────►│  API REST       │
│  React + TS     │   /api/*       │  Express + TS   │
└─────────────────┘                └────────┬────────┘
                                            │
┌─────────────────┐     HTTPS               │
│  Apps Electron  │◄────────────────────────┤
│  (Desktop)      │   /api/v1/client/*      │
└─────────────────┘                         │
                                            ▼
                                   ┌─────────────────┐
                                   │  MongoDB        │
                                   └─────────────────┘
```

## Backend — Structure

```
backend/src/
├── config/           # Configuration (env, database)
├── models/           # Schémas Mongoose
├── services/         # Logique métier
├── controllers/      # Handlers HTTP
├── routes/           # Définition des routes
├── middleware/       # Auth, audit, erreurs, signature
├── validators/       # Schémas Zod
├── utils/            # Crypto, logger, helpers
└── scripts/          # Seed, génération de clés
```

## Modèles de données

| Modèle | Description |
|--------|-------------|
| `User` | Administrateurs (Super Admin, Admin, Support) |
| `Client` | Sociétés clientes |
| `Product` | Logiciels (hardware-store, restaurant-pos, etc.) |
| `Module` | Fonctionnalités par produit (stock, pos, billing...) |
| `LicenseType` | Types configurables (Basic, Standard, Pro, Enterprise) |
| `License` | Licences avec clé, token, statut, modules, Machine ID |
| `ActivationRequest` | Demandes d'activation en attente |
| `ActivationLog` | Journal des connexions/vérifications clients |
| `AppVersion` | Versions disponibles par produit |
| `AuditLog` | Journal d'audit administratif |

## Sécurité

- **JWT** pour l'authentification admin (Bearer token)
- **RSA 4096 bits** pour la signature des licences et réponses API client
- **bcrypt** (12 rounds) pour les mots de passe
- **Helmet** pour les headers HTTP sécurisés
- **Rate limiting** sur les endpoints client
- **Validation Zod** sur toutes les entrées
- **HTTPS obligatoire** en production

## Flux d'activation

```
1. App Electron démarre → génère Machine ID
2. POST /api/v1/client/activate (companyName, machineId, productSlug, appVersion)
3. Serveur crée ActivationRequest (status: pending)
4. Admin approuve depuis le Dashboard
5. Serveur crée License + signature RSA
6. App reçoit licence signée → stockage local
7. Vérification périodique (30 jours) via POST /api/v1/client/verify
```

## Rôles et permissions

| Action | Support | Admin | Super Admin |
|--------|---------|-------|-------------|
| Consulter clients/licences | ✓ | ✓ | ✓ |
| Créer/modifier clients | | ✓ | ✓ |
| Gérer licences | | ✓ | ✓ |
| Approuver activations | | ✓ | ✓ |
| Gérer produits/modules | | ✓ | ✓ |
| Journal d'audit | | ✓ | ✓ |
| Gérer utilisateurs | | | ✓ |

Le rôle **Modérateur client** est associé à une application (`User.productId`). Les clients qu'il crée sont rattachés à cette application (`Client.platformProduct`) ; ses listes et opérations sur les licences sont limitées à cette application. Un Super Admin crée ce compte depuis la page Utilisateurs.

## Extensibilité multi-produits

Chaque produit possède un `slug` unique. Les licences, modules et versions sont liés à un produit spécifique. Ajouter un nouveau logiciel commercial ne nécessite aucune modification de l'architecture — il suffit de créer un nouveau produit dans le Dashboard.
