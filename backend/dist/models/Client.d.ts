import mongoose, { Document, Types } from 'mongoose';
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
export declare const Client: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, {}> & IClient & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Client.d.ts.map