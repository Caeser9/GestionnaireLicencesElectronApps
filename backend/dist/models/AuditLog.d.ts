import mongoose, { Document, Types } from 'mongoose';
import { AuditAction, AuditResource } from '../types';
export interface IAuditLog extends Document {
    user?: Types.ObjectId;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    description: string;
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map