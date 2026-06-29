import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const keysDir = path.join(__dirname, '../../keys');

if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

fs.writeFileSync(path.join(keysDir, 'license-private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'license-public.pem'), publicKey);

console.log('RSA key pair generated successfully in backend/keys/');
console.log('Keep license-private.pem SECRET and never commit it to version control.');
