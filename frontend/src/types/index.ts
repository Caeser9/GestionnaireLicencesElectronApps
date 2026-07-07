export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

export enum LicenseStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

export enum ActivationRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  fullName: string;
  lastLoginAt?: string;
}

export interface Client {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  currentVersion: string;
  isActive: boolean;
  createdAt: string;
}

export interface Module {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  product: string;
  isActive: boolean;
  sortOrder: number;
}

export interface LicenseType {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  defaultMaxUsers: number;
  defaultMaxWorkstations: number;
  defaultModules: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface License {
  _id: string;
  licenseKey: string;
  licenseToken: string;
  client: Client | string;
  product: Product | string;
  licenseType: LicenseType | string;
  status: LicenseStatus;
  activatedAt?: string;
  expiresAt?: string;
  maxUsers: number;
  maxWorkstations: number;
  authorizedModules: string[];
  dashboardMode?: 'pro' | 'simple';
  minVersion?: string;
  maxVersion?: string;
  machineId?: string;
  adminNotes?: string;
  lastVerifiedAt?: string;
  createdAt: string;
}

export interface ActivationRequest {
  _id: string;
  product: Product | string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  machineId: string;
  appVersion: string;
  osInfo?: string;
  hostname?: string;
  status: ActivationRequestStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface AppVersion {
  _id: string;
  product: string;
  version: string;
  releaseNotes?: string;
  downloadUrl?: string;
  isMandatory: boolean;
  isRecommended: boolean;
  isActive: boolean;
  publishedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  overview: {
    totalClients: number;
    activeClients: number;
    totalLicenses: number;
    activeLicenses: number;
    suspendedLicenses: number;
    expiredLicenses: number;
    pendingLicenses: number;
    pendingActivations: number;
  };
  recentActivations: unknown[];
  productsUsage: Array<{ productName: string; productSlug: string; count: number }>;
  recentConnections: unknown[];
  installedVersions: Array<{ productName: string; version: string; installations: number; lastSeen: string }>;
}

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  [LicenseStatus.PENDING]: 'En attente',
  [LicenseStatus.ACTIVE]: 'Active',
  [LicenseStatus.SUSPENDED]: 'Suspendue',
  [LicenseStatus.EXPIRED]: 'Expirée',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.SUPPORT]: 'Support Technique',
};
