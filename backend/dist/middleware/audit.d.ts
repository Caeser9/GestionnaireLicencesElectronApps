import { Request, Response, NextFunction } from 'express';
import { AuditAction, AuditResource, JwtPayload } from '../types';
interface AuditOptions {
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    description: string;
    changes?: Record<string, unknown>;
}
export declare function createAuditLog(user: JwtPayload | undefined, options: AuditOptions, req?: Request): Promise<void>;
export declare function auditMiddleware(options: AuditOptions): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=audit.d.ts.map