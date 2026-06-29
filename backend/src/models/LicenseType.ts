import mongoose, { Document, Schema } from 'mongoose';

export interface ILicenseType extends Document {
  slug: string;
  name: string;
  description?: string;
  defaultMaxUsers: number;
  defaultMaxWorkstations: number;
  defaultModules: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const licenseTypeSchema = new Schema<ILicenseType>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    defaultMaxUsers: { type: Number, default: 1, min: 1 },
    defaultMaxWorkstations: { type: Number, default: 1, min: 1 },
    defaultModules: [{ type: String }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LicenseType = mongoose.model<ILicenseType>('LicenseType', licenseTypeSchema);
