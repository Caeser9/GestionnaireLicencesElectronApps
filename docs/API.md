# API REST — Documentation

Base URL: `https://licenceskayapps.duckdns.org` (production) ou `http://localhost:4000` (dev)

## Authentification Admin

Toutes les routes `/api/*` (sauf auth/login) requièrent un header:

```
Authorization: Bearer <jwt_token>
```

### POST /api/auth/login

```json
{
  "email": "admin@example.com",
  "password": "Admin123!ChangeMe"
}
```

Réponse:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": "...", "email": "...", "role": "super_admin" }
  }
}
```

---

## API Client (Applications Electron)

Base: `/api/v1/client`

Toutes les réponses incluent un champ `signature` (RSA-SHA256) pour vérification d'intégrité.

### POST /activate

Demande d'activation lors de la première installation.

```json
{
  "productSlug": "hardware-store",
  "licenseKey": "A1B2-C3D4-E5F6-7890",
  "companyName": "Ma Société SARL",
  "contactEmail": "contact@masociete.com",
  "contactPhone": "+261 34 00 000 00",
  "machineId": "HW-UNIQUE-MACHINE-ID-12345",
  "appVersion": "1.0.0",
  "osInfo": "Windows 11 Pro",
  "hostname": "PC-CAISSE-01"
}
```

Réponses possibles:
- `status: "pending"` — En attente de validation admin
- `status: "activated"` — Licence activée avec payload signé
- `status: "already_active"` — Déjà activée sur ce poste

### POST /verify

Vérification périodique de la licence.

```json
{
  "licenseToken": "abc123...",
  "machineId": "HW-UNIQUE-MACHINE-ID-12345",
  "appVersion": "1.0.0"
}
```

### GET /license/:token

Récupère les informations complètes d'une licence.

### POST /transfer

Transfert vers un nouveau poste.

```json
{
  "licenseToken": "abc123...",
  "oldMachineId": "HW-OLD-ID",
  "newMachineId": "HW-NEW-ID",
  "appVersion": "1.0.0"
}
```

### GET /modules/:token

Modules autorisés pour la licence.

### GET /updates/check?productSlug=hardware-store&currentVersion=1.0.0

Vérification des mises à jour. Header optionnel: `X-License-Token`.

### POST /heartbeat

Journalisation de connexion périodique.

```json
{
  "licenseToken": "abc123...",
  "machineId": "HW-UNIQUE-MACHINE-ID",
  "appVersion": "1.0.0"
}
```

### GET /public-key

Clé publique RSA pour vérifier les signatures côté client.

---

## Routes Admin principales

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/clients | Liste des clients |
| POST | /api/clients | Créer un client |
| GET | /api/licenses | Liste des licences |
| POST | /api/licenses | Créer une licence |
| POST | /api/licenses/:id/suspend | Suspendre |
| POST | /api/licenses/:id/reactivate | Réactiver |
| POST | /api/licenses/:id/transfer | Transférer |
| GET | /api/licenses/activations | Demandes d'activation |
| POST | /api/licenses/activations/:id/approve | Approuver |
| POST | /api/licenses/activations/:id/reject | Rejeter |
| GET | /api/catalog/products | Produits |
| GET | /api/catalog/modules | Modules |
| GET | /api/catalog/license-types | Types de licence |
| GET | /api/catalog/app-versions | Versions |
| GET | /api/stats/dashboard | Statistiques |
| GET | /api/stats/audit-logs | Journal d'audit |

---

## Format de licence signée

```json
{
  "licenseToken": "...",
  "licenseKey": "A1B2-C3D4-E5F6-7890",
  "payload": {
    "licenseId": "...",
    "clientName": "Ma Société",
    "productSlug": "hardware-store",
    "licenseType": "pro",
    "status": "active",
    "maxUsers": 15,
    "maxWorkstations": 5,
    "authorizedModules": ["products", "stock", "pos", "billing"],
    "machineId": "HW-UNIQUE-MACHINE-ID",
    "activatedAt": "2026-01-15T10:00:00.000Z",
    "expiresAt": null,
    "issuedAt": "2026-01-15T10:00:00.000Z"
  },
  "signature": "base64-rsa-signature...",
  "checkIntervalDays": 30
}
```

La signature est calculée sur le JSON du `payload` avec SHA256 + RSA private key.
