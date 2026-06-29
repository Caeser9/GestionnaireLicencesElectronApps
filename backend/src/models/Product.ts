import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  slug: string;
  name: string;
  description?: string;
  currentVersion: string;
  isActive: boolean;
  modules: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    currentVersion: { type: String, required: true, default: '1.0.0' },
    isActive: { type: Boolean, default: true },
    modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
