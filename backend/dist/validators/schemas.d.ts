import { z } from 'zod';
import { UserRole, LicenseStatus } from '../types';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}>;
export declare const updateUserSchema: z.ZodObject<Omit<{
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
}, "password"> & {
    password: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    password?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | undefined;
    password?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
}>;
export declare const createClientSchema: z.ZodObject<{
    companyName: z.ZodString;
    contactName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    companyName: string;
    contactName: string;
    phone?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    taxId?: string | undefined;
    notes?: string | undefined;
}, {
    email: string;
    companyName: string;
    contactName: string;
    phone?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    taxId?: string | undefined;
    notes?: string | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    isActive?: boolean | undefined;
    companyName?: string | undefined;
    contactName?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    taxId?: string | undefined;
    notes?: string | undefined;
}, {
    email?: string | undefined;
    isActive?: boolean | undefined;
    companyName?: string | undefined;
    contactName?: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    taxId?: string | undefined;
    notes?: string | undefined;
}>;
export declare const createProductSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    currentVersion: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    currentVersion: string;
    description?: string | undefined;
}, {
    slug: string;
    name: string;
    description?: string | undefined;
    currentVersion?: string | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    currentVersion: z.ZodOptional<z.ZodDefault<z.ZodString>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    currentVersion?: string | undefined;
}, {
    isActive?: boolean | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    currentVersion?: string | undefined;
}>;
export declare const createModuleSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    product: z.ZodString;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    product: string;
    slug: string;
    name: string;
    description?: string | undefined;
    sortOrder?: number | undefined;
}, {
    product: string;
    slug: string;
    name: string;
    description?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const updateModuleSchema: z.ZodObject<Omit<{
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    product: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "product"> & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
}, {
    isActive?: boolean | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
}>;
export declare const createLicenseTypeSchema: z.ZodObject<{
    slug: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    defaultMaxUsers: z.ZodDefault<z.ZodNumber>;
    defaultMaxWorkstations: z.ZodDefault<z.ZodNumber>;
    defaultModules: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    slug: string;
    name: string;
    defaultMaxUsers: number;
    defaultMaxWorkstations: number;
    defaultModules: string[];
    description?: string | undefined;
    sortOrder?: number | undefined;
}, {
    slug: string;
    name: string;
    description?: string | undefined;
    sortOrder?: number | undefined;
    defaultMaxUsers?: number | undefined;
    defaultMaxWorkstations?: number | undefined;
    defaultModules?: string[] | undefined;
}>;
export declare const updateLicenseTypeSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    defaultMaxUsers: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    defaultMaxWorkstations: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    defaultModules: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    sortOrder: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
    defaultMaxUsers?: number | undefined;
    defaultMaxWorkstations?: number | undefined;
    defaultModules?: string[] | undefined;
}, {
    isActive?: boolean | undefined;
    slug?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    sortOrder?: number | undefined;
    defaultMaxUsers?: number | undefined;
    defaultMaxWorkstations?: number | undefined;
    defaultModules?: string[] | undefined;
}>;
export declare const approveActivationSchema: z.ZodObject<{
    clientId: z.ZodOptional<z.ZodString>;
    licenseTypeId: z.ZodString;
    maxUsers: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    maxWorkstations: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    authorizedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expiresAt: z.ZodEffects<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNull, z.ZodLiteral<"">]>>, string | undefined, string | null | undefined>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    licenseTypeId: string;
    clientId?: string | undefined;
    maxUsers?: number | undefined;
    maxWorkstations?: number | undefined;
    authorizedModules?: string[] | undefined;
    expiresAt?: string | undefined;
    adminNotes?: string | undefined;
}, {
    licenseTypeId: string;
    clientId?: string | undefined;
    maxUsers?: unknown;
    maxWorkstations?: unknown;
    authorizedModules?: string[] | undefined;
    expiresAt?: string | null | undefined;
    adminNotes?: string | undefined;
}>;
export declare const createLicenseSchema: z.ZodObject<{
    client: z.ZodString;
    product: z.ZodString;
    licenseType: z.ZodString;
    maxUsers: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    maxWorkstations: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    authorizedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minVersion: z.ZodOptional<z.ZodString>;
    maxVersion: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client: string;
    product: string;
    licenseType: string;
    maxUsers?: number | undefined;
    maxWorkstations?: number | undefined;
    authorizedModules?: string[] | undefined;
    expiresAt?: string | null | undefined;
    adminNotes?: string | undefined;
    minVersion?: string | undefined;
    maxVersion?: string | undefined;
}, {
    client: string;
    product: string;
    licenseType: string;
    maxUsers?: unknown;
    maxWorkstations?: unknown;
    authorizedModules?: string[] | undefined;
    expiresAt?: string | null | undefined;
    adminNotes?: string | undefined;
    minVersion?: string | undefined;
    maxVersion?: string | undefined;
}>;
export declare const updateLicenseSchema: z.ZodObject<{
    licenseType: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof LicenseStatus>>;
    maxUsers: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    maxWorkstations: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    authorizedModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minVersion: z.ZodOptional<z.ZodString>;
    maxVersion: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: LicenseStatus | undefined;
    maxUsers?: number | undefined;
    maxWorkstations?: number | undefined;
    authorizedModules?: string[] | undefined;
    expiresAt?: string | null | undefined;
    adminNotes?: string | undefined;
    licenseType?: string | undefined;
    minVersion?: string | undefined;
    maxVersion?: string | undefined;
}, {
    status?: LicenseStatus | undefined;
    maxUsers?: unknown;
    maxWorkstations?: unknown;
    authorizedModules?: string[] | undefined;
    expiresAt?: string | null | undefined;
    adminNotes?: string | undefined;
    licenseType?: string | undefined;
    minVersion?: string | undefined;
    maxVersion?: string | undefined;
}>;
export declare const createAppVersionSchema: z.ZodObject<{
    product: z.ZodString;
    version: z.ZodString;
    releaseNotes: z.ZodOptional<z.ZodString>;
    downloadUrl: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    checksum: z.ZodOptional<z.ZodString>;
    isMandatory: z.ZodDefault<z.ZodBoolean>;
    isRecommended: z.ZodDefault<z.ZodBoolean>;
    minCompatibleVersion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    product: string;
    version: string;
    isMandatory: boolean;
    isRecommended: boolean;
    releaseNotes?: string | undefined;
    downloadUrl?: string | undefined;
    fileSize?: number | undefined;
    checksum?: string | undefined;
    minCompatibleVersion?: string | undefined;
}, {
    product: string;
    version: string;
    releaseNotes?: string | undefined;
    downloadUrl?: string | undefined;
    fileSize?: number | undefined;
    checksum?: string | undefined;
    isMandatory?: boolean | undefined;
    isRecommended?: boolean | undefined;
    minCompatibleVersion?: string | undefined;
}>;
export declare const updateAppVersionSchema: z.ZodObject<Omit<{
    product: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    releaseNotes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    downloadUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fileSize: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    checksum: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isMandatory: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isRecommended: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    minCompatibleVersion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "product"> & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    version?: string | undefined;
    releaseNotes?: string | undefined;
    downloadUrl?: string | undefined;
    fileSize?: number | undefined;
    checksum?: string | undefined;
    isMandatory?: boolean | undefined;
    isRecommended?: boolean | undefined;
    minCompatibleVersion?: string | undefined;
}, {
    isActive?: boolean | undefined;
    version?: string | undefined;
    releaseNotes?: string | undefined;
    downloadUrl?: string | undefined;
    fileSize?: number | undefined;
    checksum?: string | undefined;
    isMandatory?: boolean | undefined;
    isRecommended?: boolean | undefined;
    minCompatibleVersion?: string | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    search?: string | undefined;
    sortBy?: string | undefined;
}, {
    search?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
}>;
export declare const rejectActivationSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const clientActivateSchema: z.ZodObject<{
    productSlug: z.ZodString;
    licenseKey: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    contactEmail: z.ZodString;
    contactPhone: z.ZodOptional<z.ZodString>;
    machineId: z.ZodString;
    appVersion: z.ZodString;
    osInfo: z.ZodOptional<z.ZodString>;
    hostname: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    productSlug: string;
    contactEmail: string;
    machineId: string;
    appVersion: string;
    licenseKey?: string | undefined;
    contactPhone?: string | undefined;
    osInfo?: string | undefined;
    hostname?: string | undefined;
}, {
    companyName: string;
    productSlug: string;
    contactEmail: string;
    machineId: string;
    appVersion: string;
    licenseKey?: string | undefined;
    contactPhone?: string | undefined;
    osInfo?: string | undefined;
    hostname?: string | undefined;
}>;
export declare const clientVerifySchema: z.ZodObject<{
    licenseToken: z.ZodString;
    machineId: z.ZodString;
    appVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    machineId: string;
    appVersion: string;
    licenseToken: string;
}, {
    machineId: string;
    appVersion: string;
    licenseToken: string;
}>;
export declare const clientTransferSchema: z.ZodObject<{
    licenseToken: z.ZodString;
    oldMachineId: z.ZodString;
    newMachineId: z.ZodString;
    appVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    appVersion: string;
    licenseToken: string;
    oldMachineId: string;
    newMachineId: string;
}, {
    appVersion: string;
    licenseToken: string;
    oldMachineId: string;
    newMachineId: string;
}>;
export declare const clientUpdateCheckSchema: z.ZodObject<{
    productSlug: z.ZodString;
    currentVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentVersion: string;
    productSlug: string;
}, {
    currentVersion: string;
    productSlug: string;
}>;
export declare const clientHeartbeatSchema: z.ZodObject<{
    licenseToken: z.ZodString;
    machineId: z.ZodString;
    appVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    machineId: string;
    appVersion: string;
    licenseToken: string;
}, {
    machineId: string;
    appVersion: string;
    licenseToken: string;
}>;
export declare const clientActivationStatusSchema: z.ZodObject<{
    requestId: z.ZodString;
    machineId: z.ZodString;
    appVersion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    machineId: string;
    requestId: string;
    appVersion?: string | undefined;
}, {
    machineId: string;
    requestId: string;
    appVersion?: string | undefined;
}>;
export declare const mongoIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
//# sourceMappingURL=schemas.d.ts.map