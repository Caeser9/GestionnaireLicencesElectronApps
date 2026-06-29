import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models';
import { AuditAction, AuditResource, JwtPayload } from '../types';

interface AuditOptions {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description: string;
  changes?: Record<string, unknown>;
}

export async function createAuditLog(
  user: JwtPayload | undefined,
  options: AuditOptions,
  req?: Request
): Promise<void> {
  try {
    await AuditLog.create({
      user: user?.userId,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId,
      description: options.description,
      changes: options.changes,
      ipAddress: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers['user-agent'],
    });
  } catch {
    // Audit logging should not break the main flow
  }
}

export function auditMiddleware(options: AuditOptions) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await createAuditLog(req.user, {
      ...options,
      resourceId: options.resourceId || (typeof req.params.id === 'string' ? req.params.id : undefined),
    }, req);
    next();
  };
}
