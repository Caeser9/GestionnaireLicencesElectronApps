import { z } from 'zod';
import { UserRole, LicenseStatus } from '../types';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 caractères'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

export const createClientSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createProductSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
  name: z.string().min(1),
  description: z.string().optional(),
  currentVersion: z.string().default('1.0.0'),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createModuleSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  product: z.string(),
  sortOrder: z.number().int().optional(),
});

export const updateModuleSchema = createModuleSchema.partial().omit({ product: true }).extend({
  isActive: z.boolean().optional(),
});

export const createLicenseTypeSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  defaultMaxUsers: z.number().int().min(1).default(1),
  defaultMaxWorkstations: z.number().int().min(1).default(1),
  defaultModules: z.array(z.string()).default([]),
  sortOrder: z.number().int().optional(),
});

export const updateLicenseTypeSchema = createLicenseTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const optionalPositiveInt = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const n = Number(val);
    if (Number.isNaN(n) || n < 1) return undefined;
    return Math.floor(n);
  },
  z.number().int().min(1).optional()
);

const mongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID MongoDB invalide');

export const approveActivationSchema = z.object({
  clientId: mongoObjectId.optional(),
  licenseTypeId: mongoObjectId,
  maxUsers: optionalPositiveInt,
  maxWorkstations: optionalPositiveInt,
  authorizedModules: z.array(z.string()).optional(),
  expiresAt: z.union([z.string().datetime(), z.null(), z.literal('')]).optional().transform((v) => v || undefined),
  adminNotes: z.string().optional(),
});

export const createLicenseSchema = z.object({
  client: z.string(),
  product: z.string(),
  licenseType: z.string(),
  maxUsers: optionalPositiveInt,
  maxWorkstations: optionalPositiveInt,
  authorizedModules: z.array(z.string()).optional(),
  minVersion: z.string().optional(),
  maxVersion: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  adminNotes: z.string().optional(),
});

export const updateLicenseSchema = z.object({
  status: z.nativeEnum(LicenseStatus).optional(),
  maxUsers: optionalPositiveInt,
  maxWorkstations: optionalPositiveInt,
  authorizedModules: z.array(z.string()).optional(),
  minVersion: z.string().optional(),
  maxVersion: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  adminNotes: z.string().optional(),
});

export const createAppVersionSchema = z.object({
  product: z.string(),
  version: z.string().min(1),
  releaseNotes: z.string().optional(),
  downloadUrl: z.string().url().optional(),
  fileSize: z.number().int().optional(),
  checksum: z.string().optional(),
  isMandatory: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  minCompatibleVersion: z.string().optional(),
});

export const updateAppVersionSchema = createAppVersionSchema.partial().omit({ product: true }).extend({
  isActive: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const rejectActivationSchema = z.object({
  reason: z.string().min(1, 'Raison requise'),
});

// Client API schemas
export const clientActivateSchema = z.object({
  productSlug: z.string().min(1),
  licenseKey: z.string().optional(),
  companyName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  machineId: z.string().min(8),
  appVersion: z.string().min(1),
  osInfo: z.string().optional(),
  hostname: z.string().optional(),
});

export const clientVerifySchema = z.object({
  licenseToken: z.string().min(1),
  machineId: z.string().min(8),
  appVersion: z.string().min(1),
});

export const clientTransferSchema = z.object({
  licenseToken: z.string().min(1),
  oldMachineId: z.string().min(8),
  newMachineId: z.string().min(8),
  appVersion: z.string().min(1),
});

export const clientUpdateCheckSchema = z.object({
  productSlug: z.string().min(1),
  currentVersion: z.string().min(1),
});

export const clientHeartbeatSchema = z.object({
  licenseToken: z.string().min(1),
  machineId: z.string().min(8),
  appVersion: z.string().min(1),
});

export const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
});
