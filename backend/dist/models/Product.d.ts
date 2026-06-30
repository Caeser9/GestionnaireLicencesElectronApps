import mongoose, { Document, Types } from 'mongoose';
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
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map