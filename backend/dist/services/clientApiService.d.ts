import { Request } from 'express';
export declare class ClientApiService {
    requestActivation(data: {
        productSlug: string;
        licenseKey?: string;
        companyName: string;
        contactEmail: string;
        contactPhone?: string;
        machineId: string;
        appVersion: string;
        osInfo?: string;
        hostname?: string;
    }, req?: Request): Promise<{
        licenseToken: string;
        licenseKey: string;
        payload: import("../types").SignedLicensePayload;
        signature: string;
        checkIntervalDays: number;
        publicKey: undefined;
        status: string;
        requestId?: undefined;
        message?: undefined;
    } | {
        status: string;
        requestId: import("mongoose").Types.ObjectId;
        message: string;
    }>;
    verifyLicense(data: {
        licenseToken: string;
        machineId: string;
        appVersion: string;
    }, req?: Request): Promise<{
        licenseToken: string;
        licenseKey: string;
        payload: import("../types").SignedLicensePayload;
        signature: string;
        checkIntervalDays: number;
        publicKey: undefined;
        valid: boolean;
    }>;
    getActivationStatus(data: {
        requestId: string;
        machineId: string;
        appVersion?: string;
    }, req?: Request): Promise<{
        status: string;
        requestId: any;
        reason?: undefined;
    } | {
        status: string;
        requestId: any;
        reason: any;
    } | {
        licenseToken: string;
        licenseKey: string;
        payload: import("../types").SignedLicensePayload;
        signature: string;
        checkIntervalDays: number;
        publicKey: undefined;
        status: string;
        requestId: any;
        reason?: undefined;
    }>;
    getLicenseInfo(licenseToken: string): Promise<{
        licenseToken: string;
        licenseKey: string;
        payload: import("../types").SignedLicensePayload;
        signature: string;
        checkIntervalDays: number;
        publicKey: undefined;
    }>;
    transferLicense(data: {
        licenseToken: string;
        oldMachineId: string;
        newMachineId: string;
        appVersion: string;
    }, req?: Request): Promise<{
        licenseToken: string;
        licenseKey: string;
        payload: import("../types").SignedLicensePayload;
        signature: string;
        checkIntervalDays: number;
        publicKey: undefined;
        status: string;
    }>;
    getAuthorizedModules(licenseToken: string): Promise<{
        modules: any;
        productSlug: string;
    }>;
    checkUpdates(productSlug: string, currentVersion: string, licenseToken?: string): Promise<{
        updateAvailable: boolean;
        currentVersion: string;
        latestVersion: any;
        releaseNotes?: undefined;
        downloadUrl?: undefined;
        isMandatory?: undefined;
        isRecommended?: undefined;
        checksum?: undefined;
        fileSize?: undefined;
    } | {
        updateAvailable: boolean;
        currentVersion: string;
        latestVersion: string;
        releaseNotes: string | undefined;
        downloadUrl: string | undefined;
        isMandatory: boolean;
        isRecommended: boolean;
        checksum: string | undefined;
        fileSize: number | undefined;
    }>;
    heartbeat(data: {
        licenseToken: string;
        machineId: string;
        appVersion: string;
    }, req?: Request): Promise<{
        status: string;
        serverTime: string;
        checkIntervalDays: number;
    }>;
    private logActivation;
    private compareVersions;
}
export declare const clientApiService: ClientApiService;
//# sourceMappingURL=clientApiService.d.ts.map