import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClient extends Document {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  platformProduct?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    taxId: { type: String, trim: true },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    platformProduct: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
  },
  { timestamps: true }
);

clientSchema.index({ companyName: 'text', email: 'text', contactName: 'text' });
clientSchema.index({ email: 1 });

export const Client = mongoose.model<IClient>('Client', clientSchema);
