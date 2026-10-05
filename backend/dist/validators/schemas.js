"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoIdSchema = exports.clientActivationStatusSchema = exports.clientHeartbeatSchema = exports.clientUpdateCheckSchema = exports.clientTransferSchema = exports.clientVerifySchema = exports.clientActivateSchema = exports.rejectActivationSchema = exports.paginationSchema = exports.updateAppVersionSchema = exports.createAppVersionSchema = exports.updateLicenseSchema = exports.createLicenseSchema = exports.approveActivationSchema = exports.updateLicenseTypeSchema = exports.createLicenseTypeSchema = exports.updateModuleSchema = exports.createModuleSchema = exports.updateProductSchema = exports.createProductSchema = exports.updateClientSchema = exports.createClientSchema = exports.updateUserSchema = exports.createUserSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(6, 'Mot de passe requis'),
});
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, 'Minimum 8 caractères'),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    role: zod_1.z.nativeEnum(types_1.UserRole),
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});
exports.updateUserSchema = exports.createUserSchema.partial().omit({ password: true }).extend({
    password: zod_1.z.string().min(8).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createClientSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1),
    contactName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    taxId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateClientSchema = exports.createClientSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createProductSchema = zod_1.z.object({
    slug: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    currentVersion: zod_1.z.string().default('1.0.0'),
});
exports.updateProductSchema = exports.createProductSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createModuleSchema = zod_1.z.object({
    slug: zod_1.z.string().min(2).regex(/^[a-z0-9_-]+$/),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    product: zod_1.z.string(),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.updateModuleSchema = exports.createModuleSchema.partial().omit({ product: true }).extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.createLicenseTypeSchema = zod_1.z.object({
    slug: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    defaultMaxUsers: zod_1.z.number().int().min(1).default(1),
    defaultMaxWorkstations: zod_1.z.number().int().min(1).default(1),
    defaultModules: zod_1.z.array(zod_1.z.string()).default([]),
    sortOrder: zod_1.z.number().int().optional(),
});
exports.updateLicenseTypeSchema = exports.createLicenseTypeSchema.partial().extend({
    isActive: zod_1.z.boolean().optional(),
});
const optionalPositiveInt = zod_1.z.preprocess((val) => {
    if (val === '' || val === null || val === undefined)
        return undefined;
    const n = Number(val);
    if (Number.isNaN(n) || n < 1)
        return undefined;
    return Math.floor(n);
}, zod_1.z.number().int().min(1).optional());
const mongoObjectId = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID MongoDB invalide');
exports.approveActivationSchema = zod_1.z.object({
    clientId: mongoObjectId.optional(),
    licenseTypeId: mongoObjectId,
    maxUsers: optionalPositiveInt,
    maxWorkstations: optionalPositiveInt,
    authorizedModules: zod_1.z.array(zod_1.z.string()).optional(),
    dashboardMode: zod_1.z.enum(['pro', 'simple']).optional(),
    expiresAt: zod_1.z.union([zod_1.z.string().datetime(), zod_1.z.null(), zod_1.z.literal('')]).optional().transform((v) => v || undefined),
    adminNotes: zod_1.z.string().optional(),
});
exports.createLicenseSchema = zod_1.z.object({
    client: zod_1.z.string(),
    product: zod_1.z.string(),
    licenseType: zod_1.z.string(),
    maxUsers: optionalPositiveInt,
    maxWorkstations: optionalPositiveInt,
    authorizedModules: zod_1.z.array(zod_1.z.string()).optional(),
    dashboardMode: zod_1.z.enum(['pro', 'simple']).optional(),
    minVersion: zod_1.z.string().optional(),
    maxVersion: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional().nullable(),
    adminNotes: zod_1.z.string().optional(),
});
exports.updateLicenseSchema = zod_1.z.object({
    licenseType: mongoObjectId.optional(),
    status: zod_1.z.nativeEnum(types_1.LicenseStatus).optional(),
    maxUsers: optionalPositiveInt,
    maxWorkstations: optionalPositiveInt,
    authorizedModules: zod_1.z.array(zod_1.z.string()).optional(),
    dashboardMode: zod_1.z.enum(['pro', 'simple']).optional(),
    minVersion: zod_1.z.string().optional(),
    maxVersion: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional().nullable(),
    adminNotes: zod_1.z.string().optional(),
});
exports.createAppVersionSchema = zod_1.z.object({
    product: zod_1.z.string(),
    version: zod_1.z.string().min(1),
    releaseNotes: zod_1.z.string().optional(),
    downloadUrl: zod_1.z.string().url().optional(),
    fileSize: zod_1.z.number().int().optional(),
    checksum: zod_1.z.string().optional(),
    isMandatory: zod_1.z.boolean().default(false),
    isRecommended: zod_1.z.boolean().default(false),
    minCompatibleVersion: zod_1.z.string().optional(),
});
exports.updateAppVersionSchema = exports.createAppVersionSchema.partial().omit({ product: true }).extend({
    isActive: zod_1.z.boolean().optional(),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.rejectActivationSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Raison requise'),
});
// Client API schemas
exports.clientActivateSchema = zod_1.z.object({
    productSlug: zod_1.z.string().min(1),
    licenseKey: zod_1.z.string().optional(),
    companyName: zod_1.z.string().min(1),
    contactEmail: zod_1.z.string().email(),
    contactPhone: zod_1.z.string().optional(),
    machineId: zod_1.z.string().min(8),
    appVersion: zod_1.z.string().min(1),
    osInfo: zod_1.z.string().optional(),
    hostname: zod_1.z.string().optional(),
});
exports.clientVerifySchema = zod_1.z.object({
    licenseToken: zod_1.z.string().min(1),
    machineId: zod_1.z.string().min(8),
    appVersion: zod_1.z.string().min(1),
});
exports.clientTransferSchema = zod_1.z.object({
    licenseToken: zod_1.z.string().min(1),
    oldMachineId: zod_1.z.string().min(8),
    newMachineId: zod_1.z.string().min(8),
    appVersion: zod_1.z.string().min(1),
});
exports.clientUpdateCheckSchema = zod_1.z.object({
    productSlug: zod_1.z.string().min(1),
    currentVersion: zod_1.z.string().min(1),
});
exports.clientHeartbeatSchema = zod_1.z.object({
    licenseToken: zod_1.z.string().min(1),
    machineId: zod_1.z.string().min(8),
    appVersion: zod_1.z.string().min(1),
});
exports.clientActivationStatusSchema = zod_1.z.object({
    requestId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de demande invalide'),
    machineId: zod_1.z.string().min(8),
    appVersion: zod_1.z.string().min(1).optional(),
});
exports.mongoIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
});
//# sourceMappingURL=schemas.js.map