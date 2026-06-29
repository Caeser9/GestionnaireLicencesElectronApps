import mongoose, { Document, Schema, Types } from 'mongoose';
import { ActivationRequestStatus } from '../types';

export interface IActivationRequest extends Document {
  license?: Types.ObjectId;
  product: Types.ObjectId;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  machineId: string;
  machineIdHash: string;
  appVersion: string;
  osInfo?: string;
  hostname?: string;
  status: ActivationRequestStatus;
  rejectionReason?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activationRequestSchema = new Schema<IActivationRequest>(
  {
    license: { type: Schema.Types.ObjectId, ref: 'License' },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    companyName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    machineId: { type: String, required: true },
    machineIdHash: { type: String, required: true },
    appVersion: { type: String, required: true },
    osInfo: { type: String },
    hostname: { type: String },
    status: {
      type: String,
      enum: Object.values(ActivationRequestStatus),
      default: ActivationRequestStatus.PENDING,
    },
    rejectionReason: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

activationRequestSchema.index({ status: 1, createdAt: -1 });
activationRequestSchema.index({ machineIdHash: 1, product: 1 });

export const ActivationRequest = mongoose.model<IActivationRequest>(
  'ActivationRequest',
  activationRequestSchema
);
