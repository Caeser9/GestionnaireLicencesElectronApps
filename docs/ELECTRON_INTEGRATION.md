# Intégration Electron

Guide pour connecter vos applications desktop à la plateforme de licences.

## 1. Génération du Machine ID

```typescript
import { machineIdSync } from 'node-machine-id';
import crypto from 'crypto';
import os from 'os';

export function getMachineId(): string {
  try {
    const id = machineIdSync(true);
    const hostname = os.hostname();
    return crypto.createHash('sha256').update(`${id}-${hostname}`).digest('hex');
  } catch {
    // Fallback si node-machine-id échoue
    return crypto.createHash('sha256')
      .update(`${os.hostname()}-${os.platform()}-${os.cpus()[0]?.model}`)
      .digest('hex');
  }
}
```

Dépendance: `npm install node-machine-id`

## 2. Client API License

```typescript
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LICENSE_SERVER = 'https://licenceskayapps.duckdns.org/api/v1/client';
const LICENSE_FILE = path.join(app.getPath('userData'), 'license.json');

interface StoredLicense {
  licenseToken: string;
  payload: Record<string, unknown>;
  signature: string;
  lastVerified: string;
}

class LicenseClient {
  private publicKey: string | null = null;

  async initPublicKey() {
    const res = await axios.get(`${LICENSE_SERVER}/public-key`);
    this.publicKey = res.data.data.publicKey;
  }

  verifySignature(payload: Record<string, unknown>, signature: string): boolean {
    if (!this.publicKey) return false;
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(payload));
    return verify.verify(this.publicKey, signature, 'base64');
  }

  async activate(productSlug: string, licenseKey?: string) {
    const res = await axios.post(`${LICENSE_SERVER}/activate`, {
      productSlug,
      licenseKey,
      companyName: '...',  // depuis un formulaire utilisateur
      contactEmail: '...',
      machineId: getMachineId(),
      appVersion: app.getVersion(),
      osInfo: `${os.platform()} ${os.release()}`,
      hostname: os.hostname(),
    });

    const { data, signature } = res.data;

    if (data.status === 'activated' || data.status === 'already_active') {
      if (this.verifySignature(data.payload, data.signature || signature)) {
        this.saveLicense(data);
        return data;
      }
      throw new Error('Signature de licence invalide');
    }

    return data; // pending
  }

  async verify(): Promise<boolean> {
    const stored = this.loadLicense();
    if (!stored) return false;

    // Vérifier offline d'abord
    if (!this.verifySignature(stored.payload, stored.signature)) {
      return false;
    }

    const daysSinceVerify = (Date.now() - new Date(stored.lastVerified).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceVerify < 30) {
      return stored.payload.status === 'active';
    }

    // Vérification online
    try {
      const res = await axios.post(`${LICENSE_SERVER}/verify`, {
        licenseToken: stored.licenseToken,
        machineId: getMachineId(),
        appVersion: app.getVersion(),
      });

      const { data, signature } = res.data;
      if (data.valid && this.verifySignature(data.payload, data.signature || signature)) {
        this.saveLicense(data);
        return true;
      }
    } catch {
      // Offline: accepter si signature locale valide et pas expirée
      return stored.payload.status === 'active';
    }

    return false;
  }

  getAuthorizedModules(): string[] {
    const stored = this.loadLicense();
    return (stored?.payload?.authorizedModules as string[]) || [];
  }

  isModuleEnabled(moduleSlug: string): boolean {
    return this.getAuthorizedModules().includes(moduleSlug);
  }

  async checkUpdates(productSlug: string) {
    const res = await axios.get(`${LICENSE_SERVER}/updates/check`, {
      params: { productSlug, currentVersion: app.getVersion() },
      headers: { 'X-License-Token': this.loadLicense()?.licenseToken },
    });
    return res.data.data;
  }

  private saveLicense(data: Record<string, unknown>) {
    const stored: StoredLicense = {
      licenseToken: data.licenseToken as string,
      payload: data.payload as Record<string, unknown>,
      signature: data.signature as string,
      lastVerified: new Date().toISOString(),
    };
    fs.writeFileSync(LICENSE_FILE, JSON.stringify(stored, null, 2));
  }

  private loadLicense(): StoredLicense | null {
    try {
      return JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
}

export const licenseClient = new LicenseClient();
```

## 3. Utilisation dans l'application

```typescript
// Au démarrage de l'app (main process)
async function initLicense() {
  await licenseClient.initPublicKey();

  const isValid = await licenseClient.verify();
  if (!isValid) {
    // Afficher écran d'activation
    showActivationWindow();
    return;
  }

  // App licenciée — démarrer normalement
  createMainWindow();
}

// Masquer/afficher modules dans le renderer
function App() {
  const modules = licenseClient.getAuthorizedModules();

  return (
    <nav>
      <MenuItem to="/products" show={licenseClient.isModuleEnabled('products')} />
      <MenuItem to="/pos" show={licenseClient.isModuleEnabled('pos')} />
      <MenuItem to="/billing" show={licenseClient.isModuleEnabled('billing')} />
    </nav>
  );
}
```

## 4. Flux recommandé

1. **Premier lancement** → Formulaire activation → `activate()` → Attente validation admin
2. **Lancements suivants** → `verify()` → Si offline OK (< 30 jours) → Démarrage
3. **Mise à jour** → `checkUpdates()` → Notifier l'utilisateur
4. **Changement de PC** → `transfer()` ou demande admin via Dashboard

## 5. Bonnes pratiques

- Intégrer la clé publique RSA en dur dans l'app (fallback si API indisponible)
- Ne jamais stocker la clé privée côté client
- Vérifier la signature à chaque lecture du fichier licence local
- Implémenter un grace period offline (30 jours par défaut)
- Logger les erreurs de licence sans exposer de données sensibles
