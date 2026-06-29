import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAppVersion extends Document {
  product: Types.ObjectId;
  version: string;
  releaseNotes?: string;
  downloadUrl?: string;
  fileSize?: number;
  checksum?: string;
  isMandatory: boolean;
  isRecommended: boolean;
  isActive: boolean;
  minCompatibleVersion?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appVersionSchema = new Schema<IAppVersion>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    version: { type: String, required: true },
    releaseNotes: { type: String },
    downloadUrl: { type: String },
    fileSize: { type: Number },
    checksum: { type: String },
    isMandatory: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    minCompatibleVersion: { type: String },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

appVersionSchema.index({ product: 1, version: 1 }, { unique: true });

export const AppVersion = mongoose.model<IAppVersion>('AppVersion', appVersionSchema);
