import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IModule extends Document {
  slug: string;
  name: string;
  description?: string;
  product: Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    slug: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

moduleSchema.index({ product: 1, slug: 1 }, { unique: true });

export const Module = mongoose.model<IModule>('Module', moduleSchema);
