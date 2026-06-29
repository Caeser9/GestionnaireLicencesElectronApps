import mongoose, { Document, Schema, Types } from 'mongoose';
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

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    resource: { type: String, enum: Object.values(AuditResource), required: true },
    resourceId: { type: String },
    description: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
