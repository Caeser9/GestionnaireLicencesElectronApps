import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config';
import logger from './logger';
import { SignedLicensePayload } from '../types';

let privateKey: string | null = null;
let publicKey: string | null = null;

function loadKeys(): void {
  try {
    if (fs.existsSync(config.license.privateKeyPath)) {
      privateKey = fs.readFileSync(config.license.privateKeyPath, 'utf8');
    }
    if (fs.existsSync(config.license.publicKeyPath)) {
      publicKey = fs.readFileSync(config.license.publicKeyPath, 'utf8');
    }
  } catch (error) {
    logger.warn('License signing keys not loaded', { error });
  }
}

loadKeys();

export function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  return segments.join('-');
}

export function generateLicenseToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function signLicensePayload(payload: SignedLicensePayload): string {
  if (!privateKey) {
    throw new Error('License private key not configured. Run: npm run generate-keys');
  }

  const data = JSON.stringify(payload);
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'base64');
}

export function verifyLicenseSignature(
  payload: SignedLicensePayload,
  signature: string
): boolean {
  if (!publicKey) {
    throw new Error('License public key not configured');
  }

  const data = JSON.stringify(payload);
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'base64');
}

export function signApiResponse(data: Record<string, unknown>): string {
  if (!privateKey) {
    return '';
  }
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(data));
  sign.end();
  return sign.sign(privateKey, 'base64');
}

export function getPublicKey(): string | null {
  return publicKey;
}

export function hashMachineId(machineId: string): string {
  return crypto.createHash('sha256').update(machineId).digest('hex');
}
