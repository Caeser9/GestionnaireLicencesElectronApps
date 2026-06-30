"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.auditMiddleware = auditMiddleware;
const models_1 = require("../models");
async function createAuditLog(user, options, req) {
    try {
        await models_1.AuditLog.create({
            user: user?.userId,
            action: options.action,
            resource: options.resource,
            resourceId: options.resourceId,
            description: options.description,
            changes: options.changes,
            ipAddress: req?.ip || req?.socket?.remoteAddress,
            userAgent: req?.headers['user-agent'],
        });
    }
    catch {
        // Audit logging should not break the main flow
    }
}
function auditMiddleware(options) {
    return async (req, _res, next) => {
        await createAuditLog(req.user, {
            ...options,
            resourceId: options.resourceId || (typeof req.params.id === 'string' ? req.params.id : undefined),
        }, req);
        next();
    };
}
//# sourceMappingURL=audit.js.map