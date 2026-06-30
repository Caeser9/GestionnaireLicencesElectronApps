import { License } from '../models';
import { LicenseStatus, SignedLicensePayload, JwtPayload } from '../types';
import { Request } from 'express';
declare function isLicenseExpired(license: {
    expiresAt?: Date;
    status: LicenseStatus;
}): boolean;
export declare class LicenseService {
    createLicense(data: {
        client: string;
        product: string;
        licenseType: string;
        maxUsers?: number;
        maxWorkstations?: number;
        authorizedModules?: string[];
        minVersion?: string;
        maxVersion?: string;
        expiresAt?: string | null;
        adminNotes?: string;
    }, creator: JwtPayload, req?: Request): Promise<Omit<import("mongoose").Document<unknown, {}, import("../models").ILicense, {}, {}> & import("../models").ILicense & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    updateLicense(id: string, data: Record<string, unknown>, updater: JwtPayload, req?: Request): Promise<any>;
    suspendLicense(id: string, updater: JwtPayload, req?: Request): Promise<any>;
    reactivateLicense(id: string, updater: JwtPayload, req?: Request): Promise<any>;
    transferLicense(id: string, newMachineId: string, updater: JwtPayload, req?: Request): Promise<any>;
    regenerateSignature(license: InstanceType<typeof License>): Promise<void>;
    buildSignedResponse(license: InstanceType<typeof License>): {
        licenseToken: string;
        licenseKey: string;
        payload: SignedLicensePayload;
        signature: string | undefined;
        checkIntervalDays: number;
        publicKey: undefined;
    };
    approveActivation(requestId: string, data: {
        clientId?: string;
        licenseTypeId: string;
        maxUsers?: number;
        maxWorkstations?: number;
        authorizedModules?: string[];
        expiresAt?: string | null;
        adminNotes?: string;
    }, approver: JwtPayload, req?: Request): Promise<{
        licenseToken: string;
        licenseKey: string;
        payload: SignedLicensePayload;
        signature: string | undefined;
        checkIntervalDays: number;
        publicKey: undefined;
    }>;
    rejectActivation(requestId: string, reason: string, rejecter: JwtPayload, req?: Request): Promise<any>;
    listLicenses(query: {
        page?: number;
        limit?: number;
        search?: string;
        status?: LicenseStatus;
        client?: string;
        product?: string;
    }): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("../models").ILicense, {}, {}> & import("../models").ILicense & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLicense(id: string): Promise<any>;
    getActivationLogs(licenseId: string, page?: number, limit?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("../models").IActivationLog, {}, {}> & import("../models").IActivationLog & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
export declare const licenseService: LicenseService;
export { isLicenseExpired };
//# sourceMappingURL=licenseService.d.ts.map