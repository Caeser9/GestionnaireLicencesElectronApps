import mongoose, { Document, Schema, Types } from 'mongoose';
import { LicenseStatus } from '../types';

export interface ILicense extends Document {
  licenseKey: string;
  licenseToken: string;
  client: Types.ObjectId;
  product: Types.ObjectId;
  licenseType: Types.ObjectId;
  status: LicenseStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  maxUsers: number;
  maxWorkstations: number;
  authorizedModules: string[];
  minVersion?: string;
  maxVersion?: string;
  machineId?: string;
  machineIdHash?: string;
  signature?: string;
  adminNotes?: string;
  createdBy: Types.ObjectId;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const licenseSchema = new Schema<ILicense>(
  {
    licenseKey: { type: String, required: true, unique: true },
    licenseToken: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    licenseType: { type: Schema.Types.ObjectId, ref: 'LicenseType', required: true },
    status: {
      type: String,
      enum: Object.values(LicenseStatus),
      default: LicenseStatus.PENDING,
    },
    activatedAt: { type: Date },
    expiresAt: { type: Date },
    maxUsers: { type: Number, required: true, min: 1 },
    maxWorkstations: { type: Number, required: true, min: 1 },
    authorizedModules: [{ type: String }],
    minVersion: { type: String },
    maxVersion: { type: String },
    machineId: { type: String },
    machineIdHash: { type: String },
    signature: { type: String },
    adminNotes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastVerifiedAt: { type: Date },
  },
  { timestamps: true }
);

licenseSchema.index({ client: 1, product: 1 });
licenseSchema.index({ status: 1 });
licenseSchema.index({ machineIdHash: 1 });

export const License = mongoose.model<ILicense>('License', licenseSchema);
