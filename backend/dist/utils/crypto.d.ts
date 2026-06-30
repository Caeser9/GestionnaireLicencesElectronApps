import { SignedLicensePayload } from '../types';
export declare function generateLicenseKey(): string;
export declare function generateLicenseToken(): string;
export declare function signLicensePayload(payload: SignedLicensePayload): string;
export declare function verifyLicenseSignature(payload: SignedLicensePayload, signature: string): boolean;
export declare function signApiResponse(data: Record<string, unknown>): string;
export declare function getPublicKey(): string | null;
export declare function hashMachineId(machineId: string): string;
//# sourceMappingURL=crypto.d.ts.map