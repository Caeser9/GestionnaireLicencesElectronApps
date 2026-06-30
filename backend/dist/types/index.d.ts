export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    SUPPORT = "support"
}
export declare enum LicenseStatus {
    PENDING = "pending",
    ACTIVE = "active",
    SUSPENDED = "suspended",
    EXPIRED = "expired"
}
export declare enum ActivationRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum AuditAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout",
    ACTIVATE = "activate",
    SUSPEND = "suspend",
    REACTIVATE = "reactivate",
    TRANSFER = "transfer",
    REJECT = "reject",
    APPROVE = "approve"
}
export declare enum AuditResource {
    USER = "user",
    CLIENT = "client",
    PRODUCT = "product",
    MODULE = "module",
    LICENSE = "license",
    LICENSE_TYPE = "license_type",
    ACTIVATION = "activation",
    APP_VERSION = "app_version",
    AUTH = "auth"
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}
export interface SignedLicensePayload {
    licenseId: string;
    licenseKey: string;
    clientId: string;
    clientName: string;
    productId: string;
    productSlug: string;
    licenseType: string;
    status: LicenseStatus;
    maxUsers: number;
    maxWorkstations: number;
    authorizedModules: string[];
    minVersion?: string;
    maxVersion?: string;
    machineId: string;
    activatedAt: string;
    expiresAt?: string;
    adminNotes?: string;
    issuedAt: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=index.d.ts.map