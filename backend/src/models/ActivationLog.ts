import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivationLog extends Document {
  license: Types.ObjectId;
  client: Types.ObjectId;
  product: Types.ObjectId;
  machineId: string;
  appVersion: string;
  action: 'activate' | 'verify' | 'transfer' | 'heartbeat' | 'update_check';
  ipAddress?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activationLogSchema = new Schema<IActivationLog>(
  {
    license: { type: Schema.Types.ObjectId, ref: 'License', required: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    machineId: { type: String, required: true },
    appVersion: { type: String, required: true },
    action: {
      type: String,
      enum: ['activate', 'verify', 'transfer', 'heartbeat', 'update_check'],
      required: true,
    },
    ipAddress: { type: String },
    success: { type: Boolean, default: true },
    message: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activationLogSchema.index({ license: 1, createdAt: -1 });
activationLogSchema.index({ createdAt: -1 });

export const ActivationLog = mongoose.model<IActivationLog>('ActivationLog', activationLogSchema);
