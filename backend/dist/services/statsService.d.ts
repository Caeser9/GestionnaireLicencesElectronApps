export declare class StatsService {
    getDashboardStats(): Promise<{
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
        recentActivations: (import("mongoose").Document<unknown, {}, import("../models").IActivationLog, {}, {}> & import("../models").IActivationLog & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        productsUsage: any[];
        recentConnections: (import("mongoose").Document<unknown, {}, import("../models").IActivationLog, {}, {}> & import("../models").IActivationLog & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        installedVersions: any[];
    }>;
    getAuditLogs(page?: number, limit?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("../models").IAuditLog, {}, {}> & import("../models").IAuditLog & Required<{
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
export declare const statsService: StatsService;
//# sourceMappingURL=statsService.d.ts.map